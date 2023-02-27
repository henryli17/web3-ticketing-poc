require('dotenv').config()
console.clear()

const ganache = require("ganache");
const restify = require("restify");
const cookies = require('restify-cookies');
const crypto = require('crypto');
const errs = require('restify-errors');
const db = require("./helpers/db");
const contract = require("./helpers/contract");
const utils = require("./helpers/utils");
const validators = require("./helpers/validators");
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const server = restify.createServer();
const sessions = new Map();
const API_BASE = "/api";
const API_ADMIN_PASSWORD = "password";
const API_PORT = 3001;
const API_HOST = "http://localhost:" + API_PORT;
const IMG_PATH = "src/img";

ganache
	.server({
		database: { dbPath: path.resolve('./ganache') },
		wallet: { seed: "seed" }
	})
	.listen(8545, err => {
		if (err) {
			throw err;
		}
	})
;

server.listen(API_PORT);
server.use(restify.plugins.queryParser());
server.use(restify.plugins.bodyParser());
server.use(cookies.parse);
server.use((req, res, next) => {
	const sid = req.cookies.sid || crypto.randomBytes(32).toString('base64');

	if (!req.cookies.sid) {
		res.setCookie("sid", sid);
	}
	
	if (!sessions.has(sid)) {
		sessions.set(sid, {});
	}
	
	res.header("Access-Control-Allow-Origin", "http://localhost:3000");
	res.header("Access-Control-Allow-Headers", "X-Requested-With");
	res.header("Access-Control-Allow-Credentials", "true");
	req.session = sessions.get(sid);

	return next();
});

server.opts("*", (req, res, next) => {
    res.header("Access-Control-Allow-Methods", req.header("Access-Control-Request-Method"));
    res.header("Access-Control-Allow-Headers", req.header("Access-Control-Request-Headers"));
    res.send(200);
	return next();
});

const response = async (req, res, fn) => {
	try {
		const data = await fn(req);
		res.send(
			200,
			data ? JSON.parse(JSON.stringify(data)) : undefined
		);
	} catch (e) {
		console.error(e);
		res.send(
			(e instanceof errs.HttpError) ? e : new errs.InternalServerError(e.reason)
		);
	}
};

server.get("/img/*", restify.plugins.serveStatic({ directory: __dirname }));

server.get(API_BASE + "/events", async (req, res) => {
	await response(req, res, async (req) => {
		const events = await db.getEvents({
			genres: (req.query?.genres !== "") ? req.query?.genres?.split(",") : null,
			locations: (req.query?.locations !== "") ? req.query?.locations?.split(",") : null,
			maxPrice: req.query?.maxPrice,
			search: req.query?.search
		});

		const limit = 10;
		const offset = Math.max(parseInt(req.query?.offset) || 0, 0);
		const slice = events.slice(offset, offset + limit);

		return {
			events: slice,
			limit: limit,
			nextOffset: (offset + limit >= events.length) ? false : offset + limit
		};
	});
});

server.get(API_BASE + "/events/:id", async (req, res) => {
	await response(req, res, async (req) => {
		return (
			await utils.getEvent(req.params.id)
		);
	});
});

server.get(API_BASE + "/events/:id/metadata", async (req, res) => {
	await response(req, res, async (req) => {
		const event = await utils.getEvent(req.params.id);

		return {
			title: event.name,
			description: event.description,
			image: event.imageUrl,
			properties: {
				...utils.omit(event, ["description", "name", "imageUrl"])
			}
		}
	});
});

server.get(API_BASE + "/signature", async (req, res) => {
	await response(req, res, async (req) => {
		return { message: contract.SIGNATURE_MESSAGE };
	});
});

server.post(API_BASE + "/events/:id/token", async (req, res) => {
	await response(req, res, async (req) => {
		if (!req.session.admin) {
			throw new errs.UnauthorizedError();
		}

		const validator = validators.eventToken(req.body);

		if (validator.errors.length) {
			throw new errs.BadRequestError(validator.errors.shift().stack);
		}

		// Check the signature is a valid hex string of 132 characters (0x prefixed)
		if (!(/^0x[A-Fa-f0-9]{130}$/).test(req.body.signature)) {
			throw new errs.BadRequestError();
		}

		const address = await contract.signatureToAddress(req.body.signature);

		await contract
			.instance
			.methods
			.markTokenAsUsed(
				address,
				parseInt(req.params.id),
				parseInt(req.body.quantity)
			)
			.send({ from: contract.OWNER, gas: contract.GAS })
		;
	});
});

server.get(API_BASE + "/genres", async (req, res) => {
	await response(req, res, async (req) => {
		return db.getGenres();
	});
});

server.get(API_BASE + "/locations", async (req, res) => {
	await response(req, res, async (req) => {
		return db.getLocations();
	});
});

server.get(API_BASE + "/purchases/:address", async (req, res) => {
	await response(req, res, async (req) => {
		return utils.getPurchases(req.params.address);
	});
});

server.get(API_BASE + "/contract", async (req, res) => {
	await response(req, res, async (req) => {
		return {
			ABI: contract.ABI,
			address: contract.ADDRESS
		};
	});
});

server.post(API_BASE + "/login", async (req, res) => {
	await response(req, res, async (req) => {
		if (req.session.admin || req.body.password === API_ADMIN_PASSWORD) {
			req.session.admin = true;
		} else {
			throw new errs.UnauthorizedError()
		}
	});
});

server.post(API_BASE + "/events", async (req, res) => {
	await response(req, res, async (req) => {
		if (!req.session.admin) {
			throw new errs.UnauthorizedError();
		}

		// Convert FormData strings to numbers
		for (const key of ["price", "quantity", "time"]) {
			req.body[key] = Number(req.body[key]);
		}

		// Convert FormData string to array, filtering empty genres
		req.body.genres = req.body?.genres.split(/\r?\n/).filter(g => !!g);

		const validator = validators.createEvent(req.body);

		if (validator.errors.length) {
			throw new errs.BadRequestError(validator.errors.shift().stack);
		}

		if (!req.files.image) {
			throw new errs.BadRequestError("Image required.");
		}

		const filePath = `${IMG_PATH}/events/${uuidv4()}_${req.files.image.name}`;

		await utils.moveFile(req.files.image.path, filePath);

		const event = {
			id: await db.createEvent(
				{
					...utils.omit(req.body, ["genres", "quantity"]),
					time: new Date(req.body.time * 1000),
					imageUrl: `${API_HOST}/${filePath.replace("src/", "")}`
				}
			),
			...req.body
		};

		await db.setGenresForEvent(event.id, event.genres);
		await contract
			.instance
			.methods
			.createEvent(
				event.id,
				event.time,
				event.price,
				event.quantity
			)
			.send({ from: contract.OWNER, gas: contract.GAS })
		;
		await db.updateEvent(event.id, { deployed: 1 });
	});
});

server.put(API_BASE + "/events", async (req, res) => {
	await response(req, res, async (req) => {
		if (!req.session.admin) {
			throw new errs.UnauthorizedError();
		}

		// Convert FormData strings to numbers
		for (const key of ["id", "quantity", "time"]) {
			req.body[key] = Number(req.body[key]);
		}

		// Convert FormData string to array, filtering empty genres
		req.body.genres = req.body?.genres.split(/\r?\n/).filter(g => !!g);

		const validator = validators.updateEvent(req.body);

		if (validator.errors.length) {
			throw new errs.BadRequestError(validator.errors.shift().stack);
		}

		const event = { ...req.body };
		const contractEvent = await contract
			.instance
			.methods
			.events(event.id)
			.call()
		;

		if (!contractEvent.created) {
			throw new errs.BadRequestError();
		}

		// Attempt to update contract event first
		await contract
			.instance
			.methods
			.updateEvent(
				event.id,
				event.time,
				event.quantity
			)
			.send({ from: contract.OWNER, gas: contract.GAS })
		;

		// Contract event update did not throw exception, update DB event
		await db.setGenresForEvent(event.id, event.genres);

		let filePath;

		if (req.files.image) {
			filePath = `${IMG_PATH}/events/${uuidv4()}_${req.files.image.name}`;
			await utils.moveFile(req.files.image.path, filePath);
		}

		const updatedEvent = await db.updateEvent(
			event.id,
			{
				...utils.omit(event, ["genres", "quantity"]),
				time: new Date(event.time * 1000),
				imageUrl: filePath ? `${API_HOST}/${filePath.replace("src/", "")}` : undefined
			}
		);

		return updatedEvent;
	});
});

server.del(API_BASE + "/events/:id", async (req, res) => {
	await response(req, res, async (req) => {
		if (!req.session.admin) {
			throw new errs.UnauthorizedError();
		}

		const id = Number(req.params.id);
		const contractEvent = await contract
			.instance
			.methods
			.events(id)
			.call()
		;

		if (!contractEvent.created || contractEvent.cancelled) {
			throw new errs.BadRequestError();
		}

		const owners = await contract.getOwners(id);
		const totalQuantity = Array.from(owners.values()).reduce((acc, quantity) => acc + quantity, 0);
		const contractBalance = await contract.instance.methods.getBalance().call({ from: contract.OWNER });
		const refundAmount = totalQuantity * contractEvent.price;

		if (contractBalance < refundAmount) {
			throw new errs.InternalServerError(
				`Contract requires ${utils.weiToEth(refundAmount)} ETH to refund` +
				`owners but currently only has ${utils.weiToEth(contractBalance)}.`
			);
		}

		// Attempt to update contract event first
		await contract
			.instance
			.methods
			.cancelEvent(
				id,
				Array.from(owners.keys()),
				Array.from(owners.values())
			)
			.send({ from: contract.OWNER, gas: contract.GAS })
		;

		// Contract event update did not throw exception, update DB event
		await db.updateEvent(id, { cancelled: 1 });
	});
});

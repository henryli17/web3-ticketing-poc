require('dotenv').config()

const ganache = require("ganache");
const restify = require("restify");
const errs = require('restify-errors');
const db = require("./helpers/db.js");
const contract = require("./helpers/contract.js");
const path = require('path');
const server = restify.createServer();
const API_BASE = "/api"

ganache
	.server({
		database: { dbPath: path.resolve('../eth/blockchain') },
		wallet: { seed: "seed" }
	})
	.listen(8545, err => {
		if (err) {
			throw err;
		}
	})
;

server.listen(3001);
server.use(restify.plugins.queryParser());
server.use((_, res, next) => {
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Headers", "X-Requested-With");
	return next();
});

const response = async (req, res, fn) => {
	try {
		const data = await fn(req);
		res.send(
			200,
			JSON.parse(JSON.stringify(data))
		);
	} catch (e) {
		console.error(e);
		res.send(
			(e instanceof errs.HttpError) ? e : new errs.InternalServerError()
		);
	}
};

server.get(API_BASE + "/events/:id?", async (req, res) => {
	await response(req, res, async (req) => {
		const events = await db.getEvents({
			id: req.params.id,
			genres: (req.query?.genres !== "") ? req.query?.genres?.split(",") : null,
			locations: (req.query?.locations !== "") ? req.query?.locations?.split(",") : null,
			maxPrice: req.query?.maxPrice,
			search: req.query?.search
		});

		if (req.params.id) {
			if (!events) {
				throw new errs.ResourceNotFoundError();
			} else {
				return events.shift();
			}
		}

		const limit = 10;
		const offset = Math.max(parseInt(req.query?.offset) || 0, 0);
		const slice = events.slice(offset, offset + limit);

		return {
			events: slice,
			nextOffset: (offset + limit >= events.length) ? false : offset + limit
		};
	});
});

server.get(API_BASE + "/events/:id/metadata", async (req, res) => {
	await response(req, res, async (req) => {
		const events = await db.getEvents({ id: Number(req.params.id) });
		const event = events.shift();

		return {
			title: event.name,
			description: event.description,
			image: event.imagePath,
			properties: {
				artist: event.artist,
				venue: event.venue,
				city: event.city,
				time: event.time,
				ticketQuantity: event.ticketQuantity
			}
		}
	});
});

server.get(API_BASE + "/genres", async (req, res) => {
	await response(req, res, async (req) => {
		return await db.getGenres();
	});
});

server.get(API_BASE + "/locations", async (req, res) => {
	await response(req, res, async (req) => {
		return await db.getLocations();
	});
});

server.get(API_BASE + "/purchases/:address", async (req, res) => {
	await response(req, res, async (req) => {
		const tokens = await contract.getTokens(req.params.address);
		const events = await db.getEvents({ id: Array.from(tokens.keys()) })
		const resaleTokenEntries = await contract.instance.methods.getResaleTokenEntries(req.params.address).call();
		const eventsById = new Map();
		const resaleTokenEntriesById = new Map();
		const purchases = [];

		for (const event of events) {
			eventsById.set(event.id, event);
		}

		for (const resaleTokenEntry of resaleTokenEntries) {
			const key = Number(resaleTokenEntry.eventId);

			if (!resaleTokenEntry.sold) {
				resaleTokenEntriesById.set(
					key,
					(resaleTokenEntriesById.get(key) || 0) + 1
				);
			}
		}
	
		for (let [eventId, quantity] of tokens.entries()) {
			const event = eventsById.get(eventId);
			const expired = new Date(event.time) < new Date();

			if (!expired) {
				const resaleTokenEntry = resaleTokenEntriesById.get(eventId);
	
				if (resaleTokenEntry) {
					quantity -= resaleTokenEntry;
				}
			}

			if (quantity <= 0) {
				continue;
			}

			purchases.push({
				event: event,
				quantity: quantity,
				forSale: false,
				expired: expired
			});
		}

		for (const [eventId, quantity] of resaleTokenEntriesById.entries()) {
			const event = eventsById.get(eventId);
			const expired = new Date(event.time) < new Date();

			if (expired) {
				continue;
			}

			if (quantity) {
				purchases.push({
					event: eventsById.get(eventId),
					quantity: quantity,
					forSale: true,
					expired: expired
				});
			}
		}

		return purchases;
	});
});

server.get(API_BASE + "/contract", async (req, res) => {
	await response(req, res, async (req) => {
		return {
			ABI: contract.ABI,
			address: contract.address
		};
	});
});

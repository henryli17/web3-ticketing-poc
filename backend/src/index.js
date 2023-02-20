require('dotenv').config()

const restify = require("restify");
const errs = require('restify-errors');
const db = require("./helpers/db.js");
const contract = require("./helpers/contract.js");
const server = restify.createServer();
const API_BASE = "/api"

server.listen(8080);
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
			id: req.params.id || req.query.id?.split(",")
		});

		if (!events && req.params.id) {
			throw new errs.ResourceNotFoundError();
		}

		return events;
	});
});

server.get(API_BASE + "/genres", async (req, res) => {
	await response(req, res, async (req) => {
		return await db.getGenres();
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
			const resaleTokenEntry = resaleTokenEntriesById.get(eventId);

			if (resaleTokenEntry) {
				quantity -= resaleTokenEntry;
			}

			if (quantity <= 0) {
				continue;
			}

			purchases.push({
				event: eventsById.get(eventId),
				quantity: quantity,
				forSale: false
			});
		}

		for (const [eventId, quantity] of resaleTokenEntriesById.entries()) {
			if (quantity) {
				purchases.push({
					event: eventsById.get(eventId),
					quantity: quantity,
					forSale: true
				});
			}
		}

		return purchases.map(purchase => {
			return {
				...purchase,
				expired: new Date(purchase.event.time) < new Date()
			};
		});
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

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
		const eventsById = new Map();
		const purchases = [];

		for (const event of events) {
			eventsById.set(event.id, event);
		}
	
		for (const [eventId, quantity] of tokens.entries()) {
			purchases.push({
				event: eventsById.get(eventId),
				quantity: quantity,
				expired: false,
				forSale: false
			});
		}

		return purchases;
	});
});

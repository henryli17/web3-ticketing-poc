require('dotenv').config()

const restify = require("restify");
const errs = require('restify-errors');
const db = require("./db.js");
const server = restify.createServer();

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

server.get("/events/:id?", async (req, res) => {
	await response(req, res, async (req) => {	
		const events = await db.events({
			id: req.params.id || req.query.id?.split(",")
		});

		if (!events && req.params.id) {
			throw new errs.ResourceNotFoundError();
		}

		return events;
	});
});

server.get("/genres", async (req, res) => {
	await response(req, res, async (req) => {
		const genres = await db.genres();
		return genres;
	});
});

require('dotenv').config()

const restify = require("restify");
const db = require("./db.js");
const server = restify.createServer();

server.listen(8080);

const response = (res, data, status = 200) => {
	res.send(
		status,
		JSON.parse(JSON.stringify(data)) || undefined
	);
};

server.get("/events/:id?", async (req, res) => {
	try {
		const events = await db.events(req.params);
		response(res, events);
	} catch (e) {
		console.error(e);
		response(res, null, 500);
	}
});

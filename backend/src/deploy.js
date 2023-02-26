require('dotenv').config()

const db = require("./helpers/db.js");
const utils = require("./helpers/utils.js");
const contract = require("./helpers/contract");

const main = async () => {
	const events = await db.getEvents({}, false);

	for (const event of events) {
		await contract
			.instance
			.methods
			.createEvent(
				parseInt(event.id),
				parseInt(event.time / 1000),
				parseInt(event.price),
				parseInt(utils.random(1, 100))
			)
			.send({
				from: contract.OWNER,
				gas: contract.GAS
			})
		;

		await db.updateEvent(event.id, { deployed: 1 });
	}

	console.log(`\nSuccessfully deployed ${events.length} events to contract ${contract.ADDRESS}!`);
};

main()
	.then(process.exit)
	.catch(e => { throw e })
;

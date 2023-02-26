require('dotenv').config()

const db = require("./helpers/db.js");
const contract = require("./helpers/contract");

const main = async () => {
	// TODO: handle this properly and update events on finish
	const events = await db.getEvents(undefined, false);

	for (const event of events) {
		await contract
			.instance
			.methods
			.createEvent(
				parseInt(event.id),
				new Date(event.time).getTime() / 1000,
				parseInt(event.price),
				parseInt(event.quantity)
			)
			.send({
				from: contract.OWNER,
				gas: contract.GAS
			})
		;
	}

	console.log(`\nSuccessfully deployed events to contract ${contract.address}!`);
};

main()
	.then(process.exit)
	.catch(e => { throw e })
;

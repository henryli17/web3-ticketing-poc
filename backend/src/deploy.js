require('dotenv').config()

const db = require("./helpers/db.js");
const contract = require("./helpers/contract");

const main = async () => {
	const events = await db.getEvents();

	for (const event of events) {
		await contract
			.instance
			.methods
			.createEvent(
				parseInt(event.id),
				event.name,
				new Date(event.time).getTime() / 1000,
				parseInt(event.price),
				parseInt(event.quantity)
			)
			.send({
				from: contract.owner,
				gas: contract.gas
			})
		;
	}

	console.log(`\nSuccessfully deployed events to contract ${contract.address}!`);
};

main()
	.then(process.exit)
	.catch(e => { throw e })
;

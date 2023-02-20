require('dotenv').config()

const db = require("./helpers/db.js");
const contract = require("./helpers/contract");
const GAS = 999999;

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
				parseInt(event.ticketQuantity)
			)
			.send({
				from: process.env.ETH_CONTRACT_OWNER,
				gas: GAS
			})
		;
	}
};

main()
	.then(process.exit)
	.catch(e => { throw e })
;

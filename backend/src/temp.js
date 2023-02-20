require('dotenv').config()

let contract = require("./helpers/contract");

(async function () {
	try {

		const res = await contract
			.instance
			.methods
			.createEvent(
				1,
				"Test1",
				1708033774,
				1000000,
				50
			)
			.send({ from: process.env.ETH_PROVIDER_ADDRESS })
		;

		// const res = await contract
		// 	.instance
		// 	.methods
		// 	.events(
		// 		1
		// 	)
		// 	.call({ from: process.env.ETH_PROVIDER_ADDRES })
		// 	// .send({ from: config.address })
		// ;

		console.log(res);
	} catch (e) {
		console.error(e);
	}

	process.exit();
})();

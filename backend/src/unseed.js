require('dotenv').config()

const db = require("./helpers/db");

const main = async () => {
	await db.reset();
	console.log(`Successfully unseeded database!`);
};

main()
	.then(process.exit)
	.catch(e => { throw e })
;

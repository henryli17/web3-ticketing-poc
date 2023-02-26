require('dotenv').config()

const db = require("./helpers/db.js");
const utils = require("./helpers/utils.js");
const contract = require("./helpers/contract");
const { faker } = require('@faker-js/faker');
const SEED_COUNT = 50;

const random = (min, max) => Math.random() * (max - min) + min;

const generateEvents = (n) => {
	const events = [];

	for (let i = 0; i < n; i++) {
		const genres = [];
		const count = random(1, 4);
		const time = new Date();
	
		for (let j = 0; j < count; j++) {
			genres.push(faker.music.genre());
		}
	
		time.setDate(time.getDate() + random(1, 1000));
	
		events.push({
			name: faker.music.songName(),
			artist: faker.name.fullName(),
			venue: faker.lorem.words(2),
			city: faker.address.cityName(),
			time: time,
			price: parseInt(utils.ethToGwei(random(0.01, 1))),
			imageUrl: faker.image.fashion(707, 976, true),
			description: faker.lorem.lines(5),
			genres: genres,
			cancelled: 0,
			deployed: 0
		});
	}

	return events;
};

const main = async () => {
	for (const event of generateEvents(50)) {
		const id = await db.createEvent(utils.omit(event, ["genres"]));
		await db.setGenresForEvent(id, event.genres);
	}

	console.log(`Successfully seeded ${SEED_COUNT} events to the database!`);
};

main()
	.then(process.exit)
	.catch(e => { throw e })
;

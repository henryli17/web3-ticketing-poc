const knex = require('knex')({
	client: process.env.DB_CLIENT,
	connection: {
		host: process.env.DB_HOST,
		port: process.env.DB_PORT,
		user: process.env.DB_USER,
		password: process.env.DB_PASSWORD,
		database: process.env.DB_NAME
	}
});

const events = async (params) => {
	const temp = {};
	const rows = await knex
		.select("events.*")
		.select("genres.name AS genre")
		.table("events")
		.leftJoin("event-genre", "events.id", "event-genre.eventId")
		.innerJoin("genres", "event-genre.genreId", "genres.id")
		.modify(query => {
			if (params.id) {
				query.where("events.id", params.id);
			}
		})
	;

	// Group genres into array for each event
	for (const row of rows) {
		if (!temp[row.id]) {
			temp[row.id] = { ...row, genre: [row.genre] };
		} else {
			temp[row.id].genre.push(row.genre);
		}
	}

	const events = Object.values(rows);

	return (params.id) ? events.shift() : events;
};

module.exports = {
	events,
};

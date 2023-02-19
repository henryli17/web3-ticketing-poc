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

const events = async (options) => {
	const events = {};
	const rows = await knex
		.select("events.*")
		.select("genres.name AS genre")
		.table("events")
		.leftJoin("event-genre", "events.id", "event-genre.eventId")
		.innerJoin("genres", "event-genre.genreId", "genres.id")
		.modify(query => {
			if (options.id) {
				if (Array.isArray(options.id)) {
					query.whereIn("events.id", options.id);
				} else {
					query.where("events.id", options.id);
				}
			}
		})
	;

	// Group genres into array for each event
	for (const row of rows) {
		if (!events[row.id]) {
			events[row.id] = { ...row, genres: [row.genre] };
			delete events[row.id].genre;
		} else {
			events[row.id].genres.push(row.genre);
		}
	}

	if (options.id && !Array.isArray(options.id)) {
		return (events) ? events[options.id] : {};
	} else {
		return Object.values(events);
	}
};

const genres = async () => {
	const genres = await knex
		.select("name")
		.table("genres")
		.pluck("name")
	;

	return genres;
}

module.exports = {
	events,
	genres
};

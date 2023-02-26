const DB_FILE = "events.db";
const knex = require('knex')({
	client: "sqlite3",
	connection: {
		filename: DB_FILE
	},
	useNullAsDefault: true
});

const getEvents = async (options, deployedOnly = false, showCancelled = false) => {
	const events = {};
	const rows = await knex
		.select("events.*")
		.select("genres.name AS genre")
		.table("events")
		.leftJoin("event-genre", "events.id", "event-genre.eventId")
		.leftJoin("genres", "event-genre.genreId", "genres.id")
		.whereRaw("events.time > unixepoch('now')")
		.modify(query => {
			if (deployedOnly) {
				query.where("deployed", 1);
			}

			if (!showCancelled) {
				query.where("cancelled", 0);
			}

			if (options?.ids && options.ids.length) {
				query.whereIn("events.id", options.ids);
			}

			if (options?.search) {
				const search = "%" + options.search + "%";

				query
					.whereILike("genres.name", search)
					.orWhereILike("events.city", search)
					.orWhereILike("events.artist", search)
				;
			}
			
			if (options?.genres && options.genres.length) {
				query.whereIn("genres.name", options.genres);
			}

			if (options?.locations && options.locations.length) {
				query.whereIn("events.city", options.locations);
			}

			if (options?.maxPrice) {
				query.where("events.price", "<=", options.maxPrice);
			}
		})
	;

	// Group genres into array for each event
	for (const row of rows) {
		if (!events[row.id]) {
			events[row.id] = {
				...row,
				genres: row.genre ? [row.genre] : []
			};

			delete events[row.id].genre;
		} else {
			events[row.id].genres.push(row.genre);
		}
	}

	return Object.values(events);
};

const getEvent = async (id) => {
	let event;
	const rows = await knex
		.select("events.*")
		.select("genres.name AS genre")
		.table("events")
		.leftJoin("event-genre", "events.id", "event-genre.eventId")
		.leftJoin("genres", "event-genre.genreId", "genres.id")
		.where("events.id", id)
		.whereRaw("events.time > unixepoch('now')")
	;

	if (!rows.length) {
		return false;
	}

	// Group genres into array for each event
	for (const row of rows) {
		if (!event) {
			event = {
				...row,
				genres: row.genre ? [row.genre] : []
			};

			delete event.genre;
		} else {
			event.genres.push(row.genre);
		}
	}

	return event;
};

const getGenres = () => {
	return knex
		.select("name")
		.table("genres")
		.pluck("name")
	;
};

const getLocations = () => {
	return knex
		.distinct("city")
		.table("events")
		.pluck("city")
	;
};

const createEvent = async (event) => {
	const fields = await knex('events').insert(event);
	return fields.shift();
};

const updateEvent = (id, event) => {
	return knex('events').where({ id: id }).update(event);
};

const setGenresForEvent = async (eventId, eventGenres) => {
	for (const name of eventGenres) {
		await knex("genres")
			.insert({ name: name })
			.onConflict("name")
			.ignore()
		;
	}

	const genresByName = new Map();
	const genres = await knex
		.select("id")
		.select("name")
		.table("genres")
	;

	for (const genre of genres) {
		genresByName.set(genre.name, genre);
	}

	await knex("event-genre")
		.where({ eventId: eventId })
		.del()
	;

	for (const name of eventGenres) {
		await knex("event-genre")
			.insert({
				eventId: eventId,
				genreId: genresByName.get(name).id
			})
			.onConflict(["eventId", "genreId"])
			.ignore()
		;
	}
};

module.exports = {
	DB_FILE,
	getEvents,
	getEvent,
	getGenres,
	getLocations,
	createEvent,
	updateEvent,
	setGenresForEvent
};

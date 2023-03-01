module.exports = {
	client: "sqlite3",
	connection: {
		filename: (process.env.NODE_ENV === "production") ? "litefs/db.sqlite3" : "db.sqlite3"
	}
};

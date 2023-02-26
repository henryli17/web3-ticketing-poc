const fs = require("fs");

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
	const stmts = fs.readFileSync("migrations/schema.sql", "utf-8").split(";");
	return knex.raw(stmts[0]);
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {

};
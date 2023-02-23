const Validator = require('jsonschema').Validator;

const createEvent = (event) => {
	const v = new Validator();

	const genresSchema = {
		"id": "/genres",
		"type": "array",
		"items": { "type": "string" }
	};

	const schema = {
		"id": "/Event",
		"type": "object",
		"properties": {
			"name": { "type": "string" },
			"artist": { "type": "string" },
			"venue": { "type": "string" },
			"city": { "type": "string" },
			"time": { "type": "integer", "minimum": new Date().getTime() / 1000 },
			"price": { "type": "integer", "minimum": 0 },
			"quantity": { "type": "integer", "minimum": 1 },
			"imagePath": { "type": "string" },
			"description": { "type": "string" },
			"genres": { "$ref": "/genres" }
		},
		"required": [
			"name",
			"artist",
			"venue",
			"city",
			"time",
			"price",
			"quantity",
			"imagePath",
			"description",
			"genres"
		],
		"additionalProperties": false
	};
	
	v.addSchema(genresSchema, '/genres');

	return v.validate(event, schema).valid;
}

module.exports = {
	createEvent
};

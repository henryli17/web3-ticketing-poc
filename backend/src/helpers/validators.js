const Validator = require('jsonschema').Validator;

const genresSchema = {
	"id": "/genres",
	"type": "array",
	"items": { "type": "string" }
};

const eventSchema = {
	"id": "/Event",
	"type": "object",
	"properties": {
		"id": { "type": "number" },
		"name": { "type": "string" },
		"artist": { "type": "string" },
		"venue": { "type": "string" },
		"city": { "type": "string" },
		"time": { "type": "integer", "minimum": new Date().getTime() / 1000 },
		"price": { "type": "integer", "minimum": 0 },
		"quantity": { "type": "integer", "minimum": 1 },
		"imageUrl": { "type": "string" },
		"description": { "type": "string" },
		"genres": { "$ref": "/genres" }
	},
	"required": [
		"id",
		"name",
		"artist",
		"venue",
		"city",
		"time",
		"price",
		"quantity",
		"imageUrl",
		"description",
		"genres"
	],
	"additionalProperties": false
};

const createEvent = (event) => {
	const v = new Validator();
	const schema = { ...eventSchema };

	delete schema.properties.id;
	schema.properties.required = schema.properties.required.map(r => r !== "id")
	
	v.addSchema(genresSchema, '/genres');

	return v.validate(event, schema);
};

const updateEvent = (event) => {
	const v = new Validator();
	const schema = { ...eventSchema };

	delete schema.properties.price;
	schema.properties.required = schema.properties.required.map(r => r !== "price")

	v.addSchema(genresSchema, '/genres');

	return v.validate(event, schema);
};


module.exports = {
	createEvent,
	updateEvent
};

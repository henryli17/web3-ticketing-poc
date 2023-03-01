const Validator = require("jsonschema").Validator;
const structuredClone = require("@ungap/structured-clone");

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
		"description",
		"genres"
	],
	"additionalProperties": false
};

const createEvent = (event) => {
	const v = new Validator();
	const schema = structuredClone.default(eventSchema);

	delete schema.properties.id;
	schema.required = schema.required.filter(r => r !== "id")
	
	v.addSchema(genresSchema, '/genres');

	return v.validate(event, schema);
};

const updateEvent = (event) => {
	const v = new Validator();
	const schema = structuredClone.default(eventSchema);

	delete schema.properties.price;
	schema.required = schema.required.filter(r => r !== "price")

	v.addSchema(genresSchema, '/genres');

	return v.validate(event, schema);
};

const eventToken = (data) => {
	const v = new Validator();
	const schema = {
		"id": "/Data",
		"type": "object",
		"properties": {
			"signature": { "type": "string", "minLength": 132, "maxLength": 132 },
			"quantity": { "type": "integer", "minimum": 1 }
		},
		"required": [
			"signature",
			"quantity"
		],
		"additionalProperties": false
	};

	return v.validate(data, schema);
}

module.exports = {
	createEvent,
	updateEvent,
	eventToken
};

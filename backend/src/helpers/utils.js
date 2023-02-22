const contract = require("./contract");
const db = require("./db");

const getPurchases = async (address) => {
	const eventsById = new Map();
	const resaleTokenEntriesById = new Map();
	const purchases = [];
	const tokens = await contract.getTokens(address);
	const resaleTokenEntries = await contract.instance.methods.getResaleTokenEntries(address).call();
	const events = await db.getEvents({
		id: [
			...Array.from(tokens.keys()),
			...resaleTokenEntries.map(r => r.eventId)
		]
	});

	for (const event of events) {
		eventsById.set(event.id, event);
	}

	for (const resaleTokenEntry of resaleTokenEntries) {
		const key = Number(resaleTokenEntry.eventId);

		if (!resaleTokenEntry.sold) {
			resaleTokenEntriesById.set(
				key,
				(resaleTokenEntriesById.get(key) || 0) + 1
			);
		}
	}

	for (let [eventId, quantity] of tokens.entries()) {
		const event = eventsById.get(eventId);
		const expired = new Date(event.time) < new Date();

		if (!expired) {
			const resaleTokenEntry = resaleTokenEntriesById.get(eventId);

			if (resaleTokenEntry) {
				quantity -= resaleTokenEntry;
			}
		}

		if (quantity <= 0) {
			continue;
		}

		purchases.push({
			event: event,
			quantity: quantity,
			forSale: false,
			expired: expired
		});
	}

	for (const [eventId, quantity] of resaleTokenEntriesById.entries()) {
		const event = eventsById.get(eventId);
		const expired = new Date(event.time) < new Date();

		if (expired) {
			continue;
		}

		if (quantity) {
			purchases.push({
				event: eventsById.get(eventId),
				quantity: quantity,
				forSale: true,
				expired: expired
			});
		}
	}

	return purchases;
};

module.exports = {
	getPurchases
};

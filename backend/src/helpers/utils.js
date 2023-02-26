const contract = require("./contract");
const db = require("./db");
const Web3 = require("web3");

const getPurchases = async (address) => {
	const eventsById = new Map();
	const resaleTokenEntriesById = new Map();
	const usedTokensById = new Map();
	const purchases = [];
	const tokens = await contract.getTokens(address);
	const resaleTokenEntries = await contract.instance.methods.getResaleTokenEntries(address).call();
	const usedTokens = await contract.instance.methods.getUsedTokens(address).call();
	const events = await db.getEvents({
		id: [
			...Array.from(tokens.keys()),
			...resaleTokenEntries.map(r => r.eventId)
		]
	}, false, true);

	// Map events by ID
	for (const event of events) {
		eventsById.set(event.id, event);
	}

	// Map unsold resaleTokenEntries by their event ID
	for (const resaleTokenEntry of resaleTokenEntries) {
		const key = Number(resaleTokenEntry.eventId);

		if (!resaleTokenEntry.sold) {
			resaleTokenEntriesById.set(
				key,
				(resaleTokenEntriesById.get(key) || 0) + 1
			);
		}
	}

	// Map usedTokens by their event ID
	for (const usedToken of usedTokens) {
		const key = Number(usedToken);

		usedTokensById.set(
			key,
			(usedTokensById.get(key) || 0) + 1
		);
	}

	// Get all purchases not listed for sale
	for (let [eventId, quantity] of tokens.entries()) {
		const event = eventsById.get(eventId);
		const expired = new Date(event.time) < new Date();

		// Adjust quantity by those current listed for sale unless it is expired
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
			expired: expired,
			used: usedTokensById.get(eventId) || 0
		});
	}

	// Get all purchases currently listed for sale
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

	// We only care about deployed events
	return purchases.filter(p => p.event.deployed);
};

const omit = (object, key) => {
	const { [key]: _, ...rest } = object;
	return rest;
};

const weiToEth = (wei) => Web3.utils.fromWei(wei.toString());

module.exports = {
	getPurchases,
	omit,
	weiToEth
};

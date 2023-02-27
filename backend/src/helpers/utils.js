const contract = require("./contract");
const db = require("./db");
const fs = require("fs");
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
		ids: [
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

		// Adjust quantity by those current listed for sale unless it is expired/cancelled
		if (!expired && !event.cancelled) {
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

		if (expired || event.cancelled) {
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

const getEvent = async (id, showCancelled = true, showExpired = true) => {
	const event = await db.getEvent(id, showCancelled, showExpired);

	if (!event) {
		return false;
	}

	const contractEvent = await contract.instance.methods.events(event.id).call();

	return {
		...event,
		quantity: parseInt(contractEvent.quantity),
		supplied: parseInt(contractEvent.supplied),
		remaining: parseInt(contractEvent.quantity - contractEvent.supplied)
	};
};

const omit = (object, keys) => {
	let final = object;

	const omitOne = (object, key) => {
		const { [key]: _, ...rest } = object;
		return rest;
	};

	for (const key of keys) {
		final = omitOne(final, key);
	}

	return final;
};

const weiToEth = (wei) => Web3.utils.fromWei(wei.toString());
const ethToGwei = (eth) => eth * Math.pow(10, 9);
const random = (min, max) => Math.random() * (max - min) + min;

const moveFile = (from, to) => {
    const read = fs.createReadStream(from);
    const write = fs.createWriteStream(to);

    return new Promise((resolve, reject) => {
        read.on('end', resolve);
        read.on('error', reject);
        read.pipe(write);
    });
};

module.exports = {
	random,
	getPurchases,
	getEvent,
	omit,
	weiToEth,
	ethToGwei,
	moveFile
};

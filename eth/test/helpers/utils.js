const shouldThrow = async (promise) => {
	try {
		await promise;
	} catch (err) {
		assert(true);
		return;
	}

	assert(false, "The contract was expected to throw an exception here.");
};

const defaultEvent = () => {
	return {
		id: 1,
		name: "TestEvent1",
		time: Math.floor(Date.now() / 1000) + 86400, // Tomorrow
		price: 10000000, // 10000000 gwei / 0.01 ETH
		quantity: 2,
		priceInWei: function() {
			return web3.utils.toWei(this.price.toString(), "gwei");
		} 
	};
};

const createEvent = async (contract, caller, event) => {
	event = { ...defaultEvent(), ...event };

	await contract.createEvent.sendTransaction(
		event.id,
		event.time,
		event.price,
		event.quantity,
		{ from: caller }
	);
};

const assertTokenListedForResale = async (contract, eventId, owner, quantity) => {
	const resaleTokens = await contract.getResaleTokens.call(eventId);
	const resaleTokenEntries = await contract.getResaleTokenEntries.call(owner);
	const activeResaleTokenEntries = resaleTokenEntries.filter(rte => !rte.sold && parseInt(rte.eventId) === eventId);
	const activeResaleTokensForOwner = resaleTokens.filter(rt => !rt.sold && rt.owner === owner);

	assert.equal(activeResaleTokenEntries.length, quantity);
	assert.equal(activeResaleTokensForOwner.length, quantity);
};

const assertTokenCount = async (contract, account, id, count) => {
	const tokenCount = await contract.balanceOf.call(
		account,
		id
	);

	assert.equal(tokenCount.toNumber(), count);
};

module.exports = {
	createEvent,
	defaultEvent,
	shouldThrow,
	assertTokenListedForResale,
	assertTokenCount
};

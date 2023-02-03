const shouldThrow = async (promise) => {
    try {
        await promise;
    } catch (err) {
        assert(true);
        return;
    }

    assert(false, "The contract was expected to throw an exception here.");
}

const defaultEvent = () => {
	return {
		id: 1,
		name: "TestEvent1",
		time: Math.floor(Date.now() / 1000) + 86400, // Tomorrow
		price: 10000000, // 0.01 ETH
		quantity: 2,
		priceInWei: function() {
			return this.price * Math.pow(10, 9);
		} 
	};
}

const createEvent = async (contract, caller, event) => {
	event = { ...defaultEvent(), ...event };

	await contract.createEvent.sendTransaction(
		event.id,
		event.name,
		event.time,
		event.price,
		event.quantity,
		{ from: caller }
	);
}

module.exports = {
	createEvent,
	defaultEvent,
	shouldThrow
}

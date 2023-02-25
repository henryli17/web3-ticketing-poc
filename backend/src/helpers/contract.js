const Web3 = require("web3");

const web3 = new Web3(
	new Web3.providers.HttpProvider("http://127.0.0.1:8545")
);

const ABI = require("./contractABI.json");
const owner = "0x3b26935917de7f5fac60f6d15ff02b1cf468dfb0";
const address = process.env.ETH_CONTRACT_ADDRESS;
const instance = new web3.eth.Contract(ABI, address, { handleRevert: true });
const gas = 999999;

const getTokens = async (address) => {
	const tokens = new Map();
	const events = await instance.getPastEvents(
		'TransferSingle',
		{ fromBlock: 0, toBlock: 'latest' }
	);

	for (const event of events) {
		const eventId = Number(event.returnValues.id);
		const quantity = Number(event.returnValues.value);
		let diff;

		if (event.returnValues.to === address) {
			diff = quantity;
		} else if (event.returnValues.from === address) {
			diff = -quantity;
		} else {
			continue;
		}

		tokens.set(
			eventId,
			(tokens.has(eventId)) ? (tokens.get(eventId) + diff) : diff
		);
	}

	return tokens;
};

const getOwners = async (eventId) => {
	const owners = new Map();
	const events = await instance.getPastEvents(
		'TransferSingle',
		{ fromBlock: 0, toBlock: 'latest' }
	);

	for (const event of events) {
		if (Number(event.returnValues.id) !== eventId) {
			continue;
		}
	
		const quantity = Number(event.returnValues.value);
		const to = event.returnValues.to;
		const from = event.returnValues.from;

		owners.set(
			to,
			(owners.has(to)) ? (owners.get(to) + quantity) : quantity
		);

		owners.set(
			from,
			(owners.has(from)) ? (owners.get(from) - quantity) : -quantity
		);
	}

	for (const [address, quantity] of owners) {
		if (quantity <= 0) {
			owners.delete(address);
		}
	}

	return owners;
};

const signatureToAddress = (signature) => {
	return web3.eth.accounts.recover(
		Web3.utils.toHex("Please sign this transaction to view your ticket QR code."),
		signature
	);
}

module.exports = {
	ABI,
	address,
	owner,
	instance,
	getTokens,
	getOwners,
	signatureToAddress,
	gas
}

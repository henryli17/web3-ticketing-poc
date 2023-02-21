const Web3 = require("web3");

const web3 = new Web3(
	new Web3.providers.HttpProvider("http://127.0.0.1:8545")
);

const ABI = require("./ABI.json");
const owner = "0x3b26935917de7f5fac60f6d15ff02b1cf468dfb0"; // 0x4397dbd437030df7c8ed3cb213f34aeea9786debd4bbd62767021eb19ae7d345
const address = process.env.ETH_CONTRACT_ADDRESS;
const instance = new web3.eth.Contract(ABI, address);

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
		)
	}

	return tokens;
};

module.exports = {
	ABI,
	address,
	owner,
	instance,
	getTokens
}

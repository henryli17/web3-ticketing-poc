const Web3 = require("web3");
const HDWalletProvider = require("@truffle/hdwallet-provider");

const web3 = new Web3(
	new HDWalletProvider(
		process.env.ETH_PROVIDER_MNEMONIC,
		"https://goerli.infura.io/v3/" + process.env.ETH_PROVIDER_PROJECT_ID
	)
);

const ABI = require("./ABI.json");
const address = process.env.ETH_CONTRACT_ADDRESS;
const instance = new web3.eth.Contract(ABI, address);

const getTokens = (address) => {
	return new Promise(async (resolve, reject) => {
		try {
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
					(tokens.has(eventId)) ? tokens.get(eventId) + diff : 1
				)
			}
	
			resolve(tokens);
		} catch (e) {
			reject(e);
		}
	});
};

module.exports = {
	ABI,
	address,
	instance,
	getTokens
}

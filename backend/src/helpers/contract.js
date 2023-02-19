const Web3 = require("web3");
const HDWalletProvider = require("@truffle/hdwallet-provider");

const web3 = new Web3(
	new HDWalletProvider(
		process.env.ETH_PROVIDER_MNEMONIC,
		"https://goerli.infura.io/v3/" + process.env.ETH_PROVIDER_PROJECT_ID
	)
);

const contract = new web3.eth.Contract(
	require("../ABI.json"),
	process.env.ETH_CONTRACT_ADDRESS
);

const getTokens = (address) => {
	return new Promise(async (resolve, reject) => {
		try {
			const tokens = new Map();
			const events = await contract.getPastEvents(
				'TransferSingle',
				{ fromBlock: 0, toBlock: 'latest' }
			);

			for (const event of events) {
				let diff;

				if (event.returnValues.to === address) {
					diff = Number(event.returnValues.value);
				} else if (event.returnValues.from === address) {
					diff = -Number(event.returnValues.value);
				} else {
					continue;
				}

				tokens.set(
					Number(event.returnValues.id),
					(Number(tokens.get(event.returnValues.id)) || 0) + diff
				)
			}
	
			resolve(tokens);
		} catch (e) {
			reject(e);
		}
	});
};

module.exports = {
	contract,
	getTokens
}

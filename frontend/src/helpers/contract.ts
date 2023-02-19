import Web3 from "web3";

const web3 = new Web3(Web3.givenProvider);
const CONTRACT_ADDRESS = "0x3830Dc9f529987f2cB373F48304baF9EE6789a19";

export const contract = new web3.eth.Contract(
	require("./ABI.json"),
	CONTRACT_ADDRESS
);

export const getTokens = (address: string) => {
	return new Promise<Map<Number, Number>>(async (resolve, reject) => {
		try {
			const events = await contract.getPastEvents('TransferSingle', { fromBlock: 0, toBlock: 'latest' });
			const tokens: Map<Number, Number> = new Map();

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

require('dotenv').config();

const Web3 = require("web3");
const HDWalletProvider = require('@truffle/hdwallet-provider');

const web3 = new Web3(
	(process.env.NODE_ENV === "production")
	? new HDWalletProvider(
		process.env.ETH_MNEUMONIC,
		"https://goerli.infura.io/v3/" + process.env.INFURA_PROJECT_ID
	)
	: new Web3.providers.HttpProvider("http://127.0.0.1:8545")
);

const ABI = require("./contractABI.json");
const SIGNATURE_MESSAGE = Web3.utils.toHex("Please sign this transaction to authenticate via your Ethereum wallet.");
const OWNER = process.env.ETH_CONTRACT_OWNER || "0x3b26935917de7f5fac60f6d15ff02b1cf468dfb0";
const ADDRESS = process.env.ETH_CONTRACT_ADDRESS;
const instance = new web3.eth.Contract(ABI, ADDRESS, { handleRevert: true });

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

const signatureToAddress = signature => web3.eth.accounts.recover(SIGNATURE_MESSAGE, signature);

const sendContractTx = async (method) => {
	await method.send({
		from: OWNER,
		gas: await method.estimateGas({ from: OWNER })
	});
};

module.exports = {
	ABI,
	ADDRESS,
 	OWNER,
	instance,
	getTokens,
	getOwners,
	signatureToAddress,
	sendContractTx,
	SIGNATURE_MESSAGE
};

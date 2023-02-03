const Web3 = require('web3');
const web3 = new Web3(Web3.givenProvider);
const Events = artifacts.require("Events");
const price = Web3.utils.toWei("1", "ether");
const quantity = 2;

contract("Events", (accounts) => {
	const [alice, bob, charlie] = accounts;
	let contract;

	beforeEach(async () => {
		contract = await Events.new();
	});

	it("deploys a contract", () => {
		assert.ok(contract.address);
	});
});

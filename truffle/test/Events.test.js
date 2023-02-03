const Web3 = require('web3');
const web3 = new Web3(Web3.givenProvider);
const utils = require("./helpers/utils");
const Events = artifacts.require("Events");
const price = Web3.utils.toWei("1", "ether");

contract("Events", (accounts) => {
	const [alice, bob, charlie] = accounts;
	const defaultEvent = utils.defaultEvent();
	let contract;

	beforeEach(async () => {
		contract = await Events.new();
	});

	it("deploys a contract", () => {
		assert.ok(contract.address);
	});

	it("creates an event", async () => {
		await utils.createEvent(contract, alice);
	});

	it("only allows contract owner to create events", async () => {
		await utils.shouldThrow(
			utils.createEvent(contract, bob)
		);
	});

	it("allows a user to buy a token", async () => {
		await utils.createEvent(contract, alice);
		await contract.buyToken.sendTransaction(
			defaultEvent.id,
			1,
			{ from: charlie, value: defaultEvent.priceInWei() }
		);
	});

	it("reverts when buying a token with insufficient ETH", async () => {
		await utils.createEvent(contract, alice);
		await utils.shouldThrow(
			contract.buyToken.sendTransaction(
				defaultEvent.id,
				defaultEvent.quantity,
				{ from: charlie, value: defaultEvent.priceInWei() }
			)
		);
	});

	it("reverts when buying a token with too much quantity", async () => {
		await utils.createEvent(contract, alice);
		await contract.buyToken.sendTransaction(
			defaultEvent.id,
			defaultEvent.quantity,
			{ from: alice, value: defaultEvent.priceInWei() * defaultEvent.quantity }
		)
		await utils.shouldThrow(
			contract.buyToken.sendTransaction(
				defaultEvent.id,
				1,
				{ from: charlie, value: defaultEvent.priceInWei() }
			)
		);
	});

	it("reverts when buying a token for a past event", async () => {
		await utils.createEvent(
			contract,
			alice,
			{ time: Math.floor(Date.now() / 1000) - 1 }
		);
		await utils.shouldThrow(
			contract.buyToken.sendTransaction(
				defaultEvent.id,
				1,
				{ from: charlie, value: defaultEvent.priceInWei() }
			)
		);
	});
});

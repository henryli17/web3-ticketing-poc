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

	describe("createEvent", () => {
		it("creates an event", async () => {
			await utils.createEvent(contract, alice);
		});
	
		it("reverts when not owner", async () => {
			await utils.shouldThrow(
				utils.createEvent(contract, bob)
			);
		});	

		it("reverts when price is 0", async () => {
			await utils.shouldThrow(
				utils.createEvent(contract, alice, { price: 0 })
			);
		});	

		it("reverts when quantity is 0", async () => {
			await utils.shouldThrow(
				utils.createEvent(contract, alice, { quantity: 0 })
			);
		});

		it("reverts when event with same ID exists", async () => {
			await utils.createEvent(contract, alice);
			await utils.shouldThrow(
				utils.createEvent(contract, alice)
			);
		});	
	});

	describe("buyToken", () => {
		beforeEach(async () => {
			await utils.createEvent(contract, alice);
		});

		it("buys a token", async () => {
			await contract.buyToken.sendTransaction(
				defaultEvent.id,
				1,
				{ from: charlie, value: defaultEvent.priceInWei() }
			);
		});

		it("reverts with insufficient payment", async () => {
			await utils.shouldThrow(
				contract.buyToken.sendTransaction(
					defaultEvent.id,
					defaultEvent.quantity,
					{ from: charlie, value: defaultEvent.priceInWei() }
				)
			);
		});

		it("reverts with too much quantity", async () => {
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

		it("reverts when event is in the past", async () => {
			const event = {
				id: defaultEvent.id + 1,
				time: Math.floor(Date.now() / 1000)
			};

			await utils.createEvent(contract, alice, event);
			await utils.shouldThrow(
				contract.buyToken.sendTransaction(
					event.id,
					1,
					{ from: charlie, value: defaultEvent.priceInWei() }
				)
			);
		});
	});

	describe("listTokenForResale", () => {
		it("lists a token for resale", async () => {

		});
	});
});

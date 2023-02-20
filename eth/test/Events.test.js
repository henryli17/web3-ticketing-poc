const Web3 = require('web3');
const web3 = new Web3(Web3.givenProvider);
const utils = require("./helpers/utils");
const Events = artifacts.require("Events");

contract("Events", (accounts) => {
	const [alice, bob, charlie] = accounts;
	const defaultEvent = utils.defaultEvent();
	let contract;

	beforeEach(async () => {
		contract = await Events.new();
	});

	it.only("resale scenario", async () => {
		await utils.createEvent(contract, alice, defaultEvent);
		await contract.buyToken.sendTransaction(
			defaultEvent.id,
			2,
			{ from: bob, value: utils.gweiToWei(defaultEvent.price * 2) }
		);
		await contract.listTokenForResale.sendTransaction(
			defaultEvent.id,
			2,
			{ from: bob }
		);
		await contract.unlistTokenForResale.sendTransaction(
			defaultEvent.id,
			1,
			{ from: bob }
		);
		await contract.buyResaleToken.sendTransaction(
			bob,
			defaultEvent.id,
			{ from: charlie, value: utils.gweiToWei(defaultEvent.price) }
		);

		// const res = await contract.getResaleTokenEntries.call(bob);
		// console.log(res);
	});

	it("deploys a contract", () => {
		assert.ok(contract.address);
	});

	describe("createEvent", () => {
		it("creates an event", async () => {
			await utils.createEvent(contract, alice, defaultEvent);

			const event = await contract.events.call(defaultEvent.id);

			assert.equal(event.name.toString(), defaultEvent.name);
			assert.equal(event.time.toNumber(), defaultEvent.time);
			assert.equal(BigInt(event.price), BigInt(utils.gweiToWei(defaultEvent.price)));
			assert.equal(event.quantity.toNumber(), defaultEvent.quantity);
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

	describe("updateEvent", () => {
		const defaultEvent = utils.defaultEvent();

		beforeEach(async () => {
			await utils.createEvent(contract, alice);
		});

		it("updates an event", async () => {
			const updatedEvent = {
				id: defaultEvent.id,
				name: defaultEvent.name + "Updated",
				time: defaultEvent.time + 1,
				price: defaultEvent.price + 1,
				quantity: defaultEvent.quantity + 1
			};

			await contract.updateEvent.sendTransaction(
				updatedEvent.id,
				updatedEvent.name,
				updatedEvent.time,
				updatedEvent.price,
				updatedEvent.quantity
			);

			const event = await contract.events.call(defaultEvent.id);

			assert.equal(event.name.toString(), updatedEvent.name);
			assert.equal(event.time.toNumber(), updatedEvent.time);
			assert.equal(BigInt(event.price), BigInt(utils.gweiToWei(updatedEvent.price)));
			assert.equal(event.quantity.toNumber(), updatedEvent.quantity);
		});
	});

	describe("buyToken", () => {
		beforeEach(async () => {
			await utils.createEvent(contract, alice);
		});

		const assertTokenCount = async (account, id, count) => {
			const tokenCount = await contract.balanceOf.call(
				account,
				id
			);

			assert.equal(tokenCount.toNumber(), count);
		}

		it("buys a token", async () => {
			await contract.buyToken.sendTransaction(
				defaultEvent.id,
				1,
				{ from: charlie, value: utils.gweiToWei(defaultEvent.price) }
			);

			assertTokenCount(charlie, defaultEvent.id, 1);
		});

		it("reverts with insufficient payment", async () => {
			await utils.shouldThrow(
				contract.buyToken.sendTransaction(
					defaultEvent.id,
					defaultEvent.quantity,
					{ from: charlie, value: utils.gweiToWei(defaultEvent.price) }
				)
			);

			assertTokenCount(charlie, defaultEvent.id, 0);
		});

		it("reverts with too much quantity", async () => {
			await contract.buyToken.sendTransaction(
				defaultEvent.id,
				defaultEvent.quantity,
				{ from: alice, value: utils.gweiToWei(defaultEvent.price) * defaultEvent.quantity }
			)
			await utils.shouldThrow(
				contract.buyToken.sendTransaction(
					defaultEvent.id,
					1,
					{ from: charlie, value: utils.gweiToWei(defaultEvent.price) }
				)
			);

			assertTokenCount(charlie, defaultEvent.id, 0);
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
					{ from: charlie, value: utils.gweiToWei(defaultEvent.price) }
				)
			);

			assertTokenCount(charlie, event.id, 0);
		});
	});

	describe("listTokenForResale", () => {
		it("lists a token for resale", async () => {

		});
	});
});

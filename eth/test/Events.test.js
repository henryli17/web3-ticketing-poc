const utils = require("./helpers/utils");
const Events = artifacts.require("Events");
const timeMachine = require('ganache-time-traveler');

contract("Events", (accounts) => {
	const [alice, bob, charlie] = accounts;
	const defaultEvent = utils.defaultEvent();
	let contract;
	let snapshotId;

	beforeEach(async () => {
		const snapshot = await timeMachine.takeSnapshot();
		snapshotId = snapshot['result'];
		contract = await Events.new();
	});

	afterEach(async() => {
		await timeMachine.revertToSnapshot(snapshotId);
	}); 

	it("deploys a contract", () => {
		assert.ok(contract.address);
	});

	describe("createEvent", () => {
		it("creates an event", async () => {
			await utils.createEvent(contract, alice, defaultEvent);

			const event = await contract.events.call(defaultEvent.id);

			assert.equal(event.time.toNumber(), defaultEvent.time);
			assert.equal(BigInt(event.price), BigInt(utils.gweiToWei(defaultEvent.price)));
			assert.equal(event.quantity.toNumber(), defaultEvent.quantity);
			assert.equal(event.supplied.toNumber(), 0);
			assert.equal(!!event.created, true);
			assert.equal(!!event.cancelled, false);
		});

		it("reverts if event already created", async () => {
			await utils.createEvent(contract, alice, defaultEvent);
			await utils.shouldThrow(
				utils.createEvent(contract, alice, defaultEvent)
			);
		});

		it("reverts if time is in the past", async () => {
			await utils.createEvent(contract, alice, { time: defaultEvent.time - 1000 });
		});
	
		it("reverts when not owner", async () => {
			await utils.shouldThrow(
				utils.createEvent(contract, bob)
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
		const updatedEvent = {
			id: defaultEvent.id,
			time: defaultEvent.time + 1,
			quantity: defaultEvent.quantity + 1
		};

		beforeEach(async () => {
			await utils.createEvent(contract, alice);
		});

		it("updates an event", async () => {
			await contract.updateEvent.sendTransaction(
				updatedEvent.id,
				updatedEvent.time,
				updatedEvent.quantity
			);

			const event = await contract.events.call(defaultEvent.id);

			assert.equal(event.time.toNumber(), updatedEvent.time);
			assert.equal(event.quantity.toNumber(), updatedEvent.quantity);
		});

		it("reverts if event not created", async () => {
			await utils.shouldThrow(
				contract.updateEvent.sendTransaction(
					updatedEvent.id + 1,
					updatedEvent.time,
					updatedEvent.quantity
				)	
			);
		});

		it("reverts if event is cancelled", async () => {
			await contract.cancelEvent.sendTransaction(updatedEvent.id, [], []);
			await utils.shouldThrow(
				contract.updateEvent.sendTransaction(
					updatedEvent.id,
					updatedEvent.time,
					updatedEvent.quantity
				)	
			);
		});

		it("reverts if quantity is less than what has already been supplied", async () => {
			const quantity = 2;
			await contract.buyToken.sendTransaction(
				updatedEvent.id,
				quantity,
				{ from: charlie, value: utils.gweiToWei(defaultEvent.price) * quantity }
			);
			await utils.shouldThrow(
				contract.updateEvent.sendTransaction(
					updatedEvent.id + 1,
					updatedEvent.time,
					quantity - 1
				)	
			);
		});

		it("reverts if quantity is 0", async () => {
			await utils.shouldThrow(
				contract.updateEvent.sendTransaction(
					updatedEvent.id + 1,
					updatedEvent.time,
					0
				)	
			);
		});

		it("reverts if time is in the past", async () => {
			await utils.shouldThrow(
				contract.updateEvent.sendTransaction(
					updatedEvent.id + 1,
					updatedEvent.time - 99999,
					0
				)	
			);
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
		};

		it("buys a token", async () => {
			await contract.buyToken.sendTransaction(
				defaultEvent.id,
				1,
				{ from: charlie, value: utils.gweiToWei(defaultEvent.price) }
			);

			assertTokenCount(charlie, defaultEvent.id, 1);
		});

		it("reverts if event does not exist", async () => {
			await utils.shouldThrow(
				contract.buyToken.sendTransaction(
					defaultEvent.id + 1,
					defaultEvent.quantity,
					{ from: charlie, value: utils.gweiToWei(defaultEvent.price) }
				)
			);

			assertTokenCount(charlie, defaultEvent.id, 0);
		});

		it("reverts if event has been cancelled", async () => {
			await contract.cancelEvent.sendTransaction(defaultEvent.id, [], []);
			await utils.shouldThrow(
				contract.buyToken.sendTransaction(
					defaultEvent.id,
					defaultEvent.quantity,
					{ from: charlie, value: utils.gweiToWei(defaultEvent.price) }
				)
			);

			assertTokenCount(charlie, defaultEvent.id, 0);
		});

		it("reverts with insufficient payment", async () => {
			await utils.shouldThrow(
				contract.buyToken.sendTransaction(
					defaultEvent.id,
					2,
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
			const seconds = 100;
			const event = {
				id: defaultEvent.id + 1,
				time: Math.floor(Date.now() / 1000) + seconds
			};

			await utils.createEvent(contract, alice, event);
			await timeMachine.advanceTimeAndBlock(seconds + 1);
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

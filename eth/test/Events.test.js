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

	afterEach(async () => {
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
			assert.equal(BigInt(event.price), defaultEvent.priceInWei());
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
			await utils.shouldThrow(
				utils.createEvent(contract, alice, { time: Math.floor(Date.now() / 1000) - 1 })
			);
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

		it("reverts when not owner", async () => {
			await utils.shouldThrow(
				contract.updateEvent.sendTransaction(
					updatedEvent.id,
					updatedEvent.time,
					updatedEvent.quantity,
					{ from: bob }
				)	
			);
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
				{ from: charlie, value: defaultEvent.priceInWei() * quantity }
			);
			await utils.shouldThrow(
				contract.updateEvent.sendTransaction(
					updatedEvent.id,
					updatedEvent.time,
					quantity - 1
				)	
			);
		});

		it("reverts if quantity is 0", async () => {
			await utils.shouldThrow(
				contract.updateEvent.sendTransaction(
					updatedEvent.id,
					updatedEvent.time,
					0
				)	
			);
		});

		it("reverts if time is in the past", async () => {
			await utils.shouldThrow(
				contract.updateEvent.sendTransaction(
					updatedEvent.id,
					Math.floor(Date.now() / 1000) - 1,
					updatedEvent.quantity
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
				{ from: charlie, value: defaultEvent.priceInWei() }
			);

			assertTokenCount(charlie, defaultEvent.id, 1);
		});

		it("reverts if event does not exist", async () => {
			await utils.shouldThrow(
				contract.buyToken.sendTransaction(
					defaultEvent.id + 1,
					defaultEvent.quantity,
					{ from: charlie, value: defaultEvent.priceInWei() }
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
					{ from: charlie, value: defaultEvent.priceInWei() }
				)
			);

			assertTokenCount(charlie, defaultEvent.id, 0);
		});

		it("reverts with insufficient payment", async () => {
			await utils.shouldThrow(
				contract.buyToken.sendTransaction(
					defaultEvent.id,
					2,
					{ from: charlie, value: defaultEvent.priceInWei() }
				)
			);

			assertTokenCount(charlie, defaultEvent.id, 0);
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
					{ from: charlie, value: defaultEvent.priceInWei() }
				)
			);

			assertTokenCount(charlie, event.id, 0);
		});
	});

	describe("getBalance", () => {
		it("returns correct balance", async () => {
			const gwei = defaultEvent.priceInWei();

			await utils.createEvent(contract, alice, defaultEvent);
			await contract.buyToken.sendTransaction(
				defaultEvent.id,
				1,
				{ from: charlie, value: gwei }
			);
			
			const balance = await contract.getBalance.call();

			assert.equal(BigInt(balance), gwei);
		});

		it("reverts when not owner", async () => {
			await utils.shouldThrow(
				contract.getBalance.call({ from: bob })
			);
		});
	});

	describe("transferBalance", () => {
		it("transfers contract balance", async () => {
			const gwei = defaultEvent.priceInWei();

			await utils.createEvent(contract, alice, defaultEvent);
			await contract.buyToken.sendTransaction(
				defaultEvent.id,
				1,
				{ from: charlie, value: gwei }
			);
			
			const balanceBefore = await contract.getBalance.call();

			assert.equal(BigInt(balanceBefore), gwei);

			await contract.transferBalance.sendTransaction(charlie);

			const balanceAfter = await contract.getBalance.call();

			assert.equal(BigInt(balanceAfter), 0);
		});

		it("reverts when not owner", async () => {
			await utils.shouldThrow(
				contract.transferBalance.sendTransaction(charlie, { from: bob })
			);
		});
	});

	describe("cancelEvent", () => {
		beforeEach(async () => {
			await utils.createEvent(contract, alice);
		});

		const assertEventCancelled = async (id, cancelled) => {
			const event = await contract.events(id);

			assert.equal(!!event.cancelled, cancelled);
		};
		

		it("cancels an event with no token owners", async () => {
			await contract.cancelEvent.sendTransaction(defaultEvent.id, [], []);

			await assertEventCancelled(defaultEvent.id, true);
		});

		it("cancels an event, refunding token owners", async () => {
			const quantity = 2;
			const price = defaultEvent.priceInWei() * quantity;

			await contract.buyToken.sendTransaction(
				defaultEvent.id,
				quantity,
				{ from: charlie, value: price }
			)
			const charlieBalanceBefore = await web3.eth.getBalance(charlie);

			await contract.cancelEvent.sendTransaction(defaultEvent.id, [charlie], [quantity]);

			await assertEventCancelled(defaultEvent.id, true);

			const charlieBalanceAfter = await web3.eth.getBalance(charlie);

			assert.equal(BigInt(charlieBalanceBefore) + BigInt(price), BigInt(charlieBalanceAfter));
		});

		it("reverts when there is insufficient ETH to refund token owners", async () => {
			const quantity = 2;

			await contract.buyToken.sendTransaction(
				defaultEvent.id,
				quantity,
				{ from: charlie, value: defaultEvent.priceInWei() * quantity }
			)
			await contract.transferBalance(charlie);
			await utils.shouldThrow(
				contract.cancelEvent.sendTransaction(defaultEvent.id, [charlie], [quantity])
			);

			await assertEventCancelled(defaultEvent.id, false);
		});

		it("reverts if the event does not exist", async () => {
			await utils.shouldThrow(
				contract.cancelEvent.sendTransaction(defaultEvent.id + 1, [], [])
			);

			await assertEventCancelled(defaultEvent.id, false);
		});

		it("reverts if the event has already been cancelled", async () => {
			await contract.cancelEvent.sendTransaction(defaultEvent.id, [], []);
			await utils.shouldThrow(
				contract.cancelEvent.sendTransaction(defaultEvent.id, [], [])
			);
		});

		it("reverts if `owners` and `quantity` parameters are of different length", async () => {
			await utils.shouldThrow(
				contract.cancelEvent.sendTransaction(defaultEvent.id, [charlie, bob], [1])
			);
			await utils.shouldThrow(
				contract.cancelEvent.sendTransaction(defaultEvent.id, [charlie, bob], [1, 2, 3])
			);

			await assertEventCancelled(defaultEvent.id, false);
		});

		it("reverts when not owner", async () => {
			await utils.shouldThrow(
				contract.cancelEvent.sendTransaction(defaultEvent.id, [], [], { from: bob })
			);
		});
	});

	describe("markTokenAsUsed", () => {
		const quantity = 2;
		const buyer = charlie;

		beforeEach(async () => {
			await utils.createEvent(contract, alice);
			await contract.buyToken.sendTransaction(
				defaultEvent.id,
				quantity,
				{ from: buyer, value: defaultEvent.priceInWei() * quantity }
			)
		});

		it("marks tokens as used", async () => {
			await contract.markTokenAsUsed.sendTransaction(
				charlie,
				defaultEvent.id,
				quantity
			);

			const usedTokens = await contract.getUsedTokens.call(charlie);

			for (const usedToken of usedTokens) {
				assert.equal(usedToken.words[0], defaultEvent.id);
			}
		});

		it("reverts if not owner", async () => {
			await utils.shouldThrow(
				contract.markTokenAsUsed.sendTransaction(
					charlie,
					defaultEvent.id,
					quantity,
					{ from: bob }
				)
			);
		});

		it("reverts if event does not exist", async () => {
			await utils.shouldThrow(
				contract.markTokenAsUsed.sendTransaction(
					charlie,
					defaultEvent.id + 1,
					0
				)
			);
		});

		it("reverts if event has been cancelled", async () => {
			await contract.cancelEvent.sendTransaction(defaultEvent.id, [charlie], [quantity]);
			await utils.shouldThrow(
				contract.markTokenAsUsed.sendTransaction(
					charlie,
					defaultEvent.id,
					quantity
				)
			);
		});

		it("reverts if there are not enough tokens to mark as used", async () => {
			await contract.markTokenAsUsed.sendTransaction(
				charlie,
				defaultEvent.id,
				quantity
			);
			await utils.shouldThrow(
				contract.markTokenAsUsed.sendTransaction(
					charlie,
					defaultEvent.id,
					1
				)
			);
		});
	});

	describe("getUsedCount", () => {
		beforeEach(async () => {
			await utils.createEvent(contract, alice);
		});

		it("gets the correct used count for an address", async () => {
			const buyer = charlie;
			const quantity = 2;
			const usedCountBefore = await contract.getUsedCount.call(buyer, defaultEvent.id);

			assert.equal(usedCountBefore.toNumber(), 0);

			await contract.buyToken.sendTransaction(
				defaultEvent.id,
				quantity,
				{ from: charlie, value: defaultEvent.priceInWei() * quantity }
			);
			await contract.markTokenAsUsed.sendTransaction(charlie, defaultEvent.id, quantity);

			const usedCountAfter = await contract.getUsedCount.call(buyer, defaultEvent.id);

			assert.equal(usedCountAfter.toNumber(), quantity);
		});

		it("gets the correct used count for an address, for a specific event", async () => {
			const buyer = charlie;
			const quantity = 2;
			const secondEventId = defaultEvent.id + 1;

			await utils.createEvent(contract, alice, { id: secondEventId });
			await contract.buyToken.sendTransaction(
				defaultEvent.id,
				quantity,
				{ from: charlie, value: defaultEvent.priceInWei() * quantity }
			);
			await contract.buyToken.sendTransaction(
				secondEventId,
				quantity,
				{ from: charlie, value: defaultEvent.priceInWei() * quantity }
			);
			await contract.markTokenAsUsed.sendTransaction(charlie, defaultEvent.id, quantity);
			await contract.markTokenAsUsed.sendTransaction(charlie, secondEventId, quantity);

			const usedCount = await contract.getUsedCount.call(buyer, defaultEvent.id);

			assert.equal(usedCount.toNumber(), quantity);
		});
	});

	describe("getUsedTokens", async () => {
		it("gets the used tokens for an address", async () => {
			const buyer = charlie;
			const quantity = 2;
			const usedTokensBefore = await contract.getUsedTokens.call(buyer);

			assert.equal(usedTokensBefore.length, 0);

			await utils.createEvent(contract, alice);
			await contract.buyToken.sendTransaction(
				defaultEvent.id,
				quantity,
				{ from: charlie, value: defaultEvent.priceInWei() * quantity }
			);
			await contract.markTokenAsUsed.sendTransaction(charlie, defaultEvent.id, quantity);

			const usedTokensAfter = await contract.getUsedTokens.call(buyer);

			assert.equal(usedTokensAfter.length, quantity);

			for (const usedTokenAfter of usedTokensAfter) {
				assert.equal(usedTokenAfter.words[0], defaultEvent.id);
			}
		});
	});

	describe("listTokenForResale", async () => {
		const buyer = charlie;
		const quantity = 2;

		beforeEach(async () => {
			await utils.createEvent(contract, alice);
			await contract.buyToken.sendTransaction(
				defaultEvent.id,
				quantity,
				{ from: buyer, value: defaultEvent.priceInWei() * quantity }
			); 
		});

		const assertTokenListedForResale = async (eventId, owner, quantity) => {
			const resaleTokens = await contract.getResaleTokens.call(eventId);
			const resaleTokenEntries = await contract.getResaleTokenEntries.call(owner);
			const resaleTokensForOwner = resaleTokens.filter(rt => rt.owner === owner);

			assert.equal(resaleTokenEntries.length, quantity);
			assert.equal(resaleTokensForOwner.length, quantity);
		};

		it("lists a token for resale", async () => {
			await contract.listTokenForResale.sendTransaction(
				defaultEvent.id,
				quantity,
				{ from: buyer }
			);
			await assertTokenListedForResale(defaultEvent.id, buyer, quantity);
		});

		it("succeeds with quantity 0", async () => {
			const quantity = 0;

			await contract.listTokenForResale.sendTransaction(
				defaultEvent.id,
				quantity,
				{ from: buyer }
			);
			await assertTokenListedForResale(defaultEvent.id, buyer, quantity);
		});

		it("reverts if the event does not exist", async () => {
			const falseEventId = defaultEvent.id + 1;
			const quantity = 0;

			await utils.shouldThrow(
				contract.listTokenForResale.sendTransaction(
					falseEventId,
					quantity,
					{ from: buyer }
				)
			);
			await assertTokenListedForResale(falseEventId, buyer, quantity);
		});

		it("reverts if the event has been cancelled", async () => {
			await contract.cancelEvent.sendTransaction(defaultEvent.id, [], []);
			await utils.shouldThrow(
				contract.listTokenForResale.sendTransaction(
					defaultEvent.id,
					quantity,
					{ from: buyer }
				)
			);
			await assertTokenListedForResale(defaultEvent.id, buyer, 0);
		});

		it("reverts if trying to list more than available", async () => {
			await utils.shouldThrow(
				contract.listTokenForResale.sendTransaction(
					defaultEvent.id,
					quantity + 1,
					{ from: buyer }
				)
			);
			await contract.markTokenAsUsed.sendTransaction(buyer, defaultEvent.id, quantity);
			await utils.shouldThrow(
				contract.listTokenForResale.sendTransaction(
					defaultEvent.id,
					quantity,
					{ from: buyer }
				)
			);

			await assertTokenListedForResale(defaultEvent.id, buyer, 0);
		});
	});
});

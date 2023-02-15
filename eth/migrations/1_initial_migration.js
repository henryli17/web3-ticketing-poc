/**
 * To deploy the `EventFactory` to Goerli use:
 * `truffle migrate --network goerli`
 */

const Events = artifacts.require("Events");

module.exports = function(deployer, network, accounts) {
	deployer.deploy(Events, { from: accounts[0] });
};

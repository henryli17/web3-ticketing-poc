const Events = artifacts.require("Events");

module.exports = function(deployer, network, accounts) {
	deployer.deploy(Events, { from: accounts[0] });
};

const Loan = artifacts.require("Loan");

module.exports = function(deployer, network, accounts) {
  deployer.deploy(Loan, 200, 2, accounts[1], {from: accounts[2], value: 1000});
};

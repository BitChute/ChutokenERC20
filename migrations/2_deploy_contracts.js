const Chutoken = artifacts.require("Chutoken");
const ChutokenSale = artifacts.require("ChutokenSale");

module.exports = function(deployer) {
  deployer.deploy(Chutoken, 3141592653).then(function() {
    // Token price is 0.001 Ether
    var tokenPrice = 1000000000000000;
    return deployer.deploy(ChutokenSale, Chutoken.address, tokenPrice);
  });
};

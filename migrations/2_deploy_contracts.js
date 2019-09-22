const Chutoken = artifacts.require("Chutoken");
const ChutokenSale = artifacts.require("ChutokenSale");

module.exports = function(deployer) {
  deployer.deploy(Chutoken).then(function() {
    var tokenPrice = 1000000000000000;
    return deployer.deploy(ChutokenSale, Chutoken.address, tokenPrice);
  });
};

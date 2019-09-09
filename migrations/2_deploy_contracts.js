const Chutoken = artifacts.require("Chutoken");

module.exports = function(deployer) {
  deployer.deploy(Chutoken);
};

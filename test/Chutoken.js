var Chutoken = artifacts.require("Chutoken");

contract('Chutoken', function(accounts) {

	it('sets the total supply upon deployment', function() {
		return Chutoken.deployed().then(function(instance) {
			tokenInstance = instance;
			return tokenInstance.totalSupply();
		}).then(function(totalSupply) {
			assert.equal(totalSupply.toNumber(), 3141592653, 'sets the total supply to pi, 3,141,592,653');
		});
	});

})
var Chutoken = artifacts.require("Chutoken");
var ChutokenSale = artifacts.require("ChutokenSale");

contract('ChutokenSale', function(accounts) {
	var tokenInstance;
	var tokenSaleInstance;
	var admin = accounts[0];
	var buyer = accounts[1];
	var tokenPrice = 1000000000000000; // in wei, change to $
	var tokensAvailable = 1000000;
	var numberOfTokens;

	it('init contract with the correct values',function() {
		return ChutokenSale.deployed().then(function(instance) {
			tokenSaleInstance = instance;
			return tokenSaleInstance.address;
		}).then(function(address) {
			assert.notEqual(address, 0x0, 'has contract address');
			return tokenSaleInstance.tokenContract();
		}).then(function(address) {
			assert.notEqual(address, 0x0, 'has token contract address');
			return tokenSaleInstance.tokenPrice();
		}).then(function(price) {
			assert.equal(price, tokenPrice, 'token price is correct');
			return tokenSaleInstance.tokenPrice(); 
		})
	});

	it('sets the token price with the latest $ value', function() {
    	return Chutoken.deployed().then(function(instance) {
      		// Grab token instance first
      		tokenInstance = instance;
      		return ChutokenSale.deployed();
    	}).then(function(instance) {
    		tokenSaleInstance = instance;
    		tokenSaleInstance.setTokenPrice(2000000000000000);
    		return tokenSaleInstance.tokenPrice();
    	}).then(function(price) {
    		assert.equal(price, 2000000000000000, 'the new price value is correct');
    	});
    });

	it('facilitates token buying', function() {
    	return Chutoken.deployed().then(function(instance) {
      		// Grab token instance first
      		tokenInstance = instance;
      		return ChutokenSale.deployed();
    	}).then(function(instance) {
      		// Then grab token sale instance
      		tokenSaleInstance = instance;
      		// Provision tokens to the token sale
      		return tokenInstance.transfer(tokenSaleInstance.address, tokensAvailable, { from: admin })
    	}).then(function(receipt) {
      		numberOfTokens = 10;
      		return tokenSaleInstance.buyTokens(numberOfTokens, { from: buyer, value: numberOfTokens * tokenPrice })
    	}).then(function(receipt) {
      		assert.equal(receipt.logs.length, 1, 'triggers one event');
      		assert.equal(receipt.logs[0].event, 'Sell', 'should be the "Sell" event');
      		assert.equal(receipt.logs[0].args._buyer, buyer, 'logs the account that purchased the tokens');
      		assert.equal(receipt.logs[0].args._amount, numberOfTokens, 'logs the number of tokens purchased');
      		return tokenSaleInstance.tokensSold();
    	}).then(function(amount) {
      		assert.equal(amount.toNumber(), numberOfTokens, 'increments the number of tokens sold');
      		return tokenInstance.balanceOf(buyer);
    	}).then(function(balance) {
      		assert.equal(balance.toNumber(), numberOfTokens);
      		return tokenInstance.balanceOf(tokenSaleInstance.address);
    	}).then(function(balance) {
      		assert.equal(balance.toNumber(), tokensAvailable - numberOfTokens);
      		// Try to buy tokens different from the ether value
      		return tokenSaleInstance.buyTokens(numberOfTokens, { from: buyer, value: 1 });
    	}).then(assert.fail).catch(function(error) {
      		assert(error.message.indexOf('revert') >= 0, 'msg.value must equal number of tokens in wei');
      		return tokenSaleInstance.buyTokens(100, { from: buyer, value: numberOfTokens * tokenPrice })
    	}).then(assert.fail).catch(function(error) {
      		assert(error.message.indexOf('revert') >= 0, 'cannot purchase more tokens than available');
    	});
  	});

});
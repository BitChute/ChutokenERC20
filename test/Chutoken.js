var Chutoken = artifacts.require("Chutoken");

contract('Chutoken', function(accounts) {
	var tokenInstance;

	it('initalize the contract with the correct values', function() {
		return Chutoken.deployed().then(function(instance) {
			tokenInstance = instance;
			return tokenInstance.name();
		}).then(function(name) {
			assert.equal(name, 'Chutoken', 'has the correct name');
			return tokenInstance.symbol();
		}).then(function(symbol) {
			assert.equal(symbol, 'CHUTE', 'has the correct symbol');
			return tokenInstance.standard();
		}).then(function(standard) {
			assert.equal(standard, 'Chutoken v1.0', 'has the correct standard');
		});
	});

	it('sets the total supply upon deployment', function() {
		return Chutoken.deployed().then(function(instance) {
			tokenInstance = instance;
			return tokenInstance.totalSupply();
		}).then(function(totalSupply) {
			assert.equal(totalSupply.toNumber(), 3141592653, 'sets the total supply to pi, 3,141,592,653.');
			return tokenInstance.balanceOf(accounts[0]);
		}).then(function(adminBalance) {
			assert.equal(adminBalance.toNumber(), 3141592653, 'allocate the initial supply to the admin account.');
		});
	});

	it('transfers token ownership', function() {
		return Chutoken.deployed().then(function(instance) {
			tokenInstance = instance;
			// Test trasfer more than the owners balance
			return tokenInstance.transfer.call(accounts[1], 9999999999);
		}).then(assert.fail).catch(function(error) {
			assert(error.message.indexOf('revert') >= 0, 'error message must contain revert');	
			return tokenInstance.transfer(accounts[1], 1000, { from: accounts[0]});
		}).then(function(receipt) {
			assert.equal(receipt.logs.length, 1, 'triggers one event');
			assert.equal(receipt.logs[0].event, 'Transfer', 'should be the "Transfer" event');
			assert.equal(receipt.logs[0].args._from, accounts[0], 'logs the transfer origin account');
			assert.equal(receipt.logs[0].args._to, accounts[1], 'logs the transfer destination account');
			assert.equal(receipt.logs[0].args._value, 1000, 'logs the transfer amount'); 
			return tokenInstance.balanceOf(accounts[1]);
		}).then(function(balance) {
			assert.equal(balance.toNumber(), 1000, 'adds the amount to the destination address');
			return tokenInstance.balanceOf(accounts[0]);
		}).then(function(balance) {
			assert.equal(balance.toNumber(), 3141591653, 'deducts the amount from the sending account');
		});
	});

	it('approves tokens for delegated transfer', function() {
		return Chutoken.deployed().then(function(instance) {
			tokenInstance = instance;
			return tokenInstance.approve.call(accounts[1], 100);
		}).then(function(success) {
			assert.equal(success, true, 'it returns true');
			return tokenInstance.approve(accounts[1], 100, { from: accounts[0] });		
		}).then(function(receipt) {
			assert.equal(receipt.logs.length, 1, 'triggers one event');
			assert.equal(receipt.logs[0].event, 'Approval', 'should be the "Approval" event');
			assert.equal(receipt.logs[0].args._owner, accounts[0], 'logs the origin authorized account');
			assert.equal(receipt.logs[0].args._spender, accounts[1], 'logs the destination authorized account');
			assert.equal(receipt.logs[0].args._value, 100, 'logs the transfer amount'); 
			return tokenInstance.allowance(accounts[0], accounts[1]);
		}).then(function(allowance) {
			assert.equal(allowance.toNumber(), 100, 'stores the allowance for delegated transfer');
		});
	});

	it('handles delegated token transfers', function() {
    	return Chutoken.deployed().then(function(instance) {
      		tokenInstance = instance;
      		fromAccount = accounts[2];
      		toAccount = accounts[3];
      		spendingAccount = accounts[4];
      		// Transfer some tokens to fromAccount
      		return tokenInstance.transfer(fromAccount, 100, { from: accounts[0] });
    	}).then(function(receipt) {
      		// Approve spendingAccount to spend 10 tokens form fromAccount
      		return tokenInstance.approve(spendingAccount, 10, { from: fromAccount });
    	}).then(function(receipt) {
      		// Try transferring something larger than the sender's balance
      		return tokenInstance.transferFrom(fromAccount, toAccount, 101, { from: spendingAccount });
    	}).then(assert.fail).catch(function(error) {
      		assert(error.message.indexOf('revert') >= 0, 'cannot transfer value larger than balance');
      		// Try transferring something larger than the approved amount
      		return tokenInstance.transferFrom(fromAccount, toAccount, 20, { from: spendingAccount });
    	}).then(assert.fail).catch(function(error) {
      		assert(error.message.indexOf('revert') >= 0, 'cannot transfer value larger than approved amount');
      		return tokenInstance.transferFrom.call(fromAccount, toAccount, 10, { from: spendingAccount });
    	}).then(function(success) {
      		assert.equal(success, true);
      		return tokenInstance.transferFrom(fromAccount, toAccount, 10, { from: spendingAccount });
    	}).then(function(receipt) {
      		assert.equal(receipt.logs.length, 1, 'triggers one event');
      		assert.equal(receipt.logs[0].event, 'Transfer', 'should be the "Transfer" event');
      		assert.equal(receipt.logs[0].args._from, fromAccount, 'logs the account the tokens are transferred from');
      		assert.equal(receipt.logs[0].args._to, toAccount, 'logs the account the tokens are transferred to');
      		assert.equal(receipt.logs[0].args._value, 10, 'logs the transfer amount');
      		return tokenInstance.balanceOf(fromAccount);
    	}).then(function(balance) {
      		assert.equal(balance.toNumber(), 90, 'deducts the amount from the sending account');
      		return tokenInstance.balanceOf(toAccount);
    	}).then(function(balance) {
      		assert.equal(balance.toNumber(), 10, 'adds the amount from the receiving account');
      		return tokenInstance.allowance(fromAccount, spendingAccount);
    	}).then(function(allowance) {
      		assert.equal(allowance.toNumber(), 0, 'deducts the amount from the allowance');
      		return tokenInstance.balanceOf(accounts[0]);
    	}).then(function(balance) {
			assert.equal(balance.toNumber(), 3141591553, 'deducts the amount from the sending account');
		});
  	});

	it('splits transfer of tokens between recipient and platform', function() {
		return Chutoken.deployed().then(function(instance) {
			tokenInstance = instance;
			// Test trasfer more than the owners balance
			return tokenInstance.splitTransfer.call(accounts[1], accounts[2], 9999999999, 999);
		}).then(assert.fail).catch(function(error) {
			assert(error.message.indexOf('revert') >= 0, 'error message must contain revert');	
			return tokenInstance.splitTransfer(accounts[1], accounts[2], 1000, 100);
		}).then(function(receipt) {
			assert.equal(receipt.logs.length, 2, 'triggers two events');
			assert.equal(receipt.logs[0].event, 'Transfer', 'should be the "Transfer" event');
			assert.equal(receipt.logs[0].args._from, accounts[0], 'logs the transfer origin account');
			assert.equal(receipt.logs[0].args._to, accounts[1], 'logs the transfer destination account');
			assert.equal(receipt.logs[0].args._value, 1000, 'logs the transfer amount'); 
			assert.equal(receipt.logs[1].event, 'Transfer', 'should be the "Transfer" event');
			assert.equal(receipt.logs[1].args._from, accounts[0], 'logs the transfer origin account');
			assert.equal(receipt.logs[1].args._to, accounts[2], 'logs the platform destination account');
			assert.equal(receipt.logs[1].args._value, 100, 'logs the platform fee amount');
			return tokenInstance.balanceOf(accounts[1]);
		}).then(function(balance) {
			assert.equal(balance.toNumber(), 2000, 'adds the amount to the destination address');
			return tokenInstance.balanceOf(accounts[0]);
		}).then(function(balance) {
			assert.equal(balance.toNumber(), 3141590453, 'deducts the amount from the sending account');
			return tokenInstance.balanceOf(accounts[2]);
		}).then(function(balance) {
			assert.equal(balance.toNumber(), 190, 'adds the amount to the platform address');
		});
	});

});
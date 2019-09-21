pragma solidity >= 0.5.0 < 0.6.0;

import "./Chutoken.sol";

contract ChutokenSale {
    address payable admin;
    Chutoken public tokenContract;
    uint256 public tokenPrice;
    uint256 public tokensSold;
    uint256 public dollarValue;

    event Sell(address _buyer, uint256 _amount);

    constructor (Chutoken _tokenContract, uint256 _tokenPrice) public {
        admin = msg.sender;
        tokenContract = _tokenContract;
        tokenPrice = _tokenPrice;
    }

    function multiply(uint x, uint y) internal pure returns (uint z) {
        require(y == 0 || (z = x * y) / y == x);
    }

    function buyTokens(uint256 _numberOfTokens) public payable {
    	require(msg.value == multiply(_numberOfTokens, tokenPrice));
    	require(tokenContract.balanceOf(address(this)) >= _numberOfTokens);
    	require(tokenContract.transfer(msg.sender, _numberOfTokens));
    	tokensSold += _numberOfTokens;
    	emit Sell(msg.sender, _numberOfTokens);
    }

    function setTokenPrice(uint256 _value) public {
    	require(msg.sender == admin);
    	tokenPrice = _value;
    } 

    //function endSale() public {
    //    require(msg.sender == admin, "only admin can end the sale");
    //	  require(tokenContract.transfer(admin, tokenContract.balanceOf(address(this))),"failed to transfer balance");
    //    admin.transfer(address(this).balance);
    //    selfdestruct(admin);
    //}
}
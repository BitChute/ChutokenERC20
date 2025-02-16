pragma solidity ^0.5.8;

contract Chutoken {

	string public name = "Chutoken";
	string public symbol = 'CHUTE';
	string public standard = 'Chutoken v1.0';
	uint8 public decimals = 5;
	uint256 public totalSupply;

	event Transfer (
		address indexed _from,
		address indexed _to,
		uint256 _value
	);

	event Approval (
		address indexed _owner,
		address indexed _spender,
		uint256 _value
	);

	mapping (address => uint256) public balanceOf;
	mapping (address => mapping(address => uint256)) public allowance;

	constructor () public {
		totalSupply = 3141592653 * 10**uint(decimals);
		balanceOf[msg.sender] = totalSupply;
	}

	function transfer(address _to, uint256 _value) public returns (bool success) {
		require(balanceOf[msg.sender] >= _value);

		balanceOf[msg.sender] -= _value;
		balanceOf[_to] += _value;

		emit Transfer(msg.sender, _to, _value);

		return true;
	}

	function approve(address _spender, uint256 _value) public returns (bool success) {
		allowance[msg.sender][_spender] = _value;

		emit Approval(msg.sender, _spender, _value);

		return true;
	}
 
	function transferFrom(address _from, address _to, uint256 _value) public returns (bool success) {
		require(_value <= balanceOf[_from]);
		require(_value <= allowance[_from][msg.sender]);

		balanceOf[_from] -= _value;
		balanceOf[_to] += _value;

		allowance[_from][msg.sender] -= _value;
		emit Transfer(_from, _to, _value);

		return true;
	}

	function splitTransfer(address _to, address _platform, uint256 _value, uint256 _fee) public returns (bool success) {
		uint256 _total = _value + _fee;
		require(balanceOf[msg.sender] >= _total);

		balanceOf[msg.sender] -= _total;
		balanceOf[_to] += _value;
		balanceOf[_platform] += _fee;

		emit Transfer(msg.sender, _to, _value);
		emit Transfer(msg.sender, _platform, _fee);

		return true;
	}

}
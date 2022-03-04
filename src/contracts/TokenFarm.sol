pragma solidity ^0.5.0;

import "./DappToken.sol";
import "./DaiToken.sol";

contract TokenFarm {
    string public name = "Dapp Token Farm";
    DappToken public dappToken;
    DaiToken public daiToken;
    address owner;

    address[] public stakers;
    mapping(address => uint) public stakingBalance;
    mapping(address => bool) public hasStacked;
    mapping(address => bool) public isStaking;

    // Runs when contract is deployed
    constructor(DappToken _dappToken, DaiToken _daiToken) public {
        dappToken = _dappToken;
        daiToken = _daiToken;
        owner = msg.sender;
    }

    // Stakes tokens
    function stakeTokens(uint _amount) public {

        // Require staking amount greater than 0
        require(_amount > 0, "Staking amount should be greater than 0");

        // Transfer Mock Dai Token to this contract for staking
        daiToken.transferFrom(msg.sender, address(this), _amount);

        // Update Stacking Balance
        stakingBalance[msg.sender] = stakingBalance[msg.sender] + _amount;

        // Add user to stakers array *only* if it isn't already present
        if(!hasStacked[msg.sender]) {
            stakers.push(msg.sender);
        }

        //Update Stacking Status
        isStaking[msg.sender] = true;
        hasStacked[msg.sender] = true;

    }

    // Unstaking Token
    function unstakeTokens() public {
        // Fetch staking balance
        uint balance = stakingBalance[msg.sender];

        // Require Amount Greater than 0
        require(balance>0, "Staking balance cannot be 0");

        // Transfer moke DAI token to this contract for staking
        daiToken.transfer(msg.sender, balance);

        // Reset staking balance
        stakingBalance[msg.sender] = 0;

        // Update staking Status
        isStaking[msg.sender] = false;
    }

    // Issuing tokens
    function issueTokens() public {
        require( msg.sender == owner, "Caller must be the owner" );

        for(uint i=0; i<stakers.length; i++){
            address recipient = stakers[i];
            uint balance = stakingBalance[recipient];
            if(balance > 0){
                dappToken.transfer(recipient, balance);
            }
        }
    }
}
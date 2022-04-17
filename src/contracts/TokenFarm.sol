pragma solidity ^0.5.0;
pragma experimental ABIEncoderV2;

import "./DappToken.sol";
import "./DaiToken.sol";
import "./EthToken.sol";
import "./BlToken.sol";
import "./OpToken.sol";

contract TokenFarm {
    string public name = "Dapp Token Farm";
    DappToken public dappToken;
    DaiToken public daiToken;
    EthToken public ethToken;
    BlToken public blToken;
    OpToken public opToken;
    address owner;

    string[4] public mockTokens = ["mDAI", "mETH", "mBL", "mOP"];
    mapping(address => mapping(string => uint)) public stakingBalance;
    mapping(string => uint) public supplyApy;
    mapping(string => uint) public borrowApy;
    uint public apyDigits = 100000;
    uint public tokenDigits = 1000000000000000000;

    event Error(string msg);
    event TokenLended(uint reward);
    event TokenRetrieved(bool success, uint retriveAmount);

    // Runs when contract is deployed
    constructor(DappToken _dappToken, DaiToken _daiToken, EthToken _ethToken, BlToken _blToken, OpToken _opToken) public {
        dappToken = _dappToken;
        daiToken = _daiToken;
        ethToken = _ethToken;
        blToken = _blToken;
        opToken = _opToken;
        owner = msg.sender;

        for(uint j=0; j<mockTokens.length; j++){
            supplyApy[mockTokens[j]] = 20000;
            borrowApy[mockTokens[j]] = 30000;
        }
    }

    // Stakes mockTokens
    function stakeTokens(uint _amount, string memory tokenToStake) public returns(uint rewardToken){

        // Require staking amount greater than 0
        require(_amount > 0, "Staking amount should be greater than 0");

        // Transfer Mock Token to this contract for staking
        if(keccak256(abi.encodePacked(tokenToStake)) == keccak256(abi.encodePacked(mockTokens[0]))){
            daiToken.transferFrom(msg.sender, address(this), _amount);
        }
        else if(keccak256(abi.encodePacked(tokenToStake)) == keccak256(abi.encodePacked(mockTokens[1]))){
            ethToken.transferFrom(msg.sender, address(this), _amount);
        }
        else if(keccak256(abi.encodePacked(tokenToStake)) == keccak256(abi.encodePacked(mockTokens[2]))){
            blToken.transferFrom(msg.sender, address(this), _amount);
        }
        else{
            opToken.transferFrom(msg.sender, address(this), _amount);
        }


        // Update Stacking Balance
        stakingBalance[msg.sender][tokenToStake] = stakingBalance[msg.sender][tokenToStake] + _amount;

        // Transfering Reward Dapp Token to Sender Account
        rewardToken = (_amount*apyDigits)/supplyApy[tokenToStake];
        dappToken.transfer(msg.sender, rewardToken);

        // Emmiting reward Amount to use in frontend
        emit TokenLended(rewardToken);
    }

    function dappRequireToUnstake(uint _amount, string memory tokenToUnStake) public returns(uint retrivalAmount){
        return (_amount*apyDigits)/supplyApy[tokenToUnStake];
    }

    // Unstaking Token
    function unstakeTokens(uint _amount, string memory tokenToUnStake) public {

        // Calculating Retrival Dapp Token Amount
        uint retrieveAmount = (_amount*apyDigits)/supplyApy[tokenToUnStake];

        // Checking if user have sufficient dapp Amount
        uint balance = dappToken.balanceOf(msg.sender);
        if(balance < retrieveAmount){
            emit TokenRetrieved(false, retrieveAmount);
            require(balance >= retrieveAmount, "You Don't have sufficient balance.");
        }
        
        // Transfering Retrival Dapp Token from Sender Account to Contract
        dappToken.transferFrom(msg.sender, address(this), retrieveAmount);
        


        // Transfer Mock Token from this contract to Sender Account for Retrival 
        if(keccak256(abi.encodePacked(tokenToUnStake)) == keccak256(abi.encodePacked(mockTokens[0]))){
            daiToken.transfer(msg.sender, _amount);
        }
        else if(keccak256(abi.encodePacked(tokenToUnStake)) == keccak256(abi.encodePacked(mockTokens[1]))){
            ethToken.transfer(msg.sender, _amount);
        }
        else if(keccak256(abi.encodePacked(tokenToUnStake)) == keccak256(abi.encodePacked(mockTokens[2]))){
            blToken.transfer(msg.sender, _amount);
        }
        else{
            opToken.transfer(msg.sender, _amount);
        }

        // Reset staking balance
        stakingBalance[msg.sender][tokenToUnStake] = stakingBalance[msg.sender][tokenToUnStake] - _amount;



        emit TokenRetrieved(true, retrieveAmount);
    }
}
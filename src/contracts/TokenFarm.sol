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
    mapping(string => uint) public marketFund;
    mapping(string => uint) public profit;
    mapping(address => mapping(string => uint)) public borrowBalance;
    mapping(address => mapping(string => uint)) public borrowCollateralBalance;
    mapping(string => uint) public supplyApy;
    mapping(string => uint) public borrowApy;
    uint public apyDigits = 100000;
    uint public tokenDigits = 1000000000000000000;

    event Error(string msg);
    event TokenLended(uint reward);
    event TokenRetrieved(bool success, uint retriveAmount);
    event TokenBorrowed(bool success, uint collateralAmount);
    event TokenRepayed(bool success, uint repaymentAmount);

    event Debug(uint log);

    // Runs when contract is deployed
    constructor(DappToken _dappToken, DaiToken _daiToken, EthToken _ethToken, BlToken _blToken, OpToken _opToken) public {
        dappToken = _dappToken;
        daiToken = _daiToken;
        ethToken = _ethToken;
        blToken = _blToken;
        opToken = _opToken;
        owner = msg.sender;

        for(uint j=0; j<mockTokens.length; j++){
            supplyApy[mockTokens[j]] = 25000;
            borrowApy[mockTokens[j]] = 20000;
            marketFund[mockTokens[j]] = 0;
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

        // Managing Market Fund
        marketFund[tokenToStake] = marketFund[tokenToStake] + _amount;

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

        // Managing Market Fund
        marketFund[tokenToUnStake] = marketFund[tokenToUnStake] - _amount;

        emit TokenRetrieved(true, retrieveAmount);
    }



    function dappRequireToBorrow(uint _amount, string memory tokenToBorrow) public returns(uint retrivalAmount){
        return (_amount*apyDigits)/borrowApy[tokenToBorrow];
    }

    // Borrowing Token
    function borrowTokens(uint _amount, string memory tokenToBorrow) public {
        // Calculating collateral Dapp Token Amount
        uint collateralAmount = (_amount*apyDigits)/borrowApy[tokenToBorrow];

        // Checking if user have sufficient dapp Amount
        uint balance = dappToken.balanceOf(msg.sender);
        if(balance < collateralAmount){
            emit TokenRetrieved(false, collateralAmount);
            require(balance >= collateralAmount, "You Don't have sufficient collateral balance.");
        }
        
        // Transfering collateral Dapp Token from Sender Account to Contract
        dappToken.transferFrom(msg.sender, address(this), collateralAmount);
        


        // Transfer Mock Token from this contract to Sender Account for Retrival 
        if(keccak256(abi.encodePacked(tokenToBorrow)) == keccak256(abi.encodePacked(mockTokens[0]))){
            daiToken.transfer(msg.sender, _amount);
        }
        else if(keccak256(abi.encodePacked(tokenToBorrow)) == keccak256(abi.encodePacked(mockTokens[1]))){
            ethToken.transfer(msg.sender, _amount);
        }
        else if(keccak256(abi.encodePacked(tokenToBorrow)) == keccak256(abi.encodePacked(mockTokens[2]))){
            blToken.transfer(msg.sender, _amount);
        }
        else{
            opToken.transfer(msg.sender, _amount);
        }

        // Updating borrow balance
        borrowBalance[msg.sender][tokenToBorrow] = borrowBalance[msg.sender][tokenToBorrow] + _amount;
        borrowCollateralBalance[msg.sender][tokenToBorrow] = borrowCollateralBalance[msg.sender][tokenToBorrow] + collateralAmount;

        // Managing Market Fund
        marketFund[tokenToBorrow] = marketFund[tokenToBorrow] - _amount;

        emit TokenBorrowed(true, collateralAmount);
    }

    function tokenRequireToRepay(string memory tokenToRepay) public returns(uint retrivalAmount){
        uint _amount = borrowCollateralBalance[msg.sender][tokenToRepay];
        return (_amount*borrowApy[tokenToRepay])/apyDigits;
    }

    // Repay mockTokens
    function repayTokens(string memory tokenToRepay) public returns(uint rewardToken){

        uint _amount = borrowCollateralBalance[msg.sender][tokenToRepay];

        // Calculating mock token to repay to regain collateral
        uint repayMockToken = (_amount*borrowApy[tokenToRepay])/apyDigits;

        // Transfer Mock Token to this contract for repayment
        if(keccak256(abi.encodePacked(tokenToRepay)) == keccak256(abi.encodePacked(mockTokens[0]))){
            daiToken.transferFrom(msg.sender, address(this), repayMockToken);
        }
        else if(keccak256(abi.encodePacked(tokenToRepay)) == keccak256(abi.encodePacked(mockTokens[1]))){
            ethToken.transferFrom(msg.sender, address(this), repayMockToken);
        }
        else if(keccak256(abi.encodePacked(tokenToRepay)) == keccak256(abi.encodePacked(mockTokens[2]))){
            blToken.transferFrom(msg.sender, address(this), repayMockToken);
        }
        else{
            opToken.transferFrom(msg.sender, address(this), repayMockToken);
        }

        uint repaymentAmount = borrowBalance[msg.sender][tokenToRepay];
        
        // Updating borrow balance
        borrowBalance[msg.sender][tokenToRepay] = 0;
        borrowCollateralBalance[msg.sender][tokenToRepay] = 0;

        // Transfering collateral Dapp Token to Sender Account
        dappToken.transfer(msg.sender, _amount);

        // Calculate change APY
        uint profitByRepay = (repaymentAmount - repayMockToken)/2;
        profit[tokenToRepay] = profit[tokenToRepay] + profitByRepay;
        emit Debug(((marketFund[tokenToRepay] + profitByRepay)));
        emit Debug(((marketFund[tokenToRepay] + profitByRepay)*supplyApy[tokenToRepay]));
        emit Debug((apyDigits*marketFund[tokenToRepay]));
        emit Debug((((marketFund[tokenToRepay] + profitByRepay)*supplyApy[tokenToRepay])/(marketFund[tokenToRepay])));
        supplyApy[tokenToRepay] = (((marketFund[tokenToRepay] + profitByRepay)*supplyApy[tokenToRepay])/marketFund[tokenToRepay]) + 1000;
        borrowApy[tokenToRepay] = supplyApy[tokenToRepay] - 5000;

        emit Debug(supplyApy[tokenToRepay]);
        emit Debug(borrowApy[tokenToRepay]);

        // Managing Market Fund
        marketFund[tokenToRepay] = marketFund[tokenToRepay] + repaymentAmount + profitByRepay;

        // Emmiting repayment Amount to use in frontend
        emit TokenRepayed(true, repaymentAmount);
    }
}
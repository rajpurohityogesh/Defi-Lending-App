const TokenFarm = artifacts.require("TokenFarm");
const DappToken = artifacts.require("DappToken");
const DaiToken = artifacts.require("DaiToken");

module.exports = async function(deployer, network, accounts) {
  //Deploy Mock Dai Token
  await deployer.deploy(DaiToken);
  const daiToken = await DaiToken.deployed();

  //Deploy Dapp Token
  await deployer.deploy(DappToken);
  const dappToken = await DappToken.deployed();

  //Deploy TokenFarm
  await deployer.deploy(TokenFarm, dappToken.address, daiToken.address);
  const tokenFarm = await TokenFarm.deployed();

  // Transfer all dapp token to Token Farm
  await dappToken.transfer(tokenFarm.address, "1000000000000000000000000");

  // Transfer 100 mock dai token to investor
  // In Solidity we can't have decimal points and we represent Eth to 18 decimal places
  // So here we have extra 18 decimal 0's after 100.
  // Assuming 2nd address as a investor in ganache accounts
  await daiToken.transfer(accounts[1], "100000000000000000000");
};

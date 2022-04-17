
import DaiToken from "../abis/DaiToken.json";
import EthToken from "../abis/EthToken.json";
import BlToken from "../abis/BlToken.json";
import OpToken from "../abis/OpToken.json";
import DappToken from "../abis/DappToken.json";
import TokenFarm from "../abis/TokenFarm.json";
import Web3 from "web3";

export async function loadBlockChainData(state, manageState){
    const web3 = window.web3;
    let localState = {};

    const account = await web3.eth.getAccounts();
    localState.account = account[0];

    const networkId = await web3.eth.net.getId();

    // Load TokenFarm
    const tokenFarmData = TokenFarm.networks[networkId];
    if (tokenFarmData) {
      const tokenFarm = new web3.eth.Contract(
        TokenFarm.abi,
        tokenFarmData.address
      );
      
      const mockTokens = await Promise.all(
        Array(4)
          .fill()  
          .map((element, index) => {
            return tokenFarm.methods.mockTokens(index).call();
          })
      );
      let stakingBalance = {};
      mockTokens.forEach( async (token) => {
        let data = await tokenFarm.methods
                    .stakingBalance(account[0], token)
                    .call();
        stakingBalance[token] = data.toString();
      })
      

      localState.selectedToken = mockTokens[0];
      localState.mockTokens = mockTokens;
      localState.tokenFarm = tokenFarm;
      localState.stakingBalance = stakingBalance;
    } else {
      window.alert("TokenFarm Contract not deployed to detected network!");
    }

    // Load DappToken
    const dappTokenData = DappToken.networks[networkId];
    if (dappTokenData) {
      const dappToken = new web3.eth.Contract(
        DappToken.abi,
        dappTokenData.address
      );
      let dappTokenBalance = await dappToken.methods
        .balanceOf(account[0])
        .call();
      localState.dappToken = dappToken;
      localState.dappTokenBalance = dappTokenBalance.toString();
    } else {
      window.alert("DappToken Contract not deployed to detected network!");
    }

    // Load Mock Tokens
    localState.mTokens = {};
    localState.mTokensBalance = {};

    localState.mockTokens.forEach(async token => {
      const CurToken = token === "mDAI"
                        ? DaiToken
                        : token === "mETH"
                        ? EthToken
                        : token === "mBL"
                        ? BlToken
                        : OpToken;
      const tokenData = CurToken.networks[networkId];
      if (tokenData) {
        const tokenContract = new web3.eth.Contract(
          CurToken.abi,
          tokenData.address
        );
        let tokenBalance = await tokenContract.methods
          .balanceOf(account[0])
          .call();
        localState.mTokens[token] = tokenContract;
        localState.mTokensBalance[token] = tokenBalance.toString();
      } 
      else {
        window.alert(token + " token Contract not deployed to detected network!");
      }
    })

    localState.loading = false;
    manageState({ ...state, ...localState });
    console.log({...state,...localState});
    console.log(localState.mockTokens);
}

export const loadWeb3 = async () => {
    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum);
      await window.ethereum.enable();
    } else if (window.web3) {
      window.web3 = new Web3(window.web3.currentProvider);
    } else {
      window.alert("Non-Ethereum browser detected you should try MetaMask!");
    }
}

export const stakeTokens = async (state, manageState, amount, token) => {
  manageState({...state, loading: true });
  await state.mTokens[token].methods.approve(state.tokenFarm._address, amount).send({from : state.account});
  let receipt = await state.tokenFarm.methods.stakeTokens(amount, token).send({from : state.account})
  let localState = {
    ...state, 
    loading: false, 
    stakingBalance:{ ...state.stakingBalance, [token]:""+(parseInt(state.stakingBalance[token]) + parseInt(amount))},
    mTokensBalance:{ ...state.mTokensBalance, [token]:""+(parseInt(state.mTokensBalance[token]) - parseInt(amount))},
  };
  let reward = receipt.events.TokenLended.returnValues.reward;
  localState.dappTokenBalance = ""+(parseInt(state.dappTokenBalance) + parseInt(reward));
  console.log("After Staking: ",localState);
  manageState(localState);
}

export const unstakeTokens = async (state, manageState, amount, token) => {
  manageState({...state, loading: true });
  let dappRequireToUnstake = await state.tokenFarm.methods.dappRequireToUnstake(amount, token).call({ from: state.account });
  if(parseInt(dappRequireToUnstake) <= parseInt(state.dappTokenBalance)){
    await state.dappToken.methods.approve(state.tokenFarm._address, dappRequireToUnstake).send({from : state.account});
    let receipt = await state.tokenFarm.methods.unstakeTokens(amount, token).send({ from: state.account });
    let localState = {
      ...state,
      loading: false,
      stakingBalance:{ ...state.stakingBalance, [token]:""+(parseInt(state.stakingBalance[token]) - parseInt(amount))},
      mTokensBalance:{ ...state.mTokensBalance, [token]:""+(parseInt(state.mTokensBalance[token]) + parseInt(amount))},
    };
    let dapp = receipt.events.TokenRetrieved.returnValues.retriveAmount;
    localState.dappTokenBalance = ""+(parseInt(state.dappTokenBalance) - parseInt(dapp));
    console.log("After Retrieving: ",localState);
    manageState(localState);
    return {success:true, dappRequireToUnstake};
  }
  else {
    manageState({...state, loading: false });
    return {success:false, dappRequireToUnstake};
  }
}
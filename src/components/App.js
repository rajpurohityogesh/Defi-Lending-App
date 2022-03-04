import React, { Component } from "react";
import Navbar from "./Navbar";

import DaiToken from "../abis/DaiToken.json";
import DappToken from "../abis/DappToken.json";
import TokenFarm from "../abis/TokenFarm.json";
import "./App.css";
import Web3 from "web3";
import Main from "./Main";

class App extends Component {
  async componentWillMount() {
    await this.loadWeb3();
    await this.loadBlockChainData();
  }

  async loadBlockChainData() {
    const web3 = window.web3;

    const account = await web3.eth.getAccounts();
    this.setState({ account: account[0] });

    const networkId = await web3.eth.net.getId();

    // Load DaiToken
    const daiTokenData = DaiToken.networks[networkId];
    if (daiTokenData) {
      const daiToken = new web3.eth.Contract(
        DaiToken.abi,
        daiTokenData.address
      );
      let daiTokenBalance = await daiToken.methods
        .balanceOf(this.state.account)
        .call();
      this.setState({ daiToken, daiTokenBalance: daiTokenBalance.toString() });
    } else {
      window.alert("DaiToken Contract not deployed to detected network!");
    }

    // Load DappToken
    const dappTokenData = DappToken.networks[networkId];
    if (dappTokenData) {
      const dappToken = new web3.eth.Contract(
        DappToken.abi,
        dappTokenData.address
      );
      let dappTokenBalance = await dappToken.methods
        .balanceOf(this.state.account)
        .call();
      this.setState({
        dappToken,
        dappTokenBalance: dappTokenBalance.toString(),
      });
    } else {
      window.alert("DappToken Contract not deployed to detected network!");
    }

    // Load TokenFarm
    const tokenFarmData = TokenFarm.networks[networkId];
    if (tokenFarmData) {
      const tokenFarm = new web3.eth.Contract(
        TokenFarm.abi,
        tokenFarmData.address
      );
      let stakingBalance = await tokenFarm.methods
        .stakingBalance(this.state.account)
        .call();
      this.setState({
        tokenFarm,
        stakingBalance: stakingBalance.toString(),
      });
    } else {
      window.alert("TokenFarm Contract not deployed to detected network!");
    }

    this.setState({ loading: false });
    console.log(this.state);
  }

  async loadWeb3() {
    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum);
      await window.ethereum.enable();
    } else if (window.web3) {
      window.web3 = new Web3(window.web3.currentProvider);
    } else {
      window.alert("Non-Ethereum browser detected you should try MetaMask!");
    }
  }

  stakeTokens = async amount => {
    this.setState({ loading: true });
    await this.state.daiToken.methods.approve(this.state.tokenFarm._address, amount).send({from : this.state.account});
    await this.state.tokenFarm.methods.stakeTokens(amount).send({from : this.state.account});
    this.setState({ loading: false });
  }

  unstakeTokens = (amount) => {
    this.setState({ loading: true })
    this.state.tokenFarm.methods.unstakeTokens().send({ from: this.state.account }).on('transactionHash', (hash) => {
      this.setState({ loading: false })
    });
  }

  constructor(props) {
    super(props);
    this.state = {
      account: "0x0",
      daiToken: {},
      dappToken: {},
      tokenFarm: {},
      daiTokenBalance: "0",
      dappTokenBalance: "0",
      stakingBalance: "0",
      loading: true,
    };
  }

  render() {
    let content;
    if (this.state.loading)
      content = (
        <p id="loader" className="text-center">
          Loading...
        </p>
      );
    else
      content = (
        <Main
          daiTokenBalance={this.state.daiTokenBalance}
          dappTokenBalance={this.state.dappTokenBalance}
          stakingBalance={this.state.stakingBalance}
          stakeTokens={this.stakeTokens}
          unstakeTokens={this.unstakeTokens}
        />
      );

    return (
      <div>
        <Navbar account={this.state.account} />
        <div className="container-fluid mt-5">
          <div className="row">
            <main
              role="main"
              className="col-lg-12 ml-auto mr-auto"
              style={{ maxWidth: "600px" }}
            >
              <div className="content mr-auto ml-auto">
                <a
                  href="http://www.dappuniversity.com/bootcamp"
                  target="_blank"
                  rel="noopener noreferrer"
                ></a>

                {content}
              </div>
            </main>
          </div>
        </div>
      </div>
    );
  }
}

export default App;

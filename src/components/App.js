import React, { Component } from "react";
import Navbar from "./Navbar";

import {BrowserRouter, Routes, Route} from "react-router-dom";

import "./App.css";
import Main from "./Main";
import { loadWeb3, loadBlockChainData, stakeTokens, unstakeTokens } from "./BlockChainFuncs";

class App extends Component {
  async componentWillMount() {
    await loadWeb3();
    await loadBlockChainData(this.state, this.manageState);
  }

  constructor(props) {
    super(props);
    this.state = {
      account: "0x0",
      mockTokens: [],
      mTokens:{},
      mTokensBalance:{},
      supplyApy: {},
      borrowApy: {},
      dappToken: {},
      dappTokenBalance: "0",
      tokenFarm: {},
      stakingBalance: {},
      selectedToken: "",
      loading: true,
    };
  }

  manageState = (newState) => {
    this.setState(newState);
  }

  render() {
    return (
      <div>
        <BrowserRouter>
          <Navbar account={this.state.account} />
          <div style={{marginTop:"15vh"}} className="container-fluid">
            <div className="row mt-5">
              <main
                role="main"
                className="col-lg-12 ml-auto mr-auto"
                style={{ maxWidth: "600px" }}
              >
                <div className="content mr-auto ml-auto">
                  <Routes>
                    <Route exact path="/" element={
                      <Main
                        state={this.state}
                        manageState={this.manageState}
                        stakeTokens={stakeTokens}
                        unstakeTokens={unstakeTokens}
                      />
                    } />
                  </Routes>
                </div>
              </main>
            </div>
          </div>
        </BrowserRouter>
      </div>
    );
  }
}

export default App;

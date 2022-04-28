import './Coins.css';
import React from "react";


const CoinCard = ({
  state,
  token
}) => {
  return (
      <a>
        <div className={"coin_container"}>

          <div className={"coin_row"}>

              <div className={"coin"}>
                <img src={require("../"+token+".png")} alt={token} className={"coin_img"} />
                <h1 className={"coin_h1"}>{token}</h1>
              </div>

              <div className={"coin_data"}>
                <p className={"coin_price"}>Lended: {state.stakingBalance[token] ?
                            window.web3.utils.fromWei(""+state.stakingBalance[token]) : "0"}</p>
                <p className={"coin_volume"}>Borrowed: {state.borrowBalance[token] ?
                            window.web3.utils.fromWei(""+state.borrowBalance[token]) : "0"}</p>
              </div>
            
              <div className={"coin_data_two"}>
                <p className={"coin_percent green"}>
                    {state.supplyApy[token] && parseFloat(100000/parseInt(state.supplyApy[token])).toFixed(2)} DAPP
                </p>
                
                <p className={"coin_marketcap"}>
                  Market Fund: {parseFloat(state.marketFund[token] ? window.web3.utils.fromWei(""+state.marketFund[token]) : "0").toFixed(2)}
                </p>
                
              </div>

          </div>

        </div>
      </a>
  );
};

export default CoinCard;

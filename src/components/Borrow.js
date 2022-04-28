import React, { useState } from "react";
import Alert from "sweetalert2";
import Swal from "sweetalert2";
import { makeStyles } from '@material-ui/core/styles';
import {FormControl, Select, MenuItem, Backdrop, CircularProgress } from "@material-ui/core";
import { borrowTokens, dappRequireToBorrowFunc, repayBorrowTokens, tokenRequireToRepayFunc } from "./BlockChainFuncs";

const useStyles = makeStyles((theme) => ({
  formControl: {
    margin: "auto ",
    minWidth: 70,
  },
  selectEmpty: {
  },
  tokenInput: {
    borderRadius: "0 0.3rem 0.3rem 0",
    border: "1px solid #ced4da",
    borderLeft: "none",
    padding: "0 10px 0 15px",
    display: "flex",
    alignItems: "center",
    '& img': {
      margin: "0 10px 0 0"
    }
  },
  backdrop: {
    zIndex: theme.zIndex.drawer + 1,
    color: '#fff',
  },
}));

const Borrow = ({state, manageState, stakeTokens, unstakeTokens}) => {  
  const [input, setInput] = useState("");
  const classes = useStyles();
  const digitRgx = /^\d+$/;
  
  return (
    <div id="content" className="mt-3">
      <table className="table table-borderless text-muted text-center">
        <thead>
          <tr>
            <th scope="col">Market Fund</th>
            <th scope="col">Borrowed Amount</th>
            <th scope="col">DAPP Balance</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              {parseFloat(window.web3.utils.fromWei(
                state.marketFund[state.selectedToken]
                ? state.marketFund[state.selectedToken]
                : "0", "Ether")).toFixed(2)}{" "}
              {state.selectedToken}
            </td>
            <td>
              {window.web3.utils.fromWei(
                state.borrowBalance[state.selectedToken]
                ? state.borrowBalance[state.selectedToken]
                : "0", "Ether")}{" "}
              {state.selectedToken}
            </td>
            <td>
              {parseFloat(window.web3.utils.fromWei(
                state.dappTokenBalance,
                "Ether"
              )).toFixed(2)}{" "}
              DAPP
            </td>
          </tr>
        </tbody>
      </table>

      <div className="card mb-4" >
          <div className="card-body">
              <form className="mb-3" onSubmit={async (event) => {
                  event.preventDefault();
                  let amount = input;
                  amount = window.web3.utils.toWei(amount, 'Ether');
                  if(parseInt(amount) === 0){
                    Alert.fire("Error!", "Please Enter Non-Zero Value.", "error");
                  } else if(state.marketFund[state.selectedToken] < parseInt(amount)){
                    Alert.fire("Error!", "Market doesn't have "+ input + " " +state.selectedToken+" to lend.", "error");
                  } else {
                    let dappRequireToBorrow = await dappRequireToBorrowFunc(state, amount, state.selectedToken);
                    Swal.fire({
                      title: 'You have to pay '+parseFloat(window.web3.utils.fromWei(""+dappRequireToBorrow)).toFixed(2)+' Dapp. Do you want to borrow?',
                      showCancelButton: true,
                      confirmButtonText: 'Yes'
                    }).then((result) => {
                      if (result.isConfirmed) {
                        borrowTokens(state, manageState, amount, state.selectedToken)
                          .then(res => {
                            if(res.success){
                              Alert.fire("Congrats!", "You have Borrowed "+input +" "+state.selectedToken+" at "+ 
                                          parseFloat(window.web3.utils.fromWei(""+res.dappRequireToBorrow)).toFixed(2) +" dApp collateral.", "success");
                              setInput("");
                            } else {
                              Alert.fire("Error!", "You don't have "+ parseFloat(window.web3.utils.fromWei(""+res.dappRequireToBorrow)).toFixed(2) 
                                    +" DAPP token to borrow "+ input +" "+state.selectedToken+" .", "error");
                            }
                          });
                      }
                    });
                  }
              }}>
                  <div>
                      <label className="float-left"><b>Borrow Tokens</b></label>
                      <span className="float-right text-muted">
                          Balance: {parseFloat(window.web3.utils.fromWei(
                            state.mTokensBalance[state.selectedToken] 
                            ? state.mTokensBalance[state.selectedToken]
                            : "0", 'Ether')).toFixed(2)}
                      </span>
                  </div>
                  <div className="input-group mb-4">
                      <input
                          type="text"
                          className="form-control form-control-lg"
                          placeholder="0"
                          required 
                          value={input}
                          onKeyPress={(e) => {
                              if (!digitRgx.test(e.key)) {
                                  e.preventDefault();
                              }
                          }}
                          onChange={(e) => setInput(e.target.value)}
                      />
                      <div className={classes.tokenInput}>
                          <FormControl className={classes.formControl}>
                            <Select
                              value={state.selectedToken}
                              onChange={(e) => manageState({...state, selectedToken: e.target.value})}
                              displayEmpty
                              className={classes.selectEmpty}
                              inputProps={{ 'aria-label': 'Without label' }}
                              disableUnderline
                            >
                              {
                                state.mockTokens.map(token => {
                                  return (
                                    <MenuItem value={token}>
                                      <img 
                                        src={require("../"+token+".png")} 
                                        width='32' 
                                        height='32' 
                                        alt=""
                                        style={{marginRight:"10px"}}
                                      />
                                      {token}
                                    </MenuItem>
                                  )
                                })
                              }
                            </Select>
                          </FormControl>
                      </div>
                  </div>
                  <button type="submit" className="btn btn-primary btn-block btn-lg">BORROW!</button>
              </form>
          </div>
      </div>
      <button
        type="submit"
        className="btn btn-primary btn-md"
        style={{display:"block", width:"fit-content",margin:"0 auto", padding:"0.5rem 3rem"}}
        onClick={async (event) => {
            event.preventDefault();
            let borrow = state.borrowBalance[state.selectedToken];
            if(parseInt(borrow) === 0){
              Alert.fire("Error!", "You haven't borrowed any of "+state.selectedToken+" token yet.", "error");
            } else {
              let tokenRequireToRepay = await tokenRequireToRepayFunc(state, state.selectedToken);
              Swal.fire({
                title: 'You have to pay '+parseFloat(window.web3.utils.fromWei(""+tokenRequireToRepay)).toFixed(2)+' '+state.selectedToken
                        +'. Do you want to repay?',
                showCancelButton: true,
                confirmButtonText: 'Yes'
              }).then((result) => {
                if (result.isConfirmed) {
                  repayBorrowTokens(state, manageState, state.selectedToken)
                  .then(res => {
                    if(res.success){
                      Alert.fire("Congrats!", "You have repayed your "+parseFloat(window.web3.utils.fromWei(borrow, 'Ether')).toFixed(2)+" "+state.selectedToken+" loan to us.", "success");
                      setInput("");
                    } else {
                      Alert.fire("Error!", "You don't have sufficient "+state.selectedToken+" to repay us .", "error");
                    }
                  });
                }
              });
            }
        }}
      >
          REPAY...
      </button>
      <Backdrop className={classes.backdrop} open={state.loading}>
        <CircularProgress color="inherit" />
      </Backdrop>
    </div>
  );
}

export default Borrow;
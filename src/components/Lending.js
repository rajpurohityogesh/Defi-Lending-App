import React, { useState } from "react";
import Alert from "sweetalert2";
import { makeStyles } from '@material-ui/core/styles';
import {FormControl, Select, MenuItem, Backdrop, CircularProgress } from "@material-ui/core";

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

const Lending = ({state, manageState, stakeTokens, unstakeTokens}) => {  
  const [input, setInput] = useState("");
  const classes = useStyles();
  const digitRgx = /^\d+$/;
  
  return (
    <div id="content" className="mt-3" style={{maxWidth:"600px"}}>
      <table className="table table-borderless text-muted text-center">
        <thead>
          <tr>
            <th scope="col">Lending Balance</th>
            <th scope="col">DAPP Balance</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              {window.web3.utils.fromWei(
                state.stakingBalance[state.selectedToken]
                ? state.stakingBalance[state.selectedToken]
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
                  event.preventDefault()
                  let amount = input;
                  amount = window.web3.utils.toWei(amount, 'Ether');
                  if(parseInt(amount) === 0){
                    Alert.fire("Error!", "Please Enter Non-Zero Value.", "error");
                  } else if(parseInt(state.mTokensBalance[state.selectedToken]) < parseInt(amount)){
                    Alert.fire("Error!", "You don't have "+input +" "+state.selectedToken+" to Lend.", "error");
                  } else {
                    await stakeTokens(state, manageState, amount, state.selectedToken)
                    Alert.fire("Congrats!", "You have successfully lended "+
                                    window.web3.utils.fromWei(amount, 'Ether')+" "+state.selectedToken+" to Us.", "success");
                    setInput("");
                  }
              }}>
                  <div>
                      <label className="float-left"><b>Lend Tokens</b></label>
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
                          {/* <img 
                            src={require("../"+(state.selectedToken 
                                    ? state.selectedToken
                                    : "mDAI")+".png")} 
                            width='32' 
                            height='32' 
                            alt=""
                          /> */}
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
                  <button type="submit" className="btn btn-primary btn-block btn-lg">LEND!</button>
              </form>
              <button
                type="submit"
                className="btn btn-link btn-block btn-sm"
                onClick={async (event) => {
                    event.preventDefault();
                    let amount = window.web3.utils.toWei((!!input? input: "0"), 'Ether');
                    if(parseInt(amount) === 0){
                      Alert.fire("Error!", "Please Enter Non-Zero Value.", "error");
                    } else if(parseInt(state.stakingBalance[state.selectedToken]) < parseInt(amount)){
                      Alert.fire("Error!", "You don't have "+input +" "+state.selectedToken+" in lending.", "error");
                    } else {
                      unstakeTokens(state, manageState, amount, state.selectedToken)
                      .then(res => {
                        if(res.success){
                          Alert.fire("Congrats!", "You have retrieved your lended "+input +" "+state.selectedToken+" back.", "success");
                          setInput("");
                        } else {
                          Alert.fire("Error!", "You don't have "+ window.web3.utils.fromWei(res.dappRequireToUnstake) 
                                +" DAPP token to retrieve your "+ input +" "+state.selectedToken+" .", "error");
                        }
                      });
                    }
                }}
              >
                  RETRIEVE...
              </button>
          </div>
      </div>
      <Backdrop className={classes.backdrop} open={state.loading}>
        <CircularProgress color="inherit" />
      </Backdrop>
    </div>
  );
}

export default Lending;
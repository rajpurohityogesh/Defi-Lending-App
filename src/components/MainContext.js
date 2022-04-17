import React from 'react';

const defaultVal = {
    account: "0x0",
    daiToken: {},
    dappToken: {},
    tokenFarm: {},
    daiTokenBalance: "0",
    dappTokenBalance: "0",
    stakingBalance: "0",
    loading: true,
  }
export const MainContext = React.createContext(defaultVal);
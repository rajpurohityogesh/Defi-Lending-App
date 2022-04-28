import React from 'react'
import CoinCard from './CoinCard'
import { makeStyles } from '@material-ui/core/styles';
import {Backdrop, CircularProgress } from "@material-ui/core";
import { useNavigate } from 'react-router-dom';

const useStyles = makeStyles((theme) => ({
    container: {
        marginTop: "3rem",
        width: "100%"
    },
    backdrop: {
        zIndex: theme.zIndex.drawer + 1,
        color: '#fff',
    },
}));

const Home = ({state, manageState}) => {
    let classes = useStyles();
    let navigate = useNavigate(); 
    return (
        <div className={classes.container}>
            {
                !state.loading &&
                state.mockTokens.map((token) => {
                    return(
                        <div onClick={() => {manageState({...state, selectedToken: token}); navigate("/lend")}}>
                            <CoinCard 
                                state={state}
                                token={token}
                            />
                        </div>
                    )
                })
            }
            <Backdrop className={classes.backdrop} open={state.loading}>
                <CircularProgress color="inherit" />
            </Backdrop>
        </div>
    )
}

export default Home
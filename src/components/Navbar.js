import React from 'react'
import eth from "../ethLogo.png";
import { Tooltip } from "@material-ui/core";
import { AccountCircle } from "@material-ui/icons";
import { makeStyles } from '@material-ui/core/styles';
import { Link } from 'react-router-dom';


const useStyles = makeStyles((theme => ({
  pageLinks:{
    color: "white",
    margin: "0 10px",
    textTransform: "capitalize",
    textDecoration: "none",
    '&:hover': {
      cursor: "pointer",
      color: "#D3D3D3",
      textDecoration: "none",
    }
  }
})))

const Navbar = (props) => {

  const classes = useStyles();

  return (
    <nav style={{padding:"0 5%"}} className="navbar navbar-dark fixed-top bg-dark flex-md-nowrap py-2 shadow">
      <a
        className="navbar-brand col-sm-3 col-md-2 mr-0"
        href="/"
        target="_blank"
        rel="noopener noreferrer"
      >
        <img src={eth} width="30" height="30" className="d-inline-block align-top" alt="" />
        &nbsp; Defi Lending App
      </a>

      <div style={{display:"flex", alignItems:"center"}}>
        <div ><Link to="/" className={classes.pageLinks} >Lend</Link></div>
        <div ><Link to="/" className={classes.pageLinks} >Borrow</Link></div>
        <ul className="navbar-nav px-3">
          <li className="nav-item text-nowrap d-none d-sm-none d-sm-block">
            <small className="text-secondary">
              <Tooltip title={props.account} aria-label="address">
                <AccountCircle style={{color:"white", cursor: "pointer", fontSize: 32}} />
              </Tooltip>
            </small>
          </li>
        </ul>
      </div>
    </nav>
  );
}

export default Navbar;

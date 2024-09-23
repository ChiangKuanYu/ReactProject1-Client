import React,{useState} from 'react';
import './HomePage.css';
import logo from "../Assets/logo.png";
import { FaHome, FaUser, FaHistory } from "react-icons/fa";
import { IoIosLogOut } from "react-icons/io";
import { useNavigate } from 'react-router-dom';

import MapProg from '../MapProg/MapProg';
import StockProg from '../StockProg/StockProg';

const HomePage = () => {
  const navigate = useNavigate();
  const [pageChange,setPageChange]=useState(<StockProg />);
  async function logOutClick (){
    try {
      await fetch("http://localhost:5000/logout", {
        method: "GET",
        headers: { "Content-Type": "application/json",
        },
      })
      .then((resData) => resData.json())
      .then((resData) => {
        console.log(resData);
        localStorage.removeItem("localJWT");
        navigate('/');
      });
    } catch (err) {
      console.error("err.message");
    }
  };

  function projectClick (e){
    const event = e.target.id;
    if(event === "MapPro"){
      setPageChange(<MapProg />)
    }else if (event === "StockPro"){
      setPageChange(<StockProg />)

    }
  }
  
  return (
    <div className="container2">
      <div className="left-section">
        <div className="logo">
              <img src={logo} alt="Yu logo" />
              <h2>KuanYuProg</h2>
        </div>
        <div className="sidebar">
          <div className="item">
            <FaUser />
            <h3>Resume</h3>
          </div>
          <div className="item">
            <FaHome />
            <h3 onClick={projectClick} id="MapPro">Map Project</h3>
          </div>
          <div className="item">
            <FaHistory />
            <h3 onClick={projectClick} id="StockPro">Stock Project</h3>
          </div>
        </div>
        <div className="sign-out">
          <IoIosLogOut />
          <h3 onClick={logOutClick}>Sign Out</h3>
        </div>
      </div>
      <div className="main" id="main">
        {pageChange}
        {/* <StockProg /> */}
        {/* <MapProg /> */}


 
      </div>
    </div>
  )
}

export default HomePage
import React, { useState } from 'react'

import CandlestickChart from './CandlestickChart';
import SearchBar from './SearchBar'; 
import StockAna from './StockAna';

import './StockProg.css';


function StockProg() {

  const rmeEmail = localStorage.getItem("rememberEmail");
  
  const [stockID,setStockID] = useState('2330')
  return (
    <div className="reactStock" id="reactStock">
        <div className="svgCandle">
            <SearchBar searchID={setStockID}/>
            <CandlestickChart stockID={stockID}/>
            {/* <StockList /> */}
        </div>
        <div className="SP-right-section">
            <StockAna searchID={setStockID}/>
        </div>
    </div>
  )
}

export default StockProg;
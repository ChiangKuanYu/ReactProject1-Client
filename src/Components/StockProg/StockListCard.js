import React from 'react'

function StockListCard(props) {
  function onClick2 (event){
    const value = event.target.getAttribute('value');
    console.log('t66',value);
    props.searchID(value);
}

  return (
    <>
        <tr onClick={onClick2} value={props.stockID}>
          <th className='stockId' value={props.stockID}>{props.stockID}</th>
          <th className='stockName' value={props.stockID}>{props.stockName}</th>
          <th className='stockHold' value={props.stockID}>{props.stockHold}</th>
          <th className='hodePrice' value={props.stockID}>{props.holdPrice}</th>
          <th className='stockPrice' value={props.stockID}>{props.stockPrice}</th>
          <th className='stockPL'style={(parseInt(props.stockPL)<0)? {color:"green"}:{color:"red"}} value={props.stockID}>{props.stockPL}</th>
          <th className='stockPLRatio' style={((props.stockPLRatio*100).toFixed(2)<0)? {color:"green"}:{color:"red"}} value={props.stockID}>{(props.stockPLRatio*100).toFixed(2)} %</th>
        </tr>
    </>
  )
}

export default StockListCard
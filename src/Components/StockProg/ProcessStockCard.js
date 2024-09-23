import React from 'react'

function ProcessStockCard(props) {
  return (
    <>
        <div className='item'>
            <label className='leftside'>{props.ID}</label>
            <label className='middle'>{props.Name}</label>
            <label className='rightside'>{props.HoldP} %</label>
        </div>
    </>
  )
}

export default ProcessStockCard
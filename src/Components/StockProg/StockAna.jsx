import React, {useState, useEffect}  from 'react'
import { useNavigate } from 'react-router-dom';
import AllList from '../Assets/stock_List.json';
import Chart from "chart.js/auto"; //只要有用chart.js畫圖就不能刪
import { Doughnut } from "react-chartjs-2";
import ProcessStockCard from './ProcessStockCard.js';
import StockListCard from './StockListCard.js';

import './StockAna.css';

function StockAna(props) {
  const navigate = useNavigate();
  const [stockInfo,setStockInfo]=useState(null);
  const [newStock,setNewStock]=useState(null);
  const [newDate,setNewDate]=useState(''); //neDate最新股價更新時間
  const [istableData,setTableData]=useState(null);
  const [isAuth,setAuth]=useState(true);
  const [costInfo,setCostInfo]=useState({Ttax:0.003,fee:0.001425,discount:0.35}); //setCostInfo 預計用於讓使用者自訂手續費折數
  const options = {plugins: {legend: {display: false},},};
  const [totalValue,setTotalValue]=useState({Cost:0, MValue:0, PL:0});
  const [chartData,setChartData]=useState(null);

  const [isSearchID, setSearchID] = useState('');
  const [isSearchName, setSearchName] = useState('');
  const [isChangeAmount, setChangeAmount] = useState('');
  const [isChangePrice, setChangePrice] = useState('');
  const [listSuggest,setListSuggest] = useState(null);
  const [position,setPosition] = useState({eleWidth:0,eleTop:0});
  
  // ChartDoughnutjs
  useEffect(()=>{
    if(istableData){
        const stockSum = istableData.reduce((total, currentObj) => { 
          return { 
              Cost: total.Cost + currentObj.Cost ,
              MValue: total.MValue + currentObj.MValue ,
              PL: total.PL + currentObj.PL ,
        }}, {Cost:0, MValue:0, PL:0});
        setTotalValue({
          Cost:stockSum.Cost,
          MValue:stockSum.MValue,
          PL:stockSum.PL
        });
        if (stockSum.PL < 0){
            setChartData({
                labels:['資產現值','損失' ],
                datasets:[{label:'金額',data:[stockSum.MValue, stockSum.PL],backgroundColor: ['rgb(100, 150, 255)','rgb(150, 255, 100)'],
                hoverOffset: 4,
            }]})
        } else if (stockSum.PL > 0) {
            setChartData({
                labels:['資產成本','收益' ],
                datasets:[{label:'金額',data:[stockSum.Cost, stockSum.PL],backgroundColor: ['rgb(54, 162, 235)','rgb(255, 100, 150)'],
                hoverOffset: 4,
            }]})
        }
    }
  },[istableData])
  // stockListjs
    // 證交所下載最新台股資料(每日下午5:00更新)
    const newStockPrice = async () => {
        const res = await fetch('https://www.twse.com.tw/exchangeReport/STOCK_DAY_AVG_ALL?response=json&date=202408');
        const jsonData = await res.json();
        const outPutdata =  (jsonData.data).map((data)=>{
            const r = {
                ID:data[0],
                Name:data[1],
                price:data[2]
            }
            return r
        })
        setNewStock(outPutdata)
        setNewDate(jsonData.title)
    };
    useEffect(()=>{
        newStockPrice()
    },[])

    const userToken = localStorage.getItem("localJWT")
    
    useEffect(()=>{
      
        const checkAuth = async()=>{
          try {
            await fetch("http://localhost:5000", {
              method: "GET",
              headers: { "Content-Type": "application/json",
                "Authorization":`Bearer ${userToken}`
              },
            })
            .then((resData) => resData.json())
            .then((resData) => {
              if (resData) {
                navigate('/home');
              } else if ('Login timeout' === resData.message) {
                localStorage.removeItem("localJWT");
                navigate('/');
              }
            });
          } catch (err) {
            localStorage.removeItem("localJWT");
            console.error('Login timeout');
            navigate('/');
          }
        }
        
        if (userToken){
          checkAuth()
        }
      
    },[userToken,navigate])
    
    
    const checkStockList = async(e)=>{
        try {
          await fetch("http://localhost:5000/stock_list", {
            method: "GET",
            headers: { "Content-Type": "application/json",
                       "Authorization":`Bearer ${e}`
            },
          })
          .then((resData) => resData.json())
          .then((resData) => {
            setStockInfo(resData)
          });
        } catch (err) {
          setAuth(false)
          console.error('Login Overtime or cant download data from Database!');
        }
      }

    useEffect(()=>{
        checkStockList(userToken)
        navigate(isAuth?'':'/')
    },[navigate,isAuth,userToken])

    function tableData (list,CInfo,SInfo,nowprice) {
        
        const outPutData = SInfo.map((info)=>{
            const cost = Math.ceil((info.stock_hold*info.stock_cost)*(1+(CInfo.fee*CInfo.discount)))
            const price = Math.floor(((nowprice.filter((data)=>data.ID===info.stock_id))[0].price*info.stock_hold)*(1-(CInfo.Ttax+CInfo.fee*CInfo.discount)))
            const r = {
                ID:info.stock_id,
                Name:list.filter((listdata) => listdata.Code === info.stock_id)[0].Name,
                Hold:info.stock_hold,
                HoldPrice:info.stock_cost,
                Cost:cost,
                NowPrice:(nowprice.filter((data)=>data.ID===info.stock_id))[0].price,
                MValue:price,
                PL:(price-cost),
                PLR:((price-cost)/cost).toFixed(4),
            }
            return r
        })
        setTableData(outPutData)
    }
    useEffect(()=>{
        if (stockInfo && newStock){
            tableData(AllList,costInfo,stockInfo,newStock)
        }
       
    },[costInfo,stockInfo,newStock])

  // 持股更新


    function handleChange (event){
      setListSuggest(null);
      const searchValue = event.target.value;
      const searchID = event.target.id;
      if (searchValue !== ''){
        if(searchID === "holdchange-ID"){
          setSearchName('')
          const filterCode = AllList.filter( (listdata) => listdata.Code.includes(searchValue));
          const filterCodeLength = Object.getOwnPropertyNames(filterCode).length;
          if (filterCodeLength !== 0){
            setListSuggest(Object.entries(filterCode).slice(0,5).map(entry => entry[1]));
          }
          setSearchID(searchValue)
          const ele = document.getElementById( 'holdchange-ID' );
          const rect = ele.getBoundingClientRect();
          setPosition({
              eleWidth:rect.left,
              eleTop:window.innerHeight-rect.top+10
          })
          
        }else if (searchID === "holdchange-Name"){
          setSearchID('')
          const filterName = AllList.filter( (listdata) => listdata.Name.includes(searchValue));
          const filterNameLength = Object.getOwnPropertyNames(filterName).length;
          if (filterNameLength !== 0){
            setListSuggest(Object.entries(filterName).slice(0,5).map(entry => entry[1]));
          }
          setSearchName(searchValue)
          const ele = document.getElementById( 'holdchange-Name' );
          const rect = ele.getBoundingClientRect();
          setPosition({
              eleWidth:rect.left,
              eleTop:window.innerHeight-rect.top+10
          })
        }else if (searchID === "holdchange-amount"){
          setChangeAmount(searchValue)
        }else if (searchID === "holdchange-price"){
          setChangePrice(searchValue)
        }
      } else {
        if (searchID === "holdchange-ID" || searchID === "holdchange-Name"){
        setSearchID('');
        setSearchName('');
        }else if (searchID === "holdchange-amount" ){
          setChangeAmount('');
        }else if (searchID === "holdchange-price"){
          setChangePrice('');
        }
      }
    }
    
    function onClick (event){
      const value = event.target.getAttribute('value');
      const name = event.target.getAttribute('name');
      props.searchID(value);
      setSearchID(value);
      setSearchName(name)
      setListSuggest(null);
    }
    
    const clickBuy = async () => {
      const reqData={
        stockID:isSearchID,
        name:isSearchName,
        amount:isChangeAmount,
        price:isChangePrice
      }
      try {
        await fetch("http://localhost:5000/buyin", {
          method: "post",
          headers: { "Content-Type": "application/json",
            "Authorization":`Bearer ${userToken}`
          },
          body: JSON.stringify(reqData)
        })
        .then((resData) => resData.json())
        .then((resData) => {
          if(resData.message==='UpDate Success!'){
            window.alert('股票更新成功');
          }else if(resData.message==='Stock Add Success!') {
            window.alert('新增股票成功');
          }
        });
      } catch (err) {
        console.error('Login timeout');
        navigate('/');
      }
      checkStockList(userToken);
      setSearchID('');
      setSearchName('');
      setChangeAmount('');
      setChangePrice('');
    }

    const clickSell = async () => {
      const reqData={
        stockID:isSearchID,
        name:isSearchName,
        amount:isChangeAmount,
        price:isChangePrice
      }
      try {
        await fetch("http://localhost:5000/sell", {
          method: "post",
          headers: { "Content-Type": "application/json",
            "Authorization":`Bearer ${userToken}`
          },
          body: JSON.stringify(reqData)
        })
        .then((resData) => resData.json())
        .then((resData) => {
          if(resData.message==='UpDate Success!'){
            window.alert('股票更新成功');
          }else if(resData.message==='Insufficient stock!') {
            window.alert('股票庫存不足');
          }else if (resData.message==='Non-held stocks!'){
            window.alert('未持有該股票');
          }
        });
      } catch (err) {
        console.error('Login timeout');
        navigate('/');
      }
      checkStockList(userToken);
      setSearchID('');
      setSearchName('');
      setChangeAmount('');
      setChangePrice('');
    }
    
  return (
    <>
        <div className="progress">
          <div className="progress-box">
            <div className="progess-header">
              <h1 className="separator">資產損益</h1>
              <hr/>
            </div>
            <div className="infobox">
              {chartData && (
                <div className="doughnut">
                  <div className="doughnut-chart">
                    <label className='DC-1' style={(totalValue.PL>0)?{'color':'red'}:{'color':'green'}}>{((totalValue.PL/totalValue.Cost)*100).toFixed(2)}%</label>
                    <Doughnut className="test-char" data={chartData} options={options}/>
                    <label className='DC-2'>總損益</label>
                  </div> 
                  <div className="doughnut-list">
                    <div className="left-side">
                      <label>{(totalValue.PL>0)?'獲 利 : ':'損 益 : '}</label>
                    </div>
                    <div className="right-side">
                      <label>{String(totalValue.PL).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</label>
                    </div>
                  </div>
                </div>
              )}
              <div className="holdStockP">
                <h3>總資產</h3>
                <hr />
                <div className="total-box">
                  <div className="left-side">
                        <label>成 本 : </label>
                        <label>現 值 : </label>
                  </div>
                  <div className="right-side">
                        <label>{String(totalValue.Cost).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</label>
                        <label>{String(totalValue.MValue).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</label>
                  </div>
                </div>
                <h3>持股比例</h3>
                <hr />
                <div className="stockpercent">
                {istableData && (istableData.map((data,index)=>
                  <ProcessStockCard 
                    key={`list-${index}`}
                    ID={data.ID}
                    Name={data.Name}
                    HoldP={((data.Cost/totalValue.Cost)*100).toFixed(2)}
                  />
                ))}
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="stockList">
          <div className="stockList-box">
            <div className="stockList-header">
              <h1 className="separator">持股明細</h1>
              <hr/>
            </div>
            <div className="stcokTable">
                <table border-style="none">
                    <thead>
                        <tr>
                            <th className='stockId'>代碼</th>
                            <th className='stockName'>商品</th>
                            <th className='stockHold'>持有股數</th>
                            <th className='hodePrice'>平均單價</th>
                            <th className='stockPrice'>現價</th>
                            <th className='stockPL'>參考損益</th>
                            <th className='stockPLRatio'>損益率%</th>
                        </tr>
                    </thead>
                    <tbody>
                      {istableData && (
                          istableData.map((data,index)=>
                              <StockListCard 
                                  searchID={props.searchID}
                                  key={`list-${index}`}
                                  stockID={data.ID}
                                  stockName={data.Name}
                                  stockHold={String(data.Hold).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                                  holdPrice={String(data.HoldPrice).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                                  stockPrice={String(data.NowPrice).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                                  stockPL={String(data.PL).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                                  stockPLRatio={data.PLR}
                              />
                          )
                      )}
                    </tbody>
                </table>
            </div>
            <hr />
            <div className="stockholdchange" id='holdchange-searchID'>
              <label className='holdchange-label1'>持股更新</label>
              <input onChange={handleChange} className="holdchange-ID" id='holdchange-ID' type="text" placeholder='輸入代碼' value={isSearchID}/>
              <input onChange={handleChange} className="holdchange-Name" id='holdchange-Name' type="text" placeholder='股票名稱' value={isSearchName}/>
              <input onChange={handleChange} className="holdchange-amount" id='holdchange-amount' type="number" placeholder='輸入' value={isChangeAmount} />
              <input onChange={handleChange} className="holdchange-price" id='holdchange-price' type="number" placeholder='價格' value={isChangePrice}/>
              <button className='stock-buy' onClick={clickBuy}>買進</button>
              <button className='stock-sell' onClick={clickSell}>賣出</button>

              <div className="holdchange-list" style={{left:position.eleWidth,bottom:position.eleTop}}>
                {listSuggest && (            
                    (listSuggest.map((event,index) => (
                    <label className='hl-label' key={index} onClick={onClick} value={event.Code} name={event.Name}>{event.Code}  {event.Name}</label>
                    )))
                )}
                {/* {!listSuggest && ((isSearchID !== '' || isSearchName !== '')?            
                    <label className='hl-label'>很抱歉，沒有相關到相關個股!</label>:null
                )} */}
                  
              </div>
            </div>
          </div>
        </div>
    </>
  )
}

export default StockAna;
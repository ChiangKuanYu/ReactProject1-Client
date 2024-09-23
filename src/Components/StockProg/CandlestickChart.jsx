import React, { useEffect, useState } from 'react';
import * as d3 from 'd3';
import * as d3Collection from 'd3-collection';
import './CandlestickChart.css';
import StockList from '../Assets/stock_List.json';

const TOKEN = process.env.REACT_APP_FINMIND;

const CandlestickChart = (props) => {
    var t = 0;
    const TFormat      = {"day":"%d %b '%y", "week":"%d %b '%y", "month":"%b '%y" };
    const index = d3.local(); 
    const Today = new Date()
    const startTime = (Today.getFullYear()-6)+'-'+addZero(Today.getMonth()+1)+'-'+addZero(Today.getDate());
    const endTime = Today.getFullYear()+'-'+addZero(Today.getMonth()+1)+'-'+addZero(Today.getDate());
    const [rawData,setRawData]=useState(null);
    const [tIntervals,settIntervals]=useState('day')
    const [TPeriod,setTPeriod]=useState("日");
    const [genData,setGenData]=useState(null);
    const [stockID,setStockID] = useState('0050')
    const [isWHValue,setWHValue]=useState({
        eleWidth:0,
        eleHeight:0
    });

    const [isUrl, setUrl] = useState(
        `https://api.finmindtrade.com/api/v4/data?dataset=TaiwanStockPrice&data_id=${stockID}&start_date=${startTime}&end_date=${endTime}&tok=${TOKEN}`
    )
    
    function addZero (event) {
        if (event<10){
            return ('0'+event)
        }else{
            return event
        }
    }
   
    if (stockID !== props.stockID){
        setStockID(props.stockID)
        setUrl(`https://api.finmindtrade.com/api/v4/data?dataset=TaiwanStockPrice&data_id=${props.stockID}&start_date=${startTime}&end_date=${endTime}&tok=${TOKEN}`)
    }

    const fetchStock = async (event) => {
        const parseDate = d3.timeParse("%Y-%m-%d")
        const res = await fetch(event);
        const jsonData = await res.json();
        const raw = (jsonData.data).map((info)=>{
            const r ={
                date : parseDate(info.date),
                min : info.min,
                max : info.max, 
                open : info.open,
                close : info.close,
                Trading_turnover : info.Trading_turnover,
                Trading_Volume : info.Trading_Volume,
            }
            return r;
        });
        setRawData(raw);
        const outputData = raw.slice(-60);
        setGenData(outputData);
        setTPeriod("日")
    };
    
    useEffect(()=>{
        fetchStock(isUrl)
    },[isUrl]);

    
    const sleep = (delay) => new Promise((resolve) => setTimeout(resolve, delay))

    const repeatedGreetings = async () => {
        window.removeEventListener('resize', repeatedGreetings);
        await sleep(100)
        setWH()
        t=0
        console.log('window change1');
    }

    if (t===0){
        window.addEventListener('resize', repeatedGreetings);
        t=1;
    }
    useEffect(()=>{
        console.log('window change3');
        setWH();
    },[]);

    function setWH (){
        console.log('window change2');
        
        var ele = document.getElementById( 'csbox' );
        var ele3 =  document.getElementById( 'infobar' );
        const rect = ele.getBoundingClientRect();
        const rect3 = ele3.getBoundingClientRect();
        setWHValue({
            eleWidth:rect.right-rect.left,
            eleHeight:(rect.bottom-rect3.bottom-40)
        })
    }
    
    
    function handleClick (event){
        const days       = {"日":60, "週":300, "月":1500 };
        const intervals   = {"日":"day", "週":"week", "月":"month" };
        const dataPeriod = event.target.value;
        const dataSlice = rawData.slice(-days[dataPeriod])
        console.log(dataPeriod);
        
        // settDays(dsays[dataPeriod]);
        settIntervals(intervals[dataPeriod]);
        setTPeriod(dataPeriod)
        setGenData(
            (intervals[dataPeriod]!=="day")? dataCompress(dataSlice, intervals[dataPeriod]): dataSlice);
            console.log(((intervals[dataPeriod]!=="day")? dataCompress(dataSlice, intervals[dataPeriod]): dataSlice));
        changeClass(dataPeriod);
        displayCS();
        displayGen(genData.length-1);
    }
    
    
    if (rawData){
        changeClass(TPeriod);
        displayCS();
        displayGen(genData.length-1);
    }
  
    // 處理interval非day的資料
    function dataCompress(data, interval) {
        function timeCompare(date, interval) {
            let durfn;
            if (interval === "week")       { durfn = d3.timeMonday(date); }
            else if (interval === "month") { durfn = d3.timeMonth.floor(date); }
            else { durfn = d3.timeDay.floor(date); } 
            return durfn;
        }
        var compressedData  = d3Collection.nest()
                 .key(function(d) {return timeCompare(d.date, interval); })
                 .rollup(function(v) {
                 return {
                         date:   timeCompare(Object.values(v).pop().date, interval),
                         open:        Object.values(v).shift().open,
                         min:         d3.min(v, function(d) { return d.min;  }),
                         max:        d3.max(v, function(d) { return d.max; }),
                         close:       Object.values(v).pop().close,
                         Trading_turnover:    d3.mean(v, function(d) { return d.Trading_turnover; }),
                         Trading_Volume:  d3.sum(v, function(d) { return d.Trading_Volume; })
                        }; })
                 .entries(data).map(function(d) { return d.value; });
        return compressedData;
    }
    
    function changeClass(event) {
        if (event ==="日") {
            d3.select("#oneD").classed("active", true);
            d3.select("#oneW").classed("active", false);
            d3.select("#oneM").classed("active", false);
        } else if (event ==="週") {
            d3.select("#oneD").classed("active", false);
            d3.select("#oneW").classed("active", true);
            d3.select("#oneM").classed("active", false);
        } else if (event ==="月") {
            d3.select("#oneD").classed("active", false);
            d3.select("#oneW").classed("active", false);
            d3.select("#oneM").classed("active", true);
        }
    }

    function displayCS() {
        var chart       = cschart().Bheight(isWHValue.eleHeight);
        d3.select("#chart1").call(chart);
        var chart2       = barchart().mname("volume").margin((isWHValue.eleHeight)*0.78).MValue("Trading_turnover");
        d3.select("#chart1").datum(genData).call(chart2);
        // var chart3       = barchart().mname("sigma").margin(400).MValue("Trading_Volume");
        // d3.select("#chart1").datum(genData).call(chart3);
        hoverAll();
    }

    // 將data導入header中，mark為滑鼠目前指到的資料index
    function displayGen(mark) {
        var header      = csheader();
        d3.select("#infobar").datum(genData.slice(mark)[0]).call(header);
    }

    function csheader() {
        function cshrender(selection) {     
          selection.each(function(data) {
            var interval   = tIntervals;
            var format     = (interval==="month")?d3.timeFormat("%Y-%m-%d"):d3.timeFormat("%Y-%m-%d");
            var dateprefix = (interval==="month")?"Month of ":(interval==="week")?"Week of ":"";
            console.log('t11',stockID);
            console.log('t12',(StockList.filter((data)=>data.Code===stockID))[0].Name);
            
            // 寫入資料
            d3.select("#infoid").text(stockID);
            d3.select("#infoname").text((StockList.filter((data)=>data.Code===stockID))[0].Name);
            d3.select("#infodate").text(dateprefix + format(data.date));
            d3.select("#infoopen").text(" 開 " + data.open);
            d3.select("#infomax").text(" 高 " + data.max);
            d3.select("#infomin").text(" 低 " + data.min);
            d3.select("#infoclose").text(" 收 " + data.close);
            d3.select("#infovolume").text(" 量 " + data.Trading_Volume + "股");
          });
        } // cshrender
        return cshrender;
    } // csheader

    // 滑鼠移動動畫+header資料變化
    function hoverAll() {
        d3.select("#chart1").select(".bands").selectAll("rect")
            .each(function(d, i) {
                index.set(this, i);            // Store index in local variable.
            })
            .on("mouseover", function(d, i) {
                const hoverIndex = index.get(this)
                d3.select(this).classed("hoved", true);
                d3.select(".stick"+hoverIndex).classed("hoved", true);
                d3.select(".candle"+hoverIndex).classed("hoved", true);
                d3.select(".volume"+hoverIndex).classed("hoved", true);
                d3.select(".sigma"+hoverIndex).classed("hoved", true);
                displayGen(hoverIndex);
            })                  
            .on("mouseout", function(d, i) {
                const hoverIndex = index.get(this)
                d3.select(this).classed("hoved", false);
                d3.select(".stick"+hoverIndex).classed("hoved", false);
                d3.select(".candle"+hoverIndex).classed("hoved", false);
                d3.select(".volume"+hoverIndex).classed("hoved", false);
                d3.select(".sigma"+hoverIndex).classed("hoved", false);
                displayGen(genData.length-1);
            });
    }

    function cschart() {

        var margin = {top: 5, right: 30, bottom: 0, left: 5},
            width = (isWHValue.eleWidth)*0.9, height =(isWHValue.eleHeight)*0.75, Bheight = (isWHValue.eleHeight)*0.75;
    
        function csrender(selection) {
          selection.each(function() {
         
            var interval = tIntervals;
    
            var minimal  = d3.min(genData, function(d) { return d.min; });
            var maximal  = d3.max(genData, function(d) { return d.max; });
    
            // var extRight = width + margin.right
            var x = d3.scaleBand()
                .range([0, width]);
            
            var y = d3.scaleLinear()
                .range([height, 0]);
            
            var xAxis = d3.axisBottom(x)
                .tickFormat(d3.timeFormat(TFormat[interval]));
            
            var xAxis2 = d3.axisTop(x)
                .tickFormat(d3.timeFormat(TFormat[interval]));
            
            var yAxis = d3.axisRight(y)
                .ticks(Math.floor(height/50));

            var yAxis2 = d3.axisLeft(y)
                .ticks(Math.floor(height/50));

            x.domain(genData.map(function(d) { return d.date; }));
            y.domain([minimal, maximal]).nice();
        
            var xtickdelta   = Math.ceil(60/(width/genData.length))
            xAxis.tickValues(x.domain().filter(function(d, i) { return !((i+Math.floor(xtickdelta/2)) % xtickdelta); }));
            xAxis2.tickValues(x.domain().filter(function(d, i) { return !((i+Math.floor(xtickdelta/2)) % xtickdelta); }));
        
            var barwidth    = x.step();
            var candlewidth = Math.floor(d3.min([barwidth*0.8, 13])/2)*2+1;
            var delta       = Math.round((barwidth-candlewidth)/2);
           
            d3.select(this).select("svg").remove();
            var svg = d3.select(this).append("svg")
                .attr("width", width + margin.left + margin.right)
                .attr("height", Bheight + margin.top + margin.bottom)
              .append("g")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
            
            svg.append("g")
                .attr("class", "axis dottedLine")
                .attr("transform", "translate(0," + height + ")")
                .style('stroke-dasharray', '3')
                .call(xAxis2.tickSize(height).tickFormat(""));
            
            svg.append("g")
                .attr("class", "axis yaxis")
                .style("stroke-width","2")
                .attr("transform", "translate(" + width + ",0)")
                .call(yAxis.tickSize(0).tickSizeOuter(0));
        
            svg.append("g")
                .attr("class", "axis dottedLine")
                .style('stroke-dasharray', '3')
                .attr("transform", "translate(" + width + ",0)")
                .call(yAxis2.tickSize(0).tickFormat("").tickSize(width));
            
            svg.append("g")
                .attr("class", "axis xaxis")
                .style("stroke-width","2")
                .attr("transform", "translate(0," + height + ")")
                .call(xAxis.tickSize(0).tickFormat("").tickSizeOuter(0));
        
        
            var bands = svg.selectAll(".bands")
                .data([genData])
                .enter().append("g")
                .attr("class", "bands");

                
        
            bands.selectAll("rect")
                .data(function(d) { return d; })
              .enter().append("rect")
                .attr("x", function(d) { return x(d.date) + Math.floor(barwidth/2); })
                .attr("y", 0)
                // hover line長度
                .attr("height", Bheight*0.95)
                .attr("width", 1)
                .attr("class", function(d, i) { return "band"+i; })
                .style("stroke-width", Math.floor(barwidth));
                
        
            var stick = svg.selectAll(".sticks")
                .data([genData])
              .enter().append("g")
                .attr("class", "sticks");
        
            stick.selectAll("rect")
                .data(function(d) { return d; })
              .enter().append("rect")
                .attr("x", function(d) { return x(d.date) + Math.floor(barwidth/2); })
                .attr("y", function(d) { return y(d.max); })
                .attr("class", function(d, i) { return "stick"+i; })
                .attr("height", function(d) { return y(d.min) - y(d.max); })
                .attr("width", 1)
                .classed("rise", function(d) { return (d.close>d.open); })
                .classed("fall", function(d) { return (d.open>d.close); });
        
            var candle = svg.selectAll(".candles")
                .data([genData])
              .enter().append("g")
                .attr("class", "candles");
        
            candle.selectAll("rect")
                .data(function(d) { return d; })
              .enter().append("rect")
                .attr("x", function(d) { return x(d.date) + delta; })
                .attr("y", function(d) { return y(d3.max([d.open, d.close])); })
                .attr("class", function(d, i) { return "candle"+i; })
                .attr("height", function(d) { return y(d3.min([d.open, d.close])) - y(d3.max([d.open, d.close])); })
                .attr("width", candlewidth)
                .classed("rise", function(d) { return (d.close>d.open); })
                .classed("fall", function(d) { return (d.open>d.close); });
    
          });
        } // csrender
    
        csrender.Bheight = function(value) {
                    if (!arguments.length) return Bheight;
                    Bheight = value;
                    return csrender;
                };
      
    return csrender;
    } // cschart

    function barchart() {

        var margin = {top:(isWHValue.eleHeight)*0.75, right: 30, bottom: 10, left: 5 },
            width = (isWHValue.eleWidth)*0.9, height = (isWHValue.eleHeight)*0.2, mname = "mbar1";
        
        var MValue = "Trading_turnover";
        
        function barrender(selection) {
          selection.each(function(data) {
        
            var x = d3.scaleBand()
                .range([0, width]);
            
            var y = d3.scaleLinear()
                .range([height, 0]);
            
            var xAxis = d3.axisBottom(x)
                .tickFormat(d3.timeFormat(TFormat[tIntervals]));
            
            var xAxis2 = d3.axisTop(x)
                .tickFormat(d3.timeFormat(TFormat[tIntervals]));
            
            var yAxis = d3.axisRight(y)
                .ticks(Math.floor(height/50));
            
            var yAxis2 = d3.axisLeft(y)
                .ticks(Math.floor(height/50));
            
            var svg = d3.select(this).select("svg")
               .append("g")
                  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
            
            x.domain(data.map(function(d) { return d.date; }));
            y.domain([0, d3.max(data, function(d) { return d[MValue]; })]).nice();
        
            var xtickdelta   = Math.ceil(60/(width/data.length));
            
            xAxis.tickValues(x.domain().filter(function(d, i) { return !((i+Math.floor(xtickdelta/2)) % xtickdelta); }));
            xAxis2.tickValues(x.domain().filter(function(d, i) { return !((i+Math.floor(xtickdelta/2)) % xtickdelta); }));
            
            svg.append("g")
                .attr("class", "axis dottedLine")
                .attr("transform", "translate(0," + height + ")")
                .style('stroke-dasharray', '3')
                .call(xAxis2.tickSize(height).tickFormat(""));
            
            svg.append("g")
                .attr("class", "axis yaxis")
                .attr("transform", "translate(" + width + ",0)")
                .call(yAxis.tickFormat("").tickSize(0));
            
            svg.append("g")
                .attr("class", "axis dottedLine")
                .style('stroke-dasharray', '3')
                .attr("transform", "translate(" + width + ",0)")
                .call(yAxis2.tickSize(0).tickFormat("").tickSize(width));
            
            svg.append("g")
                .attr("class", "axis xaxis")
                .style("stroke-width","2")
                .attr("transform", "translate(0," + height + ")")
                .call(xAxis.tickSizeOuter(0));
      //      svg.append("g")
      //          .attr("class", "axis yaxis")
      //          .attr("transform", "translate(0,0)")
      //          .call(yAxis.orient("left"));
        
            var barwidth    = x.step();
            var fillwidth   = (Math.floor(barwidth*0.9)/2)*2+1;
            var bardelta    = Math.round((barwidth-fillwidth)/2);
        
            var mbar = svg.selectAll("."+mname+"bar")
                .data([data])
              .enter().append("g")
                .attr("class", mname+"bar");
        
            mbar.selectAll("rect")
                .data(function(d) { return d; })
              .enter().append("rect")
                .attr("class", mname+"fill")
                .attr("x", function(d) { return x(d.date) + bardelta; })
                .attr("y", function(d) { return y(d[MValue]); })
                .attr("class", function(d, i) { return mname+i; })
                .attr("height", function(d) { return y(0) - y(d[MValue]); })
                .attr("width", fillwidth)
                .classed("rise", function(d) { return (d.close>d.open); })
                .classed("fall", function(d) { return (d.open>d.close); });
          });
        } // barrender
        barrender.mname = function(value) {
                    if (!arguments.length) return mname;
                    mname = value;
                    return barrender;
                };
      
        barrender.margin = function(value) {
                    if (!arguments.length) return margin.top;
                    margin.top = value;
                    return barrender;
                };
      
        barrender.MValue = function(value) {
                    if (!arguments.length) return MValue;
                    MValue = value;
                    return barrender;
                };
      
      return barrender;
    } // barchart
      


  return (
    <div id="demobox">
        <div id="csbox">
            <div id="option">
                <input id="oneD" name="1D" type="button" onClick={handleClick} value="日" />
                <input id="oneW" name="1W" type="button" onClick={handleClick} value="週" />
                <input id="oneM" name="1M" type="button" onClick={handleClick} value="月" />
                <div id="infodate" className="infohead"></div>
            </div>
            <div id="infobar">
                <div id="infoid" className="infobox"></div>
                <div id="infoname" className="infobox"></div>
                <div id="infoopen" className="infobox"></div>
                <div id="infomax" className="infobox"></div>
                <div id="infomin" className="infobox"></div>
                <div id="infoclose" className="infobox"></div>
                <div id="infovolume" className="infobox"></div>
            </div>
            <div id="chart1"></div>
        </div>
    </div> 
  );
};

export default CandlestickChart;
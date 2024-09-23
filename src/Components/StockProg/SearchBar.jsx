import React, { useState } from 'react'

import { FaSearch } from "react-icons/fa";
import StockList from '../Assets/stock_List.json';

import './SearchBar.css';

function SearchBar(props) {
    const [isSearch, setSearch] = useState('');
    const [listSuggest,setListSuggest] = useState(null);
    const [position,setPosition] = useState({
        eleWidth:0,
        eleTop:0
    });

    function handleChange (event){
        setListSuggest(null);
        const searchValue = event.target.value
        // console.log(event.target);
        // Code、Name
        if (searchValue !== ''){
            const filterCode = StockList.filter( (listdata) => listdata.Code.includes(searchValue));
            const filterName = StockList.filter( (listdata) => listdata.Name.includes(searchValue));
            const suggest = {...filterCode, ...filterName};
            const suggestLength = Object.getOwnPropertyNames(suggest).length;
            if (suggestLength !== 0){
                setListSuggest(Object.entries(suggest).slice(0,5).map(entry => entry[1]));
            }
            setSearch(searchValue)
        } else {
            setSearch(searchValue)
        }
        
        var ele = document.getElementById( 'searchID' );
        const rect = ele.getBoundingClientRect();
        setPosition({
            eleWidth:rect.right-rect.left,
            eleTop:rect.top+30
        })
        // window.scrollX,window.scrollY
    }
  
    function onClick (event){
        const value = event.target.getAttribute('value');
        // console.log(event.target.getAttribute('value'));
        props.searchID(value);
        setSearch('');
        setListSuggest(null);
    }
    

  return (
    <div className="searchContainer">
        <div className="searchBar" id='searchID'>
            <button><FaSearch /></button>
            <input type="text" placeholder="Search" onChange={handleChange} value={isSearch}/>
        </div>
        <div className="list-container" style={{width:position.eleWidth,top:position.eleTop}}>
            {listSuggest && (            
                (listSuggest.map((event,index) => (
                <label key={index} onClick={onClick} value={event.Code}>{event.Code}  {event.Name}</label>
                )))
            )}
            {!listSuggest && ((isSearch !== '')?            
                <label>很抱歉，沒有相關到相關個股!</label>:null
            )}
            
        </div>
   </div>
  )
}

export default SearchBar;
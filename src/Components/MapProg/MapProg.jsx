import React, { useState, useCallback} from "react";
import ReactMapGl, { Source, Layer, Popup, Marker } from "react-map-gl";
import WebMercatorViewport from "viewport-mercator-project";
import bbox from "@turf/bbox";

import { BsTriangleFill } from "react-icons/bs";
import { PiMountainsDuotone } from "react-icons/pi";
import "mapbox-gl/dist/mapbox-gl.css";
// import "../Home/HomePage.css";
import "./MapProg.css";

import {countiesLayer , highlightLayer, townsLayer} from "./MapStyle";
import ControlPanel from "./control-panel";
import WikiApi from "./WikiApi";

import countryJson from "../Assets/taiwan.json";
import townJson from "../Assets/TOWN_15.json";
import TMountain from "../Assets/taiwanMountain.json";

const TOKEN = process.env.REACT_APP_TOKEN;

export const MapProg = () => {
  const [viewPort,setViewPort] = useState({longitude:120.751864,latitude: 23.575998,zoom: 7});
  const [isUpScale, setUpScale] = useState(true);
  const [jsonInfo, setJsonInfo] = useState(countryJson);
  const [hoverInfo, setHoverInfo] = useState(null);
  const [isCountry,setCountry] = useState("");
  const [popupInfo, setPopupInfo] = useState(null);
  const [isLevel, setLevel] = useState("");
  const [isKeyWord,setKeyWord] = useState("臺灣");
  
  const onHover = useCallback(event => {
    const {
      features,
      point: {x, y}
    } = event;

    if (features[0]){
      const hoveredFeature = features[0];
      setHoverInfo({feature: hoveredFeature, x, y});
    } else {
      setHoverInfo(null);
    }
  }, []);

  const upperLayer = () => {
    setHoverInfo(null);
    setJsonInfo(countryJson);
    setUpScale(true);
    setCountry("");
    setPopupInfo(null);
    setViewPort({longitude:120.751864,latitude: 23.575998,zoom: 7});
    setLevel("");
    setKeyWord("臺灣")
  }

  const markerData = TMountain.features.map((mountain,index) => {
    const mountainFilter = mountain.properties.LEVEL === isLevel;
    const mountainCountry = mountain.properties.COUNTYNAME.search(isCountry)!==-1
    if (mountainCountry && mountainFilter){
      const latitude = mountain.geometry.coordinates[1];
      const longitude = mountain.geometry.coordinates[0];
      const levelFeature = mountain;
      let iconTYPE = <BsTriangleFill />;
      if (isLevel === "HM" || isLevel ==="SHM" ){
        iconTYPE = <PiMountainsDuotone />;
      }
      return(
        <Marker
          key={`marker-${index}`}
          longitude={longitude}
          latitude={latitude}
          anchor="center"
          onClick={e => {
            e.originalEvent.stopPropagation();
            setHoverInfo(null);
            setPopupInfo({feature: levelFeature, longitude, latitude});
            if (isLevel === "HM" || isLevel ==="SHM"){
              setKeyWord(levelFeature.properties.POINTNAME);
            }else{
              setKeyWord(levelFeature.properties.COUNTYNAME);
            }
          }}
        >
          <div className={isLevel}>
            {iconTYPE}
          </div>
        </Marker>
      )
    }
    return null;
  });

  const onClick = (event) => {
    const feature = event.features[0];
    
    if (feature && isUpScale===true) {
      setHoverInfo(null);
      setJsonInfo(townJson);
      setUpScale(false);
      setCountry(feature.properties.COUNTYNAME);
      setKeyWord(feature.properties.COUNTYNAME);
      
      const elem = document.getElementById("reactMap");
      const rect = elem.getBoundingClientRect();
      
      if (feature) {
        // calculate the bounding box of the feature
        const [minLng, minLat, maxLng, maxLat] = bbox(feature);
        const viewport = new WebMercatorViewport({ width: rect.width/2, height:rect.width/2})
        .fitBounds([[minLng, minLat],[maxLng, maxLat]]);
        const { longitude, latitude, zoom } = viewport
        setViewPort({ longitude, latitude, zoom });
      }
    } else if (feature && isUpScale===false){
      setHoverInfo(null);
      setKeyWord(feature.properties.TOWNNAME);
    }
  };

  return (
    <>
    <div className="reactMap" id="reactMap">
      <ReactMapGl
          mapLib={import("mapbox-gl")}
          {...viewPort}
          mapboxAccessToken={TOKEN}
          mapStyle="mapbox://styles/mapbox/light-v9"
          attributionControl={false}
          interactiveLayerIds={popupInfo?null:[isUpScale? "countryLayer":"townsLayer"]}
          // 指標移動時顯示 上層:縣市名 下層:縣市名+鄉鎮名，並更改區塊顏色
          onMouseMove={popupInfo?null:onHover}
          // 點選縣市區塊時進入下層
          onClick={popupInfo?null:onClick}
      >
        <Source id="countryJson" type="geojson" data={jsonInfo} >
          {isUpScale && (<Layer {...countiesLayer} />)}
          {isUpScale && (hoverInfo && (<Layer {...highlightLayer} filter={["==", "COUNTYNAME", hoverInfo.feature.properties.COUNTYNAME]} />))}
          {!isUpScale && (<Layer {...townsLayer} filter={["==", "COUNTYNAME", isCountry]} />)}
        </Source>
        
        {!isUpScale && markerData}
        {/* 當hoverInfo存在時執行 */}
        {hoverInfo && (
          <div className="tooltip" style={{left: hoverInfo.x, top: hoverInfo.y}}>
            <div>{hoverInfo.feature.properties.COUNTYNAME}</div>
            {!isUpScale&&(<div>{hoverInfo.feature.properties.TOWNNAME}</div>)}
          </div>
        )}
        {popupInfo && (
          <Popup
            anchor="top"
            longitude={Number(popupInfo.longitude)}
            latitude={Number(popupInfo.latitude)}
            onClose={() => setPopupInfo(null)}
          >
            <div>
              <ul style={{listStyleType: "none"}}>
                <li>點名: {popupInfo.feature.properties.POINTNAME}</li>
                <li>高度: {popupInfo.feature.properties.HEIGHT} 公尺</li>
                <li>坐落: {popupInfo.feature.properties.COUNTYNAME}</li>
                {(isLevel==="HM")? <li>隸屬:{popupInfo.feature.properties.PARK}</li>:null}
                {(isLevel==="HM")? <li>山群:{popupInfo.feature.properties.MGROUP}</li>:null}
              </ul>
            </div>
          </Popup>
        )}
        {!isUpScale && (<ControlPanel upperBut={upperLayer} country={isCountry} level={isLevel} onChange={setLevel} onChange2={setPopupInfo}/>)}
      
      </ReactMapGl>
      
    
    
    </div>
    <WikiApi wikikey={isKeyWord} location={popupInfo?popupInfo:viewPort}/>
    
    
    </>
  )

}

export default MapProg;

import React from 'react';
import HomePageMap from '../../assets/img/homepage-map.png'

const MapSection = () => {
  return (
    <div className="container map-section">
        <div className='backdrop'>
            <div className='map-content'>
                <span id='first-pill'><p>Air Quality by Map</p></span>
                <h3 className='content-h'>Live timely air quality <br/> analytics across <br/>Africa</h3>
                <span className='content-p'>
                    <p>A better way to visualize hourly air quality information <br/> with a single click over our growing network across <br/> African cities</p>
                </span>
                <span id='second-pill'>View map <i></i></span>
            </div>
            <div className='map-image'>
                <img className='map-img' src={HomePageMap}/>
            </div>
        </div>
    </div>
  )
}

export default MapSection;
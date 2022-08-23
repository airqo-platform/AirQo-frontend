import React from 'react';
import HomePageMap from 'assets/img/homepage-map.png'
import MapWrapper from 'assets/img/MapWrapper.png'
import useWindowSize from 'utils/customHooks';

const MapSection = () => {
  const windowSize = useWindowSize();
  const largeScreen = 1440;
  return (
    <div className="map-section">
      <div className='backdrop'>
        <div className='map-content'>
          <span id='first-pill'><p>Air Quality Map</p></span>
          <h3 className='content-h'>Live air quality insights across Africa</h3>
          <span className='content-p'>
            <p>Visualize hourly air quality information with a single click, over our growing network across African cities</p>
          </span>
          {/* <span id='second-pill'><p>View map</p> <i> <ArrowRight/> </i></span> */}
        </div>
        <div className='map-image'>
          <img className='map-img' src={windowSize.width <= largeScreen ? HomePageMap : MapWrapper} />
        </div>
      </div>
    </div>
  )
}

export default MapSection;
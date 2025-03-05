'use client'
import React, { useEffect, useRef, useState } from 'react'

import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { ConvertToGeojson } from '@/lib/utils';
import { GetAirQuoData,token,AirQoToken,mapStyles, mapDetails } from '@/core/apis/MapData';
import { IconButton } from './components/IconButton';
import LayerIcon from "@/public/icons/map/layerIcon";
import RefreshIcon from "@/public/icons/map/refreshIcon";
import ShareIcon from "@/public/icons/map/ShareIcon";
import LayerModel from './components/LayerModal';
import { Import, LoaderCircle, Loader2 } from 'lucide-react';
import { useAppSelector } from '@/core/redux/hooks';
import MapSideBar from './components/Sidebar/page';


import allCountries from './data/countries.json'
import { any } from 'zod';
import { useSites } from '@/core/hooks/useSites';


const NetManagerMap = () => {
        // const userGroup = useAppSelector((state)=> state.user.userGroups);
          const activeGroup = useAppSelector((state) => state.user.activeGroup)
        // console.log(userGroup)
        console.log(activeGroup)

        // const { width } = useWindowSize();
        const mapContainerRef = useRef<HTMLDivElement>(null);
        const mapRef = useRef<mapboxgl.Map | null>(null);

        const [isOpen, setIsOpen] = useState(false);
        const [loading,setLoading] = useState(true)
        const [airdata,setAirdata] = useState(false)
        const [NodeType, setNodeType] = useState('Emoji');
        const [mapStyle, setMapStyle] = useState(mapStyles[0].url);
        const [countryData, setCountryData] = useState<any[]>([]);
        const [selectedCountry, setSelectedCountry] = useState(null);
        const [siteDetails, setSiteDetails] = useState<any[]>([]);
        const [sessionToken, setSessionToken] = useState<string | null>(null);
        const activeNetwork = useAppSelector((state) => state.user.activeNetwork);
        // const gridsDataSummary = useAppSelector((state) => state.grids) || [];
        const { sites, isLoading, error } = useSites();
        console.log("GridsData Summary: ",  sites);

        const AirQuality= {
        goodair :'/images/map/GoodAir.png',
         moderate :'/images/map/Moderate.png',
         hazardous :'/images/map/Hazardous.png',
         unhealthy: '/images/map/Unhealthy.png',
         veryunhealthy :'/images/map/VeryUnhealthy.png',
         unknownAQ:'/images/map/UnknownAQ.png',
         unhealthySG: '/images/map/UnhealthySG.png',
        }

        const HandleReset =()=>{
                if (mapRef.current) {
                        mapRef.current.flyTo({
                                center: [18.5,5], 
                                zoom: 3.0,
                                essential: true 
                            });
                      }
        }
        const handleUserClick=(data: any)=>{
                if (mapRef.current) {
                        mapRef.current.flyTo({
                                center: data.features[0].geometry.coordinates, 
                                zoom: 12,
                                essential: true 
                            });
                      }
        }
        

                        // Set site details when grid data summary changes
  
        useEffect(() => {
                if (Array.isArray(sites) && sites.length > 0) {
                        setSiteDetails(sites);
                        // const newSiteDetails = sites.flatMap(
                        // (grid) => grid.sites || [],
                        // );                      
                       
                }
                }, [sites]);

      /**
   * Initialize Country Data
   */
        useEffect(() => {
                if (Array.isArray(siteDetails) && siteDetails.length > 0) {
                const uniqueCountries = siteDetails.reduce((acc, site) => {
                const country = allCountries.find((c) => c.country === site.country);
                if (country && !acc.some((item: { country: any; }) => item.country === site.country)) {
                acc.push({ ...site, ...country });
                }
                return acc;
                }, []);
                console.log("unique Countries",uniqueCountries)
                  setCountryData(uniqueCountries);
                } else {
                  console.error('No valid siteDetails data available.');
                }
              }, [siteDetails]);


        // const refreshMap = useRefreshMap(
        //         setToastMessage,
        //         mapRef,
        //         dispatch,
        //         selectedNode,
        //       );
        //Get the Session Token for the User
       useEffect(() => {
        if (typeof window !== "undefined") { 
            const storedToken = localStorage.getItem("token");
            setSessionToken(storedToken);
        }
    }, []);

  useEffect(() => {

        const tooltip = document.createElement('div');
        tooltip.style.position = 'absolute';
        tooltip.style.background = 'white';
        tooltip.style.padding = '10px';
        tooltip.style.borderRadius = '10px';
        tooltip.style.boxShadow = '0 2px 10px rgba(0,0,0,0.3)';
        tooltip.style.display = 'none';
        tooltip.style.pointerEvents = 'none';
        tooltip.style.fontSize = '14px';
        tooltip.style.maxWidth = '250px';
        tooltip.style.zIndex = '1000';
        document.body.appendChild(tooltip);

        if (!token) {
                console.error('Map token is missing');
                  return;
                 }
        mapboxgl.accessToken = token;
    if (mapContainerRef.current) {
        setLoading(false)
      mapRef.current = new mapboxgl.Map({
        container: mapContainerRef.current,
        style:mapStyle,
        center: [18.5, 3], 
        zoom: 3
      });

      mapRef.current.on('load', async () => {
        if (mapRef.current) {

                try {
                        if (!AirQoToken) {
                            throw new Error('Token is missing');
                        }
                        const Data = await GetAirQuoData(AirQoToken);
                        setAirdata(true)
                        const geojsonData = ConvertToGeojson(Data);
                        console.log('GeoJson Data : ',geojsonData)

                        mapRef.current.addSource('data', {
                          type: 'geojson',
                          data: geojsonData
                        });
                        const popup = new mapboxgl.Popup({
                                closeButton: false,
                                closeOnClick: false,
                                
                              });
                        // Listen for when the mouse enters a feature in your 'data-layer'
                        mapRef.current.on('mouseenter', 'data-layer', (e) => {
                                if (mapRef.current) {
                                    mapRef.current.getCanvas().style.cursor = 'pointer';
                                }
                                // Get the feature under the mouse pointer (the first feature).
                                const feature = e.features ? e.features[0] : null;
                                if (feature && feature.properties) {
                                    
                                      }
                                      
                                if (!feature) return;

                                // Set tooltip content
                                tooltip.innerHTML = `
                                <div style="font-size: 14px; border-radius: 25px; background-color: white; padding: 10px;  rgba(0, 0, 0, 0.2); max-width: full;">
                                         <div>${feature.properties?.time ?? 'Unknown time'}</div><br>
                                         <div style="display: flex; justify-content: space-between;gap: 20px;">
                                         <strong style="display: flex; ">${feature.properties?.location_name ?? 'Unknown Location'}</strong>
                                         <div style="display: flex;font-weight: bold; ">${feature.properties?.value.toFixed(2) ?? 'N/A'}µg/m³</div>
                                         </div>

                                         <div style=" display: flex;gap: 10px; ">
                                         <h1 style="font-weight: bold; color: ${feature.properties?.aqi_color ?? 'black'};">Air Quality is ${feature.properties?.aqi_category ?? 'N/A'}</h1>
                                         <img src="${AirQuality.goodair}" style="background-color: ${feature.properties?.aqi_color ?? 'green'};width: 30px; height: 30px;border-radius: 50%;font-size: 18px;"></img>
                                         </div>
                                 </div>
                                `;
                                tooltip.style.display = 'block';
                                if (mapRef.current) {
                                        mapRef.current.on('mousemove', (e) => {
                                            const tooltipWidth = tooltip.offsetWidth;
                                            const tooltipHeight = tooltip.offsetHeight;
                                            const screenWidth = window.innerWidth;
                                            const screenHeight = window.innerHeight;
                                            let left = e.originalEvent.clientX + 50;
                                            let top = e.originalEvent.clientY + 50;
                                    
                                            // Adjust for right edge
                                            if (left + tooltipWidth > screenWidth) {
                                                left = e.originalEvent.clientX - tooltipWidth - 10;
                                            }
                                    
                                            // Adjust for bottom edge
                                            if (top + tooltipHeight > screenHeight) {
                                                top = e.originalEvent.clientY - tooltipHeight - 10;
                                            }
                                    
                                            tooltip.style.left = `${left}px`;
                                            tooltip.style.top = `${top}px`;
                                        });
                                    }
                                    
                })
                        
                       
                        mapRef.current.on('mouseleave', 'data-layer', () => {
                                if (mapRef.current) {
                                    mapRef.current.getCanvas().style.cursor = '';
                                }
                                tooltip.style.display = 'none';
                               
                            });
                        
                        
                        Object.entries(AirQuality).forEach(([key, url]) => {
                        if (mapRef.current) {
                            mapRef.current.loadImage(url, (error, image) => {
                                if (error) throw error;
                        
                                if (mapRef.current && image && !mapRef.current.hasImage(key)) {
                                    mapRef.current.addImage(key, image);
                                }
                            });
                        }
                            });
                            mapRef.current.addLayer({
                                'id': 'circle-layer',
                                'type': 'circle',
                                'source': 'data',
                                'paint': {
                                    'circle-color': 'white',
                                    'circle-radius': 30,
                                    'circle-opacity': 1
                                }
                            });
                        mapRef.current.addLayer({
                          'id': 'data-layer',
                          'type': 'symbol',
                          'source': 'data',
                          'layout': {
                                    'icon-image': [
                                                        'match',
                                                        ['get', 'aqi_category'],
                                                        'Good', 'goodair', 
                                                        'Moderate', 'moderate', 
                                                        'Unhealthy', 'unhealthy',
                                                        'Unhealthy for Sensitive Groups', 'unhealthySG',
                                                        'Hazardous','Hazardous',
                                                        'Very Unhealthy', 'veryunhealthy',
                                                        'unknownAQ' 
                                                        ],
                                    'icon-size': 0.05,
                                    'icon-padding': 0,
                                    'icon-allow-overlap': true,
                                    'icon-ignore-placement': true,
                                },
                          
                          'filter': ['has', 'aqi_category']
                        });
                   
            
                      } catch (error) {
                        console.error('Error fetching GeoJSON:', error);
                      }
                    }
                  });
                }
              }, [token]);


 
  return (
        <div className="flex flex-col-reverse   md:flex md:flex-row min-h-screen md:h-screen   -ml-5 "> 

       <MapSideBar 
                handleUserClick={handleUserClick}
                reset={()=>HandleReset()} 
                token={token?token:""} 
                sessionToken={sessionToken?sessionToken:""} 
                countryData={countryData} selectedCountry={selectedCountry} 
                setSelectedCountry={setSelectedCountry} 
                siteDetails={siteDetails} 
                />
      
       { (  loading || !airdata) &&(<div className="absolute inset-0 flex items-center justify-center z-[10000]">
          <div
            className={`bg-white w-[64px] h-[64px] flex justify-center items-center rounded-md shadow-md p-3`}
          >
            <LoaderCircle className='animate-spin text-blue-600' width={32} height={32} />
          </div>
        </div>)}
       <div ref={mapContainerRef} className=" flex flex-grow   md:ml-[1%] rounded-lg container  w-full  md:h-full"/>

        <div className="absolute top-24 right-10 z-40 flex flex-col gap-4">
            
         <IconButton
         onClick={() => setIsOpen(true)}
         title='Map Layers'
         icon={<LayerIcon width={24} height={24} fill={""}/>}
         />
        
          <IconButton
          onClick={() => setIsOpen(true)}
          title='Refresh Map'
          icon={<RefreshIcon width={24} height={24} fill={""} />}
          />
          
          <IconButton
          onClick={() => setIsOpen(true)}
          title='Refresh Map'
          icon={<ShareIcon width={24} height={24} fill={""} />}
          />
        </div>
        
        <div className='flex border border-2' >
        <LayerModel
         isOpen={isOpen}
         onClose={() => setIsOpen(false)}
         mapStyles={mapStyles.map(style => ({ ...style, image: style.image.src }))}
         mapDetails={mapDetails.map(detail => ({ ...detail, image: detail.image.src }))}
         disabled="Heatmap"
         onMapDetailsSelect={setNodeType}
         onStyleSelect={(style) => setMapStyle(style.url)}
        />
        </div>
        
      </div>
  )
}


export default NetManagerMap
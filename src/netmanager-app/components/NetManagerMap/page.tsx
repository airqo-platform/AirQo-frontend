'use client'
import React, { useEffect, useRef, useState } from 'react'
import { Input } from '../ui/input'
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { ConvertToGeojson } from '@/lib/utils';
import { GetAirQuoData,FetchSuggestions,UserClick,token,AirQoToken } from '@/core/apis/MapData';
import { IconButton } from './components/IconButton'
import LayerIcon from "@/public/icons/map/layerIcon";
import RefreshIcon from "@/public/icons/map/refreshIcon";
import ShareIcon from "@/public/icons/map/ShareIcon";
import LayerModel from './components/LayerModal';
import {mapStyles, mapDetails} from './data/constants'


const NetManagerMap = () => {
        // const { width } = useWindowSize();
        const mapContainerRef = useRef<HTMLDivElement>(null);
        const mapRef = useRef<mapboxgl.Map | null>(null);
        const [query, setQuery] = useState("");
        const [locationId,setlocationId] =useState("")
        const [suggestions, setSuggestions] = useState<any[]>([]);
        const [sessionToken, setSessionToken] = useState<string | null>(null);
        const [isOpen, setIsOpen] = useState(false);
        const [NodeType, setNodeType] = useState('Emoji');
        const [mapStyle, setMapStyle] = useState(
          'mapbox://styles/mapbox/streets-v11',
        );

        const AirQuality= {
        goodair :'/images/map/GoodAir.png',
         moderate :'/images/map/Moderate.png',
         hazardous :'/images/map/Hazardous.png',
         unhealthy: '/images/map/Unhealthy.png',
         veryunhealthy :'/images/map/VeryUnhealthy.png',
         unknownAQ:'/images/map/UnknownAQ.png',
         unhealthySG: '/images/map/UnhealthySG.png',
        }

       
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
    mapboxgl.accessToken = token;
    if (mapContainerRef.current) {
      mapRef.current = new mapboxgl.Map({
        container: mapContainerRef.current,
        style:'mapbox://styles/mapbox/streets-v11',
        center: [18.5, 3], 
        zoom: 3
      });

      mapRef.current.on('load', async () => {
        if (mapRef.current) {

                try {
                        const Data = await GetAirQuoData(AirQoToken?AirQoToken:"")
                        console.log(Data)
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

                                const htmlContent = `
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
                        
                                // Set the popup at the feature's coordinates and add the HTML content.
                                popup
                                .setLngLat((feature.geometry as GeoJSON.Point).coordinates as [number, number])
                                .setHTML(htmlContent)
                                if (mapRef.current) {
                                    popup.addTo(mapRef.current);
                                }
                        });
                        
                        // When the mouse leaves the feature, remove the popup.
                        mapRef.current.on('mouseleave', 'data-layer', () => {
                                if (mapRef.current) {
                                    mapRef.current.getCanvas().style.cursor = '';
                                }
                                popup.remove();
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
                                    'icon-allow-overlap': true
                                },
                          
                          'filter': ['has', 'aqi_category']
                        });
                   
            
                      } catch (error) {
                        console.error('Error fetching GeoJSON:', error);
                      }
                    }
                  });
                }
              }, []);

  const SearchSuggestions=(e: React.ChangeEvent<HTMLInputElement>)=>{
        const value = e.target.value;
    setQuery(value);

    if (value.trim() === "") {
      setSuggestions([]);
      if (mapRef.current) {
        mapRef.current.flyTo({
                center: [18.5,5], 
                zoom: 3.0,
                essential: true 
            });
      }
      return;
    }
    const GetSuggestions=(latitude?: number, longitude?: number)=>{

        FetchSuggestions(value,token?token:"",sessionToken?sessionToken:"",latitude,longitude)
          .then(data => {
            if (data) {
              console.log(data)
              setSuggestions(data);
            }
            console.log("Number of Suggesstions", suggestions.length)
          })
          .catch(error => {
            console.error("Error fetching suggestions:", error);
          });
    }
    const fetchUserLocation = () => {
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              const { latitude, longitude } = position.coords;
              console.log("User Location:", latitude, longitude);
              GetSuggestions(latitude, longitude);
            },
            (error) => {
              console.error("Error getting user location:", error);
              GetSuggestions(); 
            }
          );
        } else {
          console.error("Geolocation is not supported by this browser.");
          GetSuggestions(); 
        }
      };
      fetchUserLocation();

  }
  //Retrieving The Location Clicked By The User
  const handleLocationClick = (locationid: any) => {
        UserClick(token?token:"",sessionToken?sessionToken:"",locationid)
        .then(data => {
                console.log(data.features[0].geometry.coordinates)
                if (mapRef.current) {
                        mapRef.current.flyTo({
                                center: data.features[0].geometry.coordinates, 
                                zoom: 12,
                                essential: true 
                            });
                      }
                })
                .catch(error => console.error("Error fetching location:", error));

  }


  return (
        <div className="flex flex-col-reverse   md:flex md:flex-row min-h-screen md:h-screen   -ml-5 "> 

       <div className=' flex  flex-grow md:flex-grow-0  border rounded-lg  md:w-[24%]'>
                <div className="flex flex-col border gap-2  p-1 rounded-lg w-full">
                        <div className="flex flex-col gap-3">
                        <h1 className="font-bold">Net Manager Map</h1>
                        <div className="relative w-full">
                            <Input
                            placeholder="Search all locations" type="text"
                            value={query}
                            onChange={SearchSuggestions} name="Search" className="w-full pr-10" />
                            
                        </div>
                        <div className='flex gap-2'>
                                <div className='border rounded-lg p-1 cursor-pointer bg-blue-600'>
                                        <h1 className='text-white'>ALL</h1>
                                </div>
                                <div className='border rounded-lg p-1 cursor-pointer bg-gray-200 hover:bg-gray-300'>
                                        Uganda
                                </div>
                        </div>
                        </div>

                        <div className='flex w-full '>
                        { suggestions.length > 0? (
                                
                        <div
                        id="search-suggestions"
                        className='w-full'
                        >
                        {suggestions.map((item, index) => (
                        <div
                        key={index}
                        className="bg-white w-full border border-gray-300 mt-1 rounded-md shadow-md max-h-40 overflow-y-auto p-2 hover:bg-gray-200 cursor-pointer"
                        onClick={()=>handleLocationClick(item.mapbox_id)}
                        >
                        <h1 className='text'>{item.name}</h1>
                        <h1 className='text-gray-300' >{item.place_formatted}</h1>
                        </div>
                        ))}
                        </div>
                ):(
                        <div  className="bg-white w-full border border-gray-300 mt-1 rounded-md shadow-md max-h-40 overflow-y-auto p-2 hover:bg-gray-200 cursor-pointer">
                                Type to see Suggestions...
                        </div>
                )}
                        </div>
                        
                </div>

       </div>
      
        <div className=" flex flex-grow   md:ml-[1%] ">
                { mapContainerRef ?(
                <div ref={mapContainerRef} className="rounded-lg map-container w-full   md:h-full"/>
        ):(
                <div className='text-black'>Loading...</div>
        )
          }
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

        </div>
        <LayerModel
         isOpen={isOpen}
         onClose={() => setIsOpen(false)}
         mapStyles={mapStyles}
         mapDetails={mapDetails}
         disabled="Heatmap"
         onMapDetailsSelect={setNodeType}
         onStyleSelect={(style) => setMapStyle(style.url)}
        />
        
      </div>
  )
}


export default NetManagerMap
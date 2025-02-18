'use client'
import React, { useEffect, useRef, useState } from 'react'
import { Input } from '../ui/input'
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { MagnifyingGlassIcon } from '@radix-ui/react-icons';
import goodair from '/images/map/GoodAir.png'

const NetManagerMap = () => {

        const mapContainerRef = useRef<HTMLDivElement>(null);
        const mapRef = useRef<mapboxgl.Map | null>(null);
        const [query, setQuery] = useState("");
        const [locationId,setlocationId] =useState("")
        const [suggestions, setSuggestions] = useState<any[]>([]);
        const token = 'pk.eyJ1IjoiZWxpYWxpZ2h0IiwiYSI6ImNtNzJsMnZnbjBhajIyanIwN3A3eWY2YmUifQ.x0x411yjbETiJ-F8ebivHQ'
        const AirQuality= {
        goodair :'/images/map/GoodAir.png',
         moderate :'/images/map/Moderate.png',
         hazardous :'/images/map/Hazardous.png',
         unhealthy: '/images/map/Unhealthy.png',
         veryunhealthy :'/images/map/VeryUnhealthy.png'}

       
        // const Sessiontoken = localStorage.getItem("token");
        const [sessionToken, setSessionToken] = useState<string | null>(null);
       console.log("locationId : ",locationId)
       useEffect(() => {
        if (typeof window !== "undefined") { // Ensure this runs only in the browser
            const storedToken = localStorage.getItem("token");
            setSessionToken(storedToken);
        }
    }, []);
    console.log("Session token:", sessionToken);

  useEffect(() => {
    mapboxgl.accessToken = token;

    if (mapContainerRef.current) {
      mapRef.current = new mapboxgl.Map({
        container: mapContainerRef.current,
        center: [18.5, 5], 
        zoom: 3.5 
        
      });

      mapRef.current.on('load', async () => {
        if (mapRef.current) {
                try {
                        const response = await fetch('https://staging-analytics.airqo.net/api/v2/devices/readings/map?token=NQ9PFPCJXNEREMUR');
                        const jsonData = await response.json();
                        const geojsonData = ConvertToGeojson(jsonData);
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
                                // Change the cursor style to indicate interactivity.
                                if (mapRef.current) {
                                    mapRef.current.getCanvas().style.cursor = 'pointer';
                                }
                        
                                // Get the feature under the mouse pointer (the first feature).
                                const feature = e.features ? e.features[0] : null;
                                if (!feature) return;
                        
                                // Build your HTML content using feature properties.
                                const htmlContent = `
                                <div style="font-size: 14px; border-radius: 25px; background-color: white; padding: 10px;  rgba(0, 0, 0, 0.2); max-width: full;">
                                        <div>${feature.properties?.time ?? 'Unknown time'}</div><br>
                                        <div style="display: flex; justify-content: space-between;gap: 20px;">
                                        <strong style="display: flex; ">${feature.properties?.location_name ?? 'Unknown Location'}</strong>
                                        <div style="display: flex;font-weight: bold; ">${feature.properties?.value ?? 'N/A'}µg/m³</div>
                                        </div>

                                        <div style=" display: flex;gap: 10px; ">
                                        <h1 style="font-weight: bold; color: ${feature.properties?.aqi_color ?? 'black'};">Air Quality is ${feature.properties?.aqi_category ?? 'N/A'}</h1>
                                        <img src=${AirQuality} style="background-color: ${feature.properties?.aqi_color ?? 'green'};width: 30px; height: 30px;border-radius: 50%;font-size: 18px;"></img>
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
                        // mapRef.current.loadImage(AirQuality.goodair, (error, image) => {
                        //         if (error) throw error;
                            
                        //         if (mapRef.current && !mapRef.current.hasImage('custom-icon')) {
                        //             mapRef.current.addImage('custom-icon', image);
                        //         }})

                        mapRef.current.addLayer({
                          'id': 'data-layer',
                          'type': 'circle',
                          'source': 'data',
                          'paint': {
                            'circle-color': ['get', 'aqi_color'],
                            'circle-radius': 20,
                            'circle-stroke-color': 'white',
                            'circle-stroke-width': 1,
                        //     'circle-stroke-color': '#000000',
                            'circle-opacity': 0.5
                          },
                          'filter': ['has', 'aqi_category']
                        });
                        // mapRef.current.addLayer({
                        //         'id': 'icon-layer',
                        //         'type': 'symbol',
                        //         'source': 'data',
                        //         'layout': {
                        //             'icon-image': 'custom-icon',
                        //             'icon-size': 0.04,
                        //             'icon-allow-overlap': true
                        //         },
                        //         'filter': ['has', 'aqi_category']
                        //     });
            
                      } catch (error) {
                        console.error('Error fetching GeoJSON:', error);
                      }
                    }
                  });
                }{
                        <div>
                                Loading Data
                        </div>
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
                zoom: 3.5,
                essential: true 
            });
      }
      return;
    }
    const GetSuggestions=(latitude?: number, longitude?: number)=>{
        
        
  if (latitude !== undefined && longitude !== undefined) {
        const proximityParam = `${longitude},${latitude}`;
        fetch(`https://api.mapbox.com/search/searchbox/v1/suggest?q=${value.toLowerCase()}&access_token=${token}&proximity=${proximityParam}&session_token=${sessionToken}`)
        .then(response => response.json())
        
        .then(data => {
                console.log("data :",data.suggestions)
                if (data.suggestions) {
                        setSuggestions(data.suggestions);
                      }
                console.log("Number of Suggesstions", suggestions.length)
                })
                .catch(error => console.error("Error fetching suggestions:", error));
      }
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
        fetch(`https://api.mapbox.com/search/searchbox/v1/retrieve/${locationid}?&access_token=${token}&session_token=${sessionToken}`)
        .then(response => response.json())
        .then(data => {
                console.log(data.features[0].geometry.coordinates)
                if (mapRef.current) {
                        mapRef.current.flyTo({
                                center: data.features[0].geometry.coordinates, 
                                zoom: 10,
                                essential: true 
                            });
                      }
                })
                .catch(error => console.error("Error fetching location:", error));

  }
  const ConvertToGeojson=(data: any)=>{
          return {
                  type: "FeatureCollection" as const,
                  features: data.measurements.map((item: any) => ({
                          type: "Feature",
                          geometry: {
                                  type: "Point",
                                  coordinates: [
                                        item.siteDetails.approximate_longitude, 
                                        item.siteDetails.approximate_latitude
                                ]
                                  },
                                  properties: {
                                          id: item._id,
                                          site_id:item.site_id,
                                          time: new Date(item.time).toLocaleDateString("en-US", {
                                                weekday: "long",
                                                year: "numeric",
                                                month: "long",
                                                day: "numeric"
                                              }),
                                          location_name:item.siteDetails.location_name,
                                          aqi_category: item.aqi_category,
                                          aqi_color:item.aqi_color.startsWith("#") ? item.aqi_color : `#${item.aqi_color}`,
                                          value:item.pm2_5?.value.toFixed(2) ?? 0,
                                          }
                                          }))
                                          }
  
  
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
                        { suggestions? (suggestions.length > 0 && (
                                
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
                )):(
                        <div  className="bg-white w-full border border-gray-300 mt-1 rounded-md shadow-md max-h-40 overflow-y-auto p-2 hover:bg-gray-200 cursor-pointer">
                                Loading Suggestions...
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
        </div>
        
      </div>
  )
}

export default NetManagerMap
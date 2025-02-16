'use client'
import React, { useEffect, useRef, useState } from 'react'
import { Input } from '../ui/input'
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

const NetManagerMap = () => {

        const mapContainerRef = useRef<HTMLDivElement>(null);
        const mapRef = useRef<mapboxgl.Map | null>(null);
        const [query, setQuery] = useState("");
        const [locationId,setlocationId] =useState("")
        const [suggestions, setSuggestions] = useState<any[]>([]);
        const token = 'pk.eyJ1IjoiZWxpYWxpZ2h0IiwiYSI6ImNtNzJsMnZnbjBhajIyanIwN3A3eWY2YmUifQ.x0x411yjbETiJ-F8ebivHQ'
        const Sessiontoken = localStorage.getItem("token");
       console.log("locationId : ",locationId)
  useEffect(() => {
    mapboxgl.accessToken = token;

    if (mapContainerRef.current) {
      mapRef.current = new mapboxgl.Map({
        container: mapContainerRef.current,
        center: [18.5, 5], 
        zoom: 3.5 
      });
    }
  },[]);

  const SearchSuggestions=(e: React.ChangeEvent<HTMLInputElement>)=>{
        const value = e.target.value;
    setQuery(value);

    if (value.trim() === "") {
      setSuggestions([]);
      return;
    }
    const GetSuggestions=(latitude?: number, longitude?: number)=>{
        
        
  if (latitude !== undefined && longitude !== undefined) {
        const proximityParam = `${longitude},${latitude}`;
        fetch(`https://api.mapbox.com/search/searchbox/v1/suggest?q=${value.toLowerCase()}&access_token=${token}&proximity=${proximityParam}&session_token=${Sessiontoken}`)
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
        fetch(`https://api.mapbox.com/search/searchbox/v1/retrieve/${locationid}?&access_token=${token}&session_token=${Sessiontoken}`)
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
  return (
        <div className="flex flex-col-reverse   md:flex md:flex-row min-h-screen md:h-screen   -ml-5 "> 

       <div className=' flex  flex-grow md:flex-grow-0  border rounded-lg  md:w-[24%]'>
                <div className="flex flex-col border gap-2  p-1 rounded-lg w-full">
                        <div className="flex flex-col gap-3">
                        <h1 className="font-bold">Net Manager Map</h1>
                        <Input
                        placeholder="Search all locations" type="text"
                        value={query}
                        onChange={SearchSuggestions} name="Search" className="w-full" /> 
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
                        {suggestions.length > 0 && (
                                
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
                )}
                        </div>
                        
                </div>

       </div>
      
        <div className=" flex flex-grow   md:ml-[1%] bg-blue-400"> 
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
import React, { useState } from 'react'
import CountryList from "../CountryList"
import { Input } from "../../../ui/input"
import { Button } from '../../../ui/button';
import {FetchSuggestions,UserClick} from '@/core/apis/MapData';
type MapSideBarProps = {
        token: string;
        sessionToken:string;
        countryData: any;
        selectedCountry: any;
        setSelectedCountry: (country: any) => void;
        reset: () => void;
        handleUserClick:(data: any)=>void;
        siteDetails: any;
      };
const MapSideBar: React.FC<MapSideBarProps> = ({
        token,
        sessionToken,
        countryData,
        selectedCountry,
        setSelectedCountry,
        reset,
        handleUserClick,
        siteDetails,
      })=> {
                const [query, setQuery] = useState("");
                const [locationId,setlocationId] =useState("")
                const [suggestions, setSuggestions] = useState<any[]>([]);
                
        const SearchSuggestions=(e: React.ChangeEvent<HTMLInputElement>)=>{
                const value = e.target.value;
            setQuery(value);
        
            if (value.trim() === "") {
              setSuggestions([]);
              reset()
              return;
            }
            const GetSuggestions=(latitude?: number, longitude?: number)=>{
                if (!token || !sessionToken) {
                  console.error('Missing required tokens');
                         return;
                }
                FetchSuggestions(value, token, sessionToken, latitude, longitude)
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
                        handleUserClick(data)
                        })
                        .catch(error => console.error("Error fetching location:", error));
        
          }

  return (
        <div className=' flex  flex-grow md:flex-grow-0  border rounded-lg  md:w-[24%]'>
        <div className="flex flex-col border gap-2  p-1 rounded-lg w-full">
                <div className="flex flex-col gap-3">
                <h1 className="font-bold">Net Manager Map</h1>
                <h1 className='text-gray-600'>Navigate air quality analytics with precision and actionable tips.</h1>
                <div className="relative w-full">
                    <Input
                    placeholder="Search all locations" type="text"
                    value={query}
                    onChange={SearchSuggestions} name="Search" className="w-full pr-10" />
                    
                </div>
                <div className='flex items-center overflow-hidden px-4 transition-all duration-300 ease-in-out'>
                        <Button
                        type="button"
                         className='flex py-[3px] px-[10px] border-none rounded-xl mb-3 text-sm font-medium'
                        >
                                ALL
                        </Button>
                        <div className='flex scrollbar-hide overflow-x-auto gap-2 '>
                                <CountryList
                                data={countryData}
                                selectedCountry={selectedCountry}
                                setSelectedCountry={setSelectedCountry}
                                siteDetails={siteDetails}
                                />
                        </div>
                      
                </div>
                <div className="border border-secondary-neutral-light-100 " />
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
                <div  className="text-gray-500 bg-white w-full border border-gray-300 mt-1 rounded-md shadow-md max-h-40 overflow-y-auto p-2 hover:bg-gray-200 cursor-pointer">
                        Type to see Suggestions...
                </div>
        )}
                </div>
                
        </div>

</div>
  )
}

export default MapSideBar
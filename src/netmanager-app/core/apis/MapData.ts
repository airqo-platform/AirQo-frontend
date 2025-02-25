import axios from "axios";
const AirQuoData = process.env.NEXT_PUBLIC_AIRQUO_DATA
const SUGGESTIONS = process.env.NEXT_PUBLIC_SUGGESTIONS
const SEARCH = process.env.NEXT_PUBLIC_SEARCH
export const token = process.env.NEXT_PUBLIC_MAP_API_TOKEN
export const AirQoToken = process.env.NEXT_PUBLIC_AIRQO_DATA_TOKEN
import Node from '@/public/images/map/Node.webp';
import Emoji from '@/public/images/map/Emoji.webp';
import Heatmap from '@/public/images/map/Heatmap.webp';
import Node_Number from '@/public/images/map/Node_number.webp';

import DarkMode from '@/public/images/map/dark.webp';
import LightMode from '@/public/images/map/light.webp';
import SatelliteMode from '@/public/images/map/satellite.webp';
import StreetsMode from '@/public/images/map/street.webp';
export const GetAirQuoData = async (token: string) =>{
        try {
                if(token){
                        const response = await axios.get(`${AirQuoData}?token=${token}`);
                const data = response.data;
                return data;
                }
                {
                        console.log("Error Token Is Missing")
                        return null;
                }
                
        }
        catch (error) {
                console.error('Error fetching GeoJSON:', error);
        }
}

export  const FetchSuggestions=async(value:string,access_token:string,sessionToken:string,latitude?: number, longitude?: number):Promise<any[] | void>=>{
        
        if (!access_token) {
                console.log("Missing Access Token");
                return;
        }
        
        if (latitude !== undefined && longitude !== undefined) {
                try{
                const proximityParam = `${longitude},${latitude}`;
                const response = await axios.get(`${SUGGESTIONS}?q=${value.toLowerCase()}&access_token=${access_token}&proximity=${proximityParam}&session_token=${sessionToken}`)
                const data = await response.data;
                
                console.log("data :",data.suggestions)
                 if (data.suggestions) {
                        return data.suggestions;
                                }else{
                                        console.log("Error fetching suggestions");
                                }
                        
                        }
                        catch(error){
                                console.error("Error fetching suggestions:", error);
                        }
                }}
export const UserClick = async(access_token:string,sessionToken:string,locationid: string,)=>{
        if (!access_token) {
                console.log("Missing Access Token");
                return;
        }

        const response = await axios.get((`${SEARCH}/${locationid}?&access_token=${access_token}&session_token=${sessionToken}`))
        const data = response.data;
        if(data){
                return data;
        }


}
export const mapStyles = [
        {
          url: 'mapbox://styles/mapbox/streets-v11',
          name: 'Streets',
          image: StreetsMode,
        },
        { url: 'mapbox://styles/mapbox/light-v10', name: 'Light', image: LightMode },
        { url: 'mapbox://styles/mapbox/dark-v10', name: 'Dark', image: DarkMode },
        {
          url: 'mapbox://styles/mapbox/satellite-v9',
          name: 'Satellite',
          image: SatelliteMode,
        },
      ];
      
      export const mapDetails = [
        {
          name: 'Emoji',
          image: Emoji,
        },
        {
          name: 'Heatmap',
          image: Heatmap,
        },
        {
          name: 'Node',
          image: Node,
        },
        {
          name: 'Number',
          image: Node_Number,
        },
      ];
      
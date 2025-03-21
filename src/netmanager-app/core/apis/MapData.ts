"use server"
import axios from "axios";
const token = process.env.NEXT_PUBLIC_MAP_API_TOKEN
const AirQoToken = process.env.AIRQO_DATA_TOKEN
import {AIRQUO_DATA,MAP_BOX_SUGGESTIONS,MAP_BOX_SEARCH} from "../urls"

export const GetAirQuoData = async () =>{
        try {
                if(AirQoToken){
                        const response = await axios.get(`${AIRQUO_DATA}?token=${AirQoToken}`);
                const data = response.data;
                return data;
                }
                {
                        console.log("Error Airquo Token Is Missing")
                        return null;
                }
                
        }
        catch (error) {
                console.error('Error fetching GeoJSON:', error);
        }
}

export  const FetchSuggestions=async(value:string,sessionToken:string,latitude?: number, longitude?: number):Promise<any[] | void>=>{
        
        if (!token) {
                console.log("Missing Map Box Access Token");
                return;
        }
        
        if (latitude !== undefined && longitude !== undefined) {
                try{
                const proximityParam = `${longitude},${latitude}`;
                const response = await axios.get(`${MAP_BOX_SUGGESTIONS}?q=${value.toLowerCase()}&access_token=${token}&proximity=${proximityParam}&session_token=${sessionToken}`)
                const data = await response.data;
                
                console.log("data :",data.suggestions)
                 if (data.suggestions) {
                        return data.suggestions;
                                }else{
                                        console.log("Error fetching suggestions");
                                }
                        
                        }
                        catch(error){
                                // console.error("Error fetching suggestions:", error);
                        }
                }}
export const UserClick = async(access_token:string,sessionToken:string,locationid: string,)=>{
        if (!access_token) {
                console.log("Missing Access Token");
                return;
        }

        const response = await axios.get((`${MAP_BOX_SEARCH}/${locationid}?&access_token=${access_token}&session_token=${sessionToken}`))
        const data = response.data;
        if(data){
                return data;
        }


}

      export const UserGroups = async (token: string) =>{
        try {
                if(token){
                        const response = await axios.get(`${AIRQUO_DATA}?token=${token}`);
                const data = response.data;
                return data;
                }
                {
                        console.log("Error Token Is Missing")
                        return null;
                }
                
        }
        catch (error) {
                // console.error('Error fetching GeoJSON:', error);
        }
}
// hooks/useMapboxData.ts
"use client"; 
import { useEffect, useState } from "react";
import {GetAirQuoData} from "../apis/MapData"

export function useMapData() {
  const [MapData, setMapData] = useState(null);
  const [Error, setError] = useState<string | null>(null);
  const [Loading, setLoading] = useState(false);

  useEffect(() => {
        const fetchData = async () => {
      try {
        const res = await GetAirQuoData();
        
        console.log("Fetched Data:", res); 

        if (!res){
                console.error("No data received from API");
        }
        setMapData(res);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [MapData]);

  return { MapData, Error, Loading };
}

import { Position } from "@/core/redux/slices/gridsSlice";
import { Site } from "./sites";

export interface CreateGrid {
  name: string;
  admin_level: string;
  shape: {
    type: "MultiPolygon" | "Polygon";
    coordinates: Position[][] | Position[][][];
  };
  network: string;
}

export interface Grid {
  _id: string;
  visibility: boolean;
  name: string;
  admin_level: string;
  network: string;
  long_name: string;
  createdAt: string;
  sites: Site[];
  numberOfSites: number;
}

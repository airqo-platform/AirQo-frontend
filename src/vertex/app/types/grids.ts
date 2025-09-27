import { Position } from "@/core/redux/slices/gridsSlice";
import { Site } from "./sites";
import { Group } from "./groups";

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
  groups?: Group[];
}

export interface GridsSummaryResponse {
  success: boolean;
  message: string;
  meta: {
    total: number;
    limit: number;
    skip: number;
    page: number;
    totalPages: number;
    nextPage?: string;
  };
  grids: Grid[];
}

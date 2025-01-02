export interface Site {
  id: string;
  name: string;
  description: string;
  country: string;
  district: string;
  region: string;
  latitude: number;
  longitude: number;
  network: string;
  parish: string;
  subCounty: string;
  altitude: number;
  greenness?: string;
  nearestRoad?: number;
  mobileAppName?: string;
  mobileAppDescription?: string;
}

export interface Device {
  name: string;
  description?: string;
  site?: string;
  isPrimary: boolean;
  isCoLocated: boolean;
  registrationDate: string;
  deploymentStatus: "Deployed" | "Pending" | "Removed";
}

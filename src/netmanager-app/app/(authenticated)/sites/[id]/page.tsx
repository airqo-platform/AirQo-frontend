"use client";

import { ChevronLeft, Edit2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { SiteForm } from "../site-form";
import { SiteDevices } from "./devices";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

// Sample site data
const siteData = {
  id: "site_528",
  name: "Water and Environment House, Luzira",
  description: "Water and Environment House, Luzira",
  organization: "AirQo",
  latitude: "0.302458",
  longitude: "32.641609",
  network: "airqo",
  parish: "Nakawa",
  subCounty: "Nakawa",
  district: "Kampala",
  region: "Central Region",
  altitude: "1177.3994140625",
  greenness: "",
  nearestRoad: undefined,
  mobileAppName: "Nakawa 528",
  mobileAppDescription: "Kampala, Uganda",
};

// Sample device data
const devices = [
  {
    name: "aq_g5_101",
    description: "",
    site: "Water and Environment House, Luzira",
    isPrimary: true,
    isCoLocated: false,
    registrationDate: "September 27, 2022",
    deploymentStatus: "Deployed" as const,
  },
];

export default function SiteDetailsPage() {

  return (
    <div className="p-6">
      <div className="mb-6">
        <Button variant="ghost" asChild className="mb-4">
          <Link href="/sites">
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to Sites
          </Link>
        </Button>
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-semibold">Site Details</h1>
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <Edit2 className="mr-2 h-4 w-4" />
                Edit Site
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Edit Site</DialogTitle>
                <DialogDescription>
                  Make changes to the site details here. Click save when you&apos;re
                  done.
                </DialogDescription>
              </DialogHeader>
              <SiteForm initialData={siteData} />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Site Information</CardTitle>
            <CardDescription>Details about the monitoring site</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold">Name</h3>
              <p>{siteData.name}</p>
            </div>
            <div>
              <h3 className="font-semibold">Description</h3>
              <p>{siteData.description}</p>
            </div>
            <div>
              <h3 className="font-semibold">Organization</h3>
              <p>{siteData.organization}</p>
            </div>
            <div>
              <h3 className="font-semibold">Network</h3>
              <p>{siteData.network}</p>
            </div>
            <div>
              <h3 className="font-semibold">Latitude</h3>
              <p>{siteData.latitude}</p>
            </div>
            <div>
              <h3 className="font-semibold">Longitude</h3>
              <p>{siteData.longitude}</p>
            </div>
            <div>
              <h3 className="font-semibold">Parish</h3>
              <p>{siteData.parish}</p>
            </div>
            <div>
              <h3 className="font-semibold">Sub County</h3>
              <p>{siteData.subCounty}</p>
            </div>
            <div>
              <h3 className="font-semibold">District</h3>
              <p>{siteData.district}</p>
            </div>
            <div>
              <h3 className="font-semibold">Region</h3>
              <p>{siteData.region}</p>
            </div>
            <div>
              <h3 className="font-semibold">Altitude</h3>
              <p>{siteData.altitude} m</p>
            </div>
            <div>
              <h3 className="font-semibold">Greenness</h3>
              <p>{siteData.greenness || "N/A"}</p>
            </div>
            <div>
              <h3 className="font-semibold">Nearest Road</h3>
              <p>
                {siteData.nearestRoad ? `${siteData.nearestRoad} m` : "N/A"}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Mobile App Details</CardTitle>
            <CardDescription>
              Information displayed in the mobile app
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold">Name</h3>
              <p>{siteData.mobileAppName}</p>
            </div>
            <div>
              <h3 className="font-semibold">Description</h3>
              <p>{siteData.mobileAppDescription}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Site Devices</CardTitle>
            <CardDescription>Devices deployed at this site</CardDescription>
          </CardHeader>
          <CardContent>
            <SiteDevices devices={devices} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

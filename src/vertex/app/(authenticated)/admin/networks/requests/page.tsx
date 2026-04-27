import { getServerSession } from "next-auth/next";
import { options } from "@/app/api/auth/[...nextauth]/options";
import NetworkRequestsClient from "./NetworkRequestsClient";
import { NetworkCreationRequest } from "@/core/apis/networks";
import logger from "@/lib/logger";

async function getNetworkRequests(): Promise<NetworkCreationRequest[]> {
  try {
    const session = await getServerSession(options);
    const token = (session as { user?: { accessToken?: string } })?.user?.accessToken;
    
    if (!token) {
      return [];
    }

    const adminSecret = process.env.ADMIN_SECRET;
    const backendUrl = `${process.env.NEXT_PUBLIC_API_URL}/devices/network-creation-requests`;
    
    const response = await fetch(`${backendUrl}?admin_secret=${adminSecret}`, {
      headers: {
        Authorization: token.startsWith("JWT ") ? token : `JWT ${token}`,
        "X-Auth-Type": "JWT"
      },
      next: { revalidate: 300, tags: ['network-requests'] } // Cache for 5 minutes
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch: ${response.statusText}`);
    }

    const data = await response.json();
    return data.network_creation_requests || [];
  } catch (error) {
    logger.error(`Error fetching network requests on server: ${error}`);
    return [];
  }
}

export default async function NetworkRequestsPage() {
  const requests = await getNetworkRequests();

  return <NetworkRequestsClient initialRequests={requests} />;
}

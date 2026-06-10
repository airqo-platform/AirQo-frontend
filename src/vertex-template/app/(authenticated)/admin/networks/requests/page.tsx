import { getServerSession } from "next-auth/next";
import { options } from "@/app/api/auth/[...nextauth]/options";
import NetworkRequestsClient from "./NetworkRequestsClient";
import { NetworkCreationRequest } from "@/core/apis/networks";
import logger from "@/lib/logger";

import { notFound } from "next/navigation";
import { networkService } from "@/core/services/network-service";

async function getNetworkRequests(): Promise<NetworkCreationRequest[]> {
  try {
    const session = await getServerSession(options);
    const token = (session as { user?: { accessToken?: string } })?.user?.accessToken;
    
    if (!token) {
      return [];
    }

    const adminSecret = process.env.ADMIN_SECRET;
    if (!adminSecret) {
      logger.error("ADMIN_SECRET is not defined in environment variables");
      return [];
    }
    
    return await networkService.getNetworkCreationRequests(token, adminSecret);
  } catch (error) {
    if (error instanceof Error && error.message === "NOT_FOUND") {
      notFound();
    }
    logger.error(`Error fetching network requests on server: ${error}`);
    return [];
  }
}

export default async function NetworkRequestsPage() {
  const requests = await getNetworkRequests();

  return <NetworkRequestsClient initialRequests={requests} />;
}

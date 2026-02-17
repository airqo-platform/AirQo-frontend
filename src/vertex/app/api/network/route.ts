import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { options } from "../auth/[...nextauth]/options";
import logger from "@/lib/logger";
import { CreateNetworkPayload, CreateNetworkResponse } from "@/core/apis/networks";
import axios from "axios";
import { networkFormSchema } from "@/components/features/networks/schema";

/**
 * Retrieves the access token from the server-side session.
 * @returns The access token or null if not found.
 */
async function getAuthToken(): Promise<string | null> {
  const session = await getServerSession(options);

  if (!session) {
    logger.warn("getServerSession returned null");
    return null;
  }

  const accessToken = (session as unknown as { user?: { accessToken?: string } })?.user?.accessToken;

  if (!accessToken) {
    logger.warn(`Session found but no accessToken in session.user. Session keys: ${Object.keys(session).join(', ')}`);
  }

  return accessToken || null;
}

export async function POST(req: NextRequest) {
  try {
    logger.info("Sensor Manufacturer creation request received");
    
    const body = await req.json();
    const validationResult = networkFormSchema.safeParse(body);

    if (!validationResult.success) {
      logger.warn(`Invalid payload: ${JSON.stringify(validationResult.error.issues)}`);
      return NextResponse.json(
        { message: "Invalid payload", errors: validationResult.error.issues },
        { status: 400 }
      );
    }

    const networkData = validationResult.data;
    
    const token = await getAuthToken();
    if (!token) {
      logger.error("No JWT token found in session");
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const authHeader = token.startsWith("JWT ") ? token : `JWT ${token}`;

    const adminSecret = process.env.ADMIN_SECRET;
    if (!adminSecret) {
      const envKeys = Object.keys(process.env).filter(key => key.includes('SECRET') || key.includes('ADMIN'));
      logger.error(`ADMIN_SECRET is not configured on the server. NODE_ENV: ${process.env.NODE_ENV}, Related env keys: ${envKeys.join(', ')}`);
      return NextResponse.json({ message: "Server configuration error." }, { status: 500 });
    }

    logger.debug("ADMIN_SECRET found, constructing payload");

    const payload: CreateNetworkPayload = { ...networkData, admin_secret: adminSecret };

    const backendApiUrl = `${process.env.NEXT_PUBLIC_API_URL}/users/networks`;

    const apiResponse = await axios.post<CreateNetworkResponse>(backendApiUrl, payload, {
      headers: {
        "Content-Type": "application/json",
        Authorization: authHeader,
        "X-Auth-Type": "JWT",
      },
    });

    logger.info(`Sensor Manufacturer created successfully - ID: ${apiResponse.data.created_network?._id}`);

    return NextResponse.json(apiResponse.data, { status: 200 });
  } catch (error: unknown) {
    const err = error as Error;
    logger.error(`API route error: ${err.message}`);
    
    if (axios.isAxiosError(error) && error.response) {
      const errorMessage = error.response.data?.message || error.response.data?.errors?.[0]?.message || 'Unknown error';
      logger.error(`Upstream API error - Status: ${error.response.status} ${error.response.statusText}, Message: ${errorMessage}`);
      
      return NextResponse.json(
        error.response.data || { message: "An error occurred" },
        { status: error.response.status }
      );
    }
    
    return NextResponse.json({ message: "An internal server error occurred." }, { status: 500 });
  }
}
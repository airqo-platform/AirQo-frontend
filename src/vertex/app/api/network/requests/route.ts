import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { options } from "../../auth/[...nextauth]/options";
import logger from "@/lib/logger";
import axios from "axios";

const BACKEND_URL = `${process.env.NEXT_PUBLIC_API_URL}/devices/network-creation-requests`;

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(options);
    const token = (session as any)?.user?.accessToken;
    
    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const adminSecret = process.env.ADMIN_SECRET;
    if (!adminSecret) {
      return NextResponse.json({ message: "Server configuration error" }, { status: 500 });
    }

    const { searchParams } = new URL(req.url);
    searchParams.set("admin_secret", adminSecret);

    const response = await axios.get(`${BACKEND_URL}?${searchParams.toString()}`, {
      headers: { 
        Authorization: token.startsWith("JWT ") ? token : `JWT ${token}`,
        "X-Auth-Type": "JWT"
      },
    });

    return NextResponse.json(response.data, { status: 200 });
  } catch (error: any) {
    logger.error(`Error fetching network requests: ${error.message}`);
    return NextResponse.json(
      error.response?.data || { message: "Internal server error" },
      { status: error.response?.status || 500 }
    );
  }
}

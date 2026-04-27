import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { options } from "@/app/api/auth/[...nextauth]/options";
import logger from "@/lib/logger";
import axios from "axios";

async function getAuthToken(): Promise<string | null> {
  const session = await getServerSession(options);
  return (session as { user?: { accessToken?: string } })?.user?.accessToken || null;
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string; action: string } }
) {
  try {
    const { id, action } = params;
    const allowedActions = ["approve", "deny", "review"];

    if (!allowedActions.includes(action)) {
      return NextResponse.json({ message: "Invalid action" }, { status: 400 });
    }

    const token = await getAuthToken();
    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const adminSecret = process.env.ADMIN_SECRET;
    if (!adminSecret) {
      return NextResponse.json({ message: "Server configuration error" }, { status: 500 });
    }

    const body = await req.json();
    const payload = {
      ...body,
      admin_secret: adminSecret,
    };

    const backendUrl = `${process.env.NEXT_PUBLIC_API_URL}/devices/network-creation-requests/${id}/${action}`;
    
    logger.info(`Performing ${action} on network request ${id}`);

    const response = await axios.put(backendUrl, payload, {
      headers: { 
        Authorization: token.startsWith("JWT ") ? token : `JWT ${token}`,
        "X-Auth-Type": "JWT"
      },
    });

    return NextResponse.json(response.data, { status: 200 });
  } catch (error: unknown) {
    const err = error as { message: string; response?: { data: unknown; status: number } };
    logger.error(`Error updating network request status: ${err.message}`);
    return NextResponse.json(
      err.response?.data || { message: "Internal server error" },
      { status: err.response?.status || 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { options } from "@/app/api/auth/[...nextauth]/options";
import logger from "@/lib/logger";
import { networkService } from "@/core/services/network-service";

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
    const notes = body.reviewer_notes || "";

    const responseData = await networkService.updateNetworkRequestStatus(
      id,
      action,
      notes,
      token,
      adminSecret
    );

    return NextResponse.json(responseData, { status: 200 });
  } catch (error: unknown) {
    const err = error as { message: string; status?: number };
    logger.error(`Error updating network request status in route handler: ${err.message}`);
    
    return NextResponse.json(
      { message: err.message || "Internal server error" },
      { status: err.status || 500 }
    );
  }
}

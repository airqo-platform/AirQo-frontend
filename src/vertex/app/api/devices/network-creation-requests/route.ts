import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { options } from "../../auth/[...nextauth]/options";
import logger from "@/lib/logger";
import { networkService } from "@/core/services/network-service";

export async function GET() {
  try {
    const session = await getServerSession(options);
    const token = (session as { user?: { accessToken?: string } })?.user?.accessToken;
    
    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const adminSecret = process.env.ADMIN_SECRET;
    if (!adminSecret) {
      return NextResponse.json({ message: "Server configuration error" }, { status: 500 });
    }

    const data = await networkService.getNetworkCreationRequests(token, adminSecret);

    return NextResponse.json({ network_creation_requests: data, success: true }, { status: 200 });
  } catch (error: unknown) {
    if (error instanceof Error && error.message === "NOT_FOUND") {
      return NextResponse.json({ message: "Resource not found" }, { status: 404 });
    }
    const err = error as { message: string; status?: number; data?: unknown };
    logger.error(`Error fetching network requests in route handler: ${err.message}`);
    return NextResponse.json(
      err.data || { message: err.message || "Internal server error" },
      { status: err.status || 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = await networkService.submitNetworkRequest(body);
    return NextResponse.json(data, { status: 200 });
  } catch (error: unknown) {
    const err = error as { message: string; status?: number; data?: unknown };
    logger.error(`Error submitting network request in route handler: ${err.message}`);
    return NextResponse.json(
      err.data || { message: err.message || "Internal server error" },
      { status: err.status || 500 }
    );
  }
}

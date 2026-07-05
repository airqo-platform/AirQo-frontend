import type { Session } from "next-auth";
import { vertexConfig } from "@/vertex.config";
import { mockUser } from "@/core/adapters/mock-fixtures";

/**
 * True when the app runs without an authentication provider
 * (auth.provider: "none" in vertex.config.ts). In this mode the app
 * boots straight into the dashboard with a synthetic session backed
 * by the mock adapter's user.
 */
export const isAuthDisabled = vertexConfig.auth.provider === "none";

const ONE_YEAR_MS = 365 * 24 * 60 * 60 * 1000;

export function createMockSession(): Session {
  return {
    user: {
      id: mockUser._id,
      name: `${mockUser.firstName} ${mockUser.lastName}`,
      email: mockUser.email,
      image: mockUser.profilePicture,
    } as Session["user"],
    expires: new Date(Date.now() + ONE_YEAR_MS).toISOString(),
  };
}

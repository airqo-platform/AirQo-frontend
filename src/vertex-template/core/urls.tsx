import { stripTrailingSlash } from "@/lib/utils";
import { vertexConfig } from "@/vertex.config";

const ANALYTICS_BASE_URL = stripTrailingSlash(
  process.env.NEXT_PUBLIC_ANALYTICS_URL || vertexConfig.links.analyticsUrl || ""
);

// Account self-service lives on the external analytics platform. When no
// analytics URL is configured (the template default), these are null and
// callers must hide the corresponding links instead of rendering relative
// paths on the app origin.
export const forgotPasswordUrl = ANALYTICS_BASE_URL
  ? `${ANALYTICS_BASE_URL}/user/forgotPwd`
  : null;
export const signUpUrl = ANALYTICS_BASE_URL
  ? `${ANALYTICS_BASE_URL}/user/creation/individual/register`
  : null;

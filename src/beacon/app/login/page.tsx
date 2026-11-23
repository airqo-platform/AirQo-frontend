"use client"

import { beaconConfig } from "@/beacon.config"
import DemoLogin from "@/components/auth/demo-login"
import PlatformLogin from "@/components/auth/platform-login"

/** The platform sign-in, or the demo sign-in when `auth.provider` is "none". */
export default function LoginPage() {
  return beaconConfig.auth.provider === "platform" ? <PlatformLogin /> : <DemoLogin />
}

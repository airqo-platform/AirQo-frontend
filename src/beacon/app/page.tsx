import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { ROUTES } from "@/lib/navigation"

export default function Home() {
  // GroupProvider sets this cookie; AirQo admins keep going straight to the fleet
  const isAirqoAdmin = cookies().get("isAirqoAdmin")?.value === "true"
  redirect(isAirqoAdmin ? ROUTES.DEVICES : ROUTES.HOME)
  return null
}

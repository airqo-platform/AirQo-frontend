import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { ROUTES } from "@/lib/navigation"

export default function Home() {
  // GroupProvider sets this cookie; system group admins go straight to the fleet
  const isSystemAdmin = cookies().get("isSystemAdmin")?.value === "true"
  redirect(isSystemAdmin ? ROUTES.DEVICES : ROUTES.HOME)
  return null
}

import { redirect } from "next/navigation"

export default function Home() {
  redirect("/dashboard/devices")
  return null
}


import { useAppSelector } from "@/core/redux/hooks"
import { redirect } from "next/navigation"
import { OrganizationList } from "./organization-list"

export const OrganizationSettingsPage =() => {
  const user = useAppSelector((state) => state.user.userDetails)

  if (!user || user.role !== "AIRQO_SUPER_ADMIN") {
    redirect("/")
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Organization Settings</h1>
      <OrganizationList />
    </div>
  )
}


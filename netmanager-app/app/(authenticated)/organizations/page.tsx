
// import { useAppSelector } from "@/core/redux/hooks"
// import { redirect } from "next/navigation"
import { OrganizationList } from "@/components/Organization/List"

const OrganizationSettingsPage = () => {
  // const user = useAppSelector((state) => state.user.userDetails)

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Organization Settings</h1>
      <OrganizationList />
    </div>
  )
}

export default OrganizationSettingsPage;

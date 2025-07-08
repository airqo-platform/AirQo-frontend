import UserStatsDashboard from "@/components/features/userstats/user-stats-dashboard"
import { RouteGuard } from "@/components/layout/accessConfig/route-guard"
import { PERMISSIONS } from "@/core/permissions/constants"

export default function UserManagementPage() {
  return (
    <RouteGuard 
      permission={PERMISSIONS.USER.VIEW}
      allowedContexts={['airqo-internal', 'external-org']}
    >
      <main className="min-h-screen bg-gray-50">
        <UserStatsDashboard />
      </main>
    </RouteGuard>
  )
}

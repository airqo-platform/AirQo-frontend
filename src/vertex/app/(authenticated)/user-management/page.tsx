import { RouteGuard } from "@/components/layout/accessConfig/route-guard"
import { PERMISSIONS } from "@/core/permissions/constants"

export default function UserManagementPage() {
  return (
    <RouteGuard 
      permission={PERMISSIONS.USER.VIEW}
      allowedContexts={['airqo-internal']}
    >
      <main className="min-h-screen bg-gray-50">
        <p>Coming soon</p>
      </main>
    </RouteGuard>
  )
}

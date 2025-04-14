import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, UserCheck, Key } from "lucide-react"

interface StatsCardsProps {
  totalUsers: number
  activeUsers: number
  apiUsers: number
}

export function StatsCards({ totalUsers, activeUsers, apiUsers }: StatsCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card className="overflow-hidden border-none shadow-md relative">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-indigo-600/5 dark:from-indigo-500/20 dark:to-indigo-600/10 z-0"></div>
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0 relative z-10">
          <CardTitle className="text-sm font-medium">Total Users</CardTitle>
          <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center">
            <Users className="h-4 w-4 text-indigo-600" />
          </div>
        </CardHeader>
        <CardContent className="relative z-10">
          <div className="text-2xl font-bold text-indigo-700">{totalUsers.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground mt-1">All registered users in the system</p>
        </CardContent>
      </Card>

      <Card className="overflow-hidden border-none shadow-md relative">
        <div className="absolute inset-0 bg-gradient-to-br from-pink-500/10 to-pink-600/5 dark:from-pink-500/20 dark:to-pink-600/10 z-0"></div>
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0 relative z-10">
          <CardTitle className="text-sm font-medium">Active Users</CardTitle>
          <div className="h-8 w-8 rounded-full bg-pink-100 flex items-center justify-center">
            <UserCheck className="h-4 w-4 text-pink-600" />
          </div>
        </CardHeader>
        <CardContent className="relative z-10">
          <div className="text-2xl font-bold text-pink-700">{activeUsers.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground mt-1">Users who are currently active</p>
        </CardContent>
      </Card>

      <Card className="overflow-hidden border-none shadow-md relative">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-cyan-600/5 dark:from-cyan-500/20 dark:to-cyan-600/10 z-0"></div>
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0 relative z-10">
          <CardTitle className="text-sm font-medium">API Users</CardTitle>
          <div className="h-8 w-8 rounded-full bg-cyan-100 flex items-center justify-center">
            <Key className="h-4 w-4 text-cyan-600" />
          </div>
        </CardHeader>
        <CardContent className="relative z-10">
          <div className="text-2xl font-bold text-cyan-700">{apiUsers.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground mt-1">Users with API access</p>
        </CardContent>
      </Card>
    </div>
  )
}

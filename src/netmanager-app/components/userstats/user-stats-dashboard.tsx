"use client"

import { useState } from "react"
import { useUserStats } from "@/core/hooks/useUserStats"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { UserTable } from "@/components/userstats/user-table"
import { StatsCards } from "@/components/userstats/stats-cards"
import { UserDistributionChart } from "@/components/userstats/user-distribution-chart"
import { UserSearch } from "@/components/userstats/user-search"
import { Skeleton } from "@/components/ui/skeleton"
import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function UserStatsDashboard() {
    const { data, isLoading, error } = useUserStats()
    const [searchTerm, setSearchTerm] = useState("")
  
    if (error) {
      return (
        <div className="container mx-auto py-10 px-4">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>Failed to load user statistics. Please try again later.</AlertDescription>
          </Alert>
        </div>
      )
    }
  
    return (
      <div className="container mx-auto py-10 px-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">User Statistics</h1>
            <p className="text-muted-foreground mt-1">Overview of all registered users in the system</p>
          </div>
          {!isLoading && data && <UserSearch searchTerm={searchTerm} setSearchTerm={setSearchTerm} />}
        </div>
  
        {isLoading ? (
          <LoadingState />
        ) : (
          data && (
            <>
              <StatsCards
                totalUsers={data.users_stats.users.number}
                activeUsers={data.users_stats.active_users.number}
                apiUsers={data.users_stats.api_users.number}
              />
  
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
                <Card className="lg:col-span-2">
                  <CardHeader>
                    <CardTitle>User Distribution</CardTitle>
                    <CardDescription>Breakdown of user types in the system</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-2">
                    <UserDistributionChart
                      totalUsers={data.users_stats.users.number}
                      activeUsers={data.users_stats.active_users.number}
                      apiUsers={data.users_stats.api_users.number}
                    />
                  </CardContent>
                </Card>
  
                <Card className="overflow-hidden border-none shadow-md relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-violet-500/10 to-violet-600/5 z-0"></div>
                  <CardHeader className="relative z-10">
                    <CardTitle>User Activity</CardTitle>
                    <CardDescription>Active vs. Inactive Users</CardDescription>
                  </CardHeader>
                  <CardContent className="h-[300px] flex items-center justify-center relative z-10">
                    <div className="w-full max-w-[200px] aspect-square relative">
                      <div className="w-full h-full rounded-full bg-gray-100 flex items-center justify-center">
                        <div
                          className="absolute inset-0 rounded-full border-8 border-violet-500"
                          style={{
                            clipPath: `polygon(0 0, 100% 0, 100% 100%, 0 100%, 0 ${100 - (data.users_stats.active_users.number / data.users_stats.users.number) * 100}%)`,
                          }}
                        ></div>
                        <div className="text-center">
                          <p className="text-4xl font-bold text-violet-600">
                            {Math.round((data.users_stats.active_users.number / data.users_stats.users.number) * 100)}%
                          </p>
                          <p className="text-sm text-muted-foreground">Active</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
  
              <div className="mt-8">
                <Tabs defaultValue="all-users">
                  <TabsList className="mb-4">
                    <TabsTrigger value="all-users">All Users</TabsTrigger>
                    <TabsTrigger value="active-users">Active Users</TabsTrigger>
                    <TabsTrigger value="api-users">API Users</TabsTrigger>
                  </TabsList>
                  <TabsContent value="all-users">
                    <UserTable users={data.users_stats.users.details} searchTerm={searchTerm} />
                  </TabsContent>
                  <TabsContent value="active-users">
                    <UserTable users={data.users_stats.active_users.details} searchTerm={searchTerm} />
                  </TabsContent>
                  <TabsContent value="api-users">
                    <UserTable users={data.users_stats.api_users.details} searchTerm={searchTerm} />
                  </TabsContent>
                </Tabs>
              </div>
            </>
          )
        )}
      </div>
    )
  }
  
  function LoadingState() {
    return (
      <>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>
  
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
          <Card className="lg:col-span-2">
            <CardHeader>
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-4 w-48" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-[300px] w-full" />
            </CardContent>
          </Card>
  
          <Card>
            <CardHeader>
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-4 w-48" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-[300px] w-full" />
            </CardContent>
          </Card>
        </div>
  
        <Card className="mt-8">
          <CardHeader>
            <Skeleton className="h-5 w-32" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-[400px] w-full" />
          </CardContent>
        </Card>
      </>
    )
  }
  
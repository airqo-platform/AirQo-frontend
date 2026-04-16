"use client";

import { useNetworkRequests } from "@/core/hooks/useNetworks";
import NetworkRequestTable from "@/components/features/networks/request-table";
import { RouteGuard } from "@/components/layout/accessConfig/route-guard";
import { PERMISSIONS } from "@/core/permissions/constants";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

export default function NetworkRequestsPage() {
  const { data: requests = [], isLoading } = useNetworkRequests();
  const router = useRouter();

  return (
    <RouteGuard permission={PERMISSIONS.NETWORK.VIEW}>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
                <button 
                    onClick={() => router.push('/admin/networks')}
                    className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                >
                    <ArrowLeft className="h-4 w-4" />
                </button>
                <h1 className="text-2xl font-semibold">Sensor Manufacturer Requests</h1>
            </div>
            <p className="text-sm text-muted-foreground ml-7">
                Review and manage onboarding requests from external sensor manufacturers.
            </p>
          </div>
        </div>

        <div className="bg-white rounded-lg border shadow-sm">
          <NetworkRequestTable 
            requests={requests} 
            isLoading={isLoading} 
          />
        </div>
      </div>
    </RouteGuard>
  );
}

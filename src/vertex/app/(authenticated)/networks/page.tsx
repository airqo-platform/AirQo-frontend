"use client";

import ClientPaginatedNetworksTable from "@/components/features/networks/client-paginated-networks-table";
import { CreateNetworkForm } from "@/components/features/networks/create-network-form";
import { RouteGuard } from "@/components/layout/accessConfig/route-guard";
import { useNetworks } from "@/core/hooks/useNetworks";

export default function NetworksPage() {
  const { networks, isFetching, error } = useNetworks();

  return (
    <RouteGuard permission={"SUPER_ADMIN"} allowedContexts={['airqo-internal']}>
      <div>
        <div className="flex justify-between items-center mb-3">
          <div>
            <h1 className="text-2xl font-semibold">Networks</h1>
            <p className="text-sm text-muted-foreground">
              Manage and organize your networks
            </p>
          </div>
          <CreateNetworkForm />
        </div>

        <div>
          <ClientPaginatedNetworksTable
            networks={networks}
            isLoading={isFetching}
            error={error}
            itemsPerPage={25}
            onNetworkClick={(network) => {
              // Handle network click, e.g., navigate to network details page
              console.log("Clicked on network:", network);
            }}
          />
        </div>
      </div>
    </RouteGuard>
  );
}
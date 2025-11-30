"use client";

import ClientPaginatedNetworksTable from "@/components/features/networks/client-paginated-networks-table";
import { CreateNetworkForm } from "@/components/features/networks/create-network-form";
import { useNetworks } from "@/core/hooks/useNetworks";

export default function NetworksPage() {
  const { networks, isFetching, error } = useNetworks();

  return (
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
        />
      </div>
    </div>
  );
}
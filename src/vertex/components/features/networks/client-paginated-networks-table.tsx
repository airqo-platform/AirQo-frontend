import { ExclamationTriangleIcon } from "@radix-ui/react-icons";
import ReusableTable, {
  TableColumn,
  TableItem,
} from "@/components/shared/table/ReusableTable";
import { useRouter } from "next/navigation";
import { Network } from "@/core/apis/networks";
import { AqCopy01, AqLinkExternal01 } from "@airqo/icons-react";
import ReusableToast from "@/components/shared/toast/ReusableToast";

interface NetworksTableProps {
  networks: Network[];
  isLoading?: boolean;
  error?: Error | null;
  itemsPerPage?: number;
  onNetworkClick?: (network: Network) => void;
}

type TableNetwork = TableItem<unknown>;

export default function ClientPaginatedNetworksTable({
  networks,
  isLoading = false,
  error = null,
  itemsPerPage = 10,
  onNetworkClick,
}: NetworksTableProps) {
  const router = useRouter();

  const handleNetworkClick = (item: unknown) => {
    const network = item as Network;
    if (onNetworkClick) onNetworkClick(network);
    else if (network._id) router.push(`/admin/networks/${network._id}`);
  };

  const handleCopy = async (text: string, event: React.MouseEvent) => {
    event.stopPropagation();
    if (text) {
      try {
        await navigator.clipboard.writeText(text);
        ReusableToast({ message: "Network ID copied", type: "SUCCESS" });
      } catch (err) {
        ReusableToast({ message: "Failed to copy ID", type: "ERROR" });
      }
    }
  };

  const networksWithId: TableNetwork[] = networks
    .filter(
      (n): n is Network & { _id: string } =>
        typeof n._id === "string" && n._id.trim() !== ""
    )
    .map((n) => ({
      ...n,
      id: n._id,
    }));

  const columns: TableColumn<TableNetwork>[] = [
    {
      key: "net_name",
      label: "Name",
      render: (value) => {
        const name = typeof value === "string" ? value : "";
        return (
          <span className="uppercase max-w-52 w-full truncate" title={name}>
              {name}
            </span>
        );
      },
    },
    {
      key: "_id",
      label: "Network ID",
      render: (value) => {
        const id = typeof value === "string" ? value : "N/A";
        if (id === "N/A") {
          return <span className="text-muted-foreground">N/A</span>;
        }
        return <div className="flex items-center gap-2">
            <span className="truncate max-w-xs" title={id}>{id}</span>
            <button
              type="button"
              onClick={(e) => handleCopy(id, e)}
              className="text-gray-500 hover:text-primary p-1 rounded-md focus:outline-none"
              aria-label="Copy Network ID"
            >
              <AqCopy01 className="h-4 w-4" />
            </button>
          </div>;
      },
    },
    {
      key: "net_website",
      label: "Website",
      render: (value) => {
        const url = String(value);
        const isValidUrl = url.startsWith("http://") || url.startsWith("https://");

        if (isValidUrl) {
          return (
            <a
              className="group text-blue-600 hover:underline max-w-xs flex items-center gap-2"
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              title={url}
              onClick={(e) => e.stopPropagation()}
            >
              <span className="truncate">{url}</span>
              <AqLinkExternal01 className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
            </a>
          );
        }
        return <span className="truncate max-w-xs" title={url}>{url}</span>;
      },
    },
  ];

  return (
    <div className="space-y-4">
      <ReusableTable
        title="Networks"
        data={networksWithId}
        columns={columns}
        loading={isLoading}
        pageSize={itemsPerPage}
        onRowClick={handleNetworkClick}
        emptyState={
          error ? (
            <div className="flex flex-col items-center gap-2">
              <ExclamationTriangleIcon className="h-8 w-8 text-muted-foreground" />
              <p className="text-muted-foreground">Unable to load networks</p>
              <p className="text-sm text-muted-foreground">{error.message}</p>
            </div>
          ) : (
            "No networks available"
          )
        }
        searchableColumns={["net_name"]}
      />
    </div>
  );
}
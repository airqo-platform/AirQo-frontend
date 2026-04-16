"use client";

import ReusableTable, {
  TableColumn,
} from "@/components/shared/table/ReusableTable";
import { NetworkCreationRequest } from "@/core/apis/networks";
import { Badge } from "@/components/ui/badge";
import { Check, X, Eye, MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface RequestTableProps {
  requests: NetworkCreationRequest[];
  isLoading: boolean;
  onAction: (request: NetworkCreationRequest, type: 'approve' | 'deny' | 'review') => void;
}

interface TableRequest extends NetworkCreationRequest {
  id: string | number;
  [key: string]: unknown;
}

export default function NetworkRequestTable({ requests, isLoading, onAction }: RequestTableProps) {
  const columns: TableColumn<TableRequest>[] = [
    {
      key: "net_name",
      label: "Manufacturer",
      render: (value, item) => (
        <div className="flex flex-col">
          <span className="font-medium uppercase">{String(value)}</span>
          <span className="text-xs text-muted-foreground">{item.net_acronym || 'No acronym'}</span>
        </div>
      )
    },
    {
        key: "requester_name",
        label: "Requester",
        render: (value, item) => (
          <div className="flex flex-col">
            <span>{String(value)}</span>
            <span className="text-xs text-muted-foreground">{item.requester_email}</span>
          </div>
        )
    },
    {
      key: "status",
      label: "Status",
      render: (value) => {
        const status = String(value);
        const variants: Record<string, string> = {
          pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
          under_review: "bg-blue-100 text-blue-800 border-blue-200",
          approved: "bg-green-100 text-green-800 border-green-200",
          denied: "bg-red-100 text-red-800 border-red-200",
        };
        return (
          <Badge className={`capitalize shadow-none ${variants[status] || ""}`}>
            {status.replace("_", " ")}
          </Badge>
        );
      }
    },
    {
      key: "createdAt",
      label: "Submitted",
      render: (value) => new Date(String(value)).toLocaleDateString()
    },
    {
      key: "actions",
      label: "Actions",
      render: (_, item) => {
        const canAction = item.status === 'pending' || item.status === 'under_review';
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <MoreHorizontal className="h-4 w-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {canAction && (
                <>
                  <DropdownMenuItem onClick={() => onAction(item, 'approve')} className="text-green-600">
                    <Check className="mr-2 h-4 w-4" /> Approve
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onAction(item, 'deny')} className="text-red-600">
                    <X className="mr-2 h-4 w-4" /> Deny
                  </DropdownMenuItem>
                  {item.status === 'pending' && (
                    <DropdownMenuItem onClick={() => onAction(item, 'review')}>
                      <Eye className="mr-2 h-4 w-4" /> Mark Under Review
                    </DropdownMenuItem>
                  )}
                </>
              )}
              {!canAction && (
                  <DropdownMenuItem disabled>No actions available</DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        );
      }
    }
  ];

  const data: TableRequest[] = requests.map(r => ({ ...r, id: r._id }));

  return (
    <ReusableTable
      title=""
      data={data}
      columns={columns}
      loading={isLoading}
      pageSize={10}
      searchableColumns={["net_name", "requester_name"]}
    />
  );
}

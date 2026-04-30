"use client";

import { useState, useMemo } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import NetworkRequestTable from "@/components/features/networks/request-table";
import { RouteGuard } from "@/components/layout/accessConfig/route-guard";
import { PERMISSIONS } from "@/core/permissions/constants";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { NetworkCreationRequest } from "@/core/apis/networks";
import ReusableDialog from "@/components/shared/dialog/ReusableDialog";
import ReusableInputField from "@/components/shared/inputfield/ReusableInputField";
import ReusableButton from "@/components/shared/button/ReusableButton";
import ReusableToast from "@/components/shared/toast/ReusableToast";
import { getApiErrorMessage } from "@/core/utils/getApiErrorMessage";

type TabStatus = "all" | "pending" | "under_review" | "approved" | "denied";

interface NetworkRequestsClientProps {
  initialRequests: NetworkCreationRequest[];
}

export default function NetworkRequestsClient({ initialRequests }: NetworkRequestsClientProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabStatus>("pending");
  const [isUpdating, setIsUpdating] = useState(false);
  
  // Action management
  const [selectedRequest, setSelectedRequest] = useState<NetworkCreationRequest | null>(null);
  const [actionType, setActionType] = useState<'approve' | 'deny' | 'review' | null>(null);
  const [notes, setNotes] = useState("");

  const handleRefresh = () => {
    router.refresh();
  };

  const counts = useMemo(() => ({
    all: initialRequests.length,
    pending: initialRequests.filter(r => r.status === "pending").length,
    under_review: initialRequests.filter(r => r.status === "under_review").length,
    approved: initialRequests.filter(r => r.status === "approved").length,
    denied: initialRequests.filter(r => r.status === "denied").length,
  }), [initialRequests]);

  const filteredRequests = useMemo(() => {
    let filtered = initialRequests;
    
    if (activeTab !== "all") {
      filtered = filtered.filter(r => r.status === activeTab);
    }
    
    return filtered;
  }, [initialRequests, activeTab]);

  const handleActionRequest = (request: NetworkCreationRequest, type: 'approve' | 'deny' | 'review') => {
    setSelectedRequest(request);
    setActionType(type);
    setNotes("");
  };

  const confirmAction = async () => {
    if (!selectedRequest || !actionType) return;
    
    setIsUpdating(true);
    try {
      const response = await axios.put(`/api/devices/network-creation-requests/${selectedRequest._id}/${actionType}`, {
        reviewer_notes: notes
      });

      ReusableToast({ 
        message: response.data.message || 'Status updated successfully', 
        type: 'SUCCESS' 
      });

      setSelectedRequest(null);
      setActionType(null);
      router.refresh(); // Invalidate server data
    } catch (error: unknown) {
      ReusableToast({ 
        message: `Action failed: ${getApiErrorMessage(error)}`, 
        type: 'ERROR' 
      });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <RouteGuard permission={PERMISSIONS.NETWORK.VIEW}>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Sensor Manufacturer Requests</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Manage and review new sensor requests across the platform.
            </p>
          </div>
        </div>

        {/* Filters & Tabs */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as TabStatus)} className="w-fit">
            <TabsList className="bg-gray-100/50 p-1">
              <TabsTrigger value="pending">
                Pending ({counts.pending})
              </TabsTrigger>
              <TabsTrigger value="under_review">
                In Review ({counts.under_review})
              </TabsTrigger>
              <TabsTrigger value="approved">
                Approved ({counts.approved})
              </TabsTrigger>
              <TabsTrigger value="denied">
                Denied ({counts.denied})
              </TabsTrigger>
              <TabsTrigger value="all">
                All ({counts.all})
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <ReusableButton 
            variant="outlined"
            padding="py-1 px-2"
            className="text-sm" 
            onClick={handleRefresh}
          >
            Refresh
          </ReusableButton>
        </div>

        {/* Table Content */}
        <div className="bg-white rounded-lg border shadow-sm">
          <NetworkRequestTable 
            requests={filteredRequests} 
            isLoading={false} 
            onAction={handleActionRequest}
          />
        </div>

        {/* Status Action Dialog */}
        <ReusableDialog
          isOpen={!!selectedRequest}
          onClose={() => setSelectedRequest(null)}
          title={`${actionType?.charAt(0).toUpperCase()}${actionType?.slice(1)} Request`}
          size="md"
          primaryAction={{
              label: isUpdating ? "Processing..." : "Confirm",
              onClick: confirmAction,
              disabled: isUpdating
          }}
          secondaryAction={{
              label: "Cancel",
              onClick: () => setSelectedRequest(null),
              variant: "outline"
          }}
        >
          <div className="space-y-4 py-2">
              <p className="text-sm text-muted-foreground">
                  You are about to {actionType} the request for <strong>{selectedRequest?.net_name}</strong>.
              </p>
              <ReusableInputField 
                  as="textarea"
                  label="Reviewer Notes (Optional)"
                  placeholder="Add any notes or context for this decision..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={4}
              />
              {actionType === 'deny' && (
                  <p className="text-xs text-red-500 italic">
                      Note: Denial notes will be included in the email notification to the requester.
                  </p>
              )}
          </div>
        </ReusableDialog>
      </div>
    </RouteGuard>
  );
}

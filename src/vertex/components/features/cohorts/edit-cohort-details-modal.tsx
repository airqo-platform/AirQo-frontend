"use client";

import React, { useEffect, useState } from "react";
import ReusableDialog from "@/components/shared/dialog/ReusableDialog";
import ReusableButton from "@/components/shared/button/ReusableButton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useUpdateCohortDetails } from "@/core/hooks/useCohorts";
import { usePermission } from "@/core/hooks/usePermissions";
import { PERMISSIONS } from "@/core/permissions/constants";
import PermissionTooltip from "@/components/ui/permission-tooltip";
import logger from "@/lib/logger";

interface CohortDetailsModalProps {
    open: boolean;
    cohortDetails: {
        name: string;
        id: string;
        visibility: boolean;
    };
    onClose: () => void;
}

const CohortDetailsModal: React.FC<CohortDetailsModalProps> = ({
    open,
    cohortDetails,
    onClose,
}) => {
    const [form, setForm] = useState({ name: cohortDetails.name, visibility: cohortDetails.visibility });
    const updateCohort = useUpdateCohortDetails();
    const canUpdate = usePermission(PERMISSIONS.DEVICE.UPDATE);

    useEffect(() => {
        setForm({ name: cohortDetails.name, visibility: cohortDetails.visibility });
    }, [cohortDetails]);

    useEffect(() => {
        if (!open) {
            setForm({ name: cohortDetails.name, visibility: cohortDetails.visibility });
        }
    }, [open, cohortDetails]);

    const handleCancel = () => {
        setForm({ name: cohortDetails.name, visibility: cohortDetails.visibility });
        onClose();
    };

    const handleSave = async () => {
        const updates: Partial<{ name: string; visibility: boolean }> = {};
        const trimmedName = form.name.trim();
        if (trimmedName.length === 0) return;
        if (trimmedName !== cohortDetails.name) updates.name = trimmedName;
        if (form.visibility !== cohortDetails.visibility) updates.visibility = form.visibility;

        if (Object.keys(updates).length === 0) return onClose();

        try {
            await updateCohort.mutateAsync({ cohortId: cohortDetails.id, data: updates });
            onClose();
        } catch {
            logger.info("Something went wrong")
        }
    };

    return (
        <ReusableDialog
            isOpen={open}
            onClose={handleCancel}
            title="Edit Cohort Details"
            size="xl"
            customFooter={
                <div className="flex items-center justify-end gap-3 w-full px-6 py-4 border-t border-gray-200 dark:border-gray-700">
                    <ReusableButton variant="outlined" onClick={handleCancel} disabled={updateCohort.isPending}>Cancel</ReusableButton>
                    {canUpdate ? (
                        <ReusableButton onClick={handleSave} disabled={updateCohort.isPending} variant="filled">
                            {updateCohort.isPending ? "Saving..." : "Save"}
                        </ReusableButton>
                    ) : (
                        <PermissionTooltip permission={PERMISSIONS.DEVICE.UPDATE}>
                            <span>
                                <ReusableButton disabled variant="filled">
                                    Save
                                </ReusableButton>
                            </span>
                        </PermissionTooltip>
                    )}
                </div>
            }
        >
            <div className="space-y-4">
                <div className="space-y-2">
                    <Label>Cohort Name *</Label>
                    <Input
                        value={form.name}
                        onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))}
                        placeholder="Enter cohort name"
                        disabled={updateCohort.isPending}
                    />
                </div>

                <div className="space-y-2">
                    <Label>Visibility *</Label>
                    <Select
                        value={String(form.visibility)}
                        onValueChange={(v) => setForm((s) => ({ ...s, visibility: v === "true" }))}
                        disabled={updateCohort.isPending}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Select visibility" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="true">Public</SelectItem>
                            <SelectItem value="false">Private</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>
        </ReusableDialog>
    );
};

export default CohortDetailsModal;
"use client";

import React, { useEffect, useState } from "react";
import ReusableDialog from "@/components/shared/dialog/ReusableDialog";
import ReusableButton from "@/components/shared/button/ReusableButton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { useUpdateCohortName } from "@/core/hooks/useCohorts";
import { PERMISSIONS } from "@/core/permissions/constants";
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
    const [form, setForm] = useState({ name: cohortDetails.name, updateReason: "" });
    const updateCohortName = useUpdateCohortName();

    useEffect(() => {
        setForm({ name: cohortDetails.name, updateReason: "" });
    }, [cohortDetails]);

    useEffect(() => {
        if (!open) {
            setForm({ name: cohortDetails.name, updateReason: "" });
        }
    }, [open, cohortDetails]);

    const handleCancel = () => {
        setForm({ name: cohortDetails.name, updateReason: "" });
        onClose();
    };

    const handleSave = async () => {
        const trimmedName = form.name.trim();
        const trimmedReason = form.updateReason.trim();
        if (trimmedName.length === 0) return;
        if (trimmedName === cohortDetails.name) return onClose();
        if (trimmedReason.length === 0) return;

        try {
            await updateCohortName.mutateAsync({
                cohortId: cohortDetails.id,
                name: trimmedName,
                updateReason: trimmedReason,
            });
            onClose();
        } catch {
            logger.info("Something went wrong")
        }
    };

    const trimmedName = form.name.trim();
    const trimmedReason = form.updateReason.trim();
    const canSave =
        trimmedName.length > 0 &&
        trimmedReason.length > 0 &&
        trimmedName !== cohortDetails.name;

    return (
        <ReusableDialog
            isOpen={open}
            onClose={handleCancel}
            title="Edit Cohort Details"
            size="xl"
            customFooter={
                <div className="flex items-center justify-end gap-3 w-full px-6 py-4 border-t border-gray-200 dark:border-gray-700">
                    <ReusableButton variant="outlined" onClick={handleCancel} disabled={updateCohortName.isPending}>Cancel</ReusableButton>
                    <ReusableButton onClick={handleSave} disabled={!canSave || updateCohortName.isPending} variant="filled" permission={PERMISSIONS.DEVICE.UPDATE}>
                        {updateCohortName.isPending ? "Saving..." : "Save"}
                    </ReusableButton>
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
                        disabled={updateCohortName.isPending}
                    />
                </div>
                <div className="space-y-2">
                    <Label>Update Reason *</Label>
                    <Input
                        value={form.updateReason}
                        onChange={(e) => setForm((s) => ({ ...s, updateReason: e.target.value }))}
                        placeholder="Why is this name changing?"
                        disabled={updateCohortName.isPending}
                    />
                </div>
            </div>
        </ReusableDialog>
    );
};

export default CohortDetailsModal;

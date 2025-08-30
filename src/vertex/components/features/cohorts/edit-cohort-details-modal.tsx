import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import React, { useEffect, useState } from "react";
import { useUpdateCohortDetails } from "@/core/hooks/useCohorts";
import { usePermission } from "@/core/hooks/usePermissions";
import { PERMISSIONS } from "@/core/permissions/constants";
import PermissionTooltip from "@/components/ui/permission-tooltip";
import logger from "@/lib/logger";

interface CohortDetailsModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    cohortDetails: {
        name: string;
        id: string;
        visibility: boolean;
    };
    onClose: () => void;
}

const CohortDetailsModal: React.FC<CohortDetailsModalProps> = ({
    open,
    onOpenChange,
    cohortDetails,
    onClose,
}) => {
    const [form, setForm] = useState({ name: cohortDetails.name, visibility: cohortDetails.visibility });
    const updateCohort = useUpdateCohortDetails();
    const canUpdate = usePermission(PERMISSIONS.DEVICE.UPDATE);

    useEffect(() => {
        setForm({ name: cohortDetails.name, visibility: cohortDetails.visibility });
    }, [cohortDetails]);

    const handleCancel = () => {
        setForm({ name: cohortDetails.name, visibility: cohortDetails.visibility });
        onClose();
    };

    const handleSave = async () => {
        const updates: Partial<{ name: string; visibility: boolean }> = {};
        if (form.name !== cohortDetails.name) updates.name = form.name;
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
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-xl">
                <DialogHeader>
                    <DialogTitle className="text-xl font-semibold">Edit Cohort Details</DialogTitle>
                </DialogHeader>

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

                <DialogFooter className="mt-4 flex gap-2">
                    <Button variant="outline" onClick={handleCancel} disabled={updateCohort.isPending}>Cancel</Button>
                    {canUpdate ? (
                        <Button onClick={handleSave} disabled={updateCohort.isPending}>
                            {updateCohort.isPending ? "Saving..." : "Save"}
                        </Button>
                    ) : (
                        <PermissionTooltip permission={PERMISSIONS.DEVICE.UPDATE}>
                            <span>
                                <Button disabled className="opacity-50">
                                    Save
                                </Button>
                            </span>
                        </PermissionTooltip>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default CohortDetailsModal;
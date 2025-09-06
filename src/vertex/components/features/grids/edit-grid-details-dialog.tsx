import React, { useEffect, useState } from "react";
import ReusableDialog from "@/components/shared/dialog/ReusableDialog";
import ReusableInputField from "@/components/shared/inputfield/ReusableInputField";
import ReusableSelectInput from "@/components/shared/select/ReusableSelectInput";
import { useUpdateGridDetails } from "@/core/hooks/useGrids";
import { usePermission } from "@/core/hooks/usePermissions";
import { PERMISSIONS } from "@/core/permissions/constants";
import { Grid } from "@/app/types/grids";

interface EditGridDetailsDialogProps {
    open: boolean;
    grid: Grid;
    onClose: () => void;
}

const EditGridDetailsDialog: React.FC<EditGridDetailsDialogProps> = ({
    open,
    grid,
    onClose,
}) => {
    const [form, setForm] = useState({ name: "", visibility: false, admin_level: "" });
    const { updateGridDetails, isLoading } = useUpdateGridDetails(grid._id);
    const canUpdate = usePermission(PERMISSIONS.SITE.UPDATE);

    useEffect(() => {
        if (grid) {
            setForm({ name: grid.name, visibility: grid.visibility, admin_level: grid.admin_level });
        }
    }, [grid]);

    useEffect(() => {
        if (!open && grid) {
            setForm({ name: grid.name, visibility: grid.visibility, admin_level: grid.admin_level });
        }
    }, [open, grid]);

    const handleSave = async () => {
        const trimmedName = form.name.trim();
        const trimmedAdminLevel = form.admin_level.trim();
        
        if (trimmedName.length === 0 || trimmedAdminLevel.length === 0) {
            return;
        }

        // If no changes were made, just close the dialog.
        if (trimmedName === grid.name && trimmedAdminLevel === grid.admin_level && form.visibility === grid.visibility) {
            onClose();
            return;
        }

        const updates: { name?: string; visibility?: boolean; admin_level: string } = {
            admin_level: trimmedAdminLevel,
        };
        if (trimmedName !== grid.name) updates.name = trimmedName;
        if (form.visibility !== grid.visibility) updates.visibility = form.visibility;

        try {
            await updateGridDetails(updates);
            onClose();
        } catch {
            return
        }
    };

    return (
        <ReusableDialog isOpen={open} onClose={onClose} title="Edit Grid Details" size="lg" 
            primaryAction={{ label: isLoading ? "Saving..." : "Save", onClick: handleSave, disabled: isLoading || !canUpdate || !form.name.trim() || !form.admin_level.trim() }}
            secondaryAction={{ label: "Cancel", onClick: onClose, disabled: isLoading, variant: "outline" }}
        >
            <div className="space-y-4">
                <ReusableInputField label="Grid Name" value={form.name} onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))} placeholder="Enter grid name" disabled={isLoading} required />
                <ReusableInputField label="Admin Level" value={form.admin_level} onChange={(e) => setForm((s) => ({ ...s, admin_level: e.target.value }))} placeholder="e.g. Country, Region" disabled={isLoading} required />
                <ReusableSelectInput label="Visibility" value={String(form.visibility)} onChange={(e) => setForm((s) => ({ ...s, visibility: e.target.value === "true" }))} disabled={isLoading} required >
                    <option value="true">Public</option>
                    <option value="false">Private</option>
                </ReusableSelectInput>
            </div>
        </ReusableDialog>
    );
};

export default EditGridDetailsDialog;
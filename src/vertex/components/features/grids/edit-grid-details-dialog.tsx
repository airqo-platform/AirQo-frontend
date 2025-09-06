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
    const [form, setForm] = useState({ name: "", visibility: false });
    const { updateGridDetails, isLoading } = useUpdateGridDetails(grid._id);
    const canUpdate = usePermission(PERMISSIONS.SITE.UPDATE);

    useEffect(() => {
        if (grid) {
            setForm({ name: grid.name, visibility: grid.visibility });
        }
    }, [grid]);

    useEffect(() => {
        if (!open && grid) {
            setForm({ name: grid.name, visibility: grid.visibility });
        }
    }, [open, grid]);

    const handleSave = async () => {
        const updates: Partial<{ name: string; visibility: boolean }> = {};
        const trimmedName = form.name.trim();
        
        if (trimmedName.length === 0) return;
        if (trimmedName !== grid.name) updates.name = trimmedName;
        if (form.visibility !== grid.visibility) updates.visibility = form.visibility;

        if (Object.keys(updates).length === 0) {
            onClose();
            return;
        }

        try {
            await updateGridDetails(updates);
            onClose();
        } catch {
            return
        }
    };

    return (
        <ReusableDialog isOpen={open} onClose={onClose} title="Edit Grid Details" size="lg"
            primaryAction={{ label: isLoading ? "Saving..." : "Save", onClick: handleSave, disabled: isLoading || !canUpdate }}
            secondaryAction={{ label: "Cancel", onClick: onClose, disabled: isLoading, variant: "outline" }}
        >
            <div className="space-y-4">
                <ReusableInputField label="Grid Name" value={form.name} onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))} placeholder="Enter grid name" disabled={isLoading} required />
                <ReusableSelectInput label="Visibility" value={String(form.visibility)} onChange={(e) => setForm((s) => ({ ...s, visibility: e.target.value === "true" }))} disabled={isLoading} required >
                    <option value="true">Public</option>
                    <option value="false">Private</option>
                </ReusableSelectInput>
            </div>
        </ReusableDialog>
    );
};

export default EditGridDetailsDialog;
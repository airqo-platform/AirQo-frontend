import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import React, { useEffect, useState } from "react";

interface CohortDetailsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cohortDetails: {
    name: string;
    id: string;
    visibility: boolean;
  };
  onClose: () => void;
  onSave?: (data: { name: string; visibility: boolean }) => Promise<void> | void;
}

const CohortDetailsModal: React.FC<CohortDetailsModalProps> = ({
  open,
  onOpenChange,
  cohortDetails,
  onClose,
  onSave,
}) => {
  const [form, setForm] = useState({ name: cohortDetails.name, visibility:cohortDetails.visibility});

  useEffect(() => {
    setForm({ name: cohortDetails.name, visibility: cohortDetails.visibility });
  }, [cohortDetails]);

  const handleCancel = () => {
    setForm({ name: cohortDetails.name, visibility: cohortDetails.visibility });
    onClose();
  };

  const handleSave = async () => {
    await onSave?.(form);
    onClose();
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
            />
          </div>

          <div className="space-y-2">
            <Label>Visibility *</Label>
            <Select
              value={String(form.visibility)}
              onValueChange={(v) => setForm((s) => ({ ...s, visibility: v === "true" }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select visibility" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="true">True</SelectItem>
                <SelectItem value="false">False</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter className="mt-4 flex gap-2">
          <Button variant="outline" onClick={handleCancel}>Cancel</Button>
          <Button onClick={handleSave}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CohortDetailsModal;
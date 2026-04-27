"use client";

import { useState } from "react";
import { useAdminLevels, useUpdateAdminLevel } from "@/core/hooks/useGrids";
import ReusableDialog from "@/components/shared/dialog/ReusableDialog";
import ReusableButton from "@/components/shared/button/ReusableButton";
import ReusableInputField from "@/components/shared/inputfield/ReusableInputField";
import { Copy, Edit2, Check, X } from "lucide-react";
import ReusableToast from "@/components/shared/toast/ReusableToast";

interface AdminLevelsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AdminLevelsModal({ isOpen, onClose }: AdminLevelsModalProps) {
  const { adminLevels, isLoading: isLoadingLevels } = useAdminLevels();
  const { updateAdminLevel, isLoading: isUpdating } = useUpdateAdminLevel();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");

  const handleCopyId = async (id: string) => {
    try {
      await navigator.clipboard.writeText(id);
      ReusableToast({
        message: "ID copied to clipboard",
        type: "SUCCESS",
      });
    } catch {
      ReusableToast({
        message: "Failed to copy ID",
        type: "ERROR",
      });
    }
  };

  const startEditing = (id: string, name: string) => {
    setEditingId(id);
    setEditValue(name);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditValue("");
  };

  const saveEdit = (levelId: string) => {
    if (!editValue.trim()) return;
    updateAdminLevel(
      { levelId, data: { name: editValue } },
      {
        onSuccess: () => {
          setEditingId(null);
          setEditValue("");
        },
      }
    );
  };

  return (
    <ReusableDialog
      isOpen={isOpen}
      onClose={onClose}
      title="Admin Levels"
      size="2xl"
      secondaryAction={{
        label: "Close",
        onClick: onClose,
        variant: "outline",
      }}
    >
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-muted text-muted-foreground uppercase text-xs font-medium">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">ID</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {isLoadingLevels ? (
              <tr>
                <td colSpan={3} className="px-4 py-8 text-center text-muted-foreground">
                  Loading admin levels...
                </td>
              </tr>
            ) : adminLevels.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-4 py-8 text-center text-muted-foreground">
                  No admin levels found.
                </td>
              </tr>
            ) : (
              adminLevels.map((level) => (
                <tr key={level._id} className="hover:bg-muted/50 transition-colors">
                  <td className="px-4 py-3">
                    {editingId === level._id ? (
                      <div className="flex items-center gap-2">
                        <ReusableInputField
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          className="h-8 py-1"
                          autoFocus
                        />
                      </div>
                    ) : (
                      <span className="font-medium">{level.name}</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2 group">
                      <code className="bg-muted px-1.5 py-0.5 rounded text-[11px] text-muted-foreground">
                        {level._id}
                      </code>
                      <button
                        onClick={() => handleCopyId(level._id)}
                        className="text-muted-foreground hover:text-foreground transition-colors opacity-0 group-hover:opacity-100"
                        title="Copy ID"
                      >
                        <Copy size={14} />
                      </button>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    {editingId === level._id ? (
                      <div className="flex justify-end gap-2">
                        <ReusableButton
                          variant="filled"
                          padding="p-1"
                          onClick={() => saveEdit(level._id)}
                          disabled={isUpdating}
                          Icon={Check}
                        />
                        <ReusableButton
                          variant="outlined"
                          padding="p-1"
                          onClick={cancelEditing}
                          disabled={isUpdating}
                          Icon={X}
                        />
                      </div>
                    ) : (
                      <ReusableButton
                        variant="text"
                        padding="p-1"
                        onClick={() => startEditing(level._id, level.name)}
                        Icon={Edit2}
                      />
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </ReusableDialog>
  );
}

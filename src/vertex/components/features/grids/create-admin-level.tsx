"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Form, FormField } from "@/components/ui/form";
import { Plus, MoreVertical, List } from "lucide-react";
import { useCreateAdminLevel } from "@/core/hooks/useGrids";
import ReusableDialog from "@/components/shared/dialog/ReusableDialog";
import ReusableButton from "@/components/shared/button/ReusableButton";
import ReusableInputField from "@/components/shared/inputfield/ReusableInputField";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AdminLevelsModal } from "./admin-levels-modal";

const adminLevelFormSchema = z.object({
  name: z.string().min(2, {
    message: "Admin level name must be at least 2 characters.",
  }),
});

type AdminLevelFormValues = z.infer<typeof adminLevelFormSchema>;

export function CreateAdminLevel() {
  const [open, setOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const { createAdminLevel, isLoading } = useCreateAdminLevel();

  const form = useForm<AdminLevelFormValues>({
    resolver: zodResolver(adminLevelFormSchema),
    defaultValues: {
      name: "",
    },
  });

  const handleClose = () => {
    setOpen(false);
    form.reset();
  };

  const onSubmit = (data: AdminLevelFormValues) => {
    createAdminLevel(data, {
      onSuccess: () => {
        handleClose();
      },
    });
  };

  return (
    <>
      <div className="flex gap-1 items-center">
        <ReusableButton onClick={() => setOpen(true)} Icon={Plus} variant="outlined">
          New Admin Level
        </ReusableButton>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="p-2 hover:bg-muted rounded-md transition-colors text-muted-foreground hover:text-foreground border border-transparent hover:border-border">
              <MoreVertical size={18} />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={() => setViewModalOpen(true)}>
              <List size={16} className="mr-2" />
              View Admin Levels
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <AdminLevelsModal
        isOpen={viewModalOpen}
        onClose={() => setViewModalOpen(false)}
      />

      <ReusableDialog
        isOpen={open}
        onClose={handleClose}
        title="New Admin Level"
        size="md"
        primaryAction={{
          label: isLoading ? "Submitting..." : "Submit",
          onClick: form.handleSubmit(onSubmit),
          disabled: isLoading,
        }}
        secondaryAction={{
          label: "Cancel",
          onClick: handleClose,
          disabled: isLoading,
          variant: "outline",
        }}
      >
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field, fieldState }) => (
                <ReusableInputField
                  label="Admin level name"
                  placeholder="Enter admin level name (e.g. municipality)"
                  error={fieldState.error?.message}
                  required
                  {...field}
                />
              )}
            />
          </form>
        </Form>
      </ReusableDialog>
    </>
  );
}

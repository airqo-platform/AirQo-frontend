"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Form, FormField } from "@/components/ui/form";
import { Plus } from "lucide-react";
import { useCreateAdminLevel } from "@/core/hooks/useGrids";
import ReusableDialog from "@/components/shared/dialog/ReusableDialog";
import ReusableButton from "@/components/shared/button/ReusableButton";
import ReusableInputField from "@/components/shared/inputfield/ReusableInputField";

const adminLevelFormSchema = z.object({
  name: z.string().min(2, {
    message: "Admin level name must be at least 2 characters.",
  }),
});

type AdminLevelFormValues = z.infer<typeof adminLevelFormSchema>;

export function CreateAdminLevel() {
  const [open, setOpen] = useState(false);
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
      <ReusableButton onClick={() => setOpen(true)} Icon={Plus} variant="outlined">
        New Admin Level
      </ReusableButton>
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

"use client";

import { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Form, FormField } from "@/components/ui/form";
import { Plus } from "lucide-react";
import PolygonMap from "./polymap";
import { useAppSelector } from "@/core/redux/hooks";
import { useCreateGrid } from "@/core/hooks/useGrids";
import { Position } from "@/core/redux/slices/gridsSlice";
import ReusableDialog from "@/components/shared/dialog/ReusableDialog";
import ReusableButton from "@/components/shared/button/ReusableButton";
import ReusableInputField from "@/components/shared/inputfield/ReusableInputField";

const gridFormSchema = z.object({
  name: z.string().min(2, {
    message: "Grid name must be at least 2 characters.",
  }),
  administrativeLevel: z.string().min(2, {
    message: "Administrative level is required.",
  }),
  shapefile: z.string().refine(
    (val) => {
      try {
        const parsed = JSON.parse(val);
        return parsed && parsed.coordinates && parsed.coordinates.length > 0;
      } catch (e) {
        return false;
      }
    },
    { message: "A polygon must be drawn on the map." }
  ),
  network: z.string().min(2, {
    message: "Network is required.",
  }),
});

type GridFormValues = z.infer<typeof gridFormSchema>;

export function CreateGridForm() {
  const [open, setOpen] = useState(false);
  const polygon = useAppSelector((state) => state.grids.polygon);
  const activeNetwork = useAppSelector((state) => state.user.activeNetwork);
  const { createGrid, isLoading } = useCreateGrid();

  const form = useForm<GridFormValues>({
    resolver: zodResolver(gridFormSchema),
    defaultValues: {
      name: "",
      administrativeLevel: "",
      shapefile: '{"type":"","coordinates":[]}',
      network: activeNetwork?.net_name || "",
    },
  });

  useEffect(() => {
    if (polygon) {
      form.setValue("shapefile", JSON.stringify(polygon), { shouldValidate: true });
    } else {
      form.setValue("shapefile", '{"type":"","coordinates":[]}', { shouldValidate: true });
    }
  }, [polygon, form]);

  const handleClose = () => {
    setOpen(false);
    form.reset();
  };

  const onSubmit = (data: GridFormValues) => {
    const gridData = {
      name: data.name,
      admin_level: data.administrativeLevel,
      shape: JSON.parse(data.shapefile) as { type: "MultiPolygon" | "Polygon"; coordinates: Position[][] | Position[][][] },
      network: activeNetwork?.net_name || "",
    };

    createGrid(gridData, {
      onSuccess: () => {
        handleClose();
      },
    });
  };

  return (
    <>
      <ReusableButton onClick={() => setOpen(true)} Icon={Plus}>
        Create Grid
      </ReusableButton>
      <ReusableDialog
        isOpen={open}
        onClose={handleClose}
        title="Create Grid"
        size="5xl"
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field, fieldState }) => (
                  <ReusableInputField
                    label="Grid name"
                    placeholder="Enter grid name"
                    error={fieldState.error?.message}
                    required
                    {...field}
                  />
                )}
              />
              <FormField
                control={form.control}
                name="administrativeLevel"
                render={({ field, fieldState }) => (
                  <ReusableInputField
                    label="Administrative level"
                    placeholder="eg province, state, village, county, etc"
                    error={fieldState.error?.message}
                    required
                    {...field}
                  />
                )}
              />
              <FormField
                control={form.control}
                name="shapefile"
                render={({ field, fieldState }) => (
                  <ReusableInputField
                    as="textarea"
                    label="Shapefile"
                    className="font-mono"
                    readOnly
                    {...field}
                    value={polygon ? JSON.stringify(polygon, null, 2) : ""}
                    description="Select polygon icon on map to generate a polygon"
                    error={fieldState.error?.message}
                    rows={5}
                    showCopyButton
                  />
                )}
              />
            </form>
          </Form>
          <PolygonMap />
        </div>
      </ReusableDialog>
    </>
  );
}

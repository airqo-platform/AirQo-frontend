"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus } from "lucide-react";

const gridFormSchema = z.object({
  name: z.string().min(2, {
    message: "Grid name must be at least 2 characters.",
  }),
  administrativeLevel: z.string().min(2, {
    message: "Administrative level is required.",
  }),
  shapefile: z.string().min(2, {
    message: "Shapefile data is required.",
  }),
});

type GridFormValues = z.infer<typeof gridFormSchema>;

export function CreateGridForm() {
  const [open, setOpen] = useState(false);

  const form = useForm<GridFormValues>({
    resolver: zodResolver(gridFormSchema),
    defaultValues: {
      name: "",
      administrativeLevel: "",
      shapefile: '{"type":"","coordinates":[]}',
    },
  });

  function onSubmit(data: GridFormValues) {
    console.log(data);
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Create Grid
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[1000px]">
        <DialogHeader>
          <DialogTitle>Add New Grid</DialogTitle>
          <DialogDescription>
            Create a new monitoring grid by providing the details below.
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Grid name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter grid name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="administrativeLevel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Administrative level</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="eg province, state, village, county, etc"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="shapefile"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Shapefile</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder='{"type":"","coordinates":[]}'
                        className="font-mono"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Select polygon icon on map to generate a polygon
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">Submit</Button>
              </div>
            </form>
          </Form>
          <div className="h-[400px] bg-muted rounded-md">
            {/* Map component would go here - using placeholder for now */}
            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
              Map Component
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

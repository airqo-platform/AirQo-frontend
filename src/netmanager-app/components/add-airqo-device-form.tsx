"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DialogClose } from "@/components/ui/dialog";
import { useRef } from "react";
import { useToast } from "@/components/ui/use-toast";

const CATEGORIES = [
  { value: 'lowcost', name: 'Lowcost' },
  { value: 'bam', name: 'BAM' },
  { value: 'gas', name: 'GAS' }
];

const airqoDeviceSchema = z.object({
  name: z.string().min(2, {
    message: "Device name must be at least 2 characters.",
  }),
  category: z.string({
    required_error: "Please select a category.",
  }),
  description: z.string().optional(),
  network: z.string(),
});

type AirQoDeviceValues = z.infer<typeof airqoDeviceSchema>;

export function AddAirQoDeviceForm() {
  const { toast } = useToast();
  const cancelButtonRef = useRef<HTMLButtonElement>(null);

  const form = useForm<AirQoDeviceValues>({
    resolver: zodResolver(airqoDeviceSchema),
    defaultValues: {
      name: "",
      category: "",
      description: "",
      network: "airqo",
    },
  });

  function onSubmit(values: AirQoDeviceValues) {
    // TODO: Implement device creation logic
    console.log(values);
    toast({
      title: "Success",
      description: "AirQo device added successfully",
    });
    cancelButtonRef.current?.click();
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Device Name *</FormLabel>
                <FormControl>
                  <Input placeholder="Enter device name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category *</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {CATEGORIES.map((category) => (
                      <SelectItem key={category.value} value={category.value}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="network"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Network</FormLabel>
                <FormControl>
                  <Input {...field} disabled />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem className="col-span-2">
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Enter device description"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end gap-4">
          <DialogClose asChild>
            <Button type="button" variant="outline" ref={cancelButtonRef}>
              Cancel
            </Button>
          </DialogClose>
          <Button type="submit">Add Device</Button>
        </div>
      </form>
    </Form>
  );
} 
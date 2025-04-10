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
import { useRef, useState } from "react";
import { useToast } from "@/components/ui/use-toast";

const importDeviceSchema = z.object({
  deviceName: z.string().min(2, {
    message: "Device name must be at least 2 characters.",
  }),
  category: z.string({
    required_error: "Please select a category.",
  }),
  serialNumber: z.string().min(1, {
    message: "Serial number is required.",
  }),
  network: z.string().min(1, {
    message: "Network is required.",
  }),
  description: z.string().optional(),
  channelId: z.string().optional(),
  writeKey: z.string().optional(),
  readKey: z.string().optional(),
});

type ImportDeviceValues = z.infer<typeof importDeviceSchema>;

export function ImportDeviceForm() {
  const { toast } = useToast();
  const cancelButtonRef = useRef<HTMLButtonElement>(null);
  const [isShowingMore, setIsShowingMore] = useState(false);

  const form = useForm<ImportDeviceValues>({
    resolver: zodResolver(importDeviceSchema),
    defaultValues: {
      deviceName: "",
      category: "",
      serialNumber: "",
      network: "airqo",
      description: "",
      channelId: "",
      writeKey: "",
      readKey: "",
    },
  });

  function onSubmit(values: ImportDeviceValues) {
    // TODO: Implement device import logic
    console.log(values);
    toast({
      title: "Success",
      description: "Device imported successfully",
    });
    cancelButtonRef.current?.click();
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="deviceName"
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
                    <SelectItem value="low_cost">Low Cost</SelectItem>
                    <SelectItem value="bam">BAM</SelectItem>
                    <SelectItem value="reference">Reference</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="serialNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Serial Number *</FormLabel>
                <FormControl>
                  <Input placeholder="Enter serial number" {...field} />
                </FormControl>
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
              <FormItem>
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

        <Button
          type="button"
          variant="outline"
          onClick={() => setIsShowingMore(!isShowingMore)}
          className="w-full"
        >
          {isShowingMore ? "SHOW LESS OPTIONS" : "SHOW MORE OPTIONS"}
        </Button>

        {isShowingMore && (
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="channelId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Channel ID (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter channel ID" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="writeKey"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Write Key (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter write key" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="readKey"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Read Key (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter read key" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        )}

        <div className="flex justify-end gap-4">
          <DialogClose asChild>
            <Button type="button" variant="outline" ref={cancelButtonRef}>
              Cancel
            </Button>
          </DialogClose>
          <Button type="submit">Register</Button>
        </div>
      </form>
    </Form>
  );
} 
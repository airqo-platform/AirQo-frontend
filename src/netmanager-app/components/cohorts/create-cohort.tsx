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
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";

const devices = [
  { value: "aq_29", label: "Aq_29" },
  { value: "aq_34", label: "Aq_34" },
  { value: "aq_35", label: "Aq_35" },
  { value: "airqo_g5363", label: "Airqo_g5363" },
];

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Cohort name must be at least 2 characters.",
  }),
  network: z.string().min(1, {
    message: "Please select a network.",
  }),
  devices: z.array(z.string()).min(1, {
    message: "Please select at least one device.",
  }),
});

export function CreateCohortDialog() {
  const [open, setOpen] = useState(false);
  //   const [selectedDevices, setSelectedDevices] = useState<string[]>([])

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      network: "airqo",
      devices: [],
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values);
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Create Cohort</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Cohort</DialogTitle>
          <DialogDescription>
            Create a new cohort by providing the details below.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cohort name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter cohort name" {...field} />
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
                    <Input disabled {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="devices"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Select Device(s)</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          role="combobox"
                          className={cn(
                            "w-full justify-between",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value?.length > 0
                            ? `${field.value.length} devices selected`
                            : "Select devices"}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-[400px] p-0">
                      <Command>
                        <CommandInput placeholder="Search devices..." />
                        <CommandList>
                          <CommandEmpty>No devices found.</CommandEmpty>
                          <CommandGroup>
                            {devices.map((device) => (
                              <CommandItem
                                value={device.value}
                                key={device.value}
                                onSelect={() => {
                                  const current = new Set(field.value);
                                  if (current.has(device.value)) {
                                    current.delete(device.value);
                                  } else {
                                    current.add(device.value);
                                  }
                                  field.onChange(Array.from(current));
                                }}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    field.value?.includes(device.value)
                                      ? "opacity-100"
                                      : "opacity-0"
                                  )}
                                />
                                {device.label}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
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
      </DialogContent>
    </Dialog>
  );
}

"use client";

import { useState, useCallback } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Form, FormField } from "@/components/ui/form";
import ReusableDialog from "@/components/shared/dialog/ReusableDialog";
import ReusableInputField from "@/components/shared/inputfield/ReusableInputField";
import ReusableButton from "@/components/shared/button/ReusableButton";
import { AqPlus } from "@airqo/icons-react";
import ReusableToast from "@/components/shared/toast/ReusableToast";
import { useCreateNetwork } from "@/core/hooks/useNetworks";

const networkFormSchema = z.object({
    net_name: z.string().min(2, "Network name must be at least 2 characters."),
    net_acronym: z.string().min(2, "Acronym must be at least 2 characters."),
    net_username: z.string().min(2, "Username must be at least 2 characters."),
    net_email: z.string().email("Invalid email address."),
    net_website: z.string().url("Invalid URL."),
    net_phoneNumber: z.string().min(10, "Phone number seems too short."),
    net_category: z.string().min(2, "Category is required."),
    net_description: z.string().min(10, "Description is too short."),
    net_connection_endpoint: z.string().url("Invalid URL."),
    net_connection_string: z.string().url("Invalid URL."),
});

type NetworkFormValues = z.infer<typeof networkFormSchema>;

export function CreateNetworkForm() {
    const [open, setOpen] = useState(false);

    const { mutate: createNetwork, isPending } = useCreateNetwork({
        onSuccess: () => handleClose(),
    });

    const form = useForm<NetworkFormValues>({
        resolver: zodResolver(networkFormSchema),
        defaultValues: {
            net_name: "",
            net_acronym: "",
            net_username: "",
            net_email: "",
            net_website: "",
            net_phoneNumber: "",
            net_category: "business",
            net_description: "",
            net_connection_endpoint: "",
            net_connection_string: "",
        },
    });

    const handleClose = useCallback(() => {
        setOpen(false);
        form.reset();
    }, [form]);

    const onSubmit = useCallback(
        (values: NetworkFormValues) => {
            const admin_secret = process.env.NEXT_PUBLIC_ADMIN_SECRET || "";
            if (!admin_secret) {
                ReusableToast({
                    message: "Admin secret is not configured.",
                    type: "ERROR",
                });
                return;
            }
            createNetwork({ ...values, admin_secret });
        },
        [createNetwork]
    );

    return (
        <>
            <ReusableButton
                variant="filled"
                onClick={() => setOpen(true)}
                Icon={AqPlus}
            >
                Create Network
            </ReusableButton>
            <ReusableDialog
                isOpen={open}
                onClose={handleClose}
                title="Create a new Network"
                size="2xl"
                primaryAction={{
                    label: isPending ? "Creating..." : "Create Network",
                    onClick: form.handleSubmit(onSubmit),
                    disabled: isPending,
                }}
                secondaryAction={{
                    label: "Cancel",
                    onClick: handleClose,
                    variant: "outline",
                    disabled: isPending,
                }}
            >
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField control={form.control} name="net_name" render={({ field, fieldState }) => <ReusableInputField label="Name" placeholder="e.g. mairqo" error={fieldState.error?.message} required {...field} />} />
                            <FormField control={form.control} name="net_acronym" render={({ field, fieldState }) => <ReusableInputField label="Acronym" placeholder="e.g. mairqo" error={fieldState.error?.message} required {...field} />} />
                            <FormField control={form.control} name="net_username" render={({ field, fieldState }) => <ReusableInputField label="Username" placeholder="e.g. mairqo" error={fieldState.error?.message} required {...field} />} />
                            <FormField control={form.control} name="net_email" render={({ field, fieldState }) => <ReusableInputField label="Email" type="email" placeholder="e.g. support@mairqo.net" error={fieldState.error?.message} required {...field} />} />
                            <FormField control={form.control} name="net_website" render={({ field, fieldState }) => <ReusableInputField label="Website" type="url" placeholder="e.g. https://www.mairqo.com" error={fieldState.error?.message} required {...field} />} />
                            <FormField control={form.control} name="net_phoneNumber" render={({ field, fieldState }) => <ReusableInputField label="Phone Number" placeholder="e.g. +25677123456789" error={fieldState.error?.message} required {...field} />} />
                            <FormField control={form.control} name="net_category" render={({ field, fieldState }) => <ReusableInputField label="Category" placeholder="e.g. business" error={fieldState.error?.message} required {...field} />} />
                            <FormField control={form.control} name="net_description" render={({ field, fieldState }) => <ReusableInputField label="Description" placeholder="Enter a brief description" error={fieldState.error?.message} required {...field} />} />
                            <FormField control={form.control} name="net_connection_endpoint" render={({ field, fieldState }) => <ReusableInputField label="Connection Endpoint" type="url" placeholder="e.g. https://device.mairqo.com/v2/" error={fieldState.error?.message} required {...field} />} />
                            <FormField control={form.control} name="net_connection_string" render={({ field, fieldState }) => <ReusableInputField label="Connection String" type="url" placeholder="e.g. https://device.mairqo.com/v2/" error={fieldState.error?.message} required {...field} />} />
                        </div>
                    </form>
                </Form>
            </ReusableDialog>
        </>
    );
}
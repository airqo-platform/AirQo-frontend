"use client";

import { useState, useCallback } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import axios from "axios";
import { Form, FormField } from "@/components/ui/form";
import ReusableDialog from "@/components/shared/dialog/ReusableDialog";
import ReusableInputField from "@/components/shared/inputfield/ReusableInputField";
import ReusableButton from "@/components/shared/button/ReusableButton";
import ReusableToast from "@/components/shared/toast/ReusableToast";
import { AqPlus } from "@airqo/icons-react";
import { getApiErrorMessage } from "@/core/utils/getApiErrorMessage";
import ReusableSelectInput from "@/components/shared/select/ReusableSelectInput";

import { networkFormSchema, NetworkFormValues } from "./schema";

export function CreateNetworkForm() {
    const [open, setOpen] = useState(false);
    const [isPending, setIsPending] = useState(false);

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
        async (values: NetworkFormValues) => {
            setIsPending(true);
            try {
                await axios.post('/api/network', values, {
                    headers: { 'Content-Type': 'application/json' },
                });

                ReusableToast({ message: 'Sensor Manufacturer created successfully!', type: 'SUCCESS' });
                handleClose();
            } catch (error: unknown) {
                const errorMessage = getApiErrorMessage(error);
                ReusableToast({ message: errorMessage, type: 'ERROR' });
            } finally {
                setIsPending(false);
            }
        },
        [handleClose]
    );

    return (
        <>
            <ReusableButton
                variant="filled"
                onClick={() => setOpen(true)}
                Icon={AqPlus}
            >
                Create Sensor Manufacturer
            </ReusableButton>
            <ReusableDialog
                isOpen={open}
                onClose={handleClose}
                title="Create a new Sensor Manufacturer"
                size="2xl"
                primaryAction={{
                    label: isPending ? "Creating..." : "Create Sensor Manufacturer",
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
                            <FormField
                                control={form.control}
                                name="net_category"
                                render={({ field, fieldState }) => (
                                    <ReusableSelectInput
                                        label="Category"
                                        error={fieldState.error?.message}
                                        required
                                        {...field}
                                    >
                                        <option value="business">Business</option>
                                        <option value="research">Research</option>
                                        <option value="policy">Policy</option>
                                        <option value="awareness">Awareness</option>
                                        <option value="school">School</option>
                                        <option value="others">Others</option>
                                    </ReusableSelectInput>
                                )}
                            />
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
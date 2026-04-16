"use client";

import { useCallback, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Form, FormField } from "@/components/ui/form";
import ReusableDialog from "@/components/shared/dialog/ReusableDialog";
import ReusableInputField from "@/components/shared/inputfield/ReusableInputField";
import { networkRequestSchema, NetworkRequestValues } from "./schema";
import { useSubmitNetworkRequest } from "@/core/hooks/useNetworks";
import { useAppSelector } from "@/core/redux/hooks";

interface NetworkRequestDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function NetworkRequestDialog({ open, onOpenChange }: NetworkRequestDialogProps) {
    const userDetails = useAppSelector((state) => state.user.userDetails);
    const { mutate: submitRequest, isPending } = useSubmitNetworkRequest();

    const form = useForm<NetworkRequestValues>({
        resolver: zodResolver(networkRequestSchema),
        defaultValues: {
            requester_name: "",
            requester_email: "",
            net_name: "",
            net_email: "",
            net_website: "",
            net_category: "",
            net_description: "",
            net_acronym: "",
        },
    });

    useEffect(() => {
        if (open && userDetails) {
            form.reset({
                ...form.getValues(),
                requester_name: `${userDetails.firstName} ${userDetails.lastName}`.trim() || "",
                requester_email: userDetails.email || "",
            });
        }
    }, [open, userDetails, form]);

    const handleClose = useCallback(() => {
        onOpenChange(false);
        form.reset();
    }, [form, onOpenChange]);

    const onSubmit = (values: NetworkRequestValues) => {
        submitRequest(values, {
            onSuccess: () => {
                handleClose();
            }
        });
    };

    return (
        <ReusableDialog
            isOpen={open}
            onClose={handleClose}
            title="Request New Sensor Manufacturer"
            subtitle="Can't find your manufacturer? Submit a request and we'll review it for onboarding."
            size="2xl"
            primaryAction={{
                label: isPending ? "Submitting..." : "Submit Request",
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
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <div className="space-y-4">
                        <h4 className="text-sm font-semibold border-b pb-2">Your Information</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField 
                                control={form.control} 
                                name="requester_name" 
                                render={({ field, fieldState }) => (
                                    <ReusableInputField 
                                        label="Full Name" 
                                        placeholder="Enter your name" 
                                        error={fieldState.error?.message} 
                                        required 
                                        {...field} 
                                    />
                                )} 
                            />
                            <FormField 
                                control={form.control} 
                                name="requester_email" 
                                render={({ field, fieldState }) => (
                                    <ReusableInputField 
                                        label="Contact Email" 
                                        type="email" 
                                        placeholder="Enter your email" 
                                        error={fieldState.error?.message} 
                                        required 
                                        {...field} 
                                    />
                                )} 
                            />
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h4 className="text-sm font-semibold border-b pb-2">Manufacturer Details</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField 
                                control={form.control} 
                                name="net_name" 
                                render={({ field, fieldState }) => (
                                    <ReusableInputField 
                                        label="Manufacturer Name" 
                                        placeholder="e.g. Acme Sensors Ltd" 
                                        error={fieldState.error?.message} 
                                        required 
                                        {...field} 
                                    />
                                )} 
                            />
                            <FormField 
                                control={form.control} 
                                name="net_email" 
                                render={({ field, fieldState }) => (
                                    <ReusableInputField 
                                        label="Official Email" 
                                        type="email" 
                                        placeholder="e.g. info@acme.com" 
                                        error={fieldState.error?.message} 
                                        required 
                                        {...field} 
                                    />
                                )} 
                            />
                            <FormField 
                                control={form.control} 
                                name="net_website" 
                                render={({ field, fieldState }) => (
                                    <ReusableInputField 
                                        label="Website (Optional)" 
                                        type="url" 
                                        placeholder="e.g. https://www.acme.com" 
                                        error={fieldState.error?.message} 
                                        {...field} 
                                    />
                                )} 
                            />
                            <FormField 
                                control={form.control} 
                                name="net_acronym" 
                                render={({ field, fieldState }) => (
                                    <ReusableInputField 
                                        label="Acronym (Optional)" 
                                        placeholder="e.g. ACME" 
                                        error={fieldState.error?.message} 
                                        {...field} 
                                    />
                                )} 
                            />
                        </div>
                        <FormField 
                            control={form.control} 
                            name="net_description" 
                            render={({ field, fieldState }) => (
                                <ReusableInputField 
                                    as="textarea"
                                    label="Description (Optional)" 
                                    placeholder="Briefly describe the manufacturer and why they should be added" 
                                    error={fieldState.error?.message} 
                                    rows={3}
                                    {...field} 
                                />
                            )} 
                        />
                    </div>
                </form>
            </Form>
        </ReusableDialog>
    );
}

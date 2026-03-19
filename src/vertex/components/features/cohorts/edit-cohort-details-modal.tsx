"use client";

import React, { useEffect, useRef, useState } from "react";
import ReusableDialog from "@/components/shared/dialog/ReusableDialog";
import ReusableButton from "@/components/shared/button/ReusableButton";
import ReusableInputField from "@/components/shared/inputfield/ReusableInputField";

import { useUpdateCohortName } from "@/core/hooks/useCohorts";
import { PERMISSIONS } from "@/core/permissions/constants";
import logger from "@/lib/logger";
import { buildCohortName, sanitizeCohortInput, splitCohortName } from "@/core/utils/cohortName";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface CohortDetailsModalProps {
    open: boolean;
    cohortDetails: {
        name: string;
        id: string;
        visibility: boolean;
    };
    onClose: () => void;
}

const CohortDetailsModal: React.FC<CohortDetailsModalProps> = ({
    open,
    cohortDetails,
    onClose,
}) => {
    const [form, setForm] = useState({ city: "", projectName: "", funder: "", updateReason: "" });
    const updateCohortName = useUpdateCohortName();
    const [showIgnoredTooltip, setShowIgnoredTooltip] = useState({
        city: false,
        projectName: false,
        funder: false,
    });
    const tooltipTimers = useRef<Record<string, ReturnType<typeof setTimeout> | null>>({});

    useEffect(() => {
        const { city, projectName, funder } = splitCohortName(cohortDetails.name || "");
        setForm({ city, projectName, funder, updateReason: "" });
    }, [cohortDetails]);

    useEffect(() => {
        if (!open) {
            const { city, projectName, funder } = splitCohortName(cohortDetails.name || "");
            setForm({ city, projectName, funder, updateReason: "" });
        }
    }, [open, cohortDetails]);

    const handleCancel = () => {
        const { city, projectName, funder } = splitCohortName(cohortDetails.name || "");
        setForm({ city, projectName, funder, updateReason: "" });
        onClose();
    };

    const handleSave = async () => {
        const trimmedCity = form.city.trim();
        const trimmedProject = form.projectName.trim();
        const trimmedReason = form.updateReason.trim();
        if (trimmedCity.length === 0 || trimmedProject.length === 0) return;
        if (trimmedReason.length === 0) return;

        const derivedName = buildCohortName(trimmedCity, trimmedProject, form.funder);
        if (derivedName.length === 0) return;
        if (derivedName === cohortDetails.name) return onClose();

        try {
            await updateCohortName.mutateAsync({
                cohortId: cohortDetails.id,
                name: derivedName,
                updateReason: trimmedReason,
            });
            onClose();
        } catch {
            logger.info("Something went wrong")
        }
    };

    const handleSanitizedInputChange = (
        fieldKey: "city" | "projectName" | "funder",
        value: string
    ) => {
        const sanitized = sanitizeCohortInput(value);
        if (/[^a-zA-Z0-9]/.test(value)) {
            setShowIgnoredTooltip((prev) => ({ ...prev, [fieldKey]: true }));
            if (tooltipTimers.current[fieldKey]) {
                clearTimeout(tooltipTimers.current[fieldKey] as ReturnType<typeof setTimeout>);
            }
            tooltipTimers.current[fieldKey] = setTimeout(() => {
                setShowIgnoredTooltip((prev) => ({ ...prev, [fieldKey]: false }));
            }, 1500);
        }
        setForm((prev) => ({ ...prev, [fieldKey]: sanitized }));
    };

    const trimmedCity = form.city.trim();
    const trimmedProject = form.projectName.trim();
    const trimmedReason = form.updateReason.trim();
    const derivedName = buildCohortName(trimmedCity, trimmedProject, form.funder);
    const canSave =
        trimmedCity.length > 0 &&
        trimmedProject.length > 0 &&
        trimmedReason.length > 0 &&
        derivedName.length > 0 &&
        derivedName !== cohortDetails.name;

    return (
        <ReusableDialog
            isOpen={open}
            onClose={handleCancel}
            title="Edit Cohort Details"
            size="xl"
            customFooter={
                <div className="flex items-center justify-end gap-3 w-full px-6 py-4 border-t border-gray-200 dark:border-gray-700">
                    <ReusableButton variant="outlined" onClick={handleCancel} disabled={updateCohortName.isPending}>Cancel</ReusableButton>
                    <ReusableButton onClick={handleSave} disabled={!canSave || updateCohortName.isPending} variant="filled" permission={PERMISSIONS.DEVICE.UPDATE}>
                        {updateCohortName.isPending ? "Saving..." : "Save"}
                    </ReusableButton>
                </div>
            }
        >
            <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                    <TooltipProvider delayDuration={0}>
                        <Tooltip open={showIgnoredTooltip.city}>
                            <TooltipTrigger asChild>
                                <div>
                                    <ReusableInputField
                                        label="City"
                                        value={form.city}
                                        onChange={(e) => handleSanitizedInputChange("city", e.target.value)}
                                        placeholder="e.g. Nairobi"
                                        disabled={updateCohortName.isPending}
                                        required
                                    />
                                </div>
                            </TooltipTrigger>
                            <TooltipContent side="top">
                                <p className="text-xs">Special character ignored</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                    <TooltipProvider delayDuration={0}>
                        <Tooltip open={showIgnoredTooltip.projectName}>
                            <TooltipTrigger asChild>
                                <div>
                                    <ReusableInputField
                                        label="Project name"
                                        value={form.projectName}
                                        onChange={(e) => handleSanitizedInputChange("projectName", e.target.value)}
                                        placeholder="e.g. WRI"
                                        disabled={updateCohortName.isPending}
                                        required
                                    />
                                </div>
                            </TooltipTrigger>
                            <TooltipContent side="top">
                                <p className="text-xs">Special character ignored</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                    <TooltipProvider delayDuration={0}>
                        <Tooltip open={showIgnoredTooltip.funder}>
                            <TooltipTrigger asChild>
                                <div>
                                    <ReusableInputField
                                        label="Funder (optional)"
                                        value={form.funder}
                                        onChange={(e) => handleSanitizedInputChange("funder", e.target.value)}
                                        placeholder="e.g. EPIC"
                                        disabled={updateCohortName.isPending}
                                    />
                                </div>
                            </TooltipTrigger>
                            <TooltipContent side="top">
                                <p className="text-xs">Special character ignored</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </div>
                <div className="text-xs text-muted-foreground">
                    Cohort name will be: <span className="font-medium">{derivedName || "-"}</span>
                </div>
                <ReusableInputField
                    label="Update reason"
                    value={form.updateReason}
                    onChange={(e) => setForm((s) => ({ ...s, updateReason: e.target.value }))}
                    placeholder="Why is this name changing?"
                    disabled={updateCohortName.isPending}
                    required
                />
            </div>
        </ReusableDialog>
    );
};

export default CohortDetailsModal;

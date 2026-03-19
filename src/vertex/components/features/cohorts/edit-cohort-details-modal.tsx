"use client";

import React, { useEffect, useRef, useState } from "react";
import ReusableDialog from "@/components/shared/dialog/ReusableDialog";
import ReusableButton from "@/components/shared/button/ReusableButton";
import ReusableInputField from "@/components/shared/inputfield/ReusableInputField";
import { Label } from "@/components/ui/label";

import { useUpdateCohortDetails, useUpdateCohortName } from "@/core/hooks/useCohorts";
import { PERMISSIONS } from "@/core/permissions/constants";
import logger from "@/lib/logger";
import { buildCohortName, sanitizeCohortInput, splitCohortName } from "@/core/utils/cohortName";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { MultiSelectCombobox } from "@/components/ui/multi-select";
import { DEFAULT_COHORT_TAGS } from "@/core/constants/devices";

interface CohortDetailsModalProps {
    open: boolean;
    cohortDetails: {
        name: string;
        id: string;
        visibility: boolean;
        cohort_tags: string[];
    };
    onClose: () => void;
}

const CohortDetailsModal: React.FC<CohortDetailsModalProps> = ({
    open,
    cohortDetails,
    onClose,
}) => {
    const [form, setForm] = useState({
        name: "",
        city: "",
        projectName: "",
        funder: "",
        updateReason: "",
        tags: [] as string[],
    });
    const updateCohortName = useUpdateCohortName();
    const updateCohortDetails = useUpdateCohortDetails();
    const [showIgnoredTooltip, setShowIgnoredTooltip] = useState({
        city: false,
        projectName: false,
        funder: false,
    });
    const tooltipTimers = useRef<Record<string, ReturnType<typeof setTimeout> | null>>({});

    useEffect(() => {
        const { city, projectName, funder } = splitCohortName(cohortDetails.name || "");
        setForm({
            name: cohortDetails.name || "",
            city,
            projectName,
            funder,
            updateReason: "",
            tags: cohortDetails.cohort_tags || [],
        });
    }, [cohortDetails]);

    useEffect(() => {
        if (!open) {
            const { city, projectName, funder } = splitCohortName(cohortDetails.name || "");
            setForm({
                name: cohortDetails.name || "",
                city,
                projectName,
                funder,
                updateReason: "",
                tags: cohortDetails.cohort_tags || [],
            });
        }
    }, [open, cohortDetails]);

    const handleCancel = () => {
        const { city, projectName, funder } = splitCohortName(cohortDetails.name || "");
        setForm({
            name: cohortDetails.name || "",
            city,
            projectName,
            funder,
            updateReason: "",
            tags: cohortDetails.cohort_tags || [],
        });
        onClose();
    };

    const handleSave = async () => {
        const tagsChanged =
            JSON.stringify(form.tags.sort()) !== JSON.stringify((cohortDetails.cohort_tags || []).slice().sort());
        const isOrganizational = form.tags.includes("organizational");
        const trimmedName = form.name.trim();
        const trimmedCity = form.city.trim();
        const trimmedProject = form.projectName.trim();
        const trimmedReason = form.updateReason.trim();
        const derivedName = isOrganizational
            ? buildCohortName(trimmedCity, trimmedProject, form.funder)
            : trimmedName;
        if (!isOrganizational && trimmedName.length === 0) return;
        if (isOrganizational && (trimmedCity.length === 0 || trimmedProject.length === 0)) return;
        if (isOrganizational && trimmedReason.length === 0) return;
        const nameChanged = derivedName.length > 0 && derivedName !== cohortDetails.name;

        if (!nameChanged && !tagsChanged) return onClose();

        try {
            if (isOrganizational && nameChanged) {
                await updateCohortName.mutateAsync({
                    cohortId: cohortDetails.id,
                    name: derivedName,
                    updateReason: trimmedReason,
                });
            }

            if (!isOrganizational && nameChanged) {
                await updateCohortDetails.mutateAsync({
                    cohortId: cohortDetails.id,
                    data: { name: derivedName, cohort_tags: form.tags },
                });
            } else if (tagsChanged) {
                await updateCohortDetails.mutateAsync({
                    cohortId: cohortDetails.id,
                    data: { cohort_tags: form.tags },
                });
            }
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

    const isOrganizational = form.tags.includes("organizational");
    const trimmedName = form.name.trim();
    const trimmedCity = form.city.trim();
    const trimmedProject = form.projectName.trim();
    const trimmedReason = form.updateReason.trim();
    const derivedName = isOrganizational
        ? buildCohortName(trimmedCity, trimmedProject, form.funder)
        : trimmedName;
    const tagsChanged =
        JSON.stringify(form.tags.sort()) !== JSON.stringify((cohortDetails.cohort_tags || []).slice().sort());
    const isSaving = updateCohortName.isPending || updateCohortDetails.isPending;
    const canSave =
        (isOrganizational
            ? trimmedCity.length > 0 && trimmedProject.length > 0 && trimmedReason.length > 0
            : trimmedName.length > 0) &&
        derivedName.length > 0 &&
        (derivedName !== cohortDetails.name || tagsChanged);

    return (
        <ReusableDialog
            isOpen={open}
            onClose={handleCancel}
            title="Edit Cohort Details"
            size="xl"
            customFooter={
                <div className="flex items-center justify-end gap-3 w-full px-6 py-4 border-t border-gray-200 dark:border-gray-700">
                    <ReusableButton variant="outlined" onClick={handleCancel} disabled={isSaving}>Cancel</ReusableButton>
                    <ReusableButton onClick={handleSave} disabled={!canSave || isSaving} variant="filled" permission={PERMISSIONS.DEVICE.UPDATE}>
                        {isSaving ? "Saving..." : "Save"}
                    </ReusableButton>
                </div>
            }
        >
            <div className="space-y-4">
                <div>
                    <Label className="mb-2 block">Tags</Label>
                    <MultiSelectCombobox
                        options={DEFAULT_COHORT_TAGS}
                        placeholder="Select or create tags..."
                        onValueChange={(values) => setForm((s) => ({ ...s, tags: values }))}
                        value={form.tags}
                        allowCreate={false}
                    />
                </div>

                {isOrganizational ? (
                    <>
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
                                                disabled={isSaving}
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
                                                disabled={isSaving}
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
                                                disabled={isSaving}
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
                            disabled={isSaving}
                            required
                        />
                    </>
                ) : (
                    <ReusableInputField
                        label="Cohort name"
                        value={form.name}
                        onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))}
                        placeholder="Enter cohort name"
                        disabled={isSaving}
                        required
                    />
                )}
            </div>
        </ReusableDialog>
    );
};

export default CohortDetailsModal;

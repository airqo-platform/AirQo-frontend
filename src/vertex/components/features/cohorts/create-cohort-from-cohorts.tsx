"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import ReusableDialog from "@/components/shared/dialog/ReusableDialog";
import ReusableInputField from "@/components/shared/inputfield/ReusableInputField";
import { useCreateCohortFromCohorts } from "@/core/hooks/useCohorts";
import { useNetworks } from "@/core/hooks/useNetworks";
import ReusableSelectInput from "@/components/shared/select/ReusableSelectInput";
import { MultiSelectCombobox } from "@/components/ui/multi-select";
import { Label } from "@/components/ui/label";
import { DEFAULT_COHORT_TAGS } from "@/core/constants/devices";
import { buildCohortName, sanitizeCohortInput } from "@/core/utils/cohortName";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface CreateCohortFromSelectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedCohortIds: string[];
  onSuccess?: () => void;
  andNavigate?: boolean;
}

export function CreateCohortFromSelectionDialog({
  open,
  onOpenChange,
  selectedCohortIds,
  onSuccess,
  andNavigate = true,
}: CreateCohortFromSelectionDialogProps) {
  const [city, setCity] = useState("");
  const [projectName, setProjectName] = useState("");
  const [funder, setFunder] = useState("");
  const [name, setName] = useState("");
  const [network, setNetwork] = useState("");
  const [description, setDescription] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [showIgnoredTooltip, setShowIgnoredTooltip] = useState({
    city: false,
    projectName: false,
    funder: false,
  });
  const tooltipTimers = useRef<Record<string, ReturnType<typeof setTimeout> | null>>({});
  const router = useRouter();
  const { mutate: createFromCohorts, isPending } = useCreateCohortFromCohorts();
  const { networks, isLoading: isLoadingNetworks } = useNetworks();

  useEffect(() => {
    if (!open) {
      setCity("");
      setProjectName("");
      setFunder("");
      setName("");
      setNetwork("");
      setDescription("");
      setNetwork("");
      setDescription("");
      setSelectedTags([]);
      setError("");
    }
  }, [open]);

  const handleClose = () => {
    onOpenChange(false);
  };

  const handleSubmit = () => {
    const isOrganizational = selectedTags.includes("organizational");
    if (isOrganizational) {
      if (city.trim().length === 0) {
        setError("City is required.");
        return;
      }
      if (projectName.trim().length === 0) {
        setError("Project name is required.");
        return;
      }
    } else if (name.trim().length === 0) {
      setError("Cohort name is required.");
      return;
    }
    if (!network) {
      setError("Please select a Sensor Manufacturer.");
      return;
    }
    if (selectedTags.length === 0) {
      setError("Please select at least one tag.");
      return;
    }
    setError("");

    const derivedName = isOrganizational
      ? buildCohortName(city, projectName, funder)
      : name.trim();
    if (derivedName.length < 2) {
      setError("Cohort name must be at least 2 characters.");
      return;
    }

    createFromCohorts(
      {
        name: derivedName,
        description: description.trim() || undefined,
        cohort_ids: selectedCohortIds,
        network,
        cohort_tags: selectedTags,
      },
      {
        onSuccess: (response) => {
          onSuccess?.();
          if (andNavigate && response?.data?._id) {
            router.push(`/admin/cohorts/${response.data._id}`);
          } else {
            handleClose();
          }
        },
      }
    );
  };

  const handleSanitizedInputChange = (
    fieldKey: "city" | "projectName" | "funder",
    value: string,
    setter: (nextValue: string) => void
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
    setter(sanitized);
  };

  return (
    <ReusableDialog
      isOpen={open}
      onClose={handleClose}
      title="Create Cohort from Selection"
      subtitle={`${selectedCohortIds.length} cohort(s) selected`}
      size="md"
      primaryAction={{
        label: isPending ? "Creating..." : "Create",
        onClick: handleSubmit,
        disabled:
          isPending ||
          selectedCohortIds.length === 0 ||
          !network ||
          selectedTags.length === 0 ||
          (selectedTags.includes("organizational")
            ? city.trim().length === 0 || projectName.trim().length === 0
            : name.trim().length === 0),
      }}
      secondaryAction={{
        label: "Cancel",
        onClick: handleClose,
        disabled: isPending,
        variant: "outline",
      }}
    >
      <div className="space-y-4">
        <div>
          <Label className="mb-2 block">Tags</Label>
          <MultiSelectCombobox
            options={DEFAULT_COHORT_TAGS}
            placeholder="Select or create tags..."
            onValueChange={setSelectedTags}
            value={selectedTags}
            allowCreate={false}
          />
        </div>

        {selectedTags.includes("organizational") ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            <TooltipProvider delayDuration={0}>
              <Tooltip open={showIgnoredTooltip.city}>
                <TooltipTrigger asChild>
                  <div>
                    <ReusableInputField label="City" value={city} onChange={(e) => handleSanitizedInputChange("city", e.target.value, setCity)} placeholder="e.g. Nairobi" required error={error} />
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
                    <ReusableInputField label="Project name" value={projectName} onChange={(e) => handleSanitizedInputChange("projectName", e.target.value, setProjectName)} placeholder="e.g. WRI" required error={error} />
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
                    <ReusableInputField label="Funder (Optional)" value={funder} onChange={(e) => handleSanitizedInputChange("funder", e.target.value, setFunder)} placeholder="e.g. EPIC" />
                  </div>
                </TooltipTrigger>
                <TooltipContent side="top">
                  <p className="text-xs">Special character ignored</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        ) : (
          <ReusableInputField
            label="Cohort name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter cohort name"
            required
            error={error}
          />
        )}
        <ReusableSelectInput
          label="Sensor Manufacturer"
          id="network"
          value={network}
          onChange={(e) => setNetwork(e.target.value)}
          required
          placeholder={isLoadingNetworks ? "Loading sensor manufacturer..." : "Select a sensor manufacturer"}
          disabled={isLoadingNetworks}
        >
          {networks.map((network) => (
            <option key={network.net_name} value={network.net_name}>
              {network.net_name}
            </option>
          ))}
        </ReusableSelectInput>

        {selectedTags.includes("organizational") && (
          <div className="text-xs text-muted-foreground">
            Cohort name will be: <span className="font-medium">{buildCohortName(city, projectName, funder) || "-"}</span>
          </div>
        )}

        <ReusableInputField as="textarea" label="Description (Optional)" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe this combined cohort" rows={3} />
      </div>
    </ReusableDialog>
  );
}

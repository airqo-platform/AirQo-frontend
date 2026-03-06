import { Card } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import ReusableButton from "@/components/shared/button/ReusableButton";
import { AqCopy01, AqEdit01 } from "@airqo/icons-react";
import ReusableToast from "@/components/shared/toast/ReusableToast";
import { Switch } from "@/components/ui/switch";
import { useEffect, useState } from "react";
import { useUpdateCohortDetails } from "@/core/hooks/useCohorts";
import ReusableDialog from "@/components/shared/dialog/ReusableDialog";
import { Badge } from "@/components/ui/badge";
import { MultiSelectCombobox } from "@/components/ui/multi-select";
import { DEFAULT_COHORT_TAGS } from "@/core/constants/devices";

interface CohortDetailsCardProps {
  name: string;
  id: string;
  visibility: boolean;
  onShowDetailsModal: () => void;
  loading: boolean;
  cohort_tags?: string[];
}

const CohortDetailsCard: React.FC<CohortDetailsCardProps> = ({
  name,
  id,
  visibility,
  onShowDetailsModal,
  loading,
  cohort_tags,
}) => {
  const [isVisibilityDialogOpen, setIsVisibilityDialogOpen] = useState(false);
  const [isTagsDialogOpen, setIsTagsDialogOpen] = useState(false);
  const [targetVisibility, setTargetVisibility] = useState<boolean>(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const { mutate: updateCohort, isPending } = useUpdateCohortDetails();

  useEffect(() => {
    setSelectedTags(cohort_tags ?? []);
  }, [cohort_tags]);

  const handleToggleVisibility = (checked: boolean) => {
    setTargetVisibility(checked);
    setIsVisibilityDialogOpen(true);
  };

  const handleConfirmVisibilityUpdate = () => {
    updateCohort(
      { cohortId: id, data: { visibility: targetVisibility } },
      {
        onSuccess: () => {
          setIsVisibilityDialogOpen(false);
        },
      }
    );
  };

  const handleConfirmTagsUpdate = () => {
    updateCohort(
      { cohortId: id, data: { cohort_tags: selectedTags } },
      {
        onSuccess: () => {
          setIsTagsDialogOpen(false);
        },
      }
    );
  };

  if (loading) {
    return (
      <Card className="w-full rounded-lg flex flex-col justify-between items-center p-8">
        <Loader2 className="w-6 h-6 animate-spin" />
      </Card>
    );
  }

  return (
    <>
      <Card className="w-full rounded-lg flex flex-col justify-between h-full">
        <div className="px-3 py-2 flex flex-col gap-4">
          <h2 className="text-lg font-semibold">Cohort Details</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="text-xs text-muted-foreground uppercase font-medium tracking-wide mb-1">
                Cohort Name
              </div>
              <div className="flex items-center gap-2">
                <div className="text-base font-normal break-all">
                  {name || "-"}
                </div>
                <ReusableButton
                  variant="text"
                  onClick={onShowDetailsModal}
                  className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full h-fit w-fit"
                  Icon={AqEdit01}
                  aria-label="Edit cohort"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="text-xs text-muted-foreground uppercase font-medium tracking-wide">
                  Tags
                </div>
                <ReusableButton
                  variant="text"
                  onClick={() => setIsTagsDialogOpen(true)}
                  className="p-0.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full h-fit w-fit"
                  Icon={AqEdit01}
                  aria-label="Edit tags"
                />
              </div>
              <div className="flex flex-wrap gap-2">
                {cohort_tags && cohort_tags.length > 0 ? (
                  cohort_tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="font-normal capitalize">
                      {tag}
                    </Badge>
                  ))
                ) : (
                  <span className="text-base font-normal text-muted-foreground">
                    None
                  </span>
                )}
              </div>
            </div>

            <div>
              <div className="text-xs text-muted-foreground uppercase font-medium tracking-wide mb-1">
                Visibility
              </div>
              <div className="flex items-center gap-2 mt-1">
                <span
                  className={`text-sm font-medium ${!visibility
                    ? "text-gray-900 dark:text-gray-100"
                    : "text-gray-500 dark:text-gray-400"
                    }`}
                >
                  Private
                </span>
                <Switch
                  checked={visibility}
                  onCheckedChange={handleToggleVisibility}
                  className="data-[state=checked]:bg-green-500"
                />
                <span
                  className={`text-sm font-medium ${visibility
                    ? "text-gray-900 dark:text-gray-100"
                    : "text-gray-500 dark:text-gray-400"
                    }`}
                >
                  Public
                </span>
              </div>
            </div>

            <div>
              <div className="text-xs text-muted-foreground uppercase font-medium tracking-wide mb-1">
                Cohort ID
              </div>
              <div className="flex items-center gap-2">
                <div
                  className="text-sm font-mono select-all overflow-x-auto whitespace-nowrap scrollbar-hide max-w-full"
                  style={{ WebkitOverflowScrolling: "touch" }}
                >
                  {id || "-"}
                </div>
                <ReusableButton
                  variant="text"
                  onClick={() => {
                    if (id) {
                      navigator.clipboard.writeText(id);
                      ReusableToast({ message: "Copied", type: "SUCCESS" });
                    }
                  }}
                  className="p-1"
                  Icon={AqCopy01}
                />
              </div>
            </div>
          </div>
        </div>
      </Card>

      <ReusableDialog
        isOpen={isVisibilityDialogOpen}
        onClose={() => !isPending && setIsVisibilityDialogOpen(false)}
        title={
          targetVisibility ? "Make cohort public?" : "Make cohort private?"
        }
        size="md"
        customFooter={
          <div className="flex items-center justify-end gap-3 w-full px-6 py-4 border-t border-gray-200 dark:border-gray-700">
            <ReusableButton
              variant="outlined"
              onClick={() => setIsVisibilityDialogOpen(false)}
              disabled={isPending}
            >
              Cancel
            </ReusableButton>
            <ReusableButton
              onClick={handleConfirmVisibilityUpdate}
              disabled={isPending}
              variant="filled"
              className={
                targetVisibility
                  ? "bg-green-600 hover:bg-green-700"
                  : "bg-red-600 hover:bg-red-700"
              }
            >
              {isPending
                ? "Updating..."
                : targetVisibility
                  ? "Confirm & Publish"
                  : "Confirm & Make Private"}
            </ReusableButton>
          </div>
        }
      >
        <div className="space-y-4 py-2">
          <p className="text-gray-600 dark:text-gray-300">
            {targetVisibility
              ? "You are about to make this cohort visible on the public AirQo Map. This means anyone can see readings from devices in this cohort."
              : "You are about to make this cohort private. Data from devices in this cohort will only be visible to your organization and will not appear on the public map."}
          </p>
        </div>
      </ReusableDialog>

      <ReusableDialog
        isOpen={isTagsDialogOpen}
        onClose={() => !isPending && setIsTagsDialogOpen(false)}
        title="Edit Cohort Tags"
        size="md"
        customFooter={
          <div className="flex items-center justify-end gap-3 w-full px-6 py-4 border-t border-gray-200 dark:border-gray-700">
            <ReusableButton
              variant="outlined"
              onClick={() => setIsTagsDialogOpen(false)}
              disabled={isPending}
            >
              Cancel
            </ReusableButton>
            <ReusableButton
              onClick={handleConfirmTagsUpdate}
              disabled={isPending}
              variant="filled"
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isPending ? "Updating..." : "Save Changes"}
            </ReusableButton>
          </div>
        }
      >
        <div className="space-y-4 py-4 px-1">
          <MultiSelectCombobox
            options={DEFAULT_COHORT_TAGS}
            placeholder="Select or create tags..."
            emptyMessage="No tags found."
            value={selectedTags}
            onValueChange={setSelectedTags}
            allowCreate={false}
          />
        </div>
      </ReusableDialog>
    </>
  );
};

export default CohortDetailsCard;

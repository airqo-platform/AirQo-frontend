import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";
import ReusableButton from "@/components/shared/button/ReusableButton";
import { AqCopy01, AqEdit01 } from "@airqo/icons-react";
import ReusableToast from "@/components/shared/toast/ReusableToast";
import { Switch } from "@/components/ui/switch";
import { useState } from "react";
import { useUpdateCohortDetails } from "@/core/hooks/useCohorts";
import ReusableDialog from "@/components/shared/dialog/ReusableDialog";

interface CohortDetailsCardProps {
  name: string;
  id: string;
  visibility: boolean;
  onShowDetailsModal: () => void;
  loading: boolean;
}

const CohortDetailsCard: React.FC<CohortDetailsCardProps> = ({ name, id, visibility, onShowDetailsModal, loading }) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [targetVisibility, setTargetVisibility] = useState<boolean>(false);
  const { mutate: updateCohort, isPending } = useUpdateCohortDetails();

  const handleToggle = (checked: boolean) => {
    setTargetVisibility(checked);
    setIsDialogOpen(true);
  };

  const handleConfirmUpdate = () => {
    updateCohort(
      { cohortId: id, data: { visibility: targetVisibility } },
      {
        onSuccess: () => {
          setIsDialogOpen(false);
          // Toast is handled by the hook
        },
      }
    );
  };

  if (loading) {
    return <Card className="w-full rounded-lg bg-white flex flex-col justify-between items-center p-8"><Loader2 className="w-6 h-6 animate-spin" /></Card>;
  }
  return (
    <>
      <Card className="w-full rounded-lg bg-white flex flex-col justify-between h-full">
        <div className="px-3 py-2 flex flex-col gap-4">
          <h2 className="text-lg font-semibold">Cohort Details</h2>

          <div>
            <div className="text-xs text-muted-foreground uppercase font-medium tracking-wide mb-1">Cohort Name</div>
            <div className="text-base font-normal break-all">{name || "-"}</div>
          </div>

          <div>
            <div className="text-xs text-muted-foreground uppercase font-medium tracking-wide mb-1">Visibility</div>
            <div className="flex items-center gap-2 mt-1">
              <span className={`text-sm font-medium ${!visibility ? "text-gray-900 dark:text-gray-100" : "text-gray-500 dark:text-gray-400"}`}>
                Private
              </span>
              <Switch
                checked={visibility}
                onCheckedChange={handleToggle}
                className="data-[state=checked]:bg-green-500"
              />
              <span className={`text-sm font-medium ${visibility ? "text-gray-900 dark:text-gray-100" : "text-gray-500 dark:text-gray-400"}`}>
                Public
              </span>
            </div>
          </div>

          <div>
            <div className="text-xs text-muted-foreground uppercase font-medium tracking-wide mb-1">Cohort ID</div>
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
                    ReusableToast({ message: "Copied", type: "SUCCESS" })
                  }
                }}
                className="p-1"
                Icon={AqCopy01}
              />
            </div>
          </div>
        </div>

        <div className="border-t px-2 flex justify-end">
          <ReusableButton variant="text" onClick={onShowDetailsModal} Icon={AqEdit01} className="p-1 text-xs m-1">
            Edit details
          </ReusableButton>
        </div>
      </Card>

      <ReusableDialog
        isOpen={isDialogOpen}
        onClose={() => !isPending && setIsDialogOpen(false)}
        title={targetVisibility ? "Make cohort public?" : "Make cohort private?"}
        size="md"
        customFooter={
          <div className="flex items-center justify-end gap-3 w-full px-6 py-4 border-t border-gray-200 dark:border-gray-700">
            <ReusableButton
              variant="outlined"
              onClick={() => setIsDialogOpen(false)}
              disabled={isPending}
            >
              Cancel
            </ReusableButton>
            <ReusableButton
              onClick={handleConfirmUpdate}
              disabled={isPending}
              variant="filled"
              className={targetVisibility ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}
            >
              {isPending ? "Updating..." : (targetVisibility ? "Confirm & Publish" : "Confirm & Make Private")}
            </ReusableButton>
          </div>
        }
      >
        <div className="space-y-4 py-2">
          <p className="text-gray-600 dark:text-gray-300">
            {targetVisibility
              ? "You are about to make this cohort visible on the public AirQo Map. This means anyone can see readings from devices in this cohort."
              : "You are about to make this cohort private. Data from devices in this cohort will only be visible to your organization and will not appear on the public map."
            }
          </p>
        </div>
      </ReusableDialog>
    </>
  );
};

export default CohortDetailsCard;
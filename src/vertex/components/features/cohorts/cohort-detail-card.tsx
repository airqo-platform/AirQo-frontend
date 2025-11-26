import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";
import ReusableButton from "@/components/shared/button/ReusableButton";
import { AqCopy01, AqEdit01 } from "@airqo/icons-react";
import ReusableToast from "@/components/shared/toast/ReusableToast";

interface CohortDetailsCardProps {
  name: string;
  id: string;
  visibility: boolean;
  onShowDetailsModal: () => void;
  loading: boolean;
}

const CohortDetailsCard: React.FC<CohortDetailsCardProps> = ({ name, id, visibility, onShowDetailsModal, loading }) => {
  if (loading) {
    return <Card className="w-full rounded-lg bg-white flex flex-col justify-between items-center p-8"><Loader2 className="w-6 h-6 animate-spin" /></Card>;
  }
  return (
    <Card className="w-full rounded-lg bg-white flex flex-col justify-between">
      <div className="px-3 py-2 flex flex-col gap-4">
        <h2 className="text-lg font-semibold">Cohort Details</h2>

        <div>
          <div className="text-xs text-muted-foreground uppercase font-medium tracking-wide mb-1">Cohort Name</div>
          <div className="text-base font-normal break-all">{name || "-"}</div>
        </div>

        <div>
          <div className="text-xs text-muted-foreground uppercase font-medium tracking-wide mb-1">Visibility</div>
          <Badge variant={visibility ? "default" : "secondary"}>
            {visibility ? "Public" : "Private"}
          </Badge>
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
                  ReusableToast({message: "Copied", type: "SUCCESS"})
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
  );
};

export default CohortDetailsCard;
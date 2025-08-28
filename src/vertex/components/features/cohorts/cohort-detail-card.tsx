import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Copy } from "lucide-react";
import { toast } from "sonner";

interface CohortDetailsCardProps {
  name: string;
  id: string;
  visibility: boolean;
  onShowDetailsModal: () => void;
}

const CohortDetailsCard: React.FC<CohortDetailsCardProps> = ({ name, id, visibility, onShowDetailsModal }) => {
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
            <Button
              variant="ghost"
              size="icon"
              className="hover:bg-transparent"
              onClick={() => {
                if (id) {
                  navigator.clipboard.writeText(id);
                  toast.success("Cohort ID copied!");
                }
              }}
            >
              <Copy className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="border-t px-2 flex justify-end">
        <Button variant="ghost" onClick={onShowDetailsModal} className="hover:bg-transparent">
          View more details
        </Button>
      </div>
    </Card>
  );
};

export default CohortDetailsCard;
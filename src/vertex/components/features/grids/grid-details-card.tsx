import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";
import ReusableButton from "@/components/shared/button/ReusableButton";
import { AqCopy01, AqEdit01 } from "@airqo/icons-react";
import ReusableToast from "@/components/shared/toast/ReusableToast";
import { Grid } from "@/app/types/grids";

interface GridDetailsCardProps {
    grid: Grid;
    onEdit: () => void;
    loading: boolean;
}

const GridDetailsCard: React.FC<GridDetailsCardProps> = ({ grid, onEdit, loading }) => {
    if (loading) {
        return <Card className="w-full rounded-lg bg-white flex flex-col justify-between items-center p-8"><Loader2 className="w-6 h-6 animate-spin" /></Card>;
    }

    const handleCopy = (text: string) => {
        if (text) {
            navigator.clipboard.writeText(text);
            ReusableToast({ message: "Copied to clipboard", type: "SUCCESS" });
        }
    };

    return (
        <Card className="w-full rounded-lg bg-white flex flex-col justify-between">
            <div className="px-3 py-2 flex flex-col gap-4">
                <h2 className="text-lg font-semibold">Grid Details</h2>

                <div>
                    <div className="text-xs text-muted-foreground uppercase font-medium tracking-wide mb-1">Grid Name</div>
                    <div className="text-base font-normal break-all">{grid.name || "-"}</div>
                </div>

                <div>
                    <div className="text-xs text-muted-foreground uppercase font-medium tracking-wide mb-1">Admin Level</div>
                    <div className="text-base font-normal break-all">{grid.admin_level || "-"}</div>
                </div>

                <div>
                    <div className="text-xs text-muted-foreground uppercase font-medium tracking-wide mb-1">Visibility</div>
                    <Badge variant={grid.visibility ? "default" : "secondary"}>
                        {grid.visibility ? "Public" : "Private"}
                    </Badge>
                </div>

                <div>
                    <div className="text-xs text-muted-foreground uppercase font-medium tracking-wide mb-1">Grid ID</div>
                    <div className="flex items-center gap-2">
                        <div className="text-sm font-mono select-all overflow-x-auto whitespace-nowrap scrollbar-hide max-w-full">{grid._id || "-"}</div>
                        <ReusableButton variant="text" onClick={() => handleCopy(grid._id)} className="p-1" Icon={AqCopy01} />
                    </div>
                </div>
            </div>
            <div className="border-t px-2 flex justify-end">
                <ReusableButton variant="text" onClick={onEdit} Icon={AqEdit01} className="p-1 text-xs m-1">
                    Edit Details
                </ReusableButton>
            </div>
        </Card>
    );
};

export default GridDetailsCard;
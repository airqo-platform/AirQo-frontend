import { Card } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import ReusableButton from "@/components/shared/button/ReusableButton";
import { AqCopy01 } from "@airqo/icons-react";
import ReusableToast from "@/components/shared/toast/ReusableToast";
import { Grid } from "@/app/types/grids";

interface GridMeasurementsApiCardProps {
    grid: Grid;
    loading: boolean;
}

const GridMeasurementsApiCard: React.FC<GridMeasurementsApiCardProps> = ({ grid, loading }) => {
    if (loading) {
        return <Card className="w-full rounded-lg bg-white flex flex-col justify-between items-center p-8"><Loader2 className="w-6 h-6 animate-spin" /></Card>;
    }

    const handleCopy = (text: string) => {
        if (text) {
            navigator.clipboard.writeText(text);
            ReusableToast({ message: "API URL copied!", type: "SUCCESS" });
        }
    };

    const recentApiUrl = `https://api.airqo.net/api/v2/devices/measurements/${grid._id}`;
    const historicalApiUrl = `https://api.airqo.net/api/v2/devices/measurements/grids/${grid._id}`;

    return (
        <Card className="w-full rounded-lg bg-white flex flex-col gap-4 px-3 py-2">
            <h2 className="text-lg font-semibold mb-2">Grid Measurements API</h2>
            {/* Recent Measurements */}
            <div className="flex flex-col gap-1">
                <div className="text-xs text-muted-foreground uppercase font-medium tracking-wide mb-1">Recent Measurements API</div>
                <div className="flex items-center gap-2">
                    <div className="text-sm font-mono select-all overflow-x-auto whitespace-nowrap scrollbar-hide max-w-full" style={{ WebkitOverflowScrolling: 'touch' }}>
                        {`${recentApiUrl}?token=YOUR_TOKEN`}
                    </div>
                    <ReusableButton variant="text" className="p-0" onClick={() => handleCopy(`${recentApiUrl}?token=YOUR_TOKEN`)} Icon={AqCopy01} />
                </div>
            </div>
            {/* Historical Measurements */}
            <div className="flex flex-col gap-1">
                <div className="text-xs text-muted-foreground uppercase font-medium tracking-wide mb-1">Historical Measurements API</div>
                <div className="flex items-center gap-2">
                    <div className="text-sm font-mono select-all overflow-x-auto whitespace-nowrap scrollbar-hide max-w-full" style={{ WebkitOverflowScrolling: 'touch' }}>
                        {`${historicalApiUrl}?token=YOUR_TOKEN`}
                    </div>
                    <ReusableButton variant="text" className="p-0" onClick={() => handleCopy(`${historicalApiUrl}?token=YOUR_TOKEN`)} Icon={AqCopy01} />
                </div>
            </div>
        </Card>
    );
};

export default GridMeasurementsApiCard;
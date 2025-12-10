
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface NetworkDetailsCardProps {
    name: string;
    id: string;
    loading?: boolean;
}

export default function NetworkDetailsCard({
    name,
    id,
    loading = false,
}: NetworkDetailsCardProps) {
    if (loading) {
        return (
            <Card className="w-full">
                <CardContent className="pt-6">
                    <div className="space-y-3">
                        <div className="h-6 w-1/3 bg-gray-200 rounded animate-pulse" />
                        <div className="h-4 w-1/2 bg-gray-100 rounded animate-pulse" />
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="w-full">
            <CardContent className="pt-6">
                <div className="flex justify-between items-start">
                    <div className="space-y-1">
                        <h2 className="text-2xl font-bold tracking-tight capitalize">
                            {name}
                        </h2>
                        <div className="flex flex-col gap-1">
                            <span className="text-sm text-muted-foreground flex items-center gap-2">
                                ID: <Badge variant="outline" className="font-mono text-xs">{id}</Badge>
                            </span>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

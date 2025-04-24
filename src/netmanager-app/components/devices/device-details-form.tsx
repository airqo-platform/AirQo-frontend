import { Device } from "@/app/types/devices";
import { ReactNode } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { toast } from "sonner"
import { Separator } from "../ui/separator";
import { Button } from "../ui/button";
import { Copy } from "lucide-react";
import { DEVICES_MGT_URL } from "@/core/urls";

const truncateId = (id: string) => {
    if (id.length <= 6) return id
    return `${id.slice(0, 6)}***${id.slice(-2)}`
}

const SectionHeader = ({ title }: { title: string }) => <h3 className="text-lg font-semibold mb-2">{title}</h3>

const DetailItem = ({
    label,
    value,
    children,
}: { label: string; value?: string | number | ReactNode; children?: ReactNode }) => (
    <div>
        <h4 className="font-medium text-muted-foreground">{label}</h4>
        {children || <p>{value || "—"}</p>}
    </div>
)

export const DeviceDetailsModal = ({
    device,
    isOpen,
    onClose,
    onEdit,
}: {
    device: Device
    isOpen: boolean
    onClose: () => void
    onEdit: () => void
}) => {
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Device Details</DialogTitle>
                    <DialogDescription>Complete information about {device.long_name}</DialogDescription>
                </DialogHeader>

                <div className="py-4">
                    <SectionHeader title="Basic Information" />
                    <div className="grid grid-cols-2 gap-4 mb-6">
                        <DetailItem label="Name" value={device.long_name.slice(0, 16) + (device.long_name.length > 16 ? "..." : "")} />
                        <DetailItem label="Serial Number" value={device.serial_number} />
                        <DetailItem label="Device Number (Channel ID)" value={device.device_number} />
                        <DetailItem label="Description" value={device.description} />
                        <DetailItem
                            label="Next Maintenance"
                            value={
                                device.nextMaintenance
                                    ? new Date(device.nextMaintenance).toLocaleString("en-US", {
                                        day: "2-digit",
                                        month: "short",
                                        year: "numeric",
                                        hour: "2-digit",
                                        minute: "2-digit",
                                        hour12: true,
                                    })
                                    : undefined
                            }
                        />
                        <DetailItem
                            label="Created At"
                            value={
                                device.createdAt
                                    ? new Date(device.createdAt).toLocaleString("en-US", {
                                        day: "2-digit",
                                        month: "short",
                                        year: "numeric",
                                        hour: "2-digit",
                                        minute: "2-digit",
                                        hour12: true,
                                    })
                                    : undefined
                            }
                        />
                    </div>

                    <Separator className="my-4" />

                    <SectionHeader title="Access Keys" />
                    <div className="grid grid-cols-2 gap-4 mb-6">
                        <DetailItem label="Read Key">
                            <div className="flex items-center">
                                <p>{truncateId(device.readKey || "--")}</p>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-muted-foreground hover:text-foreground"
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        if (device.readKey) {
                                            navigator.clipboard.writeText(device.readKey)
                                            toast("Read key copied to clipboard")
                                        } else {
                                            toast.error("Read key is not available")
                                        }
                                    }}
                                >
                                    <Copy className="h-4 w-4" />
                                </Button>
                            </div>
                        </DetailItem>
                        <DetailItem label="Write Key">
                            <div className="flex items-center">
                                <p>{truncateId(device.writeKey || "")}</p>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-muted-foreground hover:text-foreground"
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        if (device.writeKey) {
                                            navigator.clipboard.writeText(device.writeKey)
                                            toast("Write key copied to clipboard")
                                        } else {
                                            toast.error("Write key is not available")
                                        }
                                    }}
                                >
                                    <Copy className="h-4 w-4" />
                                </Button>
                            </div>
                        </DetailItem>
                    </div>

                    <Separator className="my-4" />

                    <SectionHeader title="Location & Contact" />
                    <div className="grid grid-cols-2 gap-4 mb-6">
                        <DetailItem label="Latitude" value={device.latitude} />
                        <DetailItem label="Longitude" value={device.longitude} />
                        <DetailItem label="Phone Number" value={device.phoneNumber} />
                    </div>

                    <Separator className="my-4" />

                    <SectionHeader title="Configuration" />
                    <div className="grid grid-cols-2 gap-4 mb-6">
                        <DetailItem label="Network" value={device.network} />
                        <DetailItem label="Category" value={device.category} />
                        <DetailItem label="Primary Device In Location" value={device.isPrimaryInLocation ? "Yes" : "No"} />
                        <DetailItem label="Data Access" value={device.visibility ? "Public" : "Private"} />
                        <DetailItem label="Generation Version" value={device.generation_version} />
                        <DetailItem label="Generation Count" value={device.generation_count} />
                    </div>

                    <Separator className="my-4" />

                    <SectionHeader title="Status" />
                    <div className="grid grid-cols-2 gap-4 mb-6">
                        <DetailItem label="Online Status" value={device.isOnline ? "Online" : "Offline"} />
                        <DetailItem label="Active Status" value={device.isActive ? "Active" : "Inactive"} />
                        <DetailItem label="Deployment Status" value={device.status} />
                        <DetailItem label="Height" value={device.height ? `${device.height} m` : undefined} />
                    </div>

                    <Separator className="my-4" />

                    <SectionHeader title="API Data Access" />
                    <div className="grid grid-cols-2 gap-4 mb-6">
                        <DetailItem label="Historical measurements API">
                            <div className="flex items-center gap-1">
                                <p
                                    className="max-w-[270px] overflow-x-auto bg-muted px-2 py-1 rounded-md text-sm text-muted-foreground font-mono"
                                    style={{ whiteSpace: "nowrap" }}
                                >
                                    {`${DEVICES_MGT_URL}/measurements/devices/${device.id
                                        }/historical?token=YOUR_API_TOKEN` || '-'}
                                </p>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-muted-foreground hover:text-foreground"
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        navigator.clipboard.writeText(`${DEVICES_MGT_URL}/measurements/devices/${device.id
                                            }/historical?token=YOUR_API_TOKEN`)
                                        toast("Historical measurements API copied to clipboard")
                                    }}
                                >
                                    <Copy className="h-4 w-4" />
                                </Button>
                            </div>
                        </DetailItem>

                        <DetailItem label="Recent measurements API">
                            <div className="flex items-center gap-1">
                                <p
                                    className="max-w-[270px] overflow-x-auto bg-muted px-2 py-1 rounded-md text-sm text-muted-foreground font-mono"
                                    style={{ whiteSpace: "nowrap" }}
                                >
                                    {`${DEVICES_MGT_URL}/measurements/devices/${device.id
                                    }/recent?token=YOUR_API_TOKEN` || '-'}
                                </p>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-muted-foreground hover:text-foreground"
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        navigator.clipboard.writeText(`${DEVICES_MGT_URL}/measurements/devices/${device.id
                                            }/recent?token=YOUR_API_TOKEN`)
                                        toast("Recent measurements API copied to clipboard")
                                    }}
                                >
                                    <Copy className="h-4 w-4" />
                                </Button>
                            </div>
                        </DetailItem>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>
                        Close
                    </Button>
                    <Button
                        variant="outline"
                        onClick={() => {
                            onClose()
                            onEdit()
                        }}
                    >
                        Edit Details
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
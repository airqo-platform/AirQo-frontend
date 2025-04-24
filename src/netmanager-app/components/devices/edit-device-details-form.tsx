import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../ui/dialog"
import { Button } from "../ui/button"
import { Loader2 } from "lucide-react"
import { Device } from "@/app/types/devices"
import { ReactNode } from "react"
import { EditData } from "@/app/(authenticated)/devices/[id]/page"

const FormField = ({
    id,
    label,
    required = false,
    children,
}: {
    id: string
    label: string
    required?: boolean
    children: ReactNode
}) => (
    <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor={id} className="text-right">
            {label} {required && "*"}
        </Label>
        <div className="col-span-3">{children}</div>
    </div>
)

export const DeviceEditModal = ({
    device,
    editData,
    handleInputChange,
    isOpen,
    onClose,
    onSave,
    isSaving,
}: {
    device: Device
    editData: EditData
    handleInputChange: (field: string, value: string | number | boolean) => void
    isOpen: boolean
    onClose: () => void
    onSave: () => void
    isSaving: boolean
}) => {
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Edit Device Details</DialogTitle>
                    <DialogDescription>
                        Make changes to the device details here. Click save when you&apos;re done.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <FormField id="long_name" label="Name" required>
                        <Input
                            id="long_name"
                            value={editData.long_name || ""}
                            onChange={(e) => handleInputChange("long_name", e.target.value)}
                            required
                        />
                    </FormField>

                    <FormField id="device_number" label="Channel ID" required>
                        <Input
                            id="device_number"
                            value={editData.device_number || ""}
                            onChange={(e) => handleInputChange("device_number", e.target.value)}
                            required
                        />
                    </FormField>

                    <FormField id="category" label="Category" required>
                        <Select
                            value={editData.category || ""}
                            onValueChange={(value) => handleInputChange("category", value)}
                            required
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="lowcost">Lowcost</SelectItem>
                                <SelectItem value="gas">GAS</SelectItem>
                                <SelectItem value="bam">BAM</SelectItem>
                            </SelectContent>
                        </Select>
                    </FormField>

                    <FormField id="description" label="Description">
                        <Textarea
                            id="description"
                            value={editData.description || ""}
                            onChange={(e) => handleInputChange("description", e.target.value)}
                            className="min-h-[80px]"
                        />
                    </FormField>

                    <FormField id="phoneNumber" label="Phone Number">
                        <Input
                            id="phoneNumber"
                            value={editData.phoneNumber || ""}
                            onChange={(e) => handleInputChange("phoneNumber", e.target.value)}
                        />
                    </FormField>

                    <FormField id="latitude" label="Latitude">
                        <Input
                            id="latitude"
                            type="number"
                            step="0.000001"
                            value={editData.latitude || ""}
                            onChange={(e) => handleInputChange("latitude", e.target.value)}
                        />
                    </FormField>

                    <FormField id="longitude" label="Longitude">
                        <Input
                            id="longitude"
                            type="number"
                            step="0.000001"
                            value={editData.longitude || ""}
                            onChange={(e) => handleInputChange("longitude", e.target.value)}
                        />
                    </FormField>

                    <FormField id="visibility" label="Data Access">
                        <Select
                            value={editData.visibility.toString() || "false"}
                            onValueChange={(value) => handleInputChange("visibility", value === "true")}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select data access" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="false">Private</SelectItem>
                                <SelectItem value="true">Public</SelectItem>
                            </SelectContent>
                        </Select>
                    </FormField>

                    <FormField id="network" label="Network">
                        <Input value={device.network} disabled type="text" />
                    </FormField>

                    <FormField id="isPrimaryInLocation" label="Primary Device In Location">
                        <Select
                            value={editData.isPrimaryInLocation ? "yes" : "no"}
                            onValueChange={(value) => handleInputChange("isPrimaryInLocation", value === "yes")}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select option" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="yes">Yes</SelectItem>
                                <SelectItem value="no">No</SelectItem>
                            </SelectContent>
                        </Select>
                    </FormField>

                    <FormField id="generation_version" label="Generation Version">
                        <Input
                            id="generation_version"
                            value={editData.generation_version || ""}
                            onChange={(e) => handleInputChange("generation_version", e.target.value)}
                        />
                    </FormField>

                    <FormField id="generation_count" label="Generation Count">
                        <Input
                            id="generation_count"
                            type="number"
                            value={editData.generation_count || ""}
                            onChange={(e) => handleInputChange("generation_count", e.target.value)}
                        />
                    </FormField>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button onClick={onSave} disabled={isSaving}>
                        {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        Save changes
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
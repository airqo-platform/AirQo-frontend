"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { diagnosticsService } from "@/services/diagnosticsService";
import { DeviceProfile } from "@/types/diagnostics";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";
import { Layers, Plus, Sparkles, ArrowRight } from "lucide-react";

interface RegisterProfileModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: (created: DeviceProfile) => void;
}

export function RegisterProfileModal({
  open,
  onOpenChange,
  onSuccess,
}: RegisterProfileModalProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Form State: Header & Metadata Only
  const [name, setName] = useState<string>("");
  const [category, setCategory] = useState<string>("air_quality");
  const [vendor, setVendor] = useState<string>("AirQo");
  const [description, setDescription] = useState<string>("");
  const [metaDataJson, setMetaDataJson] = useState<string>(
    JSON.stringify({ is_default_lowcost: true, hardware_generation: "v5.2" }, null, 2)
  );

  const handleRegister = async () => {
    if (!name.trim()) {
      toast({
        title: "Name Required",
        description: "Please provide a descriptive name for this device profile.",
        variant: "destructive",
      });
      return;
    }

    let parsedMeta: Record<string, any> = {};
    if (metaDataJson.trim()) {
      try {
        const parsed = JSON.parse(metaDataJson);
        if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
          throw new Error("Custom metadata must be a JSON object");
        }
        parsedMeta = parsed;
      } catch (e) {
        toast({
          title: "Invalid JSON",
          description: "Custom Metadata JSON is not valid syntax.",
          variant: "destructive",
        });
        return;
      }
    }

    const payload: Partial<DeviceProfile> = {
      name: name.trim(),
      category: category,
      vendor: vendor.trim() || null,
      description: description.trim() || null,
      meta_data: Object.keys(parsedMeta).length > 0 ? parsedMeta : {},
      telemetry_mappings: {},
      config_mappings: {},
      metadata_mappings: {},
      components: [],
      relationships: [],
    };

    try {
      setIsSubmitting(true);
      const created = await diagnosticsService.createProfile(payload);
      toast({
        title: "Profile Registered",
        description: `Successfully created ${created.name}. Now configure subsystems & mappings.`,
      });

      onOpenChange(false);
      if (onSuccess) {
        onSuccess(created);
      } else {
        router.push(`/dashboard/settings/device-profiles/${created.id}`);
      }
    } catch (err: any) {
      console.error("Error registering device profile:", err);
      toast({
        title: "Registration Failed",
        description: err?.message || "Could not register device profile.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <Layers className="w-5 h-5 text-primary" />
            Register Device Profile
          </DialogTitle>
          <DialogDescription className="text-xs text-gray-500">
            Define basic header metadata. You can configure subsystems, metrics, and ingestion mappings on the next screen.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-2 text-xs">
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-gray-700">Profile Name *</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. AirQo-v5-DualPM or BAM-1020"
              className="h-8 text-xs"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-gray-700">Hardware Category *</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="air_quality">Air Quality Stations</SelectItem>
                  <SelectItem value="air_quality_gas">Air Quality Gas Monitor</SelectItem>
                  <SelectItem value="reference_monitor">Reference Monitor (BAM-1020 / TEOM)</SelectItem>
                  <SelectItem value="cold_chain">Cold Chain Vaccine Monitors</SelectItem>
                  <SelectItem value="solar">Solar Microgrids</SelectItem>
                  <SelectItem value="water_pump">Smart Water Pumps</SelectItem>
                  <SelectItem value="weather_station">Weather Stations</SelectItem>
                  <SelectItem value="generic_iot">Generic IoT Node</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-gray-700">Vendor / Manufacturer</Label>
              <Input
                value={vendor}
                onChange={(e) => setVendor(e.target.value)}
                placeholder="e.g. AirQo / Met One"
                className="h-8 text-xs"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-gray-700">Description</Label>
            <Textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe hardware station characteristics and deployment context..."
              className="text-xs"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-gray-700 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              Custom Metadata JSON (meta_data)
            </Label>
            <Textarea
              rows={3}
              value={metaDataJson}
              onChange={(e) => setMetaDataJson(e.target.value)}
              placeholder={'{\n  "hardware_generation": "v5.2"\n}'}
              className="font-mono text-xs"
            />
          </div>
        </div>

        <DialogFooter className="pt-3 border-t">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            className="text-xs"
          >
            Cancel
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={handleRegister}
            disabled={isSubmitting}
            className="text-xs bg-primary hover:bg-primary/90 text-white gap-1.5 font-semibold"
          >
            {isSubmitting ? "Registering..." : "Create & Configure"}
            <ArrowRight className="w-3.5 h-3.5" />
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

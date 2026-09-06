"use client";

import React, { useState, useEffect } from "react";
import { diagnosticsService } from "@/services/diagnosticsService";
import { DeviceProfile, getVendorName } from "@/types/diagnostics";
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
import { Edit2, Sparkles } from "lucide-react";

interface EditHeaderModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  profile: DeviceProfile;
  onSuccess: (updated: DeviceProfile) => void;
}

export function EditHeaderModal({
  open,
  onOpenChange,
  profile,
  onSuccess,
}: EditHeaderModalProps) {
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [name, setName] = useState<string>(profile.name || "");
  const [category, setCategory] = useState<string>(profile.category || "air_quality");
  const [vendor, setVendor] = useState<string>(getVendorName(profile.vendor));
  const [description, setDescription] = useState<string>(profile.description || "");
  const [metaDataJson, setMetaDataJson] = useState<string>(
    JSON.stringify(profile.meta_data || {}, null, 2)
  );

  useEffect(() => {
    if (open && profile) {
      setName(profile.name || "");
      setCategory(profile.category || "air_quality");
      setVendor(getVendorName(profile.vendor));
      setDescription(profile.description || "");
      setMetaDataJson(JSON.stringify(profile.meta_data || {}, null, 2));
    }
  }, [open, profile]);

  const handleSave = async () => {
    if (!name.trim()) {
      toast({
        title: "Name Required",
        description: "Please provide a profile name.",
        variant: "destructive",
      });
      return;
    }

    let parsedMeta: Record<string, any> = {};
    if (metaDataJson.trim()) {
      try {
        parsedMeta = JSON.parse(metaDataJson);
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
      ...profile,
      name: name.trim(),
      category: category,
      vendor: vendor.trim() || null,
      description: description.trim() || null,
      meta_data: Object.keys(parsedMeta).length > 0 ? parsedMeta : {},
    };

    try {
      setIsSubmitting(true);
      const updated = await diagnosticsService.updateProfile(profile.id, payload);
      toast({
        title: "Header Updated",
        description: `Successfully updated metadata for ${updated.name}.`,
      });
      onOpenChange(false);
      onSuccess(updated);
    } catch (err: any) {
      toast({
        title: "Update Failed",
        description: err?.message || "Could not update header metadata.",
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
            <Edit2 className="w-5 h-5 text-primary" />
            Edit Profile Header & Metadata
          </DialogTitle>
          <DialogDescription className="text-xs text-gray-500">
            Update general identification, category, vendor, and metadata tags.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-2 text-xs">
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-gray-700">Profile Name *</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. AirQo-v5-DualPM"
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
              placeholder="Describe hardware station characteristics..."
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
            onClick={handleSave}
            disabled={isSubmitting}
            className="text-xs bg-primary hover:bg-primary/90 text-white font-semibold"
          >
            {isSubmitting ? "Saving..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

"use client";

import React, { useEffect, useMemo, useState } from "react";
import { diagnosticsService } from "@/services/diagnosticsService";
import type { DeviceProfile, StatusCodeSet } from "@/types/diagnostics";
import { getProfileStatusField } from "@/lib/status-codes";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";
import { AlertTriangle, Link2 } from "lucide-react";

const slotNumber = (slot: string) => Number(slot.replace(/\D/g, "")) || 0;

/**
 * Point a profile's telemetry field at a status code set, i.e. set `status_code_set` on that
 * field's mapping. Only the telemetry mappings are sent, read fresh, so nothing else on the
 * profile can be overwritten.
 */
export async function setSlotStatusCodeSet(profileId: string, slot: string, setName: string | null): Promise<DeviceProfile> {
  const profile = await diagnosticsService.getProfile(profileId);
  const mappings = { ...(profile.telemetry_mappings || {}) };
  const mapping = mappings[slot];
  if (!mapping) throw new Error(`${profile.name} has no telemetry field ${slot}.`);
  const { status_code_set: _previous, ...rest } = mapping;
  mappings[slot] = setName ? { ...rest, status_code_set: setName } : rest;
  return diagnosticsService.updateProfile(profileId, { telemetry_mappings: mappings });
}

interface LinkStatusCodeSetDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  codeSet: StatusCodeSet;
  profiles: DeviceProfile[];
  onLinked: () => void;
}

export function LinkStatusCodeSetDialog({ open, onOpenChange, codeSet, profiles, onLinked }: LinkStatusCodeSetDialogProps) {
  const [profileId, setProfileId] = useState("");
  const [slot, setSlot] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setProfileId("");
      setSlot("");
    }
  }, [open]);

  const sortedProfiles = useMemo(() => [...profiles].sort((a, b) => a.name.localeCompare(b.name)), [profiles]);
  const profile = profiles.find((p) => p.id === profileId) ?? null;
  const slots = useMemo(
    () => Object.entries(profile?.telemetry_mappings || {}).sort(([a], [b]) => slotNumber(a) - slotNumber(b)),
    [profile]
  );
  const mapping = profile?.telemetry_mappings?.[slot];
  // Pages read one status field per profile, so work out which one wins once this link is saved
  const otherLinkedSlots = slots.filter(([key, m]) => key !== slot && m.status_code_set).map(([key]) => key);
  const fieldReadAfterLink =
    profile && slot && mapping
      ? getProfileStatusField({
          telemetry_mappings: { ...profile.telemetry_mappings, [slot]: { ...mapping, status_code_set: codeSet.name } },
        })
      : null;

  const chooseProfile = (id: string) => {
    setProfileId(id);
    // The status field is usually the one keyed `device_status`
    const next = profiles.find((p) => p.id === id);
    const statusSlot = Object.entries(next?.telemetry_mappings || {}).find(([, m]) => m.key === "device_status")?.[0];
    setSlot(statusSlot ?? "");
  };

  const handleSave = async () => {
    if (!profile || !slot) return;
    try {
      setIsSaving(true);
      await setSlotStatusCodeSet(profile.id, slot, codeSet.name);
      toast({ title: "Status Codes Linked", description: `${profile.name} ${slot} now decodes with ${codeSet.name}.` });
      onOpenChange(false);
      onLinked();
    } catch (err: any) {
      toast({ title: "Link Failed", description: err?.message || "Could not update the profile.", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <Link2 className="w-5 h-5 text-primary" />
            Link {codeSet.name} to a Profile Field
          </DialogTitle>
          <DialogDescription className="text-xs text-gray-500">
            Pick the telemetry field that carries the status code. Every device using the profile, i.e. whose category matches
            the profile&apos;s name, is then decoded with this set.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 text-xs">
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-gray-700">Device Profile</Label>
            <Select value={profileId} onValueChange={chooseProfile}>
              <SelectTrigger className="h-8 text-xs">
                <SelectValue placeholder="Choose a profile" />
              </SelectTrigger>
              <SelectContent>
                {sortedProfiles.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name}
                    {p.category ? ` (${p.category})` : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {profile && (
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-gray-700">Status Field</Label>
              {slots.length === 0 ? (
                <p className="text-gray-500">This profile has no telemetry fields yet. Add one on the profile&apos;s Telemetry Slots tab.</p>
              ) : (
                <Select value={slot} onValueChange={setSlot}>
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue placeholder="Choose a field" />
                  </SelectTrigger>
                  <SelectContent>
                    {slots.map(([key, m]) => (
                      <SelectItem key={key} value={key}>
                        {key} · {m.label}
                        {m.status_code_set ? ` (${m.status_code_set})` : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          )}

          {mapping?.status_code_set === codeSet.name && <p className="text-gray-500">{slot} is already linked to {codeSet.name}.</p>}
          {mapping?.status_code_set && mapping.status_code_set !== codeSet.name && (
            <p className="flex items-start gap-1.5 text-amber-700">
              <AlertTriangle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
              Replaces its link to {mapping.status_code_set}.
            </p>
          )}
          {fieldReadAfterLink && otherLinkedSlots.length > 0 && (
            <p className="flex items-start gap-1.5 text-amber-700">
              <AlertTriangle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
              {fieldReadAfterLink.slot === slot
                ? `Pages read one status field per profile, and it will be ${slot}. ${otherLinkedSlots.join(", ")} stay${otherLinkedSlots.length === 1 ? "s" : ""} linked but won't be read.`
                : `Pages read one status field per profile and will keep reading ${fieldReadAfterLink.slot}, so this link won't be used until that one is unlinked.`}
            </p>
          )}
        </div>

        <DialogFooter className="pt-3 border-t">
          <Button type="button" variant="outline" size="sm" onClick={() => onOpenChange(false)} className="text-xs">
            Cancel
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={handleSave}
            disabled={isSaving || !profile || !slot || mapping?.status_code_set === codeSet.name}
            className="text-xs font-semibold"
          >
            {isSaving ? "Linking..." : "Link Field"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

"use client";

import React, { useState, useEffect, useMemo } from "react";
import { diagnosticsService } from "@/services/diagnosticsService";
import {
  DeviceProfile,
  ComponentRelationship,
  getRelationshipDetails,
  RELATIONSHIP_OPTIONS,
  RelationshipType,
} from "@/types/diagnostics";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";
import { Activity, ArrowRight } from "lucide-react";

interface RelationshipModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  profile: DeviceProfile;
  relationshipIndex?: number | null;
  preselectedSource?: string | null;
  preselectedTarget?: string | null;
  onSuccess: (updated: DeviceProfile) => void;
}

export function RelationshipModal({
  open,
  onOpenChange,
  profile,
  relationshipIndex,
  preselectedSource,
  preselectedTarget,
  onSuccess,
}: RelationshipModalProps) {
  const isEditing = relationshipIndex !== null && relationshipIndex !== undefined && relationshipIndex >= 0;
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const [sourceComponent, setSourceComponent] = useState<string>("");
  const [targetComponent, setTargetComponent] = useState<string>("");
  const [relationType, setRelationType] = useState<string>("POWERS");

  const components = useMemo(() => profile.components || [], [profile.components]);

  useEffect(() => {
    if (open) {
      if (isEditing && profile.relationships && profile.relationships[relationshipIndex]) {
        const rel = profile.relationships[relationshipIndex];
        const details = getRelationshipDetails(rel, components);
        setSourceComponent(details.sourceName !== "Unknown Subsystem" ? details.sourceName : components[0]?.name || "");
        setTargetComponent(details.targetName !== "Unknown Subsystem" ? details.targetName : components[1]?.name || components[0]?.name || "");
        setRelationType(details.relationType || "POWERS");
      } else {
        setSourceComponent(preselectedSource || components[0]?.name || "");
        setTargetComponent(
          preselectedTarget ||
          (components.find((c) => c.name !== (preselectedSource || components[0]?.name))?.name) ||
          components[1]?.name ||
          components[0]?.name ||
          ""
        );
        setRelationType("POWERS");
      }
    }
  }, [open, isEditing, relationshipIndex, preselectedSource, preselectedTarget, profile.relationships, components]);

  const handleSave = async () => {
    if (!sourceComponent || !targetComponent || sourceComponent === targetComponent) {
      toast({
        title: "Selection Required",
        description: "Please choose both source and target subsystem components.",
        variant: "destructive",
      });
      return;
    }

    const currentRelationships = [...(profile.relationships || [])];

    const srcComp = components.find((c) => c.name === sourceComponent || c.id === sourceComponent);
    const tgtComp = components.find((c) => c.name === targetComponent || c.id === targetComponent);

    const existingRel = isEditing && relationshipIndex !== null && currentRelationships[relationshipIndex]
      ? currentRelationships[relationshipIndex]
      : {};

    const relObj: ComponentRelationship = {
      ...existingRel,
      source_component: srcComp?.name || sourceComponent,
      source_component_id: srcComp?.id || undefined,
      target_component: tgtComp?.name || targetComponent,
      target_component_id: tgtComp?.id || undefined,
      relation_type: relationType as any,
      relationship_type: relationType as any,
    };

    if (isEditing && relationshipIndex !== null && relationshipIndex >= 0) {
      currentRelationships[relationshipIndex] = relObj;
    } else {
      currentRelationships.push(relObj);
    }

    const payload: Partial<DeviceProfile> = {
      ...profile,
      relationships: currentRelationships,
    };

    try {
      setIsSubmitting(true);
      const updated = await diagnosticsService.updateProfile(profile.id, payload);
      toast({
        title: isEditing ? "Relationship Updated" : "Relationship Linked",
        description: `${sourceComponent} -> ${relationType} -> ${targetComponent}`,
      });
      onOpenChange(false);
      onSuccess(updated);
    } catch (err: any) {
      toast({
        title: "Save Failed",
        description: err?.message || "Could not save relationship.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <Activity className="w-5 h-5 text-primary" />
            {isEditing ? "Edit Component Relationship" : "Link Subsystems Topologically"}
          </DialogTitle>
          <DialogDescription className="text-xs text-gray-500">
            Establish directional dependency and causation paths across hardware subsystems.
          </DialogDescription>
        </DialogHeader>

        {components.length < 2 ? (
          <div className="p-4 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-xs">
            You need at least 2 subsystems registered in this profile to create topological relationships.
          </div>
        ) : (
          <div className="space-y-4 pt-2 text-xs">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-gray-700">Source Subsystem (Cause / Supplier) *</Label>
              <Select value={sourceComponent} onValueChange={setSourceComponent}>
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue placeholder="Select Source" />
                </SelectTrigger>
                <SelectContent>
                  {components.map((c, i) => (
                    <SelectItem key={c.id || i} value={c.name}>
                      {c.name} ({c.component_type})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-gray-700">Relationship Type *</Label>
              <Select value={relationType} onValueChange={setRelationType}>
                <SelectTrigger className="h-8 text-xs font-bold text-primary">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {RELATIONSHIP_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      <span className="font-semibold">{opt.label}</span>
                      <span className="text-gray-500 text-[11px] ml-1.5">({opt.description})</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-gray-700">Target Subsystem (Effect / Dependent) *</Label>
              <Select value={targetComponent} onValueChange={setTargetComponent}>
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue placeholder="Select Target" />
                </SelectTrigger>
                <SelectContent>
                  {components.map((c, i) => (
                    <SelectItem key={c.id || i} value={c.name}>
                      {c.name} ({c.component_type})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

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
            disabled={isSubmitting || components.length < 2 || !sourceComponent || !targetComponent || sourceComponent === targetComponent}
            className="text-xs bg-primary hover:bg-primary/90 text-white font-semibold"
          >
            {isSubmitting ? "Linking..." : isEditing ? "Update Link" : "Establish Link"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

"use client";

import React, { useState, useEffect } from "react";
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSession } from "next-auth/react";
import { DiagnosisResult, DiagnosticFeedbackCreate } from "@/types/diagnostics";
import { diagnosticsService } from "@/services/diagnosticsService";
import { toast } from "@/components/ui/use-toast";
import { MessageSquarePlus, CheckCircle2, XCircle, Wrench, ShieldCheck, Loader2, User } from "lucide-react";

interface TechnicianFeedbackModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  deviceId: string;
  snapshotId?: string;
  diagnosis?: DiagnosisResult | null;
  onFeedbackSubmitted?: () => void;
}

export const TechnicianFeedbackModal: React.FC<TechnicianFeedbackModalProps> = ({
  open,
  onOpenChange,
  deviceId,
  snapshotId,
  diagnosis,
  onFeedbackSubmitted,
}) => {
  const { data: session } = useSession();
  const sessionUserId =
    (session?.user as any)?.id ||
    (session?.user as any)?._id ||
    session?.user?.email ||
    (session?.user as any)?.userName ||
    "";

  const [accurate, setAccurate] = useState<string>("yes");
  const [confirmedCause, setConfirmedCause] = useState<string>("");
  const [actionsTaken, setActionsTaken] = useState<string>("");
  const [technicianNotes, setTechnicianNotes] = useState<string>("");
  const [technicianUserId, setTechnicianUserId] = useState<string>("");
  const [submitting, setSubmitting] = useState<boolean>(false);

  useEffect(() => {
    if (sessionUserId) {
      setTechnicianUserId(sessionUserId);
    }
  }, [sessionUserId]);

  useEffect(() => {
    if (diagnosis) {
      setConfirmedCause(diagnosis.cause_code);
    }
  }, [diagnosis]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!confirmedCause) {
      toast({
        title: "Validation Error",
        description: "Please select or confirm the root cause code.",
        variant: "destructive",
      });
      return;
    }

    const finalTechId = technicianUserId.trim() || sessionUserId;
    if (!finalTechId) {
      toast({
        title: "Validation Error",
        description: "Please provide your technician ID or email.",
        variant: "destructive",
      });
      return;
    }

    try {
      setSubmitting(true);
      const payload: DiagnosticFeedbackCreate = {
        snapshot_id: snapshotId,
        device_id: deviceId,
        technician_user_id: finalTechId,
        confirmed_cause_code: confirmedCause,
        was_prediction_accurate: accurate === "yes",
        actions_taken: actionsTaken,
        technician_notes: technicianNotes,
      };

      const res = await diagnosticsService.submitFeedback(payload);
      if (res.success) {
        toast({
          title: "Diagnostic Ground Truth Recorded",
          description: "Thank you! Field feedback has been logged to retrain the evidential weighting engine.",
        });
        onOpenChange(false);
        if (onFeedbackSubmitted) onFeedbackSubmitted();
      } else {
        throw new Error(res.error || "Failed to submit feedback");
      }
    } catch (err: any) {
      toast({
        title: "Submission Error",
        description: err.message || "Failed to submit technician feedback.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <MessageSquarePlus className="w-5 h-5 text-blue-600" />
            Field Technician Diagnostic Feedback
          </DialogTitle>
          <DialogDescription className="text-xs text-gray-500">
            Record ground truth from physical inspection of device <strong className="font-mono text-gray-800">{deviceId}</strong>.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {/* Technician Identity */}
          {sessionUserId ? (
            <div className="flex items-center justify-between text-xs px-3 py-2 rounded-lg bg-slate-50 border border-slate-200">
              <span className="text-gray-500 flex items-center gap-1.5 font-medium">
                <User className="w-3.5 h-3.5 text-blue-600" />
                Technician:
              </span>
              <span className="font-mono text-gray-800 font-semibold">{technicianUserId || sessionUserId}</span>
            </div>
          ) : (
            <div className="space-y-1.5">
              <Label htmlFor="technician-id" className="text-xs font-semibold text-gray-700">
                Technician ID / Email <span className="text-rose-500">*</span>
              </Label>
              <Input
                id="technician-id"
                placeholder="e.g. technician@airqo.net or tech_field_12"
                value={technicianUserId}
                onChange={(e) => setTechnicianUserId(e.target.value)}
                required
                className="h-9 text-xs"
              />
            </div>
          )}

          {/* Active Diagnostic Hypothesis */}
          {diagnosis && (
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
              <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                Predicted Root Cause
              </div>
              <div className="text-sm font-bold text-gray-900">{diagnosis.title}</div>
              <div className="text-xs text-gray-500 font-mono">
                Code: {diagnosis.cause_code} • Confidence: {diagnosis.confidence_percentage.toFixed(1)}%
              </div>
            </div>
          )}

          {/* Was the diagnosis accurate? */}
          <div className="space-y-2">
            <Label className="text-xs font-semibold text-gray-700">
              Was the automated diagnosis verified as accurate on site?
            </Label>
            <RadioGroup
              value={accurate}
              onValueChange={setAccurate}
              className="grid grid-cols-2 gap-3"
            >
              <div
                className={`flex items-center space-x-2 p-3 rounded-lg border cursor-pointer transition-colors ${
                  accurate === "yes" ? "border-emerald-500 bg-emerald-50/60 ring-1 ring-emerald-500" : "border-gray-200"
                }`}
                onClick={() => setAccurate("yes")}
              >
                <RadioGroupItem value="yes" id="rad-yes" />
                <Label htmlFor="rad-yes" className="text-xs font-semibold text-emerald-900 cursor-pointer flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  Confirmed Accurate
                </Label>
              </div>

              <div
                className={`flex items-center space-x-2 p-3 rounded-lg border cursor-pointer transition-colors ${
                  accurate === "no" ? "border-rose-500 bg-rose-50/60 ring-1 ring-rose-500" : "border-gray-200"
                }`}
                onClick={() => setAccurate("no")}
              >
                <RadioGroupItem value="no" id="rad-no" />
                <Label htmlFor="rad-no" className="text-xs font-semibold text-rose-900 cursor-pointer flex items-center gap-1.5">
                  <XCircle className="w-3.5 h-3.5 text-rose-600" />
                  Refuted / False Alarm
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Confirmed Root Cause */}
          <div className="space-y-1.5">
            <Label htmlFor="confirmed-cause" className="text-xs font-semibold text-gray-700">
              Confirmed Physical Cause Code
            </Label>
            <Select value={confirmedCause} onValueChange={setConfirmedCause}>
              <SelectTrigger id="confirmed-cause" className="h-9 text-xs">
                <SelectValue placeholder="Select confirmed root cause..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="CAUSE_BATTERY_CAPACITY_LOSS">
                  CAUSE_BATTERY_CAPACITY_LOSS (Battery Degradation)
                </SelectItem>
                <SelectItem value="CAUSE_SOLAR_PANEL_SOILING">
                  CAUSE_SOLAR_PANEL_SOILING (Panel Dust / Foliage)
                </SelectItem>
                <SelectItem value="CAUSE_OPTICAL_CHAMBER_CONTAMINATION">
                  CAUSE_OPTICAL_CHAMBER_CONTAMINATION (Sensor Dust/Fouling)
                </SelectItem>
                <SelectItem value="CAUSE_COMPRESSOR_RELAY_FAULT">
                  CAUSE_COMPRESSOR_RELAY_FAULT (Compressor Thermal Trip)
                </SelectItem>
                <SelectItem value="CAUSE_PUMP_IMPELLER_CAVITATION">
                  CAUSE_PUMP_IMPELLER_CAVITATION (Water Pump Cavitation)
                </SelectItem>
                <SelectItem value="CAUSE_CELLULAR_ANTENNA_DETACHED">
                  CAUSE_CELLULAR_ANTENNA_DETACHED (Loose RF Cable)
                </SelectItem>
                <SelectItem value="CAUSE_OTHER_UNLISTED">
                  CAUSE_OTHER_UNLISTED (Other Field Finding)
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Actions Taken */}
          <div className="space-y-1.5">
            <Label htmlFor="actions-taken" className="text-xs font-semibold text-gray-700">
              Physical Actions Taken by Technician
            </Label>
            <Input
              id="actions-taken"
              placeholder="e.g. Swapped battery pack with new 12.8V LiFePO4 unit..."
              value={actionsTaken}
              onChange={(e) => setActionsTaken(e.target.value)}
              className="h-9 text-xs"
            />
          </div>

          {/* Field Notes */}
          <div className="space-y-1.5">
            <Label htmlFor="notes" className="text-xs font-semibold text-gray-700">
              Field Observations & Notes
            </Label>
            <Textarea
              id="notes"
              rows={3}
              placeholder="Record any anomalous observations, physical damage, weather anomalies, or recommendations..."
              value={technicianNotes}
              onChange={(e) => setTechnicianNotes(e.target.value)}
              className="text-xs"
            />
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={submitting}
              className="text-xs h-8"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={submitting}
              className="bg-primary hover:bg-primary/90 text-primary-foreground text-xs h-8 gap-1.5 shadow-xs"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Recording Ground Truth...
                </>
              ) : (
                <>
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Submit Field Feedback
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

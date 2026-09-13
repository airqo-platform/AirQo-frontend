"use client";

import React, { useEffect, useState } from "react";
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
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "@/components/ui/use-toast";
import { Loader2, PlayCircle } from "lucide-react";
import { diagnosticsService } from "@/services/diagnosticsService";

// Raw readings are only retained for this many days, so older days cannot be (re)diagnosed.
const RAW_RETENTION_DAYS = 14;

interface DailyRunDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Pre-fills the device filter, e.g. when opened from a device page. */
  deviceIds?: string[];
  onStarted?: () => void;
}

export const DailyRunDialog: React.FC<DailyRunDialogProps> = ({ open, onOpenChange, deviceIds = [], onStarted }) => {
  const [mode, setMode] = useState<"lookback" | "range">("lookback");
  const [lookbackDays, setLookbackDays] = useState<number>(3);
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [devicesText, setDevicesText] = useState<string>("");
  const [force, setForce] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);

  const deviceIdsKey = deviceIds.join(", ");
  useEffect(() => {
    if (open) {
      setDevicesText(deviceIdsKey);
    }
  }, [open, deviceIdsKey]);

  const handleSubmit = async () => {
    if (mode === "range" && startDate && endDate && startDate > endDate) {
      toast({ title: "Invalid Range", description: "Start date must be on or before end date.", variant: "destructive" });
      return;
    }

    const ids = devicesText
      .split(/[\s,]+/)
      .map((s) => s.trim())
      .filter(Boolean);

    try {
      setSubmitting(true);
      const result = await diagnosticsService.triggerDailyRun({
        ...(mode === "lookback"
          ? { lookback_days: lookbackDays }
          : { start_date: startDate || undefined, end_date: endDate || undefined }),
        device_ids: ids,
        force,
      });
      toast({
        title: "Daily Diagnostics Started",
        description: `${result.message}. Results appear once the background run finishes.`,
      });
      onOpenChange(false);
      onStarted?.();
    } catch (err: any) {
      toast({
        title: "Could Not Start Run",
        description: err?.message || "Failed to start daily diagnostics.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-base font-bold flex items-center gap-2">
            <PlayCircle className="w-4 h-4 text-primary" />
            Run Daily Diagnostics
          </DialogTitle>
          <DialogDescription className="text-xs">
            Diagnoses completed UTC days in the background. Only the last {RAW_RETENTION_DAYS} days still have raw
            readings; days already diagnosed are skipped unless you re-evaluate them.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-2">
            {(["lookback", "range"] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMode(m)}
                className={`p-2 rounded-lg border font-medium ${
                  mode === m ? "bg-primary text-primary-foreground border-primary" : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
                }`}
              >
                {m === "lookback" ? "Recent days" : "Date range"}
              </button>
            ))}
          </div>

          {mode === "lookback" ? (
            <div className="space-y-1">
              <Label className="text-xs font-semibold">Days to look back (1–{RAW_RETENTION_DAYS})</Label>
              <Input
                type="number"
                min={1}
                max={RAW_RETENTION_DAYS}
                value={lookbackDays}
                onChange={(e) => setLookbackDays(Math.min(RAW_RETENTION_DAYS, Math.max(1, Number(e.target.value) || 1)))}
                className="h-8 text-xs"
              />
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs font-semibold">Start date</Label>
                <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="h-8 text-xs" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-semibold">End date</Label>
                <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="h-8 text-xs" />
              </div>
              <p className="col-span-2 text-[11px] text-gray-500">The end date is capped at yesterday (UTC).</p>
            </div>
          )}

          <div className="space-y-1">
            <Label className="text-xs font-semibold">Device IDs (optional)</Label>
            <Input
              placeholder="All devices, or e.g. aq_g5_87, aq_g5_88"
              value={devicesText}
              onChange={(e) => setDevicesText(e.target.value)}
              className="h-8 text-xs font-mono"
            />
          </div>

          <label className="flex items-start gap-2 cursor-pointer">
            <Checkbox checked={force} onCheckedChange={(v) => setForce(v === true)} className="mt-0.5" />
            <span>
              <span className="font-semibold text-gray-900">Re-evaluate already diagnosed days</span>
              <span className="block text-gray-500">Replaces existing results, e.g. after a profile change.</span>
            </span>
          </label>
        </div>

        <DialogFooter>
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)} disabled={submitting} className="text-xs">
            Cancel
          </Button>
          <Button size="sm" onClick={handleSubmit} disabled={submitting} className="text-xs gap-1.5">
            {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <PlayCircle className="w-3.5 h-3.5" />}
            Start Run
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

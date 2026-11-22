"use client";

import React, { useEffect, useMemo, useState } from "react";
import { diagnosticsService, DiagnosticsApiError } from "@/services/diagnosticsService";
import type { StatusCodeKind, StatusCodeSet, StatusDecodeRule } from "@/types/diagnostics";
import { validateStatusCodes } from "@/lib/status-codes";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";
import { AlertTriangle, ListOrdered, Plus, Trash2 } from "lucide-react";
import { STATUS_KIND_LABELS } from "@/components/diagnostics/StatusCodeChips";

interface CodeRow {
  /** Kept as text while editing so a half-typed number isn't coerced */
  code: string;
  label: string;
  kind: StatusCodeKind;
  description: string;
}

interface StatusCodeSetDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** The set to edit; omitted to create one. */
  codeSet?: StatusCodeSet | null;
  /** Profiles linking to the set; renaming it breaks those links. */
  linkedProfileNames?: string[];
  onSaved: (saved: StatusCodeSet) => void;
}

const KINDS: StatusCodeKind[] = ["fault", "info", "ok"];

const toRows = (codeSet?: StatusCodeSet | null): CodeRow[] =>
  (codeSet?.codes || [])
    .slice()
    .sort((a, b) => a.code - b.code)
    .map((code) => ({ code: String(code.code), label: code.label, kind: code.kind, description: code.description || "" }));

// The next free single bit for the bitmask rule, or the next whole number for the exact rule
const nextCode = (rule: StatusDecodeRule, rows: CodeRow[]): number => {
  const used = new Set(rows.map((row) => Number(row.code)));
  if (rule === "bitmask") {
    if (!used.has(0)) return 0;
    let bit = 1;
    while (used.has(bit)) bit *= 2;
    return bit;
  }
  let code = 0;
  while (used.has(code)) code += 1;
  return code;
};

export function StatusCodeSetDialog({ open, onOpenChange, codeSet, linkedProfileNames = [], onSaved }: StatusCodeSetDialogProps) {
  const isEditing = Boolean(codeSet);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [decodeRule, setDecodeRule] = useState<StatusDecodeRule>("bitmask");
  const [rows, setRows] = useState<CodeRow[]>([]);
  const [serverErrors, setServerErrors] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [showErrors, setShowErrors] = useState(false);

  useEffect(() => {
    if (!open) return;
    setName(codeSet?.name || "");
    setDescription(codeSet?.description || "");
    setDecodeRule(codeSet?.decode_rule || "bitmask");
    setRows(codeSet ? toRows(codeSet) : [{ code: "0", label: "Functional", kind: "ok", description: "" }]);
    setServerErrors([]);
    setShowErrors(false);
  }, [open, codeSet]);

  const codes = useMemo(
    () =>
      rows.map((row) => ({
        code: row.code.trim() === "" ? Number.NaN : Number(row.code),
        label: row.label,
        kind: row.kind,
        description: row.description.trim() || null,
      })),
    [rows]
  );
  const validationErrors = useMemo(() => {
    const errors = validateStatusCodes(decodeRule, codes);
    if (!name.trim()) errors.unshift("The set needs a name.");
    return errors;
  }, [decodeRule, codes, name]);

  const renamed = isEditing && codeSet && name.trim() !== codeSet.name && linkedProfileNames.length > 0;

  const updateRow = (index: number, patch: Partial<CodeRow>) =>
    setRows((current) => current.map((row, i) => (i === index ? { ...row, ...patch } : row)));

  const addRow = () =>
    setRows((current) => {
      const code = nextCode(decodeRule, current);
      return [...current, { code: String(code), label: "", kind: code === 0 && decodeRule === "bitmask" ? "ok" : "fault", description: "" }];
    });

  const handleSave = async () => {
    setShowErrors(true);
    setServerErrors([]);
    if (validationErrors.length > 0) return;

    const input = { name: name.trim(), description: description.trim() || null, decode_rule: decodeRule, codes };
    try {
      setIsSaving(true);
      const saved = codeSet
        ? await diagnosticsService.updateStatusCodeSet(codeSet.id, input)
        : await diagnosticsService.createStatusCodeSet(input);
      toast({ title: isEditing ? "Status Code Set Updated" : "Status Code Set Created", description: `${saved.name} saved.` });
      onOpenChange(false);
      onSaved(saved);
    } catch (err: any) {
      if (err instanceof DiagnosticsApiError && err.errors.length > 0) {
        setServerErrors(err.errors);
      } else {
        toast({ title: "Save Failed", description: err?.message || "Could not save the status code set.", variant: "destructive" });
      }
    } finally {
      setIsSaving(false);
    }
  };

  const errorsToShow = [...(showErrors ? validationErrors : []), ...serverErrors];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <ListOrdered className="w-5 h-5 text-primary" />
            {isEditing ? `Edit ${codeSet?.name}` : "New Status Code Set"}
          </DialogTitle>
          <DialogDescription className="text-xs text-gray-500">
            One device type&apos;s status codes, what each means, and how to read a reported value.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-gray-700">Name *</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. bam-1020" className="h-8 text-xs font-mono" />
              {renamed && (
                <p className="text-[11px] text-amber-700 flex items-start gap-1">
                  <AlertTriangle className="w-3 h-3 mt-0.5 shrink-0" />
                  Profiles link to sets by name. Renaming unlinks {linkedProfileNames.join(", ")} until their status fields are re-linked.
                </p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-gray-700">Decode Rule *</Label>
              <Select value={decodeRule} onValueChange={(value) => setDecodeRule(value as StatusDecodeRule)}>
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bitmask">Bitmask: a value is the sum of its codes</SelectItem>
                  <SelectItem value="exact">Exact: a value is one code</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-[11px] text-gray-500">
                {decodeRule === "bitmask"
                  ? "Each code is its own bit (1, 2, 4, 8, ...), so 17 reads as 16 + 1. Only code 0 can be OK."
                  : "The value is a single state number; values without a code are unknown."}
              </p>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-gray-700">Description</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Met One BAM-1020 status codes"
              className="text-xs min-h-[48px]"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-semibold text-gray-700">Codes ({rows.length})</Label>
              <Button type="button" variant="outline" size="sm" onClick={addRow} className="h-7 text-xs gap-1">
                <Plus className="w-3 h-3" /> Add Code
              </Button>
            </div>
            <div className="rounded-lg border border-gray-200 overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-gray-200 text-[11px] text-gray-500 uppercase font-semibold">
                  <tr>
                    <th className="py-2 px-2 w-24">Code</th>
                    <th className="py-2 px-2">Label</th>
                    <th className="py-2 px-2 w-28">Kind</th>
                    <th className="py-2 px-2">Description</th>
                    <th className="py-2 px-2 w-10" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {rows.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-4 text-center text-gray-400">
                        No codes yet.
                      </td>
                    </tr>
                  ) : (
                    rows.map((row, index) => (
                      <tr key={index} className="align-top">
                        <td className="py-1.5 px-2">
                          <Input
                            type="number"
                            min={0}
                            step={1}
                            value={row.code}
                            onChange={(e) => updateRow(index, { code: e.target.value })}
                            className="h-7 text-xs font-mono"
                          />
                        </td>
                        <td className="py-1.5 px-2">
                          <Input
                            value={row.label}
                            onChange={(e) => updateRow(index, { label: e.target.value })}
                            placeholder="e.g. Flow Failure"
                            className="h-7 text-xs"
                          />
                        </td>
                        <td className="py-1.5 px-2">
                          <Select value={row.kind} onValueChange={(value) => updateRow(index, { kind: value as StatusCodeKind })}>
                            <SelectTrigger className="h-7 text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {KINDS.map((kind) => (
                                <SelectItem key={kind} value={kind}>
                                  {STATUS_KIND_LABELS[kind]}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </td>
                        <td className="py-1.5 px-2">
                          <Input
                            value={row.description}
                            onChange={(e) => updateRow(index, { description: e.target.value })}
                            placeholder="What it means or what triggers it"
                            className="h-7 text-xs"
                          />
                        </td>
                        <td className="py-1.5 px-2 text-right">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => setRows((current) => current.filter((_, i) => i !== index))}
                            className="h-7 w-7 p-0 text-rose-500 hover:text-rose-700"
                            title="Remove code"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {errorsToShow.length > 0 && (
            <div className="rounded-md border border-rose-200 bg-rose-50 p-3 text-rose-700 space-y-1">
              {errorsToShow.map((error) => (
                <p key={error} className="flex items-start gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                  {error}
                </p>
              ))}
            </div>
          )}
        </div>

        <DialogFooter className="pt-3 border-t">
          <Button type="button" variant="outline" size="sm" onClick={() => onOpenChange(false)} className="text-xs">
            Cancel
          </Button>
          <Button type="button" size="sm" onClick={handleSave} disabled={isSaving} className="text-xs font-semibold">
            {isSaving ? "Saving..." : isEditing ? "Save Changes" : "Create Set"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

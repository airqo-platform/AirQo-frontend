"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { diagnosticsService } from "@/services/diagnosticsService";
import { DiagnosticTemplate, DiagnosticRule, DiagnosticSymptom } from "@/types/diagnostics";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";
import {
  Sliders,
  Plus,
  Trash2,
  Edit2,
  TrendingUp,
  TrendingDown,
  Tag,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  ChevronLeft,
  Layers,
  Wrench,
} from "lucide-react";

export default function DiagnosticTemplatesPage() {
  const [templates, setTemplates] = useState<DiagnosticTemplate[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedTemplate, setSelectedTemplate] = useState<DiagnosticTemplate | null>(null);
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);

  // Form states
  const [formName, setFormName] = useState<string>("");
  const [formCategory, setFormCategory] = useState<string>("power");
  const [formVersion, setFormVersion] = useState<string>("1.0.0");
  const [formDescription, setFormDescription] = useState<string>("");
  const [causesList, setCausesList] = useState<DiagnosticTemplate["causes"]>([]);
  const [symptomsList, setSymptomsList] = useState<DiagnosticSymptom[]>([]);

  // Cause builder sub-form
  const [causeCode, setCauseCode] = useState<string>("");
  const [causeTitle, setCauseTitle] = useState<string>("");
  const [causeCategory, setCauseCategory] = useState<string>("HARDWARE_FAILURE");
  const [causeSeverity, setCauseSeverity] = useState<"LOW" | "MEDIUM" | "HIGH" | "CRITICAL">("HIGH");
  const [causeAction, setCauseAction] = useState<string>("");

  // Rule builder sub-form
  const [ruleEvidCode, setRuleEvidCode] = useState<string>("");
  const [ruleDesc, setRuleDesc] = useState<string>("");
  const [ruleWeight, setRuleWeight] = useState<string>("3.5");
  const [ruleMandatory, setRuleMandatory] = useState<boolean>(false);

  const loadTemplates = async () => {
    try {
      setLoading(true);
      const data = await diagnosticsService.getTemplates();
      setTemplates(data);
      if (data.length > 0 && !selectedTemplate) {
        setSelectedTemplate(data[0]);
      }
    } catch (err) {
      console.error("Error loading diagnostic templates:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTemplates();
  }, []);

  const handleOpenCreate = () => {
    setIsEditing(false);
    setFormName("");
    setFormCategory("power");
    setFormVersion("1.0.0");
    setFormDescription("");
    setSymptomsList([
      {
        id: `sym_${Date.now()}`,
        code: "SYM_GENERIC_ANOMALY",
        name: "Telemetry Out-of-Bounds",
        description: "Sensor metric values exceeded nominal bounds",
        category: "power",
        threshold_condition: "abs(val - baseline) > 2.0",
        evaluation_window: "24h",
      },
    ]);
    setCausesList([
      {
        cause_code: "CAUSE_GENERIC_FAULT",
        title: "Subsystem Degradation Fault",
        category: "HARDWARE_FAILURE",
        default_severity: "HIGH",
        recommended_action: "Perform physical diagnostics on target subsystem.",
        rules: [
          { id: "r1", evidence_code: "EVID_OUT_OF_SPEC_READING", description: "Telemetry outside expected limits", weight: 3.5, is_mandatory: true },
        ],
      },
    ]);
    setModalOpen(true);
  };

  const handleOpenEdit = (tpl: DiagnosticTemplate) => {
    setIsEditing(true);
    setSelectedTemplate(tpl);
    setFormName(tpl.name);
    setFormCategory(tpl.category);
    setFormVersion(tpl.version);
    setFormDescription(tpl.description || "");
    setSymptomsList(JSON.parse(JSON.stringify(tpl.symptoms || [])));
    setCausesList(JSON.parse(JSON.stringify(tpl.causes || [])));
    setModalOpen(true);
  };

  const handleAddCause = () => {
    if (!causeCode.trim() || !causeTitle.trim()) {
      toast({ title: "Validation Error", description: "Cause code and title required", variant: "destructive" });
      return;
    }

    const newCause: DiagnosticTemplate["causes"][0] = {
      cause_code: causeCode.trim().toUpperCase(),
      title: causeTitle.trim(),
      category: causeCategory,
      default_severity: causeSeverity,
      recommended_action: causeAction.trim() || "Inspect hardware.",
      rules: [],
    };

    setCausesList([...causesList, newCause]);
    setCauseCode("");
    setCauseTitle("");
    setCauseAction("");
  };

  const handleRemoveCause = (idx: number) => {
    const updated = [...causesList];
    updated.splice(idx, 1);
    setCausesList(updated);
  };

  const handleAddRuleToCause = (causeIdx: number) => {
    if (!ruleEvidCode.trim()) {
      toast({ title: "Evidence Code Required", description: "e.g. EVID_BATTERY_COLLAPSE", variant: "destructive" });
      return;
    }

    const newRule: DiagnosticRule = {
      id: `r_${Date.now()}`,
      evidence_code: ruleEvidCode.trim().toUpperCase(),
      description: ruleDesc.trim() || ruleEvidCode.trim(),
      weight: parseFloat(ruleWeight) || 3.0,
      is_mandatory: ruleMandatory,
    };

    const updated = [...causesList];
    updated[causeIdx].rules.push(newRule);
    setCausesList(updated);
    setRuleEvidCode("");
    setRuleDesc("");
    setRuleWeight("3.5");
    setRuleMandatory(false);
  };

  const handleRemoveRule = (causeIdx: number, ruleIdx: number) => {
    const updated = [...causesList];
    updated[causeIdx].rules.splice(ruleIdx, 1);
    setCausesList(updated);
  };

  const handleSaveTemplate = async () => {
    if (!formName.trim()) {
      toast({ title: "Name Required", description: "Template Pack Name is required", variant: "destructive" });
      return;
    }

    try {
      const payload: Partial<DiagnosticTemplate> = {
        ...(isEditing && selectedTemplate?.id ? { id: selectedTemplate.id } : {}),
        name: formName,
        category: formCategory,
        version: formVersion,
        description: formDescription,
        target_profile_categories: [formCategory],
        symptoms: symptomsList,
        causes: causesList,
      };

      const saved = await diagnosticsService.createTemplate(payload);
      setSelectedTemplate(saved);
      toast({
        title: isEditing ? "Template Updated" : "Template Saved",
        description: `Diagnostic pack ${saved.name} ${isEditing ? "updated" : "saved"}.`,
      });
      setModalOpen(false);
      loadTemplates();
    } catch (err: any) {
      toast({ title: "Save Error", description: err.message, variant: "destructive" });
    }
  };

  const handleSeedDefaults = async () => {
    try {
      const res = await diagnosticsService.seedDefaults();
      toast({ title: "Defaults Restored", description: res.message });
      loadTemplates();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto pb-16">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link href="/dashboard/settings" className="text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1">
              <ChevronLeft className="w-3.5 h-3.5" /> Settings
            </Link>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2.5">
            <Sliders className="w-7 h-7 text-primary" />
            Diagnostic Template & Rules Editor
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Configure reusable diagnostic packs, evidential weighting rules (+/-), symptom thresholds, and technician prescriptions
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={handleSeedDefaults}
            className="h-9 text-xs bg-white gap-1.5 text-gray-700"
          >
            <RotateCcw className="w-3.5 h-3.5 text-primary" />
            Seed Default Rules
          </Button>
          <Button
            onClick={handleOpenCreate}
            size="sm"
            className="h-9 text-xs bg-primary hover:bg-primary/90 text-primary-foreground gap-1.5 shadow-xs"
          >
            <Plus className="w-4 h-4" />
            New Diagnostic Pack
          </Button>
        </div>
      </div>

      {/* 2-Column Template Editor */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Template Packs List */}
        <div className="lg:col-span-4 space-y-3">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              Diagnostic Packs ({templates.length})
            </span>
          </div>

          <div className="space-y-2.5">
            {templates.map((tpl) => {
              const isSelected = selectedTemplate?.id === tpl.id;
              return (
                <div
                  key={tpl.id}
                  onClick={() => setSelectedTemplate(tpl)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer select-none ${
                    isSelected
                      ? "border-primary bg-primary/10 shadow-xs ring-1 ring-primary"
                      : "border-gray-200 bg-white hover:border-gray-300"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="text-sm font-bold text-gray-900 leading-tight">
                        {tpl.name}
                      </h4>
                      <p className="text-xs text-gray-500 font-mono mt-0.5">v{tpl.version}</p>
                    </div>
                    <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200 shrink-0">
                      {tpl.category}
                    </span>
                  </div>

                  <p className="text-xs text-gray-600 mt-2 line-clamp-2 leading-relaxed">
                    {tpl.description || "No description provided."}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Template Pack Breakdown */}
        <div className="lg:col-span-8">
          {selectedTemplate ? (
            <Card className="border border-gray-200 shadow-xs">
              <CardHeader className="pb-3 border-b border-gray-100 bg-slate-50/50">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-base font-bold text-gray-900">
                        {selectedTemplate.name}
                      </CardTitle>
                      <Badge variant="outline" className="text-[10px] font-mono">
                        v{selectedTemplate.version}
                      </Badge>
                    </div>
                    <CardDescription className="text-xs font-mono mt-0.5">
                      Pack ID: {selectedTemplate.id} · Applies to:{" "}
                      <strong className="text-gray-700">
                        {selectedTemplate.target_profile_categories?.join(", ") || selectedTemplate.category}
                      </strong>
                    </CardDescription>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleOpenEdit(selectedTemplate)}
                    className="h-8 text-xs bg-white text-primary border-primary/20 hover:bg-primary/10 gap-1.5"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    Edit Pack
                  </Button>
                </div>
              </CardHeader>

              <CardContent className="pt-4 space-y-6">
                {/* Description */}
                <p className="text-xs text-gray-600 bg-slate-50 p-3 rounded-lg border border-slate-200/80 leading-relaxed">
                  {selectedTemplate.description}
                </p>

                {/* Symptoms Rules */}
                <div className="space-y-3">
                  <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5 text-amber-500" />
                    Defined Symptoms & Triggers ({selectedTemplate.symptoms?.length || 0})
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {selectedTemplate.symptoms?.map((sym, idx) => (
                      <div
                        key={sym.id || idx}
                        className="p-3 rounded-xl border border-amber-200/80 bg-amber-50/40 space-y-1.5"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-xs font-bold text-amber-900">{sym.code}</span>
                          <span className="text-[10px] text-amber-700 px-1.5 py-0.2 rounded bg-amber-100/80">
                            {sym.evaluation_window}
                          </span>
                        </div>
                        <div className="font-medium text-xs text-gray-900">{sym.name}</div>
                        <p className="text-[11px] text-gray-600 leading-snug">{sym.description}</p>
                        <div className="text-[10px] font-mono text-amber-800 bg-white/70 p-1.5 rounded border border-amber-200">
                          Condition: {sym.threshold_condition}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Causes & Evidential Weighting Rules */}
                <div className="space-y-4 pt-2">
                  <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
                    Diagnostic Hypotheses & Evidential Weights ({selectedTemplate.causes?.length || 0})
                  </h3>

                  <div className="space-y-3">
                    {selectedTemplate.causes?.map((cause, cIdx) => (
                      <div
                        key={cause.cause_code || cIdx}
                        className="p-4 rounded-xl border border-gray-200 bg-white shadow-2xs space-y-3"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="text-sm font-bold text-gray-900">{cause.title}</h4>
                              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border uppercase">
                                {cause.category}
                              </span>
                            </div>
                            <span className="font-mono text-xs text-gray-400">{cause.cause_code}</span>
                          </div>
                          <Badge
                            className={`text-[10px] font-bold ${
                              cause.default_severity === "CRITICAL"
                                ? "bg-red-600"
                                : cause.default_severity === "HIGH"
                                ? "bg-rose-600"
                                : "bg-amber-500"
                            }`}
                          >
                            {cause.default_severity}
                          </Badge>
                        </div>

                        {/* Prescriptive action */}
                        <div className="p-2.5 rounded-lg bg-primary/10 border border-primary/20 text-xs text-foreground flex items-start gap-2">
                          <Wrench className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                          <span>
                            <strong>Prescription:</strong> {cause.recommended_action}
                          </span>
                        </div>

                        {/* Rules table */}
                        <div className="space-y-1.5">
                          <div className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                            Evidential Weights (+/-):
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {cause.rules.map((rule, rIdx) => {
                              const isPos = rule.weight > 0;
                              return (
                                <div
                                  key={rule.id || rIdx}
                                  className={`p-2 rounded-lg border text-xs flex items-center justify-between gap-2 ${
                                    isPos ? "bg-emerald-50/50 border-emerald-200" : "bg-rose-50/50 border-rose-200"
                                  }`}
                                >
                                  <div>
                                    <div className="font-mono font-bold text-[11px] text-gray-900">
                                      {rule.evidence_code}
                                    </div>
                                    <p className="text-[10px] text-gray-600 line-clamp-1">{rule.description}</p>
                                  </div>
                                  <span
                                    className={`font-mono font-bold text-xs px-1.5 py-0.5 rounded ${
                                      isPos
                                        ? "bg-emerald-100 text-emerald-800"
                                        : "bg-rose-100 text-rose-800"
                                    }`}
                                  >
                                    {isPos ? `+${rule.weight.toFixed(1)}` : rule.weight.toFixed(1)}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="text-center py-20 text-gray-400 border border-dashed rounded-xl">
              Select or create a diagnostic pack to inspect and edit rules.
            </div>
          )}
        </div>
      </div>

      {/* Modal: Create / Edit Diagnostic Pack */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Sliders className="w-5 h-5 text-primary" />
              {isEditing ? "Edit Diagnostic Template Pack" : "Create New Diagnostic Template Pack"}
            </DialogTitle>
            <DialogDescription className="text-xs text-gray-500">
              Define symptoms, failure mode hypotheses, and probabilistic evidential weights (+/-).
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 pt-2 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1 sm:col-span-2">
                <Label className="text-xs font-semibold text-gray-700">Pack Name</Label>
                <Input
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. LiFePO4 Battery Pack Diagnostics"
                  className="h-8 text-xs"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-semibold text-gray-700">Category</Label>
                <Select value={formCategory} onValueChange={setFormCategory}>
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="power">Power</SelectItem>
                    <SelectItem value="sensor">Sensor</SelectItem>
                    <SelectItem value="cooling">Cooling</SelectItem>
                    <SelectItem value="motor">Motor</SelectItem>
                    <SelectItem value="connectivity">Connectivity</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-semibold text-gray-700">Description</Label>
              <Textarea
                rows={2}
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                placeholder="Description of failure modes covered..."
                className="text-xs"
              />
            </div>

            {/* Causes & Rules Builder */}
            <div className="p-3.5 rounded-xl border border-gray-200 bg-slate-50/70 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-800 uppercase tracking-wider">
                  Causes & Rules ({causesList.length})
                </span>
              </div>

              {/* Add Cause Form */}
              <div className="bg-white p-3 rounded-lg border border-gray-200 space-y-2">
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
                  <div className="sm:col-span-4">
                    <Input
                      placeholder="CAUSE_CODE"
                      value={causeCode}
                      onChange={(e) => setCauseCode(e.target.value)}
                      className="h-7 text-xs font-mono"
                    />
                  </div>
                  <div className="sm:col-span-5">
                    <Input
                      placeholder="Cause Title"
                      value={causeTitle}
                      onChange={(e) => setCauseTitle(e.target.value)}
                      className="h-7 text-xs"
                    />
                  </div>
                  <div className="sm:col-span-3">
                    <Button
                      type="button"
                      onClick={handleAddCause}
                      size="sm"
                      className="h-7 w-full text-xs bg-primary hover:bg-primary/90 text-primary-foreground"
                    >
                      Add Cause
                    </Button>
                  </div>
                </div>
                <Input
                  placeholder="Prescriptive action for technician..."
                  value={causeAction}
                  onChange={(e) => setCauseAction(e.target.value)}
                  className="h-7 text-xs"
                />
              </div>

              {/* List of Causes with inline Rule additions */}
              <div className="space-y-3">
                {causesList.map((cause, cIdx) => (
                  <div key={cIdx} className="p-3 rounded-lg bg-white border border-gray-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-bold text-gray-900 text-xs">{cause.title}</span>
                        <span className="text-[10px] text-gray-400 font-mono ml-2">{cause.cause_code}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveCause(cIdx)}
                        className="text-rose-600 hover:text-rose-800"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Rules inside cause */}
                    <div className="pl-2 border-l-2 border-primary/30 space-y-2">
                      <div className="flex flex-wrap gap-1.5">
                        {cause.rules.map((rule, rIdx) => (
                          <span
                            key={rIdx}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-100 text-[10px] font-mono text-gray-700 border"
                          >
                            {rule.evidence_code} ({rule.weight > 0 ? `+${rule.weight}` : rule.weight})
                            <button
                              type="button"
                              onClick={() => handleRemoveRule(cIdx, rIdx)}
                              className="text-rose-500 ml-1"
                            >
                              ×
                            </button>
                          </span>
                        ))}
                      </div>

                      {/* Add rule inline */}
                      <div className="flex items-center gap-1.5 pt-1">
                        <Input
                          placeholder="EVID_CODE"
                          value={ruleEvidCode}
                          onChange={(e) => setRuleEvidCode(e.target.value)}
                          className="h-6 text-[11px] font-mono w-36"
                        />
                        <Input
                          placeholder="Weight (+3.5 / -4.0)"
                          value={ruleWeight}
                          onChange={(e) => setRuleWeight(e.target.value)}
                          className="h-6 text-[11px] font-mono w-24"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handleAddRuleToCause(cIdx)}
                          className="h-6 text-[10px] px-2 bg-slate-100"
                        >
                          + Add Rule
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter className="pt-3">
            <Button variant="outline" onClick={() => setModalOpen(false)} className="text-xs h-8">
              Cancel
            </Button>
            <Button onClick={handleSaveTemplate} className="bg-primary hover:bg-primary/90 text-primary-foreground text-xs h-8">
              Save Diagnostic Pack
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { diagnosticsService } from "@/services/diagnosticsService";
import {
  DiagnosticTemplate,
  TemplateSymptom,
  TemplateCause,
  HypothesisRule,
} from "@/types/diagnostics";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
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
  Tag,
  RotateCcw,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  ArrowRight,
  Layers,
  Wrench,
  Copy,
  Check,
  CheckCircle2,
  AlertCircle,
  FileCode,
  ShieldAlert,
  Info,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useGroup } from "@/lib/group-context";

export default function DiagnosticTemplatesPage() {
  const { activeGroup, loading: groupLoading } = useGroup();
  const isAirqoGroup = activeGroup?.toLowerCase() === "airqo";

  const [templates, setTemplates] = useState<DiagnosticTemplate[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedTemplate, setSelectedTemplate] = useState<DiagnosticTemplate | null>(null);
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [modalStep, setModalStep] = useState<number>(1);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [isSeeding, setIsSeeding] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [viewJsonModalOpen, setViewJsonModalOpen] = useState<boolean>(false);
  const [selectedCauseIdx, setSelectedCauseIdx] = useState<number>(0);
  const [showPreviewJson, setShowPreviewJson] = useState<boolean>(false);

  // Form states (Layer 1: Metadata)
  const [formName, setFormName] = useState<string>("");
  const [formTargetType, setFormTargetType] = useState<string>("sensor");
  const [formVersion, setFormVersion] = useState<string>("1.0.0");
  const [formDescription, setFormDescription] = useState<string>("");

  // Form states (Layer 2: Symptoms)
  const [symptomsList, setSymptomsList] = useState<TemplateSymptom[]>([]);
  const [symptomCode, setSymptomCode] = useState<string>("");
  const [symptomName, setSymptomName] = useState<string>("");
  const [symptomSeverity, setSymptomSeverity] = useState<"LOW" | "MEDIUM" | "HIGH" | "CRITICAL">("HIGH");
  const [symptomDesc, setSymptomDesc] = useState<string>("");

  // Form states (Layer 3: Causes & Hypothesis Rules)
  const [causesList, setCausesList] = useState<TemplateCause[]>([]);
  const [causeCode, setCauseCode] = useState<string>("");
  const [causeTitle, setCauseTitle] = useState<string>("");
  const [causeCategory, setCauseCategory] = useState<string>("HARDWARE_FAILURE");
  const [causeAction, setCauseAction] = useState<string>("");

  // Rule builder sub-form
  const [ruleEvidCode, setRuleEvidCode] = useState<string>("");
  const [ruleWeight, setRuleWeight] = useState<string>("4.5");
  const [ruleMandatory, setRuleMandatory] = useState<boolean>(true);
  const [ruleDesc, setRuleDesc] = useState<string>("");

  const loadTemplates = useCallback(async () => {
    if (!isAirqoGroup) return;
    try {
      setLoading(true);
      const data = await diagnosticsService.getTemplates();
      setTemplates(data);
      if (data.length > 0) {
        setSelectedTemplate((prev) => (prev ? data.find((t) => t.id === prev.id) || data[0] : data[0]));
      }
    } catch (err: any) {
      console.error("Error loading diagnostic templates:", err);
      setTemplates([]);
      toast({
        title: "Error Loading Templates",
        description: err?.message || "Failed to load diagnostic templates from server.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [isAirqoGroup]);

  useEffect(() => {
    if (isAirqoGroup) {
      loadTemplates();
    }
  }, [loadTemplates, isAirqoGroup]);

  const handleOpenCreate = () => {
    setIsEditing(false);
    setModalStep(1);
    setSelectedCauseIdx(0);
    setShowPreviewJson(false);
    setFormName("");
    setFormTargetType("sensor");
    setFormVersion("1.0.0");
    setFormDescription("");
    setSymptomsList([
      {
        code: "SYMP_DUAL_PM_DIVERGENCE",
        name: "Dual Optical Sensor Divergence",
        severity: "HIGH",
        description: "Primary and secondary PM channels diverge by more than 35% or have Pearson correlation r < 0.65.",
      },
    ]);
    setCausesList([
      {
        code: "CAUSE_OPTICAL_CHAMBER_CONTAMINATION",
        title: "Optical Chamber Dust Contamination / Sensor Drift",
        category: "HARDWARE_FAILURE",
        recommended_action: "Clean optical chamber with compressed air or replace secondary sensor module.",
        hypothesis_rules: [
          {
            evidence_code: "SYMP_DUAL_PM_DIVERGENCE",
            weight: 4.5,
            is_mandatory: true,
            description: "Primary and secondary channels show significant divergence.",
          },
          {
            evidence_code: "EVID_PM_SENSORS_IN_AGREEMENT",
            weight: -5.0,
            is_mandatory: false,
            description: "Refutes contamination if sensors are tracking closely.",
          },
        ],
      },
    ]);
    setModalOpen(true);
  };

  const handleOpenEdit = (tpl: DiagnosticTemplate) => {
    setIsEditing(true);
    setModalStep(1);
    setSelectedCauseIdx(0);
    setShowPreviewJson(false);
    setSelectedTemplate(tpl);
    setFormName(tpl.name);
    setFormTargetType(tpl.target_component_type || tpl.category || "sensor");
    setFormVersion(tpl.version || "1.0.0");
    setFormDescription(tpl.description || "");
    setSymptomsList(JSON.parse(JSON.stringify(tpl.symptoms || [])));

    // Normalize causes and rules
    const normalizedCauses = (tpl.causes || []).map((c) => ({
      ...c,
      code: c.code || c.cause_code || "CAUSE_UNSPECIFIED",
      hypothesis_rules: c.hypothesis_rules || c.rules || [],
    }));
    setCausesList(JSON.parse(JSON.stringify(normalizedCauses)));
    setModalOpen(true);
  };

  // Step Validation & Navigation
  const handleNextStep = () => {
    if (modalStep === 1) {
      if (!formName.trim()) {
        toast({
          title: "Template Title Required",
          description: "Please provide a name for this diagnostic template before proceeding.",
          variant: "destructive",
        });
        return;
      }
      setModalStep(2);
    } else if (modalStep === 2) {
      setModalStep(3);
    } else if (modalStep === 3) {
      if (causesList.length === 0) {
        toast({
          title: "Root Cause Required",
          description: "Please specify at least one candidate root cause hypothesis before configuring rules.",
          variant: "destructive",
        });
        return;
      }
      setModalStep(4);
    }
  };

  const handlePrevStep = () => {
    if (modalStep > 1) {
      setModalStep((prev) => prev - 1);
    }
  };

  const canNavigateToStep = (stepNumber: number) => {
    if (stepNumber === 1) return true;
    if (stepNumber === 2) return Boolean(formName.trim());
    if (stepNumber === 3) return Boolean(formName.trim());
    if (stepNumber === 4) return Boolean(formName.trim()) && causesList.length > 0;
    return false;
  };

  // Symptom Add / Remove
  const handleAddSymptom = () => {
    if (!symptomCode.trim() || !symptomName.trim()) {
      toast({ title: "Validation Error", description: "Symptom code and display name are required", variant: "destructive" });
      return;
    }

    const newSymptom: TemplateSymptom = {
      code: symptomCode.trim().toUpperCase(),
      name: symptomName.trim(),
      severity: symptomSeverity,
      description: symptomDesc.trim() || symptomName.trim(),
    };

    setSymptomsList([...symptomsList, newSymptom]);
    setSymptomCode("");
    setSymptomName("");
    setSymptomDesc("");
  };

  const handleRemoveSymptom = (idx: number) => {
    const updated = [...symptomsList];
    updated.splice(idx, 1);
    setSymptomsList(updated);
  };

  // Cause Add / Remove
  const handleAddCause = () => {
    if (!causeCode.trim() || !causeTitle.trim()) {
      toast({ title: "Validation Error", description: "Cause code and diagnosis title are required", variant: "destructive" });
      return;
    }

    const newCause: TemplateCause = {
      code: causeCode.trim().toUpperCase(),
      title: causeTitle.trim(),
      category: causeCategory,
      recommended_action: causeAction.trim() || "Inspect hardware and verify field logs.",
      hypothesis_rules: [],
    };

    const nextList = [...causesList, newCause];
    setCausesList(nextList);
    setSelectedCauseIdx(nextList.length - 1);
    setCauseCode("");
    setCauseTitle("");
    setCauseAction("");
  };

  const handleRemoveCause = (idx: number) => {
    const updated = [...causesList];
    updated.splice(idx, 1);
    setCausesList(updated);
    if (selectedCauseIdx >= updated.length) {
      setSelectedCauseIdx(Math.max(0, updated.length - 1));
    }
  };

  // Hypothesis Rule Add / Remove
  const handleAddRuleToCause = (causeIdx: number) => {
    if (!ruleEvidCode.trim()) {
      toast({ title: "Evidence Code Required", description: "Select a symptom or enter an evidence code (e.g. SYMP_DUAL_PM_DIVERGENCE)", variant: "destructive" });
      return;
    }

    const newRule: HypothesisRule = {
      evidence_code: ruleEvidCode.trim().toUpperCase(),
      weight: parseFloat(ruleWeight) || 3.5,
      is_mandatory: ruleMandatory,
      description: ruleDesc.trim() || null,
    };

    const updated = [...causesList];
    if (!updated[causeIdx].hypothesis_rules) {
      updated[causeIdx].hypothesis_rules = [];
    }
    updated[causeIdx].hypothesis_rules.push(newRule);
    setCausesList(updated);

    setRuleEvidCode("");
    setRuleDesc("");
    setRuleWeight("4.5");
    setRuleMandatory(true);
  };

  const handleRemoveRule = (causeIdx: number, ruleIdx: number) => {
    const updated = [...causesList];
    if (updated[causeIdx].hypothesis_rules) {
      updated[causeIdx].hypothesis_rules.splice(ruleIdx, 1);
    }
    setCausesList(updated);
  };

  // Save Template (POST or PUT)
  const handleSaveTemplate = async () => {
    if (!formName.trim()) {
      toast({ title: "Name Required", description: "Template Pack Name is required", variant: "destructive" });
      return;
    }

    if (causesList.length === 0) {
      toast({ title: "Causes Required", description: "Please specify at least one root cause hypothesis", variant: "destructive" });
      return;
    }

    try {
      setIsSaving(true);
      const payload: Partial<DiagnosticTemplate> = {
        name: formName.trim(),
        target_component_type: formTargetType,
        version: formVersion.trim() || "1.0.0",
        description: formDescription.trim(),
        symptoms: symptomsList,
        causes: causesList.map((c) => ({
          code: c.code || c.cause_code || "CAUSE_UNSPECIFIED",
          title: c.title,
          category: c.category,
          recommended_action: c.recommended_action,
          hypothesis_rules: c.hypothesis_rules || c.rules || [],
        })),
      };

      let saved: DiagnosticTemplate;
      if (isEditing && selectedTemplate?.id) {
        saved = await diagnosticsService.updateTemplate(selectedTemplate.id, payload);
      } else {
        saved = await diagnosticsService.createTemplate(payload);
      }

      setSelectedTemplate(saved);
      toast({
        title: isEditing ? "Template Updated" : "Template Created",
        description: `Diagnostic template ${saved.name} has been saved.`,
      });
      setModalOpen(false);
      loadTemplates();
    } catch (err: any) {
      toast({ title: "Save Error", description: err.message, variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  // Seed Defaults
  const handleSeedDefaults = async () => {
    try {
      setIsSeeding(true);
      const res = await diagnosticsService.seedDefaults();
      toast({ title: "Default Templates Restored", description: res.message });
      loadTemplates();
    } catch (err: any) {
      toast({ title: "Seed Failed", description: err.message, variant: "destructive" });
    } finally {
      setIsSeeding(false);
    }
  };

  const getSeverityBadgeClass = (severity: string) => {
    switch (severity?.toUpperCase()) {
      case "CRITICAL":
        return "bg-red-100 text-red-800 border-red-300";
      case "HIGH":
        return "bg-rose-100 text-rose-800 border-rose-300";
      case "MEDIUM":
        return "bg-amber-100 text-amber-800 border-amber-300";
      case "LOW":
        return "bg-blue-100 text-blue-800 border-blue-300";
      default:
        return "bg-slate-100 text-slate-800 border-slate-300";
    }
  };

  const getTargetTypeBadgeClass = (type: string) => {
    switch (type?.toLowerCase()) {
      case "battery":
      case "power":
        return "bg-amber-100 text-amber-900 border-amber-300";
      case "sensor":
        return "bg-purple-100 text-purple-900 border-purple-300";
      case "connectivity":
        return "bg-emerald-100 text-emerald-900 border-emerald-300";
      case "solar":
        return "bg-yellow-100 text-yellow-900 border-yellow-300";
      case "cooling":
        return "bg-sky-100 text-sky-900 border-sky-300";
      default:
        return "bg-slate-100 text-slate-900 border-slate-300";
    }
  };

  // Calculate stats for review
  const totalRulesCount = causesList.reduce((acc, c) => acc + (c.hypothesis_rules?.length || 0), 0);

  const stepsConfig = [
    {
      step: 1,
      title: "Metadata",
      subtitle: "Component & Identity",
      icon: Layers,
      count: formName.trim() ? "Set" : "Required",
    },
    {
      step: 2,
      title: "Symptoms",
      subtitle: "Observable Signals",
      icon: Tag,
      count: `${symptomsList.length} items`,
    },
    {
      step: 3,
      title: "Root Causes",
      subtitle: "Failure Hypotheses",
      icon: ShieldAlert,
      count: `${causesList.length} items`,
    },
    {
      step: 4,
      title: "Rules & Review",
      subtitle: "Weighting & Verification",
      icon: Sliders,
      count: `${totalRulesCount} rules`,
    },
  ];

  if (groupLoading) {
    return (
      <div className="p-6">
        <Skeleton className="h-10 w-72 mb-6" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (!isAirqoGroup) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <Card className="border border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base font-bold text-gray-900 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-amber-600" />
              Restricted Organization Section
            </CardTitle>
            <CardDescription className="text-xs text-gray-600 leading-relaxed mt-1">
              Diagnostic Templates and Evidential Rules are exclusively available when the active organization is set to <span className="font-semibold text-primary">AirQo</span>.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

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
            Diagnostic Template & Rules Engine
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Reusable 3-layer diagnostic templates defining hardware symptoms, root cause hypotheses, and evidential weighting rules (+/-)
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            onClick={handleSeedDefaults}
            disabled={isSeeding}
            className="h-9 text-xs bg-white gap-1.5 text-gray-700 shadow-2xs"
            title="Populate standard diagnostic templates"
          >
            <RotateCcw className={`w-3.5 h-3.5 text-primary ${isSeeding ? "animate-spin" : ""}`} />
            {isSeeding ? "Seeding..." : "Seed Default Templates"}
          </Button>
          <Button
            onClick={handleOpenCreate}
            size="sm"
            className="h-9 text-xs bg-primary hover:bg-primary/90 text-primary-foreground gap-1.5 shadow-2xs font-semibold"
          >
            <Plus className="w-4 h-4" />
            New Diagnostic Template
          </Button>
        </div>
      </div>

      {/* 2-Column Template Console */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Template List */}
        <div className="lg:col-span-4 space-y-3">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              Diagnostic Templates ({templates.length})
            </span>
          </div>

          <div className="space-y-2.5">
            {templates.map((tpl) => {
              const isSelected = selectedTemplate?.id === tpl.id;
              const targetType = tpl.target_component_type || tpl.category || "sensor";
              return (
                <div
                  key={tpl.id}
                  onClick={() => setSelectedTemplate(tpl)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer select-none ${
                    isSelected
                      ? "border-primary bg-primary/10 shadow-xs ring-1 ring-primary"
                      : "border-gray-200 bg-white hover:border-gray-300 shadow-2xs"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="text-sm font-bold text-gray-900 leading-tight">
                        {tpl.name}
                      </h4>
                      <p className="text-xs text-gray-500 font-mono mt-0.5">v{tpl.version || "1.0.0"}</p>
                    </div>
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border shrink-0 ${getTargetTypeBadgeClass(
                        targetType
                      )}`}
                    >
                      {targetType}
                    </span>
                  </div>

                  <p className="text-xs text-gray-600 mt-2 line-clamp-2 leading-relaxed">
                    {tpl.description || "No description provided."}
                  </p>

                  <div className="flex items-center gap-3 mt-3 pt-2.5 border-t border-gray-100 text-[11px] text-gray-500">
                    <span>{tpl.symptoms?.length || 0} symptoms</span>
                    <span>·</span>
                    <span>{tpl.causes?.length || 0} causes</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Template Breakdown */}
        <div className="lg:col-span-8">
          {selectedTemplate ? (
            <Card className="border border-gray-200 shadow-xs overflow-hidden">
              <CardHeader className="pb-4 border-b border-gray-100 bg-slate-50/60">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <CardTitle className="text-lg font-bold text-gray-900">
                        {selectedTemplate.name}
                      </CardTitle>
                      <Badge variant="outline" className="text-[10px] font-mono">
                        v{selectedTemplate.version || "1.0.0"}
                      </Badge>
                      <Badge
                        variant="outline"
                        className={`text-[10px] font-bold uppercase ${getTargetTypeBadgeClass(
                          selectedTemplate.target_component_type || selectedTemplate.category || "sensor"
                        )}`}
                      >
                        Targets: {selectedTemplate.target_component_type || selectedTemplate.category}
                      </Badge>
                    </div>
                    <CardDescription className="text-xs font-mono mt-1 text-gray-500">
                      UUID: {selectedTemplate.id}
                    </CardDescription>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setViewJsonModalOpen(true)}
                      className="h-8 text-xs bg-white text-gray-700 gap-1.5 shadow-2xs"
                      title="View Raw Template JSON"
                    >
                      <FileCode className="w-3.5 h-3.5" />
                      JSON
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenEdit(selectedTemplate)}
                      className="h-8 text-xs bg-white text-primary border-primary/20 hover:bg-primary/10 gap-1.5 shadow-2xs font-semibold"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      Edit Template
                    </Button>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="pt-5 space-y-6">
                {/* Description */}
                {selectedTemplate.description && (
                  <p className="text-xs text-gray-700 bg-white p-3.5 rounded-lg border border-slate-200/80 leading-relaxed shadow-2xs">
                    {selectedTemplate.description}
                  </p>
                )}

                {/* Layer 2: Symptoms & Alerts */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider flex items-center gap-1.5">
                      <Tag className="w-4 h-4 text-amber-600" />
                      1. Observed Symptoms ({selectedTemplate.symptoms?.length || 0})
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {selectedTemplate.symptoms?.map((sym, idx) => (
                      <div
                        key={sym.id || sym.code || idx}
                        className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 space-y-2 shadow-2xs"
                      >
                        <div className="flex items-center justify-between gap-1">
                          <span className="font-mono text-xs font-bold text-gray-900">{sym.code}</span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase ${getSeverityBadgeClass(sym.severity)}`}>
                            {sym.severity}
                          </span>
                        </div>
                        <div className="font-semibold text-xs text-gray-900">{sym.name}</div>
                        <p className="text-[11px] text-gray-600 leading-snug">{sym.description}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Layer 3: Causes & Evidential Weighting Rules */}
                <div className="space-y-4 pt-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider flex items-center gap-1.5">
                      <ShieldAlert className="w-4 h-4 text-rose-600" />
                      2. Root Causes & Evidential Rules ({selectedTemplate.causes?.length || 0})
                    </h3>
                  </div>

                  <div className="space-y-4">
                    {selectedTemplate.causes?.map((cause, cIdx) => {
                      const rules = cause.hypothesis_rules || cause.rules || [];
                      const causeCodeStr = cause.code || cause.cause_code || "CAUSE_UNSPECIFIED";
                      return (
                        <div
                          key={cause.id || causeCodeStr || cIdx}
                          className="p-4 rounded-xl border border-gray-200 bg-white shadow-2xs space-y-3"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <h4 className="text-sm font-bold text-gray-900">{cause.title}</h4>
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-800 border uppercase font-mono">
                                  {cause.category}
                                </span>
                              </div>
                              <span className="font-mono text-xs text-gray-500">{causeCodeStr}</span>
                            </div>
                          </div>

                          {/* Prescriptive action */}
                          <div className="p-3 rounded-lg bg-primary/10 border border-primary/20 text-xs text-foreground flex items-start gap-2.5">
                            <Wrench className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                            <div>
                              <span className="font-bold text-primary mr-1">Recommended Action:</span>
                              <span className="leading-relaxed">{cause.recommended_action}</span>
                            </div>
                          </div>

                          {/* Hypothesis Rules Grid */}
                          <div className="space-y-2 pt-1">
                            <div className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                              Evidential Weighting Rules ({rules.length}):
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                              {rules.map((rule, rIdx) => {
                                const isPos = rule.weight > 0;
                                return (
                                  <div
                                    key={rule.id || rIdx}
                                    className={`p-3 rounded-lg border text-xs flex flex-col justify-between gap-2 ${
                                      isPos ? "bg-emerald-50/40 border-emerald-200" : "bg-rose-50/40 border-rose-200"
                                    }`}
                                  >
                                    <div className="flex items-start justify-between gap-2">
                                      <span className="font-mono font-bold text-[11px] text-gray-900">
                                        {rule.evidence_code}
                                      </span>
                                      <div className="flex items-center gap-1.5 shrink-0">
                                        {rule.is_mandatory && (
                                          <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 border border-amber-300 uppercase">
                                            Mandatory
                                          </span>
                                        )}
                                        <span
                                          className={`font-mono font-bold text-xs px-2 py-0.5 rounded border ${
                                            isPos
                                              ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                                              : "bg-rose-100 text-rose-800 border-rose-300"
                                          }`}
                                        >
                                          {isPos ? `+${rule.weight.toFixed(1)}` : rule.weight.toFixed(1)}
                                        </span>
                                      </div>
                                    </div>
                                    {rule.description && (
                                      <p className="text-[10px] text-gray-600 leading-snug">{rule.description}</p>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="text-center py-24 text-gray-400 border border-dashed rounded-xl bg-slate-50 space-y-2">
              <Sliders className="w-10 h-10 text-gray-300 mx-auto" />
              <p className="text-xs">Select a diagnostic template on the left or seed standard templates.</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal: Create / Edit Diagnostic Template (Progressive Multi-Step Stepper) */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-3xl max-h-[92vh] flex flex-col p-0 overflow-hidden">
          {/* Top Modal Header */}
          <div className="p-6 pb-4 border-b border-gray-100 bg-white">
            <div className="flex items-center justify-between mb-3">
              <DialogTitle className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Sliders className="w-5 h-5 text-primary" />
                {isEditing ? `Edit Template: ${formName || selectedTemplate?.name}` : "Create New Diagnostic Template"}
              </DialogTitle>
              <Badge variant="outline" className="text-xs font-mono font-bold bg-slate-50">
                Step {modalStep} of 4
              </Badge>
            </div>
            <DialogDescription className="text-xs text-gray-500">
              Configure diagnostic templates in guided steps: Hardware Metadata $\rightarrow$ Symptoms $\rightarrow$ Failure Causes $\rightarrow$ Evidential Rules.
            </DialogDescription>

            {/* Stepper Progress Bar */}
            <div className="grid grid-cols-4 gap-2 pt-4">
              {stepsConfig.map((s) => {
                const isActive = modalStep === s.step;
                const isPassed = modalStep > s.step;
                const canJump = canNavigateToStep(s.step);
                const Icon = s.icon;

                return (
                  <button
                    key={s.step}
                    type="button"
                    disabled={!canJump}
                    onClick={() => setModalStep(s.step)}
                    className={`flex items-center gap-2 p-2 rounded-lg text-left transition-all text-xs ${
                      isActive
                        ? "bg-primary/10 border border-primary/30 text-primary font-bold shadow-2xs ring-1 ring-primary/20"
                        : isPassed
                        ? "bg-slate-50 border border-slate-200 text-gray-700 hover:bg-slate-100"
                        : "bg-slate-50/50 border border-slate-100 text-gray-400 opacity-60 cursor-not-allowed"
                    }`}
                  >
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] shrink-0 font-bold ${
                        isActive
                          ? "bg-primary text-primary-foreground"
                          : isPassed
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-gray-200 text-gray-600"
                      }`}
                    >
                      {isPassed ? <Check className="w-3.5 h-3.5" /> : s.step}
                    </div>
                    <div className="min-w-0 hidden sm:block">
                      <div className="font-semibold truncate text-[11px] leading-tight flex items-center gap-1">
                        <Icon className="w-3 h-3 shrink-0" />
                        {s.title}
                      </div>
                      <div className="text-[9px] text-gray-500 truncate mt-0.5">{s.count}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Scrollable Step Content Body */}
          <div className="p-6 overflow-y-auto space-y-4 text-xs flex-1">
            {/* STEP 1: Metadata & Target Component */}
            {modalStep === 1 && (
              <div className="space-y-4 animate-in fade-in-50 duration-200">
                <div className="p-3.5 rounded-xl border border-primary/20 bg-primary/5 flex items-start gap-3">
                  <Layers className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-gray-900 text-xs">Step 1: Template Metadata & Target Component</h4>
                    <p className="text-[11px] text-gray-600 mt-0.5 leading-relaxed">
                      Define the template title, version, and the target hardware component subsystem (e.g. sensor, battery, solar) it diagnoses.
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-xl border border-gray-200 bg-white space-y-4 shadow-2xs">
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-3.5">
                    <div className="space-y-1.5 sm:col-span-6">
                      <Label className="text-xs font-semibold text-gray-800">
                        Template Title <span className="text-rose-500">*</span>
                      </Label>
                      <Input
                        value={formName}
                        onChange={(e) => setFormName(e.target.value)}
                        placeholder="e.g. Dual Optical PM2.5 / PM10 Sensor Template"
                        className="h-8 text-xs font-medium"
                      />
                      <span className="text-[10px] text-gray-400">Clear descriptive title for this diagnostic pack.</span>
                    </div>

                    <div className="space-y-1.5 sm:col-span-3">
                      <Label className="text-xs font-semibold text-gray-800">
                        Target Component <span className="text-rose-500">*</span>
                      </Label>
                      <Select value={formTargetType} onValueChange={setFormTargetType}>
                        <SelectTrigger className="h-8 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="sensor">Sensor</SelectItem>
                          <SelectItem value="battery">Battery / Power</SelectItem>
                          <SelectItem value="solar">Solar Subsystem</SelectItem>
                          <SelectItem value="connectivity">Connectivity / Modem</SelectItem>
                          <SelectItem value="cooling">Cooling / HVAC</SelectItem>
                          <SelectItem value="motor">Motor / Pump</SelectItem>
                          <SelectItem value="compute">Compute / MCU</SelectItem>
                          <SelectItem value="storage">Storage</SelectItem>
                          <SelectItem value="actuator">Actuator</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <span className="text-[10px] text-gray-400">Hardware category</span>
                    </div>

                    <div className="space-y-1.5 sm:col-span-3">
                      <Label className="text-xs font-semibold text-gray-800">Version</Label>
                      <Input
                        value={formVersion}
                        onChange={(e) => setFormVersion(e.target.value)}
                        placeholder="1.0.0"
                        className="h-8 text-xs font-mono"
                      />
                      <span className="text-[10px] text-gray-400">Semantic versioning</span>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-gray-800">Description & Failure Modes Overview</Label>
                    <Textarea
                      rows={3}
                      value={formDescription}
                      onChange={(e) => setFormDescription(e.target.value)}
                      placeholder="Describe target deployment environments, hardware sensors, and the physical degradation modes this template diagnoses..."
                      className="text-xs leading-relaxed"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: Observable Symptoms */}
            {modalStep === 2 && (
              <div className="space-y-4 animate-in fade-in-50 duration-200">
                <div className="p-3.5 rounded-xl border border-amber-500/20 bg-amber-500/5 flex items-start gap-3">
                  <Tag className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-gray-900 text-xs">Step 2: Observable Symptoms & Telemetry Anomalies</h4>
                    <p className="text-[11px] text-gray-600 mt-0.5 leading-relaxed">
                      Define the measurable symptoms, threshold breaches, and error codes observable from device telemetry.
                    </p>
                  </div>
                </div>

                {/* Add Symptom Subform */}
                <div className="bg-slate-50/80 p-4 rounded-xl border border-gray-200 space-y-3 shadow-2xs">
                  <span className="text-xs font-bold text-gray-800 uppercase tracking-wider flex items-center gap-1.5">
                    <Plus className="w-3.5 h-3.5 text-primary" /> Add New Symptom
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
                    <div className="sm:col-span-4 space-y-1">
                      <Label className="text-[11px] font-semibold text-gray-700">Symptom Code *</Label>
                      <Input
                        placeholder="SYMP_DUAL_PM_DIVERGENCE"
                        value={symptomCode}
                        onChange={(e) => setSymptomCode(e.target.value)}
                        className="h-8 text-xs font-mono"
                      />
                    </div>
                    <div className="sm:col-span-5 space-y-1">
                      <Label className="text-[11px] font-semibold text-gray-700">Display Name *</Label>
                      <Input
                        placeholder="Dual Sensor Divergence"
                        value={symptomName}
                        onChange={(e) => setSymptomName(e.target.value)}
                        className="h-8 text-xs"
                      />
                    </div>
                    <div className="sm:col-span-3 space-y-1">
                      <Label className="text-[11px] font-semibold text-gray-700">Severity</Label>
                      <Select value={symptomSeverity} onValueChange={(v: any) => setSymptomSeverity(v)}>
                        <SelectTrigger className="h-8 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="LOW">LOW</SelectItem>
                          <SelectItem value="MEDIUM">MEDIUM</SelectItem>
                          <SelectItem value="HIGH">HIGH</SelectItem>
                          <SelectItem value="CRITICAL">CRITICAL</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-1">
                    <Input
                      placeholder="Detailed condition (e.g. Channel A and Channel B diverge by >35% for 3 consecutive intervals)..."
                      value={symptomDesc}
                      onChange={(e) => setSymptomDesc(e.target.value)}
                      className="h-8 text-xs flex-1"
                    />
                    <Button
                      type="button"
                      onClick={handleAddSymptom}
                      size="sm"
                      className="h-8 text-xs bg-primary hover:bg-primary/90 text-primary-foreground shrink-0 font-semibold px-4"
                    >
                      <Plus className="w-3.5 h-3.5 mr-1" /> Add Symptom
                    </Button>
                  </div>
                </div>

                {/* Symptoms List */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between px-1">
                    <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Configured Symptoms ({symptomsList.length})
                    </span>
                    {symptomsList.length === 0 && (
                      <span className="text-xs text-amber-600 font-medium">Add at least 1 symptom</span>
                    )}
                  </div>

                  {symptomsList.length === 0 ? (
                    <div className="p-8 text-center bg-white border border-dashed rounded-xl space-y-2 text-gray-400">
                      <Tag className="w-8 h-8 mx-auto text-gray-300" />
                      <p className="text-xs">No symptoms defined yet. Use the form above to register observable anomalies.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {symptomsList.map((sym, sIdx) => (
                        <div
                          key={sIdx}
                          className="p-3 rounded-xl bg-white border border-gray-200 flex flex-col justify-between gap-2 shadow-2xs relative group hover:border-gray-300 transition-all"
                        >
                          <div>
                            <div className="flex items-center justify-between gap-1 mb-1">
                              <span className="font-mono font-bold text-xs text-gray-900">{sym.code}</span>
                              <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border uppercase ${getSeverityBadgeClass(sym.severity)}`}>
                                {sym.severity}
                              </span>
                            </div>
                            <h5 className="font-semibold text-xs text-gray-800">{sym.name}</h5>
                            <p className="text-[11px] text-gray-500 mt-1 line-clamp-2 leading-relaxed">{sym.description}</p>
                          </div>
                          <div className="flex justify-end pt-2 border-t border-gray-100">
                            <button
                              type="button"
                              onClick={() => handleRemoveSymptom(sIdx)}
                              className="text-rose-500 hover:text-rose-700 text-[11px] flex items-center gap-1 font-medium transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" /> Remove
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* STEP 3: Root Failure Causes */}
            {modalStep === 3 && (
              <div className="space-y-4 animate-in fade-in-50 duration-200">
                <div className="p-3.5 rounded-xl border border-rose-500/20 bg-rose-500/5 flex items-start gap-3">
                  <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-gray-900 text-xs">Step 3: Root Failure Causes & Recommended Actions</h4>
                    <p className="text-[11px] text-gray-600 mt-0.5 leading-relaxed">
                      Define candidate failure modes and specify prescriptive field repair actions for maintenance engineers.
                    </p>
                  </div>
                </div>

                {/* Add Cause Subform */}
                <div className="bg-slate-50/80 p-4 rounded-xl border border-gray-200 space-y-3 shadow-2xs">
                  <span className="text-xs font-bold text-gray-800 uppercase tracking-wider flex items-center gap-1.5">
                    <Plus className="w-3.5 h-3.5 text-primary" /> Add Root Cause Hypothesis
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
                    <div className="sm:col-span-4 space-y-1">
                      <Label className="text-[11px] font-semibold text-gray-700">Cause Code *</Label>
                      <Input
                        placeholder="CAUSE_OPTICAL_CONTAMINATION"
                        value={causeCode}
                        onChange={(e) => setCauseCode(e.target.value)}
                        className="h-8 text-xs font-mono"
                      />
                    </div>
                    <div className="sm:col-span-5 space-y-1">
                      <Label className="text-[11px] font-semibold text-gray-700">Diagnosis Title *</Label>
                      <Input
                        placeholder="Optical Chamber Contamination / Drift"
                        value={causeTitle}
                        onChange={(e) => setCauseTitle(e.target.value)}
                        className="h-8 text-xs"
                      />
                    </div>
                    <div className="sm:col-span-3 space-y-1">
                      <Label className="text-[11px] font-semibold text-gray-700">Category</Label>
                      <Select value={causeCategory} onValueChange={setCauseCategory}>
                        <SelectTrigger className="h-8 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="HARDWARE_FAILURE">HARDWARE_FAILURE</SelectItem>
                          <SelectItem value="MAINTENANCE_REQUIRED">MAINTENANCE_REQUIRED</SelectItem>
                          <SelectItem value="FIRMWARE_OR_BUS_FAULT">FIRMWARE_OR_BUS_FAULT</SelectItem>
                          <SelectItem value="ENVIRONMENTAL">ENVIRONMENTAL</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-1">
                    <Input
                      placeholder="Prescriptive field action (e.g. Inspect chamber with compressed air or replace sensor module)..."
                      value={causeAction}
                      onChange={(e) => setCauseAction(e.target.value)}
                      className="h-8 text-xs flex-1"
                    />
                    <Button
                      type="button"
                      onClick={handleAddCause}
                      size="sm"
                      className="h-8 text-xs bg-primary hover:bg-primary/90 text-primary-foreground shrink-0 font-semibold px-4"
                    >
                      <Plus className="w-3.5 h-3.5 mr-1" /> Add Cause
                    </Button>
                  </div>
                </div>

                {/* Causes List */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between px-1">
                    <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Configured Root Causes ({causesList.length})
                    </span>
                    {causesList.length === 0 && (
                      <span className="text-xs text-rose-600 font-medium">At least 1 cause is required</span>
                    )}
                  </div>

                  {causesList.length === 0 ? (
                    <div className="p-8 text-center bg-white border border-dashed rounded-xl space-y-2 text-gray-400">
                      <ShieldAlert className="w-8 h-8 mx-auto text-gray-300" />
                      <p className="text-xs">No root causes defined yet. Add at least one cause to proceed to rule configuration.</p>
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      {causesList.map((cause, cIdx) => (
                        <div
                          key={cIdx}
                          className="p-3.5 rounded-xl bg-white border border-gray-200 space-y-2 shadow-2xs hover:border-gray-300 transition-all"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <h5 className="font-bold text-xs text-gray-900">{cause.title}</h5>
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-800 border uppercase font-mono">
                                  {cause.category}
                                </span>
                              </div>
                              <span className="font-mono text-[11px] text-gray-500">{cause.code}</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleRemoveCause(cIdx)}
                              className="text-rose-500 hover:text-rose-700 p-1"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <div className="p-2.5 rounded-lg bg-primary/10 border border-primary/20 text-xs text-foreground flex items-start gap-2">
                            <Wrench className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                            <div>
                              <span className="font-bold text-primary mr-1">Recommended Action:</span>
                              <span className="leading-relaxed">{cause.recommended_action}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* STEP 4: Hypothesis Weighting Rules & Review */}
            {modalStep === 4 && (
              <div className="space-y-5 animate-in fade-in-50 duration-200">
                <div className="p-3.5 rounded-xl border border-indigo-500/20 bg-indigo-500/5 flex items-start gap-3">
                  <Sliders className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-gray-900 text-xs">Step 4: Evidential Weighting Rules & Review</h4>
                    <p className="text-[11px] text-gray-600 mt-0.5 leading-relaxed">
                      Link symptoms (evidence) to failure causes with positive (+) or negative (-) weights to score diagnostic confidence.
                    </p>
                  </div>
                </div>

                {/* Causes Selector Tabs */}
                {causesList.length > 0 && (
                  <div className="space-y-3">
                    <Label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Select Root Cause to Configure Rules:
                    </Label>
                    <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                      {causesList.map((cause, idx) => {
                        const isSelected = selectedCauseIdx === idx;
                        const rulesCount = cause.hypothesis_rules?.length || 0;
                        return (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => setSelectedCauseIdx(idx)}
                            className={`px-3 py-2 rounded-lg text-xs font-semibold shrink-0 transition-all border flex items-center gap-2 ${
                              isSelected
                                ? "bg-primary text-primary-foreground border-primary shadow-xs"
                                : "bg-white text-gray-700 border-gray-200 hover:bg-slate-50"
                            }`}
                          >
                            <span>{cause.title}</span>
                            <Badge
                              variant="secondary"
                              className={`text-[9px] px-1.5 py-0 ${
                                isSelected ? "bg-white/20 text-white" : "bg-slate-100 text-gray-700"
                              }`}
                            >
                              {rulesCount} rules
                            </Badge>
                          </button>
                        );
                      })}
                    </div>

                    {/* Active Cause Rule Builder Box */}
                    {causesList[selectedCauseIdx] && (
                      <div className="p-4 rounded-xl border border-gray-200 bg-white space-y-3 shadow-2xs">
                        <div className="flex items-center justify-between pb-2 border-b">
                          <div>
                            <span className="font-bold text-xs text-gray-900">
                              Rules for: {causesList[selectedCauseIdx].title}
                            </span>
                            <span className="font-mono text-[11px] text-gray-400 ml-2">
                              ({causesList[selectedCauseIdx].code})
                            </span>
                          </div>
                          <span className="text-[10px] text-gray-500 font-medium">
                            {causesList[selectedCauseIdx].hypothesis_rules?.length || 0} active rules
                          </span>
                        </div>

                        {/* Add Rule Form */}
                        <div className="bg-slate-50 p-3 rounded-lg border border-gray-200 space-y-2.5">
                          <span className="text-[11px] font-bold text-gray-700 uppercase tracking-wider">
                            + Add Evidential Weighting Rule
                          </span>

                          <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
                            {/* Evidence Code with Quick Symptom Selection */}
                            <div className="sm:col-span-6 space-y-1">
                              <Label className="text-[10px] font-semibold text-gray-600">Evidence Code *</Label>
                              <div className="flex items-center gap-1.5">
                                <Input
                                  placeholder="e.g. SYMP_DUAL_PM_DIVERGENCE"
                                  value={ruleEvidCode}
                                  onChange={(e) => setRuleEvidCode(e.target.value)}
                                  className="h-7 text-xs font-mono flex-1"
                                />
                                {symptomsList.length > 0 && (
                                  <Select onValueChange={(code) => setRuleEvidCode(code)}>
                                    <SelectTrigger className="h-7 text-[10px] w-28 bg-white" title="Select from symptoms">
                                      <SelectValue placeholder="Pick Symptom" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {symptomsList.map((s, i) => (
                                        <SelectItem key={i} value={s.code} className="text-xs font-mono">
                                          {s.code}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                )}
                              </div>
                            </div>

                            {/* Weight with Quick Presets */}
                            <div className="sm:col-span-3 space-y-1">
                              <Label className="text-[10px] font-semibold text-gray-600">Weight (+ / -)</Label>
                              <Input
                                placeholder="4.5 / -5.0"
                                value={ruleWeight}
                                onChange={(e) => setRuleWeight(e.target.value)}
                                className="h-7 text-xs font-mono"
                              />
                            </div>

                            {/* Mandatory Checkbox */}
                            <div className="sm:col-span-3 flex items-center gap-1.5 pt-4">
                              <Checkbox
                                id="rule-mandatory-check"
                                checked={ruleMandatory}
                                onCheckedChange={(c) => setRuleMandatory(Boolean(c))}
                                className="h-4 w-4"
                              />
                              <Label htmlFor="rule-mandatory-check" className="text-[11px] font-medium cursor-pointer">
                                Mandatory Rule
                              </Label>
                            </div>
                          </div>

                          {/* Quick Weight Chips */}
                          <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                            <span className="text-[10px] text-gray-400">Presets:</span>
                            <button
                              type="button"
                              onClick={() => setRuleWeight("5.0")}
                              className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-mono hover:bg-emerald-200"
                            >
                              +5.0 (Strong Support)
                            </button>
                            <button
                              type="button"
                              onClick={() => setRuleWeight("3.0")}
                              className="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 text-[10px] font-mono hover:bg-emerald-100 border border-emerald-200"
                            >
                              +3.0 (Moderate)
                            </button>
                            <button
                              type="button"
                              onClick={() => setRuleWeight("-3.0")}
                              className="px-1.5 py-0.5 rounded bg-rose-50 text-rose-700 text-[10px] font-mono hover:bg-rose-100 border border-rose-200"
                            >
                              -3.0 (Moderate Refute)
                            </button>
                            <button
                              type="button"
                              onClick={() => setRuleWeight("-5.0")}
                              className="px-1.5 py-0.5 rounded bg-rose-100 text-rose-800 text-[10px] font-mono hover:bg-rose-200"
                            >
                              -5.0 (Strong Refute)
                            </button>
                          </div>

                          <div className="flex items-center gap-2 pt-1">
                            <Input
                              placeholder="Rule description or rationale (e.g. Sensors diverge beyond threshold)..."
                              value={ruleDesc}
                              onChange={(e) => setRuleDesc(e.target.value)}
                              className="h-7 text-xs flex-1"
                            />
                            <Button
                              type="button"
                              onClick={() => handleAddRuleToCause(selectedCauseIdx)}
                              size="sm"
                              className="h-7 text-xs bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shrink-0 px-3"
                            >
                              + Add Rule
                            </Button>
                          </div>
                        </div>

                        {/* Existing Rules on active Cause */}
                        <div className="space-y-2 pt-1">
                          <div className="text-[11px] font-bold text-gray-600 uppercase tracking-wider">
                            Active Hypothesis Rules ({causesList[selectedCauseIdx]?.hypothesis_rules?.length || 0}):
                          </div>

                          {(!causesList[selectedCauseIdx]?.hypothesis_rules ||
                            causesList[selectedCauseIdx]?.hypothesis_rules?.length === 0) ? (
                            <div className="p-4 text-center border border-dashed rounded-lg text-gray-400 text-xs">
                              No rules added to this cause yet. Add at least one rule to score Bayesian confidence.
                            </div>
                          ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              {causesList[selectedCauseIdx].hypothesis_rules?.map((rule, rIdx) => {
                                const isPos = rule.weight > 0;
                                return (
                                  <div
                                    key={rIdx}
                                    className={`p-2.5 rounded-lg border text-xs flex flex-col justify-between gap-1.5 ${
                                      isPos ? "bg-emerald-50/50 border-emerald-200" : "bg-rose-50/50 border-rose-200"
                                    }`}
                                  >
                                    <div className="flex items-start justify-between gap-1">
                                      <span className="font-mono font-bold text-gray-900 text-[11px]">
                                        {rule.evidence_code}
                                      </span>
                                      <div className="flex items-center gap-1.5 shrink-0">
                                        {rule.is_mandatory && (
                                          <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 border border-amber-300 uppercase">
                                            Req
                                          </span>
                                        )}
                                        <span
                                          className={`font-mono font-bold text-[11px] px-1.5 py-0.5 rounded border ${
                                            isPos
                                              ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                                              : "bg-rose-100 text-rose-800 border-rose-300"
                                          }`}
                                        >
                                          {isPos ? `+${rule.weight}` : rule.weight}
                                        </span>
                                        <button
                                          type="button"
                                          onClick={() => handleRemoveRule(selectedCauseIdx, rIdx)}
                                          className="text-rose-500 hover:text-rose-700 ml-1"
                                        >
                                          <Trash2 className="w-3 h-3" />
                                        </button>
                                      </div>
                                    </div>
                                    {rule.description && (
                                      <p className="text-[10px] text-gray-600 leading-snug">{rule.description}</p>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Template Review Summary */}
                <div className="p-4 rounded-xl border border-gray-200 bg-slate-50/80 space-y-3 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-800 uppercase tracking-wider flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Template Configuration Summary
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowPreviewJson(!showPreviewJson)}
                      className="h-6 text-[11px] text-primary gap-1"
                    >
                      <FileCode className="w-3 h-3" />
                      {showPreviewJson ? "Hide JSON" : "Preview JSON"}
                    </Button>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    <div className="p-2.5 rounded-lg bg-white border text-center">
                      <span className="text-[10px] text-gray-500 uppercase block font-semibold">Title</span>
                      <span className="font-bold text-xs text-gray-900 truncate block">{formName || "Untitled"}</span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-white border text-center">
                      <span className="text-[10px] text-gray-500 uppercase block font-semibold">Target</span>
                      <span className="font-bold text-xs text-gray-900 capitalize block">{formTargetType}</span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-white border text-center">
                      <span className="text-[10px] text-gray-500 uppercase block font-semibold">Symptoms</span>
                      <span className="font-bold text-xs text-amber-600 block">{symptomsList.length}</span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-white border text-center">
                      <span className="text-[10px] text-gray-500 uppercase block font-semibold">Causes / Rules</span>
                      <span className="font-bold text-xs text-primary block">
                        {causesList.length} / {totalRulesCount}
                      </span>
                    </div>
                  </div>

                  {showPreviewJson && (
                    <pre className="p-3 bg-slate-900 text-slate-100 rounded-lg text-[10px] font-mono overflow-x-auto max-h-48 leading-relaxed">
                      {JSON.stringify(
                        {
                          name: formName,
                          target_component_type: formTargetType,
                          version: formVersion,
                          description: formDescription,
                          symptoms: symptomsList,
                          causes: causesList,
                        },
                        null,
                        2
                      )}
                    </pre>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Modal Footer with Stepper Controls */}
          <DialogFooter className="p-4 border-t bg-slate-50/90 flex flex-row items-center justify-between gap-2 sm:justify-between">
            <div>
              <Button
                type="button"
                variant="outline"
                onClick={() => setModalOpen(false)}
                className="text-xs h-8 px-3 text-gray-600"
              >
                Cancel
              </Button>
            </div>

            <div className="flex items-center gap-2">
              {modalStep > 1 && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handlePrevStep}
                  className="text-xs h-8 px-3 gap-1"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Back
                </Button>
              )}

              {modalStep < 4 ? (
                <Button
                  type="button"
                  onClick={handleNextStep}
                  className="text-xs h-8 px-4 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold gap-1"
                >
                  Next: {stepsConfig[modalStep]?.title} <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              ) : (
                <Button
                  type="button"
                  onClick={handleSaveTemplate}
                  disabled={isSaving}
                  className="text-xs h-8 px-5 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold gap-1.5 shadow-xs"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {isSaving ? "Saving Template..." : isEditing ? "Update Template" : "Create Diagnostic Template"}
                </Button>
              )}
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal: View Raw Template JSON */}
      <Dialog open={viewJsonModalOpen} onOpenChange={setViewJsonModalOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-gray-900 flex items-center justify-between">
              <span>{selectedTemplate?.name} — JSON Schema</span>
            </DialogTitle>
          </DialogHeader>

          {selectedTemplate && (
            <div className="space-y-3">
              <pre className="p-4 bg-slate-900 text-slate-100 rounded-xl text-xs font-mono overflow-x-auto max-h-[480px] leading-relaxed">
                {JSON.stringify(selectedTemplate, null, 2)}
              </pre>
              <div className="flex justify-end">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    navigator.clipboard.writeText(JSON.stringify(selectedTemplate, null, 2));
                    toast({ title: "Copied", description: "Template JSON copied to clipboard." });
                  }}
                  className="h-7 text-xs gap-1"
                >
                  <Copy className="w-3.5 h-3.5" /> Copy JSON
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

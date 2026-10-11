"use client";

import React, { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { diagnosticsService } from "@/services/diagnosticsService";
import type { DeviceProfile, StatusCodeSet, StatusDecodeResponse } from "@/types/diagnostics";
import { clearStatusCodeSetCache } from "@/hooks/use-status-code-set";
import { ROUTES } from "@/lib/navigation";
import { StatusCodeSetDialog } from "@/components/diagnostics/StatusCodeSetDialog";
import { LinkStatusCodeSetDialog, setSlotStatusCodeSet } from "@/components/diagnostics/LinkStatusCodeSetDialog";
import {
  DecodedStatusBadge,
  DecodedStatusChips,
  STATUS_KIND_LABELS,
  STATUS_KIND_STYLES,
} from "@/components/diagnostics/StatusCodeChips";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/components/ui/use-toast";
import { AlertTriangle, Edit2, Layers, Link2, ListOrdered, Plus, RefreshCw, Search, Trash2, Unlink, Wand2 } from "lucide-react";

interface ProfileLink {
  profileId: string;
  profileName: string;
  slot: string;
  label: string;
}

const parseValues = (text: string) => text.split(/[\s,]+/).map((value) => value.trim()).filter(Boolean);

function StatusCodesPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const requestedSet = searchParams?.get("set") || null;

  const [sets, setSets] = useState<StatusCodeSet[]>([]);
  const [profiles, setProfiles] = useState<DeviceProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [selectedName, setSelectedName] = useState<string | null>(requestedSet);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<StatusCodeSet | null>(null);
  const [linkDialogOpen, setLinkDialogOpen] = useState(false);

  const [decodeInput, setDecodeInput] = useState("");
  const [decodeResult, setDecodeResult] = useState<StatusDecodeResponse | null>(null);
  const [isDecoding, setIsDecoding] = useState(false);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [codeSets, profileList] = await Promise.all([
        diagnosticsService.getStatusCodeSets({ limit: 500 }),
        // Only used to show which profiles link to each set
        diagnosticsService.getProfiles({ limit: 500 }).catch(() => [] as DeviceProfile[]),
      ]);
      setSets(codeSets);
      setProfiles(profileList);
    } catch (err: any) {
      setError(err?.message || "Failed to load status code sets.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const visibleSets = useMemo(
    () => sets.filter((set) => set.name.toLowerCase().includes(search.trim().toLowerCase())),
    [sets, search]
  );
  const selected = sets.find((set) => set.name === selectedName) ?? visibleSets[0] ?? null;

  const linksBySet = useMemo(() => {
    const links = new Map<string, ProfileLink[]>();
    for (const profile of profiles) {
      for (const [slot, mapping] of Object.entries(profile.telemetry_mappings || {})) {
        if (!mapping?.status_code_set) continue;
        const list = links.get(mapping.status_code_set) ?? [];
        list.push({ profileId: profile.id, profileName: profile.name, slot, label: mapping.label });
        links.set(mapping.status_code_set, list);
      }
    }
    return links;
  }, [profiles]);
  const selectedLinks = selected ? linksBySet.get(selected.name) ?? [] : [];

  const selectSet = (name: string) => {
    setSelectedName(name);
    setDecodeResult(null);
    router.replace(`${ROUTES.STATUS_CODES}?set=${encodeURIComponent(name)}`, { scroll: false });
  };

  const handleSaved = (saved: StatusCodeSet) => {
    clearStatusCodeSetCache();
    setSelectedName(saved.name);
    setDecodeResult(null);
    router.replace(`${ROUTES.STATUS_CODES}?set=${encodeURIComponent(saved.name)}`, { scroll: false });
    load();
  };

  const handleDelete = async (set: StatusCodeSet) => {
    const links = linksBySet.get(set.name) ?? [];
    const warning = links.length
      ? `\n\n${links.map((l) => `${l.profileName} (${l.slot})`).join(", ")} link to it, and their status values will no longer be decoded.`
      : "";
    if (!confirm(`Delete status code set "${set.name}" and its ${set.codes.length} codes?${warning}`)) return;
    try {
      await diagnosticsService.deleteStatusCodeSet(set.id);
      clearStatusCodeSetCache();
      toast({ title: "Status Code Set Deleted", description: `${set.name} deleted.` });
      setSelectedName(null);
      load();
    } catch (err: any) {
      toast({ title: "Delete Failed", description: err?.message || "Could not delete the set.", variant: "destructive" });
    }
  };

  const handleUnlink = async (link: ProfileLink) => {
    if (!selected || !confirm(`Unlink ${link.profileName} ${link.slot} from ${selected.name}? Its status values will no longer be decoded.`)) return;
    try {
      await setSlotStatusCodeSet(link.profileId, link.slot, null);
      clearStatusCodeSetCache();
      toast({ title: "Status Codes Unlinked", description: `${link.profileName} ${link.slot} is no longer decoded with ${selected.name}.` });
      load();
    } catch (err: any) {
      toast({ title: "Unlink Failed", description: err?.message || "Could not update the profile.", variant: "destructive" });
    }
  };

  const handleDecode = async () => {
    if (!selected) return;
    const values = parseValues(decodeInput);
    if (values.length === 0) return;
    try {
      setIsDecoding(true);
      setDecodeResult(await diagnosticsService.decodeStatusValues(selected.id, values.slice(0, 1000)));
    } catch (err: any) {
      toast({ title: "Decode Failed", description: err?.message || "Could not decode the values.", variant: "destructive" });
    } finally {
      setIsDecoding(false);
    }
  };

  const sortedCodes = selected ? [...selected.codes].sort((a, b) => a.code - b.code) : [];

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto pb-16">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2.5">
            <ListOrdered className="w-7 h-7 text-primary" />
            Status Codes
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            The status codes each device type reports, what they mean and how a reported value decodes. A device profile links its
            status field to a set.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <Button variant="outline" size="sm" onClick={load} disabled={loading} className="h-9 text-xs bg-white gap-1.5 text-gray-700">
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button
            size="sm"
            onClick={() => {
              setEditing(null);
              setDialogOpen(true);
            }}
            className="h-9 text-xs gap-1.5 font-semibold"
          >
            <Plus className="w-4 h-4" />
            New Status Code Set
          </Button>
        </div>
      </div>

      {loading && sets.length === 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <Skeleton className="h-64 lg:col-span-4 rounded-xl" />
          <Skeleton className="h-96 lg:col-span-8 rounded-xl" />
        </div>
      ) : error ? (
        <Card className="p-10 text-center border-dashed border-gray-200">
          <AlertTriangle className="w-10 h-10 text-amber-500 mx-auto mb-2" />
          <h3 className="text-base font-bold text-gray-900">Status Codes Unavailable</h3>
          <p className="text-xs text-gray-500 mt-1 max-w-md mx-auto">{error}</p>
          <Button onClick={load} className="mt-4 text-xs gap-1.5">
            <RefreshCw className="w-3.5 h-3.5" />
            Retry
          </Button>
        </Card>
      ) : sets.length === 0 ? (
        <Card className="p-10 text-center border-dashed border-gray-200">
          <ListOrdered className="w-10 h-10 text-gray-400 mx-auto mb-2" />
          <h3 className="text-base font-bold text-gray-900">No Status Code Sets Yet</h3>
          <p className="text-xs text-gray-500 mt-1 max-w-md mx-auto">
            Create one for each device type that reports status codes. The BAM-1020 set is added by Seed Default Templates on the{" "}
            <Link href={ROUTES.DIAGNOSTIC_TEMPLATES} className="text-primary hover:underline">
              Diagnostic Templates
            </Link>{" "}
            page.
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-4 space-y-3">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-gray-400" />
              <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search sets..." className="h-9 pl-8 text-xs bg-white" />
            </div>
            <div className="space-y-2.5">
              {visibleSets.map((set) => {
                const faults = set.codes.filter((code) => code.kind === "fault").length;
                const links = linksBySet.get(set.name) ?? [];
                const isSelected = selected?.id === set.id;
                return (
                  <button
                    key={set.id}
                    type="button"
                    onClick={() => selectSet(set.name)}
                    className={`w-full text-left p-4 rounded-xl border transition-all ${
                      isSelected ? "border-primary bg-primary/5 shadow-sm" : "border-gray-200 bg-white hover:border-gray-300"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono font-bold text-sm text-gray-900 truncate">{set.name}</span>
                      <span className="text-[10px] font-semibold uppercase tracking-wide text-gray-500">{set.decode_rule}</span>
                    </div>
                    {set.description && <p className="text-xs text-gray-500 mt-1 line-clamp-2">{set.description}</p>}
                    <div className="text-[11px] text-gray-500 mt-2">
                      {set.codes.length} codes · {faults} faults · {links.length ? `linked to ${links.length} field${links.length === 1 ? "" : "s"}` : "not linked"}
                    </div>
                  </button>
                );
              })}
              {visibleSets.length === 0 && <p className="text-xs text-gray-400 px-1">No sets match &quot;{search}&quot;.</p>}
            </div>
          </div>

          {selected && (
            <div className="lg:col-span-8 space-y-6">
              <Card className="border border-gray-200 shadow-sm">
                <CardHeader className="pb-3 border-b border-gray-100">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <CardTitle className="text-base font-bold text-gray-900 font-mono">{selected.name}</CardTitle>
                      <CardDescription className="text-xs text-gray-500 mt-1">{selected.description || "No description."}</CardDescription>
                      <p className="text-[11px] text-gray-500 mt-1">
                        <span className="font-semibold uppercase tracking-wide">{selected.decode_rule}</span>{" "}
                        {selected.decode_rule === "bitmask"
                          ? "· a reported value is the sum of its active codes, so 17 reads as 16 + 1"
                          : "· a reported value is a single code"}
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setEditing(selected);
                          setDialogOpen(true);
                        }}
                        className="h-8 text-xs gap-1.5 bg-white"
                      >
                        <Edit2 className="w-3.5 h-3.5" /> Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(selected)}
                        className="h-8 text-xs gap-1.5 bg-white text-rose-600 border-rose-200 hover:bg-rose-50"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Delete
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 border-b border-gray-200 text-[11px] text-gray-500 uppercase font-semibold">
                      <tr>
                        <th className="py-2.5 px-4 w-20">Code</th>
                        <th className="py-2.5 px-3">Label</th>
                        <th className="py-2.5 px-3 w-24">Kind</th>
                        <th className="py-2.5 px-4">Description</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {sortedCodes.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="py-6 text-center text-gray-400">
                            No codes defined.
                          </td>
                        </tr>
                      ) : (
                        sortedCodes.map((code) => (
                          <tr key={code.code} className="align-top">
                            <td className="py-2.5 px-4 font-mono font-bold text-gray-900">{code.code}</td>
                            <td className="py-2.5 px-3 font-semibold text-gray-900">{code.label}</td>
                            <td className="py-2.5 px-3">
                              <span className={`inline-block text-[10px] font-bold px-1.5 py-0.5 rounded border uppercase ${STATUS_KIND_STYLES[code.kind]}`}>
                                {STATUS_KIND_LABELS[code.kind]}
                              </span>
                            </td>
                            <td className="py-2.5 px-4 text-gray-600">{code.description || "—"}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                <Card className="border border-gray-200 shadow-sm">
                  <CardHeader className="pb-3 border-b border-gray-100">
                    <CardTitle className="text-sm font-bold text-gray-900 flex items-center gap-2">
                      <Wand2 className="w-4 h-4 text-primary" />
                      Decode Values
                    </CardTitle>
                    <CardDescription className="text-xs">Translate reported values with this set, e.g. 17, 144, 528.</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-4 space-y-3">
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        handleDecode();
                      }}
                      className="flex items-center gap-2"
                    >
                      <Input
                        value={decodeInput}
                        onChange={(e) => setDecodeInput(e.target.value)}
                        placeholder="17, 144"
                        className="h-8 text-xs font-mono"
                      />
                      <Button type="submit" size="sm" disabled={isDecoding || parseValues(decodeInput).length === 0} className="h-8 text-xs">
                        {isDecoding ? "Decoding..." : "Decode"}
                      </Button>
                    </form>
                    {decodeResult && (
                      <ul className="divide-y divide-gray-100 rounded-md border">
                        {decodeResult.results.map((result, index) => (
                          <li key={`${index}-${result.value}`} className="p-2.5 space-y-1.5">
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-bold text-sm text-gray-900">
                                {result.value ?? parseValues(decodeInput)[index]}
                              </span>
                              <DecodedStatusBadge status={result.status} />
                            </div>
                            <DecodedStatusChips result={result} setName={selected.name} />
                          </li>
                        ))}
                      </ul>
                    )}
                  </CardContent>
                </Card>

                <Card className="border border-gray-200 shadow-sm">
                  <CardHeader className="pb-3 border-b border-gray-100">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <CardTitle className="text-sm font-bold text-gray-900 flex items-center gap-2">
                          <Layers className="w-4 h-4 text-primary" />
                          Linked Profile Fields
                        </CardTitle>
                        <CardDescription className="text-xs">
                          Devices whose profile links a field here have that field decoded with this set.
                        </CardDescription>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setLinkDialogOpen(true)}
                        disabled={profiles.length === 0}
                        className="h-7 text-xs gap-1 bg-white shrink-0"
                      >
                        <Link2 className="w-3.5 h-3.5" /> Link a Field
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-4">
                    {selectedLinks.length === 0 ? (
                      <p className="text-xs text-gray-400">
                        No profile links to this set yet, so its codes aren&apos;t used anywhere. Use Link a Field to pick the
                        profile field that carries the status code.
                      </p>
                    ) : (
                      <ul className="divide-y divide-gray-100 text-xs">
                        {selectedLinks.map((link) => (
                          <li key={`${link.profileId}-${link.slot}`} className="flex items-center justify-between gap-2 py-1.5">
                            <span className="min-w-0">
                              <Link
                                href={`${ROUTES.DEVICE_PROFILES}/${encodeURIComponent(link.profileId)}`}
                                className="font-semibold text-primary hover:underline"
                              >
                                {link.profileName}
                              </Link>{" "}
                              <span className="font-mono text-gray-500">{link.slot}</span>{" "}
                              <span className="text-gray-600">{link.label}</span>
                            </span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleUnlink(link)}
                              className="h-6 px-1.5 text-xs text-gray-500 hover:text-rose-600 gap-1 shrink-0"
                              title="Unlink this field"
                            >
                              <Unlink className="w-3 h-3" /> Unlink
                            </Button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </div>
      )}

      {selected && (
        <LinkStatusCodeSetDialog
          open={linkDialogOpen}
          onOpenChange={setLinkDialogOpen}
          codeSet={selected}
          profiles={profiles}
          onLinked={() => {
            clearStatusCodeSetCache();
            load();
          }}
        />
      )}

      <StatusCodeSetDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        codeSet={editing}
        linkedProfileNames={editing ? (linksBySet.get(editing.name) ?? []).map((link) => link.profileName) : []}
        onSaved={handleSaved}
      />
    </div>
  );
}

export default function StatusCodesPage() {
  return (
    <Suspense fallback={<div className="p-6"><Skeleton className="h-10 w-72" /></div>}>
      <StatusCodesPageContent />
    </Suspense>
  );
}

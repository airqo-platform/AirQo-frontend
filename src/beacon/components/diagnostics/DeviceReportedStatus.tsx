"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { Radio } from "lucide-react";
import { deviceApiService } from "@/services/device-api.service";
import { ROUTES } from "@/lib/navigation";
import { decodeStatus, toStatusIssues, type StatusIssue } from "@/lib/status-codes";
import { useCategoryStatusCodeSet } from "@/hooks/use-status-code-set";
import { useSyncedDevice } from "@/hooks/use-synced-device";
import { DecodedStatusBadge, DecodedStatusChips, StatusCodeChip } from "@/components/diagnostics/StatusCodeChips";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const HISTORY_DAYS = 7;
const HISTORY_LIMIT = 5000;
// Most serious first
const KIND_ORDER: Record<StatusIssue["kind"], number> = { fault: 0, unknown: 1, info: 2, ok: 3 };

interface CodeHistory {
  issue: StatusIssue;
  readings: number;
  lastSeen: string | null;
}

const timeAgo = (value: string | null) => {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : formatDistanceToNow(date, { addSuffix: true });
};

interface DeviceReportedStatusProps {
  deviceId: string;
  /** Link the set to the Status Codes admin page (AirQo staff only). */
  showSetLink?: boolean;
}

/**
 * The status codes a device reports, decoded with the set its profile links to: the latest value
 * and how often each code appeared over the last 7 days. Renders nothing for a device whose profile
 * has no linked status field.
 */
export function DeviceReportedStatus({ deviceId, showSetLink = false }: DeviceReportedStatusProps) {
  // The synced record carries the category (which picks the profile), the channel and the latest raw reading
  const { device } = useSyncedDevice(deviceId);
  const [rows, setRows] = useState<Array<Record<string, any>> | null>(null);
  const [historyError, setHistoryError] = useState<string | null>(null);
  const { codeSet, statusField, profileName, loading: setLoading } = useCategoryStatusCodeSet(device ? device.category : null);

  useEffect(() => {
    if (!codeSet || !statusField || device?.channelId == null) return;
    let cancelled = false;
    setRows(null);
    setHistoryError(null);
    deviceApiService
      .getRawChannelData({
        channelId: device.channelId,
        start: new Date(Date.now() - HISTORY_DAYS * 86_400_000).toISOString(),
        limit: HISTORY_LIMIT,
      })
      .then((data) => !cancelled && setRows(data))
      .catch((err) => !cancelled && setHistoryError(err?.message || "Couldn't load the status history."));
    return () => {
      cancelled = true;
    };
  }, [codeSet, statusField, device?.channelId]);

  const history = useMemo(() => {
    if (!rows || !codeSet || !statusField) return null;
    const byPart = new Map<string, CodeHistory>();
    let reported = 0;
    let clean = 0;
    for (const row of rows) {
      const raw = row[statusField.slot];
      if (raw === null || raw === undefined) continue;
      reported += 1;
      const decoded = decodeStatus(codeSet, raw);
      if (decoded.status === "ok") clean += 1;
      for (const issue of toStatusIssues(decoded, codeSet.name)) {
        const key = `${issue.kind}-${issue.code}`;
        const entry = byPart.get(key) ?? { issue, readings: 0, lastSeen: null };
        entry.readings += 1;
        // Rows are newest first, so the first sighting is the latest
        entry.lastSeen ??= row.created_at_ts ?? null;
        byPart.set(key, entry);
      }
    }
    const parts = [...byPart.values()].sort(
      (a, b) => KIND_ORDER[a.issue.kind] - KIND_ORDER[b.issue.kind] || b.readings - a.readings
    );
    return { reported, clean, parts, truncated: rows.length >= HISTORY_LIMIT };
  }, [rows, codeSet, statusField]);

  // Not a device type with a linked status field (or still finding out): nothing to show
  if (!device || setLoading || !codeSet || !statusField) return null;

  const latestRaw = device.latest?.values?.[statusField.slot];
  const latest = latestRaw === undefined || latestRaw === null ? null : decodeStatus(codeSet, latestRaw);

  return (
    <Card className="border border-gray-200 shadow-sm">
      <CardHeader className="pb-3 border-b border-gray-100">
        <CardTitle className="text-sm font-bold text-gray-900 flex items-center gap-2">
          <Radio className="w-4 h-4 text-primary" />
          Reported Status
        </CardTitle>
        <CardDescription className="text-xs">
          Status codes the device reports in <span className="font-mono">{statusField.slot}</span> ({statusField.label}), decoded with{" "}
          {showSetLink ? (
            <Link href={`${ROUTES.STATUS_CODES}?set=${encodeURIComponent(codeSet.name)}`} className="font-mono text-primary hover:underline">
              {codeSet.name}
            </Link>
          ) : (
            <span className="font-mono">{codeSet.name}</span>
          )}{" "}
          from the {profileName} profile.
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-4 space-y-4">
        <div className="space-y-1.5">
          <div className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Latest</div>
          {latest ? (
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-xs">
                <span className="font-mono font-bold text-sm text-gray-900">{latest.value ?? String(latestRaw)}</span>
                <DecodedStatusBadge status={latest.status} />
                <span className="text-gray-500">{timeAgo(device.latest?.timestamp ?? null)}</span>
              </div>
              <DecodedStatusChips result={latest} setName={codeSet.name} />
            </div>
          ) : (
            <p className="text-xs text-gray-400">No status in the latest reading.</p>
          )}
        </div>

        <div className="space-y-1.5">
          <div className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Last {HISTORY_DAYS} days</div>
          {device.channelId == null ? (
            <p className="text-xs text-gray-400">No data channel is recorded for this device, so its history can&apos;t be read.</p>
          ) : historyError ? (
            <p className="text-xs text-amber-700">{historyError}</p>
          ) : !history ? (
            <Skeleton className="h-16 w-full" />
          ) : history.reported === 0 ? (
            <p className="text-xs text-gray-400">No status reported in the last {HISTORY_DAYS} days.</p>
          ) : (
            <>
              <p className="text-xs text-gray-600">
                {history.reported} reading{history.reported === 1 ? "" : "s"} with a status
                {history.truncated ? ` (latest ${HISTORY_LIMIT})` : ""} ·{" "}
                <span className={history.clean === history.reported ? "text-emerald-600 font-semibold" : ""}>
                  {history.clean} with no active codes
                </span>
              </p>
              {history.parts.length > 0 && (
                <table className="w-full text-left text-xs">
                  <thead className="text-[11px] text-gray-500 uppercase">
                    <tr>
                      <th className="py-1.5 pr-3 font-semibold">Code</th>
                      <th className="py-1.5 pr-3 font-semibold">Readings</th>
                      <th className="py-1.5 font-semibold">Last seen</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {history.parts.map((part) => (
                      <tr key={`${part.issue.kind}-${part.issue.code}`}>
                        <td className="py-1.5 pr-3">
                          <StatusCodeChip issue={part.issue} />
                        </td>
                        <td className="py-1.5 pr-3 text-gray-700">
                          <span className="font-semibold">{part.readings}</span> of {history.reported}
                        </td>
                        <td className="py-1.5 text-gray-500">{timeAgo(part.lastSeen)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

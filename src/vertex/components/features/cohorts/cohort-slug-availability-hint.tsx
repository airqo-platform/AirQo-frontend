import { CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { useCohortSlugAvailability } from "@/core/hooks/useCohorts";
import { useDebouncedValue } from "@/core/hooks/useDebouncedValue";
import type { CohortSlugCheckResponse } from "@/app/types/cohorts";

const REASON_COPY: Record<NonNullable<CohortSlugCheckResponse["slug_check"]["reason"]>, string> = {
  taken: "This ID is already in use. A numeric suffix will be added unless you pick another.",
  too_short: "Custom ID must contain at least 3 letters or numbers.",
  reserved: "This ID is reserved. Please choose another.",
  objectid_shape:
    "This ID looks like a system-generated ID (24 hex characters). Add a letter outside a–f or a hyphen.",
};

interface CohortSlugAvailabilityHintProps {
  slug: string;
  groupSlug?: string;
}

/**
 * Live preview of a self-service cohort ID. Shows the sanitised ID the backend
 * would actually store and whether it is free. Informational only — the create
 * request remains the source of truth, so a failed lookup shows nothing.
 */
export function CohortSlugAvailabilityHint({ slug, groupSlug }: CohortSlugAvailabilityHintProps) {
  const trimmed = slug.trim();
  const debounced = useDebouncedValue(trimmed);
  const { data, error, isFetching } = useCohortSlugAvailability(debounced, { groupSlug });

  // Hide stale results while the user is still typing.
  if (!trimmed || debounced !== trimmed) return null;

  if (isFetching) {
    return (
      <p role="status" className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
        <Loader2 className="w-3.5 h-3.5 animate-spin" aria-hidden="true" />
        Checking ID availability…
      </p>
    );
  }

  if (error || !data?.slug_check) return null;

  const { candidate_slug: candidate, available, reason } = data.slug_check;

  if (available) {
    return (
      <p role="status" className="flex items-center gap-1.5 text-xs text-green-700 dark:text-green-400">
        <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" aria-hidden="true" />
        <span>
          <span className="font-mono">{candidate}</span> is available.
        </span>
      </p>
    );
  }

  return (
    <p role="status" className="flex items-center gap-1.5 text-xs text-amber-700 dark:text-amber-400">
      <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" aria-hidden="true" />
      <span>
        {candidate ? (
          <>
            <span className="font-mono">{candidate}</span>:{" "}
          </>
        ) : null}
        {reason ? REASON_COPY[reason] : "This ID is not available."}
      </span>
    </p>
  );
}

export default CohortSlugAvailabilityHint;

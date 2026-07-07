/**
 * TEMPORARY in-memory store for Clean Air Forum wall-display submissions.
 *
 * This is a stand-in for a real endpoint on the AirQo backend API (which
 * lives in a separate repo). It exists so the selfie filter + conference
 * wall feature is fully demoable end-to-end before that backend work is
 * done. It is intentionally NOT production-grade:
 *
 * - Storage is a plain in-process array — it resets on every redeploy/pod
 *   restart, and will not be consistent across multiple replicas.
 * - There is no auth beyond the shared "wall PIN" for hiding a submission.
 *
 * When the real AirQo API gains equivalent endpoints, replace the contents
 * of these functions (or the routes that call them) with calls to that API
 * — the request/response shapes here are designed to carry over unchanged.
 */

export interface CleanAirForumSelfieSubmission {
  id: string;
  eventId: string;
  imageUrl: string;
  locationName: string | null;
  pm25Value: number | null;
  aqiCategory: string | null;
  displayName: string | null;
  createdAt: string;
  hidden: boolean;
}

const MAX_SUBMISSIONS = 500;

// Survives across requests within the same server process (see caveats
// above) via a global to avoid duplication under Next.js dev hot-reload.
const globalForStore = globalThis as unknown as {
  __cleanAirForumSubmissions__?: CleanAirForumSelfieSubmission[];
};

const submissions: CleanAirForumSelfieSubmission[] =
  globalForStore.__cleanAirForumSubmissions__ ?? [];
globalForStore.__cleanAirForumSubmissions__ = submissions;

export type CreateSubmissionInput = Omit<
  CleanAirForumSelfieSubmission,
  'id' | 'createdAt' | 'hidden'
>;

export function listSubmissions(
  eventId: string,
): CleanAirForumSelfieSubmission[] {
  return submissions
    .filter(
      (submission) => submission.eventId === eventId && !submission.hidden,
    )
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
}

export function createSubmission(
  input: CreateSubmissionInput,
): CleanAirForumSelfieSubmission {
  const submission: CleanAirForumSelfieSubmission = {
    ...input,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    hidden: false,
  };

  submissions.unshift(submission);
  if (submissions.length > MAX_SUBMISSIONS) {
    submissions.length = MAX_SUBMISSIONS;
  }

  return submission;
}

export function hideSubmission(
  id: string,
): CleanAirForumSelfieSubmission | null {
  const submission = submissions.find((item) => item.id === id);
  if (!submission) return null;

  submission.hidden = true;
  return submission;
}

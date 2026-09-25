import { render, screen, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { CohortSlugAvailabilityHint } from "./cohort-slug-availability-hint";
import { useCohortSlugAvailability } from "@/core/hooks/useCohorts";
import type { CohortSlugCheckResponse } from "@/app/types/cohorts";

vi.mock("@/core/hooks/useCohorts", () => ({
  useCohortSlugAvailability: vi.fn(),
}));

type HookResult = ReturnType<typeof useCohortSlugAvailability>;

function mockCheck(result: Partial<HookResult>) {
  vi.mocked(useCohortSlugAvailability).mockReturnValue({
    data: undefined,
    error: null,
    isFetching: false,
    ...result,
  } as HookResult);
}

function check(
  slug_check: CohortSlugCheckResponse["slug_check"]
): CohortSlugCheckResponse {
  return { success: true, message: "checked cohort_slug availability", slug_check };
}

async function settleDebounce() {
  await act(async () => {
    vi.advanceTimersByTime(500);
  });
}

describe("CohortSlugAvailabilityHint", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("renders nothing for a blank slug", async () => {
    mockCheck({});
    render(<CohortSlugAvailabilityHint slug="   " />);
    await settleDebounce();

    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });

  it("passes the debounced slug and group slug to the availability hook", async () => {
    mockCheck({});
    const { rerender } = render(<CohortSlugAvailabilityHint slug="" groupSlug="kcca" />);
    rerender(<CohortSlugAvailabilityHint slug=" Nairobi CBD " groupSlug="kcca" />);

    expect(useCohortSlugAvailability).toHaveBeenLastCalledWith("", { groupSlug: "kcca" });
    await settleDebounce();
    expect(useCohortSlugAvailability).toHaveBeenLastCalledWith("Nairobi CBD", {
      groupSlug: "kcca",
    });
  });

  it("shows the sanitised candidate when it is available", async () => {
    mockCheck({ data: check({ candidate_slug: "kcca-nairobi-cbd", available: true, reason: null }) });
    render(<CohortSlugAvailabilityHint slug="Nairobi CBD" groupSlug="kcca" />);
    await settleDebounce();

    expect(screen.getByRole("status")).toHaveTextContent("kcca-nairobi-cbd is available.");
  });

  it.each([
    ["taken", /already in use/],
    ["reserved", /reserved/],
    ["too_short", /at least 3 letters or numbers/],
    ["objectid_shape", /system-generated ID/],
  ] as const)("explains why a slug is unavailable (%s)", async (reason, copy) => {
    mockCheck({ data: check({ candidate_slug: "admin", available: false, reason }) });
    render(<CohortSlugAvailabilityHint slug="admin" />);
    await settleDebounce();

    expect(screen.getByRole("status")).toHaveTextContent(copy);
  });

  it("stays silent when the lookup fails so it never blocks creation", async () => {
    mockCheck({ error: new Error("Network Error") as unknown as HookResult["error"] });
    render(<CohortSlugAvailabilityHint slug="nairobi" />);
    await settleDebounce();

    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });
});

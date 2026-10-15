"use client"

import { useEffect, useState } from "react"
import { diagnosticsService } from "@/services/diagnosticsService"
import { findProfileForCategory, getProfileStatusField, type ProfileStatusField } from "@/lib/status-codes"
import type { DeviceProfile, StatusCodeSet } from "@/types/diagnostics"

// Profiles and sets change rarely, so each is fetched once per session and shared by every page.
let profilesRequest: Promise<DeviceProfile[]> | null = null
const setRequests = new Map<string, Promise<StatusCodeSet | null>>()

const loadProfiles = () => {
  profilesRequest ??= diagnosticsService.getProfiles({ limit: 500 }).catch((error) => {
    profilesRequest = null
    throw error
  })
  return profilesRequest
}

const loadSet = (name: string) => {
  let request = setRequests.get(name)
  if (!request) {
    // A set the profile names but that doesn't exist reads as "not linked" rather than an error.
    request = diagnosticsService.getStatusCodeSet(name).catch((error) => {
      setRequests.delete(name)
      if (error?.status === 404) return null
      throw error
    })
    setRequests.set(name, request)
  }
  return request
}

/** Forget cached profiles and sets, e.g. after a set is edited or a profile is linked to one. */
export function clearStatusCodeSetCache() {
  profilesRequest = null
  setRequests.clear()
}

interface CategoryStatusCodeSet {
  /** The set linked to the category's profile, or null when none is linked (or it doesn't exist). */
  codeSet: StatusCodeSet | null
  /** Name the profile links to, even when that set couldn't be loaded. */
  setName: string | null
  /** The profile's linked telemetry slot (e.g. field6), so callers read the right raw field. */
  statusField: ProfileStatusField | null
  profileName: string | null
  loading: boolean
  error: string | null
}

const EMPTY: Omit<CategoryStatusCodeSet, "loading"> = {
  codeSet: null,
  setName: null,
  statusField: null,
  profileName: null,
  error: null,
}

/**
 * The status code set for a device category, resolved the way beacon-api resolves profiles:
 * category → profile of the same name (or a legacy alias) → its status field's
 * `status_code_set` → the set. Pass null while the category isn't known yet.
 */
export function useCategoryStatusCodeSet(category: string | null): CategoryStatusCodeSet {
  const [state, setState] = useState<CategoryStatusCodeSet>({ ...EMPTY, loading: category !== null })

  useEffect(() => {
    if (category === null) {
      setState({ ...EMPTY, loading: false })
      return
    }
    let cancelled = false
    setState((current) => ({ ...current, loading: true, error: null }))

    const resolve = async () => {
      try {
        const profile = findProfileForCategory(await loadProfiles(), category)
        const statusField = getProfileStatusField(profile)
        const codeSet = statusField ? await loadSet(statusField.setName) : null
        if (!cancelled) {
          setState({
            codeSet,
            setName: statusField?.setName ?? null,
            statusField,
            profileName: profile?.name ?? null,
            loading: false,
            error: null,
          })
        }
      } catch (error: any) {
        if (!cancelled) setState({ ...EMPTY, loading: false, error: error?.message || "Failed to load status codes" })
      }
    }

    resolve()
    return () => {
      cancelled = true
    }
  }, [category])

  return state
}

import { cleanAirForum2026GuestSessionPath } from '@/features/clean-air-forum-2026/constants/learn';
import {
  CLEAN_AIR_FORUM_2026_DEVICE_ID_STORAGE_KEY,
  CLEAN_AIR_FORUM_2026_GUEST_ID_STORAGE_KEY,
  CLEAN_AIR_FORUM_2026_GUEST_NAME_STORAGE_KEY,
} from '@/features/clean-air-forum-2026/constants/storage';
import type { CleanAirForum2026GuestSessionResponse } from '@/features/clean-air-forum-2026/types/learn';
import type { CleanAirForum2026GuestSession } from '@/features/clean-air-forum-2026/types/quiz';

function readLocalStorage(key: string) {
  return window.localStorage.getItem(key);
}

function writeLocalStorage(key: string, value: string) {
  window.localStorage.setItem(key, value);
}

function isUuidV4(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value,
  );
}

function createDeviceId() {
  if (
    typeof crypto !== 'undefined' &&
    typeof crypto.randomUUID === 'function'
  ) {
    return crypto.randomUUID();
  }

  return `caf-2026-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function getOrCreateCleanAirForum2026DeviceId() {
  const storedDeviceId = readLocalStorage(
    CLEAN_AIR_FORUM_2026_DEVICE_ID_STORAGE_KEY,
  );

  if (storedDeviceId && isUuidV4(storedDeviceId)) {
    return storedDeviceId;
  }

  const deviceId = createDeviceId();
  writeLocalStorage(CLEAN_AIR_FORUM_2026_DEVICE_ID_STORAGE_KEY, deviceId);
  return deviceId;
}

export function getStoredCleanAirForum2026GuestSession(): CleanAirForum2026GuestSession | null {
  const deviceId = readLocalStorage(CLEAN_AIR_FORUM_2026_DEVICE_ID_STORAGE_KEY);
  const guestId = readLocalStorage(CLEAN_AIR_FORUM_2026_GUEST_ID_STORAGE_KEY);
  const displayName = readLocalStorage(
    CLEAN_AIR_FORUM_2026_GUEST_NAME_STORAGE_KEY,
  );

  if (!deviceId) {
    return null;
  }

  return {
    deviceId,
    guestId,
    displayName,
  };
}

export async function initializeCleanAirForum2026GuestSession(
  signal?: AbortSignal,
): Promise<CleanAirForum2026GuestSession> {
  const existingSession = getStoredCleanAirForum2026GuestSession();

  if (existingSession?.guestId) {
    return existingSession;
  }

  const deviceId =
    existingSession?.deviceId || getOrCreateCleanAirForum2026DeviceId();

  const response = await fetch(cleanAirForum2026GuestSessionPath, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({
      device_id: deviceId,
    }),
    signal,
  });

  if (!response.ok) {
    throw new Error(`Guest session request failed with ${response.status}`);
  }

  const payload =
    (await response.json()) as CleanAirForum2026GuestSessionResponse;

  writeLocalStorage(CLEAN_AIR_FORUM_2026_DEVICE_ID_STORAGE_KEY, deviceId);

  if (payload.guest_id) {
    writeLocalStorage(
      CLEAN_AIR_FORUM_2026_GUEST_ID_STORAGE_KEY,
      payload.guest_id,
    );
  }

  if (payload.display_name) {
    writeLocalStorage(
      CLEAN_AIR_FORUM_2026_GUEST_NAME_STORAGE_KEY,
      payload.display_name,
    );
  }

  return {
    deviceId,
    guestId: payload.guest_id ?? null,
    displayName: payload.display_name ?? null,
  };
}

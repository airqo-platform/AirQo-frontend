import { cleanAirForum2026GuestSessionPath } from '@/features/clean-air-forum-2026/constants/learn';
import { CLEAN_AIR_FORUM_2026_EVENT_ID } from '@/features/clean-air-forum-2026/constants/learn';
import {
  CLEAN_AIR_FORUM_2026_DEVICE_ID_STORAGE_KEY,
  CLEAN_AIR_FORUM_2026_GUEST_AVATAR_ICON_STORAGE_KEY,
  CLEAN_AIR_FORUM_2026_GUEST_AVATAR_IMAGE_URL_STORAGE_KEY,
  CLEAN_AIR_FORUM_2026_GUEST_EVENT_ID_STORAGE_KEY,
  CLEAN_AIR_FORUM_2026_GUEST_ID_STORAGE_KEY,
  CLEAN_AIR_FORUM_2026_GUEST_NAME_STORAGE_KEY,
  CLEAN_AIR_FORUM_2026_GUEST_USERNAME_STORAGE_KEY,
  CLEAN_AIR_FORUM_2026_QUIZ_ANSWERS_STORAGE_KEY,
  CLEAN_AIR_FORUM_2026_QUIZ_COMPLETED_STORAGE_KEY,
  CLEAN_AIR_FORUM_2026_QUIZ_INDEX_STORAGE_KEY,
} from '@/features/clean-air-forum-2026/constants/storage';
import type { CleanAirForum2026GuestSessionResponse } from '@/features/clean-air-forum-2026/types/learn';
import type { CleanAirForum2026GuestSession } from '@/features/clean-air-forum-2026/types/quiz';

function readLocalStorage(key: string) {
  return window.localStorage.getItem(key);
}

function writeLocalStorage(key: string, value: string) {
  window.localStorage.setItem(key, value);
}

function removeLocalStorage(key: string) {
  window.localStorage.removeItem(key);
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

  if (storedDeviceId) {
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
  const avatarIcon = readLocalStorage(
    CLEAN_AIR_FORUM_2026_GUEST_AVATAR_ICON_STORAGE_KEY,
  );
  const avatarImageUrl = readLocalStorage(
    CLEAN_AIR_FORUM_2026_GUEST_AVATAR_IMAGE_URL_STORAGE_KEY,
  );
  const username = readLocalStorage(
    CLEAN_AIR_FORUM_2026_GUEST_USERNAME_STORAGE_KEY,
  );
  const eventId = readLocalStorage(
    CLEAN_AIR_FORUM_2026_GUEST_EVENT_ID_STORAGE_KEY,
  );

  if (!deviceId) {
    return null;
  }

  return {
    deviceId,
    guestId: guestId ?? null,
    displayName: displayName ?? null,
    avatarIcon: avatarIcon ?? null,
    avatarImageUrl: avatarImageUrl ?? null,
    username: username ?? null,
    eventId: eventId ?? null,
  };
}

type InitializeGuestSessionOptions = {
  username?: string | null;
  eventId?: string | null;
  signal?: AbortSignal;
};

export async function initializeCleanAirForum2026GuestSession(
  options: InitializeGuestSessionOptions = {},
): Promise<CleanAirForum2026GuestSession> {
  const { username, eventId = CLEAN_AIR_FORUM_2026_EVENT_ID, signal } = options;
  const existingSession = getStoredCleanAirForum2026GuestSession();

  if (
    existingSession?.guestId &&
    (!username || existingSession.username === username) &&
    (!eventId || existingSession.eventId === eventId)
  ) {
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
      ...(username ? { username } : {}),
      ...(eventId ? { event_id: eventId } : {}),
    }),
    signal,
  });

  if (!response.ok) {
    let errorMessage = `Guest session request failed with ${response.status}`;

    try {
      const errorPayload = (await response.json()) as {
        errors?: {
          username?: string;
        };
        message?: string;
      };

      errorMessage =
        errorPayload.errors?.username || errorPayload.message || errorMessage;
    } catch {
      // Keep the fallback error message when the body is not JSON.
    }

    throw new Error(errorMessage);
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

  if (payload.avatar_icon) {
    writeLocalStorage(
      CLEAN_AIR_FORUM_2026_GUEST_AVATAR_ICON_STORAGE_KEY,
      payload.avatar_icon,
    );
  }

  if (payload.avatar_image_url) {
    writeLocalStorage(
      CLEAN_AIR_FORUM_2026_GUEST_AVATAR_IMAGE_URL_STORAGE_KEY,
      payload.avatar_image_url,
    );
  }

  if (payload.username) {
    writeLocalStorage(
      CLEAN_AIR_FORUM_2026_GUEST_USERNAME_STORAGE_KEY,
      payload.username,
    );
  }

  if (payload.event_id) {
    writeLocalStorage(
      CLEAN_AIR_FORUM_2026_GUEST_EVENT_ID_STORAGE_KEY,
      payload.event_id,
    );
  }

  return {
    deviceId,
    guestId: payload.guest_id ?? null,
    displayName: payload.display_name ?? null,
    avatarIcon: payload.avatar_icon ?? null,
    avatarImageUrl: payload.avatar_image_url ?? null,
    username: payload.username ?? username ?? null,
    eventId: payload.event_id ?? eventId ?? null,
  };
}

export function markCleanAirForum2026ParticipantComplete() {
  writeLocalStorage(CLEAN_AIR_FORUM_2026_QUIZ_COMPLETED_STORAGE_KEY, 'true');
}

export function hasCompletedCleanAirForum2026ParticipantSession() {
  return (
    readLocalStorage(CLEAN_AIR_FORUM_2026_QUIZ_COMPLETED_STORAGE_KEY) === 'true'
  );
}

export function resetCleanAirForum2026ParticipantSession() {
  removeLocalStorage(CLEAN_AIR_FORUM_2026_DEVICE_ID_STORAGE_KEY);
  removeLocalStorage(CLEAN_AIR_FORUM_2026_GUEST_ID_STORAGE_KEY);
  removeLocalStorage(CLEAN_AIR_FORUM_2026_GUEST_NAME_STORAGE_KEY);
  removeLocalStorage(CLEAN_AIR_FORUM_2026_GUEST_AVATAR_ICON_STORAGE_KEY);
  removeLocalStorage(CLEAN_AIR_FORUM_2026_GUEST_AVATAR_IMAGE_URL_STORAGE_KEY);
  removeLocalStorage(CLEAN_AIR_FORUM_2026_GUEST_USERNAME_STORAGE_KEY);
  removeLocalStorage(CLEAN_AIR_FORUM_2026_GUEST_EVENT_ID_STORAGE_KEY);
  removeLocalStorage(CLEAN_AIR_FORUM_2026_QUIZ_COMPLETED_STORAGE_KEY);

  window.sessionStorage.removeItem(
    CLEAN_AIR_FORUM_2026_QUIZ_ANSWERS_STORAGE_KEY,
  );
  window.sessionStorage.removeItem(CLEAN_AIR_FORUM_2026_QUIZ_INDEX_STORAGE_KEY);
}

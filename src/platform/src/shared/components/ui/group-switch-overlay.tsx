'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import {
  selectActiveGroup,
  selectPendingGroupSwitch,
} from '@/shared/store/selectors';
import { clearPendingGroupSwitch } from '@/shared/store/userSlice';
import { LoadingOverlay } from './loading-overlay';

const GROUP_SWITCH_FAILSAFE_MS = 15000;

const normalizePath = (value?: string | null) => {
  const normalized = (value || '/').split('?')[0].replace(/\/+$/, '');
  return normalized || '/';
};

const matchesDestinationPath = (pathname: string, destinationPath: string) => {
  const currentPath = normalizePath(pathname).toLowerCase();
  const targetPath = normalizePath(destinationPath).toLowerCase();

  return currentPath === targetPath || currentPath.startsWith(`${targetPath}/`);
};

export function GroupSwitchOverlay() {
  const dispatch = useDispatch();
  const pathname = usePathname();
  const activeGroup = useSelector(selectActiveGroup);
  const pendingGroupSwitch = useSelector(selectPendingGroupSwitch);

  const hasReachedDestination =
    !!pendingGroupSwitch &&
    activeGroup?.id === pendingGroupSwitch.targetGroupId &&
    matchesDestinationPath(pathname, pendingGroupSwitch.destinationPath);

  useEffect(() => {
    if (!pendingGroupSwitch) {
      return;
    }

    if (hasReachedDestination) {
      const releaseTimer = window.setTimeout(() => {
        dispatch(clearPendingGroupSwitch());
      }, 120);

      return () => window.clearTimeout(releaseTimer);
    }

    const startedAt = Date.parse(pendingGroupSwitch.startedAt);
    if (!Number.isFinite(startedAt)) {
      return;
    }

    const elapsedMs = Date.now() - startedAt;
    const remainingMs = GROUP_SWITCH_FAILSAFE_MS - elapsedMs;

    if (remainingMs <= 0) {
      dispatch(clearPendingGroupSwitch());
      return;
    }

    const failsafeTimer = window.setTimeout(() => {
      dispatch(clearPendingGroupSwitch());
    }, remainingMs);

    return () => window.clearTimeout(failsafeTimer);
  }, [dispatch, hasReachedDestination, pendingGroupSwitch, pathname]);

  if (!pendingGroupSwitch) {
    return null;
  }

  return (
    <LoadingOverlay
      delayMs={0}
      title={`Switching to ${pendingGroupSwitch.targetGroupName}`}
      description="Updating your workspace, and opening fresh content."
    />
  );
}

export default GroupSwitchOverlay;

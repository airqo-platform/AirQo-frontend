'use client';

import React, {
  createContext,
  useContext,
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useRef,
} from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useSession } from 'next-auth/react';
import { usePathname, useRouter } from 'next/navigation';
import PropTypes from 'prop-types';

import { getOrganizationBySlugApi } from '@/core/apis/Organizations';
import {
  setActiveGroup as setActiveGroupAction,
  selectActiveGroup,
  selectUserGroups,
  fetchUserGroups,
  fetchGroupDetails,
} from '@/lib/store/services/groups';
import { replaceUserPreferences } from '@/lib/store/services/account/UserDefaultsSlice';
import {
  setOrganizationName,
  setChartSites,
  resetChartStore,
} from '@/lib/store/services/charts/ChartSlice';

import { isAirQoGroup, titleToSlug } from '@/core/utils/organizationUtils';
import LoadingSpinner from '@/components/LoadingSpinner';
import OrganizationNotFound from '@/components/Organization/OrganizationNotFound';
import logger from '@/lib/logger';

/* -------------------------------------------------------------------------- */
/*                              Context                                       */
/* -------------------------------------------------------------------------- */
const ctx = createContext(null);

/* -------------------------------------------------------------------------- */
/*                           Pure helpers                                     */
/* -------------------------------------------------------------------------- */
const extractOrgSlug = (pathname) =>
  pathname?.match?.(/\/org\/([^/]+)/)?.[1] ?? null;
const groupRoute = (group) => {
  if (!group || isAirQoGroup(group)) return '/user/Home';
  const slug = group.organization_slug || titleToSlug(group.grp_title);
  if (!slug || slug === 'default') {
    logger.warn('Invalid slug for non-AirQo group', { group });
    return '/user/Home';
  }
  return `/org/${slug}/dashboard`;
};

const findGroupBySlug = (groups, slug) =>
  groups?.find?.((g) => {
    if (isAirQoGroup(g)) return false;
    return (
      (g.organization_slug || g.grp_slug || titleToSlug(g.grp_title)) === slug
    );
  });

/* -------------------------------------------------------------------------- */
/*                         Local state reducer                                */
/* -------------------------------------------------------------------------- */
const init = () => ({
  isLoading: false,
  error: null,
  isSwitching: false,
  initialGroupSet: false,

  organization: null,
  organizationTheme: null,
  organizationLoading: false,
  organizationError: null,
  organizationInitialized: false,
});

const reducer = (s, a) => {
  switch (a.type) {
    case 'startGroups':
      return { ...s, isLoading: true, error: null };
    case 'endGroups':
      return { ...s, isLoading: false, error: a.error };
    case 'startSwitch':
      return { ...s, isSwitching: true };
    case 'endSwitch':
      return { ...s, isSwitching: false };
    case 'setInitial':
      return { ...s, initialGroupSet: true };
    case 'startOrg':
      return { ...s, organizationLoading: true, organizationError: null };
    case 'endOrg':
      return {
        ...s,
        organizationLoading: false,
        organizationError: a.error,
        organizationInitialized: true,
        organization: a.org,
        organizationTheme: a.theme,
      };
    default:
      return s;
  }
};

/* -------------------------------------------------------------------------- */
/*                              Provider                                      */
/* -------------------------------------------------------------------------- */
export function UnifiedGroupProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, null, init);
  const rdxDispatch = useDispatch();
  const { data: session } = useSession();
  const pathname = usePathname();
  const router = useRouter();

  /* ---------------------------- Selectors & refs ---------------------------- */
  const activeGroup = useSelector(selectActiveGroup);
  const userGroups = useSelector(selectUserGroups);

  const lock = useRef(false);
  const abortRef = useRef(null);
  const minLoadMs = 400;

  /* ---------------------------- Flags --------------------------------------- */
  const organizationSlug = useMemo(() => extractOrgSlug(pathname), [pathname]);
  const isOrganizationContext = Boolean(organizationSlug);

  /* ---------------------------- Core logic ---------------------------------- */
  const refreshGroups = useCallback(
    async (force = false) => {
      if (!session?.user?.id || (!force && state.isLoading) || lock.current)
        return;
      lock.current = true;
      dispatch({ type: 'startGroups' });
      try {
        if (!userGroups.length || force)
          await rdxDispatch(fetchUserGroups(session.user.id)).unwrap();
      } catch (e) {
        logger.error('refreshGroups', e);
        dispatch({ type: 'endGroups', error: e.message });
      } finally {
        lock.current = false;
        dispatch({ type: 'endGroups' });
      }
    },
    [rdxDispatch, session?.user?.id, userGroups.length, state.isLoading],
  );

  const setActiveGroupAtomic = useCallback(
    (group, reason) => {
      if (!group || lock.current) return;
      logger.info('setActiveGroupAtomic', { group: group.grp_title, reason });
      lock.current = true;
      rdxDispatch(setActiveGroupAction(group));
      rdxDispatch(setOrganizationName(group.grp_title));
      dispatch({ type: 'setInitial' });
      lock.current = false;
    },
    [rdxDispatch],
  );

  const switchToGroup = useCallback(
    async (target, opts = {}) => {
      const { navigate = true } = opts;
      if (
        !target ||
        !session?.user?.id ||
        state.isSwitching ||
        lock.current ||
        activeGroup?._id === target._id
      )
        return { success: false, error: 'Invalid or duplicate' };

      lock.current = true;
      dispatch({ type: 'startSwitch' });

      try {
        const isAirQo = isAirQoGroup(target);
        const route = groupRoute(target);

        rdxDispatch(setActiveGroupAction(target));
        rdxDispatch(setOrganizationName(target.grp_title));
        rdxDispatch(setChartSites([]));
        if (!isAirQo) rdxDispatch(resetChartStore());

        if (navigate) await router.push(route);

        await rdxDispatch(
          replaceUserPreferences({
            user_id: session.user.id,
            group_id: target._id,
          }),
        );
        if (opts.fetchDetails) await rdxDispatch(fetchGroupDetails(target._id));

        return { success: true, targetRoute: route };
      } catch (e) {
        logger.error('switchToGroup', e);
        return { success: false, error: e.message };
      } finally {
        lock.current = false;
        dispatch({ type: 'endSwitch' });
      }
    },
    [rdxDispatch, session?.user?.id, activeGroup, state.isSwitching, router],
  );

  const setActiveGroupById = useCallback(
    (id, opts) =>
      switchToGroup(
        userGroups.find((g) => g._id === id),
        opts,
      ),
    [userGroups, switchToGroup],
  );

  const canSwitchToGroup = useCallback(
    (g) => userGroups.some((x) => x._id === g._id),
    [userGroups],
  );

  /* -------------------------- Effects -------------------------------------- */
  useEffect(() => {
    if (session?.user?.id && !userGroups.length) refreshGroups();
  }, [session?.user?.id, userGroups.length, refreshGroups]);

  useEffect(() => {
    if (!userGroups.length || state.initialGroupSet || lock.current) return;

    let target = null;
    if (isOrganizationContext && organizationSlug)
      target = findGroupBySlug(userGroups, organizationSlug);
    else if (session?.user?.activeGroup)
      target = userGroups.find((g) => g._id === session.user.activeGroup._id);

    if (!target) target = userGroups.find(isAirQoGroup) ?? userGroups[0];

    if (target) setActiveGroupAtomic(target, 'auto');
  }, [
    userGroups,
    organizationSlug,
    isOrganizationContext,
    session?.user?.activeGroup,
    state.initialGroupSet,
    setActiveGroupAtomic,
  ]);

  /* Load or clear organization data ----------------------------------------- */
  useEffect(() => {
    if (!isOrganizationContext || !organizationSlug) {
      if (state.organization || state.organizationLoading)
        dispatch({ type: 'endOrg' });
      return;
    }

    abortRef.current?.abort?.();
    abortRef.current = new AbortController();
    const { signal } = abortRef.current;

    dispatch({ type: 'startOrg' });

    const start = Date.now();
    getOrganizationBySlugApi(organizationSlug, { signal })
      .then((res) => {
        if (signal.aborted) return;
        const elapsed = Date.now() - start;
        const wait = Math.max(0, minLoadMs - elapsed);

        const org = res.success ? res.data : null;
        const theme = org
          ? {
              name: org.name,
              logo: org.logo,
              primaryColor: org.primaryColor,
              secondaryColor: org.secondaryColor,
              font: org.font,
            }
          : null;

        setTimeout(
          () =>
            dispatch({
              type: 'endOrg',
              org,
              theme,
              error: res.success ? null : res.message || 'Not found',
            }),
          wait,
        );
      })
      .catch((e) => {
        if (!signal.aborted) dispatch({ type: 'endOrg', error: e.message });
      });
  }, [organizationSlug, isOrganizationContext]);

  useEffect(() => () => abortRef.current?.abort?.(), []);

  /* -------------------------- Render --------------------------------------- */
  const value = useMemo(
    () => ({
      ...state,
      activeGroup,
      userGroups,
      setActiveGroupById,
      switchToGroup,
      refreshGroups,
      isOrganizationContext,
      organizationSlug,
      isAdminContext: pathname?.startsWith?.('/admin'),
      getGroupRoute: groupRoute,
      canSwitchToGroup,
      primaryColor:
        state.organizationTheme?.primaryColor ||
        state.organization?.primaryColor ||
        '#135DFF',
      secondaryColor:
        state.organizationTheme?.secondaryColor ||
        state.organization?.secondaryColor ||
        '#1B2559',
      logo:
        state.organizationTheme?.logo ||
        state.organization?.logo ||
        '/icons/airqo_logo.svg',
    }),
    [
      state,
      activeGroup,
      userGroups,
      setActiveGroupById,
      switchToGroup,
      refreshGroups,
      isOrganizationContext,
      organizationSlug,
      pathname,
      canSwitchToGroup,
    ],
  );

  /* Show loader until theme is complete or error/404 ---------------------------- */
  const themeComplete =
    state.organizationTheme?.primaryColor &&
    state.organizationTheme?.secondaryColor &&
    state.organizationTheme?.logo;

  const showLoader =
    isOrganizationContext &&
    (state.organizationLoading ||
      (!themeComplete && !state.organizationError && state.organization));

  if (showLoader)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner size="lg" text="Loading organization…" />
      </div>
    );

  if (
    isOrganizationContext &&
    state.organizationInitialized &&
    (!state.organization || state.organizationError)
  )
    return <OrganizationNotFound orgSlug={organizationSlug} />;

  return <ctx.Provider value={value}>{children}</ctx.Provider>;
}

UnifiedGroupProvider.propTypes = { children: PropTypes.node.isRequired };

/* -------------------------------------------------------------------------- */
/*                              Public hooks                                  */
/* -------------------------------------------------------------------------- */
export const useUnifiedGroup = () => {
  const v = useContext(ctx);
  if (!v)
    throw new Error('useUnifiedGroup must be used within UnifiedGroupProvider');
  return v;
};

/* Legacy hooks (unchanged API) */
export const useGetActiveGroup = () => {
  const { activeGroup, userGroups, isLoading, error } = useUnifiedGroup();
  const { data: session } = useSession();
  return {
    loading: isLoading,
    error,
    id: activeGroup?._id || null,
    title: activeGroup?.grp_title || null,
    userID: session?.user?.id || null,
    groupList: userGroups,
    activeGroup,
  };
};

export const useOrganization = () => {
  const {
    organization,
    organizationTheme,
    organizationLoading,
    organizationError,
    organizationInitialized,
    isOrganizationContext,
    primaryColor,
    secondaryColor,
    logo,
  } = useUnifiedGroup();

  if (!isOrganizationContext)
    throw new Error('useOrganization must be used within /org/ context');

  return {
    organization,
    theme: organizationTheme,
    isLoading: organizationLoading,
    error: organizationError,
    isInitialized: organizationInitialized,
    primaryColor,
    secondaryColor,
    logo,
    getDisplayName: () =>
      organization?.parent
        ? `${organization.parent.name} - ${organization.name}`
        : organization?.name || organization?.grp_title || 'AirQo',
    canUserRegister: () =>
      organization?.settings?.allowSelfRegistration || false,
    requiresApproval: () => organization?.settings?.requireApproval || false,
  };
};

export default UnifiedGroupProvider;

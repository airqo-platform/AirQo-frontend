import { useQueryClient } from "@tanstack/react-query";
import { useDispatch } from "react-redux";
import { users } from "../apis/users";
import {
  setUserDetails,
  setActiveNetwork,
  setActiveGroup,
  setAvailableNetworks,
  setUserGroups,
  setInitialized,
  setUserContext,
  setContextLoading,
} from "../redux/slices/userSlice";
import { useCallback } from "react";
import type {
  Network,
  Group,
  UserDetailsResponse,
  UserDetails,
} from "@/app/types/users";
import ReusableToast from "@/components/shared/toast/ReusableToast";
import { getApiErrorMessage } from "../utils/getApiErrorMessage";
import { devices } from "../apis/devices";
import { signOut } from "next-auth/react";
import { clearSessionData } from "../utils/sessionManager";
import { Session } from "next-auth";
import logger from "@/lib/logger";

export const useAuth = () => {
  const dispatch = useDispatch();
  const queryClient = useQueryClient();

  const clearClientSession = useCallback(() => {
    clearSessionData();

    queryClient.clear();
  }, [queryClient]);

  const initializeUserSession = useCallback(async (session: Session): Promise<void> => {
    const user = session.user;

    if (!user) {
      logger.warn("Session is missing user data. Cannot initialize.");
      dispatch(setInitialized());
      dispatch(setContextLoading(false));
      return;
    }

    const basicUserInfo = {
      _id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      userName: user.userName,
      privilege: user.privilege || "",
      organization: user.organization || "",
      country: user.country || "",
      timezone: user.timezone || "",
      phoneNumber: user.phoneNumber || "",
    };

    dispatch(setUserDetails(basicUserInfo as UserDetails));

    dispatch(setInitialized());

    dispatch(setContextLoading(true));
    try {
      const userDetailsResponse = (await users.getUserDetails(user.id)) as UserDetailsResponse;
      const userInfo = userDetailsResponse.users[0];

      if (!userInfo) {
        throw new Error("Extended user details not found.");
      }

      dispatch(setUserDetails(userInfo));
      dispatch(setUserGroups(userInfo.groups || []));
      dispatch(setAvailableNetworks(userInfo.networks || []));

      localStorage.setItem("userDetails", JSON.stringify(userInfo));
      localStorage.setItem("userGroups", JSON.stringify(userInfo.groups || []));
      localStorage.setItem("availableNetworks", JSON.stringify(userInfo.networks || []));

      const isAirQoStaff = !!userInfo.email?.endsWith("@airqo.net");
      const airqoNetwork = userInfo.networks?.find(
        (network: Network) => network.net_name.toLowerCase() === "airqo"
      );
      const airqoGroup = userInfo.groups?.find(
        (group: Group) => group.grp_title.toLowerCase() === "airqo"
      );

      let defaultNetwork: Network | undefined;
      let defaultGroup: Group | undefined;

      if (isAirQoStaff) {
        defaultNetwork = airqoNetwork || userInfo.networks?.[0];
        defaultGroup = airqoGroup || userInfo.groups?.[0];
      } else {
        defaultNetwork =
          userInfo.networks?.find((n) => n.net_name.toLowerCase() !== "airqo") ||
          userInfo.networks?.[0];
        defaultGroup = userInfo.groups?.find(
          (g) => g.grp_title.toLowerCase() !== "airqo"
        );
      }

      if (defaultNetwork) {
        dispatch(setActiveNetwork(defaultNetwork));
        localStorage.setItem("activeNetwork", JSON.stringify(defaultNetwork));
      }
      if (defaultGroup) {
        dispatch(setActiveGroup(defaultGroup));
        localStorage.setItem("activeGroup", JSON.stringify(defaultGroup));
      }

      let initialUserContext: "personal" | "airqo-internal" | "external-org";
      if (defaultGroup) {
        if (defaultGroup.grp_title.toLowerCase() === "airqo" && isAirQoStaff) {
          initialUserContext = "airqo-internal";
        } else {
          initialUserContext = "external-org";
        }
      } else {
        initialUserContext = "personal";
      }

      dispatch(setUserContext(initialUserContext));
      localStorage.setItem("userContext", initialUserContext);

      dispatch(setContextLoading(false));
      
      // Prefetch initial device data in the background without blocking initialization.
      try {
        if (initialUserContext === "personal") {
          void queryClient.prefetchQuery({
            queryKey: ["my-devices", userInfo._id, defaultGroup?._id],
            queryFn: () => devices.getMyDevices(userInfo._id),
            staleTime: 300_000,
          });
        } else if (defaultGroup) {
          const resolvedNetworkName = defaultNetwork?.net_name || "";
          const resolvedGroupName = defaultGroup?.grp_title || "";

          void queryClient.prefetchQuery({
            queryKey: ["devices", resolvedNetworkName, resolvedGroupName, { page: 1, limit: 100, search: undefined, sortBy: undefined, order: undefined }],
            queryFn: () => devices.getDevicesSummaryApi({
              network: resolvedNetworkName, 
              group: resolvedGroupName,
              limit: 100,
              skip: 0,
            }),
            staleTime: 300_000,
          });
        }
      } catch {
        ReusableToast({ message: "Could not load initial device data.", type: "WARNING" });
      }

    } catch (e) {
      const error = e as Error;
      ReusableToast({
        message: `Could not load organization details: ${getApiErrorMessage(error)}`,
        type: "WARNING",
      });
      dispatch(setContextLoading(false));
    }
  }, [dispatch, queryClient]);

  const handleLogout = useCallback(() => {
    clearClientSession();
    signOut({ callbackUrl: "/login" });
  }, [clearClientSession]);

  return {
    initializeUserSession,
    logout: handleLogout,
  };
};

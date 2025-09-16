import { useQueryClient } from "@tanstack/react-query";
import { useDispatch } from "react-redux";
import { useCallback } from "react";
import { users } from "../apis/users";
import {
  setUserDetails,
  setActiveNetwork,
  setActiveGroup,
  setAvailableNetworks,
  setUserGroups,
  setInitialized,
  setUserContext,
} from "../redux/slices/userSlice";
import type {
  Network,
  Group,
  UserDetailsResponse,
} from "@/app/types/users";
import ReusableToast from "@/components/shared/toast/ReusableToast";
import { getApiErrorMessage } from "../utils/getApiErrorMessage";
import { devices } from "../apis/devices";
import { signOut } from "next-auth/react";
import { clearSessionData } from "../utils/sessionManager";

export const useAuth = () => {
  const dispatch = useDispatch();
  const queryClient = useQueryClient();

  const clearClientSession = useCallback(() => {
    clearSessionData();

    queryClient.clear();
  }, [queryClient]);

  const initializeUserSession = useCallback(async (userId: string) => {
    try {
      const userDetailsResponse = (await users.getUserDetails(userId)) as UserDetailsResponse;
      const userInfo = userDetailsResponse.users[0];

      if (!userInfo) {
        throw new Error("User details not found after login");
      }

      // Store details in Redux
      dispatch(setUserDetails(userInfo));
      dispatch(setUserGroups(userInfo.groups || []));
      dispatch(setAvailableNetworks(userInfo.networks || []));

      // Store details in localStorage for persistence across sessions/tabs
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

      if (initialUserContext === "personal") {
        queryClient.prefetchQuery({
          queryKey: ["my-devices", userInfo._id, defaultGroup?._id],
          queryFn: () => devices.getMyDevices(userInfo._id),
          staleTime: 300_000,
        });
      } else if (defaultGroup) {
        const resolvedNetworkName = defaultNetwork?.net_name || "";
        const resolvedGroupName = defaultGroup?.grp_title || "";

        queryClient.prefetchQuery({
          queryKey: ["devices", resolvedNetworkName, resolvedGroupName],
          queryFn: () => devices.getDevicesSummaryApi(resolvedNetworkName, resolvedGroupName),
          staleTime: 300_000,
        });
      }
    } catch (e) {
      const error = e as Error;
      ReusableToast({
        message: `Session setup failed: ${getApiErrorMessage(error)}`,
        type: "ERROR",
      });
      clearClientSession();
      signOut({ callbackUrl: '/login' });
    } finally {
      dispatch(setInitialized());
    }
  }, [dispatch, queryClient, clearClientSession]);

  const handleLogout = useCallback(() => {
    clearClientSession();
    signOut({ callbackUrl: "/login" });
  }, [clearClientSession]);

  return {
    initializeUserSession,
    logout: handleLogout,
  };
};

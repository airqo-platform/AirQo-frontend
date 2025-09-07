import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useDispatch } from "react-redux";
import { users } from "../apis/users";
import {
  setUserDetails,
  setActiveNetwork,
  setActiveGroup,
  logout,
  setAvailableNetworks,
  setUserGroups,
  setInitialized,
  setUserContext,
} from "../redux/slices/userSlice";
import type {
  LoginCredentials,
  UserDetails,
  Network,
  Group,
} from "@/app/types/users";
import { useRouter } from "next/navigation";
import ReusableToast from "@/components/shared/toast/ReusableToast";
import { getApiErrorMessage } from "../utils/getApiErrorMessage";
import { devices } from "../apis/devices";

export const useAuth = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const queryClient = useQueryClient();

  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginCredentials) => {
      const loginResponse = (await users.loginWithDetails(
        credentials
      )) as { token: string; details: UserDetails };
      const { token, details: userInfo } = loginResponse;

      if (!userInfo) {
        throw new Error("User info not found in response");
      }

      localStorage.setItem("token", token);
      localStorage.setItem("userDetails", JSON.stringify(userInfo));
      localStorage.setItem(
        "availableNetworks",
        JSON.stringify(userInfo.networks || [])
      );
      localStorage.setItem("userGroups", JSON.stringify(userInfo.groups || []));

      dispatch(setUserDetails(userInfo));
      dispatch(setUserGroups(userInfo.groups || []));
      dispatch(setAvailableNetworks(userInfo.networks || []));

      const isAirQoStaff = !!userInfo.email?.endsWith("@airqo.net");
      const airqoNetwork = userInfo.networks?.find(
        (network: Network) => network.net_name.toLowerCase() === "airqo"
      );
      const airqoGroup = userInfo.groups?.find(
        (group: Group) => group.grp_title.toLowerCase() === "airqo"
      );

      let defaultNetwork = userInfo.networks?.[0];
      let defaultGroup = userInfo.groups?.[0];

      if (isAirQoStaff && airqoNetwork) {
        defaultNetwork = airqoNetwork;
        if (airqoGroup) {
          defaultGroup = airqoGroup;
        }
      } else {
        // For non-staff, find the first non-airqo group/network if possible
        const nonAirqoNetwork = userInfo.networks?.find(
          (n) => n.net_name.toLowerCase() !== "airqo"
        );
        const nonAirqoGroup = userInfo.groups?.find(
          (g) => g.grp_title.toLowerCase() !== "airqo"
        );
        if (nonAirqoNetwork) {
          defaultNetwork = nonAirqoNetwork;
        }
        if (nonAirqoGroup) {
          defaultGroup = nonAirqoGroup;
        }
      }

      if (defaultNetwork) {
        dispatch(setActiveNetwork(defaultNetwork));
        localStorage.setItem("activeNetwork", JSON.stringify(defaultNetwork));
      }
      if (defaultGroup) {
        dispatch(setActiveGroup(defaultGroup));
        localStorage.setItem("activeGroup", JSON.stringify(defaultGroup));
      }

      return userInfo;
    },
    onSuccess: (userInfo) => {
      const isAirQoStaff = !!userInfo.email?.endsWith("@airqo.net");
      let initialUserContext: "personal" | "airqo-internal" | "external-org";
      let activeGroup: Group | undefined;

      const airqoNetwork = userInfo.networks?.find(
        (network: Network) => network.net_name.toLowerCase() === "airqo"
      );

      if (airqoNetwork) {
        const airqoGroup = userInfo.groups?.find(
          (group: Group) => group.grp_title.toLowerCase() === "airqo"
        );
        if (airqoGroup) {
          activeGroup = airqoGroup;
        }
      } else if (userInfo.groups && userInfo.groups.length > 0) {
        activeGroup = userInfo.groups[0];
      }

      if (activeGroup) {
        if (activeGroup.grp_title.toLowerCase() === "airqo" && isAirQoStaff) {
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
          queryKey: ["my-devices", userInfo._id, activeGroup?._id],
          queryFn: () => devices.getMyDevices(userInfo._id),
          staleTime: 300_000,
        });
      } else if (activeGroup) {
        const resolvedNetworkName =
          airqoNetwork?.net_name || userInfo.networks?.[0]?.net_name || "";
        const resolvedGroupName = activeGroup?.grp_title || "";

        queryClient.prefetchQuery({
          queryKey: ["devices", resolvedNetworkName, resolvedGroupName],
          queryFn: () =>
            devices.getDevicesSummaryApi(resolvedNetworkName, resolvedGroupName),
          staleTime: 300_000,
        });
      }

    },
    onError: (error) => {
      ReusableToast({
        message: `Login Failed: ${getApiErrorMessage(error)}`,
        type: "ERROR",
      });
      localStorage.removeItem("token");
      localStorage.removeItem("userDetails");
      localStorage.removeItem("activeNetwork");
      localStorage.removeItem("availableNetworks");
      localStorage.removeItem("activeGroup");
      localStorage.removeItem("userGroups");
      localStorage.removeItem("userContext");
    },
  });

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userDetails");
    localStorage.removeItem("activeNetwork");
    localStorage.removeItem("availableNetworks");
    localStorage.removeItem("activeGroup");
    localStorage.removeItem("userGroups");
    localStorage.removeItem("userContext");
    dispatch(logout());
    router.push("/login");
  };

  const restoreSession = () => {
    try {
      const token = localStorage.getItem("token");
      const storedUserDetails = localStorage.getItem("userDetails");
      const storedActiveNetwork = localStorage.getItem("activeNetwork");
      const storedAvailableNetworks = localStorage.getItem("availableNetworks");
      const storedActiveGroup = localStorage.getItem("activeGroup");
      const storedUserGroups = localStorage.getItem("userGroups");
      const storedUserContext = localStorage.getItem("userContext");

      if (token && storedUserDetails) {
        const userDetails = JSON.parse(storedUserDetails) as UserDetails;

        const safeUserDetails: UserDetails = {
          ...userDetails,
          networks: userDetails.networks || [],
          groups: userDetails.groups || [],
        };

        dispatch(setUserDetails(safeUserDetails));

        if (storedActiveNetwork) {
          const activeNetwork = JSON.parse(storedActiveNetwork) as Network;
          dispatch(setActiveNetwork(activeNetwork));
        }
        if (storedAvailableNetworks) {
          const availableNetworks = JSON.parse(
            storedAvailableNetworks
          ) as Network[];
          dispatch(setAvailableNetworks(availableNetworks));
        }
        if (storedUserGroups) {
          const userGroups = JSON.parse(storedUserGroups) as Group[];
          dispatch(setUserGroups(userGroups));
        }
        if (storedActiveGroup) {
          const activeGroup = JSON.parse(storedActiveGroup) as Group;
          dispatch(setActiveGroup(activeGroup));
        }
        if (storedUserContext) {
          const userContext = storedUserContext as 'personal' | 'airqo-internal' | 'external-org';

          const isAirQoStaff = userDetails?.email?.endsWith('@airqo.net') || false;
          if (userContext === 'airqo-internal' && !isAirQoStaff) {

            console.warn('Unauthorized context found in localStorage, resetting to personal');
            dispatch(setUserContext('personal'));
            localStorage.setItem("userContext", 'personal');
          } else {
            dispatch(setUserContext(userContext));
          }
        }
      } else {
        handleLogout();
      }
    } finally {
      dispatch(setInitialized());
    }
  };

  return {
    login: loginMutation.mutate,
    logout: handleLogout,
    isLoading: loginMutation.isPending,
    error: loginMutation.error,
    restoreSession,
  };
};

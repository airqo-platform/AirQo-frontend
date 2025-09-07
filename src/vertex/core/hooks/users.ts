import { useMutation } from "@tanstack/react-query";
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

export const useAuth = () => {
  const dispatch = useDispatch();
  const router = useRouter();

  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginCredentials) => {
      // 1. Login and get token and user details in one go
      const loginResponse = (await users.loginWithDetails(
        credentials
      )) as { token: string; details: UserDetails };
      const { token, details: userInfo } = loginResponse;

      if (!userInfo) {
        throw new Error("User info not found in response");
      }

      // 2. Store token and user details in localStorage
      localStorage.setItem("token", token);
      localStorage.setItem("userDetails", JSON.stringify(userInfo));
      localStorage.setItem(
        "availableNetworks",
        JSON.stringify(userInfo.networks || [])
      );
      localStorage.setItem("userGroups", JSON.stringify(userInfo.groups || []));

      // 3. Dispatch to Redux
      dispatch(setUserDetails(userInfo));
      dispatch(setUserGroups(userInfo.groups || []));
      dispatch(setAvailableNetworks(userInfo.networks || []));

      // 4. Set AirQo as default network and group if available
      const airqoNetwork = userInfo.networks?.find(
        (network: Network) => network.net_name.toLowerCase() === "airqo"
      );

      if (airqoNetwork) {
        dispatch(setActiveNetwork(airqoNetwork));
        localStorage.setItem("activeNetwork", JSON.stringify(airqoNetwork));

        const airqoGroup = userInfo.groups?.find(
          (group: Group) => group.grp_title.toLowerCase() === "airqo"
        );

        if (airqoGroup) {
          dispatch(setActiveGroup(airqoGroup));
          localStorage.setItem("activeGroup", JSON.stringify(airqoGroup));
        }
      } else if (userInfo.networks && userInfo.networks.length > 0) {
        dispatch(setActiveNetwork(userInfo.networks[0]));
        localStorage.setItem(
          "activeNetwork",
          JSON.stringify(userInfo.networks[0])
        );

        if (userInfo.groups && userInfo.groups.length > 0) {
          dispatch(setActiveGroup(userInfo.groups[0]));
          localStorage.setItem(
            "activeGroup",
            JSON.stringify(userInfo.groups[0])
          );
        }
      }

      return userInfo;
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
        
        // Ensure userDetails has required properties for setUserDetails
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
          
          // Validate stored context against user permissions
          const isAirQoStaff = userDetails?.email?.endsWith('@airqo.net') || false;
          if (userContext === 'airqo-internal' && !isAirQoStaff) {
            // Reset to safe default if unauthorized context is stored
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

import { useMutation } from "@tanstack/react-query";
import { useDispatch } from "react-redux";
import { jwtDecode } from "jwt-decode";
import { users } from "../apis/users";
import {
  setUserDetails,
  setActiveNetwork,
  setActiveGroup,
  logout,
  setAvailableNetworks,
  setUserGroups,
  setInitialized,
} from "../redux/slices/userSlice";
import type {
  LoginCredentials,
  DecodedToken,
  UserDetails,
  Network,
  Group,
  LoginResponse,
  UserDetailsResponse,
} from "@/app/types/users";
import { useRouter } from "next/navigation";
import { useCallback } from "react"

export const useAuth = () => {
  const dispatch = useDispatch();
  const router = useRouter();

  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginCredentials) => {
      // 1. Login and get token
      const loginResponse = (await users.loginUser(
        credentials
      )) as LoginResponse;
      const token = loginResponse.token;

      // 2. Store token
      localStorage.setItem("token", token);

      // 3. Decode token
      const decoded = jwtDecode<DecodedToken>(token);

      // 4. Create userDetails from decoded token
      const userDetails: UserDetails = {
        _id: decoded._id,
        firstName: decoded.firstName,
        lastName: decoded.lastName,
        userName: decoded.userName,
        email: decoded.email,
        organization: decoded.organization,
        long_organization: decoded.long_organization,
        privilege: decoded.privilege,
        country: decoded.country,
        profilePicture: decoded.profilePicture,
        description: decoded.description,
        timezone: decoded.timezone,
        phoneNumber: decoded.phoneNumber,
        createdAt: decoded.createdAt,
        updatedAt: decoded.updatedAt,
        rateLimit: decoded.rateLimit,
        lastLogin: decoded.lastLogin,
        iat: decoded.iat,
      };

      // 5. Store user details
      localStorage.setItem("userDetails", JSON.stringify(userDetails));

      // 6. Get user info and store in redux
      const userDetailsResponse = (await users.getUserDetails(
        loginResponse._id
      )) as UserDetailsResponse;
      const userInfo = userDetailsResponse.users[0];

      // 7. Store networks and groups
      dispatch(setUserDetails(userInfo));
      dispatch(setUserGroups(userInfo.groups || []));
      localStorage.setItem(
        "availableNetworks",
        JSON.stringify(userInfo.networks)
      );
      localStorage.setItem("userGroups", JSON.stringify(userInfo.groups));

      // 8. Set AirQo as default network and group if available
      const airqoNetwork = userInfo.networks?.find(
        (network: Network) => network.net_name.toLowerCase() === "airqo"
      );

      if (airqoNetwork) {
        dispatch(setActiveNetwork(airqoNetwork));
        localStorage.setItem("activeNetwork", JSON.stringify(airqoNetwork));

        // Find and set AirQo group if it exists
        const airqoGroup = userInfo.groups?.find(
          (group: Group) => group.grp_title.toLowerCase() === "airqo"
        );

        if (airqoGroup) {
          dispatch(setActiveGroup(airqoGroup));
          localStorage.setItem("activeGroup", JSON.stringify(airqoGroup));
        }
      } else if (userInfo?.networks && userInfo.networks.length > 0) {
        // If AirQo network not found, set first available network
        dispatch(setActiveNetwork(userInfo.networks[0]));
        localStorage.setItem(
          "activeNetwork",
          JSON.stringify(userInfo.networks[0])
        );

        // Set first available group in that network if any
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
      console.error("Login failed:", error);
      localStorage.removeItem("token");
      localStorage.removeItem("userDetails");
      localStorage.removeItem("activeNetwork");
      localStorage.removeItem("availableNetworks");
      localStorage.removeItem("activeGroup");
      localStorage.removeItem("userGroups");
    },
  });

  // Memoize the logout function to prevent recreating it on each render
  const handleLogout = useCallback(() => {
    try {
      // First dispatch the logout action to clear Redux state
      dispatch(logout())

      // Then clear localStorage
      localStorage.removeItem("token")
      localStorage.removeItem("userDetails")
      localStorage.removeItem("activeNetwork")
      localStorage.removeItem("availableNetworks")
      localStorage.removeItem("activeGroup")
      localStorage.removeItem("userGroups")

      // Finally navigate to login page
      router.push("/login")
    } catch (error) {
      console.error("Logout error:", error)
      // Force navigation to login even if there was an error
      router.push("/login")
    }
  }, [dispatch, router])

  const restoreSession = () => {
    try {
      const token = localStorage.getItem("token");
      const storedUserDetails = localStorage.getItem("userDetails");
      const storedActiveNetwork = localStorage.getItem("activeNetwork");
      const storedAvailableNetworks = localStorage.getItem("availableNetworks");
      const storedActiveGroup = localStorage.getItem("activeGroup");
      const storedUserGroups = localStorage.getItem("userGroups");

      if (token && storedUserDetails) {
        const userDetails = JSON.parse(storedUserDetails) as UserDetails;
        dispatch(setUserDetails(userDetails));

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

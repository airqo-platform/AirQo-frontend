import { useMutation } from "@tanstack/react-query";
import { useDispatch } from "react-redux";
import { jwtDecode } from "jwt-decode";
import { users } from "../apis/users";
import {
  setUserDetails,
  setActiveNetwork,
  logout,
  setAvailableNetworks,
  setInitialized,
} from "../redux/slices/userSlice";
import type {
  LoginCredentials,
  DecodedToken,
  UserDetails,
  Network,
  LoginResponse,
  UserDetailsResponse,
} from "@/app/types/users";
import { useRouter } from "next/navigation";

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
        phoneNumber: decoded.phoneNumber,
        createdAt: decoded.createdAt,
        updatedAt: decoded.updatedAt,
        rateLimit: decoded.rateLimit,
        lastLogin: decoded.lastLogin,
        iat: decoded.iat,
      };

      // 5. Store user details
      localStorage.setItem("userDetails", JSON.stringify(userDetails));

      // 7. Get user info store in redux
      const userDetailsResponse = (await users.getUserDetails(
        loginResponse._id
      )) as UserDetailsResponse;
      const userInfo = userDetailsResponse.users[0];
      dispatch(setUserDetails(userDetails));
      localStorage.setItem(
        "availableNetworks",
        JSON.stringify(userInfo.networks)
      );

      // 8. Set AirQo as default network
      const airqoNetwork = userInfo.networks?.find(
        (network: Network) => network.net_name.toLowerCase() === "airqo"
      );
      if (airqoNetwork) {
        dispatch(setActiveNetwork(airqoNetwork));
        localStorage.setItem("activeNetwork", JSON.stringify(airqoNetwork));
      } else if (userInfo?.networks && userInfo.networks.length > 0) {
        dispatch(setActiveNetwork(userInfo.networks[0]));
        localStorage.setItem(
          "activeNetwork",
          JSON.stringify(userInfo.networks[0])
        );
      }

      return userInfo;
    },
    onError: (error) => {
      console.error("Login failed:", error);
      localStorage.removeItem("token");
      localStorage.removeItem("userDetails");
      localStorage.removeItem("activeNetwork");
      localStorage.removeItem("availableNetworks");
    },
  });

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userDetails");
    localStorage.removeItem("activeNetwork");
    localStorage.removeItem("availableNetworks");
    dispatch(logout());
    router.push("/login");
  };

  // Update restoreSession to handle initialization
  const restoreSession = () => {
    try {
      const token = localStorage.getItem("token");
      const storedUserDetails = localStorage.getItem("userDetails");
      const storedActiveNetwork = localStorage.getItem("activeNetwork");
      const storedAvailableNetworks = localStorage.getItem("availableNetworks");

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
      } else {
        // logout user
        handleLogout();
      }
    } finally {
      // Always set initialized to true when done
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

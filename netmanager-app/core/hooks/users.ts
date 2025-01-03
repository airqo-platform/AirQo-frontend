import { useMutation } from "@tanstack/react-query";
import { useDispatch } from "react-redux";
import { jwtDecode } from "jwt-decode";
import { users } from "../apis/users";
import {
  setUserDetails,
  setActiveNetwork,
  logout,
} from "../redux/slices/userSlice";
import type {
  LoginCredentials,
  DecodedToken,
  UserDetails,
  Network,
  LoginResponse,
  UserDetailsResponse,
} from "@/app/types/users";

export const useAuth = () => {
  const dispatch = useDispatch();

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

      // 4. Get user details
      const userDetailsResponse = (await users.getUserDetails(
        decoded.userId
      )) as UserDetailsResponse;
      const userDetails = userDetailsResponse.users[0];

      // 5. Store user details
      localStorage.setItem("userDetails", JSON.stringify(userDetails));

      // 6. Update Redux store
      dispatch(setUserDetails(userDetails));

      // 7. Set AirQo as default network
      const airqoNetwork = userDetails.networks.find(
        (network: Network) => network.net_name.toLowerCase() === "airqo"
      );

      if (airqoNetwork) {
        dispatch(setActiveNetwork(airqoNetwork));
      }

      return userDetails;
    },
    onError: (error) => {
      console.error("Login failed:", error);
      localStorage.removeItem("token");
      localStorage.removeItem("userDetails");
    },
  });

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userDetails");
    dispatch(logout());
  };

  // Restore session on page refresh
  const restoreSession = () => {
    const token = localStorage.getItem("token");
    const storedUserDetails = localStorage.getItem("userDetails");

    if (token && storedUserDetails) {
      const userDetails = JSON.parse(storedUserDetails) as UserDetails;
      dispatch(setUserDetails(userDetails));

      const airqoNetwork = userDetails.networks.find(
        (network: Network) => network.net_name.toLowerCase() === "airqo"
      );

      if (airqoNetwork) {
        dispatch(setActiveNetwork(airqoNetwork));
      }
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

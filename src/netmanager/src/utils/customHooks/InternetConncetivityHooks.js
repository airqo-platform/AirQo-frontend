import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { updateMainAlert } from "redux/MainAlert/operations";

export function useInternetConnectivityCheck() {
  const dispatch = useDispatch();
  const [onlineStatus, setOnlineStatus] = useState(true);

  useEffect(() => {
    window.addEventListener("offline", () => {
      setOnlineStatus(false);
    });
    window.addEventListener("online", () => {
      setOnlineStatus(true);
    });

    return () => {
      window.removeEventListener("offline", () => {
        setOnlineStatus(false);
      });
      window.removeEventListener("online", () => {
        setOnlineStatus(true);
      });
    };
  }, []);

  useEffect(() => {
    if (!onlineStatus) {
      dispatch(
        updateMainAlert({
          show: true,
          message: "You are offline. Please check your internet connectivity.",
          severity: "info",
        })
      );
    } else {
      dispatch(
        updateMainAlert({
          show: false,
          message: "You are offline. Please check your internet connectivity.",
          severity: "info",
        })
      );
    }
  }, [onlineStatus]);

  return onlineStatus;
}

"use client";
import { useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

let inactivityTime: ReturnType<typeof setTimeout> | null = null;
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

const LoginCheck = () => {
  const { data: session } = useSession();
  const router = useRouter();
  const [isRedirected, setIsRedirected] = useState(false);

  const logout = () => {
    if (inactivityTime) clearTimeout(inactivityTime);
    signOut();
  };

  const resetTimer = () => {
    if (inactivityTime) clearTimeout(inactivityTime);
    inactivityTime = setTimeout(logout, 30 * 60 * 1000);
  };

  const addEventListeners = () => {
    window.addEventListener("mousemove", resetTimer);
    window.addEventListener("mousedown", resetTimer);
    window.addEventListener("keypress", resetTimer);
    window.addEventListener("touchmove", resetTimer);
  };

  const removeEventListeners = () => {
    window.removeEventListener("mousemove", resetTimer);
    window.removeEventListener("mousedown", resetTimer);
    window.removeEventListener("keypress", resetTimer);
    window.removeEventListener("touchmove", resetTimer);
  };

  useEffect(() => {
    if (session) {
      addEventListeners();
      resetTimer();
      if (!isRedirected) {
        router.push(`${BASE_URL}/report`);
        setIsRedirected(true);
      }
    } else {
      removeEventListeners();
    }

    return () => {
      if (inactivityTime) clearTimeout(inactivityTime);
      removeEventListeners();
    };
  }, [session]);

  return null;
};

export default LoginCheck;

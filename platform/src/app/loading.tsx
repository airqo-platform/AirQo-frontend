"use client";
import { RingLoader } from "react-spinners";
import { useTheme } from "next-themes";

export default function Loading() {
  const { theme } = useTheme();
  const loaderColor = theme === "dark" ? "#fff" : "#013ee6";

  return (
    <div
      className={`flex justify-center items-center h-full w-full ${
        theme === "dark" ? "bg-gray-800" : "bg-gray-100"
      }`}
    >
      <RingLoader color={loaderColor} />
    </div>
  );
}

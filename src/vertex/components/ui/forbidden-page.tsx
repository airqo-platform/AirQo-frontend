"use client";

import React from "react";
import { ForbiddenError } from "./forbidden-error";

interface ForbiddenPageProps {
  message?: string;
}

export const ForbiddenPage: React.FC<ForbiddenPageProps> = ({
  message
}) => {
  return (
    <div className="relative w-screen h-screen dark:bg-transparent overflow-x-hidden flex items-center justify-center mt-14">
      <ForbiddenError message={message} />
    </div>
  );
};

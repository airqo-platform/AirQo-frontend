"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useDispatch } from "react-redux";
import { clearForbiddenState } from "@/core/redux/slices/userSlice";
import OopsIcon from "@/public/icons/Errors/OopsIcon";

interface ForbiddenPageProps {
  message?: string;
}

export const ForbiddenPage: React.FC<ForbiddenPageProps> = ({ 
  message = "You don't have access rights to this page." 
}) => {
  const router = useRouter();
  const dispatch = useDispatch();

  const handleGoBack = () => {
    // Clear the forbidden state
    dispatch(clearForbiddenState());
    // Navigate back to previous page
    router.back();
  };

  return (
    <div className="relative w-screen h-screen dark:bg-transparent overflow-x-hidden">
      {/* Content */}
      <div className="flex flex-col justify-center items-center mt-14 w-full md:px-48 px-6">
        {/* Icon */}
        <OopsIcon className="text-primary" />

        <div className="flex flex-col justify-center items-center w-full mt-6">
          <h1 className="text-4xl md:text-[40px] font-normal w-full max-w-xl text-center text-black-900 md:leading-[56px]">
            <span className="text-primary font-bold">Oops!</span> {message}
          </h1>
          <span className="text-primary/70 mt-2">
            Reach out to your administrator if you think this is a mistake.
          </span>
          <Button
            onClick={handleGoBack}
            className="mt-6 w-64 rounded-none text-white bg-primary border border-primary hover:bg-primary/90 hover:border-primary/90 font-medium"
          >
            Go back
          </Button>
          <p className="text-center text-grey-400 py-6">
            Error code: 403 forbidden access
          </p>
        </div>
      </div>
    </div>
  );
}; 
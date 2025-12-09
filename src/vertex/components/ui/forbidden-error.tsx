"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useDispatch } from "react-redux";
import { clearForbiddenState } from "@/core/redux/slices/userSlice";
import OopsIcon from "@/public/icons/Errors/OopsIcon";
import ReusableButton from "../shared/button/ReusableButton";

export interface ForbiddenErrorProps {
    message?: string;
    onGoBack?: () => void;
    showBackButton?: boolean;
}

export const ForbiddenError: React.FC<ForbiddenErrorProps> = ({
    message = "You don't have access rights to this page.",
    onGoBack,
    showBackButton = true,
}) => {
    const router = useRouter();
    const dispatch = useDispatch();

    const handleGoBack = () => {
        if (onGoBack) {
            onGoBack();
            return;
        }

        // Default behavior
        dispatch(clearForbiddenState());
        router.back();
    };

    return (
        <div className="flex flex-col justify-center items-center w-full md:px-48 px-6">
            <OopsIcon className="text-primary" />

            <div className="flex flex-col justify-center items-center w-full mt-6">
                <h1 className="text-4xl md:text-[40px] font-normal w-full max-w-xl text-center text-black-900 md:leading-[56px]">
                    <span className="text-primary font-bold">Oops!</span> {message}
                </h1>
                <span className="text-primary/70 mt-2">
                    Reach out to your administrator if you think this is a mistake.
                </span>

                {showBackButton && (
                    <ReusableButton
                        onClick={handleGoBack}
                        className="mt-6 w-64"
                    >
                        Go back
                    </ReusableButton>
                )}

                <p className="text-center text-grey-400 py-6">
                    Error code: 403 forbidden access
                </p>
            </div>
        </div>
    );
};

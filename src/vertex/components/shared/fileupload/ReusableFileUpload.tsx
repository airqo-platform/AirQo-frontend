"use client";

import React, { useId } from "react";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { FileUp } from "lucide-react";

interface ReusableFileUploadProps {
  id?: string;
  label?: string;
  accept?: string;
  file?: File | null;
  onChange?: (file: File | null) => void;
  placeholder?: string;
  description?: string;
  error?: string;
  className?: string;
  containerClassName?: string;
}

const ReusableFileUpload: React.FC<ReusableFileUploadProps> = ({
  id,
  label,
  accept,
  file,
  onChange,
  placeholder = "Upload file",
  description,
  error,
  className,
  containerClassName,
}) => {
  const generatedId = useId();
  const inputId = id ?? `fileupload-${generatedId}`;
  const errorId = `${inputId}-error`;
  const descId = `${inputId}-desc`;

  const commonClasses =
    "flex items-center justify-center w-full rounded-xl border bg-white px-4 py-2.5 text-sm text-gray-700 transition-colors duration-150 ease-in-out dark:bg-gray-800 dark:text-gray-200 hover:border-primary/50 hover:bg-slate-50 dark:hover:bg-gray-700 pointer-events-none";

  const errorClasses = error
    ? "border-red-500 shadow-[0_0_0_1px_red]"
    : "border-gray-300 dark:border-gray-600 shadow-sm";

  return (
    <div className={cn("flex flex-col space-y-2", containerClassName)}>
      {label && (
        <Label htmlFor={inputId} className="text-sm font-medium text-gray-700 dark:text-gray-200">
          {label}
        </Label>
      )}
      <div className="relative w-full">
        <input
          id={inputId}
          type="file"
          accept={accept}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          onChange={(e) => {
            const nextFile = e.target.files?.[0] ?? null;
            onChange?.(nextFile);
            e.currentTarget.value = "";
          }}
          aria-invalid={!!error}
          aria-describedby={
            error ? errorId : description ? descId : undefined
          }
        />
        <div className={cn(commonClasses, errorClasses, className)}>
          <FileUp className="w-5 h-5 mr-2 text-blue-600" />
          <span className="text-sm font-medium text-blue-600">
            {file ? file.name : placeholder}
          </span>
        </div>
      </div>
      {error && (
        <div id={errorId} className="mt-1.5 flex items-center text-xs text-red-600 dark:text-red-400">
          <svg className="w-4 h-4 mr-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zm-4 4a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9z"
              clipRule="evenodd"
            />
          </svg>
          {error}
        </div>
      )}
      {!error && description && (
        <p id={descId} className="text-xs text-slate-500 dark:text-gray-400">
          {description}
        </p>
      )}
    </div>
  );
};

export default ReusableFileUpload;

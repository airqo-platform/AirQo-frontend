import { Loader2 } from "lucide-react";

export const LoadingOverlay = () => {
  return (
    <div className="absolute z-50 inset-0 flex items-center justify-center">
      <div
        className={`bg-white w-70 h-70 flex justify-center items-center rounded-md shadow-md p-3`}
      >
        <Loader2 size={24} className="w-8 h-8 animate-spin" />
      </div>
    </div>
  );
};
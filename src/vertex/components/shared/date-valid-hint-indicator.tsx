import { AlertTriangle } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { getDateValidHint } from "@/core/utils/status";

interface DateValidHintIndicatorProps {
  dateValidStatus?: "valid" | "future_timestamp" | "invalid_format" | "unknown";
  stopPropagation?: boolean;
}

export function DateValidHintIndicator({
  dateValidStatus,
  stopPropagation = false,
}: DateValidHintIndicatorProps) {
  const hint = getDateValidHint(dateValidStatus);
  if (!hint) return null;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            aria-label={hint.label}
            onClick={stopPropagation ? (e) => e.stopPropagation() : undefined}
            className="ml-1.5 p-0 bg-transparent border-none cursor-help text-purple-600 inline-flex items-center"
          >
            <AlertTriangle className="w-4 h-4" aria-hidden="true" />
          </button>
        </TooltipTrigger>
        <TooltipContent side="top">
          <p className="text-sm font-medium mb-1">{hint.label}</p>
          <p className="text-xs max-w-xs">{hint.description}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

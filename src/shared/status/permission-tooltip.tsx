import React from "react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip";

/*
 * Hover note on a disabled control: why it's disabled, the permission codes it
 * needs, and a docs link. Copied from vertex/components/ui/permission-tooltip.tsx
 * (used by Vertex's primary sidebar). Beacon and Nexus don't explain disabled
 * controls yet; this is the piece to use when they do.
 *
 * Unchanged apart from the import path. Note the content is hard-coded light
 * (bg-white, gray text), so it doesn't follow dark mode.
 */
interface PermissionTooltipProps {
  permission?: string;
  permissions?: string[];
  learnMoreUrl?: string;
  children: React.ReactNode;
  message?: string;
}

const PermissionTooltip: React.FC<PermissionTooltipProps> = ({
  permission,
  permissions,
  learnMoreUrl = "https://docs.airqo.net/platform/access-control", // Default docs link
  children,
  message = "You need permissions for this action.",
}) => {
  const perms = permissions || (permission ? [permission] : []);
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          {children}
        </TooltipTrigger>
        <TooltipContent className="max-w-xs bg-white border border-gray-200 shadow-lg text-sm text-gray-800 p-3 rounded-md">
          <div className="mb-2">{message}</div>
          {perms.length > 0 && (
            <div className="mb-2">
              Required permission{perms.length > 1 ? "s" : ""}: {" "}
              {perms.map((perm) => (
                <code key={perm} className="bg-gray-100 px-1 py-0.5 rounded text-xs font-mono mr-1">
                  {perm}
                </code>
              ))}
            </div>
          )}
          {learnMoreUrl && (
            <a
              href={learnMoreUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline text-xs"
            >
              Learn more
            </a>
          )}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default PermissionTooltip;

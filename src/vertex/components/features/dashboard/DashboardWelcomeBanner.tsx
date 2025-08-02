import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

const LOCAL_STORAGE_KEY = "dashboardWelcomeBannerDismissed";

const actions = [
  {
    title: "Claim and Assign Monitors",
    description:
      "Register new air quality monitors and assign them to this organization for shared visibility and control.",
    button: (
      <Button
        asChild
        variant="outline"
        size="sm"
        className="border-primary text-primary hover:bg-primary/10 hover:text-primary focus:ring-primary"
      >
        <a href="/devices/claim">Claim a Monitor</a>
      </Button>
    ),
  },
  {
    title: "Deploy Monitors to Sites",
    description:
      "Choose where your monitors go. Create a site, configure mount and power details, and track deployments across your network.",
    button: (
      <Button
        asChild
        variant="outline"
        size="sm"
        className="border-primary text-primary hover:bg-primary/10 hover:text-primary focus:ring-primary"
      >
        <a href="/devices/deploy">Deploy a Monitor</a>
      </Button>
    ),
  },
];

export default function DashboardWelcomeBanner() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const dismissed = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (dismissed === "true") setVisible(false);
  }, []);

  const handleDismiss = () => {
    setVisible(false);
    localStorage.setItem(LOCAL_STORAGE_KEY, "true");
  };

  if (!visible) return null;

  return (
    <div className="relative mb-8 rounded-xl border bg-white p-6">
      <button
        className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 focus:outline-none"
        aria-label="Dismiss welcome banner"
        onClick={handleDismiss}
      >
        <X size={20} />
      </button>
      <h2 className="mb-2 text-2xl font-bold">Manage Your Air Quality Network with Vertex</h2>
      <p className="mb-6 text-gray-700 max-w-2xl">
        Vertex helps your organization manage its air quality monitoring network with ease. From deploying monitors to tracking site performance, you&#39;re in control. Here&#39;s how to get started:
      </p>
      <div className="space-y-6">
        {actions.map((action, idx) => (
          <div
            key={idx}
            className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0 border-t first:border-t-0 pt-6 first:pt-0"
          >
            <div className="text-left">
              <div className="font-semibold text-base mb-1">{action.title}</div>
              <div className="text-gray-600 text-sm max-w-xl">{action.description}</div>
            </div>
            <div className="mt-2 sm:mt-0 sm:ml-8 flex-shrink-0 flex justify-start sm:justify-end">
              {action.button}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 
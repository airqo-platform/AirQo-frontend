"use client";

import { useDevices } from "@/core/hooks/useDevices";
import { Loader2, Activity, Clock, AlertTriangle, Sun, Power, Zap, ChevronLeft, ChevronRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

interface StatCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  description?: string;
}

const StatCard = ({ title, value, icon, description }: StatCardProps) => (
  <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-primary/5 transition-colors">
    <div className="p-2 bg-primary/10 rounded-lg shrink-0">
      {icon}
    </div>
    <div className="min-w-0">
      <p className="text-sm text-muted-foreground">{title}</p>
      <p className="text-xl font-semibold">{value}</p>
      {description && (
        <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
      )}
    </div>
  </div>
);

export function StatusSummary() {
  const { stats, isLoading } = useDevices();
  const [isCollapsed, setIsCollapsed] = useState(false);

  if (isLoading) {
    return (
      <Card className="p-4 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm">
        <div className="flex justify-center">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      </Card>
    );
  }

  return (
    <div className="relative">
      <motion.div
        initial={false}
        animate={{ 
          x: isCollapsed ? -280 : 0,
          opacity: isCollapsed ? 0 : 1
        }}
        transition={{ duration: 0.3 }}
      >
        <Card className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm shadow-lg divide-y divide-border w-[280px]">
          <div className="p-4">
            <h2 className="font-semibold mb-3">Device Status</h2>
            <StatCard
              title="Total Devices"
              value={stats.total}
              icon={<Activity className="h-5 w-5" />}
              description={`${stats.online} online, ${stats.offline} offline`}
            />
          </div>

          <div className="p-4">
            <h2 className="font-semibold mb-3">Maintenance</h2>
            <div>
              <StatCard
                title="Due Maintenance"
                value={stats.maintenance.due}
                icon={<Clock className="h-5 w-5" />}
              />
              <StatCard
                title="Overdue"
                value={stats.maintenance.overdue}
                icon={<AlertTriangle className="h-5 w-5" />}
              />
            </div>
          </div>

          <div className="p-4">
            <h2 className="font-semibold mb-3">Power Source</h2>
            <div>
              <StatCard
                title="Solar Powered"
                value={stats.powerSource.solar}
                icon={<Sun className="h-5 w-5" />}
              />
              <StatCard
                title="Alternator"
                value={stats.powerSource.alternator}
                icon={<Power className="h-5 w-5" />}
              />
              <StatCard
                title="Mains Powered"
                value={stats.powerSource.mains}
                icon={<Zap className="h-5 w-5" />}
              />
            </div>
          </div>
        </Card>
      </motion.div>
      
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsCollapsed(!isCollapsed)}
        className={`absolute z-20 top-7 -translate-y-1/2 h-6 w-6 rounded-md bg-white shadow-sm border transition-all duration-300 
          ${isCollapsed ? "-left-1 top-1/2" : "right-3"}`}
      >
        {isCollapsed ? (
          <ChevronRight className="h-4 w-4 text-gray-700" />
        ) : (
          <ChevronLeft className="h-4 w-4 text-gray-700" />
        )}
      </Button>
    </div>
  );
} 
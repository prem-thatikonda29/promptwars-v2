"use client";

import React from "react";
import { useSmartEventStore } from "./ConvexClientProvider";
import { Megaphone, Bell } from "lucide-react";

export function AnnouncementBanner() {
  const { announcements } = useSmartEventStore();
  const latest = announcements[0];

  const [formattedTime, setFormattedTime] = React.useState<string>("");

  React.useEffect(() => {
    if (latest) {
      setFormattedTime(
        new Date(latest.createdAt).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })
      );
    }
  }, [latest]);

  if (!latest) return null;

  return (
    <div className="bg-[#1A73E8] text-white px-4 py-2 border-b border-[#1557B0] animate-fade-in shadow-xs">
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 overflow-hidden">
          <span className="flex items-center gap-1 bg-white text-[#1A73E8] text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider shrink-0 animate-pulse-live">
            <Bell className="w-3 h-3 fill-[#1A73E8]" /> Announcement
          </span>
          <p className="font-medium truncate text-white/95">{latest.message}</p>
        </div>
        <span className="text-[11px] text-white/80 shrink-0 font-mono" suppressHydrationWarning>
          {formattedTime}
        </span>
      </div>
    </div>
  );
}

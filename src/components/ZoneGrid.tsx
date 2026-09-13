"use client";

import React from "react";
import { useSmartEventStore, ZoneType } from "./ConvexClientProvider";
import {
  Sparkles,
  Utensils,
  Bath,
  HelpCircle,
  HeartPulse,
  MapPin,
} from "lucide-react";

const getZoneConfig = (type: ZoneType) => {
  switch (type) {
    case "stage":
      return {
        icon: <Sparkles className="w-4 h-4 text-[#1A73E8]" />,
        bg: "bg-[#E8F0FE]",
        border: "border-[#D2E3FC]",
        badge: "Presentation Stage",
        color: "text-[#1A73E8]",
      };
    case "foodcourt":
      return {
        icon: <Utensils className="w-4 h-4 text-[#B06000]" />,
        bg: "bg-[#FEF7E0]",
        border: "border-[#FDE293]",
        badge: "Dining Area",
        color: "text-[#B06000]",
      };
    case "restroom":
      return {
        icon: <Bath className="w-4 h-4 text-[#188038]" />,
        bg: "bg-[#E6F4EA]",
        border: "border-[#CEEAD6]",
        badge: "Facilities",
        color: "text-[#188038]",
      };
    case "helpdesk":
      return {
        icon: <HelpCircle className="w-4 h-4 text-[#1A73E8]" />,
        bg: "bg-[#E8F0FE]",
        border: "border-[#D2E3FC]",
        badge: "Help & Info",
        color: "text-[#1A73E8]",
      };
    case "firstaid":
      return {
        icon: <HeartPulse className="w-4 h-4 text-[#D93025]" />,
        bg: "bg-[#FCE8E6]",
        border: "border-[#FAD2CF]",
        badge: "Medical Desk",
        color: "text-[#D93025]",
      };
    default:
      return {
        icon: <MapPin className="w-4 h-4 text-[#5F6368]" />,
        bg: "bg-[#F1F3F4]",
        border: "border-[#DADCE0]",
        badge: "Venue Zone",
        color: "text-[#5F6368]",
      };
  }
};

export function ZoneGrid() {
  const { zones } = useSmartEventStore();

  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-[#1A73E8]" />
          <h2 className="text-base font-bold text-[#202124] tracking-tight">Venue Zones</h2>
        </div>
        <span className="text-[11px] font-mono text-[#5F6368] bg-[#F1F3F4] border border-[#DADCE0] px-2 py-0.5 rounded-full font-medium">
          {zones.length} Active Zones
        </span>
      </div>

      <div className="google-bento-grid">
        {zones.map((zone) => {
          const config = getZoneConfig(zone.type);
          return (
            <div key={zone._id || zone.id || zone.name} className="google-card flex flex-col justify-between gap-3">
              <div className="flex items-center justify-between">
                <div className={`p-2 rounded-lg ${config.bg} ${config.border} border`}>
                  {config.icon}
                </div>
                <span className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full ${config.bg} ${config.color}`}>
                  {config.badge}
                </span>
              </div>

              <div>
                <h3 className="text-sm font-bold text-[#202124] tracking-tight">{zone.name}</h3>
                <p className="text-[11px] text-[#5F6368] mt-0.5 flex items-center gap-1">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#188038]" />
                  Open & Operational
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

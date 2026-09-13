"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useSmartEventStore, ZoneType } from "./ConvexClientProvider";
import { Zone } from "@/types";
import {
  Sparkles,
  Utensils,
  Bath,
  HelpCircle,
  HeartPulse,
  MapPin,
  Navigation,
  Calendar,
} from "lucide-react";

const MapPreview = dynamic(() => import("./MapPreview").then(mod => ({ default: mod.MapPreview })), { ssr: false });
const ZoneMapModal = dynamic(() => import("./ZoneMapModal").then(mod => ({ default: mod.ZoneMapModal })), { ssr: false });

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
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [selectedZone, setSelectedZone] = useState<Zone | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        () => {
          // Use default location if geolocation fails
          setUserLocation({ lat: 37.7849, lng: -122.4004 });
        },
        { timeout: 5000 }
      );
    } else {
      setUserLocation({ lat: 37.7849, lng: -122.4004 });
    }
  }, []);

  const handleZoneClick = (zone: Zone) => {
    setSelectedZone(zone);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedZone(null);
  };

  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-[#1A73E8]" />
          <h2 className="text-base font-bold text-[#202124] tracking-tight">Venue Zones</h2>
        </div>
        <Link
          href="/schedule"
          className="flex items-center gap-1.5 text-xs font-semibold text-[#1A73E8] bg-[#E8F0FE] hover:bg-[#D2E3FC] border border-[#D2E3FC] px-3 py-1.5 rounded-full transition-colors cursor-pointer"
        >
          <Calendar className="w-3.5 h-3.5" />
          View Schedule
        </Link>
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

              {/* Map Preview */}
              <MapPreview
                zone={zone}
                userLocation={userLocation || undefined}
                onClick={() => handleZoneClick(zone)}
              />

              {/* View Map Button */}
              <button
                onClick={() => handleZoneClick(zone)}
                className="flex items-center justify-center gap-2 w-full px-3 py-2 text-xs font-semibold text-[#1A73E8] bg-[#E8F0FE] hover:bg-[#D2E3FC] border border-[#D2E3FC] rounded-lg transition-colors cursor-pointer"
              >
                <Navigation className="w-3.5 h-3.5" />
                View Map & Directions
              </button>
            </div>
          );
        })}
      </div>

      {/* Zone Map Modal */}
      {selectedZone && (
        <ZoneMapModal
          zone={selectedZone}
          userLocation={userLocation || undefined}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
}

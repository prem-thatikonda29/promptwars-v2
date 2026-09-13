"use client";

import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import { Zone } from "@/types";
import { MapPin } from "lucide-react";

// Fix for default marker icon in webpack/next.js
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

interface MapPreviewProps {
  zone: Zone;
  userLocation?: { lat: number; lng: number };
  onClick?: () => void;
}

export function MapPreview({ zone, userLocation, onClick }: MapPreviewProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !zone.lat || !zone.lng || isNaN(zone.lat) || isNaN(zone.lng)) {
    return (
      <div className="w-full h-24 bg-[#F1F3F4] rounded-lg flex items-center justify-center">
        <MapPin className="w-4 h-4 text-[#80868B] animate-pulse" />
      </div>
    );
  }

  const center: [number, number] = userLocation && userLocation.lat && userLocation.lng
    ? [(userLocation.lat + zone.lat) / 2, (userLocation.lng + zone.lng) / 2]
    : [zone.lat, zone.lng];

  return (
    <div
      className="w-full h-24 rounded-lg overflow-hidden cursor-pointer border border-[#DADCE0]"
      onClick={onClick}
    >
      <MapContainer
        center={center}
        zoom={15}
        style={{ height: "100%", width: "100%" }}
        zoomControl={false}
        attributionControl={false}
        dragging={false}
        scrollWheelZoom={false}
        doubleClickZoom={false}
        touchZoom={false}
      >
        <TileLayer
          url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        <Marker position={[zone.lat, zone.lng]}>
          <Popup>{zone.name}</Popup>
        </Marker>
        {userLocation && userLocation.lat && userLocation.lng && (
          <Marker
            position={[userLocation.lat, userLocation.lng]}
            icon={new L.Icon({
              iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
              iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
              shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
              iconSize: [25, 41],
              iconAnchor: [12, 41],
              popupAnchor: [1, -34],
              shadowSize: [41, 41],
              className: "user-location-marker",
            })}
          >
            <Popup>Your Location</Popup>
          </Marker>
        )}
      </MapContainer>
    </div>
  );
}

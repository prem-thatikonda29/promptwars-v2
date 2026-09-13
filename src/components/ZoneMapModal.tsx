"use client";

import React, { useEffect, useState, useCallback } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from "react-leaflet";
import L from "leaflet";
import { Zone } from "@/types";
import { X, Navigation, Clock, MapPin, ExternalLink } from "lucide-react";
import { calculateDistance } from "@/lib/venueCoordinates";

// Fix for default marker icon
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

const ZONE_MARKER_ICON = new L.DivIcon({
  html: `<div style="background: #1A73E8; width: 24px; height: 24px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 6px rgba(0,0,0,0.3);"></div>`,
  className: "",
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

const USER_MARKER_ICON = new L.DivIcon({
  html: `<div style="background: #188038; width: 16px; height: 16px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 6px rgba(0,0,0,0.3);"></div>`,
  className: "",
  iconSize: [16, 16],
  iconAnchor: [8, 8],
});

interface ZoneMapModalProps {
  zone: Zone;
  userLocation?: { lat: number; lng: number };
  isOpen: boolean;
  onClose: () => void;
}

function MapUpdater({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [map, center, zoom]);
  return null;
}

interface RouteInfo {
  distance: number;
  duration: number;
  coordinates: [number, number][];
}

export function ZoneMapModal({ zone, userLocation, isOpen, onClose }: ZoneMapModalProps) {
  const [mounted, setMounted] = useState(false);
  const [route, setRoute] = useState<RouteInfo | null>(null);
  const [loadingRoute, setLoadingRoute] = useState(false);
  const [routeError, setRouteError] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const fetchRoute = useCallback(async () => {
    if (!userLocation) return;
    
    setLoadingRoute(true);
    setRouteError(false);
    
    try {
      const url = `https://router.project-osrm.org/route/v1/foot/${userLocation.lng},${userLocation.lat};${zone.lng},${zone.lat}?overview=full&geometries=polyline`;
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.code === "Ok" && data.routes && data.routes.length > 0) {
        const routeData = data.routes[0];
        // Decode polyline
        const coordinates = decodePolyline(routeData.geometry);
        setRoute({
          distance: routeData.distance,
          duration: routeData.duration,
          coordinates,
        });
      } else {
        setRouteError(true);
      }
    } catch (error) {
      console.error("Route fetch error:", error);
      setRouteError(true);
    } finally {
      setLoadingRoute(false);
    }
  }, [userLocation, zone]);

  useEffect(() => {
    if (isOpen && userLocation) {
      fetchRoute();
    }
  }, [isOpen, userLocation, fetchRoute]);

  if (!isOpen || !mounted || !zone.lat || !zone.lng || isNaN(zone.lat) || isNaN(zone.lng)) return null;

  const center: [number, number] = userLocation && userLocation.lat && userLocation.lng
    ? [(userLocation.lat + zone.lat) / 2, (userLocation.lng + zone.lng) / 2]
    : [zone.lat, zone.lng];

  const directDistance = userLocation && userLocation.lat && userLocation.lng
    ? calculateDistance(userLocation.lat, userLocation.lng, zone.lat, zone.lng)
    : 0;

  const formatDistance = (meters: number) => {
    if (meters < 1000) return `${Math.round(meters)}m`;
    return `${(meters / 1000).toFixed(1)}km`;
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.ceil(seconds / 60);
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  };

  const openInMaps = () => {
    const url = `https://www.google.com/maps/dir/?api=1&origin=${userLocation?.lat},${userLocation?.lng}&destination=${zone.lat},${zone.lng}&travelmode=walking`;
    window.open(url, "_blank");
  };

  return (
    <div 
      className="fixed inset-0 bg-black/50 z-[70] flex items-center justify-center p-4 animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="zone-map-modal-title"
      onClick={onClose}
    >
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[85vh] flex flex-col overflow-hidden" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#E8EAED]">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#E8F0FE] text-[#1A73E8] rounded-lg" aria-hidden="true">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h2 id="zone-map-modal-title" className="text-base font-bold text-[#202124]">{zone.name}</h2>
              <p className="text-xs text-[#5F6368]">Walking directions from your location</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-[#80868B] hover:text-[#202124] hover:bg-[#F1F3F4] rounded-lg transition-colors cursor-pointer"
            aria-label="Close map modal"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        {/* Map */}
        <div className="flex-1 min-h-[300px] max-h-[400px]">
          <MapContainer
            center={center}
            zoom={15}
            style={{ height: "100%", width: "100%" }}
          >
            <TileLayer
              url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            <MapUpdater center={center} zoom={15} />
            <Marker position={[zone.lat, zone.lng]} icon={ZONE_MARKER_ICON}>
              <Popup>{zone.name}</Popup>
            </Marker>
            {userLocation && (
              <Marker position={[userLocation.lat, userLocation.lng]} icon={USER_MARKER_ICON}>
                <Popup>Your Location</Popup>
              </Marker>
            )}
            {route && route.coordinates.length > 0 && (
              <Polyline
                positions={route.coordinates}
                pathOptions={{ color: "#1A73E8", weight: 4, opacity: 0.8 }}
              />
            )}
          </MapContainer>
        </div>

        {/* Info Panel */}
        <div className="p-4 border-t border-[#E8EAED] bg-[#F8F9FA]" role="region" aria-label="Route information">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-6">
              {route ? (
                <>
                  <div className="flex items-center gap-2">
                    <Navigation className="w-4 h-4 text-[#1A73E8]" aria-hidden="true" />
                    <span className="text-sm font-semibold text-[#202124]">
                      {formatDistance(route.distance)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-[#5F6368]" aria-hidden="true" />
                    <span className="text-sm text-[#5F6368]">
                      {formatDuration(route.duration)} walk
                    </span>
                  </div>
                </>
              ) : loadingRoute ? (
                <span className="text-sm text-[#5F6368]" role="status">Calculating route...</span>
              ) : (
                <div className="flex items-center gap-2">
                  <Navigation className="w-4 h-4 text-[#80868B]" aria-hidden="true" />
                  <span className="text-sm text-[#80868B]">
                    {directDistance > 0 ? `${formatDistance(directDistance)} direct` : "Location unavailable"}
                  </span>
                </div>
              )}
            </div>
            
            {userLocation && (
              <button
                onClick={openInMaps}
                className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-[#1A73E8] hover:bg-[#1557B0] rounded-lg transition-colors cursor-pointer"
                aria-label={`Open directions to ${zone.name} in Google Maps`}
              >
                <ExternalLink className="w-4 h-4" aria-hidden="true" />
                Open in Maps
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Polyline decoder function
function decodePolyline(encoded: string): [number, number][] {
  const points: [number, number][] = [];
  let index = 0;
  let lat = 0;
  let lng = 0;

  while (index < encoded.length) {
    let b: number;
    let shift = 0;
    let result = 0;

    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);

    const dlat = result & 1 ? ~(result >> 1) : result >> 1;
    lat += dlat;

    shift = 0;
    result = 0;

    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);

    const dlng = result & 1 ? ~(result >> 1) : result >> 1;
    lng += dlng;

    points.push([lat / 1e5, lng / 1e5]);
  }

  return points;
}

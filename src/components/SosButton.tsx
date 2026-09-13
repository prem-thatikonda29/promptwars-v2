"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { useSmartEventStore } from "./ConvexClientProvider";
import { ShieldAlert, CheckCircle2, Loader2, MapPin, AlertCircle, RotateCcw, X } from "lucide-react";
import { DEFAULT_VENUE_LOCATION, SOS_COOLDOWN_SECONDS } from "@/constants/config";

export function SosButton() {
  const { triggerSos } = useSmartEventStore();
  const [status, setStatus] = useState<"idle" | "locating" | "sending" | "sent">("idle");
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [cooldownRemaining, setCooldownRemaining] = useState(0);
  const [sosCountInWindow, setSosCountInWindow] = useState(0);
  const lastSosTimeRef = useRef<number>(0);
  const cooldownTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Cooldown countdown ticker
  useEffect(() => {
    if (cooldownRemaining <= 0) return;
    const interval = setInterval(() => {
      setCooldownRemaining((prev) => {
        if (prev <= 1) {
          setSosCountInWindow(0);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [cooldownRemaining]);

  const getLocation = (): Promise<{ lat: number; lng: number }> => {
    return new Promise((resolve) => {
      if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            resolve({
              lat: parseFloat(position.coords.latitude.toFixed(6)),
              lng: parseFloat(position.coords.longitude.toFixed(6)),
            });
          },
          () => {
            resolve({ lat: DEFAULT_VENUE_LOCATION.lat, lng: DEFAULT_VENUE_LOCATION.lng });
          },
          { timeout: 5000, enableHighAccuracy: true }
        );
      } else {
        resolve({ lat: DEFAULT_VENUE_LOCATION.lat, lng: DEFAULT_VENUE_LOCATION.lng });
      }
    });
  };

  const dispatchSos = useCallback(async (tag: "initial" | "repeated" = "initial") => {
    setStatus("locating");
    const loc = await getLocation();
    setCoords(loc);
    setStatus("sending");
    await triggerSos(loc.lat, loc.lng, tag);
    setStatus("sent");

    lastSosTimeRef.current = Date.now();
    setSosCountInWindow((prev) => prev + 1);
    setCooldownRemaining(SOS_COOLDOWN_SECONDS);
  }, [triggerSos]);

  const handleSosClick = () => {
    if (status === "locating" || status === "sending") return;

    const timeSinceLastSos = Date.now() - lastSosTimeRef.current;
    const withinCooldown = timeSinceLastSos < SOS_COOLDOWN_SECONDS * 1000;

    // First SOS or outside cooldown window — send immediately
    if (!withinCooldown || sosCountInWindow === 0) {
      dispatchSos("initial");
      return;
    }

    // Within cooldown — show confirmation gate
    setShowConfirm(true);
  };

  const handleConfirmYes = () => {
    setShowConfirm(false);
    dispatchSos("repeated");
  };

  const handleConfirmNo = () => {
    setShowConfirm(false);
  };

  const handleReset = () => {
    setStatus("idle");
    setCoords(null);
  };

  return (
    <>
      {/* Confirmation Modal Overlay */}
      {showConfirm && (
        <div 
          className="fixed inset-0 bg-black/40 z-[60] flex items-center justify-center px-4 animate-fade-in"
          role="dialog"
          aria-modal="true"
          aria-labelledby="sos-confirm-title"
        >
          <div className="bg-white rounded-xl border border-[#DADCE0] shadow-2xl p-5 max-w-sm w-full flex flex-col gap-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-[#FEF7E0] text-[#F9AB00] rounded-lg" aria-hidden="true">
                  <AlertCircle className="w-5 h-5" />
                </div>
                <div>
                  <h3 id="sos-confirm-title" className="text-sm font-bold text-[#202124] tracking-tight">Active Alert Detected</h3>
                  <p className="text-[11px] text-[#5F6368]">
                    You triggered an SOS {cooldownRemaining}s ago (#{sosCountInWindow} in this window)
                  </p>
                </div>
              </div>
              <button 
                onClick={handleConfirmNo} 
                className="p-1 text-[#80868B] hover:text-[#202124] cursor-pointer"
                aria-label="Close dialog"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-[#3C4043] leading-relaxed">
              Is this a <span className="font-bold">new emergency</span> or are you still waiting for help from your previous alert? 
              Your prior alert is already visible to the safety team.
            </p>

            <div className="flex gap-2" role="group" aria-label="SOS confirmation actions">
              <button
                onClick={handleConfirmNo}
                className="flex-1 text-xs font-semibold text-[#5F6368] bg-[#F1F3F4] hover:bg-[#E8EAED] border border-[#DADCE0] py-2.5 rounded-lg transition-all cursor-pointer"
              >
                Still Waiting for Help
              </button>
              <button
                onClick={handleConfirmYes}
                className="flex-1 text-xs font-bold text-white bg-[#D93025] hover:bg-[#B31412] py-2.5 rounded-lg transition-all cursor-pointer"
                aria-describedby="sos-confirm-title"
              >
                New Emergency — Send Again
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DESKTOP VIEW (Inline Card) */}
      <section className="hidden md:flex bg-white border border-[#DADCE0] rounded-xl p-4 items-center justify-between gap-4 shadow-xs" aria-label="Emergency SOS">
        <div className="flex items-center gap-3 text-left">
          <div className="p-2.5 bg-[#FCE8E6] text-[#D93025] rounded-lg shrink-0" aria-hidden="true">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-[#202124] tracking-tight">Emergency Assistance Desk</h2>
              <span className="text-[10px] font-semibold bg-[#FCE8E6] text-[#D93025] px-2 py-0.5 rounded-full uppercase tracking-wider">
                1-Tap SOS
              </span>
            </div>
            <p className="text-xs text-[#5F6368] mt-0.5">
              Instantly dispatches your live GPS location telemetry to Google Event Organizers & Safety Desk.
            </p>
          </div>
        </div>

        {status === "sent" ? (
          <div className="flex items-center gap-3 shrink-0" role="status" aria-live="polite">
            <div className="bg-[#E6F4EA] border border-[#A8DAB5] text-[#188038] px-4 py-2.5 rounded-lg flex items-center gap-2.5 text-xs font-semibold">
              <CheckCircle2 className="w-4 h-4 text-[#188038] shrink-0" aria-hidden="true" />
              <div>
                <p className="leading-tight">Dispatch Confirmed • Help Dispatched</p>
                <p className="text-[11px] text-[#13652B] font-mono flex items-center gap-1 mt-0.5">
                  <MapPin className="w-3 h-3" aria-hidden="true" />
                  {coords ? `${coords.lat}, ${coords.lng}` : "Location Received"}
                </p>
              </div>
            </div>
            {cooldownRemaining > 0 && (
              <span className="text-[10px] font-mono text-[#80868B]" aria-label={`${cooldownRemaining} seconds cooldown`}>{cooldownRemaining}s</span>
            )}
            <button
              onClick={handleSosClick}
              className="text-xs font-semibold text-[#D93025] hover:text-[#B31412] bg-[#FCE8E6] hover:bg-[#FAD2CF] border border-[#FAD2CF] px-3 py-1.5 rounded-lg cursor-pointer transition-all"
              aria-label="Send another SOS alert"
            >
              Send Another SOS
            </button>
            <button
              onClick={handleReset}
              className="text-xs text-[#5F6368] hover:text-[#202124] underline px-1 cursor-pointer"
              aria-label="Reset SOS status"
            >
              Reset
            </button>
          </div>
        ) : (
          <button
            onClick={handleSosClick}
            disabled={status === "locating" || status === "sending"}
            className="bg-[#D93025] hover:bg-[#B31412] active:scale-98 text-white font-bold text-sm px-6 py-3 rounded-lg flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs disabled:opacity-80 shrink-0"
            aria-label="Trigger SOS emergency alert"
            aria-busy={status === "locating" || status === "sending"}
          >
            {status === "locating" || status === "sending" ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                <span>Transmitting Telemetry...</span>
              </>
            ) : (
              <>
                <AlertCircle className="w-4 h-4" aria-hidden="true" />
                <span>TRIGGER SOS SIGNAL</span>
              </>
            )}
          </button>
        )}
      </section>

      {/* MOBILE VIEW (Fixed Floating Bottom-Center Button) */}
      <nav className="md:hidden fixed bottom-5 left-1/2 -translate-x-1/2 z-50 w-[92%] max-w-sm" aria-label="Emergency SOS">
        {status === "sent" ? (
          <div className="bg-[#188038] text-white p-3 px-4 rounded-full shadow-xl border border-white/20 flex items-center justify-between gap-3 animate-fade-in" role="status" aria-live="polite">
            <div className="flex items-center gap-2 overflow-hidden text-left">
              <CheckCircle2 className="w-5 h-5 text-white shrink-0" aria-hidden="true" />
              <div className="overflow-hidden">
                <p className="text-xs font-bold leading-none truncate">
                  Help Dispatched!{cooldownRemaining > 0 ? ` • ${cooldownRemaining}s` : ""}
                </p>
                <p className="text-[10px] text-white/80 font-mono flex items-center gap-1 mt-0.5 truncate">
                  <MapPin className="w-3 h-3" aria-hidden="true" />
                  {coords ? `${coords.lat}, ${coords.lng}` : "Location Dispatched"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 shrink-0" role="group" aria-label="SOS actions">
              <button
                onClick={handleSosClick}
                className="bg-white/20 hover:bg-white/30 text-white text-[10px] font-bold px-2.5 py-1 rounded-full cursor-pointer"
                aria-label="Send another SOS alert"
              >
                SOS Again
              </button>
              <button
                onClick={handleReset}
                className="bg-white/20 hover:bg-white/30 text-white p-1.5 rounded-full shrink-0 cursor-pointer"
                aria-label="Reset SOS status"
              >
                <RotateCcw className="w-3 h-3" aria-hidden="true" />
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={handleSosClick}
            disabled={status === "locating" || status === "sending"}
            className="w-full bg-[#D93025] hover:bg-[#B31412] active:scale-95 text-white font-extrabold text-sm py-3.5 px-6 rounded-full shadow-2xl border-2 border-white flex items-center justify-center gap-2.5 transition-all cursor-pointer disabled:opacity-80"
            aria-label="Trigger SOS emergency alert"
            aria-busy={status === "locating" || status === "sending"}
          >
            {status === "locating" || status === "sending" ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin text-white" aria-hidden="true" />
                <span>Locating & Dispatching...</span>
              </>
            ) : (
              <>
                <AlertCircle className="w-5 h-5 fill-white text-[#D93025] animate-pulse-live" aria-hidden="true" />
                <span className="tracking-wide">TRIGGER SOS EMERGENCY</span>
              </>
            )}
          </button>
        )}
      </nav>
    </>
  );
}

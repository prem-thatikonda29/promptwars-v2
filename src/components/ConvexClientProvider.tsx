"use client";

import React, { createContext, useContext, useEffect, useState, useRef } from "react";
import { ConvexProvider, ConvexReactClient } from "convex/react";
import { Zone, Session, AlertItem, AnnouncementItem, ZoneType } from "@/types";

export type { Zone, Session, AlertItem, AnnouncementItem, ZoneType };

const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
let convexClient: ConvexReactClient | null = null;
if (convexUrl) {
  try {
    convexClient = new ConvexReactClient(convexUrl);
  } catch (e) {
    console.error("Convex client init error:", e);
  }
}

const DEFAULT_ZONES: Zone[] = [
  {
    id: "zone-1",
    name: "Main Stage — Keynote Arena",
    type: "session",
    density: "high",
    headcountEstimate: 420,
    capacity: 500,
    currentEvent: "Opening Keynote & AI Platform Roadmap",
    locationDescription: "Main Hall, Level 1",
  },
  {
    id: "zone-2",
    name: "Expo & Networking Hub",
    type: "networking",
    density: "medium",
    headcountEstimate: 180,
    capacity: 350,
    currentEvent: "Sponsor Exhibition & Product Demos",
    locationDescription: "Central Atrium, Level 1",
  },
  {
    id: "zone-3",
    name: "Catering & Coffee Lounge",
    type: "food",
    density: "packed",
    headcountEstimate: 290,
    capacity: 300,
    currentEvent: "Morning Refreshment Break",
    locationDescription: "East Wing Terrace",
  },
  {
    id: "zone-4",
    name: "Developer Workshop Lab A",
    type: "session",
    density: "low",
    headcountEstimate: 45,
    capacity: 120,
    currentEvent: "Hands-on Code Lab: Gemini API",
    locationDescription: "Room 204, Level 2",
  },
];

const DEFAULT_SESSIONS: Session[] = [
  {
    id: "sess-1",
    title: "Opening Keynote: Next-Gen Agentic Workflows",
    speaker: "Sundar Pichai & Google DeepMind Team",
    time: "10:00 AM - 11:30 AM",
    zoneId: "zone-1",
    zoneName: "Main Stage — Keynote Arena",
    tags: ["AI", "Keynote", "Vision"],
    track: "Main",
  },
  {
    id: "sess-2",
    title: "Building Real-Time Multi-Agent Applications",
    speaker: "Google Cloud Engineering",
    time: "11:45 AM - 12:30 PM",
    zoneId: "zone-4",
    zoneName: "Developer Workshop Lab A",
    tags: ["Hands-on", "Agents", "Cloud"],
    track: "Technical",
  },
];

interface SmartEventStore {
  zones: Zone[];
  sessions: Session[];
  alerts: AlertItem[];
  announcements: AnnouncementItem[];
  triggerSos: (lat: number, lng: number, tag?: "initial" | "repeated") => Promise<string>;
  resolveAlert: (id: string) => Promise<void>;
  broadcastAnnouncement: (message: string) => Promise<string>;
  seedEventData: () => Promise<void>;
}

const StoreContext = createContext<SmartEventStore | null>(null);

const STORAGE_KEY = "smart_event_state_v1";
const BROADCAST_CHANNEL_NAME = "smart_event_realtime_channel";

export function ConvexClientProvider({ children }: { children: React.ReactNode }) {
  const [zones, setZones] = useState<Zone[]>(DEFAULT_ZONES);
  const [sessions, setSessions] = useState<Session[]>(DEFAULT_SESSIONS);
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [announcements, setAnnouncements] = useState<AnnouncementItem[]>([]);

  const channelRef = useRef<BroadcastChannel | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined" && "BroadcastChannel" in window) {
      channelRef.current = new BroadcastChannel(BROADCAST_CHANNEL_NAME);
      channelRef.current.onmessage = (event) => {
        if (event.data?.type === "STATE_UPDATE" && event.data.payload) {
          const { zones: z, sessions: s, alerts: a, announcements: ann } = event.data.payload;
          if (z) setZones(z);
          if (s) setSessions(s);
          if (a) setAlerts(a);
          if (ann) setAnnouncements(ann);
        }
      };
    }

    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.zones) setZones(parsed.zones);
        if (parsed.sessions) setSessions(parsed.sessions);
        if (parsed.alerts) setAlerts(parsed.alerts);
        if (parsed.announcements) setAnnouncements(parsed.announcements);
      }
    } catch (e) {
      console.error("Failed to load local state:", e);
    }

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          if (parsed.zones) setZones(parsed.zones);
          if (parsed.sessions) setSessions(parsed.sessions);
          if (parsed.alerts) setAlerts(parsed.alerts);
          if (parsed.announcements) setAnnouncements(parsed.announcements);
        } catch (err) {
          console.error("Storage event parse error:", err);
        }
      }
    };

    window.addEventListener("storage", handleStorageChange);

    return () => {
      if (channelRef.current) {
        channelRef.current.close();
        channelRef.current = null;
      }
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  const saveAndBroadcast = (newState: {
    zones?: Zone[];
    sessions?: Session[];
    alerts?: AlertItem[];
    announcements?: AnnouncementItem[];
  }) => {
    const currentAlerts = newState.alerts ?? alerts;
    const currentAnnouncements = newState.announcements ?? announcements;
    const currentZones = newState.zones ?? zones;
    const currentSessions = newState.sessions ?? sessions;

    const payload = {
      zones: currentZones,
      sessions: currentSessions,
      alerts: currentAlerts,
      announcements: currentAnnouncements,
    };

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
      if (channelRef.current) {
        channelRef.current.postMessage({ type: "STATE_UPDATE", payload });
      }
    } catch (e) {
      console.error("Broadcast error:", e);
    }
  };

  const triggerSos = async (lat: number, lng: number, tag: "initial" | "repeated" = "initial"): Promise<string> => {
    const newAlert: AlertItem = {
      _id: `alert-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      lat,
      lng,
      status: "open",
      tag,
      createdAt: Date.now(),
    };
    const updated = [newAlert, ...alerts];
    setAlerts(updated);
    saveAndBroadcast({ alerts: updated });
    return newAlert._id;
  };

  const resolveAlert = async (id: string): Promise<void> => {
    const updated = alerts.map((a) => (a._id === id ? { ...a, status: "resolved" as const } : a));
    setAlerts(updated);
    saveAndBroadcast({ alerts: updated });
  };

  const broadcastAnnouncement = async (message: string): Promise<string> => {
    const newAnn: AnnouncementItem = {
      _id: `ann-${Date.now()}`,
      message,
      createdAt: Date.now(),
    };
    const updated = [newAnn, ...announcements];
    setAnnouncements(updated);
    saveAndBroadcast({ announcements: updated });
    return newAnn._id;
  };

  const seedEventData = async (): Promise<void> => {
    setZones(DEFAULT_ZONES);
    setSessions(DEFAULT_SESSIONS);
    saveAndBroadcast({ zones: DEFAULT_ZONES, sessions: DEFAULT_SESSIONS });
  };

  const storeValue: SmartEventStore = {
    zones,
    sessions,
    alerts,
    announcements,
    triggerSos,
    resolveAlert,
    broadcastAnnouncement,
    seedEventData,
  };

  if (convexClient) {
    return (
      <ConvexProvider client={convexClient}>
        <StoreContext.Provider value={storeValue}>{children}</StoreContext.Provider>
      </ConvexProvider>
    );
  }

  return <StoreContext.Provider value={storeValue}>{children}</StoreContext.Provider>;
}

export function useSmartEventStore() {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error("useSmartEventStore must be used within ConvexClientProvider");
  }
  return context;
}

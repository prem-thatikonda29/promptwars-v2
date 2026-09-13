"use client";

import React, { createContext, useContext, useEffect, useState, useRef, useMemo } from "react";
import { ConvexProvider, ConvexReactClient, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
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
    lat: 19.1700,
    lng: 72.8547,
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
    lat: 19.1706,
    lng: 72.8553,
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
    lat: 19.1700,
    lng: 72.8560,
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
    lat: 19.1693,
    lng: 72.8553,
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

function ConvexQueryProvider({ children }: { children: React.ReactNode }) {
  const convexZones = useQuery(api.zones.list);
  const convexSessions = useQuery(api.sessions.listWithZones);
  
  const { zones, sessions, alerts, announcements, triggerSos, resolveAlert, broadcastAnnouncement, seedEventData } = useSmartEventStore();
  
  const effectiveZones = useMemo(() => {
    if (convexZones !== undefined) {
      return convexZones.map(z => ({
        _id: z._id,
        id: z._id,
        name: z.name,
        type: z.type as ZoneType,
        lat: z.lat,
        lng: z.lng,
      }));
    }
    return zones;
  }, [convexZones, zones]);
  
  const effectiveSessions = useMemo(() => {
    if (convexSessions !== undefined) {
      return convexSessions.map(s => ({
        _id: s._id,
        id: s._id,
        name: s.name,
        title: s.name,
        time: s.time,
        zoneId: s.zoneId,
        zone: s.zone ? {
          _id: s.zone._id,
          id: s.zone._id,
          name: s.zone.name,
          type: s.zone.type as ZoneType,
          lat: s.zone.lat,
          lng: s.zone.lng,
        } : null,
        tags: s.tags,
      }));
    }
    return sessions;
  }, [convexSessions, sessions]);
  
  const value = useMemo(() => ({
    zones: effectiveZones,
    sessions: effectiveSessions,
    alerts,
    announcements,
    triggerSos,
    resolveAlert,
    broadcastAnnouncement,
    seedEventData,
  }), [effectiveZones, effectiveSessions, alerts, announcements, triggerSos, resolveAlert, broadcastAnnouncement, seedEventData]);
  
  return (
    <StoreContext.Provider value={value}>
      {children}
    </StoreContext.Provider>
  );
}

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
    if (convexClient) {
      try {
        await convexClient.mutation(api.seed.seedData, {});
      } catch (e) {
        console.error("Convex seed failed, falling back to local seed:", e);
      }
    }
    
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
        <StoreContext.Provider value={storeValue}>
          <ConvexQueryProvider>
            {children}
          </ConvexQueryProvider>
        </StoreContext.Provider>
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

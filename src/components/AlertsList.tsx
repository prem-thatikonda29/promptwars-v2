"use client";

import React, { useMemo } from "react";
import { useSmartEventStore, AlertItem } from "./ConvexClientProvider";
import { AlertTriangle, CheckCircle2, Clock, MapPin, Radio, ShieldAlert, Layers, ChevronDown, ChevronUp } from "lucide-react";
import { haversineDistance } from "@/lib/geo";
import { PROXIMITY_THRESHOLD_METERS, CLUSTER_TIME_WINDOW_MS } from "@/constants/config";

const PROXIMITY_THRESHOLD_M = PROXIMITY_THRESHOLD_METERS;
const TIME_WINDOW_MS = CLUSTER_TIME_WINDOW_MS;

interface AlertGroup {
  id: string;
  alerts: AlertItem[];
  centroidLat: number;
  centroidLng: number;
  latestTime: number;
  earliestTime: number;
  hasRepeated: boolean;
}

function groupAlerts(alerts: AlertItem[]): AlertGroup[] {
  const groups: AlertGroup[] = [];
  const assigned = new Set<string>();

  // Sort by time descending for processing
  const sorted = [...alerts].sort((a, b) => b.createdAt - a.createdAt);

  for (const alert of sorted) {
    if (assigned.has(alert._id)) continue;

    const group: AlertItem[] = [alert];
    assigned.add(alert._id);

    // Find other unassigned alerts within proximity + time window of this alert
    for (const candidate of sorted) {
      if (assigned.has(candidate._id)) continue;
      const distance = haversineDistance(alert.lat, alert.lng, candidate.lat, candidate.lng);
      const timeDiff = Math.abs(alert.createdAt - candidate.createdAt);

      if (distance <= PROXIMITY_THRESHOLD_M && timeDiff <= TIME_WINDOW_MS) {
        group.push(candidate);
        assigned.add(candidate._id);
      }
    }

    const centroidLat = group.reduce((s, a) => s + a.lat, 0) / group.length;
    const centroidLng = group.reduce((s, a) => s + a.lng, 0) / group.length;
    const latestTime = Math.max(...group.map((a) => a.createdAt));
    const earliestTime = Math.min(...group.map((a) => a.createdAt));
    const hasRepeated = group.some((a) => a.tag === "repeated");

    groups.push({
      id: group.map((a) => a._id).join("-"),
      alerts: group.sort((a, b) => b.createdAt - a.createdAt),
      centroidLat,
      centroidLng,
      latestTime,
      earliestTime,
      hasRepeated,
    });
  }

  return groups.sort((a, b) => b.latestTime - a.latestTime);
}

function AlertGroupCard({ group, onResolve, onResolveAll }: {
  group: AlertGroup;
  onResolve: (id: string) => void;
  onResolveAll: (ids: string[]) => void;
}) {
  const [expanded, setExpanded] = React.useState(false);
  const isMulti = group.alerts.length > 1;
  const timeAgo = Math.max(0, Math.floor((Date.now() - group.latestTime) / 1000));
  const openCount = group.alerts.filter((a) => a.status === "open").length;

  return (
    <div className={`p-3 border-l-4 animate-fade-in ${
      openCount > 0 ? "bg-[#FCE8E6]/60 border-l-[#D93025]" : "bg-[#F8F9FA] border-l-[#DADCE0]"
    }`}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded uppercase ${
              openCount > 0 ? "bg-[#D93025] text-white" : "bg-[#E6F4EA] text-[#188038]"
            }`}>
              {openCount > 0 ? "CRITICAL SOS" : "RESOLVED"}
            </span>

            {isMulti && (
              <span className="text-[10px] font-bold bg-[#FEF7E0] text-[#B06000] border border-[#FDE293] px-1.5 py-0.5 rounded-full flex items-center gap-1">
                <Layers className="w-3 h-3" /> {group.alerts.length} signals grouped
              </span>
            )}

            {group.hasRepeated && (
              <span className="text-[10px] font-semibold bg-[#E8F0FE] text-[#1A73E8] px-1.5 py-0.5 rounded-full">
                Contains follow-up
              </span>
            )}

            <span className="text-[11px] text-[#5F6368] font-mono flex items-center gap-1">
              <Clock className="w-3 h-3 text-[#80868B]" />
              {timeAgo < 60 ? `${timeAgo}s ago` : `${Math.floor(timeAgo / 60)}m ago`}
            </span>
          </div>

          <p className="text-xs font-bold text-[#202124] flex items-center gap-1 font-mono mt-0.5">
            <MapPin className="w-3.5 h-3.5 text-[#D93025]" />
            GPS: {group.centroidLat.toFixed(6)}, {group.centroidLng.toFixed(6)}
            {isMulti && (
              <span className="text-[10px] text-[#80868B] font-sans font-normal ml-1">(centroid of {group.alerts.length} signals)</span>
            )}
          </p>
          {group.alerts[0]?.nearestZone && (
            <p className="text-xs font-semibold text-[#D93025] flex items-center gap-1 mt-1">
              <span className="inline-block w-2 h-2 rounded-full bg-[#D93025]" />
              Nearest Zone: {group.alerts[0].nearestZone.name}
              <span className="text-[10px] text-[#5F6368] font-normal ml-1">
                ({Math.round(group.alerts[0].nearestZone.distance)}m away)
              </span>
            </p>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {openCount > 0 && (
            <button
              onClick={() => {
                const openIds = group.alerts.filter((a) => a.status === "open").map((a) => a._id);
                onResolveAll(openIds);
              }}
              className="bg-[#188038] hover:bg-[#13652B] active:scale-95 text-white text-xs font-semibold px-3 py-1.5 rounded-md flex items-center justify-center gap-1 transition-all cursor-pointer"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{isMulti ? `Resolve All (${openCount})` : "Mark Resolved"}</span>
            </button>
          )}

          {isMulti && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="text-xs text-[#5F6368] hover:text-[#202124] border border-[#DADCE0] bg-[#F8F9FA] hover:bg-[#E8EAED] p-1.5 rounded-md cursor-pointer transition-all"
              title={expanded ? "Collapse" : "Expand individual signals"}
            >
              {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          )}
        </div>
      </div>

      {/* Expanded individual signal rows */}
      {expanded && isMulti && (
        <div className="mt-2 pt-2 border-t border-[#E8EAED] flex flex-col gap-1">
          {group.alerts.map((alert, i) => (
            <div key={alert._id} className="flex items-center justify-between text-[11px] text-[#5F6368] px-2 py-1 rounded bg-white border border-[#E8EAED]">
              <div className="flex items-center gap-2 font-mono">
                <span className={`w-1.5 h-1.5 rounded-full ${alert.status === "open" ? "bg-[#D93025]" : "bg-[#188038]"}`} />
                <span>#{i + 1} • {alert.lat.toFixed(4)}, {alert.lng.toFixed(4)}</span>
                {alert.tag === "repeated" && (
                  <span className="text-[9px] bg-[#E8F0FE] text-[#1A73E8] px-1 rounded font-sans">follow-up</span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-[#80868B]">
                  {new Date(alert.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                </span>
                {alert.status === "open" && (
                  <button
                    onClick={() => onResolve(alert._id)}
                    className="text-[10px] text-[#188038] hover:underline font-semibold cursor-pointer"
                  >
                    Resolve
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function AlertsList() {
  const { alerts, resolveAlert } = useSmartEventStore();

  const openAlerts = alerts.filter((a) => a.status === "open");
  const resolvedAlerts = alerts.filter((a) => a.status === "resolved");

  // Group open alerts by proximity + time
  const openGroups = useMemo(() => groupAlerts(openAlerts), [openAlerts]);

  const handleResolveAll = (ids: string[]) => {
    ids.forEach((id) => resolveAlert(id));
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="bg-white border border-[#DADCE0] rounded-xl p-4 flex flex-col gap-3 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E8EAED] pb-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-[#FCE8E6] text-[#D93025] rounded-md">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-[#202124] tracking-tight">Live Emergency Dispatch Feed</h2>
                <span className="flex items-center gap-1 text-[9px] font-mono font-bold bg-[#D93025] text-white px-2 py-0.5 rounded-full uppercase tracking-wider animate-pulse-live">
                  <Radio className="w-3 h-3" /> Live
                </span>
              </div>
              <p className="text-[11px] text-[#5F6368]">Grouped by proximity (50m) & time (3 min) • Nearby signals are auto-clustered</p>
            </div>
          </div>
        </div>

        {openGroups.length === 0 ? (
          <div className="py-6 text-center bg-[#F8F9FA] rounded-lg border border-dashed border-[#DADCE0]">
            <CheckCircle2 className="w-6 h-6 text-[#188038] mx-auto mb-1 opacity-80" />
            <p className="text-xs font-bold text-[#202124]">All Clear — No Active Emergencies</p>
            <p className="text-[11px] text-[#80868B] mt-0.5">
              Attendee SOS dispatches will appear in real-time without reloading.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            <p className="text-xs font-bold text-[#D93025] uppercase tracking-wider flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5" />
              Active Emergencies — {openAlerts.length} signal{openAlerts.length !== 1 ? "s" : ""} in {openGroups.length} group{openGroups.length !== 1 ? "s" : ""}
            </p>
            <div className="divide-y divide-[#E8EAED] border border-[#DADCE0] rounded-lg overflow-hidden bg-white">
              {openGroups.map((group) => (
                <AlertGroupCard
                  key={group.id}
                  group={group}
                  onResolve={resolveAlert}
                  onResolveAll={handleResolveAll}
                />
              ))}
            </div>
          </div>
        )}

        {resolvedAlerts.length > 0 && (
          <div className="mt-2 pt-2 border-t border-[#E8EAED]">
            <p className="text-[10px] font-bold text-[#80868B] uppercase tracking-wider mb-1">
              Resolved Log ({resolvedAlerts.length})
            </p>
            <div className="divide-y divide-[#E8EAED] border border-[#DADCE0] rounded-lg overflow-hidden bg-[#F8F9FA]">
              {resolvedAlerts.map((alert) => (
                <div key={alert._id} className="p-2 px-3 flex items-center justify-between text-xs text-[#5F6368]">
                  <span className="flex items-center gap-1.5 font-mono text-[11px]">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#188038]" />
                    Resolved: {alert.lat.toFixed(4)}, {alert.lng.toFixed(4)}
                    {alert.nearestZone && (
                      <span className="text-[10px] font-sans font-semibold text-[#188038] ml-1">
                        @ {alert.nearestZone.name}
                      </span>
                    )}
                    {alert.tag === "repeated" && (
                      <span className="text-[9px] bg-[#E8F0FE] text-[#1A73E8] px-1 rounded">follow-up</span>
                    )}
                  </span>
                  <span className="font-mono text-[10px] text-[#80868B]" suppressHydrationWarning>
                    {new Date(alert.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

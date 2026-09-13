import { AlertItem } from "@/types";
import { PROXIMITY_THRESHOLD_METERS, CLUSTER_TIME_WINDOW_MS } from "@/constants/config";

/**
 * Calculates the Haversine distance in meters between two GPS coordinates.
 */
export function haversineDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371000; // Earth's radius in meters
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export interface AlertGroup {
  id: string;
  centroidLat: number;
  centroidLng: number;
  alerts: AlertItem[];
  latestTimestamp: number;
  initialAlertsCount: number;
  repeatedAlertsCount: number;
}

/**
 * Groups alerts by proximity (within threshold meters) and time (within window ms).
 */
export function groupAlerts(
  alerts: AlertItem[],
  proximityMeters: number = PROXIMITY_THRESHOLD_METERS,
  timeWindowMs: number = CLUSTER_TIME_WINDOW_MS
): AlertGroup[] {
  const sorted = [...alerts].sort((a, b) => b.createdAt - a.createdAt);
  const groups: AlertGroup[] = [];

  for (const alert of sorted) {
    let addedToGroup = false;

    for (const group of groups) {
      const isCloseInTime = Math.abs(group.latestTimestamp - alert.createdAt) <= timeWindowMs;
      const distance = haversineDistance(group.centroidLat, group.centroidLng, alert.lat, alert.lng);

      if (isCloseInTime && distance <= proximityMeters) {
        group.alerts.push(alert);
        group.centroidLat =
          group.alerts.reduce((acc, curr) => acc + curr.lat, 0) / group.alerts.length;
        group.centroidLng =
          group.alerts.reduce((acc, curr) => acc + curr.lng, 0) / group.alerts.length;

        if (alert.createdAt > group.latestTimestamp) {
          group.latestTimestamp = alert.createdAt;
        }

        if (alert.tag === "repeated") {
          group.repeatedAlertsCount++;
        } else {
          group.initialAlertsCount++;
        }

        addedToGroup = true;
        break;
      }
    }

    if (!addedToGroup) {
      groups.push({
        id: `group-${alert._id}`,
        centroidLat: alert.lat,
        centroidLng: alert.lng,
        alerts: [alert],
        latestTimestamp: alert.createdAt,
        initialAlertsCount: alert.tag === "initial" ? 1 : 0,
        repeatedAlertsCount: alert.tag === "repeated" ? 1 : 0,
      });
    }
  }

  return groups;
}

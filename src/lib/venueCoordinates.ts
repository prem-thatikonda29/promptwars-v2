/**
 * Generate venue coordinates at fixed distances from a user's location.
 * Uses Haversine formula for accurate distance calculation.
 */

const EARTH_RADIUS = 6371000; // meters

function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

function toDegrees(radians: number): number {
  return radians * (180 / Math.PI);
}

/**
 * Calculate a point at a given distance and bearing from a starting point.
 */
export function calculateDestination(
  lat: number,
  lng: number,
  distanceMeters: number,
  bearingDegrees: number
): { lat: number; lng: number } {
  const bearing = toRadians(bearingDegrees);
  const lat1 = toRadians(lat);
  const lng1 = toRadians(lng);
  const angularDistance = distanceMeters / EARTH_RADIUS;

  const lat2 = Math.asin(
    Math.sin(lat1) * Math.cos(angularDistance) +
    Math.cos(lat1) * Math.sin(angularDistance) * Math.cos(bearing)
  );

  const lng2 = lng1 + Math.atan2(
    Math.sin(bearing) * Math.sin(angularDistance) * Math.cos(lat1),
    Math.cos(angularDistance) - Math.sin(lat1) * Math.sin(lat2)
  );

  return {
    lat: toDegrees(lat2),
    lng: toDegrees(lng2),
  };
}

/**
 * Calculate distance between two points using Haversine formula.
 */
export function calculateDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const dLat = toRadians(lat2 - lat1);
  const dLng = toRadians(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return EARTH_RADIUS * c;
}

/**
 * Find the nearest zone to a given location.
 * Returns the zone name and distance in meters.
 */
export function findNearestZone(
  lat: number,
  lng: number,
  zones: Array<{ name: string; lat: number; lng: number }>
): { name: string; distance: number } | null {
  if (!zones || zones.length === 0) return null;

  let nearestZone = null;
  let minDistance = Infinity;

  for (const zone of zones) {
    const distance = calculateDistance(lat, lng, zone.lat, zone.lng);
    if (distance < minDistance) {
      minDistance = distance;
      nearestZone = { name: zone.name, distance };
    }
  }

  return nearestZone;
}

/**
 * Generate venue zone coordinates in a fixed distance ring pattern.
 * Zones are placed at different distances and bearings from the user.
 */
export function generateVenueCoordinates(
  userLat: number,
  userLng: number
): Array<{ name: string; lat: number; lng: number; distance: number; bearing: number }> {
  const zones = [
    { name: "Main Stage", distance: 100, bearing: 0 },           // North
    { name: "Workshop Room A", distance: 150, bearing: 45 },     // Northeast
    { name: "Central Food Court", distance: 200, bearing: 90 },  // East
    { name: "East Restrooms", distance: 250, bearing: 135 },     // Southeast
    { name: "Info & Help Desk", distance: 300, bearing: 180 },   // South
    { name: "Medical & First Aid", distance: 350, bearing: 225 }, // Southwest
  ];

  return zones.map((zone) => {
    const coords = calculateDestination(userLat, userLng, zone.distance, zone.bearing);
    return {
      name: zone.name,
      lat: coords.lat,
      lng: coords.lng,
      distance: zone.distance,
      bearing: zone.bearing,
    };
  });
}

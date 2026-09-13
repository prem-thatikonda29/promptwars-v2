export type ZoneType = "session" | "networking" | "food" | "sponsor" | "info" | "first_aid" | "stage" | "restroom" | "foodcourt" | "helpdesk" | "firstaid";

export interface Zone {
  _id?: string;
  id?: string;
  name: string;
  type: ZoneType;
  lat?: number;
  lng?: number;
  density?: "low" | "medium" | "high" | "packed";
  headcountEstimate?: number;
  capacity?: number;
  currentEvent?: string;
  locationDescription?: string;
}

export interface Session {
  _id?: string;
  id?: string;
  name?: string;
  title?: string;
  speaker?: string;
  time: string;
  zoneId: string;
  zoneName?: string;
  zone?: Zone | null;
  tags: string[];
  track?: string;
}

export interface AlertItem {
  _id: string;
  lat: number;
  lng: number;
  status: "open" | "resolved";
  tag: "initial" | "repeated";
  createdAt: number;
  nearestZone?: {
    name: string;
    distance: number;
  } | null;
}

export interface AnnouncementItem {
  _id: string;
  message: string;
  createdAt: number;
}

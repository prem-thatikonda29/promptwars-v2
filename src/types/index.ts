export type ZoneType = "session" | "networking" | "food" | "sponsor" | "info" | "first_aid" | "stage" | "restroom" | "foodcourt" | "helpdesk" | "firstaid";

export interface Zone {
  _id?: string;
  id?: string;
  name: string;
  type: ZoneType;
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
}

export interface AnnouncementItem {
  _id: string;
  message: string;
  createdAt: number;
}

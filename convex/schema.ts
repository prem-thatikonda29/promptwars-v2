import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  zones: defineTable({
    name: v.string(),
    type: v.union(
      v.literal("stage"),
      v.literal("restroom"),
      v.literal("foodcourt"),
      v.literal("helpdesk"),
      v.literal("firstaid")
    ),
    lat: v.number(),
    lng: v.number(),
  }),

  sessions: defineTable({
    name: v.string(),
    time: v.string(),
    zoneId: v.id("zones"),
    tags: v.array(v.string()),
  }),

  alerts: defineTable({
    lat: v.number(),
    lng: v.number(),
    status: v.union(v.literal("open"), v.literal("resolved")),
    createdAt: v.number(),
  }),

  announcements: defineTable({
    message: v.string(),
    createdAt: v.number(),
  }),
});

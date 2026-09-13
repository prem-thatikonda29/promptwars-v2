import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  handler: async (ctx) => {
    return await ctx.db
      .query("alerts")
      .order("desc")
      .collect();
  },
});

export const create = mutation({
  args: {
    lat: v.number(),
    lng: v.number(),
  },
  handler: async (ctx, args) => {
    const alertId = await ctx.db.insert("alerts", {
      lat: args.lat,
      lng: args.lng,
      status: "open",
      createdAt: Date.now(),
    });
    return alertId;
  },
});

export const resolve = mutation({
  args: {
    id: v.id("alerts"),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      status: "resolved",
    });
  },
});

export const clearAll = mutation({
  handler: async (ctx) => {
    const alerts = await ctx.db.query("alerts").collect();
    for (const alert of alerts) {
      await ctx.db.delete(alert._id);
    }
  },
});

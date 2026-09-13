import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const getLatest = query({
  handler: async (ctx) => {
    const announcements = await ctx.db
      .query("announcements")
      .order("desc")
      .first();
    return announcements;
  },
});

export const listAll = query({
  handler: async (ctx) => {
    return await ctx.db
      .query("announcements")
      .order("desc")
      .collect();
  },
});

export const create = mutation({
  args: {
    message: v.string(),
  },
  handler: async (ctx, args) => {
    const id = await ctx.db.insert("announcements", {
      message: args.message,
      createdAt: Date.now(),
    });
    return id;
  },
});

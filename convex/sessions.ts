import { query } from "./_generated/server";

export const listWithZones = query({
  handler: async (ctx) => {
    const sessions = await ctx.db.query("sessions").collect();
    const zones = await ctx.db.query("zones").collect();

    const zoneMap = new Map(zones.map((z) => [z._id.toString(), z]));

    return sessions.map((session) => ({
      ...session,
      zone: zoneMap.get(session.zoneId.toString()) || null,
    }));
  },
});

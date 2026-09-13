import { mutation } from "./_generated/server";

export const seedData = mutation({
  handler: async (ctx) => {
    // Clear existing zones & sessions if any
    const existingZones = await ctx.db.query("zones").collect();
    for (const z of existingZones) {
      await ctx.db.delete(z._id);
    }
    const existingSessions = await ctx.db.query("sessions").collect();
    for (const s of existingSessions) {
      await ctx.db.delete(s._id);
    }

    // Insert 6 zones
    const mainStageId = await ctx.db.insert("zones", {
      name: "Main Stage",
      type: "stage",
    });
    const workshopRoomId = await ctx.db.insert("zones", {
      name: "Workshop Room A",
      type: "stage",
    });
    const foodCourtId = await ctx.db.insert("zones", {
      name: "Central Food Court",
      type: "foodcourt",
    });
    const restroomsId = await ctx.db.insert("zones", {
      name: "East Restrooms",
      type: "restroom",
    });
    const helpDeskId = await ctx.db.insert("zones", {
      name: "Info & Help Desk",
      type: "helpdesk",
    });
    const firstAidId = await ctx.db.insert("zones", {
      name: "Medical & First Aid",
      type: "firstaid",
    });

    // Insert 8 sessions with interest tags
    await ctx.db.insert("sessions", {
      name: "Opening Keynote: Future of AI",
      time: "10:00 AM - 11:00 AM",
      zoneId: mainStageId,
      tags: ["Tech", "Keynote", "AI"],
    });

    await ctx.db.insert("sessions", {
      name: "Hands-on Next.js 15 & Convex",
      time: "11:15 AM - 12:30 PM",
      zoneId: workshopRoomId,
      tags: ["Tech", "Workshop", "Coding"],
    });

    await ctx.db.insert("sessions", {
      name: "Networking Lunch & Food Tasting",
      time: "12:30 PM - 01:30 PM",
      zoneId: foodCourtId,
      tags: ["Social", "Food"],
    });

    await ctx.db.insert("sessions", {
      name: "Designing Minimalist UI Systems",
      time: "01:45 PM - 02:30 PM",
      zoneId: workshopRoomId,
      tags: ["Design", "UX", "Workshop"],
    });

    await ctx.db.insert("sessions", {
      name: "Prompt Wars Championship Finals",
      time: "02:45 PM - 04:00 PM",
      zoneId: mainStageId,
      tags: ["Keynote", "Competition", "AI"],
    });

    await ctx.db.insert("sessions", {
      name: "Attendee Support & Swag Collection",
      time: "All Day",
      zoneId: helpDeskId,
      tags: ["Support", "General"],
    });

    await ctx.db.insert("sessions", {
      name: "Emergency First Aid & Safety Briefing",
      time: "04:15 PM - 04:45 PM",
      zoneId: firstAidId,
      tags: ["Safety", "General"],
    });

    await ctx.db.insert("sessions", {
      name: "Closing Ceremony & Hackathon Awards",
      time: "05:00 PM - 06:00 PM",
      zoneId: mainStageId,
      tags: ["Keynote", "Social"],
    });

    return { success: true, message: "Seeded 6 zones and 8 sessions successfully." };
  },
});

"use client";

import React, { useState } from "react";
import { useSmartEventStore } from "./ConvexClientProvider";
import { Megaphone, Send, Check } from "lucide-react";

export function AnnouncementForm() {
  const { broadcastAnnouncement } = useSmartEventStore();
  const [message, setMessage] = useState("");
  const [broadcasting, setBroadcasting] = useState(false);
  const [postedSuccess, setPostedSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    setBroadcasting(true);
    await broadcastAnnouncement(message.trim());
    setMessage("");
    setBroadcasting(false);
    setPostedSuccess(true);

    setTimeout(() => {
      setPostedSuccess(false);
    }, 2500);
  };

  return (
    <div className="bg-white border border-[#DADCE0] rounded-xl p-4 shadow-xs flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <div className="p-1.5 bg-[#E8F0FE] text-[#1A73E8] rounded-md">
          <Megaphone className="w-4 h-4" />
        </div>
        <div>
          <h2 className="text-sm font-bold text-[#202124] tracking-tight">Push Global Announcement</h2>
          <p className="text-[11px] text-[#5F6368]">Broadcasts an instant Google Blue top banner update to all attendee screens</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="e.g. Workshop Room A moved to Hall 2 • Keynote starting in 5 minutes..."
          className="flex-1 bg-[#F8F9FA] border border-[#DADCE0] rounded-lg px-3.5 py-2 text-xs text-[#202124] focus:outline-none focus:border-[#1A73E8] focus:bg-white placeholder:text-[#80868B]"
        />
        <button
          type="submit"
          disabled={!message.trim() || broadcasting}
          className="bg-[#1A73E8] hover:bg-[#1557B0] active:scale-98 text-white font-semibold text-xs px-4 py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer disabled:opacity-50 shrink-0"
        >
          {postedSuccess ? (
            <>
              <Check className="w-3.5 h-3.5 text-white" />
              <span>Pushed to Attendees!</span>
            </>
          ) : (
            <>
              <Send className="w-3.5 h-3.5" />
              <span>Broadcast Now</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}

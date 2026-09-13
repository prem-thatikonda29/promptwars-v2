"use client";

import React, { useState } from "react";
import { useSmartEventStore } from "./ConvexClientProvider";
import { Clock, MapPin, Sparkles, Calendar } from "lucide-react";

export function SessionList() {
  const { sessions } = useSmartEventStore();
  const [selectedTag, setSelectedTag] = useState<string>("All");

  const allTags = ["All", ...Array.from(new Set(sessions.flatMap((s) => s.tags || [])))];

  const filteredSessions = selectedTag === "All"
    ? sessions
    : sessions.filter((s) => s.tags && s.tags.includes(selectedTag));

  return (
    <div className="bg-white border border-[#DADCE0] rounded-xl p-4 flex flex-col gap-3 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E8EAED] pb-3">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-[#1A73E8]" />
          <h2 className="text-base font-bold text-[#202124] tracking-tight">Today's Schedule</h2>
        </div>

        {/* Compact Google Pills for Interest Filtering */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs font-semibold text-[#5F6368] flex items-center gap-1 mr-1">
            <Sparkles className="w-3.5 h-3.5 text-[#1A73E8]" /> Interests:
          </span>
          {allTags.map((tag) => (
            <button
              key={tag}
              onClick={() => setSelectedTag(tag)}
              className={`text-xs px-2.5 py-0.5 rounded-full border transition-all cursor-pointer font-medium ${
                selectedTag === tag
                  ? "bg-[#1A73E8] text-white border-[#1A73E8]"
                  : "bg-[#F1F3F4] text-[#3C4043] border-[#DADCE0] hover:bg-[#E8EAED]"
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      <div className="divide-y divide-[#E8EAED]">
        {filteredSessions.length === 0 ? (
          <p className="text-xs text-[#80868B] py-4 text-center">No sessions found matching this filter.</p>
        ) : (
          filteredSessions.map((session) => {
            const isMatch = selectedTag !== "All" && session.tags.includes(selectedTag);
            return (
              <div
                key={session._id || session.id || session.title}
                className={`py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 transition-colors ${
                  isMatch ? "bg-[#E8F0FE] -mx-4 px-4 border-l-3 border-l-[#1A73E8]" : ""
                }`}
              >
                <div className="flex flex-col gap-0.5">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold text-[#202124] tracking-tight">
                      {session.title || session.name}
                    </h3>
                    {isMatch && (
                      <span className="text-[9px] bg-[#1A73E8] text-white px-1.5 py-0.2 rounded font-bold uppercase tracking-wider">
                        Matched
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-xs text-[#5F6368]">
                    <span className="flex items-center gap-1 font-mono text-[11px]">
                      <Clock className="w-3 h-3 text-[#80868B]" />
                      {session.time}
                    </span>
                    <span className="flex items-center gap-1 font-medium text-[#202124] text-[11px]">
                      <MapPin className="w-3 h-3 text-[#80868B]" />
                      {session.zone?.name || "Main Venue"}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1 flex-wrap">
                  {session.tags?.map((t) => (
                    <span
                      key={t}
                      className="text-[10px] font-mono text-[#5F6368] bg-[#F1F3F4] border border-[#DADCE0] px-2 py-0.5 rounded-full"
                    >
                      #{t}
                    </span>
                  ))}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

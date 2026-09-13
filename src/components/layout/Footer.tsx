import React from "react";

interface FooterProps {
  variant?: "attendee" | "organizer";
}

export function Footer({ variant = "attendee" }: FooterProps) {
  const isOrg = variant === "organizer";

  return (
    <footer className="border-t border-[#DADCE0] bg-white py-4 mt-8 text-center text-xs text-[#5F6368]">
      <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="flex -space-x-1">
            <span className="w-2 h-2 rounded-full bg-[#4285F4]" />
            <span className="w-2 h-2 rounded-full bg-[#EA4335]" />
            <span className="w-2 h-2 rounded-full bg-[#FBBC05]" />
            <span className="w-2 h-2 rounded-full bg-[#34A853]" />
          </div>
          <span className="font-bold text-[#202124]">
            {isOrg ? "Google Event Command Console" : "Google Smart Event Experience"}
          </span>
          <span>• Hack2Skill x PromptWars</span>
        </div>
        <p className="font-mono text-[11px] text-[#80868B]">Convex Real-Time Engine</p>
      </div>
    </footer>
  );
}

"use client";

import React from "react";
import Link from "next/link";

interface HeaderProps {
  variant?: "attendee" | "organizer";
}

export function Header({ variant = "attendee" }: HeaderProps) {
  const isOrg = variant === "organizer";

  return (
    <header className={`border-b border-[#DADCE0] ${isOrg ? "bg-[#202124] text-white" : "bg-white text-[#202124]"} sticky top-0 z-40 shadow-xs`}>
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-[#1A73E8] flex items-center justify-center text-white font-bold text-sm shadow-xs group-hover:scale-105 transition-transform">
              G
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className={`text-sm font-bold tracking-tight leading-none ${isOrg ? "text-white" : "text-[#202124]"}`}>
                  {isOrg ? "Google Event Command Desk" : "Google Developer Summit 2026"}
                </h1>
              </div>
              <p className={`text-[11px] ${isOrg ? "text-[#9AA0A6]" : "text-[#5F6368]"} mt-0.5 font-mono`}>
                {isOrg
                  ? "Real-time safety dispatch & announcement broadcaster console"
                  : "Smart Venue Density & Safety Network"}
              </p>
            </div>
          </Link>
        </div>
      </div>
    </header>
  );
}

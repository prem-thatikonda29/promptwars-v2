"use client";

import Link from "next/link";
import { AppLayout } from "@/components/layout/AppLayout";
import { SessionList } from "@/components/SessionList";
import { ArrowLeft, MapPin } from "lucide-react";

export default function SchedulePage() {
  return (
    <AppLayout variant="attendee">
      {/* Back to Zones Button */}
      <div className="flex items-center justify-between mb-4">
        <Link
          href="/"
          className="flex items-center gap-2 text-sm font-semibold text-[#1A73E8] hover:text-[#1557B0] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Zones
        </Link>
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-[#1A73E8]" />
          <span className="text-sm font-bold text-[#202124]">Today's Schedule</span>
        </div>
      </div>

      <section>
        <SessionList />
      </section>
    </AppLayout>
  );
}

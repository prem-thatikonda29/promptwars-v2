"use client";

import { AppLayout } from "@/components/layout/AppLayout";
import { AnnouncementBanner } from "@/components/AnnouncementBanner";
import { SosButton } from "@/components/SosButton";
import { ZoneGrid } from "@/components/ZoneGrid";

export default function AttendeePage() {
  return (
    <AppLayout variant="attendee">
      {/* Live Announcement Banner */}
      <AnnouncementBanner />

      {/* SOS Emergency Module */}
      <section>
        <SosButton />
      </section>

      {/* Zone Bento Grid Discovery */}
      <section>
        <ZoneGrid />
      </section>
    </AppLayout>
  );
}

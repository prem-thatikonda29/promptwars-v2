"use client";

import { AppLayout } from "@/components/layout/AppLayout";
import { AnnouncementForm } from "@/components/AnnouncementForm";
import { AlertsList } from "@/components/AlertsList";

export default function OrganizerPage() {
  return (
    <AppLayout variant="organizer">
      {/* Real-time Announcement Broadcaster */}
      <section>
        <AnnouncementForm />
      </section>

      {/* Live Incoming SOS Alerts Monitor */}
      <section>
        <AlertsList />
      </section>
    </AppLayout>
  );
}

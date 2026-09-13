"use client";

import { AppLayout } from "@/components/layout/AppLayout";
import { SessionList } from "@/components/SessionList";

export default function SchedulePage() {
  return (
    <AppLayout variant="attendee">
      <section>
        <SessionList />
      </section>
    </AppLayout>
  );
}

# Venue & Session Discovery Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Wire real-time Convex hydration with local fallback in ConvexClientProvider, add re-seed button to organizer page, and verify all venue discovery components work correctly.

**Architecture:** Use Convex's `useQuery` hooks as primary data source when `NEXT_PUBLIC_CONVEX_URL` is available, with local state + BroadcastChannel as fallback. Verify existing components work correctly without major changes.

**Tech Stack:** Next.js 16.3.5, React 19.2.8, Convex 1.45.0, Tailwind CSS 4, TypeScript 5, lucide-react

## Global Constraints

- Next.js 16.3.5 (check `node_modules/next/dist/docs/` for breaking changes)
- Convex 1.45.0 (read `convex/_generated/ai/guidelines.md` first)
- React 19.2.8
- TypeScript strict mode
- Tailwind CSS 4 with PostCSS

---

## File Structure

| File | Action | Responsibility |
|------|--------|----------------|
| `convex/schema.ts` | Verify | Confirm zones/sessions schema is correct |
| `convex/seed.ts` | Verify | Confirm seed data creates 6 zones and 8 sessions |
| `convex/zones.ts` | Verify | Confirm public list query works |
| `convex/sessions.ts` | Verify | Confirm listWithZones query joins correctly |
| `src/components/ConvexClientProvider.tsx` | Modify | Add Convex hooks with local fallback |
| `src/components/ZoneGrid.tsx` | Verify | Confirm zone grid displays correctly |
| `src/components/SessionList.tsx` | Verify | Confirm session list with filtering works |
| `src/components/SosButton.tsx` | Verify | Confirm SOS button positioning works |
| `src/app/page.tsx` | Verify | Confirm layout integration |
| `src/app/organizer/page.tsx` | Modify | Add re-seed button |

---

### Task 1: Verify Convex Backend

**Files:**
- Verify: `convex/schema.ts`
- Verify: `convex/seed.ts`
- Verify: `convex/zones.ts`
- Verify: `convex/sessions.ts`

**Interfaces:**
- Consumes: None
- Produces: Confirmed working Convex backend

- [ ] **Step 1: Read convex schema**

```bash
cat convex/schema.ts
```

Expected output shows zones table with name and type fields, sessions table with name, time, zoneId, and tags fields.

- [ ] **Step 2: Read seed data**

```bash
cat convex/seed.ts
```

Expected output shows seedData mutation that inserts 6 zones and 8 sessions.

- [ ] **Step 3: Read zones query**

```bash
cat convex/zones.ts
```

Expected output shows list query that returns all zones.

- [ ] **Step 4: Read sessions query**

```bash
cat convex/sessions.ts
```

Expected output shows listWithZones query that joins sessions with zone details.

- [ ] **Step 5: Verify no changes needed**

All Convex backend files are already implemented correctly. No code changes required for this task.

---

### Task 2: Update ConvexClientProvider with Convex Hooks

**Files:**
- Modify: `src/components/ConvexClientProvider.tsx`

**Interfaces:**
- Consumes: Convex backend queries (api.zones.list, api.sessions.listWithZones)
- Produces: Updated store with Convex hooks and local fallback

- [ ] **Step 1: Add Convex imports**

Open `src/components/ConvexClientProvider.tsx` and add imports at the top:

```typescript
"use client";

import React, { createContext, useContext, useEffect, useState, useRef, useMemo } from "react";
import { ConvexProvider, ConvexReactClient, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Zone, Session, AlertItem, AnnouncementItem, ZoneType } from "@/types";
```

- [ ] **Step 2: Create ConvexQueryProvider component**

Add a new component inside `ConvexClientProvider.tsx` that handles Convex queries:

```typescript
function ConvexQueryProvider({ children }: { children: React.ReactNode }) {
  const convexZones = useQuery(api.zones.list);
  const convexSessions = useQuery(api.sessions.listWithZones);
  
  const { zones, sessions, alerts, announcements, triggerSos, resolveAlert, broadcastAnnouncement, seedEventData } = useSmartEventStore();
  
  // Use Convex data when available, otherwise use local state
  const effectiveZones = useMemo(() => {
    if (convexZones !== undefined) {
      return convexZones.map(z => ({
        _id: z._id,
        id: z._id,
        name: z.name,
        type: z.type as ZoneType,
      }));
    }
    return zones;
  }, [convexZones, zones]);
  
  const effectiveSessions = useMemo(() => {
    if (convexSessions !== undefined) {
      return convexSessions.map(s => ({
        _id: s._id,
        id: s._id,
        name: s.name,
        title: s.name,
        time: s.time,
        zoneId: s.zoneId,
        zone: s.zone ? {
          _id: s.zone._id,
          id: s.zone._id,
          name: s.zone.name,
          type: s.zone.type as ZoneType,
        } : null,
        tags: s.tags,
      }));
    }
    return sessions;
  }, [convexSessions, sessions]);
  
  const value = useMemo(() => ({
    zones: effectiveZones,
    sessions: effectiveSessions,
    alerts,
    announcements,
    triggerSos,
    resolveAlert,
    broadcastAnnouncement,
    seedEventData,
  }), [effectiveZones, effectiveSessions, alerts, announcements, triggerSos, resolveAlert, broadcastAnnouncement, seedEventData]);
  
  return (
    <StoreContext.Provider value={value}>
      {children}
    </StoreContext.Provider>
  );
}
```

- [ ] **Step 3: Update seedEventData function**

Update the `seedEventData` function to call Convex mutation when available:

```typescript
const seedEventData = async (): Promise<void> => {
  if (convexClient) {
    try {
      // Call Convex mutation if available
      await convexClient.mutation(api.seed.seedData, {});
    } catch (e) {
      console.error("Convex seed failed, falling back to local seed:", e);
    }
  }
  
  // Always set local state as fallback
  setZones(DEFAULT_ZONES);
  setSessions(DEFAULT_SESSIONS);
  saveAndBroadcast({ zones: DEFAULT_ZONES, sessions: DEFAULT_SESSIONS });
};
```

- [ ] **Step 4: Update ConvexClientProvider return**

Update the return statement to use ConvexQueryProvider when Convex is available:

```typescript
if (convexClient) {
  return (
    <ConvexProvider client={convexClient}>
      <ConvexQueryProvider>
        {children}
      </ConvexQueryProvider>
    </ConvexProvider>
  );
}

return <StoreContext.Provider value={storeValue}>{children}</StoreContext.Provider>;
```

- [ ] **Step 5: Run TypeScript check**

```bash
npx tsc --noEmit
```

Expected: No TypeScript errors.

- [ ] **Step 6: Commit changes**

```bash
git add src/components/ConvexClientProvider.tsx
git commit -m "feat: add Convex hooks with local fallback to ConvexClientProvider"
```

---

### Task 3: Verify ZoneGrid Component

**Files:**
- Verify: `src/components/ZoneGrid.tsx`

**Interfaces:**
- Consumes: zones from useSmartEventStore
- Produces: Verified working zone grid

- [ ] **Step 1: Read ZoneGrid component**

```bash
cat src/components/ZoneGrid.tsx
```

Expected output shows component that:
- Uses useSmartEventStore to get zones
- Maps zone types to icons, backgrounds, and badges
- Displays zones in a grid layout

- [ ] **Step 2: Verify zone type configurations**

Check that all 5 zone types are configured:
- stage: Sparkles icon, blue background
- foodcourt: Utensils icon, yellow background
- restroom: Bath icon, green background
- helpdesk: HelpCircle icon, blue background
- firstaid: HeartPulse icon, red background

- [ ] **Step 3: Verify no changes needed**

ZoneGrid component is already implemented correctly. No code changes required.

---

### Task 4: Verify SessionList Component

**Files:**
- Verify: `src/components/SessionList.tsx`

**Interfaces:**
- Consumes: sessions from useSmartEventStore
- Produces: Verified working session list with filtering

- [ ] **Step 1: Read SessionList component**

```bash
cat src/components/SessionList.tsx
```

Expected output shows component that:
- Uses useSmartEventStore to get sessions
- Implements interest tag filtering
- Displays sessions with time, zone name, and tags
- Highlights matching sessions when filter is active

- [ ] **Step 2: Verify filtering logic**

Check that:
- All unique tags are extracted from sessions
- "All" filter shows all sessions
- Specific tag filter shows only matching sessions
- Matching sessions are visually highlighted

- [ ] **Step 3: Verify no changes needed**

SessionList component is already implemented correctly. No code changes required.

---

### Task 5: Verify SosButton Component

**Files:**
- Verify: `src/components/SosButton.tsx`

**Interfaces:**
- Consumes: triggerSos from useSmartEventStore
- Produces: Verified working SOS button

- [ ] **Step 1: Read SosButton component**

```bash
cat src/components/SosButton.tsx
```

Expected output shows component that:
- Implements mobile view (fixed bottom-center)
- Implements desktop view (inline card)
- Handles cooldown and confirmation logic
- Uses geolocation for SOS alerts

- [ ] **Step 2: Verify positioning**

Check that:
- Mobile: Fixed bottom-center with z-50
- Desktop: Hidden on mobile, flex on md+
- Button is always accessible without scrolling

- [ ] **Step 3: Verify no changes needed**

SosButton component is already implemented correctly. No code changes required.

---

### Task 6: Verify Layout Integration

**Files:**
- Verify: `src/app/page.tsx`

**Interfaces:**
- Consumes: AnnouncementBanner, SosButton, ZoneGrid, SessionList
- Produces: Verified working layout

- [ ] **Step 1: Read attendee page**

```bash
cat src/app/page.tsx
```

Expected output shows layout with:
- AnnouncementBanner at top
- SosButton in section
- ZoneGrid in section
- SessionList in section

- [ ] **Step 2: Verify component order**

Check that components are in correct order:
1. Announcement banner
2. SOS emergency section
3. Zone grid discovery
4. Session list with filters

- [ ] **Step 3: Verify no changes needed**

Layout integration is already implemented correctly. No code changes required.

---

### Task 7: Add Re-seed Button to Organizer Page

**Files:**
- Modify: `src/app/organizer/page.tsx`

**Interfaces:**
- Consumes: seedEventData from useSmartEventStore
- Produces: Organizer page with re-seed button

- [ ] **Step 1: Read organizer page**

```bash
cat src/app/organizer/page.tsx
```

Expected output shows current organizer page with AnnouncementForm and AlertsList.

- [ ] **Step 2: Add re-seed button**

Update `src/app/organizer/page.tsx` to add re-seed button:

```typescript
"use client";

import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { AnnouncementForm } from "@/components/AnnouncementForm";
import { AlertsList } from "@/components/AlertsList";
import { useSmartEventStore } from "@/components/ConvexClientProvider";
import { Database, Loader2, CheckCircle2 } from "lucide-react";

export default function OrganizerPage() {
  const { seedEventData } = useSmartEventStore();
  const [isSeeding, setIsSeeding] = useState(false);
  const [seedSuccess, setSeedSuccess] = useState(false);
  
  const handleReSeed = async () => {
    setIsSeeding(true);
    setSeedSuccess(false);
    try {
      await seedEventData();
      setSeedSuccess(true);
      setTimeout(() => setSeedSuccess(false), 3000);
    } catch (e) {
      console.error("Seed failed:", e);
    } finally {
      setIsSeeding(false);
    }
  };
  
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
      
      {/* Re-seed Venue Data */}
      <section>
        <div className="bg-white border border-[#DADCE0] rounded-xl p-4 flex items-center justify-between gap-4 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-[#E8F0FE] text-[#1A73E8] rounded-lg">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#202124] tracking-tight">Re-seed Venue Data</h3>
              <p className="text-xs text-[#5F6368]">Reset zones and sessions to default demo data</p>
            </div>
          </div>
          
          <button
            onClick={handleReSeed}
            disabled={isSeeding}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-[#1A73E8] bg-[#E8F0FE] hover:bg-[#D2E3FC] border border-[#D2E3FC] rounded-lg transition-all cursor-pointer disabled:opacity-60"
          >
            {isSeeding ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Seeding...
              </>
            ) : seedSuccess ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-[#188038]" />
                Seeded!
              </>
            ) : (
              <>
                <Database className="w-4 h-4" />
                Re-seed Data
              </>
            )}
          </button>
        </div>
      </section>
    </AppLayout>
  );
}
```

- [ ] **Step 3: Run TypeScript check**

```bash
npx tsc --noEmit
```

Expected: No TypeScript errors.

- [ ] **Step 4: Run build**

```bash
npm run build
```

Expected: Build succeeds without errors.

- [ ] **Step 5: Commit changes**

```bash
git add src/app/organizer/page.tsx
git commit -m "feat: add re-seed venue data button to organizer page"
```

---

### Task 8: Final Verification

**Files:**
- Verify: All modified files

**Interfaces:**
- Consumes: All previous tasks
- Produces: Verified working implementation

- [ ] **Step 1: Run full build**

```bash
npm run build
```

Expected: Build succeeds without TypeScript errors.

- [ ] **Step 2: Start dev server**

```bash
npm run dev
```

Expected: Dev server starts on port 3005.

- [ ] **Step 3: Test attendee page**

Open browser to `http://localhost:3005` and verify:
- Announcement banner displays
- SOS button is accessible (mobile: fixed bottom, desktop: inline card)
- Zone grid shows 6 zones with correct icons
- Session list shows 8 sessions with filtering
- Interest tag filtering works correctly

- [ ] **Step 4: Test organizer page**

Open browser to `http://localhost:3005/organizer` and verify:
- Announcement form works
- Alerts list displays
- Re-seed button works and shows success feedback

- [ ] **Step 5: Test Convex hydration (optional)**

If `NEXT_PUBLIC_CONVEX_URL` is set in `.env.local`:
- Verify real-time updates work when data changes
- Verify local fallback works when Convex is unavailable

- [ ] **Step 6: Final commit**

```bash
git add -A
git commit -m "feat: complete venue and session discovery implementation"
```

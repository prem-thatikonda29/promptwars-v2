# Venue & Session Discovery - Design Spec

**Date**: 2026-09-13  
**Status**: Approved  
**Author**: opencode  

## Overview

Implement the **Venue & Session Discovery** feature for the Smart Event Experience platform, completing navigation, discovery, and interest recommendation capabilities on the Attendee screen alongside the existing SOS alert module.

## Current State

The project already has:
- Convex backend with `zones`, `sessions`, `alerts`, and `announcements` tables
- Seed data with 6 zones and 8 sessions
- Public queries for zones and sessions with zone joins
- Frontend components: `ZoneGrid`, `SessionList`, `SosButton`, `AnnouncementBanner`
- Local state management with localStorage and BroadcastChannel sync
- Layout integration on attendee page

## Design Decisions

### Approach: Convex Hooks with Graceful Fallback

Use Convex's `useQuery` hooks as the primary data source when `NEXT_PUBLIC_CONVEX_URL` is available, with local state as fallback for offline/demo mode.

**Why this approach:**
- Most idiomatic Convex pattern
- Leverages real-time updates when connected to Convex
- Maintains offline functionality via local state
- Minimal code changes required

## Implementation Sections

### 1. Convex Backend Verification

**Files**: `convex/schema.ts`, `convex/seed.ts`, `convex/zones.ts`, `convex/sessions.ts`

**Current Implementation**:
- Schema defines `zones` with `name` and `type` (5 union literals: stage, restroom, foodcourt, helpdesk, firstaid)
- Schema defines `sessions` with `name`, `time`, `zoneId`, and `tags`
- Seed data creates 6 zones and 8 sessions with realistic event data
- Zones query returns all zones
- Sessions query joins with zone details

**Action**: Verify working correctly. No changes expected unless issues found during testing.

### 2. ConvexClientProvider Hydration

**File**: `src/components/ConvexClientProvider.tsx`

**Current State**:
- Uses local state for zones, sessions, alerts, announcements
- Syncs via localStorage and BroadcastChannel
- Does not use Convex hooks

**Proposed Changes**:
1. Import `useQuery` from `convex/react` and `api` from `convex/_generated/api`
2. When `NEXT_PUBLIC_CONVEX_URL` is set:
   - Use `useQuery(api.zones.list)` for zones
   - Use `useQuery(api.sessions.listWithZones)` for sessions
   - Keep local state for alerts and announcements (Convex not yet implemented for these)
3. Maintain local state as fallback when Convex queries return `undefined` (loading) or when Convex is unavailable
4. Update `seedEventData` function to:
   - Call Convex `api.seed.seedData` mutation when available
   - Fall back to local seeding when Convex is unavailable
5. Keep existing BroadcastChannel sync for multi-tab coordination

**Key Design Decision**: Convex queries will be the primary data source when available, with local state as fallback. This ensures real-time updates work when connected to Convex, while maintaining offline/demo functionality.

**Loading States**: When Convex is available but queries are loading, show existing local state (or default state) to maintain responsiveness.

### 3. Component Polish

#### ZoneGrid
**File**: `src/components/ZoneGrid.tsx`

**Current Implementation**: Already handles zone type configurations with icons, badges, and colors.

**Action**: Verify grid layout displays 6 zones correctly. Ensure responsive design works on mobile and desktop. No code changes expected unless layout issues are found.

#### SessionList
**File**: `src/components/SessionList.tsx`

**Current Implementation**: Already implements:
- Time-sorted session display
- Zone badges and interest tags
- Single-tap interest tag filtering
- Visual highlight on matching sessions

**Action**: Verify functionality works correctly. No code changes expected unless filtering or display issues are found.

#### SosButton
**File**: `src/components/SosButton.tsx`

**Current Implementation**: Already handles:
- Mobile: Fixed bottom-center floating button
- Desktop: Inline card layout
- Cooldown and confirmation logic

**Action**: Verify positioning and functionality work correctly. No code changes expected unless positioning issues are found.

### 4. Layout Integration

**File**: `src/app/page.tsx`

**Current Implementation**: Already integrates all components in correct order:
1. Announcement banner at top
2. SOS emergency section
3. Zone grid discovery
4. Session list with filters

**Action**: Verify layout flow works well on different screen sizes. Adjust spacing if needed.

### 5. Organizer Enhancement

**File**: `src/app/organizer/page.tsx`

**Current State**: Has `AnnouncementForm` and `AlertsList`.

**Proposed Change**: Add "Re-seed Venue Data" button to the command bar.

**Implementation**:
1. Add button that invokes `seedEventData` from the store
2. Show loading state during seeding
3. Display success/error feedback
4. Useful for testing and demonstration purposes

## Data Flow

### Convex Available Mode
```
Convex Server → useQuery hooks → State → Components
                                ↓
                         BroadcastChannel → Other tabs
                                ↓
                          localStorage (backup)
```

### Local Fallback Mode
```
localStorage → State → Components
                   ↓
            BroadcastChannel → Other tabs
```

## Testing Strategy

### Automated Tests
- Run `npm run build` to verify TypeScript compilation
- Verify Next.js static page generation works

### Manual Verification
1. **Browse Zones**: Verify card grid renders 6 zones with correct icons and badges
2. **View Sessions**: Verify sessions list displays time, session title, zone location name, and tags
3. **Interest Tag Filter**: Tap interest buttons and check matching sessions are highlighted
4. **SOS Button Coexistence**: Confirm SOS emergency button is prominent and functional alongside venue discovery
5. **Convex Hydration**: When `NEXT_PUBLIC_CONVEX_URL` is set, verify real-time updates work
6. **Local Fallback**: When `NEXT_PUBLIC_CONVEX_URL` is not set, verify local state works
7. **Re-seed Button**: Verify organizer can re-seed venue data for testing

## Success Criteria

1. ✅ Convex backend schema, seed data, and queries are working correctly (verified via build and manual testing)
2. ✅ ConvexClientProvider uses Convex hooks when `NEXT_PUBLIC_CONVEX_URL` is set, with local fallback when unavailable
3. ✅ ZoneGrid displays all 6 zones with correct icons, badges, and responsive layout
4. ✅ SessionList shows sessions with time, zone name, tags, and filtering works correctly
5. ✅ SosButton remains accessible and functional on both mobile and desktop
6. ✅ Layout integrates all components properly without overlapping or spacing issues
7. ✅ Organizer has "Re-seed Venue Data" button that works via Convex or local fallback
8. ✅ Build succeeds without TypeScript errors (`npm run build` passes)

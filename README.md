# Smart Event Experience — PromptWars x Hack2Skill

A real-time event companion app that solves navigation chaos at large-scale fests. Built solo in 3.5 hours for the Hack2Skill x PromptWars challenge.

**🔗 Live Demo:** https://promptwars-v2.vercel.app  
**📦 Repository:** https://github.com/prem-thatikonda29/promptwars-v2

## The Problem

Picture this: you're at a massive fest. 10,000 people, five stages, and you're trying to find the workshop you signed up for. There's no signage that makes sense. You're flipping between a PDF schedule and a crowd you can barely see over. By the time you find the right zone, the session's half over.

Hack2Skill x PromptWars handed us exactly this chaos — confusing navigation, no easy way to discover what's happening, delayed announcements, and no fast path to help when something goes wrong.

## What I Built

Instead of spreading across every feature in the brief, I asked what actually removes the most friction for someone standing in that crowd, phone in hand, lost.

### 🗺️ Zone + Session Discovery
Every stage, food court, restroom, and help desk, plus the full session schedule, visible at a glance on one screen. Tap any zone, see exactly where it is on an interactive map with walking directions from where you stand.

- 6 venue zones with real coordinates (NESCO Hall 5, Mumbai)
- Interactive Leaflet maps with OpenStreetMap tiles
- OSRM-powered walking directions
- Interest-based session filtering

### 🆘 One-Tap SOS with Zone Detection
Tap it, and the organizer sees it live with your GPS location AND which zone you're nearest to, instantly.

- Automatic nearest zone calculation using Haversine formula
- Cooldown logic to prevent spam
- Confirmation modal for repeated alerts
- Real-time sync via Convex

### 📢 Real-Time Announcements
Organizer posts an update, every attendee's screen reflects it immediately, no refresh.

## Tech Stack

| Layer | Technology | Why |
|-------|-----------|-----|
| Frontend | Next.js 16.3.5 + React 19 | App Router, Server Components, fast builds |
| Backend | Convex 1.45.0 | Real-time queries, no websocket setup needed |
| Maps | Leaflet + react-leaflet | Free, no API key required |
| Routing | OSRM (Open Source Routing Machine) | Free walking directions API |
| Styling | Tailwind CSS 4 | Rapid UI development |
| Language | TypeScript | Type safety across full stack |

## Library Decisions

### Why Convex over Firebase/Supabase?
Convex's live queries gave us real-time SOS and announcements without writing any websocket logic. The `useQuery` hook automatically re-renders when data changes — this was the only reason the project shipped in 3.5 hours instead of sitting half-finished.

### Why Leaflet over Google Maps/Mapbox?
- **Free**: No API key required for OpenStreetMap tiles
- **Lightweight**: Smaller bundle than Mapbox GL JS
- **Control**: Full customization without licensing restrictions
- **OSRM Integration**: Free walking directions without per-request costs

### Why OSRM over Google Directions?
- **Free**: No API key, no usage limits
- **Self-hostable**: Can run our own instance if needed
- **Walking-optimized**: Better pedestrian routes than car-focused APIs

## Challenges Faced

### 1. Leaflet SSR Compatibility
**Problem**: Leaflet requires `window` object, causing "window is not defined" errors during Next.js server-side rendering.

**Solution**: Used `next/dynamic` with `{ ssr: false }` to dynamically import map components only on the client side.

### 2. Map Tile API Keys
**Problem**: CartoDB Voyager tiles (originally chosen for aesthetics) started requiring API keys, showing "REQUIRED" watermarks.

**Solution**: Switched to OpenStreetMap tiles which are completely free and don't require any authentication.

### 3. Map Z-Index Containment
**Problem**: Leaflet map containers have high default z-index, causing map previews to overflow and cover other UI elements like the SOS button and navbar.

**Solution**: Added CSS rules to set `z-index: 1` on Leaflet containers and `overflow-hidden` on zone cards to contain maps within their boundaries.

### 4. Real-Time Data vs Seed Data
**Problem**: Initially claimed "real-time" for zone/session discovery, but the data is seeded, not live-updating.

**Solution**: reframed as "instant, at-a-glance clarity" — accurate and still compelling. Real-time claims reserved only for SOS and announcements (which genuinely are real-time via Convex).

### 5. Convex Schema Migration
**Problem**: Adding `lat/lng` to zones table required schema changes that broke existing data.

**Solution**: Made fields optional with `v.optional(v.number())` for backward compatibility, then re-seeded data with Mumbai coordinates.

## Features Delivered

- ✅ Zone grid with 6 venue locations
- ✅ Interactive map previews in zone cards
- ✅ Full-screen map modal with walking directions
- ✅ Session schedule with interest tag filtering
- ✅ One-tap SOS with GPS + nearest zone detection
- ✅ Real-time announcement broadcasting
- ✅ Organizer dashboard for alerts and announcements
- ✅ Mobile-responsive design
- ✅ Offline fallback with localStorage + BroadcastChannel

## What Was Cut (On Purpose)

In 3.5 hours, you don't get to build everything. These were cut deliberately:

- Crowd heatmaps
- Accessibility-filtered routing
- AI concierge ("where's the nearest accessible restroom?")
- User authentication
- Multi-language support

## Getting Started

```bash
# Install dependencies
npm install

# Set up Convex
npx convex dev

# Run development server
npm run dev
```

Open [http://localhost:3005](http://localhost:3005)

## Environment Variables

```
CONVEX_DEPLOYMENT=your-deployment
NEXT_PUBLIC_CONVEX_URL=your-convex-url
NEXT_PUBLIC_CONVEX_SITE_URL=your-convex-site-url
```

## License

Built for Hack2Skill x PromptWars challenge. Use freely.

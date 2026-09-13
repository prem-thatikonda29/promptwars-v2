import { describe, it, expect } from 'vitest'
import { calculateDestination, calculateDistance, findNearestZone, generateVenueCoordinates } from '@/lib/venueCoordinates'

describe('calculateDestination', () => {
  it('should calculate a point north of the origin', () => {
    const result = calculateDestination(19.17, 72.85, 100, 0) // 100m north
    expect(result.lat).toBeGreaterThan(19.17)
    expect(result.lng).toBeCloseTo(72.85, 3)
  })

  it('should calculate a point east of the origin', () => {
    const result = calculateDestination(19.17, 72.85, 100, 90) // 100m east
    expect(result.lat).toBeCloseTo(19.17, 3)
    expect(result.lng).toBeGreaterThan(72.85)
  })

  it('should return same point for zero distance', () => {
    const result = calculateDestination(19.17, 72.85, 0, 45)
    expect(result.lat).toBe(19.17)
    expect(result.lng).toBe(72.85)
  })
})

describe('calculateDistance', () => {
  it('should return 0 for same point', () => {
    expect(calculateDistance(19.17, 72.85, 19.17, 72.85)).toBe(0)
  })

  it('should calculate correct distance between Mumbai and Delhi', () => {
    const distance = calculateDistance(19.0760, 72.8777, 28.7041, 77.1025)
    expect(distance).toBeGreaterThan(1100000)
    expect(distance).toBeLessThan(1200000)
  })
})

describe('findNearestZone', () => {
  const zones = [
    { name: 'Zone A', lat: 19.17, lng: 72.85 },
    { name: 'Zone B', lat: 19.20, lng: 72.90 },
    { name: 'Zone C', lat: 19.15, lng: 72.83 },
  ]

  it('should find the nearest zone', () => {
    const result = findNearestZone(19.17, 72.85, zones)
    expect(result).not.toBeNull()
    expect(result!.name).toBe('Zone A')
    expect(result!.distance).toBe(0)
  })

  it('should return null for empty zones array', () => {
    expect(findNearestZone(19.17, 72.85, [])).toBeNull()
  })

  it('should return null for null zones', () => {
    expect(findNearestZone(19.17, 72.85, null as any)).toBeNull()
  })
})

describe('generateVenueCoordinates', () => {
  it('should generate 6 zones', () => {
    const zones = generateVenueCoordinates(19.17, 72.85)
    expect(zones.length).toBe(6)
  })

  it('should have correct zone names', () => {
    const zones = generateVenueCoordinates(19.17, 72.85)
    const names = zones.map(z => z.name)
    expect(names).toContain('Main Stage')
    expect(names).toContain('Central Food Court')
    expect(names).toContain('Medical & First Aid')
  })

  it('should have correct distances', () => {
    const zones = generateVenueCoordinates(19.17, 72.85)
    expect(zones[0].distance).toBe(100)
    expect(zones[5].distance).toBe(350)
  })

  it('should generate valid coordinates', () => {
    const zones = generateVenueCoordinates(19.17, 72.85)
    zones.forEach(zone => {
      expect(zone.lat).toBeGreaterThan(19)
      expect(zone.lat).toBeLessThan(20)
      expect(zone.lng).toBeGreaterThan(72)
      expect(zone.lng).toBeLessThan(74)
    })
  })
})
import { describe, it, expect } from 'vitest'
import { haversineDistance, groupAlerts } from '@/lib/geo'

describe('haversineDistance', () => {
  it('should calculate distance between same point as 0', () => {
    const distance = haversineDistance(19.17, 72.85, 19.17, 72.85)
    expect(distance).toBe(0)
  })

  it('should calculate distance between two points correctly', () => {
    // Distance between Mumbai (19.0760, 72.8777) and Delhi (28.7041, 77.1025) is ~1150 km
    const distance = haversineDistance(19.0760, 72.8777, 28.7041, 77.1025)
    expect(distance).toBeGreaterThan(1100000) // > 1100 km
    expect(distance).toBeLessThan(1200000) // < 1200 km
  })

  it('should calculate short distance correctly', () => {
    // ~100m distance
    const distance = haversineDistance(19.1700, 72.8547, 19.1709, 72.8547)
    expect(distance).toBeGreaterThan(90)
    expect(distance).toBeLessThan(110)
  })
})

describe('groupAlerts', () => {
  const mockAlert = (id: string, lat: number, lng: number, createdAt: number, tag: 'initial' | 'repeated' = 'initial') => ({
    _id: id,
    lat,
    lng,
    createdAt,
    tag,
    status: 'open' as const,
    nearestZone: null,
  })

  it('should group nearby alerts within time window', () => {
    const now = Date.now()
    const alerts = [
      mockAlert('1', 19.1700, 72.8547, now),
      mockAlert('2', 19.1701, 72.8548, now - 10000), // 10s ago, very close
    ]
    const groups = groupAlerts(alerts, 50, 180000)
    expect(groups.length).toBe(1)
    expect(groups[0].alerts.length).toBe(2)
  })

  it('should separate distant alerts', () => {
    const now = Date.now()
    const alerts = [
      mockAlert('1', 19.1700, 72.8547, now),
      mockAlert('2', 19.2000, 72.9000, now - 10000), // ~3km away
    ]
    const groups = groupAlerts(alerts, 50, 180000)
    expect(groups.length).toBe(2)
  })

  it('should handle empty alerts', () => {
    const groups = groupAlerts([])
    expect(groups.length).toBe(0)
  })
})
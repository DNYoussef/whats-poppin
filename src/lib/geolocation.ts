// ============================================================================
// What's Poppin! - Geolocation Utilities
// File: geolocation.ts
// Description: Browser geolocation helpers
// NASA Rule 10: All functions ≤60 lines
// ============================================================================

export interface UserLocation {
  lat: number;
  lon: number;
  timestamp: number;
}

/**
 * Get user's current location
 * @returns Promise with location data
 */
export function getUserLocation(): Promise<UserLocation> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation not supported'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lon: position.coords.longitude,
          timestamp: position.timestamp
        });
      },
      (error) => {
        reject(new Error(`Geolocation error: ${error.message}`));
      },
      {
        enableHighAccuracy: false,
        timeout: 10000,
        maximumAge: 300000 // 5 minutes
      }
    );
  });
}

/**
 * Check if geolocation is available
 * @returns True if browser supports geolocation
 */
export function isGeolocationAvailable(): boolean {
  return 'geolocation' in navigator;
}

/**
 * Get cached location from localStorage
 * @returns Cached location or null
 */
export function getCachedLocation(): UserLocation | null {
  if (typeof window === 'undefined') return null;

  const cached = localStorage.getItem('user_location');
  if (!cached) return null;

  try {
    const location = JSON.parse(cached) as UserLocation;
    const age = Date.now() - location.timestamp;
    const maxAge = 30 * 60 * 1000; // 30 minutes

    if (age > maxAge) {
      localStorage.removeItem('user_location');
      return null;
    }

    return location;
  } catch {
    return null;
  }
}

/**
 * Cache user location in localStorage
 * @param location - Location to cache
 */
export function cacheLocation(location: UserLocation): void {
  if (typeof window === 'undefined') return;

  localStorage.setItem('user_location', JSON.stringify(location));
}

/**
 * Get user location with caching
 * @param forceRefresh - Force new location request
 * @returns Location data
 */
export async function getLocationWithCache(
  forceRefresh: boolean = false
): Promise<UserLocation> {
  if (!forceRefresh) {
    const cached = getCachedLocation();
    if (cached) return cached;
  }

  const location = await getUserLocation();
  cacheLocation(location);
  return location;
}

/* AGENT FOOTER BEGIN: DO NOT EDIT ABOVE THIS LINE */
// Version & Run Log
// | Version | Timestamp | Agent/Model | Change Summary | Status |
// |--------:|-----------|-------------|----------------|--------|
// | 1.0.0   | 2025-10-02T14:30:00 | coder@sonnet-4.5 | Geolocation utilities | OK |
/* AGENT FOOTER END */

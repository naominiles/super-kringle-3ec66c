import { geocodeCase } from "./geocode"
import type { CaseRecord } from "./data"

// In-memory cache for API geocoding results
const geocodeCache = new Map<string, [number, number] | null>()

/**
 * Geocode using Nominatim API (OpenStreetMap)
 * Free, no API key required, rate limit ~1 req/sec
 */
async function geocodeWithNominatim(
  city: string,
  state: string
): Promise<[number, number] | null> {
  const cacheKey = `${city.toLowerCase().trim()}, ${state.toLowerCase().trim()}`

  // Check cache first
  if (geocodeCache.has(cacheKey)) {
    return geocodeCache.get(cacheKey) ?? null
  }

  try {
    // Be respectful: add delay between requests
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const query = encodeURIComponent(`${city}, ${state}, USA`)
    const url = `https://nominatim.openstreetmap.org/search?q=${query}&format=json&limit=1`

    const response = await fetch(url, {
      headers: {
        "User-Agent": "BlackChurchBurningProject/1.0", // Required by Nominatim
      },
    })

    if (!response.ok) {
      console.error(`[geocode-api] Nominatim error: ${response.status}`)
      geocodeCache.set(cacheKey, null)
      return null
    }

    const data = await response.json()

    if (data.length === 0) {
      console.log(`[geocode-api] No results for: ${city}, ${state}`)
      geocodeCache.set(cacheKey, null)
      return null
    }

    const coords: [number, number] = [
      parseFloat(data[0].lat),
      parseFloat(data[0].lon),
    ]

    console.log(`[geocode-api] Geocoded ${city}, ${state} → ${coords}`)
    geocodeCache.set(cacheKey, coords)
    return coords
  } catch (error) {
    console.error(`[geocode-api] Error geocoding ${city}, ${state}:`, error)
    geocodeCache.set(cacheKey, null)
    return null
  }
}

/**
 * Geocode a case with fallback to Nominatim API
 * Uses hardcoded lookup first (fast), then API (slow but comprehensive)
 */
export async function geocodeCaseWithFallback(
  c: Pick<CaseRecord, "city" | "state">
): Promise<[number, number] | null> {
  // Try hardcoded lookup first (synchronous, fast)
  const hardcodedCoords = geocodeCase(c as CaseRecord)
  if (hardcodedCoords) {
    return hardcodedCoords
  }

  // Fall back to API for unknown locations
  console.log(
    `[geocode-api] Unknown location, using API: ${c.city}, ${c.state}`
  )
  return await geocodeWithNominatim(c.city, c.state)
}

"use client"

import { useRef, useEffect, useCallback } from "react"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import type { CaseRecord } from "@/lib/data"
import { geocodeCase } from "@/lib/geocode"

interface LeafletMapProps {
  cases: CaseRecord[]
  selectedCaseId: string | null
  onSelectCase: (c: CaseRecord) => void
  onBoundsChange?: (bounds: L.LatLngBounds) => void
}

export default function LeafletMap({
  cases,
  selectedCaseId,
  onSelectCase,
  onBoundsChange,
}: LeafletMapProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<L.Map | null>(null)
  const markersRef = useRef<Map<string, L.Marker>>(new Map())
  const hasInitializedBounds = useRef(false)

  // Initialize map once
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return

    const map = L.map(containerRef.current, {
      center: [33.0, -86.0],
      zoom: 6,
      zoomControl: false,
      scrollWheelZoom: true,
    })

    // Add zoom control explicitly after map init so it renders correctly on production
    L.control.zoom({ position: "bottomright" }).addTo(map)

    // Listen for map movement and zoom to update bounds
    map.on("moveend", () => {
      if (onBoundsChange) {
        onBoundsChange(map.getBounds())
      }
    })

    // Add keyboard shortcuts for zoom (Ctrl+/- or Cmd+/-)
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check for Ctrl (Windows/Linux) or Cmd (Mac)
      if (!e.ctrlKey && !e.metaKey) return

      // Ctrl/Cmd + Plus (or equals, since + requires shift)
      if (e.key === "+" || e.key === "=") {
        e.preventDefault()
        map.zoomIn()
      }
      // Ctrl/Cmd + Minus
      else if (e.key === "-" || e.key === "_") {
        e.preventDefault()
        map.zoomOut()
      }
    }

    window.addEventListener("keydown", handleKeyDown)

    // Base layer (no labels) — moderate brightness lift
    L.tileLayer(
      "https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png",
      {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>',
        maxZoom: 19,
        subdomains: "abcd",
        className: "leaflet-tile-base",
      }
    ).addTo(map)

    // Labels layer — light CARTO labels on transparent bg, no halo
    L.tileLayer(
      "https://{s}.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}{r}.png",
      {
        maxZoom: 19,
        subdomains: "abcd",
        className: "leaflet-tile-labels",
      }
    ).addTo(map)

    mapRef.current = map

    return () => {
      window.removeEventListener("keydown", handleKeyDown)
      map.remove()
      mapRef.current = null
    }
  }, [onBoundsChange])

  // Create marker icon helper
  const createIcon = useCallback((isActive: boolean) => {
    return L.divIcon({
      className: "church-marker",
      html: `<div class="marker-dot ${isActive ? "marker-dot--active" : ""}"></div>`,
      iconSize: [14, 14],
      iconAnchor: [7, 7],
    })
  }, [])

  // Render / update markers when cases or selection changes
  useEffect(() => {
    const map = mapRef.current
    if (!map) return

    // Remove old markers
    markersRef.current.forEach((m) => map.removeLayer(m))
    markersRef.current.clear()

    const bounds: L.LatLngExpression[] = []

    // Track how many markers have been placed at each coordinate to jitter duplicates
    const coordCount = new Map<string, number>()

    cases.forEach((c) => {
      const coords = geocodeCase(c)
      if (!coords) return

      // Jitter markers that share the same base coordinate
      const coordKey = `${coords[0].toFixed(4)},${coords[1].toFixed(4)}`
      const count = coordCount.get(coordKey) ?? 0
      coordCount.set(coordKey, count + 1)
      const angle = (count * 137.5 * Math.PI) / 180 // golden angle spread
      const radius = count === 0 ? 0 : 0.015 + Math.floor(count / 8) * 0.01
      const jitteredCoords: [number, number] = [
        coords[0] + radius * Math.sin(angle),
        coords[1] + radius * Math.cos(angle),
      ]

      const isActive = selectedCaseId === c.id
      const marker = L.marker(jitteredCoords, { icon: createIcon(isActive) })
        .addTo(map)
        .on("click", () => onSelectCase(c))

      marker.bindTooltip(c.churchName, {
        permanent: false,
        direction: "top",
        offset: [0, -10],
        className: "church-tooltip",
      })

      markersRef.current.set(c.id, marker)
      bounds.push(jitteredCoords)
    })

    // Fit bounds only once on initial load
    if (bounds.length > 0 && !hasInitializedBounds.current) {
      const group = L.latLngBounds(bounds)
      map.fitBounds(group, { padding: [50, 50], maxZoom: 8 })
      hasInitializedBounds.current = true
    }
  }, [cases, selectedCaseId, onSelectCase, createIcon])

  // Pan to selected marker (preserve current zoom level)
  useEffect(() => {
    if (!selectedCaseId || !mapRef.current) return
    const marker = markersRef.current.get(selectedCaseId)
    if (marker) {
      mapRef.current.panTo(marker.getLatLng(), { animate: true })
    }
  }, [selectedCaseId])

  return (
    <div
      ref={containerRef}
      className="h-full w-full min-h-[400px] lg:min-h-[600px]"
    />
  )
}

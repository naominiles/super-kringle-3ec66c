"use client"

import { useState, useMemo, useCallback } from "react"
import dynamic from "next/dynamic"
import { MapPin, Search, Loader2 } from "lucide-react"
import useSWR from "swr"
import {
  incidentTypes,
  getIncidentColor,
  type CaseRecord,
} from "@/lib/data"
import { geocodeCase } from "@/lib/geocode"
import { CaseDetail } from "@/components/case-detail"

// Type for map bounds to avoid importing Leaflet
type MapBounds = {
  _southWest: { lat: number; lng: number }
  _northEast: { lat: number; lng: number }
}

const LeafletMap = dynamic(() => import("@/components/leaflet-map"), {
  ssr: false,
  loading: () => (
    <div className="flex flex-1 flex-col items-center justify-center border border-border bg-card min-h-[400px] lg:min-h-[600px]">
      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      <p className="mt-2 text-xs text-muted-foreground">Loading map...</p>
    </div>
  ),
})

const fetcher = (url: string) => fetch(url).then((r) => r.json())

interface MapViewProps {
  onFlagError?: (churchName: string) => void
}

export function MapView({ onFlagError }: MapViewProps) {
  const { data, error, isLoading } = useSWR<{ cases: CaseRecord[] }>(
    "/api/cases",
    fetcher,
    { revalidateOnFocus: false }
  )

  const cases = data?.cases ?? []

  const [selectedCase, setSelectedCase] = useState<CaseRecord | null>(null)
  const handleSelectCase = useCallback((c: CaseRecord) => setSelectedCase(c), [])
  const [stateFilter, setStateFilter] = useState("")
  const [typeFilter, setTypeFilter] = useState("")
  const [yearFilter, setYearFilter] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [mapBounds, setMapBounds] = useState<MapBounds | null>(null)
  const [showOnlyInView, setShowOnlyInView] = useState(false)

  // Expand state abbreviations to full names for display
  const STATE_NAMES: Record<string, string> = {
    AL: "Alabama", AK: "Alaska", AZ: "Arizona", AR: "Arkansas", CA: "California",
    CO: "Colorado", CT: "Connecticut", DE: "Delaware", FL: "Florida", GA: "Georgia",
    HI: "Hawaii", ID: "Idaho", IL: "Illinois", IN: "Indiana", IA: "Iowa",
    KS: "Kansas", KY: "Kentucky", LA: "Louisiana", ME: "Maine", MD: "Maryland",
    MA: "Massachusetts", MI: "Michigan", MN: "Minnesota", MS: "Mississippi",
    MO: "Missouri", MT: "Montana", NE: "Nebraska", NV: "Nevada", NH: "New Hampshire",
    NJ: "New Jersey", NM: "New Mexico", NY: "New York", NC: "North Carolina",
    ND: "North Dakota", OH: "Ohio", OK: "Oklahoma", OR: "Oregon", PA: "Pennsylvania",
    RI: "Rhode Island", SC: "South Carolina", SD: "South Dakota", TN: "Tennessee",
    TX: "Texas", UT: "Utah", VT: "Vermont", VA: "Virginia", WA: "Washington",
    WV: "West Virginia", WI: "Wisconsin", WY: "Wyoming", DC: "District of Columbia",
  }

  const normalizeState = (s: string) =>
    STATE_NAMES[s.trim().toUpperCase()] ?? s.trim()

  // Extract year from date string (handles "1965", "Spring 1965", "6/29/58", etc.)
  const extractYear = (dateStr: string): string | null => {
    const match = dateStr.match(/\b(19\d{2}|20\d{2})\b/)
    return match ? match[1] : null
  }

  const states = useMemo(() => {
    return [...new Set(cases.map((c) => normalizeState(c.state)))].filter(Boolean).sort()
  }, [cases])

  const years = useMemo(() => {
    const yearSet = new Set(
      cases.map((c) => extractYear(c.date)).filter((y): y is string => y !== null)
    )
    return Array.from(yearSet).sort()
  }, [cases])

  const filteredCases = useMemo(() => {
    const q = searchQuery.toLowerCase().trim()
    return cases.filter((c) => {
      if (stateFilter && normalizeState(c.state) !== stateFilter) return false
      if (typeFilter && c.incidentType !== typeFilter) return false
      if (yearFilter && extractYear(c.date) !== yearFilter) return false
      if (q && !c.churchName.toLowerCase().includes(q) && !c.city.toLowerCase().includes(q))
        return false
      return true
    })
  }, [cases, stateFilter, typeFilter, yearFilter, searchQuery])

  // Filter cases by map bounds when "show only in view" is enabled
  const visibleCases = useMemo(() => {
    if (!showOnlyInView || !mapBounds) return filteredCases
    
    return filteredCases.filter((c) => {
      const coords = geocodeCase(c)
      if (!coords) return false
      const [lat, lng] = coords
      // Check if coordinate is within bounds
      return (
        lat >= mapBounds._southWest.lat &&
        lat <= mapBounds._northEast.lat &&
        lng >= mapBounds._southWest.lng &&
        lng <= mapBounds._northEast.lng
      )
    })
  }, [filteredCases, showOnlyInView, mapBounds])

  return (
    <section className="mx-auto max-w-7xl px-6 py-8">
      <h2 className="font-serif text-2xl font-bold text-foreground md:text-3xl">
        Case Map
      </h2>
      <p className="mt-2 text-sm text-muted-foreground">
        Browse documented incidents by location, date, or type.
      </p>

      {error && (
        <div className="mt-6 border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          Failed to load cases. Please try again later.
        </div>
      )}

      <div className="mt-6 flex flex-col gap-6 lg:flex-row">
        {/* Sidebar */}
        <div className="flex w-full flex-col gap-4 lg:w-80 lg:shrink-0">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by name or city..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-card py-2.5 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground border border-border focus:border-primary focus:outline-none"
            />
          </div>

          {/* Filters */}
          <div className="flex flex-col gap-3">
            <div className="flex gap-3">
              <select
                value={stateFilter}
                onChange={(e) => setStateFilter(e.target.value)}
                className="flex-1 bg-card px-3 py-2.5 text-sm text-foreground border border-border focus:border-primary focus:outline-none"
              >
                <option value="">All States</option>
                {states.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="flex-1 bg-card px-3 py-2.5 text-sm text-foreground border border-border focus:border-primary focus:outline-none"
              >
                <option value="">All Types</option>
                {incidentTypes.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>
            <select
              value={yearFilter}
              onChange={(e) => setYearFilter(e.target.value)}
              className="bg-card px-3 py-2.5 text-sm text-foreground border border-border focus:border-primary focus:outline-none"
            >
              <option value="">All Years</option>
              {years.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
            <label className="flex items-center gap-2 text-sm text-foreground cursor-pointer">
              <input
                type="checkbox"
                checked={showOnlyInView}
                onChange={(e) => setShowOnlyInView(e.target.checked)}
                className="h-4 w-4 text-primary border-border focus:ring-primary"
              />
              <span>Show only cases in map view</span>
            </label>
          </div>

          {/* Results count */}
          <p className="text-xs text-muted-foreground">
            {isLoading
              ? "Loading..."
              : `${visibleCases.length} case${visibleCases.length !== 1 ? "s" : ""} ${showOnlyInView ? "in view" : "found"}`}
          </p>

          {/* Case list */}
          <div className="flex flex-col gap-2 max-h-[60vh] overflow-y-auto pr-1">
            {isLoading && (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            )}

            {!isLoading && visibleCases.length === 0 && (
              <p className="py-8 text-center text-sm text-muted-foreground">
                No cases match your filters.
              </p>
            )}
            {visibleCases.map((c) => (
              <button
                key={c.id}
                onClick={() => setSelectedCase(c)}
                className={`flex flex-col items-start gap-1.5 border p-4 text-left transition-colors ${
                  selectedCase?.id === c.id
                    ? "border-primary bg-primary/5"
                    : "border-border bg-card hover:border-muted-foreground"
                }`}
              >
                <span className="text-sm font-medium text-foreground">
                  {c.churchName}
                </span>
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <MapPin className="h-3 w-3" />
                  {c.city}, {c.state}
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">
                    {c.date}
                  </span>
                  <span
                    className={`rounded-sm px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wider ${getIncidentColor(
                      c.incidentType
                    )}`}
                  >
                    {c.incidentType}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Leaflet Map — relative z-0 creates a stacking context so Leaflet's internal z-indexes stay contained */}
        <div className="relative z-0 flex-1 border border-border bg-card overflow-hidden min-h-[400px] lg:min-h-[600px]">
          <LeafletMap
            cases={filteredCases}
            selectedCaseId={selectedCase?.id ?? null}
            onSelectCase={handleSelectCase}
            onBoundsChange={setMapBounds}
          />
        </div>
      </div>

      {/* Case detail panel */}
      {selectedCase && (
        <CaseDetail
          caseData={selectedCase}
          onClose={() => setSelectedCase(null)}
          onFlagError={onFlagError}
        />
      )}
    </section>
  )
}

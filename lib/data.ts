export type IncidentType = "Burning" | "Bombing" | "Vandalism" | "Other"

export interface CaseRecord {
  id: string
  churchName: string
  city: string
  state: string
  date: string
  dateNotes?: string
  incidentType: IncidentType
  description: string
  perpetrators: string
  outcome: string
  sources: string
  photos?: { url: string; filename: string }[]
  lat: number
  lng: number
}

export const incidentTypes: { value: string; label: string }[] = [
  { value: "Burning", label: "Burning" },
  { value: "Bombing", label: "Bombing" },
  { value: "Vandalism", label: "Vandalism" },
  { value: "Other", label: "Other" },
]

export const perpetratorOptions: { value: string; label: string }[] = [
  { value: "Known", label: "Known" },
  { value: "Unknown", label: "Unknown" },
]

export function getIncidentColor(type: string): string {
  switch (type) {
    case "Burning":
      return "bg-primary/20 text-primary"
    case "Bombing":
      return "bg-red-900/30 text-red-400"
    case "Vandalism":
      return "bg-yellow-900/30 text-yellow-400"
    default:
      return "bg-muted text-muted-foreground"
  }
}

/** Map an Airtable record to our CaseRecord shape.
 *  Actual Airtable field names (from Meta API):
 *  Name, Notes, Assignee, Status, Church name, City, State, Date,
 *  Incident type, Description, Perpetrators (known/unknown),
 *  Legal outcome, Sources/Citations, Photos or Media
 */
export function mapAirtableRecord(record: {
  id: string
  fields: Record<string, unknown>
}): CaseRecord {
  const f = record.fields
  return {
    id: record.id,
    churchName: (f["Church name"] as string) ?? "",
    city: (f["City"] as string) ?? "",
    state: (f["State"] as string) ?? "",
    date: (f["Date"] as string) ?? "",
    dateNotes: (f["Notes"] as string) ?? undefined,
    incidentType: (f["Incident type"] as IncidentType) ?? "Other",
    description: (f["Description"] as string) ?? "",
    perpetrators: (f["Perpetrators (known/unknown)"] as string) ?? "",
    outcome: (f["Legal outcome"] as string) ?? "",
    sources: (f["Sources/Citations"] as string) ?? "",
    photos: Array.isArray(f["Photos or Media"])
      ? (f["Photos or Media"] as { url: string; filename: string }[])
      : undefined,
    lat: 0,
    lng: 0,
  }
}

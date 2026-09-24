import { NextResponse } from "next/server"
import { mapAirtableRecord } from "@/lib/data"
import { geocodeCaseWithFallback } from "@/lib/geocode-api"

const AIRTABLE_TOKEN = "patwUzfjD9FXYflII.3ff6962deea260b59152184cdc4e6ff448b2903e74d459d0530d6d631db6b9d9"


const BASE_ID = "appyd4Tt9kwX4VzWv"
const TABLE_ID = "tbl4jcKxkQb4REasY"
const TABLE_PATH = `${BASE_ID}/${TABLE_ID}`

export async function GET() {
  try {
    const filterFormula = encodeURIComponent("Status = 'Done'")
    const fields = [
      "Church name",
      "City",
      "State",
      "Date",
      "Notes",
      "Incident type",
      "Description",
      "Legal outcome",
      "Sources/Citations",
      "Photos or Media",
    ]
      .map((f) => `fields[]=${encodeURIComponent(f)}`)
      .join("&")

    const baseUrl = `https://api.airtable.com/v0/${TABLE_PATH}?filterByFormula=${filterFormula}&${fields}`
    const headers = { Authorization: `Bearer ${AIRTABLE_TOKEN}` }

    let allRecords: { id: string; fields: Record<string, unknown> }[] = []
    let offset: string | undefined

    do {
      const offsetParam = offset ? `&offset=${offset}` : ""
      const response = await fetch(`${baseUrl}${offsetParam}`, { headers })

      if (!response.ok) {
        const errorText = await response.text()
        console.error("Airtable API error:", response.status, errorText)
        return NextResponse.json(
          { error: "Failed to fetch cases from Airtable" },
          { status: 502 }
        )
      }

      const data = await response.json()
      allRecords = [...allRecords, ...data.records]
      offset = data.offset
    } while (offset)

    const cases = allRecords.map(mapAirtableRecord)

    // Geocode all cases with API fallback for unknown locations
    const geocodedCases = await Promise.all(
      cases.map(async (c) => {
        const coords = await geocodeCaseWithFallback(c)
        return {
          ...c,
          lat: coords?.[0] ?? c.lat,
          lng: coords?.[1] ?? c.lng,
        }
      })
    )

    return NextResponse.json({ cases: geocodedCases }, {
      headers: {
        "Cache-Control": "no-store",
      },
    })
  } catch (error) {
    console.error("Error fetching cases:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

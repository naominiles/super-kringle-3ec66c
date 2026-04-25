import { NextResponse } from "next/server"

const BASE_ID = "appyd4Tt9kwX4VzWv"
const TABLE_ID = "tbl4jcKxkQb4REasY"
const TABLE_PATH = `${BASE_ID}/${TABLE_ID}`

const AIRTABLE_TOKEN = "patwUzfjD9FXYflII.3ff6962deea260b59152184cdc4e6ff448b2903e74d459d0530d6d631db6b9d9"

export async function POST(request: Request) {
  try {
    const formData = await request.json()

    // Basic validation
    if (!formData.churchName || !formData.city || !formData.state || !formData.incidentType) {
      return NextResponse.json(
        { error: "Church Name, City, State, and Incident Type are required." },
        { status: 400 }
      )
    }

    const url = `https://api.airtable.com/v0/${TABLE_PATH}`

    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${AIRTABLE_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        records: [
          {
            fields: {
              "Church name": formData.churchName,
              "City": formData.city,
              "State": formData.state,
              "Incident type": formData.incidentType,
              "Status": "Todo",
              // Only include optional fields when they have a value
              // Select fields must not receive null or empty strings
              ...(formData.description ? { "Description": formData.description } : {}),
              ...(formData.date ? { "Date": formData.date } : {}),
              ...(formData.dateNotes ? { "Notes": formData.dateNotes } : {}),
              ...(formData.perpetrators ? { "Perpetrators (known/unknown)": formData.perpetrators } : {}),
              ...(formData.legalOutcome ? { "Legal outcome": formData.legalOutcome } : {}),
              ...(formData.sources ? { "Sources/Citations": formData.sources } : {}),
            },
          },
        ],
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.log("[v0] Airtable submit error:", response.status, errorText)
      return NextResponse.json(
        { error: "Failed to submit case to Airtable" },
        { status: 502 }
      )
    }

    const data = await response.json()
    return NextResponse.json({ success: true, record: data.records[0] })
  } catch (error) {
    console.error("Error submitting case:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

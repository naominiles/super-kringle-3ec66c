import { NextResponse } from "next/server"

const BASE_ID = "appyd4Tt9kwX4VzWv"
const CONTACT_TABLE_ID = "tblRkYqFvHQKOhAPP"

// Map form values to Airtable select options
const subjectMap: Record<string, string> = {
  general: "General Inquiry",
  correction: "Data Correction",
  research: "Research Collaboration",
  media: "Media / Press",
  volunteer: "Volunteering",
  other: "Other",
}

const AIRTABLE_TOKEN = "patwUzfjD9FXYflII.3ff6962deea260b59152184cdc4e6ff448b2903e74d459d0530d6d631db6b9d9"

export async function POST(request: Request) {
  try {
    const formData = await request.json()

    if (!formData.name || !formData.email || !formData.message) {
      return NextResponse.json(
        { error: "Name, email, and message are required." },
        { status: 400 }
      )
    }

    const url = `https://api.airtable.com/v0/${BASE_ID}/${CONTACT_TABLE_ID}`

    const airtableFields: Record<string, string> = {
      Name: formData.name,
      Email: formData.email,
      Message: formData.message,
      Status: "Todo",
    }

    // Only include Subject if a valid option was selected
    const subject = subjectMap[formData.subject]
    if (subject) {
      airtableFields["Subject"] = subject
    }

    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${AIRTABLE_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        records: [{ fields: airtableFields }],
      }),
    })

    const responseText = await response.text()
    console.log("[v0] Contact Airtable response:", response.status, responseText)

    if (!response.ok) {
      return NextResponse.json(
        { error: "Failed to submit message." },
        { status: 502 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("Contact form error:", err)
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    )
  }
}


// Finds and deletes any test/sample records from the Cases table
// Identifies them by church names used in the seed script

const TOKEN = "patwUzfjD9FXYflII.3ff6962deea260b59152184cdc4e6ff448b2903e74d459d0530d6d631db6b9d9"
const BASE = "appyd4Tt9kwX4VzWv"
const TABLE = "tbl4jcKxkQb4REasY"
const BASE_URL = `https://api.airtable.com/v0/${BASE}/${TABLE}`
const HEADERS = { Authorization: `Bearer ${TOKEN}`, "Content-Type": "application/json" }

// Exact record IDs identified from listing all records
const IDS_TO_DELETE = [
  "rec88pvBKnRshJsWI", // 16th Street Baptist
  "recbJZ8xZhqbT2vwm", // Emanuel AME
  "rec5SfitfSIP6z5im", // Mt. Zion AME
]

async function main() {
  const params = IDS_TO_DELETE.map(id => `records[]=${id}`).join("&")
  const res = await fetch(`${BASE_URL}?${params}`, {
    method: "DELETE",
    headers: HEADERS,
  })
  const data = await res.json()
  if (!res.ok) { console.error("Delete error:", JSON.stringify(data)); process.exit(1) }
  console.log(`Successfully deleted ${data.records.length} record(s):`)
  data.records.forEach(r => console.log(` - ${r.id}`))
}

main().catch(console.error)

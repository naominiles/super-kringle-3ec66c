import { fetch } from "undici"

const AIRTABLE_TOKEN = "patwUzfjD9FXYflII.3ff6962deea260b59152184cdc4e6ff448b2903e74d459d0530d6d631db6b9d9"
const BASE_ID = "appyd4Tt9kwX4VzWv"
const TABLE_ID = "tbl4jcKxkQb4REasY"
const BASE_URL = `https://api.airtable.com/v0/${BASE_ID}/${TABLE_ID}`
const HEADERS = {
  Authorization: `Bearer ${AIRTABLE_TOKEN}`,
  "Content-Type": "application/json",
}

async function fetchAllRecords() {
  let records = []
  let offset
  do {
    let url = `${BASE_URL}?fields[]=Church+name&fields[]=Date&fields[]=Description`
    if (offset) url += `&offset=${offset}`
    const res = await fetch(url, { headers: HEADERS })
    const data = await res.json()
    if (!res.ok) { console.error("Fetch error:", JSON.stringify(data)); process.exit(1) }
    records = records.concat(data.records)
    offset = data.offset
  } while (offset)
  return records
}

async function patchRecord(id, description) {
  const res = await fetch(`${BASE_URL}/${id}`, {
    method: "PATCH",
    headers: HEADERS,
    body: JSON.stringify({ fields: { Description: description } }),
  })
  const data = await res.json()
  if (!res.ok) { console.error("Patch error:", JSON.stringify(data)); return false }
  return true
}

function extractYear(dateStr) {
  const m = (dateStr || "").match(/\b(19\d{2}|20\d{2})\b/)
  return m ? m[1] : null
}

function findRecord(all, namePart, year) {
  return all.find(r =>
    (r.fields["Church name"] || "").toLowerCase().includes(namePart.toLowerCase()) &&
    extractYear(r.fields["Date"] || "") === year
  )
}

async function main() {
  console.log("Fetching records...")
  const all = await fetchAllRecords()
  console.log(`Fetched ${all.length} records`)

  const jobs = []

  // Helper: transform description then patch
  async function apply(namePart, year, transform) {
    const rec = findRecord(all, namePart, year)
    if (!rec) { console.log(`NOT FOUND: ${namePart} (${year})`); return }
    const current = rec.fields["Description"] || ""
    const updated = transform(current)
    if (updated === current) { console.log(`NO CHANGE: ${namePart} (${year})`); return }
    const ok = await patchRecord(rec.id, updated)
    console.log(ok ? `UPDATED: ${rec.fields["Church name"]} (${year})` : `FAILED: ${namePart} (${year})`)
  }

  // Mt. Zion Methodist 1964 – add Freedom Summer context
  await apply("Mt. Zion Methodist", "1964", (d) =>
    d.includes("Chaney") ? d :
    d + " The church had been used as a meeting place by Freedom Summer activists James Chaney, Andrew Goodman, and Michael Schwerner, who were murdered just days after the burning."
  )

  // St. Rest Baptist 1961 – expand CORE
  await apply("St. Rest Baptist", "1961", (d) =>
    d.includes("CORE (Congress") ? d : d.replace("CORE", "CORE (Congress of Racial Equality)")
  )

  // Mount Mary Baptist 1958 – expand SNCC
  await apply("Mount Mary Baptist", "1958", (d) =>
    d.includes("SNCC (Student") ? d : d.replace("SNCC", "SNCC (Student Nonviolent Coordinating Committee)")
  )

  // Mount Olive Baptist 1958 – expand SNCC
  await apply("Mount Olive Baptist", "1958", (d) =>
    d.includes("SNCC (Student") ? d : d.replace("SNCC", "SNCC (Student Nonviolent Coordinating Committee)")
  )

  // Shady Grove Baptist 1962 – expand SNCC
  await apply("Shady Grove Baptist", "1962", (d) =>
    d.includes("SNCC (Student") ? d : d.replace("SNCC", "SNCC (Student Nonviolent Coordinating Committee)")
  )

  // High Hope Baptist 1952 – expand SNCC
  await apply("High Hope Baptist", "1952", (d) =>
    d.includes("SNCC (Student") ? d : d.replace("SNCC", "SNCC (Student Nonviolent Coordinating Committee)")
  )

  // First African Baptist 1964 – policeman → policemen
  await apply("First African Baptist", "1964", (d) =>
    d.replace(/\bpoliceman\b/g, "policemen")
  )

  // Mt. Olive Baptist 1957 – coiniced → coincided
  await apply("Mt. Olive Baptist", "1957", (d) =>
    d.replace(/coiniced/g, "coincided")
  )

  // Church of the Holy Ghost 1964 – speaks → spoke
  await apply("Church of the Holy Ghost", "1964", (d) =>
    d.replace(/\bspeaks\b/g, "spoke")
  )

  console.log("Done.")
}

main().catch(err => { console.error(err); process.exit(1) })

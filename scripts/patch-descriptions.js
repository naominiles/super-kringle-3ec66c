// Patch specific Airtable case descriptions based on reviewer feedback
const AIRTABLE_TOKEN = "patwUzfjD9FXYflII.3ff6962deea260b59152184cdc4e6ff448b2903e74d459d0530d6d631db6b9d9"
const BASE_ID = "appyd4Tt9kwX4VzWv"
const TABLE_ID = "tbl4jcKxkQb4REasY"
const BASE_URL = `https://api.airtable.com/v0/${BASE_ID}/${TABLE_ID}`
const HEADERS = {
  Authorization: `Bearer ${AIRTABLE_TOKEN}`,
  "Content-Type": "application/json",
}

// Each entry: match by church name + year in date field, then apply field patches
// Using substring matches to be resilient to slight name variations
const PATCHES = [
  {
    match: { name: "Mt. Zion Methodist", year: "1964" },
    fields: {
      Description: "Mt. Zion Methodist Church was burned in June 1964, just days before the murders of Freedom Summer activists Chaney, Goodman, and Schwerner, who had been using the church as a meeting place for voter registration efforts. The burning was widely understood as an act of intimidation against civil rights organizers operating in Neshoba County.",
    },
  },
  {
    match: { name: "St. Rest Baptist", year: "1961" },
    // Expand CORE acronym
    patch: "expandAcronym",
    acronym: { abbr: "CORE", full: "CORE (Congress of Racial Equality)" },
  },
  {
    match: { name: "Mount Mary Baptist", year: "1958" },
    patch: "expandAcronym",
    acronym: { abbr: "SNCC", full: "SNCC (Student Nonviolent Coordinating Committee)" },
  },
  {
    match: { name: "Mount Olive Baptist", year: "1958" },
    patch: "expandAcronym",
    acronym: { abbr: "SNCC", full: "SNCC (Student Nonviolent Coordinating Committee)" },
  },
  {
    match: { name: "Shady Grove Baptist", year: "1962" },
    patch: "expandAcronym",
    acronym: { abbr: "SNCC", full: "SNCC (Student Nonviolent Coordinating Committee)" },
  },
  {
    match: { name: "High Hope Baptist", year: "1952" },
    patch: "expandAcronym",
    acronym: { abbr: "SNCC", full: "SNCC (Student Nonviolent Coordinating Committee)" },
  },
  {
    match: { name: "First African Baptist", year: "1964" },
    patch: "wordFix",
    find: "policeman",
    replace: "policemen",
  },
  {
    match: { name: "Mt. Olive Baptist", year: "1957" },
    patch: "wordFix",
    find: "coiniced",
    replace: "coincided",
  },
  {
    match: { name: "Church of the Holy Ghost", year: "1964" },
    patch: "wordFix",
    find: "speaks",
    replace: "spoke",
  },
]

async function fetchAllRecords() {
  let records = []
  let offset
  do {
    const url = `${BASE_URL}?fields[]=Church+name&fields[]=Date&fields[]=Description${offset ? `&offset=${offset}` : ""}`
    const res = await fetch(url, { headers: HEADERS })
    const data = await res.json()
    if (!res.ok) { console.error("Fetch error:", data); process.exit(1) }
    records = [...records, ...data.records]
    offset = data.offset
  } while (offset)
  return records
}

async function patchRecord(id, fields) {
  const res = await fetch(`${BASE_URL}/${id}`, {
    method: "PATCH",
    headers: HEADERS,
    body: JSON.stringify({ fields }),
  })
  const data = await res.json()
  if (!res.ok) { console.error("Patch error:", data); return false }
  return true
}

function extractYear(dateStr) {
  const match = (dateStr || "").match(/\b(19\d{2}|20\d{2})\b/)
  return match ? match[1] : null
}

async function main() {
  console.log("Fetching all records...")
  const all = await fetchAllRecords()
  console.log(`Total records: ${all.length}`)

  let updated = 0
  let skipped = 0

  for (const patch of PATCHES) {
    const { match } = patch
    const record = all.find((r) => {
      const name = (r.fields["Church name"] || "").toLowerCase()
      const year = extractYear(r.fields["Date"] || "")
      return name.includes(match.name.toLowerCase()) && year === match.year
    })

    if (!record) {
      console.log(`  NOT FOUND: ${match.name} (${match.year})`)
      skipped++
      continue
    }

    const currentDesc = record.fields["Description"] || ""
    let newDesc = currentDesc

    if (patch.fields) {
      // Full description replacement
      newDesc = patch.fields.Description
    } else if (patch.patch === "expandAcronym") {
      const { abbr, full } = patch.acronym
      // Only replace first occurrence to avoid doubling
      if (currentDesc.includes(full)) {
        console.log(`  SKIP (already expanded): ${match.name} (${match.year})`)
        skipped++
        continue
      }
      newDesc = currentDesc.replace(abbr, full)
    } else if (patch.patch === "wordFix") {
      newDesc = currentDesc.replace(new RegExp(patch.find, "g"), patch.replace)
    }

    if (newDesc === currentDesc) {
      console.log(`  NO CHANGE: ${match.name} (${match.year})`)
      skipped++
      continue
    }

    const ok = await patchRecord(record.id, { Description: newDesc })
    if (ok) {
      console.log(`  UPDATED: ${record.fields["Church name"]} (${match.year}) [${record.id}]`)
      updated++
    }
  }

  console.log(`\nDone. Updated: ${updated}, Skipped/not found: ${skipped}`)
}

main().catch(console.error)

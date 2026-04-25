const AIRTABLE_TOKEN = process.env.AIRTABLE_TOKEN;
const BASE_ID = process.env.AIRTABLE_BASE_ID;

if (!AIRTABLE_TOKEN || !BASE_ID) {
  console.error("Missing AIRTABLE_TOKEN or AIRTABLE_BASE_ID environment variables.");
  process.exit(1);
}

const baseId = BASE_ID.includes("/") ? BASE_ID.split("/")[0] : BASE_ID;
const META_URL = `https://api.airtable.com/v0/meta/bases/${baseId}/tables`;
const headers = {
  Authorization: `Bearer ${AIRTABLE_TOKEN}`,
  "Content-Type": "application/json",
};

// ---- Step 1: Discover existing tables ----
async function getTables() {
  const res = await fetch(META_URL, { headers });
  if (!res.ok) {
    console.error("Failed to fetch tables:", res.status, await res.text());
    process.exit(1);
  }
  const data = await res.json();
  return data.tables;
}

// ---- Step 2: Create a table via Meta API ----
async function createTable(name, fields) {
  const res = await fetch(META_URL, {
    method: "POST",
    headers,
    body: JSON.stringify({ name, fields }),
  });
  if (!res.ok) {
    console.error(`Failed to create table "${name}":`, res.status, await res.text());
    process.exit(1);
  }
  const data = await res.json();
  console.log(`Created table "${name}" with ID: ${data.id}`);
  return data;
}

// ---- Cases table schema ----
const casesFields = [
  { name: "Church name", type: "singleLineText" },
  { name: "City", type: "singleLineText" },
  { name: "State", type: "singleLineText" },
  { name: "Date", type: "date", options: { dateFormat: { name: "iso" } } },
  { name: "Notes", type: "multilineText" },
  {
    name: "Incident type",
    type: "singleSelect",
    options: { choices: [{ name: "Bombing" }, { name: "Burning" }, { name: "Other" }] },
  },
  { name: "Description", type: "multilineText" },
  {
    name: "Perpetrators (known/unknown)",
    type: "singleSelect",
    options: { choices: [{ name: "Known" }, { name: "Unknown" }] },
  },
  { name: "Legal outcome", type: "multilineText" },
  { name: "Sources/Citations", type: "multilineText" },
  {
    name: "Photos or Media",
    type: "multipleAttachments",
  },
  {
    name: "Status",
    type: "singleSelect",
    options: { choices: [{ name: "Todo" }, { name: "In progress" }, { name: "Done" }] },
  },
];

// ---- Contact Messages table schema ----
const contactFields = [
  { name: "Name", type: "singleLineText" },
  { name: "Email", type: "email" },
  {
    name: "Subject",
    type: "singleSelect",
    options: {
      choices: [
        { name: "General Inquiry" },
        { name: "Data Correction" },
        { name: "Research Collaboration" },
        { name: "Media / Press" },
        { name: "Volunteering" },
      ],
    },
  },
  { name: "Message", type: "multilineText" },
  {
    name: "Status",
    type: "singleSelect",
    options: { choices: [{ name: "New" }, { name: "Read" }, { name: "Replied" }] },
  },
];

// ---- Sample data ----
const exampleCases = [
  {
    fields: {
      "Church name": "16th Street Baptist Church",
      "City": "Birmingham",
      "State": "Alabama",
      "Date": "1963-09-15",
      "Incident type": "Bombing",
      "Description":
        "Members of the Ku Klux Klan planted a box of dynamite beneath the steps of the 16th Street Baptist Church. The explosion killed four young girls — Addie Mae Collins (14), Cynthia Wesley (14), Carole Robertson (14), and Carol Denise McNair (11) — and injured 22 others.",
      "Perpetrators (known/unknown)": "Known",
      "Legal outcome":
        "Robert Chambliss convicted of first-degree murder in 1977. Thomas Blanton Jr. convicted in 2001. Bobby Frank Cherry convicted in 2002.",
      "Sources/Citations":
        "FBI case file 157-352; Spike Lee, '4 Little Girls' (1997); Doug Jones, 'Bending Toward Justice' (2019)",
      "Status": "Done",
    },
  },
  {
    fields: {
      "Church name": "Mt. Zion AME Church",
      "City": "Greeleyville",
      "State": "South Carolina",
      "Date": "1995-06-20",
      "Incident type": "Burning",
      "Description":
        "Mt. Zion AME Church, a historic Black congregation dating to 1876, was destroyed by arson. The attack occurred during a wave of church burnings across the South in the mid-1990s.",
      "Perpetrators (known/unknown)": "Known",
      "Legal outcome":
        "Timothy Scott and Gary Cox were convicted on federal arson and conspiracy charges in 1996.",
      "Sources/Citations":
        "Church Arson Prevention Act of 1996; NPR coverage, June 1996; PBS 'The Rise and Fall of Jim Crow'",
      "Status": "Done",
    },
  },
  {
    fields: {
      "Church name": "Emanuel AME Church",
      "City": "Charleston",
      "State": "South Carolina",
      "Date": "2015-06-17",
      "Incident type": "Other",
      "Description":
        "A white supremacist gunman entered a Wednesday evening Bible study at Emanuel AME Church and killed nine parishioners including senior pastor and state senator Clementa C. Pinckney.",
      "Perpetrators (known/unknown)": "Known",
      "Legal outcome":
        "Dylann Roof convicted on 33 federal charges including hate crimes. Sentenced to death in January 2017.",
      "Sources/Citations":
        "DOJ press release, Jan 2017; Jennifer Berry Hawes, 'Grace Will Lead Us Home' (2019); The New York Times, June 18, 2015",
      "Status": "Done",
    },
  },
];

async function migrate() {
  console.log("=== Step 1: Discovering existing tables ===");
  const existingTables = await getTables();
  console.log(`Found ${existingTables.length} table(s):`);
  for (const t of existingTables) {
    console.log(`  - "${t.name}" (${t.id})`);
  }

  // ---- Create or find Cases table ----
  let casesTable = existingTables.find(
    (t) => t.name.toLowerCase() === "cases"
  );
  if (!casesTable) {
    console.log("\n=== Step 2a: Creating Cases table ===");
    casesTable = await createTable("Cases", casesFields);
  } else {
    console.log(`\nCases table already exists: ${casesTable.id}`);
  }

  // ---- Create or find Contact Messages table ----
  let contactTable = existingTables.find(
    (t) => t.name.toLowerCase() === "contact messages"
  );
  if (!contactTable) {
    console.log("\n=== Step 2b: Creating Contact Messages table ===");
    contactTable = await createTable("Contact Messages", contactFields);
  } else {
    console.log(`\nContact Messages table already exists: ${contactTable.id}`);
  }

  // ---- Seed example cases ----
  console.log("\n=== Step 3: Seeding example cases ===");
  const seedUrl = `https://api.airtable.com/v0/${baseId}/${casesTable.id}`;
  const seedRes = await fetch(seedUrl, {
    method: "POST",
    headers,
    body: JSON.stringify({ records: exampleCases }),
  });

  if (!seedRes.ok) {
    console.error("Failed to seed cases:", seedRes.status, await seedRes.text());
    process.exit(1);
  }

  const seedData = await seedRes.json();
  console.log(`Created ${seedData.records.length} example cases:`);
  for (const r of seedData.records) {
    console.log(`  - ${r.fields["Church name"]} (${r.id})`);
  }

  // ---- Print summary ----
  console.log("\n========================================");
  console.log("MIGRATION COMPLETE");
  console.log("========================================");
  console.log(`Cases table ID:            ${casesTable.id}`);
  console.log(`Contact Messages table ID: ${contactTable.id}`);
  console.log("========================================");
  console.log("UPDATE THESE TABLE IDS IN:");
  console.log("  - app/api/cases/route.ts");
  console.log("  - app/api/cases/submit/route.ts");
  console.log("  - app/api/contact/route.ts");
  console.log("========================================");
}

migrate();

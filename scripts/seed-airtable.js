const AIRTABLE_TOKEN = process.env.AIRTABLE_TOKEN;
const BASE_ID = process.env.AIRTABLE_BASE_ID;

if (!AIRTABLE_TOKEN || !BASE_ID) {
  console.error("Missing AIRTABLE_TOKEN or AIRTABLE_BASE_ID environment variables.");
  process.exit(1);
}

const TABLE_ID = "tbl2yTHN5cIaRviox";
const TABLE_PATH = BASE_ID.includes("/") ? BASE_ID : `${BASE_ID}/${TABLE_ID}`;

// Actual Airtable field names discovered via Meta API:
// Name, Notes, Assignee, Status, Church name, City, State, Date,
// Incident type, Description, Perpetrators (known/unknown),
// Legal outcome, Sources/Citations, Photos or Media

const exampleCases = [
  {
    fields: {
      "Church name": "16th Street Baptist Church",
      "City": "Birmingham",
      "State": "Alabama",
      "Date": "1963-09-15",
      "Incident type": "Bombing",
      "Description":
        "Members of the Ku Klux Klan planted a box of dynamite beneath the steps of the 16th Street Baptist Church. The explosion killed four young girls \u2014 Addie Mae Collins (14), Cynthia Wesley (14), Carole Robertson (14), and Carol Denise McNair (11) \u2014 and injured 22 others. The church had been a rallying point for civil rights activities led by figures such as Martin Luther King Jr. and Fred Shuttlesworth.",
      "Perpetrators (known/unknown)": "Known",
      "Legal outcome":
        "Robert Chambliss convicted of first-degree murder in 1977. Thomas Blanton Jr. convicted in 2001. Bobby Frank Cherry convicted in 2002. Herman Frank Cash died before charges were brought.",
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
        "Mt. Zion AME Church, a historic Black congregation dating to 1876, was destroyed by arson. The attack occurred during a wave of church burnings across the South in the mid-1990s. President Bill Clinton visited the rebuilt church in 1996 and signed the Church Arson Prevention Act into law shortly after.",
      "Perpetrators (known/unknown)": "Known",
      "Legal outcome":
        "Timothy Scott and Gary Cox were arrested by ATF and FBI investigators. Both were convicted on federal arson and conspiracy charges in 1996 and sentenced to prison terms.",
      "Sources/Citations":
        "Church Arson Prevention Act of 1996; NPR coverage, June 1996; 'The Rise and Fall of Jim Crow,' PBS",
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
        "A white supremacist gunman entered a Wednesday evening Bible study at Emanuel African Methodist Episcopal Church and opened fire, killing nine parishioners including the senior pastor and state senator, Clementa C. Pinckney. The massacre prompted a national reckoning over Confederate symbols and led to the removal of the Confederate flag from the South Carolina State House grounds.",
      "Perpetrators (known/unknown)": "Known",
      "Legal outcome":
        "Dylann Roof was convicted on 33 federal charges including hate crimes and obstruction of religion. He was sentenced to death in January 2017. He was also convicted on nine counts of murder at the state level.",
      "Sources/Citations":
        "DOJ press release, Jan 2017; Jennifer Berry Hawes, 'Grace Will Lead Us Home' (2019); The New York Times, June 18, 2015",
      "Status": "Done",
    },
  },
];

const url = `https://api.airtable.com/v0/${TABLE_PATH}`;

async function seed() {
  console.log(`Seeding ${exampleCases.length} example cases to Airtable...`);

  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${AIRTABLE_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ records: exampleCases }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`Airtable error (${response.status}):`, errorText);
    process.exit(1);
  }

  const data = await response.json();
  console.log(`Successfully created ${data.records.length} records:`);
  for (const record of data.records) {
    console.log(`  - ${record.fields["Church name"]} (${record.id})`);
  }
}

seed();

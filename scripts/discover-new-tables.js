const AIRTABLE_TOKEN = "patwUzfjD9FXYflII.3ff6962deea260b59152184cdc4e6ff448b2903e74d459d0530d6d631db6b9d9";
const BASE_ID = "appyd4Tt9kwX4VzWv";

async function discover() {
  console.log("Discovering tables in new Airtable base...");
  console.log("BASE_ID:", BASE_ID);
  console.log("Token starts with:", AIRTABLE_TOKEN?.substring(0, 10) + "...");

  const res = await fetch(
    `https://api.airtable.com/v0/meta/bases/${BASE_ID}/tables`,
    { headers: { Authorization: `Bearer ${AIRTABLE_TOKEN}` } }
  );

  if (!res.ok) {
    console.log("Meta API error:", res.status, await res.text());
    return;
  }

  const data = await res.json();
  console.log("\n=== TABLES IN YOUR NEW BASE ===\n");

  for (const table of data.tables) {
    console.log(`Table: "${table.name}" (ID: ${table.id})`);
    console.log(`  Fields: ${table.fields.map((f) => f.name).join(", ")}`);
    
    // Show select field options
    for (const field of table.fields) {
      if (field.options?.choices) {
        console.log(`  "${field.name}" options: ${field.options.choices.map(c => c.name).join(", ")}`);
      }
    }
    console.log("");
  }

  console.log("\n=== ACTION NEEDED ===");
  console.log("Copy the Cases table ID above and let me know so I can update the API routes and import script.");
}

discover();

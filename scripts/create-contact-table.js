const AIRTABLE_TOKEN = process.env.AIRTABLE_TOKEN;
const BASE_ID = process.env.AIRTABLE_BASE_ID;

if (!AIRTABLE_TOKEN || !BASE_ID) {
  console.error("Missing AIRTABLE_TOKEN or AIRTABLE_BASE_ID environment variables.");
  process.exit(1);
}

const baseId = BASE_ID.split("/")[0];

async function createContactTable() {
  console.log("Creating 'Contact Messages' table in Airtable...");

  const response = await fetch(
    `https://api.airtable.com/v0/meta/bases/${baseId}/tables`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${AIRTABLE_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: "Contact Messages",
        fields: [
          {
            name: "Name",
            type: "singleLineText",
          },
          {
            name: "Email",
            type: "email",
          },
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
          {
            name: "Message",
            type: "multilineText",
          },
          {
            name: "Status",
            type: "singleSelect",
            options: {
              choices: [
                { name: "New" },
                { name: "Read" },
                { name: "Replied" },
              ],
            },
          },
        ],
      }),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Failed to create table:", response.status, errorText);
    process.exit(1);
  }

  const table = await response.json();
  console.log(`Table created successfully!`);
  console.log(`Table ID: ${table.id}`);
  console.log(`Table name: ${table.name}`);
  console.log("Save this table ID for the API route: ", table.id);
}

createContactTable();

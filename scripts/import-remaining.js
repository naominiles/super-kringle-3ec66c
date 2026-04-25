const TOKEN = "patwUzfjD9FXYflII.3ff6962deea260b59152184cdc4e6ff448b2903e74d459d0530d6d631db6b9d9";
const BASE_ID = "appyd4Tt9kwX4VzWv";
const TABLE_ID = "tbl4jcKxkQb4REasY";
const TABLE_URL = `https://api.airtable.com/v0/${BASE_ID}/${TABLE_ID}`;
const HEADERS = { Authorization: `Bearer ${TOKEN}`, "Content-Type": "application/json" };

function parseDate(raw) {
  if (!raw) return null;
  const seasons = { "spring": "03-01", "summer": "06-01", "fall": "09-01", "winter": "12-01" };
  const lower = raw.toLowerCase();
  for (const [s, month] of Object.entries(seasons)) {
    if (lower.startsWith(s)) {
      const year = raw.match(/\d{4}/)?.[0];
      return year ? `${year}-${month}` : null;
    }
  }
  if (/^[a-z]{3}-\d{2}$/i.test(raw)) {
    const months = { jan:"01",feb:"02",mar:"03",apr:"04",may:"05",jun:"06",jul:"07",aug:"08",sep:"09",oct:"10",nov:"11",dec:"12" };
    const [mon, yr] = raw.split("-");
    return `19${yr}-${months[mon.toLowerCase()]}-01`;
  }
  const d = new Date(raw);
  if (!isNaN(d.getTime())) return d.toISOString().split("T")[0];
  return null;
}

const records = [
  { date: "2/28/68",   name: "Newell Chapel Methodist",          city: "Meridian",      state: "MS", type: "Burning", desc: "Arson",                                                                                                          source: "Southern Regional Council – Series 1: Clippings and Series 2: Publications. Southern Regional Council Collection, Auburn Avenue Research Library on African American Culture and History (Atlanta, GA)." },
  { date: "4/15/68",   name: "Mt. Pleasant Baptist",             city: "Meridian",      state: "MS", type: "Burning", desc: "This was the third time the congregation had been targeted. The building was destroyed by fire this time.",       source: "Southern Regional Council – Series 1: Clippings and Series 2: Publications. Southern Regional Council Collection, Auburn Avenue Research Library on African American Culture and History (Atlanta, GA)." },
  { date: "1/18/69",   name: "New Bethel AME",                   city: "Lithonia",      state: "GA", type: "Burning", desc: "Arson - pages of the Bible were used as starter material.",                                                      source: "Southern Regional Council – Series 1: Clippings and Series 2: Publications. Southern Regional Council Collection, Auburn Avenue Research Library on African American Culture and History (Atlanta, GA)." },
  { date: "2/14/69",   name: "Sycamore Hill Baptist",            city: "Greenville",    state: "NC", type: "Burning", desc: "Prior to its burning this church was the last building holding out against an 'urban renewal zone'.",              source: "Southern Regional Council – Series 1: Clippings and Series 2: Publications. Southern Regional Council Collection, Auburn Avenue Research Library on African American Culture and History (Atlanta, GA)." },
  { date: "8/16/69",   name: "El Bethel",                        city: "Lincoln County",state: "NC", type: "Bombing", desc: "Bombing.",                                                                                                       source: "Southern Regional Council – Series 1: Clippings and Series 2: Publications. Southern Regional Council Collection, Auburn Avenue Research Library on African American Culture and History (Atlanta, GA)." },
  { date: "8/30/69",   name: "Bethel AME",                       city: "Casseta",       state: "GA", type: "Burning", desc: "",                                                                                                               source: "Southern Regional Council – Series 1: Clippings and Series 2: Publications. Southern Regional Council Collection, Auburn Avenue Research Library on African American Culture and History (Atlanta, GA)." },
  { date: "12/25/69",  name: "Eskridge Groove Baptist - Parsonage", city: "Shelby",     state: "NC", type: "Bombing", desc: "Dynamite",                                                                                                       source: "Southern Regional Council – Series 1: Clippings and Series 2: Publications. Southern Regional Council Collection, Auburn Avenue Research Library on African American Culture and History (Atlanta, GA)." },
  { date: "Mar-70",    name: "unnamed Black Church",              city: "Panola County", state: "MS", type: "Burning", desc: "One of three small, unnamed rural churches damaged by fire. Similar to nearby Leland arsons.",                    source: "Southern Regional Council – Series 1: Clippings and Series 2: Publications. Southern Regional Council Collection, Auburn Avenue Research Library on African American Culture and History (Atlanta, GA)." },
  { date: "3/30/70",   name: "unnamed Black Church",              city: "Panola County", state: "MS", type: "Burning", desc: "One of three small, unnamed rural churches damaged by fire. Similar to nearby Leland arsons.",                    source: "Southern Regional Council – Series 1: Clippings and Series 2: Publications. Southern Regional Council Collection, Auburn Avenue Research Library on African American Culture and History (Atlanta, GA)." },
  { date: "3/30/70",   name: "unnamed Black Church",              city: "Panola County", state: "MS", type: "Burning", desc: "One of three small, unnamed rural churches damaged by fire. Similar to nearby Leland arsons.",                    source: "Southern Regional Council – Series 1: Clippings and Series 2: Publications. Southern Regional Council Collection, Auburn Avenue Research Library on African American Culture and History (Atlanta, GA)." },
  { date: "3/31/70",   name: "St. Matthew's AME",                 city: "Leland",        state: "MS", type: "Burning", desc: "Arson",                                                                                                         source: "Southern Regional Council – Series 1: Clippings and Series 2: Publications. Southern Regional Council Collection, Auburn Avenue Research Library on African American Culture and History (Atlanta, GA)." },
  { date: "3/31/70",   name: "Holley Grove MB",                   city: "Leland",        state: "MS", type: "Burning", desc: "Arson",                                                                                                         source: "Southern Regional Council – Series 1: Clippings and Series 2: Publications. Southern Regional Council Collection, Auburn Avenue Research Library on African American Culture and History (Atlanta, GA)." },
  { date: "3/31/70",   name: "No. 14 Church",                     city: "Leland",        state: "MS", type: "Burning", desc: "Arson",                                                                                                         source: "Southern Regional Council – Series 1: Clippings and Series 2: Publications. Southern Regional Council Collection, Auburn Avenue Research Library on African American Culture and History (Atlanta, GA)." },
  { date: "3/31/70",   name: "Hill Primitive Baptist",            city: "Coosa",         state: "MS", type: "Burning", desc: "",                                                                                                              source: "Southern Regional Council – Series 1: Clippings and Series 2: Publications. Southern Regional Council Collection, Auburn Avenue Research Library on African American Culture and History (Atlanta, GA)." },
  { date: "6/11/70",   name: "Summerfield Baptist",               city: "Forrest City",  state: "AR", type: "Burning", desc: "The church building was heavily damaged by fire. Had recently been a site for Civil Rights meetings.",            source: "Southern Regional Council – Series 1: Clippings and Series 2: Publications. Southern Regional Council Collection, Auburn Avenue Research Library on African American Culture and History (Atlanta, GA)." },
  { date: "Fall 1964", name: "New Chapel Methodist",              city: "Pulaski",       state: "MS", type: "Burning", desc: "Destroyed. It was reported by the denomination that the FBI described the arson as malicious.",                   source: "Papers of the Congress of Racial Equality, 1941–1967. Congress of Racial Equality Records, Wisconsin Historical Society (Madison, WI)." },
  { date: "Fall 1969", name: "unnamed Black Church",              city: "Forrest City",  state: "AR", type: "Burning", desc: "One of three small, unnamed Black churches in the same town that was destroyed by fire.",                         source: "Southern Regional Council – Series 1: Clippings and Series 2: Publications. Southern Regional Council Collection, Auburn Avenue Research Library on African American Culture and History (Atlanta, GA)." },
  { date: "Spring 1970", name: "unnamed Black Church",            city: "Forrest City",  state: "AR", type: "Burning", desc: "One of three small, unnamed Black churches in the same town that was destroyed by fire.",                         source: "Southern Regional Council – Series 1: Clippings and Series 2: Publications. Southern Regional Council Collection, Auburn Avenue Research Library on African American Culture and History (Atlanta, GA)." },
  { date: "Winter 1967", name: "Belle Flower Baptist",            city: "Grenada",       state: "MS", type: "Burning", desc: "",                                                                                                              source: "Southern Regional Council – Series 1: Clippings and Series 2: Publications. Southern Regional Council Collection, Auburn Avenue Research Library on African American Culture and History (Atlanta, GA)." },
  { date: "Winter 1970", name: "unnamed Black Church",            city: "Forrest City",  state: "AR", type: "Burning", desc: "One of three small, unnamed Black churches in the same town that was destroyed by fire.",                         source: "Southern Regional Council – Series 1: Clippings and Series 2: Publications. Southern Regional Council Collection, Auburn Avenue Research Library on African American Culture and History (Atlanta, GA)." },
];

async function importRecords() {
  console.log(`Importing ${records.length} remaining records...`);

  const airtableRecords = records.map(r => {
    const isoDate = parseDate(r.date);
    const fields = {
      "Church name": r.name,
      "City": r.city,
      "State": r.state,
      "Incident type": r.type === "Burning" ? "Burning" : r.type === "Bombing" ? "Bombing" : "Other",
      "Status": "Done",
    };
    if (isoDate) fields["Date"] = isoDate;
    if (r.date && !isoDate) fields["Notes"] = r.date;
    if (r.desc) fields["Description"] = r.desc;
    if (r.source) fields["Sources/Citations"] = r.source;
    return { fields };
  });

  // Batch in groups of 10
  for (let i = 0; i < airtableRecords.length; i += 10) {
    const batch = airtableRecords.slice(i, i + 10);
    const res = await fetch(TABLE_URL, {
      method: "POST",
      headers: HEADERS,
      body: JSON.stringify({ records: batch }),
    });
    const data = await res.json();
    if (!res.ok) {
      console.error(`Batch ${i / 10 + 1} failed:`, JSON.stringify(data));
      process.exit(1);
    }
    console.log(`Batch ${i / 10 + 1}: created ${data.records.length} records`);
    await new Promise(r => setTimeout(r, 250));
  }

  console.log("Done! All remaining records imported.");
}

importRecords().catch(err => { console.error(err); process.exit(1); });

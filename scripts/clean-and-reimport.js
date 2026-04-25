/**
 * Deletes ALL existing records in the Cases table, then re-imports
 * cleanly from the CSV data embedded below.
 */

const AIRTABLE_TOKEN = "patwUzfjD9FXYflII.3ff6962deea260b59152184cdc4e6ff448b2903e74d459d0530d6d631db6b9d9";
const BASE_ID = "appyd4Tt9kwX4VzWv";
const TABLE_ID = "tbl4jcKxkQb4REasY";
const TABLE_URL = `https://api.airtable.com/v0/${BASE_ID}/${TABLE_ID}`;
const HEADERS = {
  Authorization: `Bearer ${AIRTABLE_TOKEN}`,
  "Content-Type": "application/json",
};

// --- Helpers ---

function parseDate(raw) {
  if (!raw || !raw.trim()) return null;
  const s = raw.trim();
  // Already looks like YYYY
  if (/^\d{4}$/.test(s)) return null; // year-only, skip date field
  // M/D/YY or M/D/YYYY
  const mdy = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})$/);
  if (mdy) {
    let year = parseInt(mdy[3]);
    if (year < 100) year += 1900;
    const month = mdy[1].padStart(2, "0");
    const day = mdy[2].padStart(2, "0");
    return `${year}-${month}-${day}`;
  }
  // Seasons / text months — can't parse to ISO
  return null;
}

function parseNotes(raw) {
  if (!raw || !raw.trim()) return null;
  const s = raw.trim();
  // If it's a year-only or approximate date, store as note
  if (/^\d{4}$/.test(s)) return s;
  if (/^(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec|Spring|Summer|Fall|Winter)/i.test(s)) return s;
  if (/^\d{1,2}-[A-Za-z]/.test(s)) return s; // e.g. "30-Jul"
  return null;
}

function mapType(raw) {
  const t = (raw || "").trim();
  if (t === "Bombing") return "Bombing";
  if (t === "Burning") return "Burning";
  return "Other";
}

// --- CSV data (embedded from uploaded file) ---
const CSV_ROWS = [
  ["1963","Bethel AME","Gillet","AR","Bombing","","Southern Regional Council – Series 1: Clippings and Series 2: Publications. Southern Regional Council Collection, Auburn Avenue Research Library on African American Culture and History (Atlanta, GA)."],
  ["1965","Bethel AME","Gillet","AR","Burning","","Southern Regional Council – Series 1: Clippings and Series 2: Publications. Southern Regional Council Collection, Auburn Avenue Research Library on African American Culture and History (Atlanta, GA)."],
  ["1965","Prospect AME","Grand Junction","TN","Burning","","Southern Regional Council – Series 1: Clippings and Series 2: Publications. Southern Regional Council Collection, Auburn Avenue Research Library on African American Culture and History (Atlanta, GA)."],
  ["7/23/56","Koinania Farm","Americus","GA","Bombing","This was a racially integrated church camp/community that was bombed twice.","Southern Regional Council – Series 1: Clippings and Series 2: Publications. Southern Regional Council Collection, Auburn Avenue Research Library on African American Culture and History (Atlanta, GA)."],
  ["12/25/56","Bethel Baptist Church & Parsonage","Birmingham","AL","Bombing","This was the first attack on Rev. Fred Shuttlesworth's home and church. Both of which were damaged, he survived unscathed.","Birmingham Public Library, Department of Archives and Manuscripts (Birmingham, AL)."],
  ["1/10/57","Bell Street Baptist","Montgomery","AL","Burning","This attack coiniced with a wave of violence following the federal desegregation ruling in Montgomery, AL.","Southern Regional Council – Series 1: Clippings and Series 2: Publications."],
  ["1/10/57","Hutchinson Street Baptist","Montgomery","AL","Burning","This attack coiniced with a wave of violence following the federal desegregation ruling in Montgomery, AL.","Southern Regional Council – Series 1: Clippings and Series 2: Publications."],
  ["1/10/57","First Baptist (Negro)","Montgomery","AL","Burning","Rev. Ralph Abernathy's Church. This attack coiniced with a wave of violence following the federal desegregation ruling in Montgomery, AL.","Southern Regional Council – Series 1: Clippings and Series 2: Publications."],
  ["1/10/57","Mt. Olive Baptist","Montgomery","AL","Burning","This attack coiniced with a wave of violence following the federal desegregation ruling in Montgomery, AL.","Southern Regional Council – Series 1: Clippings and Series 2: Publications."],
  ["1/14/57","Koinania Farm","Americus","GA","Bombing","This was a racially integrated church camp/community that was bombed twice.","Southern Regional Council – Series 1: Clippings and Series 2: Publications."],
  ["4/28/57","Allen Temple AME","Bessemer","AL","Bombing","This explosion occurred during worship service.","Birmingham Public Library, Department of Archives and Manuscripts (Birmingham, AL)."],
  ["10/21/57","unnamed Black Church","Havana","FL","Burning","","Southern Regional Council – Series 1: Clippings and Series 2: Publications."],
  ["6/29/58","Bethel Baptist Church","Birmingham","AL","Bombing","Rev. Fred Shuttlesworth's church targeted for the second time.","Birmingham Public Library, Department of Archives and Manuscripts (Birmingham, AL)."],
  ["8/7/58","Mt. Moriah Baptist","Memphis","TN","Bombing","","Southern Regional Council – Series 1: Clippings and Series 2: Publications."],
  ["8/8/58","Trinity Lutheran Church","Montgomery","AL","Other","Trinity Lutheran Church and Pastor Graetz received hundreds of bomb threats over phone for three years.","Alabama Tribune: August 8, 1958"],
  ["8/25/58","Clark Memorial Methodist","Nashville","TN","Bombing","A bomb threat was called in during a meeting in the church about the desegregation of Nashville schools.","Southern Regional Council – Series 1: Clippings and Series 2: Publications."],
  ["9/1/58","Bethel Baptist","Birmingham","AL","Bombing","Rev. Shuttleworth's church targeted for the third time. This attempt was thwarted by throwing the paint can full of dynamite into the street, where it exploded.","Birmingham Public Library, Department of Archives and Manuscripts (Birmingham, AL)."],
  ["9/10/58","Mount Mary Baptist","Sasser","GA","Burning","One of four churches that was connected to SNCC's civil rights campaign in Albany. It was burned to the ground.","Southern Regional Council – Series 1: Clippings and Series 2: Publications."],
  ["9/11/58","Mount Olive Baptist","Sasser","GA","Burning","One of four churches that was connected to SNCC's civil rights campaign in Albany. It was burned to the ground.","Southern Regional Council – Series 1: Clippings and Series 2: Publications."],
  ["9/29/58","Bethel Baptist","Birmingham","AL","Bombing","The bomb was successfully defused before detonation.","Birmingham Public Library, Department of Archives and Manuscripts (Birmingham, AL)."],
  ["10/21/58","Unitarian Church of Arlington","Arlington","VA","Bombing","Bomb threat","Southern Regional Council – Series 1: Clippings and Series 2: Publications."],
  ["3/7/60","Dexter Avenue Baptist Church","Montgomery","AL","Other","Black Church leaders attempted to protest at the capitol but were met with 5,000 throng whites, and were forced back into Dexter Avenue Baptist Church.","Alabama Tribune: August 8, 1959"],
  ["7/25/60","Gospel Tent","Atlanta","GA","Other","Black church revival service in a tent. Participants were doused with acid.","Southern Regional Council – Series 1: Clippings and Series 2: Publications."],
  ["1/18/61","unnamed Interracial church","Atlanta","GA","Bombing","An unnamed racially integrated church that was bombed.","Southern Regional Council – Series 1: Clippings and Series 2: Publications."],
  ["3/26/61","Piney Grove Baptist","Dekalb County","GA","Burning","","Southern Regional Council – Series 1: Clippings and Series 2: Publications."],
  ["5/22/61","Negro First Baptist Church","Montgomery","AL","Other","Car was turned over near Negro First Baptist Church and set on fire during a civil rights rally.","Alabama Tribune: August 8, 1960"],
  ["11/4/61","St. Rest Baptist Church","Shreveport","LA","Bombing","65 CORE members were holding a dinner when homemade bombs were thrown through the windows of St. Rest Baptist Church.","Alabama Tribune: August 8, 1967"],
  ["1/17/62","St. Luke AME Zion","Birmingham","AL","Bombing","","Birmingham Public Library, Department of Archives and Manuscripts (Birmingham, AL)."],
  ["1/17/62","Triumph, The Church of the Kingdom of God in Christ #7","Birmingham","AL","Bombing","","Birmingham Public Library, Department of Archives and Manuscripts (Birmingham, AL)."],
  ["1/17/62","New Bethel Baptist","Birmingham","AL","Bombing","","Birmingham Public Library, Department of Archives and Manuscripts (Birmingham, AL)."],
  ["Aug-62","unnamed Black Church","Sasser/Albany area","GA","Burning","Two unnamed Black churches reported attempted arson, both were connected to the Albany Movement.","Southern Regional Council – Series 1: Clippings and Series 2: Publications."],
  ["8/15/62","Shady Grove Baptist","Leesburg","GA","Burning","One of four churches that was connected to SNCC's civil rights campaign in Albany. It was burned to the ground.","Southern Regional Council – Series 1: Clippings and Series 2: Publications."],
  ["9/17/62","High Hope Baptist","Dawson","GA","Burning","One of four churches that was connected to SNCC's civil rights campaign in Albany. It was burned to the ground.","Southern Regional Council – Series 1: Clippings and Series 2: Publications."],
  ["9/17/62","Peyton African Methodist Church","Valdosta","GA","Bombing","An attempted bombing with molotov cocktails, thrown through the windows.","Alabama Tribune: August 8, 1965"],
  ["9/25/62","St. Matthew's Baptist","Macon","GA","Burning","Destroyed by fire","Southern Regional Council – Series 1: Clippings and Series 2: Publications."],
  ["12/14/62","Bethel Baptist","Birmingham","AL","Bombing","Rev. Fred Shuttlesworth's Church targeted again","Birmingham Public Library, Department of Archives and Manuscripts (Birmingham, AL)."],
  ["12/31/62","Holt Street Baptist Church","Montgomery","AL","Burning","Holt Street Baptist Church faced extensive damage from a fire. This church was the first to house a mass meeting in connection to the bus boycott in 1955","Alabama Tribune: August 8, 1961"],
  ["2/21/63","St. James Negro Church","Pine Bluff","AR","Burning","A kerosene soaked rag was placed in a bottle and ignited.","Alabama Tribune: August 8, 1966"],
  ["9/15/63","16th Street Baptist","Birmingham","AL","Bombing","Dynamite on Sunday morning. Four little girls killed, another badly injured.","Birmingham Public Library, Department of Archives and Manuscripts (Birmingham, AL)."],
  ["10/10/63","unnamed Black church","Plaquemine","LA","Other","Black teenagers involved in a civil rights protest were chased by police back to the church, where police officers tear gassed the church.","Alabama Tribune: August 8, 1968"],
  ["3/3/64","The Pilgrim Rest Church","Dallas","TX","Burning","Confirmed arson.","Alabama Tribune: August 8, 1973"],
  ["4/4/64","Macedonia Baptist","Ft. Deposit","AL","Burning","This congregation was directly connected to the Black Panther Political Party in Alabama.","Southern Regional Council – Series 1: Clippings and Series 2: Publications."],
  ["4/4/64","Episcopal Church Building","Hayneville","AL","Burning","This was an anti-poverty center that was using the church building.","Southern Regional Council – Series 1: Clippings and Series 2: Publications."],
  ["5/13/64","Pine Grove Christian Methodist","Oxford","AL","Bombing","","Southern Regional Council – Series 1: Clippings and Series 2: Publications."],
  ["6/9/64","First African Baptist Church","Tuscaloosa","AL","Other","Church leaders marched to protest segregation at the county courthouse and were chased back to First African Baptist Church by policeman. Violence erupted, police hosed down the windows of church and threw tear gas into the church.","Alabama Tribune: August 8, 1962"],
  ["6/15/64","Rosary Roman Catholic","Hattiesburg","MS","Burning","Gutted by fire, hours after a meeting about averting racial violence.","Papers of the Congress of Racial Equality, 1941–1967."],
  ["6/16/64","Mt. Zion Methodist","Philadelphia","MS","Bombing","Leveled by bomb after local whites beat three black citizens. This is the church that Chaney, Goodman and Schwerner were sent to inspect prior to their arrest, abduction and ultimate lynching.","Papers of the Congress of Racial Equality, 1941–1967."],
  ["6/21/64","Sweet Rest Church of Christ Holiness","Brandon","MS","Burning","Molotov cocktails caused minor damage.","Papers of the Congress of Racial Equality, 1941–1967."],
  ["6/25/64","Williams Chapel","Ruleville","MS","Burning","Molotov cocktail was used causing significant damage to the stairs and front of the building.","Papers of the Congress of Racial Equality, 1941–1967."],
  ["6/26/64","Church of the Holy Ghost","Clinton","MS","Burning","Kerosene spilled on floor and lit after white pastor speaks in a Black church.","Papers of the Congress of Racial Equality, 1941–1967."],
  ["7/6/64","McCraven-Hill Missionary Baptist","Jackson","MS","Burning","Kerosene fire resulting in slight damage.","Papers of the Congress of Racial Equality, 1941–1967."],
  ["7/11/64","Pleasant Plan Missionary Baptist","Browning","MS","Burning","The church was burned to the ground. Shortly before, some local white people had tried to buy the building. Their offer was refused and then the church was burned.","Papers of the Congress of Racial Equality, 1941–1967."],
  ["7/13/64","Jerusalem Baptist","Kingston","MS","Burning","Burned to the ground.","Papers of the Congress of Racial Equality, 1941–1967."],
  ["7/13/64","Bethel Methodist","Kingston","MS","Burning","Burned to the ground.","Papers of the Congress of Racial Equality, 1941–1967."],
  ["7/13/64","Zion Methodist","Greens County","AL","Burning","","Southern Regional Council – Series 1: Clippings and Series 2: Publications."],
  ["7/14/64","First Presbyterian","Elm City","NC","Burning","An attempted arson of Black church that was starting to racially integrate.","Southern Regional Council – Series 1: Clippings and Series 2: Publications."],
  ["7/17/64","Mount Zion Hall Baptist","Mc Comb","MS","Burning","Moderate damage","Papers of the Congress of Racial Equality, 1941–1967."],
  ["7/19/64","Christian Union Baptist","Madison County","MS","Burning","Burned to the ground.","Papers of the Congress of Racial Equality, 1941–1967."],
  ["7/20/64","The Church of Christ Written in Heaven","Fort Meyers","FL","Burning","Arson.","Alabama Tribune: August 8, 1971"],
  ["7/22/64","Mt. Vernon Missionary Baptist","Pike County","MS","Burning","Burned to the ground.","Papers of the Congress of Racial Equality, 1941–1967."],
  ["7/24/64","Rose Hill Church","Mc Comb","MS","Burning","Extensive damage caused by fire.","Papers of the Congress of Racial Equality, 1941–1967."],
  ["30-Jul","Mount Moriah Baptist","Meridian","MS","Burning","Leveled by fire","Papers of the Congress of Racial Equality, 1941–1967."],
  ["7/31/64","Pleasant Grove Missionary Baptist","Rankin County","MS","Burning","Burned to the ground","Papers of the Congress of Racial Equality, 1941–1967."],
  ["8/5/64","Mount Pilgrim Baptist","Finwick","MS","Burning","Burned, building couldn't be saved","Papers of the Congress of Racial Equality, 1941–1967."],
  ["8/9/64","New Hope Baptist","Longdale","MS","Burning","Burned to the ground","Papers of the Congress of Racial Equality, 1941–1967."],
  ["8/11/64","Morning Star Baptist","Gluckstadt","MS","Burning","","Papers of the Congress of Racial Equality, 1941–1967."],
  ["8/15/64","St. John's Missionary Baptist","Ruleville","MS","Burning","Burned to the ground","Papers of the Congress of Racial Equality, 1941–1967."],
  ["8/16/64","Greater Mt. Calvary Baptist","Natchez","MS","Burning","Burned to the ground","Papers of the Congress of Racial Equality, 1941–1967."],
  ["8/22/64","Antioch Baptist","McComb","MS","Burning","Burned","Papers of the Congress of Racial Equality, 1941–1967."],
  ["8/22/64","Society Hill Missionary Baptist","McComb","MS","Burning","Bombed","Papers of the Congress of Racial Equality, 1941–1967."],
  ["8/22/64","St. Mary's Missionary Baptist","McComb","MS","Burning","Bombed","Papers of the Congress of Racial Equality, 1941–1967."],
  ["8/24/64","Mt. Nebo Baptist","Natchez","MS","Burning","Burned to the ground","Papers of the Congress of Racial Equality, 1941–1967."],
  ["8/28/64","Zion Hill Baptist","Natchez","MS","Burning","Burned to the ground","Papers of the Congress of Racial Equality, 1941–1967."],
  ["9/1/64","Church of Christ","Edwards","MS","Burning","Burned","Papers of the Congress of Racial Equality, 1941–1967."],
  ["9/7/64","St. John's Missionary Baptist","Gluckstadt","MS","Burning","Burned to the ground","Papers of the Congress of Racial Equality, 1941–1967."],
  ["9/8/64","First Baptist","Vicksburg","MS","Burning","Burned to the ground","Papers of the Congress of Racial Equality, 1941–1967."],
  ["9/9/64","Rose Hill Baptist","Hattiesburg","MS","Burning","Burned to the ground","Papers of the Congress of Racial Equality, 1941–1967."],
  ["9/16/64","New Hope Baptist","Natchez","MS","Burning","Burned to the ground","Papers of the Congress of Racial Equality, 1941–1967."],
  ["9/20/64","Greater Mt. Nebo Baptist","Natchez","MS","Burning","Burned to the ground","Papers of the Congress of Racial Equality, 1941–1967."],
  ["9/26/64","Tribbett Church","Tribbett","MS","Burning","Burned to the ground","Papers of the Congress of Racial Equality, 1941–1967."],
  ["10/1/64","Centenary Methodist","Vicksburg","MS","Burning","Burned","Papers of the Congress of Racial Equality, 1941–1967."],
  ["10/3/64","Sweet Home Missionary Baptist","Vicksburg","MS","Burning","Burned to the ground","Papers of the Congress of Racial Equality, 1941–1967."],
  ["10/4/64","Bethel AME","Vicksburg","MS","Burning","Burned to the ground","Papers of the Congress of Racial Equality, 1941–1967."],
  ["10/5/64","St. Paul AME","Vicksburg","MS","Burning","Burned to the ground","Papers of the Congress of Racial Equality, 1941–1967."],
  ["Fall 1964","unnamed Black Church","Mississippi","MS","Burning","","Papers of the Congress of Racial Equality, 1941–1967."],
  ["Spring 1970","unnamed Black Church","Alabama","AL","Burning","","Southern Regional Council – Series 1: Clippings and Series 2: Publications."],
  ["1/16/65","Zion AME","Eutaw","AL","Burning","","Southern Regional Council – Series 1: Clippings and Series 2: Publications."],
  ["1/16/65","Mt. Gilead Baptist","Eutaw","AL","Burning","","Southern Regional Council – Series 1: Clippings and Series 2: Publications."],
  ["1/16/65","St. Mark AME Zion","Demopolis","AL","Burning","","Southern Regional Council – Series 1: Clippings and Series 2: Publications."],
  ["2/4/65","First Baptist","Selma","AL","Other","Dr. King and other civil rights leaders were present when white segregationists attacked the church.","Southern Regional Council – Series 1: Clippings and Series 2: Publications."],
  ["2/18/65","Zion United Methodist","Marion","AL","Other","Jimmie Lee Jackson was shot outside of the church following a civil rights march.","Southern Regional Council – Series 1: Clippings and Series 2: Publications."],
  ["3/7/65","Brown's Chapel AME","Selma","AL","Other","Bloody Sunday. Marchers began their march from Brown's Chapel AME Church to the Edmund Pettus Bridge, where they were beaten back by state troopers.","Southern Regional Council – Series 1: Clippings and Series 2: Publications."],
  ["4/3/65","Greater New Hope Baptist","Vicksburg","MS","Burning","Burned to the ground","Papers of the Congress of Racial Equality, 1941–1967."],
  ["4/25/65","unnamed Black Church","Bogalusa","LA","Burning","","Southern Regional Council – Series 1: Clippings and Series 2: Publications."],
  ["7/8/65","unnamed Black Church","Jonesboro","LA","Burning","","Southern Regional Council – Series 1: Clippings and Series 2: Publications."],
  ["7/8/65","First Baptist Church","Jonesboro","LA","Burning","","Southern Regional Council – Series 1: Clippings and Series 2: Publications."],
  ["7/9/65","New Bethel Baptist","Jonesboro","LA","Burning","","Southern Regional Council – Series 1: Clippings and Series 2: Publications."],
  ["7/30/65","Holiness Church","Jonesboro","LA","Burning","","Southern Regional Council – Series 1: Clippings and Series 2: Publications."],
  ["8/12/65","Pleasant Grove Baptist","Hayneville","AL","Burning","","Southern Regional Council – Series 1: Clippings and Series 2: Publications."],
  ["8/20/65","New Mt. Pilgrim","Lowndes County","AL","Burning","","Southern Regional Council – Series 1: Clippings and Series 2: Publications."],
  ["8/20/65","St. John Baptist","Lowndes County","AL","Burning","","Southern Regional Council – Series 1: Clippings and Series 2: Publications."],
  ["8/20/65","Macedonia Baptist","Lowndes County","AL","Burning","","Southern Regional Council – Series 1: Clippings and Series 2: Publications."],
  ["8/20/65","unnamed Black church","Lowndes County","AL","Burning","","Southern Regional Council – Series 1: Clippings and Series 2: Publications."],
  ["9/17/65","Morning Star Baptist","Gluckstadt","MS","Burning","Burned to the ground","Papers of the Congress of Racial Equality, 1941–1967."],
  ["9/25/65","Bethel Baptist","West Point","MS","Burning","","Papers of the Congress of Racial Equality, 1941–1967."],
  ["10/28/65","St. John Baptist","Lowndes County","AL","Burning","","Southern Regional Council – Series 1: Clippings and Series 2: Publications."],
  ["10/28/65","New Mt. Pilgrim Baptist","Lowndes County","AL","Burning","","Southern Regional Council – Series 1: Clippings and Series 2: Publications."],
  ["10/28/65","Mt. Gilead Baptist","Lowndes County","AL","Burning","","Southern Regional Council – Series 1: Clippings and Series 2: Publications."],
  ["10/28/65","unnamed Black church","Lowndes County","AL","Burning","","Southern Regional Council – Series 1: Clippings and Series 2: Publications."],
  ["11/1/65","Zion Hill Baptist","Natchez","MS","Burning","","Papers of the Congress of Racial Equality, 1941–1967."],
  ["11/15/65","Rising Star Baptist","Hayneville","AL","Burning","","Southern Regional Council – Series 1: Clippings and Series 2: Publications."],
  ["1/4/66","Mount Pleasant Baptist","Tuskegee","AL","Burning","","Southern Regional Council – Series 1: Clippings and Series 2: Publications."],
  ["1/4/66","Sweet Home Baptist","Tuskegee","AL","Burning","","Southern Regional Council – Series 1: Clippings and Series 2: Publications."],
  ["2/2/66","Bethel Baptist","Tuskegee","AL","Burning","","Southern Regional Council – Series 1: Clippings and Series 2: Publications."],
  ["2/2/66","Antioch Baptist","Macon County","AL","Burning","","Southern Regional Council – Series 1: Clippings and Series 2: Publications."],
  ["2/2/66","New Philadelphia Baptist","Tuskegee","AL","Burning","","Southern Regional Council – Series 1: Clippings and Series 2: Publications."],
  ["2/2/66","Rising Star Baptist","Tuskegee","AL","Burning","","Southern Regional Council – Series 1: Clippings and Series 2: Publications."],
  ["2/2/66","Greater Macedonia Baptist","Tuskegee","AL","Burning","","Southern Regional Council – Series 1: Clippings and Series 2: Publications."],
  ["2/2/66","New Hope Baptist","Tuskegee","AL","Burning","","Southern Regional Council – Series 1: Clippings and Series 2: Publications."],
  ["2/4/66","unnamed Black church","Tuskegee","AL","Burning","","Southern Regional Council – Series 1: Clippings and Series 2: Publications."],
  ["5/1/66","St. Mark Baptist","Natchez","MS","Burning","","Papers of the Congress of Racial Equality, 1941–1967."],
  ["6/7/66","New Jerusalem Baptist","Natchez","MS","Burning","","Papers of the Congress of Racial Equality, 1941–1967."],
  ["6/17/15","Emanuel AME","Charleston","SC","Other","A white supremacist opened fire during a Bible study, killing 9 parishioners.","FBI / Department of Justice"],
  ["6/20/95","Mt. Zion AME","Greeleyville","SC","Burning","Arson confirmed; two Ku Klux Klan members convicted.","ATF / FBI Arson Investigation Report"],
];

async function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function getAllRecordIds() {
  let ids = [];
  let offset = null;
  do {
    const url = `${TABLE_URL}?fields[]=Name${offset ? `&offset=${offset}` : ""}`;
    const res = await fetch(url, { headers: HEADERS });
    const data = await res.json();
    if (!res.ok) throw new Error(`Failed to fetch records: ${JSON.stringify(data)}`);
    ids = [...ids, ...data.records.map((r) => r.id)];
    offset = data.offset;
  } while (offset);
  return ids;
}

async function deleteRecords(ids) {
  // Airtable allows up to 10 deletes per request
  for (let i = 0; i < ids.length; i += 10) {
    const batch = ids.slice(i, i + 10);
    const params = batch.map((id) => `records[]=${id}`).join("&");
    const res = await fetch(`${TABLE_URL}?${params}`, {
      method: "DELETE",
      headers: HEADERS,
    });
    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Delete failed: ${err}`);
    }
    console.log(`Deleted records ${i + 1}–${Math.min(i + 10, ids.length)} of ${ids.length}`);
    await sleep(250);
  }
}

async function importRecords(rows) {
  let imported = 0;
  for (let i = 0; i < rows.length; i += 10) {
    const batch = rows.slice(i, i + 10);
    const records = batch.map(([date, name, city, state, type, description, source]) => {
      const isoDate = parseDate(date);
      const notes = parseNotes(date);
      const fields = {
        "Church name": name.trim(),
        "City": city.trim(),
        "State": state.trim(),
        "Incident type": mapType(type),
        "Status": "Done",
        ...(description?.trim() ? { "Description": description.trim() } : {}),
        ...(source?.trim() ? { "Sources/Citations": source.trim() } : {}),
        ...(isoDate ? { "Date": isoDate } : {}),
        ...(notes ? { "Notes": notes } : {}),
      };
      return { fields };
    });

    const res = await fetch(TABLE_URL, {
      method: "POST",
      headers: HEADERS,
      body: JSON.stringify({ records }),
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Import failed at batch ${i / 10 + 1}: ${err}`);
    }

    imported += batch.length;
    console.log(`Imported ${imported} / ${rows.length} records`);
    await sleep(250);
  }
}

async function run() {
  console.log("Step 1: Fetching all existing record IDs...");
  const ids = await getAllRecordIds();
  console.log(`Found ${ids.length} existing records to delete.`);

  if (ids.length > 0) {
    console.log("Step 2: Deleting all existing records...");
    await deleteRecords(ids);
    console.log("All existing records deleted.");
  } else {
    console.log("No existing records found, skipping delete step.");
  }

  console.log(`Step 3: Importing ${CSV_ROWS.length} records from CSV...`);
  await importRecords(CSV_ROWS);
  console.log(`Done! ${CSV_ROWS.length} records imported cleanly.`);
}

run().catch((err) => {
  console.error("Error:", err.message);
  process.exit(1);
});

// Import CSV data into Airtable
// Run with: node scripts/import-csv-data.js

const AIRTABLE_TOKEN = process.env.AIRTABLE_TOKEN;
const BASE_ID = process.env.AIRTABLE_BASE_ID;
const TABLE_ID = "tbl4jcKxkQb4REasY";

if (!AIRTABLE_TOKEN || !BASE_ID) {
  console.error("Missing AIRTABLE_TOKEN or AIRTABLE_BASE_ID");
  process.exit(1);
}

const TABLE_PATH = BASE_ID.includes("/") ? BASE_ID : `${BASE_ID}/${TABLE_ID}`;
const url = `https://api.airtable.com/v0/${TABLE_PATH}`;
const headers = {
  Authorization: `Bearer ${AIRTABLE_TOKEN}`,
  "Content-Type": "application/json",
};

// Parse a messy date string into { isoDate, notes }
function parseDate(raw) {
  if (!raw) return { isoDate: null, notes: null };
  const str = raw.trim();

  // Season/approximate dates — no ISO date possible
  if (/^(Fall|Spring|Winter|Summer)/i.test(str)) {
    return { isoDate: null, notes: str };
  }
  // Month abbreviation like "Aug-62" or "Mar-70"
  const monthAbbr = str.match(/^([A-Za-z]+)-(\d{2})$/);
  if (monthAbbr) {
    const months = { jan:1,feb:2,mar:3,apr:4,may:5,jun:6,jul:7,aug:8,sep:9,oct:10,nov:11,dec:12 };
    const m = months[monthAbbr[1].toLowerCase()];
    const y = parseInt(monthAbbr[2]) + (parseInt(monthAbbr[2]) > 30 ? 1900 : 2000);
    if (m) return { isoDate: `${y}-${String(m).padStart(2,"0")}-01`, notes: str };
    return { isoDate: null, notes: str };
  }
  // Year only e.g. "1963"
  if (/^\d{4}$/.test(str)) {
    return { isoDate: `${str}-01-01`, notes: str };
  }
  // MM/DD/YY or M/D/YY
  const mdyShort = str.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2})$/);
  if (mdyShort) {
    const [, m, d, y] = mdyShort;
    const year = parseInt(y) + (parseInt(y) > 30 ? 1900 : 2000);
    return {
      isoDate: `${year}-${String(m).padStart(2,"0")}-${String(d).padStart(2,"0")}`,
      notes: null,
    };
  }
  // MM/DD/YYYY
  const mdyFull = str.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (mdyFull) {
    const [, m, d, y] = mdyFull;
    return {
      isoDate: `${y}-${String(m).padStart(2,"0")}-${String(d).padStart(2,"0")}`,
      notes: null,
    };
  }
  // "30-Jul" style (day-MonthAbbr)
  const dayMonth = str.match(/^(\d{1,2})-([A-Za-z]+)$/);
  if (dayMonth) {
    return { isoDate: null, notes: str };
  }
  return { isoDate: null, notes: str };
}

// All 142 records from the spreadsheet
const records = [
  ["1963","Bethel AME","Gillet","AR","Burning","","Southern Regional Council – Series 1: Clippings and Series 2: Publications. Southern Regional Council Collection, Auburn Avenue Research Library on African American Culture and History (Atlanta, GA)."],
  ["1965","Bethel AME","Gillet","AR","Burning","","Southern Regional Council – Series 1: Clippings and Series 2: Publications. Southern Regional Council Collection, Auburn Avenue Research Library on African American Culture and History (Atlanta, GA)."],
  ["1965","Prospect AME","Grand Junction","TN","Burning","","Southern Regional Council – Series 1: Clippings and Series 2: Publications. Southern Regional Council Collection, Auburn Avenue Research Library on African American Culture and History (Atlanta, GA)."],
  ["7/23/56","Koinania Farm","Americus","GA","Bombing","This was a racially integrated church camp/community that was bombed twice.","Southern Regional Council – Series 1: Clippings and Series 2: Publications. Southern Regional Council Collection, Auburn Avenue Research Library on African American Culture and History (Atlanta, GA)."],
  ["12/25/56","Bethel Baptist Church & Parsonage","Birmingham","AL","Bombing","This was the first attack on Rev. Fred Shuttlesworth's home and church. Both of which were damaged, he survived unscathed.","Birmingham Public Library, Department of Archives and Manuscripts (Birmingham, AL)."],
  ["1/10/57","Bell Street Baptist","Montgomery","AL","Burning","This attack coincided with a wave of violence following the federal desegregation ruling in Montgomery, AL.","Southern Regional Council – Series 1: Clippings and Series 2: Publications. Southern Regional Council Collection, Auburn Avenue Research Library on African American Culture and History (Atlanta, GA)."],
  ["1/10/57","Hutchinson Street Baptist","Montgomery","AL","Burning","This attack coincided with a wave of violence following the federal desegregation ruling in Montgomery, AL.","Southern Regional Council – Series 1: Clippings and Series 2: Publications. Southern Regional Council Collection, Auburn Avenue Research Library on African American Culture and History (Atlanta, GA)."],
  ["1/10/57","First Baptist (Negro)","Montgomery","AL","Burning","Rev. Ralph Abernathy's Church. This attack coincided with a wave of violence following the federal desegregation ruling in Montgomery, AL.","Southern Regional Council – Series 1: Clippings and Series 2: Publications. Southern Regional Council Collection, Auburn Avenue Research Library on African American Culture and History (Atlanta, GA)."],
  ["1/10/57","Mt. Olive Baptist","Montgomery","AL","Burning","This attack coincided with a wave of violence following the federal desegregation ruling in Montgomery, AL.","Southern Regional Council – Series 1: Clippings and Series 2: Publications. Southern Regional Council Collection, Auburn Avenue Research Library on African American Culture and History (Atlanta, GA)."],
  ["1/14/57","Koinania Farm","Americus","GA","Bombing","This was a racially integrated church camp/community that was bombed twice.","Southern Regional Council – Series 1: Clippings and Series 2: Publications. Southern Regional Council Collection, Auburn Avenue Research Library on African American Culture and History (Atlanta, GA)."],
  ["4/28/57","Allen Temple AME","Bessemer","AL","Bombing","This explosion occurred during worship service.","Birmingham Public Library, Department of Archives and Manuscripts (Birmingham, AL)."],
  ["10/21/57","unnamed Black Church","Havana","FL","Burning","","Southern Regional Council – Series 1: Clippings and Series 2: Publications. Southern Regional Council Collection, Auburn Avenue Research Library on African American Culture and History (Atlanta, GA)."],
  ["6/29/58","Bethel Baptist Church","Birmingham","AL","Bombing","Rev. Fred Shuttlesworth's church targeted for the second time.","Birmingham Public Library, Department of Archives and Manuscripts (Birmingham, AL)."],
  ["8/7/58","Mt. Moriah Baptist","Memphis","TN","Bombing","","Southern Regional Council – Series 1: Clippings and Series 2: Publications. Southern Regional Council Collection, Auburn Avenue Research Library on African American Culture and History (Atlanta, GA)."],
  ["8/8/58","Trinity Lutheran Church","Montgomery","AL","Other","Trinity Lutheran Church and Pastor Graetz received hundreds of bomb threats over phone for three years. Pastor Graetz's parsonage was bombed twice.","Alabama Tribune: August 8, 1958"],
  ["8/25/58","Clark Memorial Methodist","Nashville","TN","Bombing","A bomb threat was called in during a meeting about the desegregation of Nashville schools.","Southern Regional Council – Series 1: Clippings and Series 2: Publications. Southern Regional Council Collection, Auburn Avenue Research Library on African American Culture and History (Atlanta, GA)."],
  ["9/1/58","Bethel Baptist","Birmingham","AL","Bombing","Rev. Shuttleworth's church targeted for the third time. This attempt was thwarted by throwing the paint can full of dynamite into the street.","Birmingham Public Library, Department of Archives and Manuscripts (Birmingham, AL)."],
  ["9/10/58","Mount Mary Baptist","Sasser","GA","Burning","One of four churches connected to SNCC's civil rights campaign in Albany. It was burned to the ground.","Southern Regional Council – Series 1: Clippings and Series 2: Publications. Southern Regional Council Collection, Auburn Avenue Research Library on African American Culture and History (Atlanta, GA)."],
  ["9/11/58","Mount Olive Baptist","Sasser","GA","Burning","One of four churches connected to SNCC's civil rights campaign in Albany. It was burned to the ground.","Southern Regional Council – Series 1: Clippings and Series 2: Publications. Southern Regional Council Collection, Auburn Avenue Research Library on African American Culture and History (Atlanta, GA)."],
  ["9/29/58","Bethel Baptist","Birmingham","AL","Bombing","The bomb was successfully defused before detonation.","Birmingham Public Library, Department of Archives and Manuscripts (Birmingham, AL)."],
  ["10/21/58","Unitarian Church of Arlington","Arlington","VA","Bombing","Bomb threat","Southern Regional Council – Series 1: Clippings and Series 2: Publications. Southern Regional Council Collection, Auburn Avenue Research Library on African American Culture and History (Atlanta, GA)."],
  ["3/7/60","Dexter Avenue Baptist Church","Montgomery","AL","Other","Black Church leaders attempted to protest at the capitol but were met with 5,000 white counter-protesters, and were forced back into Dexter Avenue Baptist Church.","Alabama Tribune: August 8, 1959"],
  ["7/25/60","Gospel Tent","Atlanta","GA","Other","Black church revival service in a tent. Participants were doused with acid.","Southern Regional Council – Series 1: Clippings and Series 2: Publications. Southern Regional Council Collection, Auburn Avenue Research Library on African American Culture and History (Atlanta, GA)."],
  ["1/18/61","unnamed Interracial church","Atlanta","GA","Bombing","An unnamed racially integrated church that was bombed.","Southern Regional Council – Series 1: Clippings and Series 2: Publications. Southern Regional Council Collection, Auburn Avenue Research Library on African American Culture and History (Atlanta, GA)."],
  ["3/26/61","Piney Grove Baptist","Dekalb County","GA","Burning","","Southern Regional Council – Series 1: Clippings and Series 2: Publications. Southern Regional Council Collection, Auburn Avenue Research Library on African American Culture and History (Atlanta, GA)."],
  ["5/22/61","Negro First Baptist Church","Montgomery","AL","Other","Car was turned over near Negro First Baptist Church and set on fire during a civil rights rally.","Alabama Tribune: August 8, 1960"],
  ["11/4/61","St. Rest Baptist Church","Shreveport","LA","Bombing","65 CORE members were holding a dinner when homemade bombs were thrown through the windows. Two caused heavy damage.","Alabama Tribune: August 8, 1967"],
  ["1/17/62","St. Luke AME Zion","Birmingham","AL","Bombing","","Birmingham Public Library, Department of Archives and Manuscripts (Birmingham, AL)."],
  ["1/17/62","Triumph, The Church of the Kingdom of God in Christ #7","Birmingham","AL","Bombing","","Birmingham Public Library, Department of Archives and Manuscripts (Birmingham, AL)."],
  ["1/17/62","New Bethel Baptist","Birmingham","AL","Bombing","","Birmingham Public Library, Department of Archives and Manuscripts (Birmingham, AL)."],
  ["Aug-62","unnamed Black Church","Sasser/Albany area","GA","Burning","Two unnamed Black churches reported attempted arson, both connected to the Albany Movement.","Southern Regional Council – Series 1: Clippings and Series 2: Publications. Southern Regional Council Collection, Auburn Avenue Research Library on African American Culture and History (Atlanta, GA)."],
  ["8/15/62","Shady Grove Baptist","Leesburg","GA","Burning","One of four churches connected to SNCC's civil rights campaign in Albany. It was burned to the ground.","Southern Regional Council – Series 1: Clippings and Series 2: Publications. Southern Regional Council Collection, Auburn Avenue Research Library on African American Culture and History (Atlanta, GA)."],
  ["9/17/62","High Hope Baptist","Dawson","GA","Burning","One of four churches connected to SNCC's civil rights campaign in Albany. It was burned to the ground.","Southern Regional Council – Series 1: Clippings and Series 2: Publications. Southern Regional Council Collection, Auburn Avenue Research Library on African American Culture and History (Atlanta, GA)."],
  ["9/17/62","Peyton African Methodist Church","Valdosta","GA","Bombing","An attempted bombing with molotov cocktails thrown through the windows. They caused very little damage.","Alabama Tribune: August 8, 1965"],
  ["9/25/62","St. Matthew's Baptist","Macon","GA","Burning","Destroyed by fire","Southern Regional Council – Series 1: Clippings and Series 2: Publications. Southern Regional Council Collection, Auburn Avenue Research Library on African American Culture and History (Atlanta, GA)."],
  ["12/14/62","Bethel Baptist","Birmingham","AL","Bombing","Rev. Fred Shuttlesworth's Church targeted again","Birmingham Public Library, Department of Archives and Manuscripts (Birmingham, AL)."],
  ["12/31/62","Holt Street Baptist Church","Montgomery","AL","Burning","Holt Street Baptist Church faced extensive damage from a fire. This church was the first to house a mass meeting in connection to the bus boycott in 1955.","Alabama Tribune: August 8, 1961"],
  ["2/21/63","St. James Negro Church","Pine Bluff","AR","Burning","A kerosene soaked rag was placed in a bottle and ignited. Starting a small fire when thrown into the church.","Alabama Tribune: August 8, 1966"],
  ["9/15/63","16th Street Baptist","Birmingham","AL","Bombing","Dynamite on Sunday morning. Four little girls killed, another badly injured.","Birmingham Public Library, Department of Archives and Manuscripts (Birmingham, AL)."],
  ["10/10/63","unnamed Black church","Plaquemine","LA","Other","Black teenagers involved in a civil rights protest were chased by police back to the church, where officers tear gassed the congregation.","Alabama Tribune: August 8, 1968"],
  ["3/3/64","The Pilgrim Rest Church","Dallas","TX","Burning","Confirmed arson.","Alabama Tribune: August 8, 1973"],
  ["4/4/64","Macedonia Baptist","Ft. Deposit","AL","Burning","This congregation was directly connected to the Black Panther Political Party in Alabama.","Southern Regional Council – Series 1: Clippings and Series 2: Publications. Southern Regional Council Collection, Auburn Avenue Research Library on African American Culture and History (Atlanta, GA)."],
  ["4/4/64","Episcopal Church Building","Hayneville","AL","Burning","This was an anti-poverty center using the church building, connected to the Black Panther Political Party in Alabama.","Southern Regional Council – Series 1: Clippings and Series 2: Publications. Southern Regional Council Collection, Auburn Avenue Research Library on African American Culture and History (Atlanta, GA)."],
  ["5/13/64","Pine Grove Christian Methodist","Oxford","AL","Bombing","","Southern Regional Council – Series 1: Clippings and Series 2: Publications. Southern Regional Council Collection, Auburn Avenue Research Library on African American Culture and History (Atlanta, GA)."],
  ["6/9/64","First African Baptist Church","Tuscaloosa","AL","Other","Church leaders marched to protest segregation and were chased back to the church by police. Police hosed down the windows and threw tear gas inside.","Alabama Tribune: August 8, 1962"],
  ["6/15/64","Rosary Roman Catholic","Hattiesburg","MS","Burning","Gutted by fire, hours after a meeting about averting racial violence.","Papers of the Congress of Racial Equality, 1941–1967. Wisconsin Historical Society (Madison, WI)."],
  ["6/16/64","Mt. Zion Methodist","Philadelphia","MS","Bombing","Leveled by bomb after local whites beat three black citizens. This is the church Chaney, Goodman and Schwerner were sent to inspect prior to their abduction and lynching.","Papers of the Congress of Racial Equality, 1941–1967. Wisconsin Historical Society (Madison, WI)."],
  ["6/21/64","Sweet Rest Church of Christ Holiness","Brandon","MS","Burning","Molotov cocktails caused minor damage.","Papers of the Congress of Racial Equality, 1941–1967. Wisconsin Historical Society (Madison, WI)."],
  ["6/25/64","Williams Chapel","Ruleville","MS","Burning","Molotov cocktail was used causing significant damage to the stairs and front of the building.","Papers of the Congress of Racial Equality, 1941–1967. Wisconsin Historical Society (Madison, WI)."],
  ["6/26/64","Church of the Holy Ghost","Clinton","MS","Burning","Kerosene spilled on floor and lit after white pastor speaks in a Black church.","Papers of the Congress of Racial Equality, 1941–1967. Wisconsin Historical Society (Madison, WI)."],
  ["7/6/64","McCraven-Hill Missionary Baptist","Jackson","MS","Burning","Kerosene fire resulting in slight damage.","Papers of the Congress of Racial Equality, 1941–1967. Wisconsin Historical Society (Madison, WI)."],
  ["7/11/64","Pleasant Plan Missionary Baptist","Browning","MS","Burning","The church was burned to the ground. Shortly before, some local white people had tried to buy the building. Their offer was refused.","Papers of the Congress of Racial Equality, 1941–1967. Wisconsin Historical Society (Madison, WI)."],
  ["7/13/64","Jerusalem Baptist","Kingston","MS","Burning","Burned to the ground.","Papers of the Congress of Racial Equality, 1941–1967. Wisconsin Historical Society (Madison, WI)."],
  ["7/13/64","Bethel Methodist","Kingston","MS","Burning","Burned to the ground.","Papers of the Congress of Racial Equality, 1941–1967. Wisconsin Historical Society (Madison, WI)."],
  ["7/13/64","Zion Methodist","Greens County","AL","Burning","","Southern Regional Council – Series 1: Clippings and Series 2: Publications. Southern Regional Council Collection, Auburn Avenue Research Library on African American Culture and History (Atlanta, GA)."],
  ["7/14/64","First Presbyterian","Elm City","NC","Burning","An attempted arson of Black church that was starting to racially integrate.","Southern Regional Council – Series 1: Clippings and Series 2: Publications. Southern Regional Council Collection, Auburn Avenue Research Library on African American Culture and History (Atlanta, GA)."],
  ["7/17/64","Mount Zion Hall Baptist","Mc Comb","MS","Burning","Moderate damage","Papers of the Congress of Racial Equality, 1941–1967. Wisconsin Historical Society (Madison, WI)."],
  ["7/19/64","Christian Union Baptist","Madison County","MS","Burning","Burned to the ground.","Papers of the Congress of Racial Equality, 1941–1967. Wisconsin Historical Society (Madison, WI)."],
  ["7/20/64","The Church of Christ Written in Heaven","Fort Meyers","FL","Burning","Arson.","Alabama Tribune: August 8, 1971"],
  ["7/22/64","Mt. Vernon Missionary Baptist","Pike County","MS","Burning","Burned to the ground.","Papers of the Congress of Racial Equality, 1941–1967. Wisconsin Historical Society (Madison, WI)."],
  ["7/24/64","Rose Hill Church","Mc Comb","MS","Burning","Extensive damage caused by fire.","Papers of the Congress of Racial Equality, 1941–1967. Wisconsin Historical Society (Madison, WI)."],
  ["30-Jul","Mount Moriah Baptist","Meridian","MS","Burning","Leveled by fire","Papers of the Congress of Racial Equality, 1941–1967. Wisconsin Historical Society (Madison, WI)."],
  ["7/31/64","Pleasant Grove Missionary Baptist","Rankin County","MS","Burning","Burned to the ground","Papers of the Congress of Racial Equality, 1941–1967. Wisconsin Historical Society (Madison, WI)."],
  ["8/5/64","Mount Pilgrim Baptist","Finwick","MS","Burning","Burned, building couldn't be saved","Papers of the Congress of Racial Equality, 1941–1967. Wisconsin Historical Society (Madison, WI)."],
  ["8/5/64","Mount Pleasant","Gluckstadt","MS","Burning","Heavily damaged by fire. The church had been used as a freedom school as part of Freedom Summer.","Papers of the Congress of Racial Equality, 1941–1967. Wisconsin Historical Society (Madison, WI)."],
  ["8/11/64","St. Matthew's Baptist","Brandon","MS","Burning","Heavily damaged by fire","Papers of the Congress of Racial Equality, 1941–1967. Wisconsin Historical Society (Madison, WI)."],
  ["8/12/64","Perry's Chapel","Itta Bena","MS","Burning","Chapel burned to ground. Fire Dept deemed the building out of their jurisdiction.","Papers of the Congress of Racial Equality, 1941–1967. Wisconsin Historical Society (Madison, WI)."],
  ["9/9/64","Mount Moriah Baptist","Aberdeen","MS","Bombing","Dynamite","Papers of the Congress of Racial Equality, 1941–1967. Wisconsin Historical Society (Madison, WI)."],
  ["9/12/64","Daniel Baptist Church","Aberdeen","MS","Burning","","Papers of the Congress of Racial Equality, 1941–1967. Wisconsin Historical Society (Madison, WI)."],
  ["9/16/64","Saint John the Baptist","Valley View","MS","Burning","The church was the first ever used for voter registration in the county, and a CORE Freedom School.","Papers of the Congress of Racial Equality, 1941–1967. Wisconsin Historical Society (Madison, WI)."],
  ["9/17/64","Cedar Grove Baptist","Eadison County","MS","Burning","Leveled by fire. The church was a CORE Freedom School.","Papers of the Congress of Racial Equality, 1941–1967. Wisconsin Historical Society (Madison, WI)."],
  ["9/18/64","Pine Ridge Sanctified","Pine Ridge","MS","Bombing","Less than a third of the building was left standing after a series of dynamite explosions.","Papers of the Congress of Racial Equality, 1941–1967. Wisconsin Historical Society (Madison, WI)."],
  ["9/18/64","Choctaw Indian Church","Philadelphia","MS","Burning","This Native American congregation was completely destroyed by fire during the same period as twenty-four other churches in Mississippi during Freedom Summer.","Papers of the Congress of Racial Equality, 1941–1967. Wisconsin Historical Society (Madison, WI)."],
  ["9/20/64","Society Hill Baptist","McComb","MS","Bombing","The blast caved in the roof and took down two external walls. This congregation had deep Civil Rights Movement connections.","Papers of the Congress of Racial Equality, 1941–1967. Wisconsin Historical Society (Madison, WI)."],
  ["9/23/64","Battlefield Church","Meridian","MS","Burning","Moderate damage as a result of fire.","Papers of the Congress of Racial Equality, 1941–1967. Wisconsin Historical Society (Madison, WI)."],
  ["11/1/64","Antioch Baptist Church","Jackson","MS","Burning","Antioch Baptist Church was used as part of civil rights organizing. A fire was started early in the morning completely destroying the church.","Alabama Tribune: August 8, 1964"],
  ["12/14/64","First Baptist","Montgomery","AL","Burning","Gas filled balloons were lit over crowded services","Southern Regional Council – Series 1: Clippings and Series 2: Publications. Southern Regional Council Collection, Auburn Avenue Research Library on African American Culture and History (Atlanta, GA)."],
  ["1/18/65","Pleasant Grove Baptist","Jonesboro","LA","Burning","One of two churches burned to the ground on the same night, both had been voter registration sites.","Southern Regional Council – Series 1: Clippings and Series 2: Publications. Southern Regional Council Collection, Auburn Avenue Research Library on African American Culture and History (Atlanta, GA)."],
  ["1/18/65","Bethany Baptist","Jonesboro","LA","Burning","One of two churches burned to the ground on the same night, both had been voter registration sites.","Southern Regional Council – Series 1: Clippings and Series 2: Publications. Southern Regional Council Collection, Auburn Avenue Research Library on African American Culture and History (Atlanta, GA)."],
  ["1/24/65","St. Peters AME Zion","New Bern","NC","Bombing","Three bombs exploded during a civil rights rally at the church.","Southern Regional Council – Series 1: Clippings and Series 2: Publications. Southern Regional Council Collection, Auburn Avenue Research Library on African American Culture and History (Atlanta, GA)."],
  ["2/1/65","Ewell's Chapel AME","Fayette County","TN","Burning","","Southern Regional Council – Series 1: Clippings and Series 2: Publications. Southern Regional Council Collection, Auburn Avenue Research Library on African American Culture and History (Atlanta, GA)."],
  ["2/22/65","Mennonite Chapel","Philadelphia","MS","Burning","This church had previously been destroyed by fire in 1964.","Southern Regional Council – Series 1: Clippings and Series 2: Publications. Southern Regional Council Collection, Auburn Avenue Research Library on African American Culture and History (Atlanta, GA)."],
  ["3/21/65","Our Lady of the Universe","Birmingham","AL","Burning","One of the attempted green box bombs delivered on the day the March from Selma reached Montgomery.","Southern Regional Council – Series 1: Clippings and Series 2: Publications. Southern Regional Council Collection, Auburn Avenue Research Library on African American Culture and History (Atlanta, GA)."],
  ["3/29/65","Mt. Pleasant Baptist","Meridian","MS","Burning","One of three churches firebombed on the same night.","Southern Regional Council – Series 1: Clippings and Series 2: Publications. Southern Regional Council Collection, Auburn Avenue Research Library on African American Culture and History (Atlanta, GA)."],
  ["3/29/65","Bethel Baptist","Meridian","MS","Burning","One of three churches firebombed on the same night.","Southern Regional Council – Series 1: Clippings and Series 2: Publications. Southern Regional Council Collection, Auburn Avenue Research Library on African American Culture and History (Atlanta, GA)."],
  ["3/29/65","unnamed Black Church","Meridian","MS","Burning","One of three churches firebombed on the same night.","Southern Regional Council – Series 1: Clippings and Series 2: Publications. Southern Regional Council Collection, Auburn Avenue Research Library on African American Culture and History (Atlanta, GA)."],
  ["4/13/65","Mt. Pisgah Baptist","Brandon","MS","Burning","","Southern Regional Council – Series 1: Clippings and Series 2: Publications. Southern Regional Council Collection, Auburn Avenue Research Library on African American Culture and History (Atlanta, GA)."],
  ["5/11/65","unnamed Black Church","New Orleans","LA","Bombing","","Southern Regional Council – Series 1: Clippings and Series 2: Publications. Southern Regional Council Collection, Auburn Avenue Research Library on African American Culture and History (Atlanta, GA)."],
  ["5/13/65","Pine Ridge CME Church","Anniston","AL","Bombing","","Alabama Tribune: August 8, 1963"],
  ["5/24/65","Ebenezer Baptist Church","Bogalusa","LA","Burning","Two white Bogalusa residents attempted to set the church on fire before civil rights leader James Farmer was scheduled to speak. They were arrested before they could proceed.","Alabama Tribune: August 8, 1969"],
  ["7/10/65","Mt. Sinai Baptist","Tallapoosa","GA","Burning","","Southern Regional Council – Series 1: Clippings and Series 2: Publications. Southern Regional Council Collection, Auburn Avenue Research Library on African American Culture and History (Atlanta, GA)."],
  ["7/10/65","Mt. Newley","Tallapoosa","GA","Burning","","Southern Regional Council – Series 1: Clippings and Series 2: Publications. Southern Regional Council Collection, Auburn Avenue Research Library on African American Culture and History (Atlanta, GA)."],
  ["8/4/65","Prophecy Baptist","Slidell","LA","Burning","Arson by nightriders","Southern Regional Council – Series 1: Clippings and Series 2: Publications. Southern Regional Council Collection, Auburn Avenue Research Library on African American Culture and History (Atlanta, GA)."],
  ["8/4/65","Hartzell Community Center/Methodist Church","Slidell","LA","Burning","Arson by nightriders","Southern Regional Council – Series 1: Clippings and Series 2: Publications. Southern Regional Council Collection, Auburn Avenue Research Library on African American Culture and History (Atlanta, GA)."],
  ["8/10/65","John Missionary Baptist","Greenville","MS","Burning","","Southern Regional Council – Series 1: Clippings and Series 2: Publications. Southern Regional Council Collection, Auburn Avenue Research Library on African American Culture and History (Atlanta, GA)."],
  ["8/15/65","Bells Chapel Baptist","Greenwood","MS","Burning","","Southern Regional Council – Series 1: Clippings and Series 2: Publications. Southern Regional Council Collection, Auburn Avenue Research Library on African American Culture and History (Atlanta, GA)."],
  ["8/16/65","Tabernacle Baptist","Sonoraville","GA","Burning","Part of a spree of four arsons by the same person.","Southern Regional Council – Series 1: Clippings and Series 2: Publications. Southern Regional Council Collection, Auburn Avenue Research Library on African American Culture and History (Atlanta, GA)."],
  ["8/18/65","New Redeemer Episcopal","Pineville","SC","Burning","Arson. The church was a site of Civil Rights activity.","Southern Regional Council – Series 1: Clippings and Series 2: Publications. Southern Regional Council Collection, Auburn Avenue Research Library on African American Culture and History (Atlanta, GA)."],
  ["9/21/65","Shiloh Missionary Baptist Church","Fort Lauderdale","FL","Burning","Church was set on fire. Authorities confirmed arson from smell of kerosene and gasoline. Significant damages.","Alabama Tribune: August 8, 1972"],
  ["9/28/65","Ray Valley Baptist","Laurel","MS","Burning","","Southern Regional Council – Series 1: Clippings and Series 2: Publications. Southern Regional Council Collection, Auburn Avenue Research Library on African American Culture and History (Atlanta, GA)."],
  ["10/25/65","New Prospect Baptist","Corinth","MS","Burning","","Southern Regional Council – Series 1: Clippings and Series 2: Publications. Southern Regional Council Collection, Auburn Avenue Research Library on African American Culture and History (Atlanta, GA)."],
  ["11/3/65","Naylor CME Chapel","Rough Edge","MS","Burning","","Southern Regional Council – Series 1: Clippings and Series 2: Publications. Southern Regional Council Collection, Auburn Avenue Research Library on African American Culture and History (Atlanta, GA)."],
  ["11/11/65","unnamed Black Church","Gray","GA","Burning","","Southern Regional Council – Series 1: Clippings and Series 2: Publications. Southern Regional Council Collection, Auburn Avenue Research Library on African American Culture and History (Atlanta, GA)."],
  ["11/12/65","Rocky Mount","Red Oak","GA","Burning","Part of a spree of four arsons by the same person.","Southern Regional Council – Series 1: Clippings and Series 2: Publications. Southern Regional Council Collection, Auburn Avenue Research Library on African American Culture and History (Atlanta, GA)."],
  ["11/12/65","St. Pauls","Wayside","GA","Burning","Part of a spree of four arsons by the same person.","Southern Regional Council – Series 1: Clippings and Series 2: Publications. Southern Regional Council Collection, Auburn Avenue Research Library on African American Culture and History (Atlanta, GA)."],
  ["11/12/65","unnamed Black Church","Twiggs County","GA","Burning","Part of a spree of four arsons by the same person.","Southern Regional Council – Series 1: Clippings and Series 2: Publications. Southern Regional Council Collection, Auburn Avenue Research Library on African American Culture and History (Atlanta, GA)."],
  ["11/29/65","Pleasant Grove Church / Bethany Baptist Church","Jonesboro","LA","Burning","Church being rebuilt from bombing in early January was set on fire again during rebuild.","Alabama Tribune: August 8, 1970"],
  ["4/9/66","Red Bud Church of the Disciples","Castalia","NC","Bombing","Church was attacked with three bombs.","Southern Regional Council – Series 1: Clippings and Series 2: Publications. Southern Regional Council Collection, Auburn Avenue Research Library on African American Culture and History (Atlanta, GA)."],
  ["4/10/66","Coral Springs Free Will Baptist","New Bern","NC","Bombing","","Southern Regional Council – Series 1: Clippings and Series 2: Publications. Southern Regional Council Collection, Auburn Avenue Research Library on African American Culture and History (Atlanta, GA)."],
  ["10/9/66","Mount Olive","Gillet","AR","Burning","","Southern Regional Council – Series 1: Clippings and Series 2: Publications. Southern Regional Council Collection, Auburn Avenue Research Library on African American Culture and History (Atlanta, GA)."],
  ["10/9/66","Mount Olive #2","Gillet","AR","Burning","","Southern Regional Council – Series 1: Clippings and Series 2: Publications. Southern Regional Council Collection, Auburn Avenue Research Library on African American Culture and History (Atlanta, GA)."],
  ["11/20/66","Mount Zion Baptist","New Orleans","LA","Burning","","Southern Regional Council – Series 1: Clippings and Series 2: Publications. Southern Regional Council Collection, Auburn Avenue Research Library on African American Culture and History (Atlanta, GA)."],
  ["2/4/67","Briarwood Presbyterian","Jackson","MS","Bombing","Attempted dynamite","Southern Regional Council – Series 1: Clippings and Series 2: Publications. Southern Regional Council Collection, Auburn Avenue Research Library on African American Culture and History (Atlanta, GA)."],
  ["3/5/67","Vincent Chapel AME","Grenada","MS","Burning","Congregation was connected to SCLC.","Southern Regional Council – Series 1: Clippings and Series 2: Publications. Southern Regional Council Collection, Auburn Avenue Research Library on African American Culture and History (Atlanta, GA)."],
  ["4/24/67","Pleasant Grove Methodist Church","Griffin","GA","Other","Four white men robbed Black church during service, kidnapped two teenage girls and later raped them.","Southern Regional Council – Series 1: Clippings and Series 2: Publications. Southern Regional Council Collection, Auburn Avenue Research Library on African American Culture and History (Atlanta, GA)."],
  ["8/10/67","Glorious Holiness Church","Mobile","AL","Burning","Attempted arson during church service by a white man.","Southern Regional Council – Series 1: Clippings and Series 2: Publications. Southern Regional Council Collection, Auburn Avenue Research Library on African American Culture and History (Atlanta, GA)."],
  ["8/27/67","Thunderbolt Baptist Church","Savannah","GA","Burning","Arson","Southern Regional Council – Series 1: Clippings and Series 2: Publications. Southern Regional Council Collection, Auburn Avenue Research Library on African American Culture and History (Atlanta, GA)."],
  ["11/9/67","Nebo Baptist","Murfreesboro","NC","Burning","Building razed by arson.","Southern Regional Council – Series 1: Clippings and Series 2: Publications. Southern Regional Council Collection, Auburn Avenue Research Library on African American Culture and History (Atlanta, GA)."],
  ["11/15/67","St. Pauls Methodist - Parsonage","Laurel","NC","Bombing","Dynamite","Southern Regional Council – Series 1: Clippings and Series 2: Publications. Southern Regional Council Collection, Auburn Avenue Research Library on African American Culture and History (Atlanta, GA)."],
  ["12/18/67","Mt. Pleasant Baptist","Meridian","MS","Burning","Arson. A flammable liquid was sprayed on floor and then lit.","Southern Regional Council – Series 1: Clippings and Series 2: Publications. Southern Regional Council Collection, Auburn Avenue Research Library on African American Culture and History (Atlanta, GA)."],
  ["12/25/67","unnamed Black Church","Wilkes","NC","Bombing","Dynamite","Southern Regional Council – Series 1: Clippings and Series 2: Publications. Southern Regional Council Collection, Auburn Avenue Research Library on African American Culture and History (Atlanta, GA)."],
  ["2/25/68","The New Hope Baptist","Meridian","MS","Burning","Arson","Southern Regional Council – Series 1: Clippings and Series 2: Publications. Southern Regional Council Collection, Auburn Avenue Research Library on African American Culture and History (Atlanta, GA)."],
  ["2/28/68","Newell Chapel Methodist","Meridian","MS","Burning","Arson","Southern Regional Council – Series 1: Clippings and Series 2: Publications. Southern Regional Council Collection, Auburn Avenue Research Library on African American Culture and History (Atlanta, GA)."],
  ["4/15/68","Mt. Pleasant Baptist","Meridian","MS","Burning","This was the third time the congregation had been targeted. The building was destroyed by fire.","Southern Regional Council – Series 1: Clippings and Series 2: Publications. Southern Regional Council Collection, Auburn Avenue Research Library on African American Culture and History (Atlanta, GA)."],
  ["1/18/69","New Bethel AME","Lithonia","GA","Burning","Arson - pages of the Bible were used as starter material.","Southern Regional Council – Series 1: Clippings and Series 2: Publications. Southern Regional Council Collection, Auburn Avenue Research Library on African American Culture and History (Atlanta, GA)."],
  ["2/14/69","Sycamore Hill Baptist","Greenville","NC","Burning","Prior to its burning this church was the last building holding out against an urban renewal zone.","Southern Regional Council – Series 1: Clippings and Series 2: Publications. Southern Regional Council Collection, Auburn Avenue Research Library on African American Culture and History (Atlanta, GA)."],
  ["8/16/69","El Bethel","Lincoln County","NC","Bombing","Bombing.","Southern Regional Council – Series 1: Clippings and Series 2: Publications. Southern Regional Council Collection, Auburn Avenue Research Library on African American Culture and History (Atlanta, GA)."],
  ["8/30/69","Bethel AME","Casseta","GA","Burning","","Southern Regional Council – Series 1: Clippings and Series 2: Publications. Southern Regional Council Collection, Auburn Avenue Research Library on African American Culture and History (Atlanta, GA)."],
  ["12/25/69","Eskridge Groove Baptist - Parsonage","Shelby","NC","Bombing","Dynamite","Southern Regional Council – Series 1: Clippings and Series 2: Publications. Southern Regional Council Collection, Auburn Avenue Research Library on African American Culture and History (Atlanta, GA)."],
  ["Mar-70","unnamed Black Church","Panola County","MS","Burning","One of three small unnamed rural churches damaged by fire. Similar to nearby Leland arsons.","Southern Regional Council – Series 1: Clippings and Series 2: Publications. Southern Regional Council Collection, Auburn Avenue Research Library on African American Culture and History (Atlanta, GA)."],
  ["3/30/70","unnamed Black Church","Panola County","MS","Burning","One of three small unnamed rural churches damaged by fire. Similar to nearby Leland arsons.","Southern Regional Council – Series 1: Clippings and Series 2: Publications. Southern Regional Council Collection, Auburn Avenue Research Library on African American Culture and History (Atlanta, GA)."],
  ["3/30/70","unnamed Black Church","Panola County","MS","Burning","One of three small unnamed rural churches damaged by fire. Similar to nearby Leland arsons.","Southern Regional Council – Series 1: Clippings and Series 2: Publications. Southern Regional Council Collection, Auburn Avenue Research Library on African American Culture and History (Atlanta, GA)."],
  ["3/31/70","St. Matthew's AME","Leland","MS","Burning","Arson","Southern Regional Council – Series 1: Clippings and Series 2: Publications. Southern Regional Council Collection, Auburn Avenue Research Library on African American Culture and History (Atlanta, GA)."],
  ["3/31/70","Holley Grove MB","Leland","MS","Burning","Arson","Southern Regional Council – Series 1: Clippings and Series 2: Publications. Southern Regional Council Collection, Auburn Avenue Research Library on African American Culture and History (Atlanta, GA)."],
  ["3/31/70","No. 14 Church","Leland","MS","Burning","Arson","Southern Regional Council – Series 1: Clippings and Series 2: Publications. Southern Regional Council Collection, Auburn Avenue Research Library on African American Culture and History (Atlanta, GA)."],
  ["3/31/70","Hill Primitive Baptist","Coosa","MS","Burning","","Southern Regional Council – Series 1: Clippings and Series 2: Publications. Southern Regional Council Collection, Auburn Avenue Research Library on African American Culture and History (Atlanta, GA)."],
  ["6/11/70","Summerfield Baptist","Forrest City","AR","Burning","The church building was heavily damaged by fire. Had recently been a site for Civil Rights meetings.","Southern Regional Council – Series 1: Clippings and Series 2: Publications. Southern Regional Council Collection, Auburn Avenue Research Library on African American Culture and History (Atlanta, GA)."],
  ["Fall 1964","New Chapel Methodist","Pulaski","MS","Burning","Destroyed. The FBI described the arson as malicious.","Papers of the Congress of Racial Equality, 1941–1967. Wisconsin Historical Society (Madison, WI)."],
  ["Fall 1969","unnamed Black Church","Forrest City","AR","Burning","One of three small unnamed Black churches in the same town destroyed by fire.","Southern Regional Council – Series 1: Clippings and Series 2: Publications. Southern Regional Council Collection, Auburn Avenue Research Library on African American Culture and History (Atlanta, GA)."],
  ["Spring 1970","unnamed Black Church","Forrest City","AR","Burning","One of three small unnamed Black churches in the same town destroyed by fire.","Southern Regional Council – Series 1: Clippings and Series 2: Publications. Southern Regional Council Collection, Auburn Avenue Research Library on African American Culture and History (Atlanta, GA)."],
  ["Winter 1967","Belle Flower Baptist","Grenada","MS","Burning","","Southern Regional Council – Series 1: Clippings and Series 2: Publications. Southern Regional Council Collection, Auburn Avenue Research Library on African American Culture and History (Atlanta, GA)."],
  ["Winter 1970","unnamed Black Church","Forrest City","AR","Burning","One of three small unnamed Black churches in the same town destroyed by fire.","Southern Regional Council – Series 1: Clippings and Series 2: Publications. Southern Regional Council Collection, Auburn Avenue Research Library on African American Culture and History (Atlanta, GA)."],
];

async function createRecords(batch) {
  const body = {
    records: batch.map(([date, name, city, state, type, desc, source]) => {
      const { isoDate, notes } = parseDate(date);
      const fields = {
        "Church name": name,
        "City": city,
        "State": state,
        "Incident type": type,
        "Status": "Done",
      };
      if (isoDate) fields["Date"] = isoDate;
      // Store original date string and notes in Notes field
      const noteParts = [];
      if (notes) noteParts.push(`Date: ${notes}`);
      if (desc) noteParts.push(desc);
      if (noteParts.length) fields["Notes"] = noteParts.join("\n\n");
      if (source) fields["Sources/Citations"] = source;
      return { fields };
    }),
  };

  const res = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Airtable error ${res.status}: ${err}`);
  }
  return res.json();
}

async function run() {
  console.log(`Importing ${records.length} records in batches of 10...`);
  // Airtable allows max 10 records per POST
  for (let i = 0; i < records.length; i += 10) {
    const batch = records.slice(i, i + 10);
    try {
      const result = await createRecords(batch);
      console.log(`Batch ${Math.floor(i / 10) + 1}: created ${result.records.length} records`);
    } catch (e) {
      console.error(`Batch ${Math.floor(i / 10) + 1} failed:`, e.message);
    }
    // Small delay to avoid rate limits
    await new Promise(r => setTimeout(r, 250));
  }
  console.log("Import complete.");
}

run();

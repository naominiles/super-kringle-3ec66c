import type { CaseRecord } from "@/lib/data"

/**
 * Static geocode lookup for known city/state combos in the dataset.
 * Falls back to a state-capital-level approximation if the exact city isn't listed.
 * Returns [lat, lng] or null if nothing can be resolved.
 */

const CITY_COORDS: Record<string, [number, number]> = {
  // Alabama
  "birmingham, alabama": [33.5186, -86.8104],
  "montgomery, alabama": [32.3668, -86.3],
  "mobile, alabama": [30.6954, -88.0399],
  "tuscaloosa, alabama": [33.2098, -87.5692],
  "bessemer, alabama": [33.4018, -86.9541],
  "anniston, alabama": [33.6598, -85.8316],
  "selma, alabama": [32.4074, -87.0211],
  "hayneville, alabama": [32.1796, -86.5836],
  "ft. deposit, alabama": [31.9835, -86.6561],
  "fort deposit, alabama": [31.9835, -86.6561],
  "oxford, alabama": [33.6143, -85.8352],
  "greens county, alabama": [32.6, -87.6],
  "lowndes county, alabama": [32.1518, -86.6383],
  // Arkansas
  "gillet, ar": [34.1237, -91.3765],
  "gillet, arkansas": [34.1237, -91.3765],
  "pine bluff, ar": [34.2284, -92.0032],
  "pine bluff, arkansas": [34.2284, -92.0032],
  // Florida
  "jacksonville, florida": [30.3322, -81.6557],
  "tallahassee, florida": [30.4383, -84.2807],
  "miami, florida": [25.7617, -80.1918],
  "havana, florida": [30.6235, -84.4141],
  "fort meyers, florida": [26.6406, -81.8723],
  "fort myers, florida": [26.6406, -81.8723],
  "fort lauderdale, florida": [26.1224, -80.1373],
  // Georgia
  "atlanta, georgia": [33.749, -84.388],
  "savannah, georgia": [32.0809, -81.0912],
  "macon, georgia": [32.8407, -83.6324],
  "albany, georgia": [31.5785, -84.1557],
  "americus, georgia": [32.0724, -84.2327],
  "sasser, georgia": [31.7149, -84.3491],
  "leesburg, georgia": [31.7299, -84.1727],
  "dawson, georgia": [31.7735, -84.4452],
  "valdosta, georgia": [30.8327, -83.2785],
  "dekalb county, georgia": [33.772, -84.224],
  "sasser/albany area, georgia": [31.7149, -84.3491],
  "tallapoosa, georgia": [33.7401, -85.2891],
  "sonoraville, georgia": [34.3776, -84.8577],
  "gray, georgia": [33.0026, -83.5321],
  "red oak, georgia": [33.6057, -84.5899],
  "wayside, georgia": [33.05, -83.45],
  "twiggs county, georgia": [32.667, -83.417],
  "griffin, georgia": [33.2468, -84.2641],
  "lithonia, georgia": [33.7118, -84.1052],
  "casseta, georgia": [32.6249, -84.7702],
  "pineville, georgia": [31.529, -82.215],
  // Louisiana
  "new orleans, louisiana": [29.9511, -90.0715],
  "baton rouge, louisiana": [30.4515, -91.1871],
  "shreveport, louisiana": [32.5252, -93.7502],
  "jonesboro, louisiana": [32.2415, -92.7132],
  "plaquemine, louisiana": [30.2891, -91.2343],
  "bogalusa, louisiana": [30.7910, -89.8487],
  "slidell, louisiana": [30.2752, -89.7812],
  // Maryland
  "baltimore, maryland": [39.2904, -76.6122],
  // Mississippi
  "jackson, mississippi": [32.2988, -90.1848],
  "meridian, mississippi": [32.3643, -88.7037],
  "hattiesburg, mississippi": [31.3271, -89.2903],
  "philadelphia, mississippi": [32.7715, -89.1167],
  "brandon, mississippi": [32.2729, -89.9842],
  "mccomb, mississippi": [31.2435, -90.4532],
  "mc comb, mississippi": [31.2435, -90.4532],
  "mc comb , mississippi": [31.2435, -90.4532],
  "ruleville, mississippi": [33.7229, -90.5487],
  "clinton, mississippi": [32.3418, -90.3218],
  "jackson , mississippi": [32.2988, -90.1848],
  "madison county, mississippi": [32.5418, -89.9787],
  "pike county, mississippi": [31.1776, -90.4021],
  "rankin county, mississippi": [32.2543, -89.9393],
  "finwick, mississippi": [32.45, -89.35],
  "gluckstadt, mississippi": [32.5418, -90.0654],
  "itta bena, mississippi": [33.5026, -90.3315],
  "aberdeen, mississippi": [33.8251, -88.5448],
  "valley view, mississippi": [33.25, -88.75],
  "eadison county, mississippi": [32.85, -89.1],
  "pine ridge, mississippi": [31.6, -90.15],
  "greenville, mississippi": [33.4101, -91.0618],
  "greenwood, mississippi": [33.5162, -90.1795],
  "laurel, mississippi": [31.6946, -89.1306],
  "corinth, mississippi": [34.9343, -88.5223],
  "rough edge, mississippi": [31.7, -89.0],
  "panola county, mississippi": [34.3637, -89.9529],
  "leland, mississippi": [33.4026, -90.8976],
  "browning, mississippi": [33.55, -90.3],
  "kingston, mississippi": [31.75, -90.35],
  "grenada, mississippi": [33.7693, -89.8087],
  // North Carolina
  "charlotte, north carolina": [35.2271, -80.8431],
  "greensboro, north carolina": [36.0726, -79.792],
  "raleigh, north carolina": [35.7796, -78.6382],
  "new bern, north carolina": [35.1085, -77.0441],
  "elm city, north carolina": [35.8085, -77.8619],
  "murfreesboro, north carolina": [36.4424, -77.0991],
  "laurel, north carolina": [35.3596, -82.0096],
  "wilkes, north carolina": [36.15, -81.15],
  "castalia, north carolina": [36.0849, -78.0494],
  "lincoln county, north carolina": [35.4737, -81.2176],
  "shelby, north carolina": [35.2923, -81.5354],
  "greenville, north carolina": [35.6127, -77.3664],
  // South Carolina
  "charleston, south carolina": [32.7765, -79.9311],
  "columbia, south carolina": [34.0007, -81.0348],
  "greeleyville, south carolina": [33.572, -79.99],
  "orangeburg, south carolina": [33.4918, -80.8556],
  "pineville, south carolina": [33.2271, -80.0048],
  // Tennessee
  "memphis, tennessee": [35.1495, -90.049],
  "nashville, tennessee": [36.1627, -86.7816],
  "knoxville, tennessee": [35.9606, -83.9207],
  "grand junction, tn": [35.0279, -89.1892],
  "grand junction, tennessee": [35.0279, -89.1892],
  "fayette county, tn": [35.1726, -89.4126],
  "fayette county, tennessee": [35.1726, -89.4126],
  // Texas
  "houston, texas": [29.7604, -95.3698],
  "dallas, texas": [32.7767, -96.797],
  "san antonio, texas": [29.4241, -98.4936],
  // Virginia
  "richmond, virginia": [37.5407, -77.436],
  "norfolk, virginia": [36.8508, -76.2859],
  "arlington, virginia": [38.8816, -77.0910],
  // DC
  "washington, district of columbia": [38.9072, -77.0369],
}

/** State abbreviation → full name */
const STATE_ABBR: Record<string, string> = {
  AL: "alabama", AK: "alaska", AZ: "arizona", AR: "arkansas", CA: "california",
  CO: "colorado", CT: "connecticut", DE: "delaware", FL: "florida", GA: "georgia",
  HI: "hawaii", ID: "idaho", IL: "illinois", IN: "indiana", IA: "iowa",
  KS: "kansas", KY: "kentucky", LA: "louisiana", ME: "maine", MD: "maryland",
  MA: "massachusetts", MI: "michigan", MN: "minnesota", MS: "mississippi",
  MO: "missouri", MT: "montana", NE: "nebraska", NV: "nevada", NH: "new hampshire",
  NJ: "new jersey", NM: "new mexico", NY: "new york", NC: "north carolina",
  ND: "north dakota", OH: "ohio", OK: "oklahoma", OR: "oregon", PA: "pennsylvania",
  RI: "rhode island", SC: "south carolina", SD: "south dakota", TN: "tennessee",
  TX: "texas", UT: "utah", VT: "vermont", VA: "virginia", WA: "washington",
  WV: "west virginia", WI: "wisconsin", WY: "wyoming", DC: "district of columbia",
}

/** State-level fallback coordinates (capital or geographic center) */
const STATE_COORDS: Record<string, [number, number]> = {
  alabama: [32.806671, -86.79113],
  alaska: [61.370716, -152.404419],
  arizona: [33.729759, -111.431221],
  arkansas: [34.969704, -92.373123],
  california: [36.116203, -119.681564],
  colorado: [39.059811, -105.311104],
  connecticut: [41.597782, -72.755371],
  delaware: [39.318523, -75.507141],
  florida: [27.766279, -81.686783],
  georgia: [33.040619, -83.643074],
  hawaii: [21.094318, -157.498337],
  idaho: [44.240459, -114.478828],
  illinois: [40.349457, -88.986137],
  indiana: [39.849426, -86.258278],
  iowa: [42.011539, -93.210526],
  kansas: [38.5266, -96.726486],
  kentucky: [37.66814, -84.670067],
  louisiana: [31.169546, -91.867805],
  maine: [44.693947, -69.381927],
  maryland: [39.063946, -76.802101],
  massachusetts: [42.230171, -71.530106],
  michigan: [43.326618, -84.536095],
  minnesota: [45.694454, -93.900192],
  mississippi: [32.741646, -89.678696],
  missouri: [38.456085, -92.288368],
  montana: [46.921925, -110.454353],
  nebraska: [41.12537, -98.268082],
  nevada: [38.313515, -117.055374],
  "new hampshire": [43.452492, -71.563896],
  "new jersey": [40.298904, -74.521011],
  "new mexico": [34.840515, -106.248482],
  "new york": [42.165726, -74.948051],
  "north carolina": [35.630066, -79.806419],
  "north dakota": [47.528912, -99.784012],
  ohio: [40.388783, -82.764915],
  oklahoma: [35.565342, -96.928917],
  oregon: [44.572021, -122.070938],
  pennsylvania: [40.590752, -77.209755],
  "rhode island": [41.680893, -71.51178],
  "south carolina": [33.856892, -80.945007],
  "south dakota": [44.299782, -99.438828],
  tennessee: [35.747845, -86.692345],
  texas: [31.054487, -97.563461],
  utah: [40.150032, -111.862434],
  vermont: [44.045876, -72.710686],
  virginia: [37.769337, -78.169968],
  washington: [47.400902, -121.490494],
  "west virginia": [38.491226, -80.954453],
  wisconsin: [44.268543, -89.616508],
  wyoming: [42.755966, -107.30249],
  "district of columbia": [38.9072, -77.0369],
}

export function geocodeCase(c: CaseRecord): [number, number] | null {
  // If the record has explicit lat/lng, use those
  if (c.lat && c.lng && c.lat !== 0 && c.lng !== 0) {
    return [c.lat, c.lng]
  }

  // Normalize: lowercase, collapse whitespace, strip trailing punctuation
  const normalize = (s: string) => s.toLowerCase().replace(/\s+/g, " ").trim()

  // Try city + state (normalized)
  const key = `${normalize(c.city)}, ${normalize(c.state)}`
  if (CITY_COORDS[key]) return CITY_COORDS[key]

  // Try city + state abbreviation expanded (e.g. "AL" -> "alabama")
  const stateExpanded = STATE_ABBR[c.state.trim().toUpperCase()]
  if (stateExpanded) {
    const keyExpanded = `${normalize(c.city)}, ${stateExpanded}`
    if (CITY_COORDS[keyExpanded]) return CITY_COORDS[keyExpanded]
  }

  // Fall back to state
  const stateKey = stateExpanded ?? normalize(c.state)
  if (STATE_COORDS[stateKey]) return STATE_COORDS[stateKey]

  return null
}

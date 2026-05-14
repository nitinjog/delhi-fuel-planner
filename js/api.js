// ── Geocode: local curated list (no external API) ────────────
function geocode(query) {
  return Promise.resolve(searchLocations(query));
}

// ── OSRM routing with alternatives ───────────────────────────
// Returns up to 3 routes; each includes pre-computed signals and road type
async function getRoutes(start, end) {
  const url =
    `https://router.project-osrm.org/route/v1/driving/` +
    `${start.lon},${start.lat};${end.lon},${end.lat}` +
    `?overview=full&geometries=geojson&steps=true&alternatives=true`;

  const res = await fetch(url);
  if (!res.ok) throw new Error(`Routing failed (HTTP ${res.status})`);
  const data = await res.json();
  if (data.code !== 'Ok' || !data.routes.length)
    throw new Error('No route found between these locations.');

  return data.routes.slice(0, 3).map((route, i) => {
    const roadType = inferRoadType(route.legs);
    const signals  = estimateSignalsFromSteps(route.legs, roadType);
    return {
      id:       i,
      distance: route.distance,   // metres
      duration: route.duration,   // seconds — OSRM free-flow (speed-limit based)
      geometry: route.geometry,   // GeoJSON LineString
      legs:     route.legs,
      roadType,
      signals,
      name: inferRouteName(route.legs, i),
    };
  });
}

// ── Optional: Google Maps Directions API ──────────────────────
// User provides key; stored in localStorage — never in repo.
// Requires the key to be restricted to your GitHub Pages domain
// in Google Cloud Console → APIs & Services → Credentials.
async function getGoogleRoutes(start, end, apiKey) {
  const url =
    `https://maps.googleapis.com/maps/api/directions/json` +
    `?origin=${start.lat},${start.lon}` +
    `&destination=${end.lat},${end.lon}` +
    `&alternatives=true&mode=driving` +
    `&traffic_model=best_guess&departure_time=now` +
    `&key=${apiKey}`;

  const res = await fetch(url);
  if (!res.ok) throw new Error(`Google Maps HTTP ${res.status}`);
  const data = await res.json();
  if (data.status === 'REQUEST_DENIED')
    throw new Error('Google Maps API key invalid or not enabled for Directions API');
  if (data.status !== 'OK')
    throw new Error(`Google Maps error: ${data.status}`);

  return data.routes.slice(0, 3).map((route, i) => {
    const leg    = route.legs[0];
    const coords = decodePolyline(route.overview_polyline.points);
    const roadType = 'urban'; // Google doesn't expose OSM road class directly
    const signals  = estimateSignalsFromGoogleSteps(leg.steps);
    return {
      id:                i,
      distance:          leg.distance.value,                         // metres
      duration:          leg.duration.value,                         // free-flow seconds
      durationInTraffic: leg.duration_in_traffic?.value ?? leg.duration.value,
      geometry:          { type: 'LineString', coordinates: coords },
      legs:              [leg],
      roadType,
      signals,
      name: route.summary || `Route ${i + 1}`,
      source: 'google',
    };
  });
}

// ── Google encoded polyline decoder → [lon, lat] (GeoJSON order) ──
function decodePolyline(encoded) {
  const poly = []; let index = 0, lat = 0, lng = 0;
  while (index < encoded.length) {
    let b, shift = 0, result = 0;
    do { b = encoded.charCodeAt(index++) - 63; result |= (b & 0x1f) << shift; shift += 5; } while (b >= 0x20);
    lat += (result & 1) ? ~(result >> 1) : (result >> 1);
    shift = result = 0;
    do { b = encoded.charCodeAt(index++) - 63; result |= (b & 0x1f) << shift; shift += 5; } while (b >= 0x20);
    lng += (result & 1) ? ~(result >> 1) : (result >> 1);
    poly.push([lng / 1e5, lat / 1e5]);
  }
  return poly;
}

// ── Signal estimation from OSRM steps ────────────────────────
// Uses real intersection/maneuver data from the route — far more accurate
// than the previous bounding-box Overpass approach which overcounted
// by including signals in parallel streets outside the actual route.
function estimateSignalsFromSteps(legs, roadType) {
  const turnTypes = new Set([
    'turn', 'end of road', 'fork', 'roundabout',
    'rotary', 'exit roundabout', 'roundabout turn',
  ]);
  let intersections = 0;
  for (const leg of (legs || []))
    for (const step of (leg.steps || []))
      if (turnTypes.has(step.maneuver?.type) && (step.distance || 0) > 80)
        intersections++;

  // Fraction of intersections with formal traffic signals in Delhi NCR
  const sf = { highway: 0.15, arterial: 0.45, urban: 0.55, residential: 0.30 };
  return Math.max(1, Math.round(intersections * (sf[roadType] ?? 0.50)));
}

function estimateSignalsFromGoogleSteps(steps) {
  // Google steps represent segments between maneuvers — count maneuvers as intersections
  return Math.max(1, Math.round((steps?.length ?? 0) * 0.45));
}

// ── Route name from OSRM refs ─────────────────────────────────
function inferRouteName(legs, idx) {
  const refs = new Set();
  for (const leg of (legs || []))
    for (const step of (leg.steps || []))
      if (/NH|SH|DND|KMP|EPE|YEW|RRR|GEW/i.test(step.ref || ''))
        refs.add(step.ref.split(';')[0].trim());
  if (refs.size) return `via ${Array.from(refs).slice(0, 2).join(' / ')}`;
  const allSteps = legs.flatMap(l => l.steps || []);
  const midStep  = allSteps[Math.floor(allSteps.length / 2)];
  return midStep?.name ? `via ${midStep.name}` : `Route ${idx + 1}`;
}

// ── Road type from OSRM steps ─────────────────────────────────
function inferRoadType(legs) {
  if (!legs?.length) return 'urban';
  const cnt = { highway: 0, arterial: 0, residential: 0, other: 0 };
  let total = 0;
  for (const leg of legs)
    for (const step of (leg.steps || [])) {
      const d = step.distance || 0; total += d;
      const r = step.ref || '';
      const n = (step.name || '').toLowerCase();
      if (/NH|SH|expressway/i.test(r) || /expressway|highway/i.test(n)) cnt.highway += d;
      else if (/arterial|primary/i.test(n)) cnt.arterial += d;
      else if (/colony|nagar|vihar|enclave|extension/i.test(n)) cnt.residential += d;
      else cnt.other += d;
    }
  if (!total) return 'urban';
  if (cnt.highway   / total > 0.40) return 'highway';
  if (cnt.arterial  / total > 0.35) return 'arterial';
  if (cnt.residential / total > 0.40) return 'residential';
  return 'urban';
}

// ── Google Maps navigation URL (always free, no key needed) ──
function googleMapsNavUrl(start, end) {
  return (
    `https://www.google.com/maps/dir/?api=1` +
    `&origin=${start.lat},${start.lon}` +
    `&destination=${end.lat},${end.lon}` +
    `&travelmode=driving`
  );
}

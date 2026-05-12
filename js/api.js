// Nominatim geocoding — bounded to Delhi NCR region
async function geocode(query) {
  const params = new URLSearchParams({
    q: query + ', Delhi NCR, India',
    format: 'json',
    limit: 6,
    countrycodes: 'in',
    viewbox: '76.80,29.05,77.85,28.20',
    bounded: 0,
    addressdetails: 1,
  });
  const url = `https://nominatim.openstreetmap.org/search?${params}`;
  const res = await fetch(url, { headers: { 'Accept-Language': 'en', 'User-Agent': 'DelhiFuelPlanner/1.0' } });
  if (!res.ok) throw new Error('Geocoding failed');
  return res.json();
}

// OSRM routing — returns { distance (m), duration (s), geometry (GeoJSON) }
async function getRoute(start, end) {
  const url = `https://router.project-osrm.org/route/v1/driving/${start.lon},${start.lat};${end.lon},${end.lat}?overview=full&geometries=geojson&steps=true`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Routing failed');
  const data = await res.json();
  if (data.code !== 'Ok' || !data.routes.length) throw new Error('No route found');
  const route = data.routes[0];
  return {
    distance: route.distance,
    duration: route.duration,
    geometry: route.geometry,
    legs: route.legs,
  };
}

// Overpass API — count traffic signals in bounding box around route
async function countTrafficSignals(bbox) {
  const { south, west, north, east } = bbox;
  const query = `[out:json][timeout:25];node["highway"="traffic_signals"](${south},${west},${north},${east});out count;`;
  try {
    const res = await fetch('https://overpass-api.de/api/interpreter', {
      method: 'POST',
      body: query,
    });
    if (!res.ok) throw new Error('Overpass error');
    const data = await res.json();
    return parseInt(data.elements[0]?.tags?.total || 0, 10);
  } catch {
    return null; // caller will fall back to estimate
  }
}

// Estimate traffic signals from distance (fallback)
// Delhi avg: ~1 signal per 0.9 km on typical urban roads
function estimateTrafficSignals(distanceKm) {
  return Math.round(distanceKm / 0.9);
}

// Compute bounding box from GeoJSON coordinates with a small buffer
function getRouteBbox(coords) {
  const lats = coords.map(c => c[1]);
  const lons = coords.map(c => c[0]);
  const buf = 0.005;
  return {
    south: Math.min(...lats) - buf,
    west:  Math.min(...lons) - buf,
    north: Math.max(...lats) + buf,
    east:  Math.max(...lons) + buf,
  };
}

// Determine predominant road type from OSRM step data
function inferRoadType(legs) {
  if (!legs || !legs.length) return 'urban';
  const counts = { highway: 0, primary: 0, secondary: 0, residential: 0, service: 0 };
  let totalDist = 0;
  for (const leg of legs) {
    for (const step of (leg.steps || [])) {
      const ref = step.ref || '';
      const name = (step.name || '').toLowerCase();
      const dist = step.distance || 0;
      totalDist += dist;
      if (/NH|SH|expressway/i.test(ref) || /expressway|highway/i.test(name)) counts.highway += dist;
      else if (/primary|arterial/i.test(name)) counts.primary += dist;
      else if (/secondary/i.test(name)) counts.secondary += dist;
      else if (/residential|colony|nagar|vihar/i.test(name)) counts.residential += dist;
      else counts.service += dist;
    }
  }
  if (totalDist === 0) return 'urban';
  const pct = type => counts[type] / totalDist;
  if (pct('highway') > 0.4) return 'highway';
  if (pct('primary') > 0.4) return 'arterial';
  if (pct('residential') > 0.4) return 'residential';
  return 'urban';
}

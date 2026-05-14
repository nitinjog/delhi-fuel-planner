// ── Traffic level helpers ─────────────────────────────────────
function getTrafficLevel(hour, isWeekend) {
  return isWeekend ? WEEKEND_TRAFFIC[hour] : WEEKDAY_TRAFFIC[hour];
}

function trafficLabel(level) {
  if (level < 0.25) return { text: 'Very Light', cls: 'traffic-low',      icon: '🟢' };
  if (level < 0.50) return { text: 'Light',      cls: 'traffic-low',      icon: '🟢' };
  if (level < 0.65) return { text: 'Moderate',   cls: 'traffic-moderate', icon: '🟡' };
  if (level < 0.80) return { text: 'Heavy',       cls: 'traffic-heavy',   icon: '🟠' };
  if (level < 0.90) return { text: 'Very Heavy',  cls: 'traffic-heavy',   icon: '🟠' };
  return               { text: 'Gridlock',       cls: 'traffic-severe',  icon: '🔴' };
}

// ── Road condition info ───────────────────────────────────────
function roadConditionInfo(roadType) {
  const map = {
    highway:     { text: 'Expressway / NH', sub: 'Smooth, high-speed road',  fuelMod: 1.10 },
    arterial:    { text: 'Arterial Road',   sub: 'Main city connector road', fuelMod: 1.00 },
    urban:       { text: 'Urban Mixed',     sub: 'Mix of city road types',   fuelMod: 0.95 },
    residential: { text: 'Residential',     sub: 'Inner lanes & colonies',   fuelMod: 0.88 },
    service:     { text: 'Service Road',    sub: 'Narrow / congested lane',  fuelMod: 0.85 },
  };
  return map[roadType] || map.urban;
}

// ── Core fuel calculator ──────────────────────────────────────
// osrmDuration  : OSRM free-flow duration in seconds (optional).
//                 When provided, ETA is calculated as:
//                   adjustedTime = osrmDuration × (1 + trafficLevel × 1.5)
//                 This is much more accurate than a generic speed formula
//                 because OSRM already uses real road speed limits.
//                 At trafficLevel=0 → 1× (free-flow) | at 1.0 → 2.5× (gridlock)
function calculateFuel({
  distance, araiMileage, trafficLevel, signals,
  fuelType, vehicleType, roadFuelMod, osrmDuration,
}) {
  const realWorldFactor = 0.80;   // ARAI → real-world (Indian driving)
  const roadMod         = roadFuelMod ?? 1.0;

  // Stop-start traffic degrades mileage (fuel-injection inefficiency in low gears)
  const trafficMileagePenalty = 1 - (0.48 * trafficLevel);
  const effectiveMileage = araiMileage * realWorldFactor * trafficMileagePenalty * roadMod;
  const drivingFuel      = distance / effectiveMileage;

  // Idle fuel consumed while stopped at signals
  // Average red-light stop duration scales with traffic congestion
  const avgStopSec   = 45 * trafficLevel;
  const totalIdleSec = signals * avgStopSec;
  const rateKey      = vehicleType === '2wheeler' ? '2wheeler_petrol' : `4wheeler_${fuelType}`;
  const idleFuel     = totalIdleSec * (IDLE_RATE[rateKey] ?? IDLE_RATE['4wheeler_petrol']);
  const totalFuel    = drivingFuel + idleFuel;

  // ETA calculation
  let travelTimeMin, speed;
  if (osrmDuration && osrmDuration > 0) {
    // OSRM duration is free-flow (speed-limit based, no traffic delays).
    // Traffic multiplier: +0% at 3 AM → +150% at worst peak (gridlock).
    const trafficMultiplier = 1.0 + trafficLevel * 1.5;
    const totalSec          = osrmDuration * trafficMultiplier + totalIdleSec;
    travelTimeMin           = totalSec / 60;
    // Effective average speed for display
    speed = (distance / (osrmDuration * trafficMultiplier / 3600));
  } else {
    // Fallback formula (used when OSRM duration unavailable)
    speed         = Math.max(10, 45 * (1 - 0.70 * trafficLevel));
    travelTimeMin = (distance / speed) * 60 + totalIdleSec / 60;
  }

  return {
    fuel:             parseFloat(totalFuel.toFixed(3)),
    effectiveMileage: parseFloat(effectiveMileage.toFixed(2)),
    speed:            parseFloat(Math.max(5, speed).toFixed(1)),
    travelTimeMin:    parseFloat(travelTimeMin.toFixed(1)),
    idleTimeSec:      Math.round(totalIdleSec),
    drivingFuel:      parseFloat(drivingFuel.toFixed(3)),
    idleFuel:         parseFloat(idleFuel.toFixed(3)),
  };
}

// ── Optimal departure time ────────────────────────────────────
// Chart window: next CHART_HOURS hours from now
// Optimal suggestion: restricted to next OPT_WINDOW hours
// This prevents suggesting "leave at 3 AM" when it is 6 PM.
function findOptimalHour(params, isWeekend, currentHour) {
  const CHART_HOURS = 6;
  const OPT_WINDOW  = 3;

  let bestHour = currentHour, bestOffset = 0, bestFuel = Infinity;
  const results = [];

  for (let offset = 0; offset <= CHART_HOURS; offset++) {
    const h  = (currentHour + offset) % 24;
    const tl = getTrafficLevel(h, isWeekend);
    const r  = calculateFuel({ ...params, trafficLevel: tl });
    results.push({
      hour:         h,
      offset,
      fuel:         r.fuel,
      cost:         parseFloat((r.fuel * FUEL_PRICES[params.fuelType]).toFixed(2)),
      speed:        r.speed,
      trafficLevel: tl,
    });
    if (offset <= OPT_WINDOW && r.fuel < bestFuel) {
      bestFuel   = r.fuel;
      bestHour   = h;
      bestOffset = offset;
    }
  }

  return { bestHour, bestOffset, results };
}

// ── Formatting helpers ────────────────────────────────────────
function formatDuration(minutes) {
  if (!minutes || minutes <= 0) return '--';
  if (minutes < 60) return `${Math.round(minutes)} min`;
  const h = Math.floor(minutes / 60), m = Math.round(minutes % 60);
  return m === 0 ? `${h}h` : `${h}h ${m}m`;
}

function formatHour(h) {
  return `${String(h).padStart(2, '0')}:00`;
}

function fuelCost(litres, fuelType) {
  return parseFloat((litres * FUEL_PRICES[fuelType]).toFixed(2));
}

function co2(litres, fuelType) {
  return parseFloat((litres * CO2_PER_LITRE[fuelType]).toFixed(3));
}

// ── Public transport options ──────────────────────────────────
// ⚠️  Ola / Uber use SURGE PRICING — we must NOT show a fixed fare.
//     Metro and DTC use official fixed fares (as of 2024).
//     Auto fares follow Delhi government metered rates.
function publicTransportEstimate(distanceKm) {
  const results = [];

  // Delhi Metro — DMRC official fare chart (as of 2024)
  if (distanceKm <= 50) {
    results.push({
      mode:    'Delhi Metro',
      icon:    '🚇',
      fare:    distanceKm <= 2  ? 10
             : distanceKm <= 5  ? 20
             : distanceKm <= 12 ? 30
             : distanceKm <= 21 ? 40
             : distanceKm <= 32 ? 50 : 60,
      fareType: 'fixed',
      fareNote: 'DMRC official fare',
      speed:   32,
      detail:  'AC · No parking · Punctual',
      bookLink: 'https://www.delhimetrorail.com/',
      bookLabel: 'DMRC Website',
    });
  }

  // DTC / Cluster Bus — Official Delhi Govt fares
  results.push({
    mode:    'DTC / Cluster Bus',
    icon:    '🚌',
    fare:    distanceKm <= 4  ? 10
           : distanceKm <= 12 ? 15 : 20,
    fareType: 'fixed',
    fareNote: 'Official Delhi Govt fare',
    speed:   16,
    detail:  'Budget · Wide coverage · Shared',
    bookLink: null,
    bookLabel: null,
  });

  // Auto Rickshaw — Delhi govt metered rates (₹25 base + ₹9.5/km)
  if (distanceKm <= 18) {
    results.push({
      mode:    'Auto Rickshaw',
      icon:    '🛺',
      fare:    Math.round(25 + distanceKm * 9.5),
      fareType: 'metered',
      fareNote: '₹25 base + ₹9.5/km (metered)',
      speed:   20,
      detail:  'Door-to-door · No fixed price',
      bookLink: null,
      bookLabel: null,
    });
  }

  // Ola / Uber — dynamic surge pricing, cannot show a fixed number
  results.push({
    mode:    'Ola / Uber',
    icon:    '🚕',
    fare:    null,  // deliberately null — live prices only via their app
    fareType: 'dynamic',
    fareNote: 'Dynamic surge pricing — check app for live fare',
    speed:   22,
    detail:  'Prices vary with time & demand',
    bookLink: 'https://book.olacabs.com/',
    bookLabel: 'Open Ola',
    bookLink2: 'https://www.uber.com/in/en/ride/',
    bookLabel2: 'Open Uber',
  });

  return results;
}

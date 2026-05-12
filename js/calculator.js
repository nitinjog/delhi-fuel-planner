// Get traffic index (0–1) for a given hour and day type
function getTrafficLevel(hour, isWeekend) {
  return isWeekend ? WEEKEND_TRAFFIC[hour] : WEEKDAY_TRAFFIC[hour];
}

// Human-readable traffic label + CSS class
function trafficLabel(level) {
  if (level < 0.25) return { text: 'Very Light', cls: 'traffic-low',      icon: '🟢' };
  if (level < 0.50) return { text: 'Light',      cls: 'traffic-low',      icon: '🟢' };
  if (level < 0.65) return { text: 'Moderate',   cls: 'traffic-moderate', icon: '🟡' };
  if (level < 0.80) return { text: 'Heavy',       cls: 'traffic-heavy',   icon: '🟠' };
  if (level < 0.90) return { text: 'Very Heavy',  cls: 'traffic-heavy',   icon: '🟠' };
  return               { text: 'Gridlock',     cls: 'traffic-severe',  icon: '🔴' };
}

// Road condition label & fuel efficiency modifier
function roadConditionInfo(roadType) {
  const map = {
    highway:     { text: 'Expressway / NH', sub: 'Smooth high-speed roads', fuelMod: 1.10 },
    arterial:    { text: 'Arterial Road',   sub: 'Main city roads',         fuelMod: 1.00 },
    urban:       { text: 'Urban Mixed',     sub: 'Mix of road types',       fuelMod: 0.95 },
    residential: { text: 'Residential',     sub: 'Inner lanes & colonies',  fuelMod: 0.88 },
    service:     { text: 'Service Road',    sub: 'Narrow / congested',      fuelMod: 0.85 },
  };
  return map[roadType] || map.urban;
}

// Core fuel consumption calculator
// Returns { fuel, effectiveMileage, speed, travelTimeMin, idleTimeSec, drivingFuel, idleFuel }
function calculateFuel({ distance, araiMileage, trafficLevel, signals, fuelType, vehicleType, roadFuelMod }) {
  const realWorldFactor = 0.80;   // ARAI → real-world
  const roadMod = roadFuelMod || 1.0;

  // Traffic degrades mileage (stop-start burns more)
  const trafficMileagePenalty = 1 - (0.48 * trafficLevel);

  const effectiveMileage = araiMileage * realWorldFactor * trafficMileagePenalty * roadMod;
  const drivingFuel = distance / effectiveMileage;

  // Idle fuel at traffic signals
  // At trafficLevel=1, average red-light stop ≈ 50 sec; scales down with traffic
  const avgStopSec = 50 * trafficLevel;
  const totalIdleSec = signals * avgStopSec;
  const rateKey = vehicleType === '2wheeler' ? '2wheeler_petrol' : `4wheeler_${fuelType}`;
  const idleFuel = totalIdleSec * IDLE_RATE[rateKey];

  const totalFuel = drivingFuel + idleFuel;

  // Average speed: free-flow 45 km/h → ~14 km/h at full gridlock
  const speed = Math.max(12, 45 * (1 - 0.70 * trafficLevel));

  // Travel time in minutes (driving + signal idle)
  const travelTimeMin = (distance / speed) * 60 + (totalIdleSec / 60);

  return {
    fuel: parseFloat(totalFuel.toFixed(3)),
    effectiveMileage: parseFloat(effectiveMileage.toFixed(2)),
    speed: parseFloat(speed.toFixed(1)),
    travelTimeMin: parseFloat(travelTimeMin.toFixed(1)),
    idleTimeSec: Math.round(totalIdleSec),
    drivingFuel: parseFloat(drivingFuel.toFixed(3)),
    idleFuel: parseFloat(idleFuel.toFixed(3)),
  };
}

// Find the best hour to depart (minimum fuel) for today
function findOptimalHour(params, isWeekend) {
  let bestHour = 0, bestFuel = Infinity;
  const results = [];
  for (let h = 0; h < 24; h++) {
    const tl = getTrafficLevel(h, isWeekend);
    const r = calculateFuel({ ...params, trafficLevel: tl });
    results.push({ hour: h, fuel: r.fuel, cost: r.fuel * FUEL_PRICES[params.fuelType], speed: r.speed });
    if (r.fuel < bestFuel) { bestFuel = r.fuel; bestHour = h; }
  }
  return { bestHour, results };
}

// Format minutes to "Xh Ym" or "Y min"
function formatDuration(minutes) {
  if (minutes < 60) return `${Math.round(minutes)} min`;
  const h = Math.floor(minutes / 60);
  const m = Math.round(minutes % 60);
  return m === 0 ? `${h}h` : `${h}h ${m}m`;
}

// Format hour to "HH:00"
function formatHour(h) {
  return `${String(h).padStart(2, '0')}:00`;
}

// Cost of fuel in ₹
function fuelCost(litres, fuelType) {
  return parseFloat((litres * FUEL_PRICES[fuelType]).toFixed(2));
}

// CO2 in kg
function co2(litres, fuelType) {
  return parseFloat((litres * CO2_PER_LITRE[fuelType]).toFixed(3));
}

// Public transport estimates for Delhi NCR
function publicTransportEstimate(distanceKm, currentFuelCost) {
  const metro = {
    mode: 'Delhi Metro',
    icon: '🚇',
    fare: distanceKm <= 5 ? 20 : distanceKm <= 12 ? 30 : distanceKm <= 21 ? 40 : distanceKm <= 32 ? 50 : 60,
    speed: 32,
    fuelSaved: currentFuelCost,
    detail: 'AC, reliable, no parking hassle',
    available: distanceKm <= 45,
  };
  const bus = {
    mode: 'DTC / Cluster Bus',
    icon: '🚌',
    fare: distanceKm <= 5 ? 10 : distanceKm <= 15 ? 15 : 20,
    speed: 18,
    fuelSaved: currentFuelCost,
    detail: 'Budget-friendly, wide coverage',
    available: true,
  };
  const auto = {
    mode: 'Auto Rickshaw',
    icon: '🛺',
    fare: Math.round(25 + distanceKm * 9.5),
    speed: 20,
    fuelSaved: currentFuelCost,
    detail: 'Door-to-door, no parking',
    available: distanceKm <= 15,
  };
  const cab = {
    mode: 'Ola / Uber',
    icon: '🚕',
    fare: Math.round(distanceKm * 16 + 30),
    speed: 25,
    fuelSaved: currentFuelCost,
    detail: 'Comfortable, app-tracked',
    available: true,
  };
  return [metro, bus, auto, cab].filter(t => t.available);
}

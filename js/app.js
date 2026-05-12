/* ============================================================
   Delhi NCR Fuel Planner — Main App
   APIs used: Nominatim (geocoding), OSRM (routing), Overpass (signals)
   All free, no API keys required.
   ============================================================ */

let state = {
  vehicleType: '2wheeler',
  brand: null,
  model: null,
  fuelType: 'petrol',
  startCoords: null,
  endCoords: null,
  chart: null,
  leafletMap: null,
  routeLayer: null,
};

// ── Clock ────────────────────────────────────────────────────
function updateClock() {
  const now = new Date();
  document.getElementById('currentTime').innerHTML = `
    <div class="clock">${now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })}</div>
    <div class="date">${now.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}</div>
  `;
}

// ── Vehicle selects ──────────────────────────────────────────
function selectVehicleType(type) {
  state.vehicleType = type;
  document.getElementById('btn2W').classList.toggle('active', type === '2wheeler');
  document.getElementById('btn4W').classList.toggle('active', type === '4wheeler');

  const fuelSel = document.getElementById('fuelType');
  if (type === '2wheeler') {
    fuelSel.innerHTML = '<option value="petrol">Petrol</option>';
    state.fuelType = 'petrol';
  } else {
    fuelSel.innerHTML = '<option value="petrol">Petrol</option><option value="diesel">Diesel</option>';
  }

  populateBrands();
  hideAlert();
}

function onFuelTypeChange() {
  state.fuelType = document.getElementById('fuelType').value;
  updateMileage();
}

function populateBrands() {
  const brands = Object.keys(VEHICLES[state.vehicleType].brands);
  const sel = document.getElementById('vehicleBrand');
  sel.innerHTML = '<option value="">Select Brand</option>' + brands.map(b => `<option>${b}</option>`).join('');
  document.getElementById('vehicleModel').innerHTML = '<option value="">Select Model</option>';
  document.getElementById('mileageDisplay').style.display = 'none';
  state.brand = null; state.model = null;
}

function updateModels() {
  state.brand = document.getElementById('vehicleBrand').value;
  const modelSel = document.getElementById('vehicleModel');
  modelSel.innerHTML = '<option value="">Select Model</option>';
  if (state.brand) {
    const models = Object.keys(VEHICLES[state.vehicleType].brands[state.brand].models);
    modelSel.innerHTML += models.map(m => `<option>${m}</option>`).join('');
  }
  document.getElementById('mileageDisplay').style.display = 'none';
  state.model = null;
}

function updateMileage() {
  state.model = document.getElementById('vehicleModel').value;
  if (state.model && state.brand) {
    const vd = VEHICLES[state.vehicleType].brands[state.brand].models[state.model];
    const ml = vd[state.fuelType];
    if (ml) {
      document.getElementById('mileageValue').textContent = ml;
      document.getElementById('mileageDisplay').style.display = 'flex';
    } else {
      document.getElementById('mileageDisplay').style.display = 'none';
    }
  }
}

// ── Location autocomplete ────────────────────────────────────
function initAutocomplete(inputId, dropdownId, onSelect) {
  const input = document.getElementById(inputId);
  const dropdown = document.getElementById(dropdownId);
  let timer;

  input.addEventListener('input', () => {
    clearTimeout(timer);
    const q = input.value.trim();
    if (q.length < 3) { dropdown.style.display = 'none'; return; }
    timer = setTimeout(async () => {
      try {
        const results = await geocode(q);
        if (!results.length) { dropdown.style.display = 'none'; return; }
        dropdown.innerHTML = results.map((r, i) => {
          const parts = r.display_name.split(',');
          return `<div class="autocomplete-item" data-i="${i}">
            <span class="item-icon">📍</span>
            <div>
              <div class="item-name">${parts[0]}</div>
              <div class="item-detail">${parts.slice(1, 4).join(',').trim()}</div>
            </div>
          </div>`;
        }).join('');
        dropdown.style.display = 'block';
        dropdown.querySelectorAll('.autocomplete-item').forEach(el => {
          el.addEventListener('click', () => {
            const r = results[+el.dataset.i];
            input.value = r.display_name.split(',').slice(0, 3).join(',').trim();
            onSelect({ lat: parseFloat(r.lat), lon: parseFloat(r.lon) });
            dropdown.style.display = 'none';
          });
        });
      } catch { dropdown.style.display = 'none'; }
    }, 320);
  });

  document.addEventListener('click', e => {
    if (!input.contains(e.target) && !dropdown.contains(e.target)) dropdown.style.display = 'none';
  });
}

// ── Alert helpers ────────────────────────────────────────────
function showAlert(msg) {
  const el = document.getElementById('alert-box');
  el.textContent = '⚠️ ' + msg;
  el.style.display = 'block';
}
function hideAlert() { document.getElementById('alert-box').style.display = 'none'; }

// ── Loading steps ────────────────────────────────────────────
function setLoadingStep(n) {
  for (let i = 1; i <= 4; i++) {
    const el = document.getElementById(`lstep${i}`);
    if (i < n) { el.classList.add('done'); el.classList.remove('active'); }
    else if (i === n) { el.classList.add('active'); el.classList.remove('done'); }
    else { el.classList.remove('active', 'done'); }
  }
}

function showLoading(show) {
  document.getElementById('loadingOverlay').style.display = show ? 'flex' : 'none';
  document.getElementById('analyzeBtn').disabled = show;
}

// ── Main analysis ────────────────────────────────────────────
async function analyzeJourney() {
  hideAlert();

  if (!state.startCoords || !state.endCoords) return showAlert('Please select both locations from the dropdown suggestions.');
  if (!state.brand || !state.model) return showAlert('Please select a vehicle brand and model.');

  const vd = VEHICLES[state.vehicleType].brands[state.brand].models[state.model];
  const mileage = vd[state.fuelType];
  if (!mileage) return showAlert(`${state.model} is not available in ${state.fuelType}. Please select a different fuel type or vehicle.`);

  showLoading(true);
  document.getElementById('resultsSection').style.display = 'none';

  try {
    // Step 1 — Route
    setLoadingStep(1);
    const route = await getRoute(state.startCoords, state.endCoords);
    const distKm = route.distance / 1000;

    // Step 2 — Traffic signals
    setLoadingStep(2);
    const bbox = getRouteBbox(route.geometry.coordinates);
    let signals = await countTrafficSignals(bbox);
    if (signals === null) signals = estimateTrafficSignals(distKm);

    // Step 3 — Traffic patterns
    setLoadingStep(3);
    const now = new Date();
    const hour = now.getHours();
    const isWeekend = now.getDay() === 0 || now.getDay() === 6;
    const trafficLevel = getTrafficLevel(hour, isWeekend);
    const roadType = inferRoadType(route.legs);
    const roadInfo = roadConditionInfo(roadType);

    // Step 4 — Fuel calculations
    setLoadingStep(4);
    const calcParams = {
      distance: distKm,
      araiMileage: mileage,
      trafficLevel,
      signals,
      fuelType: state.fuelType,
      vehicleType: state.vehicleType,
      roadFuelMod: roadInfo.fuelMod,
    };
    const current = calculateFuel(calcParams);
    const { bestHour, results: hourlyData } = findOptimalHour(calcParams, isWeekend);

    showLoading(false);
    displayResults({ route, distKm, signals, trafficLevel, hour, isWeekend, roadType, roadInfo, current, calcParams, mileage, hourlyData, bestHour, now });

  } catch (err) {
    showLoading(false);
    console.error(err);
    showAlert('Could not calculate route. Please ensure both locations are in Delhi NCR and try again.');
  }
}

// ── Display results ──────────────────────────────────────────
function displayResults({ route, distKm, signals, trafficLevel, hour, isWeekend, roadType, roadInfo, current, calcParams, mileage, hourlyData, bestHour, now }) {
  document.getElementById('resultsSection').style.display = 'block';
  document.getElementById('resultsSection').scrollIntoView({ behavior: 'smooth', block: 'start' });

  renderMap(route);
  renderRouteStats(distKm, signals, current, roadType);
  renderCurrentAnalysis(trafficLevel, roadInfo, current, calcParams);
  renderChart(hourlyData, hour, bestHour, calcParams.fuelType);
  renderOptimalTime(hour, bestHour, hourlyData, calcParams.fuelType, distKm, isWeekend, now);
  renderVehicleComparison(distKm, trafficLevel, calcParams, signals, roadInfo);
  renderPublicTransport(distKm, current.fuel, calcParams.fuelType);
  renderEcoSummary(current, calcParams, distKm, hourlyData, bestHour, hour);
}

// ── Map ──────────────────────────────────────────────────────
function renderMap(route) {
  if (!state.leafletMap) {
    state.leafletMap = L.map('map');
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 18,
    }).addTo(state.leafletMap);
  }

  if (state.routeLayer) state.leafletMap.removeLayer(state.routeLayer);

  const coords = route.geometry.coordinates.map(([lon, lat]) => [lat, lon]);
  state.routeLayer = L.layerGroup().addTo(state.leafletMap);

  L.polyline(coords, { color: '#1565c0', weight: 5, opacity: 0.85 }).addTo(state.routeLayer);

  const startPt = coords[0];
  const endPt = coords[coords.length - 1];

  const mkStart = L.divIcon({ html: '<div style="background:#2e7d32;width:16px;height:16px;border-radius:50%;border:3px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,0.4)"></div>', iconAnchor: [8, 8] });
  const mkEnd   = L.divIcon({ html: '<div style="background:#c62828;width:16px;height:16px;border-radius:50%;border:3px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,0.4)"></div>', iconAnchor: [8, 8] });

  L.marker(startPt, { icon: mkStart }).addTo(state.routeLayer).bindPopup('🟢 <b>Start</b>');
  L.marker(endPt, { icon: mkEnd }).addTo(state.routeLayer).bindPopup('🔴 <b>Destination</b>');

  state.leafletMap.fitBounds(L.polyline(coords).getBounds(), { padding: [30, 30] });
}

// ── Route stats ──────────────────────────────────────────────
function renderRouteStats(distKm, signals, current, roadType) {
  setText('statDistance', `${distKm.toFixed(1)} km`);
  setText('statETA', formatDuration(current.travelTimeMin));
  setText('statSignals', signals);
  setText('statStopTime', formatDuration(current.idleTimeSec / 60));
  const roadLabels = { highway: 'Expressway/NH', arterial: 'Arterial Road', urban: 'Urban Mixed', residential: 'Residential', service: 'Service Road' };
  setText('statRoadType', roadLabels[roadType] || 'Urban Mixed');
  setText('statSpeed', `${current.speed.toFixed(0)} km/h`);
}

// ── Current analysis panel ───────────────────────────────────
function renderCurrentAnalysis(trafficLevel, roadInfo, current, calcParams) {
  const tl = trafficLabel(trafficLevel);
  const costNow = fuelCost(current.fuel, calcParams.fuelType);
  const co2Now  = co2(current.fuel, calcParams.fuelType);

  const condTraffic = document.getElementById('condTraffic');
  condTraffic.textContent = `${tl.icon} ${tl.text}`;
  condTraffic.className = `condition-value ${tl.cls}`;
  setText('condTrafficSub', `${(trafficLevel * 100).toFixed(0)}% congestion`);

  setText('condRoad', roadInfo.text);
  setText('condRoadSub', roadInfo.sub);
  setText('condFuel', current.fuel.toFixed(2));
  setText('condCost', `₹${costNow.toFixed(0)}`);
  setText('condCostSub', `@ ₹${FUEL_PRICES[calcParams.fuelType]}/L`);
  setText('condCO2', co2Now.toFixed(2));
  setText('condMileage', current.effectiveMileage.toFixed(1));
  setText('condMileageSub', `ARAI ${calcParams.araiMileage} → effective kmpl`);
}

// ── Traffic chart ────────────────────────────────────────────
function renderChart(hourlyData, currentHour, bestHour, fuelType) {
  if (state.chart) state.chart.destroy();

  const labels = hourlyData.map(d => `${String(d.hour).padStart(2,'0')}:00`);
  const costs  = hourlyData.map(d => parseFloat(d.cost.toFixed(2)));
  const traffic = hourlyData.map(d => {
    const tl = d.hour < 12 ? WEEKDAY_TRAFFIC[d.hour] : WEEKDAY_TRAFFIC[d.hour];
    return parseFloat((tl * 100).toFixed(1));
  });

  const bgColors = hourlyData.map(d => {
    if (d.hour === currentHour) return 'rgba(230, 81, 0, 0.85)';
    if (d.hour === bestHour)    return 'rgba(46, 125, 50, 0.85)';
    return 'rgba(21, 101, 192, 0.55)';
  });

  const ctx = document.getElementById('trafficChart').getContext('2d');
  state.chart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [
        {
          label: `Fuel Cost (₹) [${fuelType}]`,
          data: costs,
          backgroundColor: bgColors,
          borderRadius: 4,
          yAxisID: 'yCost',
          order: 2,
        },
        {
          type: 'line',
          label: 'Traffic Intensity (%)',
          data: traffic,
          borderColor: '#f9a825',
          backgroundColor: 'rgba(249, 168, 37, 0.1)',
          borderWidth: 2.5,
          pointRadius: 3,
          tension: 0.4,
          yAxisID: 'yTraffic',
          order: 1,
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: 'top', labels: { font: { size: 12 } } },
        tooltip: {
          callbacks: {
            afterBody: (items) => {
              const h = items[0].dataIndex;
              const tags = [];
              if (h === currentHour) tags.push('← You are here');
              if (h === bestHour)    tags.push('← Best time ✓');
              return tags;
            }
          }
        }
      },
      scales: {
        x: { grid: { display: false }, ticks: { font: { size: 10 }, maxRotation: 45 } },
        yCost:    { type: 'linear', position: 'left',  title: { display: true, text: 'Fuel Cost (₹)' }, grid: { color: '#eee' } },
        yTraffic: { type: 'linear', position: 'right', title: { display: true, text: 'Traffic (%)' }, min: 0, max: 110, grid: { display: false } },
      }
    }
  });
}

// ── Optimal time ─────────────────────────────────────────────
function renderOptimalTime(currentHour, bestHour, hourlyData, fuelType, distKm, isWeekend, now) {
  const cur  = hourlyData[currentHour];
  const best = hourlyData[bestHour];

  setText('optNowTime',  formatHour(currentHour));
  setText('optNowFuel',  `${cur.fuel.toFixed(2)} L`);
  setText('optNowCost',  `₹${cur.cost.toFixed(0)}`);
  setText('optBestTime', formatHour(bestHour));
  setText('optBestFuel', `${best.fuel.toFixed(2)} L`);
  setText('optBestCost', `₹${best.cost.toFixed(0)}`);

  const fuelSaving = cur.fuel - best.fuel;
  const costSaving = cur.cost - best.cost;

  document.getElementById('savingsPill').innerHTML = `SAVE<br>₹${costSaving.toFixed(0)}`;

  let hoursFromNow = bestHour - currentHour;
  if (hoursFromNow < 0) hoursFromNow += 24;

  const bestTl = trafficLabel(getTrafficLevel(bestHour, isWeekend));

  document.getElementById('optimalDetails').innerHTML = `
    <strong>💡 Recommendation:</strong> Leaving at <strong>${formatHour(bestHour)}</strong>
    (${hoursFromNow === 0 ? 'now is optimal!' : `in ~${hoursFromNow}h`}) will save
    <strong>${fuelSaving.toFixed(2)} litres</strong> of fuel and
    <strong>₹${costSaving.toFixed(0)}</strong> compared to leaving now.<br>
    Traffic at ${formatHour(bestHour)}: ${bestTl.icon} <strong>${bestTl.text}</strong> —
    you'll travel at ~${hourlyData[bestHour].speed?.toFixed(0) || '--'} km/h avg.<br>
    ${costSaving > 50 ? '🌿 Significant savings! Consider adjusting your schedule.' : costSaving > 20 ? '🌿 Moderate savings available by timing your journey.' : '✅ Current time is fairly optimal for this route.'}
  `;
}

// ── Vehicle comparison ───────────────────────────────────────
function renderVehicleComparison(distKm, trafficLevel, calcParams, signals, roadInfo) {
  const yourFuel  = calculateFuel({ ...calcParams }).fuel;
  const yourCost  = fuelCost(yourFuel, calcParams.fuelType);
  const yourLabel = `${state.brand} ${state.model}`;

  const rows = COMPARISON_VEHICLES.map(cv => {
    const ml = cv[calcParams.fuelType] || cv.petrol;
    if (!ml) return null;
    const ft = cv[calcParams.fuelType] ? calcParams.fuelType : 'petrol';
    const cf = calculateFuel({
      distance: distKm, araiMileage: ml, trafficLevel, signals, fuelType: ft,
      vehicleType: cv.type, roadFuelMod: roadInfo.fuelMod
    });
    const cost = fuelCost(cf.fuel, ft);
    const diff = yourCost - cost;
    return { label: cv.label, example: cv.example, fuel: cf.fuel, cost, diff };
  }).filter(Boolean);

  const table = `<table class="comp-table">
    <thead><tr>
      <th>Vehicle</th><th>Fuel Used</th><th>Cost</th><th>CO₂</th><th>vs Your Vehicle</th>
    </tr></thead>
    <tbody>
      <tr class="highlight-row">
        <td><span class="vehicle-badge">🚗 ${yourLabel} <span class="you-tag">YOU</span></span></td>
        <td>${yourFuel.toFixed(2)} L</td>
        <td>₹${yourCost.toFixed(0)}</td>
        <td>${co2(yourFuel, calcParams.fuelType).toFixed(2)} kg</td>
        <td class="saving-neutral">—</td>
      </tr>
      ${rows.map(r => {
        const cls = r.diff > 0 ? 'saving-green' : r.diff < -5 ? 'saving-red' : 'saving-neutral';
        const tag = r.diff > 0 ? `save ₹${r.diff.toFixed(0)}` : r.diff < -5 ? `costs ₹${Math.abs(r.diff).toFixed(0)} more` : 'similar';
        return `<tr>
          <td><span class="vehicle-badge">${r.label}</span><br><small style="color:#777">${r.example}</small></td>
          <td>${r.fuel.toFixed(2)} L</td>
          <td>₹${r.cost.toFixed(0)}</td>
          <td>${co2(r.fuel, calcParams.fuelType).toFixed(2)} kg</td>
          <td class="${cls}">${tag}</td>
        </tr>`;
      }).join('')}
    </tbody>
  </table>`;

  document.getElementById('vehicleCompTable').innerHTML = table;
}

// ── Public transport ─────────────────────────────────────────
function renderPublicTransport(distKm, fuel, fuelType) {
  const myFuelCost = fuelCost(fuel, fuelType);
  const options = publicTransportEstimate(distKm, myFuelCost);

  const cards = options.map(o => `
    <div class="pt-card">
      <div class="pt-icon">${o.icon}</div>
      <div class="pt-mode">${o.mode}</div>
      <div class="pt-fare">₹${o.fare}</div>
      <div class="pt-detail">${o.detail} · ~${o.speed} km/h</div>
      <div class="pt-save">You save ₹${Math.max(0, myFuelCost - o.fare).toFixed(0)} + ${fuel.toFixed(2)} L fuel</div>
    </div>`).join('');

  document.getElementById('publicTransportSection').innerHTML = `<div class="pt-grid">${cards}</div>
    <p style="margin-top:12px;font-size:0.8rem;color:#777">💡 Your vehicle fuel cost for this trip: ₹${myFuelCost.toFixed(0)}.
    Public transport eliminates personal fuel use and reduces Delhi's air pollution.</p>`;
}

// ── Eco summary ──────────────────────────────────────────────
function renderEcoSummary(current, calcParams, distKm, hourlyData, bestHour, currentHour) {
  const co2Now   = co2(current.fuel, calcParams.fuelType);
  const fuelSave = hourlyData[currentHour].fuel - hourlyData[bestHour].fuel;
  const costSave = hourlyData[currentHour].cost - hourlyData[bestHour].cost;
  const co2Save  = co2(Math.max(0, fuelSave), calcParams.fuelType);

  const twoWheelFuel = calculateFuel({
    distance: distKm, araiMileage: 60, trafficLevel: calcParams.trafficLevel,
    signals: calcParams.signals, fuelType: 'petrol', vehicleType: '2wheeler',
    roadFuelMod: calcParams.roadFuelMod
  }).fuel;
  const switchSave = calcParams.vehicleType === '4wheeler' ? Math.max(0, current.fuel - twoWheelFuel) : 0;

  document.getElementById('ecoSummary').innerHTML = `
    <div class="eco-grid">
      <div class="eco-item">
        <div class="eco-num">${current.fuel.toFixed(2)} L</div>
        <div class="eco-label">Fuel this trip (now)</div>
      </div>
      <div class="eco-item">
        <div class="eco-num">${co2Now.toFixed(2)} kg</div>
        <div class="eco-label">CO₂ emitted now</div>
      </div>
      <div class="eco-item">
        <div class="eco-num" style="color:#e65100">₹${costSave.toFixed(0)}</div>
        <div class="eco-label">Save by optimal timing</div>
      </div>
      <div class="eco-item">
        <div class="eco-num" style="color:#e65100">${co2Save.toFixed(2)} kg</div>
        <div class="eco-label">CO₂ saved by timing</div>
      </div>
      ${switchSave > 0.05 ? `
      <div class="eco-item">
        <div class="eco-num" style="color:#1565c0">${switchSave.toFixed(2)} L</div>
        <div class="eco-label">Saved switching to 2-Wheeler</div>
      </div>
      <div class="eco-item">
        <div class="eco-num" style="color:#1565c0">₹${fuelCost(switchSave, calcParams.fuelType).toFixed(0)}</div>
        <div class="eco-label">₹ saved switching to 2W</div>
      </div>` : ''}
    </div>
    <p style="margin-top:14px;font-size:0.83rem;color:#555;line-height:1.7">
      🌿 Choosing the optimal departure time saves <strong>${fuelSave.toFixed(2)} litres</strong> of fuel per trip.
      Over 20 trips/month that's <strong>${(fuelSave * 20).toFixed(1)} litres saved</strong> and
      <strong>${co2(fuelSave * 20, calcParams.fuelType).toFixed(1)} kg CO₂</strong> prevented.
      ${switchSave > 0.05 ? ` Switching to a 2-wheeler saves an additional <strong>${switchSave.toFixed(2)} L</strong> per trip.` : ''}
    </p>`;
}

// ── Utility ──────────────────────────────────────────────────
function setText(id, val) {
  const el = document.getElementById(id);
  if (el) el.textContent = val;
}

// ── Init ─────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  updateClock();
  setInterval(updateClock, 1000);

  populateBrands();

  initAutocomplete('startLocation', 'startDropdown', coords => { state.startCoords = coords; });
  initAutocomplete('endLocation',   'endDropdown',   coords => { state.endCoords   = coords; });
});

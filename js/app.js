/* ============================================================
   Delhi NCR Fuel Planner — Main App
   Routing: OSRM (free) with optional Google Maps Directions API
   Geocoding: built-in curated location list
   ============================================================ */

const ROUTE_COLORS = ['#1565c0', '#e65100', '#6a1b9a', '#00695c'];

let state = {
  vehicleType:   '2wheeler',
  brand:         null,
  model:         null,
  fuelType:      'petrol',
  startCoords:   null,
  endCoords:     null,
  routes:        [],
  selectedIdx:   0,
  chart:         null,
  leafletMap:    null,
  polylines:     [],
  markerGroup:   null,
  googleApiKey:  localStorage.getItem('gmaps_key') || '',
};

// ── Clock ────────────────────────────────────────────────────
function updateClock() {
  const now = new Date();
  document.getElementById('currentTime').innerHTML = `
    <div class="clock">${now.toLocaleTimeString('en-IN', { hour:'2-digit', minute:'2-digit', second:'2-digit', hour12:true })}</div>
    <div class="date">${now.toLocaleDateString('en-IN', { weekday:'short', day:'numeric', month:'short', year:'numeric' })}</div>
  `;
}

// ── Google Maps API key management ───────────────────────────
function toggleGmapsSettings() {
  const body = document.getElementById('gmapsSettingsBody');
  body.style.display = body.style.display === 'none' ? 'block' : 'none';
}

function saveGmapsKey() {
  const key = document.getElementById('gmapsKeyInput').value.trim();
  state.googleApiKey = key;
  if (key) { localStorage.setItem('gmaps_key', key); showAlert('✅ Google Maps API key saved. Re-run analysis to use it.', 'success'); }
  else      { localStorage.removeItem('gmaps_key');   showAlert('Google Maps API key cleared.', 'info'); }
}

// ── Vehicle selects ──────────────────────────────────────────
function selectVehicleType(type) {
  state.vehicleType = type;
  document.getElementById('btn2W').classList.toggle('active', type === '2wheeler');
  document.getElementById('btn4W').classList.toggle('active', type === '4wheeler');
  const fuelSel = document.getElementById('fuelType');
  fuelSel.innerHTML = type === '2wheeler'
    ? '<option value="petrol">Petrol</option>'
    : '<option value="petrol">Petrol</option><option value="diesel">Diesel</option>';
  state.fuelType = 'petrol';
  populateBrands();
  hideAlert();
}

function onFuelTypeChange() { state.fuelType = document.getElementById('fuelType').value; updateMileage(); }

function populateBrands() {
  const brands = Object.keys(VEHICLES[state.vehicleType].brands);
  document.getElementById('vehicleBrand').innerHTML =
    '<option value="">Select Brand</option>' + brands.map(b => `<option>${b}</option>`).join('');
  document.getElementById('vehicleModel').innerHTML = '<option value="">Select Model</option>';
  document.getElementById('mileageDisplay').style.display = 'none';
  state.brand = state.model = null;
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
    const ml = VEHICLES[state.vehicleType].brands[state.brand].models[state.model][state.fuelType];
    document.getElementById('mileageDisplay').style.display = ml ? 'flex' : 'none';
    if (ml) document.getElementById('mileageValue').textContent = ml;
  }
}

// ── Location autocomplete ────────────────────────────────────
function initAutocomplete(inputId, dropdownId, onSelect) {
  const input = document.getElementById(inputId);
  const dd    = document.getElementById(dropdownId);
  let timer;

  input.addEventListener('input', () => {
    onSelect(null);
    clearTimeout(timer);
    const q = input.value.trim();
    if (q.length < 2) { dd.style.display = 'none'; return; }
    dd.innerHTML = '<div class="autocomplete-item" style="color:#888;font-size:.85rem">🔍 Searching…</div>';
    dd.style.display = 'block';
    timer = setTimeout(async () => {
      try {
        const results = await geocode(q);
        if (!results.length) {
          dd.innerHTML = '<div class="autocomplete-item" style="color:#888;font-size:.85rem">No results — try a landmark, sector or area name</div>';
          return;
        }
        dd.innerHTML = results.map((r, i) => {
          const parts = r.display_name.split(',');
          return `<div class="autocomplete-item" data-i="${i}">
            <span class="item-icon">📍</span>
            <div><div class="item-name">${parts[0].trim()}</div>
            <div class="item-detail">${parts.slice(1).join(',').trim()}</div></div>
          </div>`;
        }).join('');
        dd.querySelectorAll('.autocomplete-item').forEach(el => {
          el.addEventListener('click', () => {
            const r = results[+el.dataset.i];
            input.value = r.display_name;
            onSelect({ lat: parseFloat(r.lat), lon: parseFloat(r.lon) });
            dd.style.display = 'none';
          });
        });
      } catch (err) {
        dd.innerHTML = `<div class="autocomplete-item" style="color:#c62828;font-size:.85rem">⚠️ Search error</div>`;
      }
    }, 350);
  });

  document.addEventListener('click', e => {
    if (!input.contains(e.target) && !dd.contains(e.target)) dd.style.display = 'none';
  });
}

// ── Alert helpers ────────────────────────────────────────────
function showAlert(msg, type) {
  const el = document.getElementById('alert-box');
  const colors = { success: '#e8f5e9', info: '#e3f2fd', warn: '#fff3e0' };
  el.style.background = colors[type] || '#fff3e0';
  el.innerHTML = (type === 'success' ? '' : '⚠️ ') + msg;
  el.style.display = 'block';
}
function hideAlert() { document.getElementById('alert-box').style.display = 'none'; }

// ── Loading steps ────────────────────────────────────────────
function setLoadingStep(n) {
  for (let i = 1; i <= 4; i++) {
    const el = document.getElementById(`lstep${i}`);
    if (!el) continue;
    if (i < n)      { el.classList.add('done');   el.classList.remove('active'); }
    else if (i ===n){ el.classList.add('active'); el.classList.remove('done');  }
    else            { el.classList.remove('active','done'); }
  }
}
function showLoading(show) {
  document.getElementById('loadingOverlay').style.display = show ? 'flex' : 'none';
  document.getElementById('analyzeBtn').disabled = show;
}

// ── Main analysis ────────────────────────────────────────────
async function analyzeJourney() {
  hideAlert();
  if (!state.startCoords || !state.endCoords)
    return showAlert('Please select both locations from the dropdown suggestions.');
  if (!state.brand || !state.model)
    return showAlert('Please select a vehicle brand and model.');

  const vd      = VEHICLES[state.vehicleType].brands[state.brand].models[state.model];
  const mileage = vd[state.fuelType];
  if (!mileage)
    return showAlert(`${state.model} is not available in ${state.fuelType}. Please choose a different fuel type or vehicle.`);

  showLoading(true);
  document.getElementById('resultsSection').style.display = 'none';

  try {
    // Step 1 — Fetch routes
    setLoadingStep(1);
    let routes;
    let sourceLabel = 'OSRM / OpenStreetMap';

    if (state.googleApiKey) {
      try {
        routes      = await getGoogleRoutes(state.startCoords, state.endCoords, state.googleApiKey);
        sourceLabel = 'Google Maps';
      } catch (gErr) {
        console.warn('Google Maps failed, falling back to OSRM:', gErr.message);
        routes = await getRoutes(state.startCoords, state.endCoords);
      }
    } else {
      routes = await getRoutes(state.startCoords, state.endCoords);
    }

    // Step 2 — Analyse each route
    setLoadingStep(2);
    const now       = new Date();
    const hour      = now.getHours();
    const isWeekend = now.getDay() === 0 || now.getDay() === 6;
    const trafficLevel = getTrafficLevel(hour, isWeekend);

    routes.forEach(route => {
      const distKm    = route.distance / 1000;
      const roadInfo  = roadConditionInfo(route.roadType);
      const calcParams = {
        distance:     distKm,
        araiMileage:  mileage,
        trafficLevel,
        signals:      route.signals,
        fuelType:     state.fuelType,
        vehicleType:  state.vehicleType,
        roadFuelMod:  roadInfo.fuelMod,
        // If Google gave live-traffic duration, use that; otherwise OSRM free-flow
        osrmDuration: route.durationInTraffic ?? route.duration,
      };
      route.distKm     = distKm;
      route.roadInfo   = roadInfo;
      route.calcParams = calcParams;
      route.current    = calculateFuel(calcParams);

      // ── Dual ETA ──────────────────────────────────────────
      // We always compute TWO independent estimates and display them side-by-side:
      //
      //  1) "Historical model" (OSRM-based):
      //     Uses the route's FREE-FLOW duration (road speed limits, no live traffic)
      //     multiplied by our Delhi NCR traffic pattern factor.
      //     Available for every route regardless of whether a Google key is set.
      //
      //  2) "Google Maps live traffic":
      //     Uses Google's `duration_in_traffic` which reflects current congestion
      //     as seen by Google Maps right now. Only available when a Google Maps
      //     Directions API key is provided.
      //
      // Showing both lets users see:
      //   • How bad traffic is TODAY vs the historical average
      //   • Which estimate to trust more for this specific moment

      const idleSecForEta = route.signals * 45 * trafficLevel;

      // ETA 1 — Historical model (always available)
      const modelTrafficMult = 1.0 + trafficLevel * 1.5;
      route.etaModel = (route.duration * modelTrafficMult + idleSecForEta) / 60;

      // ETA 2 — Google Maps live (only when Google Directions API was used)
      route.etaGoogle = route.durationInTraffic != null
        ? (route.durationInTraffic + idleSecForEta) / 60
        : null;
    });

    // Step 3 — Traffic patterns
    setLoadingStep(3);

    // Step 4 — Optimal window + comparison
    setLoadingStep(4);
    const primary = routes[0];
    const { bestHour, bestOffset, results: hourlyData } =
      findOptimalHour(primary.calcParams, isWeekend, hour);

    state.routes      = routes;
    state.selectedIdx = 0;

    showLoading(false);
    displayResults({ routes, primary, hour, isWeekend, mileage, hourlyData, bestHour, bestOffset, now, sourceLabel });

  } catch (err) {
    showLoading(false);
    console.error(err);
    showAlert(err.message || 'Could not calculate route. Please try again.');
  }
}

// ── Select a route (from route cards) ───────────────────────
function selectRoute(idx) {
  state.selectedIdx = idx;
  const route = state.routes[idx];
  if (!route) return;

  // Update map polyline weights
  state.polylines.forEach((pl, i) => {
    pl.setStyle({ weight: i === idx ? 6 : 3, opacity: i === idx ? 0.9 : 0.35 });
    pl.setZIndex?.(i === idx ? 10 : 1);
  });
  // Zoom to selected route
  const coords = route.geometry.coordinates.map(([lon, lat]) => [lat, lon]);
  state.leafletMap.fitBounds(L.polyline(coords).getBounds(), { padding: [30, 30] });

  // Highlight selected card
  document.querySelectorAll('.route-card').forEach((c, i) => c.classList.toggle('selected', i === idx));

  // Recompute optimal for this route
  const now = new Date();
  const hour = now.getHours();
  const isWeekend = now.getDay() === 0 || now.getDay() === 6;
  const { bestHour, bestOffset, results: hourlyData } = findOptimalHour(route.calcParams, isWeekend, hour);

  renderRouteStats(route, idx);
  renderCurrentAnalysis(route.calcParams.trafficLevel, route.roadInfo, route.current, route.calcParams);
  renderChart(hourlyData, hour, bestHour);
  renderOptimalTime(hour, bestHour, bestOffset, hourlyData, route.calcParams.fuelType, isWeekend);
  renderVehicleComparison(route.distKm, route.calcParams.trafficLevel, route.calcParams, route.signals, route.roadInfo);
  renderEcoSummary(route.current, route.calcParams, route.distKm, hourlyData, bestHour, 0);
}

// ── Display all results ──────────────────────────────────────
function displayResults({ routes, primary, hour, isWeekend, mileage, hourlyData, bestHour, bestOffset, now, sourceLabel }) {
  document.getElementById('resultsSection').style.display = 'block';
  setTimeout(() => document.getElementById('resultsSection').scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);

  renderMap(routes);
  renderRouteCards(routes, hour, isWeekend);
  renderRouteStats(primary, 0);
  renderCurrentAnalysis(primary.calcParams.trafficLevel, primary.roadInfo, primary.current, primary.calcParams);
  renderChart(hourlyData, hour, bestHour);
  renderOptimalTime(hour, bestHour, bestOffset, hourlyData, primary.calcParams.fuelType, isWeekend);
  renderVehicleComparison(primary.distKm, primary.calcParams.trafficLevel, primary.calcParams, primary.signals, primary.roadInfo);
  renderPublicTransport(primary.distKm, primary.current.fuel, primary.calcParams.fuelType);
  renderEcoSummary(primary.current, primary.calcParams, primary.distKm, hourlyData, bestHour, 0);
  renderGoogleMapsBtn(sourceLabel);
}

// ── Map ──────────────────────────────────────────────────────
function renderMap(routes) {
  if (!state.leafletMap) {
    state.leafletMap = L.map('map');
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 18,
    }).addTo(state.leafletMap);
  }

  // Remove old layers
  state.polylines.forEach(pl => state.leafletMap.removeLayer(pl));
  state.polylines = [];
  if (state.markerGroup) { state.leafletMap.removeLayer(state.markerGroup); }
  state.markerGroup = L.layerGroup().addTo(state.leafletMap);

  routes.forEach((route, i) => {
    const coords  = route.geometry.coordinates.map(([lon, lat]) => [lat, lon]);
    const isMain  = i === 0;
    const pl = L.polyline(coords, {
      color:   ROUTE_COLORS[i] || '#888',
      weight:  isMain ? 6 : 3,
      opacity: isMain ? 0.9 : 0.35,
    }).addTo(state.leafletMap);
    pl.on('click', () => selectRoute(i));
    state.polylines.push(pl);
  });

  // Markers for primary route only
  const primary = routes[0];
  const coords  = primary.geometry.coordinates.map(([lon, lat]) => [lat, lon]);
  const mkStart = L.divIcon({ html: '<div style="background:#2e7d32;width:14px;height:14px;border-radius:50%;border:3px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,.4)"></div>', iconAnchor:[7,7] });
  const mkEnd   = L.divIcon({ html: '<div style="background:#c62828;width:14px;height:14px;border-radius:50%;border:3px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,.4)"></div>', iconAnchor:[7,7] });
  L.marker(coords[0], { icon: mkStart }).addTo(state.markerGroup).bindPopup('🟢 <b>Start</b>');
  L.marker(coords[coords.length-1], { icon: mkEnd }).addTo(state.markerGroup).bindPopup('🔴 <b>Destination</b>');

  state.leafletMap.fitBounds(L.polyline(coords).getBounds(), { padding: [30, 30] });
}

// ── Route cards ──────────────────────────────────────────────
function renderRouteCards(routes, hour, isWeekend) {
  const container = document.getElementById('routeCardsSection');
  if (routes.length <= 1) { container.style.display = 'none'; return; }
  container.style.display = 'block';

  const cards = routes.map((r, i) => {
    const tl   = trafficLabel(r.calcParams.trafficLevel);
    const cost = fuelCost(r.current.fuel, r.calcParams.fuelType);

    // Build the ETA display: always show model; add Google if available
    const etaModelTxt  = formatDuration(r.etaModel);
    const etaGoogleTxt = r.etaGoogle != null ? formatDuration(r.etaGoogle) : null;
    const etaHtml = etaGoogleTxt
      ? `<div class="rcm-eta-dual">
           <span class="eta-src-model" title="Historical traffic model (OSRM)">⏱️ ${etaModelTxt} <em>model</em></span>
           <span class="eta-sep">|</span>
           <span class="eta-src-google" title="Google Maps live traffic">🗺️ ${etaGoogleTxt} <em>live</em></span>
         </div>`
      : `<div class="rcm-item">⏱️ <strong>${etaModelTxt}</strong></div>`;

    return `
      <div class="route-card ${i === 0 ? 'selected' : ''}" onclick="selectRoute(${i})">
        <div class="route-card-header">
          <span class="route-dot" style="background:${ROUTE_COLORS[i]}"></span>
          <span class="route-number">Route ${i+1}</span>
          <span class="route-name-tag">${r.name}</span>
        </div>
        <div class="route-card-metrics">
          <div class="rcm-item">📏 <strong>${r.distKm.toFixed(1)}</strong> km</div>
          ${etaHtml}
          <div class="rcm-item">⛽ <strong>${r.current.fuel.toFixed(2)}</strong> L</div>
          <div class="rcm-item">💰 <strong>₹${cost.toFixed(0)}</strong></div>
          <div class="rcm-item">🚦 <strong>${r.signals}</strong> signals</div>
        </div>
        <div class="route-traffic-tag ${tl.cls}">${tl.icon} ${tl.text}</div>
      </div>`;
  }).join('');

  document.getElementById('routeCards').innerHTML = cards;
}

// ── Route stats bar ──────────────────────────────────────────
function renderRouteStats(route, idx) {
  const roadLabels = { highway:'Expressway/NH', arterial:'Arterial Road', urban:'Urban Mixed', residential:'Residential' };
  setText('statDistance', `${route.distKm.toFixed(1)} km`);
  setText('statSignals',  `${route.signals} (est.)`);
  setText('statStopTime', formatDuration(route.current.idleTimeSec / 60));
  setText('statRoadType', roadLabels[route.roadType] || 'Urban Mixed');
  setText('statSpeed',    `${route.current.speed.toFixed(0)} km/h`);

  // ── ETA: always show model, optionally show Google live ──
  setText('statETAModel', formatDuration(route.etaModel));

  const googleBlock = document.getElementById('etaGoogleBlock');
  if (route.etaGoogle != null && googleBlock) {
    googleBlock.style.display = 'flex';
    setText('statETAGoogle', formatDuration(route.etaGoogle));

    // Comparison badge: positive = today is WORSE than historical average
    const diffMin  = Math.round(route.etaGoogle - route.etaModel);
    const absDiff  = Math.abs(diffMin);
    const badge = document.getElementById('etaDiffBadge');
    if (badge) {
      badge.style.display = 'inline-block';
      if (absDiff <= 2) {
        badge.textContent = '≈ matches historical model';
        badge.className   = 'eta-diff-badge neutral';
      } else if (diffMin > 0) {
        badge.textContent = `⚠ +${absDiff} min vs model — traffic is heavier than usual today`;
        badge.className   = 'eta-diff-badge worse';
      } else {
        badge.textContent = `✅ −${absDiff} min vs model — traffic is lighter than usual today`;
        badge.className   = 'eta-diff-badge better';
      }
    }
  } else if (googleBlock) {
    googleBlock.style.display = 'none';
    const badge = document.getElementById('etaDiffBadge');
    if (badge) badge.style.display = 'none';
  }

  // Colour-coded route indicator
  const ind = document.getElementById('activeRouteIndicator');
  if (ind) { ind.style.background = ROUTE_COLORS[idx]; ind.textContent = `Route ${idx+1} — ${route.name}`; }
}

// ── Current analysis panel ───────────────────────────────────
function renderCurrentAnalysis(trafficLevel, roadInfo, current, calcParams) {
  const tl      = trafficLabel(trafficLevel);
  const costNow = fuelCost(current.fuel, calcParams.fuelType);
  const co2Now  = co2(current.fuel, calcParams.fuelType);

  const el = document.getElementById('condTraffic');
  el.textContent = `${tl.icon} ${tl.text}`;
  el.className   = `condition-value ${tl.cls}`;
  setText('condTrafficSub', `${(trafficLevel * 100).toFixed(0)}% congestion`);
  setText('condRoad',       roadInfo.text);
  setText('condRoadSub',    roadInfo.sub);
  setText('condFuel',       current.fuel.toFixed(2));
  setText('condCost',       `₹${costNow.toFixed(0)}`);
  setText('condCostSub',    `@ ₹${FUEL_PRICES[calcParams.fuelType]}/L`);
  setText('condCO2',        co2Now.toFixed(2));
  setText('condMileage',    current.effectiveMileage.toFixed(1));
  setText('condMileageSub', `ARAI ${calcParams.araiMileage} → real-world kmpl`);
}

// ── Traffic chart (next 6 hours) ─────────────────────────────
function renderChart(hourlyData, currentHour, bestHour) {
  if (state.chart) state.chart.destroy();

  // X-labels: "Now (10:00)", "+1h", "+2h" …
  const labels = hourlyData.map((d, i) =>
    i === 0 ? `Now\n(${formatHour(d.hour)})` : `+${i}h\n(${formatHour(d.hour)})`
  );
  const costs   = hourlyData.map(d => parseFloat(d.cost.toFixed(2)));
  const traffic = hourlyData.map(d => parseFloat((d.trafficLevel * 100).toFixed(1)));
  const bgColors = hourlyData.map(d => {
    if (d.hour === currentHour && d.hour === bestHour) return 'rgba(46,125,50,0.85)';
    if (d.hour === currentHour) return 'rgba(230,81,0,0.85)';
    if (d.hour === bestHour)    return 'rgba(46,125,50,0.85)';
    return 'rgba(21,101,192,0.45)';
  });

  const fuelType = state.routes[state.selectedIdx]?.calcParams?.fuelType || 'petrol';
  const ctx = document.getElementById('trafficChart').getContext('2d');
  state.chart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [
        {
          label: `Fuel Cost (₹ ${fuelType})`,
          data: costs, backgroundColor: bgColors,
          borderRadius: 4, yAxisID: 'yCost', order: 2,
        },
        {
          type: 'line', label: 'Traffic (%)',
          data: traffic, borderColor: '#f9a825',
          backgroundColor: 'rgba(249,168,37,0.1)',
          borderWidth: 2.5, pointRadius: 4, tension: 0.4,
          yAxisID: 'yTraffic', order: 1,
        },
      ],
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: {
        legend: { position: 'top' },
        tooltip: {
          callbacks: {
            afterBody: items => {
              const d = hourlyData[items[0].dataIndex];
              const tags = [];
              if (d.hour === currentHour) tags.push('← You are here (Now)');
              if (d.hour === bestHour && d.hour !== currentHour) tags.push('← Best in 3-hr window ✓');
              if (d.hour === bestHour && d.hour === currentHour) tags.push('← Optimal now! ✓');
              return tags;
            },
          },
        },
      },
      scales: {
        x: { grid: { display: false }, ticks: { font: { size: 10 }, maxRotation: 0 } },
        yCost:    { type: 'linear', position: 'left',  title: { display: true, text: 'Fuel Cost (₹)' }, grid: { color: '#eee' } },
        yTraffic: { type: 'linear', position: 'right', title: { display: true, text: 'Traffic (%)' }, min: 0, max: 110, grid: { display: false } },
      },
    },
  });
}

// ── Optimal time (3-hour window) ─────────────────────────────
function renderOptimalTime(currentHour, bestHour, bestOffset, hourlyData, fuelType, isWeekend) {
  const curData  = hourlyData[0];                                   // offset 0 = now
  const bestData = hourlyData.find(d => d.hour === bestHour) || curData;

  setText('optNowTime',  formatHour(currentHour));
  setText('optNowFuel',  `${curData.fuel.toFixed(2)} L`);
  setText('optNowCost',  `₹${curData.cost.toFixed(0)}`);
  setText('optBestTime', bestOffset === 0 ? `${formatHour(bestHour)} (Now)` : formatHour(bestHour));
  setText('optBestFuel', `${bestData.fuel.toFixed(2)} L`);
  setText('optBestCost', `₹${bestData.cost.toFixed(0)}`);

  const fuelSave = curData.fuel - bestData.fuel;
  const costSave = curData.cost - bestData.cost;
  document.getElementById('savingsPill').innerHTML =
    costSave > 1 ? `SAVE<br>₹${costSave.toFixed(0)}` : 'OPTIMAL<br>NOW';

  const bestTl = trafficLabel(getTrafficLevel(bestHour, isWeekend));
  const timeMsg = bestOffset === 0
    ? '✅ <strong>Now is the best time to leave</strong> within the next 3 hours.'
    : `💡 Leaving at <strong>${formatHour(bestHour)}</strong> (in ${bestOffset}h) saves
       <strong>${fuelSave.toFixed(2)} L</strong> and <strong>₹${costSave.toFixed(0)}</strong>.`;

  document.getElementById('optimalDetails').innerHTML = `
    ${timeMsg}<br>
    Traffic at ${formatHour(bestHour)}: ${bestTl.icon} <strong>${bestTl.text}</strong>
    — avg ~${bestData.speed?.toFixed(0) || '--'} km/h.<br>
    <em style="font-size:.8rem;color:#666">Chart shows next 6 hours; optimal suggestion is within the next 3 hours.</em>
  `;
}

// ── Vehicle comparison ───────────────────────────────────────
function renderVehicleComparison(distKm, trafficLevel, calcParams, signals, roadInfo) {
  const yourFuel  = calculateFuel({ ...calcParams }).fuel;
  const yourCost  = fuelCost(yourFuel, calcParams.fuelType);

  const rows = COMPARISON_VEHICLES.map(cv => {
    const ml = cv[calcParams.fuelType] ?? cv.petrol;
    if (!ml) return null;
    const ft = cv[calcParams.fuelType] ? calcParams.fuelType : 'petrol';
    const cf = calculateFuel({ distance: distKm, araiMileage: ml, trafficLevel, signals, fuelType: ft, vehicleType: cv.type, roadFuelMod: roadInfo.fuelMod });
    const cost = fuelCost(cf.fuel, ft);
    return { label: cv.label, example: cv.example, fuel: cf.fuel, cost, diff: yourCost - cost };
  }).filter(Boolean);

  document.getElementById('vehicleCompTable').innerHTML = `<table class="comp-table">
    <thead><tr><th>Vehicle</th><th>Fuel Used</th><th>Cost</th><th>CO₂</th><th>vs Your Vehicle</th></tr></thead>
    <tbody>
      <tr class="highlight-row">
        <td><span class="vehicle-badge">🚗 ${state.brand} ${state.model} <span class="you-tag">YOU</span></span></td>
        <td>${yourFuel.toFixed(2)} L</td><td>₹${yourCost.toFixed(0)}</td>
        <td>${co2(yourFuel, calcParams.fuelType).toFixed(2)} kg</td><td class="saving-neutral">—</td>
      </tr>
      ${rows.map(r => {
        const cls = r.diff > 2 ? 'saving-green' : r.diff < -5 ? 'saving-red' : 'saving-neutral';
        const tag = r.diff > 2 ? `save ₹${r.diff.toFixed(0)}` : r.diff < -5 ? `costs ₹${Math.abs(r.diff).toFixed(0)} more` : 'similar cost';
        return `<tr>
          <td><span class="vehicle-badge">${r.label}</span><br><small style="color:#777">${r.example}</small></td>
          <td>${r.fuel.toFixed(2)} L</td><td>₹${r.cost.toFixed(0)}</td>
          <td>${co2(r.fuel, calcParams.fuelType).toFixed(2)} kg</td>
          <td class="${cls}">${tag}</td>
        </tr>`;
      }).join('')}
    </tbody></table>`;
}

// ── Public transport ─────────────────────────────────────────
function renderPublicTransport(distKm, fuel, fuelType) {
  const myFuelCost = fuelCost(fuel, fuelType);
  const options    = publicTransportEstimate(distKm);

  const cards = options.map(o => {
    const fareHtml = o.fareType === 'dynamic'
      ? `<div class="pt-fare" style="font-size:.85rem;color:#e65100">⚡ Dynamic pricing</div>`
      : `<div class="pt-fare">₹${o.fare}</div>`;

    const saveHtml = o.fare
      ? `<div class="pt-save">~₹${Math.max(0, myFuelCost - o.fare).toFixed(0)} cheaper than your fuel cost</div>`
      : `<div class="pt-save" style="color:#777;font-size:.78rem">Check app for current fare</div>`;

    const links = [
      o.bookLink  ? `<a class="pt-link" href="${o.bookLink}" target="_blank" rel="noopener">${o.bookLabel}</a>`  : '',
      o.bookLink2 ? `<a class="pt-link" href="${o.bookLink2}" target="_blank" rel="noopener">${o.bookLabel2}</a>` : '',
    ].filter(Boolean).join('');

    return `<div class="pt-card">
      <div class="pt-icon">${o.icon}</div>
      <div class="pt-mode">${o.mode}</div>
      ${fareHtml}
      <div class="pt-detail">${o.fareNote}</div>
      <div class="pt-detail" style="margin-top:3px">${o.detail} · ~${o.speed} km/h</div>
      ${saveHtml}
      ${links ? `<div style="margin-top:8px;display:flex;gap:6px;justify-content:center">${links}</div>` : ''}
    </div>`;
  }).join('');

  document.getElementById('publicTransportSection').innerHTML = `
    <div class="pt-grid">${cards}</div>
    <p style="margin-top:12px;font-size:.78rem;color:#777">
      ℹ️ Metro &amp; bus fares are official fixed rates. Auto is metered (Delhi Govt rate).
      Ola/Uber use dynamic surge pricing — always check the app before booking.<br>
      Your vehicle fuel cost for this journey: <strong>₹${myFuelCost.toFixed(0)}</strong>.
      Taking public transport saves that fuel and reduces Delhi's air quality burden.
    </p>`;
}

// ── Eco summary ──────────────────────────────────────────────
function renderEcoSummary(current, calcParams, distKm, hourlyData, bestHour, currentOffset) {
  const co2Now   = co2(current.fuel, calcParams.fuelType);
  const curData  = hourlyData[currentOffset];
  const bestData = hourlyData.find(d => d.hour === bestHour) || curData;
  const fuelSave = Math.max(0, curData.fuel - bestData.fuel);
  const costSave = Math.max(0, curData.cost - bestData.cost);
  const co2Save  = co2(fuelSave, calcParams.fuelType);

  const twoWFuel = calcParams.vehicleType === '4wheeler'
    ? calculateFuel({ distance: distKm, araiMileage: 60, trafficLevel: calcParams.trafficLevel, signals: calcParams.signals, fuelType: 'petrol', vehicleType: '2wheeler', roadFuelMod: calcParams.roadFuelMod }).fuel
    : null;
  const switchSave = twoWFuel ? Math.max(0, current.fuel - twoWFuel) : 0;

  document.getElementById('ecoSummary').innerHTML = `
    <div class="eco-grid">
      <div class="eco-item"><div class="eco-num">${current.fuel.toFixed(2)} L</div><div class="eco-label">Fuel this trip (now)</div></div>
      <div class="eco-item"><div class="eco-num">${co2Now.toFixed(2)} kg</div><div class="eco-label">CO₂ emitted</div></div>
      <div class="eco-item"><div class="eco-num" style="color:#e65100">₹${costSave.toFixed(0)}</div><div class="eco-label">Save by timing</div></div>
      <div class="eco-item"><div class="eco-num" style="color:#e65100">${co2Save.toFixed(3)} kg</div><div class="eco-label">CO₂ saved by timing</div></div>
      ${switchSave > 0.05 ? `
      <div class="eco-item"><div class="eco-num" style="color:#1565c0">${switchSave.toFixed(2)} L</div><div class="eco-label">Saved switching to 2W</div></div>
      <div class="eco-item"><div class="eco-num" style="color:#1565c0">₹${fuelCost(switchSave, calcParams.fuelType).toFixed(0)}</div><div class="eco-label">₹ saved on 2W</div></div>` : ''}
    </div>
    <p style="margin-top:14px;font-size:.83rem;color:#555;line-height:1.7">
      🌿 Over 20 trips/month, optimal timing alone saves
      <strong>${(fuelSave * 20).toFixed(1)} litres</strong> and
      <strong>${co2(fuelSave * 20, calcParams.fuelType).toFixed(1)} kg CO₂</strong>.
      ${switchSave > 0.05 ? `A 2-wheeler would save an additional <strong>${switchSave.toFixed(2)} L</strong> per trip.` : ''}
    </p>`;
}

// ── Google Maps navigation button ────────────────────────────
function renderGoogleMapsBtn(sourceLabel) {
  const navUrl = googleMapsNavUrl(state.startCoords, state.endCoords);
  const el     = document.getElementById('googleMapsNavBtn');
  if (el) {
    el.href = navUrl;
    el.style.display = 'inline-flex';
  }
  const src = document.getElementById('routeSourceLabel');
  if (src) src.textContent = `Route data: ${sourceLabel}`;
}

// ── Utility ──────────────────────────────────────────────────
function setText(id, val) { const el = document.getElementById(id); if (el) el.textContent = val; }

// ── Init ─────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  updateClock();
  setInterval(updateClock, 1000);
  populateBrands();

  // Pre-fill Google Maps key if saved
  const saved = localStorage.getItem('gmaps_key');
  if (saved) { document.getElementById('gmapsKeyInput').value = saved; state.googleApiKey = saved; }

  initAutocomplete('startLocation', 'startDropdown', c => { state.startCoords = c || null; });
  initAutocomplete('endLocation',   'endDropdown',   c => { state.endCoords   = c || null; });
});

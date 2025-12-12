const profiles = {
  nourrisson: {
    label: 'Nourrisson (repères ANSES)',
    residueMax: 50,
    nitratesMax: 10,
    sodiumMax: 15,
  },
  sensible: {
    label: 'Public sensible',
    residueMax: 150,
    nitratesMax: 20,
    sodiumMax: 50,
  },
  standard: {
    label: 'Usage quotidien',
    residueMax: 500,
    nitratesMax: 50,
    sodiumMax: 200,
  },
};

const weights = {
  residue: 0.45,
  nitrates: 0.35,
  sodium: 0.2,
};

const state = {
  filters: { ...profiles.nourrisson },
};

async function loadWaters() {
  const response = await fetch('data/waters.json');
  return response.json();
}

function normalise(value, limit) {
  const ratio = Math.max(0, 1 - value / limit);
  return Math.round(ratio * 1000) / 1000;
}

function scoreWater(water, filters) {
  const residueScore = normalise(water.residue, filters.residueMax);
  const nitrateScore = normalise(water.nitrates, filters.nitratesMax);
  const sodiumScore = normalise(water.sodium, filters.sodiumMax);
  const weighted =
    residueScore * weights.residue +
    nitrateScore * weights.nitrates +
    sodiumScore * weights.sodium;
  return Math.round(weighted * 1000) / 10; // score /100 avec 1 décimale
}

function evaluateCompliance(water, filters) {
  return {
    residue: water.residue <= filters.residueMax,
    nitrates: water.nitrates <= filters.nitratesMax,
    sodium: water.sodium <= filters.sodiumMax,
  };
}

function formatValue(value, unit = 'mg/L') {
  return `${value} ${unit}`;
}

function renderProfiles() {
  const container = document.querySelector('#profiles');
  container.innerHTML = '';

  Object.entries(profiles).forEach(([key, profile]) => {
    const button = document.createElement('button');
    button.className = 'chip';
    button.textContent = profile.label;
    button.dataset.profile = key;
    button.addEventListener('click', () => {
      state.filters = { ...profile };
      syncInputs();
      render(state.waters, state.filters);
    });
    container.appendChild(button);
  });
}

function updateLabels(filters) {
  document.querySelector('#residue-label').textContent = formatValue(filters.residueMax);
  document.querySelector('#nitrates-label').textContent = formatValue(filters.nitratesMax);
  document.querySelector('#sodium-label').textContent = formatValue(filters.sodiumMax);
}

function renderTable(waters, filters) {
  const tbody = document.querySelector('#water-table-body');
  tbody.innerHTML = '';

  const ranked = waters
    .map((water) => ({
      ...water,
      compliance: evaluateCompliance(water, filters),
      score: scoreWater(water, filters),
    }))
    .sort((a, b) => b.score - a.score);

  ranked.forEach((water, index) => {
    const row = document.createElement('tr');
    const residueClass = water.compliance.residue ? 'ok' : 'warn';
    const nitratesClass = water.compliance.nitrates ? 'ok' : 'warn';
    const sodiumClass = water.compliance.sodium ? 'ok' : 'warn';

    row.innerHTML = `
      <td class="rank">#${index + 1}</td>
      <td>${water.name}</td>
      <td class="metric ${residueClass}">${water.residue} mg/L</td>
      <td class="metric ${nitratesClass}">${water.nitrates} mg/L</td>
      <td class="metric ${sodiumClass}">${water.sodium} mg/L</td>
      <td class="score">${water.score.toFixed(1)}</td>
      <td><span class="badge">${water.source}</span></td>
    `;
    tbody.appendChild(row);
  });
}

function renderStats(waters, filters) {
  const ranked = waters.map((water) => ({
    score: scoreWater(water, filters),
    compliance: evaluateCompliance(water, filters),
  }));

  const matching = ranked.filter((item) =>
    Object.values(item.compliance).every(Boolean)
  );

  const sorted = [...ranked].sort((a, b) => b.score - a.score);
  const top3 = sorted.slice(0, 3);
  const meanTop3 =
    top3.length > 0
      ? (top3.reduce((sum, item) => sum + item.score, 0) / top3.length).toFixed(1)
      : '–';

  document.querySelector('#stat-total').textContent = waters.length;
  document.querySelector('#stat-matching').textContent = matching.length;
  document.querySelector('#stat-top3').textContent = meanTop3;
}

function syncInputs() {
  document.querySelector('#residue').value = state.filters.residueMax;
  document.querySelector('#nitrates').value = state.filters.nitratesMax;
  document.querySelector('#sodium').value = state.filters.sodiumMax;
  updateLabels(state.filters);
}

function attachInputs() {
  const residueInput = document.querySelector('#residue');
  const nitratesInput = document.querySelector('#nitrates');
  const sodiumInput = document.querySelector('#sodium');

  const update = () => {
    state.filters.residueMax = Number(residueInput.value);
    state.filters.nitratesMax = Number(nitratesInput.value);
    state.filters.sodiumMax = Number(sodiumInput.value);
    render(state.waters, state.filters);
  };

  residueInput.addEventListener('input', update);
  nitratesInput.addEventListener('input', update);
  sodiumInput.addEventListener('input', update);
}

function render(waters, filters) {
  updateLabels(filters);
  renderTable(waters, filters);
  renderStats(waters, filters);
}

(async function init() {
  try {
    renderProfiles();
    state.waters = await loadWaters();
    syncInputs();
    attachInputs();
    render(state.waters, state.filters);
  } catch (error) {
    const tbody = document.querySelector('#water-table-body');
    tbody.innerHTML = `<tr><td colspan="7">Impossible de charger les données (${error.message})</td></tr>`;
  }
})();

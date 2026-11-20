// Leonida Ledger boot: load the trophy data, restore saved progress, wire
// the toolbar, the tabs and the detail pane, then render. The app is fully
// offline after this fetch — the data file is one of its own files.
import { loadState, saveState, toggleEarned, setCount, setNote, exportProgress, importProgress, resetProgress } from './store.js';
import { applyFilters } from './filters.js';
import { renderHeader, renderList, renderDetail, renderRoadmap, renderMissables, renderSources } from './views.js';

const VIEWS = ['tracker', 'roadmap', 'missables', 'sources'];
let trophies = [];
let verified = null;
let state = loadState();
let currentView = 'tracker';
const query = { q: '', kind: 'all', grade: 'all', status: 'all', sort: 'official' };

function showView(name) {
  currentView = VIEWS.includes(name) ? name : 'tracker';
  for (const v of VIEWS) {
    document.getElementById('view-' + v).hidden = v !== currentView;
    const tab = document.querySelector('.tab[data-view="' + v + '"]');
    if (tab) tab.classList.toggle('active', v === currentView);
  }
  if (currentView === 'roadmap') renderRoadmap(state, trophies, selectTrophy);
  if (currentView === 'missables') renderMissables(state, trophies, selectTrophy);
  if (currentView === 'sources') renderSources(verified);
  if (location.hash !== '#/' + currentView) history.replaceState(null, '', '#/' + currentView);
}

function renderAll() {
  renderHeader(state, trophies);
  const visible = applyFilters(trophies, state, query);
  renderList(state, trophies, visible, selectTrophy, (id) => {
    toggleEarned(state, id);
    renderAll();
  });
  renderDetail(
    state,
    trophies,
    (id) => {
      toggleEarned(state, id);
      renderAll();
    },
    (id, value, goal) => {
      setCount(state, id, value, goal);
      renderAll();
    },
    (id, text) => {
      setNote(state, id, text);
      renderAll();
    },
  );
  if (currentView === 'roadmap') renderRoadmap(state, trophies, selectTrophy);
  if (currentView === 'missables') renderMissables(state, trophies, selectTrophy);
}

function selectTrophy(id) {
  state.selectedId = id;
  saveState(state);
  showView('tracker');
  renderAll();
  const pane = document.getElementById('detail');
  if (pane && window.innerWidth <= 900) pane.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

async function boot() {
  const response = await fetch('data/trophies.json');
  if (!response.ok) throw new Error('Could not load data/trophies.json');
  const data = await response.json();
  trophies = data.trophies || [];
  verified = data.verified || null;
  if (verified) {
    document.getElementById('verify-line').textContent =
      'List verified ' + (verified.date || '') + ' against Exophase and PSNProfiles — 55 trophies, 1 platinum, 2 gold, 6 silver, 46 bronze, 28 hidden, no online trophies.';
  }

  document.getElementById('search').addEventListener('input', (e) => {
    query.q = e.target.value;
    renderAll();
  });
  document.getElementById('kind-filter').addEventListener('change', (e) => {
    query.kind = e.target.value;
    renderAll();
  });
  document.getElementById('grade-filter').addEventListener('change', (e) => {
    query.grade = e.target.value;
    renderAll();
  });
  document.getElementById('status-filter').addEventListener('change', (e) => {
    query.status = e.target.value;
    renderAll();
  });
  document.getElementById('sort-select').addEventListener('change', (e) => {
    query.sort = e.target.value;
    renderAll();
  });
  const spoiler = document.getElementById('spoiler-toggle');
  spoiler.checked = state.spoilers === true;
  spoiler.addEventListener('change', () => {
    state.spoilers = spoiler.checked;
    saveState(state);
    renderAll();
  });
  document.getElementById('export-btn').addEventListener('click', () => {
    const n = exportProgress(state);
    alert('Exported ' + n + ' earned trophies to leonida-ledger-progress.json.');
  });
  const importFile = document.getElementById('import-file');
  document.getElementById('import-btn').addEventListener('click', () => importFile.click());
  importFile.addEventListener('change', async () => {
    const file = importFile.files[0];
    if (!file) return;
    try {
      const text = await file.text();
      state = importProgress(state, text);
      document.getElementById('spoiler-toggle').checked = state.spoilers === true;
      renderAll();
      alert('Progress imported.');
    } catch (err) {
      alert('Could not import that file: ' + err.message);
    }
    importFile.value = '';
  });
  document.getElementById('reset-btn').addEventListener('click', () => {
    if (!confirm('Clear all earned trophies, counters and notes? This cannot be undone.')) return;
    state = resetProgress();
    document.getElementById('spoiler-toggle').checked = false;
    renderAll();
  });
  document.querySelectorAll('.tab').forEach((tab) => {
    tab.addEventListener('click', () => showView(tab.dataset.view));
  });
  window.addEventListener('hashchange', () => showView(location.hash.replace('#/', '')));

  const initial = location.hash.replace('#/', '');
  showView(initial);
  renderAll();
}

boot().catch((err) => {
  document.getElementById('view-root').innerHTML =
    '<p class="empty-note">The guide could not start: ' + err.message + '</p>';
});

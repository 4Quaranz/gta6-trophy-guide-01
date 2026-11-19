// Boot for the Leonida Ledger. Loads the trophy data, wires the toolbar and the
// tabs, and renders the current view. The app is fully static: the only fetch
// is the trophy file under app/ itself, and it makes no other network request.
import { loadState, saveState, exportProgress, importProgressFile, gradeCounts } from './store.js';
import { FILTERS, TOTAL_POINTS, matchesFilter } from './data.js';
import { renderChecklist, renderDetail, renderRoadmap, renderMissables, renderAbout } from './views.js';

const view = document.getElementById('view');
const detail = document.getElementById('detail');
const searchInput = document.getElementById('searchInput');
const filterRow = document.getElementById('filterRow');
const spoilerToggle = document.getElementById('spoilerToggle');
const toolbarNote = document.getElementById('toolbarNote');
const toolbar = document.getElementById('toolbar');

const state = loadState();
let trophies = [];
let sourceNames = {};
let tab = 'tracker';
let search = '';
let selectedId = null;

async function loadTrophies() {
  const response = await fetch('data/trophies.json');
  if (!response.ok) throw new Error(`Could not load trophy data (${response.status})`);
  const doc = await response.json();
  trophies = doc.trophies;
  sourceNames = {
    exophase: 'Exophase — Grand Theft Auto VI Trophies (PS5): official names, descriptions, grades and hidden flags.',
    psnprofiles: 'PSNProfiles — Grand Theft Auto VI trophy list: PSN progress counts (for example 42 Shooting Range challenges, 14 drone race locations, 18 meditation spots).',
  };
  if (doc.sources && doc.sources.note) {
    sourceNames.note = doc.sources.note;
  }
}

function currentTab() {
  const hash = location.hash.replace(/^#\/?/, '');
  return ['tracker', 'roadmap', 'missables', 'about'].includes(hash) ? hash : 'tracker';
}

function visibleTrophies() {
  const query = search.trim().toLowerCase();
  return trophies.filter((trophy) => {
    if (!matchesFilter(trophy, state.filter, state.earned)) return false;
    if (!query) return true;
    return trophy.name.toLowerCase().includes(query)
      || trophy.description.toLowerCase().includes(query)
      || trophy.guide.toLowerCase().includes(query);
  });
}

function selectedTrophy() {
  return trophies.find((t) => t.id === selectedId) || null;
}

function updateHeader() {
  const { counts, points } = gradeCounts(trophies, state.earned);
  const totalPoints = trophies.length ? TOTAL_POINTS : 0;
  document.getElementById('earnedCount').textContent = String(state.earned.size);
  document.getElementById('progressFill').style.width = `${(state.earned.size / trophies.length) * 100}%`;
  document.getElementById('progressBar').setAttribute('aria-valuenow', String(state.earned.size));
  document.getElementById('gradeLine').textContent =
    `${counts.platinum} platinum · ${counts.gold} gold · ${counts.silver} silver · ${counts.bronze} bronze`;
  document.getElementById('pointsLine').textContent = `${points} points · ${points} of ${totalPoints}`;
  const missableTotal = trophies.filter((t) => t.missable).length;
  const missableEarned = trophies.filter((t) => t.missable && state.earned.has(t.id)).length;
  document.getElementById('missableBadge').textContent = `${missableEarned}/${missableTotal}`;
}

function updateToolbarNote() {
  if (tab !== 'tracker' && tab !== 'missables') {
    toolbarNote.textContent = '';
    return;
  }
  if (tab === 'missables') {
    const missable = trophies.filter((t) => t.missable);
    const earnedMissable = missable.filter((t) => state.earned.has(t.id)).length;
    toolbarNote.textContent = `Showing ${missable.length} missable trophies · ${earnedMissable} earned · no online trophies exist in the official list, so there is no online filter.`;
    return;
  }
  const shown = visibleTrophies().length;
  const earnedShown = visibleTrophies().filter((t) => state.earned.has(t.id)).length;
  toolbarNote.textContent = `Showing ${shown} of ${trophies.length} trophies · ${earnedShown} earned in this view · no online trophies exist in the official list, so there is no online filter.`;
}

function render() {
  tab = currentTab();
  document.querySelectorAll('.tab').forEach((link) => {
    link.classList.toggle('active', link.dataset.tab === tab);
  });
  toolbar.style.display = tab === 'tracker' || tab === 'missables' ? '' : 'none';
  if (tab === 'tracker') {
    renderChecklist(view, visibleTrophies(), state, handlers);
  } else if (tab === 'roadmap') {
    renderRoadmap(view, trophies, state);
  } else if (tab === 'missables') {
    renderMissables(view, trophies, state, handlers);
  } else {
    renderAbout(view, sourceNames);
  }
  renderDetail(detail, selectedTrophy(), state, sourceNames);
  updateHeader();
  updateToolbarNote();
}

const handlers = {
  get selectedId() {
    return selectedId;
  },
  onToggle(id, checked) {
    if (checked) state.earned.add(id);
    else state.earned.delete(id);
    saveState(state);
    render();
  },
  onSelect(id) {
    selectedId = id;
    render();
    detail.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  },
};

function buildFilters() {
  filterRow.replaceChildren();
  for (const filter of FILTERS) {
    const chip = document.createElement('button');
    chip.type = 'button';
    chip.className = 'chip';
    chip.dataset.filter = filter.id;
    chip.textContent = filter.label;
    if (state.filter === filter.id) chip.classList.add('active');
    chip.addEventListener('click', () => {
      state.filter = filter.id;
      saveState(state);
      filterRow.querySelectorAll('.chip').forEach((c) => c.classList.toggle('active', c === chip));
      render();
    });
    filterRow.appendChild(chip);
  }
}

function stepDetail(direction) {
  if (trophies.length === 0) return;
  const index = trophies.findIndex((t) => t.id === selectedId);
  const next = index === -1
    ? (direction > 0 ? 0 : trophies.length - 1)
    : (index + direction + trophies.length) % trophies.length;
  selectedId = trophies[next].id;
  render();
}

searchInput.addEventListener('input', () => {
  search = searchInput.value;
  render();
});

spoilerToggle.checked = state.spoiler;
spoilerToggle.addEventListener('change', () => {
  state.spoiler = spoilerToggle.checked;
  saveState(state);
  render();
});

document.getElementById('exportBtn').addEventListener('click', () => {
  exportProgress(state);
  toolbarNote.textContent = 'Progress exported as a JSON file. Keep it to restore your checklist later.';
});

document.getElementById('importBtn').addEventListener('click', () => {
  document.getElementById('importFile').click();
});

document.getElementById('importFile').addEventListener('change', async (event) => {
  const file = event.target.files && event.target.files[0];
  if (!file) return;
  try {
    const imported = await importProgressFile(file);
    state.earned = new Set(imported.earned);
    if (imported.spoiler) {
      state.spoiler = true;
      spoilerToggle.checked = true;
    }
    saveState(state);
    render();
    toolbarNote.textContent = `Imported ${imported.earned.length} earned trophies from ${file.name}.`;
  } catch (error) {
    toolbarNote.textContent = `Import failed: ${error.message}`;
  }
  event.target.value = '';
});

document.getElementById('resetBtn').addEventListener('click', () => {
  if (!window.confirm('Clear all earned trophies and reset the tracker?')) return;
  state.earned = new Set();
  selectedId = null;
  saveState(state);
  render();
});

detail.addEventListener('detail-prev', () => stepDetail(-1));
detail.addEventListener('detail-next', () => stepDetail(1));
window.addEventListener('hashchange', render);

buildFilters();
loadTrophies()
  .then(() => {
    // A sensible first pick: the platinum, so the guide pane is never empty.
    selectedId = 1;
    render();
  })
  .catch((error) => {
    view.innerHTML = '';
    const message = document.createElement('p');
    message.className = 'empty';
    message.textContent = `The trophy list could not be loaded: ${error.message}`;
    view.appendChild(message);
  });

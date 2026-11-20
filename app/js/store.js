// Progress store: everything the tracker remembers lives in localStorage
// under one key, so the guide works offline and never sends data anywhere.
// Export writes a JSON file; import reads one back and applies it.
export const STORAGE_KEY = 'leonida-ledger-v1';
export const EXPORT_KIND = 'leonida-ledger-progress';

export function blankState() {
  return { earned: {}, counts: {}, notes: {}, spoilers: false, selectedId: 1 };
}

export function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return blankState();
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return blankState();
    return {
      earned: parsed.earned && typeof parsed.earned === 'object' ? parsed.earned : {},
      counts: parsed.counts && typeof parsed.counts === 'object' ? parsed.counts : {},
      notes: parsed.notes && typeof parsed.notes === 'object' ? parsed.notes : {},
      spoilers: parsed.spoilers === true,
      selectedId: Number.isInteger(parsed.selectedId) ? parsed.selectedId : 1,
    };
  } catch {
    return blankState();
  }
}

export function saveState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Storage full or unavailable: the page still works for this session.
  }
}

export function isEarned(state, id) {
  return state.earned[id] === true;
}

export function toggleEarned(state, id) {
  if (state.earned[id]) delete state.earned[id];
  else state.earned[id] = true;
  saveState(state);
  return state;
}

export function setCount(state, id, value, goal) {
  const clamped = Math.max(0, Math.min(goal, Math.round(value) || 0));
  if (clamped === 0) delete state.counts[id];
  else state.counts[id] = clamped;
  saveState(state);
  return clamped;
}

export function setNote(state, id, text) {
  const trimmed = String(text).slice(0, 500);
  if (trimmed.trim() === '') delete state.notes[id];
  else state.notes[id] = trimmed;
  saveState(state);
}

export function earnedCount(state, trophies) {
  return trophies.filter((t) => isEarned(state, t.id)).length;
}

export function gradeCounts(state, trophies) {
  const out = { platinum: [0, 0], gold: [0, 0], silver: [0, 0], bronze: [0, 0] };
  for (const t of trophies) {
    if (!out[t.grade]) continue;
    out[t.grade][1] += 1;
    if (isEarned(state, t.id)) out[t.grade][0] += 1;
  }
  return out;
}

export function exportProgress(state) {
  const payload = {
    kind: EXPORT_KIND,
    version: 1,
    exportedAt: new Date().toISOString(),
    earned: Object.keys(state.earned).filter((id) => state.earned[id]).map(Number),
    counts: state.counts,
    notes: state.notes,
    spoilers: state.spoilers,
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'leonida-ledger-progress.json';
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  return payload.earned.length;
}

export function importProgress(state, text) {
  const parsed = JSON.parse(text);
  if (!parsed || parsed.kind !== EXPORT_KIND) {
    throw new Error('Not a Leonida Ledger progress file.');
  }
  const next = blankState();
  if (Array.isArray(parsed.earned)) {
    for (const id of parsed.earned) {
      if (Number.isInteger(id) && id >= 1 && id <= 55) next.earned[id] = true;
    }
  }
  if (parsed.counts && typeof parsed.counts === 'object') {
    for (const [id, value] of Object.entries(parsed.counts)) {
      const n = Number(id);
      if (Number.isInteger(n) && n >= 1 && n <= 55 && Number.isFinite(value) && value > 0) {
        next.counts[n] = Math.round(value);
      }
    }
  }
  if (parsed.notes && typeof parsed.notes === 'object') {
    for (const [id, value] of Object.entries(parsed.notes)) {
      const n = Number(id);
      if (Number.isInteger(n) && n >= 1 && n <= 55 && typeof value === 'string' && value.trim()) {
        next.notes[n] = value.slice(0, 500);
      }
    }
  }
  next.spoilers = parsed.spoilers === true;
  next.selectedId = state.selectedId;
  saveState(next);
  return next;
}

export function resetProgress() {
  const next = blankState();
  saveState(next);
  return next;
}

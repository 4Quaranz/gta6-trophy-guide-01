// Progress store for the Leonida Ledger: earned trophies and settings live in
// localStorage on this device only. Export writes a JSON file; import reads one
// back. Nothing here ever touches the network.
const STORAGE_KEY = 'leonida-ledger-v1';

function readStored() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return null;
    return parsed;
  } catch {
    return null;
  }
}

export function loadState() {
  const stored = readStored() || {};
  return {
    earned: new Set(Array.isArray(stored.earned) ? stored.earned : []),
    spoiler: stored.spoiler === true,
    filter: typeof stored.filter === 'string' ? stored.filter : 'all',
  };
}

export function saveState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      earned: [...state.earned].sort((a, b) => a - b),
      spoiler: state.spoiler,
      filter: state.filter,
    }));
  } catch {
    // Private mode or a full store: the checklist still works in memory.
  }
}

export function exportProgress(state, filename) {
  const payload = {
    app: 'Leonida Ledger — GTA 6 Trophy Guide',
    exportedAt: new Date().toISOString(),
    earned: [...state.earned].sort((a, b) => a - b),
    spoiler: state.spoiler,
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename || 'leonida-ledger-progress.json';
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

// Reads an exported progress file and returns { earned: number[], spoiler }.
// Throws a plain Error with a readable message when the file is not ours.
export async function importProgressFile(file) {
  const text = await file.text();
  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new Error('That file is not valid JSON.');
  }
  const ids = Array.isArray(parsed) ? parsed : parsed.earned;
  if (!Array.isArray(ids)) {
    throw new Error('That file holds no earned-trophy list.');
  }
  const earned = ids
    .map((n) => Number(n))
    .filter((n) => Number.isInteger(n) && n >= 1 && n <= 55);
  return {
    earned,
    spoiler: parsed && parsed.spoiler === true,
  };
}

// Counts earned trophies per grade, for the header card.
export function gradeCounts(trophies, earned) {
  const counts = { platinum: 0, gold: 0, silver: 0, bronze: 0 };
  let points = 0;
  for (const trophy of trophies) {
    if (!earned.has(trophy.id)) continue;
    if (counts[trophy.grade] !== undefined) counts[trophy.grade] += 1;
    points += trophy.points || 0;
  }
  return { counts, points };
}

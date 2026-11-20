// Filters and the spoiler rule: which trophies the list shows, and which
// story names stay hidden until earned.
export const GRADE_ORDER = { platinum: 0, gold: 1, silver: 2, bronze: 3 };

export function isSpoilerMasked(trophy, state) {
  return state.spoilers === true && trophy.kind === 'story' && !state.earned[trophy.id];
}

export function applyFilters(trophies, state, query) {
  const q = query.q.trim().toLowerCase();
  let list = trophies.slice();
  if (query.kind === 'missable') list = list.filter((t) => t.missable);
  else if (query.kind === 'online') list = list.filter(() => false);
  else if (query.kind !== 'all') list = list.filter((t) => t.kind === query.kind);
  if (query.grade !== 'all') list = list.filter((t) => t.grade === query.grade);
  if (query.status === 'earned') list = list.filter((t) => state.earned[t.id]);
  if (query.status === 'unearned') list = list.filter((t) => !state.earned[t.id]);
  if (q) {
    list = list.filter(
      (t) => t.name.toLowerCase().includes(q) || t.description.toLowerCase().includes(q),
    );
  }
  if (query.sort === 'name') list.sort((a, b) => a.name.localeCompare(b.name));
  else if (query.sort === 'grade') {
    list.sort((a, b) => GRADE_ORDER[a.grade] - GRADE_ORDER[b.grade] || a.id - b.id);
  }
  return list;
}

export function visibleName(trophy, state) {
  return isSpoilerMasked(trophy, state) ? 'Hidden story trophy' : trophy.name;
}

export function visibleDescription(trophy, state) {
  return isSpoilerMasked(trophy, state)
    ? 'Hidden until earned — turn spoiler-free mode off, or earn this trophy, to reveal it.'
    : trophy.description;
}

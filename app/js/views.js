// Views: everything the reader sees — the checklist, the detail pane, the
// roadmap, the missables page and the sources page. All text is built from
// app/data/trophies.json plus the source catalog; nothing is fetched live.
import { SOURCES } from './sources.js';
import { earnedCount, gradeCounts, isEarned } from './store.js';
import { isSpoilerMasked, visibleDescription, visibleName } from './filters.js';

export function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined && text !== null) node.textContent = text;
  return node;
}

function gradeTag(trophy) {
  return el('span', 'tag grade-' + trophy.grade, trophy.grade);
}

export function renderHeader(state, trophies) {
  const earned = earnedCount(state, trophies);
  const total = trophies.length;
  document.getElementById('earned-count').textContent = earned + ' / ' + total;
  document.getElementById('earned-pct').textContent =
    Math.round((earned / total) * 100) + '% to platinum';
  document.getElementById('progress-fill').style.width = (earned / total) * 100 + '%';
  const counts = gradeCounts(state, trophies);
  const wrap = document.getElementById('grade-counts');
  wrap.textContent = '';
  for (const grade of ['platinum', 'gold', 'silver', 'bronze']) {
    const [have, all] = counts[grade];
    const span = el('span');
    const label = el('span', null, grade + ' ');
    const bold = el('b', null, have + '/' + all);
    span.append(label, bold);
    wrap.appendChild(span);
  }
}

export function renderList(state, trophies, visible, onSelect, onToggle) {
  const list = document.getElementById('trophy-list');
  list.textContent = '';
  const meta = document.getElementById('list-meta');
  if (visible.length === 0) {
    meta.textContent = 'No trophies match these filters.';
    list.appendChild(el('li', 'empty-note', 'Nothing here — clear a filter or the search to see the list again.'));
    return;
  }
  meta.textContent =
    'Showing ' + visible.length + ' of ' + trophies.length + ' trophies' +
    (state.spoilers ? ' · spoiler-free mode on: story names stay hidden until earned' : '') +
    ' · ' + earnedCount(state, trophies) + ' earned so far.';
  for (const t of visible) {
    const earned = isEarned(state, t.id);
    const masked = isSpoilerMasked(t, state);
    const li = el('li');
    const row = el('button', 'trophy-row' + (earned ? ' earned' : '') + (state.selectedId === t.id ? ' selected' : ''));
    row.type = 'button';
    row.addEventListener('click', (event) => {
      if (event.target.tagName === 'INPUT') return;
      onSelect(t.id);
    });
    const box = document.createElement('input');
    box.type = 'checkbox';
    box.checked = earned;
    box.setAttribute('aria-label', 'Mark ' + t.name + ' as earned');
    box.addEventListener('change', (event) => {
      event.stopPropagation();
      onToggle(t.id);
    });
    const medal = el('span', 'medal ' + t.grade);
    medal.title = t.grade;
    const body = el('div');
    const name = el('div', 'trophy-name' + (masked ? ' spoiler-mask' : ''), visibleName(t, state));
    const desc = el('div', 'trophy-desc' + (masked ? ' spoiler-mask' : ''), visibleDescription(t, state));
    body.append(name, desc);
    const tags = el('div', 'trophy-tags');
    tags.appendChild(gradeTag(t));
    if (t.kind !== 'platinum') tags.appendChild(el('span', 'tag', t.kind));
    if (t.hidden) tags.appendChild(el('span', 'tag hidden-psn', 'hidden on PSN'));
    if (t.missable) tags.appendChild(el('span', 'tag missable', 'missable'));
    body.appendChild(tags);
    const side = el('div');
    if (t.target) {
      const have = state.counts[t.id] || 0;
      side.appendChild(el('div', 'mini-progress', have + ' / ' + t.target.goal + ' ' + t.target.unit));
    }
    if (state.notes[t.id]) side.appendChild(el('div', 'mini-progress', 'note saved'));
    row.append(box, medal, body, side);
    li.appendChild(row);
    list.appendChild(li);
  }
}

function sourceListItems(keys) {
  const ul = el('ul', 'sources-list');
  for (const key of keys) {
    const s = SOURCES[key];
    if (!s) continue;
    const li = el('li');
    const a = document.createElement('a');
    a.href = s.url;
    a.target = '_blank';
    a.rel = 'noopener';
    a.textContent = s.label;
    const what = el('span', null, ' — ' + s.what);
    li.append(a, what);
    ul.appendChild(li);
  }
  return ul;
}

export function renderDetail(state, trophies, onToggle, onCount, onNote) {
  const pane = document.getElementById('detail');
  const t = trophies.find((x) => x.id === state.selectedId) || trophies[0];
  pane.textContent = '';
  if (!t) {
    pane.appendChild(el('p', 'empty-note', 'Pick a trophy from the list to read its guide.'));
    return;
  }
  const masked = isSpoilerMasked(t, state);
  const earned = isEarned(state, t.id);
  const title = el('h2', null, masked ? 'Hidden story trophy' : t.name);
  const tags = el('div', 'trophy-tags');
  tags.appendChild(gradeTag(t));
  if (t.kind !== 'platinum') tags.appendChild(el('span', 'tag', t.kind));
  if (t.hidden) tags.appendChild(el('span', 'tag hidden-psn', 'hidden on PSN'));
  if (t.missable) tags.appendChild(el('span', 'tag missable', 'missable'));
  const earnedLine = el('label', 'earned-line');
  const box = document.createElement('input');
  box.type = 'checkbox';
  box.checked = earned;
  box.addEventListener('change', () => onToggle(t.id));
  earnedLine.append(box, document.createTextNode(earned ? 'Earned — nice work.' : 'Mark as earned'));
  const official = el('p', 'official');
  official.append(
    el('strong', null, 'Official description: '),
    document.createTextNode(masked ? 'Hidden until earned.' : '“' + t.description + '”'),
  );
  pane.append(title, tags, earnedLine, official);
  if (t.missable && t.missableNote) {
    const note = el('p', 'missable-note', '⚠ ' + t.missableNote);
    pane.appendChild(note);
  }
  pane.appendChild(el('h3', null, 'Guide'));
  const guide = el('p', 'guide-text', masked
    ? 'This is a story trophy, so its guide stays hidden while spoiler-free mode is on. Earn it (or switch the mode off) to read the guide.'
    : t.guide);
  pane.appendChild(guide);
  if (!masked && t.target) {
    pane.appendChild(el('h3', null, 'Your progress on this one'));
    const row = el('div', 'counter-row');
    const minus = el('button', null, '−');
    minus.type = 'button';
    const plus = el('button', null, '+');
    plus.type = 'button';
    const out = el('output', null, (state.counts[t.id] || 0) + ' / ' + t.target.goal + ' ' + t.target.unit);
    minus.addEventListener('click', () => onCount(t.id, (state.counts[t.id] || 0) - 1, t.target.goal));
    plus.addEventListener('click', () => onCount(t.id, (state.counts[t.id] || 0) + 1, t.target.goal));
    row.append(minus, out, plus);
    pane.appendChild(row);
    const hint = el('p', 'empty-note', 'The counter is your own tally against the PSN-tracked goal. Reaching ' + t.target.goal + ' does not tick the trophy by itself — tick the box above when it pops.');
    pane.appendChild(hint);
  }
  if (!masked) {
    pane.appendChild(el('h3', null, 'Your note'));
    const area = document.createElement('textarea');
    area.className = 'note-box';
    area.placeholder = 'Where is it? What worked? (saved in this browser only)';
    area.value = state.notes[t.id] || '';
    area.addEventListener('change', () => onNote(t.id, area.value));
    pane.appendChild(area);
  }
  pane.appendChild(el('h3', null, 'Sources'));
  pane.appendChild(sourceListItems(t.sources));
  const caveat = el('p', 'empty-note', 'Guides are written in our own words for this guide. Where the published guides have not confirmed a step yet, the guide says so instead of guessing.');
  pane.appendChild(caveat);
}

const ROADMAP = [
  {
    stage: 1,
    title: 'Step 1 — Play the story',
    time: '60–80 hours · 19 trophies',
    text: 'Play the five chapters in order and take the optional missions (black icons with pink letters) when they appear — some disappear after a while. While you travel, scan vehicles with WAiNK and study animals through the binoculars: the 100% checklist later wants 200 of 277 vehicles and 100 of 255 animals. Start every stranger chain and character quest when it unlocks; the quest givers return after the story, but the chains have windows tied to story progress. Do the Chapter 1 balcony meditation for Positive Mental Attitude before Chapter 1 ends — it is the one possibly missable trophy. Save manually at the start and end of every chapter: there is no mission replay, and cheats disable trophies and saving.',
  },
  {
    stage: 2,
    title: 'Step 2 — The 100% checklist',
    time: 'About 100 hours · 22 trophies',
    text: 'After the credits, the 100% checklist appears under Progress, then Stats — earlier progress still counts. The thresholds are lenient (roughly 60% of true completion), but they sit above the matching trophies: 300 stunts against the trophy’s 250, 30 races won against 20, 70 of 80 challenges against 50, 15 card sets against 3, and 8 bank vaults against 5. So chase the checklist numbers, not the trophy numbers, and the trophies pop along the way. This is the long grind and the reason A Long Road is the hardest trophy in the set.',
  },
  {
    stage: 3,
    title: 'Step 3 — Cleanup, then platinum',
    time: 'About 10 hours · 12 trophies',
    text: 'Finish the stranger strands, the character quests, and the free-roam trophies: the airport departure, the tank, the showroom smash, the cocktail on Ocean Beach, the bowling alley, and the last of the money trophies (garages, laundering, spending). Check the tracker for anything still unticked, work it in batches by area, and the platinum — Vice Got a Price! — pops with the last one. Total: about 200 hours, one playthrough, no online trophies.',
  },
];

export function renderRoadmap(state, trophies, onSelect) {
  const root = document.getElementById('view-roadmap');
  root.textContent = '';
  const facts = el('div', 'fact-grid');
  const factData = [
    ['4 / 10', 'Estimated difficulty (PowerPyx)'],
    ['~200 hours', 'To the platinum (PowerPyx)'],
    ['1 playthrough', 'No New Game+ needed; no difficulty settings'],
    ['0 online', 'Every trophy is offline single-player'],
    ['1 possibly missable', 'Positive Mental Attitude — see the Missables page'],
    ['5 chapters', 'Story in five chapters, 60–80 hours'],
  ];
  for (const [big, small] of factData) {
    const f = el('div', 'fact');
    f.append(el('b', null, big), el('span', null, small));
    facts.appendChild(f);
  }
  root.appendChild(facts);
  const warn = el('div', 'warn');
  warn.appendChild(el('p', null, 'No mission replay: once a chapter is done you cannot replay its missions, so finish each chapter’s optional content before moving on — and save manually at the start and end of every chapter. Cheats disable trophies and saving, so keep them off for the whole run.'));
  root.appendChild(warn);
  for (const step of ROADMAP) {
    const section = el('section', 'stage');
    const head = el('div', 'stage-head');
    head.append(el('h2', null, step.title), el('span', 'stage-time', step.time));
    section.append(head, el('p', null, step.text));
    const chips = el('div', 'stage-trophies');
    const members = trophies.filter((t) => t.stage === step.stage);
    for (const t of members) {
      const chip = el('button', 'chip' + (isEarned(state, t.id) ? ' done' : '') + (t.missable ? ' missable-chip' : ''), isSpoilerMasked(t, state) ? 'Hidden story trophy' : t.name);
      chip.type = 'button';
      chip.addEventListener('click', () => onSelect(t.id));
      chips.appendChild(chip);
    }
    section.appendChild(chips);
    root.appendChild(section);
  }
  const src = el('p', 'empty-note', 'Roadmap facts: PowerPyx trophy guide & roadmap; CryptoGames (summarising GTABase and PowerPyx). Times are estimates from those guides, not promises.');
  root.appendChild(src);
}

export function renderMissables(state, trophies, onSelect) {
  const root = document.getElementById('view-missables');
  root.textContent = '';
  const hero = el('div', 'missable-hero');
  const pma = trophies.find((t) => t.name === 'Positive Mental Attitude');
  hero.appendChild(el('h2', null, '⚠ The one possibly missable trophy'));
  hero.appendChild(el('p', null, 'Positive Mental Attitude (bronze) — meditate at every spot across Leonida, 18 spots in 10 locations. GTABase and PowerPyx both flag it as the only trophy that may be missable, and both say the same thing is unconfirmed: whether the first meditation counts toward the 18.'));
  const steps = el('ol', 'check-list');
  const stepTexts = [
    'During Chapter 1, after the mission Down to Earth: talk to Lucia in the kitchen in the morning. She says she is going to meditate, then goes to the balcony.',
    'Follow her to the balcony and choose Accept. She shows you how to meditate, and the counter in the Progress menu goes up by 1.',
    'That balcony meditation is reported gone after Chapter 1, so do it while the chapter is still open — even though it is not confirmed that it counts.',
    'The last meditation spot only opens once Jason and Lucia are both playable, after Chapter 2, so keep meditating at every spot you find from then on.',
    'The 100% checklist asks for only 15 of the 18 spots, so this trophy and the checklist count different things — do all 18.',
  ];
  for (const s of stepTexts) steps.appendChild(el('li', null, s));
  hero.appendChild(steps);
  if (pma) {
    const btn = el('button', 'btn', 'Open Positive Mental Attitude in the tracker');
    btn.type = 'button';
    btn.addEventListener('click', () => onSelect(pma.id));
    hero.appendChild(btn);
  }
  root.appendChild(hero);
  const safe = el('section', 'stage');
  safe.appendChild(el('h2', null, 'Everything else: not missable'));
  safe.appendChild(el('p', null, 'PowerPyx and GTABase report no other missable trophy. Story trophies cannot be missed — they pop when the mission or chapter ends — and every side trophy can be earned in free-roam after the story. One caution still applies: a guide notes the stranger mission chains behind five hidden trophies have windows tied to story progress, so start those chains when they unlock rather than leaving them all for after the credits.'));
  safe.appendChild(el('p', null, 'The two things that can lock you out of the platinum are not trophies: the Irredeemable Criminal Profile is permanent, so read the Criminal Profile guide before a rampage; and using any cheat disables trophies and saving.'));
  root.appendChild(safe);
  const list = el('section', 'stage');
  list.appendChild(el('h2', null, 'Missable flags in this guide'));
  const missed = trophies.filter((t) => t.missable);
  const notMissed = trophies.length - missed.length;
  list.appendChild(el('p', null, missed.length + ' flagged as possibly missable, ' + notMissed + ' flagged as safe to earn any time. Flags are built from the official descriptions and the launch guides (PowerPyx, GTABase via CryptoGames), and each flagged trophy carries its warning in its own guide.'));
  root.appendChild(list);
  const src = el('p', 'empty-note', 'Sources: PowerPyx trophy guide & roadmap; CryptoGames (GTABase / PowerPyx).');
  root.appendChild(src);
}

export function renderSources(verified) {
  const root = document.getElementById('view-sources');
  root.textContent = '';
  root.appendChild(el('h2', null, 'Sources & method'));
  root.appendChild(el('p', null, 'Every trophy’s guide in this app is written in our own words for this guide. A source is cited, never copied: the official names and descriptions are the exception, shown as PlayStation publishes them. The app itself fetches nothing — it is static files, and these links open only if you follow them.'));
  const table = document.createElement('table');
  table.className = 'src-table';
  const head = document.createElement('tr');
  head.append(el('th', null, 'Source'), el('th', null, 'What it is used for'));
  table.appendChild(head);
  for (const s of Object.values(SOURCES)) {
    const row = document.createElement('tr');
    const a = document.createElement('a');
    a.href = s.url;
    a.target = '_blank';
    a.rel = 'noopener';
    a.textContent = s.label;
    const cell = document.createElement('td');
    cell.appendChild(a);
    row.append(cell, el('td', null, s.what));
    table.appendChild(row);
  }
  root.appendChild(table);
  root.appendChild(el('h3', null, 'How the list was verified'));
  root.appendChild(el('p', null, 'On 20 November 2026 the 55 names, descriptions and grades were checked against Exophase and PSNProfiles, and the two agreed on every name and description. Grades are 1 platinum, 2 gold, 6 silver and 46 bronze; 28 trophies are hidden on PlayStation until earned; there are no online trophies. The PSN progress counts (such as 0/42 Shooting Range challenges) come from PSNProfiles.'));
  root.appendChild(el('h3', null, 'What is not yet confirmed'));
  root.appendChild(el('p', null, 'Five trophies are still unconfirmed in the published guides — In The Beginning…, Capital Offense, Bad Luck, I Guess, The Truth Is Out There and Ten Pin — plus which animal Fair Game wants. Their guides say so plainly and give the best reported reading with its source, instead of inventing a step. As more players verify them, the guides can be updated.'));
  if (verified && verified.note) {
    root.appendChild(el('p', 'empty-note', verified.note));
  }
}

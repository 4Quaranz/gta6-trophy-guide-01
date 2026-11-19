// Rendering for the Leonida Ledger: the checklist, the trophy detail pane, the
// roadmap, the missables page and the about page. All markup is built with
// DOM methods and textContent, so a trophy name can never inject HTML.
import { KIND_LABELS, MISSABLE_INTRO, ROADMAP } from './data.js';

export function escapeTargetLabel(trophy) {
  if (!trophy.target) return null;
  if (trophy.id === 48) return 'PSN tracks 500 choices';
  if (trophy.id === 52) return '$250,000 to launder';
  if (trophy.id === 53) return '$100,000 to spend';
  return `Count: ${trophy.target}`;
}

export function spoilerHidden(trophy, spoilerOn, earned) {
  // The spoiler setting hides the name and description of every trophy that
  // PlayStation itself hides (secret) until it is earned.
  return spoilerOn && trophy.secret && !earned.has(trophy.id);
}

function tagElement(text, className) {
  const span = document.createElement('span');
  span.className = `tag ${className || ''}`.trim();
  span.textContent = text;
  return span;
}

function gradeWord(trophy) {
  const span = document.createElement('span');
  span.className = `grade-word ${trophy.grade}`;
  span.textContent = trophy.grade;
  return span;
}

export function trophyRow(trophy, state, onToggle, onSelect, selectedId) {
  const row = document.createElement('article');
  row.className = 'trophy';
  row.dataset.id = String(trophy.id);
  if (state.earned.has(trophy.id)) row.classList.add('earned');
  if (selectedId === trophy.id) row.classList.add('selected');

  const box = document.createElement('input');
  box.type = 'checkbox';
  box.checked = state.earned.has(trophy.id);
  box.setAttribute('aria-label', `Mark ${trophy.name} as earned`);
  box.addEventListener('change', (event) => {
    event.stopPropagation();
    onToggle(trophy.id, box.checked);
  });
  box.addEventListener('click', (event) => event.stopPropagation());
  row.appendChild(box);

  const dot = document.createElement('span');
  dot.className = `grade-dot grade-${trophy.grade}`;
  dot.title = trophy.grade;
  row.appendChild(dot);

  const body = document.createElement('div');
  const name = document.createElement('p');
  name.className = 't-name';
  if (spoilerHidden(trophy, state.spoiler, state.earned)) {
    name.textContent = 'Hidden trophy — earn it to reveal';
    name.classList.add('hidden-name');
  } else {
    name.textContent = trophy.name;
  }
  body.appendChild(name);

  const desc = document.createElement('p');
  desc.className = 't-desc';
  desc.textContent = spoilerHidden(trophy, state.spoiler, state.earned)
    ? 'A hidden story trophy. Its name and description stay hidden until you earn it.'
    : trophy.description;
  body.appendChild(desc);

  const meta = document.createElement('div');
  meta.className = 't-meta';
  meta.appendChild(gradeWord(trophy));
  meta.appendChild(tagElement(KIND_LABELS[trophy.kind] || trophy.kind, ''));
  if (trophy.secret) meta.appendChild(tagElement('Hidden', 'secret'));
  if (trophy.missable) meta.appendChild(tagElement('Missable', 'missable'));
  const targetLabel = escapeTargetLabel(trophy);
  if (targetLabel) meta.appendChild(tagElement(targetLabel, 'target'));
  body.appendChild(meta);
  row.appendChild(body);

  const points = document.createElement('span');
  points.className = 't-points';
  points.textContent = `${trophy.points} pts`;
  row.appendChild(points);

  row.addEventListener('click', () => onSelect(trophy.id));
  return row;
}

export function renderChecklist(view, trophies, state, handlers) {
  view.replaceChildren();
  const head = document.createElement('div');
  head.className = 'list-head';
  const title = document.createElement('h2');
  title.textContent = 'Trophy checklist';
  head.appendChild(title);
  const sub = document.createElement('p');
  sub.textContent = `${trophies.length} trophies shown · tick one off when you earn it · tap a trophy to read its guide.`;
  head.appendChild(sub);
  view.appendChild(head);

  if (trophies.length === 0) {
    const empty = document.createElement('p');
    empty.className = 'empty';
    empty.textContent = 'No trophies match this filter and search. Try clearing the search or picking another filter.';
    view.appendChild(empty);
    return;
  }
  for (const trophy of trophies) {
    view.appendChild(trophyRow(trophy, state, handlers.onToggle, handlers.onSelect, handlers.selectedId));
  }
}

export function renderDetail(detail, trophy, state, sourceNames) {
  detail.replaceChildren();
  if (!trophy) {
    const card = document.createElement('div');
    card.className = 'detail-card detail-empty';
    const heading = document.createElement('h2');
    heading.textContent = 'Pick a trophy';
    card.appendChild(heading);
    const text = document.createElement('p');
    text.textContent = 'Tap any trophy in the checklist to read its guide, its missable note and its sources here.';
    card.appendChild(text);
    detail.appendChild(card);
    return;
  }
  const card = document.createElement('div');
  card.className = 'detail-card';
  const heading = document.createElement('h2');
  heading.textContent = trophy.name;
  card.appendChild(heading);
  const official = document.createElement('p');
  official.className = 'official';
  official.textContent = `Official: “${trophy.description}” — ${trophy.grade}, ${trophy.points} points${trophy.secret ? ', hidden until earned' : ''}.`;
  card.appendChild(official);

  if (trophy.missable && trophy.missableNote) {
    const callout = document.createElement('p');
    callout.className = 'missable-callout';
    callout.textContent = `Missable — ${trophy.missableNote}`;
    card.appendChild(callout);
  }

  const guideHeading = document.createElement('h3');
  guideHeading.textContent = 'Guide';
  card.appendChild(guideHeading);
  const guide = document.createElement('p');
  guide.className = 'guide-text';
  guide.textContent = trophy.guide;
  card.appendChild(guide);

  const sourceHeading = document.createElement('h3');
  sourceHeading.textContent = 'Sources';
  card.appendChild(sourceHeading);
  const list = document.createElement('ul');
  list.className = 'source-list';
  for (const key of trophy.sources || ['exophase']) {
    const item = document.createElement('li');
    item.textContent = sourceNames[key] || key;
    list.appendChild(item);
  }
  const note = document.createElement('li');
  note.textContent = 'Guide advice: our own reading of the official description — not yet checked in the game.';
  list.appendChild(note);
  card.appendChild(list);

  const nav = document.createElement('div');
  nav.className = 'detail-nav';
  const prev = document.createElement('button');
  prev.type = 'button';
  prev.textContent = '← Previous';
  prev.addEventListener('click', () => detail.dispatchEvent(new CustomEvent('detail-prev', { bubbles: true })));
  const next = document.createElement('button');
  next.type = 'button';
  next.textContent = 'Next →';
  next.addEventListener('click', () => detail.dispatchEvent(new CustomEvent('detail-next', { bubbles: true })));
  nav.appendChild(prev);
  nav.appendChild(next);
  card.appendChild(nav);
  detail.appendChild(card);
}

export function renderRoadmap(view, trophies, state) {
  view.replaceChildren();
  const head = document.createElement('div');
  head.className = 'list-head';
  const title = document.createElement('h2');
  title.textContent = 'Roadmap to the platinum';
  head.appendChild(title);
  const intro = document.createElement('p');
  intro.className = 'page-intro';
  intro.textContent = 'Four stages, in order, built from the official trophy descriptions. Do the story first, the stranger strands next, the long counts alongside everything, and the money and cleanup last — the platinum is the last thing you earn, never the first.';
  head.appendChild(intro);
  view.appendChild(head);

  for (const stage of ROADMAP) {
    const box = document.createElement('section');
    box.className = 'stage';
    const when = document.createElement('p');
    when.className = 'stage-when';
    when.textContent = `Stage ${stage.stage} · ${stage.when}`;
    box.appendChild(when);
    const heading = document.createElement('h3');
    heading.textContent = stage.title;
    box.appendChild(heading);
    const text = document.createElement('p');
    text.textContent = stage.text;
    box.appendChild(text);
    const list = document.createElement('ul');
    for (const item of stage.items) {
      const li = document.createElement('li');
      li.textContent = item;
      list.appendChild(li);
    }
    box.appendChild(list);
    const earnedInStage = stage.items.length;
    const count = document.createElement('p');
    count.className = 'stage-count';
    count.textContent = `${earnedInStage} guide steps in this stage — tick them off in the tracker as you go.`;
    box.appendChild(count);
    view.appendChild(box);
  }
}

export function renderMissables(view, trophies, state, handlers) {
  view.replaceChildren();
  const head = document.createElement('div');
  head.className = 'list-head';
  const title = document.createElement('h2');
  title.textContent = 'Missable trophies';
  head.appendChild(title);
  const intro = document.createElement('p');
  intro.className = 'page-intro';
  intro.textContent = MISSABLE_INTRO;
  head.appendChild(intro);
  view.appendChild(head);

  const warn = document.createElement('p');
  warn.className = 'warn-box';
  warn.textContent = 'Rule of thumb: do every trophy below before the final mission, and keep a save before any mission that looks like a one-time moment.';
  view.appendChild(warn);

  const missable = trophies.filter((t) => t.missable);
  const earnedMissable = missable.filter((t) => state.earned.has(t.id)).length;
  const count = document.createElement('p');
  count.className = 'page-intro';
  count.textContent = `${earnedMissable} of ${missable.length} missable trophies earned.`;
  view.appendChild(count);
  for (const trophy of missable) {
    view.appendChild(trophyRow(trophy, state, handlers.onToggle, handlers.onSelect, handlers.selectedId));
  }
}

export function renderAbout(view, sourceNames) {
  view.replaceChildren();
  const head = document.createElement('div');
  head.className = 'list-head';
  const title = document.createElement('h2');
  title.textContent = 'About & sources';
  head.appendChild(title);
  view.appendChild(head);

  const cards = [
    {
      heading: 'What this guide is',
      text: 'An unofficial, fan-made trophy guide and tracker for Grand Theft Auto VI on PlayStation 5. It covers all 55 official trophies with their names, descriptions and grades as PlayStation publishes them, a checklist saved in your browser, a roadmap to the platinum, missable flags and a guide for every trophy in our own words.',
    },
    {
      heading: 'How it was built',
      text: 'The trophy list was checked against the official list on Exophase and the PSN progress counts on PSNProfiles, both read on 19 November 2026: 55 trophies, 1 platinum, 2 gold, 6 silver and 46 bronze, 28 of them hidden on PlayStation until earned. The guides are our own advice read from the official descriptions. The game released the same day, so where an exact in-game spot is not yet verified, the guide says so instead of inventing one.',
    },
    {
      heading: 'Your progress stays yours',
      text: 'Progress is saved in this browser only, in localStorage. Export writes a JSON file you keep; import reads one back. The app makes no network request at all and works with the network off.',
    },
    {
      heading: 'Not affiliated',
      text: 'This guide is not affiliated with Rockstar Games, Take-Two Interactive or PlayStation. No Rockstar logo, official artwork, box art or screenshot of the game is used anywhere in it — the look is our own.',
    },
  ];
  for (const card of cards) {
    const box = document.createElement('section');
    box.className = 'about-card';
    const heading = document.createElement('h3');
    heading.textContent = card.heading;
    box.appendChild(heading);
    const text = document.createElement('p');
    text.textContent = card.text;
    box.appendChild(text);
    view.appendChild(box);
  }

  const sources = document.createElement('section');
  sources.className = 'about-card';
  const heading = document.createElement('h3');
  heading.textContent = 'Sources';
  sources.appendChild(heading);
  const list = document.createElement('ul');
  for (const [key, name] of Object.entries(sourceNames)) {
    const item = document.createElement('li');
    item.textContent = name;
    list.appendChild(item);
  }
  sources.appendChild(list);
  view.appendChild(sources);
}

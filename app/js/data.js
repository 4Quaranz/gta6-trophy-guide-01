// Shared labels and the platinum roadmap. The roadmap is built from the
// official trophy descriptions alone: which chapters and missions come first,
// which stranger strands and collectibles follow, and what is left for cleanup.
// No step here claims a location the official list does not give.
export const KIND_LABELS = {
  story: 'Story',
  mission: 'Mission',
  stranger: 'Stranger',
  collectible: 'Collectible',
  activity: 'Activity',
  combat: 'Combat',
  money: 'Money',
  exploration: 'Exploration',
  moment: 'Moment',
  completion: 'Completion',
};

export const FILTERS = [
  { id: 'all', label: 'All 55' },
  { id: 'story', label: 'Story' },
  { id: 'missable', label: 'Missable' },
  { id: 'collectible', label: 'Collectibles' },
  { id: 'activity', label: 'Activities' },
  { id: 'stranger', label: 'Strangers' },
  { id: 'money', label: 'Money' },
  { id: 'moment', label: 'Moments' },
  { id: 'earned', label: 'Earned' },
  { id: 'todo', label: 'Still to earn' },
];

// kind -> filter id mapping used by the checklist filter.
export function matchesFilter(trophy, filter, earned) {
  switch (filter) {
    case 'all':
      return true;
    case 'missable':
      return trophy.missable === true;
    case 'earned':
      return earned.has(trophy.id);
    case 'todo':
      return !earned.has(trophy.id);
    case 'story':
      return trophy.kind === 'story' || trophy.kind === 'mission';
    default:
      return trophy.kind === filter;
  }
}

export const ROADMAP = [
  {
    stage: 1,
    title: 'Play the story, chapters 1–4',
    when: 'First playthrough',
    text: 'Follow the main story from Gone Fishing through Chapter 4. This earns the six chapter trophies, the six named-mission trophies and the story moments that only happen on the main path.',
    items: [
      'Just Like Paradise — finish Gone Fishing, the opening mission.',
      'Paradise Lost, T**s Ass Drug Money, Vice City, Baby!, Top Of The World, Ma — one per chapter.',
      'Trust, Break the Bank, Family Matters, DWNFALL, Hi-Jacked, Snow Storm — the named story missions.',
      'Do the one-time moments as they appear: In The Beginning… on Ocean Beach, and any partnership scene that looks like Personal Best.',
    ],
  },
  {
    stage: 2,
    title: 'Stranger strands and the hunt',
    when: 'During and after the story',
    text: 'Stranger missions appear across Leonida as side content. Finish all five named strands and three more, and the silver for 8 strands follows.',
    items: [
      'Road to Rehabilitation (Andy), This Was No Boat Accident (Kenton), The Lone Rider (Billy).',
      'Supply & Demand (Randy), Spin On This! (Tyrone), Fair Game — the unique-animal hunt for Bret.',
      'Strangers & Freaks (silver) — complete 8 stranger strands in total.',
    ],
  },
  {
    stage: 3,
    title: 'Activities, collectibles and the map',
    when: 'Free roam, alongside the story',
    text: 'The long counts. Start them early — a few spots in every area you visit — so none of them is a cold 100-item grind at the end.',
    items: [
      'The Shootist (silver) — gold medals in all 42 Shooting Range challenges.',
      'Top Fun — win a drone race at all 14 locations; Earn Cash, Not Kudos — win 20 different races.',
      'Positive Mental Attitude — meditate at all 18 spots; Don’t Touch My Deck (silver) — 3 card sets.',
      'You WAiNKer! (silver) — WAiNK It at 100 locations; Whip It Good — discover 100 vehicles.',
      'The Goodtime State — explore all 52 areas of Leonida; Cunning Stunts (silver) — 250 stunts.',
      'Master of None — try every activity type once; One Last Thing — complete 50 challenges.',
    ],
  },
  {
    stage: 4,
    title: 'Money, crime and cleanup',
    when: 'Late game, after the story',
    text: 'Spend and steal with a full map open. Bank the money trophies, then check the in-game stats for what 100% completion still needs.',
    items: [
      'Dime on the Dollar — launder $250,000 of Marked Bills; Treat Yo Self — spend $100,000 in shops.',
      'Little Boxes — buy all 8 garage properties; Maximum Withdrawal (silver) — rob 5 bank vaults.',
      'A Classic Blitz Play — rob an armored truck; Pest Control — rob one illegal operation per gang (9).',
      'Sneakthief — rob a jewelry store undetected; Gunslinger — 5 takedowns in one Combat Focus.',
      'A Long Road (gold) — 100% completion. Vice Got a Price! (platinum) — the other 54, done.',
    ],
  },
];

export const MISSABLE_INTRO =
  'The game is a day old and mission replay is not yet confirmed in play, so these flags are our reading of the official descriptions: trophies tied to a single story moment or a one-time event. A trophy marked missable is one to do deliberately before the final mission — not a guarantee it cannot be replayed. Each trophy below carries its own note.';

// The full point value of the list: 300 platinum + 2 x 90 gold + 6 x 30 silver
// + 46 x 15 bronze = 1,350 points.
export const TOTAL_POINTS = 1350;

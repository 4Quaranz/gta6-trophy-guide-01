// Source catalog: every guide cites these by key. Names and links are shown
// beside each trophy's guide; the app fetches nothing from them at run time.
export const SOURCES = {
  exophase: {
    label: 'Exophase — official trophy list',
    url: 'https://www.exophase.com/game/grand-theft-auto-vi-psn/trophies/',
    what: 'Trophy name, official description and grade, as PlayStation publishes them.',
  },
  psnprofiles: {
    label: 'PSNProfiles — GTA VI trophy list',
    url: 'https://psnprofiles.com/trophies/43531-grand-theft-auto-vi',
    what: 'The same 55 names and descriptions, plus the progress count PSN tracks for each counted trophy (for example 0/42 Shooting Range challenges).',
  },
  powerpyx: {
    label: 'PowerPyx — GTA 6 Trophy Guide & Roadmap',
    url: 'https://www.powerpyx.com/gta-6-grand-theft-auto-vi-trophy-guide-roadmap/',
    what: 'Roadmap facts: difficulty 4/10, about 200 hours, one playthrough, no mission replay, the one possibly missable trophy, and the 100% checklist thresholds.',
  },
  cryptogames: {
    label: 'CryptoGames — GTA 6 Trophies and Achievements',
    url: 'https://cryptogames.gg/gta-6-trophies-achievements-full-list/',
    what: 'Summary of the launch guides (GTABase and PowerPyx): which trophies are hidden, the hard-trophy tips, and the trophy goals against the 100% checklist.',
  },
  gtazone: {
    label: 'GTA Zone — GTA 6 Trophy List',
    url: 'https://gta-zone.com/news/gta-6-trophies-achievements/',
    what: 'Cross-check of the 55 names and the roadmap split (story, checklist, cleanup).',
  },
};

export function sourceLink(key) {
  const s = SOURCES[key];
  if (!s) return null;
  return s;
}

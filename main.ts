// Leonida Ledger — the hand-in program for the gta6-trophy-guide-01 entry.
//
// Node 22, standard library only. It copies this repository's app/ (the static
// guide: index.html, its modules and styles, and app/data/trophies.json) and
// screenshots/ into the output directory, then writes /output/dossier.json
// with the kit's vendored library, buildDossier from vendor/makefun-frontend.ts.
// vendor/makefun-frontend.ts is the kit's copy and is left untouched: the
// scorer rebuilds the dossier with its own identical copy and compares bytes.
//
// Outside the grader, MAKEFUN_OUTPUT_DIR stands in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
//
// The program is deterministic: the same repository always writes the same
// bytes, so running it twice gives identical dossiers.

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

// The repository root: the folder this file lives in.
const repoRoot = fileURLToPath(new URL('.', import.meta.url));

// The grader hands us a writable /output; locally MAKEFUN_OUTPUT_DIR is used.
const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

function copyTree(source, destination) {
  mkdirSync(destination, { recursive: true });
  cpSync(source, destination, { recursive: true });
}

mkdirSync(outputDir, { recursive: true });
copyTree(join(repoRoot, 'app'), join(outputDir, 'app'));
copyTree(join(repoRoot, 'screenshots'), join(outputDir, 'screenshots'));

// The scorer's own caps for this bounty (reference/gate.json): the text cap
// shapes the dossier's bytes; the others refuse an entry the scorer would
// refuse anyway — more than 4 screenshots, one over 256 KiB, or app/ past
// 993 files and directories / 48 MiB. app/ shares /output's own cap of 1,000
// entries and 64 MiB with screenshots/ and dossier.json, so leave them room.
const dossier = buildDossier(outputDir, {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  app_max_files: 993,
  app_max_bytes: 50331648,
});

writeFileSync(join(outputDir, 'dossier.json'), dossier);
console.log(`Leonida Ledger handed in: ${outputDir}/dossier.json`);

// Leonida Ledger — hand-in program (Node 22, standard library only).
//
// The guide itself is plain static files under app/: index.html opens in a
// desktop browser, its modules and styles live beside it, and the trophy
// list is app/data/trophies.json. It loads nothing over the network, so it
// works with the network off. The screenshots in screenshots/ are real
// renders of that app, taken in Chromium at 1280x800.
//
// This program hands the entry in: it copies app/ and screenshots/ from
// beside this file into the output directory and writes dossier.json with
// the kit's vendored make.fun library (vendor/makefun-frontend.ts, kept
// unchanged — the scorer rebuilds the dossier with its own copy and the two
// must match byte for byte).
//
// Outside the grader, MAKEFUN_OUTPUT_DIR stands in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const here = fileURLToPath(new URL('.', import.meta.url));
const out = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

mkdirSync(out, { recursive: true });
cpSync(join(here, 'app'), join(out, 'app'), { recursive: true });
mkdirSync(join(out, 'screenshots'), { recursive: true });
if (existsSync(join(here, 'screenshots'))) {
  cpSync(join(here, 'screenshots'), join(out, 'screenshots'), { recursive: true });
}

// The gate's caps, as the kit's rules state them: at most 4 screenshots of
// at most 256 KiB each, app/ at most 993 files and directories and 48 MiB,
// and the dossier text at most 163,840 bytes.
writeFileSync(
  join(out, 'dossier.json'),
  buildDossier(out, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    app_max_files: 993,
    app_max_bytes: 50331648,
  }),
);

#!/usr/bin/env bash
# Makes the itch.io page art from the live game: a cover, a banner, a page background and an embed background,
# in dist/itch-art/out. Captures in-game 3D scenes (software WebGL, so it's slow: about half an hour), then lays the
# title over them in the game's own Cinzel font. Needs the Playwright install from tools/tests and a built itch zip.
#   bash tools/itch-art/make.sh              capture everything, then compose
#   bash tools/itch-art/make.sh compose      compose again from the last capture
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
ART="$ROOT/dist/itch-art"; mkdir -p "$ART"
ZIP="$(ls -t "$ROOT"/dist/depthcrawl-*-itch.zip 2>/dev/null | head -1 || true)"
[ -n "$ZIP" ] || bash "$ROOT/tools/build-itch.sh"
ZIP="$(ls -t "$ROOT"/dist/depthcrawl-*-itch.zip | head -1)"
rm -rf "$ART/fonts"; (cd "$ART" && unzip -o -q "$ZIP" 'fonts/*')
[ "${1:-}" = "compose" ] || node "$ROOT/tools/itch-art/shoot.js"
node "$ROOT/tools/itch-art/compose.js"
ls -l "$ART/out"

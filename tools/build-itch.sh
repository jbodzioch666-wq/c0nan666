#!/usr/bin/env bash
# Builds an itch.io-ready HTML5 zip of Depthcrawl: index.html plus a local
# copy of three.js and the two web fonts, so the game never depends on a
# CDN at runtime (and plays fully offline). Needs curl, python3 and zip.
#   tools/build-itch.sh            -> dist/depthcrawl-itch.zip, or dist/depthcrawl-<version>-itch.zip
#                                     when the page defines const GAME_VERSION = '...'
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
OUT="$ROOT/dist"
STAGE="$(mktemp -d)"
trap 'rm -rf "$STAGE"' EXIT
mkdir -p "$STAGE/fonts" "$STAGE/licenses" "$OUT"

THREE_VER=0.149.0
FONTS_CSS='https://fonts.googleapis.com/css2?family=Cinzel:wght@500;600;700&family=JetBrains+Mono:ital,wght@0,400;0,500;0,600;0,700;1,400&display=swap'
UA='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36'

# the exact three.js build the page loads, straight from its npm package
curl -fsSL "https://registry.npmjs.org/three/-/three-$THREE_VER.tgz" | tar -xz -C "$STAGE" package/build/three.min.js package/LICENSE
mv "$STAGE/package/build/three.min.js" "$STAGE/three.min.js"; mv "$STAGE/package/LICENSE" "$STAGE/licenses/three.js-LICENSE.txt"; rm -rf "$STAGE/package"
curl -fsSL -A "$UA" "$FONTS_CSS" -o "$STAGE/fonts/google.css"
curl -fsSL "https://raw.githubusercontent.com/google/fonts/main/ofl/cinzel/OFL.txt" -o "$STAGE/licenses/Cinzel-OFL.txt"
curl -fsSL "https://raw.githubusercontent.com/google/fonts/main/ofl/jetbrainsmono/OFL.txt" -o "$STAGE/licenses/JetBrainsMono-OFL.txt"

python3 - "$ROOT/depthcrawl.html" "$STAGE" "$THREE_VER" "$FONTS_CSS" <<'PY'
import hashlib, os, re, sys, urllib.request
src, stage, ver, fonts_css = sys.argv[1:5]
fd = os.path.join(stage, 'fonts')
css = open(os.path.join(fd, 'google.css')).read()
for u in sorted(set(re.findall(r'url\((https://[^)]+)\)', css))):
    fam = 'cinzel' if '/cinzel/' in u else 'jetbrainsmono'
    name = f"{fam}-{hashlib.md5(u.encode()).hexdigest()[:8]}.woff2"
    urllib.request.urlretrieve(u, os.path.join(fd, name))
    css = css.replace(u, name)
open(os.path.join(fd, 'fonts.css'), 'w').write(css)
os.remove(os.path.join(fd, 'google.css'))

html = open(src).read()
cdn = f'https://cdn.jsdelivr.net/npm/three@{ver}/build/three.min.js'
link = f'<link rel="stylesheet" href="{fonts_css}">'
pre = '<link rel="preconnect" href="https://fonts.googleapis.com">\n'
for needle in (cdn, link, pre):
    if needle not in html: sys.exit(f'build-itch: expected to find {needle!r} in depthcrawl.html')
html = html.replace(cdn, 'three.min.js').replace(link, '<link rel="stylesheet" href="fonts/fonts.css">').replace(pre, '')
if re.search(r'(src|href)="https?://', html): sys.exit('build-itch: an external script/stylesheet is still referenced')
open(os.path.join(stage, 'index.html'), 'w').write(html)
PY

VER="$(grep -oE "const GAME_VERSION = '[A-Za-z0-9._-]+'" "$ROOT/depthcrawl.html" | head -1 | sed -E "s/.*'(.*)'/\1/" || true)"
ZIP="$OUT/depthcrawl${VER:+-$VER}-itch.zip"
rm -f "$ZIP"
(cd "$STAGE" && zip -qr9 "$ZIP" index.html three.min.js fonts licenses)
echo "built $ZIP ($(du -h "$ZIP" | cut -f1))"

#!/usr/bin/env bash
#
# Stages a built site into the layout the gh-pages branch expects.
#
#   usage: scripts/stage-docs-deploy.sh <base-path> <output-dir>
#   e.g.   scripts/stage-docs-deploy.sh /docs/v3.8.0 publish
#
# The build must already exist, produced with VITE_DOCS_BASE_PATH=<base-path>.
#
# Why the paths shuffle: React Router writes prerendered pages under a directory
# matching the mount point (build/client/docs/v3.8.0/...), while Vite writes
# static assets at the build root regardless. GitHub Pages then serves this
# repo's branch under an automatic "/docs/" project-site prefix, so that leading
# segment must be stripped here — GitHub supplies it again at request time.
set -euo pipefail

BASE_PATH="${1:?usage: stage-docs-deploy.sh <base-path> <output-dir>}"
OUT_ROOT="${2:?usage: stage-docs-deploy.sh <base-path> <output-dir>}"

BUILD="build/client"
[ -d "$BUILD" ] || { echo "error: $BUILD not found — run the build first" >&2; exit 1; }

# "/docs/v3.8.0" -> src "docs/v3.8.0", dest "v3.8.0"   ("/docs" -> src "docs", dest "")
SRC_PREFIX="${BASE_PATH#/}"
DEST_PREFIX="${SRC_PREFIX#docs}"
DEST_PREFIX="${DEST_PREFIX#/}"

SRC="$BUILD/$SRC_PREFIX"
[ -d "$SRC" ] || { echo "error: $SRC not found — was the build run with VITE_DOCS_BASE_PATH=$BASE_PATH?" >&2; exit 1; }

OUT="$OUT_ROOT/$DEST_PREFIX"
mkdir -p "$OUT"

# 1. Prerendered pages for this mount point.
cp -r "$SRC/." "$OUT/"

# 2. Static assets and root resources, which live at the build root. Skip the
#    pages dir (copied above) and the bare "/" route's index.html, so it can't
#    clobber this mount point's own home page.
for entry in "$BUILD"/*; do
  name="$(basename "$entry")"
  case "$name" in
    docs | index.html) continue ;;
  esac
  cp -r "$entry" "$OUT/"
done

echo "staged $BASE_PATH -> ${OUT_ROOT}/${DEST_PREFIX:-<root>}"

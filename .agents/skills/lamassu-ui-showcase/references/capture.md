# OpenShowcase capture and integration

Read this when producing or updating a demo. Always inspect the installed CLI
help and recorder README first; flags and extension internals can change.

## Flow and repeated runs

1. Install the recorder and Chromium in an owned temporary directory. Use a
   temporary profile through `--profile`; do not reuse the user's browser
   profile implicitly. Put the `.flow.json` in the intended persistent source
   location, or draft it temporarily and copy it there after validation.
2. Inspect the UI with the recorder and build steps from actual accessible
   names. Use `wait` for an observable target after navigation; for example,
   wait for the create button before clicking it. `inspect` can return while a
   page still displays “Loading Page...”; URL and title alone do not mean it is
   ready. Avoid relying solely on fixed delays.
3. Check the complete flow with `inspect`. It performs real clicks and fills:
   a CA or other entity created by an inspection remains on the server. Ensure
   the next `record` run has a unique target/name or reset only owned demo
   state, so exact selectors do not match old results. Confirm the final state,
   not just “all steps ran”. Apply the popup rule below to every step.
   **Run `inspect` on a temporary copy of the flow with a different entity
   name** (for example `Acme Inspect CA`) and record the real flow afterwards:
   exact-name selectors then never match two entities. If a duplicate already
   exists, remove only entities you created through the API (for a CA:
   `POST /api/ca/v1/cas/<id>/status` with
   `{"status":"REVOKED","revocation_reason":"Unspecified"}`, then
   `DELETE /api/ca/v1/cas/<id>`); never touch sample data.
   **Prerequisite data** that the sample data does not contain (for example the
   enrollment and bootstrap CAs used by a registration-authority demo) is
   created through the HTTP API (`POST /api/ca/v1/cas`; see
   `docs/ca-openapi.yaml` in the v4 clone) before inspecting, with the exact
   names the documentation page mentions.
4. Record to a temporary `.osrec`, export to a temporary `.openshowcase` or
   `.zip`, and inspect the result. If the user edits the recording in the
   editor, those changes live in its browser storage, not in the original
   `.osrec`: export through the editor to retain them. If no edit was made,
   CLI export is suitable. Do not add a review approval gate unless required
   by the user or higher-priority instructions.

## Popup rule: every step has a popup

**Every user-visible step must have a popup (hotspot with a label).** No step
may be left silent in the final demo.

- In the flow: every `click` that changes what the user sees has a non-empty
  `tooltip` that explains *what* is done and *why*. Never use
  `"hotspot": false` to hide a user action.
- **`fill` does not accept a popup.** The recorder performs an internal click
  with no popup before typing. To give a field a popup, add a `click` on the
  same target with a `tooltip` immediately **before** the `fill` (the field is
  then already focused and no silent click is added).
- **Dropdown options (e.g. MUI `Select` options) do not produce a recorded
  click**, so they can never carry a popup: a tooltip on them is silently
  lost. Put the popup on the click that **opens** the list and state the value
  to choose ("Open the key algorithm list and choose ECDSA."). Leave the
  option click without `tooltip`. Items inside dialogs/pickers (list rows,
  buttons) are recorded normally and keep their own tooltip.
  Only `wait` steps, `fill` steps and dropdown-option clicks may omit a
  `tooltip`.
- A form with several fields (e.g. the certificate subject) needs one popup
  per field or per logical group of fields, not a silent typing sequence.
- In the exported `steps.json`: `video` steps are only the playback that
  connects two popups. Never leave a stretch of video that performs a user
  action with no popup, and never end a demo on an action without a popup. Add a
  popup on the final result (e.g. the created certificate) too.
- Popups are only supported on `photo` steps (a still frame plus `hotspot`).
  If an action has no popup, add a `photo` step at that moment with a hotspot
  and a label; do not try to attach a hotspot to a `video` step.
- Write the label in every supported locale. Labels are short, one sentence,
  and describe the action or its purpose; never leave `label` empty.

Verify mechanically after export. Every flow tooltip must appear as a popup
label in the exported `steps.json` (a missing one means the popup was silently
dropped), and no photo step may lack a label:

```bash
python3 -I - path/to/flow.json path/to/steps.json <<'PY'
import json, sys
flow = json.load(open(sys.argv[1])); d = json.load(open(sys.argv[2]))
tips = [s['tooltip'] for s in flow['steps'] if s.get('tooltip')]
labels = [(s.get('hotspot') or {}).get('label') for s in d['steps'] if s['type'] == 'photo']
missing = [t for t in tips if t not in labels]
print('photos', len(labels), 'tooltips', len(tips))
if missing or not all(labels):
    raise SystemExit(f'Dropped popups: {missing}; photo steps without label: {[i for i,l in enumerate(labels) if not l]}')
print('OK')
PY
grep -c '"hotspot": false' path/to/flow.json   # must print 0
```

Fix failures (add a tooltip, split steps, move the popup to the opening click)
and record again before delivery.

## Detailed guide beside the video

Every demo ships a **detailed guide** that the site shows to the right of the
video (below it on narrower screens) and keeps in sync with the current popup.
A popup is one short sentence; the guide explains the nuance behind it.

- Create `guide.<locale>.json` next to `<locale>.json` for **every supported
  locale**: `{ "steps": [ { "title": "...", "body": "...", "note": "..." } ] }`.
- There is **exactly one entry per popup, in the same order as the popups** of
  the exported locale JSON (the n-th photo step with a hotspot). Re-recording
  a demo or adding a popup means updating both guides to match.
- `title`: 2–5 words naming the step. `body`: 1–3 sentences saying what the
  step does and why. `note` (optional): one caveat, risk or nuance a reader
  could miss (irreversibility, units, a dependency, what is *not* done).
- Do not repeat the popup text. Add information: meaning of a field, accepted
  formats, security or lifecycle consequences, what to verify afterwards.
- **Only state facts you verified.** Take them from the documentation pages of
  this repository, the product behaviour you observed while recording, or
  standards (RFC 5280, ISO 3166). If unsure, leave it out; never invent
  product behaviour. Translate into every locale (Spanish uses the register of
  the existing pages) and keep product UI labels (button and tab names) as shown.
- Check the counts after every export:

  ```bash
  python3 -I - public/demos/<name> <<'PY'
  import json, sys
  root = sys.argv[1]
  for loc in ('en', 'es'):
      d = json.load(open(f'{root}/{loc}.json'))
      g = json.load(open(f'{root}/guide.{loc}.json'))['steps']
      n = sum(1 for s in d['steps'] if s['type'] == 'photo' and s.get('hotspot'))
      assert n == len(g), f'{loc}: {n} popups but {len(g)} guide entries'
      assert all(e['title'].strip() and e['body'].strip() for e in g)
  print('guide OK')
  PY
  ```

The site component (`app/components/openshowcase-demo.tsx`) loads the guide by
this name automatically; no page or component changes are needed for a new
demo besides registering its wrapper component.

## Export assets: keep the stills

The `step-N.avif` stills (and any `subject-*.png`-style extras) are **required
assets, not leftovers**. Each one is the backdrop a popup is drawn over: a
`photo` step in the locale JSON cannot display without it, and most of these
frames are not contained in `recording.mp4`, so they cannot be regenerated from
the video. **Never delete, rename or "clean up" a `step-N.avif` or other still
that a locale JSON references.** Deleting one breaks the demo.

1. Copy the **entire** `assets/` folder of the export (video plus every still)
   together with the locale JSON files into the destination. Do not trim it
   by hand.
2. The only files that may be removed are those that **no locale JSON
   references** (leftovers from earlier takes, `.osrec`, scratch screenshots).
   Verify before removing anything; remove only what the check lists under
   `Unreferenced`:

   ```bash
   python3 - public/demos/<name> <<'PY'
   import json, os, sys
   root = sys.argv[1]
   refs = set()
   for f in os.listdir(root):
       if f.endswith('.json'):
           d = json.load(open(os.path.join(root, f)))
           refs.add(d['video']['src'])
           refs |= {s['image']['src'] for s in d['steps'] if s['type'] == 'photo'}
   files = {'assets/' + f for f in os.listdir(os.path.join(root, 'assets'))}
   print('Unreferenced (safe to remove):', sorted(files - refs))
   print('Missing (demo is broken):', sorted(refs - files))
   PY
   ```
   `Missing` must be empty. If it is not, re-export or re-record; do not
   deliver.
3. New demo folders are untracked in git until committed, so a deleted still
   cannot be restored with git. Do not delete anything in a demo folder
   without running the check above, and tell the user when the demo is
   complete so they can commit it.
4. A still exists only to carry a popup. If a step has no popup, give it one
   (preferred) or remove the step and its still together.
5. For extra stills you create, use meaningful names (for example
   `subject-cn.png`) and keep sizes reasonable (prefer AVIF/WebP over PNG).

## Reduce capture load without shrinking the UI

A 1600 × 900 logical viewport captures 3200 × 1800 with the stock 0.6.2
extension. On the observed host this caused severe stuttering; a temporary
extension requesting one pixel per logical pixel produced 1600 × 900 with
better frame rate. The CLI's Chromium `--force-device-scale-factor` alone did
not fix the capture dimensions. Do not change the project dependency or the
user's installed extension.

Only if the installed 0.6.2 extension still has the exact strings below, copy
its built extension to the temporary directory and apply this guarded patch:

```bash
# RECORDER_DIR is the temporary npm project; WORK_DIR is the temporary workspace.
cp -a "$RECORDER_DIR/node_modules/@rustrak/openshowcase-recorder/dist/extension" "$WORK_DIR/extension-1x"
python3 - "$WORK_DIR/extension-1x" <<'PY'
from pathlib import Path
import sys

matches = list((Path(sys.argv[1]) / 'chunks').glob('offscreen-*.js'))
if len(matches) != 1:
    raise SystemExit('Unexpected extension layout: inspect current version')
path = matches[0]
source = path.read_text()
changes = {
    'maxWidth:n*2,maxHeight:i*2,maxFrameRate:60': 'maxWidth:n,maxHeight:i,maxFrameRate:60',
    'scale:2,mimeType:l,fps:60': 'scale:1,mimeType:l,fps:60',
}
for old, new in changes.items():
    if source.count(old) != 1:
        raise SystemExit('Capture implementation changed: inspect current version')
    source = source.replace(old, new, 1)
path.write_text(source)
PY
```

Pass `--extension "$WORK_DIR/extension-1x"` to the recorder's `inspect`,
`record`, and `export` commands. The extension still requests up to 60 fps;
that does not guarantee 60 fps. Check actual exported dimensions and frame rate
with `ffprobe` or another reliable media inspector, and inspect playback.
If `ffprobe`/`ffmpeg` are not installed, note that Playwright's bundled
`ffmpeg` cannot read MP4; instead read the MP4 boxes (`mdhd` duration and
timescale, `stsz` sample count, `stsd` width/height) with a short script and
report frames ÷ duration as the average fps. The stock average was 14–20 fps
on the observed host (static pages produce fewer frames); report the measured
value. If
this patch no longer matches, stop and investigate the current extension rather
than patching unrelated code. Mention the temporary modification in the report.

## Documentation integration

- If an insertion destination is specified, add the demo at that location; if
  not, deliver a local output folder and leave docs pages alone. Retain the
  `.flow.json` as the editable source in either case.
- For an existing translated page, translate each hotspot label and surrounding
  text in all supported locales. An exported ZIP contains `steps.json` and
  assets: separate locale-specific JSON files may share the same media paths.
  Use the project's existing OpenShowcase component and base-aware asset helper.
- Always use the **plain, no-backdrop** presentation, which is the project's
  default: `wrapper="none"`, `backdrop={null}`, the `platform-demo
  platform-demo--plain` classes and the brand `hotspotStyle`
  (`{ bgColor: "#405fff", textColor: "#ffffff" }`). Copy
  `app/components/create-ca-demo.tsx` for a new demo and register it in
  `app/routes/docs.tsx`. Do not add a backdrop/browser-frame variant or a
  `noBackdrop` prop, and never embed the same demo twice on a page.
- Replace the requested process without removing surrounding prerequisites,
  verification commands, troubleshooting, or next steps unless requested.
  If the actual UI differs from existing prose, correct the prose to match the
  verified behavior; don't claim recorded application UI text was translated.
- Validate asset paths and both locales, run applicable checks, and preview the
  player in a browser. Check the output for visible secrets or unrelated data.

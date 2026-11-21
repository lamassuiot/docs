# Monolithic Runtime

These commands reflect the inspected development entry point, not a permanent
API. Re-read `monolithic/cmd/development/main.go`, `monolithic/pkg/assembler.go`,
the root `go.mod`, and repository instructions before running. Execute shell
examples in a managed terminal; adapt lifecycle handling to the agent runtime.

## Preflight and Ownership

- Confirm Go matches `go.mod`, Docker is installed and reachable, disk space is
  sufficient, and a browser can reach the development host. Install dependencies
  only within user authorization. Do not use sudo or change Docker permissions.
- Check standard Postgres and gateway listeners and containers before starting:

  ```bash
  ss -ltnp '( sport = :5432 or sport = :8080 or sport = :8443 )'
  docker ps -a --filter label=group=lamassuiot-monolithic
  docker info --format '{{.ServerVersion}}'
  ```

- Record existing container IDs, listener owners, and any reusable dev instance.
  An HTTPS endpoint, a login screen, or a healthy root page does not identify it.
  Do not interrupt existing port forwards, deployments, or other users' services.
- Current monolithic uses fixed gateway ports, shared `/tmp/gotest` and
  `/tmp/lamassuiot/va` locations, and a common container label. On signal or panic,
  its cleanup removes **all** containers labeled `group=lamassuiot-monolithic`.
  Random dependency ports and a temporary working directory do NOT isolate it.
  Maintain exclusive use of the host for the entire run, including shutdown;
  a pre-shutdown check alone cannot prevent a concurrent launch/cleanup race.
  If another run exists, reuse it only with authorization or use a fully isolated
  disposable host/VM. A separate worktree alone is insufficient. Do not launch
  concurrently or run broad container/volume cleanup.
- The gateway binds all interfaces and the development UI disables OIDC. Use a
  trusted, access-restricted development host. Never expose it publicly or alter
  authentication on an existing instance. Startup/debug logs can contain
  credentials and sensitive payloads: keep logs local and redact reports.

## 1. Clone and select v4

Always use a fresh, temporary clone for a local monolithic demo. Do not switch,
reset, or modify the user's existing checkout. Clone and explicitly check out
`v4`; a Go module path ending in `/v4` is not evidence of the Git branch.

```bash
set -e
LAMASSU_RUN_DIR=$(mktemp -d "${TMPDIR:-/tmp}/lamassu-showcase.XXXXXX")
LAMASSU_BACKEND="$LAMASSU_RUN_DIR/lamassuiot"
git clone --branch v4 --single-branch https://github.com/lamassuiot/lamassuiot.git "$LAMASSU_BACKEND"
git -C "$LAMASSU_BACKEND" checkout v4
git -C "$LAMASSU_BACKEND" branch --show-current
git -C "$LAMASSU_BACKEND" rev-parse HEAD
```

Confirm the branch prints exactly `v4` and the module path in `go.mod` is
`github.com/lamassuiot/lamassuiot/v4`. Record the revision. Stop and diagnose
clone, checkout, toolchain, or build failures; do not continue with another branch.

## 2. Configure and launch monolithic

Monolithic starts PostgreSQL and the UI container itself. **Do not run a separate
UI container**. Configure the UI it launches as `ghcr.io/lamassuiot/lamassu-ui:dev`
and its browser-facing API as `http://localhost:8080/api`. Re-read the current
entry point and inspect image, environment and cleanup code before adapting it.
Run only after the ownership and exclusive-host checks above have passed.

The inspected development entry point hardcodes the UI image tag and API URL.
The following makes a temporary copy of that entry point and changes only those
defaults, without altering the backend checkout. If its source changes and the
checks fail, inspect it and adapt the launch before continuing:

```bash
set -e
cd "$LAMASSU_BACKEND" &&
RUN_DIR="$LAMASSU_RUN_DIR/runtime" &&
mkdir -p "$RUN_DIR" &&
python3 - "$RUN_DIR" <<'PY'
from pathlib import Path
import sys

source = Path('monolithic/cmd/development/main.go').read_text()
replacements = {
    'dockertest.WithTag("latest"),\n\t\t\tdockertest.WithEnv([]string{"OIDC_ENABLED=false", "UI_FOOTER_ENABLED=false", "LAMASSU_API=https://localhost:8443/api"':
    'dockertest.WithTag("dev"),\n\t\t\tdockertest.WithEnv([]string{"OIDC_ENABLED=false", "UI_FOOTER_ENABLED=false", "LAMASSU_API=http://localhost:8080/api"',
    'could not launch ghcr.io/lamassuiot/lamassu-ui:latest':
    'could not launch ghcr.io/lamassuiot/lamassu-ui:dev',
}
for old, new in replacements.items():
    if source.count(old) != 1:
        raise SystemExit('Development entry point changed; inspect UI image and API configuration')
    source = source.replace(old, new, 1)
Path(sys.argv[1], 'main.go').write_text(source)
PY
go build -o "$RUN_DIR/lamassu-monolithic" "$RUN_DIR/main.go" &&
cd "$RUN_DIR" &&
umask 022 &&
touch "$RUN_DIR/runtime.log" &&
chmod 600 "$RUN_DIR/runtime.log" &&
./lamassu-monolithic -standard-docker-ports=true -inmemory-eventbus -disable-wfx -sample-data >"$RUN_DIR/runtime.log" 2>&1
```

Use standard Docker ports by default. If occupied, identify the owner and
coordinate with the user; do not silently select nonstandard ports or stop the
other service. The UI container started by monolithic can have ephemeral host ports even
with this flag. Inspect its actual mappings as described below.

Keep the temporary run directory private and the log at mode `0600`, but use
`umask 022` for the process. A process-wide `umask 077` makes generated Postgres
initialization directories/files `0700`/`0600`, unreadable by the container's
Postgres user. Protect the log separately; do not trade startup correctness for
private logging or expose logs to fix initialization.

Set `LAMASSU_BACKEND` to the discovered absolute backend path before executing.
Stop if the build fails; do not execute an unverified binary. Run the server as
a managed long-lived process and record its terminal/process handle and run
directory. It launches Postgres and the UI container. The flags avoid RabbitMQ
and unrelated WFX; omit `-disable-wfx` only for workflows that need WFX. The
default filesystem engine is suitable for local PKI demos. Do not enable AWS,
Azure, or other paid/external connectors unless specifically authorized.

Use `http://localhost:8080/api` for the API by default. Discover the actual
dashboard HTTP origin using the next section; do not assume the dashboard and
API have the same host port. For remote environments use the corresponding
HTTP host/port-forwarding address and ensure the dashboard API configuration
points to a browser-reachable HTTP URL.
Use `https://localhost:8443` only if the user explicitly requests HTTPS; allow
self-signed TLS only for this identified local runtime, not globally.

## Diagnose Startup Before Retrying

- Rebuild from the current checkout and record its revision. A different default
  Go version outside the repo is not a failure if the module's required
  toolchain resolves and the build succeeds.
- If Postgres exits, capture that owned container's logs immediately. The helper
  removes it after the bounded readiness retry (currently about 30 seconds).
  Repeated HTTP probes can consume the whole diagnostic window.
- Check generated initialization file and directory modes with `stat`, then
  test readability as the image's Postgres user using an owned, read-only bind
  mount. Check the actual UID/image and mount path. Correct only owned generated
  non-secret artifacts; never recursively chmod shared temporary directories.
- Distinguish an exited dependency from a live service that is still starting.
  Fix the demonstrated cause before changing backend code or retrying ports.

## Local Browser TLS

Verify the dashboard's `config.js` and browser requests use the HTTP API on
port 8080 by default. If reusing an authorized instance configured for HTTPS,
use a page-local fetch rewrite restricted to its exact API origin and the same
runtime's HTTP gateway, and record the adaptation. Verify real API data loads.
For explicitly requested HTTPS, prefer a trusted local certificate or a
browser-context TLS exception restricted to the identified runtime. Do not
edit global app configuration, weaken authentication, proxy unrelated origins,
or bundle a rewrite into the documentation artifact. Report a browser blocker
if the requested connection cannot be used safely.

## 3. Discover the UI and verify readiness

1. Identify the UI container started by this run using the label and image; record
   its ID and image ID. Check the configured image is exactly
   `ghcr.io/lamassuiot/lamassu-ui:dev`. The tag is not an immutable version.
2. Inspect its port mappings with `docker port <owned-ui-container-id>` and
   probe the mapped ports using HTTP. Do not start another container. In one
   observed `:dev` build the mapping for container port 80 led to a gateway
   502, while its mapped port **8085** served the UI; this is a diagnostic
   example, not a stable port. Probe both the gateway and mapped ports and use
   the one that actually serves the UI. Do not assume `localhost:8080/` is the
   dashboard or that an exposed port is listening inside the container.
3. Verify the UI's `config.js` points to the reachable HTTP API. Verify
   `http://localhost:8080/api/ca/health` or the current equivalent; a 200 on
   the UI shell alone is insufficient. Use bounded retries and a deadline.
4. Wait for sample-data population, then check in a browser that the relevant
   inventory loads and contains data with no failed API requests or console
   errors. A ready banner can precede population. If the dashboard or API is
   unavailable, inspect the owned container and redacted runtime logs; diagnose
   the actual cause before changing ports or retrying.
5. Set the OpenShowcase flow URL to the discovered UI HTTP origin. The mapped
   port is ephemeral: rediscover it and update the persisted JSON on later runs.
   If a login screen appears unexpectedly, diagnose it; never bypass auth or ask
   the user to paste credentials into chat.

## Cleanup

Before signaling the owned process, re-check that no foreign monolithic-labeled
containers appeared: its shutdown is broader than per-process cleanup. If they
did, stop and ask how to coordinate shutdown. Otherwise use its managed graceful
shutdown and inspect leftovers. Remove only positively identified owned container
IDs and owned temporary files when authorized. Never delete shared `/tmp` paths,
prune Docker, or stop a pre-existing runtime. Leave requested preview servers
running and report their URL and ownership. Do not start Lamassu merely to install
or read this skill; launch it when performing a requested capture.

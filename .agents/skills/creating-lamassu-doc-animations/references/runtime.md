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

## Launch

For a safe host with no competing monolithic instance, build from the backend
root, then run in an owned temporary directory to keep generated proxy keys out
of the repository. Verify that `go.mod` declares
`github.com/lamassuiot/lamassuiot/v4`; locate a v4 checkout if it does not.
The inspected development entry point hardcodes the UI image tag and API URL.
The following makes a temporary copy of that entry point and changes only those
defaults, without altering the backend checkout. If its source changes and the
checks fail, inspect it and adapt the launch before continuing:

```bash
cd "$LAMASSU_BACKEND" &&
RUN_DIR=$(mktemp -d "${TMPDIR:-/tmp}/lamassu-doc-demo.XXXXXX") &&
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
other service. A separately managed dashboard container may still use an
ephemeral internal-facing host port; inspect actual mappings rather than
assuming the flag fixes every container port.

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

Use `http://localhost:8080` for the dashboard and API by default. Use the
browser's host/port-forwarding equivalent for remote environments, ensuring the
dashboard API configuration points to the corresponding reachable HTTP URL.
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

## Readiness and Version

- A ready banner can precede sample-data population. Wait for successful
  population and required synthetic resources, not just the banner or a timer.
- Use bounded HTTP readiness retries with a deadline, then browser assertions:

  ```bash
  curl --fail --silent --show-error --connect-timeout 2 --max-time 10 http://localhost:8080/ -o /dev/null
  curl --fail --silent --show-error --connect-timeout 2 --max-time 10 http://localhost:8080/api/ca/health
  ```

  Confirm the health route against current routes; test other relevant services
  similarly. These are individual probes; wrap retries in the runtime's bounded
  readiness facility with an overall deadline, not an unbounded shell loop.
  A successful root request may be only the SPA shell. Open the
  inventory and confirm data loads without API or console errors. On failure,
  inspect relevant redacted logs rather than retrying indefinitely.
- Confirm the running UI container's configured image is
  `ghcr.io/lamassuiot/lamassu-ui:dev`, and record its actual image ID/digest,
  the v4 backend revision, and dashboard revision when known. Do not equate a
  tag with an immutable version or assume it matches the local checkout. If the
  target requires local dashboard changes, use its documented Vite workflow and
  runtime API configuration after checking CORS/auth. Do not silently retag an
  image, change global config, or claim local source equals the running image.
- An unexpected login screen is a blocker to investigate, not permission to
  bypass auth. Let the user enter secrets directly; never request passwords or
  tokens through chat, embed them in commands, or include them in captures.

## Cleanup

Before signaling the owned process, re-check that no foreign monolithic-labeled
containers appeared: its shutdown is broader than per-process cleanup. If they
did, stop and ask how to coordinate shutdown. Otherwise use its managed graceful
shutdown and inspect leftovers. Remove only positively identified owned container
IDs and owned temporary files when authorized. Never delete shared `/tmp` paths,
prune Docker, or stop a pre-existing runtime. Leave requested preview servers
running and report their URL and ownership. Do not start Lamassu merely to install
or read this skill; launch it when performing a requested capture.

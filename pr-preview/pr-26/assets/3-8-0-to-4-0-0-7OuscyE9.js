import{j as e}from"./index-prc0XQdj.js";let r=`<div className="lm-diff-del lm-diff-block">
  Upgrading from 3.8.0 to 4.0.0 automatically migrates stored DMS configuration. Most of it converts without intervention, but three changes can leave enrollments failing or configs holding unexpected values if they are not reviewed. This page states what changes, what symptoms to expect and what to do in each case. Current behavior of each feature is documented in the [DMS](/docs/platform/iot-fleets/enrollment/dms) pages.
</div>

<div className="lm-diff-del lm-diff-block">
  Summary
</div>



<div className="lm-diff-ins lm-diff-block">
  Lamassu 4.0.0 is a major release. Storage consolidates into a single PostgreSQL database, a new \`authz\` service authorizes every request, the Helm chart is hardened, and several APIs and stored configurations change shape. Most data converts automatically during the upgrade, but some changes need operator action before, during or after it.
</div>

<div className="lm-diff-ins lm-diff-block">
  This page is organized in four parts. Read them in order before you upgrade production:
</div>

<div className="lm-diff-ins lm-diff-block">
  1. [Architecture changes](#architecture-changes): what is different in 4.0.0 and what the upgrade migrates on its own.
  2. [Breaking changes](#breaking-changes): every change that can break a 3.8.0 deployment, who it affects and what to do.
  3. [Helm migration guide](#helm-migration-guide): the step-by-step procedure for a Helm-managed release.
  4. [Validation checklist](#validation-checklist): how to confirm the upgrade worked before you remove the old data.
</div>

<div className="lm-diff-ins lm-diff-block">
  <Callout type="warn" title="Backend migration steps are provisional">
    The 4.0.0 release is upcoming and the backend migration steps on this page are provisional. Verify each procedure against the final release artifacts before upgrading production.
  </Callout>
</div>

<div className="lm-diff-ins lm-diff-block">
  Architecture changes [#architecture-changes]
</div>

<div className="lm-diff-ins lm-diff-block">
  One PostgreSQL database with schemas [#one-postgresql-database-with-schemas]
</div>

<div className="lm-diff-ins lm-diff-block">
  3.8.0 gave each service its own database. The 4.0.0 backend connects to a single PostgreSQL database named \`pki\` and isolates each service in a schema: \`kms\`, \`ca\`, \`va\`, \`devicemanager\`, \`dmsmanager\` and \`alerts\`. The \`authz\` service keeps its principals, grants and policies in a separate \`authz\` database (the development monolith uses an \`authz\` schema inside \`pki\` instead), and WFX keeps its own \`wfx\` database.
</div>

<div className="lm-diff-ins lm-diff-block">
  PostgreSQL is now the only storage engine. SQLite support is removed, and the \`couch_db\` and \`dynamo_db\` engines are not registered in 4.0.0.
</div>

<div className="lm-diff-ins lm-diff-block">
  Authorization moves into the authz service [#authorization-moves-into-the-authz-service]
</div>

<div className="lm-diff-ins lm-diff-block">
  In 3.8.0 the API Gateway validated tokens: a JWT policy on every private route checked the signature and only let through tokens that carried the administrator role. Every route was open to any token that passed that check.
</div>

<div className="lm-diff-ins lm-diff-block">
  4.0.0 removes the gateway policy. The \`/api/*\` routes reach the services directly, and each service authorizes every request through \`authz\`, which validates the token against the identity provider's JWKS endpoint and applies fine-grained, entity-level policies to CAs, certificates, devices, DMSs, KMS keys and VA roles. There is no implicit superuser: the first administrator comes from a bootstrap principal that you configure. The [access control](/docs/platform/administration/access-control) page documents principals, policies and the first administrator.
</div>

<div className="lm-diff-ins lm-diff-block">
  Device events get their own store [#device-events-get-their-own-store]
</div>

<div className="lm-diff-ins lm-diff-block">
  Historical device events move from the \`devices.events\` column to a dedicated \`device_events\` store with their own endpoints. The events endpoint can also stream events over Server-Sent Events (SSE); to fan events out across service instances, each Device Manager instance binds its own durable AMQP queue.
</div>

<div className="lm-diff-ins lm-diff-block">
  A hardened Helm chart [#a-hardened-helm-chart]
</div>

<div className="lm-diff-ins lm-diff-block">
  Version 4.0.0 of the chart is a security-hardening release:
</div>

<div className="lm-diff-ins lm-diff-block">
  * **Release-scoped resource names.** Every chart-managed resource is named \`<release>-lamassu-<component>\` instead of the fixed names used in 3.8.0 (\`kms\`, \`va\`, \`ca\`, ...). With a release named \`prod\` the StatefulSets become \`prod-lamassu-kms\` and \`prod-lamassu-va\`. The \`nameOverride\` and \`fullnameOverride\` values change the prefix.
  * **Non-root containers.** Every workload runs as the numeric user \`65532:65532\` with a \`RuntimeDefault\` seccomp profile and dropped capabilities. Pods do not mount the service-account token by default, and the chart creates a dedicated ServiceAccount.
  * **Strict values validation.** \`values.schema.json\` rejects unknown keys, so leftover 3.8.0 blocks fail \`helm lint\` and \`helm upgrade\` instead of being silently ignored.
  * **No injected scheduling rules.** The chart no longer adds pod anti-affinity or topology spread constraints on its own.
</div>

<div className="lm-diff-ins lm-diff-block">
  What the upgrade migrates automatically [#what-the-upgrade-migrates-automatically]
</div>

<div className="lm-diff-ins lm-diff-block">
  Several migrations run without intervention when you upgrade a Helm release:
</div>

<div className="lm-diff-ins lm-diff-block">
  * Before any service starts, the chart's pre-install/pre-upgrade job prepares PostgreSQL. It creates the \`pki\`, \`authz\` and \`wfx\` databases when they do not exist, creates one schema per service inside \`pki\`, and imports each 3.8.0 per-service database into its schema. Each import runs as a single transaction, so a failed import leaves no partial schema and a retried job imports again. The job then runs the database migrations for every schema, migrates \`authz\`, preloads its policies and seeds the \`services.authz.bootstrap\` principals. It is idempotent and requires a PostgreSQL role allowed to create databases and schemas, as described in [Install with Helm](/docs/deployment/self-hosted/helm#before-you-begin).
  * Stored DMS configuration is rewritten to the 4.0.0 layout, and historical device events are transformed into the new store.
  * When \`migrations.caToKms.enabled\` is set, a pre-upgrade hook registers legacy CA keys in the KMS.
</div>

<div className="lm-diff-ins lm-diff-block">
  Two things never migrate on their own: the KMS and VA data on local volumes, which stays on volumes the upgraded pods no longer use, and the values file, which you update by hand. Deployments that do not use the Helm chart also have to move their database data themselves; see [Deployments without Helm](#deployments-without-helm).
</div>

<div className="lm-diff-ins lm-diff-block">
  Breaking changes [#breaking-changes]
</div>

| Change                                                                                                                                                                                          | Who is affected                                                                                                                                                                 | Severity                                                                                                                                                                                                              | Action                                                                                     |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| [Release-scoped resource names](#release-scoped-resource-names)                                                                                                                                 | Helm releases with a filesystem KMS engine or local VA CRL storage                                                                                                              | High: KMS and VA start on empty volumes                                                                                                                                                                               | Copy the data into the new volumes                                                         |
| [Strict values validation](#strict-values-validation)                                                                                                                                           | Every Helm release                                                                                                                                                              | High: \`helm upgrade\` fails                                                                                                                                                                                            | Remove or rename legacy keys                                                               |
| [Required authorization configuration](#required-authorization-configuration)                                                                                                                   | Every deployment                                                                                                                                                                | High: without a bootstrap principal there is no administrator                                                                                                                                                         | Configure \`services.authz\`                                                                 |
| [Gateway token validation removed](#gateway-token-validation-removed)                                                                                                                           | Every Helm release                                                                                                                                                              | High: \`helm upgrade\` fails on the old keys                                                                                                                                                                            | Move JWKS and roles into \`services.authz\`                                                  |
| [PostgreSQL consolidation](#postgresql-consolidation)                                                                                                                                           | 3.8.0 deployments with per-service databases                                                                                                                                    | High: services find no data, or a migration aborts                                                                                                                                                                    | Clean duplicate CA IDs and empty \`engine_id\` values first; move data manually outside Helm |
| [SQLite storage removed](#sqlite-storage-removed)                                                                                                                                               | Deployments on SQLite, \`couch_db\` or \`dynamo_db\`                                                                                                                                | High: the backend no longer starts with them                                                                                                                                                                          | Move to PostgreSQL before upgrading                                                        |
| [<del className="lm-diff-del">Webhooks with file references</del>](#webhooks-with-file-references)[<ins className="lm-diff-ins">Webhooks with file references</ins>](#dms-webhooks)             | DMSs <del className="lm-diff-del">with a</del><ins className="lm-diff-ins">whose</ins> webhook<del className="lm-diff-del"> whose</del> mTLS certificate or key were file paths | High: enrollments <del className="lm-diff-del">and re-enrollments </del>calling the webhook fail                                                                                                                      | Re-enter certificate and key as PEM, or remove the file fields                             |
| [Non-root containers](#non-root-containers)                                                                                                                                                     | Releases with per-service identity overrides or mounted key material                                                                                                            | Medium: services cannot read their files                                                                                                                                                                              | Remove the overrides and fix volume ownership                                              |
| [AMQP over TLS](#amqp-over-tls)                                                                                                                                                                 | Releases that set \`amqp.tls\`                                                                                                                                                    | Medium: clients connect to the wrong port                                                                                                                                                                             | Point \`amqp.port\` at the TLS listener, or disable TLS                                      |
| [Legacy CA keys in the KMS](#legacy-ca-keys-in-the-kms)                                                                                                                                         | Installations whose CA keys predate the KMS                                                                                                                                     | Medium: CA keys stay unmanaged                                                                                                                                                                                        | Run the CA-to-KMS migration                                                                |
| [<del className="lm-diff-del">Receiver certificate verification</del>](#receiver-certificate-verification)[<ins className="lm-diff-ins">Receiver certificate verification</ins>](#dms-webhooks) | DMSs <del className="lm-diff-del">with a</del><ins className="lm-diff-ins">whose</ins> webhook<del className="lm-diff-del"> that</del> had \`validate_server_cert: false\`        | Medium: <del className="lm-diff-del">webhook </del>credentials <del className="lm-diff-del">are sent</del><ins className="lm-diff-ins">go</ins> to an unverified receiver                                             | Set \`insecure_skip_verify\` to \`false\`                                                      |
| [Re-enrollment trust set](#re-enrollment-trust-set)                                                                                                                                             | Scripts and consoles that edit DMSs through the API                                                                                                                             | Medium: an <del className="lm-diff-del">edit in the </del>old<del className="lm-diff-del"> </del><ins className="lm-diff-ins">-</ins>layout<ins className="lm-diff-ins"> edit</ins> silently empties \`validation_cas\` | Read the DMS before editing and use the new field                                          |
| [Device events](#device-events)                                                                                                                                                                 | Consumers that read the device \`events\` field                                                                                                                                   | Medium: the field disappears                                                                                                                                                                                          | Use the new event endpoints                                                                |
| [Renamed and reshaped values](#renamed-and-reshaped-values)                                                                                                                                     | Releases that override \`toolbox\`, \`services.connectors\`, ports, probes or scheduling                                                                                            | Low to medium: validation errors or changed defaults                                                                                                                                                                  | Update the values file                                                                     |
| [DMS update API](#dms-update-api)                                                                                                                                                               | Clients that send the DMS ID in the update body                                                                                                                                 | Low: the ID in the URL wins                                                                                                                                                                                           | Send the ID in the URL                                                                     |
| [Certificate type values](#certificate-type-values)                                                                                                                                             | Consumers that match on certificate \`type\`                                                                                                                                      | Low: two values are renamed                                                                                                                                                                                           | Adapt consumers                                                                            |
| [Independent re-enrollment authentication](#independent-re-enrollment-authentication)                                                                                                           | Any DMS                                                                                                                                                                         | Low: informational                                                                                                                                                                                                    | Read both blocks before editing                                                            |

<div className="lm-diff-del lm-diff-block">
  A [verification checklist](#verification-checklist) at the end confirms the result.
</div>

<div className="lm-diff-del lm-diff-block">
  DMS webhooks
</div>

<div className="lm-diff-ins lm-diff-block">
  Helm chart and values [#helm-chart-and-values]
</div>

<div className="lm-diff-ins lm-diff-block">
  Release-scoped resource names [#release-scoped-resource-names]
</div>

<div className="lm-diff-ins lm-diff-block">
  Kubernetes derives a StatefulSet's PVC name from its pod name (\`<volumeClaimTemplate>-<pod-name>\`). Renaming the \`kms\` and \`va\` StatefulSets means \`helm upgrade\` binds brand-new, empty PVCs instead of the existing ones. The KMS key material and VA CRLs are not deleted — the old PVCs are orphaned, not removed — but the upgraded pods fail with \`no such file or directory\` (KMS) or \`code=NotFound\` (VA) until you copy the data across. This affects KMS when \`services.kms.cryptoEngines\` uses a \`filesystem\` engine and VA when \`services.va.fileStore.type\` is \`local\`. Every other renamed resource is stateless and is recreated without data-loss risk.
</div>

<div className="lm-diff-ins lm-diff-block">
  [Step 4 of the migration guide](#step-4-migrate-the-kms-and-va-data) copies the data.
</div>

<div className="lm-diff-ins lm-diff-block">
  Strict values validation [#strict-values-validation]
</div>

<div className="lm-diff-ins lm-diff-block">
  \`values.schema.json\` rejects unknown keys, so every block that 4.0.0 removed or renamed — \`toolbox\`, \`auth.oidc.apiGateway\`, \`auth.authorization\` and others — fails \`helm lint\` and \`helm upgrade\` outright. [Step 2](#step-2-update-the-values-file) lists every change.
</div>

<div className="lm-diff-ins lm-diff-block">
  Required authorization configuration [#required-authorization-configuration]
</div>

<div className="lm-diff-ins lm-diff-block">
  3.8.0 had no authorization service, so a 3.8.0 values file has nothing to migrate from: you must add the \`services.authz\` configuration yourself. It needs the JWKS endpoint of your identity provider, the database mappings the authorization engine uses, and a bootstrap principal that matches how your provider assigns the administrator role. Without a matching principal nobody can administer the PKI.
</div>

<div className="lm-diff-ins lm-diff-block">
  Gateway token validation removed [#gateway-token-validation-removed]
</div>

<div className="lm-diff-ins lm-diff-block">
  \`auth.oidc.apiGateway.jwks\`, \`auth.authorization.rolesClaim\` and \`auth.authorization.roles.admin\` are removed with no compatibility aliases, and the schema rejects them. Their settings move into \`services.authz\`: the JWKS URL becomes \`services.authz.jwkUrl\`, and the role claim and administrator role become a claim rule of the bootstrap principal. \`auth.oidc.frontend\` is unchanged.
</div>

<div className="lm-diff-ins lm-diff-block">
  Non-root containers [#non-root-containers]
</div>

<div className="lm-diff-ins lm-diff-block">
  Service images run on a distroless base as the numeric user \`65532\`; the \`authz\` image is Ubuntu with a non-root user that has the same UID. The per-service overrides \`services.kms.securityContext.runAsGroup: 0\` and \`services.authz.securityContext.runAsUser\`/\`runAsGroup: 999\` are removed; group access to the KMS volume and PKCS#11 socket is now handled by the pod-level \`fsGroup: 65532\`.
</div>

<div className="lm-diff-ins lm-diff-block">
  3.8.0 did not pin a container identity, so existing files can carry any UID. Any volume that holds keys or CRLs must be owned by \`65532:65532\`, or at least readable (and, where needed, writable) by that identity.
</div>

<div className="lm-diff-ins lm-diff-block">
  AMQP over TLS [#amqp-over-tls]
</div>

<div className="lm-diff-ins lm-diff-block">
  In 3.8.0 \`amqp.tls\` was not applied and event-bus clients always connected over plaintext. In 4.0.0 \`amqp.tls: true\` switches them to AMQPS. The default \`amqp.port\` stays \`5672\` and does not change when TLS is enabled, so a values file that already set \`amqp.tls: true\` must point \`amqp.port\` at the broker's TLS listener (\`amqps\`, commonly \`5671\`), or set \`amqp.tls: false\` to keep plaintext. Clients must also trust the broker's certificate.
</div>

<div className="lm-diff-ins lm-diff-block">
  Renamed and reshaped values [#renamed-and-reshaped-values]
</div>

<div className="lm-diff-ins lm-diff-block">
  * \`toolbox\` is renamed to \`connectivityTest\`, and the \`helm test\` hook uses the upstream \`curlimages/curl\` image pinned by digest.
  * \`services.connectors\` is a map keyed by connector ID instead of a list.
  * The \`services.ui.port\` default is \`8085\`, the unprivileged port of the rootless image.
  * The shared \`probes:\` block is replaced by independent \`livenessProbe\`, \`readinessProbe\` and \`startupProbe\` blocks.
  * With \`tls.certManagerOptions.issuer\` empty, the chart creates a release-scoped self-signed issuer, for example \`lamassu-downstream-ca-selfsigned-issuer\`. The legacy literal \`downstream-ca-selfsigned-issuer\` is still accepted and resolves to it.
  * Anti-affinity and topology spread must be configured explicitly through \`affinity\` and \`topologySpreadConstraints\`.
</div>

<div className="lm-diff-ins lm-diff-block">
  Data and storage [#data-and-storage]
</div>

<div className="lm-diff-ins lm-diff-block">
  PostgreSQL consolidation [#postgresql-consolidation]
</div>

<div className="lm-diff-ins lm-diff-block">
  Every 3.8.0 per-service database must end up as a schema of \`pki\`, keeping its structure, indexes, constraints, data and migration history. The Helm chart does this automatically; deployments without Helm do it by hand (see [Deployments without Helm](#deployments-without-helm)).
</div>

<div className="lm-diff-ins lm-diff-block">
  Two schema migrations abort on data that 3.8.0 allowed, so clean the data before upgrading:
</div>

<div className="lm-diff-ins lm-diff-block">
  * The CA migration adds a UNIQUE constraint on \`ca_certificates.id\` and aborts if duplicate CA IDs exist. Imports already reject duplicates with \`409\`, so new ones cannot normally appear.
  * The KMS migration promotes the primary key to \`(key_id, engine_id)\` and aborts with \`cannot promote (key_id, engine_id) to primary key: N row(s) have no engine_id; backfill them before migrating\` when \`kms_keys\` rows lack \`engine_id\`. Backfill \`engine_id\` first.
</div>

<div className="lm-diff-ins lm-diff-block">
  The same KMS migration deletes, with a \`NOTICE\`, aliases that equal an existing key ID, because identifiers now resolve as a key ID before an alias. Affected aliases are dropped, not redirected.
</div>

<div className="lm-diff-ins lm-diff-block">
  SQLite storage removed [#sqlite-storage-removed]
</div>

<div className="lm-diff-ins lm-diff-block">
  The SQLite storage engine is removed, and the \`couch_db\` and \`dynamo_db\` engines are not registered in 4.0.0: their configuration constants remain, but they select no engine. Deployments on any of them must move to PostgreSQL and consolidate their data into the \`pki\` schemas before upgrading.
</div>

<div className="lm-diff-ins lm-diff-block">
  Legacy CA keys in the KMS [#legacy-ca-keys-in-the-kms]
</div>

<div className="lm-diff-ins lm-diff-block">
  CA certificates of type \`MANAGED\` or \`IMPORTED_WITH_KEY\` whose private keys predate the KMS service have the key stored only in the crypto engine, under the certificate's \`subject_key_id\`, with no KMS record. The \`ca-to-kms-migration\` tool registers them:
</div>

<div className="lm-diff-ins lm-diff-block">
  * The \`key_id\` is the certificate's \`subject_key_id\` (SHA-256 of the public key).
  * The tool is idempotent: keys already in the KMS are skipped, so it can be run several times.
  * Certificates that cannot be read, or lack an engine or a subject key ID, are skipped with a warning. Review the logs and resolve the affected records.
  * When CA certificates sharing a \`subject_key_id\` declare conflicting \`engine_id\`s, the tool fails that key and exits with code \`1\`, which fails a Helm pre-upgrade hook. Resolve the conflict manually before rerunning.
</div>

<div className="lm-diff-ins lm-diff-block">
  With Helm, enable the hook for the upgrade in [step 2](#step-2-update-the-values-file); without Helm, run the tool by hand.
</div>

<div className="lm-diff-ins lm-diff-block">
  APIs and stored configuration [#apis-and-stored-configuration]
</div>

<div className="lm-diff-ins lm-diff-block">
  DMS webhooks [#dms-webhooks]
</div>

Stored webhook configs are rewritten to the current layout<del className="lm-diff-del">. Fields are renamed as follows</del><ins className="lm-diff-ins"> and their fields renamed</ins>:

| Field in 3.8.0         | Field in 4.0.0                         |
| ---------------------- | -------------------------------------- |
| \`validate_server_cert\` | \`insecure_skip_verify\` (value negated) |
| \`oidc\`                 | \`jwt_options\`                          |
| \`apikey\`               | \`apikey_options\`                       |
| \`mtls\`                 | \`mtls_options\`                         |

When the legacy mTLS certificate and key are both PEM, they move into \`mtls_options.cert_content\` and \`mtls_options.key_content\` and need no action. <del className="lm-diff-del">The two cases below</del><ins className="lm-diff-ins">Two cases</ins> do need it.

<div className="lm-diff-del lm-diff-block">
  Webhooks with file references
</div>

**<ins className="lm-diff-ins">Webhooks with file references.</ins>**<ins className="lm-diff-ins"> </ins>A mixed config, with a PEM certificate and a file-path key, is migrated to \`mtls_options.cert_file\` and \`mtls_options.key_file\`. Webhook delivery rejects those fields<del className="lm-diff-del">, and does so </del><ins className="lm-diff-ins"> </ins>on every call, whatever the configured authentication mode<del className="lm-diff-del">. As a result, </del><ins className="lm-diff-ins">, so </ins>every enroll and re-enroll that calls that webhook fails until the config is fixed<ins className="lm-diff-ins">. If the webhook uses mTLS, re-enter the certificate and key as Base64-encoded or plain PEM; if it does not, remove the leftover file fields. Metadata-only updates keep working in the meantime (\`PUT\` or \`PATCH\` on \`/v1/dms/:id/metadata\`). In a variant of the same problem, a stored config with file paths inside \`mtls_options.cert_content\` or \`mtls_options.key_content\` makes every full settings update (\`POST /v1/dms\` or \`PUT /v1/dms/:id\`) fail validation; settings are replaced wholesale, so resend the config with the certificate and key as PEM</ins>.

<div className="lm-diff-del lm-diff-block">
  There are two ways to fix it, depending on the webhook:
</div>

<div className="lm-diff-del lm-diff-block">
  * If the webhook uses mTLS, re-enter the certificate and key as Base64-encoded or plain PEM.
  * If the webhook does not use mTLS, remove the leftover file fields.
</div>

<div className="lm-diff-del lm-diff-block">
  Metadata-only updates keep working in the meantime (\`PUT\` or \`PATCH\` on \`/v1/dms/:id/metadata\`).
</div>

<div className="lm-diff-del lm-diff-block">
  A variant of the same problem exists: if the stored config holds file paths inside \`mtls_options.cert_content\` or \`mtls_options.key_content\`, every full settings update (\`POST /v1/dms\` or \`PUT /v1/dms/:id\`) fails validation. Settings are replaced wholesale, so the stored config must be resent with the certificate and key as PEM.
</div>

<div className="lm-diff-del lm-diff-block">
  Receiver certificate verification
</div>

<div className="lm-diff-del lm-diff-block">
  A config with \`validate_server_cert: false\` becomes \`insecure_skip_verify: true\`. Receiver certificate verification therefore stays skipped until that field is set to \`false\`.
</div>

<del className="lm-diff-del">It should be corrected </del>**<ins className="lm-diff-ins">Receiver certificate verification.</ins>**<ins className="lm-diff-ins"> A config with \`validate_server_cert: false\` becomes \`insecure_skip_verify: true\`, so receiver verification stays skipped until that field is set to \`false\`. Correct it </ins>on every migrated config<del className="lm-diff-del">. The</del><ins className="lm-diff-ins">: the</ins> webhook authorization channel carries the API key or bearer token, <del className="lm-diff-del">so</del><ins className="lm-diff-ins">and</ins> skipping verification exposes those credentials to a network-positioned attacker. <del className="lm-diff-del">Keeping</del><ins className="lm-diff-ins">Keep</ins> \`insecure_skip_verify: true\` <del className="lm-diff-del">is </del>only<del className="lm-diff-del"> justified</del> when the receiver certificate is deliberately unverifiable.

<div className="lm-diff-del lm-diff-block">
  Re-enrollment trust set
</div>

<div className="lm-diff-ins lm-diff-block">
  Re-enrollment trust set [#re-enrollment-trust-set]
</div>

The flat field \`reenrollment_settings.additional_validation_cas\` moves into the nested field \`reenrollment_settings.est_rfc7030_settings.client_certificate_settings.validation_cas\`<del className="lm-diff-del">.</del><ins className="lm-diff-ins">:</ins>

\`\`\`json
{
  "reenrollment_settings": {
    "est_rfc7030_settings": {
      "client_certificate_settings": {
        "validation_cas": ["<CA_ID>"]
      }
    }
  }
}
\`\`\`

The effective trust set does not change, because the nested value was never consulted when validating re-enrollments. If the flat list was missing or null, it becomes an empty list.

What <del className="lm-diff-del">does change</del><ins className="lm-diff-ins">changes</ins> is how API requests are handled. Bodies that still carry \`additional_validation_cas\` are accepted, but the value is silently <del className="lm-diff-del">ignored</del><ins className="lm-diff-ins">dropped</ins> because unknown JSON fields are <del className="lm-diff-del">dropped</del><ins className="lm-diff-ins">ignored</ins>, and GET responses no longer include it. <del className="lm-diff-del">Consequently, an</del><ins className="lm-diff-ins">An</ins> update body built from the old layout <ins className="lm-diff-ins">therefore </ins>empties \`validation_cas\` without <del className="lm-diff-del">returning </del>any error. <del className="lm-diff-del">To avoid it, always</del><ins className="lm-diff-ins">Always</ins> read the DMS before sending an edit and reuse the layout the API returns.

<div className="lm-diff-del lm-diff-block">
  Independent re-enrollment authentication
</div>

<div className="lm-diff-ins lm-diff-block">
  Independent re-enrollment authentication [#independent-re-enrollment-authentication]
</div>

Re-enrollment authentication settings are now stored independently from initial authentication. Nothing needs migrating, but <ins className="lm-diff-ins">read </ins>both blocks <del className="lm-diff-del">should be read </del>before editing a DMS so that <del className="lm-diff-del">one is not modified while believing the other is being edited</del><ins className="lm-diff-ins">you do not modify one while believing you are editing the other. If the console version does not expose independent settings, edit them through the </ins>[<ins className="lm-diff-ins">DMS API</ins>](/docs/api-reference/dms-manager).

<div className="lm-diff-del lm-diff-block">
  If the console version does not expose independent settings, they can be edited through the [DMS API](/docs/api-reference/dms-manager).
</div>

<div className="lm-diff-ins lm-diff-block">
  DMS update API [#dms-update-api]
</div>

<div className="lm-diff-ins lm-diff-block">
  \`PUT /v1/dms/:id\` takes the DMS ID from the URL and validates the request body. An ID in the body is ignored, so update clients that relied on it.
</div>

<div className="lm-diff-ins lm-diff-block">
  Certificate type values [#certificate-type-values]
</div>

<div className="lm-diff-ins lm-diff-block">
  Stored certificate type values are renamed: \`IMPORTED\` becomes \`IMPORTED_WITH_KEY\` and \`EXTERNAL\` becomes \`IMPORTED_WITHOUT_KEY\`. \`MANAGED\` is unchanged. Adapt consumers that read or match on those values.
</div>

<div className="lm-diff-ins lm-diff-block">
  Device events [#device-events]
</div>

<div className="lm-diff-ins lm-diff-block">
  The \`events\` field no longer appears in the device representation. Point consumers at the new endpoints:
</div>

<div className="lm-diff-ins lm-diff-block">
  * \`GET /v1/devices/:id/events\` returns a device's events.
  * \`POST /v1/devices/:id/events\` creates an event.
</div>

<div className="lm-diff-ins lm-diff-block">
  When the request \`Accept\` header includes \`text/event-stream\`, the events endpoint streams over SSE with a keepalive every 15 seconds, and returns \`501\` when SSE is disabled in the deployment. Each Device Manager instance binds a durable AMQP queue named after its service ID, \`device-manager-sse-<uuid>\`. Queues from crashed or replaced instances linger until removed, so configure an expiration or cleanup policy on the broker.
</div>

<div className="lm-diff-ins lm-diff-block">
  Helm migration guide [#helm-migration-guide]
</div>

<div className="lm-diff-ins lm-diff-block">
  The upgrade runs in a fixed order: prepare the data and values, run \`helm upgrade\`, then copy the KMS and VA data into the new volumes. The copy must run after the upgrade, because the destination StatefulSets and PVCs do not exist before it. If you are not upgrading an existing release, go straight to [Install with Helm](/docs/deployment/self-hosted/helm).
</div>

<div className="lm-diff-ins lm-diff-block">
  Step 1: Prepare [#step-1-prepare]
</div>

<div className="lm-diff-ins lm-diff-block">
  1. Take a verifiable backup of PostgreSQL and schedule downtime. The upgrade moves every service's data into \`pki\`.
  2. If the deployment runs on SQLite, \`couch_db\` or \`dynamo_db\`, move it to PostgreSQL first.
  3. Resolve duplicate CA IDs and backfill \`engine_id\` in \`kms_keys\`, as described in [PostgreSQL consolidation](#postgresql-consolidation).
  4. Record the names of your local-storage PVCs:
</div>

<div className="lm-diff-ins lm-diff-block">
  \`\`\`bash
  export NAMESPACE=lamassu   # your 3.8.0 namespace
  export RELEASE=lamassu     # your Helm release name

  kubectl get pvc -n $NAMESPACE -l app.kubernetes.io/instance=$RELEASE
  # on a 3.8.0 install you can also list the fixed names directly:
  kubectl get pvc -n $NAMESPACE golang-engine-storage-kms-0 local-crl-file-storage-va-0
  \`\`\`
</div>

<div className="lm-diff-ins lm-diff-block">
  \`helm upgrade\` does not touch or delete the old PVCs, but nothing references them after the upgrade. You need their names to copy the data and to clean up later.
</div>

<div className="lm-diff-ins lm-diff-block">
  Step 2: Update the values file [#step-2-update-the-values-file]
</div>

<div className="lm-diff-ins lm-diff-block">
  **Add \`services.authz\`.** Configure the JWKS endpoint, the database mappings and the bootstrap principal:
</div>

<div className="lm-diff-ins lm-diff-block">
  \`\`\`yaml
  services:
    authz:
      jwkUrl: https://idp.example.com/realms/lamassu/protocol/openid-connect/certs
      credentials:
        pki:
          database: pki
        authz:
          database: authz
      bootstrap:
        - principal_id: "oidc:pki-admin"
          principal_name: "PKI Admin"
          principal_type: "oidc"
          policy_ids: [...]   # keep the defaults from values.yaml
          auth_config:
            claims:
              - claim: realm_access.roles   # was auth.authorization.rolesClaim
                operator: contains
                value: pki-admin            # was auth.authorization.roles.admin
  \`\`\`
</div>

<div className="lm-diff-ins lm-diff-block">
  * \`jwkUrl\` is fetched from the \`authz\` pod, not from the gateway, so a Service in the release namespace can be referenced by its short name. The default points at a Keycloak Service named \`auth-keycloak\`; set it explicitly if your identity provider lives anywhere else.
  * \`authz\` is the authorization service's own storage for principals, grants and policies. \`pki\` is the database the authorization engine queries when it evaluates policies against entities. Only the \`database\` field of each entry is read; the connection always uses the global \`postgres.hostname\`, \`postgres.port\`, \`postgres.username\` and \`postgres.password\` values.
  * If you kept the 3.8.0 role defaults (\`realm_access.roles\` and \`pki-admin\`), the default \`services.authz.bootstrap\` already matches them.
</div>

<div className="lm-diff-ins lm-diff-block">
  **Delete the gateway token validation blocks.** Remove \`auth.oidc.apiGateway\` and \`auth.authorization\` once their settings are in \`services.authz\`:
</div>

<div className="lm-diff-ins lm-diff-block">
  \`\`\`yaml
  # REMOVE (3.8.0)
  auth:
    oidc:
      apiGateway:
        jwks:
          - name: oidc-authn
            uri: https://idp.example.com/realms/lamassu/protocol/openid-connect/certs
    authorization:
      rolesClaim: realm_access.roles
      roles:
        admin: pki-admin
  \`\`\`
</div>

<div className="lm-diff-ins lm-diff-block">
  **Rename \`toolbox\` to \`connectivityTest\`:**
</div>

<div className="lm-diff-ins lm-diff-block">
  \`\`\`yaml
  # OLD (3.8.0)
  toolbox:
    image: ghcr.io/lamassuiot/toolbox:2.2.0

  # NEW (4.0.0)
  connectivityTest:
    image: curlimages/curl@sha256:58adaa4e8dca9c988bae2aba4ab3434a0bb2da16bbe3f92dec39ec7785166777
  \`\`\`
</div>

<div className="lm-diff-ins lm-diff-block">
  **Remove the per-service identity overrides** \`services.kms.securityContext.runAsGroup\` and \`services.authz.securityContext.runAsUser\`/\`runAsGroup\`.
</div>

<div className="lm-diff-ins lm-diff-block">
  **Convert \`services.connectors\` to a map** keyed by connector ID, each entry with its \`type\` and \`image\`:
</div>

<div className="lm-diff-ins lm-diff-block">
  \`\`\`yaml
  services:
    connectors:
      aws.myconnector:
        type: awsiot
        image: ghcr.io/lamassuiot/lamassu-aws-connector:dev-v4
  \`\`\`
</div>

<div className="lm-diff-ins lm-diff-block">
  **Check AMQP.** If you set \`amqp.tls: true\`, also set \`amqp.port\` to the broker's TLS listener (commonly \`5671\`), or set \`amqp.tls: false\` to stay on plaintext.
</div>

<div className="lm-diff-ins lm-diff-block">
  **Enable the CA-to-KMS migration** if your CA keys predate the KMS:
</div>

<div className="lm-diff-ins lm-diff-block">
  \`\`\`yaml
  migrations:
    caToKms:
      enabled: true
  \`\`\`
</div>

<div className="lm-diff-ins lm-diff-block">
  **Review the remaining values:** overrides that pinned \`services.ui.port\` to \`80\`, the old \`probes:\` block, the TLS issuer, and explicit \`affinity\` and \`topologySpreadConstraints\` where your cluster needs them. [Renamed and reshaped values](#renamed-and-reshaped-values) describes each one.
</div>

<div className="lm-diff-ins lm-diff-block">
  Run \`helm lint\` with the new values before upgrading; the strict schema reports any key that is still unknown.
</div>

<div className="lm-diff-ins lm-diff-block">
  Step 3: Run the upgrade [#step-3-run-the-upgrade]
</div>

<div className="lm-diff-ins lm-diff-block">
  \`\`\`bash
  helm upgrade --install "$RELEASE" lamassu/lamassu \\
    --namespace $NAMESPACE \\
    --values values.yaml \\
    --wait
  \`\`\`
</div>

<div className="lm-diff-ins lm-diff-block">
  Helm runs the pre-upgrade hooks — the CA-to-KMS migration when enabled, and the database job — before applying any workload, so services never start against an unprepared database. If validation rejects unknown values, fix the values file and re-run. If the deployment uses local KMS or VA storage, those pods fail until you complete step 4.
</div>

<div className="lm-diff-ins lm-diff-block">
  Step 4: Migrate the KMS and VA data [#step-4-migrate-the-kms-and-va-data]
</div>

<div className="lm-diff-ins lm-diff-block">
  Skip this step when \`services.kms.cryptoEngines\` never used a \`filesystem\` engine and \`services.va.fileStore.type\` was never \`local\`.
</div>

<div className="lm-diff-ins lm-diff-block">
  1. **Find the new StatefulSets and PVCs.** Their names depend on the release name and any \`nameOverride\` or \`fullnameOverride\`; the PVC name is \`<volumeClaimTemplate>-<StatefulSet name>-0\`:
</div>

<div className="lm-diff-ins lm-diff-block">
  \`\`\`bash
  KMS_STS=$(kubectl get statefulset -n "$NAMESPACE" \\
    -l "app.kubernetes.io/instance=$RELEASE,app.kubernetes.io/component=kms" \\
    -o jsonpath='{.items[0].metadata.name}')
  VA_STS=$(kubectl get statefulset -n "$NAMESPACE" \\
    -l "app.kubernetes.io/instance=$RELEASE,app.kubernetes.io/component=va" \\
    -o jsonpath='{.items[0].metadata.name}')

  KMS_PVC="golang-engine-storage-\${KMS_STS}-0"
  VA_PVC="local-crl-file-storage-\${VA_STS}-0"

  kubectl get pvc -n "$NAMESPACE" \\
    golang-engine-storage-kms-0 "$KMS_PVC" \\
    local-crl-file-storage-va-0 "$VA_PVC"
  \`\`\`
</div>

<div className="lm-diff-ins lm-diff-block">
  With release \`lamassu\` and the default chart name, the new PVCs are \`golang-engine-storage-lamassu-kms-0\` and \`local-crl-file-storage-lamassu-va-0\`; with release \`prod\` they are \`golang-engine-storage-prod-lamassu-kms-0\` and \`local-crl-file-storage-prod-lamassu-va-0\`. Confirm both old and new PVCs exist before continuing. If you only migrate one of the two services, drop the other one's claims from the commands that follow.
</div>

<div className="lm-diff-ins lm-diff-block">
  2. **Record the replica counts and scale the new StatefulSets down** so nothing writes to either volume while you copy:
</div>

<div className="lm-diff-ins lm-diff-block">
  \`\`\`bash
  KMS_REPLICAS=$(kubectl get statefulset -n "$NAMESPACE" "$KMS_STS" -o jsonpath='{.spec.replicas}')
  VA_REPLICAS=$(kubectl get statefulset -n "$NAMESPACE" "$VA_STS" -o jsonpath='{.spec.replicas}')

  kubectl scale statefulset -n "$NAMESPACE" "$KMS_STS" "$VA_STS" --replicas=0
  \`\`\`
</div>

<div className="lm-diff-ins lm-diff-block">
  3. **Run a short-lived helper pod** that mounts all four claims. It runs as root so it can change file ownership, so pin its image by digest and do not mount the service-account token:
</div>

<div className="lm-diff-ins lm-diff-block">
  \`\`\`bash
  cat <<EOF | kubectl apply -f -
  apiVersion: v1
  kind: Pod
  metadata:
    name: pvc-migrate-helper
    namespace: $NAMESPACE
  spec:
    restartPolicy: Never
    automountServiceAccountToken: false
    containers:
      - name: migrate
        image: docker.io/library/alpine@sha256:d9e853e87e55526f6b2917df91a2115c36dd7c696a35be12163d44e6e2a4b6bc # 3.20
        command: ["sh", "-c", "sleep 3600"]
        volumeMounts:
          - {name: old-kms, mountPath: /old/kms}
          - {name: new-kms, mountPath: /new/kms}
          - {name: old-va,  mountPath: /old/va}
          - {name: new-va,  mountPath: /new/va}
    volumes:
      - {name: old-kms, persistentVolumeClaim: {claimName: golang-engine-storage-kms-0}}
      - {name: new-kms, persistentVolumeClaim: {claimName: $KMS_PVC}}
      - {name: old-va,  persistentVolumeClaim: {claimName: local-crl-file-storage-va-0}}
      - {name: new-va,  persistentVolumeClaim: {claimName: $VA_PVC}}
  EOF

  kubectl wait -n $NAMESPACE --for=condition=Ready pod/pvc-migrate-helper --timeout=60s
  \`\`\`
</div>

<div className="lm-diff-ins lm-diff-block">
  4. **Inspect before writing** so you do not clobber data the new pods may already have written:
</div>

<div className="lm-diff-ins lm-diff-block">
  \`\`\`bash
  kubectl exec -n $NAMESPACE pvc-migrate-helper -- sh -c 'find /new/kms /new/va -type f'
  \`\`\`
</div>

<div className="lm-diff-ins lm-diff-block">
  An empty result is the common case: a StatefulSet's own pod rarely gets far enough to write anything when its dependent data is missing. If the output is not empty, record the files and confirm with the service owner that they are disposable before you run the copy; do not overlay the 3.8.0 data onto an unknown store.
</div>

<div className="lm-diff-ins lm-diff-block">
  5. **Copy the data, align ownership and verify the copy.** The second command must print \`copy verified\`; any \`diff\` output means the copy is incomplete, so do not continue:
</div>

<div className="lm-diff-ins lm-diff-block">
  \`\`\`bash
  kubectl exec -n $NAMESPACE pvc-migrate-helper -- sh -c '
    cp -a /old/kms/. /new/kms/ &&
    cp -a /old/va/. /new/va/ &&
    chown -R 65532:65532 /new/kms /new/va
  '

  kubectl exec -n $NAMESPACE pvc-migrate-helper -- sh -c '
    diff -r /old/kms /new/kms &&
    diff -r /old/va /new/va &&
    echo "copy verified"
  '
  \`\`\`
</div>

<div className="lm-diff-ins lm-diff-block">
  The \`chown\` is required even if the old files already look non-root-owned, because 4.0.0 requires exactly \`65532:65532\` and does not fall back to whatever the image declares.
</div>

<div className="lm-diff-ins lm-diff-block">
  6. **Remove the helper and restore the recorded replica counts:**
</div>

<div className="lm-diff-ins lm-diff-block">
  \`\`\`bash
  kubectl delete pod -n $NAMESPACE pvc-migrate-helper
  kubectl scale statefulset -n "$NAMESPACE" "$KMS_STS" --replicas="$KMS_REPLICAS"
  kubectl scale statefulset -n "$NAMESPACE" "$VA_STS" --replicas="$VA_REPLICAS"
  \`\`\`
</div>

<div className="lm-diff-ins lm-diff-block">
  Step 5: Remove the one-off migration values [#step-5-remove-the-one-off-migration-values]
</div>

<div className="lm-diff-ins lm-diff-block">
  After the upgrade that performed the CA-to-KMS migration succeeds, remove \`migrations.caToKms.enabled\` from your values (it defaults to \`false\`). The hook reads the legacy 3.8.0 \`kms-config\` ConfigMap while it still exists and falls back to the release-scoped \`<release>-lamassu-kms-config\` once it is gone.
</div>

<div className="lm-diff-ins lm-diff-block">
  Then go through the [validation checklist](#validation-checklist). Keep the old PVCs until it passes.
</div>

<div className="lm-diff-ins lm-diff-block">
  Deployments without Helm [#deployments-without-helm]
</div>

<div className="lm-diff-ins lm-diff-block">
  Without the chart's database job, no tool moves data between databases: the migration tooling only applies migrations to a schema that already exists. Move each per-service database into its \`pki\` schema yourself, preserving structure, indexes, constraints, data and migration history, with writes stopped and a verified backup in hand.
</div>

<div className="lm-diff-ins lm-diff-block">
  To apply migrations by hand, \`goose-lamassu\` must run against the \`pki\` database with \`search_path=<schema>\` in the connection string. The binary validates only \`search_path\`, not the database name, so check \`dbname=pki\` before running it, and repeat for \`kms\`, \`ca\`, \`va\`, \`devicemanager\`, \`dmsmanager\` and \`alerts\`:
</div>

<div className="lm-diff-ins lm-diff-block">
  \`\`\`bash
  ./goose-lamassu "host=$DB_HOST port=5432 user=$DB_USER dbname=pki search_path=kms" up
  \`\`\`
</div>

<div className="lm-diff-ins lm-diff-block">
  Run \`ca-to-kms-migration\` first with \`--dry-run\`, which reports without writing to KMS storage, and then for real:
</div>

<div className="lm-diff-ins lm-diff-block">
  \`\`\`bash
  LAMASSU_CONFIG_FILE=migrate.yaml ./ca-to-kms-migration --dry-run
  LAMASSU_CONFIG_FILE=migrate.yaml ./ca-to-kms-migration
  \`\`\`
</div>

<div className="lm-diff-ins lm-diff-block">
  Point the tool's \`storage\` configuration at the \`pki\` database, where the CA and KMS data now live in the \`ca\` and \`kms\` schemas. The tool's options are described in \`backend/cmd/ca-to-kms-migration/README.md\` in the \`lamassuiot\` repository.
</div>

<div className="lm-diff-ins lm-diff-block">
  <Callout type="warn" title="The tools' READMEs are outdated">
    The \`goose-lamassu\` README still shows per-database examples (\`dbname=ca\`, \`dbname=kms\`) and claims the tool validates the database name, and the \`ca-to-kms-migration\` README still describes the pre-4.0.0 two-database layout. Follow the \`dbname=pki\` form on this page instead of their examples.
  </Callout>
</div>

<div className="lm-diff-ins lm-diff-block">
  Troubleshooting [#troubleshooting]
</div>

<div className="lm-diff-ins lm-diff-block">
  * **KMS or VA pods crash with \`no such file or directory\` or \`code=NotFound\` right after the upgrade.** The pods are bound to the new, empty PVCs and the data migration has not run yet, or was copied into the wrong PVC. Follow [step 4](#step-4-migrate-the-kms-and-va-data) and check that all four claims exist.
  * **\`helm upgrade\` fails with an unknown-key validation error.** Remove or rename the legacy values — typically \`toolbox\`, \`auth.oidc.apiGateway\` or \`auth.authorization\` — because the strict schema rejects keys it does not know.
  * **The upgrade fails at the database job.** The PostgreSQL role cannot create databases or schemas, or a schema migration aborted on duplicate CA IDs or missing \`engine_id\` values. Check the job logs, fix the privileges or the data, and re-run the upgrade.
  * **The upgrade fails at the CA-to-KMS hook.** CA certificates that share a \`subject_key_id\` declare conflicting \`engine_id\`s. Resolve the conflict and re-run.
  * **Nobody can log in after the upgrade.** Check that \`services.authz.jwkUrl\` is reachable from the \`authz\` pod, that \`services.authz.bootstrap\` matches a role your OIDC provider actually assigns, and that the database job completed.
</div>

VerificationValidation checklist [#validation-checklist]

After <del className="lm-diff-del">applying </del>the upgrade, check in this order:

1. **Databases.** Each service reads the \`pki\` database with its own schema, \`authz\` and \`wfx\` data are reachable, and the migration status is registered per schema, including the CA unique-ID and KMS composite-key migrations.
2. **KMS and VA start cleanly.** Their logs show no \`no such file or directory\` or \`code=NotFound\` errors.
3. **Existing KMS keys work.** Issue a certificate from a CA that existed before the upgrade. None of the other checks reads a KMS key, so this is the only one that proves the key material was copied.
4. **Existing CRLs are served.** \`GET /crl/<ca-ski>\` on VA returns a previously issued CRL, and new CRLs are issued.
5. **Legacy CA keys.** If the CA-to-KMS migration ran, review its report and warnings and confirm the expected keys appear in the KMS.
6. **Connectivity.** \`helm test "$RELEASE" -n $NAMESPACE --logs\` passes; the hook checks the CA, DMS Manager, Device Manager and VA health endpoints and the UI response.
7. **Authorization.** Sign in as the bootstrap principal and confirm administration works, check that an identity without permissions receives \`403\`, and review client and integration permissions.
8. **AMQP.** The backend connects to the broker with the expected TLS settings, and the cleanup policy for SSE queues is in place.
9. **Device events.** \`GET /v1/devices/:id/events\` returns the historical events of a device that had them.
10. **Webhooks without file fields.** <del className="lm-diff-del">List the DMSs</del><ins className="lm-diff-ins">For each DMS</ins> that <del className="lm-diff-del">use</del><ins className="lm-diff-ins">uses</ins> a webhook for enrollment or re-enrollment<del className="lm-diff-del"> and confirm each</del><ins className="lm-diff-ins">, the</ins> \`config\` block carries \`insecure_skip_verify\` and the expected option block (\`apikey_options\`, \`jwt_options\` or \`mtls_options\`), with the certificate and key as PEM and no \`cert_file\` or \`key_file\`.
11. **Receiver verification.** <del className="lm-diff-del">Confirm </del>\`insecure_skip_verify\` is \`false\`, unless the receiver certificate is intentionally unverified.
12. **<del className="lm-diff-del">Delivery</del>****<del className="lm-diff-del">.</del>**<del className="lm-diff-del"> Trigger, or wait for, one</del>**<ins className="lm-diff-ins">Webhook delivery.</ins>**<ins className="lm-diff-ins"> One</ins> enroll or re-enroll through each migrated webhook <del className="lm-diff-del">and confirm the</del><ins className="lm-diff-ins">completes its</ins> authorization call<del className="lm-diff-del"> completes</del>.
13. **Trust set.** <del className="lm-diff-del">Read \`est_rfc7030_settings.client_certificate_settings.validation_cas\` and confirm it</del><ins className="lm-diff-ins">\`est_rfc7030_settings.client_certificate_settings.validation_cas\`</ins> holds the expected CAs, in particular those of the old CA during rotation overlaps.
14. **API clients.** <del className="lm-diff-del">Update any script or console that uses</del><ins className="lm-diff-ins">Scripts and consoles no longer use</ins> the old DMS layout (flat \`additional_validation_cas\`, or the legacy \`mtls\`, \`apikey\` and \`oidc\` fields), <del className="lm-diff-del">since they silently drop those</del><ins className="lm-diff-ins">send DMS updates with the ID in the URL, and match on the new certificate \`type\`</ins> values.

<div className="lm-diff-ins lm-diff-block">
  Delete the old volumes [#delete-the-old-volumes]
</div>

<div className="lm-diff-ins lm-diff-block">
  Only once every check passes, delete the orphaned 3.8.0 volumes to reclaim storage. The delete is irreversible and the old KMS volume may hold the last copy of your CA key material, so take a \`VolumeSnapshot\` or a backup of both old PVCs first and keep it until you are confident the upgraded deployment is healthy:
</div>

<div className="lm-diff-ins lm-diff-block">
  \`\`\`bash
  kubectl delete pvc -n $NAMESPACE golang-engine-storage-kms-0 local-crl-file-storage-va-0
  \`\`\`
</div>

<div className="lm-diff-ins lm-diff-block">
  The 3.8.0 per-service databases are no longer used either. Drop them only after the same checks pass and your PostgreSQL backup is verified.
</div>

<Cards>
  <div className="lm-diff-del lm-diff-block">
    <Card title="Configure a DMS" href="/docs/platform/iot-fleets/enrollment/dms" />
  </div>

  <div className="lm-diff-del lm-diff-block">
    <Card title="DMS API" href="/docs/api-reference/dms-manager" />
  </div>

  <div className="lm-diff-ins lm-diff-block">
    <Card title="Install with Helm" description="Prepare dependencies, configure values and install a controlled deployment." href="/docs/deployment/self-hosted/helm" />
  </div>

  <div className="lm-diff-ins lm-diff-block">
    <Card title="Access control" description="Principals, policies and the first administrator." href="/docs/platform/administration/access-control" />
  </div>

  <div className="lm-diff-ins lm-diff-block">
    <Card title="Configure a DMS" description="Enrollment, re-enrollment and webhook settings." href="/docs/platform/iot-fleets/enrollment/dms" />
  </div>
</Cards>
`,o={title:"3.8.0 to 4.0.0",description:"What changes in the 4.0.0 architecture, which changes break a 3.8.0 deployment, how to upgrade a Helm release step by step and how to validate the result."},h={isNew:!1,changes:210,title:void 0,description:[{op:"del",text:"4.0.0"},{op:"ins",text:"What"},{op:"eq",text:" changes "},{op:"del",text:"that affect DMS configuration, what can break after upgrading from 3.8.0, and how to verify it"},{op:"ins",text:"in the 4.0.0 architecture, which changes break a 3.8.0 deployment, how to upgrade a Helm release step by step and how to validate the result"},{op:"eq",text:"."}]},c={contents:[{heading:void 0,content:"Lamassu 4.0.0 is a major release. Storage consolidates into a single PostgreSQL database, a new `authz` service authorizes every request, the Helm chart is hardened, and several APIs and stored configurations change shape. Most data converts automatically during the upgrade, but some changes need operator action before, during or after it."},{heading:void 0,content:"This page is organized in four parts. Read them in order before you upgrade production:"},{heading:void 0,content:"Architecture changes: what is different in 4.0.0 and what the upgrade migrates on its own."},{heading:void 0,content:"Breaking changes: every change that can break a 3.8.0 deployment, who it affects and what to do."},{heading:void 0,content:"Helm migration guide: the step-by-step procedure for a Helm-managed release."},{heading:void 0,content:"Validation checklist: how to confirm the upgrade worked before you remove the old data."},{heading:void 0,content:"The 4.0.0 release is upcoming and the backend migration steps on this page are provisional. Verify each procedure against the final release artifacts before upgrading production."},{heading:"one-postgresql-database-with-schemas",content:"3.8.0 gave each service its own database. The 4.0.0 backend connects to a single PostgreSQL database named `pki` and isolates each service in a schema: `kms`, `ca`, `va`, `devicemanager`, `dmsmanager` and `alerts`. The `authz` service keeps its principals, grants and policies in a separate `authz` database (the development monolith uses an `authz` schema inside `pki` instead), and WFX keeps its own `wfx` database."},{heading:"one-postgresql-database-with-schemas",content:"PostgreSQL is now the only storage engine. SQLite support is removed, and the `couch_db` and `dynamo_db` engines are not registered in 4.0.0."},{heading:"authorization-moves-into-the-authz-service",content:"In 3.8.0 the API Gateway validated tokens: a JWT policy on every private route checked the signature and only let through tokens that carried the administrator role. Every route was open to any token that passed that check."},{heading:"authorization-moves-into-the-authz-service",content:"4.0.0 removes the gateway policy. The `/api/*` routes reach the services directly, and each service authorizes every request through `authz`, which validates the token against the identity provider's JWKS endpoint and applies fine-grained, entity-level policies to CAs, certificates, devices, DMSs, KMS keys and VA roles. There is no implicit superuser: the first administrator comes from a bootstrap principal that you configure. The access control page documents principals, policies and the first administrator."},{heading:"device-events-get-their-own-store",content:"Historical device events move from the `devices.events` column to a dedicated `device_events` store with their own endpoints. The events endpoint can also stream events over Server-Sent Events (SSE); to fan events out across service instances, each Device Manager instance binds its own durable AMQP queue."},{heading:"a-hardened-helm-chart",content:"Version 4.0.0 of the chart is a security-hardening release:"},{heading:"a-hardened-helm-chart",content:"**Release-scoped resource names.** Every chart-managed resource is named `<release>-lamassu-<component>` instead of the fixed names used in 3.8.0 (`kms`, `va`, `ca`, ...). With a release named `prod` the StatefulSets become `prod-lamassu-kms` and `prod-lamassu-va`. The `nameOverride` and `fullnameOverride` values change the prefix."},{heading:"a-hardened-helm-chart",content:"**Non-root containers.** Every workload runs as the numeric user `65532:65532` with a `RuntimeDefault` seccomp profile and dropped capabilities. Pods do not mount the service-account token by default, and the chart creates a dedicated ServiceAccount."},{heading:"a-hardened-helm-chart",content:"**Strict values validation.** `values.schema.json` rejects unknown keys, so leftover 3.8.0 blocks fail `helm lint` and `helm upgrade` instead of being silently ignored."},{heading:"a-hardened-helm-chart",content:"**No injected scheduling rules.** The chart no longer adds pod anti-affinity or topology spread constraints on its own."},{heading:"what-the-upgrade-migrates-automatically",content:"Several migrations run without intervention when you upgrade a Helm release:"},{heading:"what-the-upgrade-migrates-automatically",content:"Before any service starts, the chart's pre-install/pre-upgrade job prepares PostgreSQL. It creates the `pki`, `authz` and `wfx` databases when they do not exist, creates one schema per service inside `pki`, and imports each 3.8.0 per-service database into its schema. Each import runs as a single transaction, so a failed import leaves no partial schema and a retried job imports again. The job then runs the database migrations for every schema, migrates `authz`, preloads its policies and seeds the `services.authz.bootstrap` principals. It is idempotent and requires a PostgreSQL role allowed to create databases and schemas, as described in Install with Helm."},{heading:"what-the-upgrade-migrates-automatically",content:"Stored DMS configuration is rewritten to the 4.0.0 layout, and historical device events are transformed into the new store."},{heading:"what-the-upgrade-migrates-automatically",content:"When `migrations.caToKms.enabled` is set, a pre-upgrade hook registers legacy CA keys in the KMS."},{heading:"what-the-upgrade-migrates-automatically",content:"Two things never migrate on their own: the KMS and VA data on local volumes, which stays on volumes the upgraded pods no longer use, and the values file, which you update by hand. Deployments that do not use the Helm chart also have to move their database data themselves; see Deployments without Helm."},{heading:"breaking-changes",content:"Change"},{heading:"breaking-changes",content:"Who is affected"},{heading:"breaking-changes",content:"Severity"},{heading:"breaking-changes",content:"Action"},{heading:"breaking-changes",content:"Release-scoped resource names"},{heading:"breaking-changes",content:"Helm releases with a filesystem KMS engine or local VA CRL storage"},{heading:"breaking-changes",content:"High: KMS and VA start on empty volumes"},{heading:"breaking-changes",content:"Copy the data into the new volumes"},{heading:"breaking-changes",content:"Strict values validation"},{heading:"breaking-changes",content:"Every Helm release"},{heading:"breaking-changes",content:"High: `helm upgrade` fails"},{heading:"breaking-changes",content:"Remove or rename legacy keys"},{heading:"breaking-changes",content:"Required authorization configuration"},{heading:"breaking-changes",content:"Every deployment"},{heading:"breaking-changes",content:"High: without a bootstrap principal there is no administrator"},{heading:"breaking-changes",content:"Configure `services.authz`"},{heading:"breaking-changes",content:"Gateway token validation removed"},{heading:"breaking-changes",content:"Every Helm release"},{heading:"breaking-changes",content:"High: `helm upgrade` fails on the old keys"},{heading:"breaking-changes",content:"Move JWKS and roles into `services.authz`"},{heading:"breaking-changes",content:"PostgreSQL consolidation"},{heading:"breaking-changes",content:"3.8.0 deployments with per-service databases"},{heading:"breaking-changes",content:"High: services find no data, or a migration aborts"},{heading:"breaking-changes",content:"Clean duplicate CA IDs and empty `engine_id` values first; move data manually outside Helm"},{heading:"breaking-changes",content:"SQLite storage removed"},{heading:"breaking-changes",content:"Deployments on SQLite, `couch_db` or `dynamo_db`"},{heading:"breaking-changes",content:"High: the backend no longer starts with them"},{heading:"breaking-changes",content:"Move to PostgreSQL before upgrading"},{heading:"breaking-changes",content:"Webhooks with file references"},{heading:"breaking-changes",content:"DMSs whose webhook mTLS certificate or key were file paths"},{heading:"breaking-changes",content:"High: enrollments calling the webhook fail"},{heading:"breaking-changes",content:"Re-enter certificate and key as PEM, or remove the file fields"},{heading:"breaking-changes",content:"Non-root containers"},{heading:"breaking-changes",content:"Releases with per-service identity overrides or mounted key material"},{heading:"breaking-changes",content:"Medium: services cannot read their files"},{heading:"breaking-changes",content:"Remove the overrides and fix volume ownership"},{heading:"breaking-changes",content:"AMQP over TLS"},{heading:"breaking-changes",content:"Releases that set `amqp.tls`"},{heading:"breaking-changes",content:"Medium: clients connect to the wrong port"},{heading:"breaking-changes",content:"Point `amqp.port` at the TLS listener, or disable TLS"},{heading:"breaking-changes",content:"Legacy CA keys in the KMS"},{heading:"breaking-changes",content:"Installations whose CA keys predate the KMS"},{heading:"breaking-changes",content:"Medium: CA keys stay unmanaged"},{heading:"breaking-changes",content:"Run the CA-to-KMS migration"},{heading:"breaking-changes",content:"Receiver certificate verification"},{heading:"breaking-changes",content:"DMSs whose webhook had `validate_server_cert: false`"},{heading:"breaking-changes",content:"Medium: credentials go to an unverified receiver"},{heading:"breaking-changes",content:"Set `insecure_skip_verify` to `false`"},{heading:"breaking-changes",content:"Re-enrollment trust set"},{heading:"breaking-changes",content:"Scripts and consoles that edit DMSs through the API"},{heading:"breaking-changes",content:"Medium: an old-layout edit silently empties `validation_cas`"},{heading:"breaking-changes",content:"Read the DMS before editing and use the new field"},{heading:"breaking-changes",content:"Device events"},{heading:"breaking-changes",content:"Consumers that read the device `events` field"},{heading:"breaking-changes",content:"Medium: the field disappears"},{heading:"breaking-changes",content:"Use the new event endpoints"},{heading:"breaking-changes",content:"Renamed and reshaped values"},{heading:"breaking-changes",content:"Releases that override `toolbox`, `services.connectors`, ports, probes or scheduling"},{heading:"breaking-changes",content:"Low to medium: validation errors or changed defaults"},{heading:"breaking-changes",content:"Update the values file"},{heading:"breaking-changes",content:"DMS update API"},{heading:"breaking-changes",content:"Clients that send the DMS ID in the update body"},{heading:"breaking-changes",content:"Low: the ID in the URL wins"},{heading:"breaking-changes",content:"Send the ID in the URL"},{heading:"breaking-changes",content:"Certificate type values"},{heading:"breaking-changes",content:"Consumers that match on certificate `type`"},{heading:"breaking-changes",content:"Low: two values are renamed"},{heading:"breaking-changes",content:"Adapt consumers"},{heading:"breaking-changes",content:"Independent re-enrollment authentication"},{heading:"breaking-changes",content:"Any DMS"},{heading:"breaking-changes",content:"Low: informational"},{heading:"breaking-changes",content:"Read both blocks before editing"},{heading:"release-scoped-resource-names",content:"Kubernetes derives a StatefulSet's PVC name from its pod name (`<volumeClaimTemplate>-<pod-name>`). Renaming the `kms` and `va` StatefulSets means `helm upgrade` binds brand-new, empty PVCs instead of the existing ones. The KMS key material and VA CRLs are not deleted — the old PVCs are orphaned, not removed — but the upgraded pods fail with `no such file or directory` (KMS) or `code=NotFound` (VA) until you copy the data across. This affects KMS when `services.kms.cryptoEngines` uses a `filesystem` engine and VA when `services.va.fileStore.type` is `local`. Every other renamed resource is stateless and is recreated without data-loss risk."},{heading:"release-scoped-resource-names",content:"Step 4 of the migration guide copies the data."},{heading:"strict-values-validation",content:"`values.schema.json` rejects unknown keys, so every block that 4.0.0 removed or renamed — `toolbox`, `auth.oidc.apiGateway`, `auth.authorization` and others — fails `helm lint` and `helm upgrade` outright. Step 2 lists every change."},{heading:"required-authorization-configuration",content:"3.8.0 had no authorization service, so a 3.8.0 values file has nothing to migrate from: you must add the `services.authz` configuration yourself. It needs the JWKS endpoint of your identity provider, the database mappings the authorization engine uses, and a bootstrap principal that matches how your provider assigns the administrator role. Without a matching principal nobody can administer the PKI."},{heading:"gateway-token-validation-removed",content:"`auth.oidc.apiGateway.jwks`, `auth.authorization.rolesClaim` and `auth.authorization.roles.admin` are removed with no compatibility aliases, and the schema rejects them. Their settings move into `services.authz`: the JWKS URL becomes `services.authz.jwkUrl`, and the role claim and administrator role become a claim rule of the bootstrap principal. `auth.oidc.frontend` is unchanged."},{heading:"non-root-containers",content:"Service images run on a distroless base as the numeric user `65532`; the `authz` image is Ubuntu with a non-root user that has the same UID. The per-service overrides `services.kms.securityContext.runAsGroup: 0` and `services.authz.securityContext.runAsUser`/`runAsGroup: 999` are removed; group access to the KMS volume and PKCS#11 socket is now handled by the pod-level `fsGroup: 65532`."},{heading:"non-root-containers",content:"3.8.0 did not pin a container identity, so existing files can carry any UID. Any volume that holds keys or CRLs must be owned by `65532:65532`, or at least readable (and, where needed, writable) by that identity."},{heading:"amqp-over-tls",content:"In 3.8.0 `amqp.tls` was not applied and event-bus clients always connected over plaintext. In 4.0.0 `amqp.tls: true` switches them to AMQPS. The default `amqp.port` stays `5672` and does not change when TLS is enabled, so a values file that already set `amqp.tls: true` must point `amqp.port` at the broker's TLS listener (`amqps`, commonly `5671`), or set `amqp.tls: false` to keep plaintext. Clients must also trust the broker's certificate."},{heading:"renamed-and-reshaped-values",content:"`toolbox` is renamed to `connectivityTest`, and the `helm test` hook uses the upstream `curlimages/curl` image pinned by digest."},{heading:"renamed-and-reshaped-values",content:"`services.connectors` is a map keyed by connector ID instead of a list."},{heading:"renamed-and-reshaped-values",content:"The `services.ui.port` default is `8085`, the unprivileged port of the rootless image."},{heading:"renamed-and-reshaped-values",content:"The shared `probes:` block is replaced by independent `livenessProbe`, `readinessProbe` and `startupProbe` blocks."},{heading:"renamed-and-reshaped-values",content:"With `tls.certManagerOptions.issuer` empty, the chart creates a release-scoped self-signed issuer, for example `lamassu-downstream-ca-selfsigned-issuer`. The legacy literal `downstream-ca-selfsigned-issuer` is still accepted and resolves to it."},{heading:"renamed-and-reshaped-values",content:"Anti-affinity and topology spread must be configured explicitly through `affinity` and `topologySpreadConstraints`."},{heading:"postgresql-consolidation",content:"Every 3.8.0 per-service database must end up as a schema of `pki`, keeping its structure, indexes, constraints, data and migration history. The Helm chart does this automatically; deployments without Helm do it by hand (see Deployments without Helm)."},{heading:"postgresql-consolidation",content:"Two schema migrations abort on data that 3.8.0 allowed, so clean the data before upgrading:"},{heading:"postgresql-consolidation",content:"The CA migration adds a UNIQUE constraint on `ca_certificates.id` and aborts if duplicate CA IDs exist. Imports already reject duplicates with `409`, so new ones cannot normally appear."},{heading:"postgresql-consolidation",content:"The KMS migration promotes the primary key to `(key_id, engine_id)` and aborts with `cannot promote (key_id, engine_id) to primary key: N row(s) have no engine_id; backfill them before migrating` when `kms_keys` rows lack `engine_id`. Backfill `engine_id` first."},{heading:"postgresql-consolidation",content:"The same KMS migration deletes, with a `NOTICE`, aliases that equal an existing key ID, because identifiers now resolve as a key ID before an alias. Affected aliases are dropped, not redirected."},{heading:"sqlite-storage-removed",content:"The SQLite storage engine is removed, and the `couch_db` and `dynamo_db` engines are not registered in 4.0.0: their configuration constants remain, but they select no engine. Deployments on any of them must move to PostgreSQL and consolidate their data into the `pki` schemas before upgrading."},{heading:"legacy-ca-keys-in-the-kms",content:"CA certificates of type `MANAGED` or `IMPORTED_WITH_KEY` whose private keys predate the KMS service have the key stored only in the crypto engine, under the certificate's `subject_key_id`, with no KMS record. The `ca-to-kms-migration` tool registers them:"},{heading:"legacy-ca-keys-in-the-kms",content:"The `key_id` is the certificate's `subject_key_id` (SHA-256 of the public key)."},{heading:"legacy-ca-keys-in-the-kms",content:"The tool is idempotent: keys already in the KMS are skipped, so it can be run several times."},{heading:"legacy-ca-keys-in-the-kms",content:"Certificates that cannot be read, or lack an engine or a subject key ID, are skipped with a warning. Review the logs and resolve the affected records."},{heading:"legacy-ca-keys-in-the-kms",content:"When CA certificates sharing a `subject_key_id` declare conflicting `engine_id`s, the tool fails that key and exits with code `1`, which fails a Helm pre-upgrade hook. Resolve the conflict manually before rerunning."},{heading:"legacy-ca-keys-in-the-kms",content:"With Helm, enable the hook for the upgrade in step 2; without Helm, run the tool by hand."},{heading:"dms-webhooks",content:"Stored webhook configs are rewritten to the current layout and their fields renamed:"},{heading:"dms-webhooks",content:"Field in 3.8.0"},{heading:"dms-webhooks",content:"Field in 4.0.0"},{heading:"dms-webhooks",content:"`validate_server_cert`"},{heading:"dms-webhooks",content:"`insecure_skip_verify` (value negated)"},{heading:"dms-webhooks",content:"`oidc`"},{heading:"dms-webhooks",content:"`jwt_options`"},{heading:"dms-webhooks",content:"`apikey`"},{heading:"dms-webhooks",content:"`apikey_options`"},{heading:"dms-webhooks",content:"`mtls`"},{heading:"dms-webhooks",content:"`mtls_options`"},{heading:"dms-webhooks",content:"When the legacy mTLS certificate and key are both PEM, they move into `mtls_options.cert_content` and `mtls_options.key_content` and need no action. Two cases do need it."},{heading:"dms-webhooks",content:"**Webhooks with file references.** A mixed config, with a PEM certificate and a file-path key, is migrated to `mtls_options.cert_file` and `mtls_options.key_file`. Webhook delivery rejects those fields on every call, whatever the configured authentication mode, so every enroll and re-enroll that calls that webhook fails until the config is fixed. If the webhook uses mTLS, re-enter the certificate and key as Base64-encoded or plain PEM; if it does not, remove the leftover file fields. Metadata-only updates keep working in the meantime (`PUT` or `PATCH` on `/v1/dms/:id/metadata`). In a variant of the same problem, a stored config with file paths inside `mtls_options.cert_content` or `mtls_options.key_content` makes every full settings update (`POST /v1/dms` or `PUT /v1/dms/:id`) fail validation; settings are replaced wholesale, so resend the config with the certificate and key as PEM."},{heading:"dms-webhooks",content:"**Receiver certificate verification.** A config with `validate_server_cert: false` becomes `insecure_skip_verify: true`, so receiver verification stays skipped until that field is set to `false`. Correct it on every migrated config: the webhook authorization channel carries the API key or bearer token, and skipping verification exposes those credentials to a network-positioned attacker. Keep `insecure_skip_verify: true` only when the receiver certificate is deliberately unverifiable."},{heading:"re-enrollment-trust-set",content:"The flat field `reenrollment_settings.additional_validation_cas` moves into the nested field `reenrollment_settings.est_rfc7030_settings.client_certificate_settings.validation_cas`:"},{heading:"re-enrollment-trust-set",content:"The effective trust set does not change, because the nested value was never consulted when validating re-enrollments. If the flat list was missing or null, it becomes an empty list."},{heading:"re-enrollment-trust-set",content:"What changes is how API requests are handled. Bodies that still carry `additional_validation_cas` are accepted, but the value is silently dropped because unknown JSON fields are ignored, and GET responses no longer include it. An update body built from the old layout therefore empties `validation_cas` without any error. Always read the DMS before sending an edit and reuse the layout the API returns."},{heading:"independent-re-enrollment-authentication",content:"Re-enrollment authentication settings are now stored independently from initial authentication. Nothing needs migrating, but read both blocks before editing a DMS so that you do not modify one while believing you are editing the other. If the console version does not expose independent settings, edit them through the DMS API."},{heading:"dms-update-api",content:"`PUT /v1/dms/:id` takes the DMS ID from the URL and validates the request body. An ID in the body is ignored, so update clients that relied on it."},{heading:"certificate-type-values",content:"Stored certificate type values are renamed: `IMPORTED` becomes `IMPORTED_WITH_KEY` and `EXTERNAL` becomes `IMPORTED_WITHOUT_KEY`. `MANAGED` is unchanged. Adapt consumers that read or match on those values."},{heading:"device-events",content:"The `events` field no longer appears in the device representation. Point consumers at the new endpoints:"},{heading:"device-events",content:"`GET /v1/devices/:id/events` returns a device's events."},{heading:"device-events",content:"`POST /v1/devices/:id/events` creates an event."},{heading:"device-events",content:"When the request `Accept` header includes `text/event-stream`, the events endpoint streams over SSE with a keepalive every 15 seconds, and returns `501` when SSE is disabled in the deployment. Each Device Manager instance binds a durable AMQP queue named after its service ID, `device-manager-sse-<uuid>`. Queues from crashed or replaced instances linger until removed, so configure an expiration or cleanup policy on the broker."},{heading:"helm-migration-guide",content:"The upgrade runs in a fixed order: prepare the data and values, run `helm upgrade`, then copy the KMS and VA data into the new volumes. The copy must run after the upgrade, because the destination StatefulSets and PVCs do not exist before it. If you are not upgrading an existing release, go straight to Install with Helm."},{heading:"step-1-prepare",content:"Take a verifiable backup of PostgreSQL and schedule downtime. The upgrade moves every service's data into `pki`."},{heading:"step-1-prepare",content:"If the deployment runs on SQLite, `couch_db` or `dynamo_db`, move it to PostgreSQL first."},{heading:"step-1-prepare",content:"Resolve duplicate CA IDs and backfill `engine_id` in `kms_keys`, as described in PostgreSQL consolidation."},{heading:"step-1-prepare",content:"Record the names of your local-storage PVCs:"},{heading:"step-1-prepare",content:"`helm upgrade` does not touch or delete the old PVCs, but nothing references them after the upgrade. You need their names to copy the data and to clean up later."},{heading:"step-2-update-the-values-file",content:"**Add `services.authz`.** Configure the JWKS endpoint, the database mappings and the bootstrap principal:"},{heading:"step-2-update-the-values-file",content:"`jwkUrl` is fetched from the `authz` pod, not from the gateway, so a Service in the release namespace can be referenced by its short name. The default points at a Keycloak Service named `auth-keycloak`; set it explicitly if your identity provider lives anywhere else."},{heading:"step-2-update-the-values-file",content:"`authz` is the authorization service's own storage for principals, grants and policies. `pki` is the database the authorization engine queries when it evaluates policies against entities. Only the `database` field of each entry is read; the connection always uses the global `postgres.hostname`, `postgres.port`, `postgres.username` and `postgres.password` values."},{heading:"step-2-update-the-values-file",content:"If you kept the 3.8.0 role defaults (`realm_access.roles` and `pki-admin`), the default `services.authz.bootstrap` already matches them."},{heading:"step-2-update-the-values-file",content:"**Delete the gateway token validation blocks.** Remove `auth.oidc.apiGateway` and `auth.authorization` once their settings are in `services.authz`:"},{heading:"step-2-update-the-values-file",content:"**Rename `toolbox` to `connectivityTest`:**"},{heading:"step-2-update-the-values-file",content:"**Remove the per-service identity overrides** `services.kms.securityContext.runAsGroup` and `services.authz.securityContext.runAsUser`/`runAsGroup`."},{heading:"step-2-update-the-values-file",content:"**Convert `services.connectors` to a map** keyed by connector ID, each entry with its `type` and `image`:"},{heading:"step-2-update-the-values-file",content:"**Check AMQP.** If you set `amqp.tls: true`, also set `amqp.port` to the broker's TLS listener (commonly `5671`), or set `amqp.tls: false` to stay on plaintext."},{heading:"step-2-update-the-values-file",content:"**Enable the CA-to-KMS migration** if your CA keys predate the KMS:"},{heading:"step-2-update-the-values-file",content:"**Review the remaining values:** overrides that pinned `services.ui.port` to `80`, the old `probes:` block, the TLS issuer, and explicit `affinity` and `topologySpreadConstraints` where your cluster needs them. Renamed and reshaped values describes each one."},{heading:"step-2-update-the-values-file",content:"Run `helm lint` with the new values before upgrading; the strict schema reports any key that is still unknown."},{heading:"step-3-run-the-upgrade",content:"Helm runs the pre-upgrade hooks — the CA-to-KMS migration when enabled, and the database job — before applying any workload, so services never start against an unprepared database. If validation rejects unknown values, fix the values file and re-run. If the deployment uses local KMS or VA storage, those pods fail until you complete step 4."},{heading:"step-4-migrate-the-kms-and-va-data",content:"Skip this step when `services.kms.cryptoEngines` never used a `filesystem` engine and `services.va.fileStore.type` was never `local`."},{heading:"step-4-migrate-the-kms-and-va-data",content:"**Find the new StatefulSets and PVCs.** Their names depend on the release name and any `nameOverride` or `fullnameOverride`; the PVC name is `<volumeClaimTemplate>-<StatefulSet name>-0`:"},{heading:"step-4-migrate-the-kms-and-va-data",content:"With release `lamassu` and the default chart name, the new PVCs are `golang-engine-storage-lamassu-kms-0` and `local-crl-file-storage-lamassu-va-0`; with release `prod` they are `golang-engine-storage-prod-lamassu-kms-0` and `local-crl-file-storage-prod-lamassu-va-0`. Confirm both old and new PVCs exist before continuing. If you only migrate one of the two services, drop the other one's claims from the commands that follow."},{heading:"step-4-migrate-the-kms-and-va-data",content:"**Record the replica counts and scale the new StatefulSets down** so nothing writes to either volume while you copy:"},{heading:"step-4-migrate-the-kms-and-va-data",content:"**Run a short-lived helper pod** that mounts all four claims. It runs as root so it can change file ownership, so pin its image by digest and do not mount the service-account token:"},{heading:"step-4-migrate-the-kms-and-va-data",content:"**Inspect before writing** so you do not clobber data the new pods may already have written:"},{heading:"step-4-migrate-the-kms-and-va-data",content:"An empty result is the common case: a StatefulSet's own pod rarely gets far enough to write anything when its dependent data is missing. If the output is not empty, record the files and confirm with the service owner that they are disposable before you run the copy; do not overlay the 3.8.0 data onto an unknown store."},{heading:"step-4-migrate-the-kms-and-va-data",content:"**Copy the data, align ownership and verify the copy.** The second command must print `copy verified`; any `diff` output means the copy is incomplete, so do not continue:"},{heading:"step-4-migrate-the-kms-and-va-data",content:"The `chown` is required even if the old files already look non-root-owned, because 4.0.0 requires exactly `65532:65532` and does not fall back to whatever the image declares."},{heading:"step-4-migrate-the-kms-and-va-data",content:"**Remove the helper and restore the recorded replica counts:**"},{heading:"step-5-remove-the-one-off-migration-values",content:"After the upgrade that performed the CA-to-KMS migration succeeds, remove `migrations.caToKms.enabled` from your values (it defaults to `false`). The hook reads the legacy 3.8.0 `kms-config` ConfigMap while it still exists and falls back to the release-scoped `<release>-lamassu-kms-config` once it is gone."},{heading:"step-5-remove-the-one-off-migration-values",content:"Then go through the validation checklist. Keep the old PVCs until it passes."},{heading:"deployments-without-helm",content:"Without the chart's database job, no tool moves data between databases: the migration tooling only applies migrations to a schema that already exists. Move each per-service database into its `pki` schema yourself, preserving structure, indexes, constraints, data and migration history, with writes stopped and a verified backup in hand."},{heading:"deployments-without-helm",content:"To apply migrations by hand, `goose-lamassu` must run against the `pki` database with `search_path=<schema>` in the connection string. The binary validates only `search_path`, not the database name, so check `dbname=pki` before running it, and repeat for `kms`, `ca`, `va`, `devicemanager`, `dmsmanager` and `alerts`:"},{heading:"deployments-without-helm",content:"Run `ca-to-kms-migration` first with `--dry-run`, which reports without writing to KMS storage, and then for real:"},{heading:"deployments-without-helm",content:"Point the tool's `storage` configuration at the `pki` database, where the CA and KMS data now live in the `ca` and `kms` schemas. The tool's options are described in `backend/cmd/ca-to-kms-migration/README.md` in the `lamassuiot` repository."},{heading:"deployments-without-helm",content:"The `goose-lamassu` README still shows per-database examples (`dbname=ca`, `dbname=kms`) and claims the tool validates the database name, and the `ca-to-kms-migration` README still describes the pre-4.0.0 two-database layout. Follow the `dbname=pki` form on this page instead of their examples."},{heading:"troubleshooting",content:"**KMS or VA pods crash with `no such file or directory` or `code=NotFound` right after the upgrade.** The pods are bound to the new, empty PVCs and the data migration has not run yet, or was copied into the wrong PVC. Follow step 4 and check that all four claims exist."},{heading:"troubleshooting",content:"**`helm upgrade` fails with an unknown-key validation error.** Remove or rename the legacy values — typically `toolbox`, `auth.oidc.apiGateway` or `auth.authorization` — because the strict schema rejects keys it does not know."},{heading:"troubleshooting",content:"**The upgrade fails at the database job.** The PostgreSQL role cannot create databases or schemas, or a schema migration aborted on duplicate CA IDs or missing `engine_id` values. Check the job logs, fix the privileges or the data, and re-run the upgrade."},{heading:"troubleshooting",content:"**The upgrade fails at the CA-to-KMS hook.** CA certificates that share a `subject_key_id` declare conflicting `engine_id`s. Resolve the conflict and re-run."},{heading:"troubleshooting",content:"**Nobody can log in after the upgrade.** Check that `services.authz.jwkUrl` is reachable from the `authz` pod, that `services.authz.bootstrap` matches a role your OIDC provider actually assigns, and that the database job completed."},{heading:"validation-checklist",content:"After the upgrade, check in this order:"},{heading:"validation-checklist",content:"**Databases.** Each service reads the `pki` database with its own schema, `authz` and `wfx` data are reachable, and the migration status is registered per schema, including the CA unique-ID and KMS composite-key migrations."},{heading:"validation-checklist",content:"**KMS and VA start cleanly.** Their logs show no `no such file or directory` or `code=NotFound` errors."},{heading:"validation-checklist",content:"**Existing KMS keys work.** Issue a certificate from a CA that existed before the upgrade. None of the other checks reads a KMS key, so this is the only one that proves the key material was copied."},{heading:"validation-checklist",content:"**Existing CRLs are served.** `GET /crl/<ca-ski>` on VA returns a previously issued CRL, and new CRLs are issued."},{heading:"validation-checklist",content:"**Legacy CA keys.** If the CA-to-KMS migration ran, review its report and warnings and confirm the expected keys appear in the KMS."},{heading:"validation-checklist",content:'**Connectivity.** `helm test "$RELEASE" -n $NAMESPACE --logs` passes; the hook checks the CA, DMS Manager, Device Manager and VA health endpoints and the UI response.'},{heading:"validation-checklist",content:"**Authorization.** Sign in as the bootstrap principal and confirm administration works, check that an identity without permissions receives `403`, and review client and integration permissions."},{heading:"validation-checklist",content:"**AMQP.** The backend connects to the broker with the expected TLS settings, and the cleanup policy for SSE queues is in place."},{heading:"validation-checklist",content:"**Device events.** `GET /v1/devices/:id/events` returns the historical events of a device that had them."},{heading:"validation-checklist",content:"**Webhooks without file fields.** For each DMS that uses a webhook for enrollment or re-enrollment, the `config` block carries `insecure_skip_verify` and the expected option block (`apikey_options`, `jwt_options` or `mtls_options`), with the certificate and key as PEM and no `cert_file` or `key_file`."},{heading:"validation-checklist",content:"**Receiver verification.** `insecure_skip_verify` is `false`, unless the receiver certificate is intentionally unverified."},{heading:"validation-checklist",content:"**Webhook delivery.** One enroll or re-enroll through each migrated webhook completes its authorization call."},{heading:"validation-checklist",content:"**Trust set.** `est_rfc7030_settings.client_certificate_settings.validation_cas` holds the expected CAs, in particular those of the old CA during rotation overlaps."},{heading:"validation-checklist",content:"**API clients.** Scripts and consoles no longer use the old DMS layout (flat `additional_validation_cas`, or the legacy `mtls`, `apikey` and `oidc` fields), send DMS updates with the ID in the URL, and match on the new certificate `type` values."},{heading:"delete-the-old-volumes",content:"Only once every check passes, delete the orphaned 3.8.0 volumes to reclaim storage. The delete is irreversible and the old KMS volume may hold the last copy of your CA key material, so take a `VolumeSnapshot` or a backup of both old PVCs first and keep it until you are confident the upgraded deployment is healthy:"},{heading:"delete-the-old-volumes",content:"The 3.8.0 per-service databases are no longer used either. Drop them only after the same checks pass and your PostgreSQL backup is verified."},{heading:"delete-the-old-volumes",content:'<Card title="Install with Helm" description="Prepare dependencies, configure values and install a controlled deployment." href="/docs/deployment/self-hosted/helm" />'},{heading:"delete-the-old-volumes",content:'<Card title="Access control" description="Principals, policies and the first administrator." href="/docs/platform/administration/access-control" />'},{heading:"delete-the-old-volumes",content:'<Card title="Configure a DMS" description="Enrollment, re-enrollment and webhook settings." href="/docs/platform/iot-fleets/enrollment/dms" />'}],headings:[{id:"architecture-changes",content:"Architecture changes"},{id:"one-postgresql-database-with-schemas",content:"One PostgreSQL database with schemas"},{id:"authorization-moves-into-the-authz-service",content:"Authorization moves into the authz service"},{id:"device-events-get-their-own-store",content:"Device events get their own store"},{id:"a-hardened-helm-chart",content:"A hardened Helm chart"},{id:"what-the-upgrade-migrates-automatically",content:"What the upgrade migrates automatically"},{id:"breaking-changes",content:"Breaking changes"},{id:"helm-chart-and-values",content:"Helm chart and values"},{id:"release-scoped-resource-names",content:"Release-scoped resource names"},{id:"strict-values-validation",content:"Strict values validation"},{id:"required-authorization-configuration",content:"Required authorization configuration"},{id:"gateway-token-validation-removed",content:"Gateway token validation removed"},{id:"non-root-containers",content:"Non-root containers"},{id:"amqp-over-tls",content:"AMQP over TLS"},{id:"renamed-and-reshaped-values",content:"Renamed and reshaped values"},{id:"data-and-storage",content:"Data and storage"},{id:"postgresql-consolidation",content:"PostgreSQL consolidation"},{id:"sqlite-storage-removed",content:"SQLite storage removed"},{id:"legacy-ca-keys-in-the-kms",content:"Legacy CA keys in the KMS"},{id:"apis-and-stored-configuration",content:"APIs and stored configuration"},{id:"dms-webhooks",content:"DMS webhooks"},{id:"re-enrollment-trust-set",content:"Re-enrollment trust set"},{id:"independent-re-enrollment-authentication",content:"Independent re-enrollment authentication"},{id:"dms-update-api",content:"DMS update API"},{id:"certificate-type-values",content:"Certificate type values"},{id:"device-events",content:"Device events"},{id:"helm-migration-guide",content:"Helm migration guide"},{id:"step-1-prepare",content:"Step 1: Prepare"},{id:"step-2-update-the-values-file",content:"Step 2: Update the values file"},{id:"step-3-run-the-upgrade",content:"Step 3: Run the upgrade"},{id:"step-4-migrate-the-kms-and-va-data",content:"Step 4: Migrate the KMS and VA data"},{id:"step-5-remove-the-one-off-migration-values",content:"Step 5: Remove the one-off migration values"},{id:"deployments-without-helm",content:"Deployments without Helm"},{id:"troubleshooting",content:"Troubleshooting"},{id:"validation-checklist",content:"Validation checklist"},{id:"delete-the-old-volumes",content:"Delete the old volumes"}]};const m=[{depth:2,url:"#architecture-changes",title:e.jsx(e.Fragment,{children:"Architecture changes"})},{depth:3,url:"#one-postgresql-database-with-schemas",title:e.jsx(e.Fragment,{children:"One PostgreSQL database with schemas"})},{depth:3,url:"#authorization-moves-into-the-authz-service",title:e.jsx(e.Fragment,{children:"Authorization moves into the authz service"})},{depth:3,url:"#device-events-get-their-own-store",title:e.jsx(e.Fragment,{children:"Device events get their own store"})},{depth:3,url:"#a-hardened-helm-chart",title:e.jsx(e.Fragment,{children:"A hardened Helm chart"})},{depth:3,url:"#what-the-upgrade-migrates-automatically",title:e.jsx(e.Fragment,{children:"What the upgrade migrates automatically"})},{depth:2,url:"#breaking-changes",title:e.jsx(e.Fragment,{children:"Breaking changes"})},{depth:3,url:"#helm-chart-and-values",title:e.jsx(e.Fragment,{children:"Helm chart and values"})},{depth:4,url:"#release-scoped-resource-names",title:e.jsx(e.Fragment,{children:"Release-scoped resource names"})},{depth:4,url:"#strict-values-validation",title:e.jsx(e.Fragment,{children:"Strict values validation"})},{depth:4,url:"#required-authorization-configuration",title:e.jsx(e.Fragment,{children:"Required authorization configuration"})},{depth:4,url:"#gateway-token-validation-removed",title:e.jsx(e.Fragment,{children:"Gateway token validation removed"})},{depth:4,url:"#non-root-containers",title:e.jsx(e.Fragment,{children:"Non-root containers"})},{depth:4,url:"#amqp-over-tls",title:e.jsx(e.Fragment,{children:"AMQP over TLS"})},{depth:4,url:"#renamed-and-reshaped-values",title:e.jsx(e.Fragment,{children:"Renamed and reshaped values"})},{depth:3,url:"#data-and-storage",title:e.jsx(e.Fragment,{children:"Data and storage"})},{depth:4,url:"#postgresql-consolidation",title:e.jsx(e.Fragment,{children:"PostgreSQL consolidation"})},{depth:4,url:"#sqlite-storage-removed",title:e.jsx(e.Fragment,{children:"SQLite storage removed"})},{depth:4,url:"#legacy-ca-keys-in-the-kms",title:e.jsx(e.Fragment,{children:"Legacy CA keys in the KMS"})},{depth:3,url:"#apis-and-stored-configuration",title:e.jsx(e.Fragment,{children:"APIs and stored configuration"})},{depth:4,url:"#dms-webhooks",title:e.jsx(e.Fragment,{children:"DMS webhooks"})},{depth:4,url:"#re-enrollment-trust-set",title:e.jsx(e.Fragment,{children:"Re-enrollment trust set"})},{depth:4,url:"#independent-re-enrollment-authentication",title:e.jsx(e.Fragment,{children:"Independent re-enrollment authentication"})},{depth:4,url:"#dms-update-api",title:e.jsx(e.Fragment,{children:"DMS update API"})},{depth:4,url:"#certificate-type-values",title:e.jsx(e.Fragment,{children:"Certificate type values"})},{depth:4,url:"#device-events",title:e.jsx(e.Fragment,{children:"Device events"})},{depth:2,url:"#helm-migration-guide",title:e.jsx(e.Fragment,{children:"Helm migration guide"})},{depth:3,url:"#step-1-prepare",title:e.jsx(e.Fragment,{children:"Step 1: Prepare"})},{depth:3,url:"#step-2-update-the-values-file",title:e.jsx(e.Fragment,{children:"Step 2: Update the values file"})},{depth:3,url:"#step-3-run-the-upgrade",title:e.jsx(e.Fragment,{children:"Step 3: Run the upgrade"})},{depth:3,url:"#step-4-migrate-the-kms-and-va-data",title:e.jsx(e.Fragment,{children:"Step 4: Migrate the KMS and VA data"})},{depth:3,url:"#step-5-remove-the-one-off-migration-values",title:e.jsx(e.Fragment,{children:"Step 5: Remove the one-off migration values"})},{depth:3,url:"#deployments-without-helm",title:e.jsx(e.Fragment,{children:"Deployments without Helm"})},{depth:3,url:"#troubleshooting",title:e.jsx(e.Fragment,{children:"Troubleshooting"})},{depth:2,url:"#validation-checklist",title:e.jsxs(e.Fragment,{children:[e.jsx("del",{className:"lm-diff-del",children:"Verification"}),e.jsx("ins",{className:"lm-diff-ins",children:"Validation"})," checklist"]})},{depth:3,url:"#delete-the-old-volumes",title:e.jsx(e.Fragment,{children:"Delete the old volumes"})}];function d(s){const i={a:"a",code:"code",del:"del",div:"div",h2:"h2",h3:"h3",h4:"h4",ins:"ins",li:"li",ol:"ol",p:"p",pre:"pre",span:"span",strong:"strong",table:"table",tbody:"tbody",td:"td",th:"th",thead:"thead",tr:"tr",ul:"ul",...s.components},{Callout:a,Card:n,Cards:l}=i;return a||t("Callout"),n||t("Card"),l||t("Cards"),e.jsxs(e.Fragment,{children:[e.jsx(i.div,{className:"lm-diff-del lm-diff-block",children:e.jsxs(i.p,{children:["Upgrading from 3.8.0 to 4.0.0 automatically migrates stored DMS configuration. Most of it converts without intervention, but three changes can leave enrollments failing or configs holding unexpected values if they are not reviewed. This page states what changes, what symptoms to expect and what to do in each case. Current behavior of each feature is documented in the ",e.jsx(i.a,{href:"/docs/platform/iot-fleets/enrollment/dms",children:"DMS"})," pages."]})}),`
`,e.jsx(i.div,{className:"lm-diff-del lm-diff-block",children:e.jsx(i.h2,{children:e.jsx(i.del,{className:"lm-diff-del",children:"Summary"})})}),`
`,`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsxs(i.p,{children:["Lamassu 4.0.0 is a major release. Storage consolidates into a single PostgreSQL database, a new ",e.jsx(i.code,{children:"authz"})," service authorizes every request, the Helm chart is hardened, and several APIs and stored configurations change shape. Most data converts automatically during the upgrade, but some changes need operator action before, during or after it."]})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(i.p,{children:"This page is organized in four parts. Read them in order before you upgrade production:"})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsxs(i.ol,{children:[`
`,e.jsxs(i.li,{children:[e.jsx(i.a,{href:"#architecture-changes",children:"Architecture changes"}),": what is different in 4.0.0 and what the upgrade migrates on its own."]}),`
`,e.jsxs(i.li,{children:[e.jsx(i.a,{href:"#breaking-changes",children:"Breaking changes"}),": every change that can break a 3.8.0 deployment, who it affects and what to do."]}),`
`,e.jsxs(i.li,{children:[e.jsx(i.a,{href:"#helm-migration-guide",children:"Helm migration guide"}),": the step-by-step procedure for a Helm-managed release."]}),`
`,e.jsxs(i.li,{children:[e.jsx(i.a,{href:"#validation-checklist",children:"Validation checklist"}),": how to confirm the upgrade worked before you remove the old data."]}),`
`]})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(a,{type:"warn",title:"Backend migration steps are provisional",children:e.jsx(i.p,{children:"The 4.0.0 release is upcoming and the backend migration steps on this page are provisional. Verify each procedure against the final release artifacts before upgrading production."})})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(i.h2,{id:"architecture-changes",children:"Architecture changes"})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(i.h3,{id:"one-postgresql-database-with-schemas",children:"One PostgreSQL database with schemas"})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsxs(i.p,{children:["3.8.0 gave each service its own database. The 4.0.0 backend connects to a single PostgreSQL database named ",e.jsx(i.code,{children:"pki"})," and isolates each service in a schema: ",e.jsx(i.code,{children:"kms"}),", ",e.jsx(i.code,{children:"ca"}),", ",e.jsx(i.code,{children:"va"}),", ",e.jsx(i.code,{children:"devicemanager"}),", ",e.jsx(i.code,{children:"dmsmanager"})," and ",e.jsx(i.code,{children:"alerts"}),". The ",e.jsx(i.code,{children:"authz"})," service keeps its principals, grants and policies in a separate ",e.jsx(i.code,{children:"authz"})," database (the development monolith uses an ",e.jsx(i.code,{children:"authz"})," schema inside ",e.jsx(i.code,{children:"pki"})," instead), and WFX keeps its own ",e.jsx(i.code,{children:"wfx"})," database."]})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsxs(i.p,{children:["PostgreSQL is now the only storage engine. SQLite support is removed, and the ",e.jsx(i.code,{children:"couch_db"})," and ",e.jsx(i.code,{children:"dynamo_db"})," engines are not registered in 4.0.0."]})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(i.h3,{id:"authorization-moves-into-the-authz-service",children:"Authorization moves into the authz service"})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(i.p,{children:"In 3.8.0 the API Gateway validated tokens: a JWT policy on every private route checked the signature and only let through tokens that carried the administrator role. Every route was open to any token that passed that check."})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsxs(i.p,{children:["4.0.0 removes the gateway policy. The ",e.jsx(i.code,{children:"/api/*"})," routes reach the services directly, and each service authorizes every request through ",e.jsx(i.code,{children:"authz"}),", which validates the token against the identity provider's JWKS endpoint and applies fine-grained, entity-level policies to CAs, certificates, devices, DMSs, KMS keys and VA roles. There is no implicit superuser: the first administrator comes from a bootstrap principal that you configure. The ",e.jsx(i.a,{href:"/docs/platform/administration/access-control",children:"access control"})," page documents principals, policies and the first administrator."]})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(i.h3,{id:"device-events-get-their-own-store",children:"Device events get their own store"})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsxs(i.p,{children:["Historical device events move from the ",e.jsx(i.code,{children:"devices.events"})," column to a dedicated ",e.jsx(i.code,{children:"device_events"})," store with their own endpoints. The events endpoint can also stream events over Server-Sent Events (SSE); to fan events out across service instances, each Device Manager instance binds its own durable AMQP queue."]})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(i.h3,{id:"a-hardened-helm-chart",children:"A hardened Helm chart"})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(i.p,{children:"Version 4.0.0 of the chart is a security-hardening release:"})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsxs(i.ul,{children:[`
`,e.jsxs(i.li,{children:[e.jsx(i.strong,{children:"Release-scoped resource names."})," Every chart-managed resource is named ",e.jsx(i.code,{children:"<release>-lamassu-<component>"})," instead of the fixed names used in 3.8.0 (",e.jsx(i.code,{children:"kms"}),", ",e.jsx(i.code,{children:"va"}),", ",e.jsx(i.code,{children:"ca"}),", ...). With a release named ",e.jsx(i.code,{children:"prod"})," the StatefulSets become ",e.jsx(i.code,{children:"prod-lamassu-kms"})," and ",e.jsx(i.code,{children:"prod-lamassu-va"}),". The ",e.jsx(i.code,{children:"nameOverride"})," and ",e.jsx(i.code,{children:"fullnameOverride"})," values change the prefix."]}),`
`,e.jsxs(i.li,{children:[e.jsx(i.strong,{children:"Non-root containers."})," Every workload runs as the numeric user ",e.jsx(i.code,{children:"65532:65532"})," with a ",e.jsx(i.code,{children:"RuntimeDefault"})," seccomp profile and dropped capabilities. Pods do not mount the service-account token by default, and the chart creates a dedicated ServiceAccount."]}),`
`,e.jsxs(i.li,{children:[e.jsx(i.strong,{children:"Strict values validation."})," ",e.jsx(i.code,{children:"values.schema.json"})," rejects unknown keys, so leftover 3.8.0 blocks fail ",e.jsx(i.code,{children:"helm lint"})," and ",e.jsx(i.code,{children:"helm upgrade"})," instead of being silently ignored."]}),`
`,e.jsxs(i.li,{children:[e.jsx(i.strong,{children:"No injected scheduling rules."})," The chart no longer adds pod anti-affinity or topology spread constraints on its own."]}),`
`]})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(i.h3,{id:"what-the-upgrade-migrates-automatically",children:"What the upgrade migrates automatically"})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(i.p,{children:"Several migrations run without intervention when you upgrade a Helm release:"})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsxs(i.ul,{children:[`
`,e.jsxs(i.li,{children:["Before any service starts, the chart's pre-install/pre-upgrade job prepares PostgreSQL. It creates the ",e.jsx(i.code,{children:"pki"}),", ",e.jsx(i.code,{children:"authz"})," and ",e.jsx(i.code,{children:"wfx"})," databases when they do not exist, creates one schema per service inside ",e.jsx(i.code,{children:"pki"}),", and imports each 3.8.0 per-service database into its schema. Each import runs as a single transaction, so a failed import leaves no partial schema and a retried job imports again. The job then runs the database migrations for every schema, migrates ",e.jsx(i.code,{children:"authz"}),", preloads its policies and seeds the ",e.jsx(i.code,{children:"services.authz.bootstrap"})," principals. It is idempotent and requires a PostgreSQL role allowed to create databases and schemas, as described in ",e.jsx(i.a,{href:"/docs/deployment/self-hosted/helm#before-you-begin",children:"Install with Helm"}),"."]}),`
`,e.jsx(i.li,{children:"Stored DMS configuration is rewritten to the 4.0.0 layout, and historical device events are transformed into the new store."}),`
`,e.jsxs(i.li,{children:["When ",e.jsx(i.code,{children:"migrations.caToKms.enabled"})," is set, a pre-upgrade hook registers legacy CA keys in the KMS."]}),`
`]})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsxs(i.p,{children:["Two things never migrate on their own: the KMS and VA data on local volumes, which stays on volumes the upgraded pods no longer use, and the values file, which you update by hand. Deployments that do not use the Helm chart also have to move their database data themselves; see ",e.jsx(i.a,{href:"#deployments-without-helm",children:"Deployments without Helm"}),"."]})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(i.h2,{id:"breaking-changes",children:"Breaking changes"})}),`
`,e.jsxs(i.table,{children:[e.jsx(i.thead,{children:e.jsxs(i.tr,{children:[e.jsx(i.th,{children:"Change"}),e.jsx(i.th,{children:"Who is affected"}),e.jsx(i.th,{children:"Severity"}),e.jsx(i.th,{children:"Action"})]})}),e.jsxs(i.tbody,{children:[e.jsxs(i.tr,{className:"lm-diff-ins lm-diff-block",children:[e.jsx(i.td,{children:e.jsx(i.a,{href:"#release-scoped-resource-names",children:"Release-scoped resource names"})}),e.jsx(i.td,{children:"Helm releases with a filesystem KMS engine or local VA CRL storage"}),e.jsx(i.td,{children:"High: KMS and VA start on empty volumes"}),e.jsx(i.td,{children:"Copy the data into the new volumes"})]}),e.jsxs(i.tr,{className:"lm-diff-ins lm-diff-block",children:[e.jsx(i.td,{children:e.jsx(i.a,{href:"#strict-values-validation",children:"Strict values validation"})}),e.jsx(i.td,{children:"Every Helm release"}),e.jsxs(i.td,{children:["High: ",e.jsx(i.code,{children:"helm upgrade"})," fails"]}),e.jsx(i.td,{children:"Remove or rename legacy keys"})]}),e.jsxs(i.tr,{className:"lm-diff-ins lm-diff-block",children:[e.jsx(i.td,{children:e.jsx(i.a,{href:"#required-authorization-configuration",children:"Required authorization configuration"})}),e.jsx(i.td,{children:"Every deployment"}),e.jsx(i.td,{children:"High: without a bootstrap principal there is no administrator"}),e.jsxs(i.td,{children:["Configure ",e.jsx(i.code,{children:"services.authz"})]})]}),e.jsxs(i.tr,{className:"lm-diff-ins lm-diff-block",children:[e.jsx(i.td,{children:e.jsx(i.a,{href:"#gateway-token-validation-removed",children:"Gateway token validation removed"})}),e.jsx(i.td,{children:"Every Helm release"}),e.jsxs(i.td,{children:["High: ",e.jsx(i.code,{children:"helm upgrade"})," fails on the old keys"]}),e.jsxs(i.td,{children:["Move JWKS and roles into ",e.jsx(i.code,{children:"services.authz"})]})]}),e.jsxs(i.tr,{className:"lm-diff-ins lm-diff-block",children:[e.jsx(i.td,{children:e.jsx(i.a,{href:"#postgresql-consolidation",children:"PostgreSQL consolidation"})}),e.jsx(i.td,{children:"3.8.0 deployments with per-service databases"}),e.jsx(i.td,{children:"High: services find no data, or a migration aborts"}),e.jsxs(i.td,{children:["Clean duplicate CA IDs and empty ",e.jsx(i.code,{children:"engine_id"})," values first; move data manually outside Helm"]})]}),e.jsxs(i.tr,{className:"lm-diff-ins lm-diff-block",children:[e.jsx(i.td,{children:e.jsx(i.a,{href:"#sqlite-storage-removed",children:"SQLite storage removed"})}),e.jsxs(i.td,{children:["Deployments on SQLite, ",e.jsx(i.code,{children:"couch_db"})," or ",e.jsx(i.code,{children:"dynamo_db"})]}),e.jsx(i.td,{children:"High: the backend no longer starts with them"}),e.jsx(i.td,{children:"Move to PostgreSQL before upgrading"})]}),e.jsxs(i.tr,{children:[e.jsxs(i.td,{children:[e.jsx(i.a,{href:"#webhooks-with-file-references",children:e.jsx(i.del,{className:"lm-diff-del",children:"Webhooks with file references"})}),e.jsx(i.a,{href:"#dms-webhooks",children:e.jsx(i.ins,{className:"lm-diff-ins",children:"Webhooks with file references"})})]}),e.jsxs(i.td,{children:["DMSs ",e.jsx(i.del,{className:"lm-diff-del",children:"with a"}),e.jsx(i.ins,{className:"lm-diff-ins",children:"whose"})," webhook",e.jsx(i.del,{className:"lm-diff-del",children:" whose"})," mTLS certificate or key were file paths"]}),e.jsxs(i.td,{children:["High: enrollments ",e.jsx(i.del,{className:"lm-diff-del",children:"and re-enrollments "}),"calling the webhook fail"]}),e.jsx(i.td,{children:"Re-enter certificate and key as PEM, or remove the file fields"})]}),e.jsxs(i.tr,{className:"lm-diff-ins lm-diff-block",children:[e.jsx(i.td,{children:e.jsx(i.a,{href:"#non-root-containers",children:"Non-root containers"})}),e.jsx(i.td,{children:"Releases with per-service identity overrides or mounted key material"}),e.jsx(i.td,{children:"Medium: services cannot read their files"}),e.jsx(i.td,{children:"Remove the overrides and fix volume ownership"})]}),e.jsxs(i.tr,{className:"lm-diff-ins lm-diff-block",children:[e.jsx(i.td,{children:e.jsx(i.a,{href:"#amqp-over-tls",children:"AMQP over TLS"})}),e.jsxs(i.td,{children:["Releases that set ",e.jsx(i.code,{children:"amqp.tls"})]}),e.jsx(i.td,{children:"Medium: clients connect to the wrong port"}),e.jsxs(i.td,{children:["Point ",e.jsx(i.code,{children:"amqp.port"})," at the TLS listener, or disable TLS"]})]}),e.jsxs(i.tr,{className:"lm-diff-ins lm-diff-block",children:[e.jsx(i.td,{children:e.jsx(i.a,{href:"#legacy-ca-keys-in-the-kms",children:"Legacy CA keys in the KMS"})}),e.jsx(i.td,{children:"Installations whose CA keys predate the KMS"}),e.jsx(i.td,{children:"Medium: CA keys stay unmanaged"}),e.jsx(i.td,{children:"Run the CA-to-KMS migration"})]}),e.jsxs(i.tr,{children:[e.jsxs(i.td,{children:[e.jsx(i.a,{href:"#receiver-certificate-verification",children:e.jsx(i.del,{className:"lm-diff-del",children:"Receiver certificate verification"})}),e.jsx(i.a,{href:"#dms-webhooks",children:e.jsx(i.ins,{className:"lm-diff-ins",children:"Receiver certificate verification"})})]}),e.jsxs(i.td,{children:["DMSs ",e.jsx(i.del,{className:"lm-diff-del",children:"with a"}),e.jsx(i.ins,{className:"lm-diff-ins",children:"whose"})," webhook",e.jsx(i.del,{className:"lm-diff-del",children:" that"})," had ",e.jsx(i.code,{children:"validate_server_cert: false"})]}),e.jsxs(i.td,{children:["Medium: ",e.jsx(i.del,{className:"lm-diff-del",children:"webhook "}),"credentials ",e.jsx(i.del,{className:"lm-diff-del",children:"are sent"}),e.jsx(i.ins,{className:"lm-diff-ins",children:"go"})," to an unverified receiver"]}),e.jsxs(i.td,{children:["Set ",e.jsx(i.code,{children:"insecure_skip_verify"})," to ",e.jsx(i.code,{children:"false"})]})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{children:e.jsx(i.a,{href:"#re-enrollment-trust-set",children:"Re-enrollment trust set"})}),e.jsx(i.td,{children:"Scripts and consoles that edit DMSs through the API"}),e.jsxs(i.td,{children:["Medium: an ",e.jsx(i.del,{className:"lm-diff-del",children:"edit in the "}),"old",e.jsx(i.del,{className:"lm-diff-del",children:" "}),e.jsx(i.ins,{className:"lm-diff-ins",children:"-"}),"layout",e.jsx(i.ins,{className:"lm-diff-ins",children:" edit"})," silently empties ",e.jsx(i.code,{children:"validation_cas"})]}),e.jsx(i.td,{children:"Read the DMS before editing and use the new field"})]}),e.jsxs(i.tr,{className:"lm-diff-ins lm-diff-block",children:[e.jsx(i.td,{children:e.jsx(i.a,{href:"#device-events",children:"Device events"})}),e.jsxs(i.td,{children:["Consumers that read the device ",e.jsx(i.code,{children:"events"})," field"]}),e.jsx(i.td,{children:"Medium: the field disappears"}),e.jsx(i.td,{children:"Use the new event endpoints"})]}),e.jsxs(i.tr,{className:"lm-diff-ins lm-diff-block",children:[e.jsx(i.td,{children:e.jsx(i.a,{href:"#renamed-and-reshaped-values",children:"Renamed and reshaped values"})}),e.jsxs(i.td,{children:["Releases that override ",e.jsx(i.code,{children:"toolbox"}),", ",e.jsx(i.code,{children:"services.connectors"}),", ports, probes or scheduling"]}),e.jsx(i.td,{children:"Low to medium: validation errors or changed defaults"}),e.jsx(i.td,{children:"Update the values file"})]}),e.jsxs(i.tr,{className:"lm-diff-ins lm-diff-block",children:[e.jsx(i.td,{children:e.jsx(i.a,{href:"#dms-update-api",children:"DMS update API"})}),e.jsx(i.td,{children:"Clients that send the DMS ID in the update body"}),e.jsx(i.td,{children:"Low: the ID in the URL wins"}),e.jsx(i.td,{children:"Send the ID in the URL"})]}),e.jsxs(i.tr,{className:"lm-diff-ins lm-diff-block",children:[e.jsx(i.td,{children:e.jsx(i.a,{href:"#certificate-type-values",children:"Certificate type values"})}),e.jsxs(i.td,{children:["Consumers that match on certificate ",e.jsx(i.code,{children:"type"})]}),e.jsx(i.td,{children:"Low: two values are renamed"}),e.jsx(i.td,{children:"Adapt consumers"})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{children:e.jsx(i.a,{href:"#independent-re-enrollment-authentication",children:"Independent re-enrollment authentication"})}),e.jsx(i.td,{children:"Any DMS"}),e.jsx(i.td,{children:"Low: informational"}),e.jsx(i.td,{children:"Read both blocks before editing"})]})]})]}),`
`,e.jsx(i.div,{className:"lm-diff-del lm-diff-block",children:e.jsxs(i.p,{children:["A ",e.jsx(i.a,{href:"#verification-checklist",children:"verification checklist"})," at the end confirms the result."]})}),`
`,e.jsx(i.div,{className:"lm-diff-del lm-diff-block",children:e.jsx(i.h2,{children:e.jsx(i.del,{className:"lm-diff-del",children:"DMS webhooks"})})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(i.h3,{id:"helm-chart-and-values",children:"Helm chart and values"})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(i.h4,{id:"release-scoped-resource-names",children:"Release-scoped resource names"})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsxs(i.p,{children:["Kubernetes derives a StatefulSet's PVC name from its pod name (",e.jsx(i.code,{children:"<volumeClaimTemplate>-<pod-name>"}),"). Renaming the ",e.jsx(i.code,{children:"kms"})," and ",e.jsx(i.code,{children:"va"})," StatefulSets means ",e.jsx(i.code,{children:"helm upgrade"})," binds brand-new, empty PVCs instead of the existing ones. The KMS key material and VA CRLs are not deleted — the old PVCs are orphaned, not removed — but the upgraded pods fail with ",e.jsx(i.code,{children:"no such file or directory"})," (KMS) or ",e.jsx(i.code,{children:"code=NotFound"})," (VA) until you copy the data across. This affects KMS when ",e.jsx(i.code,{children:"services.kms.cryptoEngines"})," uses a ",e.jsx(i.code,{children:"filesystem"})," engine and VA when ",e.jsx(i.code,{children:"services.va.fileStore.type"})," is ",e.jsx(i.code,{children:"local"}),". Every other renamed resource is stateless and is recreated without data-loss risk."]})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsxs(i.p,{children:[e.jsx(i.a,{href:"#step-4-migrate-the-kms-and-va-data",children:"Step 4 of the migration guide"})," copies the data."]})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(i.h4,{id:"strict-values-validation",children:"Strict values validation"})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsxs(i.p,{children:[e.jsx(i.code,{children:"values.schema.json"})," rejects unknown keys, so every block that 4.0.0 removed or renamed — ",e.jsx(i.code,{children:"toolbox"}),", ",e.jsx(i.code,{children:"auth.oidc.apiGateway"}),", ",e.jsx(i.code,{children:"auth.authorization"})," and others — fails ",e.jsx(i.code,{children:"helm lint"})," and ",e.jsx(i.code,{children:"helm upgrade"})," outright. ",e.jsx(i.a,{href:"#step-2-update-the-values-file",children:"Step 2"})," lists every change."]})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(i.h4,{id:"required-authorization-configuration",children:"Required authorization configuration"})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsxs(i.p,{children:["3.8.0 had no authorization service, so a 3.8.0 values file has nothing to migrate from: you must add the ",e.jsx(i.code,{children:"services.authz"})," configuration yourself. It needs the JWKS endpoint of your identity provider, the database mappings the authorization engine uses, and a bootstrap principal that matches how your provider assigns the administrator role. Without a matching principal nobody can administer the PKI."]})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(i.h4,{id:"gateway-token-validation-removed",children:"Gateway token validation removed"})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsxs(i.p,{children:[e.jsx(i.code,{children:"auth.oidc.apiGateway.jwks"}),", ",e.jsx(i.code,{children:"auth.authorization.rolesClaim"})," and ",e.jsx(i.code,{children:"auth.authorization.roles.admin"})," are removed with no compatibility aliases, and the schema rejects them. Their settings move into ",e.jsx(i.code,{children:"services.authz"}),": the JWKS URL becomes ",e.jsx(i.code,{children:"services.authz.jwkUrl"}),", and the role claim and administrator role become a claim rule of the bootstrap principal. ",e.jsx(i.code,{children:"auth.oidc.frontend"})," is unchanged."]})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(i.h4,{id:"non-root-containers",children:"Non-root containers"})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsxs(i.p,{children:["Service images run on a distroless base as the numeric user ",e.jsx(i.code,{children:"65532"}),"; the ",e.jsx(i.code,{children:"authz"})," image is Ubuntu with a non-root user that has the same UID. The per-service overrides ",e.jsx(i.code,{children:"services.kms.securityContext.runAsGroup: 0"})," and ",e.jsx(i.code,{children:"services.authz.securityContext.runAsUser"}),"/",e.jsx(i.code,{children:"runAsGroup: 999"})," are removed; group access to the KMS volume and PKCS#11 socket is now handled by the pod-level ",e.jsx(i.code,{children:"fsGroup: 65532"}),"."]})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsxs(i.p,{children:["3.8.0 did not pin a container identity, so existing files can carry any UID. Any volume that holds keys or CRLs must be owned by ",e.jsx(i.code,{children:"65532:65532"}),", or at least readable (and, where needed, writable) by that identity."]})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(i.h4,{id:"amqp-over-tls",children:"AMQP over TLS"})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsxs(i.p,{children:["In 3.8.0 ",e.jsx(i.code,{children:"amqp.tls"})," was not applied and event-bus clients always connected over plaintext. In 4.0.0 ",e.jsx(i.code,{children:"amqp.tls: true"})," switches them to AMQPS. The default ",e.jsx(i.code,{children:"amqp.port"})," stays ",e.jsx(i.code,{children:"5672"})," and does not change when TLS is enabled, so a values file that already set ",e.jsx(i.code,{children:"amqp.tls: true"})," must point ",e.jsx(i.code,{children:"amqp.port"})," at the broker's TLS listener (",e.jsx(i.code,{children:"amqps"}),", commonly ",e.jsx(i.code,{children:"5671"}),"), or set ",e.jsx(i.code,{children:"amqp.tls: false"})," to keep plaintext. Clients must also trust the broker's certificate."]})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(i.h4,{id:"renamed-and-reshaped-values",children:"Renamed and reshaped values"})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsxs(i.ul,{children:[`
`,e.jsxs(i.li,{children:[e.jsx(i.code,{children:"toolbox"})," is renamed to ",e.jsx(i.code,{children:"connectivityTest"}),", and the ",e.jsx(i.code,{children:"helm test"})," hook uses the upstream ",e.jsx(i.code,{children:"curlimages/curl"})," image pinned by digest."]}),`
`,e.jsxs(i.li,{children:[e.jsx(i.code,{children:"services.connectors"})," is a map keyed by connector ID instead of a list."]}),`
`,e.jsxs(i.li,{children:["The ",e.jsx(i.code,{children:"services.ui.port"})," default is ",e.jsx(i.code,{children:"8085"}),", the unprivileged port of the rootless image."]}),`
`,e.jsxs(i.li,{children:["The shared ",e.jsx(i.code,{children:"probes:"})," block is replaced by independent ",e.jsx(i.code,{children:"livenessProbe"}),", ",e.jsx(i.code,{children:"readinessProbe"})," and ",e.jsx(i.code,{children:"startupProbe"})," blocks."]}),`
`,e.jsxs(i.li,{children:["With ",e.jsx(i.code,{children:"tls.certManagerOptions.issuer"})," empty, the chart creates a release-scoped self-signed issuer, for example ",e.jsx(i.code,{children:"lamassu-downstream-ca-selfsigned-issuer"}),". The legacy literal ",e.jsx(i.code,{children:"downstream-ca-selfsigned-issuer"})," is still accepted and resolves to it."]}),`
`,e.jsxs(i.li,{children:["Anti-affinity and topology spread must be configured explicitly through ",e.jsx(i.code,{children:"affinity"})," and ",e.jsx(i.code,{children:"topologySpreadConstraints"}),"."]}),`
`]})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(i.h3,{id:"data-and-storage",children:"Data and storage"})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(i.h4,{id:"postgresql-consolidation",children:"PostgreSQL consolidation"})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsxs(i.p,{children:["Every 3.8.0 per-service database must end up as a schema of ",e.jsx(i.code,{children:"pki"}),", keeping its structure, indexes, constraints, data and migration history. The Helm chart does this automatically; deployments without Helm do it by hand (see ",e.jsx(i.a,{href:"#deployments-without-helm",children:"Deployments without Helm"}),")."]})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(i.p,{children:"Two schema migrations abort on data that 3.8.0 allowed, so clean the data before upgrading:"})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsxs(i.ul,{children:[`
`,e.jsxs(i.li,{children:["The CA migration adds a UNIQUE constraint on ",e.jsx(i.code,{children:"ca_certificates.id"})," and aborts if duplicate CA IDs exist. Imports already reject duplicates with ",e.jsx(i.code,{children:"409"}),", so new ones cannot normally appear."]}),`
`,e.jsxs(i.li,{children:["The KMS migration promotes the primary key to ",e.jsx(i.code,{children:"(key_id, engine_id)"})," and aborts with ",e.jsx(i.code,{children:"cannot promote (key_id, engine_id) to primary key: N row(s) have no engine_id; backfill them before migrating"})," when ",e.jsx(i.code,{children:"kms_keys"})," rows lack ",e.jsx(i.code,{children:"engine_id"}),". Backfill ",e.jsx(i.code,{children:"engine_id"})," first."]}),`
`]})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsxs(i.p,{children:["The same KMS migration deletes, with a ",e.jsx(i.code,{children:"NOTICE"}),", aliases that equal an existing key ID, because identifiers now resolve as a key ID before an alias. Affected aliases are dropped, not redirected."]})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(i.h4,{id:"sqlite-storage-removed",children:"SQLite storage removed"})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsxs(i.p,{children:["The SQLite storage engine is removed, and the ",e.jsx(i.code,{children:"couch_db"})," and ",e.jsx(i.code,{children:"dynamo_db"})," engines are not registered in 4.0.0: their configuration constants remain, but they select no engine. Deployments on any of them must move to PostgreSQL and consolidate their data into the ",e.jsx(i.code,{children:"pki"})," schemas before upgrading."]})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(i.h4,{id:"legacy-ca-keys-in-the-kms",children:"Legacy CA keys in the KMS"})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsxs(i.p,{children:["CA certificates of type ",e.jsx(i.code,{children:"MANAGED"})," or ",e.jsx(i.code,{children:"IMPORTED_WITH_KEY"})," whose private keys predate the KMS service have the key stored only in the crypto engine, under the certificate's ",e.jsx(i.code,{children:"subject_key_id"}),", with no KMS record. The ",e.jsx(i.code,{children:"ca-to-kms-migration"})," tool registers them:"]})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsxs(i.ul,{children:[`
`,e.jsxs(i.li,{children:["The ",e.jsx(i.code,{children:"key_id"})," is the certificate's ",e.jsx(i.code,{children:"subject_key_id"})," (SHA-256 of the public key)."]}),`
`,e.jsx(i.li,{children:"The tool is idempotent: keys already in the KMS are skipped, so it can be run several times."}),`
`,e.jsx(i.li,{children:"Certificates that cannot be read, or lack an engine or a subject key ID, are skipped with a warning. Review the logs and resolve the affected records."}),`
`,e.jsxs(i.li,{children:["When CA certificates sharing a ",e.jsx(i.code,{children:"subject_key_id"})," declare conflicting ",e.jsx(i.code,{children:"engine_id"}),"s, the tool fails that key and exits with code ",e.jsx(i.code,{children:"1"}),", which fails a Helm pre-upgrade hook. Resolve the conflict manually before rerunning."]}),`
`]})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsxs(i.p,{children:["With Helm, enable the hook for the upgrade in ",e.jsx(i.a,{href:"#step-2-update-the-values-file",children:"step 2"}),"; without Helm, run the tool by hand."]})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(i.h3,{id:"apis-and-stored-configuration",children:"APIs and stored configuration"})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(i.h4,{id:"dms-webhooks",children:"DMS webhooks"})}),`
`,e.jsxs(i.p,{children:["Stored webhook configs are rewritten to the current layout",e.jsx(i.del,{className:"lm-diff-del",children:". Fields are renamed as follows"}),e.jsx(i.ins,{className:"lm-diff-ins",children:" and their fields renamed"}),":"]}),`
`,e.jsxs(i.table,{children:[e.jsx(i.thead,{children:e.jsxs(i.tr,{children:[e.jsx(i.th,{children:"Field in 3.8.0"}),e.jsx(i.th,{children:"Field in 4.0.0"})]})}),e.jsxs(i.tbody,{children:[e.jsxs(i.tr,{children:[e.jsx(i.td,{children:e.jsx(i.code,{children:"validate_server_cert"})}),e.jsxs(i.td,{children:[e.jsx(i.code,{children:"insecure_skip_verify"})," (value negated)"]})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{children:e.jsx(i.code,{children:"oidc"})}),e.jsx(i.td,{children:e.jsx(i.code,{children:"jwt_options"})})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{children:e.jsx(i.code,{children:"apikey"})}),e.jsx(i.td,{children:e.jsx(i.code,{children:"apikey_options"})})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{children:e.jsx(i.code,{children:"mtls"})}),e.jsx(i.td,{children:e.jsx(i.code,{children:"mtls_options"})})]})]})]}),`
`,e.jsxs(i.p,{children:["When the legacy mTLS certificate and key are both PEM, they move into ",e.jsx(i.code,{children:"mtls_options.cert_content"})," and ",e.jsx(i.code,{children:"mtls_options.key_content"})," and need no action. ",e.jsx(i.del,{className:"lm-diff-del",children:"The two cases below"}),e.jsx(i.ins,{className:"lm-diff-ins",children:"Two cases"})," do need it."]}),`
`,e.jsx(i.div,{className:"lm-diff-del lm-diff-block",children:e.jsx(i.h3,{children:e.jsx(i.del,{className:"lm-diff-del",children:"Webhooks with file references"})})}),`
`,e.jsxs(i.p,{children:[e.jsx(i.strong,{children:e.jsx(i.ins,{className:"lm-diff-ins",children:"Webhooks with file references."})}),e.jsx(i.ins,{className:"lm-diff-ins",children:" "}),"A mixed config, with a PEM certificate and a file-path key, is migrated to ",e.jsx(i.code,{children:"mtls_options.cert_file"})," and ",e.jsx(i.code,{children:"mtls_options.key_file"}),". Webhook delivery rejects those fields",e.jsx(i.del,{className:"lm-diff-del",children:", and does so "}),e.jsx(i.ins,{className:"lm-diff-ins",children:" "}),"on every call, whatever the configured authentication mode",e.jsx(i.del,{className:"lm-diff-del",children:". As a result, "}),e.jsx(i.ins,{className:"lm-diff-ins",children:", so "}),"every enroll and re-enroll that calls that webhook fails until the config is fixed",e.jsxs(i.ins,{className:"lm-diff-ins",children:[". If the webhook uses mTLS, re-enter the certificate and key as Base64-encoded or plain PEM; if it does not, remove the leftover file fields. Metadata-only updates keep working in the meantime (",e.jsx(i.code,{children:"PUT"})," or ",e.jsx(i.code,{children:"PATCH"})," on ",e.jsx(i.code,{children:"/v1/dms/:id/metadata"}),"). In a variant of the same problem, a stored config with file paths inside ",e.jsx(i.code,{children:"mtls_options.cert_content"})," or ",e.jsx(i.code,{children:"mtls_options.key_content"})," makes every full settings update (",e.jsx(i.code,{children:"POST /v1/dms"})," or ",e.jsx(i.code,{children:"PUT /v1/dms/:id"}),") fail validation; settings are replaced wholesale, so resend the config with the certificate and key as PEM"]}),"."]}),`
`,e.jsx(i.div,{className:"lm-diff-del lm-diff-block",children:e.jsx(i.p,{children:"There are two ways to fix it, depending on the webhook:"})}),`
`,e.jsx(i.div,{className:"lm-diff-del lm-diff-block",children:e.jsxs(i.ul,{children:[`
`,e.jsx(i.li,{children:"If the webhook uses mTLS, re-enter the certificate and key as Base64-encoded or plain PEM."}),`
`,e.jsx(i.li,{children:"If the webhook does not use mTLS, remove the leftover file fields."}),`
`]})}),`
`,e.jsx(i.div,{className:"lm-diff-del lm-diff-block",children:e.jsxs(i.p,{children:["Metadata-only updates keep working in the meantime (",e.jsx(i.code,{children:"PUT"})," or ",e.jsx(i.code,{children:"PATCH"})," on ",e.jsx(i.code,{children:"/v1/dms/:id/metadata"}),")."]})}),`
`,e.jsx(i.div,{className:"lm-diff-del lm-diff-block",children:e.jsxs(i.p,{children:["A variant of the same problem exists: if the stored config holds file paths inside ",e.jsx(i.code,{children:"mtls_options.cert_content"})," or ",e.jsx(i.code,{children:"mtls_options.key_content"}),", every full settings update (",e.jsx(i.code,{children:"POST /v1/dms"})," or ",e.jsx(i.code,{children:"PUT /v1/dms/:id"}),") fails validation. Settings are replaced wholesale, so the stored config must be resent with the certificate and key as PEM."]})}),`
`,e.jsx(i.div,{className:"lm-diff-del lm-diff-block",children:e.jsx(i.h3,{children:e.jsx(i.del,{className:"lm-diff-del",children:"Receiver certificate verification"})})}),`
`,e.jsx(i.div,{className:"lm-diff-del lm-diff-block",children:e.jsxs(i.p,{children:["A config with ",e.jsx(i.code,{children:"validate_server_cert: false"})," becomes ",e.jsx(i.code,{children:"insecure_skip_verify: true"}),". Receiver certificate verification therefore stays skipped until that field is set to ",e.jsx(i.code,{children:"false"}),"."]})}),`
`,e.jsxs(i.p,{children:[e.jsx(i.del,{className:"lm-diff-del",children:"It should be corrected "}),e.jsx(i.strong,{children:e.jsx(i.ins,{className:"lm-diff-ins",children:"Receiver certificate verification."})}),e.jsxs(i.ins,{className:"lm-diff-ins",children:[" A config with ",e.jsx(i.code,{children:"validate_server_cert: false"})," becomes ",e.jsx(i.code,{children:"insecure_skip_verify: true"}),", so receiver verification stays skipped until that field is set to ",e.jsx(i.code,{children:"false"}),". Correct it "]}),"on every migrated config",e.jsx(i.del,{className:"lm-diff-del",children:". The"}),e.jsx(i.ins,{className:"lm-diff-ins",children:": the"})," webhook authorization channel carries the API key or bearer token, ",e.jsx(i.del,{className:"lm-diff-del",children:"so"}),e.jsx(i.ins,{className:"lm-diff-ins",children:"and"})," skipping verification exposes those credentials to a network-positioned attacker. ",e.jsx(i.del,{className:"lm-diff-del",children:"Keeping"}),e.jsx(i.ins,{className:"lm-diff-ins",children:"Keep"})," ",e.jsx(i.code,{children:"insecure_skip_verify: true"})," ",e.jsx(i.del,{className:"lm-diff-del",children:"is "}),"only",e.jsx(i.del,{className:"lm-diff-del",children:" justified"})," when the receiver certificate is deliberately unverifiable."]}),`
`,e.jsx(i.div,{className:"lm-diff-del lm-diff-block",children:e.jsx(i.h2,{children:e.jsx(i.del,{className:"lm-diff-del",children:"Re-enrollment trust set"})})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(i.h4,{id:"re-enrollment-trust-set",children:"Re-enrollment trust set"})}),`
`,e.jsxs(i.p,{children:["The flat field ",e.jsx(i.code,{children:"reenrollment_settings.additional_validation_cas"})," moves into the nested field ",e.jsx(i.code,{children:"reenrollment_settings.est_rfc7030_settings.client_certificate_settings.validation_cas"}),e.jsx(i.del,{className:"lm-diff-del",children:"."}),e.jsx(i.ins,{className:"lm-diff-ins",children:":"})]}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes min-light min-dark",style:{"--shiki-light":"#24292eff","--shiki-dark":"#b392f0","--shiki-light-bg":"#ffffff","--shiki-dark-bg":"#1f1f1f"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(i.code,{children:[e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292EFF","--shiki-dark":"#B392F0"},children:"{"})}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:'  "reenrollment_settings"'}),e.jsx(i.span,{style:{"--shiki-light":"#212121","--shiki-dark":"#BBBBBB"},children:":"}),e.jsx(i.span,{style:{"--shiki-light":"#24292EFF","--shiki-dark":"#B392F0"},children:" {"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:'    "est_rfc7030_settings"'}),e.jsx(i.span,{style:{"--shiki-light":"#212121","--shiki-dark":"#BBBBBB"},children:":"}),e.jsx(i.span,{style:{"--shiki-light":"#24292EFF","--shiki-dark":"#B392F0"},children:" {"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:'      "client_certificate_settings"'}),e.jsx(i.span,{style:{"--shiki-light":"#212121","--shiki-dark":"#BBBBBB"},children:":"}),e.jsx(i.span,{style:{"--shiki-light":"#24292EFF","--shiki-dark":"#B392F0"},children:" {"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:'        "validation_cas"'}),e.jsx(i.span,{style:{"--shiki-light":"#212121","--shiki-dark":"#BBBBBB"},children:":"}),e.jsx(i.span,{style:{"--shiki-light":"#24292EFF","--shiki-dark":"#B392F0"},children:" ["}),e.jsx(i.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#FFAB70"},children:'"<CA_ID>"'}),e.jsx(i.span,{style:{"--shiki-light":"#24292EFF","--shiki-dark":"#B392F0"},children:"]"})]}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292EFF","--shiki-dark":"#B392F0"},children:"      }"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292EFF","--shiki-dark":"#B392F0"},children:"    }"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292EFF","--shiki-dark":"#B392F0"},children:"  }"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292EFF","--shiki-dark":"#B392F0"},children:"}"})})]})})}),`
`,e.jsx(i.p,{children:"The effective trust set does not change, because the nested value was never consulted when validating re-enrollments. If the flat list was missing or null, it becomes an empty list."}),`
`,e.jsxs(i.p,{children:["What ",e.jsx(i.del,{className:"lm-diff-del",children:"does change"}),e.jsx(i.ins,{className:"lm-diff-ins",children:"changes"})," is how API requests are handled. Bodies that still carry ",e.jsx(i.code,{children:"additional_validation_cas"})," are accepted, but the value is silently ",e.jsx(i.del,{className:"lm-diff-del",children:"ignored"}),e.jsx(i.ins,{className:"lm-diff-ins",children:"dropped"})," because unknown JSON fields are ",e.jsx(i.del,{className:"lm-diff-del",children:"dropped"}),e.jsx(i.ins,{className:"lm-diff-ins",children:"ignored"}),", and GET responses no longer include it. ",e.jsx(i.del,{className:"lm-diff-del",children:"Consequently, an"}),e.jsx(i.ins,{className:"lm-diff-ins",children:"An"})," update body built from the old layout ",e.jsx(i.ins,{className:"lm-diff-ins",children:"therefore "}),"empties ",e.jsx(i.code,{children:"validation_cas"})," without ",e.jsx(i.del,{className:"lm-diff-del",children:"returning "}),"any error. ",e.jsx(i.del,{className:"lm-diff-del",children:"To avoid it, always"}),e.jsx(i.ins,{className:"lm-diff-ins",children:"Always"})," read the DMS before sending an edit and reuse the layout the API returns."]}),`
`,e.jsx(i.div,{className:"lm-diff-del lm-diff-block",children:e.jsx(i.h2,{children:e.jsx(i.del,{className:"lm-diff-del",children:"Independent re-enrollment authentication"})})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(i.h4,{id:"independent-re-enrollment-authentication",children:"Independent re-enrollment authentication"})}),`
`,e.jsxs(i.p,{children:["Re-enrollment authentication settings are now stored independently from initial authentication. Nothing needs migrating, but ",e.jsx(i.ins,{className:"lm-diff-ins",children:"read "}),"both blocks ",e.jsx(i.del,{className:"lm-diff-del",children:"should be read "}),"before editing a DMS so that ",e.jsx(i.del,{className:"lm-diff-del",children:"one is not modified while believing the other is being edited"}),e.jsx(i.ins,{className:"lm-diff-ins",children:"you do not modify one while believing you are editing the other. If the console version does not expose independent settings, edit them through the "}),e.jsx(i.a,{href:"/docs/api-reference/dms-manager",children:e.jsx(i.ins,{className:"lm-diff-ins",children:"DMS API"})}),"."]}),`
`,e.jsx(i.div,{className:"lm-diff-del lm-diff-block",children:e.jsxs(i.p,{children:["If the console version does not expose independent settings, they can be edited through the ",e.jsx(i.a,{href:"/docs/api-reference/dms-manager",children:"DMS API"}),"."]})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(i.h4,{id:"dms-update-api",children:"DMS update API"})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsxs(i.p,{children:[e.jsx(i.code,{children:"PUT /v1/dms/:id"})," takes the DMS ID from the URL and validates the request body. An ID in the body is ignored, so update clients that relied on it."]})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(i.h4,{id:"certificate-type-values",children:"Certificate type values"})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsxs(i.p,{children:["Stored certificate type values are renamed: ",e.jsx(i.code,{children:"IMPORTED"})," becomes ",e.jsx(i.code,{children:"IMPORTED_WITH_KEY"})," and ",e.jsx(i.code,{children:"EXTERNAL"})," becomes ",e.jsx(i.code,{children:"IMPORTED_WITHOUT_KEY"}),". ",e.jsx(i.code,{children:"MANAGED"})," is unchanged. Adapt consumers that read or match on those values."]})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(i.h4,{id:"device-events",children:"Device events"})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsxs(i.p,{children:["The ",e.jsx(i.code,{children:"events"})," field no longer appears in the device representation. Point consumers at the new endpoints:"]})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsxs(i.ul,{children:[`
`,e.jsxs(i.li,{children:[e.jsx(i.code,{children:"GET /v1/devices/:id/events"})," returns a device's events."]}),`
`,e.jsxs(i.li,{children:[e.jsx(i.code,{children:"POST /v1/devices/:id/events"})," creates an event."]}),`
`]})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsxs(i.p,{children:["When the request ",e.jsx(i.code,{children:"Accept"})," header includes ",e.jsx(i.code,{children:"text/event-stream"}),", the events endpoint streams over SSE with a keepalive every 15 seconds, and returns ",e.jsx(i.code,{children:"501"})," when SSE is disabled in the deployment. Each Device Manager instance binds a durable AMQP queue named after its service ID, ",e.jsx(i.code,{children:"device-manager-sse-<uuid>"}),". Queues from crashed or replaced instances linger until removed, so configure an expiration or cleanup policy on the broker."]})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(i.h2,{id:"helm-migration-guide",children:"Helm migration guide"})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsxs(i.p,{children:["The upgrade runs in a fixed order: prepare the data and values, run ",e.jsx(i.code,{children:"helm upgrade"}),", then copy the KMS and VA data into the new volumes. The copy must run after the upgrade, because the destination StatefulSets and PVCs do not exist before it. If you are not upgrading an existing release, go straight to ",e.jsx(i.a,{href:"/docs/deployment/self-hosted/helm",children:"Install with Helm"}),"."]})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(i.h3,{id:"step-1-prepare",children:"Step 1: Prepare"})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsxs(i.ol,{children:[`
`,e.jsxs(i.li,{children:["Take a verifiable backup of PostgreSQL and schedule downtime. The upgrade moves every service's data into ",e.jsx(i.code,{children:"pki"}),"."]}),`
`,e.jsxs(i.li,{children:["If the deployment runs on SQLite, ",e.jsx(i.code,{children:"couch_db"})," or ",e.jsx(i.code,{children:"dynamo_db"}),", move it to PostgreSQL first."]}),`
`,e.jsxs(i.li,{children:["Resolve duplicate CA IDs and backfill ",e.jsx(i.code,{children:"engine_id"})," in ",e.jsx(i.code,{children:"kms_keys"}),", as described in ",e.jsx(i.a,{href:"#postgresql-consolidation",children:"PostgreSQL consolidation"}),"."]}),`
`,e.jsx(i.li,{children:"Record the names of your local-storage PVCs:"}),`
`]})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes min-light min-dark",style:{"--shiki-light":"#24292eff","--shiki-dark":"#b392f0","--shiki-light-bg":"#ffffff","--shiki-dark-bg":"#1f1f1f"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsxs(i.code,{children:[e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:"export"}),e.jsx(i.span,{style:{"--shiki-light":"#24292EFF","--shiki-dark":"#B392F0"},children:" NAMESPACE"}),e.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:"="}),e.jsx(i.span,{style:{"--shiki-light":"#24292EFF","--shiki-dark":"#B392F0"},children:"lamassu   "}),e.jsx(i.span,{style:{"--shiki-light":"#C2C3C5","--shiki-dark":"#6B737C"},children:"# your 3.8.0 namespace"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:"export"}),e.jsx(i.span,{style:{"--shiki-light":"#24292EFF","--shiki-dark":"#B392F0"},children:" RELEASE"}),e.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:"="}),e.jsx(i.span,{style:{"--shiki-light":"#24292EFF","--shiki-dark":"#B392F0"},children:"lamassu     "}),e.jsx(i.span,{style:{"--shiki-light":"#C2C3C5","--shiki-dark":"#6B737C"},children:"# your Helm release name"})]}),`
`,e.jsx(i.span,{className:"line"}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"kubectl"}),e.jsx(i.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" get"}),e.jsx(i.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" pvc"}),e.jsx(i.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" -n"}),e.jsx(i.span,{style:{"--shiki-light":"#24292EFF","--shiki-dark":"#B392F0"},children:" $NAMESPACE "}),e.jsx(i.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:"-l"}),e.jsx(i.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" app.kubernetes.io/instance="}),e.jsx(i.span,{style:{"--shiki-light":"#24292EFF","--shiki-dark":"#B392F0"},children:"$RELEASE"})]}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#C2C3C5","--shiki-dark":"#6B737C"},children:"# on a 3.8.0 install you can also list the fixed names directly:"})}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"kubectl"}),e.jsx(i.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" get"}),e.jsx(i.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" pvc"}),e.jsx(i.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" -n"}),e.jsx(i.span,{style:{"--shiki-light":"#24292EFF","--shiki-dark":"#B392F0"},children:" $NAMESPACE "}),e.jsx(i.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:"golang-engine-storage-kms-0"}),e.jsx(i.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" local-crl-file-storage-va-0"})]})]})})})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsxs(i.p,{children:[e.jsx(i.code,{children:"helm upgrade"})," does not touch or delete the old PVCs, but nothing references them after the upgrade. You need their names to copy the data and to clean up later."]})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(i.h3,{id:"step-2-update-the-values-file",children:"Step 2: Update the values file"})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsxs(i.p,{children:[e.jsxs(i.strong,{children:["Add ",e.jsx(i.code,{children:"services.authz"}),"."]})," Configure the JWKS endpoint, the database mappings and the bootstrap principal:"]})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes min-light min-dark",style:{"--shiki-light":"#24292eff","--shiki-dark":"#b392f0","--shiki-light-bg":"#ffffff","--shiki-dark-bg":"#1f1f1f"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(i.code,{children:[e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:"services"}),e.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:":"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:"  authz"}),e.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:":"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:"    jwkUrl"}),e.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:":"}),e.jsx(i.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#FFAB70"},children:" https://idp.example.com/realms/lamassu/protocol/openid-connect/certs"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:"    credentials"}),e.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:":"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:"      pki"}),e.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:":"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:"        database"}),e.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:":"}),e.jsx(i.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#FFAB70"},children:" pki"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:"      authz"}),e.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:":"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:"        database"}),e.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:":"}),e.jsx(i.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#FFAB70"},children:" authz"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:"    bootstrap"}),e.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:":"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292EFF","--shiki-dark":"#B392F0"},children:"      - "}),e.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:"principal_id"}),e.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:":"}),e.jsx(i.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#FFAB70"},children:' "oidc:pki-admin"'})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:"        principal_name"}),e.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:":"}),e.jsx(i.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#FFAB70"},children:' "PKI Admin"'})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:"        principal_type"}),e.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:":"}),e.jsx(i.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#FFAB70"},children:' "oidc"'})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:"        policy_ids"}),e.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:":"}),e.jsx(i.span,{style:{"--shiki-light":"#24292EFF","--shiki-dark":"#B392F0"},children:" ["}),e.jsx(i.span,{style:{"--shiki-light":"#1976D2","--shiki-dark":"#F8F8F8"},children:"..."}),e.jsx(i.span,{style:{"--shiki-light":"#24292EFF","--shiki-dark":"#B392F0"},children:"]   "}),e.jsx(i.span,{style:{"--shiki-light":"#C2C3C5","--shiki-dark":"#6B737C"},children:"# keep the defaults from values.yaml"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:"        auth_config"}),e.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:":"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:"          claims"}),e.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:":"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292EFF","--shiki-dark":"#B392F0"},children:"            - "}),e.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:"claim"}),e.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:":"}),e.jsx(i.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#FFAB70"},children:" realm_access.roles"}),e.jsx(i.span,{style:{"--shiki-light":"#C2C3C5","--shiki-dark":"#6B737C"},children:"   # was auth.authorization.rolesClaim"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:"              operator"}),e.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:":"}),e.jsx(i.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#FFAB70"},children:" contains"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:"              value"}),e.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:":"}),e.jsx(i.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#FFAB70"},children:" pki-admin"}),e.jsx(i.span,{style:{"--shiki-light":"#C2C3C5","--shiki-dark":"#6B737C"},children:"            # was auth.authorization.roles.admin"})]})]})})})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsxs(i.ul,{children:[`
`,e.jsxs(i.li,{children:[e.jsx(i.code,{children:"jwkUrl"})," is fetched from the ",e.jsx(i.code,{children:"authz"})," pod, not from the gateway, so a Service in the release namespace can be referenced by its short name. The default points at a Keycloak Service named ",e.jsx(i.code,{children:"auth-keycloak"}),"; set it explicitly if your identity provider lives anywhere else."]}),`
`,e.jsxs(i.li,{children:[e.jsx(i.code,{children:"authz"})," is the authorization service's own storage for principals, grants and policies. ",e.jsx(i.code,{children:"pki"})," is the database the authorization engine queries when it evaluates policies against entities. Only the ",e.jsx(i.code,{children:"database"})," field of each entry is read; the connection always uses the global ",e.jsx(i.code,{children:"postgres.hostname"}),", ",e.jsx(i.code,{children:"postgres.port"}),", ",e.jsx(i.code,{children:"postgres.username"})," and ",e.jsx(i.code,{children:"postgres.password"})," values."]}),`
`,e.jsxs(i.li,{children:["If you kept the 3.8.0 role defaults (",e.jsx(i.code,{children:"realm_access.roles"})," and ",e.jsx(i.code,{children:"pki-admin"}),"), the default ",e.jsx(i.code,{children:"services.authz.bootstrap"})," already matches them."]}),`
`]})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsxs(i.p,{children:[e.jsx(i.strong,{children:"Delete the gateway token validation blocks."})," Remove ",e.jsx(i.code,{children:"auth.oidc.apiGateway"})," and ",e.jsx(i.code,{children:"auth.authorization"})," once their settings are in ",e.jsx(i.code,{children:"services.authz"}),":"]})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes min-light min-dark",style:{"--shiki-light":"#24292eff","--shiki-dark":"#b392f0","--shiki-light-bg":"#ffffff","--shiki-dark-bg":"#1f1f1f"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(i.code,{children:[e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#C2C3C5","--shiki-dark":"#6B737C"},children:"# REMOVE (3.8.0)"})}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:"auth"}),e.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:":"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:"  oidc"}),e.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:":"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:"    apiGateway"}),e.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:":"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:"      jwks"}),e.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:":"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292EFF","--shiki-dark":"#B392F0"},children:"        - "}),e.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:"name"}),e.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:":"}),e.jsx(i.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#FFAB70"},children:" oidc-authn"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:"          uri"}),e.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:":"}),e.jsx(i.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#FFAB70"},children:" https://idp.example.com/realms/lamassu/protocol/openid-connect/certs"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:"  authorization"}),e.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:":"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:"    rolesClaim"}),e.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:":"}),e.jsx(i.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#FFAB70"},children:" realm_access.roles"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:"    roles"}),e.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:":"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:"      admin"}),e.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:":"}),e.jsx(i.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#FFAB70"},children:" pki-admin"})]})]})})})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(i.p,{children:e.jsxs(i.strong,{children:["Rename ",e.jsx(i.code,{children:"toolbox"})," to ",e.jsx(i.code,{children:"connectivityTest"}),":"]})})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes min-light min-dark",style:{"--shiki-light":"#24292eff","--shiki-dark":"#b392f0","--shiki-light-bg":"#ffffff","--shiki-dark-bg":"#1f1f1f"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(i.code,{children:[e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#C2C3C5","--shiki-dark":"#6B737C"},children:"# OLD (3.8.0)"})}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:"toolbox"}),e.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:":"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:"  image"}),e.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:":"}),e.jsx(i.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#FFAB70"},children:" ghcr.io/lamassuiot/toolbox:2.2.0"})]}),`
`,e.jsx(i.span,{className:"line"}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#C2C3C5","--shiki-dark":"#6B737C"},children:"# NEW (4.0.0)"})}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:"connectivityTest"}),e.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:":"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:"  image"}),e.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:":"}),e.jsx(i.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#FFAB70"},children:" curlimages/curl@sha256:58adaa4e8dca9c988bae2aba4ab3434a0bb2da16bbe3f92dec39ec7785166777"})]})]})})})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsxs(i.p,{children:[e.jsx(i.strong,{children:"Remove the per-service identity overrides"})," ",e.jsx(i.code,{children:"services.kms.securityContext.runAsGroup"})," and ",e.jsx(i.code,{children:"services.authz.securityContext.runAsUser"}),"/",e.jsx(i.code,{children:"runAsGroup"}),"."]})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsxs(i.p,{children:[e.jsxs(i.strong,{children:["Convert ",e.jsx(i.code,{children:"services.connectors"})," to a map"]})," keyed by connector ID, each entry with its ",e.jsx(i.code,{children:"type"})," and ",e.jsx(i.code,{children:"image"}),":"]})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes min-light min-dark",style:{"--shiki-light":"#24292eff","--shiki-dark":"#b392f0","--shiki-light-bg":"#ffffff","--shiki-dark-bg":"#1f1f1f"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(i.code,{children:[e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:"services"}),e.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:":"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:"  connectors"}),e.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:":"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:"    aws.myconnector"}),e.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:":"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:"      type"}),e.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:":"}),e.jsx(i.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#FFAB70"},children:" awsiot"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:"      image"}),e.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:":"}),e.jsx(i.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#FFAB70"},children:" ghcr.io/lamassuiot/lamassu-aws-connector:dev-v4"})]})]})})})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsxs(i.p,{children:[e.jsx(i.strong,{children:"Check AMQP."})," If you set ",e.jsx(i.code,{children:"amqp.tls: true"}),", also set ",e.jsx(i.code,{children:"amqp.port"})," to the broker's TLS listener (commonly ",e.jsx(i.code,{children:"5671"}),"), or set ",e.jsx(i.code,{children:"amqp.tls: false"})," to stay on plaintext."]})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsxs(i.p,{children:[e.jsx(i.strong,{children:"Enable the CA-to-KMS migration"})," if your CA keys predate the KMS:"]})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes min-light min-dark",style:{"--shiki-light":"#24292eff","--shiki-dark":"#b392f0","--shiki-light-bg":"#ffffff","--shiki-dark-bg":"#1f1f1f"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(i.code,{children:[e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:"migrations"}),e.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:":"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:"  caToKms"}),e.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:":"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:"    enabled"}),e.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:":"}),e.jsx(i.span,{style:{"--shiki-light":"#1976D2","--shiki-dark":"#79B8FF"},children:" true"})]})]})})})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsxs(i.p,{children:[e.jsx(i.strong,{children:"Review the remaining values:"})," overrides that pinned ",e.jsx(i.code,{children:"services.ui.port"})," to ",e.jsx(i.code,{children:"80"}),", the old ",e.jsx(i.code,{children:"probes:"})," block, the TLS issuer, and explicit ",e.jsx(i.code,{children:"affinity"})," and ",e.jsx(i.code,{children:"topologySpreadConstraints"})," where your cluster needs them. ",e.jsx(i.a,{href:"#renamed-and-reshaped-values",children:"Renamed and reshaped values"})," describes each one."]})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsxs(i.p,{children:["Run ",e.jsx(i.code,{children:"helm lint"})," with the new values before upgrading; the strict schema reports any key that is still unknown."]})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(i.h3,{id:"step-3-run-the-upgrade",children:"Step 3: Run the upgrade"})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes min-light min-dark",style:{"--shiki-light":"#24292eff","--shiki-dark":"#b392f0","--shiki-light-bg":"#ffffff","--shiki-dark-bg":"#1f1f1f"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsxs(i.code,{children:[e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"helm"}),e.jsx(i.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" upgrade"}),e.jsx(i.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" --install"}),e.jsx(i.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#FFAB70"},children:' "$RELEASE"'}),e.jsx(i.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" lamassu/lamassu"}),e.jsx(i.span,{style:{"--shiki-light":"#24292EFF","--shiki-dark":"#B392F0"},children:" \\"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:"  --namespace"}),e.jsx(i.span,{style:{"--shiki-light":"#24292EFF","--shiki-dark":"#B392F0"},children:" $NAMESPACE \\"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:"  --values"}),e.jsx(i.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" values.yaml"}),e.jsx(i.span,{style:{"--shiki-light":"#24292EFF","--shiki-dark":"#B392F0"},children:" \\"})]}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:"  --wait"})})]})})})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(i.p,{children:"Helm runs the pre-upgrade hooks — the CA-to-KMS migration when enabled, and the database job — before applying any workload, so services never start against an unprepared database. If validation rejects unknown values, fix the values file and re-run. If the deployment uses local KMS or VA storage, those pods fail until you complete step 4."})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(i.h3,{id:"step-4-migrate-the-kms-and-va-data",children:"Step 4: Migrate the KMS and VA data"})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsxs(i.p,{children:["Skip this step when ",e.jsx(i.code,{children:"services.kms.cryptoEngines"})," never used a ",e.jsx(i.code,{children:"filesystem"})," engine and ",e.jsx(i.code,{children:"services.va.fileStore.type"})," was never ",e.jsx(i.code,{children:"local"}),"."]})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsxs(i.ol,{children:[`
`,e.jsxs(i.li,{children:[e.jsx(i.strong,{children:"Find the new StatefulSets and PVCs."})," Their names depend on the release name and any ",e.jsx(i.code,{children:"nameOverride"})," or ",e.jsx(i.code,{children:"fullnameOverride"}),"; the PVC name is ",e.jsx(i.code,{children:"<volumeClaimTemplate>-<StatefulSet name>-0"}),":"]}),`
`]})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes min-light min-dark",style:{"--shiki-light":"#24292eff","--shiki-dark":"#b392f0","--shiki-light-bg":"#ffffff","--shiki-dark-bg":"#1f1f1f"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsxs(i.code,{children:[e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292EFF","--shiki-dark":"#B392F0"},children:"KMS_STS"}),e.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:"="}),e.jsx(i.span,{style:{"--shiki-light":"#24292EFF","--shiki-dark":"#B392F0"},children:"$("}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"kubectl"}),e.jsx(i.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" get"}),e.jsx(i.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" statefulset"}),e.jsx(i.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" -n"}),e.jsx(i.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#FFAB70"},children:' "$NAMESPACE"'}),e.jsx(i.span,{style:{"--shiki-light":"#24292EFF","--shiki-dark":"#B392F0"},children:" \\"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:"  -l"}),e.jsx(i.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#FFAB70"},children:' "app.kubernetes.io/instance=$RELEASE,app.kubernetes.io/component=kms"'}),e.jsx(i.span,{style:{"--shiki-light":"#24292EFF","--shiki-dark":"#B392F0"},children:" \\"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:"  -o"}),e.jsx(i.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" jsonpath="}),e.jsx(i.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#FFAB70"},children:"'{.items[0].metadata.name}'"}),e.jsx(i.span,{style:{"--shiki-light":"#24292EFF","--shiki-dark":"#B392F0"},children:")"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292EFF","--shiki-dark":"#B392F0"},children:"VA_STS"}),e.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:"="}),e.jsx(i.span,{style:{"--shiki-light":"#24292EFF","--shiki-dark":"#B392F0"},children:"$("}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"kubectl"}),e.jsx(i.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" get"}),e.jsx(i.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" statefulset"}),e.jsx(i.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" -n"}),e.jsx(i.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#FFAB70"},children:' "$NAMESPACE"'}),e.jsx(i.span,{style:{"--shiki-light":"#24292EFF","--shiki-dark":"#B392F0"},children:" \\"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:"  -l"}),e.jsx(i.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#FFAB70"},children:' "app.kubernetes.io/instance=$RELEASE,app.kubernetes.io/component=va"'}),e.jsx(i.span,{style:{"--shiki-light":"#24292EFF","--shiki-dark":"#B392F0"},children:" \\"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:"  -o"}),e.jsx(i.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" jsonpath="}),e.jsx(i.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#FFAB70"},children:"'{.items[0].metadata.name}'"}),e.jsx(i.span,{style:{"--shiki-light":"#24292EFF","--shiki-dark":"#B392F0"},children:")"})]}),`
`,e.jsx(i.span,{className:"line"}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292EFF","--shiki-dark":"#B392F0"},children:"KMS_PVC"}),e.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:"="}),e.jsx(i.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#FFAB70"},children:'"golang-engine-storage-${KMS_STS}-0"'})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292EFF","--shiki-dark":"#B392F0"},children:"VA_PVC"}),e.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:"="}),e.jsx(i.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#FFAB70"},children:'"local-crl-file-storage-${VA_STS}-0"'})]}),`
`,e.jsx(i.span,{className:"line"}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"kubectl"}),e.jsx(i.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" get"}),e.jsx(i.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" pvc"}),e.jsx(i.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" -n"}),e.jsx(i.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#FFAB70"},children:' "$NAMESPACE"'}),e.jsx(i.span,{style:{"--shiki-light":"#24292EFF","--shiki-dark":"#B392F0"},children:" \\"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:"  golang-engine-storage-kms-0"}),e.jsx(i.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#FFAB70"},children:' "$KMS_PVC"'}),e.jsx(i.span,{style:{"--shiki-light":"#24292EFF","--shiki-dark":"#B392F0"},children:" \\"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:"  local-crl-file-storage-va-0"}),e.jsx(i.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#FFAB70"},children:' "$VA_PVC"'})]})]})})})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsxs(i.p,{children:["With release ",e.jsx(i.code,{children:"lamassu"})," and the default chart name, the new PVCs are ",e.jsx(i.code,{children:"golang-engine-storage-lamassu-kms-0"})," and ",e.jsx(i.code,{children:"local-crl-file-storage-lamassu-va-0"}),"; with release ",e.jsx(i.code,{children:"prod"})," they are ",e.jsx(i.code,{children:"golang-engine-storage-prod-lamassu-kms-0"})," and ",e.jsx(i.code,{children:"local-crl-file-storage-prod-lamassu-va-0"}),". Confirm both old and new PVCs exist before continuing. If you only migrate one of the two services, drop the other one's claims from the commands that follow."]})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsxs(i.ol,{start:"2",children:[`
`,e.jsxs(i.li,{children:[e.jsx(i.strong,{children:"Record the replica counts and scale the new StatefulSets down"})," so nothing writes to either volume while you copy:"]}),`
`]})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes min-light min-dark",style:{"--shiki-light":"#24292eff","--shiki-dark":"#b392f0","--shiki-light-bg":"#ffffff","--shiki-dark-bg":"#1f1f1f"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsxs(i.code,{children:[e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292EFF","--shiki-dark":"#B392F0"},children:"KMS_REPLICAS"}),e.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:"="}),e.jsx(i.span,{style:{"--shiki-light":"#24292EFF","--shiki-dark":"#B392F0"},children:"$("}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"kubectl"}),e.jsx(i.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" get"}),e.jsx(i.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" statefulset"}),e.jsx(i.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" -n"}),e.jsx(i.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#FFAB70"},children:' "$NAMESPACE"'}),e.jsx(i.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#FFAB70"},children:' "$KMS_STS"'}),e.jsx(i.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" -o"}),e.jsx(i.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" jsonpath="}),e.jsx(i.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#FFAB70"},children:"'{.spec.replicas}'"}),e.jsx(i.span,{style:{"--shiki-light":"#24292EFF","--shiki-dark":"#B392F0"},children:")"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292EFF","--shiki-dark":"#B392F0"},children:"VA_REPLICAS"}),e.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:"="}),e.jsx(i.span,{style:{"--shiki-light":"#24292EFF","--shiki-dark":"#B392F0"},children:"$("}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"kubectl"}),e.jsx(i.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" get"}),e.jsx(i.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" statefulset"}),e.jsx(i.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" -n"}),e.jsx(i.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#FFAB70"},children:' "$NAMESPACE"'}),e.jsx(i.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#FFAB70"},children:' "$VA_STS"'}),e.jsx(i.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" -o"}),e.jsx(i.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" jsonpath="}),e.jsx(i.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#FFAB70"},children:"'{.spec.replicas}'"}),e.jsx(i.span,{style:{"--shiki-light":"#24292EFF","--shiki-dark":"#B392F0"},children:")"})]}),`
`,e.jsx(i.span,{className:"line"}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"kubectl"}),e.jsx(i.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" scale"}),e.jsx(i.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" statefulset"}),e.jsx(i.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" -n"}),e.jsx(i.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#FFAB70"},children:' "$NAMESPACE"'}),e.jsx(i.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#FFAB70"},children:' "$KMS_STS"'}),e.jsx(i.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#FFAB70"},children:' "$VA_STS"'}),e.jsx(i.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" --replicas=0"})]})]})})})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsxs(i.ol,{start:"3",children:[`
`,e.jsxs(i.li,{children:[e.jsx(i.strong,{children:"Run a short-lived helper pod"})," that mounts all four claims. It runs as root so it can change file ownership, so pin its image by digest and do not mount the service-account token:"]}),`
`]})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes min-light min-dark",style:{"--shiki-light":"#24292eff","--shiki-dark":"#b392f0","--shiki-light-bg":"#ffffff","--shiki-dark-bg":"#1f1f1f"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsxs(i.code,{children:[e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"cat"}),e.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:" <<"}),e.jsx(i.span,{style:{"--shiki-light":"#24292EFF","--shiki-dark":"#B392F0"},children:"EOF"}),e.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:" |"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" kubectl"}),e.jsx(i.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" apply"}),e.jsx(i.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" -f"}),e.jsx(i.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" -"})]}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:"apiVersion: v1"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:"kind: Pod"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:"metadata:"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:"  name: pvc-migrate-helper"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:"  namespace: $NAMESPACE"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:"spec:"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:"  restartPolicy: Never"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:"  automountServiceAccountToken: false"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:"  containers:"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:"    - name: migrate"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:"      image: docker.io/library/alpine@sha256:d9e853e87e55526f6b2917df91a2115c36dd7c696a35be12163d44e6e2a4b6bc # 3.20"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:'      command: ["sh", "-c", "sleep 3600"]'})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:"      volumeMounts:"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:"        - {name: old-kms, mountPath: /old/kms}"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:"        - {name: new-kms, mountPath: /new/kms}"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:"        - {name: old-va,  mountPath: /old/va}"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:"        - {name: new-va,  mountPath: /new/va}"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:"  volumes:"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:"    - {name: old-kms, persistentVolumeClaim: {claimName: golang-engine-storage-kms-0}}"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:"    - {name: new-kms, persistentVolumeClaim: {claimName: $KMS_PVC}}"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:"    - {name: old-va,  persistentVolumeClaim: {claimName: local-crl-file-storage-va-0}}"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:"    - {name: new-va,  persistentVolumeClaim: {claimName: $VA_PVC}}"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292EFF","--shiki-dark":"#B392F0"},children:"EOF"})}),`
`,e.jsx(i.span,{className:"line"}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"kubectl"}),e.jsx(i.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" wait"}),e.jsx(i.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" -n"}),e.jsx(i.span,{style:{"--shiki-light":"#24292EFF","--shiki-dark":"#B392F0"},children:" $NAMESPACE "}),e.jsx(i.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:"--for=condition=Ready"}),e.jsx(i.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" pod/pvc-migrate-helper"}),e.jsx(i.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" --timeout=60s"})]})]})})})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsxs(i.ol,{start:"4",children:[`
`,e.jsxs(i.li,{children:[e.jsx(i.strong,{children:"Inspect before writing"})," so you do not clobber data the new pods may already have written:"]}),`
`]})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes min-light min-dark",style:{"--shiki-light":"#24292eff","--shiki-dark":"#b392f0","--shiki-light-bg":"#ffffff","--shiki-dark-bg":"#1f1f1f"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsx(i.code,{children:e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"kubectl"}),e.jsx(i.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" exec"}),e.jsx(i.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" -n"}),e.jsx(i.span,{style:{"--shiki-light":"#24292EFF","--shiki-dark":"#B392F0"},children:" $NAMESPACE "}),e.jsx(i.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:"pvc-migrate-helper"}),e.jsx(i.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" --"}),e.jsx(i.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" sh"}),e.jsx(i.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" -c"}),e.jsx(i.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#FFAB70"},children:" 'find /new/kms /new/va -type f'"})]})})})})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(i.p,{children:"An empty result is the common case: a StatefulSet's own pod rarely gets far enough to write anything when its dependent data is missing. If the output is not empty, record the files and confirm with the service owner that they are disposable before you run the copy; do not overlay the 3.8.0 data onto an unknown store."})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsxs(i.ol,{start:"5",children:[`
`,e.jsxs(i.li,{children:[e.jsx(i.strong,{children:"Copy the data, align ownership and verify the copy."})," The second command must print ",e.jsx(i.code,{children:"copy verified"}),"; any ",e.jsx(i.code,{children:"diff"})," output means the copy is incomplete, so do not continue:"]}),`
`]})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes min-light min-dark",style:{"--shiki-light":"#24292eff","--shiki-dark":"#b392f0","--shiki-light-bg":"#ffffff","--shiki-dark-bg":"#1f1f1f"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsxs(i.code,{children:[e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"kubectl"}),e.jsx(i.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" exec"}),e.jsx(i.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" -n"}),e.jsx(i.span,{style:{"--shiki-light":"#24292EFF","--shiki-dark":"#B392F0"},children:" $NAMESPACE "}),e.jsx(i.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:"pvc-migrate-helper"}),e.jsx(i.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" --"}),e.jsx(i.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" sh"}),e.jsx(i.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" -c"}),e.jsx(i.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#FFAB70"},children:" '"})]}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#FFAB70"},children:"  cp -a /old/kms/. /new/kms/ &&"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#FFAB70"},children:"  cp -a /old/va/. /new/va/ &&"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#FFAB70"},children:"  chown -R 65532:65532 /new/kms /new/va"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#FFAB70"},children:"'"})}),`
`,e.jsx(i.span,{className:"line"}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"kubectl"}),e.jsx(i.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" exec"}),e.jsx(i.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" -n"}),e.jsx(i.span,{style:{"--shiki-light":"#24292EFF","--shiki-dark":"#B392F0"},children:" $NAMESPACE "}),e.jsx(i.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:"pvc-migrate-helper"}),e.jsx(i.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" --"}),e.jsx(i.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" sh"}),e.jsx(i.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" -c"}),e.jsx(i.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#FFAB70"},children:" '"})]}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#FFAB70"},children:"  diff -r /old/kms /new/kms &&"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#FFAB70"},children:"  diff -r /old/va /new/va &&"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#FFAB70"},children:'  echo "copy verified"'})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#FFAB70"},children:"'"})})]})})})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsxs(i.p,{children:["The ",e.jsx(i.code,{children:"chown"})," is required even if the old files already look non-root-owned, because 4.0.0 requires exactly ",e.jsx(i.code,{children:"65532:65532"})," and does not fall back to whatever the image declares."]})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsxs(i.ol,{start:"6",children:[`
`,e.jsx(i.li,{children:e.jsx(i.strong,{children:"Remove the helper and restore the recorded replica counts:"})}),`
`]})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes min-light min-dark",style:{"--shiki-light":"#24292eff","--shiki-dark":"#b392f0","--shiki-light-bg":"#ffffff","--shiki-dark-bg":"#1f1f1f"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsxs(i.code,{children:[e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"kubectl"}),e.jsx(i.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" delete"}),e.jsx(i.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" pod"}),e.jsx(i.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" -n"}),e.jsx(i.span,{style:{"--shiki-light":"#24292EFF","--shiki-dark":"#B392F0"},children:" $NAMESPACE "}),e.jsx(i.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:"pvc-migrate-helper"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"kubectl"}),e.jsx(i.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" scale"}),e.jsx(i.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" statefulset"}),e.jsx(i.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" -n"}),e.jsx(i.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#FFAB70"},children:' "$NAMESPACE"'}),e.jsx(i.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#FFAB70"},children:' "$KMS_STS"'}),e.jsx(i.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" --replicas="}),e.jsx(i.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#FFAB70"},children:'"$KMS_REPLICAS"'})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"kubectl"}),e.jsx(i.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" scale"}),e.jsx(i.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" statefulset"}),e.jsx(i.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" -n"}),e.jsx(i.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#FFAB70"},children:' "$NAMESPACE"'}),e.jsx(i.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#FFAB70"},children:' "$VA_STS"'}),e.jsx(i.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" --replicas="}),e.jsx(i.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#FFAB70"},children:'"$VA_REPLICAS"'})]})]})})})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(i.h3,{id:"step-5-remove-the-one-off-migration-values",children:"Step 5: Remove the one-off migration values"})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsxs(i.p,{children:["After the upgrade that performed the CA-to-KMS migration succeeds, remove ",e.jsx(i.code,{children:"migrations.caToKms.enabled"})," from your values (it defaults to ",e.jsx(i.code,{children:"false"}),"). The hook reads the legacy 3.8.0 ",e.jsx(i.code,{children:"kms-config"})," ConfigMap while it still exists and falls back to the release-scoped ",e.jsx(i.code,{children:"<release>-lamassu-kms-config"})," once it is gone."]})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsxs(i.p,{children:["Then go through the ",e.jsx(i.a,{href:"#validation-checklist",children:"validation checklist"}),". Keep the old PVCs until it passes."]})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(i.h3,{id:"deployments-without-helm",children:"Deployments without Helm"})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsxs(i.p,{children:["Without the chart's database job, no tool moves data between databases: the migration tooling only applies migrations to a schema that already exists. Move each per-service database into its ",e.jsx(i.code,{children:"pki"})," schema yourself, preserving structure, indexes, constraints, data and migration history, with writes stopped and a verified backup in hand."]})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsxs(i.p,{children:["To apply migrations by hand, ",e.jsx(i.code,{children:"goose-lamassu"})," must run against the ",e.jsx(i.code,{children:"pki"})," database with ",e.jsx(i.code,{children:"search_path=<schema>"})," in the connection string. The binary validates only ",e.jsx(i.code,{children:"search_path"}),", not the database name, so check ",e.jsx(i.code,{children:"dbname=pki"})," before running it, and repeat for ",e.jsx(i.code,{children:"kms"}),", ",e.jsx(i.code,{children:"ca"}),", ",e.jsx(i.code,{children:"va"}),", ",e.jsx(i.code,{children:"devicemanager"}),", ",e.jsx(i.code,{children:"dmsmanager"})," and ",e.jsx(i.code,{children:"alerts"}),":"]})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes min-light min-dark",style:{"--shiki-light":"#24292eff","--shiki-dark":"#b392f0","--shiki-light-bg":"#ffffff","--shiki-dark-bg":"#1f1f1f"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsx(i.code,{children:e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"./goose-lamassu"}),e.jsx(i.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#FFAB70"},children:' "host=$DB_HOST port=5432 user=$DB_USER dbname=pki search_path=kms"'}),e.jsx(i.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" up"})]})})})})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsxs(i.p,{children:["Run ",e.jsx(i.code,{children:"ca-to-kms-migration"})," first with ",e.jsx(i.code,{children:"--dry-run"}),", which reports without writing to KMS storage, and then for real:"]})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes min-light min-dark",style:{"--shiki-light":"#24292eff","--shiki-dark":"#b392f0","--shiki-light-bg":"#ffffff","--shiki-dark-bg":"#1f1f1f"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsxs(i.code,{children:[e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292EFF","--shiki-dark":"#B392F0"},children:"LAMASSU_CONFIG_FILE"}),e.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:"="}),e.jsx(i.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:"migrate.yaml"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" ./ca-to-kms-migration"}),e.jsx(i.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" --dry-run"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292EFF","--shiki-dark":"#B392F0"},children:"LAMASSU_CONFIG_FILE"}),e.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:"="}),e.jsx(i.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:"migrate.yaml"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" ./ca-to-kms-migration"})]})]})})})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsxs(i.p,{children:["Point the tool's ",e.jsx(i.code,{children:"storage"})," configuration at the ",e.jsx(i.code,{children:"pki"})," database, where the CA and KMS data now live in the ",e.jsx(i.code,{children:"ca"})," and ",e.jsx(i.code,{children:"kms"})," schemas. The tool's options are described in ",e.jsx(i.code,{children:"backend/cmd/ca-to-kms-migration/README.md"})," in the ",e.jsx(i.code,{children:"lamassuiot"})," repository."]})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(a,{type:"warn",title:"The tools' READMEs are outdated",children:e.jsxs(i.p,{children:["The ",e.jsx(i.code,{children:"goose-lamassu"})," README still shows per-database examples (",e.jsx(i.code,{children:"dbname=ca"}),", ",e.jsx(i.code,{children:"dbname=kms"}),") and claims the tool validates the database name, and the ",e.jsx(i.code,{children:"ca-to-kms-migration"})," README still describes the pre-4.0.0 two-database layout. Follow the ",e.jsx(i.code,{children:"dbname=pki"})," form on this page instead of their examples."]})})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(i.h3,{id:"troubleshooting",children:"Troubleshooting"})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsxs(i.ul,{children:[`
`,e.jsxs(i.li,{children:[e.jsxs(i.strong,{children:["KMS or VA pods crash with ",e.jsx(i.code,{children:"no such file or directory"})," or ",e.jsx(i.code,{children:"code=NotFound"})," right after the upgrade."]})," The pods are bound to the new, empty PVCs and the data migration has not run yet, or was copied into the wrong PVC. Follow ",e.jsx(i.a,{href:"#step-4-migrate-the-kms-and-va-data",children:"step 4"})," and check that all four claims exist."]}),`
`,e.jsxs(i.li,{children:[e.jsxs(i.strong,{children:[e.jsx(i.code,{children:"helm upgrade"})," fails with an unknown-key validation error."]})," Remove or rename the legacy values — typically ",e.jsx(i.code,{children:"toolbox"}),", ",e.jsx(i.code,{children:"auth.oidc.apiGateway"})," or ",e.jsx(i.code,{children:"auth.authorization"})," — because the strict schema rejects keys it does not know."]}),`
`,e.jsxs(i.li,{children:[e.jsx(i.strong,{children:"The upgrade fails at the database job."})," The PostgreSQL role cannot create databases or schemas, or a schema migration aborted on duplicate CA IDs or missing ",e.jsx(i.code,{children:"engine_id"})," values. Check the job logs, fix the privileges or the data, and re-run the upgrade."]}),`
`,e.jsxs(i.li,{children:[e.jsx(i.strong,{children:"The upgrade fails at the CA-to-KMS hook."})," CA certificates that share a ",e.jsx(i.code,{children:"subject_key_id"})," declare conflicting ",e.jsx(i.code,{children:"engine_id"}),"s. Resolve the conflict and re-run."]}),`
`,e.jsxs(i.li,{children:[e.jsx(i.strong,{children:"Nobody can log in after the upgrade."})," Check that ",e.jsx(i.code,{children:"services.authz.jwkUrl"})," is reachable from the ",e.jsx(i.code,{children:"authz"})," pod, that ",e.jsx(i.code,{children:"services.authz.bootstrap"})," matches a role your OIDC provider actually assigns, and that the database job completed."]}),`
`]})}),`
`,e.jsxs(i.h2,{id:"validation-checklist",children:[e.jsx(i.del,{className:"lm-diff-del",children:"Verification"}),e.jsx(i.ins,{className:"lm-diff-ins",children:"Validation"})," checklist"]}),`
`,e.jsxs(i.p,{children:["After ",e.jsx(i.del,{className:"lm-diff-del",children:"applying "}),"the upgrade, check in this order:"]}),`
`,e.jsxs(i.ol,{children:[`
`,e.jsxs(i.li,{className:"lm-diff-ins lm-diff-block",children:[e.jsx(i.strong,{children:"Databases."})," Each service reads the ",e.jsx(i.code,{children:"pki"})," database with its own schema, ",e.jsx(i.code,{children:"authz"})," and ",e.jsx(i.code,{children:"wfx"})," data are reachable, and the migration status is registered per schema, including the CA unique-ID and KMS composite-key migrations."]}),`
`,e.jsxs(i.li,{className:"lm-diff-ins lm-diff-block",children:[e.jsx(i.strong,{children:"KMS and VA start cleanly."})," Their logs show no ",e.jsx(i.code,{children:"no such file or directory"})," or ",e.jsx(i.code,{children:"code=NotFound"})," errors."]}),`
`,e.jsxs(i.li,{className:"lm-diff-ins lm-diff-block",children:[e.jsx(i.strong,{children:"Existing KMS keys work."})," Issue a certificate from a CA that existed before the upgrade. None of the other checks reads a KMS key, so this is the only one that proves the key material was copied."]}),`
`,e.jsxs(i.li,{className:"lm-diff-ins lm-diff-block",children:[e.jsx(i.strong,{children:"Existing CRLs are served."})," ",e.jsx(i.code,{children:"GET /crl/<ca-ski>"})," on VA returns a previously issued CRL, and new CRLs are issued."]}),`
`,e.jsxs(i.li,{className:"lm-diff-ins lm-diff-block",children:[e.jsx(i.strong,{children:"Legacy CA keys."})," If the CA-to-KMS migration ran, review its report and warnings and confirm the expected keys appear in the KMS."]}),`
`,e.jsxs(i.li,{className:"lm-diff-ins lm-diff-block",children:[e.jsx(i.strong,{children:"Connectivity."})," ",e.jsx(i.code,{children:'helm test "$RELEASE" -n $NAMESPACE --logs'})," passes; the hook checks the CA, DMS Manager, Device Manager and VA health endpoints and the UI response."]}),`
`,e.jsxs(i.li,{className:"lm-diff-ins lm-diff-block",children:[e.jsx(i.strong,{children:"Authorization."})," Sign in as the bootstrap principal and confirm administration works, check that an identity without permissions receives ",e.jsx(i.code,{children:"403"}),", and review client and integration permissions."]}),`
`,e.jsxs(i.li,{className:"lm-diff-ins lm-diff-block",children:[e.jsx(i.strong,{children:"AMQP."})," The backend connects to the broker with the expected TLS settings, and the cleanup policy for SSE queues is in place."]}),`
`,e.jsxs(i.li,{className:"lm-diff-ins lm-diff-block",children:[e.jsx(i.strong,{children:"Device events."})," ",e.jsx(i.code,{children:"GET /v1/devices/:id/events"})," returns the historical events of a device that had them."]}),`
`,e.jsxs(i.li,{children:[e.jsx(i.strong,{children:"Webhooks without file fields."})," ",e.jsx(i.del,{className:"lm-diff-del",children:"List the DMSs"}),e.jsx(i.ins,{className:"lm-diff-ins",children:"For each DMS"})," that ",e.jsx(i.del,{className:"lm-diff-del",children:"use"}),e.jsx(i.ins,{className:"lm-diff-ins",children:"uses"})," a webhook for enrollment or re-enrollment",e.jsx(i.del,{className:"lm-diff-del",children:" and confirm each"}),e.jsx(i.ins,{className:"lm-diff-ins",children:", the"})," ",e.jsx(i.code,{children:"config"})," block carries ",e.jsx(i.code,{children:"insecure_skip_verify"})," and the expected option block (",e.jsx(i.code,{children:"apikey_options"}),", ",e.jsx(i.code,{children:"jwt_options"})," or ",e.jsx(i.code,{children:"mtls_options"}),"), with the certificate and key as PEM and no ",e.jsx(i.code,{children:"cert_file"})," or ",e.jsx(i.code,{children:"key_file"}),"."]}),`
`,e.jsxs(i.li,{children:[e.jsx(i.strong,{children:"Receiver verification."})," ",e.jsx(i.del,{className:"lm-diff-del",children:"Confirm "}),e.jsx(i.code,{children:"insecure_skip_verify"})," is ",e.jsx(i.code,{children:"false"}),", unless the receiver certificate is intentionally unverified."]}),`
`,e.jsxs(i.li,{children:[e.jsx(i.strong,{children:e.jsx(i.del,{className:"lm-diff-del",children:"Delivery"})}),e.jsx(i.strong,{children:e.jsx(i.del,{className:"lm-diff-del",children:"."})}),e.jsx(i.del,{className:"lm-diff-del",children:" Trigger, or wait for, one"}),e.jsx(i.strong,{children:e.jsx(i.ins,{className:"lm-diff-ins",children:"Webhook delivery."})}),e.jsx(i.ins,{className:"lm-diff-ins",children:" One"})," enroll or re-enroll through each migrated webhook ",e.jsx(i.del,{className:"lm-diff-del",children:"and confirm the"}),e.jsx(i.ins,{className:"lm-diff-ins",children:"completes its"})," authorization call",e.jsx(i.del,{className:"lm-diff-del",children:" completes"}),"."]}),`
`,e.jsxs(i.li,{children:[e.jsx(i.strong,{children:"Trust set."})," ",e.jsxs(i.del,{className:"lm-diff-del",children:["Read ",e.jsx(i.code,{children:"est_rfc7030_settings.client_certificate_settings.validation_cas"})," and confirm it"]}),e.jsx(i.ins,{className:"lm-diff-ins",children:e.jsx(i.code,{children:"est_rfc7030_settings.client_certificate_settings.validation_cas"})})," holds the expected CAs, in particular those of the old CA during rotation overlaps."]}),`
`,e.jsxs(i.li,{children:[e.jsx(i.strong,{children:"API clients."})," ",e.jsx(i.del,{className:"lm-diff-del",children:"Update any script or console that uses"}),e.jsx(i.ins,{className:"lm-diff-ins",children:"Scripts and consoles no longer use"})," the old DMS layout (flat ",e.jsx(i.code,{children:"additional_validation_cas"}),", or the legacy ",e.jsx(i.code,{children:"mtls"}),", ",e.jsx(i.code,{children:"apikey"})," and ",e.jsx(i.code,{children:"oidc"})," fields), ",e.jsx(i.del,{className:"lm-diff-del",children:"since they silently drop those"}),e.jsxs(i.ins,{className:"lm-diff-ins",children:["send DMS updates with the ID in the URL, and match on the new certificate ",e.jsx(i.code,{children:"type"})]})," values."]}),`
`]}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(i.h3,{id:"delete-the-old-volumes",children:"Delete the old volumes"})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsxs(i.p,{children:["Only once every check passes, delete the orphaned 3.8.0 volumes to reclaim storage. The delete is irreversible and the old KMS volume may hold the last copy of your CA key material, so take a ",e.jsx(i.code,{children:"VolumeSnapshot"})," or a backup of both old PVCs first and keep it until you are confident the upgraded deployment is healthy:"]})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes min-light min-dark",style:{"--shiki-light":"#24292eff","--shiki-dark":"#b392f0","--shiki-light-bg":"#ffffff","--shiki-dark-bg":"#1f1f1f"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsx(i.code,{children:e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"kubectl"}),e.jsx(i.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" delete"}),e.jsx(i.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" pvc"}),e.jsx(i.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" -n"}),e.jsx(i.span,{style:{"--shiki-light":"#24292EFF","--shiki-dark":"#B392F0"},children:" $NAMESPACE "}),e.jsx(i.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:"golang-engine-storage-kms-0"}),e.jsx(i.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" local-crl-file-storage-va-0"})]})})})})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(i.p,{children:"The 3.8.0 per-service databases are no longer used either. Drop them only after the same checks pass and your PostgreSQL backup is verified."})}),`
`,e.jsxs(l,{children:[e.jsx(i.div,{className:"lm-diff-del lm-diff-block",children:e.jsx(n,{title:"Configure a DMS",href:"/docs/platform/iot-fleets/enrollment/dms"})}),e.jsx(i.div,{className:"lm-diff-del lm-diff-block",children:e.jsx(n,{title:"DMS API",href:"/docs/api-reference/dms-manager"})}),e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(n,{title:"Install with Helm",description:"Prepare dependencies, configure values and install a controlled deployment.",href:"/docs/deployment/self-hosted/helm"})}),e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(n,{title:"Access control",description:"Principals, policies and the first administrator.",href:"/docs/platform/administration/access-control"})}),e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(n,{title:"Configure a DMS",description:"Enrollment, re-enrollment and webhook settings.",href:"/docs/platform/iot-fleets/enrollment/dms"})})]})]})}function f(s={}){const{wrapper:i}=s.components||{};return i?e.jsx(i,{...s,children:e.jsx(d,{...s})}):d(s)}function t(s,i){throw new Error("Expected component `"+s+"` to be defined: you likely forgot to import, pass, or provide it.")}const k=Object.freeze(Object.defineProperty({__proto__:null,_markdown:r,default:f,frontmatter:o,lmDiff:h,structuredData:c,toc:m},Symbol.toStringTag,{value:"Module"}));export{k as _};

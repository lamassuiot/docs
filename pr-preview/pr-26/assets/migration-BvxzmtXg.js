import{j as e}from"./index-prc0XQdj.js";let d=`

<div className="lm-diff-ins lm-diff-block">
  Upgrade the Helm chart [#upgrade-the-helm-chart]
</div>

<div className="lm-diff-ins lm-diff-block">
  Use this guide to upgrade a Helm-managed deployment. It walks through the 3.8.0 to 4.0.0 chart migration in full: the values to review, the database changes the chart applies automatically and the manual steps for installations that keep KMS keys or VA CRLs on local volumes. Version-specific notes for other upgrades live in the [\`charts/lamassu/CHANGELOG/\` directory](https://github.com/lamassuiot/lamassu-helm/tree/main/charts/lamassu/CHANGELOG) of the \`lamassu-helm\` repository.
</div>

<div className="lm-diff-ins lm-diff-block">
  <Callout type="info" title="Fresh installs have nothing to migrate">
    If you are not upgrading an existing release, go straight to [Install with Helm](/docs/deployment/self-hosted/helm). The manual data steps on this page only apply to deployments upgraded from 3.8.x that use local KMS or VA storage.
  </Callout>
</div>

<div className="lm-diff-ins lm-diff-block">
  What changes in 4.0.0 [#what-changes-in-400]
</div>

<div className="lm-diff-ins lm-diff-block">
  Version 4.0.0 is a security-hardening release. Three changes affect upgrades:
</div>

<div className="lm-diff-ins lm-diff-block">
  * **Release-scoped resource names.** Every chart-managed resource is now named \`<release>-lamassu-<component>\`, for example \`lamassu-kms\`, instead of the fixed, unscoped names used in 3.8.0 (\`kms\`, \`va\`, \`ca\`, ...). With a release named \`prod\` the StatefulSets become \`prod-lamassu-kms\` and \`prod-lamassu-va\`, not \`prod-kms\`. The \`nameOverride\` and \`fullnameOverride\` values change the prefix.
  * **Non-root containers.** Every workload runs as the numeric user \`65532:65532\` with a \`RuntimeDefault\` seccomp profile and dropped capabilities. Pods do not mount the service-account token by default, and the chart creates a dedicated ServiceAccount.
  * **Strict values validation.** \`values.schema.json\` rejects unknown top-level keys, so leftover 3.8.0 blocks fail \`helm lint\` and \`helm upgrade\` outright instead of being silently ignored.
</div>

<div className="lm-diff-ins lm-diff-block">
  \`services.connectors\` also becomes a map keyed by connector ID, and the chart no longer injects pod anti-affinity or topology spread rules.
</div>

<div className="lm-diff-ins lm-diff-block">
  <Callout type="warn" title="The rename is not cosmetic for KMS and VA">
    Kubernetes derives the PVC name from the StatefulSet pod name (\`<volumeClaimTemplate>-<pod-name>\`). Renaming the \`kms\` and \`va\` StatefulSets means \`helm upgrade\` binds brand-new, empty PVCs instead of the existing ones. Your KMS key material and VA CRLs are not deleted — the old PVCs are orphaned, not removed — but the upgraded pods fail to find them with \`no such file or directory\` (KMS) or \`code=NotFound\` (VA) until you move the data across yourself. All other renamed resources are stateless and are recreated without data-loss risk.
  </Callout>
</div>

<div className="lm-diff-ins lm-diff-block">
  What the upgrade job does automatically [#what-the-upgrade-job-does-automatically]
</div>

<div className="lm-diff-ins lm-diff-block">
  Before any service starts, the chart's pre-install/pre-upgrade job prepares PostgreSQL:
</div>

<div className="lm-diff-ins lm-diff-block">
  1. Creates the \`pki\`, \`authz\` and \`wfx\` databases when they do not exist.
  2. Ensures one schema per service database (\`alerts\`, \`ca\`, \`va\`, \`devicemanager\`, \`dmsmanager\`, \`kms\`) inside the shared \`pki\` database, and folds 3.8.0's separate per-service databases into it, importing their data.
  3. Runs the database migrations for every schema.
  4. Migrates authz, preloads its policies and seeds the \`services.authz.bootstrap\` principals.
</div>

<div className="lm-diff-ins lm-diff-block">
  The job is idempotent, so a failed upgrade can be retried. It requires a PostgreSQL role allowed to create databases and schemas, as described in [Install with Helm](/docs/deployment/self-hosted/helm#before-you-begin).
</div>

<div className="lm-diff-ins lm-diff-block">
  Before you upgrade [#before-you-upgrade]
</div>

<div className="lm-diff-ins lm-diff-block">
  1. Record the names of your existing local-storage PVCs:
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
  \`helm upgrade\` does not touch or delete the old PVCs, but nothing references them after the upgrade. You need their names to copy data and to clean up later; do not delete them until the new volumes are verified.
</div>

<div className="lm-diff-ins lm-diff-block">
  2. Remove values the strict schema now rejects, for example the old \`toolbox:\` block. [Update your values file](#update-your-values-file) lists every rename.
</div>

<div className="lm-diff-ins lm-diff-block">
  Update your values file [#update-your-values-file]
</div>

<div className="lm-diff-ins lm-diff-block">
  **Add \`services.authz\` (required).** 3.8.0 had no authorization service: every route accepted any valid token. 4.0.0 adds fine-grained, entity-level authorization, and a 3.8.0 values file has nothing to migrate *from* — you must add the configuration:
</div>

<div className="lm-diff-ins lm-diff-block">
  \`\`\`yaml
  services:
    authz:
      credentials:
        pki:
          database: pki
        authz:
          database: authz
  \`\`\`
</div>

<div className="lm-diff-ins lm-diff-block">
  * \`authz\` is the authorization service's own storage for principals, grants and policies (\`services.authz.database\`, \`authz\` by default).
  * \`pki\` is the database the authorization engine queries when it evaluates policies against entities such as CAs, certificates, devices, DMSs, KMS keys and VA roles.
  * Only the \`database\` field of each credentials entry is read. Connection settings always come from the global \`postgres.hostname\`, \`postgres.port\`, \`postgres.username\` and \`postgres.password\` values.
  * Confirm \`services.authz.bootstrap\` (present by default in the chart) matches how your OIDC provider assigns the \`pki-admin\` realm role. Without a principal that matches the bootstrap rule, nobody can administer the PKI — there is no implicit superuser.
</div>

<div className="lm-diff-ins lm-diff-block">
  **Rename \`toolbox\` to \`connectivityTest\`.** The \`helm test\` connectivity hook now uses the upstream-maintained \`curlimages/curl\` image pinned by digest instead of the chart-owned toolbox image:
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
  **Remove per-service identity overrides.** \`services.kms.securityContext.runAsGroup: 0\` and \`services.authz.securityContext.runAsUser\`/\`runAsGroup: 999\` no longer exist. Every service runs under the chart-wide \`65532:65532\`, and KMS volume and PKCS#11 socket group access is handled automatically by the pod-level \`fsGroup: 65532\`.
</div>

<div className="lm-diff-ins lm-diff-block">
  **Convert \`services.connectors\` to a map.** Each entry is keyed by its stable connector ID and declares \`type\` and \`image\`:
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
  **Check the TLS issuer values.** With \`tls.certManagerOptions.issuer\` empty (the default), the chart creates a self-signed, release-scoped issuer — for example \`lamassu-downstream-ca-selfsigned-issuer\` with release \`lamassu\`. The legacy literal \`downstream-ca-selfsigned-issuer\` from 3.8.0-era values is still accepted and resolves to the same release-scoped issuer; point \`tls.certManagerOptions.clusterIssuer\` at your own issuer for corporate TLS.
</div>

<div className="lm-diff-ins lm-diff-block">
  **Review scheduling and ports.** The chart no longer injects pod anti-affinity or topology spread constraints — configure \`affinity\` and \`topologySpreadConstraints\` explicitly where your cluster needs them. The \`services.ui.port\` default is now \`8085\`, the unprivileged chart-wide port of the rootless image, so update overrides that pinned \`80\`. The shared \`probes:\` block is replaced by independent \`livenessProbe\`, \`readinessProbe\` and \`startupProbe\` blocks.
</div>

<div className="lm-diff-ins lm-diff-block">
  Run the upgrade [#run-the-upgrade]
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
  Helm runs the database job before applying any workload, so services never start against an unprepared database. If validation rejects unknown values, fix the values file and re-run.
</div>

<div className="lm-diff-ins lm-diff-block">
  Migrate the KMS and VA data [#migrate-the-kms-and-va-data]
</div>

<div className="lm-diff-ins lm-diff-block">
  Skip this section on fresh installs, or when \`services.kms.cryptoEngines\` never used a \`filesystem\` engine and \`services.va.fileStore.type\` was never \`local\`.
</div>

<div className="lm-diff-ins lm-diff-block">
  1. **Find the new StatefulSets and PVCs.** Their names depend on the release name and any \`nameOverride\`/\`fullnameOverride\`; the PVC name is \`<volumeClaimTemplate>-<StatefulSet name>-0\`:
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
  With release \`lamassu\` and the default chart name, the new PVCs are \`golang-engine-storage-lamassu-kms-0\` and \`local-crl-file-storage-lamassu-va-0\`; with release \`prod\` they are \`golang-engine-storage-prod-lamassu-kms-0\` and \`local-crl-file-storage-prod-lamassu-va-0\`. Confirm both old and new PVCs exist before continuing.
</div>

<div className="lm-diff-ins lm-diff-block">
  2. **Scale the new StatefulSets down** so nothing writes to either volume while you copy:
</div>

<div className="lm-diff-ins lm-diff-block">
  \`\`\`bash
  kubectl scale statefulset -n "$NAMESPACE" "$KMS_STS" "$VA_STS" --replicas=0
  \`\`\`
</div>

<div className="lm-diff-ins lm-diff-block">
  3. **Run a short-lived helper pod** that mounts all four claims:
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
    containers:
      - name: migrate
        image: docker.io/library/alpine:3.20
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
  An empty result is the common case: a StatefulSet's own pod rarely gets far enough to write anything when its dependent data is missing.
</div>

<div className="lm-diff-ins lm-diff-block">
  5. **Copy the data and align ownership**:
</div>

<div className="lm-diff-ins lm-diff-block">
  \`\`\`bash
  kubectl exec -n $NAMESPACE pvc-migrate-helper -- sh -c '
    cp -a /old/kms/. /new/kms/ &&
    cp -a /old/va/. /new/va/ &&
    chown -R 65532:65532 /new/kms /new/va
  '
  \`\`\`
</div>

<div className="lm-diff-ins lm-diff-block">
  The \`chown\` is required even if the old files already look non-root-owned. 3.8.0 did not pin a container identity, so files could carry any image-declared UID; 4.0.0 requires exactly \`65532:65532\` and does not fall back to whatever the image declares.
</div>

<div className="lm-diff-ins lm-diff-block">
  6. **Scale back up and remove the helper**:
</div>

<div className="lm-diff-ins lm-diff-block">
  \`\`\`bash
  kubectl delete pod -n $NAMESPACE pvc-migrate-helper
  kubectl scale statefulset -n "$NAMESPACE" "$KMS_STS" "$VA_STS" --replicas=1
  \`\`\`
</div>

<div className="lm-diff-ins lm-diff-block">
  Verify the migration [#verify-the-migration]
</div>

<div className="lm-diff-ins lm-diff-block">
  * KMS and VA logs show no \`no such file or directory\` or \`code=NotFound\` errors.
  * A previously issued CRL is servable again: \`GET /crl/<ca-ski>\` on VA.
  * \`helm test "$RELEASE" -n $NAMESPACE --logs\` passes; the connectivity hook checks the CA, DMS Manager, Device Manager and VA health endpoints and the UI response.
  * Sign in with an administrator identity and confirm operations are authorized.
</div>

<div className="lm-diff-ins lm-diff-block">
  Delete the old volumes [#delete-the-old-volumes]
</div>

<div className="lm-diff-ins lm-diff-block">
  Only once everything works, delete the orphaned 3.8.0 volumes to reclaim storage:
</div>

<div className="lm-diff-ins lm-diff-block">
  \`\`\`bash
  kubectl delete pvc -n $NAMESPACE golang-engine-storage-kms-0 local-crl-file-storage-va-0
  \`\`\`
</div>

<div className="lm-diff-ins lm-diff-block">
  Troubleshooting [#troubleshooting]
</div>

<div className="lm-diff-ins lm-diff-block">
  * **KMS or VA pods crash with \`no such file or directory\` or \`code=NotFound\` right after the upgrade.** The new pods are bound to the new empty PVCs and the data migration has not run yet, or was copied into the wrong PVC. Follow [Migrate the KMS and VA data](#migrate-the-kms-and-va-data) and check that all four claims exist.
  * **\`helm upgrade\` fails with an unknown-key validation error.** Remove or rename the legacy values — typically the \`toolbox:\` block — because the strict schema rejects top-level keys it does not know.
  * **The upgrade fails at the database job.** The PostgreSQL role cannot create databases or schemas; grant the required privileges, or create the \`pki\`, \`authz\` and \`wfx\` databases yourself, then re-run the upgrade.
  * **Nobody can log in after the upgrade.** Check that \`services.authz.bootstrap\` matches a role your OIDC provider actually assigns (see [Access control](/docs/platform/pki/access-control)) and that the migration Job completed successfully.
</div>

<div className="lm-diff-ins lm-diff-block">
  Related pages [#related-pages]
</div>

<div className="lm-diff-ins lm-diff-block">
  <Cards>
    <Card title="Install with Helm" description="Prepare dependencies, configure values and install a controlled deployment." href="/docs/deployment/self-hosted/helm" />

    <Card title="Expose the Gateway" description="Choose an external traffic design and handle Gateway addressing." href="/docs/deployment/self-hosted/networking" />
  </Cards>
</div>
`,h={title:"Upgrade the Helm chart",description:"Upgrade a Helm-managed Lamassu deployment, including the 3.8.0 to 4.0.0 chart migration and the KMS and VA persistent-data steps."},o={isNew:!0,changes:57,title:void 0,description:void 0},c={contents:[{heading:"upgrade-the-helm-chart",content:"Use this guide to upgrade a Helm-managed deployment. It walks through the 3.8.0 to 4.0.0 chart migration in full: the values to review, the database changes the chart applies automatically and the manual steps for installations that keep KMS keys or VA CRLs on local volumes. Version-specific notes for other upgrades live in the `charts/lamassu/CHANGELOG/` directory of the `lamassu-helm` repository."},{heading:"upgrade-the-helm-chart",content:"If you are not upgrading an existing release, go straight to Install with Helm. The manual data steps on this page only apply to deployments upgraded from 3.8.x that use local KMS or VA storage."},{heading:"what-changes-in-400",content:"Version 4.0.0 is a security-hardening release. Three changes affect upgrades:"},{heading:"what-changes-in-400",content:"**Release-scoped resource names.** Every chart-managed resource is now named `<release>-lamassu-<component>`, for example `lamassu-kms`, instead of the fixed, unscoped names used in 3.8.0 (`kms`, `va`, `ca`, ...). With a release named `prod` the StatefulSets become `prod-lamassu-kms` and `prod-lamassu-va`, not `prod-kms`. The `nameOverride` and `fullnameOverride` values change the prefix."},{heading:"what-changes-in-400",content:"**Non-root containers.** Every workload runs as the numeric user `65532:65532` with a `RuntimeDefault` seccomp profile and dropped capabilities. Pods do not mount the service-account token by default, and the chart creates a dedicated ServiceAccount."},{heading:"what-changes-in-400",content:"**Strict values validation.** `values.schema.json` rejects unknown top-level keys, so leftover 3.8.0 blocks fail `helm lint` and `helm upgrade` outright instead of being silently ignored."},{heading:"what-changes-in-400",content:"`services.connectors` also becomes a map keyed by connector ID, and the chart no longer injects pod anti-affinity or topology spread rules."},{heading:"what-changes-in-400",content:"Kubernetes derives the PVC name from the StatefulSet pod name (`<volumeClaimTemplate>-<pod-name>`). Renaming the `kms` and `va` StatefulSets means `helm upgrade` binds brand-new, empty PVCs instead of the existing ones. Your KMS key material and VA CRLs are not deleted — the old PVCs are orphaned, not removed — but the upgraded pods fail to find them with `no such file or directory` (KMS) or `code=NotFound` (VA) until you move the data across yourself. All other renamed resources are stateless and are recreated without data-loss risk."},{heading:"what-the-upgrade-job-does-automatically",content:"Before any service starts, the chart's pre-install/pre-upgrade job prepares PostgreSQL:"},{heading:"what-the-upgrade-job-does-automatically",content:"Creates the `pki`, `authz` and `wfx` databases when they do not exist."},{heading:"what-the-upgrade-job-does-automatically",content:"Ensures one schema per service database (`alerts`, `ca`, `va`, `devicemanager`, `dmsmanager`, `kms`) inside the shared `pki` database, and folds 3.8.0's separate per-service databases into it, importing their data."},{heading:"what-the-upgrade-job-does-automatically",content:"Runs the database migrations for every schema."},{heading:"what-the-upgrade-job-does-automatically",content:"Migrates authz, preloads its policies and seeds the `services.authz.bootstrap` principals."},{heading:"what-the-upgrade-job-does-automatically",content:"The job is idempotent, so a failed upgrade can be retried. It requires a PostgreSQL role allowed to create databases and schemas, as described in Install with Helm."},{heading:"before-you-upgrade",content:"Record the names of your existing local-storage PVCs:"},{heading:"before-you-upgrade",content:"`helm upgrade` does not touch or delete the old PVCs, but nothing references them after the upgrade. You need their names to copy data and to clean up later; do not delete them until the new volumes are verified."},{heading:"before-you-upgrade",content:"Remove values the strict schema now rejects, for example the old `toolbox:` block. Update your values file lists every rename."},{heading:"update-your-values-file",content:"**Add `services.authz` (required).** 3.8.0 had no authorization service: every route accepted any valid token. 4.0.0 adds fine-grained, entity-level authorization, and a 3.8.0 values file has nothing to migrate *from* — you must add the configuration:"},{heading:"update-your-values-file",content:"`authz` is the authorization service's own storage for principals, grants and policies (`services.authz.database`, `authz` by default)."},{heading:"update-your-values-file",content:"`pki` is the database the authorization engine queries when it evaluates policies against entities such as CAs, certificates, devices, DMSs, KMS keys and VA roles."},{heading:"update-your-values-file",content:"Only the `database` field of each credentials entry is read. Connection settings always come from the global `postgres.hostname`, `postgres.port`, `postgres.username` and `postgres.password` values."},{heading:"update-your-values-file",content:"Confirm `services.authz.bootstrap` (present by default in the chart) matches how your OIDC provider assigns the `pki-admin` realm role. Without a principal that matches the bootstrap rule, nobody can administer the PKI — there is no implicit superuser."},{heading:"update-your-values-file",content:"**Rename `toolbox` to `connectivityTest`.** The `helm test` connectivity hook now uses the upstream-maintained `curlimages/curl` image pinned by digest instead of the chart-owned toolbox image:"},{heading:"update-your-values-file",content:"**Remove per-service identity overrides.** `services.kms.securityContext.runAsGroup: 0` and `services.authz.securityContext.runAsUser`/`runAsGroup: 999` no longer exist. Every service runs under the chart-wide `65532:65532`, and KMS volume and PKCS#11 socket group access is handled automatically by the pod-level `fsGroup: 65532`."},{heading:"update-your-values-file",content:"**Convert `services.connectors` to a map.** Each entry is keyed by its stable connector ID and declares `type` and `image`:"},{heading:"update-your-values-file",content:"**Check the TLS issuer values.** With `tls.certManagerOptions.issuer` empty (the default), the chart creates a self-signed, release-scoped issuer — for example `lamassu-downstream-ca-selfsigned-issuer` with release `lamassu`. The legacy literal `downstream-ca-selfsigned-issuer` from 3.8.0-era values is still accepted and resolves to the same release-scoped issuer; point `tls.certManagerOptions.clusterIssuer` at your own issuer for corporate TLS."},{heading:"update-your-values-file",content:"**Review scheduling and ports.** The chart no longer injects pod anti-affinity or topology spread constraints — configure `affinity` and `topologySpreadConstraints` explicitly where your cluster needs them. The `services.ui.port` default is now `8085`, the unprivileged chart-wide port of the rootless image, so update overrides that pinned `80`. The shared `probes:` block is replaced by independent `livenessProbe`, `readinessProbe` and `startupProbe` blocks."},{heading:"run-the-upgrade",content:"Helm runs the database job before applying any workload, so services never start against an unprepared database. If validation rejects unknown values, fix the values file and re-run."},{heading:"migrate-the-kms-and-va-data",content:"Skip this section on fresh installs, or when `services.kms.cryptoEngines` never used a `filesystem` engine and `services.va.fileStore.type` was never `local`."},{heading:"migrate-the-kms-and-va-data",content:"**Find the new StatefulSets and PVCs.** Their names depend on the release name and any `nameOverride`/`fullnameOverride`; the PVC name is `<volumeClaimTemplate>-<StatefulSet name>-0`:"},{heading:"migrate-the-kms-and-va-data",content:"With release `lamassu` and the default chart name, the new PVCs are `golang-engine-storage-lamassu-kms-0` and `local-crl-file-storage-lamassu-va-0`; with release `prod` they are `golang-engine-storage-prod-lamassu-kms-0` and `local-crl-file-storage-prod-lamassu-va-0`. Confirm both old and new PVCs exist before continuing."},{heading:"migrate-the-kms-and-va-data",content:"**Scale the new StatefulSets down** so nothing writes to either volume while you copy:"},{heading:"migrate-the-kms-and-va-data",content:"**Run a short-lived helper pod** that mounts all four claims:"},{heading:"migrate-the-kms-and-va-data",content:"**Inspect before writing** so you do not clobber data the new pods may already have written:"},{heading:"migrate-the-kms-and-va-data",content:"An empty result is the common case: a StatefulSet's own pod rarely gets far enough to write anything when its dependent data is missing."},{heading:"migrate-the-kms-and-va-data",content:"**Copy the data and align ownership**:"},{heading:"migrate-the-kms-and-va-data",content:"The `chown` is required even if the old files already look non-root-owned. 3.8.0 did not pin a container identity, so files could carry any image-declared UID; 4.0.0 requires exactly `65532:65532` and does not fall back to whatever the image declares."},{heading:"migrate-the-kms-and-va-data",content:"**Scale back up and remove the helper**:"},{heading:"verify-the-migration",content:"KMS and VA logs show no `no such file or directory` or `code=NotFound` errors."},{heading:"verify-the-migration",content:"A previously issued CRL is servable again: `GET /crl/<ca-ski>` on VA."},{heading:"verify-the-migration",content:'`helm test "$RELEASE" -n $NAMESPACE --logs` passes; the connectivity hook checks the CA, DMS Manager, Device Manager and VA health endpoints and the UI response.'},{heading:"verify-the-migration",content:"Sign in with an administrator identity and confirm operations are authorized."},{heading:"delete-the-old-volumes",content:"Only once everything works, delete the orphaned 3.8.0 volumes to reclaim storage:"},{heading:"troubleshooting",content:"**KMS or VA pods crash with `no such file or directory` or `code=NotFound` right after the upgrade.** The new pods are bound to the new empty PVCs and the data migration has not run yet, or was copied into the wrong PVC. Follow Migrate the KMS and VA data and check that all four claims exist."},{heading:"troubleshooting",content:"**`helm upgrade` fails with an unknown-key validation error.** Remove or rename the legacy values — typically the `toolbox:` block — because the strict schema rejects top-level keys it does not know."},{heading:"troubleshooting",content:"**The upgrade fails at the database job.** The PostgreSQL role cannot create databases or schemas; grant the required privileges, or create the `pki`, `authz` and `wfx` databases yourself, then re-run the upgrade."},{heading:"troubleshooting",content:"**Nobody can log in after the upgrade.** Check that `services.authz.bootstrap` matches a role your OIDC provider actually assigns (see Access control) and that the migration Job completed successfully."},{heading:"related-pages",content:'<Card title="Install with Helm" description="Prepare dependencies, configure values and install a controlled deployment." href="/docs/deployment/self-hosted/helm" />'},{heading:"related-pages",content:'<Card title="Expose the Gateway" description="Choose an external traffic design and handle Gateway addressing." href="/docs/deployment/self-hosted/networking" />'}],headings:[{id:"upgrade-the-helm-chart",content:"Upgrade the Helm chart"},{id:"what-changes-in-400",content:"What changes in 4.0.0"},{id:"what-the-upgrade-job-does-automatically",content:"What the upgrade job does automatically"},{id:"before-you-upgrade",content:"Before you upgrade"},{id:"update-your-values-file",content:"Update your values file"},{id:"run-the-upgrade",content:"Run the upgrade"},{id:"migrate-the-kms-and-va-data",content:"Migrate the KMS and VA data"},{id:"verify-the-migration",content:"Verify the migration"},{id:"delete-the-old-volumes",content:"Delete the old volumes"},{id:"troubleshooting",content:"Troubleshooting"},{id:"related-pages",content:"Related pages"}]};const m=[{depth:1,url:"#upgrade-the-helm-chart",title:e.jsx(e.Fragment,{children:"Upgrade the Helm chart"})},{depth:2,url:"#what-changes-in-400",title:e.jsx(e.Fragment,{children:"What changes in 4.0.0"})},{depth:2,url:"#what-the-upgrade-job-does-automatically",title:e.jsx(e.Fragment,{children:"What the upgrade job does automatically"})},{depth:2,url:"#before-you-upgrade",title:e.jsx(e.Fragment,{children:"Before you upgrade"})},{depth:2,url:"#update-your-values-file",title:e.jsx(e.Fragment,{children:"Update your values file"})},{depth:2,url:"#run-the-upgrade",title:e.jsx(e.Fragment,{children:"Run the upgrade"})},{depth:2,url:"#migrate-the-kms-and-va-data",title:e.jsx(e.Fragment,{children:"Migrate the KMS and VA data"})},{depth:2,url:"#verify-the-migration",title:e.jsx(e.Fragment,{children:"Verify the migration"})},{depth:2,url:"#delete-the-old-volumes",title:e.jsx(e.Fragment,{children:"Delete the old volumes"})},{depth:2,url:"#troubleshooting",title:e.jsx(e.Fragment,{children:"Troubleshooting"})},{depth:2,url:"#related-pages",title:e.jsx(e.Fragment,{children:"Related pages"})}];function r(i){const s={a:"a",code:"code",div:"div",em:"em",h1:"h1",h2:"h2",li:"li",ol:"ol",p:"p",pre:"pre",span:"span",strong:"strong",ul:"ul",...i.components},{Callout:a,Card:n,Cards:t}=s;return a||l("Callout"),n||l("Card"),t||l("Cards"),e.jsxs(e.Fragment,{children:[e.jsx(s.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(s.h1,{id:"upgrade-the-helm-chart",children:"Upgrade the Helm chart"})}),`
`,e.jsx(s.div,{className:"lm-diff-ins lm-diff-block",children:e.jsxs(s.p,{children:["Use this guide to upgrade a Helm-managed deployment. It walks through the 3.8.0 to 4.0.0 chart migration in full: the values to review, the database changes the chart applies automatically and the manual steps for installations that keep KMS keys or VA CRLs on local volumes. Version-specific notes for other upgrades live in the ",e.jsxs(s.a,{href:"https://github.com/lamassuiot/lamassu-helm/tree/main/charts/lamassu/CHANGELOG",children:[e.jsx(s.code,{children:"charts/lamassu/CHANGELOG/"})," directory"]})," of the ",e.jsx(s.code,{children:"lamassu-helm"})," repository."]})}),`
`,e.jsx(s.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(a,{type:"info",title:"Fresh installs have nothing to migrate",children:e.jsxs(s.p,{children:["If you are not upgrading an existing release, go straight to ",e.jsx(s.a,{href:"/docs/deployment/self-hosted/helm",children:"Install with Helm"}),". The manual data steps on this page only apply to deployments upgraded from 3.8.x that use local KMS or VA storage."]})})}),`
`,e.jsx(s.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(s.h2,{id:"what-changes-in-400",children:"What changes in 4.0.0"})}),`
`,e.jsx(s.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(s.p,{children:"Version 4.0.0 is a security-hardening release. Three changes affect upgrades:"})}),`
`,e.jsx(s.div,{className:"lm-diff-ins lm-diff-block",children:e.jsxs(s.ul,{children:[`
`,e.jsxs(s.li,{children:[e.jsx(s.strong,{children:"Release-scoped resource names."})," Every chart-managed resource is now named ",e.jsx(s.code,{children:"<release>-lamassu-<component>"}),", for example ",e.jsx(s.code,{children:"lamassu-kms"}),", instead of the fixed, unscoped names used in 3.8.0 (",e.jsx(s.code,{children:"kms"}),", ",e.jsx(s.code,{children:"va"}),", ",e.jsx(s.code,{children:"ca"}),", ...). With a release named ",e.jsx(s.code,{children:"prod"})," the StatefulSets become ",e.jsx(s.code,{children:"prod-lamassu-kms"})," and ",e.jsx(s.code,{children:"prod-lamassu-va"}),", not ",e.jsx(s.code,{children:"prod-kms"}),". The ",e.jsx(s.code,{children:"nameOverride"})," and ",e.jsx(s.code,{children:"fullnameOverride"})," values change the prefix."]}),`
`,e.jsxs(s.li,{children:[e.jsx(s.strong,{children:"Non-root containers."})," Every workload runs as the numeric user ",e.jsx(s.code,{children:"65532:65532"})," with a ",e.jsx(s.code,{children:"RuntimeDefault"})," seccomp profile and dropped capabilities. Pods do not mount the service-account token by default, and the chart creates a dedicated ServiceAccount."]}),`
`,e.jsxs(s.li,{children:[e.jsx(s.strong,{children:"Strict values validation."})," ",e.jsx(s.code,{children:"values.schema.json"})," rejects unknown top-level keys, so leftover 3.8.0 blocks fail ",e.jsx(s.code,{children:"helm lint"})," and ",e.jsx(s.code,{children:"helm upgrade"})," outright instead of being silently ignored."]}),`
`]})}),`
`,e.jsx(s.div,{className:"lm-diff-ins lm-diff-block",children:e.jsxs(s.p,{children:[e.jsx(s.code,{children:"services.connectors"})," also becomes a map keyed by connector ID, and the chart no longer injects pod anti-affinity or topology spread rules."]})}),`
`,e.jsx(s.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(a,{type:"warn",title:"The rename is not cosmetic for KMS and VA",children:e.jsxs(s.p,{children:["Kubernetes derives the PVC name from the StatefulSet pod name (",e.jsx(s.code,{children:"<volumeClaimTemplate>-<pod-name>"}),"). Renaming the ",e.jsx(s.code,{children:"kms"})," and ",e.jsx(s.code,{children:"va"})," StatefulSets means ",e.jsx(s.code,{children:"helm upgrade"})," binds brand-new, empty PVCs instead of the existing ones. Your KMS key material and VA CRLs are not deleted — the old PVCs are orphaned, not removed — but the upgraded pods fail to find them with ",e.jsx(s.code,{children:"no such file or directory"})," (KMS) or ",e.jsx(s.code,{children:"code=NotFound"})," (VA) until you move the data across yourself. All other renamed resources are stateless and are recreated without data-loss risk."]})})}),`
`,e.jsx(s.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(s.h2,{id:"what-the-upgrade-job-does-automatically",children:"What the upgrade job does automatically"})}),`
`,e.jsx(s.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(s.p,{children:"Before any service starts, the chart's pre-install/pre-upgrade job prepares PostgreSQL:"})}),`
`,e.jsx(s.div,{className:"lm-diff-ins lm-diff-block",children:e.jsxs(s.ol,{children:[`
`,e.jsxs(s.li,{children:["Creates the ",e.jsx(s.code,{children:"pki"}),", ",e.jsx(s.code,{children:"authz"})," and ",e.jsx(s.code,{children:"wfx"})," databases when they do not exist."]}),`
`,e.jsxs(s.li,{children:["Ensures one schema per service database (",e.jsx(s.code,{children:"alerts"}),", ",e.jsx(s.code,{children:"ca"}),", ",e.jsx(s.code,{children:"va"}),", ",e.jsx(s.code,{children:"devicemanager"}),", ",e.jsx(s.code,{children:"dmsmanager"}),", ",e.jsx(s.code,{children:"kms"}),") inside the shared ",e.jsx(s.code,{children:"pki"})," database, and folds 3.8.0's separate per-service databases into it, importing their data."]}),`
`,e.jsx(s.li,{children:"Runs the database migrations for every schema."}),`
`,e.jsxs(s.li,{children:["Migrates authz, preloads its policies and seeds the ",e.jsx(s.code,{children:"services.authz.bootstrap"})," principals."]}),`
`]})}),`
`,e.jsx(s.div,{className:"lm-diff-ins lm-diff-block",children:e.jsxs(s.p,{children:["The job is idempotent, so a failed upgrade can be retried. It requires a PostgreSQL role allowed to create databases and schemas, as described in ",e.jsx(s.a,{href:"/docs/deployment/self-hosted/helm#before-you-begin",children:"Install with Helm"}),"."]})}),`
`,e.jsx(s.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(s.h2,{id:"before-you-upgrade",children:"Before you upgrade"})}),`
`,e.jsx(s.div,{className:"lm-diff-ins lm-diff-block",children:e.jsxs(s.ol,{children:[`
`,e.jsx(s.li,{children:"Record the names of your existing local-storage PVCs:"}),`
`]})}),`
`,e.jsx(s.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(e.Fragment,{children:e.jsx(s.pre,{className:"shiki shiki-themes min-light min-dark",style:{"--shiki-light":"#24292eff","--shiki-dark":"#b392f0","--shiki-light-bg":"#ffffff","--shiki-dark-bg":"#1f1f1f"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsxs(s.code,{children:[e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:"export"}),e.jsx(s.span,{style:{"--shiki-light":"#24292EFF","--shiki-dark":"#B392F0"},children:" NAMESPACE"}),e.jsx(s.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:"="}),e.jsx(s.span,{style:{"--shiki-light":"#24292EFF","--shiki-dark":"#B392F0"},children:"lamassu   "}),e.jsx(s.span,{style:{"--shiki-light":"#C2C3C5","--shiki-dark":"#6B737C"},children:"# your 3.8.0 namespace"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:"export"}),e.jsx(s.span,{style:{"--shiki-light":"#24292EFF","--shiki-dark":"#B392F0"},children:" RELEASE"}),e.jsx(s.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:"="}),e.jsx(s.span,{style:{"--shiki-light":"#24292EFF","--shiki-dark":"#B392F0"},children:"lamassu     "}),e.jsx(s.span,{style:{"--shiki-light":"#C2C3C5","--shiki-dark":"#6B737C"},children:"# your Helm release name"})]}),`
`,e.jsx(s.span,{className:"line"}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"kubectl"}),e.jsx(s.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" get"}),e.jsx(s.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" pvc"}),e.jsx(s.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" -n"}),e.jsx(s.span,{style:{"--shiki-light":"#24292EFF","--shiki-dark":"#B392F0"},children:" $NAMESPACE "}),e.jsx(s.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:"-l"}),e.jsx(s.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" app.kubernetes.io/instance="}),e.jsx(s.span,{style:{"--shiki-light":"#24292EFF","--shiki-dark":"#B392F0"},children:"$RELEASE"})]}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#C2C3C5","--shiki-dark":"#6B737C"},children:"# on a 3.8.0 install you can also list the fixed names directly:"})}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"kubectl"}),e.jsx(s.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" get"}),e.jsx(s.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" pvc"}),e.jsx(s.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" -n"}),e.jsx(s.span,{style:{"--shiki-light":"#24292EFF","--shiki-dark":"#B392F0"},children:" $NAMESPACE "}),e.jsx(s.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:"golang-engine-storage-kms-0"}),e.jsx(s.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" local-crl-file-storage-va-0"})]})]})})})}),`
`,e.jsx(s.div,{className:"lm-diff-ins lm-diff-block",children:e.jsxs(s.p,{children:[e.jsx(s.code,{children:"helm upgrade"})," does not touch or delete the old PVCs, but nothing references them after the upgrade. You need their names to copy data and to clean up later; do not delete them until the new volumes are verified."]})}),`
`,e.jsx(s.div,{className:"lm-diff-ins lm-diff-block",children:e.jsxs(s.ol,{start:"2",children:[`
`,e.jsxs(s.li,{children:["Remove values the strict schema now rejects, for example the old ",e.jsx(s.code,{children:"toolbox:"})," block. ",e.jsx(s.a,{href:"#update-your-values-file",children:"Update your values file"})," lists every rename."]}),`
`]})}),`
`,e.jsx(s.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(s.h2,{id:"update-your-values-file",children:"Update your values file"})}),`
`,e.jsx(s.div,{className:"lm-diff-ins lm-diff-block",children:e.jsxs(s.p,{children:[e.jsxs(s.strong,{children:["Add ",e.jsx(s.code,{children:"services.authz"})," (required)."]})," 3.8.0 had no authorization service: every route accepted any valid token. 4.0.0 adds fine-grained, entity-level authorization, and a 3.8.0 values file has nothing to migrate ",e.jsx(s.em,{children:"from"})," — you must add the configuration:"]})}),`
`,e.jsx(s.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(e.Fragment,{children:e.jsx(s.pre,{className:"shiki shiki-themes min-light min-dark",style:{"--shiki-light":"#24292eff","--shiki-dark":"#b392f0","--shiki-light-bg":"#ffffff","--shiki-dark-bg":"#1f1f1f"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(s.code,{children:[e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:"services"}),e.jsx(s.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:":"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:"  authz"}),e.jsx(s.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:":"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:"    credentials"}),e.jsx(s.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:":"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:"      pki"}),e.jsx(s.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:":"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:"        database"}),e.jsx(s.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:":"}),e.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#FFAB70"},children:" pki"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:"      authz"}),e.jsx(s.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:":"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:"        database"}),e.jsx(s.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:":"}),e.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#FFAB70"},children:" authz"})]})]})})})}),`
`,e.jsx(s.div,{className:"lm-diff-ins lm-diff-block",children:e.jsxs(s.ul,{children:[`
`,e.jsxs(s.li,{children:[e.jsx(s.code,{children:"authz"})," is the authorization service's own storage for principals, grants and policies (",e.jsx(s.code,{children:"services.authz.database"}),", ",e.jsx(s.code,{children:"authz"})," by default)."]}),`
`,e.jsxs(s.li,{children:[e.jsx(s.code,{children:"pki"})," is the database the authorization engine queries when it evaluates policies against entities such as CAs, certificates, devices, DMSs, KMS keys and VA roles."]}),`
`,e.jsxs(s.li,{children:["Only the ",e.jsx(s.code,{children:"database"})," field of each credentials entry is read. Connection settings always come from the global ",e.jsx(s.code,{children:"postgres.hostname"}),", ",e.jsx(s.code,{children:"postgres.port"}),", ",e.jsx(s.code,{children:"postgres.username"})," and ",e.jsx(s.code,{children:"postgres.password"})," values."]}),`
`,e.jsxs(s.li,{children:["Confirm ",e.jsx(s.code,{children:"services.authz.bootstrap"})," (present by default in the chart) matches how your OIDC provider assigns the ",e.jsx(s.code,{children:"pki-admin"})," realm role. Without a principal that matches the bootstrap rule, nobody can administer the PKI — there is no implicit superuser."]}),`
`]})}),`
`,e.jsx(s.div,{className:"lm-diff-ins lm-diff-block",children:e.jsxs(s.p,{children:[e.jsxs(s.strong,{children:["Rename ",e.jsx(s.code,{children:"toolbox"})," to ",e.jsx(s.code,{children:"connectivityTest"}),"."]})," The ",e.jsx(s.code,{children:"helm test"})," connectivity hook now uses the upstream-maintained ",e.jsx(s.code,{children:"curlimages/curl"})," image pinned by digest instead of the chart-owned toolbox image:"]})}),`
`,e.jsx(s.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(e.Fragment,{children:e.jsx(s.pre,{className:"shiki shiki-themes min-light min-dark",style:{"--shiki-light":"#24292eff","--shiki-dark":"#b392f0","--shiki-light-bg":"#ffffff","--shiki-dark-bg":"#1f1f1f"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(s.code,{children:[e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#C2C3C5","--shiki-dark":"#6B737C"},children:"# OLD (3.8.0)"})}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:"toolbox"}),e.jsx(s.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:":"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:"  image"}),e.jsx(s.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:":"}),e.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#FFAB70"},children:" ghcr.io/lamassuiot/toolbox:2.2.0"})]}),`
`,e.jsx(s.span,{className:"line"}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#C2C3C5","--shiki-dark":"#6B737C"},children:"# NEW (4.0.0)"})}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:"connectivityTest"}),e.jsx(s.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:":"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:"  image"}),e.jsx(s.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:":"}),e.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#FFAB70"},children:" curlimages/curl@sha256:58adaa4e8dca9c988bae2aba4ab3434a0bb2da16bbe3f92dec39ec7785166777"})]})]})})})}),`
`,e.jsx(s.div,{className:"lm-diff-ins lm-diff-block",children:e.jsxs(s.p,{children:[e.jsx(s.strong,{children:"Remove per-service identity overrides."})," ",e.jsx(s.code,{children:"services.kms.securityContext.runAsGroup: 0"})," and ",e.jsx(s.code,{children:"services.authz.securityContext.runAsUser"}),"/",e.jsx(s.code,{children:"runAsGroup: 999"})," no longer exist. Every service runs under the chart-wide ",e.jsx(s.code,{children:"65532:65532"}),", and KMS volume and PKCS#11 socket group access is handled automatically by the pod-level ",e.jsx(s.code,{children:"fsGroup: 65532"}),"."]})}),`
`,e.jsx(s.div,{className:"lm-diff-ins lm-diff-block",children:e.jsxs(s.p,{children:[e.jsxs(s.strong,{children:["Convert ",e.jsx(s.code,{children:"services.connectors"})," to a map."]})," Each entry is keyed by its stable connector ID and declares ",e.jsx(s.code,{children:"type"})," and ",e.jsx(s.code,{children:"image"}),":"]})}),`
`,e.jsx(s.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(e.Fragment,{children:e.jsx(s.pre,{className:"shiki shiki-themes min-light min-dark",style:{"--shiki-light":"#24292eff","--shiki-dark":"#b392f0","--shiki-light-bg":"#ffffff","--shiki-dark-bg":"#1f1f1f"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(s.code,{children:[e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:"services"}),e.jsx(s.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:":"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:"  connectors"}),e.jsx(s.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:":"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:"    aws.myconnector"}),e.jsx(s.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:":"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:"      type"}),e.jsx(s.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:":"}),e.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#FFAB70"},children:" awsiot"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:"      image"}),e.jsx(s.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:":"}),e.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#FFAB70"},children:" ghcr.io/lamassuiot/lamassu-aws-connector:dev-v4"})]})]})})})}),`
`,e.jsx(s.div,{className:"lm-diff-ins lm-diff-block",children:e.jsxs(s.p,{children:[e.jsx(s.strong,{children:"Check the TLS issuer values."})," With ",e.jsx(s.code,{children:"tls.certManagerOptions.issuer"})," empty (the default), the chart creates a self-signed, release-scoped issuer — for example ",e.jsx(s.code,{children:"lamassu-downstream-ca-selfsigned-issuer"})," with release ",e.jsx(s.code,{children:"lamassu"}),". The legacy literal ",e.jsx(s.code,{children:"downstream-ca-selfsigned-issuer"})," from 3.8.0-era values is still accepted and resolves to the same release-scoped issuer; point ",e.jsx(s.code,{children:"tls.certManagerOptions.clusterIssuer"})," at your own issuer for corporate TLS."]})}),`
`,e.jsx(s.div,{className:"lm-diff-ins lm-diff-block",children:e.jsxs(s.p,{children:[e.jsx(s.strong,{children:"Review scheduling and ports."})," The chart no longer injects pod anti-affinity or topology spread constraints — configure ",e.jsx(s.code,{children:"affinity"})," and ",e.jsx(s.code,{children:"topologySpreadConstraints"})," explicitly where your cluster needs them. The ",e.jsx(s.code,{children:"services.ui.port"})," default is now ",e.jsx(s.code,{children:"8085"}),", the unprivileged chart-wide port of the rootless image, so update overrides that pinned ",e.jsx(s.code,{children:"80"}),". The shared ",e.jsx(s.code,{children:"probes:"})," block is replaced by independent ",e.jsx(s.code,{children:"livenessProbe"}),", ",e.jsx(s.code,{children:"readinessProbe"})," and ",e.jsx(s.code,{children:"startupProbe"})," blocks."]})}),`
`,e.jsx(s.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(s.h2,{id:"run-the-upgrade",children:"Run the upgrade"})}),`
`,e.jsx(s.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(e.Fragment,{children:e.jsx(s.pre,{className:"shiki shiki-themes min-light min-dark",style:{"--shiki-light":"#24292eff","--shiki-dark":"#b392f0","--shiki-light-bg":"#ffffff","--shiki-dark-bg":"#1f1f1f"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsxs(s.code,{children:[e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"helm"}),e.jsx(s.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" upgrade"}),e.jsx(s.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" --install"}),e.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#FFAB70"},children:' "$RELEASE"'}),e.jsx(s.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" lamassu/lamassu"}),e.jsx(s.span,{style:{"--shiki-light":"#24292EFF","--shiki-dark":"#B392F0"},children:" \\"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:"  --namespace"}),e.jsx(s.span,{style:{"--shiki-light":"#24292EFF","--shiki-dark":"#B392F0"},children:" $NAMESPACE \\"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:"  --values"}),e.jsx(s.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" values.yaml"}),e.jsx(s.span,{style:{"--shiki-light":"#24292EFF","--shiki-dark":"#B392F0"},children:" \\"})]}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:"  --wait"})})]})})})}),`
`,e.jsx(s.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(s.p,{children:"Helm runs the database job before applying any workload, so services never start against an unprepared database. If validation rejects unknown values, fix the values file and re-run."})}),`
`,e.jsx(s.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(s.h2,{id:"migrate-the-kms-and-va-data",children:"Migrate the KMS and VA data"})}),`
`,e.jsx(s.div,{className:"lm-diff-ins lm-diff-block",children:e.jsxs(s.p,{children:["Skip this section on fresh installs, or when ",e.jsx(s.code,{children:"services.kms.cryptoEngines"})," never used a ",e.jsx(s.code,{children:"filesystem"})," engine and ",e.jsx(s.code,{children:"services.va.fileStore.type"})," was never ",e.jsx(s.code,{children:"local"}),"."]})}),`
`,e.jsx(s.div,{className:"lm-diff-ins lm-diff-block",children:e.jsxs(s.ol,{children:[`
`,e.jsxs(s.li,{children:[e.jsx(s.strong,{children:"Find the new StatefulSets and PVCs."})," Their names depend on the release name and any ",e.jsx(s.code,{children:"nameOverride"}),"/",e.jsx(s.code,{children:"fullnameOverride"}),"; the PVC name is ",e.jsx(s.code,{children:"<volumeClaimTemplate>-<StatefulSet name>-0"}),":"]}),`
`]})}),`
`,e.jsx(s.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(e.Fragment,{children:e.jsx(s.pre,{className:"shiki shiki-themes min-light min-dark",style:{"--shiki-light":"#24292eff","--shiki-dark":"#b392f0","--shiki-light-bg":"#ffffff","--shiki-dark-bg":"#1f1f1f"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsxs(s.code,{children:[e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#24292EFF","--shiki-dark":"#B392F0"},children:"KMS_STS"}),e.jsx(s.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:"="}),e.jsx(s.span,{style:{"--shiki-light":"#24292EFF","--shiki-dark":"#B392F0"},children:"$("}),e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"kubectl"}),e.jsx(s.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" get"}),e.jsx(s.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" statefulset"}),e.jsx(s.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" -n"}),e.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#FFAB70"},children:' "$NAMESPACE"'}),e.jsx(s.span,{style:{"--shiki-light":"#24292EFF","--shiki-dark":"#B392F0"},children:" \\"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:"  -l"}),e.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#FFAB70"},children:' "app.kubernetes.io/instance=$RELEASE,app.kubernetes.io/component=kms"'}),e.jsx(s.span,{style:{"--shiki-light":"#24292EFF","--shiki-dark":"#B392F0"},children:" \\"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:"  -o"}),e.jsx(s.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" jsonpath="}),e.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#FFAB70"},children:"'{.items[0].metadata.name}'"}),e.jsx(s.span,{style:{"--shiki-light":"#24292EFF","--shiki-dark":"#B392F0"},children:")"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#24292EFF","--shiki-dark":"#B392F0"},children:"VA_STS"}),e.jsx(s.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:"="}),e.jsx(s.span,{style:{"--shiki-light":"#24292EFF","--shiki-dark":"#B392F0"},children:"$("}),e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"kubectl"}),e.jsx(s.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" get"}),e.jsx(s.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" statefulset"}),e.jsx(s.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" -n"}),e.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#FFAB70"},children:' "$NAMESPACE"'}),e.jsx(s.span,{style:{"--shiki-light":"#24292EFF","--shiki-dark":"#B392F0"},children:" \\"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:"  -l"}),e.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#FFAB70"},children:' "app.kubernetes.io/instance=$RELEASE,app.kubernetes.io/component=va"'}),e.jsx(s.span,{style:{"--shiki-light":"#24292EFF","--shiki-dark":"#B392F0"},children:" \\"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:"  -o"}),e.jsx(s.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" jsonpath="}),e.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#FFAB70"},children:"'{.items[0].metadata.name}'"}),e.jsx(s.span,{style:{"--shiki-light":"#24292EFF","--shiki-dark":"#B392F0"},children:")"})]}),`
`,e.jsx(s.span,{className:"line"}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#24292EFF","--shiki-dark":"#B392F0"},children:"KMS_PVC"}),e.jsx(s.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:"="}),e.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#FFAB70"},children:'"golang-engine-storage-${KMS_STS}-0"'})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#24292EFF","--shiki-dark":"#B392F0"},children:"VA_PVC"}),e.jsx(s.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:"="}),e.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#FFAB70"},children:'"local-crl-file-storage-${VA_STS}-0"'})]}),`
`,e.jsx(s.span,{className:"line"}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"kubectl"}),e.jsx(s.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" get"}),e.jsx(s.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" pvc"}),e.jsx(s.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" -n"}),e.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#FFAB70"},children:' "$NAMESPACE"'}),e.jsx(s.span,{style:{"--shiki-light":"#24292EFF","--shiki-dark":"#B392F0"},children:" \\"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:"  golang-engine-storage-kms-0"}),e.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#FFAB70"},children:' "$KMS_PVC"'}),e.jsx(s.span,{style:{"--shiki-light":"#24292EFF","--shiki-dark":"#B392F0"},children:" \\"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:"  local-crl-file-storage-va-0"}),e.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#FFAB70"},children:' "$VA_PVC"'})]})]})})})}),`
`,e.jsx(s.div,{className:"lm-diff-ins lm-diff-block",children:e.jsxs(s.p,{children:["With release ",e.jsx(s.code,{children:"lamassu"})," and the default chart name, the new PVCs are ",e.jsx(s.code,{children:"golang-engine-storage-lamassu-kms-0"})," and ",e.jsx(s.code,{children:"local-crl-file-storage-lamassu-va-0"}),"; with release ",e.jsx(s.code,{children:"prod"})," they are ",e.jsx(s.code,{children:"golang-engine-storage-prod-lamassu-kms-0"})," and ",e.jsx(s.code,{children:"local-crl-file-storage-prod-lamassu-va-0"}),". Confirm both old and new PVCs exist before continuing."]})}),`
`,e.jsx(s.div,{className:"lm-diff-ins lm-diff-block",children:e.jsxs(s.ol,{start:"2",children:[`
`,e.jsxs(s.li,{children:[e.jsx(s.strong,{children:"Scale the new StatefulSets down"})," so nothing writes to either volume while you copy:"]}),`
`]})}),`
`,e.jsx(s.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(e.Fragment,{children:e.jsx(s.pre,{className:"shiki shiki-themes min-light min-dark",style:{"--shiki-light":"#24292eff","--shiki-dark":"#b392f0","--shiki-light-bg":"#ffffff","--shiki-dark-bg":"#1f1f1f"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsx(s.code,{children:e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"kubectl"}),e.jsx(s.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" scale"}),e.jsx(s.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" statefulset"}),e.jsx(s.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" -n"}),e.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#FFAB70"},children:' "$NAMESPACE"'}),e.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#FFAB70"},children:' "$KMS_STS"'}),e.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#FFAB70"},children:' "$VA_STS"'}),e.jsx(s.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" --replicas=0"})]})})})})}),`
`,e.jsx(s.div,{className:"lm-diff-ins lm-diff-block",children:e.jsxs(s.ol,{start:"3",children:[`
`,e.jsxs(s.li,{children:[e.jsx(s.strong,{children:"Run a short-lived helper pod"})," that mounts all four claims:"]}),`
`]})}),`
`,e.jsx(s.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(e.Fragment,{children:e.jsx(s.pre,{className:"shiki shiki-themes min-light min-dark",style:{"--shiki-light":"#24292eff","--shiki-dark":"#b392f0","--shiki-light-bg":"#ffffff","--shiki-dark-bg":"#1f1f1f"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsxs(s.code,{children:[e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"cat"}),e.jsx(s.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:" <<"}),e.jsx(s.span,{style:{"--shiki-light":"#24292EFF","--shiki-dark":"#B392F0"},children:"EOF"}),e.jsx(s.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:" |"}),e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" kubectl"}),e.jsx(s.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" apply"}),e.jsx(s.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" -f"}),e.jsx(s.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" -"})]}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:"apiVersion: v1"})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:"kind: Pod"})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:"metadata:"})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:"  name: pvc-migrate-helper"})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:"  namespace: $NAMESPACE"})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:"spec:"})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:"  restartPolicy: Never"})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:"  containers:"})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:"    - name: migrate"})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:"      image: docker.io/library/alpine:3.20"})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:'      command: ["sh", "-c", "sleep 3600"]'})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:"      volumeMounts:"})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:"        - {name: old-kms, mountPath: /old/kms}"})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:"        - {name: new-kms, mountPath: /new/kms}"})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:"        - {name: old-va,  mountPath: /old/va}"})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:"        - {name: new-va,  mountPath: /new/va}"})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:"  volumes:"})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:"    - {name: old-kms, persistentVolumeClaim: {claimName: golang-engine-storage-kms-0}}"})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:"    - {name: new-kms, persistentVolumeClaim: {claimName: $KMS_PVC}}"})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:"    - {name: old-va,  persistentVolumeClaim: {claimName: local-crl-file-storage-va-0}}"})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:"    - {name: new-va,  persistentVolumeClaim: {claimName: $VA_PVC}}"})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#24292EFF","--shiki-dark":"#B392F0"},children:"EOF"})}),`
`,e.jsx(s.span,{className:"line"}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"kubectl"}),e.jsx(s.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" wait"}),e.jsx(s.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" -n"}),e.jsx(s.span,{style:{"--shiki-light":"#24292EFF","--shiki-dark":"#B392F0"},children:" $NAMESPACE "}),e.jsx(s.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:"--for=condition=Ready"}),e.jsx(s.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" pod/pvc-migrate-helper"}),e.jsx(s.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" --timeout=60s"})]})]})})})}),`
`,e.jsx(s.div,{className:"lm-diff-ins lm-diff-block",children:e.jsxs(s.ol,{start:"4",children:[`
`,e.jsxs(s.li,{children:[e.jsx(s.strong,{children:"Inspect before writing"})," so you do not clobber data the new pods may already have written:"]}),`
`]})}),`
`,e.jsx(s.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(e.Fragment,{children:e.jsx(s.pre,{className:"shiki shiki-themes min-light min-dark",style:{"--shiki-light":"#24292eff","--shiki-dark":"#b392f0","--shiki-light-bg":"#ffffff","--shiki-dark-bg":"#1f1f1f"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsx(s.code,{children:e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"kubectl"}),e.jsx(s.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" exec"}),e.jsx(s.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" -n"}),e.jsx(s.span,{style:{"--shiki-light":"#24292EFF","--shiki-dark":"#B392F0"},children:" $NAMESPACE "}),e.jsx(s.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:"pvc-migrate-helper"}),e.jsx(s.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" --"}),e.jsx(s.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" sh"}),e.jsx(s.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" -c"}),e.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#FFAB70"},children:" 'find /new/kms /new/va -type f'"})]})})})})}),`
`,e.jsx(s.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(s.p,{children:"An empty result is the common case: a StatefulSet's own pod rarely gets far enough to write anything when its dependent data is missing."})}),`
`,e.jsx(s.div,{className:"lm-diff-ins lm-diff-block",children:e.jsxs(s.ol,{start:"5",children:[`
`,e.jsxs(s.li,{children:[e.jsx(s.strong,{children:"Copy the data and align ownership"}),":"]}),`
`]})}),`
`,e.jsx(s.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(e.Fragment,{children:e.jsx(s.pre,{className:"shiki shiki-themes min-light min-dark",style:{"--shiki-light":"#24292eff","--shiki-dark":"#b392f0","--shiki-light-bg":"#ffffff","--shiki-dark-bg":"#1f1f1f"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsxs(s.code,{children:[e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"kubectl"}),e.jsx(s.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" exec"}),e.jsx(s.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" -n"}),e.jsx(s.span,{style:{"--shiki-light":"#24292EFF","--shiki-dark":"#B392F0"},children:" $NAMESPACE "}),e.jsx(s.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:"pvc-migrate-helper"}),e.jsx(s.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" --"}),e.jsx(s.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" sh"}),e.jsx(s.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" -c"}),e.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#FFAB70"},children:" '"})]}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#FFAB70"},children:"  cp -a /old/kms/. /new/kms/ &&"})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#FFAB70"},children:"  cp -a /old/va/. /new/va/ &&"})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#FFAB70"},children:"  chown -R 65532:65532 /new/kms /new/va"})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#FFAB70"},children:"'"})})]})})})}),`
`,e.jsx(s.div,{className:"lm-diff-ins lm-diff-block",children:e.jsxs(s.p,{children:["The ",e.jsx(s.code,{children:"chown"})," is required even if the old files already look non-root-owned. 3.8.0 did not pin a container identity, so files could carry any image-declared UID; 4.0.0 requires exactly ",e.jsx(s.code,{children:"65532:65532"})," and does not fall back to whatever the image declares."]})}),`
`,e.jsx(s.div,{className:"lm-diff-ins lm-diff-block",children:e.jsxs(s.ol,{start:"6",children:[`
`,e.jsxs(s.li,{children:[e.jsx(s.strong,{children:"Scale back up and remove the helper"}),":"]}),`
`]})}),`
`,e.jsx(s.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(e.Fragment,{children:e.jsx(s.pre,{className:"shiki shiki-themes min-light min-dark",style:{"--shiki-light":"#24292eff","--shiki-dark":"#b392f0","--shiki-light-bg":"#ffffff","--shiki-dark-bg":"#1f1f1f"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsxs(s.code,{children:[e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"kubectl"}),e.jsx(s.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" delete"}),e.jsx(s.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" pod"}),e.jsx(s.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" -n"}),e.jsx(s.span,{style:{"--shiki-light":"#24292EFF","--shiki-dark":"#B392F0"},children:" $NAMESPACE "}),e.jsx(s.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:"pvc-migrate-helper"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"kubectl"}),e.jsx(s.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" scale"}),e.jsx(s.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" statefulset"}),e.jsx(s.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" -n"}),e.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#FFAB70"},children:' "$NAMESPACE"'}),e.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#FFAB70"},children:' "$KMS_STS"'}),e.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#FFAB70"},children:' "$VA_STS"'}),e.jsx(s.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" --replicas=1"})]})]})})})}),`
`,e.jsx(s.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(s.h2,{id:"verify-the-migration",children:"Verify the migration"})}),`
`,e.jsx(s.div,{className:"lm-diff-ins lm-diff-block",children:e.jsxs(s.ul,{children:[`
`,e.jsxs(s.li,{children:["KMS and VA logs show no ",e.jsx(s.code,{children:"no such file or directory"})," or ",e.jsx(s.code,{children:"code=NotFound"})," errors."]}),`
`,e.jsxs(s.li,{children:["A previously issued CRL is servable again: ",e.jsx(s.code,{children:"GET /crl/<ca-ski>"})," on VA."]}),`
`,e.jsxs(s.li,{children:[e.jsx(s.code,{children:'helm test "$RELEASE" -n $NAMESPACE --logs'})," passes; the connectivity hook checks the CA, DMS Manager, Device Manager and VA health endpoints and the UI response."]}),`
`,e.jsx(s.li,{children:"Sign in with an administrator identity and confirm operations are authorized."}),`
`]})}),`
`,e.jsx(s.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(s.h2,{id:"delete-the-old-volumes",children:"Delete the old volumes"})}),`
`,e.jsx(s.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(s.p,{children:"Only once everything works, delete the orphaned 3.8.0 volumes to reclaim storage:"})}),`
`,e.jsx(s.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(e.Fragment,{children:e.jsx(s.pre,{className:"shiki shiki-themes min-light min-dark",style:{"--shiki-light":"#24292eff","--shiki-dark":"#b392f0","--shiki-light-bg":"#ffffff","--shiki-dark-bg":"#1f1f1f"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsx(s.code,{children:e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"kubectl"}),e.jsx(s.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" delete"}),e.jsx(s.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" pvc"}),e.jsx(s.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" -n"}),e.jsx(s.span,{style:{"--shiki-light":"#24292EFF","--shiki-dark":"#B392F0"},children:" $NAMESPACE "}),e.jsx(s.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:"golang-engine-storage-kms-0"}),e.jsx(s.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" local-crl-file-storage-va-0"})]})})})})}),`
`,e.jsx(s.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(s.h2,{id:"troubleshooting",children:"Troubleshooting"})}),`
`,e.jsx(s.div,{className:"lm-diff-ins lm-diff-block",children:e.jsxs(s.ul,{children:[`
`,e.jsxs(s.li,{children:[e.jsxs(s.strong,{children:["KMS or VA pods crash with ",e.jsx(s.code,{children:"no such file or directory"})," or ",e.jsx(s.code,{children:"code=NotFound"})," right after the upgrade."]})," The new pods are bound to the new empty PVCs and the data migration has not run yet, or was copied into the wrong PVC. Follow ",e.jsx(s.a,{href:"#migrate-the-kms-and-va-data",children:"Migrate the KMS and VA data"})," and check that all four claims exist."]}),`
`,e.jsxs(s.li,{children:[e.jsxs(s.strong,{children:[e.jsx(s.code,{children:"helm upgrade"})," fails with an unknown-key validation error."]})," Remove or rename the legacy values — typically the ",e.jsx(s.code,{children:"toolbox:"})," block — because the strict schema rejects top-level keys it does not know."]}),`
`,e.jsxs(s.li,{children:[e.jsx(s.strong,{children:"The upgrade fails at the database job."})," The PostgreSQL role cannot create databases or schemas; grant the required privileges, or create the ",e.jsx(s.code,{children:"pki"}),", ",e.jsx(s.code,{children:"authz"})," and ",e.jsx(s.code,{children:"wfx"})," databases yourself, then re-run the upgrade."]}),`
`,e.jsxs(s.li,{children:[e.jsx(s.strong,{children:"Nobody can log in after the upgrade."})," Check that ",e.jsx(s.code,{children:"services.authz.bootstrap"})," matches a role your OIDC provider actually assigns (see ",e.jsx(s.a,{href:"/docs/platform/pki/access-control",children:"Access control"}),") and that the migration Job completed successfully."]}),`
`]})}),`
`,e.jsx(s.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(s.h2,{id:"related-pages",children:"Related pages"})}),`
`,e.jsx(s.div,{className:"lm-diff-ins lm-diff-block",children:e.jsxs(t,{children:[e.jsx(n,{title:"Install with Helm",description:"Prepare dependencies, configure values and install a controlled deployment.",href:"/docs/deployment/self-hosted/helm"}),e.jsx(n,{title:"Expose the Gateway",description:"Choose an external traffic design and handle Gateway addressing.",href:"/docs/deployment/self-hosted/networking"})]})})]})}function k(i={}){const{wrapper:s}=i.components||{};return s?e.jsx(s,{...i,children:e.jsx(r,{...i})}):r(i)}function l(i,s){throw new Error("Expected component `"+i+"` to be defined: you likely forgot to import, pass, or provide it.")}const f=Object.freeze(Object.defineProperty({__proto__:null,_markdown:d,default:k,frontmatter:h,lmDiff:o,structuredData:c,toc:m},Symbol.toStringTag,{value:"Module"}));export{f as _};

import{j as e}from"./index-prc0XQdj.js";let t=`

Install Lamassu with Helm [#install-lamassu-with-helm]

Use the Helm workflow when you need explicit control over identity, databases, messaging, certificates, storage and upgrades. For an evaluation environment where the script can make those choices for you, use [Fastlane](/docs/deployment/self-hosted/fastlane).

Before you begin [#before-you-begin]

Prepare the platform services that are deliberately outside the Lamassu chart:

* a Kubernetes 1.24+ cluster and Helm 3.2+
* a reachable PostgreSQL server and a role allowed to create databases and schemas
* a reachable RabbitMQ broker and credentials
* an OIDC provider, normally Keycloak, with a realm/tenant and client for Lamassu
* Envoy Gateway 1.8+ and a \`GatewayClass\`
* cert-manager 1.14+; for trusted TLS, either a trusted issuer or a Kubernetes TLS Secret
* a StorageClass and an [external traffic design](/docs/deployment/self-hosted/networking)

The chart defaults to a \`GatewayClass\` named \`eg\`. Change \`gateway.className\` if your platform team uses another name.

<Callout type="info" title="What Helm does with PostgreSQL">
  You provide the PostgreSQL server. The chart's pre-install job connects with the supplied credentials, creates the required \`pki\`, \`authz\` and \`wfx\` databases and service schemas, runs migrations, and applies \`services.authz.bootstrap\`.
</Callout>

The chart has no Helm dependencies that install PostgreSQL, RabbitMQ, an OIDC provider, Envoy Gateway or cert-manager.

1. Install the Gateway prerequisites [#1-install-the-gateway-prerequisites]

Install or upgrade the Envoy Gateway CRDs before its controller. The commands below match the version used by the Lamassu Helm repository:

\`\`\`bash
export ENVOY_GATEWAY_VERSION=v1.8.0

helm template eg-crds oci://docker.io/envoyproxy/gateway-crds-helm \\
  --version "$ENVOY_GATEWAY_VERSION" \\
  --set crds.gatewayAPI.enabled=true \\
  --set crds.gatewayAPI.channel=experimental \\
  --set crds.envoyGateway.enabled=true \\
  | kubectl apply --server-side --force-conflicts -f -

helm upgrade --install eg oci://docker.io/envoyproxy/gateway-helm \\
  --version "$ENVOY_GATEWAY_VERSION" \\
  --namespace envoy-gateway-system \\
  --create-namespace
\`\`\`

Create the default \`GatewayClass\` if it does not already exist. Save this manifest as \`gateway-class.yaml\`:

\`\`\`yaml
apiVersion: gateway.networking.k8s.io/v1
kind: GatewayClass
metadata:
  name: eg
spec:
  controllerName: gateway.envoyproxy.io/gatewayclass-controller
\`\`\`

\`\`\`bash
kubectl apply -f gateway-class.yaml
kubectl rollout status deployment/envoy-gateway -n envoy-gateway-system
\`\`\`

Install cert-manager separately before Lamassu. The current chart renders its self-signed issuer and CA certificate resources even when \`tls.type: external\` makes the Gateway use an existing TLS Secret. Selecting external TLS therefore does not remove the cert-manager prerequisite.

2. Create a values file [#2-create-a-values-file]

Start with the chart defaults and override the environment-specific values. This example assumes PostgreSQL, RabbitMQ and Keycloak are reachable through Kubernetes DNS, and exposes Keycloak at \`/auth\` through the shared Lamassu Gateway:

\`\`\`yaml
postgres:
  hostname: postgresql
  port: 5432
  username: lamassu
  password: change-me

amqp:
  hostname: rabbitmq
  port: 5672
  username: lamassu
  password: change-me
  tls: false

tls:
  type: certManager
  certManagerOptions:
    clusterIssuer: production-issuer
    certSpec:
      commonName: pki.example.com
      hostnames:
        - pki.example.com

gateway:
  className: eg
  ports:
    http: 80
    https: 443
  extraRouting:
    - name: auth
      path: /auth
      target:
        host: auth-keycloak
        port: 80

auth:
  oidc:
    frontend:
      clientId: frontend
      authority: https://pki.example.com/auth/realms/lamassu
    apiGateway:
      jwks:
        - name: oidc-authn
          uri: http://auth-keycloak.lamassu.svc.cluster.local/auth/realms/lamassu/protocol/openid-connect/certs

services:
  ca:
    domains:
      - pki.example.com
  authz:
    jwkUrl: http://auth-keycloak.lamassu.svc.cluster.local/auth/realms/lamassu/protocol/openid-connect/certs
    bootstrap:
      - principal_id: "oidc:pki-admin"
        principal_name: "PKI Admin"
        principal_type: "oidc"
        policy_ids:
          - "lamassu.a6811b60-5f89-4ce7-badb-78ea234794d3"
        auth_config:
          claims:
            - claim: realm_access.roles
              operator: contains
              value: pki-admin
\`\`\`

Do not add \`gateway.addresses\` by default. Leave address assignment to the load-balancer implementation unless your network design requires a specific Kubernetes-side VIP. The public IP of an upstream NAT gateway or reverse proxy does not belong in this value.

If Keycloak is external and already has its own reachable URL, point the OIDC settings at it and omit the \`/auth\` entry from \`gateway.extraRouting\`.

TLS with an existing Secret [#tls-with-an-existing-secret]

Create a Secret containing \`tls.crt\` and \`tls.key\`, then reference it:

\`\`\`yaml
tls:
  type: external
  externalOptions:
    secretName: lamassu-downstream-tls
\`\`\`

Provision the first administrator [#provision-the-first-administrator]

There is no implicit superuser. Create the role or group expected by \`services.authz.bootstrap\` in the OIDC provider and assign it to at least one administrator before exposing Lamassu.

The pre-install and pre-upgrade job applies the bootstrap idempotently: existing principals are preserved and missing grants are added.

<Callout type="warn" title="Validate access before exposing the platform">
  Test both an authorized identity and a denied identity. If no token matches an active bootstrap principal, nobody can administer the PKI.
</Callout>

See [Access control](/docs/platform/administration/access-control) for the principal and policy model.

3. Install Lamassu [#3-install-lamassu]

\`\`\`bash
helm repo add lamassu https://lamassuiot.github.io/lamassu-helm
helm repo update

helm upgrade --install lamassu lamassu/lamassu \\
  --namespace lamassu \\
  --create-namespace \\
  --values values.yaml \\
  --wait
\`\`\`

To install a local checkout instead:

\`\`\`bash
helm upgrade --install lamassu ./charts/lamassu \\
  --namespace lamassu \\
  --create-namespace \\
  --values values.yaml \\
  --wait
\`\`\`

4. Verify the deployment [#4-verify-the-deployment]

\`\`\`bash
kubectl get pods -n lamassu
kubectl get gateway,httproute -n lamassu
kubectl get service -A
helm test lamassu -n lamassu --logs
\`\`\`

The Gateway should report \`PROGRAMMED=True\`. If it is programmed but has no usable address, continue with [Expose the Gateway](/docs/deployment/self-hosted/networking).

The Helm test checks the CA, DMS Manager, Device Manager and VA health endpoints and verifies the UI response.

<div className="lm-diff-ins lm-diff-block">
  Upgrading Lamassu [#upgrading-lamassu]
</div>

<div className="lm-diff-ins lm-diff-block">
  Version-specific upgrade steps live in \`charts/lamassu/CHANGELOG/\` in the Helm repository. The chart also ships an optional pre-upgrade Job that migrates existing CA private keys into the KMS engine configured for the release. It is off by default (\`migrations.caToKms.enabled: false\`) and is only needed when upgrading from a version prior to 3.7.0.
</div>

<div className="lm-diff-ins lm-diff-block">
  While the flag is enabled, every \`helm upgrade\` creates the \`<chart fullname>-ca-to-kms-migration\` Job (\`lamassu-ca-to-kms-migration\` for release \`lamassu\`); a fresh install does not create it. It runs before the other pre-upgrade hooks, the authorization bootstrap configuration and the database-migration Job, which use hook weights \`-4\` and \`-3\` versus its \`-10\`.
</div>

<div className="lm-diff-ins lm-diff-block">
  The Job consumes the same KMS service configuration the chart renders into the KMS ConfigMap, including the engines from \`services.kms.cryptoEngines\`, and runs the migration tool defined in \`migrations.caToKms.image\`. It mounts that configuration read-only at \`/etc/lamassuiot/config.yml\` from the ConfigMap key \`config\`, so configure the destination engine in your values before the upgrade that performs the migration.
</div>

<div className="lm-diff-ins lm-diff-block">
  The Job resolves its configuration through a projected volume with two optional sources: the release-scoped \`<chart fullname>-kms-config\` (\`lamassu-kms-config\` for release \`lamassu\`, \`prod-lamassu-kms-config\` for release \`prod\`) and the legacy unscoped \`kms-config\` created by chart versions before release-scoped naming. The legacy configuration remains authoritative while it is still present, and the release-scoped one is used once the legacy one is gone. Both sources are optional, so a missing ConfigMap never leaves the upgrade pod in \`ContainerCreating\`.
</div>

<div className="lm-diff-ins lm-diff-block">
  Keep \`migrations.caToKms.enabled: true\` for the upgrade that performs the migration, then remove the flag from your values once the migration completes; it defaults to \`false\`.
</div>

Production decisions [#production-decisions]

Before going live, review:

* backup and recovery for PostgreSQL and persistent volumes
* a production KMS engine; the default filesystem engine is not an HA design
* shared VA storage before increasing VA replicas
* managed OIDC roles and removal of evaluation credentials
* a trusted TLS issuer or externally managed certificate
* resource requests, replicas, autoscaling, disruption budgets and placement
* SMTP, observability and alert delivery
* the migration notes in \`charts/lamassu/CHANGELOG/\` before every upgrade<ins className="lm-diff-ins">, including the optional CA-to-KMS migration hook described above</ins>

The complete values reference is maintained in \`charts/lamassu/VALUES.md\` in the Helm repository.
`,l={title:"Install with Helm",description:"Prepare dependencies, configure the Lamassu chart and verify a controlled Kubernetes deployment."},r={isNew:!1,changes:7,title:void 0,description:void 0},h={contents:[{heading:"install-lamassu-with-helm",content:"Use the Helm workflow when you need explicit control over identity, databases, messaging, certificates, storage and upgrades. For an evaluation environment where the script can make those choices for you, use Fastlane."},{heading:"before-you-begin",content:"Prepare the platform services that are deliberately outside the Lamassu chart:"},{heading:"before-you-begin",content:"a Kubernetes 1.24+ cluster and Helm 3.2+"},{heading:"before-you-begin",content:"a reachable PostgreSQL server and a role allowed to create databases and schemas"},{heading:"before-you-begin",content:"a reachable RabbitMQ broker and credentials"},{heading:"before-you-begin",content:"an OIDC provider, normally Keycloak, with a realm/tenant and client for Lamassu"},{heading:"before-you-begin",content:"Envoy Gateway 1.8+ and a `GatewayClass`"},{heading:"before-you-begin",content:"cert-manager 1.14+; for trusted TLS, either a trusted issuer or a Kubernetes TLS Secret"},{heading:"before-you-begin",content:"a StorageClass and an external traffic design"},{heading:"before-you-begin",content:"The chart defaults to a `GatewayClass` named `eg`. Change `gateway.className` if your platform team uses another name."},{heading:"before-you-begin",content:"You provide the PostgreSQL server. The chart's pre-install job connects with the supplied credentials, creates the required `pki`, `authz` and `wfx` databases and service schemas, runs migrations, and applies `services.authz.bootstrap`."},{heading:"before-you-begin",content:"The chart has no Helm dependencies that install PostgreSQL, RabbitMQ, an OIDC provider, Envoy Gateway or cert-manager."},{heading:"1-install-the-gateway-prerequisites",content:"Install or upgrade the Envoy Gateway CRDs before its controller. The commands below match the version used by the Lamassu Helm repository:"},{heading:"1-install-the-gateway-prerequisites",content:"Create the default `GatewayClass` if it does not already exist. Save this manifest as `gateway-class.yaml`:"},{heading:"1-install-the-gateway-prerequisites",content:"Install cert-manager separately before Lamassu. The current chart renders its self-signed issuer and CA certificate resources even when `tls.type: external` makes the Gateway use an existing TLS Secret. Selecting external TLS therefore does not remove the cert-manager prerequisite."},{heading:"2-create-a-values-file",content:"Start with the chart defaults and override the environment-specific values. This example assumes PostgreSQL, RabbitMQ and Keycloak are reachable through Kubernetes DNS, and exposes Keycloak at `/auth` through the shared Lamassu Gateway:"},{heading:"2-create-a-values-file",content:"Do not add `gateway.addresses` by default. Leave address assignment to the load-balancer implementation unless your network design requires a specific Kubernetes-side VIP. The public IP of an upstream NAT gateway or reverse proxy does not belong in this value."},{heading:"2-create-a-values-file",content:"If Keycloak is external and already has its own reachable URL, point the OIDC settings at it and omit the `/auth` entry from `gateway.extraRouting`."},{heading:"tls-with-an-existing-secret",content:"Create a Secret containing `tls.crt` and `tls.key`, then reference it:"},{heading:"provision-the-first-administrator",content:"There is no implicit superuser. Create the role or group expected by `services.authz.bootstrap` in the OIDC provider and assign it to at least one administrator before exposing Lamassu."},{heading:"provision-the-first-administrator",content:"The pre-install and pre-upgrade job applies the bootstrap idempotently: existing principals are preserved and missing grants are added."},{heading:"provision-the-first-administrator",content:"Test both an authorized identity and a denied identity. If no token matches an active bootstrap principal, nobody can administer the PKI."},{heading:"provision-the-first-administrator",content:"See Access control for the principal and policy model."},{heading:"3-install-lamassu",content:"To install a local checkout instead:"},{heading:"4-verify-the-deployment",content:"The Gateway should report `PROGRAMMED=True`. If it is programmed but has no usable address, continue with Expose the Gateway."},{heading:"4-verify-the-deployment",content:"The Helm test checks the CA, DMS Manager, Device Manager and VA health endpoints and verifies the UI response."},{heading:"upgrading-lamassu",content:"Version-specific upgrade steps live in `charts/lamassu/CHANGELOG/` in the Helm repository. The chart also ships an optional pre-upgrade Job that migrates existing CA private keys into the KMS engine configured for the release. It is off by default (`migrations.caToKms.enabled: false`) and is only needed when upgrading from a version prior to 3.7.0."},{heading:"upgrading-lamassu",content:"While the flag is enabled, every `helm upgrade` creates the `<chart fullname>-ca-to-kms-migration` Job (`lamassu-ca-to-kms-migration` for release `lamassu`); a fresh install does not create it. It runs before the other pre-upgrade hooks, the authorization bootstrap configuration and the database-migration Job, which use hook weights `-4` and `-3` versus its `-10`."},{heading:"upgrading-lamassu",content:"The Job consumes the same KMS service configuration the chart renders into the KMS ConfigMap, including the engines from `services.kms.cryptoEngines`, and runs the migration tool defined in `migrations.caToKms.image`. It mounts that configuration read-only at `/etc/lamassuiot/config.yml` from the ConfigMap key `config`, so configure the destination engine in your values before the upgrade that performs the migration."},{heading:"upgrading-lamassu",content:"The Job resolves its configuration through a projected volume with two optional sources: the release-scoped `<chart fullname>-kms-config` (`lamassu-kms-config` for release `lamassu`, `prod-lamassu-kms-config` for release `prod`) and the legacy unscoped `kms-config` created by chart versions before release-scoped naming. The legacy configuration remains authoritative while it is still present, and the release-scoped one is used once the legacy one is gone. Both sources are optional, so a missing ConfigMap never leaves the upgrade pod in `ContainerCreating`."},{heading:"upgrading-lamassu",content:"Keep `migrations.caToKms.enabled: true` for the upgrade that performs the migration, then remove the flag from your values once the migration completes; it defaults to `false`."},{heading:"production-decisions",content:"Before going live, review:"},{heading:"production-decisions",content:"backup and recovery for PostgreSQL and persistent volumes"},{heading:"production-decisions",content:"a production KMS engine; the default filesystem engine is not an HA design"},{heading:"production-decisions",content:"shared VA storage before increasing VA replicas"},{heading:"production-decisions",content:"managed OIDC roles and removal of evaluation credentials"},{heading:"production-decisions",content:"a trusted TLS issuer or externally managed certificate"},{heading:"production-decisions",content:"resource requests, replicas, autoscaling, disruption budgets and placement"},{heading:"production-decisions",content:"SMTP, observability and alert delivery"},{heading:"production-decisions",content:"the migration notes in `charts/lamassu/CHANGELOG/` before every upgrade, including the optional CA-to-KMS migration hook described above"},{heading:"production-decisions",content:"The complete values reference is maintained in `charts/lamassu/VALUES.md` in the Helm repository."}],headings:[{id:"install-lamassu-with-helm",content:"Install Lamassu with Helm"},{id:"before-you-begin",content:"Before you begin"},{id:"1-install-the-gateway-prerequisites",content:"1\\. Install the Gateway prerequisites"},{id:"2-create-a-values-file",content:"2\\. Create a values file"},{id:"tls-with-an-existing-secret",content:"TLS with an existing Secret"},{id:"provision-the-first-administrator",content:"Provision the first administrator"},{id:"3-install-lamassu",content:"3\\. Install Lamassu"},{id:"4-verify-the-deployment",content:"4\\. Verify the deployment"},{id:"upgrading-lamassu",content:"Upgrading Lamassu"},{id:"production-decisions",content:"Production decisions"}]};const d=[{depth:1,url:"#install-lamassu-with-helm",title:e.jsx(e.Fragment,{children:"Install Lamassu with Helm"})},{depth:2,url:"#before-you-begin",title:e.jsx(e.Fragment,{children:"Before you begin"})},{depth:2,url:"#1-install-the-gateway-prerequisites",title:e.jsx(e.Fragment,{children:"1. Install the Gateway prerequisites"})},{depth:2,url:"#2-create-a-values-file",title:e.jsx(e.Fragment,{children:"2. Create a values file"})},{depth:3,url:"#tls-with-an-existing-secret",title:e.jsx(e.Fragment,{children:"TLS with an existing Secret"})},{depth:3,url:"#provision-the-first-administrator",title:e.jsx(e.Fragment,{children:"Provision the first administrator"})},{depth:2,url:"#3-install-lamassu",title:e.jsx(e.Fragment,{children:"3. Install Lamassu"})},{depth:2,url:"#4-verify-the-deployment",title:e.jsx(e.Fragment,{children:"4. Verify the deployment"})},{depth:2,url:"#upgrading-lamassu",title:e.jsx(e.Fragment,{children:"Upgrading Lamassu"})},{depth:2,url:"#production-decisions",title:e.jsx(e.Fragment,{children:"Production decisions"})}];function n(i){const s={a:"a",code:"code",div:"div",h1:"h1",h2:"h2",h3:"h3",ins:"ins",li:"li",p:"p",pre:"pre",span:"span",ul:"ul",...i.components},{Callout:a}=s;return a||o("Callout"),e.jsxs(e.Fragment,{children:[e.jsx(s.h1,{id:"install-lamassu-with-helm",children:"Install Lamassu with Helm"}),`
`,e.jsxs(s.p,{children:["Use the Helm workflow when you need explicit control over identity, databases, messaging, certificates, storage and upgrades. For an evaluation environment where the script can make those choices for you, use ",e.jsx(s.a,{href:"/docs/deployment/self-hosted/fastlane",children:"Fastlane"}),"."]}),`
`,e.jsx(s.h2,{id:"before-you-begin",children:"Before you begin"}),`
`,e.jsx(s.p,{children:"Prepare the platform services that are deliberately outside the Lamassu chart:"}),`
`,e.jsxs(s.ul,{children:[`
`,e.jsx(s.li,{children:"a Kubernetes 1.24+ cluster and Helm 3.2+"}),`
`,e.jsx(s.li,{children:"a reachable PostgreSQL server and a role allowed to create databases and schemas"}),`
`,e.jsx(s.li,{children:"a reachable RabbitMQ broker and credentials"}),`
`,e.jsx(s.li,{children:"an OIDC provider, normally Keycloak, with a realm/tenant and client for Lamassu"}),`
`,e.jsxs(s.li,{children:["Envoy Gateway 1.8+ and a ",e.jsx(s.code,{children:"GatewayClass"})]}),`
`,e.jsx(s.li,{children:"cert-manager 1.14+; for trusted TLS, either a trusted issuer or a Kubernetes TLS Secret"}),`
`,e.jsxs(s.li,{children:["a StorageClass and an ",e.jsx(s.a,{href:"/docs/deployment/self-hosted/networking",children:"external traffic design"})]}),`
`]}),`
`,e.jsxs(s.p,{children:["The chart defaults to a ",e.jsx(s.code,{children:"GatewayClass"})," named ",e.jsx(s.code,{children:"eg"}),". Change ",e.jsx(s.code,{children:"gateway.className"})," if your platform team uses another name."]}),`
`,e.jsx(a,{type:"info",title:"What Helm does with PostgreSQL",children:e.jsxs(s.p,{children:["You provide the PostgreSQL server. The chart's pre-install job connects with the supplied credentials, creates the required ",e.jsx(s.code,{children:"pki"}),", ",e.jsx(s.code,{children:"authz"})," and ",e.jsx(s.code,{children:"wfx"})," databases and service schemas, runs migrations, and applies ",e.jsx(s.code,{children:"services.authz.bootstrap"}),"."]})}),`
`,e.jsx(s.p,{children:"The chart has no Helm dependencies that install PostgreSQL, RabbitMQ, an OIDC provider, Envoy Gateway or cert-manager."}),`
`,e.jsx(s.h2,{id:"1-install-the-gateway-prerequisites",children:"1. Install the Gateway prerequisites"}),`
`,e.jsx(s.p,{children:"Install or upgrade the Envoy Gateway CRDs before its controller. The commands below match the version used by the Lamassu Helm repository:"}),`
`,e.jsx(e.Fragment,{children:e.jsx(s.pre,{className:"shiki shiki-themes min-light min-dark",style:{"--shiki-light":"#24292eff","--shiki-dark":"#b392f0","--shiki-light-bg":"#ffffff","--shiki-dark-bg":"#1f1f1f"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsxs(s.code,{children:[e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:"export"}),e.jsx(s.span,{style:{"--shiki-light":"#24292EFF","--shiki-dark":"#B392F0"},children:" ENVOY_GATEWAY_VERSION"}),e.jsx(s.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:"="}),e.jsx(s.span,{style:{"--shiki-light":"#24292EFF","--shiki-dark":"#B392F0"},children:"v1.8.0"})]}),`
`,e.jsx(s.span,{className:"line"}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"helm"}),e.jsx(s.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" template"}),e.jsx(s.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" eg-crds"}),e.jsx(s.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" oci://docker.io/envoyproxy/gateway-crds-helm"}),e.jsx(s.span,{style:{"--shiki-light":"#24292EFF","--shiki-dark":"#B392F0"},children:" \\"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:"  --version"}),e.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#FFAB70"},children:' "$ENVOY_GATEWAY_VERSION"'}),e.jsx(s.span,{style:{"--shiki-light":"#24292EFF","--shiki-dark":"#B392F0"},children:" \\"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:"  --set"}),e.jsx(s.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" crds.gatewayAPI.enabled="}),e.jsx(s.span,{style:{"--shiki-light":"#1976D2","--shiki-dark":"#79B8FF"},children:"true"}),e.jsx(s.span,{style:{"--shiki-light":"#24292EFF","--shiki-dark":"#B392F0"},children:" \\"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:"  --set"}),e.jsx(s.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" crds.gatewayAPI.channel=experimental"}),e.jsx(s.span,{style:{"--shiki-light":"#24292EFF","--shiki-dark":"#B392F0"},children:" \\"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:"  --set"}),e.jsx(s.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" crds.envoyGateway.enabled="}),e.jsx(s.span,{style:{"--shiki-light":"#1976D2","--shiki-dark":"#79B8FF"},children:"true"}),e.jsx(s.span,{style:{"--shiki-light":"#24292EFF","--shiki-dark":"#B392F0"},children:" \\"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:"  |"}),e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" kubectl"}),e.jsx(s.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" apply"}),e.jsx(s.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" --server-side"}),e.jsx(s.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" --force-conflicts"}),e.jsx(s.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" -f"}),e.jsx(s.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" -"})]}),`
`,e.jsx(s.span,{className:"line"}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"helm"}),e.jsx(s.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" upgrade"}),e.jsx(s.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" --install"}),e.jsx(s.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" eg"}),e.jsx(s.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" oci://docker.io/envoyproxy/gateway-helm"}),e.jsx(s.span,{style:{"--shiki-light":"#24292EFF","--shiki-dark":"#B392F0"},children:" \\"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:"  --version"}),e.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#FFAB70"},children:' "$ENVOY_GATEWAY_VERSION"'}),e.jsx(s.span,{style:{"--shiki-light":"#24292EFF","--shiki-dark":"#B392F0"},children:" \\"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:"  --namespace"}),e.jsx(s.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" envoy-gateway-system"}),e.jsx(s.span,{style:{"--shiki-light":"#24292EFF","--shiki-dark":"#B392F0"},children:" \\"})]}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:"  --create-namespace"})})]})})}),`
`,e.jsxs(s.p,{children:["Create the default ",e.jsx(s.code,{children:"GatewayClass"})," if it does not already exist. Save this manifest as ",e.jsx(s.code,{children:"gateway-class.yaml"}),":"]}),`
`,e.jsx(e.Fragment,{children:e.jsx(s.pre,{className:"shiki shiki-themes min-light min-dark",style:{"--shiki-light":"#24292eff","--shiki-dark":"#b392f0","--shiki-light-bg":"#ffffff","--shiki-dark-bg":"#1f1f1f"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(s.code,{children:[e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:"apiVersion"}),e.jsx(s.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:":"}),e.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#FFAB70"},children:" gateway.networking.k8s.io/v1"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:"kind"}),e.jsx(s.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:":"}),e.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#FFAB70"},children:" GatewayClass"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:"metadata"}),e.jsx(s.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:":"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:"  name"}),e.jsx(s.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:":"}),e.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#FFAB70"},children:" eg"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:"spec"}),e.jsx(s.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:":"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:"  controllerName"}),e.jsx(s.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:":"}),e.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#FFAB70"},children:" gateway.envoyproxy.io/gatewayclass-controller"})]})]})})}),`
`,e.jsx(e.Fragment,{children:e.jsx(s.pre,{className:"shiki shiki-themes min-light min-dark",style:{"--shiki-light":"#24292eff","--shiki-dark":"#b392f0","--shiki-light-bg":"#ffffff","--shiki-dark-bg":"#1f1f1f"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsxs(s.code,{children:[e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"kubectl"}),e.jsx(s.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" apply"}),e.jsx(s.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" -f"}),e.jsx(s.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" gateway-class.yaml"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"kubectl"}),e.jsx(s.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" rollout"}),e.jsx(s.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" status"}),e.jsx(s.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" deployment/envoy-gateway"}),e.jsx(s.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" -n"}),e.jsx(s.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" envoy-gateway-system"})]})]})})}),`
`,e.jsxs(s.p,{children:["Install cert-manager separately before Lamassu. The current chart renders its self-signed issuer and CA certificate resources even when ",e.jsx(s.code,{children:"tls.type: external"})," makes the Gateway use an existing TLS Secret. Selecting external TLS therefore does not remove the cert-manager prerequisite."]}),`
`,e.jsx(s.h2,{id:"2-create-a-values-file",children:"2. Create a values file"}),`
`,e.jsxs(s.p,{children:["Start with the chart defaults and override the environment-specific values. This example assumes PostgreSQL, RabbitMQ and Keycloak are reachable through Kubernetes DNS, and exposes Keycloak at ",e.jsx(s.code,{children:"/auth"})," through the shared Lamassu Gateway:"]}),`
`,e.jsx(e.Fragment,{children:e.jsx(s.pre,{className:"shiki shiki-themes min-light min-dark",style:{"--shiki-light":"#24292eff","--shiki-dark":"#b392f0","--shiki-light-bg":"#ffffff","--shiki-dark-bg":"#1f1f1f"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(s.code,{children:[e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:"postgres"}),e.jsx(s.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:":"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:"  hostname"}),e.jsx(s.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:":"}),e.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#FFAB70"},children:" postgresql"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:"  port"}),e.jsx(s.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:":"}),e.jsx(s.span,{style:{"--shiki-light":"#1976D2","--shiki-dark":"#F8F8F8"},children:" 5432"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:"  username"}),e.jsx(s.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:":"}),e.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#FFAB70"},children:" lamassu"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:"  password"}),e.jsx(s.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:":"}),e.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#FFAB70"},children:" change-me"})]}),`
`,e.jsx(s.span,{className:"line"}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:"amqp"}),e.jsx(s.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:":"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:"  hostname"}),e.jsx(s.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:":"}),e.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#FFAB70"},children:" rabbitmq"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:"  port"}),e.jsx(s.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:":"}),e.jsx(s.span,{style:{"--shiki-light":"#1976D2","--shiki-dark":"#F8F8F8"},children:" 5672"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:"  username"}),e.jsx(s.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:":"}),e.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#FFAB70"},children:" lamassu"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:"  password"}),e.jsx(s.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:":"}),e.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#FFAB70"},children:" change-me"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:"  tls"}),e.jsx(s.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:":"}),e.jsx(s.span,{style:{"--shiki-light":"#1976D2","--shiki-dark":"#79B8FF"},children:" false"})]}),`
`,e.jsx(s.span,{className:"line"}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:"tls"}),e.jsx(s.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:":"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:"  type"}),e.jsx(s.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:":"}),e.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#FFAB70"},children:" certManager"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:"  certManagerOptions"}),e.jsx(s.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:":"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:"    clusterIssuer"}),e.jsx(s.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:":"}),e.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#FFAB70"},children:" production-issuer"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:"    certSpec"}),e.jsx(s.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:":"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:"      commonName"}),e.jsx(s.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:":"}),e.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#FFAB70"},children:" pki.example.com"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:"      hostnames"}),e.jsx(s.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:":"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#24292EFF","--shiki-dark":"#B392F0"},children:"        - "}),e.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#FFAB70"},children:"pki.example.com"})]}),`
`,e.jsx(s.span,{className:"line"}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:"gateway"}),e.jsx(s.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:":"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:"  className"}),e.jsx(s.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:":"}),e.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#FFAB70"},children:" eg"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:"  ports"}),e.jsx(s.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:":"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:"    http"}),e.jsx(s.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:":"}),e.jsx(s.span,{style:{"--shiki-light":"#1976D2","--shiki-dark":"#F8F8F8"},children:" 80"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:"    https"}),e.jsx(s.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:":"}),e.jsx(s.span,{style:{"--shiki-light":"#1976D2","--shiki-dark":"#F8F8F8"},children:" 443"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:"  extraRouting"}),e.jsx(s.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:":"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#24292EFF","--shiki-dark":"#B392F0"},children:"    - "}),e.jsx(s.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:"name"}),e.jsx(s.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:":"}),e.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#FFAB70"},children:" auth"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:"      path"}),e.jsx(s.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:":"}),e.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#FFAB70"},children:" /auth"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:"      target"}),e.jsx(s.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:":"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:"        host"}),e.jsx(s.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:":"}),e.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#FFAB70"},children:" auth-keycloak"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:"        port"}),e.jsx(s.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:":"}),e.jsx(s.span,{style:{"--shiki-light":"#1976D2","--shiki-dark":"#F8F8F8"},children:" 80"})]}),`
`,e.jsx(s.span,{className:"line"}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:"auth"}),e.jsx(s.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:":"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:"  oidc"}),e.jsx(s.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:":"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:"    frontend"}),e.jsx(s.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:":"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:"      clientId"}),e.jsx(s.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:":"}),e.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#FFAB70"},children:" frontend"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:"      authority"}),e.jsx(s.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:":"}),e.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#FFAB70"},children:" https://pki.example.com/auth/realms/lamassu"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:"    apiGateway"}),e.jsx(s.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:":"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:"      jwks"}),e.jsx(s.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:":"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#24292EFF","--shiki-dark":"#B392F0"},children:"        - "}),e.jsx(s.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:"name"}),e.jsx(s.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:":"}),e.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#FFAB70"},children:" oidc-authn"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:"          uri"}),e.jsx(s.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:":"}),e.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#FFAB70"},children:" http://auth-keycloak.lamassu.svc.cluster.local/auth/realms/lamassu/protocol/openid-connect/certs"})]}),`
`,e.jsx(s.span,{className:"line"}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:"services"}),e.jsx(s.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:":"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:"  ca"}),e.jsx(s.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:":"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:"    domains"}),e.jsx(s.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:":"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#24292EFF","--shiki-dark":"#B392F0"},children:"      - "}),e.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#FFAB70"},children:"pki.example.com"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:"  authz"}),e.jsx(s.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:":"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:"    jwkUrl"}),e.jsx(s.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:":"}),e.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#FFAB70"},children:" http://auth-keycloak.lamassu.svc.cluster.local/auth/realms/lamassu/protocol/openid-connect/certs"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:"    bootstrap"}),e.jsx(s.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:":"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#24292EFF","--shiki-dark":"#B392F0"},children:"      - "}),e.jsx(s.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:"principal_id"}),e.jsx(s.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:":"}),e.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#FFAB70"},children:' "oidc:pki-admin"'})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:"        principal_name"}),e.jsx(s.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:":"}),e.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#FFAB70"},children:' "PKI Admin"'})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:"        principal_type"}),e.jsx(s.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:":"}),e.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#FFAB70"},children:' "oidc"'})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:"        policy_ids"}),e.jsx(s.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:":"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#24292EFF","--shiki-dark":"#B392F0"},children:"          - "}),e.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#FFAB70"},children:'"lamassu.a6811b60-5f89-4ce7-badb-78ea234794d3"'})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:"        auth_config"}),e.jsx(s.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:":"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:"          claims"}),e.jsx(s.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:":"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#24292EFF","--shiki-dark":"#B392F0"},children:"            - "}),e.jsx(s.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:"claim"}),e.jsx(s.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:":"}),e.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#FFAB70"},children:" realm_access.roles"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:"              operator"}),e.jsx(s.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:":"}),e.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#FFAB70"},children:" contains"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:"              value"}),e.jsx(s.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:":"}),e.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#FFAB70"},children:" pki-admin"})]})]})})}),`
`,e.jsxs(s.p,{children:["Do not add ",e.jsx(s.code,{children:"gateway.addresses"})," by default. Leave address assignment to the load-balancer implementation unless your network design requires a specific Kubernetes-side VIP. The public IP of an upstream NAT gateway or reverse proxy does not belong in this value."]}),`
`,e.jsxs(s.p,{children:["If Keycloak is external and already has its own reachable URL, point the OIDC settings at it and omit the ",e.jsx(s.code,{children:"/auth"})," entry from ",e.jsx(s.code,{children:"gateway.extraRouting"}),"."]}),`
`,e.jsx(s.h3,{id:"tls-with-an-existing-secret",children:"TLS with an existing Secret"}),`
`,e.jsxs(s.p,{children:["Create a Secret containing ",e.jsx(s.code,{children:"tls.crt"})," and ",e.jsx(s.code,{children:"tls.key"}),", then reference it:"]}),`
`,e.jsx(e.Fragment,{children:e.jsx(s.pre,{className:"shiki shiki-themes min-light min-dark",style:{"--shiki-light":"#24292eff","--shiki-dark":"#b392f0","--shiki-light-bg":"#ffffff","--shiki-dark-bg":"#1f1f1f"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(s.code,{children:[e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:"tls"}),e.jsx(s.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:":"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:"  type"}),e.jsx(s.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:":"}),e.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#FFAB70"},children:" external"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:"  externalOptions"}),e.jsx(s.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:":"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:"    secretName"}),e.jsx(s.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:":"}),e.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#FFAB70"},children:" lamassu-downstream-tls"})]})]})})}),`
`,e.jsx(s.h3,{id:"provision-the-first-administrator",children:"Provision the first administrator"}),`
`,e.jsxs(s.p,{children:["There is no implicit superuser. Create the role or group expected by ",e.jsx(s.code,{children:"services.authz.bootstrap"})," in the OIDC provider and assign it to at least one administrator before exposing Lamassu."]}),`
`,e.jsx(s.p,{children:"The pre-install and pre-upgrade job applies the bootstrap idempotently: existing principals are preserved and missing grants are added."}),`
`,e.jsx(a,{type:"warn",title:"Validate access before exposing the platform",children:e.jsx(s.p,{children:"Test both an authorized identity and a denied identity. If no token matches an active bootstrap principal, nobody can administer the PKI."})}),`
`,e.jsxs(s.p,{children:["See ",e.jsx(s.a,{href:"/docs/platform/administration/access-control",children:"Access control"})," for the principal and policy model."]}),`
`,e.jsx(s.h2,{id:"3-install-lamassu",children:"3. Install Lamassu"}),`
`,e.jsx(e.Fragment,{children:e.jsx(s.pre,{className:"shiki shiki-themes min-light min-dark",style:{"--shiki-light":"#24292eff","--shiki-dark":"#b392f0","--shiki-light-bg":"#ffffff","--shiki-dark-bg":"#1f1f1f"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsxs(s.code,{children:[e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"helm"}),e.jsx(s.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" repo"}),e.jsx(s.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" add"}),e.jsx(s.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" lamassu"}),e.jsx(s.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" https://lamassuiot.github.io/lamassu-helm"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"helm"}),e.jsx(s.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" repo"}),e.jsx(s.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" update"})]}),`
`,e.jsx(s.span,{className:"line"}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"helm"}),e.jsx(s.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" upgrade"}),e.jsx(s.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" --install"}),e.jsx(s.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" lamassu"}),e.jsx(s.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" lamassu/lamassu"}),e.jsx(s.span,{style:{"--shiki-light":"#24292EFF","--shiki-dark":"#B392F0"},children:" \\"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:"  --namespace"}),e.jsx(s.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" lamassu"}),e.jsx(s.span,{style:{"--shiki-light":"#24292EFF","--shiki-dark":"#B392F0"},children:" \\"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:"  --create-namespace"}),e.jsx(s.span,{style:{"--shiki-light":"#24292EFF","--shiki-dark":"#B392F0"},children:" \\"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:"  --values"}),e.jsx(s.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" values.yaml"}),e.jsx(s.span,{style:{"--shiki-light":"#24292EFF","--shiki-dark":"#B392F0"},children:" \\"})]}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:"  --wait"})})]})})}),`
`,e.jsx(s.p,{children:"To install a local checkout instead:"}),`
`,e.jsx(e.Fragment,{children:e.jsx(s.pre,{className:"shiki shiki-themes min-light min-dark",style:{"--shiki-light":"#24292eff","--shiki-dark":"#b392f0","--shiki-light-bg":"#ffffff","--shiki-dark-bg":"#1f1f1f"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsxs(s.code,{children:[e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"helm"}),e.jsx(s.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" upgrade"}),e.jsx(s.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" --install"}),e.jsx(s.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" lamassu"}),e.jsx(s.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" ./charts/lamassu"}),e.jsx(s.span,{style:{"--shiki-light":"#24292EFF","--shiki-dark":"#B392F0"},children:" \\"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:"  --namespace"}),e.jsx(s.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" lamassu"}),e.jsx(s.span,{style:{"--shiki-light":"#24292EFF","--shiki-dark":"#B392F0"},children:" \\"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:"  --create-namespace"}),e.jsx(s.span,{style:{"--shiki-light":"#24292EFF","--shiki-dark":"#B392F0"},children:" \\"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:"  --values"}),e.jsx(s.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" values.yaml"}),e.jsx(s.span,{style:{"--shiki-light":"#24292EFF","--shiki-dark":"#B392F0"},children:" \\"})]}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:"  --wait"})})]})})}),`
`,e.jsx(s.h2,{id:"4-verify-the-deployment",children:"4. Verify the deployment"}),`
`,e.jsx(e.Fragment,{children:e.jsx(s.pre,{className:"shiki shiki-themes min-light min-dark",style:{"--shiki-light":"#24292eff","--shiki-dark":"#b392f0","--shiki-light-bg":"#ffffff","--shiki-dark-bg":"#1f1f1f"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsxs(s.code,{children:[e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"kubectl"}),e.jsx(s.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" get"}),e.jsx(s.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" pods"}),e.jsx(s.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" -n"}),e.jsx(s.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" lamassu"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"kubectl"}),e.jsx(s.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" get"}),e.jsx(s.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" gateway,httproute"}),e.jsx(s.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" -n"}),e.jsx(s.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" lamassu"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"kubectl"}),e.jsx(s.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" get"}),e.jsx(s.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" service"}),e.jsx(s.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" -A"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"helm"}),e.jsx(s.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" test"}),e.jsx(s.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" lamassu"}),e.jsx(s.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" -n"}),e.jsx(s.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" lamassu"}),e.jsx(s.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" --logs"})]})]})})}),`
`,e.jsxs(s.p,{children:["The Gateway should report ",e.jsx(s.code,{children:"PROGRAMMED=True"}),". If it is programmed but has no usable address, continue with ",e.jsx(s.a,{href:"/docs/deployment/self-hosted/networking",children:"Expose the Gateway"}),"."]}),`
`,e.jsx(s.p,{children:"The Helm test checks the CA, DMS Manager, Device Manager and VA health endpoints and verifies the UI response."}),`
`,e.jsx(s.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(s.h2,{id:"upgrading-lamassu",children:"Upgrading Lamassu"})}),`
`,e.jsx(s.div,{className:"lm-diff-ins lm-diff-block",children:e.jsxs(s.p,{children:["Version-specific upgrade steps live in ",e.jsx(s.code,{children:"charts/lamassu/CHANGELOG/"})," in the Helm repository. The chart also ships an optional pre-upgrade Job that migrates existing CA private keys into the KMS engine configured for the release. It is off by default (",e.jsx(s.code,{children:"migrations.caToKms.enabled: false"}),") and is only needed when upgrading from a version prior to 3.7.0."]})}),`
`,e.jsx(s.div,{className:"lm-diff-ins lm-diff-block",children:e.jsxs(s.p,{children:["While the flag is enabled, every ",e.jsx(s.code,{children:"helm upgrade"})," creates the ",e.jsx(s.code,{children:"<chart fullname>-ca-to-kms-migration"})," Job (",e.jsx(s.code,{children:"lamassu-ca-to-kms-migration"})," for release ",e.jsx(s.code,{children:"lamassu"}),"); a fresh install does not create it. It runs before the other pre-upgrade hooks, the authorization bootstrap configuration and the database-migration Job, which use hook weights ",e.jsx(s.code,{children:"-4"})," and ",e.jsx(s.code,{children:"-3"})," versus its ",e.jsx(s.code,{children:"-10"}),"."]})}),`
`,e.jsx(s.div,{className:"lm-diff-ins lm-diff-block",children:e.jsxs(s.p,{children:["The Job consumes the same KMS service configuration the chart renders into the KMS ConfigMap, including the engines from ",e.jsx(s.code,{children:"services.kms.cryptoEngines"}),", and runs the migration tool defined in ",e.jsx(s.code,{children:"migrations.caToKms.image"}),". It mounts that configuration read-only at ",e.jsx(s.code,{children:"/etc/lamassuiot/config.yml"})," from the ConfigMap key ",e.jsx(s.code,{children:"config"}),", so configure the destination engine in your values before the upgrade that performs the migration."]})}),`
`,e.jsx(s.div,{className:"lm-diff-ins lm-diff-block",children:e.jsxs(s.p,{children:["The Job resolves its configuration through a projected volume with two optional sources: the release-scoped ",e.jsx(s.code,{children:"<chart fullname>-kms-config"})," (",e.jsx(s.code,{children:"lamassu-kms-config"})," for release ",e.jsx(s.code,{children:"lamassu"}),", ",e.jsx(s.code,{children:"prod-lamassu-kms-config"})," for release ",e.jsx(s.code,{children:"prod"}),") and the legacy unscoped ",e.jsx(s.code,{children:"kms-config"})," created by chart versions before release-scoped naming. The legacy configuration remains authoritative while it is still present, and the release-scoped one is used once the legacy one is gone. Both sources are optional, so a missing ConfigMap never leaves the upgrade pod in ",e.jsx(s.code,{children:"ContainerCreating"}),"."]})}),`
`,e.jsx(s.div,{className:"lm-diff-ins lm-diff-block",children:e.jsxs(s.p,{children:["Keep ",e.jsx(s.code,{children:"migrations.caToKms.enabled: true"})," for the upgrade that performs the migration, then remove the flag from your values once the migration completes; it defaults to ",e.jsx(s.code,{children:"false"}),"."]})}),`
`,e.jsx(s.h2,{id:"production-decisions",children:"Production decisions"}),`
`,e.jsx(s.p,{children:"Before going live, review:"}),`
`,e.jsxs(s.ul,{children:[`
`,e.jsx(s.li,{children:"backup and recovery for PostgreSQL and persistent volumes"}),`
`,e.jsx(s.li,{children:"a production KMS engine; the default filesystem engine is not an HA design"}),`
`,e.jsx(s.li,{children:"shared VA storage before increasing VA replicas"}),`
`,e.jsx(s.li,{children:"managed OIDC roles and removal of evaluation credentials"}),`
`,e.jsx(s.li,{children:"a trusted TLS issuer or externally managed certificate"}),`
`,e.jsx(s.li,{children:"resource requests, replicas, autoscaling, disruption budgets and placement"}),`
`,e.jsx(s.li,{children:"SMTP, observability and alert delivery"}),`
`,e.jsxs(s.li,{children:["the migration notes in ",e.jsx(s.code,{children:"charts/lamassu/CHANGELOG/"})," before every upgrade",e.jsx(s.ins,{className:"lm-diff-ins",children:", including the optional CA-to-KMS migration hook described above"})]}),`
`]}),`
`,e.jsxs(s.p,{children:["The complete values reference is maintained in ",e.jsx(s.code,{children:"charts/lamassu/VALUES.md"})," in the Helm repository."]})]})}function c(i={}){const{wrapper:s}=i.components||{};return s?e.jsx(s,{...i,children:e.jsx(n,{...i})}):n(i)}function o(i,s){throw new Error("Expected component `"+i+"` to be defined: you likely forgot to import, pass, or provide it.")}const p=Object.freeze(Object.defineProperty({__proto__:null,_markdown:t,default:c,frontmatter:l,lmDiff:r,structuredData:h,toc:d},Symbol.toStringTag,{value:"Module"}));export{p as _};

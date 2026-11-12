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
* cert-manager 1.14+ (only for the default \`tls.type: certManager\` mode); for trusted TLS, either a trusted issuer or a Kubernetes TLS Secret
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

Install cert-manager separately before Lamassu, but only for the default \`tls.type: certManager\` mode. In that mode the chart renders its self-signed Issuer and CA Certificate resources regardless of whether \`tls.certManagerOptions.clusterIssuer\` is set, so cert-manager stays a prerequisite. With \`tls.type: external\`, the chart renders no cert-manager resources and the Gateway terminates TLS with an existing Secret you provide instead.

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

<div className="lm-diff-ins lm-diff-block">
  If your values file still carries the legacy gateway JWT validation settings — \`auth.oidc.apiGateway.jwks\`, \`auth.authorization.rolesClaim\` or \`auth.authorization.roles.admin\` — remove them. The migration guide \`charts/lamassu/CHANGELOG/3.8.0->4.0.0.md\` documents their removal with no compatibility aliases, and \`values.schema.json\` rejects the leftover blocks instead of silently ignoring them. The replacements are \`services.authz.jwkUrl\` and \`services.authz.bootstrap\`, already shown in the example above.
</div>

TLS with an existing Secret [#tls-with-an-existing-secret]

Create a Secret containing \`tls.crt\` and \`tls.key\`, then reference it. The Secret must already exist before installing: in \`external\` mode the chart renders no cert-manager resources and never creates this Secret.

\`\`\`yaml
tls:
  type: external
  externalOptions:
    secretName: provided-tls
\`\`\`

<div className="lm-diff-ins lm-diff-block">
  AMQP TLS (AMQPS) [#amqp-tls-amqps]
</div>

<div className="lm-diff-ins lm-diff-block">
  \`amqp.tls: true\` selects AMQPS in every event-bus configuration block. The default port stays \`5672\` and does not change automatically when TLS is enabled, so set \`amqp.port\` to the broker's TLS listener, commonly \`5671\`.
</div>

<div className="lm-diff-ins lm-diff-block">
  With no CA Secret configured, the event-bus clients use the system-trusted CAs. To trust a private CA, create a Secret in the release namespace containing the CA certificate in PEM format and set \`amqp.ca.secretName\` (and \`amqp.ca.certificateKey\` if the data key is not \`ca.crt\`).
</div>

<div className="lm-diff-ins lm-diff-block">
  For brokers that require mutual TLS, create a Secret containing the client certificate and private key and set \`amqp.client.secretName\` (with \`amqp.client.certificateKey\` and \`amqp.client.privateKeyKey\` if the data keys are not \`tls.crt\` and \`tls.key\`).
</div>

<div className="lm-diff-ins lm-diff-block">
  \`\`\`yaml
  amqp:
    tls: true
    port: 5671
    ca:
      secretName: rabbitmq-ca
    client:
      secretName: lamassu-amqp-client
  \`\`\`
</div>

<div className="lm-diff-ins lm-diff-block">
  The chart mounts configured Secrets read-only into every AMQP-consuming workload: the CA certificate under \`/etc/lamassu/amqp/ca\` and the client certificate and key under \`/etc/lamassu/amqp/client\`. The mounted file names are always \`ca.crt\`, \`tls.crt\` and \`tls.key\` — the \`certificateKey\` and \`privateKeyKey\` values rename only the Secret data keys, never the on-disk paths. The client private key is mounted with restrictive permissions (\`defaultMode: 0440\`; the CA volume uses \`0444\`), which works because the chart adds \`fsGroup\` to the pod security context when \`amqp.client.secretName\` is set — it uses the container \`runAsGroup\` (default \`65532\`) when \`fsGroup\` is not already set.
</div>

<div className="lm-diff-ins lm-diff-block">
  Both Secret options require \`amqp.tls: true\`: \`values.schema.json\` rejects a non-empty \`secretName\` when \`tls\` is false, rejects unknown keys and rejects data-key names outside \`^[A-Za-z0-9._-]+$\`. The referenced Secret must exist in the release namespace or the consuming pods fail to start.
</div>

<div className="lm-diff-ins lm-diff-block">
  The AMQP client loads certificates at startup, so restart the consuming pods after updating either Secret. Changing any \`amqp\` value rolls the consuming pods through the \`checksum/config\` annotation, but a change to Secret content alone does not trigger a rollout.
</div>

<div className="lm-diff-ins lm-diff-block">
  <Callout type="warn" title="Set the AMQP port before upgrading">
    Per the migration guide \`charts/lamassu/CHANGELOG/3.8.0->4.0.0.md\`: in 3.8.0 \`amqp.tls\` was not applied and event-bus clients used plaintext AMQP; from 4.0.0, \`amqp.tls: true\` switches them to AMQPS. Set \`amqp.port\` to the broker TLS listener before upgrading, or set \`amqp.tls: false\` to keep plaintext AMQP. \`amqp.tls: false\` sends the broker credentials and all event-bus traffic in cleartext.
  </Callout>
</div>

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

Production decisions [#production-decisions]

Before going live, review:

* backup and recovery for PostgreSQL and persistent volumes
* a production KMS engine; the default filesystem engine is not an HA design
* shared VA storage before increasing VA replicas
* managed OIDC roles and removal of evaluation credentials
* a trusted TLS issuer or externally managed certificate
* resource requests, replicas, autoscaling, disruption budgets and placement
* SMTP, observability and alert delivery
* the [version upgrade guides](/docs/upgrades/3-8-0-to-4-0-0) and the notes in \`charts/lamassu/CHANGELOG/\` before every upgrade

The complete values reference is maintained in \`charts/lamassu/VALUES.md\` in the Helm repository.
`,l={title:"Install with Helm",description:"Prepare dependencies, configure the Lamassu chart and verify a controlled Kubernetes deployment."},r={isNew:!1,changes:10,title:void 0,description:void 0},h={contents:[{heading:"install-lamassu-with-helm",content:"Use the Helm workflow when you need explicit control over identity, databases, messaging, certificates, storage and upgrades. For an evaluation environment where the script can make those choices for you, use Fastlane."},{heading:"before-you-begin",content:"Prepare the platform services that are deliberately outside the Lamassu chart:"},{heading:"before-you-begin",content:"a Kubernetes 1.24+ cluster and Helm 3.2+"},{heading:"before-you-begin",content:"a reachable PostgreSQL server and a role allowed to create databases and schemas"},{heading:"before-you-begin",content:"a reachable RabbitMQ broker and credentials"},{heading:"before-you-begin",content:"an OIDC provider, normally Keycloak, with a realm/tenant and client for Lamassu"},{heading:"before-you-begin",content:"Envoy Gateway 1.8+ and a `GatewayClass`"},{heading:"before-you-begin",content:"cert-manager 1.14+ (only for the default `tls.type: certManager` mode); for trusted TLS, either a trusted issuer or a Kubernetes TLS Secret"},{heading:"before-you-begin",content:"a StorageClass and an external traffic design"},{heading:"before-you-begin",content:"The chart defaults to a `GatewayClass` named `eg`. Change `gateway.className` if your platform team uses another name."},{heading:"before-you-begin",content:"You provide the PostgreSQL server. The chart's pre-install job connects with the supplied credentials, creates the required `pki`, `authz` and `wfx` databases and service schemas, runs migrations, and applies `services.authz.bootstrap`."},{heading:"before-you-begin",content:"The chart has no Helm dependencies that install PostgreSQL, RabbitMQ, an OIDC provider, Envoy Gateway or cert-manager."},{heading:"1-install-the-gateway-prerequisites",content:"Install or upgrade the Envoy Gateway CRDs before its controller. The commands below match the version used by the Lamassu Helm repository:"},{heading:"1-install-the-gateway-prerequisites",content:"Create the default `GatewayClass` if it does not already exist. Save this manifest as `gateway-class.yaml`:"},{heading:"1-install-the-gateway-prerequisites",content:"Install cert-manager separately before Lamassu, but only for the default `tls.type: certManager` mode. In that mode the chart renders its self-signed Issuer and CA Certificate resources regardless of whether `tls.certManagerOptions.clusterIssuer` is set, so cert-manager stays a prerequisite. With `tls.type: external`, the chart renders no cert-manager resources and the Gateway terminates TLS with an existing Secret you provide instead."},{heading:"2-create-a-values-file",content:"Start with the chart defaults and override the environment-specific values. This example assumes PostgreSQL, RabbitMQ and Keycloak are reachable through Kubernetes DNS, and exposes Keycloak at `/auth` through the shared Lamassu Gateway:"},{heading:"2-create-a-values-file",content:"Do not add `gateway.addresses` by default. Leave address assignment to the load-balancer implementation unless your network design requires a specific Kubernetes-side VIP. The public IP of an upstream NAT gateway or reverse proxy does not belong in this value."},{heading:"2-create-a-values-file",content:"If Keycloak is external and already has its own reachable URL, point the OIDC settings at it and omit the `/auth` entry from `gateway.extraRouting`."},{heading:"2-create-a-values-file",content:"If your values file still carries the legacy gateway JWT validation settings — `auth.oidc.apiGateway.jwks`, `auth.authorization.rolesClaim` or `auth.authorization.roles.admin` — remove them. The migration guide `charts/lamassu/CHANGELOG/3.8.0->4.0.0.md` documents their removal with no compatibility aliases, and `values.schema.json` rejects the leftover blocks instead of silently ignoring them. The replacements are `services.authz.jwkUrl` and `services.authz.bootstrap`, already shown in the example above."},{heading:"tls-with-an-existing-secret",content:"Create a Secret containing `tls.crt` and `tls.key`, then reference it. The Secret must already exist before installing: in `external` mode the chart renders no cert-manager resources and never creates this Secret."},{heading:"amqp-tls-amqps",content:"`amqp.tls: true` selects AMQPS in every event-bus configuration block. The default port stays `5672` and does not change automatically when TLS is enabled, so set `amqp.port` to the broker's TLS listener, commonly `5671`."},{heading:"amqp-tls-amqps",content:"With no CA Secret configured, the event-bus clients use the system-trusted CAs. To trust a private CA, create a Secret in the release namespace containing the CA certificate in PEM format and set `amqp.ca.secretName` (and `amqp.ca.certificateKey` if the data key is not `ca.crt`)."},{heading:"amqp-tls-amqps",content:"For brokers that require mutual TLS, create a Secret containing the client certificate and private key and set `amqp.client.secretName` (with `amqp.client.certificateKey` and `amqp.client.privateKeyKey` if the data keys are not `tls.crt` and `tls.key`)."},{heading:"amqp-tls-amqps",content:"The chart mounts configured Secrets read-only into every AMQP-consuming workload: the CA certificate under `/etc/lamassu/amqp/ca` and the client certificate and key under `/etc/lamassu/amqp/client`. The mounted file names are always `ca.crt`, `tls.crt` and `tls.key` — the `certificateKey` and `privateKeyKey` values rename only the Secret data keys, never the on-disk paths. The client private key is mounted with restrictive permissions (`defaultMode: 0440`; the CA volume uses `0444`), which works because the chart adds `fsGroup` to the pod security context when `amqp.client.secretName` is set — it uses the container `runAsGroup` (default `65532`) when `fsGroup` is not already set."},{heading:"amqp-tls-amqps",content:"Both Secret options require `amqp.tls: true`: `values.schema.json` rejects a non-empty `secretName` when `tls` is false, rejects unknown keys and rejects data-key names outside `^[A-Za-z0-9._-]+$`. The referenced Secret must exist in the release namespace or the consuming pods fail to start."},{heading:"amqp-tls-amqps",content:"The AMQP client loads certificates at startup, so restart the consuming pods after updating either Secret. Changing any `amqp` value rolls the consuming pods through the `checksum/config` annotation, but a change to Secret content alone does not trigger a rollout."},{heading:"amqp-tls-amqps",content:"Per the migration guide `charts/lamassu/CHANGELOG/3.8.0->4.0.0.md`: in 3.8.0 `amqp.tls` was not applied and event-bus clients used plaintext AMQP; from 4.0.0, `amqp.tls: true` switches them to AMQPS. Set `amqp.port` to the broker TLS listener before upgrading, or set `amqp.tls: false` to keep plaintext AMQP. `amqp.tls: false` sends the broker credentials and all event-bus traffic in cleartext."},{heading:"provision-the-first-administrator",content:"There is no implicit superuser. Create the role or group expected by `services.authz.bootstrap` in the OIDC provider and assign it to at least one administrator before exposing Lamassu."},{heading:"provision-the-first-administrator",content:"The pre-install and pre-upgrade job applies the bootstrap idempotently: existing principals are preserved and missing grants are added."},{heading:"provision-the-first-administrator",content:"Test both an authorized identity and a denied identity. If no token matches an active bootstrap principal, nobody can administer the PKI."},{heading:"provision-the-first-administrator",content:"See Access control for the principal and policy model."},{heading:"3-install-lamassu",content:"To install a local checkout instead:"},{heading:"4-verify-the-deployment",content:"The Gateway should report `PROGRAMMED=True`. If it is programmed but has no usable address, continue with Expose the Gateway."},{heading:"4-verify-the-deployment",content:"The Helm test checks the CA, DMS Manager, Device Manager and VA health endpoints and verifies the UI response."},{heading:"production-decisions",content:"Before going live, review:"},{heading:"production-decisions",content:"backup and recovery for PostgreSQL and persistent volumes"},{heading:"production-decisions",content:"a production KMS engine; the default filesystem engine is not an HA design"},{heading:"production-decisions",content:"shared VA storage before increasing VA replicas"},{heading:"production-decisions",content:"managed OIDC roles and removal of evaluation credentials"},{heading:"production-decisions",content:"a trusted TLS issuer or externally managed certificate"},{heading:"production-decisions",content:"resource requests, replicas, autoscaling, disruption budgets and placement"},{heading:"production-decisions",content:"SMTP, observability and alert delivery"},{heading:"production-decisions",content:"the version upgrade guides and the notes in `charts/lamassu/CHANGELOG/` before every upgrade"},{heading:"production-decisions",content:"The complete values reference is maintained in `charts/lamassu/VALUES.md` in the Helm repository."}],headings:[{id:"install-lamassu-with-helm",content:"Install Lamassu with Helm"},{id:"before-you-begin",content:"Before you begin"},{id:"1-install-the-gateway-prerequisites",content:"1\\. Install the Gateway prerequisites"},{id:"2-create-a-values-file",content:"2\\. Create a values file"},{id:"tls-with-an-existing-secret",content:"TLS with an existing Secret"},{id:"amqp-tls-amqps",content:"AMQP TLS (AMQPS)"},{id:"provision-the-first-administrator",content:"Provision the first administrator"},{id:"3-install-lamassu",content:"3\\. Install Lamassu"},{id:"4-verify-the-deployment",content:"4\\. Verify the deployment"},{id:"production-decisions",content:"Production decisions"}]};const d=[{depth:1,url:"#install-lamassu-with-helm",title:e.jsx(e.Fragment,{children:"Install Lamassu with Helm"})},{depth:2,url:"#before-you-begin",title:e.jsx(e.Fragment,{children:"Before you begin"})},{depth:2,url:"#1-install-the-gateway-prerequisites",title:e.jsx(e.Fragment,{children:"1. Install the Gateway prerequisites"})},{depth:2,url:"#2-create-a-values-file",title:e.jsx(e.Fragment,{children:"2. Create a values file"})},{depth:3,url:"#tls-with-an-existing-secret",title:e.jsx(e.Fragment,{children:"TLS with an existing Secret"})},{depth:3,url:"#amqp-tls-amqps",title:e.jsx(e.Fragment,{children:"AMQP TLS (AMQPS)"})},{depth:3,url:"#provision-the-first-administrator",title:e.jsx(e.Fragment,{children:"Provision the first administrator"})},{depth:2,url:"#3-install-lamassu",title:e.jsx(e.Fragment,{children:"3. Install Lamassu"})},{depth:2,url:"#4-verify-the-deployment",title:e.jsx(e.Fragment,{children:"4. Verify the deployment"})},{depth:2,url:"#production-decisions",title:e.jsx(e.Fragment,{children:"Production decisions"})}];function n(i){const s={a:"a",code:"code",div:"div",h1:"h1",h2:"h2",h3:"h3",li:"li",p:"p",pre:"pre",span:"span",ul:"ul",...i.components},{Callout:a}=s;return a||o("Callout"),e.jsxs(e.Fragment,{children:[e.jsx(s.h1,{id:"install-lamassu-with-helm",children:"Install Lamassu with Helm"}),`
`,e.jsxs(s.p,{children:["Use the Helm workflow when you need explicit control over identity, databases, messaging, certificates, storage and upgrades. For an evaluation environment where the script can make those choices for you, use ",e.jsx(s.a,{href:"/docs/deployment/self-hosted/fastlane",children:"Fastlane"}),"."]}),`
`,e.jsx(s.h2,{id:"before-you-begin",children:"Before you begin"}),`
`,e.jsx(s.p,{children:"Prepare the platform services that are deliberately outside the Lamassu chart:"}),`
`,e.jsxs(s.ul,{children:[`
`,e.jsx(s.li,{children:"a Kubernetes 1.24+ cluster and Helm 3.2+"}),`
`,e.jsx(s.li,{children:"a reachable PostgreSQL server and a role allowed to create databases and schemas"}),`
`,e.jsx(s.li,{children:"a reachable RabbitMQ broker and credentials"}),`
`,e.jsx(s.li,{children:"an OIDC provider, normally Keycloak, with a realm/tenant and client for Lamassu"}),`
`,e.jsxs(s.li,{children:["Envoy Gateway 1.8+ and a ",e.jsx(s.code,{children:"GatewayClass"})]}),`
`,e.jsxs(s.li,{children:["cert-manager 1.14+ (only for the default ",e.jsx(s.code,{children:"tls.type: certManager"})," mode); for trusted TLS, either a trusted issuer or a Kubernetes TLS Secret"]}),`
`,e.jsxs(s.li,{children:["a StorageClass and an ",e.jsx(s.a,{href:"/docs/deployment/self-hosted/networking",children:"external traffic design"})]}),`
`]}),`
`,e.jsxs(s.p,{children:["The chart defaults to a ",e.jsx(s.code,{children:"GatewayClass"})," named ",e.jsx(s.code,{children:"eg"}),". Change ",e.jsx(s.code,{children:"gateway.className"})," if your platform team uses another name."]}),`
`,e.jsx(a,{type:"info",title:"What Helm does with PostgreSQL",children:e.jsxs(s.p,{children:["You provide the PostgreSQL server. The chart's pre-install job connects with the supplied credentials, creates the required ",e.jsx(s.code,{children:"pki"}),", ",e.jsx(s.code,{children:"authz"})," and ",e.jsx(s.code,{children:"wfx"})," databases and service schemas, runs migrations, and applies ",e.jsx(s.code,{children:"services.authz.bootstrap"}),"."]})}),`
`,e.jsx(s.p,{children:"The chart has no Helm dependencies that install PostgreSQL, RabbitMQ, an OIDC provider, Envoy Gateway or cert-manager."}),`
`,e.jsx(s.h2,{id:"1-install-the-gateway-prerequisites",children:"1. Install the Gateway prerequisites"}),`
`,e.jsx(s.p,{children:"Install or upgrade the Envoy Gateway CRDs before its controller. The commands below match the version used by the Lamassu Helm repository:"}),`
`,e.jsx(e.Fragment,{children:e.jsx(s.pre,{className:"shiki shiki-themes github-light-default github-dark-default",style:{"--shiki-light":"#1f2328","--shiki-dark":"#e6edf3","--shiki-light-bg":"#ffffff","--shiki-dark-bg":"#0d1117"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsxs(s.code,{children:[e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#CF222E","--shiki-dark":"#FF7B72"},children:"export"}),e.jsx(s.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:" ENVOY_GATEWAY_VERSION"}),e.jsx(s.span,{style:{"--shiki-light":"#CF222E","--shiki-dark":"#FF7B72"},children:"="}),e.jsx(s.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"v1.8.0"})]}),`
`,e.jsx(s.span,{className:"line"}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#953800","--shiki-dark":"#FFA657"},children:"helm"}),e.jsx(s.span,{style:{"--shiki-light":"#0A3069","--shiki-dark":"#A5D6FF"},children:" template"}),e.jsx(s.span,{style:{"--shiki-light":"#0A3069","--shiki-dark":"#A5D6FF"},children:" eg-crds"}),e.jsx(s.span,{style:{"--shiki-light":"#0A3069","--shiki-dark":"#A5D6FF"},children:" oci://docker.io/envoyproxy/gateway-crds-helm"}),e.jsx(s.span,{style:{"--shiki-light":"#CF222E","--shiki-dark":"#FF7B72"},children:" \\"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#0550AE","--shiki-dark":"#79C0FF"},children:"  --version"}),e.jsx(s.span,{style:{"--shiki-light":"#0A3069","--shiki-dark":"#A5D6FF"},children:' "'}),e.jsx(s.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"$ENVOY_GATEWAY_VERSION"}),e.jsx(s.span,{style:{"--shiki-light":"#0A3069","--shiki-dark":"#A5D6FF"},children:'"'}),e.jsx(s.span,{style:{"--shiki-light":"#CF222E","--shiki-dark":"#FF7B72"},children:" \\"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#0550AE","--shiki-dark":"#79C0FF"},children:"  --set"}),e.jsx(s.span,{style:{"--shiki-light":"#0A3069","--shiki-dark":"#A5D6FF"},children:" crds.gatewayAPI.enabled="}),e.jsx(s.span,{style:{"--shiki-light":"#0550AE","--shiki-dark":"#79C0FF"},children:"true"}),e.jsx(s.span,{style:{"--shiki-light":"#CF222E","--shiki-dark":"#FF7B72"},children:" \\"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#0550AE","--shiki-dark":"#79C0FF"},children:"  --set"}),e.jsx(s.span,{style:{"--shiki-light":"#0A3069","--shiki-dark":"#A5D6FF"},children:" crds.gatewayAPI.channel=experimental"}),e.jsx(s.span,{style:{"--shiki-light":"#CF222E","--shiki-dark":"#FF7B72"},children:" \\"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#0550AE","--shiki-dark":"#79C0FF"},children:"  --set"}),e.jsx(s.span,{style:{"--shiki-light":"#0A3069","--shiki-dark":"#A5D6FF"},children:" crds.envoyGateway.enabled="}),e.jsx(s.span,{style:{"--shiki-light":"#0550AE","--shiki-dark":"#79C0FF"},children:"true"}),e.jsx(s.span,{style:{"--shiki-light":"#CF222E","--shiki-dark":"#FF7B72"},children:" \\"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#CF222E","--shiki-dark":"#FF7B72"},children:"  |"}),e.jsx(s.span,{style:{"--shiki-light":"#953800","--shiki-dark":"#FFA657"},children:" kubectl"}),e.jsx(s.span,{style:{"--shiki-light":"#0A3069","--shiki-dark":"#A5D6FF"},children:" apply"}),e.jsx(s.span,{style:{"--shiki-light":"#0550AE","--shiki-dark":"#79C0FF"},children:" --server-side"}),e.jsx(s.span,{style:{"--shiki-light":"#0550AE","--shiki-dark":"#79C0FF"},children:" --force-conflicts"}),e.jsx(s.span,{style:{"--shiki-light":"#0550AE","--shiki-dark":"#79C0FF"},children:" -f"}),e.jsx(s.span,{style:{"--shiki-light":"#0A3069","--shiki-dark":"#A5D6FF"},children:" -"})]}),`
`,e.jsx(s.span,{className:"line"}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#953800","--shiki-dark":"#FFA657"},children:"helm"}),e.jsx(s.span,{style:{"--shiki-light":"#0A3069","--shiki-dark":"#A5D6FF"},children:" upgrade"}),e.jsx(s.span,{style:{"--shiki-light":"#0550AE","--shiki-dark":"#79C0FF"},children:" --install"}),e.jsx(s.span,{style:{"--shiki-light":"#0A3069","--shiki-dark":"#A5D6FF"},children:" eg"}),e.jsx(s.span,{style:{"--shiki-light":"#0A3069","--shiki-dark":"#A5D6FF"},children:" oci://docker.io/envoyproxy/gateway-helm"}),e.jsx(s.span,{style:{"--shiki-light":"#CF222E","--shiki-dark":"#FF7B72"},children:" \\"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#0550AE","--shiki-dark":"#79C0FF"},children:"  --version"}),e.jsx(s.span,{style:{"--shiki-light":"#0A3069","--shiki-dark":"#A5D6FF"},children:' "'}),e.jsx(s.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"$ENVOY_GATEWAY_VERSION"}),e.jsx(s.span,{style:{"--shiki-light":"#0A3069","--shiki-dark":"#A5D6FF"},children:'"'}),e.jsx(s.span,{style:{"--shiki-light":"#CF222E","--shiki-dark":"#FF7B72"},children:" \\"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#0550AE","--shiki-dark":"#79C0FF"},children:"  --namespace"}),e.jsx(s.span,{style:{"--shiki-light":"#0A3069","--shiki-dark":"#A5D6FF"},children:" envoy-gateway-system"}),e.jsx(s.span,{style:{"--shiki-light":"#CF222E","--shiki-dark":"#FF7B72"},children:" \\"})]}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#0550AE","--shiki-dark":"#79C0FF"},children:"  --create-namespace"})})]})})}),`
`,e.jsxs(s.p,{children:["Create the default ",e.jsx(s.code,{children:"GatewayClass"})," if it does not already exist. Save this manifest as ",e.jsx(s.code,{children:"gateway-class.yaml"}),":"]}),`
`,e.jsx(e.Fragment,{children:e.jsx(s.pre,{className:"shiki shiki-themes github-light-default github-dark-default",style:{"--shiki-light":"#1f2328","--shiki-dark":"#e6edf3","--shiki-light-bg":"#ffffff","--shiki-dark-bg":"#0d1117"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(s.code,{children:[e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#116329","--shiki-dark":"#7EE787"},children:"apiVersion"}),e.jsx(s.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:": "}),e.jsx(s.span,{style:{"--shiki-light":"#0A3069","--shiki-dark":"#A5D6FF"},children:"gateway.networking.k8s.io/v1"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#116329","--shiki-dark":"#7EE787"},children:"kind"}),e.jsx(s.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:": "}),e.jsx(s.span,{style:{"--shiki-light":"#0A3069","--shiki-dark":"#A5D6FF"},children:"GatewayClass"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#116329","--shiki-dark":"#7EE787"},children:"metadata"}),e.jsx(s.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:":"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#116329","--shiki-dark":"#7EE787"},children:"  name"}),e.jsx(s.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:": "}),e.jsx(s.span,{style:{"--shiki-light":"#0A3069","--shiki-dark":"#A5D6FF"},children:"eg"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#116329","--shiki-dark":"#7EE787"},children:"spec"}),e.jsx(s.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:":"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#116329","--shiki-dark":"#7EE787"},children:"  controllerName"}),e.jsx(s.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:": "}),e.jsx(s.span,{style:{"--shiki-light":"#0A3069","--shiki-dark":"#A5D6FF"},children:"gateway.envoyproxy.io/gatewayclass-controller"})]})]})})}),`
`,e.jsx(e.Fragment,{children:e.jsx(s.pre,{className:"shiki shiki-themes github-light-default github-dark-default",style:{"--shiki-light":"#1f2328","--shiki-dark":"#e6edf3","--shiki-light-bg":"#ffffff","--shiki-dark-bg":"#0d1117"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsxs(s.code,{children:[e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#953800","--shiki-dark":"#FFA657"},children:"kubectl"}),e.jsx(s.span,{style:{"--shiki-light":"#0A3069","--shiki-dark":"#A5D6FF"},children:" apply"}),e.jsx(s.span,{style:{"--shiki-light":"#0550AE","--shiki-dark":"#79C0FF"},children:" -f"}),e.jsx(s.span,{style:{"--shiki-light":"#0A3069","--shiki-dark":"#A5D6FF"},children:" gateway-class.yaml"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#953800","--shiki-dark":"#FFA657"},children:"kubectl"}),e.jsx(s.span,{style:{"--shiki-light":"#0A3069","--shiki-dark":"#A5D6FF"},children:" rollout"}),e.jsx(s.span,{style:{"--shiki-light":"#0A3069","--shiki-dark":"#A5D6FF"},children:" status"}),e.jsx(s.span,{style:{"--shiki-light":"#0A3069","--shiki-dark":"#A5D6FF"},children:" deployment/envoy-gateway"}),e.jsx(s.span,{style:{"--shiki-light":"#0550AE","--shiki-dark":"#79C0FF"},children:" -n"}),e.jsx(s.span,{style:{"--shiki-light":"#0A3069","--shiki-dark":"#A5D6FF"},children:" envoy-gateway-system"})]})]})})}),`
`,e.jsxs(s.p,{children:["Install cert-manager separately before Lamassu, but only for the default ",e.jsx(s.code,{children:"tls.type: certManager"})," mode. In that mode the chart renders its self-signed Issuer and CA Certificate resources regardless of whether ",e.jsx(s.code,{children:"tls.certManagerOptions.clusterIssuer"})," is set, so cert-manager stays a prerequisite. With ",e.jsx(s.code,{children:"tls.type: external"}),", the chart renders no cert-manager resources and the Gateway terminates TLS with an existing Secret you provide instead."]}),`
`,e.jsx(s.h2,{id:"2-create-a-values-file",children:"2. Create a values file"}),`
`,e.jsxs(s.p,{children:["Start with the chart defaults and override the environment-specific values. This example assumes PostgreSQL, RabbitMQ and Keycloak are reachable through Kubernetes DNS, and exposes Keycloak at ",e.jsx(s.code,{children:"/auth"})," through the shared Lamassu Gateway:"]}),`
`,e.jsx(e.Fragment,{children:e.jsx(s.pre,{className:"shiki shiki-themes github-light-default github-dark-default",style:{"--shiki-light":"#1f2328","--shiki-dark":"#e6edf3","--shiki-light-bg":"#ffffff","--shiki-dark-bg":"#0d1117"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(s.code,{children:[e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#116329","--shiki-dark":"#7EE787"},children:"postgres"}),e.jsx(s.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:":"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#116329","--shiki-dark":"#7EE787"},children:"  hostname"}),e.jsx(s.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:": "}),e.jsx(s.span,{style:{"--shiki-light":"#0A3069","--shiki-dark":"#A5D6FF"},children:"postgresql"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#116329","--shiki-dark":"#7EE787"},children:"  port"}),e.jsx(s.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:": "}),e.jsx(s.span,{style:{"--shiki-light":"#0550AE","--shiki-dark":"#79C0FF"},children:"5432"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#116329","--shiki-dark":"#7EE787"},children:"  username"}),e.jsx(s.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:": "}),e.jsx(s.span,{style:{"--shiki-light":"#0A3069","--shiki-dark":"#A5D6FF"},children:"lamassu"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#116329","--shiki-dark":"#7EE787"},children:"  password"}),e.jsx(s.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:": "}),e.jsx(s.span,{style:{"--shiki-light":"#0A3069","--shiki-dark":"#A5D6FF"},children:"change-me"})]}),`
`,e.jsx(s.span,{className:"line"}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#116329","--shiki-dark":"#7EE787"},children:"amqp"}),e.jsx(s.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:":"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#116329","--shiki-dark":"#7EE787"},children:"  hostname"}),e.jsx(s.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:": "}),e.jsx(s.span,{style:{"--shiki-light":"#0A3069","--shiki-dark":"#A5D6FF"},children:"rabbitmq"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#116329","--shiki-dark":"#7EE787"},children:"  port"}),e.jsx(s.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:": "}),e.jsx(s.span,{style:{"--shiki-light":"#0550AE","--shiki-dark":"#79C0FF"},children:"5672"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#116329","--shiki-dark":"#7EE787"},children:"  username"}),e.jsx(s.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:": "}),e.jsx(s.span,{style:{"--shiki-light":"#0A3069","--shiki-dark":"#A5D6FF"},children:"lamassu"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#116329","--shiki-dark":"#7EE787"},children:"  password"}),e.jsx(s.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:": "}),e.jsx(s.span,{style:{"--shiki-light":"#0A3069","--shiki-dark":"#A5D6FF"},children:"change-me"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#116329","--shiki-dark":"#7EE787"},children:"  tls"}),e.jsx(s.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:": "}),e.jsx(s.span,{style:{"--shiki-light":"#0550AE","--shiki-dark":"#79C0FF"},children:"false"})]}),`
`,e.jsx(s.span,{className:"line"}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#116329","--shiki-dark":"#7EE787"},children:"tls"}),e.jsx(s.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:":"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#116329","--shiki-dark":"#7EE787"},children:"  type"}),e.jsx(s.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:": "}),e.jsx(s.span,{style:{"--shiki-light":"#0A3069","--shiki-dark":"#A5D6FF"},children:"certManager"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#116329","--shiki-dark":"#7EE787"},children:"  certManagerOptions"}),e.jsx(s.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:":"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#116329","--shiki-dark":"#7EE787"},children:"    clusterIssuer"}),e.jsx(s.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:": "}),e.jsx(s.span,{style:{"--shiki-light":"#0A3069","--shiki-dark":"#A5D6FF"},children:"production-issuer"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#116329","--shiki-dark":"#7EE787"},children:"    certSpec"}),e.jsx(s.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:":"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#116329","--shiki-dark":"#7EE787"},children:"      commonName"}),e.jsx(s.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:": "}),e.jsx(s.span,{style:{"--shiki-light":"#0A3069","--shiki-dark":"#A5D6FF"},children:"pki.example.com"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#116329","--shiki-dark":"#7EE787"},children:"      hostnames"}),e.jsx(s.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:":"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"        - "}),e.jsx(s.span,{style:{"--shiki-light":"#0A3069","--shiki-dark":"#A5D6FF"},children:"pki.example.com"})]}),`
`,e.jsx(s.span,{className:"line"}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#116329","--shiki-dark":"#7EE787"},children:"gateway"}),e.jsx(s.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:":"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#116329","--shiki-dark":"#7EE787"},children:"  className"}),e.jsx(s.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:": "}),e.jsx(s.span,{style:{"--shiki-light":"#0A3069","--shiki-dark":"#A5D6FF"},children:"eg"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#116329","--shiki-dark":"#7EE787"},children:"  ports"}),e.jsx(s.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:":"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#116329","--shiki-dark":"#7EE787"},children:"    http"}),e.jsx(s.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:": "}),e.jsx(s.span,{style:{"--shiki-light":"#0550AE","--shiki-dark":"#79C0FF"},children:"80"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#116329","--shiki-dark":"#7EE787"},children:"    https"}),e.jsx(s.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:": "}),e.jsx(s.span,{style:{"--shiki-light":"#0550AE","--shiki-dark":"#79C0FF"},children:"443"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#116329","--shiki-dark":"#7EE787"},children:"  extraRouting"}),e.jsx(s.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:":"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"    - "}),e.jsx(s.span,{style:{"--shiki-light":"#116329","--shiki-dark":"#7EE787"},children:"name"}),e.jsx(s.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:": "}),e.jsx(s.span,{style:{"--shiki-light":"#0A3069","--shiki-dark":"#A5D6FF"},children:"auth"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#116329","--shiki-dark":"#7EE787"},children:"      path"}),e.jsx(s.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:": "}),e.jsx(s.span,{style:{"--shiki-light":"#0A3069","--shiki-dark":"#A5D6FF"},children:"/auth"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#116329","--shiki-dark":"#7EE787"},children:"      target"}),e.jsx(s.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:":"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#116329","--shiki-dark":"#7EE787"},children:"        host"}),e.jsx(s.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:": "}),e.jsx(s.span,{style:{"--shiki-light":"#0A3069","--shiki-dark":"#A5D6FF"},children:"auth-keycloak"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#116329","--shiki-dark":"#7EE787"},children:"        port"}),e.jsx(s.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:": "}),e.jsx(s.span,{style:{"--shiki-light":"#0550AE","--shiki-dark":"#79C0FF"},children:"80"})]}),`
`,e.jsx(s.span,{className:"line"}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#116329","--shiki-dark":"#7EE787"},children:"auth"}),e.jsx(s.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:":"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#116329","--shiki-dark":"#7EE787"},children:"  oidc"}),e.jsx(s.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:":"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#116329","--shiki-dark":"#7EE787"},children:"    frontend"}),e.jsx(s.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:":"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#116329","--shiki-dark":"#7EE787"},children:"      clientId"}),e.jsx(s.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:": "}),e.jsx(s.span,{style:{"--shiki-light":"#0A3069","--shiki-dark":"#A5D6FF"},children:"frontend"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#116329","--shiki-dark":"#7EE787"},children:"      authority"}),e.jsx(s.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:": "}),e.jsx(s.span,{style:{"--shiki-light":"#0A3069","--shiki-dark":"#A5D6FF"},children:"https://pki.example.com/auth/realms/lamassu"})]}),`
`,e.jsx(s.span,{className:"line"}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#116329","--shiki-dark":"#7EE787"},children:"services"}),e.jsx(s.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:":"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#116329","--shiki-dark":"#7EE787"},children:"  ca"}),e.jsx(s.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:":"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#116329","--shiki-dark":"#7EE787"},children:"    domains"}),e.jsx(s.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:":"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"      - "}),e.jsx(s.span,{style:{"--shiki-light":"#0A3069","--shiki-dark":"#A5D6FF"},children:"pki.example.com"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#116329","--shiki-dark":"#7EE787"},children:"  authz"}),e.jsx(s.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:":"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#116329","--shiki-dark":"#7EE787"},children:"    jwkUrl"}),e.jsx(s.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:": "}),e.jsx(s.span,{style:{"--shiki-light":"#0A3069","--shiki-dark":"#A5D6FF"},children:"http://auth-keycloak.lamassu.svc.cluster.local/auth/realms/lamassu/protocol/openid-connect/certs"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#116329","--shiki-dark":"#7EE787"},children:"    bootstrap"}),e.jsx(s.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:":"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"      - "}),e.jsx(s.span,{style:{"--shiki-light":"#116329","--shiki-dark":"#7EE787"},children:"principal_id"}),e.jsx(s.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:": "}),e.jsx(s.span,{style:{"--shiki-light":"#0A3069","--shiki-dark":"#A5D6FF"},children:'"oidc:pki-admin"'})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#116329","--shiki-dark":"#7EE787"},children:"        principal_name"}),e.jsx(s.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:": "}),e.jsx(s.span,{style:{"--shiki-light":"#0A3069","--shiki-dark":"#A5D6FF"},children:'"PKI Admin"'})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#116329","--shiki-dark":"#7EE787"},children:"        principal_type"}),e.jsx(s.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:": "}),e.jsx(s.span,{style:{"--shiki-light":"#0A3069","--shiki-dark":"#A5D6FF"},children:'"oidc"'})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#116329","--shiki-dark":"#7EE787"},children:"        policy_ids"}),e.jsx(s.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:":"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"          - "}),e.jsx(s.span,{style:{"--shiki-light":"#0A3069","--shiki-dark":"#A5D6FF"},children:'"lamassu.a6811b60-5f89-4ce7-badb-78ea234794d3"'})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#116329","--shiki-dark":"#7EE787"},children:"        auth_config"}),e.jsx(s.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:":"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#116329","--shiki-dark":"#7EE787"},children:"          claims"}),e.jsx(s.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:":"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"            - "}),e.jsx(s.span,{style:{"--shiki-light":"#116329","--shiki-dark":"#7EE787"},children:"claim"}),e.jsx(s.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:": "}),e.jsx(s.span,{style:{"--shiki-light":"#0A3069","--shiki-dark":"#A5D6FF"},children:"realm_access.roles"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#116329","--shiki-dark":"#7EE787"},children:"              operator"}),e.jsx(s.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:": "}),e.jsx(s.span,{style:{"--shiki-light":"#0A3069","--shiki-dark":"#A5D6FF"},children:"contains"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#116329","--shiki-dark":"#7EE787"},children:"              value"}),e.jsx(s.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:": "}),e.jsx(s.span,{style:{"--shiki-light":"#0A3069","--shiki-dark":"#A5D6FF"},children:"pki-admin"})]})]})})}),`
`,e.jsxs(s.p,{children:["Do not add ",e.jsx(s.code,{children:"gateway.addresses"})," by default. Leave address assignment to the load-balancer implementation unless your network design requires a specific Kubernetes-side VIP. The public IP of an upstream NAT gateway or reverse proxy does not belong in this value."]}),`
`,e.jsxs(s.p,{children:["If Keycloak is external and already has its own reachable URL, point the OIDC settings at it and omit the ",e.jsx(s.code,{children:"/auth"})," entry from ",e.jsx(s.code,{children:"gateway.extraRouting"}),"."]}),`
`,e.jsx(s.div,{className:"lm-diff-ins lm-diff-block",children:e.jsxs(s.p,{children:["If your values file still carries the legacy gateway JWT validation settings — ",e.jsx(s.code,{children:"auth.oidc.apiGateway.jwks"}),", ",e.jsx(s.code,{children:"auth.authorization.rolesClaim"})," or ",e.jsx(s.code,{children:"auth.authorization.roles.admin"})," — remove them. The migration guide ",e.jsx(s.code,{children:"charts/lamassu/CHANGELOG/3.8.0->4.0.0.md"})," documents their removal with no compatibility aliases, and ",e.jsx(s.code,{children:"values.schema.json"})," rejects the leftover blocks instead of silently ignoring them. The replacements are ",e.jsx(s.code,{children:"services.authz.jwkUrl"})," and ",e.jsx(s.code,{children:"services.authz.bootstrap"}),", already shown in the example above."]})}),`
`,e.jsx(s.h3,{id:"tls-with-an-existing-secret",children:"TLS with an existing Secret"}),`
`,e.jsxs(s.p,{children:["Create a Secret containing ",e.jsx(s.code,{children:"tls.crt"})," and ",e.jsx(s.code,{children:"tls.key"}),", then reference it. The Secret must already exist before installing: in ",e.jsx(s.code,{children:"external"})," mode the chart renders no cert-manager resources and never creates this Secret."]}),`
`,e.jsx(e.Fragment,{children:e.jsx(s.pre,{className:"shiki shiki-themes github-light-default github-dark-default",style:{"--shiki-light":"#1f2328","--shiki-dark":"#e6edf3","--shiki-light-bg":"#ffffff","--shiki-dark-bg":"#0d1117"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(s.code,{children:[e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#116329","--shiki-dark":"#7EE787"},children:"tls"}),e.jsx(s.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:":"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#116329","--shiki-dark":"#7EE787"},children:"  type"}),e.jsx(s.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:": "}),e.jsx(s.span,{style:{"--shiki-light":"#0A3069","--shiki-dark":"#A5D6FF"},children:"external"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#116329","--shiki-dark":"#7EE787"},children:"  externalOptions"}),e.jsx(s.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:":"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#116329","--shiki-dark":"#7EE787"},children:"    secretName"}),e.jsx(s.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:": "}),e.jsx(s.span,{style:{"--shiki-light":"#0A3069","--shiki-dark":"#A5D6FF"},children:"provided-tls"})]})]})})}),`
`,e.jsx(s.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(s.h3,{id:"amqp-tls-amqps",children:"AMQP TLS (AMQPS)"})}),`
`,e.jsx(s.div,{className:"lm-diff-ins lm-diff-block",children:e.jsxs(s.p,{children:[e.jsx(s.code,{children:"amqp.tls: true"})," selects AMQPS in every event-bus configuration block. The default port stays ",e.jsx(s.code,{children:"5672"})," and does not change automatically when TLS is enabled, so set ",e.jsx(s.code,{children:"amqp.port"})," to the broker's TLS listener, commonly ",e.jsx(s.code,{children:"5671"}),"."]})}),`
`,e.jsx(s.div,{className:"lm-diff-ins lm-diff-block",children:e.jsxs(s.p,{children:["With no CA Secret configured, the event-bus clients use the system-trusted CAs. To trust a private CA, create a Secret in the release namespace containing the CA certificate in PEM format and set ",e.jsx(s.code,{children:"amqp.ca.secretName"})," (and ",e.jsx(s.code,{children:"amqp.ca.certificateKey"})," if the data key is not ",e.jsx(s.code,{children:"ca.crt"}),")."]})}),`
`,e.jsx(s.div,{className:"lm-diff-ins lm-diff-block",children:e.jsxs(s.p,{children:["For brokers that require mutual TLS, create a Secret containing the client certificate and private key and set ",e.jsx(s.code,{children:"amqp.client.secretName"})," (with ",e.jsx(s.code,{children:"amqp.client.certificateKey"})," and ",e.jsx(s.code,{children:"amqp.client.privateKeyKey"})," if the data keys are not ",e.jsx(s.code,{children:"tls.crt"})," and ",e.jsx(s.code,{children:"tls.key"}),")."]})}),`
`,e.jsx(s.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(e.Fragment,{children:e.jsx(s.pre,{className:"shiki shiki-themes github-light-default github-dark-default",style:{"--shiki-light":"#1f2328","--shiki-dark":"#e6edf3","--shiki-light-bg":"#ffffff","--shiki-dark-bg":"#0d1117"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(s.code,{children:[e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#116329","--shiki-dark":"#7EE787"},children:"amqp"}),e.jsx(s.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:":"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#116329","--shiki-dark":"#7EE787"},children:"  tls"}),e.jsx(s.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:": "}),e.jsx(s.span,{style:{"--shiki-light":"#0550AE","--shiki-dark":"#79C0FF"},children:"true"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#116329","--shiki-dark":"#7EE787"},children:"  port"}),e.jsx(s.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:": "}),e.jsx(s.span,{style:{"--shiki-light":"#0550AE","--shiki-dark":"#79C0FF"},children:"5671"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#116329","--shiki-dark":"#7EE787"},children:"  ca"}),e.jsx(s.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:":"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#116329","--shiki-dark":"#7EE787"},children:"    secretName"}),e.jsx(s.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:": "}),e.jsx(s.span,{style:{"--shiki-light":"#0A3069","--shiki-dark":"#A5D6FF"},children:"rabbitmq-ca"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#116329","--shiki-dark":"#7EE787"},children:"  client"}),e.jsx(s.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:":"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#116329","--shiki-dark":"#7EE787"},children:"    secretName"}),e.jsx(s.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:": "}),e.jsx(s.span,{style:{"--shiki-light":"#0A3069","--shiki-dark":"#A5D6FF"},children:"lamassu-amqp-client"})]})]})})})}),`
`,e.jsx(s.div,{className:"lm-diff-ins lm-diff-block",children:e.jsxs(s.p,{children:["The chart mounts configured Secrets read-only into every AMQP-consuming workload: the CA certificate under ",e.jsx(s.code,{children:"/etc/lamassu/amqp/ca"})," and the client certificate and key under ",e.jsx(s.code,{children:"/etc/lamassu/amqp/client"}),". The mounted file names are always ",e.jsx(s.code,{children:"ca.crt"}),", ",e.jsx(s.code,{children:"tls.crt"})," and ",e.jsx(s.code,{children:"tls.key"})," — the ",e.jsx(s.code,{children:"certificateKey"})," and ",e.jsx(s.code,{children:"privateKeyKey"})," values rename only the Secret data keys, never the on-disk paths. The client private key is mounted with restrictive permissions (",e.jsx(s.code,{children:"defaultMode: 0440"}),"; the CA volume uses ",e.jsx(s.code,{children:"0444"}),"), which works because the chart adds ",e.jsx(s.code,{children:"fsGroup"})," to the pod security context when ",e.jsx(s.code,{children:"amqp.client.secretName"})," is set — it uses the container ",e.jsx(s.code,{children:"runAsGroup"})," (default ",e.jsx(s.code,{children:"65532"}),") when ",e.jsx(s.code,{children:"fsGroup"})," is not already set."]})}),`
`,e.jsx(s.div,{className:"lm-diff-ins lm-diff-block",children:e.jsxs(s.p,{children:["Both Secret options require ",e.jsx(s.code,{children:"amqp.tls: true"}),": ",e.jsx(s.code,{children:"values.schema.json"})," rejects a non-empty ",e.jsx(s.code,{children:"secretName"})," when ",e.jsx(s.code,{children:"tls"})," is false, rejects unknown keys and rejects data-key names outside ",e.jsx(s.code,{children:"^[A-Za-z0-9._-]+$"}),". The referenced Secret must exist in the release namespace or the consuming pods fail to start."]})}),`
`,e.jsx(s.div,{className:"lm-diff-ins lm-diff-block",children:e.jsxs(s.p,{children:["The AMQP client loads certificates at startup, so restart the consuming pods after updating either Secret. Changing any ",e.jsx(s.code,{children:"amqp"})," value rolls the consuming pods through the ",e.jsx(s.code,{children:"checksum/config"})," annotation, but a change to Secret content alone does not trigger a rollout."]})}),`
`,e.jsx(s.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(a,{type:"warn",title:"Set the AMQP port before upgrading",children:e.jsxs(s.p,{children:["Per the migration guide ",e.jsx(s.code,{children:"charts/lamassu/CHANGELOG/3.8.0->4.0.0.md"}),": in 3.8.0 ",e.jsx(s.code,{children:"amqp.tls"})," was not applied and event-bus clients used plaintext AMQP; from 4.0.0, ",e.jsx(s.code,{children:"amqp.tls: true"})," switches them to AMQPS. Set ",e.jsx(s.code,{children:"amqp.port"})," to the broker TLS listener before upgrading, or set ",e.jsx(s.code,{children:"amqp.tls: false"})," to keep plaintext AMQP. ",e.jsx(s.code,{children:"amqp.tls: false"})," sends the broker credentials and all event-bus traffic in cleartext."]})})}),`
`,e.jsx(s.h3,{id:"provision-the-first-administrator",children:"Provision the first administrator"}),`
`,e.jsxs(s.p,{children:["There is no implicit superuser. Create the role or group expected by ",e.jsx(s.code,{children:"services.authz.bootstrap"})," in the OIDC provider and assign it to at least one administrator before exposing Lamassu."]}),`
`,e.jsx(s.p,{children:"The pre-install and pre-upgrade job applies the bootstrap idempotently: existing principals are preserved and missing grants are added."}),`
`,e.jsx(a,{type:"warn",title:"Validate access before exposing the platform",children:e.jsx(s.p,{children:"Test both an authorized identity and a denied identity. If no token matches an active bootstrap principal, nobody can administer the PKI."})}),`
`,e.jsxs(s.p,{children:["See ",e.jsx(s.a,{href:"/docs/platform/administration/access-control",children:"Access control"})," for the principal and policy model."]}),`
`,e.jsx(s.h2,{id:"3-install-lamassu",children:"3. Install Lamassu"}),`
`,e.jsx(e.Fragment,{children:e.jsx(s.pre,{className:"shiki shiki-themes github-light-default github-dark-default",style:{"--shiki-light":"#1f2328","--shiki-dark":"#e6edf3","--shiki-light-bg":"#ffffff","--shiki-dark-bg":"#0d1117"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsxs(s.code,{children:[e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#953800","--shiki-dark":"#FFA657"},children:"helm"}),e.jsx(s.span,{style:{"--shiki-light":"#0A3069","--shiki-dark":"#A5D6FF"},children:" repo"}),e.jsx(s.span,{style:{"--shiki-light":"#0A3069","--shiki-dark":"#A5D6FF"},children:" add"}),e.jsx(s.span,{style:{"--shiki-light":"#0A3069","--shiki-dark":"#A5D6FF"},children:" lamassu"}),e.jsx(s.span,{style:{"--shiki-light":"#0A3069","--shiki-dark":"#A5D6FF"},children:" https://lamassuiot.github.io/lamassu-helm"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#953800","--shiki-dark":"#FFA657"},children:"helm"}),e.jsx(s.span,{style:{"--shiki-light":"#0A3069","--shiki-dark":"#A5D6FF"},children:" repo"}),e.jsx(s.span,{style:{"--shiki-light":"#0A3069","--shiki-dark":"#A5D6FF"},children:" update"})]}),`
`,e.jsx(s.span,{className:"line"}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#953800","--shiki-dark":"#FFA657"},children:"helm"}),e.jsx(s.span,{style:{"--shiki-light":"#0A3069","--shiki-dark":"#A5D6FF"},children:" upgrade"}),e.jsx(s.span,{style:{"--shiki-light":"#0550AE","--shiki-dark":"#79C0FF"},children:" --install"}),e.jsx(s.span,{style:{"--shiki-light":"#0A3069","--shiki-dark":"#A5D6FF"},children:" lamassu"}),e.jsx(s.span,{style:{"--shiki-light":"#0A3069","--shiki-dark":"#A5D6FF"},children:" lamassu/lamassu"}),e.jsx(s.span,{style:{"--shiki-light":"#CF222E","--shiki-dark":"#FF7B72"},children:" \\"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#0550AE","--shiki-dark":"#79C0FF"},children:"  --namespace"}),e.jsx(s.span,{style:{"--shiki-light":"#0A3069","--shiki-dark":"#A5D6FF"},children:" lamassu"}),e.jsx(s.span,{style:{"--shiki-light":"#CF222E","--shiki-dark":"#FF7B72"},children:" \\"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#0550AE","--shiki-dark":"#79C0FF"},children:"  --create-namespace"}),e.jsx(s.span,{style:{"--shiki-light":"#CF222E","--shiki-dark":"#FF7B72"},children:" \\"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#0550AE","--shiki-dark":"#79C0FF"},children:"  --values"}),e.jsx(s.span,{style:{"--shiki-light":"#0A3069","--shiki-dark":"#A5D6FF"},children:" values.yaml"}),e.jsx(s.span,{style:{"--shiki-light":"#CF222E","--shiki-dark":"#FF7B72"},children:" \\"})]}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#0550AE","--shiki-dark":"#79C0FF"},children:"  --wait"})})]})})}),`
`,e.jsx(s.p,{children:"To install a local checkout instead:"}),`
`,e.jsx(e.Fragment,{children:e.jsx(s.pre,{className:"shiki shiki-themes github-light-default github-dark-default",style:{"--shiki-light":"#1f2328","--shiki-dark":"#e6edf3","--shiki-light-bg":"#ffffff","--shiki-dark-bg":"#0d1117"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsxs(s.code,{children:[e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#953800","--shiki-dark":"#FFA657"},children:"helm"}),e.jsx(s.span,{style:{"--shiki-light":"#0A3069","--shiki-dark":"#A5D6FF"},children:" upgrade"}),e.jsx(s.span,{style:{"--shiki-light":"#0550AE","--shiki-dark":"#79C0FF"},children:" --install"}),e.jsx(s.span,{style:{"--shiki-light":"#0A3069","--shiki-dark":"#A5D6FF"},children:" lamassu"}),e.jsx(s.span,{style:{"--shiki-light":"#0A3069","--shiki-dark":"#A5D6FF"},children:" ./charts/lamassu"}),e.jsx(s.span,{style:{"--shiki-light":"#CF222E","--shiki-dark":"#FF7B72"},children:" \\"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#0550AE","--shiki-dark":"#79C0FF"},children:"  --namespace"}),e.jsx(s.span,{style:{"--shiki-light":"#0A3069","--shiki-dark":"#A5D6FF"},children:" lamassu"}),e.jsx(s.span,{style:{"--shiki-light":"#CF222E","--shiki-dark":"#FF7B72"},children:" \\"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#0550AE","--shiki-dark":"#79C0FF"},children:"  --create-namespace"}),e.jsx(s.span,{style:{"--shiki-light":"#CF222E","--shiki-dark":"#FF7B72"},children:" \\"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#0550AE","--shiki-dark":"#79C0FF"},children:"  --values"}),e.jsx(s.span,{style:{"--shiki-light":"#0A3069","--shiki-dark":"#A5D6FF"},children:" values.yaml"}),e.jsx(s.span,{style:{"--shiki-light":"#CF222E","--shiki-dark":"#FF7B72"},children:" \\"})]}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#0550AE","--shiki-dark":"#79C0FF"},children:"  --wait"})})]})})}),`
`,e.jsx(s.h2,{id:"4-verify-the-deployment",children:"4. Verify the deployment"}),`
`,e.jsx(e.Fragment,{children:e.jsx(s.pre,{className:"shiki shiki-themes github-light-default github-dark-default",style:{"--shiki-light":"#1f2328","--shiki-dark":"#e6edf3","--shiki-light-bg":"#ffffff","--shiki-dark-bg":"#0d1117"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsxs(s.code,{children:[e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#953800","--shiki-dark":"#FFA657"},children:"kubectl"}),e.jsx(s.span,{style:{"--shiki-light":"#0A3069","--shiki-dark":"#A5D6FF"},children:" get"}),e.jsx(s.span,{style:{"--shiki-light":"#0A3069","--shiki-dark":"#A5D6FF"},children:" pods"}),e.jsx(s.span,{style:{"--shiki-light":"#0550AE","--shiki-dark":"#79C0FF"},children:" -n"}),e.jsx(s.span,{style:{"--shiki-light":"#0A3069","--shiki-dark":"#A5D6FF"},children:" lamassu"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#953800","--shiki-dark":"#FFA657"},children:"kubectl"}),e.jsx(s.span,{style:{"--shiki-light":"#0A3069","--shiki-dark":"#A5D6FF"},children:" get"}),e.jsx(s.span,{style:{"--shiki-light":"#0A3069","--shiki-dark":"#A5D6FF"},children:" gateway,httproute"}),e.jsx(s.span,{style:{"--shiki-light":"#0550AE","--shiki-dark":"#79C0FF"},children:" -n"}),e.jsx(s.span,{style:{"--shiki-light":"#0A3069","--shiki-dark":"#A5D6FF"},children:" lamassu"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#953800","--shiki-dark":"#FFA657"},children:"kubectl"}),e.jsx(s.span,{style:{"--shiki-light":"#0A3069","--shiki-dark":"#A5D6FF"},children:" get"}),e.jsx(s.span,{style:{"--shiki-light":"#0A3069","--shiki-dark":"#A5D6FF"},children:" service"}),e.jsx(s.span,{style:{"--shiki-light":"#0550AE","--shiki-dark":"#79C0FF"},children:" -A"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#953800","--shiki-dark":"#FFA657"},children:"helm"}),e.jsx(s.span,{style:{"--shiki-light":"#0A3069","--shiki-dark":"#A5D6FF"},children:" test"}),e.jsx(s.span,{style:{"--shiki-light":"#0A3069","--shiki-dark":"#A5D6FF"},children:" lamassu"}),e.jsx(s.span,{style:{"--shiki-light":"#0550AE","--shiki-dark":"#79C0FF"},children:" -n"}),e.jsx(s.span,{style:{"--shiki-light":"#0A3069","--shiki-dark":"#A5D6FF"},children:" lamassu"}),e.jsx(s.span,{style:{"--shiki-light":"#0550AE","--shiki-dark":"#79C0FF"},children:" --logs"})]})]})})}),`
`,e.jsxs(s.p,{children:["The Gateway should report ",e.jsx(s.code,{children:"PROGRAMMED=True"}),". If it is programmed but has no usable address, continue with ",e.jsx(s.a,{href:"/docs/deployment/self-hosted/networking",children:"Expose the Gateway"}),"."]}),`
`,e.jsx(s.p,{children:"The Helm test checks the CA, DMS Manager, Device Manager and VA health endpoints and verifies the UI response."}),`
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
`,e.jsxs(s.li,{children:["the ",e.jsx(s.a,{href:"/docs/upgrades/3-8-0-to-4-0-0",children:"version upgrade guides"})," and the notes in ",e.jsx(s.code,{children:"charts/lamassu/CHANGELOG/"})," before every upgrade"]}),`
`]}),`
`,e.jsxs(s.p,{children:["The complete values reference is maintained in ",e.jsx(s.code,{children:"charts/lamassu/VALUES.md"})," in the Helm repository."]})]})}function c(i={}){const{wrapper:s}=i.components||{};return s?e.jsx(s,{...i,children:e.jsx(n,{...i})}):n(i)}function o(i,s){throw new Error("Expected component `"+i+"` to be defined: you likely forgot to import, pass, or provide it.")}const p=Object.freeze(Object.defineProperty({__proto__:null,_markdown:t,default:c,frontmatter:l,lmDiff:r,structuredData:h,toc:d},Symbol.toStringTag,{value:"Module"}));export{p as _};

import{j as s}from"./index-prc0XQdj.js";let t=`

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

See [Access control](/docs/platform/pki/access-control) for the principal and policy model.

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
* the migration notes in \`charts/lamassu/CHANGELOG/\` before every upgrade

The complete values reference is maintained in \`charts/lamassu/VALUES.md\` in the Helm repository.
`,l={title:"Install with Helm",description:"Prepare dependencies, configure the Lamassu chart and verify a controlled Kubernetes deployment."},h={contents:[{heading:"install-lamassu-with-helm",content:"Use the Helm workflow when you need explicit control over identity, databases, messaging, certificates, storage and upgrades. For an evaluation environment where the script can make those choices for you, use Fastlane."},{heading:"before-you-begin",content:"Prepare the platform services that are deliberately outside the Lamassu chart:"},{heading:"before-you-begin",content:"a Kubernetes 1.24+ cluster and Helm 3.2+"},{heading:"before-you-begin",content:"a reachable PostgreSQL server and a role allowed to create databases and schemas"},{heading:"before-you-begin",content:"a reachable RabbitMQ broker and credentials"},{heading:"before-you-begin",content:"an OIDC provider, normally Keycloak, with a realm/tenant and client for Lamassu"},{heading:"before-you-begin",content:"Envoy Gateway 1.8+ and a `GatewayClass`"},{heading:"before-you-begin",content:"cert-manager 1.14+; for trusted TLS, either a trusted issuer or a Kubernetes TLS Secret"},{heading:"before-you-begin",content:"a StorageClass and an external traffic design"},{heading:"before-you-begin",content:"The chart defaults to a `GatewayClass` named `eg`. Change `gateway.className` if your platform team uses another name."},{heading:"before-you-begin",content:"You provide the PostgreSQL server. The chart's pre-install job connects with the supplied credentials, creates the required `pki`, `authz` and `wfx` databases and service schemas, runs migrations, and applies `services.authz.bootstrap`."},{heading:"before-you-begin",content:"The chart has no Helm dependencies that install PostgreSQL, RabbitMQ, an OIDC provider, Envoy Gateway or cert-manager."},{heading:"1-install-the-gateway-prerequisites",content:"Install or upgrade the Envoy Gateway CRDs before its controller. The commands below match the version used by the Lamassu Helm repository:"},{heading:"1-install-the-gateway-prerequisites",content:"Create the default `GatewayClass` if it does not already exist. Save this manifest as `gateway-class.yaml`:"},{heading:"1-install-the-gateway-prerequisites",content:"Install cert-manager separately before Lamassu. The current chart renders its self-signed issuer and CA certificate resources even when `tls.type: external` makes the Gateway use an existing TLS Secret. Selecting external TLS therefore does not remove the cert-manager prerequisite."},{heading:"2-create-a-values-file",content:"Start with the chart defaults and override the environment-specific values. This example assumes PostgreSQL, RabbitMQ and Keycloak are reachable through Kubernetes DNS, and exposes Keycloak at `/auth` through the shared Lamassu Gateway:"},{heading:"2-create-a-values-file",content:"Do not add `gateway.addresses` by default. Leave address assignment to the load-balancer implementation unless your network design requires a specific Kubernetes-side VIP. The public IP of an upstream NAT gateway or reverse proxy does not belong in this value."},{heading:"2-create-a-values-file",content:"If Keycloak is external and already has its own reachable URL, point the OIDC settings at it and omit the `/auth` entry from `gateway.extraRouting`."},{heading:"tls-with-an-existing-secret",content:"Create a Secret containing `tls.crt` and `tls.key`, then reference it:"},{heading:"provision-the-first-administrator",content:"There is no implicit superuser. Create the role or group expected by `services.authz.bootstrap` in the OIDC provider and assign it to at least one administrator before exposing Lamassu."},{heading:"provision-the-first-administrator",content:"The pre-install and pre-upgrade job applies the bootstrap idempotently: existing principals are preserved and missing grants are added."},{heading:"provision-the-first-administrator",content:"Test both an authorized identity and a denied identity. If no token matches an active bootstrap principal, nobody can administer the PKI."},{heading:"provision-the-first-administrator",content:"See Access control for the principal and policy model."},{heading:"3-install-lamassu",content:"To install a local checkout instead:"},{heading:"4-verify-the-deployment",content:"The Gateway should report `PROGRAMMED=True`. If it is programmed but has no usable address, continue with Expose the Gateway."},{heading:"4-verify-the-deployment",content:"The Helm test checks the CA, DMS Manager, Device Manager and VA health endpoints and verifies the UI response."},{heading:"production-decisions",content:"Before going live, review:"},{heading:"production-decisions",content:"backup and recovery for PostgreSQL and persistent volumes"},{heading:"production-decisions",content:"a production KMS engine; the default filesystem engine is not an HA design"},{heading:"production-decisions",content:"shared VA storage before increasing VA replicas"},{heading:"production-decisions",content:"managed OIDC roles and removal of evaluation credentials"},{heading:"production-decisions",content:"a trusted TLS issuer or externally managed certificate"},{heading:"production-decisions",content:"resource requests, replicas, autoscaling, disruption budgets and placement"},{heading:"production-decisions",content:"SMTP, observability and alert delivery"},{heading:"production-decisions",content:"the migration notes in `charts/lamassu/CHANGELOG/` before every upgrade"},{heading:"production-decisions",content:"The complete values reference is maintained in `charts/lamassu/VALUES.md` in the Helm repository."}],headings:[{id:"install-lamassu-with-helm",content:"Install Lamassu with Helm"},{id:"before-you-begin",content:"Before you begin"},{id:"1-install-the-gateway-prerequisites",content:"1\\. Install the Gateway prerequisites"},{id:"2-create-a-values-file",content:"2\\. Create a values file"},{id:"tls-with-an-existing-secret",content:"TLS with an existing Secret"},{id:"provision-the-first-administrator",content:"Provision the first administrator"},{id:"3-install-lamassu",content:"3\\. Install Lamassu"},{id:"4-verify-the-deployment",content:"4\\. Verify the deployment"},{id:"production-decisions",content:"Production decisions"}]};const r=[{depth:1,url:"#install-lamassu-with-helm",title:s.jsx(s.Fragment,{children:"Install Lamassu with Helm"})},{depth:2,url:"#before-you-begin",title:s.jsx(s.Fragment,{children:"Before you begin"})},{depth:2,url:"#1-install-the-gateway-prerequisites",title:s.jsx(s.Fragment,{children:"1. Install the Gateway prerequisites"})},{depth:2,url:"#2-create-a-values-file",title:s.jsx(s.Fragment,{children:"2. Create a values file"})},{depth:3,url:"#tls-with-an-existing-secret",title:s.jsx(s.Fragment,{children:"TLS with an existing Secret"})},{depth:3,url:"#provision-the-first-administrator",title:s.jsx(s.Fragment,{children:"Provision the first administrator"})},{depth:2,url:"#3-install-lamassu",title:s.jsx(s.Fragment,{children:"3. Install Lamassu"})},{depth:2,url:"#4-verify-the-deployment",title:s.jsx(s.Fragment,{children:"4. Verify the deployment"})},{depth:2,url:"#production-decisions",title:s.jsx(s.Fragment,{children:"Production decisions"})}];function n(i){const e={a:"a",code:"code",h1:"h1",h2:"h2",h3:"h3",li:"li",p:"p",pre:"pre",span:"span",ul:"ul",...i.components},{Callout:a}=e;return a||c("Callout"),s.jsxs(s.Fragment,{children:[s.jsx(e.h1,{id:"install-lamassu-with-helm",children:"Install Lamassu with Helm"}),`
`,s.jsxs(e.p,{children:["Use the Helm workflow when you need explicit control over identity, databases, messaging, certificates, storage and upgrades. For an evaluation environment where the script can make those choices for you, use ",s.jsx(e.a,{href:"/docs/deployment/self-hosted/fastlane",children:"Fastlane"}),"."]}),`
`,s.jsx(e.h2,{id:"before-you-begin",children:"Before you begin"}),`
`,s.jsx(e.p,{children:"Prepare the platform services that are deliberately outside the Lamassu chart:"}),`
`,s.jsxs(e.ul,{children:[`
`,s.jsx(e.li,{children:"a Kubernetes 1.24+ cluster and Helm 3.2+"}),`
`,s.jsx(e.li,{children:"a reachable PostgreSQL server and a role allowed to create databases and schemas"}),`
`,s.jsx(e.li,{children:"a reachable RabbitMQ broker and credentials"}),`
`,s.jsx(e.li,{children:"an OIDC provider, normally Keycloak, with a realm/tenant and client for Lamassu"}),`
`,s.jsxs(e.li,{children:["Envoy Gateway 1.8+ and a ",s.jsx(e.code,{children:"GatewayClass"})]}),`
`,s.jsx(e.li,{children:"cert-manager 1.14+; for trusted TLS, either a trusted issuer or a Kubernetes TLS Secret"}),`
`,s.jsxs(e.li,{children:["a StorageClass and an ",s.jsx(e.a,{href:"/docs/deployment/self-hosted/networking",children:"external traffic design"})]}),`
`]}),`
`,s.jsxs(e.p,{children:["The chart defaults to a ",s.jsx(e.code,{children:"GatewayClass"})," named ",s.jsx(e.code,{children:"eg"}),". Change ",s.jsx(e.code,{children:"gateway.className"})," if your platform team uses another name."]}),`
`,s.jsx(a,{type:"info",title:"What Helm does with PostgreSQL",children:s.jsxs(e.p,{children:["You provide the PostgreSQL server. The chart's pre-install job connects with the supplied credentials, creates the required ",s.jsx(e.code,{children:"pki"}),", ",s.jsx(e.code,{children:"authz"})," and ",s.jsx(e.code,{children:"wfx"})," databases and service schemas, runs migrations, and applies ",s.jsx(e.code,{children:"services.authz.bootstrap"}),"."]})}),`
`,s.jsx(e.p,{children:"The chart has no Helm dependencies that install PostgreSQL, RabbitMQ, an OIDC provider, Envoy Gateway or cert-manager."}),`
`,s.jsx(e.h2,{id:"1-install-the-gateway-prerequisites",children:"1. Install the Gateway prerequisites"}),`
`,s.jsx(e.p,{children:"Install or upgrade the Envoy Gateway CRDs before its controller. The commands below match the version used by the Lamassu Helm repository:"}),`
`,s.jsx(s.Fragment,{children:s.jsx(e.pre,{className:"shiki shiki-themes min-light min-dark",style:{"--shiki-light":"#24292eff","--shiki-dark":"#b392f0","--shiki-light-bg":"#ffffff","--shiki-dark-bg":"#1f1f1f"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:s.jsxs(e.code,{children:[s.jsxs(e.span,{className:"line",children:[s.jsx(e.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:"export"}),s.jsx(e.span,{style:{"--shiki-light":"#24292EFF","--shiki-dark":"#B392F0"},children:" ENVOY_GATEWAY_VERSION"}),s.jsx(e.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:"="}),s.jsx(e.span,{style:{"--shiki-light":"#24292EFF","--shiki-dark":"#B392F0"},children:"v1.8.0"})]}),`
`,s.jsx(e.span,{className:"line"}),`
`,s.jsxs(e.span,{className:"line",children:[s.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"helm"}),s.jsx(e.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" template"}),s.jsx(e.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" eg-crds"}),s.jsx(e.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" oci://docker.io/envoyproxy/gateway-crds-helm"}),s.jsx(e.span,{style:{"--shiki-light":"#24292EFF","--shiki-dark":"#B392F0"},children:" \\"})]}),`
`,s.jsxs(e.span,{className:"line",children:[s.jsx(e.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:"  --version"}),s.jsx(e.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#FFAB70"},children:' "$ENVOY_GATEWAY_VERSION"'}),s.jsx(e.span,{style:{"--shiki-light":"#24292EFF","--shiki-dark":"#B392F0"},children:" \\"})]}),`
`,s.jsxs(e.span,{className:"line",children:[s.jsx(e.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:"  --set"}),s.jsx(e.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" crds.gatewayAPI.enabled="}),s.jsx(e.span,{style:{"--shiki-light":"#1976D2","--shiki-dark":"#79B8FF"},children:"true"}),s.jsx(e.span,{style:{"--shiki-light":"#24292EFF","--shiki-dark":"#B392F0"},children:" \\"})]}),`
`,s.jsxs(e.span,{className:"line",children:[s.jsx(e.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:"  --set"}),s.jsx(e.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" crds.gatewayAPI.channel=experimental"}),s.jsx(e.span,{style:{"--shiki-light":"#24292EFF","--shiki-dark":"#B392F0"},children:" \\"})]}),`
`,s.jsxs(e.span,{className:"line",children:[s.jsx(e.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:"  --set"}),s.jsx(e.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" crds.envoyGateway.enabled="}),s.jsx(e.span,{style:{"--shiki-light":"#1976D2","--shiki-dark":"#79B8FF"},children:"true"}),s.jsx(e.span,{style:{"--shiki-light":"#24292EFF","--shiki-dark":"#B392F0"},children:" \\"})]}),`
`,s.jsxs(e.span,{className:"line",children:[s.jsx(e.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:"  |"}),s.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" kubectl"}),s.jsx(e.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" apply"}),s.jsx(e.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" --server-side"}),s.jsx(e.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" --force-conflicts"}),s.jsx(e.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" -f"}),s.jsx(e.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" -"})]}),`
`,s.jsx(e.span,{className:"line"}),`
`,s.jsxs(e.span,{className:"line",children:[s.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"helm"}),s.jsx(e.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" upgrade"}),s.jsx(e.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" --install"}),s.jsx(e.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" eg"}),s.jsx(e.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" oci://docker.io/envoyproxy/gateway-helm"}),s.jsx(e.span,{style:{"--shiki-light":"#24292EFF","--shiki-dark":"#B392F0"},children:" \\"})]}),`
`,s.jsxs(e.span,{className:"line",children:[s.jsx(e.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:"  --version"}),s.jsx(e.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#FFAB70"},children:' "$ENVOY_GATEWAY_VERSION"'}),s.jsx(e.span,{style:{"--shiki-light":"#24292EFF","--shiki-dark":"#B392F0"},children:" \\"})]}),`
`,s.jsxs(e.span,{className:"line",children:[s.jsx(e.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:"  --namespace"}),s.jsx(e.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" envoy-gateway-system"}),s.jsx(e.span,{style:{"--shiki-light":"#24292EFF","--shiki-dark":"#B392F0"},children:" \\"})]}),`
`,s.jsx(e.span,{className:"line",children:s.jsx(e.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:"  --create-namespace"})})]})})}),`
`,s.jsxs(e.p,{children:["Create the default ",s.jsx(e.code,{children:"GatewayClass"})," if it does not already exist. Save this manifest as ",s.jsx(e.code,{children:"gateway-class.yaml"}),":"]}),`
`,s.jsx(s.Fragment,{children:s.jsx(e.pre,{className:"shiki shiki-themes min-light min-dark",style:{"--shiki-light":"#24292eff","--shiki-dark":"#b392f0","--shiki-light-bg":"#ffffff","--shiki-dark-bg":"#1f1f1f"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:s.jsxs(e.code,{children:[s.jsxs(e.span,{className:"line",children:[s.jsx(e.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:"apiVersion"}),s.jsx(e.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:":"}),s.jsx(e.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#FFAB70"},children:" gateway.networking.k8s.io/v1"})]}),`
`,s.jsxs(e.span,{className:"line",children:[s.jsx(e.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:"kind"}),s.jsx(e.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:":"}),s.jsx(e.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#FFAB70"},children:" GatewayClass"})]}),`
`,s.jsxs(e.span,{className:"line",children:[s.jsx(e.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:"metadata"}),s.jsx(e.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:":"})]}),`
`,s.jsxs(e.span,{className:"line",children:[s.jsx(e.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:"  name"}),s.jsx(e.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:":"}),s.jsx(e.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#FFAB70"},children:" eg"})]}),`
`,s.jsxs(e.span,{className:"line",children:[s.jsx(e.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:"spec"}),s.jsx(e.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:":"})]}),`
`,s.jsxs(e.span,{className:"line",children:[s.jsx(e.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:"  controllerName"}),s.jsx(e.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:":"}),s.jsx(e.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#FFAB70"},children:" gateway.envoyproxy.io/gatewayclass-controller"})]})]})})}),`
`,s.jsx(s.Fragment,{children:s.jsx(e.pre,{className:"shiki shiki-themes min-light min-dark",style:{"--shiki-light":"#24292eff","--shiki-dark":"#b392f0","--shiki-light-bg":"#ffffff","--shiki-dark-bg":"#1f1f1f"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:s.jsxs(e.code,{children:[s.jsxs(e.span,{className:"line",children:[s.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"kubectl"}),s.jsx(e.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" apply"}),s.jsx(e.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" -f"}),s.jsx(e.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" gateway-class.yaml"})]}),`
`,s.jsxs(e.span,{className:"line",children:[s.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"kubectl"}),s.jsx(e.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" rollout"}),s.jsx(e.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" status"}),s.jsx(e.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" deployment/envoy-gateway"}),s.jsx(e.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" -n"}),s.jsx(e.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" envoy-gateway-system"})]})]})})}),`
`,s.jsxs(e.p,{children:["Install cert-manager separately before Lamassu. The current chart renders its self-signed issuer and CA certificate resources even when ",s.jsx(e.code,{children:"tls.type: external"})," makes the Gateway use an existing TLS Secret. Selecting external TLS therefore does not remove the cert-manager prerequisite."]}),`
`,s.jsx(e.h2,{id:"2-create-a-values-file",children:"2. Create a values file"}),`
`,s.jsxs(e.p,{children:["Start with the chart defaults and override the environment-specific values. This example assumes PostgreSQL, RabbitMQ and Keycloak are reachable through Kubernetes DNS, and exposes Keycloak at ",s.jsx(e.code,{children:"/auth"})," through the shared Lamassu Gateway:"]}),`
`,s.jsx(s.Fragment,{children:s.jsx(e.pre,{className:"shiki shiki-themes min-light min-dark",style:{"--shiki-light":"#24292eff","--shiki-dark":"#b392f0","--shiki-light-bg":"#ffffff","--shiki-dark-bg":"#1f1f1f"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:s.jsxs(e.code,{children:[s.jsxs(e.span,{className:"line",children:[s.jsx(e.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:"postgres"}),s.jsx(e.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:":"})]}),`
`,s.jsxs(e.span,{className:"line",children:[s.jsx(e.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:"  hostname"}),s.jsx(e.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:":"}),s.jsx(e.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#FFAB70"},children:" postgresql"})]}),`
`,s.jsxs(e.span,{className:"line",children:[s.jsx(e.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:"  port"}),s.jsx(e.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:":"}),s.jsx(e.span,{style:{"--shiki-light":"#1976D2","--shiki-dark":"#F8F8F8"},children:" 5432"})]}),`
`,s.jsxs(e.span,{className:"line",children:[s.jsx(e.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:"  username"}),s.jsx(e.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:":"}),s.jsx(e.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#FFAB70"},children:" lamassu"})]}),`
`,s.jsxs(e.span,{className:"line",children:[s.jsx(e.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:"  password"}),s.jsx(e.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:":"}),s.jsx(e.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#FFAB70"},children:" change-me"})]}),`
`,s.jsx(e.span,{className:"line"}),`
`,s.jsxs(e.span,{className:"line",children:[s.jsx(e.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:"amqp"}),s.jsx(e.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:":"})]}),`
`,s.jsxs(e.span,{className:"line",children:[s.jsx(e.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:"  hostname"}),s.jsx(e.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:":"}),s.jsx(e.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#FFAB70"},children:" rabbitmq"})]}),`
`,s.jsxs(e.span,{className:"line",children:[s.jsx(e.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:"  port"}),s.jsx(e.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:":"}),s.jsx(e.span,{style:{"--shiki-light":"#1976D2","--shiki-dark":"#F8F8F8"},children:" 5672"})]}),`
`,s.jsxs(e.span,{className:"line",children:[s.jsx(e.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:"  username"}),s.jsx(e.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:":"}),s.jsx(e.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#FFAB70"},children:" lamassu"})]}),`
`,s.jsxs(e.span,{className:"line",children:[s.jsx(e.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:"  password"}),s.jsx(e.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:":"}),s.jsx(e.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#FFAB70"},children:" change-me"})]}),`
`,s.jsxs(e.span,{className:"line",children:[s.jsx(e.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:"  tls"}),s.jsx(e.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:":"}),s.jsx(e.span,{style:{"--shiki-light":"#1976D2","--shiki-dark":"#79B8FF"},children:" false"})]}),`
`,s.jsx(e.span,{className:"line"}),`
`,s.jsxs(e.span,{className:"line",children:[s.jsx(e.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:"tls"}),s.jsx(e.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:":"})]}),`
`,s.jsxs(e.span,{className:"line",children:[s.jsx(e.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:"  type"}),s.jsx(e.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:":"}),s.jsx(e.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#FFAB70"},children:" certManager"})]}),`
`,s.jsxs(e.span,{className:"line",children:[s.jsx(e.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:"  certManagerOptions"}),s.jsx(e.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:":"})]}),`
`,s.jsxs(e.span,{className:"line",children:[s.jsx(e.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:"    clusterIssuer"}),s.jsx(e.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:":"}),s.jsx(e.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#FFAB70"},children:" production-issuer"})]}),`
`,s.jsxs(e.span,{className:"line",children:[s.jsx(e.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:"    certSpec"}),s.jsx(e.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:":"})]}),`
`,s.jsxs(e.span,{className:"line",children:[s.jsx(e.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:"      commonName"}),s.jsx(e.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:":"}),s.jsx(e.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#FFAB70"},children:" pki.example.com"})]}),`
`,s.jsxs(e.span,{className:"line",children:[s.jsx(e.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:"      hostnames"}),s.jsx(e.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:":"})]}),`
`,s.jsxs(e.span,{className:"line",children:[s.jsx(e.span,{style:{"--shiki-light":"#24292EFF","--shiki-dark":"#B392F0"},children:"        - "}),s.jsx(e.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#FFAB70"},children:"pki.example.com"})]}),`
`,s.jsx(e.span,{className:"line"}),`
`,s.jsxs(e.span,{className:"line",children:[s.jsx(e.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:"gateway"}),s.jsx(e.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:":"})]}),`
`,s.jsxs(e.span,{className:"line",children:[s.jsx(e.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:"  className"}),s.jsx(e.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:":"}),s.jsx(e.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#FFAB70"},children:" eg"})]}),`
`,s.jsxs(e.span,{className:"line",children:[s.jsx(e.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:"  ports"}),s.jsx(e.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:":"})]}),`
`,s.jsxs(e.span,{className:"line",children:[s.jsx(e.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:"    http"}),s.jsx(e.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:":"}),s.jsx(e.span,{style:{"--shiki-light":"#1976D2","--shiki-dark":"#F8F8F8"},children:" 80"})]}),`
`,s.jsxs(e.span,{className:"line",children:[s.jsx(e.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:"    https"}),s.jsx(e.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:":"}),s.jsx(e.span,{style:{"--shiki-light":"#1976D2","--shiki-dark":"#F8F8F8"},children:" 443"})]}),`
`,s.jsxs(e.span,{className:"line",children:[s.jsx(e.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:"  extraRouting"}),s.jsx(e.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:":"})]}),`
`,s.jsxs(e.span,{className:"line",children:[s.jsx(e.span,{style:{"--shiki-light":"#24292EFF","--shiki-dark":"#B392F0"},children:"    - "}),s.jsx(e.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:"name"}),s.jsx(e.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:":"}),s.jsx(e.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#FFAB70"},children:" auth"})]}),`
`,s.jsxs(e.span,{className:"line",children:[s.jsx(e.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:"      path"}),s.jsx(e.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:":"}),s.jsx(e.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#FFAB70"},children:" /auth"})]}),`
`,s.jsxs(e.span,{className:"line",children:[s.jsx(e.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:"      target"}),s.jsx(e.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:":"})]}),`
`,s.jsxs(e.span,{className:"line",children:[s.jsx(e.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:"        host"}),s.jsx(e.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:":"}),s.jsx(e.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#FFAB70"},children:" auth-keycloak"})]}),`
`,s.jsxs(e.span,{className:"line",children:[s.jsx(e.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:"        port"}),s.jsx(e.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:":"}),s.jsx(e.span,{style:{"--shiki-light":"#1976D2","--shiki-dark":"#F8F8F8"},children:" 80"})]}),`
`,s.jsx(e.span,{className:"line"}),`
`,s.jsxs(e.span,{className:"line",children:[s.jsx(e.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:"auth"}),s.jsx(e.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:":"})]}),`
`,s.jsxs(e.span,{className:"line",children:[s.jsx(e.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:"  oidc"}),s.jsx(e.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:":"})]}),`
`,s.jsxs(e.span,{className:"line",children:[s.jsx(e.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:"    frontend"}),s.jsx(e.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:":"})]}),`
`,s.jsxs(e.span,{className:"line",children:[s.jsx(e.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:"      clientId"}),s.jsx(e.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:":"}),s.jsx(e.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#FFAB70"},children:" frontend"})]}),`
`,s.jsxs(e.span,{className:"line",children:[s.jsx(e.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:"      authority"}),s.jsx(e.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:":"}),s.jsx(e.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#FFAB70"},children:" https://pki.example.com/auth/realms/lamassu"})]}),`
`,s.jsxs(e.span,{className:"line",children:[s.jsx(e.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:"    apiGateway"}),s.jsx(e.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:":"})]}),`
`,s.jsxs(e.span,{className:"line",children:[s.jsx(e.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:"      jwks"}),s.jsx(e.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:":"})]}),`
`,s.jsxs(e.span,{className:"line",children:[s.jsx(e.span,{style:{"--shiki-light":"#24292EFF","--shiki-dark":"#B392F0"},children:"        - "}),s.jsx(e.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:"name"}),s.jsx(e.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:":"}),s.jsx(e.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#FFAB70"},children:" oidc-authn"})]}),`
`,s.jsxs(e.span,{className:"line",children:[s.jsx(e.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:"          uri"}),s.jsx(e.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:":"}),s.jsx(e.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#FFAB70"},children:" http://auth-keycloak.lamassu.svc.cluster.local/auth/realms/lamassu/protocol/openid-connect/certs"})]}),`
`,s.jsx(e.span,{className:"line"}),`
`,s.jsxs(e.span,{className:"line",children:[s.jsx(e.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:"services"}),s.jsx(e.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:":"})]}),`
`,s.jsxs(e.span,{className:"line",children:[s.jsx(e.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:"  ca"}),s.jsx(e.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:":"})]}),`
`,s.jsxs(e.span,{className:"line",children:[s.jsx(e.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:"    domains"}),s.jsx(e.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:":"})]}),`
`,s.jsxs(e.span,{className:"line",children:[s.jsx(e.span,{style:{"--shiki-light":"#24292EFF","--shiki-dark":"#B392F0"},children:"      - "}),s.jsx(e.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#FFAB70"},children:"pki.example.com"})]}),`
`,s.jsxs(e.span,{className:"line",children:[s.jsx(e.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:"  authz"}),s.jsx(e.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:":"})]}),`
`,s.jsxs(e.span,{className:"line",children:[s.jsx(e.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:"    jwkUrl"}),s.jsx(e.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:":"}),s.jsx(e.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#FFAB70"},children:" http://auth-keycloak.lamassu.svc.cluster.local/auth/realms/lamassu/protocol/openid-connect/certs"})]}),`
`,s.jsxs(e.span,{className:"line",children:[s.jsx(e.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:"    bootstrap"}),s.jsx(e.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:":"})]}),`
`,s.jsxs(e.span,{className:"line",children:[s.jsx(e.span,{style:{"--shiki-light":"#24292EFF","--shiki-dark":"#B392F0"},children:"      - "}),s.jsx(e.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:"principal_id"}),s.jsx(e.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:":"}),s.jsx(e.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#FFAB70"},children:' "oidc:pki-admin"'})]}),`
`,s.jsxs(e.span,{className:"line",children:[s.jsx(e.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:"        principal_name"}),s.jsx(e.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:":"}),s.jsx(e.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#FFAB70"},children:' "PKI Admin"'})]}),`
`,s.jsxs(e.span,{className:"line",children:[s.jsx(e.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:"        principal_type"}),s.jsx(e.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:":"}),s.jsx(e.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#FFAB70"},children:' "oidc"'})]}),`
`,s.jsxs(e.span,{className:"line",children:[s.jsx(e.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:"        policy_ids"}),s.jsx(e.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:":"})]}),`
`,s.jsxs(e.span,{className:"line",children:[s.jsx(e.span,{style:{"--shiki-light":"#24292EFF","--shiki-dark":"#B392F0"},children:"          - "}),s.jsx(e.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#FFAB70"},children:'"lamassu.a6811b60-5f89-4ce7-badb-78ea234794d3"'})]}),`
`,s.jsxs(e.span,{className:"line",children:[s.jsx(e.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:"        auth_config"}),s.jsx(e.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:":"})]}),`
`,s.jsxs(e.span,{className:"line",children:[s.jsx(e.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:"          claims"}),s.jsx(e.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:":"})]}),`
`,s.jsxs(e.span,{className:"line",children:[s.jsx(e.span,{style:{"--shiki-light":"#24292EFF","--shiki-dark":"#B392F0"},children:"            - "}),s.jsx(e.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:"claim"}),s.jsx(e.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:":"}),s.jsx(e.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#FFAB70"},children:" realm_access.roles"})]}),`
`,s.jsxs(e.span,{className:"line",children:[s.jsx(e.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:"              operator"}),s.jsx(e.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:":"}),s.jsx(e.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#FFAB70"},children:" contains"})]}),`
`,s.jsxs(e.span,{className:"line",children:[s.jsx(e.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:"              value"}),s.jsx(e.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:":"}),s.jsx(e.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#FFAB70"},children:" pki-admin"})]})]})})}),`
`,s.jsxs(e.p,{children:["Do not add ",s.jsx(e.code,{children:"gateway.addresses"})," by default. Leave address assignment to the load-balancer implementation unless your network design requires a specific Kubernetes-side VIP. The public IP of an upstream NAT gateway or reverse proxy does not belong in this value."]}),`
`,s.jsxs(e.p,{children:["If Keycloak is external and already has its own reachable URL, point the OIDC settings at it and omit the ",s.jsx(e.code,{children:"/auth"})," entry from ",s.jsx(e.code,{children:"gateway.extraRouting"}),"."]}),`
`,s.jsx(e.h3,{id:"tls-with-an-existing-secret",children:"TLS with an existing Secret"}),`
`,s.jsxs(e.p,{children:["Create a Secret containing ",s.jsx(e.code,{children:"tls.crt"})," and ",s.jsx(e.code,{children:"tls.key"}),", then reference it:"]}),`
`,s.jsx(s.Fragment,{children:s.jsx(e.pre,{className:"shiki shiki-themes min-light min-dark",style:{"--shiki-light":"#24292eff","--shiki-dark":"#b392f0","--shiki-light-bg":"#ffffff","--shiki-dark-bg":"#1f1f1f"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:s.jsxs(e.code,{children:[s.jsxs(e.span,{className:"line",children:[s.jsx(e.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:"tls"}),s.jsx(e.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:":"})]}),`
`,s.jsxs(e.span,{className:"line",children:[s.jsx(e.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:"  type"}),s.jsx(e.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:":"}),s.jsx(e.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#FFAB70"},children:" external"})]}),`
`,s.jsxs(e.span,{className:"line",children:[s.jsx(e.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:"  externalOptions"}),s.jsx(e.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:":"})]}),`
`,s.jsxs(e.span,{className:"line",children:[s.jsx(e.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:"    secretName"}),s.jsx(e.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:":"}),s.jsx(e.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#FFAB70"},children:" lamassu-downstream-tls"})]})]})})}),`
`,s.jsx(e.h3,{id:"provision-the-first-administrator",children:"Provision the first administrator"}),`
`,s.jsxs(e.p,{children:["There is no implicit superuser. Create the role or group expected by ",s.jsx(e.code,{children:"services.authz.bootstrap"})," in the OIDC provider and assign it to at least one administrator before exposing Lamassu."]}),`
`,s.jsx(e.p,{children:"The pre-install and pre-upgrade job applies the bootstrap idempotently: existing principals are preserved and missing grants are added."}),`
`,s.jsx(a,{type:"warn",title:"Validate access before exposing the platform",children:s.jsx(e.p,{children:"Test both an authorized identity and a denied identity. If no token matches an active bootstrap principal, nobody can administer the PKI."})}),`
`,s.jsxs(e.p,{children:["See ",s.jsx(e.a,{href:"/docs/platform/pki/access-control",children:"Access control"})," for the principal and policy model."]}),`
`,s.jsx(e.h2,{id:"3-install-lamassu",children:"3. Install Lamassu"}),`
`,s.jsx(s.Fragment,{children:s.jsx(e.pre,{className:"shiki shiki-themes min-light min-dark",style:{"--shiki-light":"#24292eff","--shiki-dark":"#b392f0","--shiki-light-bg":"#ffffff","--shiki-dark-bg":"#1f1f1f"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:s.jsxs(e.code,{children:[s.jsxs(e.span,{className:"line",children:[s.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"helm"}),s.jsx(e.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" repo"}),s.jsx(e.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" add"}),s.jsx(e.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" lamassu"}),s.jsx(e.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" https://lamassuiot.github.io/lamassu-helm"})]}),`
`,s.jsxs(e.span,{className:"line",children:[s.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"helm"}),s.jsx(e.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" repo"}),s.jsx(e.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" update"})]}),`
`,s.jsx(e.span,{className:"line"}),`
`,s.jsxs(e.span,{className:"line",children:[s.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"helm"}),s.jsx(e.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" upgrade"}),s.jsx(e.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" --install"}),s.jsx(e.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" lamassu"}),s.jsx(e.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" lamassu/lamassu"}),s.jsx(e.span,{style:{"--shiki-light":"#24292EFF","--shiki-dark":"#B392F0"},children:" \\"})]}),`
`,s.jsxs(e.span,{className:"line",children:[s.jsx(e.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:"  --namespace"}),s.jsx(e.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" lamassu"}),s.jsx(e.span,{style:{"--shiki-light":"#24292EFF","--shiki-dark":"#B392F0"},children:" \\"})]}),`
`,s.jsxs(e.span,{className:"line",children:[s.jsx(e.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:"  --create-namespace"}),s.jsx(e.span,{style:{"--shiki-light":"#24292EFF","--shiki-dark":"#B392F0"},children:" \\"})]}),`
`,s.jsxs(e.span,{className:"line",children:[s.jsx(e.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:"  --values"}),s.jsx(e.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" values.yaml"}),s.jsx(e.span,{style:{"--shiki-light":"#24292EFF","--shiki-dark":"#B392F0"},children:" \\"})]}),`
`,s.jsx(e.span,{className:"line",children:s.jsx(e.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:"  --wait"})})]})})}),`
`,s.jsx(e.p,{children:"To install a local checkout instead:"}),`
`,s.jsx(s.Fragment,{children:s.jsx(e.pre,{className:"shiki shiki-themes min-light min-dark",style:{"--shiki-light":"#24292eff","--shiki-dark":"#b392f0","--shiki-light-bg":"#ffffff","--shiki-dark-bg":"#1f1f1f"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:s.jsxs(e.code,{children:[s.jsxs(e.span,{className:"line",children:[s.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"helm"}),s.jsx(e.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" upgrade"}),s.jsx(e.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" --install"}),s.jsx(e.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" lamassu"}),s.jsx(e.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" ./charts/lamassu"}),s.jsx(e.span,{style:{"--shiki-light":"#24292EFF","--shiki-dark":"#B392F0"},children:" \\"})]}),`
`,s.jsxs(e.span,{className:"line",children:[s.jsx(e.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:"  --namespace"}),s.jsx(e.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" lamassu"}),s.jsx(e.span,{style:{"--shiki-light":"#24292EFF","--shiki-dark":"#B392F0"},children:" \\"})]}),`
`,s.jsxs(e.span,{className:"line",children:[s.jsx(e.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:"  --create-namespace"}),s.jsx(e.span,{style:{"--shiki-light":"#24292EFF","--shiki-dark":"#B392F0"},children:" \\"})]}),`
`,s.jsxs(e.span,{className:"line",children:[s.jsx(e.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:"  --values"}),s.jsx(e.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" values.yaml"}),s.jsx(e.span,{style:{"--shiki-light":"#24292EFF","--shiki-dark":"#B392F0"},children:" \\"})]}),`
`,s.jsx(e.span,{className:"line",children:s.jsx(e.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:"  --wait"})})]})})}),`
`,s.jsx(e.h2,{id:"4-verify-the-deployment",children:"4. Verify the deployment"}),`
`,s.jsx(s.Fragment,{children:s.jsx(e.pre,{className:"shiki shiki-themes min-light min-dark",style:{"--shiki-light":"#24292eff","--shiki-dark":"#b392f0","--shiki-light-bg":"#ffffff","--shiki-dark-bg":"#1f1f1f"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:s.jsxs(e.code,{children:[s.jsxs(e.span,{className:"line",children:[s.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"kubectl"}),s.jsx(e.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" get"}),s.jsx(e.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" pods"}),s.jsx(e.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" -n"}),s.jsx(e.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" lamassu"})]}),`
`,s.jsxs(e.span,{className:"line",children:[s.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"kubectl"}),s.jsx(e.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" get"}),s.jsx(e.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" gateway,httproute"}),s.jsx(e.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" -n"}),s.jsx(e.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" lamassu"})]}),`
`,s.jsxs(e.span,{className:"line",children:[s.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"kubectl"}),s.jsx(e.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" get"}),s.jsx(e.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" service"}),s.jsx(e.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" -A"})]}),`
`,s.jsxs(e.span,{className:"line",children:[s.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"helm"}),s.jsx(e.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" test"}),s.jsx(e.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" lamassu"}),s.jsx(e.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" -n"}),s.jsx(e.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" lamassu"}),s.jsx(e.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" --logs"})]})]})})}),`
`,s.jsxs(e.p,{children:["The Gateway should report ",s.jsx(e.code,{children:"PROGRAMMED=True"}),". If it is programmed but has no usable address, continue with ",s.jsx(e.a,{href:"/docs/deployment/self-hosted/networking",children:"Expose the Gateway"}),"."]}),`
`,s.jsx(e.p,{children:"The Helm test checks the CA, DMS Manager, Device Manager and VA health endpoints and verifies the UI response."}),`
`,s.jsx(e.h2,{id:"production-decisions",children:"Production decisions"}),`
`,s.jsx(e.p,{children:"Before going live, review:"}),`
`,s.jsxs(e.ul,{children:[`
`,s.jsx(e.li,{children:"backup and recovery for PostgreSQL and persistent volumes"}),`
`,s.jsx(e.li,{children:"a production KMS engine; the default filesystem engine is not an HA design"}),`
`,s.jsx(e.li,{children:"shared VA storage before increasing VA replicas"}),`
`,s.jsx(e.li,{children:"managed OIDC roles and removal of evaluation credentials"}),`
`,s.jsx(e.li,{children:"a trusted TLS issuer or externally managed certificate"}),`
`,s.jsx(e.li,{children:"resource requests, replicas, autoscaling, disruption budgets and placement"}),`
`,s.jsx(e.li,{children:"SMTP, observability and alert delivery"}),`
`,s.jsxs(e.li,{children:["the migration notes in ",s.jsx(e.code,{children:"charts/lamassu/CHANGELOG/"})," before every upgrade"]}),`
`]}),`
`,s.jsxs(e.p,{children:["The complete values reference is maintained in ",s.jsx(e.code,{children:"charts/lamassu/VALUES.md"})," in the Helm repository."]})]})}function d(i={}){const{wrapper:e}=i.components||{};return e?s.jsx(e,{...i,children:s.jsx(n,{...i})}):n(i)}function c(i,e){throw new Error("Expected component `"+i+"` to be defined: you likely forgot to import, pass, or provide it.")}const o=Object.freeze(Object.defineProperty({__proto__:null,_markdown:t,default:d,frontmatter:l,structuredData:h,toc:r},Symbol.toStringTag,{value:"Module"}));export{o as _};

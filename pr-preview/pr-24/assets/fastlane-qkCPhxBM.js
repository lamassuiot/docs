import{j as e}from"./index-prc0XQdj.js";let i=`

Deploy with Fastlane [#deploy-with-fastlane]

Fastlane is the automated path for evaluations, demos, CI and small lab clusters. It installs PostgreSQL, Keycloak, RabbitMQ, Envoy Gateway and Lamassu, then configures them to work together.

For production, use [Helm](/docs/deployment/self-hosted/helm) so database, identity, credentials, certificates, storage and upgrades remain explicit.

What Fastlane adds [#what-fastlane-adds]

Fastlane closes some of the gaps intentionally left by the application chart:

| Fastlane installs or configures                                                              | You still provide                                                                  |
| -------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| PostgreSQL, RabbitMQ and Keycloak instances for evaluation                                   | The Kubernetes cluster, nodes and persistent storage                               |
| Envoy Gateway 1.8 and the \`eg\` \`GatewayClass\`                                                | cert-manager, external network reachability, DNS and firewall/NAT rules            |
| A self-signed Lamassu certificate flow, generated dependency credentials and an initial user | Client trust for the self-signed CA, or a trusted certificate passed to the script |
| Optional observability and lab HSM components                                                | Production monitoring retention, backups, HA and a production HSM/key service      |

Fastlane does not turn the resulting stack into a production service: it does not create the cluster, public DNS, firewall rules, backups, high availability or a trusted public certificate.

Before you begin [#before-you-begin]

You need:

* an existing Kubernetes cluster
* \`kubectl\` and Helm, or the MicroK8s CLI
* \`yq\`
* cert-manager
* \`jq\` only when using \`--sample-data\`
* free external ports 80 and 443 on a single-node K3s host

Fastlane detects MicroK8s, K3s, kind or a standard kubeconfig. Use \`--context\` when the intended cluster is not the current context.

<Callout type="warn" title="Know which cluster is selected">
  Fastlane installs several components and creates credentials. Check \`kubectl config current-context\` or pass \`--context\` before running it.
</Callout>

Quick start [#quick-start]

Run the script from a clone of the Helm repository:

\`\`\`bash
git clone https://github.com/lamassuiot/lamassu-helm.git
cd lamassu-helm

./scripts/lamassu-fast-lane.sh \\
  --non-interactive \\
  --namespace lamassu-dev \\
  --domain pki.example.com \\
  --local-chart-path ./charts/lamassu
\`\`\`

Create a DNS record for the chosen domain before testing from another machine. For a small VM, point it at the VM or load-balancer address that actually receives ports 80 and 443.

Gateway address selection [#gateway-address-selection]

By default, Fastlane runs \`hostname -I\` and writes the returned addresses to \`gateway.addresses\` and to the self-signed certificate's IP SANs.

On a single-homed lab VM this can select the expected node address. On hosts with Docker, VPN, WireGuard or several interfaces it can also select addresses clients cannot reach. Override the result explicitly:

\`\`\`bash
./scripts/lamassu-fast-lane.sh \\
  --non-interactive \\
  --domain pki.example.com \\
  --gateway-ip 192.168.1.50
\`\`\`

The value must be an address handled on the Kubernetes side of the traffic path. If a public EC2 address forwards through WireGuard to the cluster, pass the reachable cluster/VM address, not the EC2 public address.

See [Expose the Gateway](/docs/deployment/self-hosted/networking) for K3s port conflicts, VIPs, external NAT and multi-Gateway designs.

Command-line options [#command-line-options]

| Option                     | Default            | Purpose                                                                      |
| -------------------------- | ------------------ | ---------------------------------------------------------------------------- |
| \`-h\`, \`--help\`             | —                  | Show help                                                                    |
| \`-c\`, \`--context\`          | current context    | Select the kubeconfig context for kubectl and Helm                           |
| \`-n\`, \`--non-interactive\`  | false              | Skip prompts and generate dependency credentials                             |
| \`-ns\`, \`--namespace\`       | \`lamassu-dev\`      | Namespace for the installation                                               |
| \`-d\`, \`--domain\`           | \`dev.lamassu.io\`   | Domain used by the UI, OIDC and certificate                                  |
| \`-v\`, \`--version\`          | latest             | Lamassu chart version                                                        |
| \`--https-port\`             | \`443\`              | Gateway HTTPS listener port                                                  |
| \`--http-port\`              | \`80\`               | Gateway HTTP listener port                                                   |
| \`--tls-crt\`                | —                  | PEM certificate for downstream TLS                                           |
| \`--tls-key\`                | —                  | PEM private key for downstream TLS                                           |
| \`-l\`, \`--local-chart-path\` | repository chart   | Use an unpacked local Lamassu chart                                          |
| \`-ip\`, \`--gateway-ip\`      | auto-detected      | Override the address written to \`gateway.addresses\`                          |
| \`--otel\`                   | false              | Install Victoria Logs, VictoriaTraces, Jaeger and an OpenTelemetry Collector |
| \`--sample-data\`            | false              | Create sample CAs, profiles, certificates, DMS data and devices              |
| \`--with-hsm\`               | false              | Install lab HSM components and configure KMS for PKCS#11                     |
| \`--softhsm-chart-path\`     | \`./charts/softhsm\` | Use a different local SoftHSM chart                                          |

Fastlane does not provide an offline mode. Use the manual Helm workflow and a prepared registry/chart mirror for disconnected environments.

What the script configures [#what-the-script-configures]

Fastlane:

1. validates local tools and the selected cluster
2. installs or upgrades Envoy Gateway 1.8 and creates the \`eg\` \`GatewayClass\`
3. creates the namespace
4. installs PostgreSQL and creates the required databases
5. installs Keycloak and creates the \`lamassu\` realm, frontend client, admin role and initial user
6. installs RabbitMQ
7. optionally installs observability and lab HSM components
8. generates \`lamassu.yaml\` and installs the Lamassu chart
9. optionally loads sample data

The generated configuration exposes Keycloak at \`/auth\` through the same Gateway and bootstraps the initial \`lamassu\` user as a Lamassu super administrator.

TLS behavior [#tls-behavior]

With both \`--tls-crt\` and \`--tls-key\`, Fastlane creates the \`downstream-provided-crt\` Secret and configures \`tls.type: external\`.

Without them, it configures cert-manager with a self-signed issuer. This is suitable for a lab but will not be trusted by clients until you distribute the CA. Use [Helm](/docs/deployment/self-hosted/helm) when you need a corporate Issuer, public ACME issuer or an existing Secret managed by another system.

Credentials and generated files [#credentials-and-generated-files]

Non-interactive mode generates random PostgreSQL, RabbitMQ and Keycloak administrator passwords. The initial Lamassu login is \`lamassu\` / \`lamassu\` and requires a password change on first use.

Fastlane writes \`lamassu.yaml\` in the current directory and injects credentials into it.

<Callout type="warn" title="Fastlane is a bootstrap tool">
  Protect the generated values file, record the generated credentials in an appropriate secret store and do not reuse the evaluation identity setup in production.
</Callout>

Verify the installation [#verify-the-installation]

\`\`\`bash
kubectl get pods -n lamassu-dev
kubectl get gateway,httproute -n lamassu-dev
kubectl get service -A
helm test lamassu -n lamassu-dev --logs
\`\`\`

Then open \`https://pki.example.com\` and sign in with the initial user. If the Gateway is programmed but the URL is unreachable, follow the checks in [Expose the Gateway](/docs/deployment/self-hosted/networking).
`,r={title:"Fastlane",description:"Bootstrap a complete Lamassu evaluation or lab environment on an existing Kubernetes cluster."},l={contents:[{heading:"deploy-with-fastlane",content:"Fastlane is the automated path for evaluations, demos, CI and small lab clusters. It installs PostgreSQL, Keycloak, RabbitMQ, Envoy Gateway and Lamassu, then configures them to work together."},{heading:"deploy-with-fastlane",content:"For production, use Helm so database, identity, credentials, certificates, storage and upgrades remain explicit."},{heading:"what-fastlane-adds",content:"Fastlane closes some of the gaps intentionally left by the application chart:"},{heading:"what-fastlane-adds",content:"Fastlane installs or configures"},{heading:"what-fastlane-adds",content:"You still provide"},{heading:"what-fastlane-adds",content:"PostgreSQL, RabbitMQ and Keycloak instances for evaluation"},{heading:"what-fastlane-adds",content:"The Kubernetes cluster, nodes and persistent storage"},{heading:"what-fastlane-adds",content:"Envoy Gateway 1.8 and the `eg` `GatewayClass`"},{heading:"what-fastlane-adds",content:"cert-manager, external network reachability, DNS and firewall/NAT rules"},{heading:"what-fastlane-adds",content:"A self-signed Lamassu certificate flow, generated dependency credentials and an initial user"},{heading:"what-fastlane-adds",content:"Client trust for the self-signed CA, or a trusted certificate passed to the script"},{heading:"what-fastlane-adds",content:"Optional observability and lab HSM components"},{heading:"what-fastlane-adds",content:"Production monitoring retention, backups, HA and a production HSM/key service"},{heading:"what-fastlane-adds",content:"Fastlane does not turn the resulting stack into a production service: it does not create the cluster, public DNS, firewall rules, backups, high availability or a trusted public certificate."},{heading:"before-you-begin",content:"You need:"},{heading:"before-you-begin",content:"an existing Kubernetes cluster"},{heading:"before-you-begin",content:"`kubectl` and Helm, or the MicroK8s CLI"},{heading:"before-you-begin",content:"`yq`"},{heading:"before-you-begin",content:"cert-manager"},{heading:"before-you-begin",content:"`jq` only when using `--sample-data`"},{heading:"before-you-begin",content:"free external ports 80 and 443 on a single-node K3s host"},{heading:"before-you-begin",content:"Fastlane detects MicroK8s, K3s, kind or a standard kubeconfig. Use `--context` when the intended cluster is not the current context."},{heading:"before-you-begin",content:"Fastlane installs several components and creates credentials. Check `kubectl config current-context` or pass `--context` before running it."},{heading:"quick-start",content:"Run the script from a clone of the Helm repository:"},{heading:"quick-start",content:"Create a DNS record for the chosen domain before testing from another machine. For a small VM, point it at the VM or load-balancer address that actually receives ports 80 and 443."},{heading:"gateway-address-selection",content:"By default, Fastlane runs `hostname -I` and writes the returned addresses to `gateway.addresses` and to the self-signed certificate's IP SANs."},{heading:"gateway-address-selection",content:"On a single-homed lab VM this can select the expected node address. On hosts with Docker, VPN, WireGuard or several interfaces it can also select addresses clients cannot reach. Override the result explicitly:"},{heading:"gateway-address-selection",content:"The value must be an address handled on the Kubernetes side of the traffic path. If a public EC2 address forwards through WireGuard to the cluster, pass the reachable cluster/VM address, not the EC2 public address."},{heading:"gateway-address-selection",content:"See Expose the Gateway for K3s port conflicts, VIPs, external NAT and multi-Gateway designs."},{heading:"command-line-options",content:"Option"},{heading:"command-line-options",content:"Default"},{heading:"command-line-options",content:"Purpose"},{heading:"command-line-options",content:"`-h`, `--help`"},{heading:"command-line-options",content:"—"},{heading:"command-line-options",content:"Show help"},{heading:"command-line-options",content:"`-c`, `--context`"},{heading:"command-line-options",content:"current context"},{heading:"command-line-options",content:"Select the kubeconfig context for kubectl and Helm"},{heading:"command-line-options",content:"`-n`, `--non-interactive`"},{heading:"command-line-options",content:"false"},{heading:"command-line-options",content:"Skip prompts and generate dependency credentials"},{heading:"command-line-options",content:"`-ns`, `--namespace`"},{heading:"command-line-options",content:"`lamassu-dev`"},{heading:"command-line-options",content:"Namespace for the installation"},{heading:"command-line-options",content:"`-d`, `--domain`"},{heading:"command-line-options",content:"`dev.lamassu.io`"},{heading:"command-line-options",content:"Domain used by the UI, OIDC and certificate"},{heading:"command-line-options",content:"`-v`, `--version`"},{heading:"command-line-options",content:"latest"},{heading:"command-line-options",content:"Lamassu chart version"},{heading:"command-line-options",content:"`--https-port`"},{heading:"command-line-options",content:"`443`"},{heading:"command-line-options",content:"Gateway HTTPS listener port"},{heading:"command-line-options",content:"`--http-port`"},{heading:"command-line-options",content:"`80`"},{heading:"command-line-options",content:"Gateway HTTP listener port"},{heading:"command-line-options",content:"`--tls-crt`"},{heading:"command-line-options",content:"—"},{heading:"command-line-options",content:"PEM certificate for downstream TLS"},{heading:"command-line-options",content:"`--tls-key`"},{heading:"command-line-options",content:"—"},{heading:"command-line-options",content:"PEM private key for downstream TLS"},{heading:"command-line-options",content:"`-l`, `--local-chart-path`"},{heading:"command-line-options",content:"repository chart"},{heading:"command-line-options",content:"Use an unpacked local Lamassu chart"},{heading:"command-line-options",content:"`-ip`, `--gateway-ip`"},{heading:"command-line-options",content:"auto-detected"},{heading:"command-line-options",content:"Override the address written to `gateway.addresses`"},{heading:"command-line-options",content:"`--otel`"},{heading:"command-line-options",content:"false"},{heading:"command-line-options",content:"Install Victoria Logs, VictoriaTraces, Jaeger and an OpenTelemetry Collector"},{heading:"command-line-options",content:"`--sample-data`"},{heading:"command-line-options",content:"false"},{heading:"command-line-options",content:"Create sample CAs, profiles, certificates, DMS data and devices"},{heading:"command-line-options",content:"`--with-hsm`"},{heading:"command-line-options",content:"false"},{heading:"command-line-options",content:"Install lab HSM components and configure KMS for PKCS#11"},{heading:"command-line-options",content:"`--softhsm-chart-path`"},{heading:"command-line-options",content:"`./charts/softhsm`"},{heading:"command-line-options",content:"Use a different local SoftHSM chart"},{heading:"command-line-options",content:"Fastlane does not provide an offline mode. Use the manual Helm workflow and a prepared registry/chart mirror for disconnected environments."},{heading:"what-the-script-configures",content:"Fastlane:"},{heading:"what-the-script-configures",content:"validates local tools and the selected cluster"},{heading:"what-the-script-configures",content:"installs or upgrades Envoy Gateway 1.8 and creates the `eg` `GatewayClass`"},{heading:"what-the-script-configures",content:"creates the namespace"},{heading:"what-the-script-configures",content:"installs PostgreSQL and creates the required databases"},{heading:"what-the-script-configures",content:"installs Keycloak and creates the `lamassu` realm, frontend client, admin role and initial user"},{heading:"what-the-script-configures",content:"installs RabbitMQ"},{heading:"what-the-script-configures",content:"optionally installs observability and lab HSM components"},{heading:"what-the-script-configures",content:"generates `lamassu.yaml` and installs the Lamassu chart"},{heading:"what-the-script-configures",content:"optionally loads sample data"},{heading:"what-the-script-configures",content:"The generated configuration exposes Keycloak at `/auth` through the same Gateway and bootstraps the initial `lamassu` user as a Lamassu super administrator."},{heading:"tls-behavior",content:"With both `--tls-crt` and `--tls-key`, Fastlane creates the `downstream-provided-crt` Secret and configures `tls.type: external`."},{heading:"tls-behavior",content:"Without them, it configures cert-manager with a self-signed issuer. This is suitable for a lab but will not be trusted by clients until you distribute the CA. Use Helm when you need a corporate Issuer, public ACME issuer or an existing Secret managed by another system."},{heading:"credentials-and-generated-files",content:"Non-interactive mode generates random PostgreSQL, RabbitMQ and Keycloak administrator passwords. The initial Lamassu login is `lamassu` / `lamassu` and requires a password change on first use."},{heading:"credentials-and-generated-files",content:"Fastlane writes `lamassu.yaml` in the current directory and injects credentials into it."},{heading:"credentials-and-generated-files",content:"Protect the generated values file, record the generated credentials in an appropriate secret store and do not reuse the evaluation identity setup in production."},{heading:"verify-the-installation",content:"Then open `https://pki.example.com` and sign in with the initial user. If the Gateway is programmed but the URL is unreachable, follow the checks in Expose the Gateway."}],headings:[{id:"deploy-with-fastlane",content:"Deploy with Fastlane"},{id:"what-fastlane-adds",content:"What Fastlane adds"},{id:"before-you-begin",content:"Before you begin"},{id:"quick-start",content:"Quick start"},{id:"gateway-address-selection",content:"Gateway address selection"},{id:"command-line-options",content:"Command-line options"},{id:"what-the-script-configures",content:"What the script configures"},{id:"tls-behavior",content:"TLS behavior"},{id:"credentials-and-generated-files",content:"Credentials and generated files"},{id:"verify-the-installation",content:"Verify the installation"}]};const d=[{depth:1,url:"#deploy-with-fastlane",title:e.jsx(e.Fragment,{children:"Deploy with Fastlane"})},{depth:2,url:"#what-fastlane-adds",title:e.jsx(e.Fragment,{children:"What Fastlane adds"})},{depth:2,url:"#before-you-begin",title:e.jsx(e.Fragment,{children:"Before you begin"})},{depth:2,url:"#quick-start",title:e.jsx(e.Fragment,{children:"Quick start"})},{depth:2,url:"#gateway-address-selection",title:e.jsx(e.Fragment,{children:"Gateway address selection"})},{depth:2,url:"#command-line-options",title:e.jsx(e.Fragment,{children:"Command-line options"})},{depth:2,url:"#what-the-script-configures",title:e.jsx(e.Fragment,{children:"What the script configures"})},{depth:2,url:"#tls-behavior",title:e.jsx(e.Fragment,{children:"TLS behavior"})},{depth:2,url:"#credentials-and-generated-files",title:e.jsx(e.Fragment,{children:"Credentials and generated files"})},{depth:2,url:"#verify-the-installation",title:e.jsx(e.Fragment,{children:"Verify the installation"})}];function a(n){const t={a:"a",code:"code",h1:"h1",h2:"h2",li:"li",ol:"ol",p:"p",pre:"pre",span:"span",table:"table",tbody:"tbody",td:"td",th:"th",thead:"thead",tr:"tr",ul:"ul",...n.components},{Callout:s}=t;return s||c("Callout"),e.jsxs(e.Fragment,{children:[e.jsx(t.h1,{id:"deploy-with-fastlane",children:"Deploy with Fastlane"}),`
`,e.jsx(t.p,{children:"Fastlane is the automated path for evaluations, demos, CI and small lab clusters. It installs PostgreSQL, Keycloak, RabbitMQ, Envoy Gateway and Lamassu, then configures them to work together."}),`
`,e.jsxs(t.p,{children:["For production, use ",e.jsx(t.a,{href:"/docs/deployment/self-hosted/helm",children:"Helm"})," so database, identity, credentials, certificates, storage and upgrades remain explicit."]}),`
`,e.jsx(t.h2,{id:"what-fastlane-adds",children:"What Fastlane adds"}),`
`,e.jsx(t.p,{children:"Fastlane closes some of the gaps intentionally left by the application chart:"}),`
`,e.jsxs(t.table,{children:[e.jsx(t.thead,{children:e.jsxs(t.tr,{children:[e.jsx(t.th,{children:"Fastlane installs or configures"}),e.jsx(t.th,{children:"You still provide"})]})}),e.jsxs(t.tbody,{children:[e.jsxs(t.tr,{children:[e.jsx(t.td,{children:"PostgreSQL, RabbitMQ and Keycloak instances for evaluation"}),e.jsx(t.td,{children:"The Kubernetes cluster, nodes and persistent storage"})]}),e.jsxs(t.tr,{children:[e.jsxs(t.td,{children:["Envoy Gateway 1.8 and the ",e.jsx(t.code,{children:"eg"})," ",e.jsx(t.code,{children:"GatewayClass"})]}),e.jsx(t.td,{children:"cert-manager, external network reachability, DNS and firewall/NAT rules"})]}),e.jsxs(t.tr,{children:[e.jsx(t.td,{children:"A self-signed Lamassu certificate flow, generated dependency credentials and an initial user"}),e.jsx(t.td,{children:"Client trust for the self-signed CA, or a trusted certificate passed to the script"})]}),e.jsxs(t.tr,{children:[e.jsx(t.td,{children:"Optional observability and lab HSM components"}),e.jsx(t.td,{children:"Production monitoring retention, backups, HA and a production HSM/key service"})]})]})]}),`
`,e.jsx(t.p,{children:"Fastlane does not turn the resulting stack into a production service: it does not create the cluster, public DNS, firewall rules, backups, high availability or a trusted public certificate."}),`
`,e.jsx(t.h2,{id:"before-you-begin",children:"Before you begin"}),`
`,e.jsx(t.p,{children:"You need:"}),`
`,e.jsxs(t.ul,{children:[`
`,e.jsx(t.li,{children:"an existing Kubernetes cluster"}),`
`,e.jsxs(t.li,{children:[e.jsx(t.code,{children:"kubectl"})," and Helm, or the MicroK8s CLI"]}),`
`,e.jsx(t.li,{children:e.jsx(t.code,{children:"yq"})}),`
`,e.jsx(t.li,{children:"cert-manager"}),`
`,e.jsxs(t.li,{children:[e.jsx(t.code,{children:"jq"})," only when using ",e.jsx(t.code,{children:"--sample-data"})]}),`
`,e.jsx(t.li,{children:"free external ports 80 and 443 on a single-node K3s host"}),`
`]}),`
`,e.jsxs(t.p,{children:["Fastlane detects MicroK8s, K3s, kind or a standard kubeconfig. Use ",e.jsx(t.code,{children:"--context"})," when the intended cluster is not the current context."]}),`
`,e.jsx(s,{type:"warn",title:"Know which cluster is selected",children:e.jsxs(t.p,{children:["Fastlane installs several components and creates credentials. Check ",e.jsx(t.code,{children:"kubectl config current-context"})," or pass ",e.jsx(t.code,{children:"--context"})," before running it."]})}),`
`,e.jsx(t.h2,{id:"quick-start",children:"Quick start"}),`
`,e.jsx(t.p,{children:"Run the script from a clone of the Helm repository:"}),`
`,e.jsx(e.Fragment,{children:e.jsx(t.pre,{className:"shiki shiki-themes min-light min-dark",style:{"--shiki-light":"#24292eff","--shiki-dark":"#b392f0","--shiki-light-bg":"#ffffff","--shiki-dark-bg":"#1f1f1f"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsxs(t.code,{children:[e.jsxs(t.span,{className:"line",children:[e.jsx(t.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"git"}),e.jsx(t.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" clone"}),e.jsx(t.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" https://github.com/lamassuiot/lamassu-helm.git"})]}),`
`,e.jsxs(t.span,{className:"line",children:[e.jsx(t.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"cd"}),e.jsx(t.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" lamassu-helm"})]}),`
`,e.jsx(t.span,{className:"line"}),`
`,e.jsxs(t.span,{className:"line",children:[e.jsx(t.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"./scripts/lamassu-fast-lane.sh"}),e.jsx(t.span,{style:{"--shiki-light":"#24292EFF","--shiki-dark":"#B392F0"},children:" \\"})]}),`
`,e.jsxs(t.span,{className:"line",children:[e.jsx(t.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:"  --non-interactive"}),e.jsx(t.span,{style:{"--shiki-light":"#24292EFF","--shiki-dark":"#B392F0"},children:" \\"})]}),`
`,e.jsxs(t.span,{className:"line",children:[e.jsx(t.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:"  --namespace"}),e.jsx(t.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" lamassu-dev"}),e.jsx(t.span,{style:{"--shiki-light":"#24292EFF","--shiki-dark":"#B392F0"},children:" \\"})]}),`
`,e.jsxs(t.span,{className:"line",children:[e.jsx(t.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:"  --domain"}),e.jsx(t.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" pki.example.com"}),e.jsx(t.span,{style:{"--shiki-light":"#24292EFF","--shiki-dark":"#B392F0"},children:" \\"})]}),`
`,e.jsxs(t.span,{className:"line",children:[e.jsx(t.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:"  --local-chart-path"}),e.jsx(t.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" ./charts/lamassu"})]})]})})}),`
`,e.jsx(t.p,{children:"Create a DNS record for the chosen domain before testing from another machine. For a small VM, point it at the VM or load-balancer address that actually receives ports 80 and 443."}),`
`,e.jsx(t.h2,{id:"gateway-address-selection",children:"Gateway address selection"}),`
`,e.jsxs(t.p,{children:["By default, Fastlane runs ",e.jsx(t.code,{children:"hostname -I"})," and writes the returned addresses to ",e.jsx(t.code,{children:"gateway.addresses"})," and to the self-signed certificate's IP SANs."]}),`
`,e.jsx(t.p,{children:"On a single-homed lab VM this can select the expected node address. On hosts with Docker, VPN, WireGuard or several interfaces it can also select addresses clients cannot reach. Override the result explicitly:"}),`
`,e.jsx(e.Fragment,{children:e.jsx(t.pre,{className:"shiki shiki-themes min-light min-dark",style:{"--shiki-light":"#24292eff","--shiki-dark":"#b392f0","--shiki-light-bg":"#ffffff","--shiki-dark-bg":"#1f1f1f"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsxs(t.code,{children:[e.jsxs(t.span,{className:"line",children:[e.jsx(t.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"./scripts/lamassu-fast-lane.sh"}),e.jsx(t.span,{style:{"--shiki-light":"#24292EFF","--shiki-dark":"#B392F0"},children:" \\"})]}),`
`,e.jsxs(t.span,{className:"line",children:[e.jsx(t.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:"  --non-interactive"}),e.jsx(t.span,{style:{"--shiki-light":"#24292EFF","--shiki-dark":"#B392F0"},children:" \\"})]}),`
`,e.jsxs(t.span,{className:"line",children:[e.jsx(t.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:"  --domain"}),e.jsx(t.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" pki.example.com"}),e.jsx(t.span,{style:{"--shiki-light":"#24292EFF","--shiki-dark":"#B392F0"},children:" \\"})]}),`
`,e.jsxs(t.span,{className:"line",children:[e.jsx(t.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:"  --gateway-ip"}),e.jsx(t.span,{style:{"--shiki-light":"#1976D2","--shiki-dark":"#F8F8F8"},children:" 192.168.1.50"})]})]})})}),`
`,e.jsx(t.p,{children:"The value must be an address handled on the Kubernetes side of the traffic path. If a public EC2 address forwards through WireGuard to the cluster, pass the reachable cluster/VM address, not the EC2 public address."}),`
`,e.jsxs(t.p,{children:["See ",e.jsx(t.a,{href:"/docs/deployment/self-hosted/networking",children:"Expose the Gateway"})," for K3s port conflicts, VIPs, external NAT and multi-Gateway designs."]}),`
`,e.jsx(t.h2,{id:"command-line-options",children:"Command-line options"}),`
`,e.jsxs(t.table,{children:[e.jsx(t.thead,{children:e.jsxs(t.tr,{children:[e.jsx(t.th,{children:"Option"}),e.jsx(t.th,{children:"Default"}),e.jsx(t.th,{children:"Purpose"})]})}),e.jsxs(t.tbody,{children:[e.jsxs(t.tr,{children:[e.jsxs(t.td,{children:[e.jsx(t.code,{children:"-h"}),", ",e.jsx(t.code,{children:"--help"})]}),e.jsx(t.td,{children:"—"}),e.jsx(t.td,{children:"Show help"})]}),e.jsxs(t.tr,{children:[e.jsxs(t.td,{children:[e.jsx(t.code,{children:"-c"}),", ",e.jsx(t.code,{children:"--context"})]}),e.jsx(t.td,{children:"current context"}),e.jsx(t.td,{children:"Select the kubeconfig context for kubectl and Helm"})]}),e.jsxs(t.tr,{children:[e.jsxs(t.td,{children:[e.jsx(t.code,{children:"-n"}),", ",e.jsx(t.code,{children:"--non-interactive"})]}),e.jsx(t.td,{children:"false"}),e.jsx(t.td,{children:"Skip prompts and generate dependency credentials"})]}),e.jsxs(t.tr,{children:[e.jsxs(t.td,{children:[e.jsx(t.code,{children:"-ns"}),", ",e.jsx(t.code,{children:"--namespace"})]}),e.jsx(t.td,{children:e.jsx(t.code,{children:"lamassu-dev"})}),e.jsx(t.td,{children:"Namespace for the installation"})]}),e.jsxs(t.tr,{children:[e.jsxs(t.td,{children:[e.jsx(t.code,{children:"-d"}),", ",e.jsx(t.code,{children:"--domain"})]}),e.jsx(t.td,{children:e.jsx(t.code,{children:"dev.lamassu.io"})}),e.jsx(t.td,{children:"Domain used by the UI, OIDC and certificate"})]}),e.jsxs(t.tr,{children:[e.jsxs(t.td,{children:[e.jsx(t.code,{children:"-v"}),", ",e.jsx(t.code,{children:"--version"})]}),e.jsx(t.td,{children:"latest"}),e.jsx(t.td,{children:"Lamassu chart version"})]}),e.jsxs(t.tr,{children:[e.jsx(t.td,{children:e.jsx(t.code,{children:"--https-port"})}),e.jsx(t.td,{children:e.jsx(t.code,{children:"443"})}),e.jsx(t.td,{children:"Gateway HTTPS listener port"})]}),e.jsxs(t.tr,{children:[e.jsx(t.td,{children:e.jsx(t.code,{children:"--http-port"})}),e.jsx(t.td,{children:e.jsx(t.code,{children:"80"})}),e.jsx(t.td,{children:"Gateway HTTP listener port"})]}),e.jsxs(t.tr,{children:[e.jsx(t.td,{children:e.jsx(t.code,{children:"--tls-crt"})}),e.jsx(t.td,{children:"—"}),e.jsx(t.td,{children:"PEM certificate for downstream TLS"})]}),e.jsxs(t.tr,{children:[e.jsx(t.td,{children:e.jsx(t.code,{children:"--tls-key"})}),e.jsx(t.td,{children:"—"}),e.jsx(t.td,{children:"PEM private key for downstream TLS"})]}),e.jsxs(t.tr,{children:[e.jsxs(t.td,{children:[e.jsx(t.code,{children:"-l"}),", ",e.jsx(t.code,{children:"--local-chart-path"})]}),e.jsx(t.td,{children:"repository chart"}),e.jsx(t.td,{children:"Use an unpacked local Lamassu chart"})]}),e.jsxs(t.tr,{children:[e.jsxs(t.td,{children:[e.jsx(t.code,{children:"-ip"}),", ",e.jsx(t.code,{children:"--gateway-ip"})]}),e.jsx(t.td,{children:"auto-detected"}),e.jsxs(t.td,{children:["Override the address written to ",e.jsx(t.code,{children:"gateway.addresses"})]})]}),e.jsxs(t.tr,{children:[e.jsx(t.td,{children:e.jsx(t.code,{children:"--otel"})}),e.jsx(t.td,{children:"false"}),e.jsx(t.td,{children:"Install Victoria Logs, VictoriaTraces, Jaeger and an OpenTelemetry Collector"})]}),e.jsxs(t.tr,{children:[e.jsx(t.td,{children:e.jsx(t.code,{children:"--sample-data"})}),e.jsx(t.td,{children:"false"}),e.jsx(t.td,{children:"Create sample CAs, profiles, certificates, DMS data and devices"})]}),e.jsxs(t.tr,{children:[e.jsx(t.td,{children:e.jsx(t.code,{children:"--with-hsm"})}),e.jsx(t.td,{children:"false"}),e.jsx(t.td,{children:"Install lab HSM components and configure KMS for PKCS#11"})]}),e.jsxs(t.tr,{children:[e.jsx(t.td,{children:e.jsx(t.code,{children:"--softhsm-chart-path"})}),e.jsx(t.td,{children:e.jsx(t.code,{children:"./charts/softhsm"})}),e.jsx(t.td,{children:"Use a different local SoftHSM chart"})]})]})]}),`
`,e.jsx(t.p,{children:"Fastlane does not provide an offline mode. Use the manual Helm workflow and a prepared registry/chart mirror for disconnected environments."}),`
`,e.jsx(t.h2,{id:"what-the-script-configures",children:"What the script configures"}),`
`,e.jsx(t.p,{children:"Fastlane:"}),`
`,e.jsxs(t.ol,{children:[`
`,e.jsx(t.li,{children:"validates local tools and the selected cluster"}),`
`,e.jsxs(t.li,{children:["installs or upgrades Envoy Gateway 1.8 and creates the ",e.jsx(t.code,{children:"eg"})," ",e.jsx(t.code,{children:"GatewayClass"})]}),`
`,e.jsx(t.li,{children:"creates the namespace"}),`
`,e.jsx(t.li,{children:"installs PostgreSQL and creates the required databases"}),`
`,e.jsxs(t.li,{children:["installs Keycloak and creates the ",e.jsx(t.code,{children:"lamassu"})," realm, frontend client, admin role and initial user"]}),`
`,e.jsx(t.li,{children:"installs RabbitMQ"}),`
`,e.jsx(t.li,{children:"optionally installs observability and lab HSM components"}),`
`,e.jsxs(t.li,{children:["generates ",e.jsx(t.code,{children:"lamassu.yaml"})," and installs the Lamassu chart"]}),`
`,e.jsx(t.li,{children:"optionally loads sample data"}),`
`]}),`
`,e.jsxs(t.p,{children:["The generated configuration exposes Keycloak at ",e.jsx(t.code,{children:"/auth"})," through the same Gateway and bootstraps the initial ",e.jsx(t.code,{children:"lamassu"})," user as a Lamassu super administrator."]}),`
`,e.jsx(t.h2,{id:"tls-behavior",children:"TLS behavior"}),`
`,e.jsxs(t.p,{children:["With both ",e.jsx(t.code,{children:"--tls-crt"})," and ",e.jsx(t.code,{children:"--tls-key"}),", Fastlane creates the ",e.jsx(t.code,{children:"downstream-provided-crt"})," Secret and configures ",e.jsx(t.code,{children:"tls.type: external"}),"."]}),`
`,e.jsxs(t.p,{children:["Without them, it configures cert-manager with a self-signed issuer. This is suitable for a lab but will not be trusted by clients until you distribute the CA. Use ",e.jsx(t.a,{href:"/docs/deployment/self-hosted/helm",children:"Helm"})," when you need a corporate Issuer, public ACME issuer or an existing Secret managed by another system."]}),`
`,e.jsx(t.h2,{id:"credentials-and-generated-files",children:"Credentials and generated files"}),`
`,e.jsxs(t.p,{children:["Non-interactive mode generates random PostgreSQL, RabbitMQ and Keycloak administrator passwords. The initial Lamassu login is ",e.jsx(t.code,{children:"lamassu"})," / ",e.jsx(t.code,{children:"lamassu"})," and requires a password change on first use."]}),`
`,e.jsxs(t.p,{children:["Fastlane writes ",e.jsx(t.code,{children:"lamassu.yaml"})," in the current directory and injects credentials into it."]}),`
`,e.jsx(s,{type:"warn",title:"Fastlane is a bootstrap tool",children:e.jsx(t.p,{children:"Protect the generated values file, record the generated credentials in an appropriate secret store and do not reuse the evaluation identity setup in production."})}),`
`,e.jsx(t.h2,{id:"verify-the-installation",children:"Verify the installation"}),`
`,e.jsx(e.Fragment,{children:e.jsx(t.pre,{className:"shiki shiki-themes min-light min-dark",style:{"--shiki-light":"#24292eff","--shiki-dark":"#b392f0","--shiki-light-bg":"#ffffff","--shiki-dark-bg":"#1f1f1f"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsxs(t.code,{children:[e.jsxs(t.span,{className:"line",children:[e.jsx(t.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"kubectl"}),e.jsx(t.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" get"}),e.jsx(t.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" pods"}),e.jsx(t.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" -n"}),e.jsx(t.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" lamassu-dev"})]}),`
`,e.jsxs(t.span,{className:"line",children:[e.jsx(t.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"kubectl"}),e.jsx(t.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" get"}),e.jsx(t.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" gateway,httproute"}),e.jsx(t.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" -n"}),e.jsx(t.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" lamassu-dev"})]}),`
`,e.jsxs(t.span,{className:"line",children:[e.jsx(t.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"kubectl"}),e.jsx(t.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" get"}),e.jsx(t.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" service"}),e.jsx(t.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" -A"})]}),`
`,e.jsxs(t.span,{className:"line",children:[e.jsx(t.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"helm"}),e.jsx(t.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" test"}),e.jsx(t.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" lamassu"}),e.jsx(t.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" -n"}),e.jsx(t.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" lamassu-dev"}),e.jsx(t.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" --logs"})]})]})})}),`
`,e.jsxs(t.p,{children:["Then open ",e.jsx(t.code,{children:"https://pki.example.com"})," and sign in with the initial user. If the Gateway is programmed but the URL is unreachable, follow the checks in ",e.jsx(t.a,{href:"/docs/deployment/self-hosted/networking",children:"Expose the Gateway"}),"."]})]})}function o(n={}){const{wrapper:t}=n.components||{};return t?e.jsx(t,{...n,children:e.jsx(a,{...n})}):a(n)}function c(n,t){throw new Error("Expected component `"+n+"` to be defined: you likely forgot to import, pass, or provide it.")}const p=Object.freeze(Object.defineProperty({__proto__:null,_markdown:i,default:o,frontmatter:r,structuredData:l,toc:d},Symbol.toStringTag,{value:"Module"}));export{p as _};

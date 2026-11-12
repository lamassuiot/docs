import{j as e}from"./index-DqgIL_Rv.js";let c=`

Start by locating the failing layer. A Gateway response and an unready pod require different evidence. For rejected issuance or validation results, see [PKI troubleshooting](/docs/platform/pki/troubleshooting); for enrollment, see [EST diagnostics](/docs/platform/iot-fleets/enrollment/troubleshooting#diagnostics-and-compatibility).

Diagnostic sequence [#diagnostic-sequence]

<Steps>
  <Step>
    Reproduce a single operation [#reproduce-a-single-operation]

    Note the time in UTC, user or principal, resource, endpoint and result. Avoid repeating a destructive action such as revocation or deletion.
  </Step>

  <Step>
    Separate client, Gateway and service [#separate-client-gateway-and-service]

    Check the HTTP status. A 401 points to authentication; a 403, to authorization; a 404, to route or resource; a 5xx, to the service or a dependency.
  </Step>

  <Step>
    Review Kubernetes status [#review-kubernetes-status]

    Locate unready pods, restarts, recent events and the state of the release.
  </Step>

  <Step>
    Query the affected service [#query-the-affected-service]

    Review its /health endpoint and its logs in the same time window. Then follow the indicated dependency: PostgreSQL, RabbitMQ, the OIDC provider or the cryptographic engine.
  </Step>

  <Step>
    Validate the result from outside [#validate-the-result-from-outside]

    For PKI, check the certificate, the chain, OCSP or CRL with the same type of client production uses.
  </Step>
</Steps>

Minimal evidence collection [#minimal-evidence-collection]

Replace the placeholders with your real release, namespace and deployment.

\`\`\`bash
helm status <release> -n <namespace>
kubectl get pods -n <namespace> -o wide
kubectl get deployments,statefulsets,jobs -n <namespace>
kubectl get events -n <namespace> --sort-by=.lastTimestamp
kubectl describe pod <pod> -n <namespace>
kubectl logs <pod> -n <namespace> --all-containers --since=30m
\`\`\`

Also run the chart's connectivity test:

\`\`\`bash
helm test <release> -n <namespace>
\`\`\`

The test checks the health of CA, DMS Manager, Device Manager and VA, and verifies that the UI returns HTML. A passing test confirms basic connectivity, not a full issuance flow.

<Callout type="info" title="Probes use /health">
  The chart's services expose startup, readiness and liveness probes over <code>/health</code>. A pod can be running but receive no traffic if the readiness probe fails.
</Callout>

I cannot sign in [#i-cannot-sign-in]

If you receive a 401:

* check that the UI's OIDC authority is reachable from the browser;
* verify issuer, audience and expiration of the token;
* confirm the Gateway can fetch the keys from the JWKS URI;
* check that the provider's public and internal routes point to the same realm.

If login succeeds but the APIs return 403:

* inspect the token's real claims;
* confirm they match an active principal;
* review the policies granted to that principal;
* verify that authz reaches PostgreSQL and its JWKS.

On a fresh installation, confirm the migration Job finished. That Job creates schemas, migrates authz, preloads policies and provisions the principals defined in <code>services.authz.bootstrap</code>.

Everything returns 403 or 5xx [#everything-returns-403-or-5xx]

External authorization fails closed by default. If authz is unavailable, protected routes are blocked.

1. Locate the authz pod and Service.
2. Check /health, logs and its database connection.
3. Verify the DNS and port configured in externalAuthorization.
4. Check the check route is /v1/ext\\_authz/check.
5. Do not switch to <code>failOpen: true</code> as a permanent workaround: it would allow traffic without authorization during the outage.

API 500 errors [#api-500-errors]

A 500 indicates an internal failure, such as an unavailable database. The \`{"err": ...}\` body currently includes the text of the internal error, which can contain schema, table and constraint names and, on connection failures, the database host and user (not the password). Find the cause in the service log using the request time, and do not forward the body to third parties or show it to end users. This is a known information-disclosure defect: generic messages are planned for 500 responses, keeping the detail only in the service log (tracked in [lamassuiot#814](https://github.com/lamassuiot/lamassuiot/issues/814)). The authorization connector also returns the internal error, in the \`details.error\` field. Some request errors, such as a key size the engine does not support, are also returned as 500.

A pod is not Ready [#a-pod-is-not-ready]

Review <code>kubectl describe pod</code> first. Common causes are:

* wrong credentials or DNS for PostgreSQL or RabbitMQ;
* a missing AMQP CA or client certificate Secret referenced by \`amqp.ca.secretName\` or \`amqp.client.secretName\`;
* unbound persistent volume;
* inaccessible image or incorrect pull policy;
* invalid cryptographic engine configuration;
* CPU or memory limits set too low;
* an incomplete prior migration.

Generic values request 100 mCPU and 128 MiB and limit to 500 mCPU and 512 MiB. Tune per service when you see OOMKills, throttling or slow startups.

Filesystem-based KMS engines and VA local storage use exclusive-access volumes. Keep a single replica or migrate to shared backends before enabling autoscaling.

Internal calls now fail fast instead of hanging for the clients covered by [Egress proxy](/docs/deployment/self-hosted/networking#egress-proxy): connection attempts time out after 30 seconds and TLS handshakes after 10 seconds. The authorization-engine connector keeps its own transport without these dial and handshake timeouts; only its overall 30-second request timeout bounds each call. If an egress proxy handles the cluster's outbound traffic, check the pod's \`HTTP_PROXY\`, \`HTTPS_PROXY\` and \`NO_PROXY\` environment variables and list in-cluster service names in \`NO_PROXY\`.

Events are not arriving [#events-are-not-arriving]

Domain and audit events depend on the bus publisher:

* verify it is enabled in the emitting service;
* check AMQP connectivity and credentials;
* review exchange, routing key, queues and consumers;
* inspect dead-letter queues;
* alert on orphan durable queues and backlog growth.

If \`amqp.tls\` is enabled, verify the TLS side as well:

* confirm the broker listener speaks AMQPS on the configured port — the default port stays \`5672\` and does not follow TLS automatically;
* if you set \`amqp.ca.secretName\`, confirm the Secret exists in the release namespace and its data key matches \`amqp.ca.certificateKey\` (default \`ca.crt\`); if \`amqp.ca.secretName\` is not set, the clients trust the system CAs;
* remember that a missing referenced Secret prevents the consuming pods from starting;
* after updating the CA or client certificate Secret, restart the consuming pods: the AMQP client loads certificates at startup.

See [AMQP TLS (AMQPS)](/docs/deployment/self-hosted/helm#amqp-tls-amqps) for the full configuration.

A consumer outage does not always prevent the main operation from completing. That is why you must monitor RabbitMQ and independently verify the persistence of [audit logs](/docs/platform/administration/audit-logs).

Observability [#observability]

The chart can enable OpenTelemetry instrumentation<ins className="lm-diff-ins"> for the services that support it, including authz; it does not configure OpenTelemetry for AWS Connector, wfx or the UI</ins>. Traces are exported over OTLP HTTP and logs can be directed to a compatible endpoint, such as VictoriaLogs. Use a correlation identifier and the same time window to join Gateway<del className="lm-diff-del">, authz</del>, service and dependency.

Before closing an incident, record:

* the confirmed cause;
* the time scope and affected resources;
* the commands or queries used;
* the applied change and how to revert it;
* validation from a consumer;
* the preventive action and its owner.
`,l={title:"Deployment troubleshooting",description:"Diagnose access, service health and infrastructure dependencies."},h={isNew:!1,changes:2,title:void 0,description:void 0},d={contents:[{heading:void 0,content:"Start by locating the failing layer. A Gateway response and an unready pod require different evidence. For rejected issuance or validation results, see PKI troubleshooting; for enrollment, see EST diagnostics."},{heading:"reproduce-a-single-operation",content:"Note the time in UTC, user or principal, resource, endpoint and result. Avoid repeating a destructive action such as revocation or deletion."},{heading:"separate-client-gateway-and-service",content:"Check the HTTP status. A 401 points to authentication; a 403, to authorization; a 404, to route or resource; a 5xx, to the service or a dependency."},{heading:"review-kubernetes-status",content:"Locate unready pods, restarts, recent events and the state of the release."},{heading:"query-the-affected-service",content:"Review its /health endpoint and its logs in the same time window. Then follow the indicated dependency: PostgreSQL, RabbitMQ, the OIDC provider or the cryptographic engine."},{heading:"validate-the-result-from-outside",content:"For PKI, check the certificate, the chain, OCSP or CRL with the same type of client production uses."},{heading:"minimal-evidence-collection",content:"Replace the placeholders with your real release, namespace and deployment."},{heading:"minimal-evidence-collection",content:"Also run the chart's connectivity test:"},{heading:"minimal-evidence-collection",content:"The test checks the health of CA, DMS Manager, Device Manager and VA, and verifies that the UI returns HTML. A passing test confirms basic connectivity, not a full issuance flow."},{heading:"minimal-evidence-collection",content:"The chart's services expose startup, readiness and liveness probes over /health. A pod can be running but receive no traffic if the readiness probe fails."},{heading:"i-cannot-sign-in",content:"If you receive a 401:"},{heading:"i-cannot-sign-in",content:"check that the UI's OIDC authority is reachable from the browser;"},{heading:"i-cannot-sign-in",content:"verify issuer, audience and expiration of the token;"},{heading:"i-cannot-sign-in",content:"confirm the Gateway can fetch the keys from the JWKS URI;"},{heading:"i-cannot-sign-in",content:"check that the provider's public and internal routes point to the same realm."},{heading:"i-cannot-sign-in",content:"If login succeeds but the APIs return 403:"},{heading:"i-cannot-sign-in",content:"inspect the token's real claims;"},{heading:"i-cannot-sign-in",content:"confirm they match an active principal;"},{heading:"i-cannot-sign-in",content:"review the policies granted to that principal;"},{heading:"i-cannot-sign-in",content:"verify that authz reaches PostgreSQL and its JWKS."},{heading:"i-cannot-sign-in",content:"On a fresh installation, confirm the migration Job finished. That Job creates schemas, migrates authz, preloads policies and provisions the principals defined in services.authz.bootstrap."},{heading:"everything-returns-403-or-5xx",content:"External authorization fails closed by default. If authz is unavailable, protected routes are blocked."},{heading:"everything-returns-403-or-5xx",content:"Locate the authz pod and Service."},{heading:"everything-returns-403-or-5xx",content:"Check /health, logs and its database connection."},{heading:"everything-returns-403-or-5xx",content:"Verify the DNS and port configured in externalAuthorization."},{heading:"everything-returns-403-or-5xx",content:"Check the check route is /v1/ext\\_authz/check."},{heading:"everything-returns-403-or-5xx",content:"Do not switch to failOpen: true as a permanent workaround: it would allow traffic without authorization during the outage."},{heading:"api-500-errors",content:'A 500 indicates an internal failure, such as an unavailable database. The `{"err": ...}` body currently includes the text of the internal error, which can contain schema, table and constraint names and, on connection failures, the database host and user (not the password). Find the cause in the service log using the request time, and do not forward the body to third parties or show it to end users. This is a known information-disclosure defect: generic messages are planned for 500 responses, keeping the detail only in the service log (tracked in lamassuiot#814). The authorization connector also returns the internal error, in the `details.error` field. Some request errors, such as a key size the engine does not support, are also returned as 500.'},{heading:"a-pod-is-not-ready",content:"Review kubectl describe pod first. Common causes are:"},{heading:"a-pod-is-not-ready",content:"wrong credentials or DNS for PostgreSQL or RabbitMQ;"},{heading:"a-pod-is-not-ready",content:"a missing AMQP CA or client certificate Secret referenced by `amqp.ca.secretName` or `amqp.client.secretName`;"},{heading:"a-pod-is-not-ready",content:"unbound persistent volume;"},{heading:"a-pod-is-not-ready",content:"inaccessible image or incorrect pull policy;"},{heading:"a-pod-is-not-ready",content:"invalid cryptographic engine configuration;"},{heading:"a-pod-is-not-ready",content:"CPU or memory limits set too low;"},{heading:"a-pod-is-not-ready",content:"an incomplete prior migration."},{heading:"a-pod-is-not-ready",content:"Generic values request 100 mCPU and 128 MiB and limit to 500 mCPU and 512 MiB. Tune per service when you see OOMKills, throttling or slow startups."},{heading:"a-pod-is-not-ready",content:"Filesystem-based KMS engines and VA local storage use exclusive-access volumes. Keep a single replica or migrate to shared backends before enabling autoscaling."},{heading:"a-pod-is-not-ready",content:"Internal calls now fail fast instead of hanging for the clients covered by Egress proxy: connection attempts time out after 30 seconds and TLS handshakes after 10 seconds. The authorization-engine connector keeps its own transport without these dial and handshake timeouts; only its overall 30-second request timeout bounds each call. If an egress proxy handles the cluster's outbound traffic, check the pod's `HTTP_PROXY`, `HTTPS_PROXY` and `NO_PROXY` environment variables and list in-cluster service names in `NO_PROXY`."},{heading:"events-are-not-arriving",content:"Domain and audit events depend on the bus publisher:"},{heading:"events-are-not-arriving",content:"verify it is enabled in the emitting service;"},{heading:"events-are-not-arriving",content:"check AMQP connectivity and credentials;"},{heading:"events-are-not-arriving",content:"review exchange, routing key, queues and consumers;"},{heading:"events-are-not-arriving",content:"inspect dead-letter queues;"},{heading:"events-are-not-arriving",content:"alert on orphan durable queues and backlog growth."},{heading:"events-are-not-arriving",content:"If `amqp.tls` is enabled, verify the TLS side as well:"},{heading:"events-are-not-arriving",content:"confirm the broker listener speaks AMQPS on the configured port — the default port stays `5672` and does not follow TLS automatically;"},{heading:"events-are-not-arriving",content:"if you set `amqp.ca.secretName`, confirm the Secret exists in the release namespace and its data key matches `amqp.ca.certificateKey` (default `ca.crt`); if `amqp.ca.secretName` is not set, the clients trust the system CAs;"},{heading:"events-are-not-arriving",content:"remember that a missing referenced Secret prevents the consuming pods from starting;"},{heading:"events-are-not-arriving",content:"after updating the CA or client certificate Secret, restart the consuming pods: the AMQP client loads certificates at startup."},{heading:"events-are-not-arriving",content:"See AMQP TLS (AMQPS) for the full configuration."},{heading:"events-are-not-arriving",content:"A consumer outage does not always prevent the main operation from completing. That is why you must monitor RabbitMQ and independently verify the persistence of audit logs."},{heading:"observability",content:"The chart can enable OpenTelemetry instrumentation for the services that support it, including authz; it does not configure OpenTelemetry for AWS Connector, wfx or the UI. Traces are exported over OTLP HTTP and logs can be directed to a compatible endpoint, such as VictoriaLogs. Use a correlation identifier and the same time window to join Gateway, service and dependency."},{heading:"observability",content:"Before closing an incident, record:"},{heading:"observability",content:"the confirmed cause;"},{heading:"observability",content:"the time scope and affected resources;"},{heading:"observability",content:"the commands or queries used;"},{heading:"observability",content:"the applied change and how to revert it;"},{heading:"observability",content:"validation from a consumer;"},{heading:"observability",content:"the preventive action and its owner."}],headings:[{id:"diagnostic-sequence",content:"Diagnostic sequence"},{id:"reproduce-a-single-operation",content:"Reproduce a single operation"},{id:"separate-client-gateway-and-service",content:"Separate client, Gateway and service"},{id:"review-kubernetes-status",content:"Review Kubernetes status"},{id:"query-the-affected-service",content:"Query the affected service"},{id:"validate-the-result-from-outside",content:"Validate the result from outside"},{id:"minimal-evidence-collection",content:"Minimal evidence collection"},{id:"i-cannot-sign-in",content:"I cannot sign in"},{id:"everything-returns-403-or-5xx",content:"Everything returns 403 or 5xx"},{id:"api-500-errors",content:"API 500 errors"},{id:"a-pod-is-not-ready",content:"A pod is not Ready"},{id:"events-are-not-arriving",content:"Events are not arriving"},{id:"observability",content:"Observability"}]};const u=[{depth:2,url:"#diagnostic-sequence",title:e.jsx(e.Fragment,{children:"Diagnostic sequence"})},{depth:3,url:"#reproduce-a-single-operation",title:e.jsx(e.Fragment,{children:"Reproduce a single operation"})},{depth:3,url:"#separate-client-gateway-and-service",title:e.jsx(e.Fragment,{children:"Separate client, Gateway and service"})},{depth:3,url:"#review-kubernetes-status",title:e.jsx(e.Fragment,{children:"Review Kubernetes status"})},{depth:3,url:"#query-the-affected-service",title:e.jsx(e.Fragment,{children:"Query the affected service"})},{depth:3,url:"#validate-the-result-from-outside",title:e.jsx(e.Fragment,{children:"Validate the result from outside"})},{depth:2,url:"#minimal-evidence-collection",title:e.jsx(e.Fragment,{children:"Minimal evidence collection"})},{depth:2,url:"#i-cannot-sign-in",title:e.jsx(e.Fragment,{children:"I cannot sign in"})},{depth:2,url:"#everything-returns-403-or-5xx",title:e.jsx(e.Fragment,{children:"Everything returns 403 or 5xx"})},{depth:2,url:"#api-500-errors",title:e.jsx(e.Fragment,{children:"API 500 errors"})},{depth:2,url:"#a-pod-is-not-ready",title:e.jsx(e.Fragment,{children:"A pod is not Ready"})},{depth:2,url:"#events-are-not-arriving",title:e.jsx(e.Fragment,{children:"Events are not arriving"})},{depth:2,url:"#observability",title:e.jsx(e.Fragment,{children:"Observability"})}];function o(i){const n={a:"a",code:"code",del:"del",h2:"h2",h3:"h3",ins:"ins",li:"li",ol:"ol",p:"p",pre:"pre",span:"span",ul:"ul",...i.components},{Callout:a,Step:t,Steps:r}=n;return a||s("Callout"),t||s("Step"),r||s("Steps"),e.jsxs(e.Fragment,{children:[e.jsxs(n.p,{children:["Start by locating the failing layer. A Gateway response and an unready pod require different evidence. For rejected issuance or validation results, see ",e.jsx(n.a,{href:"/docs/platform/pki/troubleshooting",children:"PKI troubleshooting"}),"; for enrollment, see ",e.jsx(n.a,{href:"/docs/platform/iot-fleets/enrollment/troubleshooting#diagnostics-and-compatibility",children:"EST diagnostics"}),"."]}),`
`,e.jsx(n.h2,{id:"diagnostic-sequence",children:"Diagnostic sequence"}),`
`,e.jsxs(r,{children:[e.jsxs(t,{children:[e.jsx(n.h3,{id:"reproduce-a-single-operation",children:"Reproduce a single operation"}),e.jsx(n.p,{children:"Note the time in UTC, user or principal, resource, endpoint and result. Avoid repeating a destructive action such as revocation or deletion."})]}),e.jsxs(t,{children:[e.jsx(n.h3,{id:"separate-client-gateway-and-service",children:"Separate client, Gateway and service"}),e.jsx(n.p,{children:"Check the HTTP status. A 401 points to authentication; a 403, to authorization; a 404, to route or resource; a 5xx, to the service or a dependency."})]}),e.jsxs(t,{children:[e.jsx(n.h3,{id:"review-kubernetes-status",children:"Review Kubernetes status"}),e.jsx(n.p,{children:"Locate unready pods, restarts, recent events and the state of the release."})]}),e.jsxs(t,{children:[e.jsx(n.h3,{id:"query-the-affected-service",children:"Query the affected service"}),e.jsx(n.p,{children:"Review its /health endpoint and its logs in the same time window. Then follow the indicated dependency: PostgreSQL, RabbitMQ, the OIDC provider or the cryptographic engine."})]}),e.jsxs(t,{children:[e.jsx(n.h3,{id:"validate-the-result-from-outside",children:"Validate the result from outside"}),e.jsx(n.p,{children:"For PKI, check the certificate, the chain, OCSP or CRL with the same type of client production uses."})]})]}),`
`,e.jsx(n.h2,{id:"minimal-evidence-collection",children:"Minimal evidence collection"}),`
`,e.jsx(n.p,{children:"Replace the placeholders with your real release, namespace and deployment."}),`
`,e.jsx(e.Fragment,{children:e.jsx(n.pre,{className:"shiki shiki-themes github-light-default github-dark-default",style:{"--shiki-light":"#1f2328","--shiki-dark":"#e6edf3","--shiki-light-bg":"#ffffff","--shiki-dark-bg":"#0d1117"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsxs(n.code,{children:[e.jsxs(n.span,{className:"line",children:[e.jsx(n.span,{style:{"--shiki-light":"#953800","--shiki-dark":"#FFA657"},children:"helm"}),e.jsx(n.span,{style:{"--shiki-light":"#0A3069","--shiki-dark":"#A5D6FF"},children:" status"}),e.jsx(n.span,{style:{"--shiki-light":"#CF222E","--shiki-dark":"#FF7B72"},children:" <"}),e.jsx(n.span,{style:{"--shiki-light":"#0A3069","--shiki-dark":"#A5D6FF"},children:"releas"}),e.jsx(n.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"e"}),e.jsx(n.span,{style:{"--shiki-light":"#CF222E","--shiki-dark":"#FF7B72"},children:">"}),e.jsx(n.span,{style:{"--shiki-light":"#0550AE","--shiki-dark":"#79C0FF"},children:" -n"}),e.jsx(n.span,{style:{"--shiki-light":"#CF222E","--shiki-dark":"#FF7B72"},children:" <"}),e.jsx(n.span,{style:{"--shiki-light":"#0A3069","--shiki-dark":"#A5D6FF"},children:"namespac"}),e.jsx(n.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"e"}),e.jsx(n.span,{style:{"--shiki-light":"#CF222E","--shiki-dark":"#FF7B72"},children:">"})]}),`
`,e.jsxs(n.span,{className:"line",children:[e.jsx(n.span,{style:{"--shiki-light":"#953800","--shiki-dark":"#FFA657"},children:"kubectl"}),e.jsx(n.span,{style:{"--shiki-light":"#0A3069","--shiki-dark":"#A5D6FF"},children:" get"}),e.jsx(n.span,{style:{"--shiki-light":"#0A3069","--shiki-dark":"#A5D6FF"},children:" pods"}),e.jsx(n.span,{style:{"--shiki-light":"#0550AE","--shiki-dark":"#79C0FF"},children:" -n"}),e.jsx(n.span,{style:{"--shiki-light":"#CF222E","--shiki-dark":"#FF7B72"},children:" <"}),e.jsx(n.span,{style:{"--shiki-light":"#0A3069","--shiki-dark":"#A5D6FF"},children:"namespac"}),e.jsx(n.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"e"}),e.jsx(n.span,{style:{"--shiki-light":"#CF222E","--shiki-dark":"#FF7B72"},children:">"}),e.jsx(n.span,{style:{"--shiki-light":"#0550AE","--shiki-dark":"#79C0FF"},children:" -o"}),e.jsx(n.span,{style:{"--shiki-light":"#0A3069","--shiki-dark":"#A5D6FF"},children:" wide"})]}),`
`,e.jsxs(n.span,{className:"line",children:[e.jsx(n.span,{style:{"--shiki-light":"#953800","--shiki-dark":"#FFA657"},children:"kubectl"}),e.jsx(n.span,{style:{"--shiki-light":"#0A3069","--shiki-dark":"#A5D6FF"},children:" get"}),e.jsx(n.span,{style:{"--shiki-light":"#0A3069","--shiki-dark":"#A5D6FF"},children:" deployments,statefulsets,jobs"}),e.jsx(n.span,{style:{"--shiki-light":"#0550AE","--shiki-dark":"#79C0FF"},children:" -n"}),e.jsx(n.span,{style:{"--shiki-light":"#CF222E","--shiki-dark":"#FF7B72"},children:" <"}),e.jsx(n.span,{style:{"--shiki-light":"#0A3069","--shiki-dark":"#A5D6FF"},children:"namespac"}),e.jsx(n.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"e"}),e.jsx(n.span,{style:{"--shiki-light":"#CF222E","--shiki-dark":"#FF7B72"},children:">"})]}),`
`,e.jsxs(n.span,{className:"line",children:[e.jsx(n.span,{style:{"--shiki-light":"#953800","--shiki-dark":"#FFA657"},children:"kubectl"}),e.jsx(n.span,{style:{"--shiki-light":"#0A3069","--shiki-dark":"#A5D6FF"},children:" get"}),e.jsx(n.span,{style:{"--shiki-light":"#0A3069","--shiki-dark":"#A5D6FF"},children:" events"}),e.jsx(n.span,{style:{"--shiki-light":"#0550AE","--shiki-dark":"#79C0FF"},children:" -n"}),e.jsx(n.span,{style:{"--shiki-light":"#CF222E","--shiki-dark":"#FF7B72"},children:" <"}),e.jsx(n.span,{style:{"--shiki-light":"#0A3069","--shiki-dark":"#A5D6FF"},children:"namespac"}),e.jsx(n.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"e"}),e.jsx(n.span,{style:{"--shiki-light":"#CF222E","--shiki-dark":"#FF7B72"},children:">"}),e.jsx(n.span,{style:{"--shiki-light":"#0550AE","--shiki-dark":"#79C0FF"},children:" --sort-by=.lastTimestamp"})]}),`
`,e.jsxs(n.span,{className:"line",children:[e.jsx(n.span,{style:{"--shiki-light":"#953800","--shiki-dark":"#FFA657"},children:"kubectl"}),e.jsx(n.span,{style:{"--shiki-light":"#0A3069","--shiki-dark":"#A5D6FF"},children:" describe"}),e.jsx(n.span,{style:{"--shiki-light":"#0A3069","--shiki-dark":"#A5D6FF"},children:" pod"}),e.jsx(n.span,{style:{"--shiki-light":"#CF222E","--shiki-dark":"#FF7B72"},children:" <"}),e.jsx(n.span,{style:{"--shiki-light":"#0A3069","--shiki-dark":"#A5D6FF"},children:"po"}),e.jsx(n.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"d"}),e.jsx(n.span,{style:{"--shiki-light":"#CF222E","--shiki-dark":"#FF7B72"},children:">"}),e.jsx(n.span,{style:{"--shiki-light":"#0550AE","--shiki-dark":"#79C0FF"},children:" -n"}),e.jsx(n.span,{style:{"--shiki-light":"#CF222E","--shiki-dark":"#FF7B72"},children:" <"}),e.jsx(n.span,{style:{"--shiki-light":"#0A3069","--shiki-dark":"#A5D6FF"},children:"namespac"}),e.jsx(n.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"e"}),e.jsx(n.span,{style:{"--shiki-light":"#CF222E","--shiki-dark":"#FF7B72"},children:">"})]}),`
`,e.jsxs(n.span,{className:"line",children:[e.jsx(n.span,{style:{"--shiki-light":"#953800","--shiki-dark":"#FFA657"},children:"kubectl"}),e.jsx(n.span,{style:{"--shiki-light":"#0A3069","--shiki-dark":"#A5D6FF"},children:" logs"}),e.jsx(n.span,{style:{"--shiki-light":"#CF222E","--shiki-dark":"#FF7B72"},children:" <"}),e.jsx(n.span,{style:{"--shiki-light":"#0A3069","--shiki-dark":"#A5D6FF"},children:"po"}),e.jsx(n.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"d"}),e.jsx(n.span,{style:{"--shiki-light":"#CF222E","--shiki-dark":"#FF7B72"},children:">"}),e.jsx(n.span,{style:{"--shiki-light":"#0550AE","--shiki-dark":"#79C0FF"},children:" -n"}),e.jsx(n.span,{style:{"--shiki-light":"#CF222E","--shiki-dark":"#FF7B72"},children:" <"}),e.jsx(n.span,{style:{"--shiki-light":"#0A3069","--shiki-dark":"#A5D6FF"},children:"namespac"}),e.jsx(n.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"e"}),e.jsx(n.span,{style:{"--shiki-light":"#CF222E","--shiki-dark":"#FF7B72"},children:">"}),e.jsx(n.span,{style:{"--shiki-light":"#0550AE","--shiki-dark":"#79C0FF"},children:" --all-containers"}),e.jsx(n.span,{style:{"--shiki-light":"#0550AE","--shiki-dark":"#79C0FF"},children:" --since=30m"})]})]})})}),`
`,e.jsx(n.p,{children:"Also run the chart's connectivity test:"}),`
`,e.jsx(e.Fragment,{children:e.jsx(n.pre,{className:"shiki shiki-themes github-light-default github-dark-default",style:{"--shiki-light":"#1f2328","--shiki-dark":"#e6edf3","--shiki-light-bg":"#ffffff","--shiki-dark-bg":"#0d1117"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsx(n.code,{children:e.jsxs(n.span,{className:"line",children:[e.jsx(n.span,{style:{"--shiki-light":"#953800","--shiki-dark":"#FFA657"},children:"helm"}),e.jsx(n.span,{style:{"--shiki-light":"#0A3069","--shiki-dark":"#A5D6FF"},children:" test"}),e.jsx(n.span,{style:{"--shiki-light":"#CF222E","--shiki-dark":"#FF7B72"},children:" <"}),e.jsx(n.span,{style:{"--shiki-light":"#0A3069","--shiki-dark":"#A5D6FF"},children:"releas"}),e.jsx(n.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"e"}),e.jsx(n.span,{style:{"--shiki-light":"#CF222E","--shiki-dark":"#FF7B72"},children:">"}),e.jsx(n.span,{style:{"--shiki-light":"#0550AE","--shiki-dark":"#79C0FF"},children:" -n"}),e.jsx(n.span,{style:{"--shiki-light":"#CF222E","--shiki-dark":"#FF7B72"},children:" <"}),e.jsx(n.span,{style:{"--shiki-light":"#0A3069","--shiki-dark":"#A5D6FF"},children:"namespac"}),e.jsx(n.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"e"}),e.jsx(n.span,{style:{"--shiki-light":"#CF222E","--shiki-dark":"#FF7B72"},children:">"})]})})})}),`
`,e.jsx(n.p,{children:"The test checks the health of CA, DMS Manager, Device Manager and VA, and verifies that the UI returns HTML. A passing test confirms basic connectivity, not a full issuance flow."}),`
`,e.jsx(a,{type:"info",title:"Probes use /health",children:e.jsxs(n.p,{children:["The chart's services expose startup, readiness and liveness probes over ",e.jsx("code",{children:"/health"}),". A pod can be running but receive no traffic if the readiness probe fails."]})}),`
`,e.jsx(n.h2,{id:"i-cannot-sign-in",children:"I cannot sign in"}),`
`,e.jsx(n.p,{children:"If you receive a 401:"}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsx(n.li,{children:"check that the UI's OIDC authority is reachable from the browser;"}),`
`,e.jsx(n.li,{children:"verify issuer, audience and expiration of the token;"}),`
`,e.jsx(n.li,{children:"confirm the Gateway can fetch the keys from the JWKS URI;"}),`
`,e.jsx(n.li,{children:"check that the provider's public and internal routes point to the same realm."}),`
`]}),`
`,e.jsx(n.p,{children:"If login succeeds but the APIs return 403:"}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsx(n.li,{children:"inspect the token's real claims;"}),`
`,e.jsx(n.li,{children:"confirm they match an active principal;"}),`
`,e.jsx(n.li,{children:"review the policies granted to that principal;"}),`
`,e.jsx(n.li,{children:"verify that authz reaches PostgreSQL and its JWKS."}),`
`]}),`
`,e.jsxs(n.p,{children:["On a fresh installation, confirm the migration Job finished. That Job creates schemas, migrates authz, preloads policies and provisions the principals defined in ",e.jsx("code",{children:"services.authz.bootstrap"}),"."]}),`
`,e.jsx(n.h2,{id:"everything-returns-403-or-5xx",children:"Everything returns 403 or 5xx"}),`
`,e.jsx(n.p,{children:"External authorization fails closed by default. If authz is unavailable, protected routes are blocked."}),`
`,e.jsxs(n.ol,{children:[`
`,e.jsx(n.li,{children:"Locate the authz pod and Service."}),`
`,e.jsx(n.li,{children:"Check /health, logs and its database connection."}),`
`,e.jsx(n.li,{children:"Verify the DNS and port configured in externalAuthorization."}),`
`,e.jsx(n.li,{children:"Check the check route is /v1/ext_authz/check."}),`
`,e.jsxs(n.li,{children:["Do not switch to ",e.jsx("code",{children:"failOpen: true"})," as a permanent workaround: it would allow traffic without authorization during the outage."]}),`
`]}),`
`,e.jsx(n.h2,{id:"api-500-errors",children:"API 500 errors"}),`
`,e.jsxs(n.p,{children:["A 500 indicates an internal failure, such as an unavailable database. The ",e.jsx(n.code,{children:'{"err": ...}'})," body currently includes the text of the internal error, which can contain schema, table and constraint names and, on connection failures, the database host and user (not the password). Find the cause in the service log using the request time, and do not forward the body to third parties or show it to end users. This is a known information-disclosure defect: generic messages are planned for 500 responses, keeping the detail only in the service log (tracked in ",e.jsx(n.a,{href:"https://github.com/lamassuiot/lamassuiot/issues/814",children:"lamassuiot#814"}),"). The authorization connector also returns the internal error, in the ",e.jsx(n.code,{children:"details.error"})," field. Some request errors, such as a key size the engine does not support, are also returned as 500."]}),`
`,e.jsx(n.h2,{id:"a-pod-is-not-ready",children:"A pod is not Ready"}),`
`,e.jsxs(n.p,{children:["Review ",e.jsx("code",{children:"kubectl describe pod"})," first. Common causes are:"]}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsx(n.li,{children:"wrong credentials or DNS for PostgreSQL or RabbitMQ;"}),`
`,e.jsxs(n.li,{children:["a missing AMQP CA or client certificate Secret referenced by ",e.jsx(n.code,{children:"amqp.ca.secretName"})," or ",e.jsx(n.code,{children:"amqp.client.secretName"}),";"]}),`
`,e.jsx(n.li,{children:"unbound persistent volume;"}),`
`,e.jsx(n.li,{children:"inaccessible image or incorrect pull policy;"}),`
`,e.jsx(n.li,{children:"invalid cryptographic engine configuration;"}),`
`,e.jsx(n.li,{children:"CPU or memory limits set too low;"}),`
`,e.jsx(n.li,{children:"an incomplete prior migration."}),`
`]}),`
`,e.jsx(n.p,{children:"Generic values request 100 mCPU and 128 MiB and limit to 500 mCPU and 512 MiB. Tune per service when you see OOMKills, throttling or slow startups."}),`
`,e.jsx(n.p,{children:"Filesystem-based KMS engines and VA local storage use exclusive-access volumes. Keep a single replica or migrate to shared backends before enabling autoscaling."}),`
`,e.jsxs(n.p,{children:["Internal calls now fail fast instead of hanging for the clients covered by ",e.jsx(n.a,{href:"/docs/deployment/self-hosted/networking#egress-proxy",children:"Egress proxy"}),": connection attempts time out after 30 seconds and TLS handshakes after 10 seconds. The authorization-engine connector keeps its own transport without these dial and handshake timeouts; only its overall 30-second request timeout bounds each call. If an egress proxy handles the cluster's outbound traffic, check the pod's ",e.jsx(n.code,{children:"HTTP_PROXY"}),", ",e.jsx(n.code,{children:"HTTPS_PROXY"})," and ",e.jsx(n.code,{children:"NO_PROXY"})," environment variables and list in-cluster service names in ",e.jsx(n.code,{children:"NO_PROXY"}),"."]}),`
`,e.jsx(n.h2,{id:"events-are-not-arriving",children:"Events are not arriving"}),`
`,e.jsx(n.p,{children:"Domain and audit events depend on the bus publisher:"}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsx(n.li,{children:"verify it is enabled in the emitting service;"}),`
`,e.jsx(n.li,{children:"check AMQP connectivity and credentials;"}),`
`,e.jsx(n.li,{children:"review exchange, routing key, queues and consumers;"}),`
`,e.jsx(n.li,{children:"inspect dead-letter queues;"}),`
`,e.jsx(n.li,{children:"alert on orphan durable queues and backlog growth."}),`
`]}),`
`,e.jsxs(n.p,{children:["If ",e.jsx(n.code,{children:"amqp.tls"})," is enabled, verify the TLS side as well:"]}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsxs(n.li,{children:["confirm the broker listener speaks AMQPS on the configured port — the default port stays ",e.jsx(n.code,{children:"5672"})," and does not follow TLS automatically;"]}),`
`,e.jsxs(n.li,{children:["if you set ",e.jsx(n.code,{children:"amqp.ca.secretName"}),", confirm the Secret exists in the release namespace and its data key matches ",e.jsx(n.code,{children:"amqp.ca.certificateKey"})," (default ",e.jsx(n.code,{children:"ca.crt"}),"); if ",e.jsx(n.code,{children:"amqp.ca.secretName"})," is not set, the clients trust the system CAs;"]}),`
`,e.jsx(n.li,{children:"remember that a missing referenced Secret prevents the consuming pods from starting;"}),`
`,e.jsx(n.li,{children:"after updating the CA or client certificate Secret, restart the consuming pods: the AMQP client loads certificates at startup."}),`
`]}),`
`,e.jsxs(n.p,{children:["See ",e.jsx(n.a,{href:"/docs/deployment/self-hosted/helm#amqp-tls-amqps",children:"AMQP TLS (AMQPS)"})," for the full configuration."]}),`
`,e.jsxs(n.p,{children:["A consumer outage does not always prevent the main operation from completing. That is why you must monitor RabbitMQ and independently verify the persistence of ",e.jsx(n.a,{href:"/docs/platform/administration/audit-logs",children:"audit logs"}),"."]}),`
`,e.jsx(n.h2,{id:"observability",children:"Observability"}),`
`,e.jsxs(n.p,{children:["The chart can enable OpenTelemetry instrumentation",e.jsx(n.ins,{className:"lm-diff-ins",children:" for the services that support it, including authz; it does not configure OpenTelemetry for AWS Connector, wfx or the UI"}),". Traces are exported over OTLP HTTP and logs can be directed to a compatible endpoint, such as VictoriaLogs. Use a correlation identifier and the same time window to join Gateway",e.jsx(n.del,{className:"lm-diff-del",children:", authz"}),", service and dependency."]}),`
`,e.jsx(n.p,{children:"Before closing an incident, record:"}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsx(n.li,{children:"the confirmed cause;"}),`
`,e.jsx(n.li,{children:"the time scope and affected resources;"}),`
`,e.jsx(n.li,{children:"the commands or queries used;"}),`
`,e.jsx(n.li,{children:"the applied change and how to revert it;"}),`
`,e.jsx(n.li,{children:"validation from a consumer;"}),`
`,e.jsx(n.li,{children:"the preventive action and its owner."}),`
`]})]})}function p(i={}){const{wrapper:n}=i.components||{};return n?e.jsx(n,{...i,children:e.jsx(o,{...i})}):o(i)}function s(i,n){throw new Error("Expected component `"+i+"` to be defined: you likely forgot to import, pass, or provide it.")}const m=Object.freeze(Object.defineProperty({__proto__:null,_markdown:c,default:p,frontmatter:l,lmDiff:h,structuredData:d,toc:u},Symbol.toStringTag,{value:"Module"}));export{m as _};

import{j as e}from"./index-prc0XQdj.js";let d=`

Lamassu instruments the mutable operations of its services with audit events. Each event describes the operation, the principals that matched, the input, the result and whether it ended in error.

What an event contains [#what-an-event-contains]

The audit body includes:

* <code>input</code>: data received by the operation;
* <code>has\\_error</code>: whether the service returned an error;
* <code>output</code>: produced result or error message;
* <code>principals</code>: identifiers of the principals that matched the request.

Successful operations use a type prefixed with <code>audit.</code>. Failures publish the operation type suffixed with <code>.error</code>. The CloudEvents event additionally adds source, identifier, date and type.

<Callout type="info" title="Failed attempts are audited too">
  The middlewares publish the record after executing the operation, whether it succeeded or returned an error. This lets you investigate attempts as well as confirmed changes.
</Callout>

Coverage [#coverage]

The backend applies auditing to mutations of:

* authorities, certificates and issuance profiles;
* keys and KMS engines;
* devices and identities;
* DMSs and enrollment operations;
* validation functions and CRL;
* principals, policies and authorization grants.

Do not confuse these events with domain events. A domain event announces that a resource changed so another component can react; the audit event keeps input, output and principal context for investigation.

Publication and persistence [#publication-and-persistence]

Services publish audit records to the event bus when their PublisherEventBus is enabled. The backend code does not, by itself, implement a queryable, durable audit file.

<Callout type="warn" title="The bus does not replace a compliance archive">
  If you need retention, search, tamper protection or regulatory export, connect a consumer that persists the events into the system approved by your organization.
</Callout>

Design the consumer to:

* subscribe to the <code>audit.#</code> types and also to operation types ending in <code>.error</code>;
* keep the complete CloudEvent unmodified;
* record the ingestion time and detect duplicates by ID;
* encrypt in transit and at rest;
* restrict reading and deletion to a role separate from the PKI operator;
* apply an explicit retention and legal hold policy;
* alert if it stops consuming or the pending queue grows.

Sensitive data [#sensitive-data]

The input and output fields can contain subjects, metadata, public material, configuration or error messages. Evaluate their classification before sending them to an external platform.

Do not log private keys, provider secrets or full tokens in automations around Lamassu. Restrict export and apply redaction at the destination without destroying the fields needed for attribution.

A reproducible investigation [#a-reproducible-investigation]

<Steps>
  <Step>
    Bound the interval [#bound-the-interval]

    Start from the reported time and normalize every source to UTC.
  </Step>

  <Step>
    Identify the operation [#identify-the-operation]

    Filter by event type, service source and resource identifier.
  </Step>

  <Step>
    Attribute the principal [#attribute-the-principal]

    Review principals and correlate them with the OIDC provider or the X.509 identity valid at that moment.
  </Step>

  <Step>
    Compare intent and result [#compare-intent-and-result]

    Contrast input, has\\_error and output. A failed attempt does not mean the resource changed.
  </Step>

  <Step>
    Follow the effect [#follow-the-effect]

    Look for the domain events and service records that share resource and time window. In a CA revocation, include the cascading operations.
  </Step>
</Steps>

Periodic verification [#periodic-verification]

Generate a controlled mutation in a test environment and check that:

1. a successful audit event appears;
2. the principal matches the identity used;
3. the consumer persists it exactly once;
4. it can be retrieved by resource, actor and period;
5. a consumer outage raises an alert.

For metrics, traces and technical logs of the deployment, see [Troubleshooting](/docs/platform/pki/troubleshooting). Audit answers "who tried to change what"; observability explains how the system behaved.
`,c={title:"Audit logs",description:"Understand which audit events Lamassu generates and how to turn them into a durable trail."},h={contents:[{heading:void 0,content:"Lamassu instruments the mutable operations of its services with audit events. Each event describes the operation, the principals that matched, the input, the result and whether it ended in error."},{heading:"what-an-event-contains",content:"The audit body includes:"},{heading:"what-an-event-contains",content:"input: data received by the operation;"},{heading:"what-an-event-contains",content:"has\\_error: whether the service returned an error;"},{heading:"what-an-event-contains",content:"output: produced result or error message;"},{heading:"what-an-event-contains",content:"principals: identifiers of the principals that matched the request."},{heading:"what-an-event-contains",content:"Successful operations use a type prefixed with audit.. Failures publish the operation type suffixed with .error. The CloudEvents event additionally adds source, identifier, date and type."},{heading:"what-an-event-contains",content:"The middlewares publish the record after executing the operation, whether it succeeded or returned an error. This lets you investigate attempts as well as confirmed changes."},{heading:"coverage",content:"The backend applies auditing to mutations of:"},{heading:"coverage",content:"authorities, certificates and issuance profiles;"},{heading:"coverage",content:"keys and KMS engines;"},{heading:"coverage",content:"devices and identities;"},{heading:"coverage",content:"DMSs and enrollment operations;"},{heading:"coverage",content:"validation functions and CRL;"},{heading:"coverage",content:"principals, policies and authorization grants."},{heading:"coverage",content:"Do not confuse these events with domain events. A domain event announces that a resource changed so another component can react; the audit event keeps input, output and principal context for investigation."},{heading:"publication-and-persistence",content:"Services publish audit records to the event bus when their PublisherEventBus is enabled. The backend code does not, by itself, implement a queryable, durable audit file."},{heading:"publication-and-persistence",content:"If you need retention, search, tamper protection or regulatory export, connect a consumer that persists the events into the system approved by your organization."},{heading:"publication-and-persistence",content:"Design the consumer to:"},{heading:"publication-and-persistence",content:"subscribe to the audit.# types and also to operation types ending in .error;"},{heading:"publication-and-persistence",content:"keep the complete CloudEvent unmodified;"},{heading:"publication-and-persistence",content:"record the ingestion time and detect duplicates by ID;"},{heading:"publication-and-persistence",content:"encrypt in transit and at rest;"},{heading:"publication-and-persistence",content:"restrict reading and deletion to a role separate from the PKI operator;"},{heading:"publication-and-persistence",content:"apply an explicit retention and legal hold policy;"},{heading:"publication-and-persistence",content:"alert if it stops consuming or the pending queue grows."},{heading:"sensitive-data",content:"The input and output fields can contain subjects, metadata, public material, configuration or error messages. Evaluate their classification before sending them to an external platform."},{heading:"sensitive-data",content:"Do not log private keys, provider secrets or full tokens in automations around Lamassu. Restrict export and apply redaction at the destination without destroying the fields needed for attribution."},{heading:"bound-the-interval",content:"Start from the reported time and normalize every source to UTC."},{heading:"identify-the-operation",content:"Filter by event type, service source and resource identifier."},{heading:"attribute-the-principal",content:"Review principals and correlate them with the OIDC provider or the X.509 identity valid at that moment."},{heading:"compare-intent-and-result",content:"Contrast input, has\\_error and output. A failed attempt does not mean the resource changed."},{heading:"follow-the-effect",content:"Look for the domain events and service records that share resource and time window. In a CA revocation, include the cascading operations."},{heading:"periodic-verification",content:"Generate a controlled mutation in a test environment and check that:"},{heading:"periodic-verification",content:"a successful audit event appears;"},{heading:"periodic-verification",content:"the principal matches the identity used;"},{heading:"periodic-verification",content:"the consumer persists it exactly once;"},{heading:"periodic-verification",content:"it can be retrieved by resource, actor and period;"},{heading:"periodic-verification",content:"a consumer outage raises an alert."},{heading:"periodic-verification",content:'For metrics, traces and technical logs of the deployment, see Troubleshooting. Audit answers "who tried to change what"; observability explains how the system behaved.'}],headings:[{id:"what-an-event-contains",content:"What an event contains"},{id:"coverage",content:"Coverage"},{id:"publication-and-persistence",content:"Publication and persistence"},{id:"sensitive-data",content:"Sensitive data"},{id:"a-reproducible-investigation",content:"A reproducible investigation"},{id:"bound-the-interval",content:"Bound the interval"},{id:"identify-the-operation",content:"Identify the operation"},{id:"attribute-the-principal",content:"Attribute the principal"},{id:"compare-intent-and-result",content:"Compare intent and result"},{id:"follow-the-effect",content:"Follow the effect"},{id:"periodic-verification",content:"Periodic verification"}]};const l=[{depth:2,url:"#what-an-event-contains",title:e.jsx(e.Fragment,{children:"What an event contains"})},{depth:2,url:"#coverage",title:e.jsx(e.Fragment,{children:"Coverage"})},{depth:2,url:"#publication-and-persistence",title:e.jsx(e.Fragment,{children:"Publication and persistence"})},{depth:2,url:"#sensitive-data",title:e.jsx(e.Fragment,{children:"Sensitive data"})},{depth:2,url:"#a-reproducible-investigation",title:e.jsx(e.Fragment,{children:"A reproducible investigation"})},{depth:3,url:"#bound-the-interval",title:e.jsx(e.Fragment,{children:"Bound the interval"})},{depth:3,url:"#identify-the-operation",title:e.jsx(e.Fragment,{children:"Identify the operation"})},{depth:3,url:"#attribute-the-principal",title:e.jsx(e.Fragment,{children:"Attribute the principal"})},{depth:3,url:"#compare-intent-and-result",title:e.jsx(e.Fragment,{children:"Compare intent and result"})},{depth:3,url:"#follow-the-effect",title:e.jsx(e.Fragment,{children:"Follow the effect"})},{depth:2,url:"#periodic-verification",title:e.jsx(e.Fragment,{children:"Periodic verification"})}];function s(n){const t={a:"a",h2:"h2",h3:"h3",li:"li",ol:"ol",p:"p",ul:"ul",...n.components},{Callout:a,Step:i,Steps:o}=t;return a||r("Callout"),i||r("Step"),o||r("Steps"),e.jsxs(e.Fragment,{children:[e.jsx(t.p,{children:"Lamassu instruments the mutable operations of its services with audit events. Each event describes the operation, the principals that matched, the input, the result and whether it ended in error."}),`
`,e.jsx(t.h2,{id:"what-an-event-contains",children:"What an event contains"}),`
`,e.jsx(t.p,{children:"The audit body includes:"}),`
`,e.jsxs(t.ul,{children:[`
`,e.jsxs(t.li,{children:[e.jsx("code",{children:"input"}),": data received by the operation;"]}),`
`,e.jsxs(t.li,{children:[e.jsx("code",{children:"has_error"}),": whether the service returned an error;"]}),`
`,e.jsxs(t.li,{children:[e.jsx("code",{children:"output"}),": produced result or error message;"]}),`
`,e.jsxs(t.li,{children:[e.jsx("code",{children:"principals"}),": identifiers of the principals that matched the request."]}),`
`]}),`
`,e.jsxs(t.p,{children:["Successful operations use a type prefixed with ",e.jsx("code",{children:"audit."}),". Failures publish the operation type suffixed with ",e.jsx("code",{children:".error"}),". The CloudEvents event additionally adds source, identifier, date and type."]}),`
`,e.jsx(a,{type:"info",title:"Failed attempts are audited too",children:e.jsx(t.p,{children:"The middlewares publish the record after executing the operation, whether it succeeded or returned an error. This lets you investigate attempts as well as confirmed changes."})}),`
`,e.jsx(t.h2,{id:"coverage",children:"Coverage"}),`
`,e.jsx(t.p,{children:"The backend applies auditing to mutations of:"}),`
`,e.jsxs(t.ul,{children:[`
`,e.jsx(t.li,{children:"authorities, certificates and issuance profiles;"}),`
`,e.jsx(t.li,{children:"keys and KMS engines;"}),`
`,e.jsx(t.li,{children:"devices and identities;"}),`
`,e.jsx(t.li,{children:"DMSs and enrollment operations;"}),`
`,e.jsx(t.li,{children:"validation functions and CRL;"}),`
`,e.jsx(t.li,{children:"principals, policies and authorization grants."}),`
`]}),`
`,e.jsx(t.p,{children:"Do not confuse these events with domain events. A domain event announces that a resource changed so another component can react; the audit event keeps input, output and principal context for investigation."}),`
`,e.jsx(t.h2,{id:"publication-and-persistence",children:"Publication and persistence"}),`
`,e.jsx(t.p,{children:"Services publish audit records to the event bus when their PublisherEventBus is enabled. The backend code does not, by itself, implement a queryable, durable audit file."}),`
`,e.jsx(a,{type:"warn",title:"The bus does not replace a compliance archive",children:e.jsx(t.p,{children:"If you need retention, search, tamper protection or regulatory export, connect a consumer that persists the events into the system approved by your organization."})}),`
`,e.jsx(t.p,{children:"Design the consumer to:"}),`
`,e.jsxs(t.ul,{children:[`
`,e.jsxs(t.li,{children:["subscribe to the ",e.jsx("code",{children:"audit.#"})," types and also to operation types ending in ",e.jsx("code",{children:".error"}),";"]}),`
`,e.jsx(t.li,{children:"keep the complete CloudEvent unmodified;"}),`
`,e.jsx(t.li,{children:"record the ingestion time and detect duplicates by ID;"}),`
`,e.jsx(t.li,{children:"encrypt in transit and at rest;"}),`
`,e.jsx(t.li,{children:"restrict reading and deletion to a role separate from the PKI operator;"}),`
`,e.jsx(t.li,{children:"apply an explicit retention and legal hold policy;"}),`
`,e.jsx(t.li,{children:"alert if it stops consuming or the pending queue grows."}),`
`]}),`
`,e.jsx(t.h2,{id:"sensitive-data",children:"Sensitive data"}),`
`,e.jsx(t.p,{children:"The input and output fields can contain subjects, metadata, public material, configuration or error messages. Evaluate their classification before sending them to an external platform."}),`
`,e.jsx(t.p,{children:"Do not log private keys, provider secrets or full tokens in automations around Lamassu. Restrict export and apply redaction at the destination without destroying the fields needed for attribution."}),`
`,e.jsx(t.h2,{id:"a-reproducible-investigation",children:"A reproducible investigation"}),`
`,e.jsxs(o,{children:[e.jsxs(i,{children:[e.jsx(t.h3,{id:"bound-the-interval",children:"Bound the interval"}),e.jsx(t.p,{children:"Start from the reported time and normalize every source to UTC."})]}),e.jsxs(i,{children:[e.jsx(t.h3,{id:"identify-the-operation",children:"Identify the operation"}),e.jsx(t.p,{children:"Filter by event type, service source and resource identifier."})]}),e.jsxs(i,{children:[e.jsx(t.h3,{id:"attribute-the-principal",children:"Attribute the principal"}),e.jsx(t.p,{children:"Review principals and correlate them with the OIDC provider or the X.509 identity valid at that moment."})]}),e.jsxs(i,{children:[e.jsx(t.h3,{id:"compare-intent-and-result",children:"Compare intent and result"}),e.jsx(t.p,{children:"Contrast input, has_error and output. A failed attempt does not mean the resource changed."})]}),e.jsxs(i,{children:[e.jsx(t.h3,{id:"follow-the-effect",children:"Follow the effect"}),e.jsx(t.p,{children:"Look for the domain events and service records that share resource and time window. In a CA revocation, include the cascading operations."})]})]}),`
`,e.jsx(t.h2,{id:"periodic-verification",children:"Periodic verification"}),`
`,e.jsx(t.p,{children:"Generate a controlled mutation in a test environment and check that:"}),`
`,e.jsxs(t.ol,{children:[`
`,e.jsx(t.li,{children:"a successful audit event appears;"}),`
`,e.jsx(t.li,{children:"the principal matches the identity used;"}),`
`,e.jsx(t.li,{children:"the consumer persists it exactly once;"}),`
`,e.jsx(t.li,{children:"it can be retrieved by resource, actor and period;"}),`
`,e.jsx(t.li,{children:"a consumer outage raises an alert."}),`
`]}),`
`,e.jsxs(t.p,{children:["For metrics, traces and technical logs of the deployment, see ",e.jsx(t.a,{href:"/docs/platform/pki/troubleshooting",children:"Troubleshooting"}),'. Audit answers "who tried to change what"; observability explains how the system behaved.']})]})}function p(n={}){const{wrapper:t}=n.components||{};return t?e.jsx(t,{...n,children:e.jsx(s,{...n})}):s(n)}function r(n,t){throw new Error("Expected component `"+n+"` to be defined: you likely forgot to import, pass, or provide it.")}const v=Object.freeze(Object.defineProperty({__proto__:null,_markdown:d,default:p,frontmatter:c,structuredData:h,toc:l},Symbol.toStringTag,{value:"Module"}));export{v as _};

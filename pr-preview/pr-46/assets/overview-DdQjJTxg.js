import{j as e}from"./index-prc0XQdj.js";let o=`

Lamassu IoT lets you administer a private PKI and use it to issue, renew and revoke X.509 device identities. The Platform documentation follows two paths: **PKI**, for authorities and certificates, and **IoT Fleets**, for applying those identities to a device population.

Start here [#start-here]

Choose the result you need:

<Cards>
  <Card title="Issue and verify a certificate" description="Prepare a CA, issue an X.509 identity and check its chain and key." href="/docs/platform/pki/quickstarts/overview" />

  <Card title="Enroll and connect a device" description="Prepare the DMS, request an identity through EST and check an mTLS connection." href="/docs/platform/iot-fleets/quickstarts/enroll-device" />
</Cards>

If you are still preparing the instance, start in [Deployment](/docs/deployment/overview). The Platform paths assume an accessible console and permission to perform the operations.

Choose your path [#choose-your-path]

| Section            | What you manage                                                                 | Entry point                                                    |
| ------------------ | ------------------------------------------------------------------------------- | -------------------------------------------------------------- |
| **PKI**            | Keys, authorities, profiles, certificates and publication of revocation status. | [PKI overview](/docs/platform/pki/overview)                    |
| **IoT Fleets**     | Devices, identity history, DMS policies, EST enrollment and integrations.       | [IoT Fleets overview](/docs/platform/iot-fleets/overview)      |
| **Administration** | Operator permissions, audit and event subscriptions.                            | [Access control](/docs/platform/administration/access-control) |

A CA determines who signs, and a profile defines what can be issued. The DMS applies admission and enrollment policy. The device retains its association with certificates, and the external consumer decides which identity it accepts.

Architecture at a glance [#architecture-at-a-glance]

An identity's journey connects four responsibilities:

1. The PKI administrator prepares the authority, its key and issuance rules.
2. The provisioning administrator configures the DMS and initial trust.
3. The device client requests a certificate and installs it with the matching key.
4. The consumer validates the identity and applies its access permissions.

See [How Lamassu works](/docs/platform/concepts/overview) to understand the resources and [platform architecture](/docs/platform/concepts/architecture) for the services. Installation, network exposure and dependencies are explained in [Deployment](/docs/deployment/overview).

Core capabilities [#core-capabilities]

Build your trust hierarchy [#build-your-trust-hierarchy]

Create or incorporate authorities and organize their relationships in [PKI](/docs/platform/pki/certificate-authorities). The hierarchy and its rotation determine which chains consumers must recognize.

Protect cryptographic keys [#protect-cryptographic-keys]

Choose the engine that keeps authority keys and control who can use them. See [Keys and engines](/docs/platform/pki/key-management); provider setup belongs to deployment.

Issue and control certificates [#issue-and-control-certificates]

Define [issuance profiles](/docs/platform/pki/certificate-profiles), sign requests and review the [certificate inventory](/docs/platform/pki/certificates). Check the issued certificate from the client that will use it.

Automate device identities [#automate-device-identities]

Configure a [DMS](/docs/platform/iot-fleets/enrollment/dms) and use [EST](/docs/platform/iot-fleets/enrollment/overview) to request and renew certificates. Preparing the initial credential and installing the result belong to device integration.

Publish validation status [#publish-validation-status]

Use [OCSP and CRL](/docs/platform/pki/certificate-validation) to publish revocation status. Each consumer must configure how it retrieves and applies that information.

React to events [#react-to-events]

Use [audit logs](/docs/platform/administration/audit-logs) to investigate changes and configure [alerts and subscriptions](/docs/platform/administration/alerts) to react to lifecycle events.

Operational reference [#operational-reference]

| Responsibility          | What it prepares or checks                                                     |
| ----------------------- | ------------------------------------------------------------------------------ |
| PKI administrator       | Key custody, CA hierarchy, profiles and validation.                            |
| Fleet administrator     | DMS, device admission, renewal policy and inventory.                           |
| Device integrator       | Initial credential, server trust, EST client, and key and certificate storage. |
| Consumer integrator     | Issuer trust, certificate validation and permissions in the destination.       |
| Infrastructure operator | Installation, network, availability, dependencies and deployment diagnosis.    |

The [API reference](/docs/api-reference/ca) contains contracts for automating operations. To investigate a failure, start in the affected section: [PKI](/docs/platform/pki/troubleshooting), [EST](/docs/platform/iot-fleets/enrollment/troubleshooting#diagnostics-and-compatibility) or [Deployment](/docs/deployment/troubleshooting).
`,c={title:"Lamassu IoT Platform",description:"Build a PKI and apply its certificates to your devices' lifecycle."},d={contents:[{heading:void 0,content:"Lamassu IoT lets you administer a private PKI and use it to issue, renew and revoke X.509 device identities. The Platform documentation follows two paths: **PKI**, for authorities and certificates, and **IoT Fleets**, for applying those identities to a device population."},{heading:"start-here",content:"Choose the result you need:"},{heading:"start-here",content:'<Card title="Issue and verify a certificate" description="Prepare a CA, issue an X.509 identity and check its chain and key." href="/docs/platform/pki/quickstarts/overview" />'},{heading:"start-here",content:'<Card title="Enroll and connect a device" description="Prepare the DMS, request an identity through EST and check an mTLS connection." href="/docs/platform/iot-fleets/quickstarts/enroll-device" />'},{heading:"start-here",content:"If you are still preparing the instance, start in Deployment. The Platform paths assume an accessible console and permission to perform the operations."},{heading:"choose-your-path",content:"Section"},{heading:"choose-your-path",content:"What you manage"},{heading:"choose-your-path",content:"Entry point"},{heading:"choose-your-path",content:"**PKI**"},{heading:"choose-your-path",content:"Keys, authorities, profiles, certificates and publication of revocation status."},{heading:"choose-your-path",content:"PKI overview"},{heading:"choose-your-path",content:"**IoT Fleets**"},{heading:"choose-your-path",content:"Devices, identity history, DMS policies, EST enrollment and integrations."},{heading:"choose-your-path",content:"IoT Fleets overview"},{heading:"choose-your-path",content:"**Administration**"},{heading:"choose-your-path",content:"Operator permissions, audit and event subscriptions."},{heading:"choose-your-path",content:"Access control"},{heading:"choose-your-path",content:"A CA determines who signs, and a profile defines what can be issued. The DMS applies admission and enrollment policy. The device retains its association with certificates, and the external consumer decides which identity it accepts."},{heading:"architecture-at-a-glance",content:"An identity's journey connects four responsibilities:"},{heading:"architecture-at-a-glance",content:"The PKI administrator prepares the authority, its key and issuance rules."},{heading:"architecture-at-a-glance",content:"The provisioning administrator configures the DMS and initial trust."},{heading:"architecture-at-a-glance",content:"The device client requests a certificate and installs it with the matching key."},{heading:"architecture-at-a-glance",content:"The consumer validates the identity and applies its access permissions."},{heading:"architecture-at-a-glance",content:"See How Lamassu works to understand the resources and platform architecture for the services. Installation, network exposure and dependencies are explained in Deployment."},{heading:"build-your-trust-hierarchy",content:"Create or incorporate authorities and organize their relationships in PKI. The hierarchy and its rotation determine which chains consumers must recognize."},{heading:"protect-cryptographic-keys",content:"Choose the engine that keeps authority keys and control who can use them. See Keys and engines; provider setup belongs to deployment."},{heading:"issue-and-control-certificates",content:"Define issuance profiles, sign requests and review the certificate inventory. Check the issued certificate from the client that will use it."},{heading:"automate-device-identities",content:"Configure a DMS and use EST to request and renew certificates. Preparing the initial credential and installing the result belong to device integration."},{heading:"publish-validation-status",content:"Use OCSP and CRL to publish revocation status. Each consumer must configure how it retrieves and applies that information."},{heading:"react-to-events",content:"Use audit logs to investigate changes and configure alerts and subscriptions to react to lifecycle events."},{heading:"operational-reference",content:"Responsibility"},{heading:"operational-reference",content:"What it prepares or checks"},{heading:"operational-reference",content:"PKI administrator"},{heading:"operational-reference",content:"Key custody, CA hierarchy, profiles and validation."},{heading:"operational-reference",content:"Fleet administrator"},{heading:"operational-reference",content:"DMS, device admission, renewal policy and inventory."},{heading:"operational-reference",content:"Device integrator"},{heading:"operational-reference",content:"Initial credential, server trust, EST client, and key and certificate storage."},{heading:"operational-reference",content:"Consumer integrator"},{heading:"operational-reference",content:"Issuer trust, certificate validation and permissions in the destination."},{heading:"operational-reference",content:"Infrastructure operator"},{heading:"operational-reference",content:"Installation, network, availability, dependencies and deployment diagnosis."},{heading:"operational-reference",content:"The API reference contains contracts for automating operations. To investigate a failure, start in the affected section: PKI, EST or Deployment."}],headings:[{id:"start-here",content:"Start here"},{id:"choose-your-path",content:"Choose your path"},{id:"architecture-at-a-glance",content:"Architecture at a glance"},{id:"core-capabilities",content:"Core capabilities"},{id:"build-your-trust-hierarchy",content:"Build your trust hierarchy"},{id:"protect-cryptographic-keys",content:"Protect cryptographic keys"},{id:"issue-and-control-certificates",content:"Issue and control certificates"},{id:"automate-device-identities",content:"Automate device identities"},{id:"publish-validation-status",content:"Publish validation status"},{id:"react-to-events",content:"React to events"},{id:"operational-reference",content:"Operational reference"}]};const l=[{depth:2,url:"#start-here",title:e.jsx(e.Fragment,{children:"Start here"})},{depth:2,url:"#choose-your-path",title:e.jsx(e.Fragment,{children:"Choose your path"})},{depth:2,url:"#architecture-at-a-glance",title:e.jsx(e.Fragment,{children:"Architecture at a glance"})},{depth:2,url:"#core-capabilities",title:e.jsx(e.Fragment,{children:"Core capabilities"})},{depth:3,url:"#build-your-trust-hierarchy",title:e.jsx(e.Fragment,{children:"Build your trust hierarchy"})},{depth:3,url:"#protect-cryptographic-keys",title:e.jsx(e.Fragment,{children:"Protect cryptographic keys"})},{depth:3,url:"#issue-and-control-certificates",title:e.jsx(e.Fragment,{children:"Issue and control certificates"})},{depth:3,url:"#automate-device-identities",title:e.jsx(e.Fragment,{children:"Automate device identities"})},{depth:3,url:"#publish-validation-status",title:e.jsx(e.Fragment,{children:"Publish validation status"})},{depth:3,url:"#react-to-events",title:e.jsx(e.Fragment,{children:"React to events"})},{depth:2,url:"#operational-reference",title:e.jsx(e.Fragment,{children:"Operational reference"})}];function a(i){const t={a:"a",h2:"h2",h3:"h3",li:"li",ol:"ol",p:"p",strong:"strong",table:"table",tbody:"tbody",td:"td",th:"th",thead:"thead",tr:"tr",...i.components},{Card:n,Cards:r}=t;return n||s("Card"),r||s("Cards"),e.jsxs(e.Fragment,{children:[e.jsxs(t.p,{children:["Lamassu IoT lets you administer a private PKI and use it to issue, renew and revoke X.509 device identities. The Platform documentation follows two paths: ",e.jsx(t.strong,{children:"PKI"}),", for authorities and certificates, and ",e.jsx(t.strong,{children:"IoT Fleets"}),", for applying those identities to a device population."]}),`
`,e.jsx(t.h2,{id:"start-here",children:"Start here"}),`
`,e.jsx(t.p,{children:"Choose the result you need:"}),`
`,e.jsxs(r,{children:[e.jsx(n,{title:"Issue and verify a certificate",description:"Prepare a CA, issue an X.509 identity and check its chain and key.",href:"/docs/platform/pki/quickstarts/overview"}),e.jsx(n,{title:"Enroll and connect a device",description:"Prepare the DMS, request an identity through EST and check an mTLS connection.",href:"/docs/platform/iot-fleets/quickstarts/enroll-device"})]}),`
`,e.jsxs(t.p,{children:["If you are still preparing the instance, start in ",e.jsx(t.a,{href:"/docs/deployment/overview",children:"Deployment"}),". The Platform paths assume an accessible console and permission to perform the operations."]}),`
`,e.jsx(t.h2,{id:"choose-your-path",children:"Choose your path"}),`
`,e.jsxs(t.table,{children:[e.jsx(t.thead,{children:e.jsxs(t.tr,{children:[e.jsx(t.th,{children:"Section"}),e.jsx(t.th,{children:"What you manage"}),e.jsx(t.th,{children:"Entry point"})]})}),e.jsxs(t.tbody,{children:[e.jsxs(t.tr,{children:[e.jsx(t.td,{children:e.jsx(t.strong,{children:"PKI"})}),e.jsx(t.td,{children:"Keys, authorities, profiles, certificates and publication of revocation status."}),e.jsx(t.td,{children:e.jsx(t.a,{href:"/docs/platform/pki/overview",children:"PKI overview"})})]}),e.jsxs(t.tr,{children:[e.jsx(t.td,{children:e.jsx(t.strong,{children:"IoT Fleets"})}),e.jsx(t.td,{children:"Devices, identity history, DMS policies, EST enrollment and integrations."}),e.jsx(t.td,{children:e.jsx(t.a,{href:"/docs/platform/iot-fleets/overview",children:"IoT Fleets overview"})})]}),e.jsxs(t.tr,{children:[e.jsx(t.td,{children:e.jsx(t.strong,{children:"Administration"})}),e.jsx(t.td,{children:"Operator permissions, audit and event subscriptions."}),e.jsx(t.td,{children:e.jsx(t.a,{href:"/docs/platform/administration/access-control",children:"Access control"})})]})]})]}),`
`,e.jsx(t.p,{children:"A CA determines who signs, and a profile defines what can be issued. The DMS applies admission and enrollment policy. The device retains its association with certificates, and the external consumer decides which identity it accepts."}),`
`,e.jsx(t.h2,{id:"architecture-at-a-glance",children:"Architecture at a glance"}),`
`,e.jsx(t.p,{children:"An identity's journey connects four responsibilities:"}),`
`,e.jsxs(t.ol,{children:[`
`,e.jsx(t.li,{children:"The PKI administrator prepares the authority, its key and issuance rules."}),`
`,e.jsx(t.li,{children:"The provisioning administrator configures the DMS and initial trust."}),`
`,e.jsx(t.li,{children:"The device client requests a certificate and installs it with the matching key."}),`
`,e.jsx(t.li,{children:"The consumer validates the identity and applies its access permissions."}),`
`]}),`
`,e.jsxs(t.p,{children:["See ",e.jsx(t.a,{href:"/docs/platform/concepts/overview",children:"How Lamassu works"})," to understand the resources and ",e.jsx(t.a,{href:"/docs/platform/concepts/architecture",children:"platform architecture"})," for the services. Installation, network exposure and dependencies are explained in ",e.jsx(t.a,{href:"/docs/deployment/overview",children:"Deployment"}),"."]}),`
`,e.jsx(t.h2,{id:"core-capabilities",children:"Core capabilities"}),`
`,e.jsx(t.h3,{id:"build-your-trust-hierarchy",children:"Build your trust hierarchy"}),`
`,e.jsxs(t.p,{children:["Create or incorporate authorities and organize their relationships in ",e.jsx(t.a,{href:"/docs/platform/pki/certificate-authorities",children:"PKI"}),". The hierarchy and its rotation determine which chains consumers must recognize."]}),`
`,e.jsx(t.h3,{id:"protect-cryptographic-keys",children:"Protect cryptographic keys"}),`
`,e.jsxs(t.p,{children:["Choose the engine that keeps authority keys and control who can use them. See ",e.jsx(t.a,{href:"/docs/platform/pki/key-management",children:"Keys and engines"}),"; provider setup belongs to deployment."]}),`
`,e.jsx(t.h3,{id:"issue-and-control-certificates",children:"Issue and control certificates"}),`
`,e.jsxs(t.p,{children:["Define ",e.jsx(t.a,{href:"/docs/platform/pki/certificate-profiles",children:"issuance profiles"}),", sign requests and review the ",e.jsx(t.a,{href:"/docs/platform/pki/certificates",children:"certificate inventory"}),". Check the issued certificate from the client that will use it."]}),`
`,e.jsx(t.h3,{id:"automate-device-identities",children:"Automate device identities"}),`
`,e.jsxs(t.p,{children:["Configure a ",e.jsx(t.a,{href:"/docs/platform/iot-fleets/enrollment/dms",children:"DMS"})," and use ",e.jsx(t.a,{href:"/docs/platform/iot-fleets/enrollment/overview",children:"EST"})," to request and renew certificates. Preparing the initial credential and installing the result belong to device integration."]}),`
`,e.jsx(t.h3,{id:"publish-validation-status",children:"Publish validation status"}),`
`,e.jsxs(t.p,{children:["Use ",e.jsx(t.a,{href:"/docs/platform/pki/certificate-validation",children:"OCSP and CRL"})," to publish revocation status. Each consumer must configure how it retrieves and applies that information."]}),`
`,e.jsx(t.h3,{id:"react-to-events",children:"React to events"}),`
`,e.jsxs(t.p,{children:["Use ",e.jsx(t.a,{href:"/docs/platform/administration/audit-logs",children:"audit logs"})," to investigate changes and configure ",e.jsx(t.a,{href:"/docs/platform/administration/alerts",children:"alerts and subscriptions"})," to react to lifecycle events."]}),`
`,e.jsx(t.h2,{id:"operational-reference",children:"Operational reference"}),`
`,e.jsxs(t.table,{children:[e.jsx(t.thead,{children:e.jsxs(t.tr,{children:[e.jsx(t.th,{children:"Responsibility"}),e.jsx(t.th,{children:"What it prepares or checks"})]})}),e.jsxs(t.tbody,{children:[e.jsxs(t.tr,{children:[e.jsx(t.td,{children:"PKI administrator"}),e.jsx(t.td,{children:"Key custody, CA hierarchy, profiles and validation."})]}),e.jsxs(t.tr,{children:[e.jsx(t.td,{children:"Fleet administrator"}),e.jsx(t.td,{children:"DMS, device admission, renewal policy and inventory."})]}),e.jsxs(t.tr,{children:[e.jsx(t.td,{children:"Device integrator"}),e.jsx(t.td,{children:"Initial credential, server trust, EST client, and key and certificate storage."})]}),e.jsxs(t.tr,{children:[e.jsx(t.td,{children:"Consumer integrator"}),e.jsx(t.td,{children:"Issuer trust, certificate validation and permissions in the destination."})]}),e.jsxs(t.tr,{children:[e.jsx(t.td,{children:"Infrastructure operator"}),e.jsx(t.td,{children:"Installation, network, availability, dependencies and deployment diagnosis."})]})]})]}),`
`,e.jsxs(t.p,{children:["The ",e.jsx(t.a,{href:"/docs/api-reference/ca",children:"API reference"})," contains contracts for automating operations. To investigate a failure, start in the affected section: ",e.jsx(t.a,{href:"/docs/platform/pki/troubleshooting",children:"PKI"}),", ",e.jsx(t.a,{href:"/docs/platform/iot-fleets/enrollment/troubleshooting#diagnostics-and-compatibility",children:"EST"})," or ",e.jsx(t.a,{href:"/docs/deployment/troubleshooting",children:"Deployment"}),"."]})]})}function h(i={}){const{wrapper:t}=i.components||{};return t?e.jsx(t,{...i,children:e.jsx(a,{...i})}):a(i)}function s(i,t){throw new Error("Expected component `"+i+"` to be defined: you likely forgot to import, pass, or provide it.")}const u=Object.freeze(Object.defineProperty({__proto__:null,_markdown:o,default:h,frontmatter:c,structuredData:d,toc:l},Symbol.toStringTag,{value:"Module"}));export{u as _};

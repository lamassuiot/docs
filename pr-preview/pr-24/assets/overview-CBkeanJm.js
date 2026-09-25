import{j as e}from"./index-prc0XQdj.js";let s=`

Lamassu IoT centralizes the issuance, distribution, renewal and revocation of X.509 identities for connected devices. You can build a private PKI, protect its keys and automate the enrollment of a fleet without losing visibility into every certificate.

Start here [#start-here]

<Cards>
  <Card title="Get started" description="Create a CA, issue a certificate and register your first device." href="/docs/platform/pki/quickstarts/overview" />

  <Card title="How Lamassu works" description="Build the mental model of authorities, keys, identities and validation." href="/docs/platform/pki/concepts/overview" />
</Cards>

Core capabilities [#core-capabilities]

Build your trust hierarchy [#build-your-trust-hierarchy]

Create root and intermediate authorities or import an existing PKI. Define which authority can issue each identity and keep the full chain of trust.

Protect cryptographic keys [#protect-cryptographic-keys]

Generate and safeguard keys using software engines, PKCS#11 HSMs or cloud services. Lamassu decouples operations from the physical location of the key.

Issue and control certificates [#issue-and-control-certificates]

Issue certificates from the console or from a CSR, check their status and revoke them when they stop being trustworthy.

Automate device identities [#automate-device-identities]

Define enrollment policies with a Device Management Service (DMS) and let devices request or renew their identity through EST<ins className="lm-diff-ins"> or CMP</ins>.

Publish validation status [#publish-validation-status]

Offer online validation through OCSP and distribute CRLs for consumers that need to check certificates offline.

React to events [#react-to-events]

Subscribe to lifecycle changes and send notifications by email, Microsoft Teams or webhooks.

Choose your path [#choose-your-path]

<Cards>
  <Card title="I administer the PKI" description="Configure engines, authorities, issuance and validation." href="/docs/platform/pki/key-management" />

  <div className="lm-diff-del lm-diff-block">
    <Card title="I integrate a device" description="Configure the DMS and use EST to obtain an identity." href="/docs/platform/pki/device-enrollment" />
  </div>

  <div className="lm-diff-ins lm-diff-block">
    <Card title="I integrate a device" description="Configure the DMS and use EST or CMP to obtain an identity." href="/docs/platform/pki/device-enrollment" />
  </div>

  <Card title="I operate the platform" description="Deploy Lamassu and prepare its dependencies." href="/docs/deployment/overview" />

  <Card title="I integrate another system" description="Connect Lamassu with AWS IoT Core and other destinations." href="/docs/platform/pki/integrations/aws-iot-core" />
</Cards>

Operational reference [#operational-reference]

<Cards>
  <Card title="Certificate profiles" description="Turn issuance policy into reusable constraints." href="/docs/platform/pki/certificate-profiles" />

  <Card title="Hierarchy and rotation" description="Replace CA certificates or keys without breaking trust." href="/docs/platform/pki/ca-hierarchy-and-rotation" />

  <Card title="Access control" description="Configure principals, policies and the first administrator." href="/docs/platform/pki/access-control" />

  <Card title="Troubleshooting" description="Diagnose the Gateway, services, issuance and enrollment." href="/docs/platform/pki/troubleshooting" />
</Cards>
`,c={title:"Lamassu IoT Platform",description:"Manage PKI and digital identities for your devices from a single platform."},d={isNew:!1,changes:3,title:void 0,description:void 0},l={contents:[{heading:void 0,content:"Lamassu IoT centralizes the issuance, distribution, renewal and revocation of X.509 identities for connected devices. You can build a private PKI, protect its keys and automate the enrollment of a fleet without losing visibility into every certificate."},{heading:"start-here",content:'<Card title="Get started" description="Create a CA, issue a certificate and register your first device." href="/docs/platform/pki/quickstarts/overview" />'},{heading:"start-here",content:'<Card title="How Lamassu works" description="Build the mental model of authorities, keys, identities and validation." href="/docs/platform/pki/concepts/overview" />'},{heading:"build-your-trust-hierarchy",content:"Create root and intermediate authorities or import an existing PKI. Define which authority can issue each identity and keep the full chain of trust."},{heading:"protect-cryptographic-keys",content:"Generate and safeguard keys using software engines, PKCS#11 HSMs or cloud services. Lamassu decouples operations from the physical location of the key."},{heading:"issue-and-control-certificates",content:"Issue certificates from the console or from a CSR, check their status and revoke them when they stop being trustworthy."},{heading:"automate-device-identities",content:"Define enrollment policies with a Device Management Service (DMS) and let devices request or renew their identity through EST or CMP."},{heading:"publish-validation-status",content:"Offer online validation through OCSP and distribute CRLs for consumers that need to check certificates offline."},{heading:"react-to-events",content:"Subscribe to lifecycle changes and send notifications by email, Microsoft Teams or webhooks."},{heading:"choose-your-path",content:'<Card title="I administer the PKI" description="Configure engines, authorities, issuance and validation." href="/docs/platform/pki/key-management" />'},{heading:"choose-your-path",content:'<Card title="I integrate a device" description="Configure the DMS and use EST or CMP to obtain an identity." href="/docs/platform/pki/device-enrollment" />'},{heading:"choose-your-path",content:'<Card title="I operate the platform" description="Deploy Lamassu and prepare its dependencies." href="/docs/deployment/overview" />'},{heading:"choose-your-path",content:'<Card title="I integrate another system" description="Connect Lamassu with AWS IoT Core and other destinations." href="/docs/platform/pki/integrations/aws-iot-core" />'},{heading:"operational-reference",content:'<Card title="Certificate profiles" description="Turn issuance policy into reusable constraints." href="/docs/platform/pki/certificate-profiles" />'},{heading:"operational-reference",content:'<Card title="Hierarchy and rotation" description="Replace CA certificates or keys without breaking trust." href="/docs/platform/pki/ca-hierarchy-and-rotation" />'},{heading:"operational-reference",content:'<Card title="Access control" description="Configure principals, policies and the first administrator." href="/docs/platform/pki/access-control" />'},{heading:"operational-reference",content:'<Card title="Troubleshooting" description="Diagnose the Gateway, services, issuance and enrollment." href="/docs/platform/pki/troubleshooting" />'}],headings:[{id:"start-here",content:"Start here"},{id:"core-capabilities",content:"Core capabilities"},{id:"build-your-trust-hierarchy",content:"Build your trust hierarchy"},{id:"protect-cryptographic-keys",content:"Protect cryptographic keys"},{id:"issue-and-control-certificates",content:"Issue and control certificates"},{id:"automate-device-identities",content:"Automate device identities"},{id:"publish-validation-status",content:"Publish validation status"},{id:"react-to-events",content:"React to events"},{id:"choose-your-path",content:"Choose your path"},{id:"operational-reference",content:"Operational reference"}]};const h=[{depth:2,url:"#start-here",title:e.jsx(e.Fragment,{children:"Start here"})},{depth:2,url:"#core-capabilities",title:e.jsx(e.Fragment,{children:"Core capabilities"})},{depth:3,url:"#build-your-trust-hierarchy",title:e.jsx(e.Fragment,{children:"Build your trust hierarchy"})},{depth:3,url:"#protect-cryptographic-keys",title:e.jsx(e.Fragment,{children:"Protect cryptographic keys"})},{depth:3,url:"#issue-and-control-certificates",title:e.jsx(e.Fragment,{children:"Issue and control certificates"})},{depth:3,url:"#automate-device-identities",title:e.jsx(e.Fragment,{children:"Automate device identities"})},{depth:3,url:"#publish-validation-status",title:e.jsx(e.Fragment,{children:"Publish validation status"})},{depth:3,url:"#react-to-events",title:e.jsx(e.Fragment,{children:"React to events"})},{depth:2,url:"#choose-your-path",title:e.jsx(e.Fragment,{children:"Choose your path"})},{depth:2,url:"#operational-reference",title:e.jsx(e.Fragment,{children:"Operational reference"})}];function o(n){const t={div:"div",h2:"h2",h3:"h3",ins:"ins",p:"p",...n.components},{Card:i,Cards:r}=t;return i||a("Card"),r||a("Cards"),e.jsxs(e.Fragment,{children:[e.jsx(t.p,{children:"Lamassu IoT centralizes the issuance, distribution, renewal and revocation of X.509 identities for connected devices. You can build a private PKI, protect its keys and automate the enrollment of a fleet without losing visibility into every certificate."}),`
`,e.jsx(t.h2,{id:"start-here",children:"Start here"}),`
`,e.jsxs(r,{children:[e.jsx(i,{title:"Get started",description:"Create a CA, issue a certificate and register your first device.",href:"/docs/platform/pki/quickstarts/overview"}),e.jsx(i,{title:"How Lamassu works",description:"Build the mental model of authorities, keys, identities and validation.",href:"/docs/platform/pki/concepts/overview"})]}),`
`,e.jsx(t.h2,{id:"core-capabilities",children:"Core capabilities"}),`
`,e.jsx(t.h3,{id:"build-your-trust-hierarchy",children:"Build your trust hierarchy"}),`
`,e.jsx(t.p,{children:"Create root and intermediate authorities or import an existing PKI. Define which authority can issue each identity and keep the full chain of trust."}),`
`,e.jsx(t.h3,{id:"protect-cryptographic-keys",children:"Protect cryptographic keys"}),`
`,e.jsx(t.p,{children:"Generate and safeguard keys using software engines, PKCS#11 HSMs or cloud services. Lamassu decouples operations from the physical location of the key."}),`
`,e.jsx(t.h3,{id:"issue-and-control-certificates",children:"Issue and control certificates"}),`
`,e.jsx(t.p,{children:"Issue certificates from the console or from a CSR, check their status and revoke them when they stop being trustworthy."}),`
`,e.jsx(t.h3,{id:"automate-device-identities",children:"Automate device identities"}),`
`,e.jsxs(t.p,{children:["Define enrollment policies with a Device Management Service (DMS) and let devices request or renew their identity through EST",e.jsx(t.ins,{className:"lm-diff-ins",children:" or CMP"}),"."]}),`
`,e.jsx(t.h3,{id:"publish-validation-status",children:"Publish validation status"}),`
`,e.jsx(t.p,{children:"Offer online validation through OCSP and distribute CRLs for consumers that need to check certificates offline."}),`
`,e.jsx(t.h3,{id:"react-to-events",children:"React to events"}),`
`,e.jsx(t.p,{children:"Subscribe to lifecycle changes and send notifications by email, Microsoft Teams or webhooks."}),`
`,e.jsx(t.h2,{id:"choose-your-path",children:"Choose your path"}),`
`,e.jsxs(r,{children:[e.jsx(i,{title:"I administer the PKI",description:"Configure engines, authorities, issuance and validation.",href:"/docs/platform/pki/key-management"}),e.jsx(t.div,{className:"lm-diff-del lm-diff-block",children:e.jsx(i,{title:"I integrate a device",description:"Configure the DMS and use EST to obtain an identity.",href:"/docs/platform/pki/device-enrollment"})}),e.jsx(t.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(i,{title:"I integrate a device",description:"Configure the DMS and use EST or CMP to obtain an identity.",href:"/docs/platform/pki/device-enrollment"})}),e.jsx(i,{title:"I operate the platform",description:"Deploy Lamassu and prepare its dependencies.",href:"/docs/deployment/overview"}),e.jsx(i,{title:"I integrate another system",description:"Connect Lamassu with AWS IoT Core and other destinations.",href:"/docs/platform/pki/integrations/aws-iot-core"})]}),`
`,e.jsx(t.h2,{id:"operational-reference",children:"Operational reference"}),`
`,e.jsxs(r,{children:[e.jsx(i,{title:"Certificate profiles",description:"Turn issuance policy into reusable constraints.",href:"/docs/platform/pki/certificate-profiles"}),e.jsx(i,{title:"Hierarchy and rotation",description:"Replace CA certificates or keys without breaking trust.",href:"/docs/platform/pki/ca-hierarchy-and-rotation"}),e.jsx(i,{title:"Access control",description:"Configure principals, policies and the first administrator.",href:"/docs/platform/pki/access-control"}),e.jsx(i,{title:"Troubleshooting",description:"Diagnose the Gateway, services, issuance and enrollment.",href:"/docs/platform/pki/troubleshooting"})]})]})}function p(n={}){const{wrapper:t}=n.components||{};return t?e.jsx(t,{...n,children:e.jsx(o,{...n})}):o(n)}function a(n,t){throw new Error("Expected component `"+n+"` to be defined: you likely forgot to import, pass, or provide it.")}const f=Object.freeze(Object.defineProperty({__proto__:null,_markdown:s,default:p,frontmatter:c,lmDiff:d,structuredData:l,toc:h},Symbol.toStringTag,{value:"Module"}));export{f as _};

import{j as e}from"./index-prc0XQdj.js";let a=`

Lamassu connects three elements: a **root of trust**, an **issuance policy** and an **entity that needs to prove its identity**. The platform coordinates these elements throughout the certificate lifecycle.

The model in five pieces [#the-model-in-five-pieces]

**Cryptographic engine.** Generates or safeguards keys and executes private-key operations without exposing key material to the rest of the services.

**Certification Authority (CA).** Signs certificates and establishes the chain of trust.

**Device Management Service (DMS).** Defines how the devices of a fleet are registered, authenticated and renewed.

**Device.** Keeps its private key and presents the certificate to prove its identity.

**Validation Authority (VA).** Publishes the status of certificates through OCSP and CRL.

From onboarding to operation [#from-onboarding-to-operation]

1. An administrator configures a cryptographic engine and creates or imports a CA.
2. A DMS relates that CA to an enrollment policy.
3. The device generates a key and requests a certificate through EST<ins className="lm-diff-ins"> or CMP</ins>, or an operator assigns it an identity.
4. Lamassu keeps the inventory, history and status of the identity.
5. Consumers check the chain and query OCSP or a CRL when they need to know whether it is still valid.

<Cards>
  <Card title="Architecture" description="Get to know the components and where each one's responsibility ends." href="/docs/platform/pki/concepts/architecture" />

  <Card title="Identity lifecycle" description="Follow a certificate from enrollment to renewal or revocation." href="/docs/platform/pki/concepts/certificate-lifecycle" />
</Cards>
`,c={title:"How Lamassu works",description:"The mental model of trust, keys, certificates and devices."},d={isNew:!1,changes:1,title:void 0,description:void 0},h={contents:[{heading:void 0,content:"Lamassu connects three elements: a **root of trust**, an **issuance policy** and an **entity that needs to prove its identity**. The platform coordinates these elements throughout the certificate lifecycle."},{heading:"the-model-in-five-pieces",content:"**Cryptographic engine.** Generates or safeguards keys and executes private-key operations without exposing key material to the rest of the services."},{heading:"the-model-in-five-pieces",content:"**Certification Authority (CA).** Signs certificates and establishes the chain of trust."},{heading:"the-model-in-five-pieces",content:"**Device Management Service (DMS).** Defines how the devices of a fleet are registered, authenticated and renewed."},{heading:"the-model-in-five-pieces",content:"**Device.** Keeps its private key and presents the certificate to prove its identity."},{heading:"the-model-in-five-pieces",content:"**Validation Authority (VA).** Publishes the status of certificates through OCSP and CRL."},{heading:"from-onboarding-to-operation",content:"An administrator configures a cryptographic engine and creates or imports a CA."},{heading:"from-onboarding-to-operation",content:"A DMS relates that CA to an enrollment policy."},{heading:"from-onboarding-to-operation",content:"The device generates a key and requests a certificate through EST or CMP, or an operator assigns it an identity."},{heading:"from-onboarding-to-operation",content:"Lamassu keeps the inventory, history and status of the identity."},{heading:"from-onboarding-to-operation",content:"Consumers check the chain and query OCSP or a CRL when they need to know whether it is still valid."},{heading:"from-onboarding-to-operation",content:`<Card title="Architecture" description="Get to know the components and where each one's responsibility ends." href="/docs/platform/pki/concepts/architecture" />`},{heading:"from-onboarding-to-operation",content:'<Card title="Identity lifecycle" description="Follow a certificate from enrollment to renewal or revocation." href="/docs/platform/pki/concepts/certificate-lifecycle" />'}],headings:[{id:"the-model-in-five-pieces",content:"The model in five pieces"},{id:"from-onboarding-to-operation",content:"From onboarding to operation"}]};const l=[{depth:2,url:"#the-model-in-five-pieces",title:e.jsx(e.Fragment,{children:"The model in five pieces"})},{depth:2,url:"#from-onboarding-to-operation",title:e.jsx(e.Fragment,{children:"From onboarding to operation"})}];function r(n){const t={h2:"h2",ins:"ins",li:"li",ol:"ol",p:"p",strong:"strong",...n.components},{Card:i,Cards:o}=t;return i||s("Card"),o||s("Cards"),e.jsxs(e.Fragment,{children:[e.jsxs(t.p,{children:["Lamassu connects three elements: a ",e.jsx(t.strong,{children:"root of trust"}),", an ",e.jsx(t.strong,{children:"issuance policy"})," and an ",e.jsx(t.strong,{children:"entity that needs to prove its identity"}),". The platform coordinates these elements throughout the certificate lifecycle."]}),`
`,e.jsx(t.h2,{id:"the-model-in-five-pieces",children:"The model in five pieces"}),`
`,e.jsxs(t.p,{children:[e.jsx(t.strong,{children:"Cryptographic engine."})," Generates or safeguards keys and executes private-key operations without exposing key material to the rest of the services."]}),`
`,e.jsxs(t.p,{children:[e.jsx(t.strong,{children:"Certification Authority (CA)."})," Signs certificates and establishes the chain of trust."]}),`
`,e.jsxs(t.p,{children:[e.jsx(t.strong,{children:"Device Management Service (DMS)."})," Defines how the devices of a fleet are registered, authenticated and renewed."]}),`
`,e.jsxs(t.p,{children:[e.jsx(t.strong,{children:"Device."})," Keeps its private key and presents the certificate to prove its identity."]}),`
`,e.jsxs(t.p,{children:[e.jsx(t.strong,{children:"Validation Authority (VA)."})," Publishes the status of certificates through OCSP and CRL."]}),`
`,e.jsx(t.h2,{id:"from-onboarding-to-operation",children:"From onboarding to operation"}),`
`,e.jsxs(t.ol,{children:[`
`,e.jsx(t.li,{children:"An administrator configures a cryptographic engine and creates or imports a CA."}),`
`,e.jsx(t.li,{children:"A DMS relates that CA to an enrollment policy."}),`
`,e.jsxs(t.li,{children:["The device generates a key and requests a certificate through EST",e.jsx(t.ins,{className:"lm-diff-ins",children:" or CMP"}),", or an operator assigns it an identity."]}),`
`,e.jsx(t.li,{children:"Lamassu keeps the inventory, history and status of the identity."}),`
`,e.jsx(t.li,{children:"Consumers check the chain and query OCSP or a CRL when they need to know whether it is still valid."}),`
`]}),`
`,e.jsxs(o,{children:[e.jsx(i,{title:"Architecture",description:"Get to know the components and where each one's responsibility ends.",href:"/docs/platform/pki/concepts/architecture"}),e.jsx(i,{title:"Identity lifecycle",description:"Follow a certificate from enrollment to renewal or revocation.",href:"/docs/platform/pki/concepts/certificate-lifecycle"})]})]})}function p(n={}){const{wrapper:t}=n.components||{};return t?e.jsx(t,{...n,children:e.jsx(r,{...n})}):r(n)}function s(n,t){throw new Error("Expected component `"+n+"` to be defined: you likely forgot to import, pass, or provide it.")}const m=Object.freeze(Object.defineProperty({__proto__:null,_markdown:a,default:p,frontmatter:c,lmDiff:d,structuredData:h,toc:l},Symbol.toStringTag,{value:"Module"}));export{m as _};

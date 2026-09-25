import{j as e}from"./index-prc0XQdj.js";let c=`

Issuance proves who signed a certificate; validation tells you whether it should still be accepted. Lamassu publishes status through two complementary mechanisms.

Choose a mechanism [#choose-a-mechanism]

Use **OCSP** when the consumer is online and needs to check the latest status of a specific certificate.

Use a **CRL** when validation must happen locally, offline or over a high volume of certificates. The consumer periodically downloads a signed list and keeps it until the next update.

Many environments use both: OCSP as the primary check and a CRL as the local or fallback mechanism.

<Cards>
  <Card title="Online validation with OCSP" description="Query Good, Revoked and Unknown statuses in real time." href="/docs/platform/pki/ocsp" />

  <Card title="Revocation lists" description="Generate, publish and distribute CRLs per authority." href="/docs/platform/pki/crl" />
</Cards>
`,r={title:"Certificate validation",description:"Publish the status of identities through OCSP and CRL.",sidebar:{group:"VA",label:"Overview"}},h={contents:[{heading:void 0,content:"Issuance proves who signed a certificate; validation tells you whether it should still be accepted. Lamassu publishes status through two complementary mechanisms."},{heading:"choose-a-mechanism",content:"Use **OCSP** when the consumer is online and needs to check the latest status of a specific certificate."},{heading:"choose-a-mechanism",content:"Use a **CRL** when validation must happen locally, offline or over a high volume of certificates. The consumer periodically downloads a signed list and keeps it until the next update."},{heading:"choose-a-mechanism",content:"Many environments use both: OCSP as the primary check and a CRL as the local or fallback mechanism."},{heading:"choose-a-mechanism",content:'<Card title="Online validation with OCSP" description="Query Good, Revoked and Unknown statuses in real time." href="/docs/platform/pki/ocsp" />'},{heading:"choose-a-mechanism",content:'<Card title="Revocation lists" description="Generate, publish and distribute CRLs per authority." href="/docs/platform/pki/crl" />'}],headings:[{id:"choose-a-mechanism",content:"Choose a mechanism"}]};const l=[{depth:2,url:"#choose-a-mechanism",title:e.jsx(e.Fragment,{children:"Choose a mechanism"})}];function a(n){const t={h2:"h2",p:"p",strong:"strong",...n.components},{Card:s,Cards:i}=t;return s||o("Card"),i||o("Cards"),e.jsxs(e.Fragment,{children:[e.jsx(t.p,{children:"Issuance proves who signed a certificate; validation tells you whether it should still be accepted. Lamassu publishes status through two complementary mechanisms."}),`
`,e.jsx(t.h2,{id:"choose-a-mechanism",children:"Choose a mechanism"}),`
`,e.jsxs(t.p,{children:["Use ",e.jsx(t.strong,{children:"OCSP"})," when the consumer is online and needs to check the latest status of a specific certificate."]}),`
`,e.jsxs(t.p,{children:["Use a ",e.jsx(t.strong,{children:"CRL"})," when validation must happen locally, offline or over a high volume of certificates. The consumer periodically downloads a signed list and keeps it until the next update."]}),`
`,e.jsx(t.p,{children:"Many environments use both: OCSP as the primary check and a CRL as the local or fallback mechanism."}),`
`,e.jsxs(i,{children:[e.jsx(s,{title:"Online validation with OCSP",description:"Query Good, Revoked and Unknown statuses in real time.",href:"/docs/platform/pki/ocsp"}),e.jsx(s,{title:"Revocation lists",description:"Generate, publish and distribute CRLs per authority.",href:"/docs/platform/pki/crl"})]})]})}function d(n={}){const{wrapper:t}=n.components||{};return t?e.jsx(t,{...n,children:e.jsx(a,{...n})}):a(n)}function o(n,t){throw new Error("Expected component `"+n+"` to be defined: you likely forgot to import, pass, or provide it.")}const u=Object.freeze(Object.defineProperty({__proto__:null,_markdown:c,default:d,frontmatter:r,structuredData:h,toc:l},Symbol.toStringTag,{value:"Module"}));export{u as _};

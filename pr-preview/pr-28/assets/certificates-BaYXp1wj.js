import{j as e}from"./index-prc0XQdj.js";let h=`

The certificate inventory offers a global view of the identities issued by all authorities. You can also open **Issued Certificates** inside a CA to limit the view to that issuer.

Find a certificate [#find-a-certificate]

Open **Certificates** and filter by:

* Subject's \`Common Name\`.
* Serial number.
* Status.
* Issuing authority.

Use **Quick Inspect** for a quick check or **View Details** to see the subject, SANs, usages, chain, validity period and full metadata.

Download the certificate [#download-the-certificate]

The download action delivers the certificate in PEM format. If the certificate was issued from an external CSR, the private key stays on the system that generated that CSR. If it was generated in the browser, the key was only available when the issuance finished.

Revoke a certificate [#revoke-a-certificate]

Revoke an identity when the key has been compromised, the subject is no longer authorized or the certificate must stop being accepted before it expires.

<Steps>
  <Step>
    Open the action [#open-the-action]

    In the inventory or detail view, select **Revoke Certificate**.
  </Step>

  <Step>
    Choose a reason [#choose-a-reason]

    Select the reason that represents the incident. This information is published in OCSP and in the CRL.
  </Step>

  <Step>
    Confirm and verify [#confirm-and-verify]

    Confirm the operation and check that the status is **Revoked**. If the CA regenerates the CRL upon revocation, also verify that a new version exists.
  </Step>
</Steps>

<Callout type="warn" title="Only CertificateHold is reversible">
  A revocation with the reason \`CertificateHold\` can be reactivated. All other reasons produce a final revocation.
</Callout>

Continue [#continue]

<Cards>
  <Card title="Validate with OCSP" description="Query the status of a certificate in real time." href="/docs/platform/pki/ocsp" />

  <Card title="Distribute a CRL" description="Publish the status for offline validation." href="/docs/platform/pki/crl" />
</Cards>
`,l={title:"Certificates",description:"Inspect, download and revoke the certificates issued by Lamassu.",sidebar:{group:"CA"}},f={contents:[{heading:void 0,content:"The certificate inventory offers a global view of the identities issued by all authorities. You can also open **Issued Certificates** inside a CA to limit the view to that issuer."},{heading:"find-a-certificate",content:"Open **Certificates** and filter by:"},{heading:"find-a-certificate",content:"Subject's `Common Name`."},{heading:"find-a-certificate",content:"Serial number."},{heading:"find-a-certificate",content:"Status."},{heading:"find-a-certificate",content:"Issuing authority."},{heading:"find-a-certificate",content:"Use **Quick Inspect** for a quick check or **View Details** to see the subject, SANs, usages, chain, validity period and full metadata."},{heading:"download-the-certificate",content:"The download action delivers the certificate in PEM format. If the certificate was issued from an external CSR, the private key stays on the system that generated that CSR. If it was generated in the browser, the key was only available when the issuance finished."},{heading:"revoke-a-certificate",content:"Revoke an identity when the key has been compromised, the subject is no longer authorized or the certificate must stop being accepted before it expires."},{heading:"open-the-action",content:"In the inventory or detail view, select **Revoke Certificate**."},{heading:"choose-a-reason",content:"Select the reason that represents the incident. This information is published in OCSP and in the CRL."},{heading:"confirm-and-verify",content:"Confirm the operation and check that the status is **Revoked**. If the CA regenerates the CRL upon revocation, also verify that a new version exists."},{heading:"confirm-and-verify",content:"A revocation with the reason `CertificateHold` can be reactivated. All other reasons produce a final revocation."},{heading:"continue",content:'<Card title="Validate with OCSP" description="Query the status of a certificate in real time." href="/docs/platform/pki/ocsp" />'},{heading:"continue",content:'<Card title="Distribute a CRL" description="Publish the status for offline validation." href="/docs/platform/pki/crl" />'}],headings:[{id:"find-a-certificate",content:"Find a certificate"},{id:"download-the-certificate",content:"Download the certificate"},{id:"revoke-a-certificate",content:"Revoke a certificate"},{id:"open-the-action",content:"Open the action"},{id:"choose-a-reason",content:"Choose a reason"},{id:"confirm-and-verify",content:"Confirm and verify"},{id:"continue",content:"Continue"}]};const u=[{depth:2,url:"#find-a-certificate",title:e.jsx(e.Fragment,{children:"Find a certificate"})},{depth:2,url:"#download-the-certificate",title:e.jsx(e.Fragment,{children:"Download the certificate"})},{depth:2,url:"#revoke-a-certificate",title:e.jsx(e.Fragment,{children:"Revoke a certificate"})},{depth:3,url:"#open-the-action",title:e.jsx(e.Fragment,{children:"Open the action"})},{depth:3,url:"#choose-a-reason",title:e.jsx(e.Fragment,{children:"Choose a reason"})},{depth:3,url:"#confirm-and-verify",title:e.jsx(e.Fragment,{children:"Confirm and verify"})},{depth:2,url:"#continue",title:e.jsx(e.Fragment,{children:"Continue"})}];function d(i){const t={code:"code",h2:"h2",h3:"h3",li:"li",p:"p",strong:"strong",ul:"ul",...i.components},{Callout:r,Card:o,Cards:s,Step:a,Steps:c}=t;return r||n("Callout"),o||n("Card"),s||n("Cards"),a||n("Step"),c||n("Steps"),e.jsxs(e.Fragment,{children:[e.jsxs(t.p,{children:["The certificate inventory offers a global view of the identities issued by all authorities. You can also open ",e.jsx(t.strong,{children:"Issued Certificates"})," inside a CA to limit the view to that issuer."]}),`
`,e.jsx(t.h2,{id:"find-a-certificate",children:"Find a certificate"}),`
`,e.jsxs(t.p,{children:["Open ",e.jsx(t.strong,{children:"Certificates"})," and filter by:"]}),`
`,e.jsxs(t.ul,{children:[`
`,e.jsxs(t.li,{children:["Subject's ",e.jsx(t.code,{children:"Common Name"}),"."]}),`
`,e.jsx(t.li,{children:"Serial number."}),`
`,e.jsx(t.li,{children:"Status."}),`
`,e.jsx(t.li,{children:"Issuing authority."}),`
`]}),`
`,e.jsxs(t.p,{children:["Use ",e.jsx(t.strong,{children:"Quick Inspect"})," for a quick check or ",e.jsx(t.strong,{children:"View Details"})," to see the subject, SANs, usages, chain, validity period and full metadata."]}),`
`,e.jsx(t.h2,{id:"download-the-certificate",children:"Download the certificate"}),`
`,e.jsx(t.p,{children:"The download action delivers the certificate in PEM format. If the certificate was issued from an external CSR, the private key stays on the system that generated that CSR. If it was generated in the browser, the key was only available when the issuance finished."}),`
`,e.jsx(t.h2,{id:"revoke-a-certificate",children:"Revoke a certificate"}),`
`,e.jsx(t.p,{children:"Revoke an identity when the key has been compromised, the subject is no longer authorized or the certificate must stop being accepted before it expires."}),`
`,e.jsxs(c,{children:[e.jsxs(a,{children:[e.jsx(t.h3,{id:"open-the-action",children:"Open the action"}),e.jsxs(t.p,{children:["In the inventory or detail view, select ",e.jsx(t.strong,{children:"Revoke Certificate"}),"."]})]}),e.jsxs(a,{children:[e.jsx(t.h3,{id:"choose-a-reason",children:"Choose a reason"}),e.jsx(t.p,{children:"Select the reason that represents the incident. This information is published in OCSP and in the CRL."})]}),e.jsxs(a,{children:[e.jsx(t.h3,{id:"confirm-and-verify",children:"Confirm and verify"}),e.jsxs(t.p,{children:["Confirm the operation and check that the status is ",e.jsx(t.strong,{children:"Revoked"}),". If the CA regenerates the CRL upon revocation, also verify that a new version exists."]})]})]}),`
`,e.jsx(r,{type:"warn",title:"Only CertificateHold is reversible",children:e.jsxs(t.p,{children:["A revocation with the reason ",e.jsx(t.code,{children:"CertificateHold"})," can be reactivated. All other reasons produce a final revocation."]})}),`
`,e.jsx(t.h2,{id:"continue",children:"Continue"}),`
`,e.jsxs(s,{children:[e.jsx(o,{title:"Validate with OCSP",description:"Query the status of a certificate in real time.",href:"/docs/platform/pki/ocsp"}),e.jsx(o,{title:"Distribute a CRL",description:"Publish the status for offline validation.",href:"/docs/platform/pki/crl"})]})]})}function p(i={}){const{wrapper:t}=i.components||{};return t?e.jsx(t,{...i,children:e.jsx(d,{...i})}):d(i)}function n(i,t){throw new Error("Expected component `"+i+"` to be defined: you likely forgot to import, pass, or provide it.")}const v=Object.freeze(Object.defineProperty({__proto__:null,_markdown:h,default:p,frontmatter:l,structuredData:f,toc:u},Symbol.toStringTag,{value:"Module"}));export{v as _};

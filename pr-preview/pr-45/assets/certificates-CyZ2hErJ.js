import{j as e}from"./index-prc0XQdj.js";let h=`

This guide is for a PKI operator inspecting or retiring an issued identity. You need inventory access and, to change states, permissions on the certificate. Open **Certificates** for a global view or **Issued Certificates** within a CA to restrict it to that issuer.

Find a certificate [#find-a-certificate]

Filter by \`Common Name\`, serial, status and issuer. Use **Quick Inspect** for a quick review or **View Details** for subject, SAN, usages, chain, dates and metadata.

Identify a certificate by issuer and serial; a name can correspond to several renewals. Check which certificate the consumer actually uses and which occupies the device’s active identity. [Identity history](/docs/platform/iot-fleets/device-management) and the certificate inventory answer different questions.

Download the certificate [#download-the-certificate]

Download the PEM and inspect it:

\`\`\`bash
openssl x509 -in device.crt -noout -subject -issuer -serial -dates
openssl x509 -in device.crt -noout -text
\`\`\`

Check [issuance policy](/docs/platform/pki/certificate-profiles), chain and usages with the [verification walkthrough](/docs/platform/pki/quickstarts/issue-certificate). A certificate does not contain its private key. For an external CSR, the key remains where it was generated; for the browser flow, retain the file downloaded upon issuance. If the key is lost, plan a new identity rather than expecting recovery from the certificate.

Issue from an existing CSR [#issue-from-an-existing-csr]

Use this flow when the identity’s key must remain on the system that generated it. You need an active CA with a usable key, a PEM CSR and a suitable profile.

1. Verify the request with \`openssl req -in request.csr -noout -verify -text\`. Review subject, SAN and algorithm, and authorize the requested identity.
2. Start issuance from the CA or inventory and select **Upload Existing CSR**.
3. Confirm the CA and profile resolved according to [Profiles](/docs/platform/pki/certificate-profiles); the request does not guarantee that every field is retained.
4. Download the certificate and inspect dates, issuer, subject, SAN, KU and EKU. Check correspondence with the private key on the originating system.
5. Install certificate and chain in the intended consumer and test a connection. Issuance alone does not register a device or grant access in an integration.

For browser key generation, follow [Issue your first certificate](/docs/platform/pki/quickstarts/issue-certificate).

Revoke a certificate [#revoke-a-certificate]

Revoke when the key is compromised, the subject is no longer authorized or the identity must stop being accepted before expiration. Before changing status, identify consumers and prepare any required replacement.

<Steps>
  <Step>
    Open the action [#open-the-action]

    Locate the correct issuer and serial and select **Revoke Certificate**. \`EXPIRED\` records and records revoked for a final reason reject subsequent status changes.
  </Step>

  <Step>
    Choose a reason [#choose-a-reason]

    Select the incident reason. \`CertificateHold\` represents a reversible certificate suspension; other reasons block later changes. Do not use a suspension to address a compromised key.
  </Step>

  <Step>
    Confirm and verify [#confirm-and-verify]

    Save the change and read the record again: require **REVOKED**, reason and timestamp. Then verify a fresh [OCSP](/docs/platform/pki/ocsp) query and, if using [CRL](/docs/platform/pki/crl), its published version and the serial’s presence. Finally check rejection of a new connection in the consumer.
  </Step>
</Steps>

Revocation does not erase the certificate, delete the key or guarantee closure of existing sessions. Status and publication are separate steps.

<Callout type="warn" title="Only CertificateHold is reversible">
  A certificate revoked with \`CertificateHold\` can be reactivated if it is not in \`EXPIRED\` state. Its dates and consumer trust remain mandatory.
</Callout>

Reactivate a hold [#reactivate-a-hold]

Check that the saved reason is \`CertificateHold\` and the identity still satisfies policy. Request \`ACTIVE\` through the status update operation exposed by your installation; consult the [API reference](/docs/api-reference). Do not assume changing consumer permissions also changes status in Lamassu.

Read the record and query OCSP again. With \`regenerate_on_revoke\` enabled, the reactivation event requests CRL regeneration: check that the new list omits the serial. An earlier list can still mark it revoked until the client refreshes its copy.

This does not undo permanent revocation or a cascade started by revoking a CA.

Continue [#continue]

<Cards>
  <Card title="Validate with OCSP" description="Query and verify a certificate’s signed status." href="/docs/platform/pki/ocsp" />

  <Card title="Distribute a CRL" description="Publish status for local validation." href="/docs/platform/pki/crl" />
</Cards>
`,l={title:"Certificates",description:"Inspect, download and revoke the certificates issued by Lamassu."},f={contents:[{heading:void 0,content:"This guide is for a PKI operator inspecting or retiring an issued identity. You need inventory access and, to change states, permissions on the certificate. Open **Certificates** for a global view or **Issued Certificates** within a CA to restrict it to that issuer."},{heading:"find-a-certificate",content:"Filter by `Common Name`, serial, status and issuer. Use **Quick Inspect** for a quick review or **View Details** for subject, SAN, usages, chain, dates and metadata."},{heading:"find-a-certificate",content:"Identify a certificate by issuer and serial; a name can correspond to several renewals. Check which certificate the consumer actually uses and which occupies the device’s active identity. Identity history and the certificate inventory answer different questions."},{heading:"download-the-certificate",content:"Download the PEM and inspect it:"},{heading:"download-the-certificate",content:"Check issuance policy, chain and usages with the verification walkthrough. A certificate does not contain its private key. For an external CSR, the key remains where it was generated; for the browser flow, retain the file downloaded upon issuance. If the key is lost, plan a new identity rather than expecting recovery from the certificate."},{heading:"issue-from-an-existing-csr",content:"Use this flow when the identity’s key must remain on the system that generated it. You need an active CA with a usable key, a PEM CSR and a suitable profile."},{heading:"issue-from-an-existing-csr",content:"Verify the request with `openssl req -in request.csr -noout -verify -text`. Review subject, SAN and algorithm, and authorize the requested identity."},{heading:"issue-from-an-existing-csr",content:"Start issuance from the CA or inventory and select **Upload Existing CSR**."},{heading:"issue-from-an-existing-csr",content:"Confirm the CA and profile resolved according to Profiles; the request does not guarantee that every field is retained."},{heading:"issue-from-an-existing-csr",content:"Download the certificate and inspect dates, issuer, subject, SAN, KU and EKU. Check correspondence with the private key on the originating system."},{heading:"issue-from-an-existing-csr",content:"Install certificate and chain in the intended consumer and test a connection. Issuance alone does not register a device or grant access in an integration."},{heading:"issue-from-an-existing-csr",content:"For browser key generation, follow Issue your first certificate."},{heading:"revoke-a-certificate",content:"Revoke when the key is compromised, the subject is no longer authorized or the identity must stop being accepted before expiration. Before changing status, identify consumers and prepare any required replacement."},{heading:"open-the-action",content:"Locate the correct issuer and serial and select **Revoke Certificate**. `EXPIRED` records and records revoked for a final reason reject subsequent status changes."},{heading:"choose-a-reason",content:"Select the incident reason. `CertificateHold` represents a reversible certificate suspension; other reasons block later changes. Do not use a suspension to address a compromised key."},{heading:"confirm-and-verify",content:"Save the change and read the record again: require **REVOKED**, reason and timestamp. Then verify a fresh OCSP query and, if using CRL, its published version and the serial’s presence. Finally check rejection of a new connection in the consumer."},{heading:"confirm-and-verify",content:"Revocation does not erase the certificate, delete the key or guarantee closure of existing sessions. Status and publication are separate steps."},{heading:"confirm-and-verify",content:"A certificate revoked with `CertificateHold` can be reactivated if it is not in `EXPIRED` state. Its dates and consumer trust remain mandatory."},{heading:"reactivate-a-hold",content:"Check that the saved reason is `CertificateHold` and the identity still satisfies policy. Request `ACTIVE` through the status update operation exposed by your installation; consult the API reference. Do not assume changing consumer permissions also changes status in Lamassu."},{heading:"reactivate-a-hold",content:"Read the record and query OCSP again. With `regenerate_on_revoke` enabled, the reactivation event requests CRL regeneration: check that the new list omits the serial. An earlier list can still mark it revoked until the client refreshes its copy."},{heading:"reactivate-a-hold",content:"This does not undo permanent revocation or a cascade started by revoking a CA."},{heading:"continue",content:'<Card title="Validate with OCSP" description="Query and verify a certificate’s signed status." href="/docs/platform/pki/ocsp" />'},{heading:"continue",content:'<Card title="Distribute a CRL" description="Publish status for local validation." href="/docs/platform/pki/crl" />'}],headings:[{id:"find-a-certificate",content:"Find a certificate"},{id:"download-the-certificate",content:"Download the certificate"},{id:"issue-from-an-existing-csr",content:"Issue from an existing CSR"},{id:"revoke-a-certificate",content:"Revoke a certificate"},{id:"open-the-action",content:"Open the action"},{id:"choose-a-reason",content:"Choose a reason"},{id:"confirm-and-verify",content:"Confirm and verify"},{id:"reactivate-a-hold",content:"Reactivate a hold"},{id:"continue",content:"Continue"}]};const u=[{depth:2,url:"#find-a-certificate",title:e.jsx(e.Fragment,{children:"Find a certificate"})},{depth:2,url:"#download-the-certificate",title:e.jsx(e.Fragment,{children:"Download the certificate"})},{depth:2,url:"#issue-from-an-existing-csr",title:e.jsx(e.Fragment,{children:"Issue from an existing CSR"})},{depth:2,url:"#revoke-a-certificate",title:e.jsx(e.Fragment,{children:"Revoke a certificate"})},{depth:3,url:"#open-the-action",title:e.jsx(e.Fragment,{children:"Open the action"})},{depth:3,url:"#choose-a-reason",title:e.jsx(e.Fragment,{children:"Choose a reason"})},{depth:3,url:"#confirm-and-verify",title:e.jsx(e.Fragment,{children:"Confirm and verify"})},{depth:2,url:"#reactivate-a-hold",title:e.jsx(e.Fragment,{children:"Reactivate a hold"})},{depth:2,url:"#continue",title:e.jsx(e.Fragment,{children:"Continue"})}];function d(i){const t={a:"a",code:"code",h2:"h2",h3:"h3",li:"li",ol:"ol",p:"p",pre:"pre",span:"span",strong:"strong",...i.components},{Callout:r,Card:a,Cards:o,Step:s,Steps:c}=t;return r||n("Callout"),a||n("Card"),o||n("Cards"),s||n("Step"),c||n("Steps"),e.jsxs(e.Fragment,{children:[e.jsxs(t.p,{children:["This guide is for a PKI operator inspecting or retiring an issued identity. You need inventory access and, to change states, permissions on the certificate. Open ",e.jsx(t.strong,{children:"Certificates"})," for a global view or ",e.jsx(t.strong,{children:"Issued Certificates"})," within a CA to restrict it to that issuer."]}),`
`,e.jsx(t.h2,{id:"find-a-certificate",children:"Find a certificate"}),`
`,e.jsxs(t.p,{children:["Filter by ",e.jsx(t.code,{children:"Common Name"}),", serial, status and issuer. Use ",e.jsx(t.strong,{children:"Quick Inspect"})," for a quick review or ",e.jsx(t.strong,{children:"View Details"})," for subject, SAN, usages, chain, dates and metadata."]}),`
`,e.jsxs(t.p,{children:["Identify a certificate by issuer and serial; a name can correspond to several renewals. Check which certificate the consumer actually uses and which occupies the device’s active identity. ",e.jsx(t.a,{href:"/docs/platform/iot-fleets/device-management",children:"Identity history"})," and the certificate inventory answer different questions."]}),`
`,e.jsx(t.h2,{id:"download-the-certificate",children:"Download the certificate"}),`
`,e.jsx(t.p,{children:"Download the PEM and inspect it:"}),`
`,e.jsx(e.Fragment,{children:e.jsx(t.pre,{className:"shiki shiki-themes min-light min-dark",style:{"--shiki-light":"#24292eff","--shiki-dark":"#b392f0","--shiki-light-bg":"#ffffff","--shiki-dark-bg":"#1f1f1f"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsxs(t.code,{children:[e.jsxs(t.span,{className:"line",children:[e.jsx(t.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"openssl"}),e.jsx(t.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" x509"}),e.jsx(t.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" -in"}),e.jsx(t.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" device.crt"}),e.jsx(t.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" -noout"}),e.jsx(t.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" -subject"}),e.jsx(t.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" -issuer"}),e.jsx(t.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" -serial"}),e.jsx(t.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" -dates"})]}),`
`,e.jsxs(t.span,{className:"line",children:[e.jsx(t.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"openssl"}),e.jsx(t.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" x509"}),e.jsx(t.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" -in"}),e.jsx(t.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" device.crt"}),e.jsx(t.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" -noout"}),e.jsx(t.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" -text"})]})]})})}),`
`,e.jsxs(t.p,{children:["Check ",e.jsx(t.a,{href:"/docs/platform/pki/certificate-profiles",children:"issuance policy"}),", chain and usages with the ",e.jsx(t.a,{href:"/docs/platform/pki/quickstarts/issue-certificate",children:"verification walkthrough"}),". A certificate does not contain its private key. For an external CSR, the key remains where it was generated; for the browser flow, retain the file downloaded upon issuance. If the key is lost, plan a new identity rather than expecting recovery from the certificate."]}),`
`,e.jsx(t.h2,{id:"issue-from-an-existing-csr",children:"Issue from an existing CSR"}),`
`,e.jsx(t.p,{children:"Use this flow when the identity’s key must remain on the system that generated it. You need an active CA with a usable key, a PEM CSR and a suitable profile."}),`
`,e.jsxs(t.ol,{children:[`
`,e.jsxs(t.li,{children:["Verify the request with ",e.jsx(t.code,{children:"openssl req -in request.csr -noout -verify -text"}),". Review subject, SAN and algorithm, and authorize the requested identity."]}),`
`,e.jsxs(t.li,{children:["Start issuance from the CA or inventory and select ",e.jsx(t.strong,{children:"Upload Existing CSR"}),"."]}),`
`,e.jsxs(t.li,{children:["Confirm the CA and profile resolved according to ",e.jsx(t.a,{href:"/docs/platform/pki/certificate-profiles",children:"Profiles"}),"; the request does not guarantee that every field is retained."]}),`
`,e.jsx(t.li,{children:"Download the certificate and inspect dates, issuer, subject, SAN, KU and EKU. Check correspondence with the private key on the originating system."}),`
`,e.jsx(t.li,{children:"Install certificate and chain in the intended consumer and test a connection. Issuance alone does not register a device or grant access in an integration."}),`
`]}),`
`,e.jsxs(t.p,{children:["For browser key generation, follow ",e.jsx(t.a,{href:"/docs/platform/pki/quickstarts/issue-certificate",children:"Issue your first certificate"}),"."]}),`
`,e.jsx(t.h2,{id:"revoke-a-certificate",children:"Revoke a certificate"}),`
`,e.jsx(t.p,{children:"Revoke when the key is compromised, the subject is no longer authorized or the identity must stop being accepted before expiration. Before changing status, identify consumers and prepare any required replacement."}),`
`,e.jsxs(c,{children:[e.jsxs(s,{children:[e.jsx(t.h3,{id:"open-the-action",children:"Open the action"}),e.jsxs(t.p,{children:["Locate the correct issuer and serial and select ",e.jsx(t.strong,{children:"Revoke Certificate"}),". ",e.jsx(t.code,{children:"EXPIRED"})," records and records revoked for a final reason reject subsequent status changes."]})]}),e.jsxs(s,{children:[e.jsx(t.h3,{id:"choose-a-reason",children:"Choose a reason"}),e.jsxs(t.p,{children:["Select the incident reason. ",e.jsx(t.code,{children:"CertificateHold"})," represents a reversible certificate suspension; other reasons block later changes. Do not use a suspension to address a compromised key."]})]}),e.jsxs(s,{children:[e.jsx(t.h3,{id:"confirm-and-verify",children:"Confirm and verify"}),e.jsxs(t.p,{children:["Save the change and read the record again: require ",e.jsx(t.strong,{children:"REVOKED"}),", reason and timestamp. Then verify a fresh ",e.jsx(t.a,{href:"/docs/platform/pki/ocsp",children:"OCSP"})," query and, if using ",e.jsx(t.a,{href:"/docs/platform/pki/crl",children:"CRL"}),", its published version and the serial’s presence. Finally check rejection of a new connection in the consumer."]})]})]}),`
`,e.jsx(t.p,{children:"Revocation does not erase the certificate, delete the key or guarantee closure of existing sessions. Status and publication are separate steps."}),`
`,e.jsx(r,{type:"warn",title:"Only CertificateHold is reversible",children:e.jsxs(t.p,{children:["A certificate revoked with ",e.jsx(t.code,{children:"CertificateHold"})," can be reactivated if it is not in ",e.jsx(t.code,{children:"EXPIRED"})," state. Its dates and consumer trust remain mandatory."]})}),`
`,e.jsx(t.h2,{id:"reactivate-a-hold",children:"Reactivate a hold"}),`
`,e.jsxs(t.p,{children:["Check that the saved reason is ",e.jsx(t.code,{children:"CertificateHold"})," and the identity still satisfies policy. Request ",e.jsx(t.code,{children:"ACTIVE"})," through the status update operation exposed by your installation; consult the ",e.jsx(t.a,{href:"/docs/api-reference",children:"API reference"}),". Do not assume changing consumer permissions also changes status in Lamassu."]}),`
`,e.jsxs(t.p,{children:["Read the record and query OCSP again. With ",e.jsx(t.code,{children:"regenerate_on_revoke"})," enabled, the reactivation event requests CRL regeneration: check that the new list omits the serial. An earlier list can still mark it revoked until the client refreshes its copy."]}),`
`,e.jsx(t.p,{children:"This does not undo permanent revocation or a cascade started by revoking a CA."}),`
`,e.jsx(t.h2,{id:"continue",children:"Continue"}),`
`,e.jsxs(o,{children:[e.jsx(a,{title:"Validate with OCSP",description:"Query and verify a certificate’s signed status.",href:"/docs/platform/pki/ocsp"}),e.jsx(a,{title:"Distribute a CRL",description:"Publish status for local validation.",href:"/docs/platform/pki/crl"})]})]})}function p(i={}){const{wrapper:t}=i.components||{};return t?e.jsx(t,{...i,children:e.jsx(d,{...i})}):d(i)}function n(i,t){throw new Error("Expected component `"+i+"` to be defined: you likely forgot to import, pass, or provide it.")}const m=Object.freeze(Object.defineProperty({__proto__:null,_markdown:h,default:p,frontmatter:l,structuredData:f,toc:u},Symbol.toStringTag,{value:"Module"}));export{m as _};

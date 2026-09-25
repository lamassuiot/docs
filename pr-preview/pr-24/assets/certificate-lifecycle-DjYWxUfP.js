import{j as e}from"./index-prc0XQdj.js";let c=`

Issuing a certificate is only the beginning. During its useful life you must check its validity, renew it before it expires and retire it when it stops being trustworthy. Lamassu keeps the certificate, its issuing CA, its status and, when it belongs to a device, the identity it is linked to.

The full journey [#the-full-journey]

<Steps>
  <Step>
    Request [#request]

    The requester generates a key and a CSR. In the recommended flows, the private key stays in the device, browser or cryptographic engine that created it.
  </Step>

  <Step>
    Issuance [#issuance]

    The CA signs the CSR. The [issuance profile](/docs/platform/pki/certificate-profiles) determines the validity, uses, subject, allowed extensions and cryptographic constraints.
  </Step>

  <Step>
    Use and monitoring [#use-and-monitoring]

    The certificate enters the \`ACTIVE\` state. Lamassu monitors its \`Not After\` date; the cryptographic monitoring job marks certificates that have expired as \`EXPIRED\`.
  </Step>

  <Step>
    Renewal or re-enrollment [#renewal-or-re-enrollment]

    A new certificate is issued before the previous one expires. In a DMS you can open preventive and critical windows so the device re-enrolls through EST.
  </Step>

  <Step>
    Revocation or retirement [#revocation-or-retirement]

    If the identity stops being trustworthy, Lamassu records the reason and time of revocation. OCSP and CRLs let consumers learn that status.
  </Step>
</Steps>

Certificate states [#certificate-states]

Lamassu persists four X.509 states:

* **\`ACTIVE\`**: the certificate is enabled and within its validity period.
* **\`EXPIRED\`**: it has passed its expiration date. The monitor detects this periodically; it is not a state that should be assigned manually.
* **\`REVOKED\`**: it was invalidated before expiring, with a reason and a timestamp.
* **\`INACTIVE\`**: it is disabled without representing a definitive revocation.

The device view may add operational states such as missing identity, pending renewal, expiring soon or decommissioned. These are an interpretation of the device's status and its certificates, not new X.509 states.

Renewal and revocation are not equivalent [#renewal-and-revocation-are-not-equivalent]

**Renewal** creates a successor certificate for an identity that remains valid. **Revocation** communicates that the current certificate must no longer be accepted. Renew to maintain continuity; revoke in response to compromise, retirement or a change that invalidates the identity.

Only a revocation with the reason \`CertificateHold\` can be undone. A revocation with any other reason is final in Lamassu.

<Callout type="info" title="Reissuing a CA reuses its key">
  The **Reissue CA** operation generates another certificate for the same key and links both serial numbers through metadata. It is not a key rotation. To change the key, create a successor CA and perform a migration with an overlapping period.
</Callout>

Effect of revoking a CA [#effect-of-revoking-a-ca]

Revoking a CA is a cascading operation. Lamassu revokes its child CAs and the certificates it issued, with the reason \`CessationOfOperation\`. The propagation continues down the hierarchy.

Before confirming:

1. Identify DMSs, devices and services that trust that chain.
2. Distribute the new chain of trust.
3. Reissue the necessary identities.
4. Check OCSP and CRL from a real consumer.
5. Revoke the old CA once no legitimate traffic remains.

<Callout type="warn" title="Decommission is irreversible">
  Decommissioning a device revokes its certificates and prevents it from obtaining new identities. Use this action only when the device is being retired permanently.
</Callout>

What you should watch [#what-you-should-watch]

* Certificates entering the preventive or critical renewal window.
* Repeated enrollment or re-enrollment failures.
* Status changes and revocation reasons.
* OCSP and CRL publication and validity.
* Dependencies still presenting a replaced certificate.

The device history relates its previous and current identities. For administrative changes and mutation errors, see [Audit logs](/docs/platform/pki/audit-logs).
`,d={title:"Certificate lifecycle",description:"Issuance, use, renewal, revocation and retirement of certificates in Lamassu."},h={contents:[{heading:void 0,content:"Issuing a certificate is only the beginning. During its useful life you must check its validity, renew it before it expires and retire it when it stops being trustworthy. Lamassu keeps the certificate, its issuing CA, its status and, when it belongs to a device, the identity it is linked to."},{heading:"request",content:"The requester generates a key and a CSR. In the recommended flows, the private key stays in the device, browser or cryptographic engine that created it."},{heading:"issuance",content:"The CA signs the CSR. The issuance profile determines the validity, uses, subject, allowed extensions and cryptographic constraints."},{heading:"use-and-monitoring",content:"The certificate enters the `ACTIVE` state. Lamassu monitors its `Not After` date; the cryptographic monitoring job marks certificates that have expired as `EXPIRED`."},{heading:"renewal-or-re-enrollment",content:"A new certificate is issued before the previous one expires. In a DMS you can open preventive and critical windows so the device re-enrolls through EST."},{heading:"revocation-or-retirement",content:"If the identity stops being trustworthy, Lamassu records the reason and time of revocation. OCSP and CRLs let consumers learn that status."},{heading:"certificate-states",content:"Lamassu persists four X.509 states:"},{heading:"certificate-states",content:"**`ACTIVE`**: the certificate is enabled and within its validity period."},{heading:"certificate-states",content:"**`EXPIRED`**: it has passed its expiration date. The monitor detects this periodically; it is not a state that should be assigned manually."},{heading:"certificate-states",content:"**`REVOKED`**: it was invalidated before expiring, with a reason and a timestamp."},{heading:"certificate-states",content:"**`INACTIVE`**: it is disabled without representing a definitive revocation."},{heading:"certificate-states",content:"The device view may add operational states such as missing identity, pending renewal, expiring soon or decommissioned. These are an interpretation of the device's status and its certificates, not new X.509 states."},{heading:"renewal-and-revocation-are-not-equivalent",content:"**Renewal** creates a successor certificate for an identity that remains valid. **Revocation** communicates that the current certificate must no longer be accepted. Renew to maintain continuity; revoke in response to compromise, retirement or a change that invalidates the identity."},{heading:"renewal-and-revocation-are-not-equivalent",content:"Only a revocation with the reason `CertificateHold` can be undone. A revocation with any other reason is final in Lamassu."},{heading:"renewal-and-revocation-are-not-equivalent",content:"The **Reissue CA** operation generates another certificate for the same key and links both serial numbers through metadata. It is not a key rotation. To change the key, create a successor CA and perform a migration with an overlapping period."},{heading:"effect-of-revoking-a-ca",content:"Revoking a CA is a cascading operation. Lamassu revokes its child CAs and the certificates it issued, with the reason `CessationOfOperation`. The propagation continues down the hierarchy."},{heading:"effect-of-revoking-a-ca",content:"Before confirming:"},{heading:"effect-of-revoking-a-ca",content:"Identify DMSs, devices and services that trust that chain."},{heading:"effect-of-revoking-a-ca",content:"Distribute the new chain of trust."},{heading:"effect-of-revoking-a-ca",content:"Reissue the necessary identities."},{heading:"effect-of-revoking-a-ca",content:"Check OCSP and CRL from a real consumer."},{heading:"effect-of-revoking-a-ca",content:"Revoke the old CA once no legitimate traffic remains."},{heading:"effect-of-revoking-a-ca",content:"Decommissioning a device revokes its certificates and prevents it from obtaining new identities. Use this action only when the device is being retired permanently."},{heading:"what-you-should-watch",content:"Certificates entering the preventive or critical renewal window."},{heading:"what-you-should-watch",content:"Repeated enrollment or re-enrollment failures."},{heading:"what-you-should-watch",content:"Status changes and revocation reasons."},{heading:"what-you-should-watch",content:"OCSP and CRL publication and validity."},{heading:"what-you-should-watch",content:"Dependencies still presenting a replaced certificate."},{heading:"what-you-should-watch",content:"The device history relates its previous and current identities. For administrative changes and mutation errors, see Audit logs."}],headings:[{id:"the-full-journey",content:"The full journey"},{id:"request",content:"Request"},{id:"issuance",content:"Issuance"},{id:"use-and-monitoring",content:"Use and monitoring"},{id:"renewal-or-re-enrollment",content:"Renewal or re-enrollment"},{id:"revocation-or-retirement",content:"Revocation or retirement"},{id:"certificate-states",content:"Certificate states"},{id:"renewal-and-revocation-are-not-equivalent",content:"Renewal and revocation are not equivalent"},{id:"effect-of-revoking-a-ca",content:"Effect of revoking a CA"},{id:"what-you-should-watch",content:"What you should watch"}]};const l=[{depth:2,url:"#the-full-journey",title:e.jsx(e.Fragment,{children:"The full journey"})},{depth:3,url:"#request",title:e.jsx(e.Fragment,{children:"Request"})},{depth:3,url:"#issuance",title:e.jsx(e.Fragment,{children:"Issuance"})},{depth:3,url:"#use-and-monitoring",title:e.jsx(e.Fragment,{children:"Use and monitoring"})},{depth:3,url:"#renewal-or-re-enrollment",title:e.jsx(e.Fragment,{children:"Renewal or re-enrollment"})},{depth:3,url:"#revocation-or-retirement",title:e.jsx(e.Fragment,{children:"Revocation or retirement"})},{depth:2,url:"#certificate-states",title:e.jsx(e.Fragment,{children:"Certificate states"})},{depth:2,url:"#renewal-and-revocation-are-not-equivalent",title:e.jsx(e.Fragment,{children:"Renewal and revocation are not equivalent"})},{depth:2,url:"#effect-of-revoking-a-ca",title:e.jsx(e.Fragment,{children:"Effect of revoking a CA"})},{depth:2,url:"#what-you-should-watch",title:e.jsx(e.Fragment,{children:"What you should watch"})}];function o(n){const t={a:"a",code:"code",h2:"h2",h3:"h3",li:"li",ol:"ol",p:"p",strong:"strong",ul:"ul",...n.components},{Callout:a,Step:i,Steps:r}=t;return a||s("Callout"),i||s("Step"),r||s("Steps"),e.jsxs(e.Fragment,{children:[e.jsx(t.p,{children:"Issuing a certificate is only the beginning. During its useful life you must check its validity, renew it before it expires and retire it when it stops being trustworthy. Lamassu keeps the certificate, its issuing CA, its status and, when it belongs to a device, the identity it is linked to."}),`
`,e.jsx(t.h2,{id:"the-full-journey",children:"The full journey"}),`
`,e.jsxs(r,{children:[e.jsxs(i,{children:[e.jsx(t.h3,{id:"request",children:"Request"}),e.jsx(t.p,{children:"The requester generates a key and a CSR. In the recommended flows, the private key stays in the device, browser or cryptographic engine that created it."})]}),e.jsxs(i,{children:[e.jsx(t.h3,{id:"issuance",children:"Issuance"}),e.jsxs(t.p,{children:["The CA signs the CSR. The ",e.jsx(t.a,{href:"/docs/platform/pki/certificate-profiles",children:"issuance profile"})," determines the validity, uses, subject, allowed extensions and cryptographic constraints."]})]}),e.jsxs(i,{children:[e.jsx(t.h3,{id:"use-and-monitoring",children:"Use and monitoring"}),e.jsxs(t.p,{children:["The certificate enters the ",e.jsx(t.code,{children:"ACTIVE"})," state. Lamassu monitors its ",e.jsx(t.code,{children:"Not After"})," date; the cryptographic monitoring job marks certificates that have expired as ",e.jsx(t.code,{children:"EXPIRED"}),"."]})]}),e.jsxs(i,{children:[e.jsx(t.h3,{id:"renewal-or-re-enrollment",children:"Renewal or re-enrollment"}),e.jsx(t.p,{children:"A new certificate is issued before the previous one expires. In a DMS you can open preventive and critical windows so the device re-enrolls through EST."})]}),e.jsxs(i,{children:[e.jsx(t.h3,{id:"revocation-or-retirement",children:"Revocation or retirement"}),e.jsx(t.p,{children:"If the identity stops being trustworthy, Lamassu records the reason and time of revocation. OCSP and CRLs let consumers learn that status."})]})]}),`
`,e.jsx(t.h2,{id:"certificate-states",children:"Certificate states"}),`
`,e.jsx(t.p,{children:"Lamassu persists four X.509 states:"}),`
`,e.jsxs(t.ul,{children:[`
`,e.jsxs(t.li,{children:[e.jsx(t.strong,{children:e.jsx(t.code,{children:"ACTIVE"})}),": the certificate is enabled and within its validity period."]}),`
`,e.jsxs(t.li,{children:[e.jsx(t.strong,{children:e.jsx(t.code,{children:"EXPIRED"})}),": it has passed its expiration date. The monitor detects this periodically; it is not a state that should be assigned manually."]}),`
`,e.jsxs(t.li,{children:[e.jsx(t.strong,{children:e.jsx(t.code,{children:"REVOKED"})}),": it was invalidated before expiring, with a reason and a timestamp."]}),`
`,e.jsxs(t.li,{children:[e.jsx(t.strong,{children:e.jsx(t.code,{children:"INACTIVE"})}),": it is disabled without representing a definitive revocation."]}),`
`]}),`
`,e.jsx(t.p,{children:"The device view may add operational states such as missing identity, pending renewal, expiring soon or decommissioned. These are an interpretation of the device's status and its certificates, not new X.509 states."}),`
`,e.jsx(t.h2,{id:"renewal-and-revocation-are-not-equivalent",children:"Renewal and revocation are not equivalent"}),`
`,e.jsxs(t.p,{children:[e.jsx(t.strong,{children:"Renewal"})," creates a successor certificate for an identity that remains valid. ",e.jsx(t.strong,{children:"Revocation"})," communicates that the current certificate must no longer be accepted. Renew to maintain continuity; revoke in response to compromise, retirement or a change that invalidates the identity."]}),`
`,e.jsxs(t.p,{children:["Only a revocation with the reason ",e.jsx(t.code,{children:"CertificateHold"})," can be undone. A revocation with any other reason is final in Lamassu."]}),`
`,e.jsx(a,{type:"info",title:"Reissuing a CA reuses its key",children:e.jsxs(t.p,{children:["The ",e.jsx(t.strong,{children:"Reissue CA"})," operation generates another certificate for the same key and links both serial numbers through metadata. It is not a key rotation. To change the key, create a successor CA and perform a migration with an overlapping period."]})}),`
`,e.jsx(t.h2,{id:"effect-of-revoking-a-ca",children:"Effect of revoking a CA"}),`
`,e.jsxs(t.p,{children:["Revoking a CA is a cascading operation. Lamassu revokes its child CAs and the certificates it issued, with the reason ",e.jsx(t.code,{children:"CessationOfOperation"}),". The propagation continues down the hierarchy."]}),`
`,e.jsx(t.p,{children:"Before confirming:"}),`
`,e.jsxs(t.ol,{children:[`
`,e.jsx(t.li,{children:"Identify DMSs, devices and services that trust that chain."}),`
`,e.jsx(t.li,{children:"Distribute the new chain of trust."}),`
`,e.jsx(t.li,{children:"Reissue the necessary identities."}),`
`,e.jsx(t.li,{children:"Check OCSP and CRL from a real consumer."}),`
`,e.jsx(t.li,{children:"Revoke the old CA once no legitimate traffic remains."}),`
`]}),`
`,e.jsx(a,{type:"warn",title:"Decommission is irreversible",children:e.jsx(t.p,{children:"Decommissioning a device revokes its certificates and prevents it from obtaining new identities. Use this action only when the device is being retired permanently."})}),`
`,e.jsx(t.h2,{id:"what-you-should-watch",children:"What you should watch"}),`
`,e.jsxs(t.ul,{children:[`
`,e.jsx(t.li,{children:"Certificates entering the preventive or critical renewal window."}),`
`,e.jsx(t.li,{children:"Repeated enrollment or re-enrollment failures."}),`
`,e.jsx(t.li,{children:"Status changes and revocation reasons."}),`
`,e.jsx(t.li,{children:"OCSP and CRL publication and validity."}),`
`,e.jsx(t.li,{children:"Dependencies still presenting a replaced certificate."}),`
`]}),`
`,e.jsxs(t.p,{children:["The device history relates its previous and current identities. For administrative changes and mutation errors, see ",e.jsx(t.a,{href:"/docs/platform/pki/audit-logs",children:"Audit logs"}),"."]})]})}function u(n={}){const{wrapper:t}=n.components||{};return t?e.jsx(t,{...n,children:e.jsx(o,{...n})}):o(n)}function s(n,t){throw new Error("Expected component `"+n+"` to be defined: you likely forgot to import, pass, or provide it.")}const p=Object.freeze(Object.defineProperty({__proto__:null,_markdown:c,default:u,frontmatter:d,structuredData:h,toc:l},Symbol.toStringTag,{value:"Module"}));export{p as _};

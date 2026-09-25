import{j as e}from"./index-prc0XQdj.js";let o=`

In Lamassu, trust does not simply mean that a certificate exists in the inventory. A consumer trusts an identity when it can build a chain to a root it recognizes, check that the certificate is fit for the intended use and verify that it is still valid.

The four trust decisions [#the-four-trust-decisions]

Who can issue [#who-can-issue]

The CA hierarchy defines which authorities can sign. A root CA establishes the anchor of trust; intermediate CAs separate operating domains and avoid using the root for every issuance.

What can be issued [#what-can-be-issued]

[Certificate profiles](/docs/platform/pki/certificate-profiles) limit validity, subject, uses, extensions and cryptographic parameters. Possessing a CA does not replace an issuance policy.

Who can request it [#who-can-request-it]

The DMS acts as the enrollment point. It can authenticate an EST request with a client certificate, an external webhook or a combination of both. CAs configured to validate the requester do not have to be the CA that will issue the new identity.

Who accepts the result [#who-accepts-the-result]

The consuming service or device keeps its own trust store. Lamassu can distribute the system CA, the enrollment CA and other managed CAs through \`/cacerts\`, but the consumer decides which ones it installs and how it applies validation.

Identity flow [#identity-flow]

1. The device proves it can enroll according to the DMS policy.
2. The DMS validates the request and forwards the CSR to the enrollment CA.
3. The CA applies the profile and signs without ever receiving the device's private key.
4. The device installs the certificate and the chain it needs.
5. The system that trusts the device validates the chain, dates, uses and revocation status.

<Callout type="info" title="Authentication and authorization are different boundaries">
  OIDC or X.509 identifies the operator calling Lamassu. The authorization service decides which actions it may perform. The X.509 hierarchy, on the other hand, determines whether a certificate presented by a device is trustworthy.
</Callout>

Enrollment, validation and distribution CAs [#enrollment-validation-and-distribution-cas]

A DMS relates three sets that are worth designing separately:

* **Enrollment CA:** signs the new identities.
* **Validation CAs:** authenticate the client certificates used for enrollment or migration. During re-enrollment, Lamassu tries the enrollment CA first and then the additional validation CAs.
* **Distributed CAs:** form the content the device obtains through EST \`/cacerts\`. You can include the system CA, the enrollment CA and a list of managed CAs.

This separation makes it possible to migrate a fleet: you temporarily accept certificates from the old hierarchy, issue with the new one and distribute both chains during the overlap.

Validation and revocation [#validation-and-revocation]

A valid chain does not by itself guarantee that a certificate should be accepted. The consumer must also check:

* that the current date is between \`Not Before\` and \`Not After\`;
* that \`Key Usage\` and \`Extended Key Usage\` allow the operation;
* that names, SANs and subject match the expected identity;
* that the certificate does not appear revoked in [OCSP](/docs/platform/pki/ocsp) or a [CRL](/docs/platform/pki/crl).

During the mTLS authentication of a DMS, Lamassu attempts to check revocation. If the certificate does not contain enough information to perform that check, the backend logs a warning and continues treating it as not revoked. Design your profiles and distribution points to avoid that situation in production.

Custody limits [#custody-limits]

The KMS keeps the reference to the key and delegates the operation to the configured engine. With an HSM or a cloud KMS, the private key can remain non-exportable. That protects custody, but it does not by itself prevent misuse: you still must restrict who can request a signature and audit those operations.

Recommended pattern [#recommended-pattern]

* Keep the root out of daily operations, or with very restricted access.
* Issue from intermediate CAs separated by environment or risk domain.
* Assign explicit profiles to every use case.
* Distribute the new trust before starting a rotation.
* Keep enough overlap to renew a disconnected fleet.
* Validate from the consuming system, not only from the Lamassu console.

Continue with [CA hierarchy and rotation](/docs/platform/pki/ca-hierarchy-and-rotation) to turn this model into an operating procedure.
`,s={title:"Trust model",description:"Understand where trust originates, how it is distributed and what each component validates."},r={contents:[{heading:void 0,content:"In Lamassu, trust does not simply mean that a certificate exists in the inventory. A consumer trusts an identity when it can build a chain to a root it recognizes, check that the certificate is fit for the intended use and verify that it is still valid."},{heading:"who-can-issue",content:"The CA hierarchy defines which authorities can sign. A root CA establishes the anchor of trust; intermediate CAs separate operating domains and avoid using the root for every issuance."},{heading:"what-can-be-issued",content:"Certificate profiles limit validity, subject, uses, extensions and cryptographic parameters. Possessing a CA does not replace an issuance policy."},{heading:"who-can-request-it",content:"The DMS acts as the enrollment point. It can authenticate an EST request with a client certificate, an external webhook or a combination of both. CAs configured to validate the requester do not have to be the CA that will issue the new identity."},{heading:"who-accepts-the-result",content:"The consuming service or device keeps its own trust store. Lamassu can distribute the system CA, the enrollment CA and other managed CAs through `/cacerts`, but the consumer decides which ones it installs and how it applies validation."},{heading:"identity-flow",content:"The device proves it can enroll according to the DMS policy."},{heading:"identity-flow",content:"The DMS validates the request and forwards the CSR to the enrollment CA."},{heading:"identity-flow",content:"The CA applies the profile and signs without ever receiving the device's private key."},{heading:"identity-flow",content:"The device installs the certificate and the chain it needs."},{heading:"identity-flow",content:"The system that trusts the device validates the chain, dates, uses and revocation status."},{heading:"identity-flow",content:"OIDC or X.509 identifies the operator calling Lamassu. The authorization service decides which actions it may perform. The X.509 hierarchy, on the other hand, determines whether a certificate presented by a device is trustworthy."},{heading:"enrollment-validation-and-distribution-cas",content:"A DMS relates three sets that are worth designing separately:"},{heading:"enrollment-validation-and-distribution-cas",content:"**Enrollment CA:** signs the new identities."},{heading:"enrollment-validation-and-distribution-cas",content:"**Validation CAs:** authenticate the client certificates used for enrollment or migration. During re-enrollment, Lamassu tries the enrollment CA first and then the additional validation CAs."},{heading:"enrollment-validation-and-distribution-cas",content:"**Distributed CAs:** form the content the device obtains through EST `/cacerts`. You can include the system CA, the enrollment CA and a list of managed CAs."},{heading:"enrollment-validation-and-distribution-cas",content:"This separation makes it possible to migrate a fleet: you temporarily accept certificates from the old hierarchy, issue with the new one and distribute both chains during the overlap."},{heading:"validation-and-revocation",content:"A valid chain does not by itself guarantee that a certificate should be accepted. The consumer must also check:"},{heading:"validation-and-revocation",content:"that the current date is between `Not Before` and `Not After`;"},{heading:"validation-and-revocation",content:"that `Key Usage` and `Extended Key Usage` allow the operation;"},{heading:"validation-and-revocation",content:"that names, SANs and subject match the expected identity;"},{heading:"validation-and-revocation",content:"that the certificate does not appear revoked in OCSP or a CRL."},{heading:"validation-and-revocation",content:"During the mTLS authentication of a DMS, Lamassu attempts to check revocation. If the certificate does not contain enough information to perform that check, the backend logs a warning and continues treating it as not revoked. Design your profiles and distribution points to avoid that situation in production."},{heading:"custody-limits",content:"The KMS keeps the reference to the key and delegates the operation to the configured engine. With an HSM or a cloud KMS, the private key can remain non-exportable. That protects custody, but it does not by itself prevent misuse: you still must restrict who can request a signature and audit those operations."},{heading:"recommended-pattern",content:"Keep the root out of daily operations, or with very restricted access."},{heading:"recommended-pattern",content:"Issue from intermediate CAs separated by environment or risk domain."},{heading:"recommended-pattern",content:"Assign explicit profiles to every use case."},{heading:"recommended-pattern",content:"Distribute the new trust before starting a rotation."},{heading:"recommended-pattern",content:"Keep enough overlap to renew a disconnected fleet."},{heading:"recommended-pattern",content:"Validate from the consuming system, not only from the Lamassu console."},{heading:"recommended-pattern",content:"Continue with CA hierarchy and rotation to turn this model into an operating procedure."}],headings:[{id:"the-four-trust-decisions",content:"The four trust decisions"},{id:"who-can-issue",content:"Who can issue"},{id:"what-can-be-issued",content:"What can be issued"},{id:"who-can-request-it",content:"Who can request it"},{id:"who-accepts-the-result",content:"Who accepts the result"},{id:"identity-flow",content:"Identity flow"},{id:"enrollment-validation-and-distribution-cas",content:"Enrollment, validation and distribution CAs"},{id:"validation-and-revocation",content:"Validation and revocation"},{id:"custody-limits",content:"Custody limits"},{id:"recommended-pattern",content:"Recommended pattern"}]};const d=[{depth:2,url:"#the-four-trust-decisions",title:e.jsx(e.Fragment,{children:"The four trust decisions"})},{depth:3,url:"#who-can-issue",title:e.jsx(e.Fragment,{children:"Who can issue"})},{depth:3,url:"#what-can-be-issued",title:e.jsx(e.Fragment,{children:"What can be issued"})},{depth:3,url:"#who-can-request-it",title:e.jsx(e.Fragment,{children:"Who can request it"})},{depth:3,url:"#who-accepts-the-result",title:e.jsx(e.Fragment,{children:"Who accepts the result"})},{depth:2,url:"#identity-flow",title:e.jsx(e.Fragment,{children:"Identity flow"})},{depth:2,url:"#enrollment-validation-and-distribution-cas",title:e.jsx(e.Fragment,{children:"Enrollment, validation and distribution CAs"})},{depth:2,url:"#validation-and-revocation",title:e.jsx(e.Fragment,{children:"Validation and revocation"})},{depth:2,url:"#custody-limits",title:e.jsx(e.Fragment,{children:"Custody limits"})},{depth:2,url:"#recommended-pattern",title:e.jsx(e.Fragment,{children:"Recommended pattern"})}];function a(n){const t={a:"a",code:"code",h2:"h2",h3:"h3",li:"li",ol:"ol",p:"p",strong:"strong",ul:"ul",...n.components},{Callout:i}=t;return i||h("Callout"),e.jsxs(e.Fragment,{children:[e.jsx(t.p,{children:"In Lamassu, trust does not simply mean that a certificate exists in the inventory. A consumer trusts an identity when it can build a chain to a root it recognizes, check that the certificate is fit for the intended use and verify that it is still valid."}),`
`,e.jsx(t.h2,{id:"the-four-trust-decisions",children:"The four trust decisions"}),`
`,e.jsx(t.h3,{id:"who-can-issue",children:"Who can issue"}),`
`,e.jsx(t.p,{children:"The CA hierarchy defines which authorities can sign. A root CA establishes the anchor of trust; intermediate CAs separate operating domains and avoid using the root for every issuance."}),`
`,e.jsx(t.h3,{id:"what-can-be-issued",children:"What can be issued"}),`
`,e.jsxs(t.p,{children:[e.jsx(t.a,{href:"/docs/platform/pki/certificate-profiles",children:"Certificate profiles"})," limit validity, subject, uses, extensions and cryptographic parameters. Possessing a CA does not replace an issuance policy."]}),`
`,e.jsx(t.h3,{id:"who-can-request-it",children:"Who can request it"}),`
`,e.jsx(t.p,{children:"The DMS acts as the enrollment point. It can authenticate an EST request with a client certificate, an external webhook or a combination of both. CAs configured to validate the requester do not have to be the CA that will issue the new identity."}),`
`,e.jsx(t.h3,{id:"who-accepts-the-result",children:"Who accepts the result"}),`
`,e.jsxs(t.p,{children:["The consuming service or device keeps its own trust store. Lamassu can distribute the system CA, the enrollment CA and other managed CAs through ",e.jsx(t.code,{children:"/cacerts"}),", but the consumer decides which ones it installs and how it applies validation."]}),`
`,e.jsx(t.h2,{id:"identity-flow",children:"Identity flow"}),`
`,e.jsxs(t.ol,{children:[`
`,e.jsx(t.li,{children:"The device proves it can enroll according to the DMS policy."}),`
`,e.jsx(t.li,{children:"The DMS validates the request and forwards the CSR to the enrollment CA."}),`
`,e.jsx(t.li,{children:"The CA applies the profile and signs without ever receiving the device's private key."}),`
`,e.jsx(t.li,{children:"The device installs the certificate and the chain it needs."}),`
`,e.jsx(t.li,{children:"The system that trusts the device validates the chain, dates, uses and revocation status."}),`
`]}),`
`,e.jsx(i,{type:"info",title:"Authentication and authorization are different boundaries",children:e.jsx(t.p,{children:"OIDC or X.509 identifies the operator calling Lamassu. The authorization service decides which actions it may perform. The X.509 hierarchy, on the other hand, determines whether a certificate presented by a device is trustworthy."})}),`
`,e.jsx(t.h2,{id:"enrollment-validation-and-distribution-cas",children:"Enrollment, validation and distribution CAs"}),`
`,e.jsx(t.p,{children:"A DMS relates three sets that are worth designing separately:"}),`
`,e.jsxs(t.ul,{children:[`
`,e.jsxs(t.li,{children:[e.jsx(t.strong,{children:"Enrollment CA:"})," signs the new identities."]}),`
`,e.jsxs(t.li,{children:[e.jsx(t.strong,{children:"Validation CAs:"})," authenticate the client certificates used for enrollment or migration. During re-enrollment, Lamassu tries the enrollment CA first and then the additional validation CAs."]}),`
`,e.jsxs(t.li,{children:[e.jsx(t.strong,{children:"Distributed CAs:"})," form the content the device obtains through EST ",e.jsx(t.code,{children:"/cacerts"}),". You can include the system CA, the enrollment CA and a list of managed CAs."]}),`
`]}),`
`,e.jsx(t.p,{children:"This separation makes it possible to migrate a fleet: you temporarily accept certificates from the old hierarchy, issue with the new one and distribute both chains during the overlap."}),`
`,e.jsx(t.h2,{id:"validation-and-revocation",children:"Validation and revocation"}),`
`,e.jsx(t.p,{children:"A valid chain does not by itself guarantee that a certificate should be accepted. The consumer must also check:"}),`
`,e.jsxs(t.ul,{children:[`
`,e.jsxs(t.li,{children:["that the current date is between ",e.jsx(t.code,{children:"Not Before"})," and ",e.jsx(t.code,{children:"Not After"}),";"]}),`
`,e.jsxs(t.li,{children:["that ",e.jsx(t.code,{children:"Key Usage"})," and ",e.jsx(t.code,{children:"Extended Key Usage"})," allow the operation;"]}),`
`,e.jsx(t.li,{children:"that names, SANs and subject match the expected identity;"}),`
`,e.jsxs(t.li,{children:["that the certificate does not appear revoked in ",e.jsx(t.a,{href:"/docs/platform/pki/ocsp",children:"OCSP"})," or a ",e.jsx(t.a,{href:"/docs/platform/pki/crl",children:"CRL"}),"."]}),`
`]}),`
`,e.jsx(t.p,{children:"During the mTLS authentication of a DMS, Lamassu attempts to check revocation. If the certificate does not contain enough information to perform that check, the backend logs a warning and continues treating it as not revoked. Design your profiles and distribution points to avoid that situation in production."}),`
`,e.jsx(t.h2,{id:"custody-limits",children:"Custody limits"}),`
`,e.jsx(t.p,{children:"The KMS keeps the reference to the key and delegates the operation to the configured engine. With an HSM or a cloud KMS, the private key can remain non-exportable. That protects custody, but it does not by itself prevent misuse: you still must restrict who can request a signature and audit those operations."}),`
`,e.jsx(t.h2,{id:"recommended-pattern",children:"Recommended pattern"}),`
`,e.jsxs(t.ul,{children:[`
`,e.jsx(t.li,{children:"Keep the root out of daily operations, or with very restricted access."}),`
`,e.jsx(t.li,{children:"Issue from intermediate CAs separated by environment or risk domain."}),`
`,e.jsx(t.li,{children:"Assign explicit profiles to every use case."}),`
`,e.jsx(t.li,{children:"Distribute the new trust before starting a rotation."}),`
`,e.jsx(t.li,{children:"Keep enough overlap to renew a disconnected fleet."}),`
`,e.jsx(t.li,{children:"Validate from the consuming system, not only from the Lamassu console."}),`
`]}),`
`,e.jsxs(t.p,{children:["Continue with ",e.jsx(t.a,{href:"/docs/platform/pki/ca-hierarchy-and-rotation",children:"CA hierarchy and rotation"})," to turn this model into an operating procedure."]})]})}function c(n={}){const{wrapper:t}=n.components||{};return t?e.jsx(t,{...n,children:e.jsx(a,{...n})}):a(n)}function h(n,t){throw new Error("Expected component `"+n+"` to be defined: you likely forgot to import, pass, or provide it.")}const u=Object.freeze(Object.defineProperty({__proto__:null,_markdown:o,default:c,frontmatter:s,structuredData:r,toc:d},Symbol.toStringTag,{value:"Module"}));export{u as _};

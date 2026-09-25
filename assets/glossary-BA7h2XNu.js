import{j as e}from"./index-prc0XQdj.js";let s=`

A–C [#ac]

**AKI (Authority Key Identifier)**\\
Identifier of the public key of the authority that signed a certificate. It helps build the chain toward the correct issuer.

**Anchor of trust**\\
A certificate, usually from a root CA, that a consumer explicitly accepts as the endpoint of a chain.

**CA (Certification Authority)**\\
Authority that signs certificates and binds an identity to a public key.

**Intermediate CA**\\
A CA signed by another authority. Used to issue without exposing the root to daily operation.

**Root CA**\\
A self-signed CA that starts a hierarchy of trust.

**X.509 certificate**\\
A signed document containing a public key, a subject, an issuer, a validity period and extensions that constrain its use.

**CRL (Certificate Revocation List)**\\
Signed list of revoked certificates published by a CA.

**CSR (Certificate Signing Request)**\\
PKCS#10 request containing a public key and requested attributes. Signing the CSR proves possession of the corresponding private key.

D–K [#dk]

**DMS (Device Management Service)**\\
Configuration that groups registration, enrollment, re-enrollment, issuance and CA distribution rules for a fleet.

**Distinguished Name (DN)**\\
Set of subject or issuer attributes, such as \`CN\`, \`O\`, \`OU\`, \`C\`, \`ST\` and \`L\`.

**EST (Enrollment over Secure Transport)**\\
Protocol defined in RFC 7030 to obtain CAs, enroll and re-enroll certificates over HTTPS.

**Extended Key Usage (EKU)**\\
Extension that constrains purposes such as client authentication, server authentication, code signing or OCSP.

**Device identity**\\
Relationship between a device and one of its certificates. A device can keep a history of identities.

**Identity slot**\\
Logical position on a device where Lamassu binds an active or historical identity.

**JITP (Just-in-Time Provisioning)**\\
Automatic registration of a device when it successfully completes its first enrollment.

**KMS (Key Management Service)**\\
Lamassu service that normalizes key generation, import and use across different cryptographic engines.

**Key Usage**\\
X.509 extension that allows basic operations such as digital signature, key encryption or certificate signing.

M–R [#mr]

**mTLS (Mutual TLS)**\\
TLS where both client and server present certificates. A DMS can use the client certificate as an authentication method.

**OCSP (Online Certificate Status Protocol)**\\
Protocol for querying online whether a certificate is valid, revoked or unknown.

**Issuance profile**\\
Reusable policy that defines how Lamassu builds a certificate and which keys it accepts.

**Principal**\\
Operator or API client identity recognized by the authorization service. Lamassu supports OIDC and X.509 principals.

**Policy**\\
Set of permissions assignable to one or more principals.

**RA (Registration Authority)**\\
Component that verifies the requester before asking a CA to issue. The DMS plays this role in device enrollment flows.

**Relying party**\\
Consuming system that decides whether to accept a presented certificate.

**Revocation**\\
Invalidation of a certificate before its expiration date.

S–Z [#sz]

**SAN (Subject Alternative Name)**\\
Extension that adds identities such as DNS names, IP addresses, emails or URIs.

**SKI (Subject Key Identifier)**\\
Identifier derived from the public key of the certificate itself.

**VA (Validation Authority)**\\
Lamassu service responsible for OCSP responses and the generation or publication of CRLs.

**Renewal window**\\
Period before expiration during which a device may or must request another identity.

Missing an operational term? Check [How Lamassu works](/docs/platform/pki/concepts/overview) and the [Trust model](/docs/platform/pki/concepts/trust-model) first, where these concepts appear connected.
`,r={title:"Glossary",description:"PKI, certificate and identity management terms used in Lamassu."},o={contents:[{heading:"ac",content:`**AKI (Authority Key Identifier)**\\
Identifier of the public key of the authority that signed a certificate. It helps build the chain toward the correct issuer.`},{heading:"ac",content:`**Anchor of trust**\\
A certificate, usually from a root CA, that a consumer explicitly accepts as the endpoint of a chain.`},{heading:"ac",content:`**CA (Certification Authority)**\\
Authority that signs certificates and binds an identity to a public key.`},{heading:"ac",content:`**Intermediate CA**\\
A CA signed by another authority. Used to issue without exposing the root to daily operation.`},{heading:"ac",content:`**Root CA**\\
A self-signed CA that starts a hierarchy of trust.`},{heading:"ac",content:`**X.509 certificate**\\
A signed document containing a public key, a subject, an issuer, a validity period and extensions that constrain its use.`},{heading:"ac",content:`**CRL (Certificate Revocation List)**\\
Signed list of revoked certificates published by a CA.`},{heading:"ac",content:`**CSR (Certificate Signing Request)**\\
PKCS#10 request containing a public key and requested attributes. Signing the CSR proves possession of the corresponding private key.`},{heading:"dk",content:`**DMS (Device Management Service)**\\
Configuration that groups registration, enrollment, re-enrollment, issuance and CA distribution rules for a fleet.`},{heading:"dk",content:"**Distinguished Name (DN)**\\\nSet of subject or issuer attributes, such as `CN`, `O`, `OU`, `C`, `ST` and `L`."},{heading:"dk",content:`**EST (Enrollment over Secure Transport)**\\
Protocol defined in RFC 7030 to obtain CAs, enroll and re-enroll certificates over HTTPS.`},{heading:"dk",content:`**Extended Key Usage (EKU)**\\
Extension that constrains purposes such as client authentication, server authentication, code signing or OCSP.`},{heading:"dk",content:`**Device identity**\\
Relationship between a device and one of its certificates. A device can keep a history of identities.`},{heading:"dk",content:`**Identity slot**\\
Logical position on a device where Lamassu binds an active or historical identity.`},{heading:"dk",content:`**JITP (Just-in-Time Provisioning)**\\
Automatic registration of a device when it successfully completes its first enrollment.`},{heading:"dk",content:`**KMS (Key Management Service)**\\
Lamassu service that normalizes key generation, import and use across different cryptographic engines.`},{heading:"dk",content:`**Key Usage**\\
X.509 extension that allows basic operations such as digital signature, key encryption or certificate signing.`},{heading:"mr",content:`**mTLS (Mutual TLS)**\\
TLS where both client and server present certificates. A DMS can use the client certificate as an authentication method.`},{heading:"mr",content:`**OCSP (Online Certificate Status Protocol)**\\
Protocol for querying online whether a certificate is valid, revoked or unknown.`},{heading:"mr",content:`**Issuance profile**\\
Reusable policy that defines how Lamassu builds a certificate and which keys it accepts.`},{heading:"mr",content:`**Principal**\\
Operator or API client identity recognized by the authorization service. Lamassu supports OIDC and X.509 principals.`},{heading:"mr",content:`**Policy**\\
Set of permissions assignable to one or more principals.`},{heading:"mr",content:`**RA (Registration Authority)**\\
Component that verifies the requester before asking a CA to issue. The DMS plays this role in device enrollment flows.`},{heading:"mr",content:`**Relying party**\\
Consuming system that decides whether to accept a presented certificate.`},{heading:"mr",content:`**Revocation**\\
Invalidation of a certificate before its expiration date.`},{heading:"sz",content:`**SAN (Subject Alternative Name)**\\
Extension that adds identities such as DNS names, IP addresses, emails or URIs.`},{heading:"sz",content:`**SKI (Subject Key Identifier)**\\
Identifier derived from the public key of the certificate itself.`},{heading:"sz",content:`**VA (Validation Authority)**\\
Lamassu service responsible for OCSP responses and the generation or publication of CRLs.`},{heading:"sz",content:`**Renewal window**\\
Period before expiration during which a device may or must request another identity.`},{heading:"sz",content:"Missing an operational term? Check How Lamassu works and the Trust model first, where these concepts appear connected."}],headings:[{id:"ac",content:"A–C"},{id:"dk",content:"D–K"},{id:"mr",content:"M–R"},{id:"sz",content:"S–Z"}]};const a=[{depth:2,url:"#ac",title:e.jsx(e.Fragment,{children:"A–C"})},{depth:2,url:"#dk",title:e.jsx(e.Fragment,{children:"D–K"})},{depth:2,url:"#mr",title:e.jsx(e.Fragment,{children:"M–R"})},{depth:2,url:"#sz",title:e.jsx(e.Fragment,{children:"S–Z"})}];function i(t){const n={a:"a",br:"br",code:"code",h2:"h2",p:"p",strong:"strong",...t.components};return e.jsxs(e.Fragment,{children:[e.jsx(n.h2,{id:"ac",children:"A–C"}),`
`,e.jsxs(n.p,{children:[e.jsx(n.strong,{children:"AKI (Authority Key Identifier)"}),e.jsx(n.br,{}),`
`,"Identifier of the public key of the authority that signed a certificate. It helps build the chain toward the correct issuer."]}),`
`,e.jsxs(n.p,{children:[e.jsx(n.strong,{children:"Anchor of trust"}),e.jsx(n.br,{}),`
`,"A certificate, usually from a root CA, that a consumer explicitly accepts as the endpoint of a chain."]}),`
`,e.jsxs(n.p,{children:[e.jsx(n.strong,{children:"CA (Certification Authority)"}),e.jsx(n.br,{}),`
`,"Authority that signs certificates and binds an identity to a public key."]}),`
`,e.jsxs(n.p,{children:[e.jsx(n.strong,{children:"Intermediate CA"}),e.jsx(n.br,{}),`
`,"A CA signed by another authority. Used to issue without exposing the root to daily operation."]}),`
`,e.jsxs(n.p,{children:[e.jsx(n.strong,{children:"Root CA"}),e.jsx(n.br,{}),`
`,"A self-signed CA that starts a hierarchy of trust."]}),`
`,e.jsxs(n.p,{children:[e.jsx(n.strong,{children:"X.509 certificate"}),e.jsx(n.br,{}),`
`,"A signed document containing a public key, a subject, an issuer, a validity period and extensions that constrain its use."]}),`
`,e.jsxs(n.p,{children:[e.jsx(n.strong,{children:"CRL (Certificate Revocation List)"}),e.jsx(n.br,{}),`
`,"Signed list of revoked certificates published by a CA."]}),`
`,e.jsxs(n.p,{children:[e.jsx(n.strong,{children:"CSR (Certificate Signing Request)"}),e.jsx(n.br,{}),`
`,"PKCS#10 request containing a public key and requested attributes. Signing the CSR proves possession of the corresponding private key."]}),`
`,e.jsx(n.h2,{id:"dk",children:"D–K"}),`
`,e.jsxs(n.p,{children:[e.jsx(n.strong,{children:"DMS (Device Management Service)"}),e.jsx(n.br,{}),`
`,"Configuration that groups registration, enrollment, re-enrollment, issuance and CA distribution rules for a fleet."]}),`
`,e.jsxs(n.p,{children:[e.jsx(n.strong,{children:"Distinguished Name (DN)"}),e.jsx(n.br,{}),`
`,"Set of subject or issuer attributes, such as ",e.jsx(n.code,{children:"CN"}),", ",e.jsx(n.code,{children:"O"}),", ",e.jsx(n.code,{children:"OU"}),", ",e.jsx(n.code,{children:"C"}),", ",e.jsx(n.code,{children:"ST"})," and ",e.jsx(n.code,{children:"L"}),"."]}),`
`,e.jsxs(n.p,{children:[e.jsx(n.strong,{children:"EST (Enrollment over Secure Transport)"}),e.jsx(n.br,{}),`
`,"Protocol defined in RFC 7030 to obtain CAs, enroll and re-enroll certificates over HTTPS."]}),`
`,e.jsxs(n.p,{children:[e.jsx(n.strong,{children:"Extended Key Usage (EKU)"}),e.jsx(n.br,{}),`
`,"Extension that constrains purposes such as client authentication, server authentication, code signing or OCSP."]}),`
`,e.jsxs(n.p,{children:[e.jsx(n.strong,{children:"Device identity"}),e.jsx(n.br,{}),`
`,"Relationship between a device and one of its certificates. A device can keep a history of identities."]}),`
`,e.jsxs(n.p,{children:[e.jsx(n.strong,{children:"Identity slot"}),e.jsx(n.br,{}),`
`,"Logical position on a device where Lamassu binds an active or historical identity."]}),`
`,e.jsxs(n.p,{children:[e.jsx(n.strong,{children:"JITP (Just-in-Time Provisioning)"}),e.jsx(n.br,{}),`
`,"Automatic registration of a device when it successfully completes its first enrollment."]}),`
`,e.jsxs(n.p,{children:[e.jsx(n.strong,{children:"KMS (Key Management Service)"}),e.jsx(n.br,{}),`
`,"Lamassu service that normalizes key generation, import and use across different cryptographic engines."]}),`
`,e.jsxs(n.p,{children:[e.jsx(n.strong,{children:"Key Usage"}),e.jsx(n.br,{}),`
`,"X.509 extension that allows basic operations such as digital signature, key encryption or certificate signing."]}),`
`,e.jsx(n.h2,{id:"mr",children:"M–R"}),`
`,e.jsxs(n.p,{children:[e.jsx(n.strong,{children:"mTLS (Mutual TLS)"}),e.jsx(n.br,{}),`
`,"TLS where both client and server present certificates. A DMS can use the client certificate as an authentication method."]}),`
`,e.jsxs(n.p,{children:[e.jsx(n.strong,{children:"OCSP (Online Certificate Status Protocol)"}),e.jsx(n.br,{}),`
`,"Protocol for querying online whether a certificate is valid, revoked or unknown."]}),`
`,e.jsxs(n.p,{children:[e.jsx(n.strong,{children:"Issuance profile"}),e.jsx(n.br,{}),`
`,"Reusable policy that defines how Lamassu builds a certificate and which keys it accepts."]}),`
`,e.jsxs(n.p,{children:[e.jsx(n.strong,{children:"Principal"}),e.jsx(n.br,{}),`
`,"Operator or API client identity recognized by the authorization service. Lamassu supports OIDC and X.509 principals."]}),`
`,e.jsxs(n.p,{children:[e.jsx(n.strong,{children:"Policy"}),e.jsx(n.br,{}),`
`,"Set of permissions assignable to one or more principals."]}),`
`,e.jsxs(n.p,{children:[e.jsx(n.strong,{children:"RA (Registration Authority)"}),e.jsx(n.br,{}),`
`,"Component that verifies the requester before asking a CA to issue. The DMS plays this role in device enrollment flows."]}),`
`,e.jsxs(n.p,{children:[e.jsx(n.strong,{children:"Relying party"}),e.jsx(n.br,{}),`
`,"Consuming system that decides whether to accept a presented certificate."]}),`
`,e.jsxs(n.p,{children:[e.jsx(n.strong,{children:"Revocation"}),e.jsx(n.br,{}),`
`,"Invalidation of a certificate before its expiration date."]}),`
`,e.jsx(n.h2,{id:"sz",children:"S–Z"}),`
`,e.jsxs(n.p,{children:[e.jsx(n.strong,{children:"SAN (Subject Alternative Name)"}),e.jsx(n.br,{}),`
`,"Extension that adds identities such as DNS names, IP addresses, emails or URIs."]}),`
`,e.jsxs(n.p,{children:[e.jsx(n.strong,{children:"SKI (Subject Key Identifier)"}),e.jsx(n.br,{}),`
`,"Identifier derived from the public key of the certificate itself."]}),`
`,e.jsxs(n.p,{children:[e.jsx(n.strong,{children:"VA (Validation Authority)"}),e.jsx(n.br,{}),`
`,"Lamassu service responsible for OCSP responses and the generation or publication of CRLs."]}),`
`,e.jsxs(n.p,{children:[e.jsx(n.strong,{children:"Renewal window"}),e.jsx(n.br,{}),`
`,"Period before expiration during which a device may or must request another identity."]}),`
`,e.jsxs(n.p,{children:["Missing an operational term? Check ",e.jsx(n.a,{href:"/docs/platform/pki/concepts/overview",children:"How Lamassu works"})," and the ",e.jsx(n.a,{href:"/docs/platform/pki/concepts/trust-model",children:"Trust model"})," first, where these concepts appear connected."]})]})}function c(t={}){const{wrapper:n}=t.components||{};return n?e.jsx(n,{...t,children:e.jsx(i,{...t})}):i(t)}const h=Object.freeze(Object.defineProperty({__proto__:null,_markdown:s,default:c,frontmatter:r,structuredData:o,toc:a},Symbol.toStringTag,{value:"Module"}));export{h as _};

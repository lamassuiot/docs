import{j as e}from"./index-DqgIL_Rv.js";let r=`

<div className="lm-diff-ins lm-diff-block">
  This page collects the limits of the current implementation so they can be weighed before planning a deployment. Each one has been observed in the code or the tests of the branches described in this section.
</div>

<div className="lm-diff-ins lm-diff-block">
  Standards and interoperability [#standards-and-interoperability]
</div>

<div className="lm-diff-ins lm-diff-block">
  Composite certificates were implemented and tested against draft 19 of the IETF composite signatures specification, which has since been published as RFC 10073; the implementation has not been compared with the final text. Three of its algorithms (the two Brainpool variants and Ed448) are not implemented. The composite signature schemes in TLS use private-use code points in \`0xFE00\` to \`0xFE0E\` and no published draft or version is identified in the code, so they interoperate only with peers built from the same Go fork. Composite RSA-PKCS#1 v1.5 variants cannot authenticate a TLS handshake. SLH-DSA has no TLS signature scheme. The related-certificate request attribute has not been checked against other implementations of RFC 9763.
</div>

<div className="lm-diff-ins lm-diff-block">
  Keys and engines [#keys-and-engines]
</div>

<div className="lm-diff-ins lm-diff-block">
  Post-quantum, composite and Ed25519 keys work only with the filesystem and software engines. The Vault KV2 and AWS Secrets Manager engines announce support and then fail at creation, and AWS KMS, Azure and PKCS#11 do not support them. There is therefore no hardware-backed or cloud-KMS-backed post-quantum key. Some engine error messages are copied from other engines and name the wrong one.
</div>

<div className="lm-diff-ins lm-diff-block">
  The \`CryptoEngine\` interface gained methods to create and import each new key type. Engines developed outside the Lamassu repository must implement them.
</div>

<div className="lm-diff-ins lm-diff-block">
  Certificate authority and validation [#certificate-authority-and-validation]
</div>

<div className="lm-diff-ins lm-diff-block">
  OCSP responses cannot be signed by a CA with a post-quantum, Ed25519 or composite key, because the signing library supports only RSA and ECDSA. CRL generation uses the fork's signing and is expected to work, but neither CRL nor OCSP has tests with these keys.
</div>

<div className="lm-diff-ins lm-diff-block">
  Issuance profiles cannot allow or deny post-quantum algorithms; their enforcement applies only to RSA and ECDSA. The key strength of an issued certificate is computed only for RSA and ECDSA, so other certificates are stored with unknown type and size and low strength. Importing an existing CA with an SLH-DSA or composite key is not supported.
</div>

<div className="lm-diff-ins lm-diff-block">
  The DMS can generate keys on the server only for RSA and ECDSA, so \`serverkeygen\` cannot return a post-quantum key. The enrollment flows through EST and the device manager have no tests with post-quantum keys.
</div>

<div className="lm-diff-ins lm-diff-block">
  The backend does not evaluate the related-certificate extension. It only issues it.
</div>

<div className="lm-diff-ins lm-diff-block">
  Dashboard [#dashboard]
</div>

<div className="lm-diff-ins lm-diff-block">
  The in-browser SLH-DSA key generator maps parameter set identifiers differently from the rest of the interface, as described in [Dashboard](/docs/platform/pqc/dashboard). Key type names are not uniform between screens, and the interface has no experimental notice and no translation.
</div>

<div className="lm-diff-ins lm-diff-block">
  Build and deployment [#build-and-deployment]
</div>

<div className="lm-diff-ins lm-diff-block">
  Everything depends on forks of Go and Traefik that are not upstream, and the proxy image has a mutable tag. The backend's OpenAPI specification for the KMS still lists only RSA, ECDSA and Ed25519 and does not reflect the new key types.
</div>

<div className="lm-diff-ins lm-diff-block">
  The Helm chart uses fixed resource names, supports one release per namespace and sends traffic from Traefik to Envoy without verifying certificates. The post-quantum certificates created by the installer are valid for 365 days and are not renewed. The installer needs a Linux host and runs a Helm install, not an upgrade.
</div>

<div className="lm-diff-ins lm-diff-block">
  <Cards>
    <Card title="Post-quantum cryptography overview" description="Return to the summary of the section." href="/docs/platform/pqc/overview" />
  </Cards>
</div>
`,d={title:"Known limitations",description:"What is incomplete, non-standard or unverified in Lamassu's post-quantum support, grouped by component."},l={isNew:!0,changes:17,title:void 0,description:void 0},c={contents:[{heading:void 0,content:"This page collects the limits of the current implementation so they can be weighed before planning a deployment. Each one has been observed in the code or the tests of the branches described in this section."},{heading:"standards-and-interoperability",content:"Composite certificates were implemented and tested against draft 19 of the IETF composite signatures specification, which has since been published as RFC 10073; the implementation has not been compared with the final text. Three of its algorithms (the two Brainpool variants and Ed448) are not implemented. The composite signature schemes in TLS use private-use code points in `0xFE00` to `0xFE0E` and no published draft or version is identified in the code, so they interoperate only with peers built from the same Go fork. Composite RSA-PKCS#1 v1.5 variants cannot authenticate a TLS handshake. SLH-DSA has no TLS signature scheme. The related-certificate request attribute has not been checked against other implementations of RFC 9763."},{heading:"keys-and-engines",content:"Post-quantum, composite and Ed25519 keys work only with the filesystem and software engines. The Vault KV2 and AWS Secrets Manager engines announce support and then fail at creation, and AWS KMS, Azure and PKCS#11 do not support them. There is therefore no hardware-backed or cloud-KMS-backed post-quantum key. Some engine error messages are copied from other engines and name the wrong one."},{heading:"keys-and-engines",content:"The `CryptoEngine` interface gained methods to create and import each new key type. Engines developed outside the Lamassu repository must implement them."},{heading:"certificate-authority-and-validation",content:"OCSP responses cannot be signed by a CA with a post-quantum, Ed25519 or composite key, because the signing library supports only RSA and ECDSA. CRL generation uses the fork's signing and is expected to work, but neither CRL nor OCSP has tests with these keys."},{heading:"certificate-authority-and-validation",content:"Issuance profiles cannot allow or deny post-quantum algorithms; their enforcement applies only to RSA and ECDSA. The key strength of an issued certificate is computed only for RSA and ECDSA, so other certificates are stored with unknown type and size and low strength. Importing an existing CA with an SLH-DSA or composite key is not supported."},{heading:"certificate-authority-and-validation",content:"The DMS can generate keys on the server only for RSA and ECDSA, so `serverkeygen` cannot return a post-quantum key. The enrollment flows through EST and the device manager have no tests with post-quantum keys."},{heading:"certificate-authority-and-validation",content:"The backend does not evaluate the related-certificate extension. It only issues it."},{heading:"dashboard",content:"The in-browser SLH-DSA key generator maps parameter set identifiers differently from the rest of the interface, as described in Dashboard. Key type names are not uniform between screens, and the interface has no experimental notice and no translation."},{heading:"build-and-deployment",content:"Everything depends on forks of Go and Traefik that are not upstream, and the proxy image has a mutable tag. The backend's OpenAPI specification for the KMS still lists only RSA, ECDSA and Ed25519 and does not reflect the new key types."},{heading:"build-and-deployment",content:"The Helm chart uses fixed resource names, supports one release per namespace and sends traffic from Traefik to Envoy without verifying certificates. The post-quantum certificates created by the installer are valid for 365 days and are not renewed. The installer needs a Linux host and runs a Helm install, not an upgrade."},{heading:"build-and-deployment",content:'<Card title="Post-quantum cryptography overview" description="Return to the summary of the section." href="/docs/platform/pqc/overview" />'}],headings:[{id:"standards-and-interoperability",content:"Standards and interoperability"},{id:"keys-and-engines",content:"Keys and engines"},{id:"certificate-authority-and-validation",content:"Certificate authority and validation"},{id:"dashboard",content:"Dashboard"},{id:"build-and-deployment",content:"Build and deployment"}]};const h=[{depth:2,url:"#standards-and-interoperability",title:e.jsx(e.Fragment,{children:"Standards and interoperability"})},{depth:2,url:"#keys-and-engines",title:e.jsx(e.Fragment,{children:"Keys and engines"})},{depth:2,url:"#certificate-authority-and-validation",title:e.jsx(e.Fragment,{children:"Certificate authority and validation"})},{depth:2,url:"#dashboard",title:e.jsx(e.Fragment,{children:"Dashboard"})},{depth:2,url:"#build-and-deployment",title:e.jsx(e.Fragment,{children:"Build and deployment"})}];function s(t){const n={a:"a",code:"code",div:"div",h2:"h2",p:"p",...t.components},{Card:i,Cards:a}=n;return i||o("Card"),a||o("Cards"),e.jsxs(e.Fragment,{children:[e.jsx(n.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(n.p,{children:"This page collects the limits of the current implementation so they can be weighed before planning a deployment. Each one has been observed in the code or the tests of the branches described in this section."})}),`
`,e.jsx(n.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(n.h2,{id:"standards-and-interoperability",children:"Standards and interoperability"})}),`
`,e.jsx(n.div,{className:"lm-diff-ins lm-diff-block",children:e.jsxs(n.p,{children:["Composite certificates were implemented and tested against draft 19 of the IETF composite signatures specification, which has since been published as RFC 10073; the implementation has not been compared with the final text. Three of its algorithms (the two Brainpool variants and Ed448) are not implemented. The composite signature schemes in TLS use private-use code points in ",e.jsx(n.code,{children:"0xFE00"})," to ",e.jsx(n.code,{children:"0xFE0E"})," and no published draft or version is identified in the code, so they interoperate only with peers built from the same Go fork. Composite RSA-PKCS#1 v1.5 variants cannot authenticate a TLS handshake. SLH-DSA has no TLS signature scheme. The related-certificate request attribute has not been checked against other implementations of RFC 9763."]})}),`
`,e.jsx(n.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(n.h2,{id:"keys-and-engines",children:"Keys and engines"})}),`
`,e.jsx(n.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(n.p,{children:"Post-quantum, composite and Ed25519 keys work only with the filesystem and software engines. The Vault KV2 and AWS Secrets Manager engines announce support and then fail at creation, and AWS KMS, Azure and PKCS#11 do not support them. There is therefore no hardware-backed or cloud-KMS-backed post-quantum key. Some engine error messages are copied from other engines and name the wrong one."})}),`
`,e.jsx(n.div,{className:"lm-diff-ins lm-diff-block",children:e.jsxs(n.p,{children:["The ",e.jsx(n.code,{children:"CryptoEngine"})," interface gained methods to create and import each new key type. Engines developed outside the Lamassu repository must implement them."]})}),`
`,e.jsx(n.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(n.h2,{id:"certificate-authority-and-validation",children:"Certificate authority and validation"})}),`
`,e.jsx(n.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(n.p,{children:"OCSP responses cannot be signed by a CA with a post-quantum, Ed25519 or composite key, because the signing library supports only RSA and ECDSA. CRL generation uses the fork's signing and is expected to work, but neither CRL nor OCSP has tests with these keys."})}),`
`,e.jsx(n.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(n.p,{children:"Issuance profiles cannot allow or deny post-quantum algorithms; their enforcement applies only to RSA and ECDSA. The key strength of an issued certificate is computed only for RSA and ECDSA, so other certificates are stored with unknown type and size and low strength. Importing an existing CA with an SLH-DSA or composite key is not supported."})}),`
`,e.jsx(n.div,{className:"lm-diff-ins lm-diff-block",children:e.jsxs(n.p,{children:["The DMS can generate keys on the server only for RSA and ECDSA, so ",e.jsx(n.code,{children:"serverkeygen"})," cannot return a post-quantum key. The enrollment flows through EST and the device manager have no tests with post-quantum keys."]})}),`
`,e.jsx(n.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(n.p,{children:"The backend does not evaluate the related-certificate extension. It only issues it."})}),`
`,e.jsx(n.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(n.h2,{id:"dashboard",children:"Dashboard"})}),`
`,e.jsx(n.div,{className:"lm-diff-ins lm-diff-block",children:e.jsxs(n.p,{children:["The in-browser SLH-DSA key generator maps parameter set identifiers differently from the rest of the interface, as described in ",e.jsx(n.a,{href:"/docs/platform/pqc/dashboard",children:"Dashboard"}),". Key type names are not uniform between screens, and the interface has no experimental notice and no translation."]})}),`
`,e.jsx(n.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(n.h2,{id:"build-and-deployment",children:"Build and deployment"})}),`
`,e.jsx(n.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(n.p,{children:"Everything depends on forks of Go and Traefik that are not upstream, and the proxy image has a mutable tag. The backend's OpenAPI specification for the KMS still lists only RSA, ECDSA and Ed25519 and does not reflect the new key types."})}),`
`,e.jsx(n.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(n.p,{children:"The Helm chart uses fixed resource names, supports one release per namespace and sends traffic from Traefik to Envoy without verifying certificates. The post-quantum certificates created by the installer are valid for 365 days and are not renewed. The installer needs a Linux host and runs a Helm install, not an upgrade."})}),`
`,e.jsx(n.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(a,{children:e.jsx(i,{title:"Post-quantum cryptography overview",description:"Return to the summary of the section.",href:"/docs/platform/pqc/overview"})})})]})}function m(t={}){const{wrapper:n}=t.components||{};return n?e.jsx(n,{...t,children:e.jsx(s,{...t})}):s(t)}function o(t,n){throw new Error("Expected component `"+t+"` to be defined: you likely forgot to import, pass, or provide it.")}const p=Object.freeze(Object.defineProperty({__proto__:null,_markdown:r,default:m,frontmatter:d,lmDiff:l,structuredData:c,toc:h},Symbol.toStringTag,{value:"Module"}));export{p as _};

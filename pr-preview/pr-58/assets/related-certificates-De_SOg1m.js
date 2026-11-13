import{j as e}from"./index-DqgIL_Rv.js";let c=`

<div className="lm-diff-ins lm-diff-block">
  A fleet that is migrating to post-quantum algorithms usually holds two certificates per device for a while: the classical one already in use and a new one with a post-quantum key. [RFC 9763](https://www.rfc-editor.org/rfc/rfc9763.html) defines a way to link them. The new certificate carries the \`id-pe-relatedCert\` extension (\`1.3.6.1.5.5.7.1.36\`), which holds a hash of the classical certificate, so a relying party can see that both identify the same entity. Lamassu implements the issuing side of this mechanism.
</div>

<div className="lm-diff-ins lm-diff-block">
  This option fits when:
</div>

<div className="lm-diff-ins lm-diff-block">
  * the consumers cannot yet validate post-quantum or composite chains, so the classical certificate must remain the one in use;
  * a device has to carry both certificates and show that they belong together, using each one where the peer supports it.
</div>

<div className="lm-diff-ins lm-diff-block">
  The hash is SHA-256, SHA-384 or SHA-512, matching the hash of the related certificate's signature algorithm, and SHA-256 when it has none.
</div>

<div className="lm-diff-ins lm-diff-block">
  How the request works [#how-the-request-works]
</div>

<div className="lm-diff-ins lm-diff-block">
  The device asks for the bound certificate with an ordinary PKCS#10 certificate request that carries one extra attribute, \`relatedCertRequest\` (\`1.2.840.113549.1.9.16.2.60\`). The attribute identifies the existing certificate by issuer and serial number, states the time of the request, gives the location from which the certificate can be downloaded and carries a signature made with the private key of that existing certificate. The signature covers the issuer, the serial number and the request time, not the location, and shows that the requester controls the existing key; the key of the new certificate is proven by the signature of the certificate request itself. Lamassu accepts a list of locations, as in the ASN.1 module of the RFC, and tries them in order.
</div>

<div className="lm-diff-ins lm-diff-block">
  When the CA service receives such a request it follows these steps:
</div>

<div className="lm-diff-ins lm-diff-block">
  1. It checks that the issuance profile in use enables related certificates, and rejects the request otherwise.
  2. It reads the locations in the attribute in order and downloads the first certificate it can retrieve.
  3. It verifies that the issuer and serial number match, that the request time is within the allowed age, and that the signature is valid with the downloaded certificate's key.
  4. It issues the new certificate with the related certificate extension added.
</div>

<div className="lm-diff-ins lm-diff-block">
  A request without the attribute is processed as usual, whether or not the profile enables the feature.
</div>

<div className="lm-diff-ins lm-diff-block">
  Locations the CA may fetch from [#locations-the-ca-may-fetch-from]
</div>

<div className="lm-diff-ins lm-diff-block">
  A location is either a \`data:\` URI or an \`http\` or \`https\` URL. A \`data:\` URI must be base64-encoded and contains a PKCS#7 structure whose first certificate is the related one; it needs no network access and is always accepted when the feature is enabled. A URL is retrieved only if its host appears in the profile's list of allowed hosts. The CA does not follow redirects, applies a ten-second timeout and rejects responses larger than 1 MiB.
</div>

<div className="lm-diff-ins lm-diff-block">
  Because the server performs the download, whoever can define an issuance profile decides which hosts the CA is allowed to contact. Restrict that permission accordingly and list only internal certificate repositories.
</div>

<div className="lm-diff-ins lm-diff-block">
  Configure an issuance profile [#configure-an-issuance-profile]
</div>

<div className="lm-diff-ins lm-diff-block">
  The feature is configured in the \`related_certificate\` object of the issuance profile, which is stored with its own database columns:
</div>

<div className="lm-diff-ins lm-diff-block">
  \`\`\`json
  {
    "related_certificate": {
      "enabled": true,
      "allowed_hosts": ["certs.example.com"],
      "max_age": "5m"
    }
  }
  \`\`\`
</div>

<div className="lm-diff-ins lm-diff-block">
  | Field           | Type            | Default | Description                                                                            |
  | --------------- | --------------- | ------- | -------------------------------------------------------------------------------------- |
  | \`enabled\`       | boolean         | \`false\` | When \`false\`, a request that carries the attribute is rejected.                        |
  | \`allowed_hosts\` | list of strings | empty   | Hosts from which \`http\` and \`https\` locations may be downloaded.                       |
  | \`max_age\`       | duration        | \`5m\`    | Maximum difference between the request time in the attribute and the time of issuance. |
</div>

<div className="lm-diff-ins lm-diff-block">
  What the issued certificate must satisfy [#what-the-issued-certificate-must-satisfy]
</div>

<div className="lm-diff-ins lm-diff-block">
  The fork refuses to bind a certificate unless the new one is compatible with the related one. Neither certificate may be a CA. The related certificate must be valid at the time of issuance. The key usages and extended key usages requested for the new certificate must be a subset of those of the related certificate. Verification later compares only the hash, so a relying party that checks the link learns that the issuing CA linked the new certificate to that specific certificate, not that the related certificate is still valid.
</div>

<div className="lm-diff-ins lm-diff-block">
  <Callout type="info" title="Related certificates link, they do not replace">
    The extension is evidence of a relationship, not a dependency. A relying party must still validate each certificate against its own chain and revocation status, and revoking the classical certificate does not revoke the bound one.
  </Callout>
</div>

<div className="lm-diff-ins lm-diff-block">
  From the dashboard [#from-the-dashboard]
</div>

<div className="lm-diff-ins lm-diff-block">
  The dashboard exposes the feature in two places. The issuance profile form has a *Related Certificates* section with a switch, the allowed hosts and the maximum age. When issuing a certificate from a CA with a browser-generated key and a profile that enables the feature, the form offers *Bind to a related certificate*: the user supplies the existing certificate, or its issuer and serial number, signs the data shown with the existing key outside the browser, and pastes the signature. Certificate and CA details show a *Related Certificate* row with the hash algorithm and value. See [Dashboard](/docs/platform/pqc/dashboard).
</div>

<div className="lm-diff-ins lm-diff-block">
  <Callout type="info" title="Scope of the implementation">
    The bound certificate is created by the fork's \`CreateBoundCertificate\`, whose tests cover an ML-DSA key bound to RSA, ECDSA and Ed25519 certificates. The tests do not use composite keys. Only the issuing side is implemented in Lamassu: the platform does not evaluate the extension when it validates certificates.
  </Callout>
</div>

<div className="lm-diff-ins lm-diff-block">
  <Cards>
    <Card title="Keys and certificate authorities" description="Create the post-quantum CA that issues the bound certificate." href="/docs/platform/pqc/keys-and-cas" />

    <Card title="Known limitations" description="What is not covered yet." href="/docs/platform/pqc/limitations" />
  </Cards>
</div>
`,o={title:"Related certificates",description:"Bind a certificate with a post-quantum key to an existing classical certificate of the same device, following RFC 9763, and how Lamassu issues and checks them."},d={isNew:!0,changes:23,title:void 0,description:void 0},l={contents:[{heading:void 0,content:"A fleet that is migrating to post-quantum algorithms usually holds two certificates per device for a while: the classical one already in use and a new one with a post-quantum key. RFC 9763 defines a way to link them. The new certificate carries the `id-pe-relatedCert` extension (`1.3.6.1.5.5.7.1.36`), which holds a hash of the classical certificate, so a relying party can see that both identify the same entity. Lamassu implements the issuing side of this mechanism."},{heading:void 0,content:"This option fits when:"},{heading:void 0,content:"the consumers cannot yet validate post-quantum or composite chains, so the classical certificate must remain the one in use;"},{heading:void 0,content:"a device has to carry both certificates and show that they belong together, using each one where the peer supports it."},{heading:void 0,content:"The hash is SHA-256, SHA-384 or SHA-512, matching the hash of the related certificate's signature algorithm, and SHA-256 when it has none."},{heading:"how-the-request-works",content:"The device asks for the bound certificate with an ordinary PKCS#10 certificate request that carries one extra attribute, `relatedCertRequest` (`1.2.840.113549.1.9.16.2.60`). The attribute identifies the existing certificate by issuer and serial number, states the time of the request, gives the location from which the certificate can be downloaded and carries a signature made with the private key of that existing certificate. The signature covers the issuer, the serial number and the request time, not the location, and shows that the requester controls the existing key; the key of the new certificate is proven by the signature of the certificate request itself. Lamassu accepts a list of locations, as in the ASN.1 module of the RFC, and tries them in order."},{heading:"how-the-request-works",content:"When the CA service receives such a request it follows these steps:"},{heading:"how-the-request-works",content:"It checks that the issuance profile in use enables related certificates, and rejects the request otherwise."},{heading:"how-the-request-works",content:"It reads the locations in the attribute in order and downloads the first certificate it can retrieve."},{heading:"how-the-request-works",content:"It verifies that the issuer and serial number match, that the request time is within the allowed age, and that the signature is valid with the downloaded certificate's key."},{heading:"how-the-request-works",content:"It issues the new certificate with the related certificate extension added."},{heading:"how-the-request-works",content:"A request without the attribute is processed as usual, whether or not the profile enables the feature."},{heading:"locations-the-ca-may-fetch-from",content:"A location is either a `data:` URI or an `http` or `https` URL. A `data:` URI must be base64-encoded and contains a PKCS#7 structure whose first certificate is the related one; it needs no network access and is always accepted when the feature is enabled. A URL is retrieved only if its host appears in the profile's list of allowed hosts. The CA does not follow redirects, applies a ten-second timeout and rejects responses larger than 1 MiB."},{heading:"locations-the-ca-may-fetch-from",content:"Because the server performs the download, whoever can define an issuance profile decides which hosts the CA is allowed to contact. Restrict that permission accordingly and list only internal certificate repositories."},{heading:"configure-an-issuance-profile",content:"The feature is configured in the `related_certificate` object of the issuance profile, which is stored with its own database columns:"},{heading:"configure-an-issuance-profile",content:"Field"},{heading:"configure-an-issuance-profile",content:"Type"},{heading:"configure-an-issuance-profile",content:"Default"},{heading:"configure-an-issuance-profile",content:"Description"},{heading:"configure-an-issuance-profile",content:"`enabled`"},{heading:"configure-an-issuance-profile",content:"boolean"},{heading:"configure-an-issuance-profile",content:"`false`"},{heading:"configure-an-issuance-profile",content:"When `false`, a request that carries the attribute is rejected."},{heading:"configure-an-issuance-profile",content:"`allowed_hosts`"},{heading:"configure-an-issuance-profile",content:"list of strings"},{heading:"configure-an-issuance-profile",content:"empty"},{heading:"configure-an-issuance-profile",content:"Hosts from which `http` and `https` locations may be downloaded."},{heading:"configure-an-issuance-profile",content:"`max_age`"},{heading:"configure-an-issuance-profile",content:"duration"},{heading:"configure-an-issuance-profile",content:"`5m`"},{heading:"configure-an-issuance-profile",content:"Maximum difference between the request time in the attribute and the time of issuance."},{heading:"what-the-issued-certificate-must-satisfy",content:"The fork refuses to bind a certificate unless the new one is compatible with the related one. Neither certificate may be a CA. The related certificate must be valid at the time of issuance. The key usages and extended key usages requested for the new certificate must be a subset of those of the related certificate. Verification later compares only the hash, so a relying party that checks the link learns that the issuing CA linked the new certificate to that specific certificate, not that the related certificate is still valid."},{heading:"what-the-issued-certificate-must-satisfy",content:"The extension is evidence of a relationship, not a dependency. A relying party must still validate each certificate against its own chain and revocation status, and revoking the classical certificate does not revoke the bound one."},{heading:"from-the-dashboard",content:"The dashboard exposes the feature in two places. The issuance profile form has a *Related Certificates* section with a switch, the allowed hosts and the maximum age. When issuing a certificate from a CA with a browser-generated key and a profile that enables the feature, the form offers *Bind to a related certificate*: the user supplies the existing certificate, or its issuer and serial number, signs the data shown with the existing key outside the browser, and pastes the signature. Certificate and CA details show a *Related Certificate* row with the hash algorithm and value. See Dashboard."},{heading:"from-the-dashboard",content:"The bound certificate is created by the fork's `CreateBoundCertificate`, whose tests cover an ML-DSA key bound to RSA, ECDSA and Ed25519 certificates. The tests do not use composite keys. Only the issuing side is implemented in Lamassu: the platform does not evaluate the extension when it validates certificates."},{heading:"from-the-dashboard",content:'<Card title="Keys and certificate authorities" description="Create the post-quantum CA that issues the bound certificate." href="/docs/platform/pqc/keys-and-cas" />'},{heading:"from-the-dashboard",content:'<Card title="Known limitations" description="What is not covered yet." href="/docs/platform/pqc/limitations" />'}],headings:[{id:"how-the-request-works",content:"How the request works"},{id:"locations-the-ca-may-fetch-from",content:"Locations the CA may fetch from"},{id:"configure-an-issuance-profile",content:"Configure an issuance profile"},{id:"what-the-issued-certificate-must-satisfy",content:"What the issued certificate must satisfy"},{id:"from-the-dashboard",content:"From the dashboard"}]};const f=[{depth:2,url:"#how-the-request-works",title:e.jsx(e.Fragment,{children:"How the request works"})},{depth:2,url:"#locations-the-ca-may-fetch-from",title:e.jsx(e.Fragment,{children:"Locations the CA may fetch from"})},{depth:2,url:"#configure-an-issuance-profile",title:e.jsx(e.Fragment,{children:"Configure an issuance profile"})},{depth:2,url:"#what-the-issued-certificate-must-satisfy",title:e.jsx(e.Fragment,{children:"What the issued certificate must satisfy"})},{depth:2,url:"#from-the-dashboard",title:e.jsx(e.Fragment,{children:"From the dashboard"})}];function h(i){const t={a:"a",code:"code",div:"div",em:"em",h2:"h2",li:"li",ol:"ol",p:"p",pre:"pre",span:"span",table:"table",tbody:"tbody",td:"td",th:"th",thead:"thead",tr:"tr",ul:"ul",...i.components},{Callout:s,Card:a,Cards:r}=t;return s||n("Callout"),a||n("Card"),r||n("Cards"),e.jsxs(e.Fragment,{children:[e.jsx(t.div,{className:"lm-diff-ins lm-diff-block",children:e.jsxs(t.p,{children:["A fleet that is migrating to post-quantum algorithms usually holds two certificates per device for a while: the classical one already in use and a new one with a post-quantum key. ",e.jsx(t.a,{href:"https://www.rfc-editor.org/rfc/rfc9763.html",children:"RFC 9763"})," defines a way to link them. The new certificate carries the ",e.jsx(t.code,{children:"id-pe-relatedCert"})," extension (",e.jsx(t.code,{children:"1.3.6.1.5.5.7.1.36"}),"), which holds a hash of the classical certificate, so a relying party can see that both identify the same entity. Lamassu implements the issuing side of this mechanism."]})}),`
`,e.jsx(t.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(t.p,{children:"This option fits when:"})}),`
`,e.jsx(t.div,{className:"lm-diff-ins lm-diff-block",children:e.jsxs(t.ul,{children:[`
`,e.jsx(t.li,{children:"the consumers cannot yet validate post-quantum or composite chains, so the classical certificate must remain the one in use;"}),`
`,e.jsx(t.li,{children:"a device has to carry both certificates and show that they belong together, using each one where the peer supports it."}),`
`]})}),`
`,e.jsx(t.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(t.p,{children:"The hash is SHA-256, SHA-384 or SHA-512, matching the hash of the related certificate's signature algorithm, and SHA-256 when it has none."})}),`
`,e.jsx(t.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(t.h2,{id:"how-the-request-works",children:"How the request works"})}),`
`,e.jsx(t.div,{className:"lm-diff-ins lm-diff-block",children:e.jsxs(t.p,{children:["The device asks for the bound certificate with an ordinary PKCS#10 certificate request that carries one extra attribute, ",e.jsx(t.code,{children:"relatedCertRequest"})," (",e.jsx(t.code,{children:"1.2.840.113549.1.9.16.2.60"}),"). The attribute identifies the existing certificate by issuer and serial number, states the time of the request, gives the location from which the certificate can be downloaded and carries a signature made with the private key of that existing certificate. The signature covers the issuer, the serial number and the request time, not the location, and shows that the requester controls the existing key; the key of the new certificate is proven by the signature of the certificate request itself. Lamassu accepts a list of locations, as in the ASN.1 module of the RFC, and tries them in order."]})}),`
`,e.jsx(t.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(t.p,{children:"When the CA service receives such a request it follows these steps:"})}),`
`,e.jsx(t.div,{className:"lm-diff-ins lm-diff-block",children:e.jsxs(t.ol,{children:[`
`,e.jsx(t.li,{children:"It checks that the issuance profile in use enables related certificates, and rejects the request otherwise."}),`
`,e.jsx(t.li,{children:"It reads the locations in the attribute in order and downloads the first certificate it can retrieve."}),`
`,e.jsx(t.li,{children:"It verifies that the issuer and serial number match, that the request time is within the allowed age, and that the signature is valid with the downloaded certificate's key."}),`
`,e.jsx(t.li,{children:"It issues the new certificate with the related certificate extension added."}),`
`]})}),`
`,e.jsx(t.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(t.p,{children:"A request without the attribute is processed as usual, whether or not the profile enables the feature."})}),`
`,e.jsx(t.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(t.h2,{id:"locations-the-ca-may-fetch-from",children:"Locations the CA may fetch from"})}),`
`,e.jsx(t.div,{className:"lm-diff-ins lm-diff-block",children:e.jsxs(t.p,{children:["A location is either a ",e.jsx(t.code,{children:"data:"})," URI or an ",e.jsx(t.code,{children:"http"})," or ",e.jsx(t.code,{children:"https"})," URL. A ",e.jsx(t.code,{children:"data:"})," URI must be base64-encoded and contains a PKCS#7 structure whose first certificate is the related one; it needs no network access and is always accepted when the feature is enabled. A URL is retrieved only if its host appears in the profile's list of allowed hosts. The CA does not follow redirects, applies a ten-second timeout and rejects responses larger than 1 MiB."]})}),`
`,e.jsx(t.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(t.p,{children:"Because the server performs the download, whoever can define an issuance profile decides which hosts the CA is allowed to contact. Restrict that permission accordingly and list only internal certificate repositories."})}),`
`,e.jsx(t.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(t.h2,{id:"configure-an-issuance-profile",children:"Configure an issuance profile"})}),`
`,e.jsx(t.div,{className:"lm-diff-ins lm-diff-block",children:e.jsxs(t.p,{children:["The feature is configured in the ",e.jsx(t.code,{children:"related_certificate"})," object of the issuance profile, which is stored with its own database columns:"]})}),`
`,e.jsx(t.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(e.Fragment,{children:e.jsx(t.pre,{className:"shiki shiki-themes github-light-default github-dark-default",style:{"--shiki-light":"#1f2328","--shiki-dark":"#e6edf3","--shiki-light-bg":"#ffffff","--shiki-dark-bg":"#0d1117"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(t.code,{children:[e.jsx(t.span,{className:"line",children:e.jsx(t.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"{"})}),`
`,e.jsxs(t.span,{className:"line",children:[e.jsx(t.span,{style:{"--shiki-light":"#116329","--shiki-dark":"#7EE787"},children:'  "related_certificate"'}),e.jsx(t.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:": {"})]}),`
`,e.jsxs(t.span,{className:"line",children:[e.jsx(t.span,{style:{"--shiki-light":"#116329","--shiki-dark":"#7EE787"},children:'    "enabled"'}),e.jsx(t.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:": "}),e.jsx(t.span,{style:{"--shiki-light":"#0550AE","--shiki-dark":"#79C0FF"},children:"true"}),e.jsx(t.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:","})]}),`
`,e.jsxs(t.span,{className:"line",children:[e.jsx(t.span,{style:{"--shiki-light":"#116329","--shiki-dark":"#7EE787"},children:'    "allowed_hosts"'}),e.jsx(t.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:": ["}),e.jsx(t.span,{style:{"--shiki-light":"#0A3069","--shiki-dark":"#A5D6FF"},children:'"certs.example.com"'}),e.jsx(t.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"],"})]}),`
`,e.jsxs(t.span,{className:"line",children:[e.jsx(t.span,{style:{"--shiki-light":"#116329","--shiki-dark":"#7EE787"},children:'    "max_age"'}),e.jsx(t.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:": "}),e.jsx(t.span,{style:{"--shiki-light":"#0A3069","--shiki-dark":"#A5D6FF"},children:'"5m"'})]}),`
`,e.jsx(t.span,{className:"line",children:e.jsx(t.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"  }"})}),`
`,e.jsx(t.span,{className:"line",children:e.jsx(t.span,{style:{"--shiki-light":"#1F2328","--shiki-dark":"#E6EDF3"},children:"}"})})]})})})}),`
`,e.jsx(t.div,{className:"lm-diff-ins lm-diff-block",children:e.jsxs(t.table,{children:[e.jsx(t.thead,{children:e.jsxs(t.tr,{children:[e.jsx(t.th,{children:"Field"}),e.jsx(t.th,{children:"Type"}),e.jsx(t.th,{children:"Default"}),e.jsx(t.th,{children:"Description"})]})}),e.jsxs(t.tbody,{children:[e.jsxs(t.tr,{children:[e.jsx(t.td,{children:e.jsx(t.code,{children:"enabled"})}),e.jsx(t.td,{children:"boolean"}),e.jsx(t.td,{children:e.jsx(t.code,{children:"false"})}),e.jsxs(t.td,{children:["When ",e.jsx(t.code,{children:"false"}),", a request that carries the attribute is rejected."]})]}),e.jsxs(t.tr,{children:[e.jsx(t.td,{children:e.jsx(t.code,{children:"allowed_hosts"})}),e.jsx(t.td,{children:"list of strings"}),e.jsx(t.td,{children:"empty"}),e.jsxs(t.td,{children:["Hosts from which ",e.jsx(t.code,{children:"http"})," and ",e.jsx(t.code,{children:"https"})," locations may be downloaded."]})]}),e.jsxs(t.tr,{children:[e.jsx(t.td,{children:e.jsx(t.code,{children:"max_age"})}),e.jsx(t.td,{children:"duration"}),e.jsx(t.td,{children:e.jsx(t.code,{children:"5m"})}),e.jsx(t.td,{children:"Maximum difference between the request time in the attribute and the time of issuance."})]})]})]})}),`
`,e.jsx(t.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(t.h2,{id:"what-the-issued-certificate-must-satisfy",children:"What the issued certificate must satisfy"})}),`
`,e.jsx(t.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(t.p,{children:"The fork refuses to bind a certificate unless the new one is compatible with the related one. Neither certificate may be a CA. The related certificate must be valid at the time of issuance. The key usages and extended key usages requested for the new certificate must be a subset of those of the related certificate. Verification later compares only the hash, so a relying party that checks the link learns that the issuing CA linked the new certificate to that specific certificate, not that the related certificate is still valid."})}),`
`,e.jsx(t.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(s,{type:"info",title:"Related certificates link, they do not replace",children:e.jsx(t.p,{children:"The extension is evidence of a relationship, not a dependency. A relying party must still validate each certificate against its own chain and revocation status, and revoking the classical certificate does not revoke the bound one."})})}),`
`,e.jsx(t.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(t.h2,{id:"from-the-dashboard",children:"From the dashboard"})}),`
`,e.jsx(t.div,{className:"lm-diff-ins lm-diff-block",children:e.jsxs(t.p,{children:["The dashboard exposes the feature in two places. The issuance profile form has a ",e.jsx(t.em,{children:"Related Certificates"})," section with a switch, the allowed hosts and the maximum age. When issuing a certificate from a CA with a browser-generated key and a profile that enables the feature, the form offers ",e.jsx(t.em,{children:"Bind to a related certificate"}),": the user supplies the existing certificate, or its issuer and serial number, signs the data shown with the existing key outside the browser, and pastes the signature. Certificate and CA details show a ",e.jsx(t.em,{children:"Related Certificate"})," row with the hash algorithm and value. See ",e.jsx(t.a,{href:"/docs/platform/pqc/dashboard",children:"Dashboard"}),"."]})}),`
`,e.jsx(t.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(s,{type:"info",title:"Scope of the implementation",children:e.jsxs(t.p,{children:["The bound certificate is created by the fork's ",e.jsx(t.code,{children:"CreateBoundCertificate"}),", whose tests cover an ML-DSA key bound to RSA, ECDSA and Ed25519 certificates. The tests do not use composite keys. Only the issuing side is implemented in Lamassu: the platform does not evaluate the extension when it validates certificates."]})})}),`
`,e.jsx(t.div,{className:"lm-diff-ins lm-diff-block",children:e.jsxs(r,{children:[e.jsx(a,{title:"Keys and certificate authorities",description:"Create the post-quantum CA that issues the bound certificate.",href:"/docs/platform/pqc/keys-and-cas"}),e.jsx(a,{title:"Known limitations",description:"What is not covered yet.",href:"/docs/platform/pqc/limitations"})]})})]})}function u(i={}){const{wrapper:t}=i.components||{};return t?e.jsx(t,{...i,children:e.jsx(h,{...i})}):h(i)}function n(i,t){throw new Error("Expected component `"+i+"` to be defined: you likely forgot to import, pass, or provide it.")}const p=Object.freeze(Object.defineProperty({__proto__:null,_markdown:c,default:u,frontmatter:o,lmDiff:d,structuredData:l,toc:f},Symbol.toStringTag,{value:"Module"}));export{p as _};

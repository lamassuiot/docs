import{j as e}from"./index-DqgIL_Rv.js";let d=`

<div className="lm-diff-ins lm-diff-block">
  The dashboard (branch \`feat/lamassu-q\`) lets an administrator create and inspect post-quantum keys, certificate authorities and certificates without writing API requests. It adds the algorithm choices, shows the algorithm family of every object and parses the new identifiers in certificates. Everything it sends is described in [Keys and certificate authorities](/docs/platform/pqc/keys-and-cas); this page covers what the interface shows and where its behaviour differs between screens.
</div>

<div className="lm-diff-ins lm-diff-block">
  Choosing a key type and specification [#choosing-a-key-type-and-specification]
</div>

<div className="lm-diff-ins lm-diff-block">
  Creating a KMS key, a CA with a new key and a certificate with a server-generated key all use the same pair of selectors. *Key type* is grouped by family and *Key specification* depends on the type.
</div>

<div className="lm-diff-ins lm-diff-block">
  | Group           | Key types                                                                    |
  | --------------- | ---------------------------------------------------------------------------- |
  | T (Traditional) | \`RSA\`, \`ECDSA\`, \`Ed25519\`                                                    |
  | PQ (Pure PQC)   | \`ML-DSA\`, \`SLH-DSA\`                                                          |
  | PQ/T (Hybrid)   | \`Composite-ML-DSA-RSA\`, \`Composite-ML-DSA-ECDSA\`, \`Composite-ML-DSA-Ed25519\` |
</div>

<div className="lm-diff-ins lm-diff-block">
  The specification list shows ML-DSA-44, -65 or -87, the twelve SLH-DSA parameter sets (for example *4 - SHAKE\\_128f*) or the composite variants by name. The interface sends the identifier of the parameter set as \`size\`, as explained in [Algorithms](/docs/platform/pqc/algorithms), and shows a strength indicator next to each option. For composite keys the indicator shows two bars, one for the classical component and one for the post-quantum component.
</div>

<div className="lm-diff-ins lm-diff-block">
  Which options are enabled depends on the crypto engine. When creating a key or a CA, the interface lists every algorithm but disables those that the selected engine does not support, and asks to select an engine first. When creating a certificate on the server, unsupported types are hidden instead.
</div>

<div className="lm-diff-ins lm-diff-block">
  Issuing a certificate with a browser-generated key [#issuing-a-certificate-with-a-browser-generated-key]
</div>

<div className="lm-diff-ins lm-diff-block">
  Issuing a certificate from a CA generates the key pair in the browser, builds the certificate request and sends it to the CA for signing. The key types offered here are \`RSA\`, \`ECDSA\`, \`Ed25519\`, \`ML-DSA\`, \`SLH-DSA\` and a single \`Composite ML-DSA\` entry, and they are generated in the browser: with the \`@noble\` libraries for ML-DSA and SLH-DSA and with WebCrypto for the classical algorithms.
</div>

<div className="lm-diff-ins lm-diff-block">
  Composite key generation is not available in \`@noble\`. The Lamassu team implemented it for the dashboard, combining the ML-DSA key with an RSA, ECDSA or Ed25519 key and signing the composite message representative as the specification defines, so that a composite certificate request can be created entirely in the browser.
</div>

<div className="lm-diff-ins lm-diff-block">
  The generated private key is shown once at the end of the procedure.
</div>

<div className="lm-diff-ins lm-diff-block">
  The browser does not verify the signatures of ML-DSA, SLH-DSA, composite or Ed25519 requests; it relies on the KMS.
</div>

<div className="lm-diff-ins lm-diff-block">
  How objects are displayed [#how-objects-are-displayed]
</div>

<div className="lm-diff-ins lm-diff-block">
  Lists and detail views show the algorithm family. The CA table has a *PQC* column with T, PQ or PQ/T, CA cards and the CA graph show a *PQC* badge, key lists show a quantum icon, and the details of a CA or certificate show the algorithm, its strength and the family badge. The family is computed from the algorithm identifier in the parsed certificate.
</div>

<div className="lm-diff-ins lm-diff-block">
  Algorithm names are resolved from the object identifiers. ML-DSA, SLH-DSA, composite and Ed25519 identifiers are shown as names with their parameter set, for example *ML-DSA-65* or *Composite-Signature MLDSA65-ECDSA-P384-SHA512*, and no bit length is shown for them. RSA and ECDSA signature algorithms are displayed with the dashboard's own labels, such as *RSA PKCS#1 v1.5 SHA-256* and *ECDSA SHA-256*, instead of the OpenSSL names \`sha256WithRSAEncryption\` and \`ecdsa-with-SHA256\`.
</div>

<div className="lm-diff-ins lm-diff-block">
  The key detail page can sign and verify with a post-quantum key and enables only the signature algorithm that corresponds to it.
</div>

<div className="lm-diff-ins lm-diff-block">
  Related certificates [#related-certificates]
</div>

<div className="lm-diff-ins lm-diff-block">
  The issuance profile form, the issue-certificate form and the detail pages include the related-certificate controls described in [Related certificates](/docs/platform/pqc/related-certificates).
</div>

<div className="lm-diff-ins lm-diff-block">
  Things to know [#things-to-know]
</div>

<div className="lm-diff-ins lm-diff-block">
  The key type names are not identical across all screens. Key and CA creation use \`Composite-ML-DSA-RSA\`, \`-ECDSA\` and \`-Ed25519\`; the issue-certificate form uses a single \`Composite-ML-DSA\`; and the server-side certificate form compares upper-case names. The names that the backend reports for a key may therefore differ in case from what the interface submits.
</div>

<div className="lm-diff-ins lm-diff-block">
  The interface carries no experimental warning for these algorithms and has no translation: all texts are in English.
</div>

<div className="lm-diff-ins lm-diff-block">
  <Callout type="warn" title="SLH-DSA in browser-generated keys">
    The mapping from the SLH-DSA parameter set identifier to the algorithm used by the in-browser key generator does not follow the same order as the identifiers shown in the selector and used by the backend, except for identifier 1. A certificate issued through the browser flow with an SLH-DSA identifier from 2 to 12 may therefore use a different parameter set than the one named in the selector. Create SLH-DSA keys with the KMS until this is corrected.
  </Callout>
</div>

<div className="lm-diff-ins lm-diff-block">
  <Cards>
    <Card title="Keys and certificate authorities" description="The API behind these screens." href="/docs/platform/pqc/keys-and-cas" />

    <Card title="Known limitations" description="Gaps in the interface and the platform." href="/docs/platform/pqc/limitations" />
  </Cards>
</div>
`,c={title:"Dashboard",description:"How the web interface exposes post-quantum algorithms when creating keys, CAs and certificates, and how it displays them."},h={isNew:!0,changes:22,title:void 0,description:void 0},l={contents:[{heading:void 0,content:"The dashboard (branch `feat/lamassu-q`) lets an administrator create and inspect post-quantum keys, certificate authorities and certificates without writing API requests. It adds the algorithm choices, shows the algorithm family of every object and parses the new identifiers in certificates. Everything it sends is described in Keys and certificate authorities; this page covers what the interface shows and where its behaviour differs between screens."},{heading:"choosing-a-key-type-and-specification",content:"Creating a KMS key, a CA with a new key and a certificate with a server-generated key all use the same pair of selectors. *Key type* is grouped by family and *Key specification* depends on the type."},{heading:"choosing-a-key-type-and-specification",content:"Group"},{heading:"choosing-a-key-type-and-specification",content:"Key types"},{heading:"choosing-a-key-type-and-specification",content:"T (Traditional)"},{heading:"choosing-a-key-type-and-specification",content:"`RSA`, `ECDSA`, `Ed25519`"},{heading:"choosing-a-key-type-and-specification",content:"PQ (Pure PQC)"},{heading:"choosing-a-key-type-and-specification",content:"`ML-DSA`, `SLH-DSA`"},{heading:"choosing-a-key-type-and-specification",content:"PQ/T (Hybrid)"},{heading:"choosing-a-key-type-and-specification",content:"`Composite-ML-DSA-RSA`, `Composite-ML-DSA-ECDSA`, `Composite-ML-DSA-Ed25519`"},{heading:"choosing-a-key-type-and-specification",content:"The specification list shows ML-DSA-44, -65 or -87, the twelve SLH-DSA parameter sets (for example *4 - SHAKE\\_128f*) or the composite variants by name. The interface sends the identifier of the parameter set as `size`, as explained in Algorithms, and shows a strength indicator next to each option. For composite keys the indicator shows two bars, one for the classical component and one for the post-quantum component."},{heading:"choosing-a-key-type-and-specification",content:"Which options are enabled depends on the crypto engine. When creating a key or a CA, the interface lists every algorithm but disables those that the selected engine does not support, and asks to select an engine first. When creating a certificate on the server, unsupported types are hidden instead."},{heading:"issuing-a-certificate-with-a-browser-generated-key",content:"Issuing a certificate from a CA generates the key pair in the browser, builds the certificate request and sends it to the CA for signing. The key types offered here are `RSA`, `ECDSA`, `Ed25519`, `ML-DSA`, `SLH-DSA` and a single `Composite ML-DSA` entry, and they are generated in the browser: with the `@noble` libraries for ML-DSA and SLH-DSA and with WebCrypto for the classical algorithms."},{heading:"issuing-a-certificate-with-a-browser-generated-key",content:"Composite key generation is not available in `@noble`. The Lamassu team implemented it for the dashboard, combining the ML-DSA key with an RSA, ECDSA or Ed25519 key and signing the composite message representative as the specification defines, so that a composite certificate request can be created entirely in the browser."},{heading:"issuing-a-certificate-with-a-browser-generated-key",content:"The generated private key is shown once at the end of the procedure."},{heading:"issuing-a-certificate-with-a-browser-generated-key",content:"The browser does not verify the signatures of ML-DSA, SLH-DSA, composite or Ed25519 requests; it relies on the KMS."},{heading:"how-objects-are-displayed",content:"Lists and detail views show the algorithm family. The CA table has a *PQC* column with T, PQ or PQ/T, CA cards and the CA graph show a *PQC* badge, key lists show a quantum icon, and the details of a CA or certificate show the algorithm, its strength and the family badge. The family is computed from the algorithm identifier in the parsed certificate."},{heading:"how-objects-are-displayed",content:"Algorithm names are resolved from the object identifiers. ML-DSA, SLH-DSA, composite and Ed25519 identifiers are shown as names with their parameter set, for example *ML-DSA-65* or *Composite-Signature MLDSA65-ECDSA-P384-SHA512*, and no bit length is shown for them. RSA and ECDSA signature algorithms are displayed with the dashboard's own labels, such as *RSA PKCS#1 v1.5 SHA-256* and *ECDSA SHA-256*, instead of the OpenSSL names `sha256WithRSAEncryption` and `ecdsa-with-SHA256`."},{heading:"how-objects-are-displayed",content:"The key detail page can sign and verify with a post-quantum key and enables only the signature algorithm that corresponds to it."},{heading:"related-certificates",content:"The issuance profile form, the issue-certificate form and the detail pages include the related-certificate controls described in Related certificates."},{heading:"things-to-know",content:"The key type names are not identical across all screens. Key and CA creation use `Composite-ML-DSA-RSA`, `-ECDSA` and `-Ed25519`; the issue-certificate form uses a single `Composite-ML-DSA`; and the server-side certificate form compares upper-case names. The names that the backend reports for a key may therefore differ in case from what the interface submits."},{heading:"things-to-know",content:"The interface carries no experimental warning for these algorithms and has no translation: all texts are in English."},{heading:"things-to-know",content:"The mapping from the SLH-DSA parameter set identifier to the algorithm used by the in-browser key generator does not follow the same order as the identifiers shown in the selector and used by the backend, except for identifier 1. A certificate issued through the browser flow with an SLH-DSA identifier from 2 to 12 may therefore use a different parameter set than the one named in the selector. Create SLH-DSA keys with the KMS until this is corrected."},{heading:"things-to-know",content:'<Card title="Keys and certificate authorities" description="The API behind these screens." href="/docs/platform/pqc/keys-and-cas" />'},{heading:"things-to-know",content:'<Card title="Known limitations" description="Gaps in the interface and the platform." href="/docs/platform/pqc/limitations" />'}],headings:[{id:"choosing-a-key-type-and-specification",content:"Choosing a key type and specification"},{id:"issuing-a-certificate-with-a-browser-generated-key",content:"Issuing a certificate with a browser-generated key"},{id:"how-objects-are-displayed",content:"How objects are displayed"},{id:"related-certificates",content:"Related certificates"},{id:"things-to-know",content:"Things to know"}]};const f=[{depth:2,url:"#choosing-a-key-type-and-specification",title:e.jsx(e.Fragment,{children:"Choosing a key type and specification"})},{depth:2,url:"#issuing-a-certificate-with-a-browser-generated-key",title:e.jsx(e.Fragment,{children:"Issuing a certificate with a browser-generated key"})},{depth:2,url:"#how-objects-are-displayed",title:e.jsx(e.Fragment,{children:"How objects are displayed"})},{depth:2,url:"#related-certificates",title:e.jsx(e.Fragment,{children:"Related certificates"})},{depth:2,url:"#things-to-know",title:e.jsx(e.Fragment,{children:"Things to know"})}];function o(t){const i={a:"a",code:"code",div:"div",em:"em",h2:"h2",p:"p",table:"table",tbody:"tbody",td:"td",th:"th",thead:"thead",tr:"tr",...t.components},{Callout:a,Card:s,Cards:r}=i;return a||n("Callout"),s||n("Card"),r||n("Cards"),e.jsxs(e.Fragment,{children:[e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsxs(i.p,{children:["The dashboard (branch ",e.jsx(i.code,{children:"feat/lamassu-q"}),") lets an administrator create and inspect post-quantum keys, certificate authorities and certificates without writing API requests. It adds the algorithm choices, shows the algorithm family of every object and parses the new identifiers in certificates. Everything it sends is described in ",e.jsx(i.a,{href:"/docs/platform/pqc/keys-and-cas",children:"Keys and certificate authorities"}),"; this page covers what the interface shows and where its behaviour differs between screens."]})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(i.h2,{id:"choosing-a-key-type-and-specification",children:"Choosing a key type and specification"})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsxs(i.p,{children:["Creating a KMS key, a CA with a new key and a certificate with a server-generated key all use the same pair of selectors. ",e.jsx(i.em,{children:"Key type"})," is grouped by family and ",e.jsx(i.em,{children:"Key specification"})," depends on the type."]})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsxs(i.table,{children:[e.jsx(i.thead,{children:e.jsxs(i.tr,{children:[e.jsx(i.th,{children:"Group"}),e.jsx(i.th,{children:"Key types"})]})}),e.jsxs(i.tbody,{children:[e.jsxs(i.tr,{children:[e.jsx(i.td,{children:"T (Traditional)"}),e.jsxs(i.td,{children:[e.jsx(i.code,{children:"RSA"}),", ",e.jsx(i.code,{children:"ECDSA"}),", ",e.jsx(i.code,{children:"Ed25519"})]})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{children:"PQ (Pure PQC)"}),e.jsxs(i.td,{children:[e.jsx(i.code,{children:"ML-DSA"}),", ",e.jsx(i.code,{children:"SLH-DSA"})]})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{children:"PQ/T (Hybrid)"}),e.jsxs(i.td,{children:[e.jsx(i.code,{children:"Composite-ML-DSA-RSA"}),", ",e.jsx(i.code,{children:"Composite-ML-DSA-ECDSA"}),", ",e.jsx(i.code,{children:"Composite-ML-DSA-Ed25519"})]})]})]})]})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsxs(i.p,{children:["The specification list shows ML-DSA-44, -65 or -87, the twelve SLH-DSA parameter sets (for example ",e.jsx(i.em,{children:"4 - SHAKE_128f"}),") or the composite variants by name. The interface sends the identifier of the parameter set as ",e.jsx(i.code,{children:"size"}),", as explained in ",e.jsx(i.a,{href:"/docs/platform/pqc/algorithms",children:"Algorithms"}),", and shows a strength indicator next to each option. For composite keys the indicator shows two bars, one for the classical component and one for the post-quantum component."]})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(i.p,{children:"Which options are enabled depends on the crypto engine. When creating a key or a CA, the interface lists every algorithm but disables those that the selected engine does not support, and asks to select an engine first. When creating a certificate on the server, unsupported types are hidden instead."})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(i.h2,{id:"issuing-a-certificate-with-a-browser-generated-key",children:"Issuing a certificate with a browser-generated key"})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsxs(i.p,{children:["Issuing a certificate from a CA generates the key pair in the browser, builds the certificate request and sends it to the CA for signing. The key types offered here are ",e.jsx(i.code,{children:"RSA"}),", ",e.jsx(i.code,{children:"ECDSA"}),", ",e.jsx(i.code,{children:"Ed25519"}),", ",e.jsx(i.code,{children:"ML-DSA"}),", ",e.jsx(i.code,{children:"SLH-DSA"})," and a single ",e.jsx(i.code,{children:"Composite ML-DSA"})," entry, and they are generated in the browser: with the ",e.jsx(i.code,{children:"@noble"})," libraries for ML-DSA and SLH-DSA and with WebCrypto for the classical algorithms."]})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsxs(i.p,{children:["Composite key generation is not available in ",e.jsx(i.code,{children:"@noble"}),". The Lamassu team implemented it for the dashboard, combining the ML-DSA key with an RSA, ECDSA or Ed25519 key and signing the composite message representative as the specification defines, so that a composite certificate request can be created entirely in the browser."]})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(i.p,{children:"The generated private key is shown once at the end of the procedure."})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(i.p,{children:"The browser does not verify the signatures of ML-DSA, SLH-DSA, composite or Ed25519 requests; it relies on the KMS."})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(i.h2,{id:"how-objects-are-displayed",children:"How objects are displayed"})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsxs(i.p,{children:["Lists and detail views show the algorithm family. The CA table has a ",e.jsx(i.em,{children:"PQC"})," column with T, PQ or PQ/T, CA cards and the CA graph show a ",e.jsx(i.em,{children:"PQC"})," badge, key lists show a quantum icon, and the details of a CA or certificate show the algorithm, its strength and the family badge. The family is computed from the algorithm identifier in the parsed certificate."]})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsxs(i.p,{children:["Algorithm names are resolved from the object identifiers. ML-DSA, SLH-DSA, composite and Ed25519 identifiers are shown as names with their parameter set, for example ",e.jsx(i.em,{children:"ML-DSA-65"})," or ",e.jsx(i.em,{children:"Composite-Signature MLDSA65-ECDSA-P384-SHA512"}),", and no bit length is shown for them. RSA and ECDSA signature algorithms are displayed with the dashboard's own labels, such as ",e.jsx(i.em,{children:"RSA PKCS#1 v1.5 SHA-256"})," and ",e.jsx(i.em,{children:"ECDSA SHA-256"}),", instead of the OpenSSL names ",e.jsx(i.code,{children:"sha256WithRSAEncryption"})," and ",e.jsx(i.code,{children:"ecdsa-with-SHA256"}),"."]})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(i.p,{children:"The key detail page can sign and verify with a post-quantum key and enables only the signature algorithm that corresponds to it."})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(i.h2,{id:"related-certificates",children:"Related certificates"})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsxs(i.p,{children:["The issuance profile form, the issue-certificate form and the detail pages include the related-certificate controls described in ",e.jsx(i.a,{href:"/docs/platform/pqc/related-certificates",children:"Related certificates"}),"."]})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(i.h2,{id:"things-to-know",children:"Things to know"})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsxs(i.p,{children:["The key type names are not identical across all screens. Key and CA creation use ",e.jsx(i.code,{children:"Composite-ML-DSA-RSA"}),", ",e.jsx(i.code,{children:"-ECDSA"})," and ",e.jsx(i.code,{children:"-Ed25519"}),"; the issue-certificate form uses a single ",e.jsx(i.code,{children:"Composite-ML-DSA"}),"; and the server-side certificate form compares upper-case names. The names that the backend reports for a key may therefore differ in case from what the interface submits."]})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(i.p,{children:"The interface carries no experimental warning for these algorithms and has no translation: all texts are in English."})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(a,{type:"warn",title:"SLH-DSA in browser-generated keys",children:e.jsx(i.p,{children:"The mapping from the SLH-DSA parameter set identifier to the algorithm used by the in-browser key generator does not follow the same order as the identifiers shown in the selector and used by the backend, except for identifier 1. A certificate issued through the browser flow with an SLH-DSA identifier from 2 to 12 may therefore use a different parameter set than the one named in the selector. Create SLH-DSA keys with the KMS until this is corrected."})})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsxs(r,{children:[e.jsx(s,{title:"Keys and certificate authorities",description:"The API behind these screens.",href:"/docs/platform/pqc/keys-and-cas"}),e.jsx(s,{title:"Known limitations",description:"Gaps in the interface and the platform.",href:"/docs/platform/pqc/limitations"})]})})]})}function m(t={}){const{wrapper:i}=t.components||{};return i?e.jsx(i,{...t,children:e.jsx(o,{...t})}):o(t)}function n(t,i){throw new Error("Expected component `"+t+"` to be defined: you likely forgot to import, pass, or provide it.")}const g=Object.freeze(Object.defineProperty({__proto__:null,_markdown:d,default:m,frontmatter:c,lmDiff:h,structuredData:l,toc:f},Symbol.toStringTag,{value:"Module"}));export{g as _};

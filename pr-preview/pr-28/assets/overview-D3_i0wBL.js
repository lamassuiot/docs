import{j as e}from"./index-prc0XQdj.js";let c=`

The PKI section explains how to build and operate X.509 trust in Lamassu: which authorities issue, which rules apply and how to check certificates. It is intended for PKI administrators and anyone who needs to use certificates in a consuming system.

Start here [#start-here]

Follow [PKI getting started](/docs/platform/pki/quickstarts/overview) to create a CA, issue a client certificate and verify it with OpenSSL. The result is a certificate, its private key and a verified chain.

You can complete that path before managing devices. When you need to associate the identity with an inventory or automate its enrollment, continue in [IoT Fleets](/docs/platform/iot-fleets/overview).

What you need [#what-you-need]

* An accessible instance and permission to manage the keys, CAs and certificates you will use.
* An available cryptographic engine to keep the authority's key.
* The certificate's purpose, such as authenticating a client through mTLS.
* Consumer requirements: accepted issuers, algorithms, names and permitted usages.

Prepare the instance and cryptographic provider in [Deployment](/docs/deployment/overview). The [trust model](/docs/platform/pki/concepts/trust-model) explains hierarchy choices.

Core capabilities [#core-capabilities]

Build your trust hierarchy [#build-your-trust-hierarchy]

[Authorities](/docs/platform/pki/certificate-authorities) sign certificates. A root establishes the trust anchor, and an intermediate separates issuance by environment or purpose. [Hierarchy and rotation](/docs/platform/pki/ca-hierarchy-and-rotation) explains how to maintain trust when replacing an authority.

Protect cryptographic keys [#protect-cryptographic-keys]

CA signing keys are managed through [KMS and cryptographic engines](/docs/platform/pki/key-management). A client that generates a CSR can keep its own key: preserve that custody when choosing the issuance method.

Issue and control certificates [#issue-and-control-certificates]

A [profile](/docs/platform/pki/certificate-profiles) establishes subject, validity, usage and key restrictions. The CA applies issuance configuration and signs the certificate. In the [inventory](/docs/platform/pki/certificates), you can inspect the result, download it and manage its status.

Publish validation status [#publish-validation-status]

[Validation](/docs/platform/pki/certificate-validation) covers the chain, validity, usages and revocation status. Lamassu publishes status through [OCSP](/docs/platform/pki/ocsp) and [CRL](/docs/platform/pki/crl); the consumer configures which issuers it recognizes and how it checks that status.

How to check the result [#how-to-check-the-result]

An active certificate in the console is one part of the check. Also verify that:

* its subject and extensions identify the expected client;
* its public key matches the client's private key;
* its chain reaches a root trusted by the consumer;
* its dates and usages allow the operation;
* the consumer applies revocation checks and authorization.

The [issuance path](/docs/platform/pki/quickstarts/issue-certificate) includes the first independent checks.

Continue [#continue]

<Cards>
  <Card title="PKI getting started" description="Create a CA, then issue and verify a client certificate." href="/docs/platform/pki/quickstarts/overview" />

  <Card title="Apply PKI to devices" description="Associate certificates with inventory and prepare enrollment." href="/docs/platform/iot-fleets/overview" />

  <Card title="PKI diagnostics" description="Check issuance, OCSP and CRL when the result fails." href="/docs/platform/pki/troubleshooting" />
</Cards>
`,o={title:"PKI",description:"Administer keys and authorities, define issuance and verify the resulting certificates."},h={contents:[{heading:void 0,content:"The PKI section explains how to build and operate X.509 trust in Lamassu: which authorities issue, which rules apply and how to check certificates. It is intended for PKI administrators and anyone who needs to use certificates in a consuming system."},{heading:"start-here",content:"Follow PKI getting started to create a CA, issue a client certificate and verify it with OpenSSL. The result is a certificate, its private key and a verified chain."},{heading:"start-here",content:"You can complete that path before managing devices. When you need to associate the identity with an inventory or automate its enrollment, continue in IoT Fleets."},{heading:"what-you-need",content:"An accessible instance and permission to manage the keys, CAs and certificates you will use."},{heading:"what-you-need",content:"An available cryptographic engine to keep the authority's key."},{heading:"what-you-need",content:"The certificate's purpose, such as authenticating a client through mTLS."},{heading:"what-you-need",content:"Consumer requirements: accepted issuers, algorithms, names and permitted usages."},{heading:"what-you-need",content:"Prepare the instance and cryptographic provider in Deployment. The trust model explains hierarchy choices."},{heading:"build-your-trust-hierarchy",content:"Authorities sign certificates. A root establishes the trust anchor, and an intermediate separates issuance by environment or purpose. Hierarchy and rotation explains how to maintain trust when replacing an authority."},{heading:"protect-cryptographic-keys",content:"CA signing keys are managed through KMS and cryptographic engines. A client that generates a CSR can keep its own key: preserve that custody when choosing the issuance method."},{heading:"issue-and-control-certificates",content:"A profile establishes subject, validity, usage and key restrictions. The CA applies issuance configuration and signs the certificate. In the inventory, you can inspect the result, download it and manage its status."},{heading:"publish-validation-status",content:"Validation covers the chain, validity, usages and revocation status. Lamassu publishes status through OCSP and CRL; the consumer configures which issuers it recognizes and how it checks that status."},{heading:"how-to-check-the-result",content:"An active certificate in the console is one part of the check. Also verify that:"},{heading:"how-to-check-the-result",content:"its subject and extensions identify the expected client;"},{heading:"how-to-check-the-result",content:"its public key matches the client's private key;"},{heading:"how-to-check-the-result",content:"its chain reaches a root trusted by the consumer;"},{heading:"how-to-check-the-result",content:"its dates and usages allow the operation;"},{heading:"how-to-check-the-result",content:"the consumer applies revocation checks and authorization."},{heading:"how-to-check-the-result",content:"The issuance path includes the first independent checks."},{heading:"continue",content:'<Card title="PKI getting started" description="Create a CA, then issue and verify a client certificate." href="/docs/platform/pki/quickstarts/overview" />'},{heading:"continue",content:'<Card title="Apply PKI to devices" description="Associate certificates with inventory and prepare enrollment." href="/docs/platform/iot-fleets/overview" />'},{heading:"continue",content:'<Card title="PKI diagnostics" description="Check issuance, OCSP and CRL when the result fails." href="/docs/platform/pki/troubleshooting" />'}],headings:[{id:"start-here",content:"Start here"},{id:"what-you-need",content:"What you need"},{id:"core-capabilities",content:"Core capabilities"},{id:"build-your-trust-hierarchy",content:"Build your trust hierarchy"},{id:"protect-cryptographic-keys",content:"Protect cryptographic keys"},{id:"issue-and-control-certificates",content:"Issue and control certificates"},{id:"publish-validation-status",content:"Publish validation status"},{id:"how-to-check-the-result",content:"How to check the result"},{id:"continue",content:"Continue"}]};const d=[{depth:2,url:"#start-here",title:e.jsx(e.Fragment,{children:"Start here"})},{depth:2,url:"#what-you-need",title:e.jsx(e.Fragment,{children:"What you need"})},{depth:2,url:"#core-capabilities",title:e.jsx(e.Fragment,{children:"Core capabilities"})},{depth:3,url:"#build-your-trust-hierarchy",title:e.jsx(e.Fragment,{children:"Build your trust hierarchy"})},{depth:3,url:"#protect-cryptographic-keys",title:e.jsx(e.Fragment,{children:"Protect cryptographic keys"})},{depth:3,url:"#issue-and-control-certificates",title:e.jsx(e.Fragment,{children:"Issue and control certificates"})},{depth:3,url:"#publish-validation-status",title:e.jsx(e.Fragment,{children:"Publish validation status"})},{depth:2,url:"#how-to-check-the-result",title:e.jsx(e.Fragment,{children:"How to check the result"})},{depth:2,url:"#continue",title:e.jsx(e.Fragment,{children:"Continue"})}];function a(i){const t={a:"a",h2:"h2",h3:"h3",li:"li",p:"p",ul:"ul",...i.components},{Card:n,Cards:s}=t;return n||r("Card"),s||r("Cards"),e.jsxs(e.Fragment,{children:[e.jsx(t.p,{children:"The PKI section explains how to build and operate X.509 trust in Lamassu: which authorities issue, which rules apply and how to check certificates. It is intended for PKI administrators and anyone who needs to use certificates in a consuming system."}),`
`,e.jsx(t.h2,{id:"start-here",children:"Start here"}),`
`,e.jsxs(t.p,{children:["Follow ",e.jsx(t.a,{href:"/docs/platform/pki/quickstarts/overview",children:"PKI getting started"})," to create a CA, issue a client certificate and verify it with OpenSSL. The result is a certificate, its private key and a verified chain."]}),`
`,e.jsxs(t.p,{children:["You can complete that path before managing devices. When you need to associate the identity with an inventory or automate its enrollment, continue in ",e.jsx(t.a,{href:"/docs/platform/iot-fleets/overview",children:"IoT Fleets"}),"."]}),`
`,e.jsx(t.h2,{id:"what-you-need",children:"What you need"}),`
`,e.jsxs(t.ul,{children:[`
`,e.jsx(t.li,{children:"An accessible instance and permission to manage the keys, CAs and certificates you will use."}),`
`,e.jsx(t.li,{children:"An available cryptographic engine to keep the authority's key."}),`
`,e.jsx(t.li,{children:"The certificate's purpose, such as authenticating a client through mTLS."}),`
`,e.jsx(t.li,{children:"Consumer requirements: accepted issuers, algorithms, names and permitted usages."}),`
`]}),`
`,e.jsxs(t.p,{children:["Prepare the instance and cryptographic provider in ",e.jsx(t.a,{href:"/docs/deployment/overview",children:"Deployment"}),". The ",e.jsx(t.a,{href:"/docs/platform/pki/concepts/trust-model",children:"trust model"})," explains hierarchy choices."]}),`
`,e.jsx(t.h2,{id:"core-capabilities",children:"Core capabilities"}),`
`,e.jsx(t.h3,{id:"build-your-trust-hierarchy",children:"Build your trust hierarchy"}),`
`,e.jsxs(t.p,{children:[e.jsx(t.a,{href:"/docs/platform/pki/certificate-authorities",children:"Authorities"})," sign certificates. A root establishes the trust anchor, and an intermediate separates issuance by environment or purpose. ",e.jsx(t.a,{href:"/docs/platform/pki/ca-hierarchy-and-rotation",children:"Hierarchy and rotation"})," explains how to maintain trust when replacing an authority."]}),`
`,e.jsx(t.h3,{id:"protect-cryptographic-keys",children:"Protect cryptographic keys"}),`
`,e.jsxs(t.p,{children:["CA signing keys are managed through ",e.jsx(t.a,{href:"/docs/platform/pki/key-management",children:"KMS and cryptographic engines"}),". A client that generates a CSR can keep its own key: preserve that custody when choosing the issuance method."]}),`
`,e.jsx(t.h3,{id:"issue-and-control-certificates",children:"Issue and control certificates"}),`
`,e.jsxs(t.p,{children:["A ",e.jsx(t.a,{href:"/docs/platform/pki/certificate-profiles",children:"profile"})," establishes subject, validity, usage and key restrictions. The CA applies issuance configuration and signs the certificate. In the ",e.jsx(t.a,{href:"/docs/platform/pki/certificates",children:"inventory"}),", you can inspect the result, download it and manage its status."]}),`
`,e.jsx(t.h3,{id:"publish-validation-status",children:"Publish validation status"}),`
`,e.jsxs(t.p,{children:[e.jsx(t.a,{href:"/docs/platform/pki/certificate-validation",children:"Validation"})," covers the chain, validity, usages and revocation status. Lamassu publishes status through ",e.jsx(t.a,{href:"/docs/platform/pki/ocsp",children:"OCSP"})," and ",e.jsx(t.a,{href:"/docs/platform/pki/crl",children:"CRL"}),"; the consumer configures which issuers it recognizes and how it checks that status."]}),`
`,e.jsx(t.h2,{id:"how-to-check-the-result",children:"How to check the result"}),`
`,e.jsx(t.p,{children:"An active certificate in the console is one part of the check. Also verify that:"}),`
`,e.jsxs(t.ul,{children:[`
`,e.jsx(t.li,{children:"its subject and extensions identify the expected client;"}),`
`,e.jsx(t.li,{children:"its public key matches the client's private key;"}),`
`,e.jsx(t.li,{children:"its chain reaches a root trusted by the consumer;"}),`
`,e.jsx(t.li,{children:"its dates and usages allow the operation;"}),`
`,e.jsx(t.li,{children:"the consumer applies revocation checks and authorization."}),`
`]}),`
`,e.jsxs(t.p,{children:["The ",e.jsx(t.a,{href:"/docs/platform/pki/quickstarts/issue-certificate",children:"issuance path"})," includes the first independent checks."]}),`
`,e.jsx(t.h2,{id:"continue",children:"Continue"}),`
`,e.jsxs(s,{children:[e.jsx(n,{title:"PKI getting started",description:"Create a CA, then issue and verify a client certificate.",href:"/docs/platform/pki/quickstarts/overview"}),e.jsx(n,{title:"Apply PKI to devices",description:"Associate certificates with inventory and prepare enrollment.",href:"/docs/platform/iot-fleets/overview"}),e.jsx(n,{title:"PKI diagnostics",description:"Check issuance, OCSP and CRL when the result fails.",href:"/docs/platform/pki/troubleshooting"})]})]})}function l(i={}){const{wrapper:t}=i.components||{};return t?e.jsx(t,{...i,children:e.jsx(a,{...i})}):a(i)}function r(i,t){throw new Error("Expected component `"+i+"` to be defined: you likely forgot to import, pass, or provide it.")}const p=Object.freeze(Object.defineProperty({__proto__:null,_markdown:c,default:l,frontmatter:o,structuredData:h,toc:d},Symbol.toStringTag,{value:"Module"}));export{p as _};

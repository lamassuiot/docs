import{j as e}from"./index-prc0XQdj.js";let c=`

You will create a root authority with a new key kept by a Lamassu engine. The result is an active CA and its public certificate in \`ca.pem\`, ready to verify issuance in the next path.

Before you begin [#before-you-begin]

* Console access and permission to create keys and authorities.
* An available cryptographic engine that supports the chosen algorithm.
* OpenSSL 3.x to check the downloaded certificate.

Use an evaluation instance or an authority intended for these tests. The example creates a root that issues directly; to design an operational hierarchy, see [Hierarchy and rotation](/docs/platform/pki/ca-hierarchy-and-rotation).

<Steps>
  <Step>
    Open the creation wizard [#open-the-creation-wizard]

    In **Certification Authorities**, select **Create New CA** and choose to create a CA with a new key pair.

    The **Create New CA (Existing Key)** flow is explained in the [authorities guide](/docs/platform/pki/certificate-authorities).
  </Step>

  <Step>
    Select the key [#select-the-key]

    Choose the engine that will keep the key and an algorithm its capabilities allow. For this example, you can use **EC P-384** if available.

    The CA private key is used through the engine. In this path, you will download only the authority's public certificate.
  </Step>

  <Step>
    Define the authority [#define-the-authority]

    Select **Root CA** and complete:

    * **CA Name**: \`Acme Evaluation Root CA\`.
    * **Subject**: organization and country details for your evaluation.
    * **CA Certificate Expiration**: for example, one year from creation.
    * **Default End-Entity Certificate Issuance Expiration**: for example, 90 days, within the CA's lifetime.

    The CA name becomes its \`Common Name\`. Keep the CA usages needed to sign certificates and CRLs.
  </Step>

  <Step>
    Review and create the CA [#review-and-create-the-ca]

    Check the engine, algorithm, subject, root type and dates. Confirm creation and note the authority identifier so you can recognize it in the DMS or API.
  </Step>

  <Step>
    Verify the result [#verify-the-result]

    Open the new CA. It should appear active, show its certificate and allow access to **Issued Certificates**.

    Download or copy the authority's PEM certificate and save it as \`ca.pem\`. Check that the file contains the complete block, including \`BEGIN CERTIFICATE\` and \`END CERTIFICATE\`.
  </Step>
</Steps>

Check the CA certificate [#check-the-ca-certificate]

Run from the directory where you saved \`ca.pem\`:

\`\`\`bash
openssl x509 -in ca.pem -noout -subject -issuer -dates
openssl x509 -in ca.pem -noout -text
openssl verify -CAfile ca.pem -check_ss_sig ca.pem
\`\`\`

Check that the subject and issuer match the root you created, the dates include the current time, **Basic Constraints** contains \`CA:TRUE\` and **Key Usage** allows certificate signing. The last command should return \`ca.pem: OK\`.

You explicitly selected \`ca.pem\` as the trust anchor for this test. A valid self-signature does not install that trust in other consumers. See the [openssl-verify reference](https://docs.openssl.org/3.6/man1/openssl-verify/) for verification options.

If the result fails [#if-the-result-fails]

* If creation fails, check permissions, engine availability and the selected algorithm.
* If OpenSSL cannot read the file, copy the complete PEM block again.
* If signature or date checks fail, check that you downloaded this CA's certificate and that your computer's clock is correct.

[PKI diagnostics](/docs/platform/pki/troubleshooting) covers issuance checks and cryptographic dependencies.

Next step [#next-step]

Continue with [Issue and verify a certificate](/docs/platform/pki/quickstarts/issue-certificate), using this authority and \`ca.pem\`.
`,o={title:"Create your first CA",description:"Create an evaluation root and check its certificate before issuing."},h={contents:[{heading:void 0,content:"You will create a root authority with a new key kept by a Lamassu engine. The result is an active CA and its public certificate in `ca.pem`, ready to verify issuance in the next path."},{heading:"before-you-begin",content:"Console access and permission to create keys and authorities."},{heading:"before-you-begin",content:"An available cryptographic engine that supports the chosen algorithm."},{heading:"before-you-begin",content:"OpenSSL 3.x to check the downloaded certificate."},{heading:"before-you-begin",content:"Use an evaluation instance or an authority intended for these tests. The example creates a root that issues directly; to design an operational hierarchy, see Hierarchy and rotation."},{heading:"open-the-creation-wizard",content:"In **Certification Authorities**, select **Create New CA** and choose to create a CA with a new key pair."},{heading:"open-the-creation-wizard",content:"The &#x2A;*Create New CA (Existing Key)** flow is explained in the authorities guide."},{heading:"select-the-key",content:"Choose the engine that will keep the key and an algorithm its capabilities allow. For this example, you can use **EC P-384** if available."},{heading:"select-the-key",content:"The CA private key is used through the engine. In this path, you will download only the authority's public certificate."},{heading:"define-the-authority",content:"Select **Root CA** and complete:"},{heading:"define-the-authority",content:"**CA Name**: `Acme Evaluation Root CA`."},{heading:"define-the-authority",content:"**Subject**: organization and country details for your evaluation."},{heading:"define-the-authority",content:"**CA Certificate Expiration**: for example, one year from creation."},{heading:"define-the-authority",content:"**Default End-Entity Certificate Issuance Expiration**: for example, 90 days, within the CA's lifetime."},{heading:"define-the-authority",content:"The CA name becomes its `Common Name`. Keep the CA usages needed to sign certificates and CRLs."},{heading:"review-and-create-the-ca",content:"Check the engine, algorithm, subject, root type and dates. Confirm creation and note the authority identifier so you can recognize it in the DMS or API."},{heading:"verify-the-result",content:"Open the new CA. It should appear active, show its certificate and allow access to **Issued Certificates**."},{heading:"verify-the-result",content:"Download or copy the authority's PEM certificate and save it as `ca.pem`. Check that the file contains the complete block, including `BEGIN CERTIFICATE` and `END CERTIFICATE`."},{heading:"check-the-ca-certificate",content:"Run from the directory where you saved `ca.pem`:"},{heading:"check-the-ca-certificate",content:"Check that the subject and issuer match the root you created, the dates include the current time, **Basic Constraints** contains `CA:TRUE` and **Key Usage** allows certificate signing. The last command should return `ca.pem: OK`."},{heading:"check-the-ca-certificate",content:"You explicitly selected `ca.pem` as the trust anchor for this test. A valid self-signature does not install that trust in other consumers. See the openssl-verify reference for verification options."},{heading:"if-the-result-fails",content:"If creation fails, check permissions, engine availability and the selected algorithm."},{heading:"if-the-result-fails",content:"If OpenSSL cannot read the file, copy the complete PEM block again."},{heading:"if-the-result-fails",content:"If signature or date checks fail, check that you downloaded this CA's certificate and that your computer's clock is correct."},{heading:"if-the-result-fails",content:"PKI diagnostics covers issuance checks and cryptographic dependencies."},{heading:"next-step",content:"Continue with Issue and verify a certificate, using this authority and `ca.pem`."}],headings:[{id:"before-you-begin",content:"Before you begin"},{id:"open-the-creation-wizard",content:"Open the creation wizard"},{id:"select-the-key",content:"Select the key"},{id:"define-the-authority",content:"Define the authority"},{id:"review-and-create-the-ca",content:"Review and create the CA"},{id:"verify-the-result",content:"Verify the result"},{id:"check-the-ca-certificate",content:"Check the CA certificate"},{id:"if-the-result-fails",content:"If the result fails"},{id:"next-step",content:"Next step"}]};const l=[{depth:2,url:"#before-you-begin",title:e.jsx(e.Fragment,{children:"Before you begin"})},{depth:3,url:"#open-the-creation-wizard",title:e.jsx(e.Fragment,{children:"Open the creation wizard"})},{depth:3,url:"#select-the-key",title:e.jsx(e.Fragment,{children:"Select the key"})},{depth:3,url:"#define-the-authority",title:e.jsx(e.Fragment,{children:"Define the authority"})},{depth:3,url:"#review-and-create-the-ca",title:e.jsx(e.Fragment,{children:"Review and create the CA"})},{depth:3,url:"#verify-the-result",title:e.jsx(e.Fragment,{children:"Verify the result"})},{depth:2,url:"#check-the-ca-certificate",title:e.jsx(e.Fragment,{children:"Check the CA certificate"})},{depth:2,url:"#if-the-result-fails",title:e.jsx(e.Fragment,{children:"If the result fails"})},{depth:2,url:"#next-step",title:e.jsx(e.Fragment,{children:"Next step"})}];function s(i){const t={a:"a",code:"code",h2:"h2",h3:"h3",li:"li",p:"p",pre:"pre",span:"span",strong:"strong",ul:"ul",...i.components},{Step:n,Steps:a}=t;return n||r("Step"),a||r("Steps"),e.jsxs(e.Fragment,{children:[e.jsxs(t.p,{children:["You will create a root authority with a new key kept by a Lamassu engine. The result is an active CA and its public certificate in ",e.jsx(t.code,{children:"ca.pem"}),", ready to verify issuance in the next path."]}),`
`,e.jsx(t.h2,{id:"before-you-begin",children:"Before you begin"}),`
`,e.jsxs(t.ul,{children:[`
`,e.jsx(t.li,{children:"Console access and permission to create keys and authorities."}),`
`,e.jsx(t.li,{children:"An available cryptographic engine that supports the chosen algorithm."}),`
`,e.jsx(t.li,{children:"OpenSSL 3.x to check the downloaded certificate."}),`
`]}),`
`,e.jsxs(t.p,{children:["Use an evaluation instance or an authority intended for these tests. The example creates a root that issues directly; to design an operational hierarchy, see ",e.jsx(t.a,{href:"/docs/platform/pki/ca-hierarchy-and-rotation",children:"Hierarchy and rotation"}),"."]}),`
`,e.jsxs(a,{children:[e.jsxs(n,{children:[e.jsx(t.h3,{id:"open-the-creation-wizard",children:"Open the creation wizard"}),e.jsxs(t.p,{children:["In ",e.jsx(t.strong,{children:"Certification Authorities"}),", select ",e.jsx(t.strong,{children:"Create New CA"})," and choose to create a CA with a new key pair."]}),e.jsxs(t.p,{children:["The ",e.jsx(t.strong,{children:"Create New CA (Existing Key)"})," flow is explained in the ",e.jsx(t.a,{href:"/docs/platform/pki/certificate-authorities",children:"authorities guide"}),"."]})]}),e.jsxs(n,{children:[e.jsx(t.h3,{id:"select-the-key",children:"Select the key"}),e.jsxs(t.p,{children:["Choose the engine that will keep the key and an algorithm its capabilities allow. For this example, you can use ",e.jsx(t.strong,{children:"EC P-384"})," if available."]}),e.jsx(t.p,{children:"The CA private key is used through the engine. In this path, you will download only the authority's public certificate."})]}),e.jsxs(n,{children:[e.jsx(t.h3,{id:"define-the-authority",children:"Define the authority"}),e.jsxs(t.p,{children:["Select ",e.jsx(t.strong,{children:"Root CA"})," and complete:"]}),e.jsxs(t.ul,{children:[`
`,e.jsxs(t.li,{children:[e.jsx(t.strong,{children:"CA Name"}),": ",e.jsx(t.code,{children:"Acme Evaluation Root CA"}),"."]}),`
`,e.jsxs(t.li,{children:[e.jsx(t.strong,{children:"Subject"}),": organization and country details for your evaluation."]}),`
`,e.jsxs(t.li,{children:[e.jsx(t.strong,{children:"CA Certificate Expiration"}),": for example, one year from creation."]}),`
`,e.jsxs(t.li,{children:[e.jsx(t.strong,{children:"Default End-Entity Certificate Issuance Expiration"}),": for example, 90 days, within the CA's lifetime."]}),`
`]}),e.jsxs(t.p,{children:["The CA name becomes its ",e.jsx(t.code,{children:"Common Name"}),". Keep the CA usages needed to sign certificates and CRLs."]})]}),e.jsxs(n,{children:[e.jsx(t.h3,{id:"review-and-create-the-ca",children:"Review and create the CA"}),e.jsx(t.p,{children:"Check the engine, algorithm, subject, root type and dates. Confirm creation and note the authority identifier so you can recognize it in the DMS or API."})]}),e.jsxs(n,{children:[e.jsx(t.h3,{id:"verify-the-result",children:"Verify the result"}),e.jsxs(t.p,{children:["Open the new CA. It should appear active, show its certificate and allow access to ",e.jsx(t.strong,{children:"Issued Certificates"}),"."]}),e.jsxs(t.p,{children:["Download or copy the authority's PEM certificate and save it as ",e.jsx(t.code,{children:"ca.pem"}),". Check that the file contains the complete block, including ",e.jsx(t.code,{children:"BEGIN CERTIFICATE"})," and ",e.jsx(t.code,{children:"END CERTIFICATE"}),"."]})]})]}),`
`,e.jsx(t.h2,{id:"check-the-ca-certificate",children:"Check the CA certificate"}),`
`,e.jsxs(t.p,{children:["Run from the directory where you saved ",e.jsx(t.code,{children:"ca.pem"}),":"]}),`
`,e.jsx(e.Fragment,{children:e.jsx(t.pre,{className:"shiki shiki-themes min-light min-dark",style:{"--shiki-light":"#24292eff","--shiki-dark":"#b392f0","--shiki-light-bg":"#ffffff","--shiki-dark-bg":"#1f1f1f"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsxs(t.code,{children:[e.jsxs(t.span,{className:"line",children:[e.jsx(t.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"openssl"}),e.jsx(t.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" x509"}),e.jsx(t.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" -in"}),e.jsx(t.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" ca.pem"}),e.jsx(t.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" -noout"}),e.jsx(t.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" -subject"}),e.jsx(t.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" -issuer"}),e.jsx(t.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" -dates"})]}),`
`,e.jsxs(t.span,{className:"line",children:[e.jsx(t.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"openssl"}),e.jsx(t.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" x509"}),e.jsx(t.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" -in"}),e.jsx(t.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" ca.pem"}),e.jsx(t.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" -noout"}),e.jsx(t.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" -text"})]}),`
`,e.jsxs(t.span,{className:"line",children:[e.jsx(t.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"openssl"}),e.jsx(t.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" verify"}),e.jsx(t.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" -CAfile"}),e.jsx(t.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" ca.pem"}),e.jsx(t.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" -check_ss_sig"}),e.jsx(t.span,{style:{"--shiki-light":"#2B5581","--shiki-dark":"#9DB1C5"},children:" ca.pem"})]})]})})}),`
`,e.jsxs(t.p,{children:["Check that the subject and issuer match the root you created, the dates include the current time, ",e.jsx(t.strong,{children:"Basic Constraints"})," contains ",e.jsx(t.code,{children:"CA:TRUE"})," and ",e.jsx(t.strong,{children:"Key Usage"})," allows certificate signing. The last command should return ",e.jsx(t.code,{children:"ca.pem: OK"}),"."]}),`
`,e.jsxs(t.p,{children:["You explicitly selected ",e.jsx(t.code,{children:"ca.pem"})," as the trust anchor for this test. A valid self-signature does not install that trust in other consumers. See the ",e.jsx(t.a,{href:"https://docs.openssl.org/3.6/man1/openssl-verify/",children:"openssl-verify reference"})," for verification options."]}),`
`,e.jsx(t.h2,{id:"if-the-result-fails",children:"If the result fails"}),`
`,e.jsxs(t.ul,{children:[`
`,e.jsx(t.li,{children:"If creation fails, check permissions, engine availability and the selected algorithm."}),`
`,e.jsx(t.li,{children:"If OpenSSL cannot read the file, copy the complete PEM block again."}),`
`,e.jsx(t.li,{children:"If signature or date checks fail, check that you downloaded this CA's certificate and that your computer's clock is correct."}),`
`]}),`
`,e.jsxs(t.p,{children:[e.jsx(t.a,{href:"/docs/platform/pki/troubleshooting",children:"PKI diagnostics"})," covers issuance checks and cryptographic dependencies."]}),`
`,e.jsx(t.h2,{id:"next-step",children:"Next step"}),`
`,e.jsxs(t.p,{children:["Continue with ",e.jsx(t.a,{href:"/docs/platform/pki/quickstarts/issue-certificate",children:"Issue and verify a certificate"}),", using this authority and ",e.jsx(t.code,{children:"ca.pem"}),"."]})]})}function d(i={}){const{wrapper:t}=i.components||{};return t?e.jsx(t,{...i,children:e.jsx(s,{...i})}):s(i)}function r(i,t){throw new Error("Expected component `"+i+"` to be defined: you likely forgot to import, pass, or provide it.")}const u=Object.freeze(Object.defineProperty({__proto__:null,_markdown:c,default:d,frontmatter:o,structuredData:h,toc:l},Symbol.toStringTag,{value:"Module"}));export{u as _};

import{j as e}from"./index-prc0XQdj.js";let d=`

In this quickstart Lamassu will generate the key and the CSR in the browser, and the CA will issue the certificate. When you finish you will download the certificate and its private key.

Before you begin [#before-you-begin]

* An active CA with permission to issue certificates.
* A name for the identity, for example \`device-001.example.internal\`.
* A safe place to keep the downloaded private key.

<Callout type="warn" title="The private key is delivered only once">
  In this flow the key is generated in the browser and Lamassu does not store it. Download it and protect it before closing the operation result.
</Callout>

<Steps>
  <Step>
    Start the issuance [#start-the-issuance]

    Open the CA created in the previous quickstart, go to **Issued Certificates** and select **Issue New**.
  </Step>

  <Step>
    Choose the method [#choose-the-method]

    Select **Generate Key & CSR in Browser**. Use **Upload Existing CSR** when the private key must be generated and kept on the target system.
  </Step>

  <Step>
    Identify the certificate [#identify-the-certificate]

    Enter the \`Common Name\` and, if applicable, the organization, organizational unit and location. Add SANs for each DNS name, IP address, email or URI the identity will be validated with.
  </Step>

  <Step>
    Configure key and uses [#configure-key-and-uses]

    Choose RSA or ECDSA, define the validity and select the key usages. For a device identity that uses mTLS, enable **Digital Signature** and **Client Authentication**.

    The validity cannot exceed the expiration date of the issuing CA.
  </Step>

  <Step>
    Issue and download [#issue-and-download]

    Confirm the issuance and immediately download the certificate and the private key in PEM format.
  </Step>

  <Step>
    Verify the result [#verify-the-result]

    The certificate should appear in **Issued Certificates** with an active status. Check its subject, SANs, issuer, usages and validity period.
  </Step>
</Steps>

Next step [#next-step]

[Register your first device](/docs/platform/pki/quickstarts/register-device) to associate the identity with a managed entity, or see [certificate management](/docs/platform/pki/certificates).
`,h={title:"Issue your first certificate",description:"Issue an X.509 identity from the console and verify the result."},c={contents:[{heading:void 0,content:"In this quickstart Lamassu will generate the key and the CSR in the browser, and the CA will issue the certificate. When you finish you will download the certificate and its private key."},{heading:"before-you-begin",content:"An active CA with permission to issue certificates."},{heading:"before-you-begin",content:"A name for the identity, for example `device-001.example.internal`."},{heading:"before-you-begin",content:"A safe place to keep the downloaded private key."},{heading:"before-you-begin",content:"In this flow the key is generated in the browser and Lamassu does not store it. Download it and protect it before closing the operation result."},{heading:"start-the-issuance",content:"Open the CA created in the previous quickstart, go to **Issued Certificates** and select **Issue New**."},{heading:"choose-the-method",content:"Select **Generate Key & CSR in Browser**. Use **Upload Existing CSR** when the private key must be generated and kept on the target system."},{heading:"identify-the-certificate",content:"Enter the `Common Name` and, if applicable, the organization, organizational unit and location. Add SANs for each DNS name, IP address, email or URI the identity will be validated with."},{heading:"configure-key-and-uses",content:"Choose RSA or ECDSA, define the validity and select the key usages. For a device identity that uses mTLS, enable **Digital Signature** and **Client Authentication**."},{heading:"configure-key-and-uses",content:"The validity cannot exceed the expiration date of the issuing CA."},{heading:"issue-and-download",content:"Confirm the issuance and immediately download the certificate and the private key in PEM format."},{heading:"verify-the-result",content:"The certificate should appear in **Issued Certificates** with an active status. Check its subject, SANs, issuer, usages and validity period."},{heading:"next-step",content:"Register your first device to associate the identity with a managed entity, or see certificate management."}],headings:[{id:"before-you-begin",content:"Before you begin"},{id:"start-the-issuance",content:"Start the issuance"},{id:"choose-the-method",content:"Choose the method"},{id:"identify-the-certificate",content:"Identify the certificate"},{id:"configure-key-and-uses",content:"Configure key and uses"},{id:"issue-and-download",content:"Issue and download"},{id:"verify-the-result",content:"Verify the result"},{id:"next-step",content:"Next step"}]};const l=[{depth:2,url:"#before-you-begin",title:e.jsx(e.Fragment,{children:"Before you begin"})},{depth:3,url:"#start-the-issuance",title:e.jsx(e.Fragment,{children:"Start the issuance"})},{depth:3,url:"#choose-the-method",title:e.jsx(e.Fragment,{children:"Choose the method"})},{depth:3,url:"#identify-the-certificate",title:e.jsx(e.Fragment,{children:"Identify the certificate"})},{depth:3,url:"#configure-key-and-uses",title:e.jsx(e.Fragment,{children:"Configure key and uses"})},{depth:3,url:"#issue-and-download",title:e.jsx(e.Fragment,{children:"Issue and download"})},{depth:3,url:"#verify-the-result",title:e.jsx(e.Fragment,{children:"Verify the result"})},{depth:2,url:"#next-step",title:e.jsx(e.Fragment,{children:"Next step"})}];function o(i){const t={a:"a",code:"code",h2:"h2",h3:"h3",li:"li",p:"p",strong:"strong",ul:"ul",...i.components},{Callout:a,Step:n,Steps:r}=t;return a||s("Callout"),n||s("Step"),r||s("Steps"),e.jsxs(e.Fragment,{children:[e.jsx(t.p,{children:"In this quickstart Lamassu will generate the key and the CSR in the browser, and the CA will issue the certificate. When you finish you will download the certificate and its private key."}),`
`,e.jsx(t.h2,{id:"before-you-begin",children:"Before you begin"}),`
`,e.jsxs(t.ul,{children:[`
`,e.jsx(t.li,{children:"An active CA with permission to issue certificates."}),`
`,e.jsxs(t.li,{children:["A name for the identity, for example ",e.jsx(t.code,{children:"device-001.example.internal"}),"."]}),`
`,e.jsx(t.li,{children:"A safe place to keep the downloaded private key."}),`
`]}),`
`,e.jsx(a,{type:"warn",title:"The private key is delivered only once",children:e.jsx(t.p,{children:"In this flow the key is generated in the browser and Lamassu does not store it. Download it and protect it before closing the operation result."})}),`
`,e.jsxs(r,{children:[e.jsxs(n,{children:[e.jsx(t.h3,{id:"start-the-issuance",children:"Start the issuance"}),e.jsxs(t.p,{children:["Open the CA created in the previous quickstart, go to ",e.jsx(t.strong,{children:"Issued Certificates"})," and select ",e.jsx(t.strong,{children:"Issue New"}),"."]})]}),e.jsxs(n,{children:[e.jsx(t.h3,{id:"choose-the-method",children:"Choose the method"}),e.jsxs(t.p,{children:["Select ",e.jsx(t.strong,{children:"Generate Key & CSR in Browser"}),". Use ",e.jsx(t.strong,{children:"Upload Existing CSR"})," when the private key must be generated and kept on the target system."]})]}),e.jsxs(n,{children:[e.jsx(t.h3,{id:"identify-the-certificate",children:"Identify the certificate"}),e.jsxs(t.p,{children:["Enter the ",e.jsx(t.code,{children:"Common Name"})," and, if applicable, the organization, organizational unit and location. Add SANs for each DNS name, IP address, email or URI the identity will be validated with."]})]}),e.jsxs(n,{children:[e.jsx(t.h3,{id:"configure-key-and-uses",children:"Configure key and uses"}),e.jsxs(t.p,{children:["Choose RSA or ECDSA, define the validity and select the key usages. For a device identity that uses mTLS, enable ",e.jsx(t.strong,{children:"Digital Signature"})," and ",e.jsx(t.strong,{children:"Client Authentication"}),"."]}),e.jsx(t.p,{children:"The validity cannot exceed the expiration date of the issuing CA."})]}),e.jsxs(n,{children:[e.jsx(t.h3,{id:"issue-and-download",children:"Issue and download"}),e.jsx(t.p,{children:"Confirm the issuance and immediately download the certificate and the private key in PEM format."})]}),e.jsxs(n,{children:[e.jsx(t.h3,{id:"verify-the-result",children:"Verify the result"}),e.jsxs(t.p,{children:["The certificate should appear in ",e.jsx(t.strong,{children:"Issued Certificates"})," with an active status. Check its subject, SANs, issuer, usages and validity period."]})]})]}),`
`,e.jsx(t.h2,{id:"next-step",children:"Next step"}),`
`,e.jsxs(t.p,{children:[e.jsx(t.a,{href:"/docs/platform/pki/quickstarts/register-device",children:"Register your first device"})," to associate the identity with a managed entity, or see ",e.jsx(t.a,{href:"/docs/platform/pki/certificates",children:"certificate management"}),"."]})]})}function u(i={}){const{wrapper:t}=i.components||{};return t?e.jsx(t,{...i,children:e.jsx(o,{...i})}):o(i)}function s(i,t){throw new Error("Expected component `"+i+"` to be defined: you likely forgot to import, pass, or provide it.")}const p=Object.freeze(Object.defineProperty({__proto__:null,_markdown:d,default:u,frontmatter:h,structuredData:c,toc:l},Symbol.toStringTag,{value:"Module"}));export{p as _};

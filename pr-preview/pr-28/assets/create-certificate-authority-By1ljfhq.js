import{j as e}from"./index-prc0XQdj.js";let h=`

In this quickstart you will create a root certification authority with a new key pair. When you finish you will have an active CA that you can use in the next quickstart.

Before you begin [#before-you-begin]

* Console access with permissions to manage authorities.
* At least one cryptographic engine available.
* A name that identifies the purpose of the CA, for example \`Acme Device Root CA\`.

<Callout type="info" title="Root or intermediate">
  A root CA is self-signed and acts as the anchor of trust. For production it is usually preferable to keep the root more protected and issue from an intermediate CA.
</Callout>

<Steps>
  <Step>
    Open the creation wizard [#open-the-creation-wizard]

    In the side menu, open **Certification Authorities** and select **Create New CA**.

    Choose to create a CA with a new key pair. If you already have the key in the KMS, use **Create New CA (Existing Key)**.
  </Step>

  <Step>
    Select the key [#select-the-key]

    Choose the cryptographic engine that will keep the key and configure the algorithm. For a first CA you can use **EC P-384**, as long as it is compatible with your consumers.

    The private key will remain under the control of the selected engine.
  </Step>

  <Step>
    Define the authority [#define-the-authority]

    Select **Root CA** and complete:

    * **CA Name**: a unique, recognizable name.
    * **Subject**: at least the organization and country that will identify the authority.
    * **CA Certificate Expiration**: a validity longer than that of the certificates it will issue.
    * **Default End-Entity Certificate Issuance Expiration**: the default validity of end-entity certificates.

    The CA name will be used as the certificate's \`Common Name\`.
  </Step>

  <Step>
    Review and create the CA [#review-and-create-the-ca]

    Check the algorithm, subject and dates before confirming. These values define the anchor of trust and should not be chosen as throwaway test data in a production environment.
  </Step>

  <Step>
    Verify the result [#verify-the-result]

    Open the new CA from the list. It should appear active and show its PEM certificate, the expiration date and the **Issued Certificates** tab.
  </Step>
</Steps>

Next step [#next-step]

Use the authority to [issue your first certificate](/docs/platform/pki/quickstarts/issue-certificate), or see the [full authorities guide](/docs/platform/pki/certificate-authorities) to create an intermediate CA, import a CA or define advanced profiles.
`,c={title:"Create your first CA",description:"Create a root authority and check that it is ready to issue certificates."},l={contents:[{heading:void 0,content:"In this quickstart you will create a root certification authority with a new key pair. When you finish you will have an active CA that you can use in the next quickstart."},{heading:"before-you-begin",content:"Console access with permissions to manage authorities."},{heading:"before-you-begin",content:"At least one cryptographic engine available."},{heading:"before-you-begin",content:"A name that identifies the purpose of the CA, for example `Acme Device Root CA`."},{heading:"before-you-begin",content:"A root CA is self-signed and acts as the anchor of trust. For production it is usually preferable to keep the root more protected and issue from an intermediate CA."},{heading:"open-the-creation-wizard",content:"In the side menu, open **Certification Authorities** and select **Create New CA**."},{heading:"open-the-creation-wizard",content:"Choose to create a CA with a new key pair. If you already have the key in the KMS, use &#x2A;*Create New CA (Existing Key)**."},{heading:"select-the-key",content:"Choose the cryptographic engine that will keep the key and configure the algorithm. For a first CA you can use **EC P-384**, as long as it is compatible with your consumers."},{heading:"select-the-key",content:"The private key will remain under the control of the selected engine."},{heading:"define-the-authority",content:"Select **Root CA** and complete:"},{heading:"define-the-authority",content:"**CA Name**: a unique, recognizable name."},{heading:"define-the-authority",content:"**Subject**: at least the organization and country that will identify the authority."},{heading:"define-the-authority",content:"**CA Certificate Expiration**: a validity longer than that of the certificates it will issue."},{heading:"define-the-authority",content:"**Default End-Entity Certificate Issuance Expiration**: the default validity of end-entity certificates."},{heading:"define-the-authority",content:"The CA name will be used as the certificate's `Common Name`."},{heading:"review-and-create-the-ca",content:"Check the algorithm, subject and dates before confirming. These values define the anchor of trust and should not be chosen as throwaway test data in a production environment."},{heading:"verify-the-result",content:"Open the new CA from the list. It should appear active and show its PEM certificate, the expiration date and the **Issued Certificates** tab."},{heading:"next-step",content:"Use the authority to issue your first certificate, or see the full authorities guide to create an intermediate CA, import a CA or define advanced profiles."}],headings:[{id:"before-you-begin",content:"Before you begin"},{id:"open-the-creation-wizard",content:"Open the creation wizard"},{id:"select-the-key",content:"Select the key"},{id:"define-the-authority",content:"Define the authority"},{id:"review-and-create-the-ca",content:"Review and create the CA"},{id:"verify-the-result",content:"Verify the result"},{id:"next-step",content:"Next step"}]};const d=[{depth:2,url:"#before-you-begin",title:e.jsx(e.Fragment,{children:"Before you begin"})},{depth:3,url:"#open-the-creation-wizard",title:e.jsx(e.Fragment,{children:"Open the creation wizard"})},{depth:3,url:"#select-the-key",title:e.jsx(e.Fragment,{children:"Select the key"})},{depth:3,url:"#define-the-authority",title:e.jsx(e.Fragment,{children:"Define the authority"})},{depth:3,url:"#review-and-create-the-ca",title:e.jsx(e.Fragment,{children:"Review and create the CA"})},{depth:3,url:"#verify-the-result",title:e.jsx(e.Fragment,{children:"Verify the result"})},{depth:2,url:"#next-step",title:e.jsx(e.Fragment,{children:"Next step"})}];function s(i){const t={a:"a",code:"code",h2:"h2",h3:"h3",li:"li",p:"p",strong:"strong",ul:"ul",...i.components},{Callout:r,Step:n,Steps:o}=t;return r||a("Callout"),n||a("Step"),o||a("Steps"),e.jsxs(e.Fragment,{children:[e.jsx(t.p,{children:"In this quickstart you will create a root certification authority with a new key pair. When you finish you will have an active CA that you can use in the next quickstart."}),`
`,e.jsx(t.h2,{id:"before-you-begin",children:"Before you begin"}),`
`,e.jsxs(t.ul,{children:[`
`,e.jsx(t.li,{children:"Console access with permissions to manage authorities."}),`
`,e.jsx(t.li,{children:"At least one cryptographic engine available."}),`
`,e.jsxs(t.li,{children:["A name that identifies the purpose of the CA, for example ",e.jsx(t.code,{children:"Acme Device Root CA"}),"."]}),`
`]}),`
`,e.jsx(r,{type:"info",title:"Root or intermediate",children:e.jsx(t.p,{children:"A root CA is self-signed and acts as the anchor of trust. For production it is usually preferable to keep the root more protected and issue from an intermediate CA."})}),`
`,e.jsxs(o,{children:[e.jsxs(n,{children:[e.jsx(t.h3,{id:"open-the-creation-wizard",children:"Open the creation wizard"}),e.jsxs(t.p,{children:["In the side menu, open ",e.jsx(t.strong,{children:"Certification Authorities"})," and select ",e.jsx(t.strong,{children:"Create New CA"}),"."]}),e.jsxs(t.p,{children:["Choose to create a CA with a new key pair. If you already have the key in the KMS, use ",e.jsx(t.strong,{children:"Create New CA (Existing Key)"}),"."]})]}),e.jsxs(n,{children:[e.jsx(t.h3,{id:"select-the-key",children:"Select the key"}),e.jsxs(t.p,{children:["Choose the cryptographic engine that will keep the key and configure the algorithm. For a first CA you can use ",e.jsx(t.strong,{children:"EC P-384"}),", as long as it is compatible with your consumers."]}),e.jsx(t.p,{children:"The private key will remain under the control of the selected engine."})]}),e.jsxs(n,{children:[e.jsx(t.h3,{id:"define-the-authority",children:"Define the authority"}),e.jsxs(t.p,{children:["Select ",e.jsx(t.strong,{children:"Root CA"})," and complete:"]}),e.jsxs(t.ul,{children:[`
`,e.jsxs(t.li,{children:[e.jsx(t.strong,{children:"CA Name"}),": a unique, recognizable name."]}),`
`,e.jsxs(t.li,{children:[e.jsx(t.strong,{children:"Subject"}),": at least the organization and country that will identify the authority."]}),`
`,e.jsxs(t.li,{children:[e.jsx(t.strong,{children:"CA Certificate Expiration"}),": a validity longer than that of the certificates it will issue."]}),`
`,e.jsxs(t.li,{children:[e.jsx(t.strong,{children:"Default End-Entity Certificate Issuance Expiration"}),": the default validity of end-entity certificates."]}),`
`]}),e.jsxs(t.p,{children:["The CA name will be used as the certificate's ",e.jsx(t.code,{children:"Common Name"}),"."]})]}),e.jsxs(n,{children:[e.jsx(t.h3,{id:"review-and-create-the-ca",children:"Review and create the CA"}),e.jsx(t.p,{children:"Check the algorithm, subject and dates before confirming. These values define the anchor of trust and should not be chosen as throwaway test data in a production environment."})]}),e.jsxs(n,{children:[e.jsx(t.h3,{id:"verify-the-result",children:"Verify the result"}),e.jsxs(t.p,{children:["Open the new CA from the list. It should appear active and show its PEM certificate, the expiration date and the ",e.jsx(t.strong,{children:"Issued Certificates"})," tab."]})]})]}),`
`,e.jsx(t.h2,{id:"next-step",children:"Next step"}),`
`,e.jsxs(t.p,{children:["Use the authority to ",e.jsx(t.a,{href:"/docs/platform/pki/quickstarts/issue-certificate",children:"issue your first certificate"}),", or see the ",e.jsx(t.a,{href:"/docs/platform/pki/certificate-authorities",children:"full authorities guide"})," to create an intermediate CA, import a CA or define advanced profiles."]})]})}function u(i={}){const{wrapper:t}=i.components||{};return t?e.jsx(t,{...i,children:e.jsx(s,{...i})}):s(i)}function a(i,t){throw new Error("Expected component `"+i+"` to be defined: you likely forgot to import, pass, or provide it.")}const p=Object.freeze(Object.defineProperty({__proto__:null,_markdown:h,default:u,frontmatter:c,structuredData:l,toc:d},Symbol.toStringTag,{value:"Module"}));export{p as _};

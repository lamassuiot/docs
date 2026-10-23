import{j as e}from"./index-prc0XQdj.js";let o=`

This path is intended for those starting to administer PKI or needing a first X.509 client identity. It ends with three files: a root CA certificate, an end-entity certificate and the client's private key.

Before you begin [#before-you-begin]

* A Lamassu instance accessible from your browser. To prepare one, see [Deployment](/docs/deployment/overview).
* Permission to manage keys, authorities and issuance. See [Access control](/docs/platform/administration/access-control) if an operation is blocked.
* An available cryptographic engine for the CA key; check the [keys and engines](/docs/platform/pki/key-management) inventory.
* OpenSSL 3.x on the computer where you will verify the files.
* A working directory with restricted access for the downloaded key.

Recommended path [#recommended-path]

<Cards>
  <Card title="1. Create your first CA" description="Create an evaluation root and save its public certificate as ca.pem." href="/docs/platform/pki/quickstarts/create-certificate-authority" />

  <Card title="2. Issue and verify a certificate" description="Issue for device-001 and check content, chain and key correspondence." href="/docs/platform/pki/quickstarts/issue-certificate" />
</Cards>

We use \`Acme Evaluation Root CA\` and \`device-001\` as example names. If you replace them, keep the same client identifier in the steps you want to connect.

The root in this path signs the end-entity certificate directly to simplify evaluation. Before designing an operational PKI, review the [trust model](/docs/platform/pki/concepts/trust-model) and [CA hierarchy](/docs/platform/pki/ca-hierarchy-and-rotation).

Expected result [#expected-result]

| File or resource                        | Check                                                                                     |
| --------------------------------------- | ----------------------------------------------------------------------------------------- |
| Active root CA and \`ca.pem\`             | It is a CA certificate, is currently valid and its self-signature verifies.               |
| End-entity certificate and \`device.crt\` | It identifies \`device-001\`, supports client authentication and verifies against \`ca.pem\`. |
| Private key \`device.key\`                | Its public key matches the one included in \`device.crt\`.                                  |

These checks validate the issued material. Acceptance by a service also requires its trust, authorization and revocation configuration.

Continue according to your goal [#continue-according-to-your-goal]

* To operate certificates, continue with [Certificates](/docs/platform/pki/certificates) and [Validation](/docs/platform/pki/certificate-validation).
* To manage a device identity in Lamassu, follow [Manual registration](/docs/platform/iot-fleets/quickstarts/register-device). That path includes DMS preparation.
* For the device to request its certificate, prepare the [DMS](/docs/platform/iot-fleets/enrollment/dms) and [EST client](/docs/platform/iot-fleets/enrollment/overview).
`,s={title:"PKI getting started",description:"Create a CA, issue a client certificate and check its chain and key."},d={contents:[{heading:void 0,content:"This path is intended for those starting to administer PKI or needing a first X.509 client identity. It ends with three files: a root CA certificate, an end-entity certificate and the client's private key."},{heading:"before-you-begin",content:"A Lamassu instance accessible from your browser. To prepare one, see Deployment."},{heading:"before-you-begin",content:"Permission to manage keys, authorities and issuance. See Access control if an operation is blocked."},{heading:"before-you-begin",content:"An available cryptographic engine for the CA key; check the keys and engines inventory."},{heading:"before-you-begin",content:"OpenSSL 3.x on the computer where you will verify the files."},{heading:"before-you-begin",content:"A working directory with restricted access for the downloaded key."},{heading:"recommended-path",content:'<Card title="1. Create your first CA" description="Create an evaluation root and save its public certificate as ca.pem." href="/docs/platform/pki/quickstarts/create-certificate-authority" />'},{heading:"recommended-path",content:'<Card title="2. Issue and verify a certificate" description="Issue for device-001 and check content, chain and key correspondence." href="/docs/platform/pki/quickstarts/issue-certificate" />'},{heading:"recommended-path",content:"We use `Acme Evaluation Root CA` and `device-001` as example names. If you replace them, keep the same client identifier in the steps you want to connect."},{heading:"recommended-path",content:"The root in this path signs the end-entity certificate directly to simplify evaluation. Before designing an operational PKI, review the trust model and CA hierarchy."},{heading:"expected-result",content:"File or resource"},{heading:"expected-result",content:"Check"},{heading:"expected-result",content:"Active root CA and `ca.pem`"},{heading:"expected-result",content:"It is a CA certificate, is currently valid and its self-signature verifies."},{heading:"expected-result",content:"End-entity certificate and `device.crt`"},{heading:"expected-result",content:"It identifies `device-001`, supports client authentication and verifies against `ca.pem`."},{heading:"expected-result",content:"Private key `device.key`"},{heading:"expected-result",content:"Its public key matches the one included in `device.crt`."},{heading:"expected-result",content:"These checks validate the issued material. Acceptance by a service also requires its trust, authorization and revocation configuration."},{heading:"continue-according-to-your-goal",content:"To operate certificates, continue with Certificates and Validation."},{heading:"continue-according-to-your-goal",content:"To manage a device identity in Lamassu, follow Manual registration. That path includes DMS preparation."},{heading:"continue-according-to-your-goal",content:"For the device to request its certificate, prepare the DMS and EST client."}],headings:[{id:"before-you-begin",content:"Before you begin"},{id:"recommended-path",content:"Recommended path"},{id:"expected-result",content:"Expected result"},{id:"continue-according-to-your-goal",content:"Continue according to your goal"}]};const l=[{depth:2,url:"#before-you-begin",title:e.jsx(e.Fragment,{children:"Before you begin"})},{depth:2,url:"#recommended-path",title:e.jsx(e.Fragment,{children:"Recommended path"})},{depth:2,url:"#expected-result",title:e.jsx(e.Fragment,{children:"Expected result"})},{depth:2,url:"#continue-according-to-your-goal",title:e.jsx(e.Fragment,{children:"Continue according to your goal"})}];function a(i){const t={a:"a",code:"code",h2:"h2",li:"li",p:"p",table:"table",tbody:"tbody",td:"td",th:"th",thead:"thead",tr:"tr",ul:"ul",...i.components},{Card:n,Cards:r}=t;return n||c("Card"),r||c("Cards"),e.jsxs(e.Fragment,{children:[e.jsx(t.p,{children:"This path is intended for those starting to administer PKI or needing a first X.509 client identity. It ends with three files: a root CA certificate, an end-entity certificate and the client's private key."}),`
`,e.jsx(t.h2,{id:"before-you-begin",children:"Before you begin"}),`
`,e.jsxs(t.ul,{children:[`
`,e.jsxs(t.li,{children:["A Lamassu instance accessible from your browser. To prepare one, see ",e.jsx(t.a,{href:"/docs/deployment/overview",children:"Deployment"}),"."]}),`
`,e.jsxs(t.li,{children:["Permission to manage keys, authorities and issuance. See ",e.jsx(t.a,{href:"/docs/platform/administration/access-control",children:"Access control"})," if an operation is blocked."]}),`
`,e.jsxs(t.li,{children:["An available cryptographic engine for the CA key; check the ",e.jsx(t.a,{href:"/docs/platform/pki/key-management",children:"keys and engines"})," inventory."]}),`
`,e.jsx(t.li,{children:"OpenSSL 3.x on the computer where you will verify the files."}),`
`,e.jsx(t.li,{children:"A working directory with restricted access for the downloaded key."}),`
`]}),`
`,e.jsx(t.h2,{id:"recommended-path",children:"Recommended path"}),`
`,e.jsxs(r,{children:[e.jsx(n,{title:"1. Create your first CA",description:"Create an evaluation root and save its public certificate as ca.pem.",href:"/docs/platform/pki/quickstarts/create-certificate-authority"}),e.jsx(n,{title:"2. Issue and verify a certificate",description:"Issue for device-001 and check content, chain and key correspondence.",href:"/docs/platform/pki/quickstarts/issue-certificate"})]}),`
`,e.jsxs(t.p,{children:["We use ",e.jsx(t.code,{children:"Acme Evaluation Root CA"})," and ",e.jsx(t.code,{children:"device-001"})," as example names. If you replace them, keep the same client identifier in the steps you want to connect."]}),`
`,e.jsxs(t.p,{children:["The root in this path signs the end-entity certificate directly to simplify evaluation. Before designing an operational PKI, review the ",e.jsx(t.a,{href:"/docs/platform/pki/concepts/trust-model",children:"trust model"})," and ",e.jsx(t.a,{href:"/docs/platform/pki/ca-hierarchy-and-rotation",children:"CA hierarchy"}),"."]}),`
`,e.jsx(t.h2,{id:"expected-result",children:"Expected result"}),`
`,e.jsxs(t.table,{children:[e.jsx(t.thead,{children:e.jsxs(t.tr,{children:[e.jsx(t.th,{children:"File or resource"}),e.jsx(t.th,{children:"Check"})]})}),e.jsxs(t.tbody,{children:[e.jsxs(t.tr,{children:[e.jsxs(t.td,{children:["Active root CA and ",e.jsx(t.code,{children:"ca.pem"})]}),e.jsx(t.td,{children:"It is a CA certificate, is currently valid and its self-signature verifies."})]}),e.jsxs(t.tr,{children:[e.jsxs(t.td,{children:["End-entity certificate and ",e.jsx(t.code,{children:"device.crt"})]}),e.jsxs(t.td,{children:["It identifies ",e.jsx(t.code,{children:"device-001"}),", supports client authentication and verifies against ",e.jsx(t.code,{children:"ca.pem"}),"."]})]}),e.jsxs(t.tr,{children:[e.jsxs(t.td,{children:["Private key ",e.jsx(t.code,{children:"device.key"})]}),e.jsxs(t.td,{children:["Its public key matches the one included in ",e.jsx(t.code,{children:"device.crt"}),"."]})]})]})]}),`
`,e.jsx(t.p,{children:"These checks validate the issued material. Acceptance by a service also requires its trust, authorization and revocation configuration."}),`
`,e.jsx(t.h2,{id:"continue-according-to-your-goal",children:"Continue according to your goal"}),`
`,e.jsxs(t.ul,{children:[`
`,e.jsxs(t.li,{children:["To operate certificates, continue with ",e.jsx(t.a,{href:"/docs/platform/pki/certificates",children:"Certificates"})," and ",e.jsx(t.a,{href:"/docs/platform/pki/certificate-validation",children:"Validation"}),"."]}),`
`,e.jsxs(t.li,{children:["To manage a device identity in Lamassu, follow ",e.jsx(t.a,{href:"/docs/platform/iot-fleets/quickstarts/register-device",children:"Manual registration"}),". That path includes DMS preparation."]}),`
`,e.jsxs(t.li,{children:["For the device to request its certificate, prepare the ",e.jsx(t.a,{href:"/docs/platform/iot-fleets/enrollment/dms",children:"DMS"})," and ",e.jsx(t.a,{href:"/docs/platform/iot-fleets/enrollment/overview",children:"EST client"}),"."]}),`
`]})]})}function h(i={}){const{wrapper:t}=i.components||{};return t?e.jsx(t,{...i,children:e.jsx(a,{...i})}):a(i)}function c(i,t){throw new Error("Expected component `"+i+"` to be defined: you likely forgot to import, pass, or provide it.")}const u=Object.freeze(Object.defineProperty({__proto__:null,_markdown:o,default:h,frontmatter:s,structuredData:d,toc:l},Symbol.toStringTag,{value:"Module"}));export{u as _};

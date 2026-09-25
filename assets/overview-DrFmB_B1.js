import{j as e}from"./index-prc0XQdj.js";let s=`

The quickstarts take you from a prepared instance to an active device identity. Each guide produces a verifiable result and links the detailed explanation when you need to go deeper.

Recommended path [#recommended-path]

<Cards>
  <Card title="1. Create your first CA" description="Establish a root of trust capable of issuing certificates." href="/docs/platform/pki/quickstarts/create-certificate-authority" />

  <Card title="2. Issue a certificate" description="Create an X.509 identity and verify its contents." href="/docs/platform/pki/quickstarts/issue-certificate" />

  <Card title="3. Register a device" description="Add a device and assign it its first identity." href="/docs/platform/pki/quickstarts/register-device" />
</Cards>

Before you begin [#before-you-begin]

You need access to the Lamassu IoT console and permissions to administer keys, authorities and devices. The instance must have at least one cryptographic engine configured.

If you don't have an instance yet, first choose a [deployment model](/docs/deployment/overview).
`,d={title:"Get started",description:"Get a first result with Lamassu and continue from a working base."},c={contents:[{heading:void 0,content:"The quickstarts take you from a prepared instance to an active device identity. Each guide produces a verifiable result and links the detailed explanation when you need to go deeper."},{heading:"recommended-path",content:'<Card title="1. Create your first CA" description="Establish a root of trust capable of issuing certificates." href="/docs/platform/pki/quickstarts/create-certificate-authority" />'},{heading:"recommended-path",content:'<Card title="2. Issue a certificate" description="Create an X.509 identity and verify its contents." href="/docs/platform/pki/quickstarts/issue-certificate" />'},{heading:"recommended-path",content:'<Card title="3. Register a device" description="Add a device and assign it its first identity." href="/docs/platform/pki/quickstarts/register-device" />'},{heading:"before-you-begin",content:"You need access to the Lamassu IoT console and permissions to administer keys, authorities and devices. The instance must have at least one cryptographic engine configured."},{heading:"before-you-begin",content:"If you don't have an instance yet, first choose a deployment model."}],headings:[{id:"recommended-path",content:"Recommended path"},{id:"before-you-begin",content:"Before you begin"}]};const u=[{depth:2,url:"#recommended-path",title:e.jsx(e.Fragment,{children:"Recommended path"})},{depth:2,url:"#before-you-begin",title:e.jsx(e.Fragment,{children:"Before you begin"})}];function o(i){const t={a:"a",h2:"h2",p:"p",...i.components},{Card:n,Cards:a}=t;return n||r("Card"),a||r("Cards"),e.jsxs(e.Fragment,{children:[e.jsx(t.p,{children:"The quickstarts take you from a prepared instance to an active device identity. Each guide produces a verifiable result and links the detailed explanation when you need to go deeper."}),`
`,e.jsx(t.h2,{id:"recommended-path",children:"Recommended path"}),`
`,e.jsxs(a,{children:[e.jsx(n,{title:"1. Create your first CA",description:"Establish a root of trust capable of issuing certificates.",href:"/docs/platform/pki/quickstarts/create-certificate-authority"}),e.jsx(n,{title:"2. Issue a certificate",description:"Create an X.509 identity and verify its contents.",href:"/docs/platform/pki/quickstarts/issue-certificate"}),e.jsx(n,{title:"3. Register a device",description:"Add a device and assign it its first identity.",href:"/docs/platform/pki/quickstarts/register-device"})]}),`
`,e.jsx(t.h2,{id:"before-you-begin",children:"Before you begin"}),`
`,e.jsx(t.p,{children:"You need access to the Lamassu IoT console and permissions to administer keys, authorities and devices. The instance must have at least one cryptographic engine configured."}),`
`,e.jsxs(t.p,{children:["If you don't have an instance yet, first choose a ",e.jsx(t.a,{href:"/docs/deployment/overview",children:"deployment model"}),"."]})]})}function p(i={}){const{wrapper:t}=i.components||{};return t?e.jsx(t,{...i,children:e.jsx(o,{...i})}):o(i)}function r(i,t){throw new Error("Expected component `"+i+"` to be defined: you likely forgot to import, pass, or provide it.")}const h=Object.freeze(Object.defineProperty({__proto__:null,_markdown:s,default:p,frontmatter:d,structuredData:c,toc:u},Symbol.toStringTag,{value:"Module"}));export{h as _};

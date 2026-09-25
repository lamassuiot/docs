import{j as e}from"./index-prc0XQdj.js";let o=`

Lamassu deploys as a set of independent services. This separation keeps every component from needing direct access to private keys and lets each capability scale according to load.

Control plane [#control-plane]

The console and the APIs manage authorities, certificates, DMSs, devices, alerts and configuration. Domain events allow connectors and automations to react to changes without continuously polling the platform.

Key custody and cryptographic operations [#key-custody-and-cryptographic-operations]

The KMS offers a common interface over software engines, PKCS#11 and cloud providers. The selected engine keeps the key or delegates the cryptographic operation without the other services knowing its implementation.

Issuance and enrollment [#issuance-and-enrollment]

The CA service issues certificates and maintains the relationship with its authority. The DMS applies the enrollment rules and exposes the EST flows so a device can request or renew an identity.

Status and validation [#status-and-validation]

Device Manager keeps the operational view of the device and its history. The Validation Authority publishes OCSP and CRLs so other systems can decide whether to trust a presented certificate.

Platform dependencies [#platform-dependencies]

In a self-managed deployment, Lamassu uses PostgreSQL for persistence, RabbitMQ for messaging and an OIDC provider for authentication. See the [deployment architecture](/docs/deployment/self-hosted/overview#architecture) for how the services are published on Kubernetes.
`,s={title:"Platform architecture",description:"Lamassu components and how control, keys, issuance and devices relate."},i={contents:[{heading:void 0,content:"Lamassu deploys as a set of independent services. This separation keeps every component from needing direct access to private keys and lets each capability scale according to load."},{heading:"control-plane",content:"The console and the APIs manage authorities, certificates, DMSs, devices, alerts and configuration. Domain events allow connectors and automations to react to changes without continuously polling the platform."},{heading:"key-custody-and-cryptographic-operations",content:"The KMS offers a common interface over software engines, PKCS#11 and cloud providers. The selected engine keeps the key or delegates the cryptographic operation without the other services knowing its implementation."},{heading:"issuance-and-enrollment",content:"The CA service issues certificates and maintains the relationship with its authority. The DMS applies the enrollment rules and exposes the EST flows so a device can request or renew an identity."},{heading:"status-and-validation",content:"Device Manager keeps the operational view of the device and its history. The Validation Authority publishes OCSP and CRLs so other systems can decide whether to trust a presented certificate."},{heading:"platform-dependencies",content:"In a self-managed deployment, Lamassu uses PostgreSQL for persistence, RabbitMQ for messaging and an OIDC provider for authentication. See the deployment architecture for how the services are published on Kubernetes."}],headings:[{id:"control-plane",content:"Control plane"},{id:"key-custody-and-cryptographic-operations",content:"Key custody and cryptographic operations"},{id:"issuance-and-enrollment",content:"Issuance and enrollment"},{id:"status-and-validation",content:"Status and validation"},{id:"platform-dependencies",content:"Platform dependencies"}]};const r=[{depth:2,url:"#control-plane",title:e.jsx(e.Fragment,{children:"Control plane"})},{depth:2,url:"#key-custody-and-cryptographic-operations",title:e.jsx(e.Fragment,{children:"Key custody and cryptographic operations"})},{depth:2,url:"#issuance-and-enrollment",title:e.jsx(e.Fragment,{children:"Issuance and enrollment"})},{depth:2,url:"#status-and-validation",title:e.jsx(e.Fragment,{children:"Status and validation"})},{depth:2,url:"#platform-dependencies",title:e.jsx(e.Fragment,{children:"Platform dependencies"})}];function a(n){const t={a:"a",h2:"h2",p:"p",...n.components};return e.jsxs(e.Fragment,{children:[e.jsx(t.p,{children:"Lamassu deploys as a set of independent services. This separation keeps every component from needing direct access to private keys and lets each capability scale according to load."}),`
`,e.jsx(t.h2,{id:"control-plane",children:"Control plane"}),`
`,e.jsx(t.p,{children:"The console and the APIs manage authorities, certificates, DMSs, devices, alerts and configuration. Domain events allow connectors and automations to react to changes without continuously polling the platform."}),`
`,e.jsx(t.h2,{id:"key-custody-and-cryptographic-operations",children:"Key custody and cryptographic operations"}),`
`,e.jsx(t.p,{children:"The KMS offers a common interface over software engines, PKCS#11 and cloud providers. The selected engine keeps the key or delegates the cryptographic operation without the other services knowing its implementation."}),`
`,e.jsx(t.h2,{id:"issuance-and-enrollment",children:"Issuance and enrollment"}),`
`,e.jsx(t.p,{children:"The CA service issues certificates and maintains the relationship with its authority. The DMS applies the enrollment rules and exposes the EST flows so a device can request or renew an identity."}),`
`,e.jsx(t.h2,{id:"status-and-validation",children:"Status and validation"}),`
`,e.jsx(t.p,{children:"Device Manager keeps the operational view of the device and its history. The Validation Authority publishes OCSP and CRLs so other systems can decide whether to trust a presented certificate."}),`
`,e.jsx(t.h2,{id:"platform-dependencies",children:"Platform dependencies"}),`
`,e.jsxs(t.p,{children:["In a self-managed deployment, Lamassu uses PostgreSQL for persistence, RabbitMQ for messaging and an OIDC provider for authentication. See the ",e.jsx(t.a,{href:"/docs/deployment/self-hosted/overview#architecture",children:"deployment architecture"})," for how the services are published on Kubernetes."]})]})}function c(n={}){const{wrapper:t}=n.components||{};return t?e.jsx(t,{...n,children:e.jsx(a,{...n})}):a(n)}const l=Object.freeze(Object.defineProperty({__proto__:null,_markdown:o,default:c,frontmatter:s,structuredData:i,toc:r},Symbol.toStringTag,{value:"Module"}));export{l as _};

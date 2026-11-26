import{j as e}from"./index-DqgIL_Rv.js";let s=`

Enrollment with PKI covers the path from device admission to identity installation and renewal. The DMS acts as a registration authority: it authenticates the request, applies registration policy and asks the CA to sign. The client keeps or receives the key, installs the result and presents it to the consumer.

The journey [#the-journey]

1. The administrator prepares the CA, [issuance profile](/docs/platform/pki/certificate-profiles) and DMS.
2. The integrator installs initial EST server trust and an admission credential.
3. The client requests an identity for its \`Device ID\` through EST.
4. Certificate, device binding and key/certificate installation are checked.
5. The consumer validates and authorizes the identity; the client schedules renewal and recovery.

EST uses \`/.well-known/est/{DMS_ID}\`. Administrative APIs and manual assignment remain separate paths. [Enroll and connect a device](/docs/platform/iot-fleets/quickstarts/enroll-device) completes an initial mTLS test.

For the administrator [#for-the-administrator]

<Cards>
  <Card title="Provisioning strategies" description="Choose automatic registration, preregistration or manual assignment." href="/docs/platform/iot-fleets/enrollment/provisioning-strategies" />

  <Card title="Configure the DMS" description="Separate admission, authentication per operation, profiles and distribution." href="/docs/platform/iot-fleets/enrollment/dms" />
</Cards>

For the integrator [#for-the-integrator]

See [EST (RFC 7030)](/docs/platform/iot-fleets/est) to prepare authentication and initial trust, integrate the client and maintain the device identity.

Gateway, TLS, provider and service configuration belongs to [Deployment](/docs/deployment/overview). Identity use in AWS or other destinations belongs to [Integrations](/docs/platform/iot-fleets/overview#integrations).
`,d={title:"Enrollment with PKI",description:"Prepare device admission, registration policy and certificate issuance."},l={contents:[{heading:void 0,content:"Enrollment with PKI covers the path from device admission to identity installation and renewal. The DMS acts as a registration authority: it authenticates the request, applies registration policy and asks the CA to sign. The client keeps or receives the key, installs the result and presents it to the consumer."},{heading:"the-journey",content:"The administrator prepares the CA, issuance profile and DMS."},{heading:"the-journey",content:"The integrator installs initial EST server trust and an admission credential."},{heading:"the-journey",content:"The client requests an identity for its `Device ID` through EST."},{heading:"the-journey",content:"Certificate, device binding and key/certificate installation are checked."},{heading:"the-journey",content:"The consumer validates and authorizes the identity; the client schedules renewal and recovery."},{heading:"the-journey",content:"EST uses `/.well-known/est/{DMS_ID}`. Administrative APIs and manual assignment remain separate paths. Enroll and connect a device completes an initial mTLS test."},{heading:"for-the-administrator",content:'<Card title="Provisioning strategies" description="Choose automatic registration, preregistration or manual assignment." href="/docs/platform/iot-fleets/enrollment/provisioning-strategies" />'},{heading:"for-the-administrator",content:'<Card title="Configure the DMS" description="Separate admission, authentication per operation, profiles and distribution." href="/docs/platform/iot-fleets/enrollment/dms" />'},{heading:"for-the-integrator",content:"See EST (RFC 7030) to prepare authentication and initial trust, integrate the client and maintain the device identity."},{heading:"for-the-integrator",content:"Gateway, TLS, provider and service configuration belongs to Deployment. Identity use in AWS or other destinations belongs to Integrations."}],headings:[{id:"the-journey",content:"The journey"},{id:"for-the-administrator",content:"For the administrator"},{id:"for-the-integrator",content:"For the integrator"}]};const c=[{depth:2,url:"#the-journey",title:e.jsx(e.Fragment,{children:"The journey"})},{depth:2,url:"#for-the-administrator",title:e.jsx(e.Fragment,{children:"For the administrator"})},{depth:2,url:"#for-the-integrator",title:e.jsx(e.Fragment,{children:"For the integrator"})}];function a(n){const t={a:"a",code:"code",h2:"h2",li:"li",ol:"ol",p:"p",...n.components},{Card:i,Cards:r}=t;return i||o("Card"),r||o("Cards"),e.jsxs(e.Fragment,{children:[e.jsx(t.p,{children:"Enrollment with PKI covers the path from device admission to identity installation and renewal. The DMS acts as a registration authority: it authenticates the request, applies registration policy and asks the CA to sign. The client keeps or receives the key, installs the result and presents it to the consumer."}),`
`,e.jsx(t.h2,{id:"the-journey",children:"The journey"}),`
`,e.jsxs(t.ol,{children:[`
`,e.jsxs(t.li,{children:["The administrator prepares the CA, ",e.jsx(t.a,{href:"/docs/platform/pki/certificate-profiles",children:"issuance profile"})," and DMS."]}),`
`,e.jsx(t.li,{children:"The integrator installs initial EST server trust and an admission credential."}),`
`,e.jsxs(t.li,{children:["The client requests an identity for its ",e.jsx(t.code,{children:"Device ID"})," through EST."]}),`
`,e.jsx(t.li,{children:"Certificate, device binding and key/certificate installation are checked."}),`
`,e.jsx(t.li,{children:"The consumer validates and authorizes the identity; the client schedules renewal and recovery."}),`
`]}),`
`,e.jsxs(t.p,{children:["EST uses ",e.jsx(t.code,{children:"/.well-known/est/{DMS_ID}"}),". Administrative APIs and manual assignment remain separate paths. ",e.jsx(t.a,{href:"/docs/platform/iot-fleets/quickstarts/enroll-device",children:"Enroll and connect a device"})," completes an initial mTLS test."]}),`
`,e.jsx(t.h2,{id:"for-the-administrator",children:"For the administrator"}),`
`,e.jsxs(r,{children:[e.jsx(i,{title:"Provisioning strategies",description:"Choose automatic registration, preregistration or manual assignment.",href:"/docs/platform/iot-fleets/enrollment/provisioning-strategies"}),e.jsx(i,{title:"Configure the DMS",description:"Separate admission, authentication per operation, profiles and distribution.",href:"/docs/platform/iot-fleets/enrollment/dms"})]}),`
`,e.jsx(t.h2,{id:"for-the-integrator",children:"For the integrator"}),`
`,e.jsxs(t.p,{children:["See ",e.jsx(t.a,{href:"/docs/platform/iot-fleets/est",children:"EST (RFC 7030)"})," to prepare authentication and initial trust, integrate the client and maintain the device identity."]}),`
`,e.jsxs(t.p,{children:["Gateway, TLS, provider and service configuration belongs to ",e.jsx(t.a,{href:"/docs/deployment/overview",children:"Deployment"}),". Identity use in AWS or other destinations belongs to ",e.jsx(t.a,{href:"/docs/platform/iot-fleets/overview#integrations",children:"Integrations"}),"."]})]})}function h(n={}){const{wrapper:t}=n.components||{};return t?e.jsx(t,{...n,children:e.jsx(a,{...n})}):a(n)}function o(n,t){throw new Error("Expected component `"+n+"` to be defined: you likely forgot to import, pass, or provide it.")}const m=Object.freeze(Object.defineProperty({__proto__:null,_markdown:s,default:h,frontmatter:d,structuredData:l,toc:c},Symbol.toStringTag,{value:"Module"}));export{m as _};

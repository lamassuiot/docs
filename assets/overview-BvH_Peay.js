import{j as e}from"./index-prc0XQdj.js";let a=`

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

  <Card title="Bootstrap identity and authentication" description="Decide which proof allows requesting the first identity." href="/docs/platform/iot-fleets/enrollment/bootstrap-identity" />

  <Card title="Trust distribution" description="Update roots and chains with verified overlap." href="/docs/platform/iot-fleets/enrollment/trust-distribution" />
</Cards>

For the integrator [#for-the-integrator]

<Cards>
  <Card title="EST client" description="Prepare the request, verify the response and install the identity." href="/docs/platform/iot-fleets/enrollment/est-client" />

  <Card title="Renewal and recovery" description="Generate the successor and handle expired or lost credentials." href="/docs/platform/iot-fleets/enrollment/renewal-and-recovery" />

  <Card title="EST reference" description="Look up paths, formats, authentication and ServerKeyGen." href="/docs/platform/iot-fleets/enrollment/est-reference" />

  <Card title="Troubleshooting" description="Distinguish transport, policy, issuance and installation failures." href="/docs/platform/iot-fleets/enrollment/troubleshooting" />
</Cards>

Contract version [#contract-version]

This block describes \`main\` code inspected at commit \`8f42c47157f9a36bac3ed5caa3692aebebe19c4b\`. The site catalog publishes \`main (unstable)\`; this behavior is not attributed to a stable release. Before using another version, check its contract and migrations, particularly independent re-enrollment authentication. Client checks and live-instance tests are distinguished in the revision plan.

Gateway, TLS, provider and service configuration belongs to [Deployment](/docs/deployment/overview). Identity use in AWS or other destinations belongs to [Integrations](/docs/platform/iot-fleets/overview#integrations).
`,l={title:"Enrollment with PKI",description:"Choose admission policy and connect DMS, initial trust and the EST client."},d={contents:[{heading:void 0,content:"Enrollment with PKI covers the path from device admission to identity installation and renewal. The DMS acts as a registration authority: it authenticates the request, applies registration policy and asks the CA to sign. The client keeps or receives the key, installs the result and presents it to the consumer."},{heading:"the-journey",content:"The administrator prepares the CA, issuance profile and DMS."},{heading:"the-journey",content:"The integrator installs initial EST server trust and an admission credential."},{heading:"the-journey",content:"The client requests an identity for its `Device ID` through EST."},{heading:"the-journey",content:"Certificate, device binding and key/certificate installation are checked."},{heading:"the-journey",content:"The consumer validates and authorizes the identity; the client schedules renewal and recovery."},{heading:"the-journey",content:"EST uses `/.well-known/est/{DMS_ID}`. Administrative APIs and manual assignment remain separate paths. Enroll and connect a device completes an initial mTLS test."},{heading:"for-the-administrator",content:'<Card title="Provisioning strategies" description="Choose automatic registration, preregistration or manual assignment." href="/docs/platform/iot-fleets/enrollment/provisioning-strategies" />'},{heading:"for-the-administrator",content:'<Card title="Configure the DMS" description="Separate admission, authentication per operation, profiles and distribution." href="/docs/platform/iot-fleets/enrollment/dms" />'},{heading:"for-the-administrator",content:'<Card title="Bootstrap identity and authentication" description="Decide which proof allows requesting the first identity." href="/docs/platform/iot-fleets/enrollment/bootstrap-identity" />'},{heading:"for-the-administrator",content:'<Card title="Trust distribution" description="Update roots and chains with verified overlap." href="/docs/platform/iot-fleets/enrollment/trust-distribution" />'},{heading:"for-the-integrator",content:'<Card title="EST client" description="Prepare the request, verify the response and install the identity." href="/docs/platform/iot-fleets/enrollment/est-client" />'},{heading:"for-the-integrator",content:'<Card title="Renewal and recovery" description="Generate the successor and handle expired or lost credentials." href="/docs/platform/iot-fleets/enrollment/renewal-and-recovery" />'},{heading:"for-the-integrator",content:'<Card title="EST reference" description="Look up paths, formats, authentication and ServerKeyGen." href="/docs/platform/iot-fleets/enrollment/est-reference" />'},{heading:"for-the-integrator",content:'<Card title="Troubleshooting" description="Distinguish transport, policy, issuance and installation failures." href="/docs/platform/iot-fleets/enrollment/troubleshooting" />'},{heading:"contract-version",content:"This block describes `main` code inspected at commit `8f42c47157f9a36bac3ed5caa3692aebebe19c4b`. The site catalog publishes `main (unstable)`; this behavior is not attributed to a stable release. Before using another version, check its contract and migrations, particularly independent re-enrollment authentication. Client checks and live-instance tests are distinguished in the revision plan."},{heading:"contract-version",content:"Gateway, TLS, provider and service configuration belongs to Deployment. Identity use in AWS or other destinations belongs to Integrations."}],headings:[{id:"the-journey",content:"The journey"},{id:"for-the-administrator",content:"For the administrator"},{id:"for-the-integrator",content:"For the integrator"},{id:"contract-version",content:"Contract version"}]};const c=[{depth:2,url:"#the-journey",title:e.jsx(e.Fragment,{children:"The journey"})},{depth:2,url:"#for-the-administrator",title:e.jsx(e.Fragment,{children:"For the administrator"})},{depth:2,url:"#for-the-integrator",title:e.jsx(e.Fragment,{children:"For the integrator"})},{depth:2,url:"#contract-version",title:e.jsx(e.Fragment,{children:"Contract version"})}];function o(i){const t={a:"a",code:"code",h2:"h2",li:"li",ol:"ol",p:"p",...i.components},{Card:n,Cards:r}=t;return n||s("Card"),r||s("Cards"),e.jsxs(e.Fragment,{children:[e.jsx(t.p,{children:"Enrollment with PKI covers the path from device admission to identity installation and renewal. The DMS acts as a registration authority: it authenticates the request, applies registration policy and asks the CA to sign. The client keeps or receives the key, installs the result and presents it to the consumer."}),`
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
`,e.jsxs(r,{children:[e.jsx(n,{title:"Provisioning strategies",description:"Choose automatic registration, preregistration or manual assignment.",href:"/docs/platform/iot-fleets/enrollment/provisioning-strategies"}),e.jsx(n,{title:"Configure the DMS",description:"Separate admission, authentication per operation, profiles and distribution.",href:"/docs/platform/iot-fleets/enrollment/dms"}),e.jsx(n,{title:"Bootstrap identity and authentication",description:"Decide which proof allows requesting the first identity.",href:"/docs/platform/iot-fleets/enrollment/bootstrap-identity"}),e.jsx(n,{title:"Trust distribution",description:"Update roots and chains with verified overlap.",href:"/docs/platform/iot-fleets/enrollment/trust-distribution"})]}),`
`,e.jsx(t.h2,{id:"for-the-integrator",children:"For the integrator"}),`
`,e.jsxs(r,{children:[e.jsx(n,{title:"EST client",description:"Prepare the request, verify the response and install the identity.",href:"/docs/platform/iot-fleets/enrollment/est-client"}),e.jsx(n,{title:"Renewal and recovery",description:"Generate the successor and handle expired or lost credentials.",href:"/docs/platform/iot-fleets/enrollment/renewal-and-recovery"}),e.jsx(n,{title:"EST reference",description:"Look up paths, formats, authentication and ServerKeyGen.",href:"/docs/platform/iot-fleets/enrollment/est-reference"}),e.jsx(n,{title:"Troubleshooting",description:"Distinguish transport, policy, issuance and installation failures.",href:"/docs/platform/iot-fleets/enrollment/troubleshooting"})]}),`
`,e.jsx(t.h2,{id:"contract-version",children:"Contract version"}),`
`,e.jsxs(t.p,{children:["This block describes ",e.jsx(t.code,{children:"main"})," code inspected at commit ",e.jsx(t.code,{children:"8f42c47157f9a36bac3ed5caa3692aebebe19c4b"}),". The site catalog publishes ",e.jsx(t.code,{children:"main (unstable)"}),"; this behavior is not attributed to a stable release. Before using another version, check its contract and migrations, particularly independent re-enrollment authentication. Client checks and live-instance tests are distinguished in the revision plan."]}),`
`,e.jsxs(t.p,{children:["Gateway, TLS, provider and service configuration belongs to ",e.jsx(t.a,{href:"/docs/deployment/overview",children:"Deployment"}),". Identity use in AWS or other destinations belongs to ",e.jsx(t.a,{href:"/docs/platform/iot-fleets/overview#integrations",children:"Integrations"}),"."]})]})}function h(i={}){const{wrapper:t}=i.components||{};return t?e.jsx(t,{...i,children:e.jsx(o,{...i})}):o(i)}function s(i,t){throw new Error("Expected component `"+i+"` to be defined: you likely forgot to import, pass, or provide it.")}const f=Object.freeze(Object.defineProperty({__proto__:null,_markdown:a,default:h,frontmatter:l,structuredData:d,toc:c},Symbol.toStringTag,{value:"Module"}));export{f as _};

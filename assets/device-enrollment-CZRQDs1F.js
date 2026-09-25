import{j as e}from"./index-prc0XQdj.js";let c=`

A **Device Management Service (DMS)** acts as the registration authority facing a fleet. It receives requests, applies the authentication policy and delegates issuance to the configured CA.

Each DMS is an independent operational boundary: it can represent a product line, an environment or a device type with its own CA, authentication rules, distributed trust and renewal window.

Before you begin [#before-you-begin]

* Create or import at least one active CA.
* Decide how devices will authenticate during initial enrollment.
* Define which authorities the device should receive as anchors of trust.
* Make sure you have permissions to administer DMSs.

Configure a DMS [#configure-a-dms]

<Steps>
  <Step>
    Identify the fleet [#identify-the-fleet]

    Give the DMS a name that describes its scope, for example a device family or an environment.
  </Step>

  <Step>
    Select the enrollment CA [#select-the-enrollment-ca]

    Choose the authority that will issue the identities. Its policy and validity period constrain the certificates the fleet can obtain.
  </Step>

  <Step>
    Configure EST [#configure-est]

    Define the authentication of \`enroll\`, the \`reenroll\` policy, the renewal window and, if needed, \`serverkeygen\`.
  </Step>

  <Step>
    Distribute trust [#distribute-trust]

    Configure **CA Distribution** to control the response of the \`cacerts\` endpoint.
  </Step>

  <Step>
    Verify the endpoints [#verify-the-endpoints]

    From the DMS menu, open **EST (RFC-7030)** and check the base URL and the invocation examples before integrating the firmware.
  </Step>
</Steps>

Trust distribution [#trust-distribution]

* **Include Lamassu System CA** distributes the TLS certificate of the Lamassu server, useful for *pinning*. It does not represent an issuing CA.
* **Include Enrollment CA** adds the authority configured to issue the DMS's identities.
* **Managed CAs** lets you include additional authorities the device must consider trusted.

Operate the DMS inventory [#operate-the-dms-inventory]

* **Edit** modifies the DMS policy.
* **Go to DMS owned devices** opens only the devices of that fleet.
* **Show/Edit Metadata** manages advanced configuration and integration data.
* **EST (RFC-7030)** shows the endpoints and examples specific to the DMS.
* **Delete** removes the DMS and its configuration. The action is irreversible.

Integrate the devices [#integrate-the-devices]

<Cards>
  <Card title="EST enrollment" description="Configure authentication, endpoints and flows for firmware." href="/docs/platform/pki/est-enrollment" />

  <Card title="Devices and identities" description="Review statuses, history and operational actions." href="/docs/platform/pki/device-management" />
</Cards>
`,h={title:"Device Management Service",description:"Define how a fleet receives, renews and uses its identities.",sidebar:{group:"RA",label:"Overview"}},l={contents:[{heading:void 0,content:"A &#x2A;*Device Management Service (DMS)** acts as the registration authority facing a fleet. It receives requests, applies the authentication policy and delegates issuance to the configured CA."},{heading:void 0,content:"Each DMS is an independent operational boundary: it can represent a product line, an environment or a device type with its own CA, authentication rules, distributed trust and renewal window."},{heading:"before-you-begin",content:"Create or import at least one active CA."},{heading:"before-you-begin",content:"Decide how devices will authenticate during initial enrollment."},{heading:"before-you-begin",content:"Define which authorities the device should receive as anchors of trust."},{heading:"before-you-begin",content:"Make sure you have permissions to administer DMSs."},{heading:"identify-the-fleet",content:"Give the DMS a name that describes its scope, for example a device family or an environment."},{heading:"select-the-enrollment-ca",content:"Choose the authority that will issue the identities. Its policy and validity period constrain the certificates the fleet can obtain."},{heading:"configure-est",content:"Define the authentication of `enroll`, the `reenroll` policy, the renewal window and, if needed, `serverkeygen`."},{heading:"distribute-trust",content:"Configure **CA Distribution** to control the response of the `cacerts` endpoint."},{heading:"verify-the-endpoints",content:"From the DMS menu, open &#x2A;*EST (RFC-7030)** and check the base URL and the invocation examples before integrating the firmware."},{heading:"trust-distribution",content:"**Include Lamassu System CA** distributes the TLS certificate of the Lamassu server, useful for *pinning*. It does not represent an issuing CA."},{heading:"trust-distribution",content:"**Include Enrollment CA** adds the authority configured to issue the DMS's identities."},{heading:"trust-distribution",content:"**Managed CAs** lets you include additional authorities the device must consider trusted."},{heading:"operate-the-dms-inventory",content:"**Edit** modifies the DMS policy."},{heading:"operate-the-dms-inventory",content:"**Go to DMS owned devices** opens only the devices of that fleet."},{heading:"operate-the-dms-inventory",content:"**Show/Edit Metadata** manages advanced configuration and integration data."},{heading:"operate-the-dms-inventory",content:"**EST (RFC-7030)** shows the endpoints and examples specific to the DMS."},{heading:"operate-the-dms-inventory",content:"**Delete** removes the DMS and its configuration. The action is irreversible."},{heading:"integrate-the-devices",content:'<Card title="EST enrollment" description="Configure authentication, endpoints and flows for firmware." href="/docs/platform/pki/est-enrollment" />'},{heading:"integrate-the-devices",content:'<Card title="Devices and identities" description="Review statuses, history and operational actions." href="/docs/platform/pki/device-management" />'}],headings:[{id:"before-you-begin",content:"Before you begin"},{id:"configure-a-dms",content:"Configure a DMS"},{id:"identify-the-fleet",content:"Identify the fleet"},{id:"select-the-enrollment-ca",content:"Select the enrollment CA"},{id:"configure-est",content:"Configure EST"},{id:"distribute-trust",content:"Distribute trust"},{id:"verify-the-endpoints",content:"Verify the endpoints"},{id:"trust-distribution",content:"Trust distribution"},{id:"operate-the-dms-inventory",content:"Operate the DMS inventory"},{id:"integrate-the-devices",content:"Integrate the devices"}]};const u=[{depth:2,url:"#before-you-begin",title:e.jsx(e.Fragment,{children:"Before you begin"})},{depth:2,url:"#configure-a-dms",title:e.jsx(e.Fragment,{children:"Configure a DMS"})},{depth:3,url:"#identify-the-fleet",title:e.jsx(e.Fragment,{children:"Identify the fleet"})},{depth:3,url:"#select-the-enrollment-ca",title:e.jsx(e.Fragment,{children:"Select the enrollment CA"})},{depth:3,url:"#configure-est",title:e.jsx(e.Fragment,{children:"Configure EST"})},{depth:3,url:"#distribute-trust",title:e.jsx(e.Fragment,{children:"Distribute trust"})},{depth:3,url:"#verify-the-endpoints",title:e.jsx(e.Fragment,{children:"Verify the endpoints"})},{depth:2,url:"#trust-distribution",title:e.jsx(e.Fragment,{children:"Trust distribution"})},{depth:2,url:"#operate-the-dms-inventory",title:e.jsx(e.Fragment,{children:"Operate the DMS inventory"})},{depth:2,url:"#integrate-the-devices",title:e.jsx(e.Fragment,{children:"Integrate the devices"})}];function d(n){const t={code:"code",em:"em",h2:"h2",h3:"h3",li:"li",p:"p",strong:"strong",ul:"ul",...n.components},{Card:s,Cards:o,Step:i,Steps:a}=t;return s||r("Card"),o||r("Cards"),i||r("Step"),a||r("Steps"),e.jsxs(e.Fragment,{children:[e.jsxs(t.p,{children:["A ",e.jsx(t.strong,{children:"Device Management Service (DMS)"})," acts as the registration authority facing a fleet. It receives requests, applies the authentication policy and delegates issuance to the configured CA."]}),`
`,e.jsx(t.p,{children:"Each DMS is an independent operational boundary: it can represent a product line, an environment or a device type with its own CA, authentication rules, distributed trust and renewal window."}),`
`,e.jsx(t.h2,{id:"before-you-begin",children:"Before you begin"}),`
`,e.jsxs(t.ul,{children:[`
`,e.jsx(t.li,{children:"Create or import at least one active CA."}),`
`,e.jsx(t.li,{children:"Decide how devices will authenticate during initial enrollment."}),`
`,e.jsx(t.li,{children:"Define which authorities the device should receive as anchors of trust."}),`
`,e.jsx(t.li,{children:"Make sure you have permissions to administer DMSs."}),`
`]}),`
`,e.jsx(t.h2,{id:"configure-a-dms",children:"Configure a DMS"}),`
`,e.jsxs(a,{children:[e.jsxs(i,{children:[e.jsx(t.h3,{id:"identify-the-fleet",children:"Identify the fleet"}),e.jsx(t.p,{children:"Give the DMS a name that describes its scope, for example a device family or an environment."})]}),e.jsxs(i,{children:[e.jsx(t.h3,{id:"select-the-enrollment-ca",children:"Select the enrollment CA"}),e.jsx(t.p,{children:"Choose the authority that will issue the identities. Its policy and validity period constrain the certificates the fleet can obtain."})]}),e.jsxs(i,{children:[e.jsx(t.h3,{id:"configure-est",children:"Configure EST"}),e.jsxs(t.p,{children:["Define the authentication of ",e.jsx(t.code,{children:"enroll"}),", the ",e.jsx(t.code,{children:"reenroll"})," policy, the renewal window and, if needed, ",e.jsx(t.code,{children:"serverkeygen"}),"."]})]}),e.jsxs(i,{children:[e.jsx(t.h3,{id:"distribute-trust",children:"Distribute trust"}),e.jsxs(t.p,{children:["Configure ",e.jsx(t.strong,{children:"CA Distribution"})," to control the response of the ",e.jsx(t.code,{children:"cacerts"})," endpoint."]})]}),e.jsxs(i,{children:[e.jsx(t.h3,{id:"verify-the-endpoints",children:"Verify the endpoints"}),e.jsxs(t.p,{children:["From the DMS menu, open ",e.jsx(t.strong,{children:"EST (RFC-7030)"})," and check the base URL and the invocation examples before integrating the firmware."]})]})]}),`
`,e.jsx(t.h2,{id:"trust-distribution",children:"Trust distribution"}),`
`,e.jsxs(t.ul,{children:[`
`,e.jsxs(t.li,{children:[e.jsx(t.strong,{children:"Include Lamassu System CA"})," distributes the TLS certificate of the Lamassu server, useful for ",e.jsx(t.em,{children:"pinning"}),". It does not represent an issuing CA."]}),`
`,e.jsxs(t.li,{children:[e.jsx(t.strong,{children:"Include Enrollment CA"})," adds the authority configured to issue the DMS's identities."]}),`
`,e.jsxs(t.li,{children:[e.jsx(t.strong,{children:"Managed CAs"})," lets you include additional authorities the device must consider trusted."]}),`
`]}),`
`,e.jsx(t.h2,{id:"operate-the-dms-inventory",children:"Operate the DMS inventory"}),`
`,e.jsxs(t.ul,{children:[`
`,e.jsxs(t.li,{children:[e.jsx(t.strong,{children:"Edit"})," modifies the DMS policy."]}),`
`,e.jsxs(t.li,{children:[e.jsx(t.strong,{children:"Go to DMS owned devices"})," opens only the devices of that fleet."]}),`
`,e.jsxs(t.li,{children:[e.jsx(t.strong,{children:"Show/Edit Metadata"})," manages advanced configuration and integration data."]}),`
`,e.jsxs(t.li,{children:[e.jsx(t.strong,{children:"EST (RFC-7030)"})," shows the endpoints and examples specific to the DMS."]}),`
`,e.jsxs(t.li,{children:[e.jsx(t.strong,{children:"Delete"})," removes the DMS and its configuration. The action is irreversible."]}),`
`]}),`
`,e.jsx(t.h2,{id:"integrate-the-devices",children:"Integrate the devices"}),`
`,e.jsxs(o,{children:[e.jsx(s,{title:"EST enrollment",description:"Configure authentication, endpoints and flows for firmware.",href:"/docs/platform/pki/est-enrollment"}),e.jsx(s,{title:"Devices and identities",description:"Review statuses, history and operational actions.",href:"/docs/platform/pki/device-management"})]})]})}function f(n={}){const{wrapper:t}=n.components||{};return t?e.jsx(t,{...n,children:e.jsx(d,{...n})}):d(n)}function r(n,t){throw new Error("Expected component `"+n+"` to be defined: you likely forgot to import, pass, or provide it.")}const g=Object.freeze(Object.defineProperty({__proto__:null,_markdown:c,default:f,frontmatter:h,structuredData:l,toc:u},Symbol.toStringTag,{value:"Module"}));export{g as _};

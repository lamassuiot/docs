import{j as e}from"./index-prc0XQdj.js";let l=`

This guide is for a fleet operator. You need device, DMS and certificate permissions for the intended actions. A fleet is organized through these resources, tags and metadata; there is no separate “fleet” object to create.

Each device has a \`Device ID\`, one owning DMS (\`dms_owner\`) and, once provisioned, an identity slot with an active version and previous versions. In these flows, keep the CSR and certificate \`Common Name\` equal to \`Device ID\`: binding uses that CN to update the device.

Device states [#device-states]

| Operational view    | Meaning                                                              |
| ------------------- | -------------------------------------------------------------------- |
| **No Identity**     | A record exists without an associated identity.                      |
| **Active**          | The slot is active; also check certificate dates, status and usages. |
| **Renewal Pending** | The identity is in the operational renewal window.                   |
| **Expiring Soon**   | Expiration is approaching according to configured thresholds.        |
| **Expired**         | The identity has expired.                                            |
| **Revoked**         | The identity is marked revoked.                                      |
| **Decommissioned**  | The record is retired and ordinary updates do not restore operation. |

Device, slot and [certificate](/docs/platform/pki/concepts/certificate-lifecycle) states are distinct. Events and jobs can update the view after saving a certificate; an **Active** label does not establish consumer acceptance.

Inspect a device [#inspect-a-device]

Filter the inventory by ID, tags and status. Open details and record the owning DMS, active version and current certificate serial.

* **Certificate History** relates previous and current versions. Replacing the slot does not by itself revoke every previous version.
* **Device Event Timeline** helps reconstruct registration, provisioning, renewal and status changes. A change may be saved even if event persistence fails; also inspect the record and certificates.

Compare these values with the identity installed on the device. Updating a Lamassu slot does not install files on the remote equipment.

Register a device manually [#register-a-device-manually]

Use this flow to prepare inventory or assign an identity through the console. You need an existing DMS.

<Steps>
  <Step>
    Create the device [#create-the-device]

    Open registration in **Managed Devices**. Confirm the ID does not already exist in another DMS: ID lookup is not restricted to a fleet.
  </Step>

  <Step>
    Define its membership [#define-its-membership]

    Enter **Device ID** and select its owning DMS. The console’s **Registration Authority** label refers to that DMS.
  </Step>

  <Step>
    Classify the device [#classify-the-device]

    Add model, environment or location tags and an icon according to your inventory.
  </Step>

  <Step>
    Verify the registration [#verify-the-registration]

    Read the device again: require the intended DMS and **No Identity**. Follow [Manual registration](/docs/platform/iot-fleets/quickstarts/register-device) to complete assignment.
  </Step>
</Steps>

Preregistration does not establish that \`/simpleenroll\` will admit the request. Review its interaction with \`enable_replaceable_enrollment\` in [Provisioning strategies](/docs/platform/iot-fleets/enrollment/provisioning-strategies).

Assign an identity manually [#assign-an-identity-manually]

From **No Identity**, use **Assign Identity**:

1. Select an active, current certificate suitable for the consumer, with \`CN\` exactly equal to \`Device ID\`.
2. If unavailable, **Issue New Instead** starts issuance using the intended CA. Review the [profile](/docs/platform/pki/certificate-profiles) first.
3. Confirm and read the serial, active version and history again.
4. Install the key/certificate pair and required intermediates on the device and test usage.

Issuing, binding and installing are separate steps. If an operation fails, check which steps persisted before repeating it.

Revoke the current identity [#revoke-the-current-identity]

Locate the active serial in history and revoke it with an appropriate reason. Verify the record, OCSP/CRL publication and rejection of a new consumer connection using the [certificate guide](/docs/platform/pki/certificates).

Revocation does not remove the device. It does not automatically enable another enrollment either: recovery depends on its credential, status and DMS policy. \`CertificateHold\` can be reactivated under PKI conditions; other reasons block subsequent certificate changes.

Decommission a device [#decommission-a-device]

Before **Decommission**, inventory active and previous identities, connections and destination permissions. Prepare retirement in the consumer.

The backend saves **Decommissioned** and attempts to revoke the active version’s certificate with \`CessationOfOperation\` if the slot was not expired or revoked. It does not traverse all history. Deferred revocation can fail after retirement is saved; check the result by serial.

<Callout type="warn" title="Check complete retirement">
  Retired status protects ordinary device and slot updates. It does not guarantee that every EST request is rejected before issuance: binding can skip a retired device without returning an error. Check for remaining usable certificates or permissions and block new admission in the relevant control.
</Callout>

Retain records according to audit policy. Do not reuse a retired ID to hide an equipment change.

Automate enrollment [#automate-enrollment]

<Cards>
  <Card title="Enroll and connect a device" description="Obtain an identity from the client and test mTLS." href="/docs/platform/iot-fleets/quickstarts/enroll-device" />

  <Card title="Renewal and recovery" description="Install the successor and handle failures without losing known state." href="/docs/platform/iot-fleets/enrollment/renewal-and-recovery" />
</Cards>
`,h={title:"Devices and identities",description:"Register, inspect and retire devices while checking their current identity and history."},v={contents:[{heading:void 0,content:"This guide is for a fleet operator. You need device, DMS and certificate permissions for the intended actions. A fleet is organized through these resources, tags and metadata; there is no separate “fleet” object to create."},{heading:void 0,content:"Each device has a `Device ID`, one owning DMS (`dms_owner`) and, once provisioned, an identity slot with an active version and previous versions. In these flows, keep the CSR and certificate `Common Name` equal to `Device ID`: binding uses that CN to update the device."},{heading:"device-states",content:"Operational view"},{heading:"device-states",content:"Meaning"},{heading:"device-states",content:"**No Identity**"},{heading:"device-states",content:"A record exists without an associated identity."},{heading:"device-states",content:"**Active**"},{heading:"device-states",content:"The slot is active; also check certificate dates, status and usages."},{heading:"device-states",content:"**Renewal Pending**"},{heading:"device-states",content:"The identity is in the operational renewal window."},{heading:"device-states",content:"**Expiring Soon**"},{heading:"device-states",content:"Expiration is approaching according to configured thresholds."},{heading:"device-states",content:"**Expired**"},{heading:"device-states",content:"The identity has expired."},{heading:"device-states",content:"**Revoked**"},{heading:"device-states",content:"The identity is marked revoked."},{heading:"device-states",content:"**Decommissioned**"},{heading:"device-states",content:"The record is retired and ordinary updates do not restore operation."},{heading:"device-states",content:"Device, slot and certificate states are distinct. Events and jobs can update the view after saving a certificate; an **Active** label does not establish consumer acceptance."},{heading:"inspect-a-device",content:"Filter the inventory by ID, tags and status. Open details and record the owning DMS, active version and current certificate serial."},{heading:"inspect-a-device",content:"**Certificate History** relates previous and current versions. Replacing the slot does not by itself revoke every previous version."},{heading:"inspect-a-device",content:"**Device Event Timeline** helps reconstruct registration, provisioning, renewal and status changes. A change may be saved even if event persistence fails; also inspect the record and certificates."},{heading:"inspect-a-device",content:"Compare these values with the identity installed on the device. Updating a Lamassu slot does not install files on the remote equipment."},{heading:"register-a-device-manually",content:"Use this flow to prepare inventory or assign an identity through the console. You need an existing DMS."},{heading:"create-the-device",content:"Open registration in **Managed Devices**. Confirm the ID does not already exist in another DMS: ID lookup is not restricted to a fleet."},{heading:"define-its-membership",content:"Enter **Device ID** and select its owning DMS. The console’s **Registration Authority** label refers to that DMS."},{heading:"classify-the-device",content:"Add model, environment or location tags and an icon according to your inventory."},{heading:"verify-the-registration",content:"Read the device again: require the intended DMS and **No Identity**. Follow Manual registration to complete assignment."},{heading:"verify-the-registration",content:"Preregistration does not establish that `/simpleenroll` will admit the request. Review its interaction with `enable_replaceable_enrollment` in Provisioning strategies."},{heading:"assign-an-identity-manually",content:"From **No Identity**, use **Assign Identity**:"},{heading:"assign-an-identity-manually",content:"Select an active, current certificate suitable for the consumer, with `CN` exactly equal to `Device ID`."},{heading:"assign-an-identity-manually",content:"If unavailable, **Issue New Instead** starts issuance using the intended CA. Review the profile first."},{heading:"assign-an-identity-manually",content:"Confirm and read the serial, active version and history again."},{heading:"assign-an-identity-manually",content:"Install the key/certificate pair and required intermediates on the device and test usage."},{heading:"assign-an-identity-manually",content:"Issuing, binding and installing are separate steps. If an operation fails, check which steps persisted before repeating it."},{heading:"revoke-the-current-identity",content:"Locate the active serial in history and revoke it with an appropriate reason. Verify the record, OCSP/CRL publication and rejection of a new consumer connection using the certificate guide."},{heading:"revoke-the-current-identity",content:"Revocation does not remove the device. It does not automatically enable another enrollment either: recovery depends on its credential, status and DMS policy. `CertificateHold` can be reactivated under PKI conditions; other reasons block subsequent certificate changes."},{heading:"decommission-a-device",content:"Before **Decommission**, inventory active and previous identities, connections and destination permissions. Prepare retirement in the consumer."},{heading:"decommission-a-device",content:"The backend saves **Decommissioned** and attempts to revoke the active version’s certificate with `CessationOfOperation` if the slot was not expired or revoked. It does not traverse all history. Deferred revocation can fail after retirement is saved; check the result by serial."},{heading:"decommission-a-device",content:"Retired status protects ordinary device and slot updates. It does not guarantee that every EST request is rejected before issuance: binding can skip a retired device without returning an error. Check for remaining usable certificates or permissions and block new admission in the relevant control."},{heading:"decommission-a-device",content:"Retain records according to audit policy. Do not reuse a retired ID to hide an equipment change."},{heading:"automate-enrollment",content:'<Card title="Enroll and connect a device" description="Obtain an identity from the client and test mTLS." href="/docs/platform/iot-fleets/quickstarts/enroll-device" />'},{heading:"automate-enrollment",content:'<Card title="Renewal and recovery" description="Install the successor and handle failures without losing known state." href="/docs/platform/iot-fleets/enrollment/renewal-and-recovery" />'}],headings:[{id:"device-states",content:"Device states"},{id:"inspect-a-device",content:"Inspect a device"},{id:"register-a-device-manually",content:"Register a device manually"},{id:"create-the-device",content:"Create the device"},{id:"define-its-membership",content:"Define its membership"},{id:"classify-the-device",content:"Classify the device"},{id:"verify-the-registration",content:"Verify the registration"},{id:"assign-an-identity-manually",content:"Assign an identity manually"},{id:"revoke-the-current-identity",content:"Revoke the current identity"},{id:"decommission-a-device",content:"Decommission a device"},{id:"automate-enrollment",content:"Automate enrollment"}]};const p=[{depth:2,url:"#device-states",title:e.jsx(e.Fragment,{children:"Device states"})},{depth:2,url:"#inspect-a-device",title:e.jsx(e.Fragment,{children:"Inspect a device"})},{depth:2,url:"#register-a-device-manually",title:e.jsx(e.Fragment,{children:"Register a device manually"})},{depth:3,url:"#create-the-device",title:e.jsx(e.Fragment,{children:"Create the device"})},{depth:3,url:"#define-its-membership",title:e.jsx(e.Fragment,{children:"Define its membership"})},{depth:3,url:"#classify-the-device",title:e.jsx(e.Fragment,{children:"Classify the device"})},{depth:3,url:"#verify-the-registration",title:e.jsx(e.Fragment,{children:"Verify the registration"})},{depth:2,url:"#assign-an-identity-manually",title:e.jsx(e.Fragment,{children:"Assign an identity manually"})},{depth:2,url:"#revoke-the-current-identity",title:e.jsx(e.Fragment,{children:"Revoke the current identity"})},{depth:2,url:"#decommission-a-device",title:e.jsx(e.Fragment,{children:"Decommission a device"})},{depth:2,url:"#automate-enrollment",title:e.jsx(e.Fragment,{children:"Automate enrollment"})}];function c(n){const t={a:"a",code:"code",h2:"h2",h3:"h3",li:"li",ol:"ol",p:"p",strong:"strong",table:"table",tbody:"tbody",td:"td",th:"th",thead:"thead",tr:"tr",ul:"ul",...n.components},{Callout:r,Card:a,Cards:o,Step:i,Steps:d}=t;return r||s("Callout"),a||s("Card"),o||s("Cards"),i||s("Step"),d||s("Steps"),e.jsxs(e.Fragment,{children:[e.jsx(t.p,{children:"This guide is for a fleet operator. You need device, DMS and certificate permissions for the intended actions. A fleet is organized through these resources, tags and metadata; there is no separate “fleet” object to create."}),`
`,e.jsxs(t.p,{children:["Each device has a ",e.jsx(t.code,{children:"Device ID"}),", one owning DMS (",e.jsx(t.code,{children:"dms_owner"}),") and, once provisioned, an identity slot with an active version and previous versions. In these flows, keep the CSR and certificate ",e.jsx(t.code,{children:"Common Name"})," equal to ",e.jsx(t.code,{children:"Device ID"}),": binding uses that CN to update the device."]}),`
`,e.jsx(t.h2,{id:"device-states",children:"Device states"}),`
`,e.jsxs(t.table,{children:[e.jsx(t.thead,{children:e.jsxs(t.tr,{children:[e.jsx(t.th,{children:"Operational view"}),e.jsx(t.th,{children:"Meaning"})]})}),e.jsxs(t.tbody,{children:[e.jsxs(t.tr,{children:[e.jsx(t.td,{children:e.jsx(t.strong,{children:"No Identity"})}),e.jsx(t.td,{children:"A record exists without an associated identity."})]}),e.jsxs(t.tr,{children:[e.jsx(t.td,{children:e.jsx(t.strong,{children:"Active"})}),e.jsx(t.td,{children:"The slot is active; also check certificate dates, status and usages."})]}),e.jsxs(t.tr,{children:[e.jsx(t.td,{children:e.jsx(t.strong,{children:"Renewal Pending"})}),e.jsx(t.td,{children:"The identity is in the operational renewal window."})]}),e.jsxs(t.tr,{children:[e.jsx(t.td,{children:e.jsx(t.strong,{children:"Expiring Soon"})}),e.jsx(t.td,{children:"Expiration is approaching according to configured thresholds."})]}),e.jsxs(t.tr,{children:[e.jsx(t.td,{children:e.jsx(t.strong,{children:"Expired"})}),e.jsx(t.td,{children:"The identity has expired."})]}),e.jsxs(t.tr,{children:[e.jsx(t.td,{children:e.jsx(t.strong,{children:"Revoked"})}),e.jsx(t.td,{children:"The identity is marked revoked."})]}),e.jsxs(t.tr,{children:[e.jsx(t.td,{children:e.jsx(t.strong,{children:"Decommissioned"})}),e.jsx(t.td,{children:"The record is retired and ordinary updates do not restore operation."})]})]})]}),`
`,e.jsxs(t.p,{children:["Device, slot and ",e.jsx(t.a,{href:"/docs/platform/pki/concepts/certificate-lifecycle",children:"certificate"})," states are distinct. Events and jobs can update the view after saving a certificate; an ",e.jsx(t.strong,{children:"Active"})," label does not establish consumer acceptance."]}),`
`,e.jsx(t.h2,{id:"inspect-a-device",children:"Inspect a device"}),`
`,e.jsx(t.p,{children:"Filter the inventory by ID, tags and status. Open details and record the owning DMS, active version and current certificate serial."}),`
`,e.jsxs(t.ul,{children:[`
`,e.jsxs(t.li,{children:[e.jsx(t.strong,{children:"Certificate History"})," relates previous and current versions. Replacing the slot does not by itself revoke every previous version."]}),`
`,e.jsxs(t.li,{children:[e.jsx(t.strong,{children:"Device Event Timeline"})," helps reconstruct registration, provisioning, renewal and status changes. A change may be saved even if event persistence fails; also inspect the record and certificates."]}),`
`]}),`
`,e.jsx(t.p,{children:"Compare these values with the identity installed on the device. Updating a Lamassu slot does not install files on the remote equipment."}),`
`,e.jsx(t.h2,{id:"register-a-device-manually",children:"Register a device manually"}),`
`,e.jsx(t.p,{children:"Use this flow to prepare inventory or assign an identity through the console. You need an existing DMS."}),`
`,e.jsxs(d,{children:[e.jsxs(i,{children:[e.jsx(t.h3,{id:"create-the-device",children:"Create the device"}),e.jsxs(t.p,{children:["Open registration in ",e.jsx(t.strong,{children:"Managed Devices"}),". Confirm the ID does not already exist in another DMS: ID lookup is not restricted to a fleet."]})]}),e.jsxs(i,{children:[e.jsx(t.h3,{id:"define-its-membership",children:"Define its membership"}),e.jsxs(t.p,{children:["Enter ",e.jsx(t.strong,{children:"Device ID"})," and select its owning DMS. The console’s ",e.jsx(t.strong,{children:"Registration Authority"})," label refers to that DMS."]})]}),e.jsxs(i,{children:[e.jsx(t.h3,{id:"classify-the-device",children:"Classify the device"}),e.jsx(t.p,{children:"Add model, environment or location tags and an icon according to your inventory."})]}),e.jsxs(i,{children:[e.jsx(t.h3,{id:"verify-the-registration",children:"Verify the registration"}),e.jsxs(t.p,{children:["Read the device again: require the intended DMS and ",e.jsx(t.strong,{children:"No Identity"}),". Follow ",e.jsx(t.a,{href:"/docs/platform/iot-fleets/quickstarts/register-device",children:"Manual registration"})," to complete assignment."]})]})]}),`
`,e.jsxs(t.p,{children:["Preregistration does not establish that ",e.jsx(t.code,{children:"/simpleenroll"})," will admit the request. Review its interaction with ",e.jsx(t.code,{children:"enable_replaceable_enrollment"})," in ",e.jsx(t.a,{href:"/docs/platform/iot-fleets/enrollment/provisioning-strategies",children:"Provisioning strategies"}),"."]}),`
`,e.jsx(t.h2,{id:"assign-an-identity-manually",children:"Assign an identity manually"}),`
`,e.jsxs(t.p,{children:["From ",e.jsx(t.strong,{children:"No Identity"}),", use ",e.jsx(t.strong,{children:"Assign Identity"}),":"]}),`
`,e.jsxs(t.ol,{children:[`
`,e.jsxs(t.li,{children:["Select an active, current certificate suitable for the consumer, with ",e.jsx(t.code,{children:"CN"})," exactly equal to ",e.jsx(t.code,{children:"Device ID"}),"."]}),`
`,e.jsxs(t.li,{children:["If unavailable, ",e.jsx(t.strong,{children:"Issue New Instead"})," starts issuance using the intended CA. Review the ",e.jsx(t.a,{href:"/docs/platform/pki/certificate-profiles",children:"profile"})," first."]}),`
`,e.jsx(t.li,{children:"Confirm and read the serial, active version and history again."}),`
`,e.jsx(t.li,{children:"Install the key/certificate pair and required intermediates on the device and test usage."}),`
`]}),`
`,e.jsx(t.p,{children:"Issuing, binding and installing are separate steps. If an operation fails, check which steps persisted before repeating it."}),`
`,e.jsx(t.h2,{id:"revoke-the-current-identity",children:"Revoke the current identity"}),`
`,e.jsxs(t.p,{children:["Locate the active serial in history and revoke it with an appropriate reason. Verify the record, OCSP/CRL publication and rejection of a new consumer connection using the ",e.jsx(t.a,{href:"/docs/platform/pki/certificates",children:"certificate guide"}),"."]}),`
`,e.jsxs(t.p,{children:["Revocation does not remove the device. It does not automatically enable another enrollment either: recovery depends on its credential, status and DMS policy. ",e.jsx(t.code,{children:"CertificateHold"})," can be reactivated under PKI conditions; other reasons block subsequent certificate changes."]}),`
`,e.jsx(t.h2,{id:"decommission-a-device",children:"Decommission a device"}),`
`,e.jsxs(t.p,{children:["Before ",e.jsx(t.strong,{children:"Decommission"}),", inventory active and previous identities, connections and destination permissions. Prepare retirement in the consumer."]}),`
`,e.jsxs(t.p,{children:["The backend saves ",e.jsx(t.strong,{children:"Decommissioned"})," and attempts to revoke the active version’s certificate with ",e.jsx(t.code,{children:"CessationOfOperation"})," if the slot was not expired or revoked. It does not traverse all history. Deferred revocation can fail after retirement is saved; check the result by serial."]}),`
`,e.jsx(r,{type:"warn",title:"Check complete retirement",children:e.jsx(t.p,{children:"Retired status protects ordinary device and slot updates. It does not guarantee that every EST request is rejected before issuance: binding can skip a retired device without returning an error. Check for remaining usable certificates or permissions and block new admission in the relevant control."})}),`
`,e.jsx(t.p,{children:"Retain records according to audit policy. Do not reuse a retired ID to hide an equipment change."}),`
`,e.jsx(t.h2,{id:"automate-enrollment",children:"Automate enrollment"}),`
`,e.jsxs(o,{children:[e.jsx(a,{title:"Enroll and connect a device",description:"Obtain an identity from the client and test mTLS.",href:"/docs/platform/iot-fleets/quickstarts/enroll-device"}),e.jsx(a,{title:"Renewal and recovery",description:"Install the successor and handle failures without losing known state.",href:"/docs/platform/iot-fleets/enrollment/renewal-and-recovery"})]})]})}function u(n={}){const{wrapper:t}=n.components||{};return t?e.jsx(t,{...n,children:e.jsx(c,{...n})}):c(n)}function s(n,t){throw new Error("Expected component `"+n+"` to be defined: you likely forgot to import, pass, or provide it.")}const m=Object.freeze(Object.defineProperty({__proto__:null,_markdown:l,default:u,frontmatter:h,structuredData:v,toc:p},Symbol.toStringTag,{value:"Module"}));export{m as _};

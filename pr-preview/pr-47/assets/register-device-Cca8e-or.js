import{j as e}from"./index-prc0XQdj.js";let c=`

This path is intended for those starting to administer device identities. You will register \`device-001\` and assign an existing certificate to check the relationship between device, DMS and identity history.

Assignment updates Lamassu's inventory. Install the key and certificate separately on the device; check the connection to a consumer in that destination's integration.

Before you begin [#before-you-begin]

* An accessible instance and permission to administer DMSs, devices and certificate associations.
* An active CA with an available key. If one does not exist yet, follow [Create your first CA](/docs/platform/pki/quickstarts/create-certificate-authority).
* An active end-entity certificate from that CA whose \`Common Name\` is exactly \`device-001\`, together with its private key. Follow [Issue and verify a certificate](/docs/platform/pki/quickstarts/issue-certificate) to obtain and check both.
* The identifier \`device-001\` available in the inventory. If you already used it, choose another and issue the certificate with that same \`Common Name\`.

Prepare the DMS [#prepare-the-dms]

A DMS must exist before registering the device. If you already have a suitable one, check its CA and note its identifier; to create one:

1. Open the DMS inventory and its creation action. Assign a recognizable name, such as \`Acme Evaluation DMS\`.
2. In **Enrollment CA**, select the CA that issued \`device.crt\`.
3. In **Registration Mode**, select \`PRE_REGISTRATION\` for the path that starts with explicit registration.
4. Set **Authentication Mode** to \`CLIENT_CERTIFICATE\` and add the CA whose initial certificates you will accept in **Validation CAs**. For this evaluation, it can be the same CA. Keep **Verify CSR Signature** enabled and server key generation disabled if you will not use it.
5. Review renewal and trust distribution settings with the [DMS guide](/docs/platform/iot-fleets/enrollment/dms), save the service and note its identifier.
6. Reopen the DMS and confirm that the enrollment CA is the expected one and the service appears in inventory.

These settings prepare DMS policy. The next steps register and assign through the console; they do not send an EST request or test admission through that protocol.

<Steps>
  <Step>
    Register the device [#register-the-device]

    Open **Managed Devices** and the registration action. Complete:

    * **Device ID**: \`device-001\`.
    * **Registration Authority**: the DMS you just prepared; this label identifies the service fulfilling the registration authority role.
    * **Icon** and **Tags**: optional classification.

    Confirm registration.
  </Step>

  <Step>
    Check the initial status [#check-the-initial-status]

    Open the device. It should appear in **No Identity** and show the selected owning DMS.

    Registration creates the inventory entry; the certificate must still be associated.
  </Step>

  <Step>
    Assign an identity [#assign-an-identity]

    Select **Assign Identity** and the existing certificate with \`CN=device-001\`. Check its serial number, issuer and validity against the certificate you verified in PKI.

    Confirm the association. The **Issue New Instead** alternative is explained in [Devices and identities](/docs/platform/iot-fleets/device-management#assign-an-identity-manually).
  </Step>

  <Step>
    Verify the device [#verify-the-device]

    Check that it has an active identity. In **Certificate History**, verify the associated serial number; in **Device Event Timeline**, find the assignment event.

    Keep the device identifier, owning DMS and serial number as references for the result.
  </Step>
</Steps>

Expected result [#expected-result]

| Check               | Result                                                            |
| ------------------- | ----------------------------------------------------------------- |
| Device              | \`device-001\` appears in inventory with the expected DMS.          |
| Current identity    | The associated certificate matches the one you verified in PKI.   |
| History             | The associated issuance appears with its serial number and dates. |
| Key and certificate | You have the verified pair ready to install on the device.        |

If the result fails [#if-the-result-fails]

* If you cannot select the DMS, confirm its creation and your read permissions.
* If no eligible certificate appears, check that its \`Common Name\` matches the \`Device ID\` exactly, it is active and it was issued by the expected CA.
* If assignment fails, review permissions and operation diagnostics before repeating it. Query the device and its history again to find the persisted result.
* If an expiration or renewal state appears, check certificate dates and DMS thresholds in [Devices and identities](/docs/platform/iot-fleets/device-management).

Automate the next device [#automate-the-next-device]

Continue with [DMS](/docs/platform/iot-fleets/enrollment/dms) and [EST](/docs/platform/iot-fleets/enrollment/overview) for the device to request and renew certificates. Prepare server trust, the initial credential and policies for each operation before implementing the client.

For a path from the client through mTLS, follow [Enroll and connect your first device](/docs/platform/iot-fleets/quickstarts/enroll-device) with a new ID.

To use the identity in [AWS IoT Core](/docs/platform/iot-fleets/integrations/aws-iot-core), also prepare trust and permissions in the destination. Check the connection from the device after installing the required key, certificate and chain.
`,o={title:"Register a device manually",description:"Prepare a DMS, register a device and associate a verified certificate with its identity."},d={contents:[{heading:void 0,content:"This path is intended for those starting to administer device identities. You will register `device-001` and assign an existing certificate to check the relationship between device, DMS and identity history."},{heading:void 0,content:"Assignment updates Lamassu's inventory. Install the key and certificate separately on the device; check the connection to a consumer in that destination's integration."},{heading:"before-you-begin",content:"An accessible instance and permission to administer DMSs, devices and certificate associations."},{heading:"before-you-begin",content:"An active CA with an available key. If one does not exist yet, follow Create your first CA."},{heading:"before-you-begin",content:"An active end-entity certificate from that CA whose `Common Name` is exactly `device-001`, together with its private key. Follow Issue and verify a certificate to obtain and check both."},{heading:"before-you-begin",content:"The identifier `device-001` available in the inventory. If you already used it, choose another and issue the certificate with that same `Common Name`."},{heading:"prepare-the-dms",content:"A DMS must exist before registering the device. If you already have a suitable one, check its CA and note its identifier; to create one:"},{heading:"prepare-the-dms",content:"Open the DMS inventory and its creation action. Assign a recognizable name, such as `Acme Evaluation DMS`."},{heading:"prepare-the-dms",content:"In **Enrollment CA**, select the CA that issued `device.crt`."},{heading:"prepare-the-dms",content:"In **Registration Mode**, select `PRE_REGISTRATION` for the path that starts with explicit registration."},{heading:"prepare-the-dms",content:"Set **Authentication Mode** to `CLIENT_CERTIFICATE` and add the CA whose initial certificates you will accept in **Validation CAs**. For this evaluation, it can be the same CA. Keep **Verify CSR Signature** enabled and server key generation disabled if you will not use it."},{heading:"prepare-the-dms",content:"Review renewal and trust distribution settings with the DMS guide, save the service and note its identifier."},{heading:"prepare-the-dms",content:"Reopen the DMS and confirm that the enrollment CA is the expected one and the service appears in inventory."},{heading:"prepare-the-dms",content:"These settings prepare DMS policy. The next steps register and assign through the console; they do not send an EST request or test admission through that protocol."},{heading:"register-the-device",content:"Open **Managed Devices** and the registration action. Complete:"},{heading:"register-the-device",content:"**Device ID**: `device-001`."},{heading:"register-the-device",content:"**Registration Authority**: the DMS you just prepared; this label identifies the service fulfilling the registration authority role."},{heading:"register-the-device",content:"**Icon** and **Tags**: optional classification."},{heading:"register-the-device",content:"Confirm registration."},{heading:"check-the-initial-status",content:"Open the device. It should appear in **No Identity** and show the selected owning DMS."},{heading:"check-the-initial-status",content:"Registration creates the inventory entry; the certificate must still be associated."},{heading:"assign-an-identity",content:"Select **Assign Identity** and the existing certificate with `CN=device-001`. Check its serial number, issuer and validity against the certificate you verified in PKI."},{heading:"assign-an-identity",content:"Confirm the association. The **Issue New Instead** alternative is explained in Devices and identities."},{heading:"verify-the-device",content:"Check that it has an active identity. In **Certificate History**, verify the associated serial number; in **Device Event Timeline**, find the assignment event."},{heading:"verify-the-device",content:"Keep the device identifier, owning DMS and serial number as references for the result."},{heading:"expected-result",content:"Check"},{heading:"expected-result",content:"Result"},{heading:"expected-result",content:"Device"},{heading:"expected-result",content:"`device-001` appears in inventory with the expected DMS."},{heading:"expected-result",content:"Current identity"},{heading:"expected-result",content:"The associated certificate matches the one you verified in PKI."},{heading:"expected-result",content:"History"},{heading:"expected-result",content:"The associated issuance appears with its serial number and dates."},{heading:"expected-result",content:"Key and certificate"},{heading:"expected-result",content:"You have the verified pair ready to install on the device."},{heading:"if-the-result-fails",content:"If you cannot select the DMS, confirm its creation and your read permissions."},{heading:"if-the-result-fails",content:"If no eligible certificate appears, check that its `Common Name` matches the `Device ID` exactly, it is active and it was issued by the expected CA."},{heading:"if-the-result-fails",content:"If assignment fails, review permissions and operation diagnostics before repeating it. Query the device and its history again to find the persisted result."},{heading:"if-the-result-fails",content:"If an expiration or renewal state appears, check certificate dates and DMS thresholds in Devices and identities."},{heading:"automate-the-next-device",content:"Continue with DMS and EST for the device to request and renew certificates. Prepare server trust, the initial credential and policies for each operation before implementing the client."},{heading:"automate-the-next-device",content:"For a path from the client through mTLS, follow Enroll and connect your first device with a new ID."},{heading:"automate-the-next-device",content:"To use the identity in AWS IoT Core, also prepare trust and permissions in the destination. Check the connection from the device after installing the required key, certificate and chain."}],headings:[{id:"before-you-begin",content:"Before you begin"},{id:"prepare-the-dms",content:"Prepare the DMS"},{id:"register-the-device",content:"Register the device"},{id:"check-the-initial-status",content:"Check the initial status"},{id:"assign-an-identity",content:"Assign an identity"},{id:"verify-the-device",content:"Verify the device"},{id:"expected-result",content:"Expected result"},{id:"if-the-result-fails",content:"If the result fails"},{id:"automate-the-next-device",content:"Automate the next device"}]};const h=[{depth:2,url:"#before-you-begin",title:e.jsx(e.Fragment,{children:"Before you begin"})},{depth:2,url:"#prepare-the-dms",title:e.jsx(e.Fragment,{children:"Prepare the DMS"})},{depth:3,url:"#register-the-device",title:e.jsx(e.Fragment,{children:"Register the device"})},{depth:3,url:"#check-the-initial-status",title:e.jsx(e.Fragment,{children:"Check the initial status"})},{depth:3,url:"#assign-an-identity",title:e.jsx(e.Fragment,{children:"Assign an identity"})},{depth:3,url:"#verify-the-device",title:e.jsx(e.Fragment,{children:"Verify the device"})},{depth:2,url:"#expected-result",title:e.jsx(e.Fragment,{children:"Expected result"})},{depth:2,url:"#if-the-result-fails",title:e.jsx(e.Fragment,{children:"If the result fails"})},{depth:2,url:"#automate-the-next-device",title:e.jsx(e.Fragment,{children:"Automate the next device"})}];function a(i){const t={a:"a",code:"code",h2:"h2",h3:"h3",li:"li",ol:"ol",p:"p",strong:"strong",table:"table",tbody:"tbody",td:"td",th:"th",thead:"thead",tr:"tr",ul:"ul",...i.components},{Step:n,Steps:s}=t;return n||r("Step"),s||r("Steps"),e.jsxs(e.Fragment,{children:[e.jsxs(t.p,{children:["This path is intended for those starting to administer device identities. You will register ",e.jsx(t.code,{children:"device-001"})," and assign an existing certificate to check the relationship between device, DMS and identity history."]}),`
`,e.jsx(t.p,{children:"Assignment updates Lamassu's inventory. Install the key and certificate separately on the device; check the connection to a consumer in that destination's integration."}),`
`,e.jsx(t.h2,{id:"before-you-begin",children:"Before you begin"}),`
`,e.jsxs(t.ul,{children:[`
`,e.jsx(t.li,{children:"An accessible instance and permission to administer DMSs, devices and certificate associations."}),`
`,e.jsxs(t.li,{children:["An active CA with an available key. If one does not exist yet, follow ",e.jsx(t.a,{href:"/docs/platform/pki/quickstarts/create-certificate-authority",children:"Create your first CA"}),"."]}),`
`,e.jsxs(t.li,{children:["An active end-entity certificate from that CA whose ",e.jsx(t.code,{children:"Common Name"})," is exactly ",e.jsx(t.code,{children:"device-001"}),", together with its private key. Follow ",e.jsx(t.a,{href:"/docs/platform/pki/quickstarts/issue-certificate",children:"Issue and verify a certificate"})," to obtain and check both."]}),`
`,e.jsxs(t.li,{children:["The identifier ",e.jsx(t.code,{children:"device-001"})," available in the inventory. If you already used it, choose another and issue the certificate with that same ",e.jsx(t.code,{children:"Common Name"}),"."]}),`
`]}),`
`,e.jsx(t.h2,{id:"prepare-the-dms",children:"Prepare the DMS"}),`
`,e.jsx(t.p,{children:"A DMS must exist before registering the device. If you already have a suitable one, check its CA and note its identifier; to create one:"}),`
`,e.jsxs(t.ol,{children:[`
`,e.jsxs(t.li,{children:["Open the DMS inventory and its creation action. Assign a recognizable name, such as ",e.jsx(t.code,{children:"Acme Evaluation DMS"}),"."]}),`
`,e.jsxs(t.li,{children:["In ",e.jsx(t.strong,{children:"Enrollment CA"}),", select the CA that issued ",e.jsx(t.code,{children:"device.crt"}),"."]}),`
`,e.jsxs(t.li,{children:["In ",e.jsx(t.strong,{children:"Registration Mode"}),", select ",e.jsx(t.code,{children:"PRE_REGISTRATION"})," for the path that starts with explicit registration."]}),`
`,e.jsxs(t.li,{children:["Set ",e.jsx(t.strong,{children:"Authentication Mode"})," to ",e.jsx(t.code,{children:"CLIENT_CERTIFICATE"})," and add the CA whose initial certificates you will accept in ",e.jsx(t.strong,{children:"Validation CAs"}),". For this evaluation, it can be the same CA. Keep ",e.jsx(t.strong,{children:"Verify CSR Signature"})," enabled and server key generation disabled if you will not use it."]}),`
`,e.jsxs(t.li,{children:["Review renewal and trust distribution settings with the ",e.jsx(t.a,{href:"/docs/platform/iot-fleets/enrollment/dms",children:"DMS guide"}),", save the service and note its identifier."]}),`
`,e.jsx(t.li,{children:"Reopen the DMS and confirm that the enrollment CA is the expected one and the service appears in inventory."}),`
`]}),`
`,e.jsx(t.p,{children:"These settings prepare DMS policy. The next steps register and assign through the console; they do not send an EST request or test admission through that protocol."}),`
`,e.jsxs(s,{children:[e.jsxs(n,{children:[e.jsx(t.h3,{id:"register-the-device",children:"Register the device"}),e.jsxs(t.p,{children:["Open ",e.jsx(t.strong,{children:"Managed Devices"})," and the registration action. Complete:"]}),e.jsxs(t.ul,{children:[`
`,e.jsxs(t.li,{children:[e.jsx(t.strong,{children:"Device ID"}),": ",e.jsx(t.code,{children:"device-001"}),"."]}),`
`,e.jsxs(t.li,{children:[e.jsx(t.strong,{children:"Registration Authority"}),": the DMS you just prepared; this label identifies the service fulfilling the registration authority role."]}),`
`,e.jsxs(t.li,{children:[e.jsx(t.strong,{children:"Icon"})," and ",e.jsx(t.strong,{children:"Tags"}),": optional classification."]}),`
`]}),e.jsx(t.p,{children:"Confirm registration."})]}),e.jsxs(n,{children:[e.jsx(t.h3,{id:"check-the-initial-status",children:"Check the initial status"}),e.jsxs(t.p,{children:["Open the device. It should appear in ",e.jsx(t.strong,{children:"No Identity"})," and show the selected owning DMS."]}),e.jsx(t.p,{children:"Registration creates the inventory entry; the certificate must still be associated."})]}),e.jsxs(n,{children:[e.jsx(t.h3,{id:"assign-an-identity",children:"Assign an identity"}),e.jsxs(t.p,{children:["Select ",e.jsx(t.strong,{children:"Assign Identity"})," and the existing certificate with ",e.jsx(t.code,{children:"CN=device-001"}),". Check its serial number, issuer and validity against the certificate you verified in PKI."]}),e.jsxs(t.p,{children:["Confirm the association. The ",e.jsx(t.strong,{children:"Issue New Instead"})," alternative is explained in ",e.jsx(t.a,{href:"/docs/platform/iot-fleets/device-management#assign-an-identity-manually",children:"Devices and identities"}),"."]})]}),e.jsxs(n,{children:[e.jsx(t.h3,{id:"verify-the-device",children:"Verify the device"}),e.jsxs(t.p,{children:["Check that it has an active identity. In ",e.jsx(t.strong,{children:"Certificate History"}),", verify the associated serial number; in ",e.jsx(t.strong,{children:"Device Event Timeline"}),", find the assignment event."]}),e.jsx(t.p,{children:"Keep the device identifier, owning DMS and serial number as references for the result."})]})]}),`
`,e.jsx(t.h2,{id:"expected-result",children:"Expected result"}),`
`,e.jsxs(t.table,{children:[e.jsx(t.thead,{children:e.jsxs(t.tr,{children:[e.jsx(t.th,{children:"Check"}),e.jsx(t.th,{children:"Result"})]})}),e.jsxs(t.tbody,{children:[e.jsxs(t.tr,{children:[e.jsx(t.td,{children:"Device"}),e.jsxs(t.td,{children:[e.jsx(t.code,{children:"device-001"})," appears in inventory with the expected DMS."]})]}),e.jsxs(t.tr,{children:[e.jsx(t.td,{children:"Current identity"}),e.jsx(t.td,{children:"The associated certificate matches the one you verified in PKI."})]}),e.jsxs(t.tr,{children:[e.jsx(t.td,{children:"History"}),e.jsx(t.td,{children:"The associated issuance appears with its serial number and dates."})]}),e.jsxs(t.tr,{children:[e.jsx(t.td,{children:"Key and certificate"}),e.jsx(t.td,{children:"You have the verified pair ready to install on the device."})]})]})]}),`
`,e.jsx(t.h2,{id:"if-the-result-fails",children:"If the result fails"}),`
`,e.jsxs(t.ul,{children:[`
`,e.jsx(t.li,{children:"If you cannot select the DMS, confirm its creation and your read permissions."}),`
`,e.jsxs(t.li,{children:["If no eligible certificate appears, check that its ",e.jsx(t.code,{children:"Common Name"})," matches the ",e.jsx(t.code,{children:"Device ID"})," exactly, it is active and it was issued by the expected CA."]}),`
`,e.jsx(t.li,{children:"If assignment fails, review permissions and operation diagnostics before repeating it. Query the device and its history again to find the persisted result."}),`
`,e.jsxs(t.li,{children:["If an expiration or renewal state appears, check certificate dates and DMS thresholds in ",e.jsx(t.a,{href:"/docs/platform/iot-fleets/device-management",children:"Devices and identities"}),"."]}),`
`]}),`
`,e.jsx(t.h2,{id:"automate-the-next-device",children:"Automate the next device"}),`
`,e.jsxs(t.p,{children:["Continue with ",e.jsx(t.a,{href:"/docs/platform/iot-fleets/enrollment/dms",children:"DMS"})," and ",e.jsx(t.a,{href:"/docs/platform/iot-fleets/enrollment/overview",children:"EST"})," for the device to request and renew certificates. Prepare server trust, the initial credential and policies for each operation before implementing the client."]}),`
`,e.jsxs(t.p,{children:["For a path from the client through mTLS, follow ",e.jsx(t.a,{href:"/docs/platform/iot-fleets/quickstarts/enroll-device",children:"Enroll and connect your first device"})," with a new ID."]}),`
`,e.jsxs(t.p,{children:["To use the identity in ",e.jsx(t.a,{href:"/docs/platform/iot-fleets/integrations/aws-iot-core",children:"AWS IoT Core"}),", also prepare trust and permissions in the destination. Check the connection from the device after installing the required key, certificate and chain."]})]})}function l(i={}){const{wrapper:t}=i.components||{};return t?e.jsx(t,{...i,children:e.jsx(a,{...i})}):a(i)}function r(i,t){throw new Error("Expected component `"+i+"` to be defined: you likely forgot to import, pass, or provide it.")}const u=Object.freeze(Object.defineProperty({__proto__:null,_markdown:c,default:l,frontmatter:o,structuredData:d,toc:h},Symbol.toStringTag,{value:"Module"}));export{u as _};

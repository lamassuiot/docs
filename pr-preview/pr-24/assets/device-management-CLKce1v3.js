import{j as e}from"./index-prc0XQdj.js";let l=`

A managed device represents an entity in your fleet and keeps the history of the certificates it has used. Lamassu separates the device from its current identity so you can renew or replace certificates without losing traceability.

Device states [#device-states]

* **Active** indicates the device has a valid identity.
* **No Identity** appears when it is registered but does not yet have an associated certificate.
* **Renewal Pending** signals that it has entered the renewal window.
* **Expiring Soon** warns that the certificate is close to expiring.
* **Expired** indicates the identity has passed its validity date.
* **Revoked** identifies a certificate invalidated before its expiration.
* **Decommissioned** corresponds to a device permanently retired.

The inventory lets you filter by \`Device ID\`, tags and status.

Inspect a device [#inspect-a-device]

The detail view separates two perspectives:

* **Certificate History** keeps every certificate associated with the device, with its serial number, issuer, status and validity period.
* **Device Event Timeline** orders registrations, enrollments, renewals and status changes chronologically.

Use the history for audit and the timeline to reconstruct an incident or diagnose an unexpected transition.

Register a device manually [#register-a-device-manually]

Pre-registration is useful when policy requires the device to exist before requesting its first certificate.

<Steps>
  <Step>
    Create the device [#create-the-device]

    From **Managed Devices**, open the registration form.
  </Step>

  <Step>
    Define its membership [#define-its-membership]

    Enter a unique **Device ID** and select the DMS that will apply the enrollment and renewal policies.
  </Step>

  <Step>
    Classify the device [#classify-the-device]

    Add an icon and tags if you need to group devices by model, location, environment or another operational criterion.
  </Step>

  <Step>
    Verify the registration [#verify-the-registration]

    The device should appear with status **No Identity** until it completes enrollment or receives a manually assigned identity.
  </Step>
</Steps>

Assign an identity manually [#assign-an-identity-manually]

The **Assign Identity** action is available while the device remains in **No Identity**.

1. Open the device and select **Assign Identity**.
2. Choose an active certificate whose \`Common Name\` matches the \`Device ID\`.
3. If none exists, select **Issue New Instead** and choose a CA linked to the DMS.
4. Confirm the assignment.

The device should change to **Active** and the certificate should appear in its history.

Revoke the current identity [#revoke-the-current-identity]

In **Device Event Timeline**, locate the latest active certificate and select **Revoke**. Choose a reason consistent with your policy and confirm the operation.

Revocation invalidates the certificate but does not delete the device. You can restore its operation by assigning it a new identity. \`CertificateHold\` allows reactivating the retained certificate; all other reasons are final.

Decommission a device [#decommission-a-device]

<Callout type="warn" title="Decommission is irreversible">
  This action revokes all the device's certificates and prevents it from obtaining an identity again.
</Callout>

Use **Decommission** only when the device has stopped operating or is no longer trustworthy. After confirming, Lamassu revokes the active identity with \`CessationOfOperation\` and changes the status to **Decommissioned**.

Automate enrollment [#automate-enrollment]

<Cards>
  <Card title="Configure a DMS" description="Define the CA, trust and policies of the fleet." href="/docs/platform/pki/device-enrollment" />

  <Card title="Integrate EST" description="Let the device request and renew its identity." href="/docs/platform/pki/est-enrollment" />

  <div className="lm-diff-ins lm-diff-block">
    <Card title="Integrate CMP" description="Let the device enroll and renew its identity with CMP." href="/docs/platform/pki/cmp" />
  </div>
</Cards>
`,h={title:"Devices and identities",description:"Register devices and control their identities throughout the lifecycle.",sidebar:{group:"Gestión de flotas"}},v={isNew:!1,changes:1,title:void 0,description:void 0},m={contents:[{heading:void 0,content:"A managed device represents an entity in your fleet and keeps the history of the certificates it has used. Lamassu separates the device from its current identity so you can renew or replace certificates without losing traceability."},{heading:"device-states",content:"**Active** indicates the device has a valid identity."},{heading:"device-states",content:"**No Identity** appears when it is registered but does not yet have an associated certificate."},{heading:"device-states",content:"**Renewal Pending** signals that it has entered the renewal window."},{heading:"device-states",content:"**Expiring Soon** warns that the certificate is close to expiring."},{heading:"device-states",content:"**Expired** indicates the identity has passed its validity date."},{heading:"device-states",content:"**Revoked** identifies a certificate invalidated before its expiration."},{heading:"device-states",content:"**Decommissioned** corresponds to a device permanently retired."},{heading:"device-states",content:"The inventory lets you filter by `Device ID`, tags and status."},{heading:"inspect-a-device",content:"The detail view separates two perspectives:"},{heading:"inspect-a-device",content:"**Certificate History** keeps every certificate associated with the device, with its serial number, issuer, status and validity period."},{heading:"inspect-a-device",content:"**Device Event Timeline** orders registrations, enrollments, renewals and status changes chronologically."},{heading:"inspect-a-device",content:"Use the history for audit and the timeline to reconstruct an incident or diagnose an unexpected transition."},{heading:"register-a-device-manually",content:"Pre-registration is useful when policy requires the device to exist before requesting its first certificate."},{heading:"create-the-device",content:"From **Managed Devices**, open the registration form."},{heading:"define-its-membership",content:"Enter a unique **Device ID** and select the DMS that will apply the enrollment and renewal policies."},{heading:"classify-the-device",content:"Add an icon and tags if you need to group devices by model, location, environment or another operational criterion."},{heading:"verify-the-registration",content:"The device should appear with status **No Identity** until it completes enrollment or receives a manually assigned identity."},{heading:"assign-an-identity-manually",content:"The **Assign Identity** action is available while the device remains in **No Identity**."},{heading:"assign-an-identity-manually",content:"Open the device and select **Assign Identity**."},{heading:"assign-an-identity-manually",content:"Choose an active certificate whose `Common Name` matches the `Device ID`."},{heading:"assign-an-identity-manually",content:"If none exists, select **Issue New Instead** and choose a CA linked to the DMS."},{heading:"assign-an-identity-manually",content:"Confirm the assignment."},{heading:"assign-an-identity-manually",content:"The device should change to **Active** and the certificate should appear in its history."},{heading:"revoke-the-current-identity",content:"In **Device Event Timeline**, locate the latest active certificate and select **Revoke**. Choose a reason consistent with your policy and confirm the operation."},{heading:"revoke-the-current-identity",content:"Revocation invalidates the certificate but does not delete the device. You can restore its operation by assigning it a new identity. `CertificateHold` allows reactivating the retained certificate; all other reasons are final."},{heading:"decommission-a-device",content:"This action revokes all the device's certificates and prevents it from obtaining an identity again."},{heading:"decommission-a-device",content:"Use **Decommission** only when the device has stopped operating or is no longer trustworthy. After confirming, Lamassu revokes the active identity with `CessationOfOperation` and changes the status to **Decommissioned**."},{heading:"automate-enrollment",content:'<Card title="Configure a DMS" description="Define the CA, trust and policies of the fleet." href="/docs/platform/pki/device-enrollment" />'},{heading:"automate-enrollment",content:'<Card title="Integrate EST" description="Let the device request and renew its identity." href="/docs/platform/pki/est-enrollment" />'},{heading:"automate-enrollment",content:'<Card title="Integrate CMP" description="Let the device enroll and renew its identity with CMP." href="/docs/platform/pki/cmp" />'}],headings:[{id:"device-states",content:"Device states"},{id:"inspect-a-device",content:"Inspect a device"},{id:"register-a-device-manually",content:"Register a device manually"},{id:"create-the-device",content:"Create the device"},{id:"define-its-membership",content:"Define its membership"},{id:"classify-the-device",content:"Classify the device"},{id:"verify-the-registration",content:"Verify the registration"},{id:"assign-an-identity-manually",content:"Assign an identity manually"},{id:"revoke-the-current-identity",content:"Revoke the current identity"},{id:"decommission-a-device",content:"Decommission a device"},{id:"automate-enrollment",content:"Automate enrollment"}]};const p=[{depth:2,url:"#device-states",title:e.jsx(e.Fragment,{children:"Device states"})},{depth:2,url:"#inspect-a-device",title:e.jsx(e.Fragment,{children:"Inspect a device"})},{depth:2,url:"#register-a-device-manually",title:e.jsx(e.Fragment,{children:"Register a device manually"})},{depth:3,url:"#create-the-device",title:e.jsx(e.Fragment,{children:"Create the device"})},{depth:3,url:"#define-its-membership",title:e.jsx(e.Fragment,{children:"Define its membership"})},{depth:3,url:"#classify-the-device",title:e.jsx(e.Fragment,{children:"Classify the device"})},{depth:3,url:"#verify-the-registration",title:e.jsx(e.Fragment,{children:"Verify the registration"})},{depth:2,url:"#assign-an-identity-manually",title:e.jsx(e.Fragment,{children:"Assign an identity manually"})},{depth:2,url:"#revoke-the-current-identity",title:e.jsx(e.Fragment,{children:"Revoke the current identity"})},{depth:2,url:"#decommission-a-device",title:e.jsx(e.Fragment,{children:"Decommission a device"})},{depth:2,url:"#automate-enrollment",title:e.jsx(e.Fragment,{children:"Automate enrollment"})}];function c(i){const t={code:"code",div:"div",h2:"h2",h3:"h3",li:"li",ol:"ol",p:"p",strong:"strong",ul:"ul",...i.components},{Callout:r,Card:a,Cards:o,Step:n,Steps:d}=t;return r||s("Callout"),a||s("Card"),o||s("Cards"),n||s("Step"),d||s("Steps"),e.jsxs(e.Fragment,{children:[e.jsx(t.p,{children:"A managed device represents an entity in your fleet and keeps the history of the certificates it has used. Lamassu separates the device from its current identity so you can renew or replace certificates without losing traceability."}),`
`,e.jsx(t.h2,{id:"device-states",children:"Device states"}),`
`,e.jsxs(t.ul,{children:[`
`,e.jsxs(t.li,{children:[e.jsx(t.strong,{children:"Active"})," indicates the device has a valid identity."]}),`
`,e.jsxs(t.li,{children:[e.jsx(t.strong,{children:"No Identity"})," appears when it is registered but does not yet have an associated certificate."]}),`
`,e.jsxs(t.li,{children:[e.jsx(t.strong,{children:"Renewal Pending"})," signals that it has entered the renewal window."]}),`
`,e.jsxs(t.li,{children:[e.jsx(t.strong,{children:"Expiring Soon"})," warns that the certificate is close to expiring."]}),`
`,e.jsxs(t.li,{children:[e.jsx(t.strong,{children:"Expired"})," indicates the identity has passed its validity date."]}),`
`,e.jsxs(t.li,{children:[e.jsx(t.strong,{children:"Revoked"})," identifies a certificate invalidated before its expiration."]}),`
`,e.jsxs(t.li,{children:[e.jsx(t.strong,{children:"Decommissioned"})," corresponds to a device permanently retired."]}),`
`]}),`
`,e.jsxs(t.p,{children:["The inventory lets you filter by ",e.jsx(t.code,{children:"Device ID"}),", tags and status."]}),`
`,e.jsx(t.h2,{id:"inspect-a-device",children:"Inspect a device"}),`
`,e.jsx(t.p,{children:"The detail view separates two perspectives:"}),`
`,e.jsxs(t.ul,{children:[`
`,e.jsxs(t.li,{children:[e.jsx(t.strong,{children:"Certificate History"})," keeps every certificate associated with the device, with its serial number, issuer, status and validity period."]}),`
`,e.jsxs(t.li,{children:[e.jsx(t.strong,{children:"Device Event Timeline"})," orders registrations, enrollments, renewals and status changes chronologically."]}),`
`]}),`
`,e.jsx(t.p,{children:"Use the history for audit and the timeline to reconstruct an incident or diagnose an unexpected transition."}),`
`,e.jsx(t.h2,{id:"register-a-device-manually",children:"Register a device manually"}),`
`,e.jsx(t.p,{children:"Pre-registration is useful when policy requires the device to exist before requesting its first certificate."}),`
`,e.jsxs(d,{children:[e.jsxs(n,{children:[e.jsx(t.h3,{id:"create-the-device",children:"Create the device"}),e.jsxs(t.p,{children:["From ",e.jsx(t.strong,{children:"Managed Devices"}),", open the registration form."]})]}),e.jsxs(n,{children:[e.jsx(t.h3,{id:"define-its-membership",children:"Define its membership"}),e.jsxs(t.p,{children:["Enter a unique ",e.jsx(t.strong,{children:"Device ID"})," and select the DMS that will apply the enrollment and renewal policies."]})]}),e.jsxs(n,{children:[e.jsx(t.h3,{id:"classify-the-device",children:"Classify the device"}),e.jsx(t.p,{children:"Add an icon and tags if you need to group devices by model, location, environment or another operational criterion."})]}),e.jsxs(n,{children:[e.jsx(t.h3,{id:"verify-the-registration",children:"Verify the registration"}),e.jsxs(t.p,{children:["The device should appear with status ",e.jsx(t.strong,{children:"No Identity"})," until it completes enrollment or receives a manually assigned identity."]})]})]}),`
`,e.jsx(t.h2,{id:"assign-an-identity-manually",children:"Assign an identity manually"}),`
`,e.jsxs(t.p,{children:["The ",e.jsx(t.strong,{children:"Assign Identity"})," action is available while the device remains in ",e.jsx(t.strong,{children:"No Identity"}),"."]}),`
`,e.jsxs(t.ol,{children:[`
`,e.jsxs(t.li,{children:["Open the device and select ",e.jsx(t.strong,{children:"Assign Identity"}),"."]}),`
`,e.jsxs(t.li,{children:["Choose an active certificate whose ",e.jsx(t.code,{children:"Common Name"})," matches the ",e.jsx(t.code,{children:"Device ID"}),"."]}),`
`,e.jsxs(t.li,{children:["If none exists, select ",e.jsx(t.strong,{children:"Issue New Instead"})," and choose a CA linked to the DMS."]}),`
`,e.jsx(t.li,{children:"Confirm the assignment."}),`
`]}),`
`,e.jsxs(t.p,{children:["The device should change to ",e.jsx(t.strong,{children:"Active"})," and the certificate should appear in its history."]}),`
`,e.jsx(t.h2,{id:"revoke-the-current-identity",children:"Revoke the current identity"}),`
`,e.jsxs(t.p,{children:["In ",e.jsx(t.strong,{children:"Device Event Timeline"}),", locate the latest active certificate and select ",e.jsx(t.strong,{children:"Revoke"}),". Choose a reason consistent with your policy and confirm the operation."]}),`
`,e.jsxs(t.p,{children:["Revocation invalidates the certificate but does not delete the device. You can restore its operation by assigning it a new identity. ",e.jsx(t.code,{children:"CertificateHold"})," allows reactivating the retained certificate; all other reasons are final."]}),`
`,e.jsx(t.h2,{id:"decommission-a-device",children:"Decommission a device"}),`
`,e.jsx(r,{type:"warn",title:"Decommission is irreversible",children:e.jsx(t.p,{children:"This action revokes all the device's certificates and prevents it from obtaining an identity again."})}),`
`,e.jsxs(t.p,{children:["Use ",e.jsx(t.strong,{children:"Decommission"})," only when the device has stopped operating or is no longer trustworthy. After confirming, Lamassu revokes the active identity with ",e.jsx(t.code,{children:"CessationOfOperation"})," and changes the status to ",e.jsx(t.strong,{children:"Decommissioned"}),"."]}),`
`,e.jsx(t.h2,{id:"automate-enrollment",children:"Automate enrollment"}),`
`,e.jsxs(o,{children:[e.jsx(a,{title:"Configure a DMS",description:"Define the CA, trust and policies of the fleet.",href:"/docs/platform/pki/device-enrollment"}),e.jsx(a,{title:"Integrate EST",description:"Let the device request and renew its identity.",href:"/docs/platform/pki/est-enrollment"}),e.jsx(t.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(a,{title:"Integrate CMP",description:"Let the device enroll and renew its identity with CMP.",href:"/docs/platform/pki/cmp"})})]})]})}function g(i={}){const{wrapper:t}=i.components||{};return t?e.jsx(t,{...i,children:e.jsx(c,{...i})}):c(i)}function s(i,t){throw new Error("Expected component `"+i+"` to be defined: you likely forgot to import, pass, or provide it.")}const y=Object.freeze(Object.defineProperty({__proto__:null,_markdown:l,default:g,frontmatter:h,lmDiff:v,structuredData:m,toc:p},Symbol.toStringTag,{value:"Module"}));export{y as _};

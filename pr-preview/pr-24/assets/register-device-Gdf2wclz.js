import{j as e}from"./index-prc0XQdj.js";let o=`

In this quickstart you will manually register a device and assign it its first certificate. It is the shortest path to understanding how Lamassu relates a physical entity to its identity history.

Before you begin [#before-you-begin]

* A configured DMS.
* A CA associated with the DMS.
* A unique identifier for the device.

<Steps>
  <Step>
    Register the device [#register-the-device]

    Open **Managed Devices**, select the action to register a device and complete:

    * **Device ID**: unique identifier of the device.
    * **Registration Authority**: the DMS that will apply the enrollment policies.
    * **Icon** and **Tags**: optional classification to locate it later.
  </Step>

  <Step>
    Check the initial status [#check-the-initial-status]

    Open the newly created device. It should appear with status **No Identity**: it exists in the inventory but does not yet have an associated certificate.
  </Step>

  <Step>
    Assign an identity [#assign-an-identity]

    Select **Assign Identity**. Lamassu will search for active certificates whose \`Common Name\` matches the \`Device ID\`.

    Select an existing certificate or use **Issue New Instead** to issue one from a CA linked to the DMS.
  </Step>

  <Step>
    Verify the device [#verify-the-device]

    After confirming, the status should change to **Active**. Review **Certificate History** to check the associated identity and **Device Event Timeline** to see the assignment event.
  </Step>
</Steps>

Automate the next device [#automate-the-next-device]

Manual registration helps you understand the model, but a fleet should use automated enrollment. Continue with [Device Management Service](/docs/platform/pki/device-enrollment) and the [EST integration](/docs/platform/pki/est-enrollment)<ins className="lm-diff-ins"> or </ins>[<ins className="lm-diff-ins">CMP</ins>](/docs/platform/pki/cmp).
`,r={title:"Register your first device",description:"Add a device to Lamassu and assign it an active identity."},d={isNew:!1,changes:1,title:void 0,description:void 0},h={contents:[{heading:void 0,content:"In this quickstart you will manually register a device and assign it its first certificate. It is the shortest path to understanding how Lamassu relates a physical entity to its identity history."},{heading:"before-you-begin",content:"A configured DMS."},{heading:"before-you-begin",content:"A CA associated with the DMS."},{heading:"before-you-begin",content:"A unique identifier for the device."},{heading:"register-the-device",content:"Open **Managed Devices**, select the action to register a device and complete:"},{heading:"register-the-device",content:"**Device ID**: unique identifier of the device."},{heading:"register-the-device",content:"**Registration Authority**: the DMS that will apply the enrollment policies."},{heading:"register-the-device",content:"**Icon** and **Tags**: optional classification to locate it later."},{heading:"check-the-initial-status",content:"Open the newly created device. It should appear with status **No Identity**: it exists in the inventory but does not yet have an associated certificate."},{heading:"assign-an-identity",content:"Select **Assign Identity**. Lamassu will search for active certificates whose `Common Name` matches the `Device ID`."},{heading:"assign-an-identity",content:"Select an existing certificate or use **Issue New Instead** to issue one from a CA linked to the DMS."},{heading:"verify-the-device",content:"After confirming, the status should change to **Active**. Review **Certificate History** to check the associated identity and **Device Event Timeline** to see the assignment event."},{heading:"automate-the-next-device",content:"Manual registration helps you understand the model, but a fleet should use automated enrollment. Continue with Device Management Service and the EST integration or CMP."}],headings:[{id:"before-you-begin",content:"Before you begin"},{id:"register-the-device",content:"Register the device"},{id:"check-the-initial-status",content:"Check the initial status"},{id:"assign-an-identity",content:"Assign an identity"},{id:"verify-the-device",content:"Verify the device"},{id:"automate-the-next-device",content:"Automate the next device"}]};const l=[{depth:2,url:"#before-you-begin",title:e.jsx(e.Fragment,{children:"Before you begin"})},{depth:3,url:"#register-the-device",title:e.jsx(e.Fragment,{children:"Register the device"})},{depth:3,url:"#check-the-initial-status",title:e.jsx(e.Fragment,{children:"Check the initial status"})},{depth:3,url:"#assign-an-identity",title:e.jsx(e.Fragment,{children:"Assign an identity"})},{depth:3,url:"#verify-the-device",title:e.jsx(e.Fragment,{children:"Verify the device"})},{depth:2,url:"#automate-the-next-device",title:e.jsx(e.Fragment,{children:"Automate the next device"})}];function a(i){const t={a:"a",code:"code",h2:"h2",h3:"h3",ins:"ins",li:"li",p:"p",strong:"strong",ul:"ul",...i.components},{Step:n,Steps:s}=t;return n||c("Step"),s||c("Steps"),e.jsxs(e.Fragment,{children:[e.jsx(t.p,{children:"In this quickstart you will manually register a device and assign it its first certificate. It is the shortest path to understanding how Lamassu relates a physical entity to its identity history."}),`
`,e.jsx(t.h2,{id:"before-you-begin",children:"Before you begin"}),`
`,e.jsxs(t.ul,{children:[`
`,e.jsx(t.li,{children:"A configured DMS."}),`
`,e.jsx(t.li,{children:"A CA associated with the DMS."}),`
`,e.jsx(t.li,{children:"A unique identifier for the device."}),`
`]}),`
`,e.jsxs(s,{children:[e.jsxs(n,{children:[e.jsx(t.h3,{id:"register-the-device",children:"Register the device"}),e.jsxs(t.p,{children:["Open ",e.jsx(t.strong,{children:"Managed Devices"}),", select the action to register a device and complete:"]}),e.jsxs(t.ul,{children:[`
`,e.jsxs(t.li,{children:[e.jsx(t.strong,{children:"Device ID"}),": unique identifier of the device."]}),`
`,e.jsxs(t.li,{children:[e.jsx(t.strong,{children:"Registration Authority"}),": the DMS that will apply the enrollment policies."]}),`
`,e.jsxs(t.li,{children:[e.jsx(t.strong,{children:"Icon"})," and ",e.jsx(t.strong,{children:"Tags"}),": optional classification to locate it later."]}),`
`]})]}),e.jsxs(n,{children:[e.jsx(t.h3,{id:"check-the-initial-status",children:"Check the initial status"}),e.jsxs(t.p,{children:["Open the newly created device. It should appear with status ",e.jsx(t.strong,{children:"No Identity"}),": it exists in the inventory but does not yet have an associated certificate."]})]}),e.jsxs(n,{children:[e.jsx(t.h3,{id:"assign-an-identity",children:"Assign an identity"}),e.jsxs(t.p,{children:["Select ",e.jsx(t.strong,{children:"Assign Identity"}),". Lamassu will search for active certificates whose ",e.jsx(t.code,{children:"Common Name"})," matches the ",e.jsx(t.code,{children:"Device ID"}),"."]}),e.jsxs(t.p,{children:["Select an existing certificate or use ",e.jsx(t.strong,{children:"Issue New Instead"})," to issue one from a CA linked to the DMS."]})]}),e.jsxs(n,{children:[e.jsx(t.h3,{id:"verify-the-device",children:"Verify the device"}),e.jsxs(t.p,{children:["After confirming, the status should change to ",e.jsx(t.strong,{children:"Active"}),". Review ",e.jsx(t.strong,{children:"Certificate History"})," to check the associated identity and ",e.jsx(t.strong,{children:"Device Event Timeline"})," to see the assignment event."]})]})]}),`
`,e.jsx(t.h2,{id:"automate-the-next-device",children:"Automate the next device"}),`
`,e.jsxs(t.p,{children:["Manual registration helps you understand the model, but a fleet should use automated enrollment. Continue with ",e.jsx(t.a,{href:"/docs/platform/pki/device-enrollment",children:"Device Management Service"})," and the ",e.jsx(t.a,{href:"/docs/platform/pki/est-enrollment",children:"EST integration"}),e.jsx(t.ins,{className:"lm-diff-ins",children:" or "}),e.jsx(t.a,{href:"/docs/platform/pki/cmp",children:e.jsx(t.ins,{className:"lm-diff-ins",children:"CMP"})}),"."]})]})}function u(i={}){const{wrapper:t}=i.components||{};return t?e.jsx(t,{...i,children:e.jsx(a,{...i})}):a(i)}function c(i,t){throw new Error("Expected component `"+i+"` to be defined: you likely forgot to import, pass, or provide it.")}const f=Object.freeze(Object.defineProperty({__proto__:null,_markdown:o,default:u,frontmatter:r,lmDiff:d,structuredData:h,toc:l},Symbol.toStringTag,{value:"Module"}));export{f as _};

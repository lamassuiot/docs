import{j as e}from"./index-prc0XQdj.js";let r=`

Subscriptions turn Lamassu events into actionable notifications. You can alert a team, feed an incident system or trigger an automation when a CA, certificate or device changes.

How it works [#how-it-works]

1. A service publishes a domain event.
2. Lamassu evaluates the subscriptions associated with that event type.
3. Each subscription's filter decides whether it should be notified.
4. Lamassu delivers the event to the configured channel.

The event inventory shows when each type was last observed, how many times it has occurred and how many subscriptions it has. You can expand an event to inspect an example of its JSON payload before creating the filter.

Available channels [#available-channels]

* **Email** sends alerts to a person or an operational list. It only requires the destination address.
* **Microsoft Teams** posts the notification to a channel through its webhook URL.
* **Webhook** delivers the event to an automation, SIEM or incident system via \`POST\` or \`PUT\`.

Create a subscription [#create-a-subscription]

<Steps>
  <Step>
    Choose the event [#choose-the-event]

    Open **Alerts**, locate the event type and select **Subscribe**. Review the latest JSON example to identify the fields you will need to filter on.
  </Step>

  <Step>
    Configure the destination [#configure-the-destination]

    Select Email, Microsoft Teams or Webhook and enter the channel details.
  </Step>

  <Step>
    Limit the notifications [#limit-the-notifications]

    Add a filter if you don't want to receive every instance of the event.

    * **None** notifies all instances of the event.
    * **JSON Path** evaluates one or more specific fields.
    * **JSON Schema** accepts only payloads with a particular structure.
    * **JavaScript** lets you express custom logic.

    For example, \`function (event) { return event.data.status == "NO_IDENTITY"; }\` limits a subscription to devices without an identity.
  </Step>

  <Step>
    Review and activate [#review-and-activate]

    Check the event, channel and filter in the summary. Select **Confirm Subscription** to start delivery.
  </Step>
</Steps>

Manage a subscription [#manage-a-subscription]

Open an existing subscription to review its destination and filter, modify the configuration or select **Unsubscribe**. Remove subscriptions that no longer have an operational owner to avoid ignored deliveries or stale endpoints.

Event families [#event-families]

* **Authorities:** \`ca.create\`, \`ca.import\`, \`ca.reissue\` and \`ca.delete\`.
* **Certificates:** \`ca.sign.certificate\` and \`certificate.delete\`.
* **Profiles:** \`profile.create\`, \`profile.update\` and \`profile.delete\`.
* **Enrollment:** \`dms.create\`, \`dms.update\`, \`dms.enroll\` and \`dms.reenroll\`.
* **Devices:** \`device.create\`, \`device.identity.update\` and \`device.status.update\`.
* **Validation:** \`va.role.crl.create\`.
* **Keys:** \`kms.create\`, \`kms.import\`, \`kms.sign.message\` and \`kms.delete\`.

Use the catalog shown in the console as the source for the types available in your deployed version.
`,c={title:"Alerts and subscriptions",description:"Send PKI events to people and external systems.",sidebar:{group:"Otros"}},l={contents:[{heading:void 0,content:"Subscriptions turn Lamassu events into actionable notifications. You can alert a team, feed an incident system or trigger an automation when a CA, certificate or device changes."},{heading:"how-it-works",content:"A service publishes a domain event."},{heading:"how-it-works",content:"Lamassu evaluates the subscriptions associated with that event type."},{heading:"how-it-works",content:"Each subscription's filter decides whether it should be notified."},{heading:"how-it-works",content:"Lamassu delivers the event to the configured channel."},{heading:"how-it-works",content:"The event inventory shows when each type was last observed, how many times it has occurred and how many subscriptions it has. You can expand an event to inspect an example of its JSON payload before creating the filter."},{heading:"available-channels",content:"**Email** sends alerts to a person or an operational list. It only requires the destination address."},{heading:"available-channels",content:"**Microsoft Teams** posts the notification to a channel through its webhook URL."},{heading:"available-channels",content:"**Webhook** delivers the event to an automation, SIEM or incident system via `POST` or `PUT`."},{heading:"choose-the-event",content:"Open **Alerts**, locate the event type and select **Subscribe**. Review the latest JSON example to identify the fields you will need to filter on."},{heading:"configure-the-destination",content:"Select Email, Microsoft Teams or Webhook and enter the channel details."},{heading:"limit-the-notifications",content:"Add a filter if you don't want to receive every instance of the event."},{heading:"limit-the-notifications",content:"**None** notifies all instances of the event."},{heading:"limit-the-notifications",content:"**JSON Path** evaluates one or more specific fields."},{heading:"limit-the-notifications",content:"**JSON Schema** accepts only payloads with a particular structure."},{heading:"limit-the-notifications",content:"**JavaScript** lets you express custom logic."},{heading:"limit-the-notifications",content:'For example, `function (event) { return event.data.status == "NO_IDENTITY"; }` limits a subscription to devices without an identity.'},{heading:"review-and-activate",content:"Check the event, channel and filter in the summary. Select **Confirm Subscription** to start delivery."},{heading:"manage-a-subscription",content:"Open an existing subscription to review its destination and filter, modify the configuration or select **Unsubscribe**. Remove subscriptions that no longer have an operational owner to avoid ignored deliveries or stale endpoints."},{heading:"event-families",content:"**Authorities:** `ca.create`, `ca.import`, `ca.reissue` and `ca.delete`."},{heading:"event-families",content:"**Certificates:** `ca.sign.certificate` and `certificate.delete`."},{heading:"event-families",content:"**Profiles:** `profile.create`, `profile.update` and `profile.delete`."},{heading:"event-families",content:"**Enrollment:** `dms.create`, `dms.update`, `dms.enroll` and `dms.reenroll`."},{heading:"event-families",content:"**Devices:** `device.create`, `device.identity.update` and `device.status.update`."},{heading:"event-families",content:"**Validation:** `va.role.crl.create`."},{heading:"event-families",content:"**Keys:** `kms.create`, `kms.import`, `kms.sign.message` and `kms.delete`."},{heading:"event-families",content:"Use the catalog shown in the console as the source for the types available in your deployed version."}],headings:[{id:"how-it-works",content:"How it works"},{id:"available-channels",content:"Available channels"},{id:"create-a-subscription",content:"Create a subscription"},{id:"choose-the-event",content:"Choose the event"},{id:"configure-the-destination",content:"Configure the destination"},{id:"limit-the-notifications",content:"Limit the notifications"},{id:"review-and-activate",content:"Review and activate"},{id:"manage-a-subscription",content:"Manage a subscription"},{id:"event-families",content:"Event families"}]};const d=[{depth:2,url:"#how-it-works",title:e.jsx(e.Fragment,{children:"How it works"})},{depth:2,url:"#available-channels",title:e.jsx(e.Fragment,{children:"Available channels"})},{depth:2,url:"#create-a-subscription",title:e.jsx(e.Fragment,{children:"Create a subscription"})},{depth:3,url:"#choose-the-event",title:e.jsx(e.Fragment,{children:"Choose the event"})},{depth:3,url:"#configure-the-destination",title:e.jsx(e.Fragment,{children:"Configure the destination"})},{depth:3,url:"#limit-the-notifications",title:e.jsx(e.Fragment,{children:"Limit the notifications"})},{depth:3,url:"#review-and-activate",title:e.jsx(e.Fragment,{children:"Review and activate"})},{depth:2,url:"#manage-a-subscription",title:e.jsx(e.Fragment,{children:"Manage a subscription"})},{depth:2,url:"#event-families",title:e.jsx(e.Fragment,{children:"Event families"})}];function a(n){const t={code:"code",h2:"h2",h3:"h3",li:"li",ol:"ol",p:"p",strong:"strong",ul:"ul",...n.components},{Step:i,Steps:s}=t;return i||o("Step"),s||o("Steps"),e.jsxs(e.Fragment,{children:[e.jsx(t.p,{children:"Subscriptions turn Lamassu events into actionable notifications. You can alert a team, feed an incident system or trigger an automation when a CA, certificate or device changes."}),`
`,e.jsx(t.h2,{id:"how-it-works",children:"How it works"}),`
`,e.jsxs(t.ol,{children:[`
`,e.jsx(t.li,{children:"A service publishes a domain event."}),`
`,e.jsx(t.li,{children:"Lamassu evaluates the subscriptions associated with that event type."}),`
`,e.jsx(t.li,{children:"Each subscription's filter decides whether it should be notified."}),`
`,e.jsx(t.li,{children:"Lamassu delivers the event to the configured channel."}),`
`]}),`
`,e.jsx(t.p,{children:"The event inventory shows when each type was last observed, how many times it has occurred and how many subscriptions it has. You can expand an event to inspect an example of its JSON payload before creating the filter."}),`
`,e.jsx(t.h2,{id:"available-channels",children:"Available channels"}),`
`,e.jsxs(t.ul,{children:[`
`,e.jsxs(t.li,{children:[e.jsx(t.strong,{children:"Email"})," sends alerts to a person or an operational list. It only requires the destination address."]}),`
`,e.jsxs(t.li,{children:[e.jsx(t.strong,{children:"Microsoft Teams"})," posts the notification to a channel through its webhook URL."]}),`
`,e.jsxs(t.li,{children:[e.jsx(t.strong,{children:"Webhook"})," delivers the event to an automation, SIEM or incident system via ",e.jsx(t.code,{children:"POST"})," or ",e.jsx(t.code,{children:"PUT"}),"."]}),`
`]}),`
`,e.jsx(t.h2,{id:"create-a-subscription",children:"Create a subscription"}),`
`,e.jsxs(s,{children:[e.jsxs(i,{children:[e.jsx(t.h3,{id:"choose-the-event",children:"Choose the event"}),e.jsxs(t.p,{children:["Open ",e.jsx(t.strong,{children:"Alerts"}),", locate the event type and select ",e.jsx(t.strong,{children:"Subscribe"}),". Review the latest JSON example to identify the fields you will need to filter on."]})]}),e.jsxs(i,{children:[e.jsx(t.h3,{id:"configure-the-destination",children:"Configure the destination"}),e.jsx(t.p,{children:"Select Email, Microsoft Teams or Webhook and enter the channel details."})]}),e.jsxs(i,{children:[e.jsx(t.h3,{id:"limit-the-notifications",children:"Limit the notifications"}),e.jsx(t.p,{children:"Add a filter if you don't want to receive every instance of the event."}),e.jsxs(t.ul,{children:[`
`,e.jsxs(t.li,{children:[e.jsx(t.strong,{children:"None"})," notifies all instances of the event."]}),`
`,e.jsxs(t.li,{children:[e.jsx(t.strong,{children:"JSON Path"})," evaluates one or more specific fields."]}),`
`,e.jsxs(t.li,{children:[e.jsx(t.strong,{children:"JSON Schema"})," accepts only payloads with a particular structure."]}),`
`,e.jsxs(t.li,{children:[e.jsx(t.strong,{children:"JavaScript"})," lets you express custom logic."]}),`
`]}),e.jsxs(t.p,{children:["For example, ",e.jsx(t.code,{children:'function (event) { return event.data.status == "NO_IDENTITY"; }'})," limits a subscription to devices without an identity."]})]}),e.jsxs(i,{children:[e.jsx(t.h3,{id:"review-and-activate",children:"Review and activate"}),e.jsxs(t.p,{children:["Check the event, channel and filter in the summary. Select ",e.jsx(t.strong,{children:"Confirm Subscription"})," to start delivery."]})]})]}),`
`,e.jsx(t.h2,{id:"manage-a-subscription",children:"Manage a subscription"}),`
`,e.jsxs(t.p,{children:["Open an existing subscription to review its destination and filter, modify the configuration or select ",e.jsx(t.strong,{children:"Unsubscribe"}),". Remove subscriptions that no longer have an operational owner to avoid ignored deliveries or stale endpoints."]}),`
`,e.jsx(t.h2,{id:"event-families",children:"Event families"}),`
`,e.jsxs(t.ul,{children:[`
`,e.jsxs(t.li,{children:[e.jsx(t.strong,{children:"Authorities:"})," ",e.jsx(t.code,{children:"ca.create"}),", ",e.jsx(t.code,{children:"ca.import"}),", ",e.jsx(t.code,{children:"ca.reissue"})," and ",e.jsx(t.code,{children:"ca.delete"}),"."]}),`
`,e.jsxs(t.li,{children:[e.jsx(t.strong,{children:"Certificates:"})," ",e.jsx(t.code,{children:"ca.sign.certificate"})," and ",e.jsx(t.code,{children:"certificate.delete"}),"."]}),`
`,e.jsxs(t.li,{children:[e.jsx(t.strong,{children:"Profiles:"})," ",e.jsx(t.code,{children:"profile.create"}),", ",e.jsx(t.code,{children:"profile.update"})," and ",e.jsx(t.code,{children:"profile.delete"}),"."]}),`
`,e.jsxs(t.li,{children:[e.jsx(t.strong,{children:"Enrollment:"})," ",e.jsx(t.code,{children:"dms.create"}),", ",e.jsx(t.code,{children:"dms.update"}),", ",e.jsx(t.code,{children:"dms.enroll"})," and ",e.jsx(t.code,{children:"dms.reenroll"}),"."]}),`
`,e.jsxs(t.li,{children:[e.jsx(t.strong,{children:"Devices:"})," ",e.jsx(t.code,{children:"device.create"}),", ",e.jsx(t.code,{children:"device.identity.update"})," and ",e.jsx(t.code,{children:"device.status.update"}),"."]}),`
`,e.jsxs(t.li,{children:[e.jsx(t.strong,{children:"Validation:"})," ",e.jsx(t.code,{children:"va.role.crl.create"}),"."]}),`
`,e.jsxs(t.li,{children:[e.jsx(t.strong,{children:"Keys:"})," ",e.jsx(t.code,{children:"kms.create"}),", ",e.jsx(t.code,{children:"kms.import"}),", ",e.jsx(t.code,{children:"kms.sign.message"})," and ",e.jsx(t.code,{children:"kms.delete"}),"."]}),`
`]}),`
`,e.jsx(t.p,{children:"Use the catalog shown in the console as the source for the types available in your deployed version."})]})}function h(n={}){const{wrapper:t}=n.components||{};return t?e.jsx(t,{...n,children:e.jsx(a,{...n})}):a(n)}function o(n,t){throw new Error("Expected component `"+n+"` to be defined: you likely forgot to import, pass, or provide it.")}const p=Object.freeze(Object.defineProperty({__proto__:null,_markdown:r,default:h,frontmatter:c,structuredData:l,toc:d},Symbol.toStringTag,{value:"Module"}));export{p as _};

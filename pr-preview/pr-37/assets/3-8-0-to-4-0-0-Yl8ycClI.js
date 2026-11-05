import{j as e}from"./index-prc0XQdj.js";let l=`

<div className="lm-diff-ins lm-diff-block">
  Upgrading from 3.8.0 to 4.0.0 automatically migrates stored DMS configuration. Most of it converts without intervention, but three changes can leave enrollments failing or configs holding unexpected values if they are not reviewed. This page states what changes, what symptoms to expect and what to do in each case. Current behavior of each feature is documented in the [DMS](/docs/platform/iot-fleets/enrollment/dms) pages.
</div>

<div className="lm-diff-ins lm-diff-block">
  Summary [#summary]
</div>

<div className="lm-diff-ins lm-diff-block">
  | Change                                                                                | Who is affected                                                   | Severity                                                            | Action                                                         |
  | ------------------------------------------------------------------------------------- | ----------------------------------------------------------------- | ------------------------------------------------------------------- | -------------------------------------------------------------- |
  | [Webhooks with file references](#webhooks-with-file-references)                       | DMSs with a webhook whose mTLS certificate or key were file paths | High: enrollments and re-enrollments calling the webhook fail       | Re-enter certificate and key as PEM, or remove the file fields |
  | [Receiver certificate verification](#receiver-certificate-verification)               | DMSs with a webhook that had \`validate_server_cert: false\`        | Medium: webhook credentials are sent to an unverified receiver      | Set \`insecure_skip_verify\` to \`false\`                          |
  | [Re-enrollment trust set](#re-enrollment-trust-set)                                   | Scripts and consoles that edit DMSs through the API               | Medium: an edit in the old layout silently empties \`validation_cas\` | Read the DMS before editing and use the new field              |
  | [Independent re-enrollment authentication](#independent-re-enrollment-authentication) | Any DMS                                                           | Low: informational                                                  | Read both blocks before editing                                |
</div>

<div className="lm-diff-ins lm-diff-block">
  A [verification checklist](#verification-checklist) at the end confirms the result.
</div>

<div className="lm-diff-ins lm-diff-block">
  DMS webhooks [#dms-webhooks]
</div>

<div className="lm-diff-ins lm-diff-block">
  Stored webhook configs are rewritten to the current layout. Fields are renamed as follows:
</div>

<div className="lm-diff-ins lm-diff-block">
  | Field in 3.8.0         | Field in 4.0.0                         |
  | ---------------------- | -------------------------------------- |
  | \`validate_server_cert\` | \`insecure_skip_verify\` (value negated) |
  | \`oidc\`                 | \`jwt_options\`                          |
  | \`apikey\`               | \`apikey_options\`                       |
  | \`mtls\`                 | \`mtls_options\`                         |
</div>

<div className="lm-diff-ins lm-diff-block">
  When the legacy mTLS certificate and key are both PEM, they move into \`mtls_options.cert_content\` and \`mtls_options.key_content\` and need no action. The two cases below do need it.
</div>

<div className="lm-diff-ins lm-diff-block">
  Webhooks with file references [#webhooks-with-file-references]
</div>

<div className="lm-diff-ins lm-diff-block">
  A mixed config, with a PEM certificate and a file-path key, is migrated to \`mtls_options.cert_file\` and \`mtls_options.key_file\`. Webhook delivery rejects those fields, and does so on every call, whatever the configured authentication mode. As a result, every enroll and re-enroll that calls that webhook fails until the config is fixed.
</div>

<div className="lm-diff-ins lm-diff-block">
  There are two ways to fix it, depending on the webhook:
</div>

<div className="lm-diff-ins lm-diff-block">
  * If the webhook uses mTLS, re-enter the certificate and key as Base64-encoded or plain PEM.
  * If the webhook does not use mTLS, remove the leftover file fields.
</div>

<div className="lm-diff-ins lm-diff-block">
  Metadata-only updates keep working in the meantime (\`PUT\` or \`PATCH\` on \`/v1/dms/:id/metadata\`).
</div>

<div className="lm-diff-ins lm-diff-block">
  A variant of the same problem exists: if the stored config holds file paths inside \`mtls_options.cert_content\` or \`mtls_options.key_content\`, every full settings update (\`POST /v1/dms\` or \`PUT /v1/dms/:id\`) fails validation. Settings are replaced wholesale, so the stored config must be resent with the certificate and key as PEM.
</div>

<div className="lm-diff-ins lm-diff-block">
  Receiver certificate verification [#receiver-certificate-verification]
</div>

<div className="lm-diff-ins lm-diff-block">
  A config with \`validate_server_cert: false\` becomes \`insecure_skip_verify: true\`. Receiver certificate verification therefore stays skipped until that field is set to \`false\`.
</div>

<div className="lm-diff-ins lm-diff-block">
  It should be corrected on every migrated config. The webhook authorization channel carries the API key or bearer token, so skipping verification exposes those credentials to a network-positioned attacker. Keeping \`insecure_skip_verify: true\` is only justified when the receiver certificate is deliberately unverifiable.
</div>

<div className="lm-diff-ins lm-diff-block">
  Re-enrollment trust set [#re-enrollment-trust-set]
</div>

<div className="lm-diff-ins lm-diff-block">
  The flat field \`reenrollment_settings.additional_validation_cas\` moves into the nested field \`reenrollment_settings.est_rfc7030_settings.client_certificate_settings.validation_cas\`.
</div>

<div className="lm-diff-ins lm-diff-block">
  \`\`\`json
  {
    "reenrollment_settings": {
      "est_rfc7030_settings": {
        "client_certificate_settings": {
          "validation_cas": ["<CA_ID>"]
        }
      }
    }
  }
  \`\`\`
</div>

<div className="lm-diff-ins lm-diff-block">
  The effective trust set does not change, because the nested value was never consulted when validating re-enrollments. If the flat list was missing or null, it becomes an empty list.
</div>

<div className="lm-diff-ins lm-diff-block">
  What does change is how API requests are handled. Bodies that still carry \`additional_validation_cas\` are accepted, but the value is silently ignored because unknown JSON fields are dropped, and GET responses no longer include it. Consequently, an update body built from the old layout empties \`validation_cas\` without returning any error. To avoid it, always read the DMS before sending an edit and reuse the layout the API returns.
</div>

<div className="lm-diff-ins lm-diff-block">
  Independent re-enrollment authentication [#independent-re-enrollment-authentication]
</div>

<div className="lm-diff-ins lm-diff-block">
  Re-enrollment authentication settings are now stored independently from initial authentication. Nothing needs migrating, but both blocks should be read before editing a DMS so that one is not modified while believing the other is being edited.
</div>

<div className="lm-diff-ins lm-diff-block">
  If the console version does not expose independent settings, they can be edited through the [DMS API](/docs/api-reference/dms-manager).
</div>

<div className="lm-diff-ins lm-diff-block">
  Verification checklist [#verification-checklist]
</div>

<div className="lm-diff-ins lm-diff-block">
  After applying the upgrade, check in this order:
</div>

<div className="lm-diff-ins lm-diff-block">
  1. **Webhooks without file fields.** List the DMSs that use a webhook for enrollment or re-enrollment and confirm each \`config\` block carries \`insecure_skip_verify\` and the expected option block (\`apikey_options\`, \`jwt_options\` or \`mtls_options\`), with the certificate and key as PEM and no \`cert_file\` or \`key_file\`.
  2. **Receiver verification.** Confirm \`insecure_skip_verify\` is \`false\`, unless the receiver certificate is intentionally unverified.
  3. **Delivery.** Trigger, or wait for, one enroll or re-enroll through each migrated webhook and confirm the authorization call completes.
  4. **Trust set.** Read \`est_rfc7030_settings.client_certificate_settings.validation_cas\` and confirm it holds the expected CAs, in particular those of the old CA during rotation overlaps.
  5. **API clients.** Update any script or console that uses the old DMS layout (flat \`additional_validation_cas\`, or the legacy \`mtls\`, \`apikey\` and \`oidc\` fields), since they silently drop those values.
</div>

<div className="lm-diff-ins lm-diff-block">
  <Cards>
    <Card title="Configure a DMS" href="/docs/platform/iot-fleets/enrollment/dms" />

    <Card title="DMS API" href="/docs/api-reference/dms-manager" />
  </Cards>
</div>
`,a={title:"3.8.0 to 4.0.0",description:"4.0.0 changes that affect DMS configuration, what can break after upgrading from 3.8.0, and how to verify it."},d={isNew:!0,changes:29,title:void 0,description:void 0},c={contents:[{heading:void 0,content:"Upgrading from 3.8.0 to 4.0.0 automatically migrates stored DMS configuration. Most of it converts without intervention, but three changes can leave enrollments failing or configs holding unexpected values if they are not reviewed. This page states what changes, what symptoms to expect and what to do in each case. Current behavior of each feature is documented in the DMS pages."},{heading:"summary",content:"Change"},{heading:"summary",content:"Who is affected"},{heading:"summary",content:"Severity"},{heading:"summary",content:"Action"},{heading:"summary",content:"Webhooks with file references"},{heading:"summary",content:"DMSs with a webhook whose mTLS certificate or key were file paths"},{heading:"summary",content:"High: enrollments and re-enrollments calling the webhook fail"},{heading:"summary",content:"Re-enter certificate and key as PEM, or remove the file fields"},{heading:"summary",content:"Receiver certificate verification"},{heading:"summary",content:"DMSs with a webhook that had `validate_server_cert: false`"},{heading:"summary",content:"Medium: webhook credentials are sent to an unverified receiver"},{heading:"summary",content:"Set `insecure_skip_verify` to `false`"},{heading:"summary",content:"Re-enrollment trust set"},{heading:"summary",content:"Scripts and consoles that edit DMSs through the API"},{heading:"summary",content:"Medium: an edit in the old layout silently empties `validation_cas`"},{heading:"summary",content:"Read the DMS before editing and use the new field"},{heading:"summary",content:"Independent re-enrollment authentication"},{heading:"summary",content:"Any DMS"},{heading:"summary",content:"Low: informational"},{heading:"summary",content:"Read both blocks before editing"},{heading:"summary",content:"A verification checklist at the end confirms the result."},{heading:"dms-webhooks",content:"Stored webhook configs are rewritten to the current layout. Fields are renamed as follows:"},{heading:"dms-webhooks",content:"Field in 3.8.0"},{heading:"dms-webhooks",content:"Field in 4.0.0"},{heading:"dms-webhooks",content:"`validate_server_cert`"},{heading:"dms-webhooks",content:"`insecure_skip_verify` (value negated)"},{heading:"dms-webhooks",content:"`oidc`"},{heading:"dms-webhooks",content:"`jwt_options`"},{heading:"dms-webhooks",content:"`apikey`"},{heading:"dms-webhooks",content:"`apikey_options`"},{heading:"dms-webhooks",content:"`mtls`"},{heading:"dms-webhooks",content:"`mtls_options`"},{heading:"dms-webhooks",content:"When the legacy mTLS certificate and key are both PEM, they move into `mtls_options.cert_content` and `mtls_options.key_content` and need no action. The two cases below do need it."},{heading:"webhooks-with-file-references",content:"A mixed config, with a PEM certificate and a file-path key, is migrated to `mtls_options.cert_file` and `mtls_options.key_file`. Webhook delivery rejects those fields, and does so on every call, whatever the configured authentication mode. As a result, every enroll and re-enroll that calls that webhook fails until the config is fixed."},{heading:"webhooks-with-file-references",content:"There are two ways to fix it, depending on the webhook:"},{heading:"webhooks-with-file-references",content:"If the webhook uses mTLS, re-enter the certificate and key as Base64-encoded or plain PEM."},{heading:"webhooks-with-file-references",content:"If the webhook does not use mTLS, remove the leftover file fields."},{heading:"webhooks-with-file-references",content:"Metadata-only updates keep working in the meantime (`PUT` or `PATCH` on `/v1/dms/:id/metadata`)."},{heading:"webhooks-with-file-references",content:"A variant of the same problem exists: if the stored config holds file paths inside `mtls_options.cert_content` or `mtls_options.key_content`, every full settings update (`POST /v1/dms` or `PUT /v1/dms/:id`) fails validation. Settings are replaced wholesale, so the stored config must be resent with the certificate and key as PEM."},{heading:"receiver-certificate-verification",content:"A config with `validate_server_cert: false` becomes `insecure_skip_verify: true`. Receiver certificate verification therefore stays skipped until that field is set to `false`."},{heading:"receiver-certificate-verification",content:"It should be corrected on every migrated config. The webhook authorization channel carries the API key or bearer token, so skipping verification exposes those credentials to a network-positioned attacker. Keeping `insecure_skip_verify: true` is only justified when the receiver certificate is deliberately unverifiable."},{heading:"re-enrollment-trust-set",content:"The flat field `reenrollment_settings.additional_validation_cas` moves into the nested field `reenrollment_settings.est_rfc7030_settings.client_certificate_settings.validation_cas`."},{heading:"re-enrollment-trust-set",content:"The effective trust set does not change, because the nested value was never consulted when validating re-enrollments. If the flat list was missing or null, it becomes an empty list."},{heading:"re-enrollment-trust-set",content:"What does change is how API requests are handled. Bodies that still carry `additional_validation_cas` are accepted, but the value is silently ignored because unknown JSON fields are dropped, and GET responses no longer include it. Consequently, an update body built from the old layout empties `validation_cas` without returning any error. To avoid it, always read the DMS before sending an edit and reuse the layout the API returns."},{heading:"independent-re-enrollment-authentication",content:"Re-enrollment authentication settings are now stored independently from initial authentication. Nothing needs migrating, but both blocks should be read before editing a DMS so that one is not modified while believing the other is being edited."},{heading:"independent-re-enrollment-authentication",content:"If the console version does not expose independent settings, they can be edited through the DMS API."},{heading:"verification-checklist",content:"After applying the upgrade, check in this order:"},{heading:"verification-checklist",content:"**Webhooks without file fields.** List the DMSs that use a webhook for enrollment or re-enrollment and confirm each `config` block carries `insecure_skip_verify` and the expected option block (`apikey_options`, `jwt_options` or `mtls_options`), with the certificate and key as PEM and no `cert_file` or `key_file`."},{heading:"verification-checklist",content:"**Receiver verification.** Confirm `insecure_skip_verify` is `false`, unless the receiver certificate is intentionally unverified."},{heading:"verification-checklist",content:"**Delivery.** Trigger, or wait for, one enroll or re-enroll through each migrated webhook and confirm the authorization call completes."},{heading:"verification-checklist",content:"**Trust set.** Read `est_rfc7030_settings.client_certificate_settings.validation_cas` and confirm it holds the expected CAs, in particular those of the old CA during rotation overlaps."},{heading:"verification-checklist",content:"**API clients.** Update any script or console that uses the old DMS layout (flat `additional_validation_cas`, or the legacy `mtls`, `apikey` and `oidc` fields), since they silently drop those values."},{heading:"verification-checklist",content:'<Card title="Configure a DMS" href="/docs/platform/iot-fleets/enrollment/dms" />'},{heading:"verification-checklist",content:'<Card title="DMS API" href="/docs/api-reference/dms-manager" />'}],headings:[{id:"summary",content:"Summary"},{id:"dms-webhooks",content:"DMS webhooks"},{id:"webhooks-with-file-references",content:"Webhooks with file references"},{id:"receiver-certificate-verification",content:"Receiver certificate verification"},{id:"re-enrollment-trust-set",content:"Re-enrollment trust set"},{id:"independent-re-enrollment-authentication",content:"Independent re-enrollment authentication"},{id:"verification-checklist",content:"Verification checklist"}]};const h=[{depth:2,url:"#summary",title:e.jsx(e.Fragment,{children:"Summary"})},{depth:2,url:"#dms-webhooks",title:e.jsx(e.Fragment,{children:"DMS webhooks"})},{depth:3,url:"#webhooks-with-file-references",title:e.jsx(e.Fragment,{children:"Webhooks with file references"})},{depth:3,url:"#receiver-certificate-verification",title:e.jsx(e.Fragment,{children:"Receiver certificate verification"})},{depth:2,url:"#re-enrollment-trust-set",title:e.jsx(e.Fragment,{children:"Re-enrollment trust set"})},{depth:2,url:"#independent-re-enrollment-authentication",title:e.jsx(e.Fragment,{children:"Independent re-enrollment authentication"})},{depth:2,url:"#verification-checklist",title:e.jsx(e.Fragment,{children:"Verification checklist"})}];function o(t){const i={a:"a",code:"code",div:"div",h2:"h2",h3:"h3",li:"li",ol:"ol",p:"p",pre:"pre",span:"span",strong:"strong",table:"table",tbody:"tbody",td:"td",th:"th",thead:"thead",tr:"tr",ul:"ul",...t.components},{Card:n,Cards:s}=i;return n||r("Card"),s||r("Cards"),e.jsxs(e.Fragment,{children:[e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsxs(i.p,{children:["Upgrading from 3.8.0 to 4.0.0 automatically migrates stored DMS configuration. Most of it converts without intervention, but three changes can leave enrollments failing or configs holding unexpected values if they are not reviewed. This page states what changes, what symptoms to expect and what to do in each case. Current behavior of each feature is documented in the ",e.jsx(i.a,{href:"/docs/platform/iot-fleets/enrollment/dms",children:"DMS"})," pages."]})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(i.h2,{id:"summary",children:"Summary"})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsxs(i.table,{children:[e.jsx(i.thead,{children:e.jsxs(i.tr,{children:[e.jsx(i.th,{children:"Change"}),e.jsx(i.th,{children:"Who is affected"}),e.jsx(i.th,{children:"Severity"}),e.jsx(i.th,{children:"Action"})]})}),e.jsxs(i.tbody,{children:[e.jsxs(i.tr,{children:[e.jsx(i.td,{children:e.jsx(i.a,{href:"#webhooks-with-file-references",children:"Webhooks with file references"})}),e.jsx(i.td,{children:"DMSs with a webhook whose mTLS certificate or key were file paths"}),e.jsx(i.td,{children:"High: enrollments and re-enrollments calling the webhook fail"}),e.jsx(i.td,{children:"Re-enter certificate and key as PEM, or remove the file fields"})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{children:e.jsx(i.a,{href:"#receiver-certificate-verification",children:"Receiver certificate verification"})}),e.jsxs(i.td,{children:["DMSs with a webhook that had ",e.jsx(i.code,{children:"validate_server_cert: false"})]}),e.jsx(i.td,{children:"Medium: webhook credentials are sent to an unverified receiver"}),e.jsxs(i.td,{children:["Set ",e.jsx(i.code,{children:"insecure_skip_verify"})," to ",e.jsx(i.code,{children:"false"})]})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{children:e.jsx(i.a,{href:"#re-enrollment-trust-set",children:"Re-enrollment trust set"})}),e.jsx(i.td,{children:"Scripts and consoles that edit DMSs through the API"}),e.jsxs(i.td,{children:["Medium: an edit in the old layout silently empties ",e.jsx(i.code,{children:"validation_cas"})]}),e.jsx(i.td,{children:"Read the DMS before editing and use the new field"})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{children:e.jsx(i.a,{href:"#independent-re-enrollment-authentication",children:"Independent re-enrollment authentication"})}),e.jsx(i.td,{children:"Any DMS"}),e.jsx(i.td,{children:"Low: informational"}),e.jsx(i.td,{children:"Read both blocks before editing"})]})]})]})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsxs(i.p,{children:["A ",e.jsx(i.a,{href:"#verification-checklist",children:"verification checklist"})," at the end confirms the result."]})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(i.h2,{id:"dms-webhooks",children:"DMS webhooks"})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(i.p,{children:"Stored webhook configs are rewritten to the current layout. Fields are renamed as follows:"})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsxs(i.table,{children:[e.jsx(i.thead,{children:e.jsxs(i.tr,{children:[e.jsx(i.th,{children:"Field in 3.8.0"}),e.jsx(i.th,{children:"Field in 4.0.0"})]})}),e.jsxs(i.tbody,{children:[e.jsxs(i.tr,{children:[e.jsx(i.td,{children:e.jsx(i.code,{children:"validate_server_cert"})}),e.jsxs(i.td,{children:[e.jsx(i.code,{children:"insecure_skip_verify"})," (value negated)"]})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{children:e.jsx(i.code,{children:"oidc"})}),e.jsx(i.td,{children:e.jsx(i.code,{children:"jwt_options"})})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{children:e.jsx(i.code,{children:"apikey"})}),e.jsx(i.td,{children:e.jsx(i.code,{children:"apikey_options"})})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{children:e.jsx(i.code,{children:"mtls"})}),e.jsx(i.td,{children:e.jsx(i.code,{children:"mtls_options"})})]})]})]})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsxs(i.p,{children:["When the legacy mTLS certificate and key are both PEM, they move into ",e.jsx(i.code,{children:"mtls_options.cert_content"})," and ",e.jsx(i.code,{children:"mtls_options.key_content"})," and need no action. The two cases below do need it."]})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(i.h3,{id:"webhooks-with-file-references",children:"Webhooks with file references"})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsxs(i.p,{children:["A mixed config, with a PEM certificate and a file-path key, is migrated to ",e.jsx(i.code,{children:"mtls_options.cert_file"})," and ",e.jsx(i.code,{children:"mtls_options.key_file"}),". Webhook delivery rejects those fields, and does so on every call, whatever the configured authentication mode. As a result, every enroll and re-enroll that calls that webhook fails until the config is fixed."]})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(i.p,{children:"There are two ways to fix it, depending on the webhook:"})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsxs(i.ul,{children:[`
`,e.jsx(i.li,{children:"If the webhook uses mTLS, re-enter the certificate and key as Base64-encoded or plain PEM."}),`
`,e.jsx(i.li,{children:"If the webhook does not use mTLS, remove the leftover file fields."}),`
`]})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsxs(i.p,{children:["Metadata-only updates keep working in the meantime (",e.jsx(i.code,{children:"PUT"})," or ",e.jsx(i.code,{children:"PATCH"})," on ",e.jsx(i.code,{children:"/v1/dms/:id/metadata"}),")."]})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsxs(i.p,{children:["A variant of the same problem exists: if the stored config holds file paths inside ",e.jsx(i.code,{children:"mtls_options.cert_content"})," or ",e.jsx(i.code,{children:"mtls_options.key_content"}),", every full settings update (",e.jsx(i.code,{children:"POST /v1/dms"})," or ",e.jsx(i.code,{children:"PUT /v1/dms/:id"}),") fails validation. Settings are replaced wholesale, so the stored config must be resent with the certificate and key as PEM."]})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(i.h3,{id:"receiver-certificate-verification",children:"Receiver certificate verification"})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsxs(i.p,{children:["A config with ",e.jsx(i.code,{children:"validate_server_cert: false"})," becomes ",e.jsx(i.code,{children:"insecure_skip_verify: true"}),". Receiver certificate verification therefore stays skipped until that field is set to ",e.jsx(i.code,{children:"false"}),"."]})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsxs(i.p,{children:["It should be corrected on every migrated config. The webhook authorization channel carries the API key or bearer token, so skipping verification exposes those credentials to a network-positioned attacker. Keeping ",e.jsx(i.code,{children:"insecure_skip_verify: true"})," is only justified when the receiver certificate is deliberately unverifiable."]})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(i.h2,{id:"re-enrollment-trust-set",children:"Re-enrollment trust set"})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsxs(i.p,{children:["The flat field ",e.jsx(i.code,{children:"reenrollment_settings.additional_validation_cas"})," moves into the nested field ",e.jsx(i.code,{children:"reenrollment_settings.est_rfc7030_settings.client_certificate_settings.validation_cas"}),"."]})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes min-light min-dark",style:{"--shiki-light":"#24292eff","--shiki-dark":"#b392f0","--shiki-light-bg":"#ffffff","--shiki-dark-bg":"#1f1f1f"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(i.code,{children:[e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292EFF","--shiki-dark":"#B392F0"},children:"{"})}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:'  "reenrollment_settings"'}),e.jsx(i.span,{style:{"--shiki-light":"#212121","--shiki-dark":"#BBBBBB"},children:":"}),e.jsx(i.span,{style:{"--shiki-light":"#24292EFF","--shiki-dark":"#B392F0"},children:" {"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:'    "est_rfc7030_settings"'}),e.jsx(i.span,{style:{"--shiki-light":"#212121","--shiki-dark":"#BBBBBB"},children:":"}),e.jsx(i.span,{style:{"--shiki-light":"#24292EFF","--shiki-dark":"#B392F0"},children:" {"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:'      "client_certificate_settings"'}),e.jsx(i.span,{style:{"--shiki-light":"#212121","--shiki-dark":"#BBBBBB"},children:":"}),e.jsx(i.span,{style:{"--shiki-light":"#24292EFF","--shiki-dark":"#B392F0"},children:" {"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:'        "validation_cas"'}),e.jsx(i.span,{style:{"--shiki-light":"#212121","--shiki-dark":"#BBBBBB"},children:":"}),e.jsx(i.span,{style:{"--shiki-light":"#24292EFF","--shiki-dark":"#B392F0"},children:" ["}),e.jsx(i.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#FFAB70"},children:'"<CA_ID>"'}),e.jsx(i.span,{style:{"--shiki-light":"#24292EFF","--shiki-dark":"#B392F0"},children:"]"})]}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292EFF","--shiki-dark":"#B392F0"},children:"      }"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292EFF","--shiki-dark":"#B392F0"},children:"    }"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292EFF","--shiki-dark":"#B392F0"},children:"  }"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292EFF","--shiki-dark":"#B392F0"},children:"}"})})]})})})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(i.p,{children:"The effective trust set does not change, because the nested value was never consulted when validating re-enrollments. If the flat list was missing or null, it becomes an empty list."})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsxs(i.p,{children:["What does change is how API requests are handled. Bodies that still carry ",e.jsx(i.code,{children:"additional_validation_cas"})," are accepted, but the value is silently ignored because unknown JSON fields are dropped, and GET responses no longer include it. Consequently, an update body built from the old layout empties ",e.jsx(i.code,{children:"validation_cas"})," without returning any error. To avoid it, always read the DMS before sending an edit and reuse the layout the API returns."]})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(i.h2,{id:"independent-re-enrollment-authentication",children:"Independent re-enrollment authentication"})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(i.p,{children:"Re-enrollment authentication settings are now stored independently from initial authentication. Nothing needs migrating, but both blocks should be read before editing a DMS so that one is not modified while believing the other is being edited."})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsxs(i.p,{children:["If the console version does not expose independent settings, they can be edited through the ",e.jsx(i.a,{href:"/docs/api-reference/dms-manager",children:"DMS API"}),"."]})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(i.h2,{id:"verification-checklist",children:"Verification checklist"})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(i.p,{children:"After applying the upgrade, check in this order:"})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsxs(i.ol,{children:[`
`,e.jsxs(i.li,{children:[e.jsx(i.strong,{children:"Webhooks without file fields."})," List the DMSs that use a webhook for enrollment or re-enrollment and confirm each ",e.jsx(i.code,{children:"config"})," block carries ",e.jsx(i.code,{children:"insecure_skip_verify"})," and the expected option block (",e.jsx(i.code,{children:"apikey_options"}),", ",e.jsx(i.code,{children:"jwt_options"})," or ",e.jsx(i.code,{children:"mtls_options"}),"), with the certificate and key as PEM and no ",e.jsx(i.code,{children:"cert_file"})," or ",e.jsx(i.code,{children:"key_file"}),"."]}),`
`,e.jsxs(i.li,{children:[e.jsx(i.strong,{children:"Receiver verification."})," Confirm ",e.jsx(i.code,{children:"insecure_skip_verify"})," is ",e.jsx(i.code,{children:"false"}),", unless the receiver certificate is intentionally unverified."]}),`
`,e.jsxs(i.li,{children:[e.jsx(i.strong,{children:"Delivery."})," Trigger, or wait for, one enroll or re-enroll through each migrated webhook and confirm the authorization call completes."]}),`
`,e.jsxs(i.li,{children:[e.jsx(i.strong,{children:"Trust set."})," Read ",e.jsx(i.code,{children:"est_rfc7030_settings.client_certificate_settings.validation_cas"})," and confirm it holds the expected CAs, in particular those of the old CA during rotation overlaps."]}),`
`,e.jsxs(i.li,{children:[e.jsx(i.strong,{children:"API clients."})," Update any script or console that uses the old DMS layout (flat ",e.jsx(i.code,{children:"additional_validation_cas"}),", or the legacy ",e.jsx(i.code,{children:"mtls"}),", ",e.jsx(i.code,{children:"apikey"})," and ",e.jsx(i.code,{children:"oidc"})," fields), since they silently drop those values."]}),`
`]})}),`
`,e.jsx(i.div,{className:"lm-diff-ins lm-diff-block",children:e.jsxs(s,{children:[e.jsx(n,{title:"Configure a DMS",href:"/docs/platform/iot-fleets/enrollment/dms"}),e.jsx(n,{title:"DMS API",href:"/docs/api-reference/dms-manager"})]})})]})}function f(t={}){const{wrapper:i}=t.components||{};return i?e.jsx(i,{...t,children:e.jsx(o,{...t})}):o(t)}function r(t,i){throw new Error("Expected component `"+t+"` to be defined: you likely forgot to import, pass, or provide it.")}const v=Object.freeze(Object.defineProperty({__proto__:null,_markdown:l,default:f,frontmatter:a,lmDiff:d,structuredData:c,toc:h},Symbol.toStringTag,{value:"Module"}));export{v as _};

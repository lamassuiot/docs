import{j as e}from"./index-prc0XQdj.js";let d=`

An issuance profile turns a certificate policy into reusable configuration. Instead of deciding validity, subject, extensions and algorithms on every request, you define once what is allowed and attach the profile to a CA, a DMS or a specific issuance.

This guide is for the PKI administrator defining issuance policy. You need permissions to manage profiles and associate them with the intended CA or DMS, plus a test consumer with known identity and purpose requirements.

What a profile controls [#what-a-profile-controls]

Validity [#validity]

You can express the lifetime as a duration from the moment of issuance or as a fixed end date. A duration works well for recurring identities; a common date is useful to make a whole batch end before a migration or retirement.

Plan the end date within the issuing CA’s validity and leave a renewal margin. The signer calculates the date from the profile; it does not automatically clamp validity to the issuer’s expiration. Check both dates in the resulting certificate. A fixed date in the past does not produce a usable identity either.

CA certificate or end-entity certificate [#ca-certificate-or-end-entity-certificate]

\`Sign as CA\` sets \`IsCA\` and the basic constraints needed for an authority. Enable it only in profiles intended to create or reissue subordinate CAs.

Key Usage and Extended Key Usage [#key-usage-and-extended-key-usage]

The profile can enforce usages such as \`DigitalSignature\`, \`KeyEncipherment\`, \`CertSign\`, \`CRLSign\`, \`ClientAuth\`, \`ServerAuth\` or \`OCSPSigning\`.

If you enable **Honor Key Usage** or **Honor Extended Key Usages**, Lamassu keeps the values requested by the CSR. If you disable them, it replaces them with the ones defined in the profile.

<Callout type="warn" title="Honor means delegating part of the policy">
  Do not enable the \`Honor…\` options for untrusted requests unless another component validates those fields. Otherwise, the requester may choose broader capabilities than intended.
</Callout>

Subject [#subject]

With **Honor Subject**, the certificate keeps the subject of the CSR. Without that option, Lamassu applies the profile's \`CN\`, \`O\`, \`OU\`, \`C\`, \`ST\` and \`L\`. If the profile does not define a \`Common Name\`, the requested CN is kept.

CSR extensions [#csr-extensions]

With **Honor Extensions**, Lamassu filters the additional requested extensions and keeps only SAN. Without that option, it discards the CSR's additional extensions.

This preserves SAN, but does not establish that the requester is entitled to those DNS names, IP addresses, emails or URIs. Validate that authorization before issuing. OCSP and CRL locations come from the issuance service configuration; \`Honor Extensions\` does not copy CSR distribution points.

Cryptographic constraints [#cryptographic-constraints]

The cryptographic enforcement can:

* allow or block RSA keys;
* limit the supported RSA sizes;
* allow or block ECDSA keys;
* limit the supported ECDSA sizes or curves.

When it is enabled, Lamassu checks the public key before creating a CA or signing a CSR. A key whose type or size is not listed in the profile is rejected.

Profile precedence [#profile-precedence]

Resolution depends on the entry point. One complete profile is selected; its fields are not merged with the CA’s profile.

| Operation                | First choice                               | Second choice                                   | If neither is supplied             |
| ------------------------ | ------------------------------------------ | ----------------------------------------------- | ---------------------------------- |
| Direct signing with a CA | \`issuance_profile\` embedded in the request | Request \`issuance_profile_id\`                   | CA default profile (\`profile_id\`). |
| Issuance through a DMS   | \`settings.issuance_profile_id\`             | \`settings.issuance_profile\` embedded in the DMS | Enrollment CA default profile.     |

If the selected identifier cannot be resolved, the operation fails; it does not silently fall back to the CA’s profile. Avoid setting both options at once. Recording which profile was selected helps explain why a certificate differs from its CSR.

Several fleets can share a CA while keeping different profiles through their DMSs. Requester authentication and device registration policy are configured separately in [DMS](/docs/platform/iot-fleets/enrollment/dms).

Create a profile [#create-a-profile]

<Steps>
  <Step>
    Define a single purpose [#define-a-single-purpose]

    Separate, for example, mTLS devices, servers and intermediate CAs. A small, specific profile is easier to review than one that allows every use.
  </Step>

  <Step>
    Choose the validity [#choose-the-validity]

    Align the duration with the fleet's real renewal capacity. Leave margin against the CA's expiration.
  </Step>

  <Step>
    Fix usages and subject [#fix-usages-and-subject]

    For a device that authenticates as a client, the usual starting point is \`DigitalSignature\` and \`ClientAuth\`. Add \`ServerAuth\` or \`KeyEncipherment\` only if the protocol needs it.
  </Step>

  <Step>
    Constrain the keys [#constrain-the-keys]

    Enable cryptographic enforcement and list only algorithms and sizes compatible with your policy and your devices.
  </Step>

  <Step>
    Attach it and test [#attach-it-and-test]

    Attach the profile to a CA or DMS and check the precedence above. Issue a CSR with known usages and SAN; inspect the result with \`openssl x509 -in device.crt -noout -text\`. Check subject, SAN, KU, EKU and dates. For an end-entity identity, disable \`Sign as CA\`, require no \`CA:TRUE\` or \`Certificate Sign\`, and require \`CA:FALSE\` if Basic Constraints is present.

    Also try a key excluded by policy: issuance should fail. Follow the [certificate verification](/docs/platform/pki/quickstarts/issue-certificate) and test acceptance in the intended consumer.
  </Step>
</Steps>

Design examples [#design-examples]

**mTLS device**\\
End-entity certificate, short validity, \`DigitalSignature\`, \`ClientAuth\`, subject controlled by the DMS and SAN allowed when it identifies the device.

**TLS server**\\
End-entity certificate, \`DigitalSignature\`, \`ServerAuth\` and mandatory SAN with the names clients will use.

**Intermediate CA**\\
\`Sign as CA\`, \`CertSign\` and \`CRLSign\`, validity longer than its end-entity certificates and stricter cryptographic constraints.

These patterns express design decisions. Enabling \`Honor Extensions\` does not require a CSR to contain SAN or validate its names; enforce that in the request workflow. A profile does not install trust or grant permissions in the consumer.

Changes and deletion [#changes-and-deletion]

Updating a profile affects future issuances; it does not modify already-signed certificates. Test changes before applying them to a CA in production and keep the operational justification.

Before deleting a profile, check that no CA or DMS depends on it. If you want to replace it, create the new version, update the references and perform a test issuance before retiring the old one.
`,c={title:"Certificate profiles",description:"Define reusable policies to issue consistent certificates and constrain accepted keys.",sidebar:{label:"Certificate profiles"}},l={contents:[{heading:void 0,content:"An issuance profile turns a certificate policy into reusable configuration. Instead of deciding validity, subject, extensions and algorithms on every request, you define once what is allowed and attach the profile to a CA, a DMS or a specific issuance."},{heading:void 0,content:"This guide is for the PKI administrator defining issuance policy. You need permissions to manage profiles and associate them with the intended CA or DMS, plus a test consumer with known identity and purpose requirements."},{heading:"validity",content:"You can express the lifetime as a duration from the moment of issuance or as a fixed end date. A duration works well for recurring identities; a common date is useful to make a whole batch end before a migration or retirement."},{heading:"validity",content:"Plan the end date within the issuing CA’s validity and leave a renewal margin. The signer calculates the date from the profile; it does not automatically clamp validity to the issuer’s expiration. Check both dates in the resulting certificate. A fixed date in the past does not produce a usable identity either."},{heading:"ca-certificate-or-end-entity-certificate",content:"`Sign as CA` sets `IsCA` and the basic constraints needed for an authority. Enable it only in profiles intended to create or reissue subordinate CAs."},{heading:"key-usage-and-extended-key-usage",content:"The profile can enforce usages such as `DigitalSignature`, `KeyEncipherment`, `CertSign`, `CRLSign`, `ClientAuth`, `ServerAuth` or `OCSPSigning`."},{heading:"key-usage-and-extended-key-usage",content:"If you enable **Honor Key Usage** or **Honor Extended Key Usages**, Lamassu keeps the values requested by the CSR. If you disable them, it replaces them with the ones defined in the profile."},{heading:"key-usage-and-extended-key-usage",content:"Do not enable the `Honor…` options for untrusted requests unless another component validates those fields. Otherwise, the requester may choose broader capabilities than intended."},{heading:"subject",content:"With **Honor Subject**, the certificate keeps the subject of the CSR. Without that option, Lamassu applies the profile's `CN`, `O`, `OU`, `C`, `ST` and `L`. If the profile does not define a `Common Name`, the requested CN is kept."},{heading:"csr-extensions",content:"With **Honor Extensions**, Lamassu filters the additional requested extensions and keeps only SAN. Without that option, it discards the CSR's additional extensions."},{heading:"csr-extensions",content:"This preserves SAN, but does not establish that the requester is entitled to those DNS names, IP addresses, emails or URIs. Validate that authorization before issuing. OCSP and CRL locations come from the issuance service configuration; `Honor Extensions` does not copy CSR distribution points."},{heading:"cryptographic-constraints",content:"The cryptographic enforcement can:"},{heading:"cryptographic-constraints",content:"allow or block RSA keys;"},{heading:"cryptographic-constraints",content:"limit the supported RSA sizes;"},{heading:"cryptographic-constraints",content:"allow or block ECDSA keys;"},{heading:"cryptographic-constraints",content:"limit the supported ECDSA sizes or curves."},{heading:"cryptographic-constraints",content:"When it is enabled, Lamassu checks the public key before creating a CA or signing a CSR. A key whose type or size is not listed in the profile is rejected."},{heading:"profile-precedence",content:"Resolution depends on the entry point. One complete profile is selected; its fields are not merged with the CA’s profile."},{heading:"profile-precedence",content:"Operation"},{heading:"profile-precedence",content:"First choice"},{heading:"profile-precedence",content:"Second choice"},{heading:"profile-precedence",content:"If neither is supplied"},{heading:"profile-precedence",content:"Direct signing with a CA"},{heading:"profile-precedence",content:"`issuance_profile` embedded in the request"},{heading:"profile-precedence",content:"Request `issuance_profile_id`"},{heading:"profile-precedence",content:"CA default profile (`profile_id`)."},{heading:"profile-precedence",content:"Issuance through a DMS"},{heading:"profile-precedence",content:"`settings.issuance_profile_id`"},{heading:"profile-precedence",content:"`settings.issuance_profile` embedded in the DMS"},{heading:"profile-precedence",content:"Enrollment CA default profile."},{heading:"profile-precedence",content:"If the selected identifier cannot be resolved, the operation fails; it does not silently fall back to the CA’s profile. Avoid setting both options at once. Recording which profile was selected helps explain why a certificate differs from its CSR."},{heading:"profile-precedence",content:"Several fleets can share a CA while keeping different profiles through their DMSs. Requester authentication and device registration policy are configured separately in DMS."},{heading:"define-a-single-purpose",content:"Separate, for example, mTLS devices, servers and intermediate CAs. A small, specific profile is easier to review than one that allows every use."},{heading:"choose-the-validity",content:"Align the duration with the fleet's real renewal capacity. Leave margin against the CA's expiration."},{heading:"fix-usages-and-subject",content:"For a device that authenticates as a client, the usual starting point is `DigitalSignature` and `ClientAuth`. Add `ServerAuth` or `KeyEncipherment` only if the protocol needs it."},{heading:"constrain-the-keys",content:"Enable cryptographic enforcement and list only algorithms and sizes compatible with your policy and your devices."},{heading:"attach-it-and-test",content:"Attach the profile to a CA or DMS and check the precedence above. Issue a CSR with known usages and SAN; inspect the result with `openssl x509 -in device.crt -noout -text`. Check subject, SAN, KU, EKU and dates. For an end-entity identity, disable `Sign as CA`, require no `CA:TRUE` or `Certificate Sign`, and require `CA:FALSE` if Basic Constraints is present."},{heading:"attach-it-and-test",content:"Also try a key excluded by policy: issuance should fail. Follow the certificate verification and test acceptance in the intended consumer."},{heading:"design-examples",content:"**mTLS device**\\\nEnd-entity certificate, short validity, `DigitalSignature`, `ClientAuth`, subject controlled by the DMS and SAN allowed when it identifies the device."},{heading:"design-examples",content:"**TLS server**\\\nEnd-entity certificate, `DigitalSignature`, `ServerAuth` and mandatory SAN with the names clients will use."},{heading:"design-examples",content:"**Intermediate CA**\\\n`Sign as CA`, `CertSign` and `CRLSign`, validity longer than its end-entity certificates and stricter cryptographic constraints."},{heading:"design-examples",content:"These patterns express design decisions. Enabling `Honor Extensions` does not require a CSR to contain SAN or validate its names; enforce that in the request workflow. A profile does not install trust or grant permissions in the consumer."},{heading:"changes-and-deletion",content:"Updating a profile affects future issuances; it does not modify already-signed certificates. Test changes before applying them to a CA in production and keep the operational justification."},{heading:"changes-and-deletion",content:"Before deleting a profile, check that no CA or DMS depends on it. If you want to replace it, create the new version, update the references and perform a test issuance before retiring the old one."}],headings:[{id:"what-a-profile-controls",content:"What a profile controls"},{id:"validity",content:"Validity"},{id:"ca-certificate-or-end-entity-certificate",content:"CA certificate or end-entity certificate"},{id:"key-usage-and-extended-key-usage",content:"Key Usage and Extended Key Usage"},{id:"subject",content:"Subject"},{id:"csr-extensions",content:"CSR extensions"},{id:"cryptographic-constraints",content:"Cryptographic constraints"},{id:"profile-precedence",content:"Profile precedence"},{id:"create-a-profile",content:"Create a profile"},{id:"define-a-single-purpose",content:"Define a single purpose"},{id:"choose-the-validity",content:"Choose the validity"},{id:"fix-usages-and-subject",content:"Fix usages and subject"},{id:"constrain-the-keys",content:"Constrain the keys"},{id:"attach-it-and-test",content:"Attach it and test"},{id:"design-examples",content:"Design examples"},{id:"changes-and-deletion",content:"Changes and deletion"}]};const h=[{depth:2,url:"#what-a-profile-controls",title:e.jsx(e.Fragment,{children:"What a profile controls"})},{depth:3,url:"#validity",title:e.jsx(e.Fragment,{children:"Validity"})},{depth:3,url:"#ca-certificate-or-end-entity-certificate",title:e.jsx(e.Fragment,{children:"CA certificate or end-entity certificate"})},{depth:3,url:"#key-usage-and-extended-key-usage",title:e.jsx(e.Fragment,{children:"Key Usage and Extended Key Usage"})},{depth:3,url:"#subject",title:e.jsx(e.Fragment,{children:"Subject"})},{depth:3,url:"#csr-extensions",title:e.jsx(e.Fragment,{children:"CSR extensions"})},{depth:3,url:"#cryptographic-constraints",title:e.jsx(e.Fragment,{children:"Cryptographic constraints"})},{depth:2,url:"#profile-precedence",title:e.jsx(e.Fragment,{children:"Profile precedence"})},{depth:2,url:"#create-a-profile",title:e.jsx(e.Fragment,{children:"Create a profile"})},{depth:3,url:"#define-a-single-purpose",title:e.jsx(e.Fragment,{children:"Define a single purpose"})},{depth:3,url:"#choose-the-validity",title:e.jsx(e.Fragment,{children:"Choose the validity"})},{depth:3,url:"#fix-usages-and-subject",title:e.jsx(e.Fragment,{children:"Fix usages and subject"})},{depth:3,url:"#constrain-the-keys",title:e.jsx(e.Fragment,{children:"Constrain the keys"})},{depth:3,url:"#attach-it-and-test",title:e.jsx(e.Fragment,{children:"Attach it and test"})},{depth:2,url:"#design-examples",title:e.jsx(e.Fragment,{children:"Design examples"})},{depth:2,url:"#changes-and-deletion",title:e.jsx(e.Fragment,{children:"Changes and deletion"})}];function o(n){const t={a:"a",br:"br",code:"code",h2:"h2",h3:"h3",li:"li",p:"p",strong:"strong",table:"table",tbody:"tbody",td:"td",th:"th",thead:"thead",tr:"tr",ul:"ul",...n.components},{Callout:a,Step:i,Steps:r}=t;return a||s("Callout"),i||s("Step"),r||s("Steps"),e.jsxs(e.Fragment,{children:[e.jsx(t.p,{children:"An issuance profile turns a certificate policy into reusable configuration. Instead of deciding validity, subject, extensions and algorithms on every request, you define once what is allowed and attach the profile to a CA, a DMS or a specific issuance."}),`
`,e.jsx(t.p,{children:"This guide is for the PKI administrator defining issuance policy. You need permissions to manage profiles and associate them with the intended CA or DMS, plus a test consumer with known identity and purpose requirements."}),`
`,e.jsx(t.h2,{id:"what-a-profile-controls",children:"What a profile controls"}),`
`,e.jsx(t.h3,{id:"validity",children:"Validity"}),`
`,e.jsx(t.p,{children:"You can express the lifetime as a duration from the moment of issuance or as a fixed end date. A duration works well for recurring identities; a common date is useful to make a whole batch end before a migration or retirement."}),`
`,e.jsx(t.p,{children:"Plan the end date within the issuing CA’s validity and leave a renewal margin. The signer calculates the date from the profile; it does not automatically clamp validity to the issuer’s expiration. Check both dates in the resulting certificate. A fixed date in the past does not produce a usable identity either."}),`
`,e.jsx(t.h3,{id:"ca-certificate-or-end-entity-certificate",children:"CA certificate or end-entity certificate"}),`
`,e.jsxs(t.p,{children:[e.jsx(t.code,{children:"Sign as CA"})," sets ",e.jsx(t.code,{children:"IsCA"})," and the basic constraints needed for an authority. Enable it only in profiles intended to create or reissue subordinate CAs."]}),`
`,e.jsx(t.h3,{id:"key-usage-and-extended-key-usage",children:"Key Usage and Extended Key Usage"}),`
`,e.jsxs(t.p,{children:["The profile can enforce usages such as ",e.jsx(t.code,{children:"DigitalSignature"}),", ",e.jsx(t.code,{children:"KeyEncipherment"}),", ",e.jsx(t.code,{children:"CertSign"}),", ",e.jsx(t.code,{children:"CRLSign"}),", ",e.jsx(t.code,{children:"ClientAuth"}),", ",e.jsx(t.code,{children:"ServerAuth"})," or ",e.jsx(t.code,{children:"OCSPSigning"}),"."]}),`
`,e.jsxs(t.p,{children:["If you enable ",e.jsx(t.strong,{children:"Honor Key Usage"})," or ",e.jsx(t.strong,{children:"Honor Extended Key Usages"}),", Lamassu keeps the values requested by the CSR. If you disable them, it replaces them with the ones defined in the profile."]}),`
`,e.jsx(a,{type:"warn",title:"Honor means delegating part of the policy",children:e.jsxs(t.p,{children:["Do not enable the ",e.jsx(t.code,{children:"Honor…"})," options for untrusted requests unless another component validates those fields. Otherwise, the requester may choose broader capabilities than intended."]})}),`
`,e.jsx(t.h3,{id:"subject",children:"Subject"}),`
`,e.jsxs(t.p,{children:["With ",e.jsx(t.strong,{children:"Honor Subject"}),", the certificate keeps the subject of the CSR. Without that option, Lamassu applies the profile's ",e.jsx(t.code,{children:"CN"}),", ",e.jsx(t.code,{children:"O"}),", ",e.jsx(t.code,{children:"OU"}),", ",e.jsx(t.code,{children:"C"}),", ",e.jsx(t.code,{children:"ST"})," and ",e.jsx(t.code,{children:"L"}),". If the profile does not define a ",e.jsx(t.code,{children:"Common Name"}),", the requested CN is kept."]}),`
`,e.jsx(t.h3,{id:"csr-extensions",children:"CSR extensions"}),`
`,e.jsxs(t.p,{children:["With ",e.jsx(t.strong,{children:"Honor Extensions"}),", Lamassu filters the additional requested extensions and keeps only SAN. Without that option, it discards the CSR's additional extensions."]}),`
`,e.jsxs(t.p,{children:["This preserves SAN, but does not establish that the requester is entitled to those DNS names, IP addresses, emails or URIs. Validate that authorization before issuing. OCSP and CRL locations come from the issuance service configuration; ",e.jsx(t.code,{children:"Honor Extensions"})," does not copy CSR distribution points."]}),`
`,e.jsx(t.h3,{id:"cryptographic-constraints",children:"Cryptographic constraints"}),`
`,e.jsx(t.p,{children:"The cryptographic enforcement can:"}),`
`,e.jsxs(t.ul,{children:[`
`,e.jsx(t.li,{children:"allow or block RSA keys;"}),`
`,e.jsx(t.li,{children:"limit the supported RSA sizes;"}),`
`,e.jsx(t.li,{children:"allow or block ECDSA keys;"}),`
`,e.jsx(t.li,{children:"limit the supported ECDSA sizes or curves."}),`
`]}),`
`,e.jsx(t.p,{children:"When it is enabled, Lamassu checks the public key before creating a CA or signing a CSR. A key whose type or size is not listed in the profile is rejected."}),`
`,e.jsx(t.h2,{id:"profile-precedence",children:"Profile precedence"}),`
`,e.jsx(t.p,{children:"Resolution depends on the entry point. One complete profile is selected; its fields are not merged with the CA’s profile."}),`
`,e.jsxs(t.table,{children:[e.jsx(t.thead,{children:e.jsxs(t.tr,{children:[e.jsx(t.th,{children:"Operation"}),e.jsx(t.th,{children:"First choice"}),e.jsx(t.th,{children:"Second choice"}),e.jsx(t.th,{children:"If neither is supplied"})]})}),e.jsxs(t.tbody,{children:[e.jsxs(t.tr,{children:[e.jsx(t.td,{children:"Direct signing with a CA"}),e.jsxs(t.td,{children:[e.jsx(t.code,{children:"issuance_profile"})," embedded in the request"]}),e.jsxs(t.td,{children:["Request ",e.jsx(t.code,{children:"issuance_profile_id"})]}),e.jsxs(t.td,{children:["CA default profile (",e.jsx(t.code,{children:"profile_id"}),")."]})]}),e.jsxs(t.tr,{children:[e.jsx(t.td,{children:"Issuance through a DMS"}),e.jsx(t.td,{children:e.jsx(t.code,{children:"settings.issuance_profile_id"})}),e.jsxs(t.td,{children:[e.jsx(t.code,{children:"settings.issuance_profile"})," embedded in the DMS"]}),e.jsx(t.td,{children:"Enrollment CA default profile."})]})]})]}),`
`,e.jsx(t.p,{children:"If the selected identifier cannot be resolved, the operation fails; it does not silently fall back to the CA’s profile. Avoid setting both options at once. Recording which profile was selected helps explain why a certificate differs from its CSR."}),`
`,e.jsxs(t.p,{children:["Several fleets can share a CA while keeping different profiles through their DMSs. Requester authentication and device registration policy are configured separately in ",e.jsx(t.a,{href:"/docs/platform/iot-fleets/enrollment/dms",children:"DMS"}),"."]}),`
`,e.jsx(t.h2,{id:"create-a-profile",children:"Create a profile"}),`
`,e.jsxs(r,{children:[e.jsxs(i,{children:[e.jsx(t.h3,{id:"define-a-single-purpose",children:"Define a single purpose"}),e.jsx(t.p,{children:"Separate, for example, mTLS devices, servers and intermediate CAs. A small, specific profile is easier to review than one that allows every use."})]}),e.jsxs(i,{children:[e.jsx(t.h3,{id:"choose-the-validity",children:"Choose the validity"}),e.jsx(t.p,{children:"Align the duration with the fleet's real renewal capacity. Leave margin against the CA's expiration."})]}),e.jsxs(i,{children:[e.jsx(t.h3,{id:"fix-usages-and-subject",children:"Fix usages and subject"}),e.jsxs(t.p,{children:["For a device that authenticates as a client, the usual starting point is ",e.jsx(t.code,{children:"DigitalSignature"})," and ",e.jsx(t.code,{children:"ClientAuth"}),". Add ",e.jsx(t.code,{children:"ServerAuth"})," or ",e.jsx(t.code,{children:"KeyEncipherment"})," only if the protocol needs it."]})]}),e.jsxs(i,{children:[e.jsx(t.h3,{id:"constrain-the-keys",children:"Constrain the keys"}),e.jsx(t.p,{children:"Enable cryptographic enforcement and list only algorithms and sizes compatible with your policy and your devices."})]}),e.jsxs(i,{children:[e.jsx(t.h3,{id:"attach-it-and-test",children:"Attach it and test"}),e.jsxs(t.p,{children:["Attach the profile to a CA or DMS and check the precedence above. Issue a CSR with known usages and SAN; inspect the result with ",e.jsx(t.code,{children:"openssl x509 -in device.crt -noout -text"}),". Check subject, SAN, KU, EKU and dates. For an end-entity identity, disable ",e.jsx(t.code,{children:"Sign as CA"}),", require no ",e.jsx(t.code,{children:"CA:TRUE"})," or ",e.jsx(t.code,{children:"Certificate Sign"}),", and require ",e.jsx(t.code,{children:"CA:FALSE"})," if Basic Constraints is present."]}),e.jsxs(t.p,{children:["Also try a key excluded by policy: issuance should fail. Follow the ",e.jsx(t.a,{href:"/docs/platform/pki/quickstarts/issue-certificate",children:"certificate verification"})," and test acceptance in the intended consumer."]})]})]}),`
`,e.jsx(t.h2,{id:"design-examples",children:"Design examples"}),`
`,e.jsxs(t.p,{children:[e.jsx(t.strong,{children:"mTLS device"}),e.jsx(t.br,{}),`
`,"End-entity certificate, short validity, ",e.jsx(t.code,{children:"DigitalSignature"}),", ",e.jsx(t.code,{children:"ClientAuth"}),", subject controlled by the DMS and SAN allowed when it identifies the device."]}),`
`,e.jsxs(t.p,{children:[e.jsx(t.strong,{children:"TLS server"}),e.jsx(t.br,{}),`
`,"End-entity certificate, ",e.jsx(t.code,{children:"DigitalSignature"}),", ",e.jsx(t.code,{children:"ServerAuth"})," and mandatory SAN with the names clients will use."]}),`
`,e.jsxs(t.p,{children:[e.jsx(t.strong,{children:"Intermediate CA"}),e.jsx(t.br,{}),`
`,e.jsx(t.code,{children:"Sign as CA"}),", ",e.jsx(t.code,{children:"CertSign"})," and ",e.jsx(t.code,{children:"CRLSign"}),", validity longer than its end-entity certificates and stricter cryptographic constraints."]}),`
`,e.jsxs(t.p,{children:["These patterns express design decisions. Enabling ",e.jsx(t.code,{children:"Honor Extensions"})," does not require a CSR to contain SAN or validate its names; enforce that in the request workflow. A profile does not install trust or grant permissions in the consumer."]}),`
`,e.jsx(t.h2,{id:"changes-and-deletion",children:"Changes and deletion"}),`
`,e.jsx(t.p,{children:"Updating a profile affects future issuances; it does not modify already-signed certificates. Test changes before applying them to a CA in production and keep the operational justification."}),`
`,e.jsx(t.p,{children:"Before deleting a profile, check that no CA or DMS depends on it. If you want to replace it, create the new version, update the references and perform a test issuance before retiring the old one."})]})}function p(n={}){const{wrapper:t}=n.components||{};return t?e.jsx(t,{...n,children:e.jsx(o,{...n})}):o(n)}function s(n,t){throw new Error("Expected component `"+n+"` to be defined: you likely forgot to import, pass, or provide it.")}const f=Object.freeze(Object.defineProperty({__proto__:null,_markdown:d,default:p,frontmatter:c,structuredData:l,toc:h},Symbol.toStringTag,{value:"Module"}));export{f as _};

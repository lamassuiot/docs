import{j as e}from"./index-prc0XQdj.js";let c=`

The hierarchy determines the blast radius of any error or compromise. A root signs intermediate CAs; intermediates issue the identities used by devices and services. This separation lets you isolate environments and rotate a branch without replacing all trust.

Design the hierarchy [#design-the-hierarchy]

For a production installation, use a very restricted root and one or more operational intermediates. Separate intermediates when any of these boundaries change:

* environment, such as production and preproduction;
* owner or operating team;
* device family or manufacturing process;
* region or regulatory requirement;
* cryptographic engine or key policy;
* maintenance window and renewal cadence.

Avoid deep hierarchies without a concrete need. Each level adds chain distribution, validation and one more certificate you must renew.

<Callout type="warn" title="Validity descends through the hierarchy">
  A child CA and its end-entity certificates must expire before their issuer. Reserve a margin that allows distributing another chain and renewing dependent certificates.
</Callout>

Reissuance and rotation are not the same [#reissuance-and-rotation-are-not-the-same]

**Reissuing a CA** creates a new certificate over the existing key. Lamassu generates a CSR with that key, self-signs it if it is a root or asks the parent CA to sign it if it is subordinate. The new certificate becomes active and the CA points to its serial number; the old and new certificates are linked through metadata.

**Rotating a CA** creates a successor key and authority. It is the right choice in the face of compromise, a cryptographic change, an engine migration or non-exportable key policies.

Lamassu does not allow reissuing an already-revoked CA or a CA whose expiration date has passed. Plan ahead for both conditions.

When to choose each operation [#when-to-choose-each-operation]

* Reissue if the key is still trustworthy and you only need another validity period or an updated certificate.
* Rotate the key if compromise is suspected, the algorithm changes or you want to move custody to another engine.
* Create a parallel branch if you cannot update all consumers at the same time.
* Revoke immediately only when the risk of keeping the CA outweighs the impact of interrupting the fleet.

Key rotation procedure [#key-rotation-procedure]

<Steps>
  <Step>
    Inventory the dependencies [#inventory-the-dependencies]

    Locate child CAs, issued certificates, DMSs, connectors and external trust stores. Include devices that may stay offline for weeks or months.
  </Step>

  <Step>
    Create the successor CA [#create-the-successor-ca]

    Generate a new key in the planned engine, create the CA and assign it an explicit profile. Do not reuse the operational identifier to hide that it is a different generation.
  </Step>

  <Step>
    Distribute the new trust [#distribute-the-new-trust]

    Add the new root or chain to consumers before issuing with it. In a DMS, use the managed CAs of \`/cacerts\` to temporarily keep both the old and new chains.
  </Step>

  <Step>
    Switch issuance [#switch-issuance]

    Update the enrollment CA and profile of the DMSs. Keep the additional validation CAs if old certificates still need to be accepted during re-enrollment.
  </Step>

  <Step>
    Renew in batches [#renew-in-batches]

    Migrate a small cohort, validate mTLS, OCSP and CRL from the consumer and expand progressively. Monitor which devices still present the old chain.
  </Step>

  <Step>
    Close the overlap [#close-the-overlap]

    Once no legitimate consumer depends on the previous authority, remove it from issuance and from the distributed CAs. Revoke it if policy requires it.
  </Step>
</Steps>

Cascading revocation [#cascading-revocation]

When you revoke a CA, Lamassu also updates its child CAs and issued certificates to \`REVOKED\` with the reason \`CessationOfOperation\`. The children's revocations propagate the effect to their own branches.

This protects the coherence of the hierarchy, but it makes revocation a high-impact action. Do not use it as the ordinary mechanism to stop issuing: first complete the migration and remove the CA from operational flows.

Checks after the change [#checks-after-the-change]

* The new chain ends in an anchor installed by the consumer.
* New certificates contain the expected AKI, SKI, KU, EKU and SAN.
* The DMS delivers the correct chain through EST \`/cacerts\`.
* Re-enrollment accepts the old identity during the planned period.
* OCSP and CRL respond for the authorities that remain active.
* No DMS is left accidentally issuing from the old CA.

See the [Trust model](/docs/platform/pki/concepts/trust-model) to understand the DMS's CA sets and [Certificate lifecycle](/docs/platform/pki/concepts/certificate-lifecycle) for states and revocation effects.
`,h={title:"CA hierarchy and rotation",description:"Design root and intermediate authorities and replace certificates or keys without breaking trust.",sidebar:{group:"CA",label:"Hierarchy and rotation"}},d={contents:[{heading:void 0,content:"The hierarchy determines the blast radius of any error or compromise. A root signs intermediate CAs; intermediates issue the identities used by devices and services. This separation lets you isolate environments and rotate a branch without replacing all trust."},{heading:"design-the-hierarchy",content:"For a production installation, use a very restricted root and one or more operational intermediates. Separate intermediates when any of these boundaries change:"},{heading:"design-the-hierarchy",content:"environment, such as production and preproduction;"},{heading:"design-the-hierarchy",content:"owner or operating team;"},{heading:"design-the-hierarchy",content:"device family or manufacturing process;"},{heading:"design-the-hierarchy",content:"region or regulatory requirement;"},{heading:"design-the-hierarchy",content:"cryptographic engine or key policy;"},{heading:"design-the-hierarchy",content:"maintenance window and renewal cadence."},{heading:"design-the-hierarchy",content:"Avoid deep hierarchies without a concrete need. Each level adds chain distribution, validation and one more certificate you must renew."},{heading:"design-the-hierarchy",content:"A child CA and its end-entity certificates must expire before their issuer. Reserve a margin that allows distributing another chain and renewing dependent certificates."},{heading:"reissuance-and-rotation-are-not-the-same",content:"**Reissuing a CA** creates a new certificate over the existing key. Lamassu generates a CSR with that key, self-signs it if it is a root or asks the parent CA to sign it if it is subordinate. The new certificate becomes active and the CA points to its serial number; the old and new certificates are linked through metadata."},{heading:"reissuance-and-rotation-are-not-the-same",content:"**Rotating a CA** creates a successor key and authority. It is the right choice in the face of compromise, a cryptographic change, an engine migration or non-exportable key policies."},{heading:"reissuance-and-rotation-are-not-the-same",content:"Lamassu does not allow reissuing an already-revoked CA or a CA whose expiration date has passed. Plan ahead for both conditions."},{heading:"when-to-choose-each-operation",content:"Reissue if the key is still trustworthy and you only need another validity period or an updated certificate."},{heading:"when-to-choose-each-operation",content:"Rotate the key if compromise is suspected, the algorithm changes or you want to move custody to another engine."},{heading:"when-to-choose-each-operation",content:"Create a parallel branch if you cannot update all consumers at the same time."},{heading:"when-to-choose-each-operation",content:"Revoke immediately only when the risk of keeping the CA outweighs the impact of interrupting the fleet."},{heading:"inventory-the-dependencies",content:"Locate child CAs, issued certificates, DMSs, connectors and external trust stores. Include devices that may stay offline for weeks or months."},{heading:"create-the-successor-ca",content:"Generate a new key in the planned engine, create the CA and assign it an explicit profile. Do not reuse the operational identifier to hide that it is a different generation."},{heading:"distribute-the-new-trust",content:"Add the new root or chain to consumers before issuing with it. In a DMS, use the managed CAs of `/cacerts` to temporarily keep both the old and new chains."},{heading:"switch-issuance",content:"Update the enrollment CA and profile of the DMSs. Keep the additional validation CAs if old certificates still need to be accepted during re-enrollment."},{heading:"renew-in-batches",content:"Migrate a small cohort, validate mTLS, OCSP and CRL from the consumer and expand progressively. Monitor which devices still present the old chain."},{heading:"close-the-overlap",content:"Once no legitimate consumer depends on the previous authority, remove it from issuance and from the distributed CAs. Revoke it if policy requires it."},{heading:"cascading-revocation",content:"When you revoke a CA, Lamassu also updates its child CAs and issued certificates to `REVOKED` with the reason `CessationOfOperation`. The children's revocations propagate the effect to their own branches."},{heading:"cascading-revocation",content:"This protects the coherence of the hierarchy, but it makes revocation a high-impact action. Do not use it as the ordinary mechanism to stop issuing: first complete the migration and remove the CA from operational flows."},{heading:"checks-after-the-change",content:"The new chain ends in an anchor installed by the consumer."},{heading:"checks-after-the-change",content:"New certificates contain the expected AKI, SKI, KU, EKU and SAN."},{heading:"checks-after-the-change",content:"The DMS delivers the correct chain through EST `/cacerts`."},{heading:"checks-after-the-change",content:"Re-enrollment accepts the old identity during the planned period."},{heading:"checks-after-the-change",content:"OCSP and CRL respond for the authorities that remain active."},{heading:"checks-after-the-change",content:"No DMS is left accidentally issuing from the old CA."},{heading:"checks-after-the-change",content:"See the Trust model to understand the DMS's CA sets and Certificate lifecycle for states and revocation effects."}],headings:[{id:"design-the-hierarchy",content:"Design the hierarchy"},{id:"reissuance-and-rotation-are-not-the-same",content:"Reissuance and rotation are not the same"},{id:"when-to-choose-each-operation",content:"When to choose each operation"},{id:"key-rotation-procedure",content:"Key rotation procedure"},{id:"inventory-the-dependencies",content:"Inventory the dependencies"},{id:"create-the-successor-ca",content:"Create the successor CA"},{id:"distribute-the-new-trust",content:"Distribute the new trust"},{id:"switch-issuance",content:"Switch issuance"},{id:"renew-in-batches",content:"Renew in batches"},{id:"close-the-overlap",content:"Close the overlap"},{id:"cascading-revocation",content:"Cascading revocation"},{id:"checks-after-the-change",content:"Checks after the change"}]};const l=[{depth:2,url:"#design-the-hierarchy",title:e.jsx(e.Fragment,{children:"Design the hierarchy"})},{depth:2,url:"#reissuance-and-rotation-are-not-the-same",title:e.jsx(e.Fragment,{children:"Reissuance and rotation are not the same"})},{depth:2,url:"#when-to-choose-each-operation",title:e.jsx(e.Fragment,{children:"When to choose each operation"})},{depth:2,url:"#key-rotation-procedure",title:e.jsx(e.Fragment,{children:"Key rotation procedure"})},{depth:3,url:"#inventory-the-dependencies",title:e.jsx(e.Fragment,{children:"Inventory the dependencies"})},{depth:3,url:"#create-the-successor-ca",title:e.jsx(e.Fragment,{children:"Create the successor CA"})},{depth:3,url:"#distribute-the-new-trust",title:e.jsx(e.Fragment,{children:"Distribute the new trust"})},{depth:3,url:"#switch-issuance",title:e.jsx(e.Fragment,{children:"Switch issuance"})},{depth:3,url:"#renew-in-batches",title:e.jsx(e.Fragment,{children:"Renew in batches"})},{depth:3,url:"#close-the-overlap",title:e.jsx(e.Fragment,{children:"Close the overlap"})},{depth:2,url:"#cascading-revocation",title:e.jsx(e.Fragment,{children:"Cascading revocation"})},{depth:2,url:"#checks-after-the-change",title:e.jsx(e.Fragment,{children:"Checks after the change"})}];function s(n){const t={a:"a",code:"code",h2:"h2",h3:"h3",li:"li",p:"p",strong:"strong",ul:"ul",...n.components},{Callout:r,Step:i,Steps:o}=t;return r||a("Callout"),i||a("Step"),o||a("Steps"),e.jsxs(e.Fragment,{children:[e.jsx(t.p,{children:"The hierarchy determines the blast radius of any error or compromise. A root signs intermediate CAs; intermediates issue the identities used by devices and services. This separation lets you isolate environments and rotate a branch without replacing all trust."}),`
`,e.jsx(t.h2,{id:"design-the-hierarchy",children:"Design the hierarchy"}),`
`,e.jsx(t.p,{children:"For a production installation, use a very restricted root and one or more operational intermediates. Separate intermediates when any of these boundaries change:"}),`
`,e.jsxs(t.ul,{children:[`
`,e.jsx(t.li,{children:"environment, such as production and preproduction;"}),`
`,e.jsx(t.li,{children:"owner or operating team;"}),`
`,e.jsx(t.li,{children:"device family or manufacturing process;"}),`
`,e.jsx(t.li,{children:"region or regulatory requirement;"}),`
`,e.jsx(t.li,{children:"cryptographic engine or key policy;"}),`
`,e.jsx(t.li,{children:"maintenance window and renewal cadence."}),`
`]}),`
`,e.jsx(t.p,{children:"Avoid deep hierarchies without a concrete need. Each level adds chain distribution, validation and one more certificate you must renew."}),`
`,e.jsx(r,{type:"warn",title:"Validity descends through the hierarchy",children:e.jsx(t.p,{children:"A child CA and its end-entity certificates must expire before their issuer. Reserve a margin that allows distributing another chain and renewing dependent certificates."})}),`
`,e.jsx(t.h2,{id:"reissuance-and-rotation-are-not-the-same",children:"Reissuance and rotation are not the same"}),`
`,e.jsxs(t.p,{children:[e.jsx(t.strong,{children:"Reissuing a CA"})," creates a new certificate over the existing key. Lamassu generates a CSR with that key, self-signs it if it is a root or asks the parent CA to sign it if it is subordinate. The new certificate becomes active and the CA points to its serial number; the old and new certificates are linked through metadata."]}),`
`,e.jsxs(t.p,{children:[e.jsx(t.strong,{children:"Rotating a CA"})," creates a successor key and authority. It is the right choice in the face of compromise, a cryptographic change, an engine migration or non-exportable key policies."]}),`
`,e.jsx(t.p,{children:"Lamassu does not allow reissuing an already-revoked CA or a CA whose expiration date has passed. Plan ahead for both conditions."}),`
`,e.jsx(t.h2,{id:"when-to-choose-each-operation",children:"When to choose each operation"}),`
`,e.jsxs(t.ul,{children:[`
`,e.jsx(t.li,{children:"Reissue if the key is still trustworthy and you only need another validity period or an updated certificate."}),`
`,e.jsx(t.li,{children:"Rotate the key if compromise is suspected, the algorithm changes or you want to move custody to another engine."}),`
`,e.jsx(t.li,{children:"Create a parallel branch if you cannot update all consumers at the same time."}),`
`,e.jsx(t.li,{children:"Revoke immediately only when the risk of keeping the CA outweighs the impact of interrupting the fleet."}),`
`]}),`
`,e.jsx(t.h2,{id:"key-rotation-procedure",children:"Key rotation procedure"}),`
`,e.jsxs(o,{children:[e.jsxs(i,{children:[e.jsx(t.h3,{id:"inventory-the-dependencies",children:"Inventory the dependencies"}),e.jsx(t.p,{children:"Locate child CAs, issued certificates, DMSs, connectors and external trust stores. Include devices that may stay offline for weeks or months."})]}),e.jsxs(i,{children:[e.jsx(t.h3,{id:"create-the-successor-ca",children:"Create the successor CA"}),e.jsx(t.p,{children:"Generate a new key in the planned engine, create the CA and assign it an explicit profile. Do not reuse the operational identifier to hide that it is a different generation."})]}),e.jsxs(i,{children:[e.jsx(t.h3,{id:"distribute-the-new-trust",children:"Distribute the new trust"}),e.jsxs(t.p,{children:["Add the new root or chain to consumers before issuing with it. In a DMS, use the managed CAs of ",e.jsx(t.code,{children:"/cacerts"})," to temporarily keep both the old and new chains."]})]}),e.jsxs(i,{children:[e.jsx(t.h3,{id:"switch-issuance",children:"Switch issuance"}),e.jsx(t.p,{children:"Update the enrollment CA and profile of the DMSs. Keep the additional validation CAs if old certificates still need to be accepted during re-enrollment."})]}),e.jsxs(i,{children:[e.jsx(t.h3,{id:"renew-in-batches",children:"Renew in batches"}),e.jsx(t.p,{children:"Migrate a small cohort, validate mTLS, OCSP and CRL from the consumer and expand progressively. Monitor which devices still present the old chain."})]}),e.jsxs(i,{children:[e.jsx(t.h3,{id:"close-the-overlap",children:"Close the overlap"}),e.jsx(t.p,{children:"Once no legitimate consumer depends on the previous authority, remove it from issuance and from the distributed CAs. Revoke it if policy requires it."})]})]}),`
`,e.jsx(t.h2,{id:"cascading-revocation",children:"Cascading revocation"}),`
`,e.jsxs(t.p,{children:["When you revoke a CA, Lamassu also updates its child CAs and issued certificates to ",e.jsx(t.code,{children:"REVOKED"})," with the reason ",e.jsx(t.code,{children:"CessationOfOperation"}),". The children's revocations propagate the effect to their own branches."]}),`
`,e.jsx(t.p,{children:"This protects the coherence of the hierarchy, but it makes revocation a high-impact action. Do not use it as the ordinary mechanism to stop issuing: first complete the migration and remove the CA from operational flows."}),`
`,e.jsx(t.h2,{id:"checks-after-the-change",children:"Checks after the change"}),`
`,e.jsxs(t.ul,{children:[`
`,e.jsx(t.li,{children:"The new chain ends in an anchor installed by the consumer."}),`
`,e.jsx(t.li,{children:"New certificates contain the expected AKI, SKI, KU, EKU and SAN."}),`
`,e.jsxs(t.li,{children:["The DMS delivers the correct chain through EST ",e.jsx(t.code,{children:"/cacerts"}),"."]}),`
`,e.jsx(t.li,{children:"Re-enrollment accepts the old identity during the planned period."}),`
`,e.jsx(t.li,{children:"OCSP and CRL respond for the authorities that remain active."}),`
`,e.jsx(t.li,{children:"No DMS is left accidentally issuing from the old CA."}),`
`]}),`
`,e.jsxs(t.p,{children:["See the ",e.jsx(t.a,{href:"/docs/platform/pki/concepts/trust-model",children:"Trust model"})," to understand the DMS's CA sets and ",e.jsx(t.a,{href:"/docs/platform/pki/concepts/certificate-lifecycle",children:"Certificate lifecycle"})," for states and revocation effects."]})]})}function u(n={}){const{wrapper:t}=n.components||{};return t?e.jsx(t,{...n,children:e.jsx(s,{...n})}):s(n)}function a(n,t){throw new Error("Expected component `"+n+"` to be defined: you likely forgot to import, pass, or provide it.")}const m=Object.freeze(Object.defineProperty({__proto__:null,_markdown:c,default:u,frontmatter:h,structuredData:d,toc:l},Symbol.toStringTag,{value:"Module"}));export{m as _};

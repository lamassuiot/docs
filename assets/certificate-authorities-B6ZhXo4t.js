import{j as e}from"./index-prc0XQdj.js";let h=`

A certification authority (CA) binds identities to public keys through signed certificates. In Lamassu you can create a new hierarchy, use a key already in the KMS or incorporate an external CA.

To design a full chain or replace an authority in production, see [CA hierarchy and rotation](/docs/platform/pki/ca-hierarchy-and-rotation). If you need to standardize what each authority can sign, use [Certificate profiles](/docs/platform/pki/certificate-profiles).

Choose a flow [#choose-a-flow]

* **New CA with a new key:** create a root of trust from scratch. Lamassu generates and keeps the key pair.
* **New CA from the KMS:** reuse a key already registered in the platform.
* **Import a CA with its private key:** incorporate an external authority that Lamassu can issue with.
* **Import only the certificate:** add an authority for building chains and validating, but not for issuing.

First time here? Follow [Create your first CA](/docs/platform/pki/quickstarts/create-certificate-authority) to complete the minimal journey.

Create a new authority [#create-a-new-authority]

Before you begin [#before-you-begin]

* Decide whether the CA will be a root or an intermediate.
* Choose the engine that will keep the key.
* Define a validity longer than that of the certificates it will issue.
* For an intermediate CA, make sure the parent CA is active.

<Steps>
  <Step>
    Open the wizard [#open-the-wizard]

    In **Certification Authorities**, select **Create New CA** and choose to generate a new key pair.
  </Step>

  <Step>
    Configure the key [#configure-the-key]

    Select the cryptographic engine, the algorithm and the size or curve. Lamassu supports RSA and EC keys according to the engine's capabilities.

    For RSA you can choose 1024, 2048, 3072 or 4096 bits. For EC, the P-256, P-384 and P-521 curves are available.
  </Step>

  <Step>
    Choose the CA type [#choose-the-ca-type]

    Select **Root CA** for a self-signed authority or **Intermediate CA** for an authority signed by another CA. In the latter case, choose the issuing CA.
  </Step>

  <Step>
    Define the identity [#define-the-identity]

    Enter a unique **CA Name**. This name becomes the certificate's \`Common Name\`. Complete the Distinguished Name fields your policy requires:

    * \`C\`: two-letter ISO 3166-1 country code.
    * \`ST\`: state or province.
    * \`L\`: locality.
    * \`O\`: organization.
    * \`OU\`: organizational unit.

    The CA's internal identifier is generated automatically and cannot be changed.
  </Step>

  <Step>
    Configure validity and uses [#configure-validity-and-uses]

    Define **CA Certificate Expiration** and **Default End-Entity Certificate Issuance Expiration**. You can express a duration (\`5y 8w 4d\`), pick a date or use the maximum allowed date.

    Select an existing issuance profile or configure the \`Key Usage\` and \`Extended Key Usage\` in the form. If you don't choose a profile, Lamassu applies the default basic usages.
  </Step>

  <Step>
    Create and verify [#create-and-verify]

    Confirm the form. The CA should appear in the inventory with its PEM certificate, status, expiration date and list of issued certificates.
  </Step>
</Steps>

<Callout type="warn" title="Plan validity as a hierarchy">
  A CA cannot issue certificates that outlive its own expiration date. Leave enough margin to renew or replace the authority without interrupting consumers.
</Callout>

Use a key from the KMS [#use-a-key-from-the-kms]

Select **Create New CA (Existing Key)** when the key is already registered in Lamassu. The wizard first asks for the backing key and then shows the same configuration of type, identity, validity and profile.

This flow is useful when the key was previously created in an HSM, imported through BYOK or must be reused under a specific custody policy.

Import an external CA [#import-an-external-ca]

Importing preserves an authority created outside Lamassu.

<Steps>
  <Step>
    Select the engine [#select-the-engine]

    Choose the engine that will keep the imported key.
  </Step>

  <Step>
    Load the material [#load-the-material]

    Provide the CA certificate and the private key in PEM format. For a subordinate CA, optionally add the validation chain.
  </Step>

  <Step>
    Define the default issuance [#define-the-default-issuance]

    Configure the validity that end-entity certificates will receive when a request does not specify another duration.
  </Step>

  <Step>
    Verify the import [#verify-the-import]

    Lamassu checks that the certificate belongs to a CA and that the material is coherent before registering it.
  </Step>
</Steps>

If you don't have the private key, import only the certificate. The authority can take part in chains of trust and validation processes, but it cannot issue certificates from Lamassu.

Inspect an authority [#inspect-an-authority]

Open a CA from the inventory to review:

* Status and validity period.
* Certificate and chain in PEM format.
* Number of active, expired and revoked certificates.
* Certificates issued in **Issued Certificates**.
* The CRL linked to the authority.
* Metadata and the associated cryptographic engine.

You can filter the inventory by name, status and CA type.

Issue certificates [#issue-certificates]

You can start an issuance from **Issued Certificates**, from a CA's action menu or from the global certificate inventory.

**Generate Key & CSR in Browser** is useful for a manual operation or a quick test. The browser generates the key and you must download it at the end.

**Upload Existing CSR** is the right option when the key must remain on the target system. Lamassu receives the request but never the private key.

Follow [Issue your first certificate](/docs/platform/pki/quickstarts/issue-certificate) for the guided flow. [Certificate management](/docs/platform/pki/certificates) explains the inventory, inspection and revocation.

Revoke a CA [#revoke-a-ca]

<Callout type="warn" title="Revocation affects the entire dependent chain">
  Revoking a CA invalidates trust in the certificates it issued and can interrupt devices and services. The action is irreversible.
</Callout>

<Steps>
  <Step>
    Assess the impact [#assess-the-impact]

    Identify the certificates, devices and consumers that depend on the CA. Prepare a replacement authority and chain when necessary.
  </Step>

  <Step>
    Start the revocation [#start-the-revocation]

    Open the authority and select **Revoke CA**. Choose the reason that describes the incident, for example \`KeyCompromise\`, \`CACompromise\`, \`Superseded\` or \`CessationOfOperation\`.
  </Step>

  <Step>
    Confirm the identity [#confirm-the-identity]

    Type the CA's name exactly to enable **Confirm Revocation**.
  </Step>

  <Step>
    Check the publication [#check-the-publication]

    The status should change to **REVOKED** and the CRL should reflect the new information. The CA can no longer issue certificates.
  </Step>
</Steps>

Permanent deletion is only available after revoking. Delete the record only when your retention and audit policy allows it.
`,c={title:"Certification authorities",description:"Create, import and operate the authorities that establish your PKI's trust.",sidebar:{group:"CA",label:"Authorities"}},d={contents:[{heading:void 0,content:"A certification authority (CA) binds identities to public keys through signed certificates. In Lamassu you can create a new hierarchy, use a key already in the KMS or incorporate an external CA."},{heading:void 0,content:"To design a full chain or replace an authority in production, see CA hierarchy and rotation. If you need to standardize what each authority can sign, use Certificate profiles."},{heading:"choose-a-flow",content:"**New CA with a new key:** create a root of trust from scratch. Lamassu generates and keeps the key pair."},{heading:"choose-a-flow",content:"**New CA from the KMS:** reuse a key already registered in the platform."},{heading:"choose-a-flow",content:"**Import a CA with its private key:** incorporate an external authority that Lamassu can issue with."},{heading:"choose-a-flow",content:"**Import only the certificate:** add an authority for building chains and validating, but not for issuing."},{heading:"choose-a-flow",content:"First time here? Follow Create your first CA to complete the minimal journey."},{heading:"before-you-begin",content:"Decide whether the CA will be a root or an intermediate."},{heading:"before-you-begin",content:"Choose the engine that will keep the key."},{heading:"before-you-begin",content:"Define a validity longer than that of the certificates it will issue."},{heading:"before-you-begin",content:"For an intermediate CA, make sure the parent CA is active."},{heading:"open-the-wizard",content:"In **Certification Authorities**, select **Create New CA** and choose to generate a new key pair."},{heading:"configure-the-key",content:"Select the cryptographic engine, the algorithm and the size or curve. Lamassu supports RSA and EC keys according to the engine's capabilities."},{heading:"configure-the-key",content:"For RSA you can choose 1024, 2048, 3072 or 4096 bits. For EC, the P-256, P-384 and P-521 curves are available."},{heading:"choose-the-ca-type",content:"Select **Root CA** for a self-signed authority or **Intermediate CA** for an authority signed by another CA. In the latter case, choose the issuing CA."},{heading:"define-the-identity",content:"Enter a unique **CA Name**. This name becomes the certificate's `Common Name`. Complete the Distinguished Name fields your policy requires:"},{heading:"define-the-identity",content:"`C`: two-letter ISO 3166-1 country code."},{heading:"define-the-identity",content:"`ST`: state or province."},{heading:"define-the-identity",content:"`L`: locality."},{heading:"define-the-identity",content:"`O`: organization."},{heading:"define-the-identity",content:"`OU`: organizational unit."},{heading:"define-the-identity",content:"The CA's internal identifier is generated automatically and cannot be changed."},{heading:"configure-validity-and-uses",content:"Define **CA Certificate Expiration** and **Default End-Entity Certificate Issuance Expiration**. You can express a duration (`5y 8w 4d`), pick a date or use the maximum allowed date."},{heading:"configure-validity-and-uses",content:"Select an existing issuance profile or configure the `Key Usage` and `Extended Key Usage` in the form. If you don't choose a profile, Lamassu applies the default basic usages."},{heading:"create-and-verify",content:"Confirm the form. The CA should appear in the inventory with its PEM certificate, status, expiration date and list of issued certificates."},{heading:"create-and-verify",content:"A CA cannot issue certificates that outlive its own expiration date. Leave enough margin to renew or replace the authority without interrupting consumers."},{heading:"use-a-key-from-the-kms",content:"Select &#x2A;*Create New CA (Existing Key)** when the key is already registered in Lamassu. The wizard first asks for the backing key and then shows the same configuration of type, identity, validity and profile."},{heading:"use-a-key-from-the-kms",content:"This flow is useful when the key was previously created in an HSM, imported through BYOK or must be reused under a specific custody policy."},{heading:"import-an-external-ca",content:"Importing preserves an authority created outside Lamassu."},{heading:"select-the-engine",content:"Choose the engine that will keep the imported key."},{heading:"load-the-material",content:"Provide the CA certificate and the private key in PEM format. For a subordinate CA, optionally add the validation chain."},{heading:"define-the-default-issuance",content:"Configure the validity that end-entity certificates will receive when a request does not specify another duration."},{heading:"verify-the-import",content:"Lamassu checks that the certificate belongs to a CA and that the material is coherent before registering it."},{heading:"verify-the-import",content:"If you don't have the private key, import only the certificate. The authority can take part in chains of trust and validation processes, but it cannot issue certificates from Lamassu."},{heading:"inspect-an-authority",content:"Open a CA from the inventory to review:"},{heading:"inspect-an-authority",content:"Status and validity period."},{heading:"inspect-an-authority",content:"Certificate and chain in PEM format."},{heading:"inspect-an-authority",content:"Number of active, expired and revoked certificates."},{heading:"inspect-an-authority",content:"Certificates issued in **Issued Certificates**."},{heading:"inspect-an-authority",content:"The CRL linked to the authority."},{heading:"inspect-an-authority",content:"Metadata and the associated cryptographic engine."},{heading:"inspect-an-authority",content:"You can filter the inventory by name, status and CA type."},{heading:"issue-certificates",content:"You can start an issuance from **Issued Certificates**, from a CA's action menu or from the global certificate inventory."},{heading:"issue-certificates",content:"**Generate Key & CSR in Browser** is useful for a manual operation or a quick test. The browser generates the key and you must download it at the end."},{heading:"issue-certificates",content:"**Upload Existing CSR** is the right option when the key must remain on the target system. Lamassu receives the request but never the private key."},{heading:"issue-certificates",content:"Follow Issue your first certificate for the guided flow. Certificate management explains the inventory, inspection and revocation."},{heading:"revoke-a-ca",content:"Revoking a CA invalidates trust in the certificates it issued and can interrupt devices and services. The action is irreversible."},{heading:"assess-the-impact",content:"Identify the certificates, devices and consumers that depend on the CA. Prepare a replacement authority and chain when necessary."},{heading:"start-the-revocation",content:"Open the authority and select **Revoke CA**. Choose the reason that describes the incident, for example `KeyCompromise`, `CACompromise`, `Superseded` or `CessationOfOperation`."},{heading:"confirm-the-identity",content:"Type the CA's name exactly to enable **Confirm Revocation**."},{heading:"check-the-publication",content:"The status should change to **REVOKED** and the CRL should reflect the new information. The CA can no longer issue certificates."},{heading:"check-the-publication",content:"Permanent deletion is only available after revoking. Delete the record only when your retention and audit policy allows it."}],headings:[{id:"choose-a-flow",content:"Choose a flow"},{id:"create-a-new-authority",content:"Create a new authority"},{id:"before-you-begin",content:"Before you begin"},{id:"open-the-wizard",content:"Open the wizard"},{id:"configure-the-key",content:"Configure the key"},{id:"choose-the-ca-type",content:"Choose the CA type"},{id:"define-the-identity",content:"Define the identity"},{id:"configure-validity-and-uses",content:"Configure validity and uses"},{id:"create-and-verify",content:"Create and verify"},{id:"use-a-key-from-the-kms",content:"Use a key from the KMS"},{id:"import-an-external-ca",content:"Import an external CA"},{id:"select-the-engine",content:"Select the engine"},{id:"load-the-material",content:"Load the material"},{id:"define-the-default-issuance",content:"Define the default issuance"},{id:"verify-the-import",content:"Verify the import"},{id:"inspect-an-authority",content:"Inspect an authority"},{id:"issue-certificates",content:"Issue certificates"},{id:"revoke-a-ca",content:"Revoke a CA"},{id:"assess-the-impact",content:"Assess the impact"},{id:"start-the-revocation",content:"Start the revocation"},{id:"confirm-the-identity",content:"Confirm the identity"},{id:"check-the-publication",content:"Check the publication"}]};const l=[{depth:2,url:"#choose-a-flow",title:e.jsx(e.Fragment,{children:"Choose a flow"})},{depth:2,url:"#create-a-new-authority",title:e.jsx(e.Fragment,{children:"Create a new authority"})},{depth:3,url:"#before-you-begin",title:e.jsx(e.Fragment,{children:"Before you begin"})},{depth:3,url:"#open-the-wizard",title:e.jsx(e.Fragment,{children:"Open the wizard"})},{depth:3,url:"#configure-the-key",title:e.jsx(e.Fragment,{children:"Configure the key"})},{depth:3,url:"#choose-the-ca-type",title:e.jsx(e.Fragment,{children:"Choose the CA type"})},{depth:3,url:"#define-the-identity",title:e.jsx(e.Fragment,{children:"Define the identity"})},{depth:3,url:"#configure-validity-and-uses",title:e.jsx(e.Fragment,{children:"Configure validity and uses"})},{depth:3,url:"#create-and-verify",title:e.jsx(e.Fragment,{children:"Create and verify"})},{depth:2,url:"#use-a-key-from-the-kms",title:e.jsx(e.Fragment,{children:"Use a key from the KMS"})},{depth:2,url:"#import-an-external-ca",title:e.jsx(e.Fragment,{children:"Import an external CA"})},{depth:3,url:"#select-the-engine",title:e.jsx(e.Fragment,{children:"Select the engine"})},{depth:3,url:"#load-the-material",title:e.jsx(e.Fragment,{children:"Load the material"})},{depth:3,url:"#define-the-default-issuance",title:e.jsx(e.Fragment,{children:"Define the default issuance"})},{depth:3,url:"#verify-the-import",title:e.jsx(e.Fragment,{children:"Verify the import"})},{depth:2,url:"#inspect-an-authority",title:e.jsx(e.Fragment,{children:"Inspect an authority"})},{depth:2,url:"#issue-certificates",title:e.jsx(e.Fragment,{children:"Issue certificates"})},{depth:2,url:"#revoke-a-ca",title:e.jsx(e.Fragment,{children:"Revoke a CA"})},{depth:3,url:"#assess-the-impact",title:e.jsx(e.Fragment,{children:"Assess the impact"})},{depth:3,url:"#start-the-revocation",title:e.jsx(e.Fragment,{children:"Start the revocation"})},{depth:3,url:"#confirm-the-identity",title:e.jsx(e.Fragment,{children:"Confirm the identity"})},{depth:3,url:"#check-the-publication",title:e.jsx(e.Fragment,{children:"Check the publication"})}];function s(n){const t={a:"a",code:"code",h2:"h2",h3:"h3",li:"li",p:"p",strong:"strong",ul:"ul",...n.components},{Callout:r,Step:i,Steps:a}=t;return r||o("Callout"),i||o("Step"),a||o("Steps"),e.jsxs(e.Fragment,{children:[e.jsx(t.p,{children:"A certification authority (CA) binds identities to public keys through signed certificates. In Lamassu you can create a new hierarchy, use a key already in the KMS or incorporate an external CA."}),`
`,e.jsxs(t.p,{children:["To design a full chain or replace an authority in production, see ",e.jsx(t.a,{href:"/docs/platform/pki/ca-hierarchy-and-rotation",children:"CA hierarchy and rotation"}),". If you need to standardize what each authority can sign, use ",e.jsx(t.a,{href:"/docs/platform/pki/certificate-profiles",children:"Certificate profiles"}),"."]}),`
`,e.jsx(t.h2,{id:"choose-a-flow",children:"Choose a flow"}),`
`,e.jsxs(t.ul,{children:[`
`,e.jsxs(t.li,{children:[e.jsx(t.strong,{children:"New CA with a new key:"})," create a root of trust from scratch. Lamassu generates and keeps the key pair."]}),`
`,e.jsxs(t.li,{children:[e.jsx(t.strong,{children:"New CA from the KMS:"})," reuse a key already registered in the platform."]}),`
`,e.jsxs(t.li,{children:[e.jsx(t.strong,{children:"Import a CA with its private key:"})," incorporate an external authority that Lamassu can issue with."]}),`
`,e.jsxs(t.li,{children:[e.jsx(t.strong,{children:"Import only the certificate:"})," add an authority for building chains and validating, but not for issuing."]}),`
`]}),`
`,e.jsxs(t.p,{children:["First time here? Follow ",e.jsx(t.a,{href:"/docs/platform/pki/quickstarts/create-certificate-authority",children:"Create your first CA"})," to complete the minimal journey."]}),`
`,e.jsx(t.h2,{id:"create-a-new-authority",children:"Create a new authority"}),`
`,e.jsx(t.h3,{id:"before-you-begin",children:"Before you begin"}),`
`,e.jsxs(t.ul,{children:[`
`,e.jsx(t.li,{children:"Decide whether the CA will be a root or an intermediate."}),`
`,e.jsx(t.li,{children:"Choose the engine that will keep the key."}),`
`,e.jsx(t.li,{children:"Define a validity longer than that of the certificates it will issue."}),`
`,e.jsx(t.li,{children:"For an intermediate CA, make sure the parent CA is active."}),`
`]}),`
`,e.jsxs(a,{children:[e.jsxs(i,{children:[e.jsx(t.h3,{id:"open-the-wizard",children:"Open the wizard"}),e.jsxs(t.p,{children:["In ",e.jsx(t.strong,{children:"Certification Authorities"}),", select ",e.jsx(t.strong,{children:"Create New CA"})," and choose to generate a new key pair."]})]}),e.jsxs(i,{children:[e.jsx(t.h3,{id:"configure-the-key",children:"Configure the key"}),e.jsx(t.p,{children:"Select the cryptographic engine, the algorithm and the size or curve. Lamassu supports RSA and EC keys according to the engine's capabilities."}),e.jsx(t.p,{children:"For RSA you can choose 1024, 2048, 3072 or 4096 bits. For EC, the P-256, P-384 and P-521 curves are available."})]}),e.jsxs(i,{children:[e.jsx(t.h3,{id:"choose-the-ca-type",children:"Choose the CA type"}),e.jsxs(t.p,{children:["Select ",e.jsx(t.strong,{children:"Root CA"})," for a self-signed authority or ",e.jsx(t.strong,{children:"Intermediate CA"})," for an authority signed by another CA. In the latter case, choose the issuing CA."]})]}),e.jsxs(i,{children:[e.jsx(t.h3,{id:"define-the-identity",children:"Define the identity"}),e.jsxs(t.p,{children:["Enter a unique ",e.jsx(t.strong,{children:"CA Name"}),". This name becomes the certificate's ",e.jsx(t.code,{children:"Common Name"}),". Complete the Distinguished Name fields your policy requires:"]}),e.jsxs(t.ul,{children:[`
`,e.jsxs(t.li,{children:[e.jsx(t.code,{children:"C"}),": two-letter ISO 3166-1 country code."]}),`
`,e.jsxs(t.li,{children:[e.jsx(t.code,{children:"ST"}),": state or province."]}),`
`,e.jsxs(t.li,{children:[e.jsx(t.code,{children:"L"}),": locality."]}),`
`,e.jsxs(t.li,{children:[e.jsx(t.code,{children:"O"}),": organization."]}),`
`,e.jsxs(t.li,{children:[e.jsx(t.code,{children:"OU"}),": organizational unit."]}),`
`]}),e.jsx(t.p,{children:"The CA's internal identifier is generated automatically and cannot be changed."})]}),e.jsxs(i,{children:[e.jsx(t.h3,{id:"configure-validity-and-uses",children:"Configure validity and uses"}),e.jsxs(t.p,{children:["Define ",e.jsx(t.strong,{children:"CA Certificate Expiration"})," and ",e.jsx(t.strong,{children:"Default End-Entity Certificate Issuance Expiration"}),". You can express a duration (",e.jsx(t.code,{children:"5y 8w 4d"}),"), pick a date or use the maximum allowed date."]}),e.jsxs(t.p,{children:["Select an existing issuance profile or configure the ",e.jsx(t.code,{children:"Key Usage"})," and ",e.jsx(t.code,{children:"Extended Key Usage"})," in the form. If you don't choose a profile, Lamassu applies the default basic usages."]})]}),e.jsxs(i,{children:[e.jsx(t.h3,{id:"create-and-verify",children:"Create and verify"}),e.jsx(t.p,{children:"Confirm the form. The CA should appear in the inventory with its PEM certificate, status, expiration date and list of issued certificates."})]})]}),`
`,e.jsx(r,{type:"warn",title:"Plan validity as a hierarchy",children:e.jsx(t.p,{children:"A CA cannot issue certificates that outlive its own expiration date. Leave enough margin to renew or replace the authority without interrupting consumers."})}),`
`,e.jsx(t.h2,{id:"use-a-key-from-the-kms",children:"Use a key from the KMS"}),`
`,e.jsxs(t.p,{children:["Select ",e.jsx(t.strong,{children:"Create New CA (Existing Key)"})," when the key is already registered in Lamassu. The wizard first asks for the backing key and then shows the same configuration of type, identity, validity and profile."]}),`
`,e.jsx(t.p,{children:"This flow is useful when the key was previously created in an HSM, imported through BYOK or must be reused under a specific custody policy."}),`
`,e.jsx(t.h2,{id:"import-an-external-ca",children:"Import an external CA"}),`
`,e.jsx(t.p,{children:"Importing preserves an authority created outside Lamassu."}),`
`,e.jsxs(a,{children:[e.jsxs(i,{children:[e.jsx(t.h3,{id:"select-the-engine",children:"Select the engine"}),e.jsx(t.p,{children:"Choose the engine that will keep the imported key."})]}),e.jsxs(i,{children:[e.jsx(t.h3,{id:"load-the-material",children:"Load the material"}),e.jsx(t.p,{children:"Provide the CA certificate and the private key in PEM format. For a subordinate CA, optionally add the validation chain."})]}),e.jsxs(i,{children:[e.jsx(t.h3,{id:"define-the-default-issuance",children:"Define the default issuance"}),e.jsx(t.p,{children:"Configure the validity that end-entity certificates will receive when a request does not specify another duration."})]}),e.jsxs(i,{children:[e.jsx(t.h3,{id:"verify-the-import",children:"Verify the import"}),e.jsx(t.p,{children:"Lamassu checks that the certificate belongs to a CA and that the material is coherent before registering it."})]})]}),`
`,e.jsx(t.p,{children:"If you don't have the private key, import only the certificate. The authority can take part in chains of trust and validation processes, but it cannot issue certificates from Lamassu."}),`
`,e.jsx(t.h2,{id:"inspect-an-authority",children:"Inspect an authority"}),`
`,e.jsx(t.p,{children:"Open a CA from the inventory to review:"}),`
`,e.jsxs(t.ul,{children:[`
`,e.jsx(t.li,{children:"Status and validity period."}),`
`,e.jsx(t.li,{children:"Certificate and chain in PEM format."}),`
`,e.jsx(t.li,{children:"Number of active, expired and revoked certificates."}),`
`,e.jsxs(t.li,{children:["Certificates issued in ",e.jsx(t.strong,{children:"Issued Certificates"}),"."]}),`
`,e.jsx(t.li,{children:"The CRL linked to the authority."}),`
`,e.jsx(t.li,{children:"Metadata and the associated cryptographic engine."}),`
`]}),`
`,e.jsx(t.p,{children:"You can filter the inventory by name, status and CA type."}),`
`,e.jsx(t.h2,{id:"issue-certificates",children:"Issue certificates"}),`
`,e.jsxs(t.p,{children:["You can start an issuance from ",e.jsx(t.strong,{children:"Issued Certificates"}),", from a CA's action menu or from the global certificate inventory."]}),`
`,e.jsxs(t.p,{children:[e.jsx(t.strong,{children:"Generate Key & CSR in Browser"})," is useful for a manual operation or a quick test. The browser generates the key and you must download it at the end."]}),`
`,e.jsxs(t.p,{children:[e.jsx(t.strong,{children:"Upload Existing CSR"})," is the right option when the key must remain on the target system. Lamassu receives the request but never the private key."]}),`
`,e.jsxs(t.p,{children:["Follow ",e.jsx(t.a,{href:"/docs/platform/pki/quickstarts/issue-certificate",children:"Issue your first certificate"})," for the guided flow. ",e.jsx(t.a,{href:"/docs/platform/pki/certificates",children:"Certificate management"})," explains the inventory, inspection and revocation."]}),`
`,e.jsx(t.h2,{id:"revoke-a-ca",children:"Revoke a CA"}),`
`,e.jsx(r,{type:"warn",title:"Revocation affects the entire dependent chain",children:e.jsx(t.p,{children:"Revoking a CA invalidates trust in the certificates it issued and can interrupt devices and services. The action is irreversible."})}),`
`,e.jsxs(a,{children:[e.jsxs(i,{children:[e.jsx(t.h3,{id:"assess-the-impact",children:"Assess the impact"}),e.jsx(t.p,{children:"Identify the certificates, devices and consumers that depend on the CA. Prepare a replacement authority and chain when necessary."})]}),e.jsxs(i,{children:[e.jsx(t.h3,{id:"start-the-revocation",children:"Start the revocation"}),e.jsxs(t.p,{children:["Open the authority and select ",e.jsx(t.strong,{children:"Revoke CA"}),". Choose the reason that describes the incident, for example ",e.jsx(t.code,{children:"KeyCompromise"}),", ",e.jsx(t.code,{children:"CACompromise"}),", ",e.jsx(t.code,{children:"Superseded"})," or ",e.jsx(t.code,{children:"CessationOfOperation"}),"."]})]}),e.jsxs(i,{children:[e.jsx(t.h3,{id:"confirm-the-identity",children:"Confirm the identity"}),e.jsxs(t.p,{children:["Type the CA's name exactly to enable ",e.jsx(t.strong,{children:"Confirm Revocation"}),"."]})]}),e.jsxs(i,{children:[e.jsx(t.h3,{id:"check-the-publication",children:"Check the publication"}),e.jsxs(t.p,{children:["The status should change to ",e.jsx(t.strong,{children:"REVOKED"})," and the CRL should reflect the new information. The CA can no longer issue certificates."]})]})]}),`
`,e.jsx(t.p,{children:"Permanent deletion is only available after revoking. Delete the record only when your retention and audit policy allows it."})]})}function u(n={}){const{wrapper:t}=n.components||{};return t?e.jsx(t,{...n,children:e.jsx(s,{...n})}):s(n)}function o(n,t){throw new Error("Expected component `"+n+"` to be defined: you likely forgot to import, pass, or provide it.")}const f=Object.freeze(Object.defineProperty({__proto__:null,_markdown:h,default:u,frontmatter:c,structuredData:d,toc:l},Symbol.toStringTag,{value:"Module"}));export{f as _};

import{j as e}from"./index-prc0XQdj.js";let s=`

Cryptographic key management [#cryptographic-key-management]

The Cryptographic Key Management Service (KMS) of Lamassu IoT centralizes the generation, import, custody and use of the platform's keys. This is where you manage the keys that support the CAs and the rest of the signing operations that depend on the PKI.

In the current configuration, Lamassu IoT works exclusively with asymmetric keys, such as RSA and elliptic curves. These keys are used to issue X.509 certificates, sign requests and perform authentication and validation operations within the system.

What the KMS solves [#what-the-kms-solves]

The KMS unifies key lifecycle management and prevents every service from having to integrate directly with a specific cryptographic provider.

In practice, it lets you:

* Generate new key pairs from Lamassu IoT.
* Import keys created externally.
* Delegate custody and cryptographic operations to external engines.
* Reuse existing keys for CAs, CSRs and signing or verification tasks.

Cryptographic engines [#cryptographic-engines]

Lamassu can work with different cryptographic engines depending on deployment requirements. In some environments a software engine is enough; in others custody must be delegated to an HSM, a cloud service or a specialized platform.

A single instance can have several engines configured at the same time, including multiple instances of the same type. This lets you adapt operations to different security, cost and regulatory requirements.

Currently, Lamassu supports five engine types. Choose according to the isolation level you need and who should be able to access private material.

File System [#file-system]

Generates keys with Go's cryptographic libraries and delegates their protection to the file system. It works both on-premise and in the cloud, but it does not prevent key extraction and is not recommended for production.

HashiCorp Vault [#hashicorp-vault]

Protects keys at rest and can run on-premise or in the cloud. An administrator with sufficient permissions can still view private material, so it is wise to limit administrative access and safeguard the *unseal* keys.

AWS Secrets Manager [#aws-secrets-manager]

Offers encrypted persistence in AWS at a cost. It protects the key at rest, but an authorized administrator can recover it; it does not provide the same extraction resistance as a KMS or HSM.

AWS KMS [#aws-kms]

Generates keys with hardware entropy and never exposes the private key. Operations run inside the service. Even so, an identity with sufficient permissions could use the key to sign, so IAM policy remains critical.

PKCS#11 [#pkcs11]

Allows integrating local HSMs, isolated environments and *Key as a Service* offerings. Generation, persistence and extraction resistance depend on the specific device or provider. It is the most flexible option when policy requires hardware custody.

Lamassu shows the full list of enabled engines in the console.

Each engine defines which algorithms it supports, such as RSA or ECC/ECDSA, and which key sizes it can generate.

During deployment it is mandatory to define a default engine. That engine will be used when a process needs to create or persist a key and the user has not selected a specific one, for example when creating or importing a CA.

Key inventory [#key-inventory]

The main KMS screen shows the complete inventory of keys registered in the system. It is the reference view for reviewing which keys exist, where they are kept and which entities they relate to.

The table includes the following fields:

* **Name**: descriptive name of the key.
* **Type**: algorithm and key size, for example RSA 2048 or EC P-256.
* **Strength**: visual indicator of cryptographic strength.
* **Public/Private**: whether Lamassu manages the full pair or only the public key.
* **Crypto Engine**: cryptographic engine keeping the key.
* **Aliases**: alternative names associated with the key.
* **Tags**: labels for classification and search.
* **Related Entities**: certificates or other entities linked to that key.

From this view you also reach the most common actions:

* **View Details** to inspect metadata, identifiers and relationships.
* **Generate CSR** to create a PKCS#10 request with the selected key.
* **Sign / Verify** to test cryptographic operations on the key.
* **Delete Key** to remove the key from the system.

Create or import keys [#create-or-import-keys]

Keys are registered from the wizard opened with **Create New Key**.

Generate a new key pair [#generate-a-new-key-pair]

If the key will be born inside Lamassu, the recommended flow is to generate a new pair managed directly by one of the configured engines.

On the wizard's first screen, choose **Generate New Key Pair** and then define the main parameters:

* **Key Name**: unique and descriptive name.
* **Crypto Engine**: engine that will keep the key.
* **Key Type** and **Key Size**: algorithm and size or curve.
* **Tags**: metadata to classify the key.
* **Metadata**: additional information for advanced uses.

Import an existing pair [#import-an-existing-pair]

Importing lets you register in Lamassu a key generated outside the platform. It is the usual flow in BYOK scenarios, migrations or integration with cryptographic material already in production.

* When the key was generated in an isolated environment or an external HSM.
* When an existing PKI needs to be migrated without reissuing certificates.
* When Lamassu must operate with a root of trust created by a third party.

In the wizard, choose **Import Existing Key Pair** and complete the requested fields:

* **Key Name**: descriptive name within Lamassu IoT.
* **Crypto Engine**: engine that will keep the imported key.
* **Tags**: labels for organization and search.
* **Metadata**: additional optional information.
* **Private Key (PEM)**: private key in PEM format.

Once the wizard is complete, the key is stored in the selected engine and can be used for signing, CSR generation and the rest of the operations supported by the KMS.

Operations on a key [#operations-on-a-key]

Each registered key has a detail view and several operational actions.

View details [#view-details]

The **View Details** screen concentrates the technical and administrative information of the key.

The **Overview** tab shows, among others, these fields:

* **Key Name**: descriptive name.
* **Key Identifier**: unique system identifier. Lamassu uses PKCS11-based ID formats.
* **Tags**: associated labels.
* **Aliases**: alternative names.
* **Crypto Engine**: engine where the key resides.
* **Algorithm, Key Size & Strength**: algorithm, parameters and strength level.

The **Related Entities** section shows which Lamassu objects depend on that key.

The **Public Key** tab presents the public key in PEM format, ready to consult or copy.

Sign and verify [#sign-and-verify]

The **Sign / Verify** action validates that the key and the cryptographic engine work correctly.

When you open it, two areas appear: **Sign** and **Verify**.

Sign [#sign]

This tab uses the private key to generate a digital signature over a message or an already computed *digest*.

Main fields:

* **Algorithm**: signing algorithm available for the key type.
* **Message Type**: \`Raw\` for clear data or \`Digest\` for a precomputed hash.
* **Payload Encoding**: input encoding, such as UTF-8, Hex or Base64.
* **Message**: content to sign.
* **Signature**: result of the operation, shown in hexadecimal.

Verify [#verify]

This tab checks whether a signature corresponds to the associated public key.

Main fields:

* **Algorithm**: must match the algorithm used for the signature.
* **Message Type**: \`Raw\` or \`Digest\`.
* **Payload Encoding**: encoding of the message.
* **Message**: original message or hash.
* **Signature**: signature to check.
* **Result**: indicator of the validation result.

Generate a CSR [#generate-a-csr]

The **Generate CSR** action creates a PKCS#10 request signed with the private key kept in Lamassu, without exposing it outside the cryptographic engine.

This flow is useful for:

* Requesting certificates from an external CA.
* Renewing an identity while keeping the same key.

When you open the form, it asks for the subject data and the main certificate attributes:

* **Common Name (CN)**: main name of the identity.
* **Organization (O)**: organization or company.
* **Organizational Unit (OU)**: department or unit.
* **Country (C)**: two-letter country code.
* **State / Province (ST)**: state or province.
* **Locality (L)**: city or locality.
* **Email Address**: contact email.
* **Subject Alternative Names (SANs)**: alternative names or identifiers, such as DNS or IP.

Once the form is complete, Lamassu generates the CSR and presents it for download or copy.

Sign locally with PKCS#11 [#sign-locally-with-pkcs11]

Lamassu also offers specific help for local integrations through **Sign locally with OpenSSL & PKCS11 tools**.

This option shows the steps needed to configure the local environment, load the PKCS#11 module and perform signatures with tools like OpenSSL without extracting the private key from the secured environment.
`,a={title:"Keys and cryptographic engines",description:"Generate, import and operate keys without coupling the PKI to a specific provider.",sidebar:{group:"KMS",label:"Overview"}},r={contents:[{heading:"cryptographic-key-management",content:"The Cryptographic Key Management Service (KMS) of Lamassu IoT centralizes the generation, import, custody and use of the platform's keys. This is where you manage the keys that support the CAs and the rest of the signing operations that depend on the PKI."},{heading:"cryptographic-key-management",content:"In the current configuration, Lamassu IoT works exclusively with asymmetric keys, such as RSA and elliptic curves. These keys are used to issue X.509 certificates, sign requests and perform authentication and validation operations within the system."},{heading:"what-the-kms-solves",content:"The KMS unifies key lifecycle management and prevents every service from having to integrate directly with a specific cryptographic provider."},{heading:"what-the-kms-solves",content:"In practice, it lets you:"},{heading:"what-the-kms-solves",content:"Generate new key pairs from Lamassu IoT."},{heading:"what-the-kms-solves",content:"Import keys created externally."},{heading:"what-the-kms-solves",content:"Delegate custody and cryptographic operations to external engines."},{heading:"what-the-kms-solves",content:"Reuse existing keys for CAs, CSRs and signing or verification tasks."},{heading:"cryptographic-engines",content:"Lamassu can work with different cryptographic engines depending on deployment requirements. In some environments a software engine is enough; in others custody must be delegated to an HSM, a cloud service or a specialized platform."},{heading:"cryptographic-engines",content:"A single instance can have several engines configured at the same time, including multiple instances of the same type. This lets you adapt operations to different security, cost and regulatory requirements."},{heading:"cryptographic-engines",content:"Currently, Lamassu supports five engine types. Choose according to the isolation level you need and who should be able to access private material."},{heading:"file-system",content:"Generates keys with Go's cryptographic libraries and delegates their protection to the file system. It works both on-premise and in the cloud, but it does not prevent key extraction and is not recommended for production."},{heading:"hashicorp-vault",content:"Protects keys at rest and can run on-premise or in the cloud. An administrator with sufficient permissions can still view private material, so it is wise to limit administrative access and safeguard the *unseal* keys."},{heading:"aws-secrets-manager",content:"Offers encrypted persistence in AWS at a cost. It protects the key at rest, but an authorized administrator can recover it; it does not provide the same extraction resistance as a KMS or HSM."},{heading:"aws-kms",content:"Generates keys with hardware entropy and never exposes the private key. Operations run inside the service. Even so, an identity with sufficient permissions could use the key to sign, so IAM policy remains critical."},{heading:"pkcs11",content:"Allows integrating local HSMs, isolated environments and *Key as a Service* offerings. Generation, persistence and extraction resistance depend on the specific device or provider. It is the most flexible option when policy requires hardware custody."},{heading:"pkcs11",content:"Lamassu shows the full list of enabled engines in the console."},{heading:"pkcs11",content:"Each engine defines which algorithms it supports, such as RSA or ECC/ECDSA, and which key sizes it can generate."},{heading:"pkcs11",content:"During deployment it is mandatory to define a default engine. That engine will be used when a process needs to create or persist a key and the user has not selected a specific one, for example when creating or importing a CA."},{heading:"key-inventory",content:"The main KMS screen shows the complete inventory of keys registered in the system. It is the reference view for reviewing which keys exist, where they are kept and which entities they relate to."},{heading:"key-inventory",content:"The table includes the following fields:"},{heading:"key-inventory",content:"**Name**: descriptive name of the key."},{heading:"key-inventory",content:"**Type**: algorithm and key size, for example RSA 2048 or EC P-256."},{heading:"key-inventory",content:"**Strength**: visual indicator of cryptographic strength."},{heading:"key-inventory",content:"**Public/Private**: whether Lamassu manages the full pair or only the public key."},{heading:"key-inventory",content:"**Crypto Engine**: cryptographic engine keeping the key."},{heading:"key-inventory",content:"**Aliases**: alternative names associated with the key."},{heading:"key-inventory",content:"**Tags**: labels for classification and search."},{heading:"key-inventory",content:"**Related Entities**: certificates or other entities linked to that key."},{heading:"key-inventory",content:"From this view you also reach the most common actions:"},{heading:"key-inventory",content:"**View Details** to inspect metadata, identifiers and relationships."},{heading:"key-inventory",content:"**Generate CSR** to create a PKCS#10 request with the selected key."},{heading:"key-inventory",content:"**Sign / Verify** to test cryptographic operations on the key."},{heading:"key-inventory",content:"**Delete Key** to remove the key from the system."},{heading:"create-or-import-keys",content:"Keys are registered from the wizard opened with **Create New Key**."},{heading:"generate-a-new-key-pair",content:"If the key will be born inside Lamassu, the recommended flow is to generate a new pair managed directly by one of the configured engines."},{heading:"generate-a-new-key-pair",content:"On the wizard's first screen, choose **Generate New Key Pair** and then define the main parameters:"},{heading:"generate-a-new-key-pair",content:"**Key Name**: unique and descriptive name."},{heading:"generate-a-new-key-pair",content:"**Crypto Engine**: engine that will keep the key."},{heading:"generate-a-new-key-pair",content:"**Key Type** and **Key Size**: algorithm and size or curve."},{heading:"generate-a-new-key-pair",content:"**Tags**: metadata to classify the key."},{heading:"generate-a-new-key-pair",content:"**Metadata**: additional information for advanced uses."},{heading:"import-an-existing-pair",content:"Importing lets you register in Lamassu a key generated outside the platform. It is the usual flow in BYOK scenarios, migrations or integration with cryptographic material already in production."},{heading:"import-an-existing-pair",content:"When the key was generated in an isolated environment or an external HSM."},{heading:"import-an-existing-pair",content:"When an existing PKI needs to be migrated without reissuing certificates."},{heading:"import-an-existing-pair",content:"When Lamassu must operate with a root of trust created by a third party."},{heading:"import-an-existing-pair",content:"In the wizard, choose **Import Existing Key Pair** and complete the requested fields:"},{heading:"import-an-existing-pair",content:"**Key Name**: descriptive name within Lamassu IoT."},{heading:"import-an-existing-pair",content:"**Crypto Engine**: engine that will keep the imported key."},{heading:"import-an-existing-pair",content:"**Tags**: labels for organization and search."},{heading:"import-an-existing-pair",content:"**Metadata**: additional optional information."},{heading:"import-an-existing-pair",content:"**Private Key (PEM)**: private key in PEM format."},{heading:"import-an-existing-pair",content:"Once the wizard is complete, the key is stored in the selected engine and can be used for signing, CSR generation and the rest of the operations supported by the KMS."},{heading:"operations-on-a-key",content:"Each registered key has a detail view and several operational actions."},{heading:"view-details",content:"The **View Details** screen concentrates the technical and administrative information of the key."},{heading:"view-details",content:"The **Overview** tab shows, among others, these fields:"},{heading:"view-details",content:"**Key Name**: descriptive name."},{heading:"view-details",content:"**Key Identifier**: unique system identifier. Lamassu uses PKCS11-based ID formats."},{heading:"view-details",content:"**Tags**: associated labels."},{heading:"view-details",content:"**Aliases**: alternative names."},{heading:"view-details",content:"**Crypto Engine**: engine where the key resides."},{heading:"view-details",content:"**Algorithm, Key Size & Strength**: algorithm, parameters and strength level."},{heading:"view-details",content:"The **Related Entities** section shows which Lamassu objects depend on that key."},{heading:"view-details",content:"The **Public Key** tab presents the public key in PEM format, ready to consult or copy."},{heading:"sign-and-verify",content:"The **Sign / Verify** action validates that the key and the cryptographic engine work correctly."},{heading:"sign-and-verify",content:"When you open it, two areas appear: **Sign** and **Verify**."},{heading:"sign",content:"This tab uses the private key to generate a digital signature over a message or an already computed *digest*."},{heading:"sign",content:"Main fields:"},{heading:"sign",content:"**Algorithm**: signing algorithm available for the key type."},{heading:"sign",content:"**Message Type**: `Raw` for clear data or `Digest` for a precomputed hash."},{heading:"sign",content:"**Payload Encoding**: input encoding, such as UTF-8, Hex or Base64."},{heading:"sign",content:"**Message**: content to sign."},{heading:"sign",content:"**Signature**: result of the operation, shown in hexadecimal."},{heading:"verify",content:"This tab checks whether a signature corresponds to the associated public key."},{heading:"verify",content:"Main fields:"},{heading:"verify",content:"**Algorithm**: must match the algorithm used for the signature."},{heading:"verify",content:"**Message Type**: `Raw` or `Digest`."},{heading:"verify",content:"**Payload Encoding**: encoding of the message."},{heading:"verify",content:"**Message**: original message or hash."},{heading:"verify",content:"**Signature**: signature to check."},{heading:"verify",content:"**Result**: indicator of the validation result."},{heading:"generate-a-csr",content:"The **Generate CSR** action creates a PKCS#10 request signed with the private key kept in Lamassu, without exposing it outside the cryptographic engine."},{heading:"generate-a-csr",content:"This flow is useful for:"},{heading:"generate-a-csr",content:"Requesting certificates from an external CA."},{heading:"generate-a-csr",content:"Renewing an identity while keeping the same key."},{heading:"generate-a-csr",content:"When you open the form, it asks for the subject data and the main certificate attributes:"},{heading:"generate-a-csr",content:"**Common Name (CN)**: main name of the identity."},{heading:"generate-a-csr",content:"**Organization (O)**: organization or company."},{heading:"generate-a-csr",content:"**Organizational Unit (OU)**: department or unit."},{heading:"generate-a-csr",content:"**Country (C)**: two-letter country code."},{heading:"generate-a-csr",content:"**State / Province (ST)**: state or province."},{heading:"generate-a-csr",content:"**Locality (L)**: city or locality."},{heading:"generate-a-csr",content:"**Email Address**: contact email."},{heading:"generate-a-csr",content:"**Subject Alternative Names (SANs)**: alternative names or identifiers, such as DNS or IP."},{heading:"generate-a-csr",content:"Once the form is complete, Lamassu generates the CSR and presents it for download or copy."},{heading:"sign-locally-with-pkcs11",content:"Lamassu also offers specific help for local integrations through **Sign locally with OpenSSL & PKCS11 tools**."},{heading:"sign-locally-with-pkcs11",content:"This option shows the steps needed to configure the local environment, load the PKCS#11 module and perform signatures with tools like OpenSSL without extracting the private key from the secured environment."}],headings:[{id:"cryptographic-key-management",content:"Cryptographic key management"},{id:"what-the-kms-solves",content:"What the KMS solves"},{id:"cryptographic-engines",content:"Cryptographic engines"},{id:"file-system",content:"File System"},{id:"hashicorp-vault",content:"HashiCorp Vault"},{id:"aws-secrets-manager",content:"AWS Secrets Manager"},{id:"aws-kms",content:"AWS KMS"},{id:"pkcs11",content:"PKCS#11"},{id:"key-inventory",content:"Key inventory"},{id:"create-or-import-keys",content:"Create or import keys"},{id:"generate-a-new-key-pair",content:"Generate a new key pair"},{id:"import-an-existing-pair",content:"Import an existing pair"},{id:"operations-on-a-key",content:"Operations on a key"},{id:"view-details",content:"View details"},{id:"sign-and-verify",content:"Sign and verify"},{id:"sign",content:"Sign"},{id:"verify",content:"Verify"},{id:"generate-a-csr",content:"Generate a CSR"},{id:"sign-locally-with-pkcs11",content:"Sign locally with PKCS#11"}]};const o=[{depth:1,url:"#cryptographic-key-management",title:e.jsx(e.Fragment,{children:"Cryptographic key management"})},{depth:2,url:"#what-the-kms-solves",title:e.jsx(e.Fragment,{children:"What the KMS solves"})},{depth:2,url:"#cryptographic-engines",title:e.jsx(e.Fragment,{children:"Cryptographic engines"})},{depth:3,url:"#file-system",title:e.jsx(e.Fragment,{children:"File System"})},{depth:3,url:"#hashicorp-vault",title:e.jsx(e.Fragment,{children:"HashiCorp Vault"})},{depth:3,url:"#aws-secrets-manager",title:e.jsx(e.Fragment,{children:"AWS Secrets Manager"})},{depth:3,url:"#aws-kms",title:e.jsx(e.Fragment,{children:"AWS KMS"})},{depth:3,url:"#pkcs11",title:e.jsx(e.Fragment,{children:"PKCS#11"})},{depth:2,url:"#key-inventory",title:e.jsx(e.Fragment,{children:"Key inventory"})},{depth:2,url:"#create-or-import-keys",title:e.jsx(e.Fragment,{children:"Create or import keys"})},{depth:3,url:"#generate-a-new-key-pair",title:e.jsx(e.Fragment,{children:"Generate a new key pair"})},{depth:3,url:"#import-an-existing-pair",title:e.jsx(e.Fragment,{children:"Import an existing pair"})},{depth:2,url:"#operations-on-a-key",title:e.jsx(e.Fragment,{children:"Operations on a key"})},{depth:3,url:"#view-details",title:e.jsx(e.Fragment,{children:"View details"})},{depth:3,url:"#sign-and-verify",title:e.jsx(e.Fragment,{children:"Sign and verify"})},{depth:4,url:"#sign",title:e.jsx(e.Fragment,{children:"Sign"})},{depth:4,url:"#verify",title:e.jsx(e.Fragment,{children:"Verify"})},{depth:3,url:"#generate-a-csr",title:e.jsx(e.Fragment,{children:"Generate a CSR"})},{depth:3,url:"#sign-locally-with-pkcs11",title:e.jsx(e.Fragment,{children:"Sign locally with PKCS#11"})}];function i(t){const n={code:"code",em:"em",h1:"h1",h2:"h2",h3:"h3",h4:"h4",li:"li",p:"p",strong:"strong",ul:"ul",...t.components};return e.jsxs(e.Fragment,{children:[e.jsx(n.h1,{id:"cryptographic-key-management",children:"Cryptographic key management"}),`
`,e.jsx(n.p,{children:"The Cryptographic Key Management Service (KMS) of Lamassu IoT centralizes the generation, import, custody and use of the platform's keys. This is where you manage the keys that support the CAs and the rest of the signing operations that depend on the PKI."}),`
`,e.jsx(n.p,{children:"In the current configuration, Lamassu IoT works exclusively with asymmetric keys, such as RSA and elliptic curves. These keys are used to issue X.509 certificates, sign requests and perform authentication and validation operations within the system."}),`
`,e.jsx(n.h2,{id:"what-the-kms-solves",children:"What the KMS solves"}),`
`,e.jsx(n.p,{children:"The KMS unifies key lifecycle management and prevents every service from having to integrate directly with a specific cryptographic provider."}),`
`,e.jsx(n.p,{children:"In practice, it lets you:"}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsx(n.li,{children:"Generate new key pairs from Lamassu IoT."}),`
`,e.jsx(n.li,{children:"Import keys created externally."}),`
`,e.jsx(n.li,{children:"Delegate custody and cryptographic operations to external engines."}),`
`,e.jsx(n.li,{children:"Reuse existing keys for CAs, CSRs and signing or verification tasks."}),`
`]}),`
`,e.jsx(n.h2,{id:"cryptographic-engines",children:"Cryptographic engines"}),`
`,e.jsx(n.p,{children:"Lamassu can work with different cryptographic engines depending on deployment requirements. In some environments a software engine is enough; in others custody must be delegated to an HSM, a cloud service or a specialized platform."}),`
`,e.jsx(n.p,{children:"A single instance can have several engines configured at the same time, including multiple instances of the same type. This lets you adapt operations to different security, cost and regulatory requirements."}),`
`,e.jsx(n.p,{children:"Currently, Lamassu supports five engine types. Choose according to the isolation level you need and who should be able to access private material."}),`
`,e.jsx(n.h3,{id:"file-system",children:"File System"}),`
`,e.jsx(n.p,{children:"Generates keys with Go's cryptographic libraries and delegates their protection to the file system. It works both on-premise and in the cloud, but it does not prevent key extraction and is not recommended for production."}),`
`,e.jsx(n.h3,{id:"hashicorp-vault",children:"HashiCorp Vault"}),`
`,e.jsxs(n.p,{children:["Protects keys at rest and can run on-premise or in the cloud. An administrator with sufficient permissions can still view private material, so it is wise to limit administrative access and safeguard the ",e.jsx(n.em,{children:"unseal"})," keys."]}),`
`,e.jsx(n.h3,{id:"aws-secrets-manager",children:"AWS Secrets Manager"}),`
`,e.jsx(n.p,{children:"Offers encrypted persistence in AWS at a cost. It protects the key at rest, but an authorized administrator can recover it; it does not provide the same extraction resistance as a KMS or HSM."}),`
`,e.jsx(n.h3,{id:"aws-kms",children:"AWS KMS"}),`
`,e.jsx(n.p,{children:"Generates keys with hardware entropy and never exposes the private key. Operations run inside the service. Even so, an identity with sufficient permissions could use the key to sign, so IAM policy remains critical."}),`
`,e.jsx(n.h3,{id:"pkcs11",children:"PKCS#11"}),`
`,e.jsxs(n.p,{children:["Allows integrating local HSMs, isolated environments and ",e.jsx(n.em,{children:"Key as a Service"})," offerings. Generation, persistence and extraction resistance depend on the specific device or provider. It is the most flexible option when policy requires hardware custody."]}),`
`,e.jsx(n.p,{children:"Lamassu shows the full list of enabled engines in the console."}),`
`,e.jsx(n.p,{children:"Each engine defines which algorithms it supports, such as RSA or ECC/ECDSA, and which key sizes it can generate."}),`
`,e.jsx(n.p,{children:"During deployment it is mandatory to define a default engine. That engine will be used when a process needs to create or persist a key and the user has not selected a specific one, for example when creating or importing a CA."}),`
`,e.jsx(n.h2,{id:"key-inventory",children:"Key inventory"}),`
`,e.jsx(n.p,{children:"The main KMS screen shows the complete inventory of keys registered in the system. It is the reference view for reviewing which keys exist, where they are kept and which entities they relate to."}),`
`,e.jsx(n.p,{children:"The table includes the following fields:"}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"Name"}),": descriptive name of the key."]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"Type"}),": algorithm and key size, for example RSA 2048 or EC P-256."]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"Strength"}),": visual indicator of cryptographic strength."]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"Public/Private"}),": whether Lamassu manages the full pair or only the public key."]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"Crypto Engine"}),": cryptographic engine keeping the key."]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"Aliases"}),": alternative names associated with the key."]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"Tags"}),": labels for classification and search."]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"Related Entities"}),": certificates or other entities linked to that key."]}),`
`]}),`
`,e.jsx(n.p,{children:"From this view you also reach the most common actions:"}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"View Details"})," to inspect metadata, identifiers and relationships."]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"Generate CSR"})," to create a PKCS#10 request with the selected key."]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"Sign / Verify"})," to test cryptographic operations on the key."]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"Delete Key"})," to remove the key from the system."]}),`
`]}),`
`,e.jsx(n.h2,{id:"create-or-import-keys",children:"Create or import keys"}),`
`,e.jsxs(n.p,{children:["Keys are registered from the wizard opened with ",e.jsx(n.strong,{children:"Create New Key"}),"."]}),`
`,e.jsx(n.h3,{id:"generate-a-new-key-pair",children:"Generate a new key pair"}),`
`,e.jsx(n.p,{children:"If the key will be born inside Lamassu, the recommended flow is to generate a new pair managed directly by one of the configured engines."}),`
`,e.jsxs(n.p,{children:["On the wizard's first screen, choose ",e.jsx(n.strong,{children:"Generate New Key Pair"})," and then define the main parameters:"]}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"Key Name"}),": unique and descriptive name."]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"Crypto Engine"}),": engine that will keep the key."]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"Key Type"})," and ",e.jsx(n.strong,{children:"Key Size"}),": algorithm and size or curve."]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"Tags"}),": metadata to classify the key."]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"Metadata"}),": additional information for advanced uses."]}),`
`]}),`
`,e.jsx(n.h3,{id:"import-an-existing-pair",children:"Import an existing pair"}),`
`,e.jsx(n.p,{children:"Importing lets you register in Lamassu a key generated outside the platform. It is the usual flow in BYOK scenarios, migrations or integration with cryptographic material already in production."}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsx(n.li,{children:"When the key was generated in an isolated environment or an external HSM."}),`
`,e.jsx(n.li,{children:"When an existing PKI needs to be migrated without reissuing certificates."}),`
`,e.jsx(n.li,{children:"When Lamassu must operate with a root of trust created by a third party."}),`
`]}),`
`,e.jsxs(n.p,{children:["In the wizard, choose ",e.jsx(n.strong,{children:"Import Existing Key Pair"})," and complete the requested fields:"]}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"Key Name"}),": descriptive name within Lamassu IoT."]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"Crypto Engine"}),": engine that will keep the imported key."]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"Tags"}),": labels for organization and search."]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"Metadata"}),": additional optional information."]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"Private Key (PEM)"}),": private key in PEM format."]}),`
`]}),`
`,e.jsx(n.p,{children:"Once the wizard is complete, the key is stored in the selected engine and can be used for signing, CSR generation and the rest of the operations supported by the KMS."}),`
`,e.jsx(n.h2,{id:"operations-on-a-key",children:"Operations on a key"}),`
`,e.jsx(n.p,{children:"Each registered key has a detail view and several operational actions."}),`
`,e.jsx(n.h3,{id:"view-details",children:"View details"}),`
`,e.jsxs(n.p,{children:["The ",e.jsx(n.strong,{children:"View Details"})," screen concentrates the technical and administrative information of the key."]}),`
`,e.jsxs(n.p,{children:["The ",e.jsx(n.strong,{children:"Overview"})," tab shows, among others, these fields:"]}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"Key Name"}),": descriptive name."]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"Key Identifier"}),": unique system identifier. Lamassu uses PKCS11-based ID formats."]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"Tags"}),": associated labels."]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"Aliases"}),": alternative names."]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"Crypto Engine"}),": engine where the key resides."]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"Algorithm, Key Size & Strength"}),": algorithm, parameters and strength level."]}),`
`]}),`
`,e.jsxs(n.p,{children:["The ",e.jsx(n.strong,{children:"Related Entities"})," section shows which Lamassu objects depend on that key."]}),`
`,e.jsxs(n.p,{children:["The ",e.jsx(n.strong,{children:"Public Key"})," tab presents the public key in PEM format, ready to consult or copy."]}),`
`,e.jsx(n.h3,{id:"sign-and-verify",children:"Sign and verify"}),`
`,e.jsxs(n.p,{children:["The ",e.jsx(n.strong,{children:"Sign / Verify"})," action validates that the key and the cryptographic engine work correctly."]}),`
`,e.jsxs(n.p,{children:["When you open it, two areas appear: ",e.jsx(n.strong,{children:"Sign"})," and ",e.jsx(n.strong,{children:"Verify"}),"."]}),`
`,e.jsx(n.h4,{id:"sign",children:"Sign"}),`
`,e.jsxs(n.p,{children:["This tab uses the private key to generate a digital signature over a message or an already computed ",e.jsx(n.em,{children:"digest"}),"."]}),`
`,e.jsx(n.p,{children:"Main fields:"}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"Algorithm"}),": signing algorithm available for the key type."]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"Message Type"}),": ",e.jsx(n.code,{children:"Raw"})," for clear data or ",e.jsx(n.code,{children:"Digest"})," for a precomputed hash."]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"Payload Encoding"}),": input encoding, such as UTF-8, Hex or Base64."]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"Message"}),": content to sign."]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"Signature"}),": result of the operation, shown in hexadecimal."]}),`
`]}),`
`,e.jsx(n.h4,{id:"verify",children:"Verify"}),`
`,e.jsx(n.p,{children:"This tab checks whether a signature corresponds to the associated public key."}),`
`,e.jsx(n.p,{children:"Main fields:"}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"Algorithm"}),": must match the algorithm used for the signature."]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"Message Type"}),": ",e.jsx(n.code,{children:"Raw"})," or ",e.jsx(n.code,{children:"Digest"}),"."]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"Payload Encoding"}),": encoding of the message."]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"Message"}),": original message or hash."]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"Signature"}),": signature to check."]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"Result"}),": indicator of the validation result."]}),`
`]}),`
`,e.jsx(n.h3,{id:"generate-a-csr",children:"Generate a CSR"}),`
`,e.jsxs(n.p,{children:["The ",e.jsx(n.strong,{children:"Generate CSR"})," action creates a PKCS#10 request signed with the private key kept in Lamassu, without exposing it outside the cryptographic engine."]}),`
`,e.jsx(n.p,{children:"This flow is useful for:"}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsx(n.li,{children:"Requesting certificates from an external CA."}),`
`,e.jsx(n.li,{children:"Renewing an identity while keeping the same key."}),`
`]}),`
`,e.jsx(n.p,{children:"When you open the form, it asks for the subject data and the main certificate attributes:"}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"Common Name (CN)"}),": main name of the identity."]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"Organization (O)"}),": organization or company."]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"Organizational Unit (OU)"}),": department or unit."]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"Country (C)"}),": two-letter country code."]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"State / Province (ST)"}),": state or province."]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"Locality (L)"}),": city or locality."]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"Email Address"}),": contact email."]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"Subject Alternative Names (SANs)"}),": alternative names or identifiers, such as DNS or IP."]}),`
`]}),`
`,e.jsx(n.p,{children:"Once the form is complete, Lamassu generates the CSR and presents it for download or copy."}),`
`,e.jsx(n.h3,{id:"sign-locally-with-pkcs11",children:"Sign locally with PKCS#11"}),`
`,e.jsxs(n.p,{children:["Lamassu also offers specific help for local integrations through ",e.jsx(n.strong,{children:"Sign locally with OpenSSL & PKCS11 tools"}),"."]}),`
`,e.jsx(n.p,{children:"This option shows the steps needed to configure the local environment, load the PKCS#11 module and perform signatures with tools like OpenSSL without extracting the private key from the secured environment."})]})}function h(t={}){const{wrapper:n}=t.components||{};return n?e.jsx(n,{...t,children:e.jsx(i,{...t})}):i(t)}const d=Object.freeze(Object.defineProperty({__proto__:null,_markdown:s,default:h,frontmatter:a,structuredData:r,toc:o},Symbol.toStringTag,{value:"Module"}));export{d as _};

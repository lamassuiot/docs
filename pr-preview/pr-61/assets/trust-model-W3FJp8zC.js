import{j as e}from"./index-DqgIL_Rv.js";let d=`

In Lamassu, trust does not simply mean that a certificate exists in the inventory. A consumer trusts an identity when it can build a chain to a root it recognizes, check that the certificate is fit for the intended use and verify that it is still valid.

The four trust decisions [#the-four-trust-decisions]

Who can issue [#who-can-issue]

The CA hierarchy defines which authorities can sign. A root CA establishes the anchor of trust; intermediate CAs separate operating domains and avoid using the root for every issuance.

What can be issued [#what-can-be-issued]

[Certificate profiles](/docs/platform/pki/certificate-profiles) limit validity, subject, uses, extensions and cryptographic parameters. Possessing a CA does not replace an issuance policy.

Who can request it [#who-can-request-it]

The DMS acts as the enrollment point. It can authenticate an EST request with a client certificate, an external webhook or a combination of both. CAs configured to validate the requester do not have to be the CA that will issue the new identity.

Who accepts the result [#who-accepts-the-result]

The consumer keeps its own trust store. EST \`/cacerts\` can distribute the service TLS certificate, the enrollment CA and selected managed CAs. Initial trust for authenticating that service must come from an already trusted channel. Download and inspect the contents: do not assume they form a complete chain or install every entry as a root.

<div className="lm-diff-ins lm-diff-block">
  Trust architectures and interoperability [#trust-architectures-and-interoperability]
</div>

<div className="lm-diff-ins lm-diff-block">
  [RFC 5217](https://www.rfc-editor.org/rfc/rfc5217.html) distinguishes a PKI's internal structure from relationships between domains. Below, \`A → B\` means A signs a CA certificate for B. Validation starts at the relying party's chosen anchor; a signature in one direction does not imply reciprocal trust.
</div>

<div className="lm-diff-ins lm-diff-block">
  | Model                      | Structure                                                                                  | Considerations                                                                                                                          |
  | -------------------------- | ------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------- |
  | Single CA                  | \`CA → identity\`.                                                                           | The root issues identities directly; its compromise affects all of them.                                                                |
  | Hierarchical               | \`Root → intermediate → identity\`.                                                          | Distribute the root and present intermediates; constrain depth, uses and validity.                                                      |
  | Full or partial mesh       | Self-signed CAs cross-certify each other; a partial mesh has missing links.                | Check each direction and anchor: some domains may be unreachable in a partial mesh.                                                     |
  | Hybrid                     | Combines hierarchies and cross-certification links.                                        | Document alternative paths and constraints; consumers may build or accept different paths.                                              |
  | Unifying trust point       | \`Unifying CA → PCA-A\` and \`Unifying CA → PCA-B\`.                                           | Cross-domain validation requires trust in the unifying CA and access to cross-certificates. PCAs retain their self-signed certificates. |
  | Direct cross-certification | \`PCA-A → PCA-B\`; add \`PCA-B → PCA-A\` for reciprocity.                                      | Each domain keeps its anchor; test both directions and restrict unwanted paths.                                                         |
  | Bridge CA                  | \`PCA-A → Bridge → PCA-B\`; add reverse signatures for the opposite path.                    | The bridge is not a domain anchor and issues end-entity certificates only for its own operation. Agree policies and constraints.        |
  | Trust list                 | The consumer trusts roots A and B, locally or through a trust authority managing the list. | Cross-certification is unnecessary. Distributing certificates does not install trust anchors; control updates and removal.              |
</div>

<div className="lm-diff-ins lm-diff-block">
  A PCA is the principal CA designated for relationships between PKIs; an identity is an end-entity certificate. The first four rows describe architectures within a PKI, the next three relationships between domains, and the last a trust model external to those relationships. An ordinary intermediate alone does not demonstrate a unifying CA.
</div>

<div className="lm-diff-ins lm-diff-block">
  Single CA and hierarchy [#single-ca-and-hierarchy]
</div>

<div className="lm-diff-ins lm-diff-block">
  A single-CA PKI uses a self-signed root to issue identities directly. It is easy to understand and useful for an initial test, but concentrates issuance and trust in one key. If that key is compromised, the anchor must be replaced and affected identities renewed.
</div>

<div className="lm-diff-ins lm-diff-block">
  In a hierarchy, the root signs one or more intermediate CAs that issue identities. This separates, for example, production from testing or devices from services, and allows root usage to be restricted. Each consumer needs to trust the root and have the intermediates available to build the chain. The design must account for permitted depth, uses and expiration at each CA.
</div>

<div className="lm-diff-ins lm-diff-block">
  In Lamassu, create a root and issue an identity for the first case; for the second, create an intermediate under another root and issue from it. Download the certificates and validate both chains from a consumer, including a test with an incorrect anchor.
</div>

<div className="lm-diff-ins lm-diff-block">
  The following interactive walkthrough shows both scenarios in the console: the standalone root and the hierarchy, with the public certificates and the downloaded identity certificates.
</div>

<div className="lm-diff-ins lm-diff-block">
  <TrustModelsDemo locale="en" />
</div>

<div className="lm-diff-ins lm-diff-block">
  Direct cross-certification and mesh [#direct-cross-certification-and-mesh]
</div>

<div className="lm-diff-ins lm-diff-block">
  Cross-certification lets one CA issue a certificate for another CA's public key. A consumer trusting A can then build a path to an identity issued by B using B's certificate signed by A. B's self-signed certificate can remain available for its own consumers. For consumers trusting B to validate identities from A, a signature in the opposite direction and a path accepted by their validator are needed.
</div>

<div className="lm-diff-ins lm-diff-block">
  A mesh extends this relationship to several CAs: it is full when every CA signs every other CA, and partial when some links are missing. A full mesh offers direct links but increases the number of relationships to manage; a partial mesh reduces links but may leave paths missing or harder to build. A path shown in a graph is not necessarily acceptable to a validator.
</div>

<div className="lm-diff-ins lm-diff-block">
  To demonstrate this, create roots A, B and C and test certificates. Start with A → B, validate an identity from B using A as the anchor, and check that the opposite direction is not covered until B → A is added. Add links to build a partial mesh and compare available paths. Control the certificates supplied to the validator so alternative paths can be identified.
</div>

<div className="lm-diff-ins lm-diff-block">
  The following walkthrough shows a partial mesh with A ↔ B, A → C and B → C. The certificates were prepared before recording; the guide describes validations performed outside the console.
</div>

<div className="lm-diff-ins lm-diff-block">
  <CrossSignDemo locale="en" />
</div>

<div className="lm-diff-ins lm-diff-block">
  Hybrid model [#hybrid-model]
</div>

<div className="lm-diff-ins lm-diff-block">
  A hybrid PKI combines hierarchies of subordinate CAs with cross-certification. It can arise when two organizations with their own hierarchies need to interoperate without replacing their roots. Each branch retains its structure, but paths between them make certificate distribution, revocation and policy interpretation more complex.
</div>

<div className="lm-diff-ins lm-diff-block">
  A demo can start with roots A and B, an issuing intermediate under B, and the A → B link. From anchor A, the consumer needs B's certificate signed by A and B's intermediate to validate the final identity. Also check failure when a link is missing and look for alternative paths.
</div>

<div className="lm-diff-ins lm-diff-block">
  Unifying trust point [#unifying-trust-point]
</div>

<div className="lm-diff-ins lm-diff-block">
  This model adds a superior CA that unilaterally signs the PCAs of participating domains. Each PCA can keep its self-signed certificate and existing operation; consumers that need cross-domain validation use the unifying CA as their anchor and obtain the required cross-certificates.
</div>

<div className="lm-diff-ins lm-diff-block">
  The benefit is a common trust point without necessarily rebuilding existing PKIs. In exchange, participants must distribute and govern the new anchor, agree policies and assess the impact of its compromise or replacement. A consumer needing only its own domain can continue to trust its existing PCA.
</div>

<div className="lm-diff-ins lm-diff-block">
  For the demo, first create two self-signed PCAs, then the links Unifier → PCA-A and Unifier → PCA-B. Issue an identity from each domain and validate both from the unifying anchor; check that the cross-certificates correspond to the same keys as the original PCAs.
</div>

<div className="lm-diff-ins lm-diff-block">
  Bridge CA [#bridge-ca]
</div>

<div className="lm-diff-ins lm-diff-block">
  A bridge CA connects domains that retain their own anchors. To validate an identity from B using A as the anchor, the path can follow A → Bridge → B; the opposite direction requires the corresponding links. The bridge must not become a domain anchor and does not issue end-entity certificates except those required for its own operation.
</div>

<div className="lm-diff-ins lm-diff-block">
  Centralizing relationships through a bridge can reduce direct agreements, but requires shared governance, documented policies, policy mapping and consistent constraints. It also increases the importance of validators discovering and processing paths and extensions correctly.
</div>

<div className="lm-diff-ins lm-diff-block">
  For the demo, create two PCAs and a bridge CA, establish the links needed in both directions, and validate an identity from each domain using the other's anchor. Inspect the extensions and document any RFC requirement that the deployed version or validator cannot verify: a connected graph alone does not demonstrate a complete bridge model.
</div>

<div className="lm-diff-ins lm-diff-block">
  Trust lists [#trust-lists]
</div>

<div className="lm-diff-ins lm-diff-block">
  A trust list allows a consumer to accept several PKIs by explicitly installing their anchors, without the CAs cross-certifying one another. The list may be managed locally or by a trust authority for multiple consumers. This is a direct approach, although managing additions, removals and updates becomes harder as the number of consumers grows.
</div>

<div className="lm-diff-ins lm-diff-block">
  For the demo, create two independent roots and an identity under each. Validate both with a list containing both roots, then remove one root and check that the corresponding identity no longer validates. If you distribute certificates through EST \`/cacerts\`, show the consumer's decision to install them as anchors separately.
</div>

<div className="lm-diff-ins lm-diff-block">
  What Lamassu can demonstrate [#what-lamassu-can-demonstrate]
</div>

<div className="lm-diff-ins lm-diff-block">
  You can create roots and intermediates, issue identities and register external CAs as described in [Authorities](/docs/platform/pki/certificate-authorities). The dashboard code also includes a cross-signing operation that creates another certificate for the target CA's existing key, signed by the selected CA. Availability depends on the deployed version. In that flow both CAs must be active and have their private keys in the KMS; a certificate-only import is insufficient. Verify the public key and that the cross-certificate subject reproduces the target CA's subject: some imported subjects cannot be reproduced exactly.
</div>

<div className="lm-diff-ins lm-diff-block">
  The operation can build links for these topologies, but the graph or issuance alone does not prove interoperability or full RFC conformance. Inspect \`basicConstraints\`, \`keyCertSign\`, validity, path length, and name and policy constraints. Verify \`policyMappings\` and \`policyConstraints\` availability and processing in the deployed version and each validator. Agree policies, assurance levels, publication and revocation across domains.
</div>

<div className="lm-diff-ins lm-diff-block">
  For each path, download the identity and required CA certificates. Validate from the relying party with its explicit trust anchor and intermediates as auxiliary material; also test the reverse direction and a case that must fail. Repeat with the revocation and policy checks actually enforced by that consumer. See [Validation](/docs/platform/pki/certificate-validation) and [Trust distribution](/docs/platform/iot-fleets/enrollment/trust-distribution).
</div>

Identity flow [#identity-flow]

1. The device proves it can enroll according to the DMS policy.
2. The DMS validates the request and forwards the CSR to the enrollment CA.
3. In the device-generated CSR flow, the CA applies the profile and signs without receiving the device’s private key.
4. The device installs the certificate and the chain it needs.
5. The system that trusts the device validates the chain, dates, uses and revocation status.

<Callout type="info" title="Authentication and authorization are different boundaries">
  OIDC or X.509 identifies the operator calling Lamassu. The authorization service decides which actions it may perform. The X.509 hierarchy, on the other hand, determines whether a certificate presented by a device is trustworthy.
</Callout>

Enrollment, validation and distribution CAs [#enrollment-validation-and-distribution-cas]

A DMS relates three sets that are worth designing separately:

* **Enrollment CA:** signs the new identities.
* **Validation CAs:** authenticate the client certificates used for enrollment or migration. During re-enrollment, the enrollment CA is always trusted and Lamassu then tries the validation CAs configured in the re-enrollment block; those are optional.
* **Distributed CAs:** form the content the device obtains through EST \`/cacerts\`. You can include the service TLS certificate, the enrollment CA and an explicit list of managed CAs. Including the issuer does not automatically add all its ancestors.

This separation makes it possible to migrate a fleet: you temporarily accept certificates from the old hierarchy, issue with the new one and distribute both chains during the overlap.

Validation and revocation [#validation-and-revocation]

A valid chain does not by itself guarantee that a certificate should be accepted. The consumer must also check:

* that the current date is between \`Not Before\` and \`Not After\`;
* that \`Key Usage\` and \`Extended Key Usage\` allow the operation;
* that names, SANs and subject match the expected identity;
* that the certificate does not appear revoked in [OCSP](/docs/platform/pki/ocsp) or a [CRL](/docs/platform/pki/crl).

An OCSP \`Good\` status does not replace chain, date, usage and identity checks either; [Validation](/docs/platform/pki/certificate-validation) brings those criteria together.

During the mTLS authentication of a DMS, Lamassu attempts to check revocation. If the certificate does not contain enough information to perform that check, the backend logs a warning and continues treating it as not revoked. Design your profiles and distribution points to avoid that situation in production.

Custody limits [#custody-limits]

The KMS keeps the reference to the key and delegates the operation to the configured engine. With an HSM or a cloud KMS, the private key can remain non-exportable. That protects custody, but it does not by itself prevent misuse: you still must restrict who can request a signature and audit those operations.

Recommended pattern [#recommended-pattern]

* Keep the root out of daily operations, or with very restricted access.
* Issue from intermediate CAs separated by environment or risk domain.
* Assign explicit profiles to every use case.
* Distribute the new trust before starting a rotation.
* Keep enough overlap to renew a disconnected fleet.
* Validate from the consuming system, not only from the Lamassu console.

Continue with [CA hierarchy and rotation](/docs/platform/pki/ca-hierarchy-and-rotation) to turn this model into an operating procedure.
`,c={title:"Trust model",description:"Understand where trust originates, how it is distributed and what each component validates."},h={isNew:!1,changes:34,title:void 0,description:void 0},l={contents:[{heading:void 0,content:"In Lamassu, trust does not simply mean that a certificate exists in the inventory. A consumer trusts an identity when it can build a chain to a root it recognizes, check that the certificate is fit for the intended use and verify that it is still valid."},{heading:"who-can-issue",content:"The CA hierarchy defines which authorities can sign. A root CA establishes the anchor of trust; intermediate CAs separate operating domains and avoid using the root for every issuance."},{heading:"what-can-be-issued",content:"Certificate profiles limit validity, subject, uses, extensions and cryptographic parameters. Possessing a CA does not replace an issuance policy."},{heading:"who-can-request-it",content:"The DMS acts as the enrollment point. It can authenticate an EST request with a client certificate, an external webhook or a combination of both. CAs configured to validate the requester do not have to be the CA that will issue the new identity."},{heading:"who-accepts-the-result",content:"The consumer keeps its own trust store. EST `/cacerts` can distribute the service TLS certificate, the enrollment CA and selected managed CAs. Initial trust for authenticating that service must come from an already trusted channel. Download and inspect the contents: do not assume they form a complete chain or install every entry as a root."},{heading:"trust-architectures-and-interoperability",content:"RFC 5217 distinguishes a PKI's internal structure from relationships between domains. Below, `A → B` means A signs a CA certificate for B. Validation starts at the relying party's chosen anchor; a signature in one direction does not imply reciprocal trust."},{heading:"trust-architectures-and-interoperability",content:"Model"},{heading:"trust-architectures-and-interoperability",content:"Structure"},{heading:"trust-architectures-and-interoperability",content:"Considerations"},{heading:"trust-architectures-and-interoperability",content:"Single CA"},{heading:"trust-architectures-and-interoperability",content:"`CA → identity`."},{heading:"trust-architectures-and-interoperability",content:"The root issues identities directly; its compromise affects all of them."},{heading:"trust-architectures-and-interoperability",content:"Hierarchical"},{heading:"trust-architectures-and-interoperability",content:"`Root → intermediate → identity`."},{heading:"trust-architectures-and-interoperability",content:"Distribute the root and present intermediates; constrain depth, uses and validity."},{heading:"trust-architectures-and-interoperability",content:"Full or partial mesh"},{heading:"trust-architectures-and-interoperability",content:"Self-signed CAs cross-certify each other; a partial mesh has missing links."},{heading:"trust-architectures-and-interoperability",content:"Check each direction and anchor: some domains may be unreachable in a partial mesh."},{heading:"trust-architectures-and-interoperability",content:"Hybrid"},{heading:"trust-architectures-and-interoperability",content:"Combines hierarchies and cross-certification links."},{heading:"trust-architectures-and-interoperability",content:"Document alternative paths and constraints; consumers may build or accept different paths."},{heading:"trust-architectures-and-interoperability",content:"Unifying trust point"},{heading:"trust-architectures-and-interoperability",content:"`Unifying CA → PCA-A` and `Unifying CA → PCA-B`."},{heading:"trust-architectures-and-interoperability",content:"Cross-domain validation requires trust in the unifying CA and access to cross-certificates. PCAs retain their self-signed certificates."},{heading:"trust-architectures-and-interoperability",content:"Direct cross-certification"},{heading:"trust-architectures-and-interoperability",content:"`PCA-A → PCA-B`; add `PCA-B → PCA-A` for reciprocity."},{heading:"trust-architectures-and-interoperability",content:"Each domain keeps its anchor; test both directions and restrict unwanted paths."},{heading:"trust-architectures-and-interoperability",content:"Bridge CA"},{heading:"trust-architectures-and-interoperability",content:"`PCA-A → Bridge → PCA-B`; add reverse signatures for the opposite path."},{heading:"trust-architectures-and-interoperability",content:"The bridge is not a domain anchor and issues end-entity certificates only for its own operation. Agree policies and constraints."},{heading:"trust-architectures-and-interoperability",content:"Trust list"},{heading:"trust-architectures-and-interoperability",content:"The consumer trusts roots A and B, locally or through a trust authority managing the list."},{heading:"trust-architectures-and-interoperability",content:"Cross-certification is unnecessary. Distributing certificates does not install trust anchors; control updates and removal."},{heading:"trust-architectures-and-interoperability",content:"A PCA is the principal CA designated for relationships between PKIs; an identity is an end-entity certificate. The first four rows describe architectures within a PKI, the next three relationships between domains, and the last a trust model external to those relationships. An ordinary intermediate alone does not demonstrate a unifying CA."},{heading:"single-ca-and-hierarchy",content:"A single-CA PKI uses a self-signed root to issue identities directly. It is easy to understand and useful for an initial test, but concentrates issuance and trust in one key. If that key is compromised, the anchor must be replaced and affected identities renewed."},{heading:"single-ca-and-hierarchy",content:"In a hierarchy, the root signs one or more intermediate CAs that issue identities. This separates, for example, production from testing or devices from services, and allows root usage to be restricted. Each consumer needs to trust the root and have the intermediates available to build the chain. The design must account for permitted depth, uses and expiration at each CA."},{heading:"single-ca-and-hierarchy",content:"In Lamassu, create a root and issue an identity for the first case; for the second, create an intermediate under another root and issue from it. Download the certificates and validate both chains from a consumer, including a test with an incorrect anchor."},{heading:"single-ca-and-hierarchy",content:"The following interactive walkthrough shows both scenarios in the console: the standalone root and the hierarchy, with the public certificates and the downloaded identity certificates."},{heading:"direct-cross-certification-and-mesh",content:"Cross-certification lets one CA issue a certificate for another CA's public key. A consumer trusting A can then build a path to an identity issued by B using B's certificate signed by A. B's self-signed certificate can remain available for its own consumers. For consumers trusting B to validate identities from A, a signature in the opposite direction and a path accepted by their validator are needed."},{heading:"direct-cross-certification-and-mesh",content:"A mesh extends this relationship to several CAs: it is full when every CA signs every other CA, and partial when some links are missing. A full mesh offers direct links but increases the number of relationships to manage; a partial mesh reduces links but may leave paths missing or harder to build. A path shown in a graph is not necessarily acceptable to a validator."},{heading:"direct-cross-certification-and-mesh",content:"To demonstrate this, create roots A, B and C and test certificates. Start with A → B, validate an identity from B using A as the anchor, and check that the opposite direction is not covered until B → A is added. Add links to build a partial mesh and compare available paths. Control the certificates supplied to the validator so alternative paths can be identified."},{heading:"direct-cross-certification-and-mesh",content:"The following walkthrough shows a partial mesh with A ↔ B, A → C and B → C. The certificates were prepared before recording; the guide describes validations performed outside the console."},{heading:"hybrid-model",content:"A hybrid PKI combines hierarchies of subordinate CAs with cross-certification. It can arise when two organizations with their own hierarchies need to interoperate without replacing their roots. Each branch retains its structure, but paths between them make certificate distribution, revocation and policy interpretation more complex."},{heading:"hybrid-model",content:"A demo can start with roots A and B, an issuing intermediate under B, and the A → B link. From anchor A, the consumer needs B's certificate signed by A and B's intermediate to validate the final identity. Also check failure when a link is missing and look for alternative paths."},{heading:"unifying-trust-point",content:"This model adds a superior CA that unilaterally signs the PCAs of participating domains. Each PCA can keep its self-signed certificate and existing operation; consumers that need cross-domain validation use the unifying CA as their anchor and obtain the required cross-certificates."},{heading:"unifying-trust-point",content:"The benefit is a common trust point without necessarily rebuilding existing PKIs. In exchange, participants must distribute and govern the new anchor, agree policies and assess the impact of its compromise or replacement. A consumer needing only its own domain can continue to trust its existing PCA."},{heading:"unifying-trust-point",content:"For the demo, first create two self-signed PCAs, then the links Unifier → PCA-A and Unifier → PCA-B. Issue an identity from each domain and validate both from the unifying anchor; check that the cross-certificates correspond to the same keys as the original PCAs."},{heading:"bridge-ca",content:"A bridge CA connects domains that retain their own anchors. To validate an identity from B using A as the anchor, the path can follow A → Bridge → B; the opposite direction requires the corresponding links. The bridge must not become a domain anchor and does not issue end-entity certificates except those required for its own operation."},{heading:"bridge-ca",content:"Centralizing relationships through a bridge can reduce direct agreements, but requires shared governance, documented policies, policy mapping and consistent constraints. It also increases the importance of validators discovering and processing paths and extensions correctly."},{heading:"bridge-ca",content:"For the demo, create two PCAs and a bridge CA, establish the links needed in both directions, and validate an identity from each domain using the other's anchor. Inspect the extensions and document any RFC requirement that the deployed version or validator cannot verify: a connected graph alone does not demonstrate a complete bridge model."},{heading:"trust-lists",content:"A trust list allows a consumer to accept several PKIs by explicitly installing their anchors, without the CAs cross-certifying one another. The list may be managed locally or by a trust authority for multiple consumers. This is a direct approach, although managing additions, removals and updates becomes harder as the number of consumers grows."},{heading:"trust-lists",content:"For the demo, create two independent roots and an identity under each. Validate both with a list containing both roots, then remove one root and check that the corresponding identity no longer validates. If you distribute certificates through EST `/cacerts`, show the consumer's decision to install them as anchors separately."},{heading:"what-lamassu-can-demonstrate",content:"You can create roots and intermediates, issue identities and register external CAs as described in Authorities. The dashboard code also includes a cross-signing operation that creates another certificate for the target CA's existing key, signed by the selected CA. Availability depends on the deployed version. In that flow both CAs must be active and have their private keys in the KMS; a certificate-only import is insufficient. Verify the public key and that the cross-certificate subject reproduces the target CA's subject: some imported subjects cannot be reproduced exactly."},{heading:"what-lamassu-can-demonstrate",content:"The operation can build links for these topologies, but the graph or issuance alone does not prove interoperability or full RFC conformance. Inspect `basicConstraints`, `keyCertSign`, validity, path length, and name and policy constraints. Verify `policyMappings` and `policyConstraints` availability and processing in the deployed version and each validator. Agree policies, assurance levels, publication and revocation across domains."},{heading:"what-lamassu-can-demonstrate",content:"For each path, download the identity and required CA certificates. Validate from the relying party with its explicit trust anchor and intermediates as auxiliary material; also test the reverse direction and a case that must fail. Repeat with the revocation and policy checks actually enforced by that consumer. See Validation and Trust distribution."},{heading:"identity-flow",content:"The device proves it can enroll according to the DMS policy."},{heading:"identity-flow",content:"The DMS validates the request and forwards the CSR to the enrollment CA."},{heading:"identity-flow",content:"In the device-generated CSR flow, the CA applies the profile and signs without receiving the device’s private key."},{heading:"identity-flow",content:"The device installs the certificate and the chain it needs."},{heading:"identity-flow",content:"The system that trusts the device validates the chain, dates, uses and revocation status."},{heading:"identity-flow",content:"OIDC or X.509 identifies the operator calling Lamassu. The authorization service decides which actions it may perform. The X.509 hierarchy, on the other hand, determines whether a certificate presented by a device is trustworthy."},{heading:"enrollment-validation-and-distribution-cas",content:"A DMS relates three sets that are worth designing separately:"},{heading:"enrollment-validation-and-distribution-cas",content:"**Enrollment CA:** signs the new identities."},{heading:"enrollment-validation-and-distribution-cas",content:"**Validation CAs:** authenticate the client certificates used for enrollment or migration. During re-enrollment, the enrollment CA is always trusted and Lamassu then tries the validation CAs configured in the re-enrollment block; those are optional."},{heading:"enrollment-validation-and-distribution-cas",content:"**Distributed CAs:** form the content the device obtains through EST `/cacerts`. You can include the service TLS certificate, the enrollment CA and an explicit list of managed CAs. Including the issuer does not automatically add all its ancestors."},{heading:"enrollment-validation-and-distribution-cas",content:"This separation makes it possible to migrate a fleet: you temporarily accept certificates from the old hierarchy, issue with the new one and distribute both chains during the overlap."},{heading:"validation-and-revocation",content:"A valid chain does not by itself guarantee that a certificate should be accepted. The consumer must also check:"},{heading:"validation-and-revocation",content:"that the current date is between `Not Before` and `Not After`;"},{heading:"validation-and-revocation",content:"that `Key Usage` and `Extended Key Usage` allow the operation;"},{heading:"validation-and-revocation",content:"that names, SANs and subject match the expected identity;"},{heading:"validation-and-revocation",content:"that the certificate does not appear revoked in OCSP or a CRL."},{heading:"validation-and-revocation",content:"An OCSP `Good` status does not replace chain, date, usage and identity checks either; Validation brings those criteria together."},{heading:"validation-and-revocation",content:"During the mTLS authentication of a DMS, Lamassu attempts to check revocation. If the certificate does not contain enough information to perform that check, the backend logs a warning and continues treating it as not revoked. Design your profiles and distribution points to avoid that situation in production."},{heading:"custody-limits",content:"The KMS keeps the reference to the key and delegates the operation to the configured engine. With an HSM or a cloud KMS, the private key can remain non-exportable. That protects custody, but it does not by itself prevent misuse: you still must restrict who can request a signature and audit those operations."},{heading:"recommended-pattern",content:"Keep the root out of daily operations, or with very restricted access."},{heading:"recommended-pattern",content:"Issue from intermediate CAs separated by environment or risk domain."},{heading:"recommended-pattern",content:"Assign explicit profiles to every use case."},{heading:"recommended-pattern",content:"Distribute the new trust before starting a rotation."},{heading:"recommended-pattern",content:"Keep enough overlap to renew a disconnected fleet."},{heading:"recommended-pattern",content:"Validate from the consuming system, not only from the Lamassu console."},{heading:"recommended-pattern",content:"Continue with CA hierarchy and rotation to turn this model into an operating procedure."}],headings:[{id:"the-four-trust-decisions",content:"The four trust decisions"},{id:"who-can-issue",content:"Who can issue"},{id:"what-can-be-issued",content:"What can be issued"},{id:"who-can-request-it",content:"Who can request it"},{id:"who-accepts-the-result",content:"Who accepts the result"},{id:"trust-architectures-and-interoperability",content:"Trust architectures and interoperability"},{id:"single-ca-and-hierarchy",content:"Single CA and hierarchy"},{id:"direct-cross-certification-and-mesh",content:"Direct cross-certification and mesh"},{id:"hybrid-model",content:"Hybrid model"},{id:"unifying-trust-point",content:"Unifying trust point"},{id:"bridge-ca",content:"Bridge CA"},{id:"trust-lists",content:"Trust lists"},{id:"what-lamassu-can-demonstrate",content:"What Lamassu can demonstrate"},{id:"identity-flow",content:"Identity flow"},{id:"enrollment-validation-and-distribution-cas",content:"Enrollment, validation and distribution CAs"},{id:"validation-and-revocation",content:"Validation and revocation"},{id:"custody-limits",content:"Custody limits"},{id:"recommended-pattern",content:"Recommended pattern"}]};const u=[{depth:2,url:"#the-four-trust-decisions",title:e.jsx(e.Fragment,{children:"The four trust decisions"})},{depth:3,url:"#who-can-issue",title:e.jsx(e.Fragment,{children:"Who can issue"})},{depth:3,url:"#what-can-be-issued",title:e.jsx(e.Fragment,{children:"What can be issued"})},{depth:3,url:"#who-can-request-it",title:e.jsx(e.Fragment,{children:"Who can request it"})},{depth:3,url:"#who-accepts-the-result",title:e.jsx(e.Fragment,{children:"Who accepts the result"})},{depth:2,url:"#trust-architectures-and-interoperability",title:e.jsx(e.Fragment,{children:"Trust architectures and interoperability"})},{depth:3,url:"#single-ca-and-hierarchy",title:e.jsx(e.Fragment,{children:"Single CA and hierarchy"})},{depth:3,url:"#direct-cross-certification-and-mesh",title:e.jsx(e.Fragment,{children:"Direct cross-certification and mesh"})},{depth:3,url:"#hybrid-model",title:e.jsx(e.Fragment,{children:"Hybrid model"})},{depth:3,url:"#unifying-trust-point",title:e.jsx(e.Fragment,{children:"Unifying trust point"})},{depth:3,url:"#bridge-ca",title:e.jsx(e.Fragment,{children:"Bridge CA"})},{depth:3,url:"#trust-lists",title:e.jsx(e.Fragment,{children:"Trust lists"})},{depth:3,url:"#what-lamassu-can-demonstrate",title:e.jsx(e.Fragment,{children:"What Lamassu can demonstrate"})},{depth:2,url:"#identity-flow",title:e.jsx(e.Fragment,{children:"Identity flow"})},{depth:2,url:"#enrollment-validation-and-distribution-cas",title:e.jsx(e.Fragment,{children:"Enrollment, validation and distribution CAs"})},{depth:2,url:"#validation-and-revocation",title:e.jsx(e.Fragment,{children:"Validation and revocation"})},{depth:2,url:"#custody-limits",title:e.jsx(e.Fragment,{children:"Custody limits"})},{depth:2,url:"#recommended-pattern",title:e.jsx(e.Fragment,{children:"Recommended pattern"})}];function o(i){const t={a:"a",code:"code",div:"div",h2:"h2",h3:"h3",li:"li",ol:"ol",p:"p",strong:"strong",table:"table",tbody:"tbody",td:"td",th:"th",thead:"thead",tr:"tr",ul:"ul",...i.components},{Callout:a,CrossSignDemo:s,TrustModelsDemo:r}=t;return a||n("Callout"),s||n("CrossSignDemo"),r||n("TrustModelsDemo"),e.jsxs(e.Fragment,{children:[e.jsx(t.p,{children:"In Lamassu, trust does not simply mean that a certificate exists in the inventory. A consumer trusts an identity when it can build a chain to a root it recognizes, check that the certificate is fit for the intended use and verify that it is still valid."}),`
`,e.jsx(t.h2,{id:"the-four-trust-decisions",children:"The four trust decisions"}),`
`,e.jsx(t.h3,{id:"who-can-issue",children:"Who can issue"}),`
`,e.jsx(t.p,{children:"The CA hierarchy defines which authorities can sign. A root CA establishes the anchor of trust; intermediate CAs separate operating domains and avoid using the root for every issuance."}),`
`,e.jsx(t.h3,{id:"what-can-be-issued",children:"What can be issued"}),`
`,e.jsxs(t.p,{children:[e.jsx(t.a,{href:"/docs/platform/pki/certificate-profiles",children:"Certificate profiles"})," limit validity, subject, uses, extensions and cryptographic parameters. Possessing a CA does not replace an issuance policy."]}),`
`,e.jsx(t.h3,{id:"who-can-request-it",children:"Who can request it"}),`
`,e.jsx(t.p,{children:"The DMS acts as the enrollment point. It can authenticate an EST request with a client certificate, an external webhook or a combination of both. CAs configured to validate the requester do not have to be the CA that will issue the new identity."}),`
`,e.jsx(t.h3,{id:"who-accepts-the-result",children:"Who accepts the result"}),`
`,e.jsxs(t.p,{children:["The consumer keeps its own trust store. EST ",e.jsx(t.code,{children:"/cacerts"})," can distribute the service TLS certificate, the enrollment CA and selected managed CAs. Initial trust for authenticating that service must come from an already trusted channel. Download and inspect the contents: do not assume they form a complete chain or install every entry as a root."]}),`
`,e.jsx(t.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(t.h2,{id:"trust-architectures-and-interoperability",children:"Trust architectures and interoperability"})}),`
`,e.jsx(t.div,{className:"lm-diff-ins lm-diff-block",children:e.jsxs(t.p,{children:[e.jsx(t.a,{href:"https://www.rfc-editor.org/rfc/rfc5217.html",children:"RFC 5217"})," distinguishes a PKI's internal structure from relationships between domains. Below, ",e.jsx(t.code,{children:"A → B"})," means A signs a CA certificate for B. Validation starts at the relying party's chosen anchor; a signature in one direction does not imply reciprocal trust."]})}),`
`,e.jsx(t.div,{className:"lm-diff-ins lm-diff-block",children:e.jsxs(t.table,{children:[e.jsx(t.thead,{children:e.jsxs(t.tr,{children:[e.jsx(t.th,{children:"Model"}),e.jsx(t.th,{children:"Structure"}),e.jsx(t.th,{children:"Considerations"})]})}),e.jsxs(t.tbody,{children:[e.jsxs(t.tr,{children:[e.jsx(t.td,{children:"Single CA"}),e.jsxs(t.td,{children:[e.jsx(t.code,{children:"CA → identity"}),"."]}),e.jsx(t.td,{children:"The root issues identities directly; its compromise affects all of them."})]}),e.jsxs(t.tr,{children:[e.jsx(t.td,{children:"Hierarchical"}),e.jsxs(t.td,{children:[e.jsx(t.code,{children:"Root → intermediate → identity"}),"."]}),e.jsx(t.td,{children:"Distribute the root and present intermediates; constrain depth, uses and validity."})]}),e.jsxs(t.tr,{children:[e.jsx(t.td,{children:"Full or partial mesh"}),e.jsx(t.td,{children:"Self-signed CAs cross-certify each other; a partial mesh has missing links."}),e.jsx(t.td,{children:"Check each direction and anchor: some domains may be unreachable in a partial mesh."})]}),e.jsxs(t.tr,{children:[e.jsx(t.td,{children:"Hybrid"}),e.jsx(t.td,{children:"Combines hierarchies and cross-certification links."}),e.jsx(t.td,{children:"Document alternative paths and constraints; consumers may build or accept different paths."})]}),e.jsxs(t.tr,{children:[e.jsx(t.td,{children:"Unifying trust point"}),e.jsxs(t.td,{children:[e.jsx(t.code,{children:"Unifying CA → PCA-A"})," and ",e.jsx(t.code,{children:"Unifying CA → PCA-B"}),"."]}),e.jsx(t.td,{children:"Cross-domain validation requires trust in the unifying CA and access to cross-certificates. PCAs retain their self-signed certificates."})]}),e.jsxs(t.tr,{children:[e.jsx(t.td,{children:"Direct cross-certification"}),e.jsxs(t.td,{children:[e.jsx(t.code,{children:"PCA-A → PCA-B"}),"; add ",e.jsx(t.code,{children:"PCA-B → PCA-A"})," for reciprocity."]}),e.jsx(t.td,{children:"Each domain keeps its anchor; test both directions and restrict unwanted paths."})]}),e.jsxs(t.tr,{children:[e.jsx(t.td,{children:"Bridge CA"}),e.jsxs(t.td,{children:[e.jsx(t.code,{children:"PCA-A → Bridge → PCA-B"}),"; add reverse signatures for the opposite path."]}),e.jsx(t.td,{children:"The bridge is not a domain anchor and issues end-entity certificates only for its own operation. Agree policies and constraints."})]}),e.jsxs(t.tr,{children:[e.jsx(t.td,{children:"Trust list"}),e.jsx(t.td,{children:"The consumer trusts roots A and B, locally or through a trust authority managing the list."}),e.jsx(t.td,{children:"Cross-certification is unnecessary. Distributing certificates does not install trust anchors; control updates and removal."})]})]})]})}),`
`,e.jsx(t.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(t.p,{children:"A PCA is the principal CA designated for relationships between PKIs; an identity is an end-entity certificate. The first four rows describe architectures within a PKI, the next three relationships between domains, and the last a trust model external to those relationships. An ordinary intermediate alone does not demonstrate a unifying CA."})}),`
`,e.jsx(t.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(t.h3,{id:"single-ca-and-hierarchy",children:"Single CA and hierarchy"})}),`
`,e.jsx(t.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(t.p,{children:"A single-CA PKI uses a self-signed root to issue identities directly. It is easy to understand and useful for an initial test, but concentrates issuance and trust in one key. If that key is compromised, the anchor must be replaced and affected identities renewed."})}),`
`,e.jsx(t.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(t.p,{children:"In a hierarchy, the root signs one or more intermediate CAs that issue identities. This separates, for example, production from testing or devices from services, and allows root usage to be restricted. Each consumer needs to trust the root and have the intermediates available to build the chain. The design must account for permitted depth, uses and expiration at each CA."})}),`
`,e.jsx(t.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(t.p,{children:"In Lamassu, create a root and issue an identity for the first case; for the second, create an intermediate under another root and issue from it. Download the certificates and validate both chains from a consumer, including a test with an incorrect anchor."})}),`
`,e.jsx(t.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(t.p,{children:"The following interactive walkthrough shows both scenarios in the console: the standalone root and the hierarchy, with the public certificates and the downloaded identity certificates."})}),`
`,e.jsx(t.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(r,{locale:"en"})}),`
`,e.jsx(t.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(t.h3,{id:"direct-cross-certification-and-mesh",children:"Direct cross-certification and mesh"})}),`
`,e.jsx(t.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(t.p,{children:"Cross-certification lets one CA issue a certificate for another CA's public key. A consumer trusting A can then build a path to an identity issued by B using B's certificate signed by A. B's self-signed certificate can remain available for its own consumers. For consumers trusting B to validate identities from A, a signature in the opposite direction and a path accepted by their validator are needed."})}),`
`,e.jsx(t.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(t.p,{children:"A mesh extends this relationship to several CAs: it is full when every CA signs every other CA, and partial when some links are missing. A full mesh offers direct links but increases the number of relationships to manage; a partial mesh reduces links but may leave paths missing or harder to build. A path shown in a graph is not necessarily acceptable to a validator."})}),`
`,e.jsx(t.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(t.p,{children:"To demonstrate this, create roots A, B and C and test certificates. Start with A → B, validate an identity from B using A as the anchor, and check that the opposite direction is not covered until B → A is added. Add links to build a partial mesh and compare available paths. Control the certificates supplied to the validator so alternative paths can be identified."})}),`
`,e.jsx(t.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(t.p,{children:"The following walkthrough shows a partial mesh with A ↔ B, A → C and B → C. The certificates were prepared before recording; the guide describes validations performed outside the console."})}),`
`,e.jsx(t.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(s,{locale:"en"})}),`
`,e.jsx(t.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(t.h3,{id:"hybrid-model",children:"Hybrid model"})}),`
`,e.jsx(t.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(t.p,{children:"A hybrid PKI combines hierarchies of subordinate CAs with cross-certification. It can arise when two organizations with their own hierarchies need to interoperate without replacing their roots. Each branch retains its structure, but paths between them make certificate distribution, revocation and policy interpretation more complex."})}),`
`,e.jsx(t.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(t.p,{children:"A demo can start with roots A and B, an issuing intermediate under B, and the A → B link. From anchor A, the consumer needs B's certificate signed by A and B's intermediate to validate the final identity. Also check failure when a link is missing and look for alternative paths."})}),`
`,e.jsx(t.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(t.h3,{id:"unifying-trust-point",children:"Unifying trust point"})}),`
`,e.jsx(t.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(t.p,{children:"This model adds a superior CA that unilaterally signs the PCAs of participating domains. Each PCA can keep its self-signed certificate and existing operation; consumers that need cross-domain validation use the unifying CA as their anchor and obtain the required cross-certificates."})}),`
`,e.jsx(t.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(t.p,{children:"The benefit is a common trust point without necessarily rebuilding existing PKIs. In exchange, participants must distribute and govern the new anchor, agree policies and assess the impact of its compromise or replacement. A consumer needing only its own domain can continue to trust its existing PCA."})}),`
`,e.jsx(t.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(t.p,{children:"For the demo, first create two self-signed PCAs, then the links Unifier → PCA-A and Unifier → PCA-B. Issue an identity from each domain and validate both from the unifying anchor; check that the cross-certificates correspond to the same keys as the original PCAs."})}),`
`,e.jsx(t.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(t.h3,{id:"bridge-ca",children:"Bridge CA"})}),`
`,e.jsx(t.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(t.p,{children:"A bridge CA connects domains that retain their own anchors. To validate an identity from B using A as the anchor, the path can follow A → Bridge → B; the opposite direction requires the corresponding links. The bridge must not become a domain anchor and does not issue end-entity certificates except those required for its own operation."})}),`
`,e.jsx(t.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(t.p,{children:"Centralizing relationships through a bridge can reduce direct agreements, but requires shared governance, documented policies, policy mapping and consistent constraints. It also increases the importance of validators discovering and processing paths and extensions correctly."})}),`
`,e.jsx(t.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(t.p,{children:"For the demo, create two PCAs and a bridge CA, establish the links needed in both directions, and validate an identity from each domain using the other's anchor. Inspect the extensions and document any RFC requirement that the deployed version or validator cannot verify: a connected graph alone does not demonstrate a complete bridge model."})}),`
`,e.jsx(t.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(t.h3,{id:"trust-lists",children:"Trust lists"})}),`
`,e.jsx(t.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(t.p,{children:"A trust list allows a consumer to accept several PKIs by explicitly installing their anchors, without the CAs cross-certifying one another. The list may be managed locally or by a trust authority for multiple consumers. This is a direct approach, although managing additions, removals and updates becomes harder as the number of consumers grows."})}),`
`,e.jsx(t.div,{className:"lm-diff-ins lm-diff-block",children:e.jsxs(t.p,{children:["For the demo, create two independent roots and an identity under each. Validate both with a list containing both roots, then remove one root and check that the corresponding identity no longer validates. If you distribute certificates through EST ",e.jsx(t.code,{children:"/cacerts"}),", show the consumer's decision to install them as anchors separately."]})}),`
`,e.jsx(t.div,{className:"lm-diff-ins lm-diff-block",children:e.jsx(t.h3,{id:"what-lamassu-can-demonstrate",children:"What Lamassu can demonstrate"})}),`
`,e.jsx(t.div,{className:"lm-diff-ins lm-diff-block",children:e.jsxs(t.p,{children:["You can create roots and intermediates, issue identities and register external CAs as described in ",e.jsx(t.a,{href:"/docs/platform/pki/certificate-authorities",children:"Authorities"}),". The dashboard code also includes a cross-signing operation that creates another certificate for the target CA's existing key, signed by the selected CA. Availability depends on the deployed version. In that flow both CAs must be active and have their private keys in the KMS; a certificate-only import is insufficient. Verify the public key and that the cross-certificate subject reproduces the target CA's subject: some imported subjects cannot be reproduced exactly."]})}),`
`,e.jsx(t.div,{className:"lm-diff-ins lm-diff-block",children:e.jsxs(t.p,{children:["The operation can build links for these topologies, but the graph or issuance alone does not prove interoperability or full RFC conformance. Inspect ",e.jsx(t.code,{children:"basicConstraints"}),", ",e.jsx(t.code,{children:"keyCertSign"}),", validity, path length, and name and policy constraints. Verify ",e.jsx(t.code,{children:"policyMappings"})," and ",e.jsx(t.code,{children:"policyConstraints"})," availability and processing in the deployed version and each validator. Agree policies, assurance levels, publication and revocation across domains."]})}),`
`,e.jsx(t.div,{className:"lm-diff-ins lm-diff-block",children:e.jsxs(t.p,{children:["For each path, download the identity and required CA certificates. Validate from the relying party with its explicit trust anchor and intermediates as auxiliary material; also test the reverse direction and a case that must fail. Repeat with the revocation and policy checks actually enforced by that consumer. See ",e.jsx(t.a,{href:"/docs/platform/pki/certificate-validation",children:"Validation"})," and ",e.jsx(t.a,{href:"/docs/platform/iot-fleets/enrollment/trust-distribution",children:"Trust distribution"}),"."]})}),`
`,e.jsx(t.h2,{id:"identity-flow",children:"Identity flow"}),`
`,e.jsxs(t.ol,{children:[`
`,e.jsx(t.li,{children:"The device proves it can enroll according to the DMS policy."}),`
`,e.jsx(t.li,{children:"The DMS validates the request and forwards the CSR to the enrollment CA."}),`
`,e.jsx(t.li,{children:"In the device-generated CSR flow, the CA applies the profile and signs without receiving the device’s private key."}),`
`,e.jsx(t.li,{children:"The device installs the certificate and the chain it needs."}),`
`,e.jsx(t.li,{children:"The system that trusts the device validates the chain, dates, uses and revocation status."}),`
`]}),`
`,e.jsx(a,{type:"info",title:"Authentication and authorization are different boundaries",children:e.jsx(t.p,{children:"OIDC or X.509 identifies the operator calling Lamassu. The authorization service decides which actions it may perform. The X.509 hierarchy, on the other hand, determines whether a certificate presented by a device is trustworthy."})}),`
`,e.jsx(t.h2,{id:"enrollment-validation-and-distribution-cas",children:"Enrollment, validation and distribution CAs"}),`
`,e.jsx(t.p,{children:"A DMS relates three sets that are worth designing separately:"}),`
`,e.jsxs(t.ul,{children:[`
`,e.jsxs(t.li,{children:[e.jsx(t.strong,{children:"Enrollment CA:"})," signs the new identities."]}),`
`,e.jsxs(t.li,{children:[e.jsx(t.strong,{children:"Validation CAs:"})," authenticate the client certificates used for enrollment or migration. During re-enrollment, the enrollment CA is always trusted and Lamassu then tries the validation CAs configured in the re-enrollment block; those are optional."]}),`
`,e.jsxs(t.li,{children:[e.jsx(t.strong,{children:"Distributed CAs:"})," form the content the device obtains through EST ",e.jsx(t.code,{children:"/cacerts"}),". You can include the service TLS certificate, the enrollment CA and an explicit list of managed CAs. Including the issuer does not automatically add all its ancestors."]}),`
`]}),`
`,e.jsx(t.p,{children:"This separation makes it possible to migrate a fleet: you temporarily accept certificates from the old hierarchy, issue with the new one and distribute both chains during the overlap."}),`
`,e.jsx(t.h2,{id:"validation-and-revocation",children:"Validation and revocation"}),`
`,e.jsx(t.p,{children:"A valid chain does not by itself guarantee that a certificate should be accepted. The consumer must also check:"}),`
`,e.jsxs(t.ul,{children:[`
`,e.jsxs(t.li,{children:["that the current date is between ",e.jsx(t.code,{children:"Not Before"})," and ",e.jsx(t.code,{children:"Not After"}),";"]}),`
`,e.jsxs(t.li,{children:["that ",e.jsx(t.code,{children:"Key Usage"})," and ",e.jsx(t.code,{children:"Extended Key Usage"})," allow the operation;"]}),`
`,e.jsx(t.li,{children:"that names, SANs and subject match the expected identity;"}),`
`,e.jsxs(t.li,{children:["that the certificate does not appear revoked in ",e.jsx(t.a,{href:"/docs/platform/pki/ocsp",children:"OCSP"})," or a ",e.jsx(t.a,{href:"/docs/platform/pki/crl",children:"CRL"}),"."]}),`
`]}),`
`,e.jsxs(t.p,{children:["An OCSP ",e.jsx(t.code,{children:"Good"})," status does not replace chain, date, usage and identity checks either; ",e.jsx(t.a,{href:"/docs/platform/pki/certificate-validation",children:"Validation"})," brings those criteria together."]}),`
`,e.jsx(t.p,{children:"During the mTLS authentication of a DMS, Lamassu attempts to check revocation. If the certificate does not contain enough information to perform that check, the backend logs a warning and continues treating it as not revoked. Design your profiles and distribution points to avoid that situation in production."}),`
`,e.jsx(t.h2,{id:"custody-limits",children:"Custody limits"}),`
`,e.jsx(t.p,{children:"The KMS keeps the reference to the key and delegates the operation to the configured engine. With an HSM or a cloud KMS, the private key can remain non-exportable. That protects custody, but it does not by itself prevent misuse: you still must restrict who can request a signature and audit those operations."}),`
`,e.jsx(t.h2,{id:"recommended-pattern",children:"Recommended pattern"}),`
`,e.jsxs(t.ul,{children:[`
`,e.jsx(t.li,{children:"Keep the root out of daily operations, or with very restricted access."}),`
`,e.jsx(t.li,{children:"Issue from intermediate CAs separated by environment or risk domain."}),`
`,e.jsx(t.li,{children:"Assign explicit profiles to every use case."}),`
`,e.jsx(t.li,{children:"Distribute the new trust before starting a rotation."}),`
`,e.jsx(t.li,{children:"Keep enough overlap to renew a disconnected fleet."}),`
`,e.jsx(t.li,{children:"Validate from the consuming system, not only from the Lamassu console."}),`
`]}),`
`,e.jsxs(t.p,{children:["Continue with ",e.jsx(t.a,{href:"/docs/platform/pki/ca-hierarchy-and-rotation",children:"CA hierarchy and rotation"})," to turn this model into an operating procedure."]})]})}function m(i={}){const{wrapper:t}=i.components||{};return t?e.jsx(t,{...i,children:e.jsx(o,{...i})}):o(i)}function n(i,t){throw new Error("Expected component `"+i+"` to be defined: you likely forgot to import, pass, or provide it.")}const p=Object.freeze(Object.defineProperty({__proto__:null,_markdown:d,default:m,frontmatter:c,lmDiff:h,structuredData:l,toc:u},Symbol.toStringTag,{value:"Module"}));export{p as _};

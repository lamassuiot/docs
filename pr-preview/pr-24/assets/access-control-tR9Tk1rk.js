import{j as e}from"./index-prc0XQdj.js";let l=`

Lamassu access control turns an authenticated identity into concrete permissions. The OIDC provider or the client certificate proves **who** makes a request; the \`authz\` service decides **what that identity can do** and **over which resources**.

Lamassu does not assign permissions directly to users. The full chain is:

\`\`\`text
credential → matching principal → granted policies → rules → decision
\`\`\`

This model lets you represent people, identity-provider groups, service accounts and devices without coupling authorization to a specific provider.

Essential concepts [#essential-concepts]

A **principal** connects a credential to Lamassu. It defines how to recognize an OIDC or X.509 identity and can be active or disabled.

A **policy** groups reusable permissions. It can be granted to several principals and can contain rules about Lamassu entities, rules about HTTP routes or both.

An **entity rule** grants actions over resources such as certification authorities, certificates, issuance profiles, devices, DMSs, keys or alert subscriptions. It can cover all resources of a type or be limited by identifier, relation or attribute.

An **HTTP rule** grants actions associated with API routes. It is the mechanism the Gateway uses to decide whether a request may cross the perimeter.

A **grant** is the association between a principal and a policy. Removing the grant removes all permissions contributed by that policy, without modifying it for other principals.

<Callout type="info" title="Authentication and authorization are distinct controls">
  A valid JWT or a valid client certificate does not grant access by itself. The credential must match at least one active principal and one of its policies must allow the requested operation.
</Callout>

Two decision systems [#two-decision-systems]

Lamassu uses two authorization paths depending on who implements the protected service. They share principals, policies and grants, but they do not interpret the rules the same way.

\`\`\`text
Integrated or external HTTP services → Gateway → HTTP rules
Services developed by Lamassu  → service middleware → entity rules
\`\`\`

<Callout type="info" title="The difference lies in the integration point">
  An external service can be protected without knowing Lamassu's internal authorization model. A service developed by Lamassu embeds the authorization engine and can decide on concrete resources and filter its queries.
</Callout>

Integrated or external HTTP services [#integrated-or-external-http-services]

This path protects APIs that join the platform through the Gateway but do not natively implement Lamassu's authorization SDK. Job Manager is the current example. The same pattern allows integrating other HTTP services as long as their routes are described in an \`authz\` HTTP schema.

The decision is made **before forwarding the request to the service**:

1. Envoy Gateway authenticates the request, usually validating a JWT against the OIDC provider's JWKS.
2. For a protected route, Envoy sends the method, URL, headers and required data to \`/v1/ext_authz/check\`.
3. \`authz\` extracts the credential and resolves all active principals matching it.
4. It separately loads the policies granted to each principal.
5. The HTTP schema translates the method and route combination into a logical action, such as \`nbi-job-read\` or \`nbi-workflow-create\`.
6. \`authz\` looks for an HTTP rule granting that action.
7. If the route declares constraints, it compares request data with the normalized attributes of the same principal contributing the policy.
8. A satisfying result lets Envoy forward the request; any other response blocks it at the Gateway.

When it allows access, \`authz\` returns the selected principal in \`x-current-user\`. The Gateway can propagate that header to the service to preserve the identity context.

HTTP rules primarily answer **"can this identity call this API operation?"**. On their own they do not produce filters over the external service's database. To limit a route to a specific device, tenant or client, the schema must declare a constraint relating a request value to a normalized attribute of the principal.

Services developed by Lamassu [#services-developed-by-lamassu]

Lamassu's native services embed authorization in their middleware and know the entities they operate on: certificates, CAs, issuance profiles, keys, devices, DMSs or subscriptions, among others.

The decision is made with the domain operation context:

1. The middleware extracts the credential and resolves the matching principals.
2. The endpoint identifies the action, the entity type and, when applicable, the key of the requested resource.
3. \`authz\` gathers the entity rules of the granted policies.
4. The engine evaluates direct grants, attribute filters and relations with other entities.
5. For an individual operation, it checks that the concrete resource satisfies the computed scope.
6. For a listing, it generates a SQL filter that the service adds to its own query.

Here the engine answers **"can this identity perform this action on this concrete resource?"**.

Actions fall into two groups:

* **Global actions** do not need a resource identifier. \`create\`, \`import\` or access to a console section are common examples.
* **Atomic actions** are evaluated on a concrete instance. For certificates these include \`read\`, \`metadata-update\`, \`status-update\` and \`delete\`; for a CA there are also \`sign\`, \`reissue\` and other lifecycle operations.

Filtering inside the service prevents leaks in listings: unauthorized resources are excluded from the SQL query instead of being fetched and hidden later in the interface.

How the two paths relate [#how-the-two-paths-relate]

They are not two equivalent controls applied twice. HTTP rules protect the perimeter of an integrated service; entity rules express permissions over the data model of the native services.

A policy can contain both rule types when an identity needs to operate Lamassu resources and also call an integrated API. Granting an entity rule does not automatically grant an HTTP action, nor does an HTTP rule create access over an entity.

<Callout type="warn" title="Deny by default">
  If no combination of principal, policy and rule allows the operation, Lamassu denies it. Additionally, \`auth.externalAuthorization.failOpen\` is \`false\` by default: if \`authz\` is unavailable, the Gateway blocks protected routes.
</Callout>

OIDC principals [#oidc-principals]

An OIDC principal matches the claims of a validated JWT. It is appropriate for human users, corporate groups, IdP roles and service accounts that obtain tokens.

The following principal represents any identity holding the \`pki-operators\` role in Keycloak:

\`\`\`json title="OIDC principal by role"
{
  "id": "oidc:pki-operators",
  "name": "PKI Operators",
  "description": "Team responsible for daily operation",
  "type": "oidc",
  "active": true,
  "auth_config": {
    "claims": [
      {
        "claim": "realm_access.roles",
        "operator": "contains",
        "value": "pki-operators"
      }
    ]
  }
}
\`\`\`

Claim paths can be nested, such as \`realm_access.roles\`. Within a single principal, **all** conditions must hold. This lets you require, for example, a group and an organizational audience at the same time.

The implemented operators are:

* \`equals\`, for exact equality;
* \`contains\`, to check membership in a list or the presence of text in a scalar value.

Design matching with stable attributes. For people, it is usually better to bind permissions to centrally managed groups or roles than to the email or username. For a service account, a stable \`sub\` keeps its permissions from mixing with a human operator's.

<Callout type="warn" title="Do not use matches yet">
  Although the model recognizes the operator name \`matches\`, the current implementation does not evaluate regular expressions and the condition never matches. Use \`equals\` or \`contains\`.
</Callout>

X.509 principals [#x509-principals]

An X.509 principal lets you recognize a workload or a device by its client certificate. Lamassu checks the certificate signature against the configured CA and, depending on the mode, also its serial number or Common Name.

The available modes are:

* \`serial_and_ca\`: an exact certificate, identified by serial number and CA;
* \`cn_and_ca\`: an exact or wildcard Common Name and a specific CA;
* \`any_from_ca\`: any certificate issued directly by the given CA.

This example recognizes certificates whose CN starts with \`factory-a-\` and that are signed by the configured CA:

\`\`\`json title="X.509 principal by CN and CA"
{
  "id": "x509:factory-a-devices",
  "name": "Factory A devices",
  "type": "x509",
  "active": true,
  "auth_config": {
    "match_mode": "cn_and_ca",
    "subject_cn": "factory-a-*",
    "ca_trust": {
      "pem": "<CA-certificate-in-PEM-or-base64>",
      "identity_type": "fingerprint",
      "value": "SHA256:<sha256-fingerprint-of-the-ca>"
    }
  }
}
\`\`\`

\`ca_trust.identity_type\` accepts \`fingerprint\` or \`authority_key_id\`. In both cases you must provide the CA certificate in \`ca_trust.pem\`; Lamassu verifies both the signature and the expected identity of the CA.

Use \`any_from_ca\` only when every identity issued by that CA should share the same permissions. If a CA issues certificates for different populations, separate access by serial or CN, or use different issuing CAs.

When several principals match [#when-several-principals-match]

A single credential can match more than one principal. It is common for a user to match a principal of their team and another of their operational function.

For entity permissions, Lamassu combines permissions with OR logic: it is enough that one policy of one of the principals allows the action. Listings contain the union of the resources visible to all of them.

HTTP routes with constraints are stricter. The same principal contributing the policy must also satisfy the attributes required by the route. Lamassu does not combine one principal's policy with an attribute belonging to another.

For this reason, adding a matching principal can only broaden access. Before creating overlapping rules, review the full set of policies a real identity will receive.

How policies express access [#how-policies-express-access]

Global and direct access [#global-and-direct-access]

A rule identifies the domain (\`namespace\`), the data schema (\`schema_name\`) and the entity type (\`entity_type\`). \`actions\` lists the allowed operations.

\`direct_grants\` limits the rule to concrete identifiers. The value \`*\` covers all instances of the type. A superadministrator policy uses wildcards in schema, entity, actions and grants; a least-privilege policy should avoid them whenever possible.

Access inherited through relations [#access-inherited-through-relations]

Rules can follow relations declared between entities. For example, the schema knows the relation of a certificate to its issuing CA and of a device to its DMS. A policy can grant access to a parent resource and propagate selected actions to its related resources.

This lets you express models like "can operate the devices of this DMS" without maintaining an individual list of every device. When a resource is added under that relation, it inherits the scope planned by the policy.

Attribute-filtered access [#attribute-filtered-access]

\`column_filters\` applies conditions to columns the schema has declared filterable. All filters of the same rule are combined with AND.

For example, this rule allows reading active certificates issued by a specific CA:

\`\`\`json title="Attribute-limited rule"
{
  "namespace": "pki",
  "schema_name": "ca",
  "entity_type": "certificate",
  "actions": ["read"],
  "relations": [],
  "column_filters": [
    {
      "column": "status",
      "type": "string",
      "operator": "eq",
      "value": "ACTIVE"
    },
    {
      "column": "issuer_meta_id",
      "type": "string",
      "operator": "eq",
      "value": "ca-production"
    }
  ]
}
\`\`\`

The available operators are \`eq\`, \`neq\`, \`gt\`, \`gte\`, \`lt\`, \`lte\`, \`in\` and \`like\`. Use comparisons consistent with the column type: \`like\` for text, ordering comparisons for numbers or dates and \`in\` when there is a collection of accepted values.

HTTP rules [#http-rules]

HTTP rules do not point directly at tables. They reference a route schema and grant its logical actions. Job Manager's policies are an example: they distinguish reading, creating, updating and deleting workflows or jobs.

Some routes also compare a request value — taken from the path, query, header or JSON body — with a normalized attribute of the principal. This way you can verify that a device only queries jobs addressed to its own \`client_id\`.

Normalized attributes decouple the policy from the authentication mechanism. \`subject_attribute_mappings\` can derive, for example, \`device_id\` from \`oidc.claim.device_id\` or from \`x509.subject.cn\`. The rule consumes \`device_id\` in both cases.

Included policies [#included-policies]

The \`authz\` preload installs reusable policies for the main domains. Among them are:

* full and read-only access to certificates and authorities;
* full and read-only access to the KMS;
* full and read-only access to Device Manager, DMS Manager, Validation Authority and alerts;
* an \`Auditor\` policy with PKI read access and authorization visibility;
* console access;
* administration and observation policies for the Job Manager NBI and SBI APIs;
* \`SUPER ADMIN\`, which grants all actions over the \`authz\` and \`pki\` domains.

Start with these policies before creating others. If none reflects the boundary you need, create a specific, small policy instead of copying \`SUPER ADMIN\` and informally removing permissions.

Provision the first administrator [#provision-the-first-administrator]

<Callout type="warn" title="There is no implicit superuser">
  An installation without a principal matching your identity is left with nobody able to administer authorization. Configure the IdP and the bootstrap before exposing the platform.
</Callout>

The chart includes a bootstrap principal that looks for the OIDC role \`pki-admin\` in \`realm_access.roles\`. It grants it \`SUPER ADMIN\` and, when Job Manager is enabled, the administrative policy of its NBI API.

\`\`\`yaml title="values.yaml"
auth:
  authorization:
    rolesClaim: realm_access.roles
    roles:
      admin: pki-admin
  externalAuthorization:
    enabled: true
    failOpen: false

services:
  authz:
    jwkUrl: https://idp.example.com/realms/iot/protocol/openid-connect/certs
    bootstrap:
      - principal_id: "oidc:pki-admin"
        principal_name: "PKI Admin"
        principal_type: "oidc"
        policy_ids:
          # SUPER ADMIN
          - "lamassu.a6811b60-5f89-4ce7-badb-78ea234794d3"
          # Job Manager - Mgmt NBI Admin
          - "lamassu.7df018c1-3140-4a35-9067-2e7d6cec3ed2"
        auth_config:
          claims:
            - claim: "realm_access.roles"
              operator: "contains"
              value: "pki-admin"
\`\`\`

The pre-install and pre-upgrade Helm Job runs the \`authz\` migrations, preloads the policies and creates the bootstrap principals before the services start. If the principal already exists, it does not replace it: it only adds the configured grants that are still missing. You can keep the entry in \`values.yaml\` across upgrades.

<Steps>
  <Step>
    Prepare the identity provider [#prepare-the-identity-provider]

    Create the role or group you will use to administer Lamassu. Assign it to at least two controlled human identities. If your provider does not use \`realm_access.roles\`, adapt the claim path in both the frontend and \`auth_config.claims\`.
  </Step>

  <Step>
    Configure the two JWT validations [#configure-the-two-jwt-validations]

    The Gateway uses \`auth.authentication.apiGateway.jwks\` to authenticate requests. \`authz\` uses \`services.authz.jwkUrl\` to resolve OIDC principals. Both endpoints must contain the keys of the same issuer and be reachable from their respective components.
  </Step>

  <Step>
    Install and verify administrative access [#install-and-verify-administrative-access]

    Sign in with an identity holding \`pki-admin\`. Confirm it can access authorization administration and perform a non-destructive read operation.
  </Step>

  <Step>
    Test an unprivileged identity [#test-an-unprivileged-identity]

    Use a second user without the role and confirm the same operation is denied. This test catches misread claims, overly broad policies and accidental \`failOpen\` configurations.
  </Step>

  <Step>
    Reduce use of the bootstrap administrator [#reduce-use-of-the-bootstrap-administrator]

    Create operational principals with narrower policies. Reserve \`pki-admin\` for authorization administration and recovery, not for daily work.
  </Step>
</Steps>

Fastlane bootstrap [#fastlane-bootstrap]

Fastlane installs a Keycloak realm for the lab and creates the user \`lamassu\` with the temporary password \`lamassu\`, the role \`pki-admin\` and a mandatory password change. Its bootstrap principal matches through \`preferred_username=lamassu\`.

<Callout type="warn" title="Credentials for bootstrap only">
  Change the password on first login. Do not reuse the Fastlane user, password or IdP as a production design.
</Callout>

Design least-privilege roles [#design-least-privilege-roles]

Avoid reproducing your company's internal structure with dozens of nearly identical policies. Start from the responsibilities that actually need access:

* **Authorization administration**: manages principals, policies and grants. It should belong to a small, separate group.
* **PKI operation**: administers CAs, profiles and certificates, but not necessarily who gets access.
* **Device registration**: operates devices and DMSs without receiving permissions over keys or authorization configuration.
* **Audit**: reviews configuration and activity without creating, modifying, signing, revoking or deleting.
* **Automation**: uses a technical account or a separate certificate, with permissions limited to the flow and resources it controls.

For each role, separate "view" from "change", limit resources through grants, relations or attributes and avoid \`*\` unless the role must automatically cover future actions.

<Callout type="info" title="Wildcards also grant future actions">
  A rule with \`actions: ["*"]\` expands to every action defined by the schema. When a new version adds an action, a wildcard policy may start granting it. Review these policies on every upgrade.
</Callout>

Changes and access revocation [#changes-and-access-revocation]

To revoke access immediately, disable the principal or revoke its grants. Disabling a principal keeps its configuration and associations for investigation or restoration, but it stops taking part in matching.

Deleting a role or group in the IdP prevents new tokens from containing the claim, but an already-issued token may remain valid until it expires. If removal is urgent, combine the IdP change with disabling the principal in Lamassu and revoking sessions or tokens at the provider.

When you edit a shared policy, remember the change affects all its principals. To test a new scope, create a separate policy, grant it to a test identity and validate allowed and denied operations before replacing the old one.

Operational checklist [#operational-checklist]

* Keep \`failOpen: false\` unless a documented risk assessment justifies otherwise.
* Use groups or stable roles for people and independent identities for automations.
* Keep at least two recovery administrators and test their access periodically.
* Review active principals, their matches and their grants after IdP changes.
* Search for wildcards in policies before upgrading Lamassu.
* Always test one allowed and one denied operation for each role.
* Correlate changes to principals, policies and grants with the [audit logs](/docs/platform/pki/audit-logs).

Diagnostics [#diagnostics]

The response is 401 [#the-response-is-401]

Authentication failed before permissions were evaluated. Check the JWT signature and expiration, issuer, audience and the availability of the JWKS configured in the Gateway. For X.509, check that the client certificate reaches the point that extracts the credential.

The response is 403 [#the-response-is-403]

The credential could be processed but did not produce a positive authorization. Review in this order:

1. that an active principal of the correct type exists;
2. that the claim paths and values match the real token exactly;
3. that all of the principal's conditions hold;
4. that the principal has the expected policy granted;
5. that the policy includes the action and the requested resource type or route;
6. that the identifier, relation, column filter or HTTP constraint includes the real resource.

In the \`authz\` logs, an external endpoint decision includes \`allowed\`, \`reason\`, \`matched_principals\`, \`evaluated_policy_ids\`, \`matched_policy_id\` and the status code. These fields let you separate a matching failure from a permissions failure.

Everything returns 403 [#everything-returns-403]

Check that the bootstrap principal was created and that the policies were preloaded by the migration Job. Also verify that \`services.authz.jwkUrl\` is reachable from the \`authz\` pod; do not assume that a URL accessible from the browser also works inside the cluster.

Everything fails when authz is unavailable [#everything-fails-when-authz-is-unavailable]

This is the expected behavior with \`failOpen: false\`. Restore the service, its PostgreSQL connection and its JWKS connectivity. Do not temporarily switch to \`failOpen: true\` without accepting that protected routes could become accessible without an authorization decision.

Continue with [Audit logs](/docs/platform/pki/audit-logs) to investigate configuration changes or with [Troubleshooting](/docs/platform/pki/troubleshooting) to diagnose the deployment.
`,c={title:"Access control",description:"Design who can access Lamassu through principals, policies, resource permissions and HTTP route authorization."},h={contents:[{heading:void 0,content:"Lamassu access control turns an authenticated identity into concrete permissions. The OIDC provider or the client certificate proves **who** makes a request; the `authz` service decides **what that identity can do** and **over which resources**."},{heading:void 0,content:"Lamassu does not assign permissions directly to users. The full chain is:"},{heading:void 0,content:"This model lets you represent people, identity-provider groups, service accounts and devices without coupling authorization to a specific provider."},{heading:"essential-concepts",content:"A **principal** connects a credential to Lamassu. It defines how to recognize an OIDC or X.509 identity and can be active or disabled."},{heading:"essential-concepts",content:"A **policy** groups reusable permissions. It can be granted to several principals and can contain rules about Lamassu entities, rules about HTTP routes or both."},{heading:"essential-concepts",content:"An **entity rule** grants actions over resources such as certification authorities, certificates, issuance profiles, devices, DMSs, keys or alert subscriptions. It can cover all resources of a type or be limited by identifier, relation or attribute."},{heading:"essential-concepts",content:"An **HTTP rule** grants actions associated with API routes. It is the mechanism the Gateway uses to decide whether a request may cross the perimeter."},{heading:"essential-concepts",content:"A **grant** is the association between a principal and a policy. Removing the grant removes all permissions contributed by that policy, without modifying it for other principals."},{heading:"essential-concepts",content:"A valid JWT or a valid client certificate does not grant access by itself. The credential must match at least one active principal and one of its policies must allow the requested operation."},{heading:"two-decision-systems",content:"Lamassu uses two authorization paths depending on who implements the protected service. They share principals, policies and grants, but they do not interpret the rules the same way."},{heading:"two-decision-systems",content:"An external service can be protected without knowing Lamassu's internal authorization model. A service developed by Lamassu embeds the authorization engine and can decide on concrete resources and filter its queries."},{heading:"integrated-or-external-http-services",content:"This path protects APIs that join the platform through the Gateway but do not natively implement Lamassu's authorization SDK. Job Manager is the current example. The same pattern allows integrating other HTTP services as long as their routes are described in an `authz` HTTP schema."},{heading:"integrated-or-external-http-services",content:"The decision is made **before forwarding the request to the service**:"},{heading:"integrated-or-external-http-services",content:"Envoy Gateway authenticates the request, usually validating a JWT against the OIDC provider's JWKS."},{heading:"integrated-or-external-http-services",content:"For a protected route, Envoy sends the method, URL, headers and required data to `/v1/ext_authz/check`."},{heading:"integrated-or-external-http-services",content:"`authz` extracts the credential and resolves all active principals matching it."},{heading:"integrated-or-external-http-services",content:"It separately loads the policies granted to each principal."},{heading:"integrated-or-external-http-services",content:"The HTTP schema translates the method and route combination into a logical action, such as `nbi-job-read` or `nbi-workflow-create`."},{heading:"integrated-or-external-http-services",content:"`authz` looks for an HTTP rule granting that action."},{heading:"integrated-or-external-http-services",content:"If the route declares constraints, it compares request data with the normalized attributes of the same principal contributing the policy."},{heading:"integrated-or-external-http-services",content:"A satisfying result lets Envoy forward the request; any other response blocks it at the Gateway."},{heading:"integrated-or-external-http-services",content:"When it allows access, `authz` returns the selected principal in `x-current-user`. The Gateway can propagate that header to the service to preserve the identity context."},{heading:"integrated-or-external-http-services",content:`HTTP rules primarily answer &#x2A;*"can this identity call this API operation?"**. On their own they do not produce filters over the external service's database. To limit a route to a specific device, tenant or client, the schema must declare a constraint relating a request value to a normalized attribute of the principal.`},{heading:"services-developed-by-lamassu",content:"Lamassu's native services embed authorization in their middleware and know the entities they operate on: certificates, CAs, issuance profiles, keys, devices, DMSs or subscriptions, among others."},{heading:"services-developed-by-lamassu",content:"The decision is made with the domain operation context:"},{heading:"services-developed-by-lamassu",content:"The middleware extracts the credential and resolves the matching principals."},{heading:"services-developed-by-lamassu",content:"The endpoint identifies the action, the entity type and, when applicable, the key of the requested resource."},{heading:"services-developed-by-lamassu",content:"`authz` gathers the entity rules of the granted policies."},{heading:"services-developed-by-lamassu",content:"The engine evaluates direct grants, attribute filters and relations with other entities."},{heading:"services-developed-by-lamassu",content:"For an individual operation, it checks that the concrete resource satisfies the computed scope."},{heading:"services-developed-by-lamassu",content:"For a listing, it generates a SQL filter that the service adds to its own query."},{heading:"services-developed-by-lamassu",content:'Here the engine answers &#x2A;*"can this identity perform this action on this concrete resource?"**.'},{heading:"services-developed-by-lamassu",content:"Actions fall into two groups:"},{heading:"services-developed-by-lamassu",content:"**Global actions** do not need a resource identifier. `create`, `import` or access to a console section are common examples."},{heading:"services-developed-by-lamassu",content:"**Atomic actions** are evaluated on a concrete instance. For certificates these include `read`, `metadata-update`, `status-update` and `delete`; for a CA there are also `sign`, `reissue` and other lifecycle operations."},{heading:"services-developed-by-lamassu",content:"Filtering inside the service prevents leaks in listings: unauthorized resources are excluded from the SQL query instead of being fetched and hidden later in the interface."},{heading:"how-the-two-paths-relate",content:"They are not two equivalent controls applied twice. HTTP rules protect the perimeter of an integrated service; entity rules express permissions over the data model of the native services."},{heading:"how-the-two-paths-relate",content:"A policy can contain both rule types when an identity needs to operate Lamassu resources and also call an integrated API. Granting an entity rule does not automatically grant an HTTP action, nor does an HTTP rule create access over an entity."},{heading:"how-the-two-paths-relate",content:"If no combination of principal, policy and rule allows the operation, Lamassu denies it. Additionally, `auth.externalAuthorization.failOpen` is `false` by default: if `authz` is unavailable, the Gateway blocks protected routes."},{heading:"oidc-principals",content:"An OIDC principal matches the claims of a validated JWT. It is appropriate for human users, corporate groups, IdP roles and service accounts that obtain tokens."},{heading:"oidc-principals",content:"The following principal represents any identity holding the `pki-operators` role in Keycloak:"},{heading:"oidc-principals",content:"Claim paths can be nested, such as `realm_access.roles`. Within a single principal, **all** conditions must hold. This lets you require, for example, a group and an organizational audience at the same time."},{heading:"oidc-principals",content:"The implemented operators are:"},{heading:"oidc-principals",content:"`equals`, for exact equality;"},{heading:"oidc-principals",content:"`contains`, to check membership in a list or the presence of text in a scalar value."},{heading:"oidc-principals",content:"Design matching with stable attributes. For people, it is usually better to bind permissions to centrally managed groups or roles than to the email or username. For a service account, a stable `sub` keeps its permissions from mixing with a human operator's."},{heading:"oidc-principals",content:"Although the model recognizes the operator name `matches`, the current implementation does not evaluate regular expressions and the condition never matches. Use `equals` or `contains`."},{heading:"x509-principals",content:"An X.509 principal lets you recognize a workload or a device by its client certificate. Lamassu checks the certificate signature against the configured CA and, depending on the mode, also its serial number or Common Name."},{heading:"x509-principals",content:"The available modes are:"},{heading:"x509-principals",content:"`serial_and_ca`: an exact certificate, identified by serial number and CA;"},{heading:"x509-principals",content:"`cn_and_ca`: an exact or wildcard Common Name and a specific CA;"},{heading:"x509-principals",content:"`any_from_ca`: any certificate issued directly by the given CA."},{heading:"x509-principals",content:"This example recognizes certificates whose CN starts with `factory-a-` and that are signed by the configured CA:"},{heading:"x509-principals",content:"`ca_trust.identity_type` accepts `fingerprint` or `authority_key_id`. In both cases you must provide the CA certificate in `ca_trust.pem`; Lamassu verifies both the signature and the expected identity of the CA."},{heading:"x509-principals",content:"Use `any_from_ca` only when every identity issued by that CA should share the same permissions. If a CA issues certificates for different populations, separate access by serial or CN, or use different issuing CAs."},{heading:"when-several-principals-match",content:"A single credential can match more than one principal. It is common for a user to match a principal of their team and another of their operational function."},{heading:"when-several-principals-match",content:"For entity permissions, Lamassu combines permissions with OR logic: it is enough that one policy of one of the principals allows the action. Listings contain the union of the resources visible to all of them."},{heading:"when-several-principals-match",content:"HTTP routes with constraints are stricter. The same principal contributing the policy must also satisfy the attributes required by the route. Lamassu does not combine one principal's policy with an attribute belonging to another."},{heading:"when-several-principals-match",content:"For this reason, adding a matching principal can only broaden access. Before creating overlapping rules, review the full set of policies a real identity will receive."},{heading:"global-and-direct-access",content:"A rule identifies the domain (`namespace`), the data schema (`schema_name`) and the entity type (`entity_type`). `actions` lists the allowed operations."},{heading:"global-and-direct-access",content:"`direct_grants` limits the rule to concrete identifiers. The value `*` covers all instances of the type. A superadministrator policy uses wildcards in schema, entity, actions and grants; a least-privilege policy should avoid them whenever possible."},{heading:"access-inherited-through-relations",content:"Rules can follow relations declared between entities. For example, the schema knows the relation of a certificate to its issuing CA and of a device to its DMS. A policy can grant access to a parent resource and propagate selected actions to its related resources."},{heading:"access-inherited-through-relations",content:'This lets you express models like "can operate the devices of this DMS" without maintaining an individual list of every device. When a resource is added under that relation, it inherits the scope planned by the policy.'},{heading:"attribute-filtered-access",content:"`column_filters` applies conditions to columns the schema has declared filterable. All filters of the same rule are combined with AND."},{heading:"attribute-filtered-access",content:"For example, this rule allows reading active certificates issued by a specific CA:"},{heading:"attribute-filtered-access",content:"The available operators are `eq`, `neq`, `gt`, `gte`, `lt`, `lte`, `in` and `like`. Use comparisons consistent with the column type: `like` for text, ordering comparisons for numbers or dates and `in` when there is a collection of accepted values."},{heading:"http-rules",content:"HTTP rules do not point directly at tables. They reference a route schema and grant its logical actions. Job Manager's policies are an example: they distinguish reading, creating, updating and deleting workflows or jobs."},{heading:"http-rules",content:"Some routes also compare a request value — taken from the path, query, header or JSON body — with a normalized attribute of the principal. This way you can verify that a device only queries jobs addressed to its own `client_id`."},{heading:"http-rules",content:"Normalized attributes decouple the policy from the authentication mechanism. `subject_attribute_mappings` can derive, for example, `device_id` from `oidc.claim.device_id` or from `x509.subject.cn`. The rule consumes `device_id` in both cases."},{heading:"included-policies",content:"The `authz` preload installs reusable policies for the main domains. Among them are:"},{heading:"included-policies",content:"full and read-only access to certificates and authorities;"},{heading:"included-policies",content:"full and read-only access to the KMS;"},{heading:"included-policies",content:"full and read-only access to Device Manager, DMS Manager, Validation Authority and alerts;"},{heading:"included-policies",content:"an `Auditor` policy with PKI read access and authorization visibility;"},{heading:"included-policies",content:"console access;"},{heading:"included-policies",content:"administration and observation policies for the Job Manager NBI and SBI APIs;"},{heading:"included-policies",content:"`SUPER ADMIN`, which grants all actions over the `authz` and `pki` domains."},{heading:"included-policies",content:"Start with these policies before creating others. If none reflects the boundary you need, create a specific, small policy instead of copying `SUPER ADMIN` and informally removing permissions."},{heading:"provision-the-first-administrator",content:"An installation without a principal matching your identity is left with nobody able to administer authorization. Configure the IdP and the bootstrap before exposing the platform."},{heading:"provision-the-first-administrator",content:"The chart includes a bootstrap principal that looks for the OIDC role `pki-admin` in `realm_access.roles`. It grants it `SUPER ADMIN` and, when Job Manager is enabled, the administrative policy of its NBI API."},{heading:"provision-the-first-administrator",content:"The pre-install and pre-upgrade Helm Job runs the `authz` migrations, preloads the policies and creates the bootstrap principals before the services start. If the principal already exists, it does not replace it: it only adds the configured grants that are still missing. You can keep the entry in `values.yaml` across upgrades."},{heading:"prepare-the-identity-provider",content:"Create the role or group you will use to administer Lamassu. Assign it to at least two controlled human identities. If your provider does not use `realm_access.roles`, adapt the claim path in both the frontend and `auth_config.claims`."},{heading:"configure-the-two-jwt-validations",content:"The Gateway uses `auth.authentication.apiGateway.jwks` to authenticate requests. `authz` uses `services.authz.jwkUrl` to resolve OIDC principals. Both endpoints must contain the keys of the same issuer and be reachable from their respective components."},{heading:"install-and-verify-administrative-access",content:"Sign in with an identity holding `pki-admin`. Confirm it can access authorization administration and perform a non-destructive read operation."},{heading:"test-an-unprivileged-identity",content:"Use a second user without the role and confirm the same operation is denied. This test catches misread claims, overly broad policies and accidental `failOpen` configurations."},{heading:"reduce-use-of-the-bootstrap-administrator",content:"Create operational principals with narrower policies. Reserve `pki-admin` for authorization administration and recovery, not for daily work."},{heading:"fastlane-bootstrap",content:"Fastlane installs a Keycloak realm for the lab and creates the user `lamassu` with the temporary password `lamassu`, the role `pki-admin` and a mandatory password change. Its bootstrap principal matches through `preferred_username=lamassu`."},{heading:"fastlane-bootstrap",content:"Change the password on first login. Do not reuse the Fastlane user, password or IdP as a production design."},{heading:"design-least-privilege-roles",content:"Avoid reproducing your company's internal structure with dozens of nearly identical policies. Start from the responsibilities that actually need access:"},{heading:"design-least-privilege-roles",content:"**Authorization administration**: manages principals, policies and grants. It should belong to a small, separate group."},{heading:"design-least-privilege-roles",content:"**PKI operation**: administers CAs, profiles and certificates, but not necessarily who gets access."},{heading:"design-least-privilege-roles",content:"**Device registration**: operates devices and DMSs without receiving permissions over keys or authorization configuration."},{heading:"design-least-privilege-roles",content:"**Audit**: reviews configuration and activity without creating, modifying, signing, revoking or deleting."},{heading:"design-least-privilege-roles",content:"**Automation**: uses a technical account or a separate certificate, with permissions limited to the flow and resources it controls."},{heading:"design-least-privilege-roles",content:'For each role, separate "view" from "change", limit resources through grants, relations or attributes and avoid `*` unless the role must automatically cover future actions.'},{heading:"design-least-privilege-roles",content:'A rule with `actions: ["*"]` expands to every action defined by the schema. When a new version adds an action, a wildcard policy may start granting it. Review these policies on every upgrade.'},{heading:"changes-and-access-revocation",content:"To revoke access immediately, disable the principal or revoke its grants. Disabling a principal keeps its configuration and associations for investigation or restoration, but it stops taking part in matching."},{heading:"changes-and-access-revocation",content:"Deleting a role or group in the IdP prevents new tokens from containing the claim, but an already-issued token may remain valid until it expires. If removal is urgent, combine the IdP change with disabling the principal in Lamassu and revoking sessions or tokens at the provider."},{heading:"changes-and-access-revocation",content:"When you edit a shared policy, remember the change affects all its principals. To test a new scope, create a separate policy, grant it to a test identity and validate allowed and denied operations before replacing the old one."},{heading:"operational-checklist",content:"Keep `failOpen: false` unless a documented risk assessment justifies otherwise."},{heading:"operational-checklist",content:"Use groups or stable roles for people and independent identities for automations."},{heading:"operational-checklist",content:"Keep at least two recovery administrators and test their access periodically."},{heading:"operational-checklist",content:"Review active principals, their matches and their grants after IdP changes."},{heading:"operational-checklist",content:"Search for wildcards in policies before upgrading Lamassu."},{heading:"operational-checklist",content:"Always test one allowed and one denied operation for each role."},{heading:"operational-checklist",content:"Correlate changes to principals, policies and grants with the audit logs."},{heading:"the-response-is-401",content:"Authentication failed before permissions were evaluated. Check the JWT signature and expiration, issuer, audience and the availability of the JWKS configured in the Gateway. For X.509, check that the client certificate reaches the point that extracts the credential."},{heading:"the-response-is-403",content:"The credential could be processed but did not produce a positive authorization. Review in this order:"},{heading:"the-response-is-403",content:"that an active principal of the correct type exists;"},{heading:"the-response-is-403",content:"that the claim paths and values match the real token exactly;"},{heading:"the-response-is-403",content:"that all of the principal's conditions hold;"},{heading:"the-response-is-403",content:"that the principal has the expected policy granted;"},{heading:"the-response-is-403",content:"that the policy includes the action and the requested resource type or route;"},{heading:"the-response-is-403",content:"that the identifier, relation, column filter or HTTP constraint includes the real resource."},{heading:"the-response-is-403",content:"In the `authz` logs, an external endpoint decision includes `allowed`, `reason`, `matched_principals`, `evaluated_policy_ids`, `matched_policy_id` and the status code. These fields let you separate a matching failure from a permissions failure."},{heading:"everything-returns-403",content:"Check that the bootstrap principal was created and that the policies were preloaded by the migration Job. Also verify that `services.authz.jwkUrl` is reachable from the `authz` pod; do not assume that a URL accessible from the browser also works inside the cluster."},{heading:"everything-fails-when-authz-is-unavailable",content:"This is the expected behavior with `failOpen: false`. Restore the service, its PostgreSQL connection and its JWKS connectivity. Do not temporarily switch to `failOpen: true` without accepting that protected routes could become accessible without an authorization decision."},{heading:"everything-fails-when-authz-is-unavailable",content:"Continue with Audit logs to investigate configuration changes or with Troubleshooting to diagnose the deployment."}],headings:[{id:"essential-concepts",content:"Essential concepts"},{id:"two-decision-systems",content:"Two decision systems"},{id:"integrated-or-external-http-services",content:"Integrated or external HTTP services"},{id:"services-developed-by-lamassu",content:"Services developed by Lamassu"},{id:"how-the-two-paths-relate",content:"How the two paths relate"},{id:"oidc-principals",content:"OIDC principals"},{id:"x509-principals",content:"X.509 principals"},{id:"when-several-principals-match",content:"When several principals match"},{id:"how-policies-express-access",content:"How policies express access"},{id:"global-and-direct-access",content:"Global and direct access"},{id:"access-inherited-through-relations",content:"Access inherited through relations"},{id:"attribute-filtered-access",content:"Attribute-filtered access"},{id:"http-rules",content:"HTTP rules"},{id:"included-policies",content:"Included policies"},{id:"provision-the-first-administrator",content:"Provision the first administrator"},{id:"prepare-the-identity-provider",content:"Prepare the identity provider"},{id:"configure-the-two-jwt-validations",content:"Configure the two JWT validations"},{id:"install-and-verify-administrative-access",content:"Install and verify administrative access"},{id:"test-an-unprivileged-identity",content:"Test an unprivileged identity"},{id:"reduce-use-of-the-bootstrap-administrator",content:"Reduce use of the bootstrap administrator"},{id:"fastlane-bootstrap",content:"Fastlane bootstrap"},{id:"design-least-privilege-roles",content:"Design least-privilege roles"},{id:"changes-and-access-revocation",content:"Changes and access revocation"},{id:"operational-checklist",content:"Operational checklist"},{id:"diagnostics",content:"Diagnostics"},{id:"the-response-is-401",content:"The response is 401"},{id:"the-response-is-403",content:"The response is 403"},{id:"everything-returns-403",content:"Everything returns 403"},{id:"everything-fails-when-authz-is-unavailable",content:"Everything fails when authz is unavailable"}]};const d=[{depth:2,url:"#essential-concepts",title:e.jsx(e.Fragment,{children:"Essential concepts"})},{depth:2,url:"#two-decision-systems",title:e.jsx(e.Fragment,{children:"Two decision systems"})},{depth:3,url:"#integrated-or-external-http-services",title:e.jsx(e.Fragment,{children:"Integrated or external HTTP services"})},{depth:3,url:"#services-developed-by-lamassu",title:e.jsx(e.Fragment,{children:"Services developed by Lamassu"})},{depth:3,url:"#how-the-two-paths-relate",title:e.jsx(e.Fragment,{children:"How the two paths relate"})},{depth:2,url:"#oidc-principals",title:e.jsx(e.Fragment,{children:"OIDC principals"})},{depth:2,url:"#x509-principals",title:e.jsx(e.Fragment,{children:"X.509 principals"})},{depth:2,url:"#when-several-principals-match",title:e.jsx(e.Fragment,{children:"When several principals match"})},{depth:2,url:"#how-policies-express-access",title:e.jsx(e.Fragment,{children:"How policies express access"})},{depth:3,url:"#global-and-direct-access",title:e.jsx(e.Fragment,{children:"Global and direct access"})},{depth:3,url:"#access-inherited-through-relations",title:e.jsx(e.Fragment,{children:"Access inherited through relations"})},{depth:3,url:"#attribute-filtered-access",title:e.jsx(e.Fragment,{children:"Attribute-filtered access"})},{depth:3,url:"#http-rules",title:e.jsx(e.Fragment,{children:"HTTP rules"})},{depth:2,url:"#included-policies",title:e.jsx(e.Fragment,{children:"Included policies"})},{depth:2,url:"#provision-the-first-administrator",title:e.jsx(e.Fragment,{children:"Provision the first administrator"})},{depth:3,url:"#prepare-the-identity-provider",title:e.jsx(e.Fragment,{children:"Prepare the identity provider"})},{depth:3,url:"#configure-the-two-jwt-validations",title:e.jsx(e.Fragment,{children:"Configure the two JWT validations"})},{depth:3,url:"#install-and-verify-administrative-access",title:e.jsx(e.Fragment,{children:"Install and verify administrative access"})},{depth:3,url:"#test-an-unprivileged-identity",title:e.jsx(e.Fragment,{children:"Test an unprivileged identity"})},{depth:3,url:"#reduce-use-of-the-bootstrap-administrator",title:e.jsx(e.Fragment,{children:"Reduce use of the bootstrap administrator"})},{depth:2,url:"#fastlane-bootstrap",title:e.jsx(e.Fragment,{children:"Fastlane bootstrap"})},{depth:2,url:"#design-least-privilege-roles",title:e.jsx(e.Fragment,{children:"Design least-privilege roles"})},{depth:2,url:"#changes-and-access-revocation",title:e.jsx(e.Fragment,{children:"Changes and access revocation"})},{depth:2,url:"#operational-checklist",title:e.jsx(e.Fragment,{children:"Operational checklist"})},{depth:2,url:"#diagnostics",title:e.jsx(e.Fragment,{children:"Diagnostics"})},{depth:3,url:"#the-response-is-401",title:e.jsx(e.Fragment,{children:"The response is 401"})},{depth:3,url:"#the-response-is-403",title:e.jsx(e.Fragment,{children:"The response is 403"})},{depth:3,url:"#everything-returns-403",title:e.jsx(e.Fragment,{children:"Everything returns 403"})},{depth:3,url:"#everything-fails-when-authz-is-unavailable",title:e.jsx(e.Fragment,{children:"Everything fails when authz is unavailable"})}];function o(t){const i={a:"a",code:"code",h2:"h2",h3:"h3",li:"li",ol:"ol",p:"p",pre:"pre",span:"span",strong:"strong",ul:"ul",...t.components},{Callout:s,Step:n,Steps:r}=i;return s||a("Callout"),n||a("Step"),r||a("Steps"),e.jsxs(e.Fragment,{children:[e.jsxs(i.p,{children:["Lamassu access control turns an authenticated identity into concrete permissions. The OIDC provider or the client certificate proves ",e.jsx(i.strong,{children:"who"})," makes a request; the ",e.jsx(i.code,{children:"authz"})," service decides ",e.jsx(i.strong,{children:"what that identity can do"})," and ",e.jsx(i.strong,{children:"over which resources"}),"."]}),`
`,e.jsx(i.p,{children:"Lamassu does not assign permissions directly to users. The full chain is:"}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes min-light min-dark",style:{"--shiki-light":"#24292eff","--shiki-dark":"#b392f0","--shiki-light-bg":"#ffffff","--shiki-dark-bg":"#1f1f1f"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsx(i.code,{children:e.jsx(i.span,{className:"line",children:e.jsx(i.span,{children:"credential → matching principal → granted policies → rules → decision"})})})})}),`
`,e.jsx(i.p,{children:"This model lets you represent people, identity-provider groups, service accounts and devices without coupling authorization to a specific provider."}),`
`,e.jsx(i.h2,{id:"essential-concepts",children:"Essential concepts"}),`
`,e.jsxs(i.p,{children:["A ",e.jsx(i.strong,{children:"principal"})," connects a credential to Lamassu. It defines how to recognize an OIDC or X.509 identity and can be active or disabled."]}),`
`,e.jsxs(i.p,{children:["A ",e.jsx(i.strong,{children:"policy"})," groups reusable permissions. It can be granted to several principals and can contain rules about Lamassu entities, rules about HTTP routes or both."]}),`
`,e.jsxs(i.p,{children:["An ",e.jsx(i.strong,{children:"entity rule"})," grants actions over resources such as certification authorities, certificates, issuance profiles, devices, DMSs, keys or alert subscriptions. It can cover all resources of a type or be limited by identifier, relation or attribute."]}),`
`,e.jsxs(i.p,{children:["An ",e.jsx(i.strong,{children:"HTTP rule"})," grants actions associated with API routes. It is the mechanism the Gateway uses to decide whether a request may cross the perimeter."]}),`
`,e.jsxs(i.p,{children:["A ",e.jsx(i.strong,{children:"grant"})," is the association between a principal and a policy. Removing the grant removes all permissions contributed by that policy, without modifying it for other principals."]}),`
`,e.jsx(s,{type:"info",title:"Authentication and authorization are distinct controls",children:e.jsx(i.p,{children:"A valid JWT or a valid client certificate does not grant access by itself. The credential must match at least one active principal and one of its policies must allow the requested operation."})}),`
`,e.jsx(i.h2,{id:"two-decision-systems",children:"Two decision systems"}),`
`,e.jsx(i.p,{children:"Lamassu uses two authorization paths depending on who implements the protected service. They share principals, policies and grants, but they do not interpret the rules the same way."}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes min-light min-dark",style:{"--shiki-light":"#24292eff","--shiki-dark":"#b392f0","--shiki-light-bg":"#ffffff","--shiki-dark-bg":"#1f1f1f"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(i.code,{children:[e.jsx(i.span,{className:"line",children:e.jsx(i.span,{children:"Integrated or external HTTP services → Gateway → HTTP rules"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{children:"Services developed by Lamassu  → service middleware → entity rules"})})]})})}),`
`,e.jsx(s,{type:"info",title:"The difference lies in the integration point",children:e.jsx(i.p,{children:"An external service can be protected without knowing Lamassu's internal authorization model. A service developed by Lamassu embeds the authorization engine and can decide on concrete resources and filter its queries."})}),`
`,e.jsx(i.h3,{id:"integrated-or-external-http-services",children:"Integrated or external HTTP services"}),`
`,e.jsxs(i.p,{children:["This path protects APIs that join the platform through the Gateway but do not natively implement Lamassu's authorization SDK. Job Manager is the current example. The same pattern allows integrating other HTTP services as long as their routes are described in an ",e.jsx(i.code,{children:"authz"})," HTTP schema."]}),`
`,e.jsxs(i.p,{children:["The decision is made ",e.jsx(i.strong,{children:"before forwarding the request to the service"}),":"]}),`
`,e.jsxs(i.ol,{children:[`
`,e.jsx(i.li,{children:"Envoy Gateway authenticates the request, usually validating a JWT against the OIDC provider's JWKS."}),`
`,e.jsxs(i.li,{children:["For a protected route, Envoy sends the method, URL, headers and required data to ",e.jsx(i.code,{children:"/v1/ext_authz/check"}),"."]}),`
`,e.jsxs(i.li,{children:[e.jsx(i.code,{children:"authz"})," extracts the credential and resolves all active principals matching it."]}),`
`,e.jsx(i.li,{children:"It separately loads the policies granted to each principal."}),`
`,e.jsxs(i.li,{children:["The HTTP schema translates the method and route combination into a logical action, such as ",e.jsx(i.code,{children:"nbi-job-read"})," or ",e.jsx(i.code,{children:"nbi-workflow-create"}),"."]}),`
`,e.jsxs(i.li,{children:[e.jsx(i.code,{children:"authz"})," looks for an HTTP rule granting that action."]}),`
`,e.jsx(i.li,{children:"If the route declares constraints, it compares request data with the normalized attributes of the same principal contributing the policy."}),`
`,e.jsx(i.li,{children:"A satisfying result lets Envoy forward the request; any other response blocks it at the Gateway."}),`
`]}),`
`,e.jsxs(i.p,{children:["When it allows access, ",e.jsx(i.code,{children:"authz"})," returns the selected principal in ",e.jsx(i.code,{children:"x-current-user"}),". The Gateway can propagate that header to the service to preserve the identity context."]}),`
`,e.jsxs(i.p,{children:["HTTP rules primarily answer ",e.jsx(i.strong,{children:'"can this identity call this API operation?"'}),". On their own they do not produce filters over the external service's database. To limit a route to a specific device, tenant or client, the schema must declare a constraint relating a request value to a normalized attribute of the principal."]}),`
`,e.jsx(i.h3,{id:"services-developed-by-lamassu",children:"Services developed by Lamassu"}),`
`,e.jsx(i.p,{children:"Lamassu's native services embed authorization in their middleware and know the entities they operate on: certificates, CAs, issuance profiles, keys, devices, DMSs or subscriptions, among others."}),`
`,e.jsx(i.p,{children:"The decision is made with the domain operation context:"}),`
`,e.jsxs(i.ol,{children:[`
`,e.jsx(i.li,{children:"The middleware extracts the credential and resolves the matching principals."}),`
`,e.jsx(i.li,{children:"The endpoint identifies the action, the entity type and, when applicable, the key of the requested resource."}),`
`,e.jsxs(i.li,{children:[e.jsx(i.code,{children:"authz"})," gathers the entity rules of the granted policies."]}),`
`,e.jsx(i.li,{children:"The engine evaluates direct grants, attribute filters and relations with other entities."}),`
`,e.jsx(i.li,{children:"For an individual operation, it checks that the concrete resource satisfies the computed scope."}),`
`,e.jsx(i.li,{children:"For a listing, it generates a SQL filter that the service adds to its own query."}),`
`]}),`
`,e.jsxs(i.p,{children:["Here the engine answers ",e.jsx(i.strong,{children:'"can this identity perform this action on this concrete resource?"'}),"."]}),`
`,e.jsx(i.p,{children:"Actions fall into two groups:"}),`
`,e.jsxs(i.ul,{children:[`
`,e.jsxs(i.li,{children:[e.jsx(i.strong,{children:"Global actions"})," do not need a resource identifier. ",e.jsx(i.code,{children:"create"}),", ",e.jsx(i.code,{children:"import"})," or access to a console section are common examples."]}),`
`,e.jsxs(i.li,{children:[e.jsx(i.strong,{children:"Atomic actions"})," are evaluated on a concrete instance. For certificates these include ",e.jsx(i.code,{children:"read"}),", ",e.jsx(i.code,{children:"metadata-update"}),", ",e.jsx(i.code,{children:"status-update"})," and ",e.jsx(i.code,{children:"delete"}),"; for a CA there are also ",e.jsx(i.code,{children:"sign"}),", ",e.jsx(i.code,{children:"reissue"})," and other lifecycle operations."]}),`
`]}),`
`,e.jsx(i.p,{children:"Filtering inside the service prevents leaks in listings: unauthorized resources are excluded from the SQL query instead of being fetched and hidden later in the interface."}),`
`,e.jsx(i.h3,{id:"how-the-two-paths-relate",children:"How the two paths relate"}),`
`,e.jsx(i.p,{children:"They are not two equivalent controls applied twice. HTTP rules protect the perimeter of an integrated service; entity rules express permissions over the data model of the native services."}),`
`,e.jsx(i.p,{children:"A policy can contain both rule types when an identity needs to operate Lamassu resources and also call an integrated API. Granting an entity rule does not automatically grant an HTTP action, nor does an HTTP rule create access over an entity."}),`
`,e.jsx(s,{type:"warn",title:"Deny by default",children:e.jsxs(i.p,{children:["If no combination of principal, policy and rule allows the operation, Lamassu denies it. Additionally, ",e.jsx(i.code,{children:"auth.externalAuthorization.failOpen"})," is ",e.jsx(i.code,{children:"false"})," by default: if ",e.jsx(i.code,{children:"authz"})," is unavailable, the Gateway blocks protected routes."]})}),`
`,e.jsx(i.h2,{id:"oidc-principals",children:"OIDC principals"}),`
`,e.jsx(i.p,{children:"An OIDC principal matches the claims of a validated JWT. It is appropriate for human users, corporate groups, IdP roles and service accounts that obtain tokens."}),`
`,e.jsxs(i.p,{children:["The following principal represents any identity holding the ",e.jsx(i.code,{children:"pki-operators"})," role in Keycloak:"]}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes min-light min-dark",style:{"--shiki-light":"#24292eff","--shiki-dark":"#b392f0","--shiki-light-bg":"#ffffff","--shiki-dark-bg":"#1f1f1f"},tabIndex:"0",title:"OIDC principal by role",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(i.code,{children:[e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292EFF","--shiki-dark":"#B392F0"},children:"{"})}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:'  "id"'}),e.jsx(i.span,{style:{"--shiki-light":"#212121","--shiki-dark":"#BBBBBB"},children:":"}),e.jsx(i.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#FFAB70"},children:' "oidc:pki-operators"'}),e.jsx(i.span,{style:{"--shiki-light":"#212121","--shiki-dark":"#BBBBBB"},children:","})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:'  "name"'}),e.jsx(i.span,{style:{"--shiki-light":"#212121","--shiki-dark":"#BBBBBB"},children:":"}),e.jsx(i.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#FFAB70"},children:' "PKI Operators"'}),e.jsx(i.span,{style:{"--shiki-light":"#212121","--shiki-dark":"#BBBBBB"},children:","})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:'  "description"'}),e.jsx(i.span,{style:{"--shiki-light":"#212121","--shiki-dark":"#BBBBBB"},children:":"}),e.jsx(i.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#FFAB70"},children:' "Team responsible for daily operation"'}),e.jsx(i.span,{style:{"--shiki-light":"#212121","--shiki-dark":"#BBBBBB"},children:","})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:'  "type"'}),e.jsx(i.span,{style:{"--shiki-light":"#212121","--shiki-dark":"#BBBBBB"},children:":"}),e.jsx(i.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#FFAB70"},children:' "oidc"'}),e.jsx(i.span,{style:{"--shiki-light":"#212121","--shiki-dark":"#BBBBBB"},children:","})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:'  "active"'}),e.jsx(i.span,{style:{"--shiki-light":"#212121","--shiki-dark":"#BBBBBB"},children:":"}),e.jsx(i.span,{style:{"--shiki-light":"#1976D2","--shiki-dark":"#79B8FF"},children:" true"}),e.jsx(i.span,{style:{"--shiki-light":"#212121","--shiki-dark":"#BBBBBB"},children:","})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:'  "auth_config"'}),e.jsx(i.span,{style:{"--shiki-light":"#212121","--shiki-dark":"#BBBBBB"},children:":"}),e.jsx(i.span,{style:{"--shiki-light":"#24292EFF","--shiki-dark":"#B392F0"},children:" {"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:'    "claims"'}),e.jsx(i.span,{style:{"--shiki-light":"#212121","--shiki-dark":"#BBBBBB"},children:":"}),e.jsx(i.span,{style:{"--shiki-light":"#24292EFF","--shiki-dark":"#B392F0"},children:" ["})]}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292EFF","--shiki-dark":"#B392F0"},children:"      {"})}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:'        "claim"'}),e.jsx(i.span,{style:{"--shiki-light":"#212121","--shiki-dark":"#BBBBBB"},children:":"}),e.jsx(i.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#FFAB70"},children:' "realm_access.roles"'}),e.jsx(i.span,{style:{"--shiki-light":"#212121","--shiki-dark":"#BBBBBB"},children:","})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:'        "operator"'}),e.jsx(i.span,{style:{"--shiki-light":"#212121","--shiki-dark":"#BBBBBB"},children:":"}),e.jsx(i.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#FFAB70"},children:' "contains"'}),e.jsx(i.span,{style:{"--shiki-light":"#212121","--shiki-dark":"#BBBBBB"},children:","})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:'        "value"'}),e.jsx(i.span,{style:{"--shiki-light":"#212121","--shiki-dark":"#BBBBBB"},children:":"}),e.jsx(i.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#FFAB70"},children:' "pki-operators"'})]}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292EFF","--shiki-dark":"#B392F0"},children:"      }"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292EFF","--shiki-dark":"#B392F0"},children:"    ]"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292EFF","--shiki-dark":"#B392F0"},children:"  }"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292EFF","--shiki-dark":"#B392F0"},children:"}"})})]})})}),`
`,e.jsxs(i.p,{children:["Claim paths can be nested, such as ",e.jsx(i.code,{children:"realm_access.roles"}),". Within a single principal, ",e.jsx(i.strong,{children:"all"})," conditions must hold. This lets you require, for example, a group and an organizational audience at the same time."]}),`
`,e.jsx(i.p,{children:"The implemented operators are:"}),`
`,e.jsxs(i.ul,{children:[`
`,e.jsxs(i.li,{children:[e.jsx(i.code,{children:"equals"}),", for exact equality;"]}),`
`,e.jsxs(i.li,{children:[e.jsx(i.code,{children:"contains"}),", to check membership in a list or the presence of text in a scalar value."]}),`
`]}),`
`,e.jsxs(i.p,{children:["Design matching with stable attributes. For people, it is usually better to bind permissions to centrally managed groups or roles than to the email or username. For a service account, a stable ",e.jsx(i.code,{children:"sub"})," keeps its permissions from mixing with a human operator's."]}),`
`,e.jsx(s,{type:"warn",title:"Do not use matches yet",children:e.jsxs(i.p,{children:["Although the model recognizes the operator name ",e.jsx(i.code,{children:"matches"}),", the current implementation does not evaluate regular expressions and the condition never matches. Use ",e.jsx(i.code,{children:"equals"})," or ",e.jsx(i.code,{children:"contains"}),"."]})}),`
`,e.jsx(i.h2,{id:"x509-principals",children:"X.509 principals"}),`
`,e.jsx(i.p,{children:"An X.509 principal lets you recognize a workload or a device by its client certificate. Lamassu checks the certificate signature against the configured CA and, depending on the mode, also its serial number or Common Name."}),`
`,e.jsx(i.p,{children:"The available modes are:"}),`
`,e.jsxs(i.ul,{children:[`
`,e.jsxs(i.li,{children:[e.jsx(i.code,{children:"serial_and_ca"}),": an exact certificate, identified by serial number and CA;"]}),`
`,e.jsxs(i.li,{children:[e.jsx(i.code,{children:"cn_and_ca"}),": an exact or wildcard Common Name and a specific CA;"]}),`
`,e.jsxs(i.li,{children:[e.jsx(i.code,{children:"any_from_ca"}),": any certificate issued directly by the given CA."]}),`
`]}),`
`,e.jsxs(i.p,{children:["This example recognizes certificates whose CN starts with ",e.jsx(i.code,{children:"factory-a-"})," and that are signed by the configured CA:"]}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes min-light min-dark",style:{"--shiki-light":"#24292eff","--shiki-dark":"#b392f0","--shiki-light-bg":"#ffffff","--shiki-dark-bg":"#1f1f1f"},tabIndex:"0",title:"X.509 principal by CN and CA",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(i.code,{children:[e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292EFF","--shiki-dark":"#B392F0"},children:"{"})}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:'  "id"'}),e.jsx(i.span,{style:{"--shiki-light":"#212121","--shiki-dark":"#BBBBBB"},children:":"}),e.jsx(i.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#FFAB70"},children:' "x509:factory-a-devices"'}),e.jsx(i.span,{style:{"--shiki-light":"#212121","--shiki-dark":"#BBBBBB"},children:","})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:'  "name"'}),e.jsx(i.span,{style:{"--shiki-light":"#212121","--shiki-dark":"#BBBBBB"},children:":"}),e.jsx(i.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#FFAB70"},children:' "Factory A devices"'}),e.jsx(i.span,{style:{"--shiki-light":"#212121","--shiki-dark":"#BBBBBB"},children:","})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:'  "type"'}),e.jsx(i.span,{style:{"--shiki-light":"#212121","--shiki-dark":"#BBBBBB"},children:":"}),e.jsx(i.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#FFAB70"},children:' "x509"'}),e.jsx(i.span,{style:{"--shiki-light":"#212121","--shiki-dark":"#BBBBBB"},children:","})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:'  "active"'}),e.jsx(i.span,{style:{"--shiki-light":"#212121","--shiki-dark":"#BBBBBB"},children:":"}),e.jsx(i.span,{style:{"--shiki-light":"#1976D2","--shiki-dark":"#79B8FF"},children:" true"}),e.jsx(i.span,{style:{"--shiki-light":"#212121","--shiki-dark":"#BBBBBB"},children:","})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:'  "auth_config"'}),e.jsx(i.span,{style:{"--shiki-light":"#212121","--shiki-dark":"#BBBBBB"},children:":"}),e.jsx(i.span,{style:{"--shiki-light":"#24292EFF","--shiki-dark":"#B392F0"},children:" {"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:'    "match_mode"'}),e.jsx(i.span,{style:{"--shiki-light":"#212121","--shiki-dark":"#BBBBBB"},children:":"}),e.jsx(i.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#FFAB70"},children:' "cn_and_ca"'}),e.jsx(i.span,{style:{"--shiki-light":"#212121","--shiki-dark":"#BBBBBB"},children:","})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:'    "subject_cn"'}),e.jsx(i.span,{style:{"--shiki-light":"#212121","--shiki-dark":"#BBBBBB"},children:":"}),e.jsx(i.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#FFAB70"},children:' "factory-a-*"'}),e.jsx(i.span,{style:{"--shiki-light":"#212121","--shiki-dark":"#BBBBBB"},children:","})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:'    "ca_trust"'}),e.jsx(i.span,{style:{"--shiki-light":"#212121","--shiki-dark":"#BBBBBB"},children:":"}),e.jsx(i.span,{style:{"--shiki-light":"#24292EFF","--shiki-dark":"#B392F0"},children:" {"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:'      "pem"'}),e.jsx(i.span,{style:{"--shiki-light":"#212121","--shiki-dark":"#BBBBBB"},children:":"}),e.jsx(i.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#FFAB70"},children:' "<CA-certificate-in-PEM-or-base64>"'}),e.jsx(i.span,{style:{"--shiki-light":"#212121","--shiki-dark":"#BBBBBB"},children:","})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:'      "identity_type"'}),e.jsx(i.span,{style:{"--shiki-light":"#212121","--shiki-dark":"#BBBBBB"},children:":"}),e.jsx(i.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#FFAB70"},children:' "fingerprint"'}),e.jsx(i.span,{style:{"--shiki-light":"#212121","--shiki-dark":"#BBBBBB"},children:","})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:'      "value"'}),e.jsx(i.span,{style:{"--shiki-light":"#212121","--shiki-dark":"#BBBBBB"},children:":"}),e.jsx(i.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#FFAB70"},children:' "SHA256:<sha256-fingerprint-of-the-ca>"'})]}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292EFF","--shiki-dark":"#B392F0"},children:"    }"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292EFF","--shiki-dark":"#B392F0"},children:"  }"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292EFF","--shiki-dark":"#B392F0"},children:"}"})})]})})}),`
`,e.jsxs(i.p,{children:[e.jsx(i.code,{children:"ca_trust.identity_type"})," accepts ",e.jsx(i.code,{children:"fingerprint"})," or ",e.jsx(i.code,{children:"authority_key_id"}),". In both cases you must provide the CA certificate in ",e.jsx(i.code,{children:"ca_trust.pem"}),"; Lamassu verifies both the signature and the expected identity of the CA."]}),`
`,e.jsxs(i.p,{children:["Use ",e.jsx(i.code,{children:"any_from_ca"})," only when every identity issued by that CA should share the same permissions. If a CA issues certificates for different populations, separate access by serial or CN, or use different issuing CAs."]}),`
`,e.jsx(i.h2,{id:"when-several-principals-match",children:"When several principals match"}),`
`,e.jsx(i.p,{children:"A single credential can match more than one principal. It is common for a user to match a principal of their team and another of their operational function."}),`
`,e.jsx(i.p,{children:"For entity permissions, Lamassu combines permissions with OR logic: it is enough that one policy of one of the principals allows the action. Listings contain the union of the resources visible to all of them."}),`
`,e.jsx(i.p,{children:"HTTP routes with constraints are stricter. The same principal contributing the policy must also satisfy the attributes required by the route. Lamassu does not combine one principal's policy with an attribute belonging to another."}),`
`,e.jsx(i.p,{children:"For this reason, adding a matching principal can only broaden access. Before creating overlapping rules, review the full set of policies a real identity will receive."}),`
`,e.jsx(i.h2,{id:"how-policies-express-access",children:"How policies express access"}),`
`,e.jsx(i.h3,{id:"global-and-direct-access",children:"Global and direct access"}),`
`,e.jsxs(i.p,{children:["A rule identifies the domain (",e.jsx(i.code,{children:"namespace"}),"), the data schema (",e.jsx(i.code,{children:"schema_name"}),") and the entity type (",e.jsx(i.code,{children:"entity_type"}),"). ",e.jsx(i.code,{children:"actions"})," lists the allowed operations."]}),`
`,e.jsxs(i.p,{children:[e.jsx(i.code,{children:"direct_grants"})," limits the rule to concrete identifiers. The value ",e.jsx(i.code,{children:"*"})," covers all instances of the type. A superadministrator policy uses wildcards in schema, entity, actions and grants; a least-privilege policy should avoid them whenever possible."]}),`
`,e.jsx(i.h3,{id:"access-inherited-through-relations",children:"Access inherited through relations"}),`
`,e.jsx(i.p,{children:"Rules can follow relations declared between entities. For example, the schema knows the relation of a certificate to its issuing CA and of a device to its DMS. A policy can grant access to a parent resource and propagate selected actions to its related resources."}),`
`,e.jsx(i.p,{children:'This lets you express models like "can operate the devices of this DMS" without maintaining an individual list of every device. When a resource is added under that relation, it inherits the scope planned by the policy.'}),`
`,e.jsx(i.h3,{id:"attribute-filtered-access",children:"Attribute-filtered access"}),`
`,e.jsxs(i.p,{children:[e.jsx(i.code,{children:"column_filters"})," applies conditions to columns the schema has declared filterable. All filters of the same rule are combined with AND."]}),`
`,e.jsx(i.p,{children:"For example, this rule allows reading active certificates issued by a specific CA:"}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes min-light min-dark",style:{"--shiki-light":"#24292eff","--shiki-dark":"#b392f0","--shiki-light-bg":"#ffffff","--shiki-dark-bg":"#1f1f1f"},tabIndex:"0",title:"Attribute-limited rule",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(i.code,{children:[e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292EFF","--shiki-dark":"#B392F0"},children:"{"})}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:'  "namespace"'}),e.jsx(i.span,{style:{"--shiki-light":"#212121","--shiki-dark":"#BBBBBB"},children:":"}),e.jsx(i.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#FFAB70"},children:' "pki"'}),e.jsx(i.span,{style:{"--shiki-light":"#212121","--shiki-dark":"#BBBBBB"},children:","})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:'  "schema_name"'}),e.jsx(i.span,{style:{"--shiki-light":"#212121","--shiki-dark":"#BBBBBB"},children:":"}),e.jsx(i.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#FFAB70"},children:' "ca"'}),e.jsx(i.span,{style:{"--shiki-light":"#212121","--shiki-dark":"#BBBBBB"},children:","})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:'  "entity_type"'}),e.jsx(i.span,{style:{"--shiki-light":"#212121","--shiki-dark":"#BBBBBB"},children:":"}),e.jsx(i.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#FFAB70"},children:' "certificate"'}),e.jsx(i.span,{style:{"--shiki-light":"#212121","--shiki-dark":"#BBBBBB"},children:","})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:'  "actions"'}),e.jsx(i.span,{style:{"--shiki-light":"#212121","--shiki-dark":"#BBBBBB"},children:":"}),e.jsx(i.span,{style:{"--shiki-light":"#24292EFF","--shiki-dark":"#B392F0"},children:" ["}),e.jsx(i.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#FFAB70"},children:'"read"'}),e.jsx(i.span,{style:{"--shiki-light":"#24292EFF","--shiki-dark":"#B392F0"},children:"]"}),e.jsx(i.span,{style:{"--shiki-light":"#212121","--shiki-dark":"#BBBBBB"},children:","})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:'  "relations"'}),e.jsx(i.span,{style:{"--shiki-light":"#212121","--shiki-dark":"#BBBBBB"},children:":"}),e.jsx(i.span,{style:{"--shiki-light":"#24292EFF","--shiki-dark":"#B392F0"},children:" []"}),e.jsx(i.span,{style:{"--shiki-light":"#212121","--shiki-dark":"#BBBBBB"},children:","})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:'  "column_filters"'}),e.jsx(i.span,{style:{"--shiki-light":"#212121","--shiki-dark":"#BBBBBB"},children:":"}),e.jsx(i.span,{style:{"--shiki-light":"#24292EFF","--shiki-dark":"#B392F0"},children:" ["})]}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292EFF","--shiki-dark":"#B392F0"},children:"    {"})}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:'      "column"'}),e.jsx(i.span,{style:{"--shiki-light":"#212121","--shiki-dark":"#BBBBBB"},children:":"}),e.jsx(i.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#FFAB70"},children:' "status"'}),e.jsx(i.span,{style:{"--shiki-light":"#212121","--shiki-dark":"#BBBBBB"},children:","})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:'      "type"'}),e.jsx(i.span,{style:{"--shiki-light":"#212121","--shiki-dark":"#BBBBBB"},children:":"}),e.jsx(i.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#FFAB70"},children:' "string"'}),e.jsx(i.span,{style:{"--shiki-light":"#212121","--shiki-dark":"#BBBBBB"},children:","})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:'      "operator"'}),e.jsx(i.span,{style:{"--shiki-light":"#212121","--shiki-dark":"#BBBBBB"},children:":"}),e.jsx(i.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#FFAB70"},children:' "eq"'}),e.jsx(i.span,{style:{"--shiki-light":"#212121","--shiki-dark":"#BBBBBB"},children:","})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:'      "value"'}),e.jsx(i.span,{style:{"--shiki-light":"#212121","--shiki-dark":"#BBBBBB"},children:":"}),e.jsx(i.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#FFAB70"},children:' "ACTIVE"'})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292EFF","--shiki-dark":"#B392F0"},children:"    }"}),e.jsx(i.span,{style:{"--shiki-light":"#212121","--shiki-dark":"#BBBBBB"},children:","})]}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292EFF","--shiki-dark":"#B392F0"},children:"    {"})}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:'      "column"'}),e.jsx(i.span,{style:{"--shiki-light":"#212121","--shiki-dark":"#BBBBBB"},children:":"}),e.jsx(i.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#FFAB70"},children:' "issuer_meta_id"'}),e.jsx(i.span,{style:{"--shiki-light":"#212121","--shiki-dark":"#BBBBBB"},children:","})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:'      "type"'}),e.jsx(i.span,{style:{"--shiki-light":"#212121","--shiki-dark":"#BBBBBB"},children:":"}),e.jsx(i.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#FFAB70"},children:' "string"'}),e.jsx(i.span,{style:{"--shiki-light":"#212121","--shiki-dark":"#BBBBBB"},children:","})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:'      "operator"'}),e.jsx(i.span,{style:{"--shiki-light":"#212121","--shiki-dark":"#BBBBBB"},children:":"}),e.jsx(i.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#FFAB70"},children:' "eq"'}),e.jsx(i.span,{style:{"--shiki-light":"#212121","--shiki-dark":"#BBBBBB"},children:","})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:'      "value"'}),e.jsx(i.span,{style:{"--shiki-light":"#212121","--shiki-dark":"#BBBBBB"},children:":"}),e.jsx(i.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#FFAB70"},children:' "ca-production"'})]}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292EFF","--shiki-dark":"#B392F0"},children:"    }"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292EFF","--shiki-dark":"#B392F0"},children:"  ]"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292EFF","--shiki-dark":"#B392F0"},children:"}"})})]})})}),`
`,e.jsxs(i.p,{children:["The available operators are ",e.jsx(i.code,{children:"eq"}),", ",e.jsx(i.code,{children:"neq"}),", ",e.jsx(i.code,{children:"gt"}),", ",e.jsx(i.code,{children:"gte"}),", ",e.jsx(i.code,{children:"lt"}),", ",e.jsx(i.code,{children:"lte"}),", ",e.jsx(i.code,{children:"in"})," and ",e.jsx(i.code,{children:"like"}),". Use comparisons consistent with the column type: ",e.jsx(i.code,{children:"like"})," for text, ordering comparisons for numbers or dates and ",e.jsx(i.code,{children:"in"})," when there is a collection of accepted values."]}),`
`,e.jsx(i.h3,{id:"http-rules",children:"HTTP rules"}),`
`,e.jsx(i.p,{children:"HTTP rules do not point directly at tables. They reference a route schema and grant its logical actions. Job Manager's policies are an example: they distinguish reading, creating, updating and deleting workflows or jobs."}),`
`,e.jsxs(i.p,{children:["Some routes also compare a request value — taken from the path, query, header or JSON body — with a normalized attribute of the principal. This way you can verify that a device only queries jobs addressed to its own ",e.jsx(i.code,{children:"client_id"}),"."]}),`
`,e.jsxs(i.p,{children:["Normalized attributes decouple the policy from the authentication mechanism. ",e.jsx(i.code,{children:"subject_attribute_mappings"})," can derive, for example, ",e.jsx(i.code,{children:"device_id"})," from ",e.jsx(i.code,{children:"oidc.claim.device_id"})," or from ",e.jsx(i.code,{children:"x509.subject.cn"}),". The rule consumes ",e.jsx(i.code,{children:"device_id"})," in both cases."]}),`
`,e.jsx(i.h2,{id:"included-policies",children:"Included policies"}),`
`,e.jsxs(i.p,{children:["The ",e.jsx(i.code,{children:"authz"})," preload installs reusable policies for the main domains. Among them are:"]}),`
`,e.jsxs(i.ul,{children:[`
`,e.jsx(i.li,{children:"full and read-only access to certificates and authorities;"}),`
`,e.jsx(i.li,{children:"full and read-only access to the KMS;"}),`
`,e.jsx(i.li,{children:"full and read-only access to Device Manager, DMS Manager, Validation Authority and alerts;"}),`
`,e.jsxs(i.li,{children:["an ",e.jsx(i.code,{children:"Auditor"})," policy with PKI read access and authorization visibility;"]}),`
`,e.jsx(i.li,{children:"console access;"}),`
`,e.jsx(i.li,{children:"administration and observation policies for the Job Manager NBI and SBI APIs;"}),`
`,e.jsxs(i.li,{children:[e.jsx(i.code,{children:"SUPER ADMIN"}),", which grants all actions over the ",e.jsx(i.code,{children:"authz"})," and ",e.jsx(i.code,{children:"pki"})," domains."]}),`
`]}),`
`,e.jsxs(i.p,{children:["Start with these policies before creating others. If none reflects the boundary you need, create a specific, small policy instead of copying ",e.jsx(i.code,{children:"SUPER ADMIN"})," and informally removing permissions."]}),`
`,e.jsx(i.h2,{id:"provision-the-first-administrator",children:"Provision the first administrator"}),`
`,e.jsx(s,{type:"warn",title:"There is no implicit superuser",children:e.jsx(i.p,{children:"An installation without a principal matching your identity is left with nobody able to administer authorization. Configure the IdP and the bootstrap before exposing the platform."})}),`
`,e.jsxs(i.p,{children:["The chart includes a bootstrap principal that looks for the OIDC role ",e.jsx(i.code,{children:"pki-admin"})," in ",e.jsx(i.code,{children:"realm_access.roles"}),". It grants it ",e.jsx(i.code,{children:"SUPER ADMIN"})," and, when Job Manager is enabled, the administrative policy of its NBI API."]}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes min-light min-dark",style:{"--shiki-light":"#24292eff","--shiki-dark":"#b392f0","--shiki-light-bg":"#ffffff","--shiki-dark-bg":"#1f1f1f"},tabIndex:"0",title:"values.yaml",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(i.code,{children:[e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:"auth"}),e.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:":"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:"  authorization"}),e.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:":"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:"    rolesClaim"}),e.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:":"}),e.jsx(i.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#FFAB70"},children:" realm_access.roles"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:"    roles"}),e.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:":"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:"      admin"}),e.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:":"}),e.jsx(i.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#FFAB70"},children:" pki-admin"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:"  externalAuthorization"}),e.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:":"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:"    enabled"}),e.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:":"}),e.jsx(i.span,{style:{"--shiki-light":"#1976D2","--shiki-dark":"#79B8FF"},children:" true"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:"    failOpen"}),e.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:":"}),e.jsx(i.span,{style:{"--shiki-light":"#1976D2","--shiki-dark":"#79B8FF"},children:" false"})]}),`
`,e.jsx(i.span,{className:"line"}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:"services"}),e.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:":"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:"  authz"}),e.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:":"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:"    jwkUrl"}),e.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:":"}),e.jsx(i.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#FFAB70"},children:" https://idp.example.com/realms/iot/protocol/openid-connect/certs"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:"    bootstrap"}),e.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:":"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292EFF","--shiki-dark":"#B392F0"},children:"      - "}),e.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:"principal_id"}),e.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:":"}),e.jsx(i.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#FFAB70"},children:' "oidc:pki-admin"'})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:"        principal_name"}),e.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:":"}),e.jsx(i.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#FFAB70"},children:' "PKI Admin"'})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:"        principal_type"}),e.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:":"}),e.jsx(i.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#FFAB70"},children:' "oidc"'})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:"        policy_ids"}),e.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:":"})]}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#C2C3C5","--shiki-dark":"#6B737C"},children:"          # SUPER ADMIN"})}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292EFF","--shiki-dark":"#B392F0"},children:"          - "}),e.jsx(i.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#FFAB70"},children:'"lamassu.a6811b60-5f89-4ce7-badb-78ea234794d3"'})]}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#C2C3C5","--shiki-dark":"#6B737C"},children:"          # Job Manager - Mgmt NBI Admin"})}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292EFF","--shiki-dark":"#B392F0"},children:"          - "}),e.jsx(i.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#FFAB70"},children:'"lamassu.7df018c1-3140-4a35-9067-2e7d6cec3ed2"'})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:"        auth_config"}),e.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:":"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:"          claims"}),e.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:":"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292EFF","--shiki-dark":"#B392F0"},children:"            - "}),e.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:"claim"}),e.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:":"}),e.jsx(i.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#FFAB70"},children:' "realm_access.roles"'})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:"              operator"}),e.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:":"}),e.jsx(i.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#FFAB70"},children:' "contains"'})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F8F8F8"},children:"              value"}),e.jsx(i.span,{style:{"--shiki-light":"#D32F2F","--shiki-dark":"#F97583"},children:":"}),e.jsx(i.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#FFAB70"},children:' "pki-admin"'})]})]})})}),`
`,e.jsxs(i.p,{children:["The pre-install and pre-upgrade Helm Job runs the ",e.jsx(i.code,{children:"authz"})," migrations, preloads the policies and creates the bootstrap principals before the services start. If the principal already exists, it does not replace it: it only adds the configured grants that are still missing. You can keep the entry in ",e.jsx(i.code,{children:"values.yaml"})," across upgrades."]}),`
`,e.jsxs(r,{children:[e.jsxs(n,{children:[e.jsx(i.h3,{id:"prepare-the-identity-provider",children:"Prepare the identity provider"}),e.jsxs(i.p,{children:["Create the role or group you will use to administer Lamassu. Assign it to at least two controlled human identities. If your provider does not use ",e.jsx(i.code,{children:"realm_access.roles"}),", adapt the claim path in both the frontend and ",e.jsx(i.code,{children:"auth_config.claims"}),"."]})]}),e.jsxs(n,{children:[e.jsx(i.h3,{id:"configure-the-two-jwt-validations",children:"Configure the two JWT validations"}),e.jsxs(i.p,{children:["The Gateway uses ",e.jsx(i.code,{children:"auth.authentication.apiGateway.jwks"})," to authenticate requests. ",e.jsx(i.code,{children:"authz"})," uses ",e.jsx(i.code,{children:"services.authz.jwkUrl"})," to resolve OIDC principals. Both endpoints must contain the keys of the same issuer and be reachable from their respective components."]})]}),e.jsxs(n,{children:[e.jsx(i.h3,{id:"install-and-verify-administrative-access",children:"Install and verify administrative access"}),e.jsxs(i.p,{children:["Sign in with an identity holding ",e.jsx(i.code,{children:"pki-admin"}),". Confirm it can access authorization administration and perform a non-destructive read operation."]})]}),e.jsxs(n,{children:[e.jsx(i.h3,{id:"test-an-unprivileged-identity",children:"Test an unprivileged identity"}),e.jsxs(i.p,{children:["Use a second user without the role and confirm the same operation is denied. This test catches misread claims, overly broad policies and accidental ",e.jsx(i.code,{children:"failOpen"})," configurations."]})]}),e.jsxs(n,{children:[e.jsx(i.h3,{id:"reduce-use-of-the-bootstrap-administrator",children:"Reduce use of the bootstrap administrator"}),e.jsxs(i.p,{children:["Create operational principals with narrower policies. Reserve ",e.jsx(i.code,{children:"pki-admin"})," for authorization administration and recovery, not for daily work."]})]})]}),`
`,e.jsx(i.h2,{id:"fastlane-bootstrap",children:"Fastlane bootstrap"}),`
`,e.jsxs(i.p,{children:["Fastlane installs a Keycloak realm for the lab and creates the user ",e.jsx(i.code,{children:"lamassu"})," with the temporary password ",e.jsx(i.code,{children:"lamassu"}),", the role ",e.jsx(i.code,{children:"pki-admin"})," and a mandatory password change. Its bootstrap principal matches through ",e.jsx(i.code,{children:"preferred_username=lamassu"}),"."]}),`
`,e.jsx(s,{type:"warn",title:"Credentials for bootstrap only",children:e.jsx(i.p,{children:"Change the password on first login. Do not reuse the Fastlane user, password or IdP as a production design."})}),`
`,e.jsx(i.h2,{id:"design-least-privilege-roles",children:"Design least-privilege roles"}),`
`,e.jsx(i.p,{children:"Avoid reproducing your company's internal structure with dozens of nearly identical policies. Start from the responsibilities that actually need access:"}),`
`,e.jsxs(i.ul,{children:[`
`,e.jsxs(i.li,{children:[e.jsx(i.strong,{children:"Authorization administration"}),": manages principals, policies and grants. It should belong to a small, separate group."]}),`
`,e.jsxs(i.li,{children:[e.jsx(i.strong,{children:"PKI operation"}),": administers CAs, profiles and certificates, but not necessarily who gets access."]}),`
`,e.jsxs(i.li,{children:[e.jsx(i.strong,{children:"Device registration"}),": operates devices and DMSs without receiving permissions over keys or authorization configuration."]}),`
`,e.jsxs(i.li,{children:[e.jsx(i.strong,{children:"Audit"}),": reviews configuration and activity without creating, modifying, signing, revoking or deleting."]}),`
`,e.jsxs(i.li,{children:[e.jsx(i.strong,{children:"Automation"}),": uses a technical account or a separate certificate, with permissions limited to the flow and resources it controls."]}),`
`]}),`
`,e.jsxs(i.p,{children:['For each role, separate "view" from "change", limit resources through grants, relations or attributes and avoid ',e.jsx(i.code,{children:"*"})," unless the role must automatically cover future actions."]}),`
`,e.jsx(s,{type:"info",title:"Wildcards also grant future actions",children:e.jsxs(i.p,{children:["A rule with ",e.jsx(i.code,{children:'actions: ["*"]'})," expands to every action defined by the schema. When a new version adds an action, a wildcard policy may start granting it. Review these policies on every upgrade."]})}),`
`,e.jsx(i.h2,{id:"changes-and-access-revocation",children:"Changes and access revocation"}),`
`,e.jsx(i.p,{children:"To revoke access immediately, disable the principal or revoke its grants. Disabling a principal keeps its configuration and associations for investigation or restoration, but it stops taking part in matching."}),`
`,e.jsx(i.p,{children:"Deleting a role or group in the IdP prevents new tokens from containing the claim, but an already-issued token may remain valid until it expires. If removal is urgent, combine the IdP change with disabling the principal in Lamassu and revoking sessions or tokens at the provider."}),`
`,e.jsx(i.p,{children:"When you edit a shared policy, remember the change affects all its principals. To test a new scope, create a separate policy, grant it to a test identity and validate allowed and denied operations before replacing the old one."}),`
`,e.jsx(i.h2,{id:"operational-checklist",children:"Operational checklist"}),`
`,e.jsxs(i.ul,{children:[`
`,e.jsxs(i.li,{children:["Keep ",e.jsx(i.code,{children:"failOpen: false"})," unless a documented risk assessment justifies otherwise."]}),`
`,e.jsx(i.li,{children:"Use groups or stable roles for people and independent identities for automations."}),`
`,e.jsx(i.li,{children:"Keep at least two recovery administrators and test their access periodically."}),`
`,e.jsx(i.li,{children:"Review active principals, their matches and their grants after IdP changes."}),`
`,e.jsx(i.li,{children:"Search for wildcards in policies before upgrading Lamassu."}),`
`,e.jsx(i.li,{children:"Always test one allowed and one denied operation for each role."}),`
`,e.jsxs(i.li,{children:["Correlate changes to principals, policies and grants with the ",e.jsx(i.a,{href:"/docs/platform/pki/audit-logs",children:"audit logs"}),"."]}),`
`]}),`
`,e.jsx(i.h2,{id:"diagnostics",children:"Diagnostics"}),`
`,e.jsx(i.h3,{id:"the-response-is-401",children:"The response is 401"}),`
`,e.jsx(i.p,{children:"Authentication failed before permissions were evaluated. Check the JWT signature and expiration, issuer, audience and the availability of the JWKS configured in the Gateway. For X.509, check that the client certificate reaches the point that extracts the credential."}),`
`,e.jsx(i.h3,{id:"the-response-is-403",children:"The response is 403"}),`
`,e.jsx(i.p,{children:"The credential could be processed but did not produce a positive authorization. Review in this order:"}),`
`,e.jsxs(i.ol,{children:[`
`,e.jsx(i.li,{children:"that an active principal of the correct type exists;"}),`
`,e.jsx(i.li,{children:"that the claim paths and values match the real token exactly;"}),`
`,e.jsx(i.li,{children:"that all of the principal's conditions hold;"}),`
`,e.jsx(i.li,{children:"that the principal has the expected policy granted;"}),`
`,e.jsx(i.li,{children:"that the policy includes the action and the requested resource type or route;"}),`
`,e.jsx(i.li,{children:"that the identifier, relation, column filter or HTTP constraint includes the real resource."}),`
`]}),`
`,e.jsxs(i.p,{children:["In the ",e.jsx(i.code,{children:"authz"})," logs, an external endpoint decision includes ",e.jsx(i.code,{children:"allowed"}),", ",e.jsx(i.code,{children:"reason"}),", ",e.jsx(i.code,{children:"matched_principals"}),", ",e.jsx(i.code,{children:"evaluated_policy_ids"}),", ",e.jsx(i.code,{children:"matched_policy_id"})," and the status code. These fields let you separate a matching failure from a permissions failure."]}),`
`,e.jsx(i.h3,{id:"everything-returns-403",children:"Everything returns 403"}),`
`,e.jsxs(i.p,{children:["Check that the bootstrap principal was created and that the policies were preloaded by the migration Job. Also verify that ",e.jsx(i.code,{children:"services.authz.jwkUrl"})," is reachable from the ",e.jsx(i.code,{children:"authz"})," pod; do not assume that a URL accessible from the browser also works inside the cluster."]}),`
`,e.jsx(i.h3,{id:"everything-fails-when-authz-is-unavailable",children:"Everything fails when authz is unavailable"}),`
`,e.jsxs(i.p,{children:["This is the expected behavior with ",e.jsx(i.code,{children:"failOpen: false"}),". Restore the service, its PostgreSQL connection and its JWKS connectivity. Do not temporarily switch to ",e.jsx(i.code,{children:"failOpen: true"})," without accepting that protected routes could become accessible without an authorization decision."]}),`
`,e.jsxs(i.p,{children:["Continue with ",e.jsx(i.a,{href:"/docs/platform/pki/audit-logs",children:"Audit logs"})," to investigate configuration changes or with ",e.jsx(i.a,{href:"/docs/platform/pki/troubleshooting",children:"Troubleshooting"})," to diagnose the deployment."]})]})}function p(t={}){const{wrapper:i}=t.components||{};return i?e.jsx(i,{...t,children:e.jsx(o,{...t})}):o(t)}function a(t,i){throw new Error("Expected component `"+t+"` to be defined: you likely forgot to import, pass, or provide it.")}const g=Object.freeze(Object.defineProperty({__proto__:null,_markdown:l,default:p,frontmatter:c,structuredData:h,toc:d},Symbol.toStringTag,{value:"Module"}));export{g as _};

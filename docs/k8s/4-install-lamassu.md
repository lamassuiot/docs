# 4. Install Lamassu

## Core Deployment - OSS

## Core Deployment - Alternatives

### Donwstream Certificate with Let's Encrypt & Cert Manager

First create the Issuer resource through which the Lets Encrypt certificates will be issued:

```yaml
cat <<EOF | kubectl apply -f -
apiVersion: cert-manager.io/v1
kind: Issuer
metadata:
  name: letsencrypt-issuer
  namespace: $NS
spec:
  acme:
    server: https://acme-staging-v02.api.letsencrypt.org/directory
    privateKeySecretRef:
      name: letsencrypt-issuer
    skipTLSVerify: true
    solvers:
      - http01:
          ingress:
            class: nginx
EOF
```

### External OIDC Provider

By default the helm chart deploys keycloak as the IAM provider, but it can be disabled and use your own IAM provider based on the OIDC protocol.
 Start by creating the new values file named `external-oidc.yml` to use by helm while installing:

```yaml
services:
 keycloak:
   enabled: false
```

Make sure that the OIDC provider generates JWT with some claim including the user's roles or groups.
 We will be mapping those values to Lamssu's authorisation service by mapping the appropriate token claim.

```yaml
auth:
  authorization:
    rolesClaim: "user_roles"
    roles:
      admin: administrator
      operator: viewer
```

!!! note
    `rolesClaim` can be a json path such as `user_props.roles`. The only requisite is that the claim **MUST** be an array.

Lets assume that the **Admin Users** gets a JWT issued by the ODIC witch has the following info:

```json
{
  "exp": 1693246697,
  "iat": 1693246397,
  "jti": "2565228f-f640-468c-9087-4885fe55c172",
  "iss": "https://dev.lamassu.io/auth/realms/lamassu",
  "aud": "account",
  "sub": "045b7aa3-a597-4fc7-8b95-641c492f8332",
  "typ": "Bearer",
  "azp": "frontend",
  "realm_access": {
    "roles": [
      "default-roles-lamassu",
      "offline_access",
      "uma_authorization",
      "pki-admin"
    ]
  },
  "scope": "openid email profile",
  "sid": "c8ffb269-bcc8-4cff-9fda-f5fbba7ab128",
  "preferred_username": "My Admin user",
}
```

As it can be seen, the JWT has a claim `realm_access.roles` including a `pki-admin` role. To instruct lamassu to use that role as the administrator role,
 configure the roles section `auth.authorization.roles.admin` mapping to such value.

The list of roles to be mapped as of now, is as follows (click each role to get more info):

- `admin`
- `operator`

Lets asume

## Addons

### Alerts

### Simulation Tools

### AWS Cloud Connector

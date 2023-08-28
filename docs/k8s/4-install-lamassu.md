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

By default the helm chart deploys keycloak as the IAM provider, but it can be disabled and use your own IAM provider based on the OIDC protocol. Start by creating the new values file named `external-oidc.yml` to use by helm while installing:

```yaml
services:
 keycloak:
   enabled: false
```

## Addons

### Alerts

### Simulation Tools

### AWS Cloud Connector
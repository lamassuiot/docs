# Common configuration Scenarios

The following are some common scenarios for configuring the Lamassu deployment based on the Helm chart.

## Custom Domain
By default, Lamassu is deployed with the domain `dev.lamassu.io`. To change the domain, specify the following configuration in your `lamassu.yaml` file:

```yaml	
ingress:
  hostname: "mydomain.com"
services:
  ca:
    domain: "mydomain.com"
```

For those scenarios where ingress is disabled, the domain/IP can be set in the `ca` service configuration directly:

```yaml
ingress:
  enabled: false
services:
  ca:
    domain: "192.168.100.1"
```

## Let's Encrypt Certificates

By default, Lamassu is deployed with a Self-Signed certificate provided by the [CertManager plugin](https://cert-manager.io/). Another common certificate provider, instead of using the mentioned self-signed certificate, is Let's Encrypt - ACMEv2 provider. To use Let's Encrypt certificates together with the CertManager plugin, the following steps are required:

1.  Create a ClusterIssuer resource with the following configuration. Make sure to replace the email address with your own as well as the **`ingressClassName`** with the one used in your Ingress Controller:

    ```yaml
    apiVersion: cert-manager.io/v1
    kind: ClusterIssuer
    metadata:
    name: letsencrypt-prod
    spec:
    acme:
        # You must replace this email address with your own.
        # Let's Encrypt will use this to contact you about expiring
        # certificates, and issues related to your account.
        server: https://acme-v02.api.letsencrypt.org/directory
        email: user@example.com
        privateKeySecretRef:
        # Secret resource that will be used to store the account's private key.
        name: letsencrypt-prod
        # Add a single challenge solver, HTTP01 using nginx
        solvers:
        - http01:
            ingress:
                ingressClassName: nginx
    ```

2. Update the `lamassu.yaml` file with the following configuration:

    ```yaml
    tls:
      type: "certManager"
      certManagerOptions:
        clusterIssuer: "letsencrypt-prod"
    ingress:
      enabled: true
      hostname: "mydomain.com"
    ```

## Deployment with NodePort (Without Ingress)

Deploying Lamassu without Ingress requires exposing the services using NodePort. The following configuration can be used to expose the services using NodePort:

```yaml
ingress:
  enabled: false
service:
  type: "NodePort"
  nodePorts:
    apiGatewayTls: 30443
    apiGateway: 30080
```
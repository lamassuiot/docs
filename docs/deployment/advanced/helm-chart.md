# Helm Chart

Lamassu's Helm chart is a powerful tool that allows you to deploy Lamassu in a Kubernetes cluster. The Helm chart is a collection of files that describe a set of Kubernetes resources. It is a way to package, configure, and deploy applications on Kubernetes.

The fastlane script custmizes the deployment by bootstraping a basic configuration. However, you can further customize the deployment by editing the `lamassu.yaml` file considering the following configuration options:


- [`global`](#global) - These global values affect multiple components of the chart.
    - [`imagePullPolicy`](#imagePullPolicy) (`string: "Always"`) - The image pull policy for all the components.

- [`debugMode`](#debugMode) (`boolean: true`) - Enable debug mode for Lamassu components.

- [`tls`](#tls) - Configuration for the downstream TLS.
    - [`type`](#type) (`string: "certManager"`) - TLS provider to be used. Possible values are `certManager` or `external`.
    - [`certManagerOptions`](#letsEncryptOptions) - Configuration for the Let's Encrypt TLS.
        - [`clusterIssuer`](#clusterIssuer) (`string: ""`) - The cluster issuer to be used.
        - [`issuer`](#issuer) (`string: ""`) - The issuer to be used.
        - [`duration`](#duration) (`string: "2160h"`) - The duration of the self-signed certificate.
    - [`externalOptions`](#externalOptions) - Configuration for the external certificate.
        - [`secretName`](#secretName) (`string: ""`) - The name of the secret containing the external certificate.

- [`ingress`](#ingress) - Configuration for the Ingress.
    - [`enabled`](#enabled) (`boolean: true`) - Enable the Ingress.
    - [`hostname`](#hostname) (`string: "dev.lamassu.io"`) - The hostname to be used. Required if Ingress is enabled.
    - [`annotations`](#annotations) (`string: ""`) - The annotations to be used set to the ingress resource.

- [`service`](#service) - Configuration for the services.
    - [`type`](#type) (`string: "ClusterIP"`) - The service type to be used.
    - [`nodePorts`](#nodePorts) - Configuration for the NodePorts.
        - [`apiGatewayTls`](#apiGatewayTls) (`number: 0`) - The NodePort for the API Gateway TLS.
        - [`apiGateway`](#apiGateway) (`number: 0`) - The NodePort for the API Gateway.

- [`postgres`](#postgres) - Configuration for the Postgres database.
    - [`hostname`](#hostname) (`string: ""`) - The hostname of the Postgres database.
    - [`port`](#port) (`number: 5432`) - The port of the Postgres database.
    - [`username`](#username) (`string: ""`) - The username of the Postgres database.
    - [`password`](#password) (`string: ""`) - The password of the Postgres database.

- [`amqp`](#amqp) - Configuration for the AMQP.
    - [`hostname`](#hostname) (`string: ""`) - The hostname of the AMQP.
    - [`port`](#port) (`number: 5672`) - The port of the AMQP.
    - [`username`](#username) (`string: ""`) - The username of the AMQP.
    - [`password`](#password) (`string: ""`) - The password of the AMQP.
    - [`tls`](#tls) (`boolean: false`) - Enable TLS for the AMQP.

- [`auth`](#auth) - Configuration for the authentication.
    - [`oidc`](#oidc) - Configuration for the OIDC.
        - [`frontend`](#frontend) - Configuration for the frontend.
            - [`clientId`](#clientId) (`string: "frontend"`) - Client ID used by the frontend.
            - [`authority`](#authority) (`string: "https://${window.location.host}/auth/realms/lamassu"`) - Authority for the frontend.
            - [`awsCognito`](#awsCognito) - Configuration for the AWS Cognito.
                - [`enabled`](#enabled) (`boolean: false`) - Enable AWS Cognito.
                - [`hostedUiDomain`](#hostedUiDomain) (`string: ""`) - The hosted UI domain for AWS Cognito.
        - [`apiGateway`](#apiGateway) - Configuration for the API Gateway.
            - [`jwksUrl`](#jwksUrl) (`string: "https://auth:8443/auth/realms/lamassu/protocol/openid-connect/certs"`) - The JWKS URL for the API Gateway.
    - [`authorization`](#authorization) - Configuration for the authorization.
        - [`rolesClaim`](#rolesClaim) (`string: "realm_access.roles"`) - The roles claim for the authorization.
        - [`roles`](#roles) - Configuration for the roles.
            - [`admin`](#admin) (`string: "pki-admin"`) - The admin role.
            - [`operator`](#operator) (`string: "operator"`) - The operator role.

- [`services`](#services) - Configuration for the services.
    - [`keycloak`](#keycloak) - Configuration for the Keycloak.
        - [`enabled`](#enabled) (`boolean: true`) - Enable Keycloak.
        - [`image`](#image) (`string: "ghcr.io/lamassuiot/keycloak:2.1.0"`) - The image for Keycloak.
        - [`adminCreds`](#adminCreds) - Configuration for the admin credentials.
            - [`username`](#username) (`string: "admin"`) - The username for the admin.
            - [`password`](#password) (`string: "admin"`) - The password for the admin.
    - [`ui`](#ui) - Configuration for the UI.
        - [`image`](#image) (`string: "ghcr.io/lamassuiot/lamassu-ui:2.5.2"`) - The image for the UI.
    - [`va`](#va) - Configuration for the VA.
        - [`image`](#image) (`string: "ghcr.io/lamassuiot/lamassu-va:2.5.1"`) - The image for the VA.
    - [`ca`](#ca) - Configuration for the CA.
        - [`domain`](#domain) (`string: "dev.lamassu.io"`) - The domain for the CA.
        - [`image`](#image) (`string: "ghcr.io/lamassuiot/lamassu-ca:2.5.1"`) - The image for the CA.
        - [`monitoring`](#monitoring) - Configuration for the monitoring.
            - [`frequency`](#frequency) (`string: "* * * * *"`) - Frequency for the monitoring.
        - [`engines`](#engines) - Configuration for the engines.
            - [`defaultEngineID`](#defaultEngineID) (`string: "golang-1"`) - Default engine ID.
            - [`golang`](#golang) (`array: []`) - Configuration for Filesystem-based engine.
    - [`deviceManager`](#deviceManager) - Configuration for the Device Manager.
        - [`image`](#image) (`string: "ghcr.io/lamassuiot/lamassu-devmanager:2.5.1"`) - The image for the Device Manager.
        - [`minimumReenrollmentDays`](#minimumReenrollmentDays) (`number: 100`) - The minimum reenrollment days.
    - [`dmsManager`](#dmsManager) - Configuration for the DMS Manager.
        - [`image`](#image) (`string: "ghcr.io/lamassuiot/lamassu-dmsmanager:2.5.1"`) - The image for the DMS Manager.
    - [`openPolicyAgent`](#openPolicyAgent) - Configuration for the Open Policy Agent.
        - [`image`](#image) (`string: "openpolicyagent/opa:0.37.1-envoy"`) - The image for the Open Policy Agent.
        - [`remLogger`](#remLogger) - Configuration for the REM Logger.
            - [`image`](#image) (`string: "ghcr.io/lamassuiot/opa-rem-logger:2.1.0"`) - The image for the REM Logger.
    - [`alerts`](#alerts) - Configuration for the Alerts.
        - [`image`](#image) (`string: "ghcr.io/lamassuiot/lamassu-alerts:2.5.1"`) - The image for the Alerts.
        - [`smtp_server`](#smtp_server) - Configuration for the SMTP server.
            - [`from`](#from) (`string: ""`) - The from address.
            - [`insecure`](#insecure) (`boolean: false`) - Enable insecure.
            - [`enable_ssl`](#enable_ssl) (`boolean: true`) - Enable SSL.
            - [`username`](#username) (`string: ""`) - The username.
            - [`password`](#password) (`string: ""`) - The password.
            - [`host`](#host) (`string: ""`) - The host.
            - [`port`](#port) (`number: 25`) - The port.
    - [`awsConnector`](#awsConnector) - Configuration for the AWS Connector.
        - [`enabled`](#enabled) (`boolean: false`) - Enable the AWS Connector.
        - [`image`](#image) (`string: "ghcr.io/lamassuiot/lamassu-aws-connector:2.5.1"`) - The image for the AWS Connector.
        - [`connectorID`](#connectorID) (`string: "aws.XXXXXXXXX"`) - The connector ID.
        - [`credentials`](#credentials) - Configuration for the credentials.
            - [`accessKeyId`](#accessKeyId) (`string: ""`) - The access key ID.
            - [`secretAccessKey`](#secretAccessKey) (`string: ""`) - The secret access key.
            - [`defaultRegion`](#defaultRegion) (`string: ""`) - The default region.
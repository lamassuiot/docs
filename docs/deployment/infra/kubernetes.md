# Kubernetes

## Quick-Start

!!! warning
    The Quick Start configuration is not suitable for production use and should only be run in a testing/development environment. If you need to deploy a simple
    kubernetes single-node cluster, [follow this guide to launch one](deploy-microk8s.md).

Lamassu IoT runs in a Kubernetes infrastructure. This guide is a quick start that allows you to have a Lamassu IoT instance for testing purposes. General
installation steps are:

- Select the domain for your Lamassu IoT instance
- Install PostgreSQL as the storage engine for Lamassu IoT
- Install RabbitMQ as AMQP queue provider
- Install Lamassu IoT services
- Configure Lamassu IoT users in the provided Keycloak service

This process will end in a Lamassu IoT instance up and running using the default Golang based Crypto Engine wich is only suitable for testing and development.

### Select the Lamassu IoT Domain

Access using the VM's IP won't work as the ingress resource won't match the incoming request against the configured domain. Lamassu IoT requires a domain to
access the UI and services. If you don't have a resolvable domain for this installation please register it locally for testing purposes.

!!! info
    Lamassu requires defining a domain variable to be set in Lamassu's `values.yaml` file. This domain will be used to route the incomming requests to the
    deployed Lamassu instance within kubernetes (in fact, the API Gateway ingress defines the `domain` as its routing rule). The domain is also used while
    signing new CAs or Certificates to set the OCSP and CRL endpoints. Lamassu's helm chart uses `dev.lamassu.io` as the default domain. Consider chaning this
    value if required.

    For example if instead of deploying a Lamassu instance using the default `dev.lamassu.io` domain, you require using the `mydomain.lamassu.io` domain,
    configure the `values.yaml` file as shown below:

    ```yaml
    domain: mydomain.lamassu.io
    auth:
      oidc:
        frontend:
          authority: https://mydomain.lamassu.io/auth/realms/lamassu
    ```

    Make sure to add the corresponding rule in the `/etc/hosts` in linux or MacOS or in `c:\windows\system32\drivers\etc\hosts` Windows to be able to use the
    `domain` while browsing Lamassu's UI and APIs, otherwise no response will be obtained. Accessing using the VM IP won't work as the Ingress resource won't
    match the incoming request against the configured domain.

    An example in `/etc/hosts` or `c:\windows\system32\drivers\etc\hosts` might look like this if the VM hosting lamassu has the `192.168.100.75` IP and the
    domain was set to the default `dev.lamassu.io`:

    ```py
    192.168.100.75  dev.lamassu.io
    ```

This domain will be used to configure Lamassu IoT Chart. This installation process will use the value of LAMASSU_DOMAIN env variable to configure the
installation.

```bash
LAMASSU_DOMAIN=dev.lamassu.io
```

### Create Kubernetes namespace

For better control of the Lamassu IoT resources, it is recommended to create a namespace in Kubernetes.

```bash
LAMASSU_NAMESPACE=lamassu-dev
kubectl create ns $LAMASSU_NAMESPACE
```

### Install PostgreSQL

Set your secrets for PostgreSQL installation in the following env variables: POSTGRES_USER and POSTGRES_PASSWORD

```bash
POSTGRES_USER=admin
POSTGRES_PASSWORD=$(cat /proc/sys/kernel/random/uuid | sed 's/[-]//g' | head -c 10 )
```

Prepare the PostgreSQL config file

```yaml
cat > postgres.yaml << "EOF"
fullnameOverride: "postgresql"
global:
  postgresql:
    auth:
      username: env.user
      password: env.password
primary:
  initdb:
    scripts:
      init.sql: |
        CREATE DATABASE auth;
        CREATE DATABASE alerts;
        CREATE DATABASE ca;
        CREATE DATABASE cloudproxy;
        CREATE DATABASE devicemanager;
        CREATE DATABASE dmsmanager;
EOF
```

Replace username and password with your customized env variable values

```bash
sed 's/env.user/'"$POSTGRES_USER"'/;s/env.password/'"$POSTGRES_PASSWORD"'/' -i postgres.yaml
```

Install PostgreSQL in your Kubernetes environment

```bash
helm repo add bitnami https://charts.bitnami.com/bitnami
helm install postgres bitnami/postgresql -n $LAMASSU_NAMESPACE -f postgres.yaml
```

### Install RabbitMQ

Set your secrets for RabbitMQ installation in the following env variables: RABBITMQ_USER and RABBITMQ_PASSWORD

```bash
RABBITMQ_USER=admin
RABBITMQ_PASSWORD=$(cat /proc/sys/kernel/random/uuid | sed 's/[-]//g' | head -c 10 )
```

```bash
helm repo add bitnami https://charts.bitnami.com/bitnami
helm install rabbitmq bitnami/rabbitmq -n $LAMASSU_NAMESPACE --set fullnameOverride=rabbitmq --set auth.username=$RABBITMQ_USER --set auth.password=$RABBITMQ_PASSWORD
```

### Install Lamassu

Default Lamassu IoT installation includes a Keycloak server which provides the user management and authentication support. Configure the following env variables
with the user credentials to be created as the keycloak admin.

```bash
KEYCLOAK_USER=admin
KEYCLOAK_PASSWORD=$(cat /proc/sys/kernel/random/uuid | sed 's/[-]//g' | head -c 10 )
```

```yaml
cat > lamassu.yaml << "EOF"
domain: env.lamassu.domain
postgres:
  hostname: "postgresql"
  port: 5432
  username: "env.postgre.user"
  password: "env.postgre.password"

amqp:
  hostname: "rabbitmq"
  port: 5672
  username: "env.rabbitmq.user"
  password: "env.rabbitmq.password"
  tls: false

services:
  keycloak:
    enabled: true
    image: ghcr.io/lamassuiot/keycloak:2.1.0
    adminCreds:
      username: "env.keycloak.user"
      password: "env.keycloak.password"
EOF
```

Replace values in the base config file from your env variables

```bash
sed 's/env.lamassu.domain/'"$LAMASSU_DOMAIN"'/' -i lamassu.yaml
sed 's/env.postgre.user/'"$POSTGRES_USER"'/;s/env.postgre.password/'"$POSTGRES_PASSWORD"'/' -i lamassu.yaml
sed 's/env.rabbitmq.user/'"$RABBITMQ_USER"'/;s/env.rabbitmq.password/'"$RABBITMQ_PASSWORD"'/' -i lamassu.yaml
sed 's/env.keycloak.user/'"$KEYCLOAK_USER"'/;s/env.keycloak.password/'"$KEYCLOAK_PASSWORD"'/' -i lamassu.yaml
```

Check the result in the lamassu.yaml and then install Lamassu IoT on your Kubernetes environment.

```bash
helm repo add lamassuiot http://www.lamassu.io/lamassu-helm/
helm install -n $LAMASSU_NAMESPACE lamassu lamassuiot/lamassu -f lamassu.yaml
```

!!! warning
    Finally, if you are using a MicroK8S installation, run the following commands to patch Lamassu's API-Gateway Ingress resource, otherwise no response will be
    obtained even while having configured the domain in the `/etc/hosts` or equivalent as explained before:

    Edit Lamassu's `lamassu.yaml` file and add:

    ```yaml
    ingress:
      annotations: |
        kubernetes.io/ingress.class: "public"
    ```

    Apply the patch:

    ```bash
    microk8s helm upgrade -n $LAMASSU_NAMESPACE lamassu lamassuiot/lamassu -f lamassu.yaml
    ```

### Configure users in Keycloak

The last step refers to [initializing Keycloak](#keycloak) to provision your PKI admin user and access Lamassu's UI witch will be accessible at your VM IP in
port 443.

## Configuration

### Databases

Lamassu Core services have been designed in such a way to enable different storage engines. Each engine has its own set of pros and cons depending, and there is
no easy way of determining the best candidate. Each scenario is unique in terms of data volume, availability requirements or even pricing requirements in case
of delegating on any cloud provider.

#### Postgres

The main Database for the current Lamassu version is postgres. You can provide any Postgres DB instance such as a HA Postgres deployment, an AWS RDS DB with
postgres driver or similar alternatives. Note that each lamassu service expects it's own DB within the DB instance. As such, the deployed postgres instance must
include the following DBs: `alerts`, `ca`, `cloudproxy`, `devicemanager`, `dmsmanager`. Additionally if Keycloak is used as the authentication service, the DB
instance must also supply the `auth` DB.

The following Postgres Single-Node deployment configuration is only meant for testing purposes and should not be used in a production environment as it doesn't
follow best practices such as using unsafe password credentials

```yaml
cat > postgres.yaml << "EOF"
fullnameOverride: "postgresql"
global:
  postgresql:
    auth: #(1)
      username: admin
      password: admin
primary:
  initdb:
    scripts:
      init.sql: |
        CREATE DATABASE auth;
        CREATE DATABASE alerts;
        CREATE DATABASE ca;
        CREATE DATABASE cloudproxy;
        CREATE DATABASE devicemanager;
        CREATE DATABASE dmsmanager;
EOF
```

1.  Place here the admin credentials provided during PostgreSQL configuration.

```bash
helm repo add bitnami https://charts.bitnami.com/bitnami
helm install postgres bitnami/postgresql -f postgres.yaml
```

Lamassu's Helm chart allows specifying the connection parameters to be used by the different services by providing the following configuration in the
`values.yaml` file:

```yaml
postgres:
  hostname: "postgresql"
  port: 5432
  username: "admin" #(1)
  password: "admin"
```

1.  Customize your admin credentials here

#### CouchDB

TODO: Future versions will include support for CouchDB as the Storage Engine

#### AWS DynamoDB

TODO: Future versions will include support for DynamoDB as the Storage Engine

### Async Messaging

As of now, AMQP is the only Async Messaging engine supported. The Async Messaging engine service a crucial role for sending PKI related events in real time.
Check out all the events generated by Lamassu services in the [Cloud Events](/apis/cloud-events) section.

#### RabbitMQ

RabbitMQ is perhaps the most popular AMQP service, and its deployment for a test scenario is quite straight forward.

Start by deploying RabbitMQ with your own configuration. This section contains a basic configuration deployment and it should not be used in any production
environment as it is due to insecure configurations (like non robust credentials for instance):

```yaml
fullnameOverride: "rabbitmq"
auth: #(1)
  username: "user"
  password: "user"
```

1.  Place here the admin credentials provided during RabitMQ configuration.

```bash
helm repo add bitnami https://charts.bitnami.com/bitnami
helm install rabbitmq bitnami/rabbitmq -f rabbitmq.yaml
```

Lamassu's Helm chart allows specifying the connection parameters to be used by the different services by providing the following configuration in the
`values.yaml` file:

```yaml
amqp:
  hostname: "rabbitmq"
  port: 5672
  username: "user" #(1)
  password: "user"
  tls: false
```

1.  Customize your admin credentials here

### Crypto Engines

Another key feature is the capability of using different Cryptographic Engines. Each engine is responsible of creating, storing the Certificate Authorities
private keys as well as performing the appropriate operations with those keys. Depending on witch engine is used, the overall PKI solution will be considered
more robust. Some of the currently supported engines are not secure at all as they store the private keys in plain text without any security measure at all.
Others in the other hand, don't even allow having physical access to the private key at all, and all operations must be performed remotely.

The following list displays all the currently supported crypto engines with its security level in accordance with their implementations. The higher the security
level is, the more robust they are:

| Engine                  | Security Level | Supported Algorithms |
| ----------------------- | -------------- | -------------------- |
| **Golang**              | SL1            | `RSA`, `ECDSA`       |
| **Hashicorp Vault**     | SL2            | `RSA`, `ECDSA`       |
| **AWS Secrets Manager** | SL2            | `RSA`, `ECDSA`       |
| **AWS KMS**             | SL3            | `RSA`, `ECDSA`       |
| **PKCS11 - HSM**        | SL3            | HSM-specific option  |

Each engine can be instantiated multiple times with different configurations. For instance, it is possible deploying operating with two Vault crypto engines,
one might be used for a wide variety of use cases and manage higher operations while the other Vault instance might be only used for issuing certificates for a
subset of devices.

While configuring each engine, make sure to provide a different `id` to each engine, otherwise unexpected behavior might happen. It is also recommended to
provide a set of key-values in the `metadata` section to easily distinguish each engine.

#### Golang

To enable the golang crypto engine, there is no need of installing additional services as the standard CA service is able to operate with private keys using
Golang's standard cryptographic libraries. A default Lamassu installation already configures the CA service with this engine although more instances of the
engine can be enabled as follows:

```yaml
services:
  ca:
    engines:
       golang:
        - id: "my-golang-id-1"
          storage_directory: "/storage/data"
          metadata:
            prod-ready: "false"
```

Bare in mind that if two golang engines are enabled simultaneously there will be unexpected behavior if they share the same `storage_directory`. Make sure to
specify different paths for each engine

#### Hashicorp Vault

Vault is the goto option in on-premise or air-gapped environments if no HSM is deployed as it is the current open source engine with higher security level. As
per Vault's deployment model, a consul instance (or cluster) must be deployed first.

A sample and basic Consul single node configuration might look like this:

```yaml
fullnameOverride: "consul"
global:
  enabled: true
  datacenter: lamassu-k8s
  tls:
    enabled: false
client:
  enabled: false
controller:
  enabled: false
connectInject:
  enabled: false
server:
  affinity: "null" #set to null to remove affinity rule. By default consul only deploys 1 service per node. See: https://developer.hashicorp.com/consul/docs/k8s/helm#v-server-affinity
  replicas: 1
```

```bash
helm repo add hashicorp https://helm.releases.hashicorp.com
helm install consul hashicorp/consul -f consul.yaml
```

Once consul is successfully deployed, make sure to configure Vault to use the consul instance such as provided in this example configuration:

```yaml
fullnameOverride: "vault"
global:
  enabled: true
  tlsDisable: false
server:
  authDelegator:
    enabled: false
  affinity: ""
  standalone:
    config: |
      api_addr = "http://127.0.0.1:8200"
      ui = true
      listener "tcp" {
        address = "0.0.0.0:8200"
        tls_disable = 1
      }
      storage "consul" {
        path = "vault/"
        address = "http://consul-server:8500"
      }
      service_registration "kubernetes" {}
ui:
  enabled: true
injector:
  enabled: false
```

```bash
helm install vault hashicorp/vault -f vault.yaml
```

The next step is to initialize Vault. The following bash script automatizes the init process and will perform the following actions:

- Create the unseal keys and store them in a file named `vault-credentials.json`
- Unseal Vault
- Create a KV-V2 mount path named `lamassu-pki-kvv2`
- Create an AppRole account used by Lamassu CA
- Create a policy to access KV-V2 service to the specified mount path
- Attach policy to AppRole identity

In the case of to choose a different namespace, it is necessary to change in the following script, the value of the NS variable.

!!! note
    The script below requires having installed [jq](https://jqlang.github.io/jq/) CLI tool witch handles JSON responses. Also, in the case of to choose a
    different namespace, it is necessary to change in the following script, the value of the NS variable.

```bash
{
    export SECRET_ENGINE=lamassu-pki-kvv2
    export VAULT_SVC_NAME=127.0.0.1
    export POLICY_NAME=pki-kv
    export ROLE_NAME=lamassu-ca
    export NS=default

    isVaultInitialized=$(curl -s -k http://$VAULT_SVC_NAME:8200/v1/sys/init | jq -r .initialized)
    if [ "$isVaultInitialized" == "true" ]; then
        echo ">> Vault already initialized. Exiting init process"
    else
        echo ">> Vault is healthy but requires init"
        echo ">> Initializing vault"
        credsFile="vault-credentials.json"
        curl -s --request POST --data '{"secret_shares": 5,"secret_threshold": 3}' -k http://$VAULT_SVC_NAME:8200/v1/sys/init > $credsFile
        echo "  - Unseal keys and root token sotred in '$credsFile'"
    fi

    for ip in $(kubectl get endpoints vault  -o json | jq -r ".subsets[].addresses[].ip"); do
        echo '{"key": '$(cat vault-credentials.json | jq .keys[0])'}'  > payload.json
        curl     --request POST     --data @payload.json  http://$ip:8200/v1/sys/unseal

        echo '{"key": '$(cat vault-credentials.json | jq .keys[1])'}'  > payload.json
        curl     --request POST     --data @payload.json  http://$ip:8200/v1/sys/unseal

        echo '{"key": '$(cat vault-credentials.json | jq .keys[2])'}'  > payload.json
        curl     --request POST     --data @payload.json  http://$ip:8200/v1/sys/unseal

    done

    export VAULT_TOKEN=$(cat vault-credentials.json | jq .root_token)

    VAULT_TOKEN=$(echo $VAULT_TOKEN | sed 's/"//g')

    sleep 5

    curl --header "X-Vault-Token: $VAULT_TOKEN" --request POST  --data '{"type": "approle"}' "http://$VAULT_SVC_NAME:8200/v1/sys/auth/approle"

    curl --header "X-Vault-Token: $VAULT_TOKEN" --request PUT --data '{"policy":"# Read-only permission on secrets stored at 'secret/data/mysql/webapp'\npath \"'$SECRET_ENGINE'/*\" {\n  capabilities = [ \"read\", \"create\" ]\n}  path \"sys/mounts/'$SECRET_ENGINE'\" {\n  capabilities = [ \"read\", \"create\", \"update\" ]\n}  path \"sys/mounts\" {\n capabilities = [ \"read\" ]\n}"}' http://$VAULT_SVC_NAME:8200/v1/sys/policies/acl/$POLICY_NAME

    curl --header "X-Vault-Token: ${VAULT_TOKEN}" --data '{"policies": "'$POLICY_NAME'"}'  "http://$VAULT_SVC_NAME:8200/v1/auth/approle/role/$ROLE_NAME"

    CA_VAULT_ROLEID=$(curl --header "X-Vault-Token: $VAULT_TOKEN" http://$VAULT_SVC_NAME:8200/v1/auth/approle/role/$ROLE_NAME/role-id | jq -r .data.role_id | sed 's/\\n/\n/g' | sed -Ez '$ s/\n+$//')
    CA_VAULT_SECRETID=$(curl --header "X-Vault-Token: $VAULT_TOKEN" --request POST http://$VAULT_SVC_NAME:8200/v1/auth/approle/role/$ROLE_NAME/secret-id | jq -r .data.secret_id | sed 's/\\n/\n/g' | sed -Ez '$ s/\n+$//')

    echo "ROLE_ID: $CA_VAULT_ROLEID"
    echo "SECRET_ID: $CA_VAULT_SECRETID"
}
```

#### PKCS11 - SoftHSM

The [SoftHSM](https://github.com/opendnssec/SoftHSMv2) (Software Hardware Security Module) project is an open-source software project that provides a
software-based implementation of a Hardware Security Module (HSM). An HSM is a hardware device that is used to securely store and manage cryptographic keys and
perform various security-related operations, such as encryption, decryption, and digital signing. SoftHSM replicates the functionality of an HSM in software,
allowing developers and organizations to implement HSM-like security features without the need for physical hardware.

!!! note
    Future versions will allow customizing some initialization properties for the HSM such as the label ID and the pin to access it. As of now, those values are
    hardcoded to `lamassuHSM` and `1234` respectively. This service is meant to be used **only for testing purposes** due to ease of access to underlying data
    and non FIPS 140-2 compliance

It is possible configuring the Storage Class to be used by the SoftHSM deployment.

```bash
helm repo add lamassuiot http://www.lamassu.io/lamassu-helm/
helm install softhsm lamassuiot/softhsm
```

#### PKCS11 - Generic

#### AWS KMS

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "kms:GetPublicKey",
                "kms:ListKeyPolicies",
                "kms:UntagResource",
                "kms:ListRetirableGrants",
                "kms:GetKeyPolicy",
                "kms:ListResourceTags",
                "kms:ListGrants",
                "kms:GetParametersForImport",
                "kms:DescribeCustomKeyStores",
                "kms:ListKeys",
                "kms:TagResource",
                "kms:GetKeyRotationStatus",
                "kms:ListAliases",
                "kms:CreateAlias",
                "kms:DescribeKey",
                "kms:CreateKey",
                "kms:Sign"
            ],
            "Resource": "*"
        }
    ]
}
```

#### AWS Secrets Manager

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "VisualEditor0",
            "Effect": "Allow",
            "Action": [
                "secretsmanager:GetSecretValue",
                "secretsmanager:CreateSecret",
                "secretsmanager:ListSecrets"
            ],
            "Resource": "*"
        }
    ]
}
```

### Authentication

#### Keycloak

Keycloak is an open-source identity and access management (IAM) solution developed by Red Hat. It provides a set of features and capabilities to handle user
authentication, authorization, and identity management in web and mobile applications.

As of now, lamassu integrates this component while deploying Lamassu's own helm chart. By default it is deployed on all instances, but can be disabled if
another OIDC based provider is configured.

To disable keycloak in a lamassu installation, provide the following `values.yaml` file containing:

```yaml
services:
  keycloack:
    enabled: false
```

If instead you choose to go with the default installation and use Keycloak as your IAM OIDC-based provider, include the following section in your `values.yaml`
file:

```yaml
services:
  keycloack:
    enabled: true
    image: ghcr.io/lamassuiot/keycloak:2.1.0
    adminCreds: # (1)
      username: "<admin-user>"
      password: "<admin-password>"
```

1. Set here the credentials of the root admin user for the Keycloak instalation.

The Keycloak Admin user credentials to be created should be specified in this section. This user is required to create Lamassu IoT users after installation by
following the steps below:

1. **Log in to the Keycloak Administration Console**: Open your web browser and navigate to the Keycloak Administration Console at
    `https://<lamasu-domain>/auth/admin`. Log in with your administrator credentials. These credentials has been provided during the helm chart configuration.

1. **Select the "lamassu" Realm**: After logging in, use the dropdown menu in the top left corner to select the `lamassu` realm. This will take you to the realm
    where you want to create the user.

1. **Navigate to the "Users" Section**: In the left-hand sidebar, locate and click on the "Users" option. Here, you'll see a list of existing users in the
    `lamassu` realm.

1. **Create a New User**: To create a new user, click the "Add User" button. This will open a form where you can configure the details of the new user.

1. **Configure User Details**: In the user creation form, provide information such as the username, full name, email. Click on the create button.

1. **Set User Credentials**: In the "Credentials" tab, set the user's password.

1. **Assign the "pki-admin" Role**: To assign the `pki-admin` role to the user, go to the "Role Mappings" tab. Click on "Assing role", find and select
    the "pki-admin" role and move it to the "Assigned Roles" list. This will grant the user the `pki-admin` role.

1. **Login with the new user**: Once you've configured the user navigate to the Lamassu IoT console URL `https://<lamasu-domain>` and provide the user credentials.

The new user is now created and has been assigned the `pki-admin` role in the `lamassu` realm. Ensure that the user has the appropriate roles and permissions as
per your security and access requirements.

#### AWS Cognito

Amazon Cognito is a fully managed identity and user management service provided by AWS that simplifies the process of adding user sign-up, sign-in, and
authentication to web and mobile applications. It is a comprehensive identity and access management (IAM) solution that is designed to help developers secure
their applications by handling the user management and authentication aspects.

Start by creating going to AWS Console and create a new Cognito user pool in case you don't already have one. As can be seen in the image below, in this case
the user pool has been named lamassu-oidc.

![Screenshot](imgs/user-pools.png)

!!! info "Lamassu Helm Chart"
    Make sure to copy the **user pool ID** assigned by AWS as it will be needed while configuring the Lamassu's Helm Chart. Note that the user pool ID is
    different than the assigned name.

Cognito provides a mechanism that assigns a *friendly* URL when a user is redirected to cognito to sign in. Go to `App Integration > Domain > Actions` and
select `Create Cognito Domain` and provide a valid name. Note that the name must be unique within the same AWS region.

![Screenshot](imgs/cognito-domain.png)

Optionally, it is possible to customize the sign in page with some custom CSS and a logo image. To do so, go to `App Integration > Hosted UI customization` For
instance you can configure Cognito to use the following [Image (click to open)](imgs/hosted-ui-logo.jpeg) as the main logo displayed when a user is redirected
to sign in.

To instruct Cognito to display the main logo, use the following css:

```css
.logo-customizable {
  max-width: 100%;
  max-height: 100%;
}

.banner-customizable {
  padding: 10px 0px 10px 0px;
  background-color: #007ACC;
}

.submitButton-customizable {
  font-size: 14px;
  font-weight: bold;
  margin: 20px 0px 10px 0px;
  height: 40px;
  width: 100%;
  color: #fff;
  background-color: #007ACC;
}

.submitButton-customizable:hover {
  color: #fff;
  background-color: gray;
}

```

Finally, and the most important part, is creating a new client application for lamassu within the user pool. Go to `App Integration > App clients and analytics`
and create a new Client and configure as follows:

- App Client
    - App type: Select **Public Client**
    - App client name: Specify a friendly name for the app client. i.e.: `lamassu-ui`
- Hosted UI settings
    - Allowed callback URLs: This is a key parameter. Bare in mind the **URL** used to access lamassu's UI. If you access the UI at `https://dev.lamassu.io` then
        configure such url to be allowed to sign in
    - Allowed sign-out URLs: Use the same URL as the allowed callback URL but appending `/loggedout` at the end. i.e.: `https://dev.lamassu.io/loggedout`

!!! info "Lamassu Helm Chart - `services.auth.oidc.clientId`"
    Make sure to copy the App Client ID assigned by AWS as it will be needed while configuring the Lamassu's Helm Chart. Note that the App Client ID is
    different than the assigned name.

The last critical part for configuring Cognito is to define different user groups to limit what each user is allowed to do with lamassu. As of now, lamassu only
has two roles: `admin` and `operator`. In this example, we will group our user pool users in two cognito groups:

- `pki-admin` group: the users that are assigned to this cognito group will have FULL access to all operations within Lamassu, so make sure to only assign
    authorized users.
- `audit` group: in contrast, this second group will have limited access.

Create and assign the users within your cognito user pool under the `Groups` tab

!!! info "Lamassu Helm Chart"
    Note that we will map those groups into actual lamassu roles later on while configuring the helm chart under `services.auth.authorization`

Configure Lamassu helm chart with the following section. Make sure to replace:

- `COGNIT_AWS_REGION`
- `COGNITO_HOSTED_UI_URL`
- `COGNITO_USER_POOL_ID`
- `COGNITO_CLIENT_ID`

As well as map the appropriate cognito groups under `services.auth.authorization`

```yaml
services:
  keycloack:
    enabled: false
auth:
  oidc:
    frontend:
      authority: https://cognito-idp.<COGNIT_AWS_REGION>.amazonaws.com/<COGNITO_USER_POOL_ID>
      clientId: <COGNITO_CLIENT_ID>
      awsCognito:
        enabled: true
        hostedUiDomain: "<COGNITO_HOSTED_UI_URL>"
  apiGateway:
    jwksUrl: https://cognito-idp.<COGNIT_AWS_REGION>.amazonaws.com/<COGNITO_USER_POOL_ID>/.well-known/jwks.json
  authorization:
    rolesClaim: "cognito:groups"
    roles:
      admin: pki-admin
      operator: audit
```

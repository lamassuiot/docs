# On Premise OSS Services

!!! info

    The installation namespace of the different components are controlled using the `$NS` env variable:

    ```bash
    export NS=lamassu-dev
    kubectl create ns $NS
    ```

## Databases

### Postgres

- [x] Uses Persistence Volumes

Make sure to tune `global.postgresql.auth.username` and `global.postgresql.auth.password` to your desired values from belows config:

```bash
cat > postgres.yaml << "EOF"
fullnameOverride: "postgresql"
global:
  postgresql:
    auth:
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

```bash
export NS=lamassu-dev
helm repo add bitnami https://charts.bitnami.com/bitnami
helm install postgres bitnami/postgresql -n $NS -f postgres.yaml
```


!!! info "Config takes"

    While installing lamassu, make sure to tune the following settings in the `values.yaml` file:
    ```yaml
    postgres:
      hostname: "postgresql-pgpool" #name of the postgres kubernetes service
      port: 5432
      username: "admin"  #use the global.postgresql.username value
      password: "admin"  #use the global.postgresql.password value
    ```

### CouchDB

- [x] Uses Persistence Volumes

```bash
export NS=lamassu-dev
helm repo add couchdb https://apache.github.io/couchdb-helm
helm install couchdb couchdb/couchdb -n $NS \
  --set couchdbConfig.couchdb.uuid=decafbaddecafbaddecafbaddecafbad \
  --set adminUsername=admin \
  --set adminPassword=admin
```

## Crypto Engines

### Hashicorp Vault (with Consul)

- [x] Uses Persistence Volumes

The first step is to deploy Consul as it will be used by Vault to store the PKI sensitive data. In order to make that possible, create consul's config file `consul.yaml` 

```yaml
cat > consul.yaml << "EOF"
fullnameOverride: "consul"
global:
  enabled: true
  datacenter: lamassu-k8s
  tls:
    enabled: false #In this case the connection is HTTP
    # enableAutoEncrypt: true
    # verify: false
    # caCert:
    #   secretName: ca-upstream-cert
client:
  enabled: false
controller:
  enabled: false
connectInject:
  enabled: false

server:
  affinity: "null" #set to null to remove affinity rule. By default consul only deploys 1 service per node. See: https://developer.hashicorp.com/consul/docs/k8s/helm#v-server-affinity

  # annotations: |
  #   "reloader.stakater.com/auto": "true"

  replicas: 1
  extraConfig: |
    {
      "enable_agent_tls_for_checks": true
    }
EOF
```

```bash
export NS=lamassu-dev
helm repo add hashicorp https://helm.releases.hashicorp.com
helm install consul -n $NS hashicorp/consul -f consul.yaml 
```

Once Consul is installed, create vaults's config file `vault.yaml` and install Vault running the following commands:
```yaml
cat > vault.yaml << "EOF"
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
EOF
```

```bash
helm install vault -n $NS hashicorp/vault -f vault.yaml 
```

After finishing the installation of the two services, the next step is to initialise vault.

**Initialise Vault**


By default Vault has no data which means it is in an uninitialised status.  Vault´s initialisation process consist on creating the main encryption keys used to protect data at rest. In order to automatise the initialised process, first open a shell and run this command to enable temporal external connectivity with vault so the initialisation process can  be carried out.

```bash
export VAULT_SVC_NAME=vault
kubectl port-forward -n $NS svc/$VAULT_SVC_NAME 8200:8200 --address 0.0.0.0
```

The script below, will take do de following things:

- Creating the unseal keys
- Unseal Vault,
- Creating an AppRole account used by Lamassu CA
- Create a policy to access KV-V2 service to the specified mount path
- Attach policy to AppRole identity

!!! warning

    The script below uses the `jq` package for parsing JSON responses. Make sure to have it installed:

```bash
{
export NS=lamassu-dev
export VAULT_SVC_NAME=127.0.0.1
export SECRET_ENGINE=lamassu-pki-kvv2
export POLICY_NAME=pki-kv
export ROLE_NAME=lamassu-ca

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

for ip in $(kubectl get endpoints vault -n $NS -o json | jq -r ".subsets[].addresses[].ip"); do
  echo '{"key": '$(cat vault-credentials.json | jq .keys[0])'}'  > payload.json
  curl     --request POST     --data @payload.json  http://$ip:8200/v1/sys/unseal

  echo '{"key": '$(cat vault-credentials.json | jq .keys[1])'}'  > payload.json
  curl     --request POST     --data @payload.json  http://$ip:8200/v1/sys/unseal

  echo '{"key": '$(cat vault-credentials.json | jq .keys[2])'}'  > payload.json
  curl     --request POST     --data @payload.json  http://$ip:8200/v1/sys/unseal

done

export VAULT_TOKEN=$(cat vault-credentials.json | jq .root_token)

VAULT_TOKEN=$(echo $VAULT_TOKEN | sed 's/"//g')

curl --header "X-Vault-Token: $VAULT_TOKEN" --request POST  --data '{"type": "approle"}' "http://$VAULT_SVC_NAME:8200/v1/sys/auth/approle"

curl --header "X-Vault-Token: $VAULT_TOKEN" --request PUT --data '{"policy":"# Read-only permission on secrets stored at 'secret/data/mysql/webapp'\npath \"'$SECRET_ENGINE'/*\" {\n  capabilities = [ \"read\", \"create\" ]\n}  path \"sys/mounts/'$SECRET_ENGINE'\" {\n  capabilities = [ \"read\", \"create\", \"update\" ]\n}  path \"sys/mounts\" {\n capabilities = [ \"read\" ]\n}"}' http://$VAULT_SVC_NAME:8200/v1/sys/policies/acl/$POLICY_NAME

curl --header "X-Vault-Token: ${VAULT_TOKEN}" --data '{"policies": "'$POLICY_NAME'"}'  "http://$VAULT_SVC_NAME:8200/v1/auth/approle/role/$ROLE_NAME"

CA_VAULT_ROLEID=$(curl --header "X-Vault-Token: $VAULT_TOKEN" http://$VAULT_SVC_NAME:8200/v1/auth/approle/role/$ROLE_NAME/role-id | jq -r .data.role_id | sed 's/\\n/\n/g' | sed -Ez '$ s/\n+$//')
CA_VAULT_SECRETID=$(curl --header "X-Vault-Token: $VAULT_TOKEN" --request POST http://$VAULT_SVC_NAME:8200/v1/auth/approle/role/$ROLE_NAME/secret-id | jq -r .data.secret_id | sed 's/\\n/\n/g' | sed -Ez '$ s/\n+$//')

echo "ROLE_ID: $CA_VAULT_ROLEID"
echo "SECRET_ID: $CA_VAULT_SECRETID"
}
```

```bash
export NS=lamassu-dev
helm repo add hashicorp https://helm.releases.hashicorp.com
helm install consul -n $NS hashicorp/consul -f consul.yaml 
```

!!! info "Config takes"
    Don't use the same id for any crypto engine as it will be hard to differentiate later.

    ```yaml
    services:
      ca:
        engines:
          hashicorpVault:
          - id: "my-vault-kvv2"
            role_id: <role_id> # <--- replace with role_id obtained during provisioning
            secret_id: <secret_id> # <--- replace with secret_id obtained during provisioning
            auto_unseal_enabled: 
              - ""
              - ""
              - ""
            auto_unseal_keys: true
            mount_path: "/lamassu-pki-kvv2" # <--- make sure to tune the path if you changed the ENV variables from the initialization script
            metadata: # <--- add your key-value metadata to be displayed later.
              accountID: 123456789 # i.e. AWS Account ID
    ```

### PKCS11 - Generic

### PKCS11 - SoftHSM

*TODO: use PV for `/softhsm/tokens`*

*TODO: customize pin and label`*

```bash
export NS=lamassu-dev
helm repo add lamassuiot http://www.lamassu.io/lamassu-helm/
helm install softhsm lamassuiot/softhsm -n $NS
```

!!! info "Config takes"

    While installing lamassu, make sure to tune the following settings in the `values.yaml` file:
    ```yaml
    services:
      ca:
        engines:
          pkcs11:
          - id: my-softhsm-123 #unique ID across al ca engines
            token: lamassuHSM
            pin: "1234"
            module_path: /usr/local/lib/libpkcs11-proxy.so #path to the dynamic lib to communicate with the HSM
            module_extra_options:
              env:
                PKCS11_PROXY_SOCKET: tcp://softhsm:5657 #address to communicate with the HSM
            metadata: 
              softhsm-version: V2
    ```

## Async Messaging

### RabbitMQ

- [x] Uses Persistence Volumes

```bash
cat > rabbimq.yaml << "EOF"
fullnameOverride: "rabbitmq"
auth:
  username: "user"
  password: "user"
EOF
```

```bash
export NS=lamassu-dev
helm repo add bitnami https://charts.bitnami.com/bitnami
helm install rabbitmq bitnami/rabbitmq -n $NS -f rabbimq.yaml
```

!!! info "Config takes"

    While installing lamassu, make sure to tune the following settings in the `values.yaml` file:
    ```yaml
    amqp:
      hostname: "rabbitmq"
      port: 5672
      username: "user"
      password: "user"
      tls: false
    ```


## Authentication

### Keycloak

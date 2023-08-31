# On Premise OSS Services

!!! info

    The installation namespace of the different components are controlled using the `$NS`º env variable:
    ```bash
    export NS=lamassu-dev
    ```


## Databases

### Postgres - Standalone

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
helm repo add bitnami https://charts.bitnami.com/bitnami
helm install postgres bitnami/postgresql -n $NS -f postgresql.yaml
```

!!! info "Config takes"

    While installing lamassu, make sure to tune the following settings in the `values.yaml` file:
    ```yaml
    postgres:
      hostname: "postgresql" #name of the postgres kuberentes service
      port: 5432
      username: "admin"  #use the global.postgresql.auth.username value
      password: "admin"  #use the global.postgresql.auth.password value
    ```

### Postgres - HA

- [x] Uses Persistence Volumes

```bash
cat > postgres-ha.yaml << "EOF"
fullnameOverride: "postgresql"
global:
  postgresql:
    username: "admin"
    password: "admin"
    repmgrUsername: "admin"
    repmgrPassword: "admin"
    existingSecret: ""
postgresql:
  replicaCount: 3
  initdbScripts:
    init.sql: |
      CREATE DATABASE auth;
      CREATE DATABASE alerts;
      CREATE DATABASE ca;
      CREATE DATABASE cloudproxy;
      CREATE DATABASE devicemanager;
      CREATE DATABASE dmsmanager;
  syncReplication: true
EOF
```

```bash
helm repo add bitnami https://charts.bitnami.com/bitnami
helm install postgres bitnami/postgresql-ha -n $NS -f postgres-ha.yaml
```

!!! info "Config takes"

    While installing lamassu, make sure to tune the following settings in the `values.yaml` file:
    ```yaml
    postgres:
      hostname: "postgresql-pgpool" #name of the postgres kuberentes service
      port: 5432
      username: "admin"  #use the global.postgresql.username value
      password: "admin"  #use the global.postgresql.password value
    ```

### CouchDB - HA

- [x] Uses Persistence Volumes

```bash
helm repo add couchdb https://apache.github.io/couchdb-helm
helm install couchdb couchdb/couchdb -n $NS \
  --set couchdbConfig.couchdb.uuid=decafbaddecafbaddecafbaddecafbad \
  --set adminUsername=admin \
  --set adminPassword=admin
```

## Crypto Engines

### Harshicorp Vault & Consul

Follow the instructions to configure the services [Vault & Consul](service-configs/Consul&Vault/vault-consul.md)


### PKCS11 - Generic

### PKCS11 - SoftHSM

*TODO: use PV for `/softhsm/tokens`*

```bash
helm install softhsm lamassuiot/softhsm -n $NS
```

## Async Messaging

### RabbitMQ

```bash
cat > rabbimq.yaml << "EOF"
fullnameOverride: "rabbitmq"
global:
  storageClass: $SC
podAnnotations:
  reloader.stakater.com/auto: "true"
auth:
  username: "user"
  password: "user"
EOF
```

```bash
helm repo add bitnami https://charts.bitnami.com/bitnami
helm install rabbitmq bitnami/rabbitmq -n $NS -f rabbimq.yaml
```

- [x] Uses Persistence Volumes

## Authentication


### Keycloak

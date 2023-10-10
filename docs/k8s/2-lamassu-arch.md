# 2. Design Your Lamassu Deployment

Lamassu is based on a set of microservices that rely on some basic **Infrastructure services** for different purposes. Make sure to select and deploy the appropriate service for your scenario. You will need to install a Database, an Async Messaging service, and as many Crypto Engines as you require:

## Infrastructure services

### Database

!!! warning

    Install **ONE** service from the list below:

- `Postgres`: [Go to Kubernetes installation using Helm](/k8s/install-oss-comps/#postgres)
- `CouchDB`: *TODO*
- `AWS DynamoDB`: *TODO*

### Async Messaging

!!! warning

    Install **ONE** service from the list below:

- `RabbitMQ`: [Go to Kubernetes installation using Helm](/k8s/install-oss-comps/#rabbitmq)

### Crypto Engines

!!! info

    Install as **MANY** engines as required for your scenario:

- `Hashicorp Vault (with consul)`: [Go to Kubernetes installation using Helm](/k8s/install-oss-comps/#hashicorp-vault-with-consul)
- `SoftHSM`: [Go to Kubernetes installation using Helm](/k8s/install-oss-comps/#pkcs11-softhsm)
- `AWS KMS`: [Go to Kubernetes installation using Helm](/k8s/install-aws-comps/#aws-kms)
- `AWS Secrets Manager`: [Go to Kubernetes installation using Helm](/k8s/install-aws-comps/#aws-secrets-manager)


## Next Step: Install Lamassu

After Installing all the Infrastructure services, you are ready to install a lamassu instance: [Go to install instructions](/k8s/4-install-lamassu)

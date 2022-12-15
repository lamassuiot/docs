# Setup

Lamassu Compose is the official release containing the scripts and resources required to deploy all microservices such as the CA component, the VA component or the RA components to name a few. 

## Requirements
- `jq`. Get the latest version: <https://stedolan.github.io/jq/download/>
- `docker` and `docker-compose`: Get the latest version: <https://docs.docker.com/engine/install/ubuntu/> and <https://docs.docker.com/compose/install/>
- Have a working DNS server able to resolve the domain used during the installation process or add the following content to the `/etc/hosts` file, replacing the `dev.lamassu.io` domain with your own:
    ```
    127.0.0.1  dev.lamassu.io 
    127.0.0.1  vault.dev.lamassu.io 
    127.0.0.1  auth.dev.lamassu.io 
    127.0.0.1  tracing.dev.lamassu.io 
    127.0.0.1  consul.dev.lamassu.io 
    ```

## Setup
1. Get and run the installer script:
    ```bash
    curl -fsSL https://raw.githubusercontent.com/lamassuiot/lamassu-compose/release/lamassu-compose.sh -o lamassu-compose.sh
    sudo bash lamassu-compose.sh --domain dev.lamassu.io --with-simulators --compose-version develop --simulation-version main
    ```

2. *OPTIONAL*: Import your certificates:

    The `lamassu-compose.sh` script also generates self-signed for the downstream certificates. It is possible to provide other valid certificates by replacing the following files:
    ```
    lamassu-compose/tls-certificates
    ├── upstream
    │   └── ...
    └── downstream
        ├── tls.crt     <----- Provide your certificate
        └── tls.key     <----- Provide your private key
    ```

    Once you replace this certificates, restart the api-gateway to obtain the imported certificates:

    ```
    docker-compose rm -s -f api-gateway dms-default
    docker-compose up -d api-gateway dms-default
    ```

3. Final notes:
    
    🚀 You are ready to go 🚀

    !!! note

        Keycloak is your auth provider. During the installation process, the service is provisioned with 2 users with different roles:
            ```
            Username: enroller
            Password: enroller
            Role: admin
            ```
            ```
            Username: operator
            Password: operator
            Role: operator
            ```
        You can change those credentials (or create new users) using keycloak's UI available at: `https://auth.<DOMAIN>`

## Deploy AWS IoT Core connectors

### Requirements

In order tu run the connector, you must have:

- NodeJS: <https://nodejs.org/en/>

- AWS CDK v1: <https://docs.aws.amazon.com/cdk/v1/guide/cli.html>

### Deployment
1. Download the AWS Connector source code:
    ```
    git clone https://github.com/lamassuiot/lamassu-aws-connector.git
    ```

2. Configure the AWS Credentials. Those values will be used by the Lamassu AWS Connector as well as the CDK.
    ```
    export AWS_ACCESS_KEY_ID=<AWS_ACCESS_KEY_ID>
    export AWS_SECRET_ACCESS_KEY=<AWS_SECRET_ACCESS_KEY>
    export AWS_ACCOUNT_ID=<AWS_ACCOUNT_ID>
    export AWS_DEFAULT_REGION=<AWS_DEFAULT_REGION>
    ```

3. Provide a friendly name for the Lamassu AWS Connector. This name will be displayed in the UI
    ```
    export CONNECTOR_NAME=Lamassu IoT AWS Account
    ```

4.  Substitute the aws-connector `.env` file:
    ```
    envsubst < .env | tee .env
    ```

5. Generate the TLS certificates used by the connector. You must have access to the main CA certificate and private key that where generated during Lamassu installation. 
    ```
    export INTERNAL_CA_CERT=<CHANGE_TO_LAMASSU_INSTALLATION_PATH>/tls-certificates/upstream/ca.crt
    export INTERNAL_CA_KEY=<CHANGE_TO_LAMASSU_INSTALLATION_PATH>/tls-certificates/upstream/ca.key
    ```
    After defining those variables, run the following OpenSSL commands:
    ```
    openssl genrsa -out aws-connector.key 4096
    openssl req -new -key aws-connector.key -out aws-connector.csr -subj "/CN=aws-connector" 
    openssl x509 -req -extfile <(printf "subjectAltName=DNS:aws-connector") -in aws-connector.csr -days 365 -CA $INTERNAL_CA_CERT -CAkey $INTERNAL_CA_KEY -CAcreateserial -out aws.crt
    ```

6. Deploy the required AWS services by using the CDK:
    ```
    cd aws-connector
    npm i
    cdk deploy
    ```

7. Start the connector:
    ```
    docker-compose up -d
    ```

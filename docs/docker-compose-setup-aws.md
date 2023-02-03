# AWS IoT Connector

## Requirements

In order tu run the connector, you must have:

- NodeJS: <https://nodejs.org/en/>

- AWS CDK v1: <https://docs.aws.amazon.com/cdk/v1/guide/cli.html>

## Installation

1. Download the AWS Connector source code:

   ```
   git clone https://github.com/lamassuiot/lamassu-aws-connector.git
   ```

1. Configure the AWS Credentials. Those values will be used by the Lamassu AWS
   Connector as well as the CDK.

   ```
   export AWS_ACCESS_KEY_ID=<AWS_ACCESS_KEY_ID>
   export AWS_SECRET_ACCESS_KEY=<AWS_SECRET_ACCESS_KEY>
   export AWS_ACCOUNT_ID=<AWS_ACCOUNT_ID>
   export AWS_DEFAULT_REGION=<AWS_DEFAULT_REGION>
   ```

1. Provide a friendly name for the Lamassu AWS Connector. This name will be
   displayed in the UI

   ```
   export CONNECTOR_NAME=Lamassu IoT AWS Account
   ```

1. Substitute the aws-connector `.env` file:

   ```
   envsubst < .env | tee .env
   ```

1. Generate the TLS certificates used by the connector. You must have access to
   the main CA certificate and private key that where generated during Lamassu
   installation.

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

1. Deploy the required AWS services by using the CDK:

   ```
   cd aws-connector
   npm i
   cdk deploy
   ```

1. Start the connector:

   ```
   docker-compose up -d
   ```

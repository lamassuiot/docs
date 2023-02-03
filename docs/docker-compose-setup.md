# Setup

Docker Compose, aka. Lamassu Compose, is the official release containing the scripts and resources
required to deploy all microservices such as the CA component, the VA component
or the RA components to name a few.

## Requirements

- `jq`. Get the latest version: <https://stedolan.github.io/jq/download/>
- `docker` and `docker-compose`: Get the latest version:
  <https://docs.docker.com/engine/install/ubuntu/> and
  <https://docs.docker.com/compose/install/>
- Have a working DNS server able to resolve the domain used during the
  installation process or add the following content to the `/etc/hosts` file,
  replacing the `dev.lamassu.io` domain with your own:
  ```
  127.0.0.1  dev.lamassu.io 
  127.0.0.1  vault.dev.lamassu.io 
  127.0.0.1  auth.dev.lamassu.io 
  127.0.0.1  tracing.dev.lamassu.io 
  127.0.0.1  consul.dev.lamassu.io 
  ```

## Installation

1. Get and run the installer script:

   ```bash
   curl -fsSL https://raw.githubusercontent.com/lamassuiot/lamassu-compose/release/lamassu-compose.sh -o lamassu-compose.sh
   sudo bash lamassu-compose.sh --domain dev.lamassu.io --with-simulators --compose-version develop --simulation-version main
   ```

1. *OPTIONAL*: Import your certificates:

   The `lamassu-compose.sh` script also generates self-signed for the downstream
   certificates. It is possible to provide other valid certificates by replacing
   the following files:

   ```
   lamassu-compose/tls-certificates
   ├── upstream
   │   └── ...
   └── downstream
       ├── tls.crt     <----- Provide your certificate
       └── tls.key     <----- Provide your private key
   ```

   Once you replace this certificates, restart the api-gateway to obtain the
   imported certificates:

   ```
   docker-compose rm -s -f api-gateway dms-default
   docker-compose up -d api-gateway dms-default
   ```

1. Final notes:

   🚀 You are ready to go 🚀

   !!! note

   ````
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
   ````
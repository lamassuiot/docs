# CA Service Config

Lamassu CA uses a config file to configure different subsystems. The service uses the following look up sequence to load the config file orderer by importance:

- Environment variable `LAMASSU_CONFIG_FILE`
- Standard Path: `/etc/lamassuiot/config.yaml`

## Config reference

- `logs`
    - `level` `(string: "info")` –
    Valid options are `info`, `debug`, `trace`, `none`. This also is used as the default logging level for subsystems if no option is specified. It is possible to specify different log levels for a subset of subsystems and let the others take the global log level set by this variable.
    - `subsystems`:
          - `service` `(string: "info")` - Valid options are `info`, `debug`, `trace`, `none`.
          - `crypto_engine` `(string: "info")` - Valid options are `info`, `debug`, `trace`, `none`.
          - `storage_engine` `(string: "info")` - Valid options are `info`, `debug`, `trace`, `none`. `trace` will log all queries (either SQL, or http requests)
          - `service` `(string: "info")` - Valid options are `info`, `debug`, `trace`, `none`.
          - `http` `(string: "info")` - Valid options are `info`, `debug`, `trace`, `none`.
            `info` will log all the incoming requests URL with the associated http status code. `debug` will add the time delta. `trace` will log all incoming and outgoing requests/response  body.
          - `messaging_engine` `(string: "info")` - Valid options are `info`, `debug`, `trace`, `none`.

- `server`:
    - `listen_address` `(string: "0.0.0.0")` - Address at witch the server will listen for incoming requests.
    - `port` `(int: 8085)`
    - `protocol` `(string: "http")` - Valid options are `http`, `https`. If set to `https`, then both `cert_file` and `key_file` properties are required with valid file paths.
    - `cert_file` `(string: "")`
    - `key_file` `(string: "")`
    - `authentication`
        - `mutual_tls`:
            - `enabled` `(bool: false)` - Requires `protocol == https` otherwise this property wont take effect. If set to true, incoming request be forced to present a client certificate. Refer to `validation_mode` property to define how to authenticate incoming client certificates.
            -  `validation_mode` `(string: "strict")` - Valid options are `strict`,`any`, `request`. `strict` will enforce a client certificate validation using the `ca_cert_file` certificate. `any` will enforce that the client sends a certificate although no validation will be enforced. `request` allows a client sending or not a certificate. If sent, the server won't validate de client certificate.  If `enabled` is set to true, and no mode is provided, it will default to `strict` mode.
            - `ca_cert_file`: `(string: "")` - Requires `validation_mode == strict`. This certificate will be used to validate all incoming http requests during the TLS handshake.
- `amqp_event_publisher`:
    - `enabled` `(bool: "true")`
    - `protocol` `(string: "amqp")` - The allowed protocols are `amqp`, `amqps`. If `amqp` is used the port must be 5672 and if `amqps` is used the port must be 5671.
    - `hostname` `(string: "127.0.0.1")` - Address at which AMQP broker is located
    - `port` `(int: 5672)`
    - `insecure_skip_verify` `(bool: "true")`
    - `ca_cert_file` `(string: "")` - The CA certificate that is used to trust the server.
    - `basic_auth`: - If the `amqp` protocol is used, authentication is done by user and password.
        - `enabled` `(bool: "false")`
        - `username` `(string: "")`
        - `password` `(string: "")`
    - `client_tls_auth`: - If the `amqps` protocol is used, authentication is performed using the client's certificate, so the path to both the certificate and the private key must be specified.
        - `enabled` `(bool: "false")`
        - `cert_file` `(string: "")`
        - `key_file` `(string: "")`

- `storage`:
    - `provider` `(string: "couch_db")` - In CA version 3 currently only couchdb is supported as storage engine. 
    - `couch_db`:
        - `hostname` `(string: "127.0.0.1")` - Address where the database is located
        - `port` `(int: 5984)`
        - `protocol` `(string: "http")` - The protocol used for communication with the database is `http`, therefore, authentication is done with username and password.
        - `insecure_skip_verify` `(bool: false)`
        - `base_path` `(string: "")`
        - `username` `(string: "")`
        - `password` `(string: "")`
    - `postgres`:
        - `hostname` `(string: "127.0.0.1")` - Address where the database is located
        - `port` `(int: 5432)`
        - `username` `(string: "")` - Usuario para realizar la conexión con la base de datos
        - `password` `(string: "")` - Contraseña para realizar la conexión con la base de datos

- `crypto_engines`:
    - `default_id` `(string: "bbc8535e-9b3b-4f8f-8f54-05c971f774fc")` - The default cryptographic engine ID, valid options are `GOLANG`, `HASHICORP_VAULT_KV_V2`, `AWS_KMS`, `AWS_SECRETS_MANAGER` and `PKCS11`.
    - `pkcs11`:
        - `id` `(string: "bbc8535e-9b3b-4f8f-8f54-05c971f774fc")` - Name of the PKCS11 cryptographic engine used.
        - `metadata` `(key-value: {})` - Variable structure of string type used to configure specific variables of each HSM. This structure does not have fixed variables.
        - `token` `(string: "lamassuHSM")` - The token used to connect to the HSM.
        - `pin` `(string: "1234")` - The pin used to connect to the HSM.
        - `module_path` `(string: "/usr/local/lib/libpkcs11-proxy.so")` - The address where the module to connect to the HSM is located.
        - `module_extra_options`: - Extra variables depending on each HSM Software
            -  `env` `(key-value: {})`
    - `hashicorp_vault`:
        - `id` `(string: "c25c421f-a293-4066-a18f-f4e6de3d06be")` - Hashicorp Vault cryptographic engine ID
        - `metadata` `(key-value: {})`
        - `role_id` `(string: "")` - In Vault's authentication process, a Role ID is often used as a static identifier for a client or application. It's associated with a particular role that defines the permissions and policies a client has within Vault.
        - `secret_id` `(string: "")` - The Secret ID is a dynamic credential associated with a Role ID. It is used as part of the authentication process to obtain a Vault token, which grants access to Vault resources.
        - `auto_unseal_enabled` `(bool: false)` - When you start a new Vault server, it typically starts in a sealed state, where it cannot access its encrypted data or provide services until it is manually unsealed. Auto unseal automates this process.
        - `auto_unseal_keys_file` `(string: "")` - The keys used to perform the unseal of Vault
        - `protocol` `(string: "http")` 
        - `base_path` `(string: "")`
        - `hostname` `(string: "127.0.0.1")` - This is the address or URL where your Vault server is running.
        - `port` `(int: 8200)` - The default port for HashiCorp Vault's HTTP API is 8200. This means that when you access Vault's HTTP API over HTTP or HTTPS, you typically use port 8200 by default.
        - `insecure_skip_verify` `(bool: false)`
        - `ca_cert_file` `(string: "")` - The CA certificate that is used to trust the server.
    - `aws_kms`:
        - `id` `(string: "8289b238-95d1-4473-90cd-bbae48ad65a2")` - AWS KMS cryptographic engine ID
        - `metadata` `(key-value: {})`
        - `access_key_id` `(string: "")` -  These are your AWS access credentials used to authenticate your requests to AWS services.  Access Key ID is similar to a username.
        - `secret_access_key` `(string: "")` - Secret Access Key is similar to a password. 
        - `region` `(string: "")` - This specifies the AWS region where your KMS key and other resources are located. 
    - `aws_secrets_manager`:
        - `id` `(string: "f4180711-84ae-46e2-8872-b3e6500b1c79")` - AWS Secrets Manager cryptographic engine ID
        - `metadata` `(key-value: {})`
        - `access_key_id` `(string: "")` -  These are your AWS access credentials used to authenticate your requests to AWS services.  Access Key ID is similar to a username.
        - `secret_access_key` `(string: "")` - Secret Access Key is similar to a password.
        - `region` `(string: "")` - This specifies the AWS region where your AWS Secrets Manager and other resources are located. 
    - `golang`:
        - `id` `(string: "")` - Golang cryptographic engine ID
        - `metadata` `(key-value: {})`
        - `storage_directory` `(string: "")` - Directory in which the secrets (Private Keys) will be stored.

- `crypto_monitoring`:
    - `enabled` `(bool: true)` - Enable monitoring of cryptographic objects and notify when a certificate is expired or about to expire.
    - `frequency` `(string: "* * * * *")` - Frequency at which such monitoring is to be performed.
    - `status_machine_deltas`:
        - `near_expiration`  `(string: "30d")` - Set the expiration time, whereby if the certificate, in this case, has 30 days or less to expire, the status will be changed to `NEARING_EXPIRATION`.
        - `critical_expiration`  `(string: "90d")` - Set the expiration time, whereby if the certificate, in this case, has 90 days or less to expire, the status will be changed to `CRITICAL_EXPIRATION`.
    - `automatic_ca_rotation`:
        - `enabled` `(bool: true)` - Enable automatic CAs rotation depending on when it is going to expire, to set the date on which the rotation will be performed there is the variable `renewal_delta`.
        - `renewal_delta` `(string: "5d")` - Set the date on which the automatic rotation is to be performed, in this case, 5 days before the CAs expire.

- `ocsp_server_url` `(string: "info")` - OCSP server URL
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
    - `protocol` `(string: "amqp")`
    - `hostname` `(string: "127.0.0.1")`
    - `port` `(int: 5672)`
    - `insecure_skip_verify` `(bool: "true")`
    - `ca_cert_file` `(string: "")`
    - `basic_auth`
        - `enabled` `(bool: "false")`
        - `username` `(string: "")`
        - `password` `(string: "")`
    - `client_tls_auth`:
        - `enabled` `(bool: "false")`
        - `cert_file` `(string: "")`
        - `key_file` `(string: "")`

- `storage`:
    - `provider`: "couch_db" #couch_db | postgres | dynamo_db
    - `couch_db`:
        - `hostname` `(string: "127.0.0.1")`
        - `port` `(int: 5432)`
        - `protocol` `(string: "http")`
        - `insecure_skip_verify` `(bool: false)`
        - `base_path` `(string: "")`
        - `username` `(string: "")`
        - `password` `(string: "")`
    - `postgres`:
        - `hostname` `(string: "127.0.0.1")`
        - `port` `(int: 5432)`
        - `username` `(string: "")`
        - `password` `(string: "")`

- `crypto_engines`:
    - `default_id`: `(string: "")`
    - `pkcs11`:
        - `id` `(string: "")`
        - `module_path` `(string: "")`
        - `module_extra_options`:
            - `env`:
        - `pin` `(string: "")`
        - `token` `(string: "")`
        - `metadata` `(key-value: {})`
    - `hashicorp_vault`:
        - `id` `(string: "")`
        - `role_id` `(string: "")`
        - `secret_id` `(string: "")`
        - `auto_unseal_enabled` `(bool: false)`
        - `auto_unseal_keys` `([]string: [])`
        - `protocol` `(string: "http")`
        - `hostname` `(string: "127.0.0.1")`
        - `port` `(int: 8200)`
        - `insecure_skip_verify`: `(bool: false)`
        - `ca_cert_file` `(string: "")`
        - `metadata` `(key-value: {})`
    - `aws_kms`
        - `id` `(string: "")`
        - `access_key_id` `(string: "")`
        - `secret_access_key` `(string: "")`
        - `region` `(string: "")`
        - `metadata` `(key-value: {})`

    - `aws_secrets_manager`:
        - `id` `(string: "")`
        - `access_key_id` `(string: "")`
        - `secret_access_key` `(string: "")`
        - `region` `(string: "")`
        - `metadata` `(key-value: {})`

    - `golang`:
        - `id` `(string: "")`
        - `storage_directory` `(string: "/data")`
        - `metadata` `(key-value: {})`

- `crypto_monitoring`:
    - `enabled` `(bool: true)`
    - `frequency` `(string: "* * * * *")`
    - `status_machine_deltas`:
        - `near_expiration` `(string: "30d")`
        - `critical_expiration`  `(string: "90d")`
- `ocsp_server_url` `(string: "info")`
# Managing Lamassu

## Certificate rotation

By default, all self-signed certificates (both upstream and downstream) have a
lifespan of 365 days. At that point it will be necessary to regenerate the
expired certificates:

1. Regenerate the certificates:

   ```bash
   cd tls-certificates
   ./gen-upstream-certs.sh
   ./gen-downstream-certs.sh
   cd ..
   ```

1. Reboot all services:

   ```bash
   docker-compose down
   docker-compose up -d
   ```

## Backup strategy

Like any other system, Lamassu needs to be backed up regularly to ensure it can
be restored in the event of a disaster. So the operating system, disks and
virtual machine are a given, but with the PKI you also need to restore your
environment in the event of a of total disaster:

- CA certificate(s) and private key(s)
- CA registry information
- CA database backup

There are a number of ways to effectively backup a CA. As an overall summary, we
will perform a system state backup that includes: _Certification Authority
Database_, _Registry Settings_ and _CA Key information_.

Following steps allow to backup an installation based on the standard
docker-compose procedure:

- Save config file: Stores domain variable

  ```bash
  cp lamassu-compose/.env backup/.env
  ```

- Save vault credentials: Ensure that the vault credentials file is safe, and
  not compromised. If control of the credentials is lost, the vault credentials
  can be used to register other machines to vault. Each credential should
  contain a single password used for authentication to a specific system.

  ```bash
  cp lamassu-compose/vault-ca-credentials.json ./backup/
  cp lamassu-compose/vault-credentials.json ./backup/
  ```

- Get Snapshot of Consul: Consul provides
  the [snapshot](https://developer.hashicorp.com/consul/commands/snapshot) command
  which can be run using the CLI or the API. The `snapshot` command saves a
  point-in-time snapshot of the state of the Consul servers which includes, but
  is not limited to: Key-Value entries, the service catalog, prepared queries
  and sessions

  - ACLs

  ```bash
  docker exec consul consul snapshot save backup.snap
  docker cp consul:backup.snap ./backup/
  ```

- Backup PostgreSQL: PostgreSQL provides the `pg_dump` utility to help you back
  up databases. It generates a database file with SQL commands in a format that
  can be easily restored in the future.

  ```bash
  docker exec database bash -c 'pg_dumpall -Uadmin > database.sql'
  docker cp database:database.sql ./backup/
  ```

## Restoring backups

These steps allow to recover the state of an installation based on the standard
docker-compose procedure:

- Restore Lamassu's configuration: retrieve credentials from backup.

  ```bash
  cp backup/.env lamassu-compose/.env
  cp ./backup/vault-ca-credentials.json lamassu-compose/vault-ca-credentials.json
  cp ./backup/vault-credentials.json lamassu-compose/vault-credentials.json
  ```

- Restore Snapshot of Consul: Running the `restore` process should be
  straightforward. Make sure the Consul datacenter you are restoring is stable
  and has a leader. You can verify this
  using `consul operator raft list-peers` and checking server logs and telemetry
  for signs of leader elections or network issues.

  ```bash
  docker cp ./backup/backup.snap consul:backup.snap
  docker exec consul consul snapshot restore backup.snap
  docker exec consul sh -c 'curl -XPUT http://127.0.0.1:8500/v1/catalog/deregister -d"{\"Node\":\"consul-server\"}"'
  ```

- Restore PostgreSQL: Overrides all databases from different components.

  ```bash
  docker cp ./backup/database.sql database:database.sql
  docker exec database bash -c 'dropdb -Uadmin alerts'
  docker exec database bash -c 'dropdb -Uadmin auth'
  docker exec database bash -c 'dropdb -Uadmin ca'
  docker exec database bash -c 'dropdb -Uadmin cloudproxy'
  docker exec database bash -c 'dropdb -Uadmin devicemanager'
  docker exec database bash -c 'dropdb -Uadmin dmsmanager'
  docker exec database bash -c 'psql -Uadmin -f database.sql postgres'
  ```

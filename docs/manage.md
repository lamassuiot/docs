# Managing Lamassu

## Certificate rotation

By default, all self-signed certificates (both upstream and downstream) have a
lifespan of 365 days. At that point it will be necessary to regenerate the
expired certificates:

1. Regenerate the certificates:

   ```
   cd tls-certificates
   ./gen-upstream-certs.sh
   ./gen-downstream-certs.sh
   cd ..
   ```

1. Reboot all services:

   ```
   docker-compose down
   docker-compose up -d
   ```

## Backup strategy

## Restoring backups

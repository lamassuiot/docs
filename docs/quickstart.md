# Getting Started

!!! warning
    The Quick Start configuration is not suitable for production use and should only be run in a testing/development environment

In order to automate the steps required to deploy a fully functional Lamassu instance, a handy script known as the **fast-lane script**. In order to use such script make sure to have a functional kubernetes cluster.

!!! info
     If you need to deploy a simple kubernetes single-node cluster, [follow this guide to launch a microk8s instance](deploy-microk8s.md) or [this guide to launch a k3s instance](deploy-k3s.md)

Installing Lamassu is as simple as running this commands and following the simple terminal-based wizzard:

```bash
curl -fsSL -o lamassu-fast-lane.sh https://raw.githubusercontent.com/lamassuiot/lamassu-helm/main/scripts/lamassu-fast-lane.sh
chmod +x lamassu-fast-lane.sh
bash lamassu-fast-lane.sh
```

# Fast-Lane options

## Non Interactive

By default, the script operates in an interactive mode, which means it prompts the user for input during its execution. However, the non-interactive mode allows the script to run without requiring user input. It is advised to specif This mode is activated by providing certain flags when running the script. 

It is recommended to have a look to other flag options such as `domain` or `tls-crt` and `tls-key` to name a few

```bash
bash lamassu-fast-lane.sh --non-interactive 
```

## Custom / External TLS Certificates

In order to use custom or external TLS certificates to be used by Lamassu's API Gateway, it is required to provide the path to the PEM encoded certificate and key files.

```bash
bash lamassu-fast-lane.sh --tls-crt /path/to/cert.pem --tls-key /path/to/key.pem
```

## Offline

The offline mode enables installing Lamassu in airgap environments. This mode requires the user to have the helm charts for Lamassu, RabbitMQ and Postgres as well as the used docker images already downloaded and present in the kubernetes cluster. 

In order to enable the offline mode, it is required to provide the path to the helm charts for Lamassu, RabbitMQ and Postgres.

Although not required, consider also adding the `--non-interactive` flag to avoid any user input during the installation process.

```bash
bash lamassu-fast-lane.sh --offline --helm-chart-lamassu ./helm-lamassu-2.5.2.tgz  --helm-chart-rabbitmq ./helm-rabbitmq-14.1.0.tgz --helm-chart-postgres ./helm-postgresql-15.2.7.tgz --non-interactive
```

## All Options 

The following table lists the available options for the fast-lane script:

| Flag | Description | Default |
|------|-------------|---------|
| -h, --help | Display help message | |
| -n, --non-interactive | Enable non-interactive mode | *not set / interactive* |
| -ns, --namespace | Kubernetes Namespace where LAMASSU will be deployed | **lamassu-dev** |
| -d, --domain | Domain to be set while deploying LAMASSU | **dev.lamassu.io** |
| --offline | Offline mode enabled | *not set / online* |
| --tls-crt | Path to the PEM encoded certificate used for downstream communications | *not set* |
| --tls-key | Path to the PEM encoded key used for downstream communications | *not set* |
| --helm-chart-lamassu | Path to the Lamassu helm chart (.tgz format) | *not set* |
| --helm-chart-postgres | Path to the Postgres helm chart (.tgz format) | *not set* |
| --helm-chart-rabbitmq | Path to the RabbitMQ helm chart (.tgz format) | *not set* |

# Upgrading Lamassu

There are two kinds of situations that may require an upgrade of the Lamassu instance:

**Update the configuration of the Lamassu instance**: The fastlane script deploys lamassu with a starting configuration. If you need to update the configuration of the Lamassu instance, you must update the values in the `lamassu.yaml` file and then run the `helm upgrade` command as shown below:

```bash
helm upgrade lamassu lamassuiot/lamassu -f lamassu.yaml -n lamassu-dev
```

**Update the Lamassu version**: Depending on each upgrade, the update procedure may very. In general, the following steps are required:

1. Update the helm repository:

    ```bash
    helm repo update
    ```

2. List the available versions of the Lamassu helm chart:

    ```bash
    helm search repo lamassuiot/lamassu
    ```

3. Depending on the upgrade, the helm chart may have changed. In this case, you must update the helm chart values in the `lamassu.yaml` file.

4. Run the `helm upgrade` command:

    ```bash
    helm upgrade lamassu lamassuiot/lamassu -f lamassu.yaml -n lamassu-dev --version <chart_version>
    ```
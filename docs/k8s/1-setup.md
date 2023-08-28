# 1. Kubernetes Setup

Lamassu can be deployed in any kubernetes cluster. For simplicity sake, we provide a set of steps for some Kubernetes distributions and how they should be configured to enable a clean lamassu installation:

## MicroK8s

Start by downloading kuberentes from microk8s official site: [https://microk8s.io/docs/getting-started](https://microk8s.io/docs/getting-started)

Once you have a running instance, make sure to enable the required plugins:

  - **StorageClass**: This distribution already has a default Storage Class provisioner `microk8s.io/hostpath` named `microk8s-hostpath`
  - **CoreDNS**: This service is not provisioned by default. Run the following command to enable it
    ```bash
    microk8s enable dns
    ```
  - **Load Balancer**: To enable the load balancer plugin Run `microk8s enable metallb` specifying the CIDR range used by MetalLB i.e.
    ```bash
    microk8s enable metallb:192.168.1.240/24
    ```
  - **Ingress Controller**:  This distribution has an easy way of installing this plugin by running:
    ```bash
    microk8s enable ingress
    ```

    Once the ingress controller is installed, apply this patch to allow mutual TLS connections to go through the nginx controller
    ```bash
    microk8s kubectl -n ingress patch ds nginx-ingress-microk8s-controller --type=json -p='[{"op": "add", "path": "/spec/template/spec/containers/0/args/-", "value": "--enable-ssl-passthrough"}]'
    ```

  - **CertManager**: To enable the plugin run:
    ```bash
    microk8s enable cert-manager
    ```
## K3s
*TODO*

## AWS EKS
*TODO*

## Minikube
*TODO*

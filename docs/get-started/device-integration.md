# Device Provisioning Integration

## Core Operations

### Obtain the first certificate

!!! warning
    One common source of problems while integrating devices with Lamassu comes during the TLS-Handshake process between the PKI and the device.

    ``` mermaid
    graph LR
      A[Device] --> B[Proxies: i.e. AWS NLB];
      B --> C[Kubernetes Nginx Ingress Controller];
      C --> D[Lamassu API GW];
      D --> E[DMS Manager];
      style B fill:#ddd,stroke:#333,stroke-width:1px
      style C fill:#ddd,stroke:#333,stroke-width:1px
    ```


    `SNI` is required during the TLS-Handshake by `Kubernetes Nginx Ingress Controller` to be able to route traffic to `Lamassu API GW`. Otherwise Lamassu won't get an *intact* Mutual TLS connection, witch implies that Lamassu will receive an HTTP request without the proper device certificate resulting in an invalid enrollment.

### Renew certificates
### Trusted Certificate Authorities

## Device monitoring vs Cloud Monitoring

### Enable AWS IoT Connector
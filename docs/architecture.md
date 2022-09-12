# Architecture

## Core Services

<figure markdown="1">
![Screenshot](img/architecture/architecture.svg)
</figure>


Lamassu has been designed to be modular and keep the core services as simple as possible encapsulating on each service a set of well defined responsibilities. The core services are those that bring the main functionalities of a modern PKI for industrial IoT use cases. The core services are:

### CA 
The Certificate Authority is the service in charge of issuing and managing the life cycle of the certificate. This service manages two different types of certificates:
        
- **PKI Certificates**: This kind of certificates are used by regular end entities such as the devices that connect to the PKI.
- **Internal Certificates**: In contrast with the previous type of certificates, these certificate authorities have a more restricted use. Their creation should be limited to the most trusted entities of the PKI. For instance, DMS certificates are issued by an internal CA named *LAMASSU-DMS-MANAGER* that is created on boot up. For the moment this is the only internal CA that is supported by Lamassu, but we are exploring the possibility of managing the certificates used by the services themselves.

On top of the regular functionalities that can be performed on this service such as creating new CAs, issuing or revoking certificates, this service is in charge of maintaining an accurate state of the managed entities (both CA certificates and regular certificates). In order to do so, a periodic task is scheduled once a day to check the status of validity of all certificates.

!!! warning 
    This feature does not perform well on deployments that have issued many certificates as it is performed on a sequential single threaded process. We are working on a solution to improve this.

There are 4 different status that a certificate can have:

<figure markdown="1">
![Screenshot](img/architecture/ca-status.png){: style="width:225px" .center}
</figure>

The *Active* state indicates that a certificate is valid and can be trusted by end entities. The *Expired* state indicates that a certificate has reached its expiration date and is no longer valid and cannot be trusted anymore. The *Revoked* state is used by PKI admins when a security incident or unexpected situations arise and the certificate or CA certificate is no longer trusted. Recently a new state has been added to the CA service, the *About to expire* state. This state indicates, as the name suggests, that the certificate will expire shortly. The current threshold is set to 30 days and cannot be configured. This state doesn't affect the validity of the certificate, but it is used to notify the PKI admins that the certificate is about to expire and they should take action.

The CA service uses a relational database to store the issued certificates and basic information regarding the provisioned CAs. To configure the database connection, set the following environment variables:

| Environment Variable | Description                                                   |
| -------------------- | ------------------------------------------------------------- |
| POSTGRES_HOSTNAME    | Hostname or address to connect to a running postgres database |
| POSTGRES_PORT        | Port for the postgres instance                                |
| POSTGRES_DATABASE    | Database to use                                               |
| POSTGRES_USERNAME    | Username credentials                                          |
| POSTGRES_PASSWORD    | Password credentials                                          |

This service has been redesigned to support multiple **crypto engines** backends. Originally the only supported engine was the one provided by Hashicorp Vault, but the new redesign implementation allows for a more flexible *golang like* approach, that is by using the `crypto.Signer` interface. Any new crypto engine can be added by implementing this interface. 

To provision the CA service with a crypto engine set the following environment variable:

| Environment Variable | Description                    |
| -------------------- | ------------------------------ |
| ENGINE               | `pkcs11` \| `gopem` \| `vault` |

The current supported crypto engines are:

- **pkcs11**: To Use the HSM crypto engine, define the following environment variables before launching the CA service:

| Environment Variable | Description                             |
| -------------------- | --------------------------------------- |
| PKCS11_DRIVER        | Path to the PKCS11 driver file          |
| PKCS11_LABEL         | Label used by the token to be used      |
| PKCS11_PIN           | PIN code to login and operate the token |

- **gopem** - Files

| Environment Variable | Description                                                                |
| -------------------- | -------------------------------------------------------------------------- |
| GOPEM_DATA           | Directory where the generated private keys belonging to each CA are stored |

Although this new design is easier to maintain and operate, we are also keeping the previous implementation of the Hashicorp Vault that does not follow the new interface. The reason being that in order to provide a Vault implementation that follows the new interface, the Enterprise Vault license is required. This is a limitation that we are working on to overcome with the new crypto engine design. The new standard deployment deprecates the use of Vault as the main backend and instead a Software HSM known as [SoftHSM v2](https://github.com/opendnssec/SoftHSMv2).

- **vault** - Hashicorp Vault

| Environment Variable  | Description                                                           |
| --------------------- | --------------------------------------------------------------------- |
| VAULT_ADDRESS         | Protocol, hostname and port to a vault instance: `https://vault:8200` |
| VAULT_ROLE_ID         | Role ID used by the CA service to login to vault                      |
| VAULT_SECRET_ID       | Secret ID used by the CA service to login to vault                    |
| VAULT_CA              | Path to the CA certificate file for `https` connections               |
| VAULT_UNSEAL_KEY_FILE | Path to the unseal vault keys                                         |
| VAULT_PKI_CA_PATH     | Prefix to use while creating new PKI vault secrets                    |

### DMS Manager

The DMS Manager is the service in charge of managing the Registration Authority of the PKI. Instead of having a centralized Registration Authority, Lamassu uses a decentralized approach to be easily integrated by Device Manufacturing Systems. This way, each DMS has the authority to request the issuance of a certificate for a device being manufactured. Instead of relying on just one registration authority, Lamassu delegates the authorization of the issuance to the [Local Registration Authority or LRA](https://csrc.nist.gov/glossary/term/local_registration_authority).

Each DMS is entitled to authorize the issuance of a certificate to a subset of CAs of the entire PKI defined by the administrator. Each DMS has a list of authorized CAs that may be used during the enrollment process. Once an enrollment process is initiated, the PKI will check that the provided DMS certificate is authorized to issue certificates for the requested CA. The authorization list can be updated to add newly created CAs or remove CAs that are no longer needed.

The DMS certificates that are used to authenticate the DMS are issued by an internal CA named *LAMASSU-DMS-MANAGER*. This CA is created by default when the PKI is deployed as stated earlier.

### Device manager

At its core, the device manager is the main entry point for the enrollment process. It implements the EST protocol that must be used to obtain new certificates. On top of that, this service manages the registration of new devices and to keep a track of the device status. Similar to the CA service, the device manager also schedules a periodic task to check the status of the devices. This task is launched once a day to check the status of validity of all certificates associated by each device.
!!! warning 
    This feature does not perform well on deployments that have issued many certificates as it is performed on a sequential single threaded process. We are working on a solution to improve this.

There are 5 different status a device can have:

<figure markdown="1">
![Screenshot](img/architecture/device-status.png){: style="width:225px" .center}
</figure>

The *Pending Provisioning* state reflects that a device entity has been created but no certificate has been issued yet. The *Fully Provisioned* state indicates that a device has all the device slots with active certificates. The *With warnings* state indicates that a device has one or more slots with certificates that are either expired or have been revoked. The *Requires Action* state indicates that a device has one or more slots with certificates that are about to expire. The *Decommissioned* state indicates that a device has been decommissioned and no longer needs to be tracked by the PKI.

### Cloud Proxy
### Alerts
### OCSP


## Cloud Providers Add-ons
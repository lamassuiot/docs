# Getting Started

Before jumping any further, please check out the [installation process](/setup) to deploy all Lamassu services 

## Overview

### Create a new Certification Authority

### Register a new Device Manufacturing Service

### Provision your devices with x509 Certificates

The enrollment process is the way to go to obtain a certificate issued by one of the provisioned CAs. As described in the RFC document, Lamassu requires the authentication of the client requesting the enrollment using a certificate as well as the private key of an issued DMS to perform a mutual TLS connection. By using this type of TLS connection, the client is able to authenticate the server, and also, the server is able to authenticate the client.

Although the `/api/devmanager/.well-known/cacerts` endpoint returns the list containing all the manged CAs by the PKI, each DMS is entitled to request the issuance of a certificate with an authorized CA. For instance, the PKI may have the following CAs: `CA1`, `CA2`, `CA3` and `CA4`. The `/api/devmanager/.well-known/cacerts` would return all four CAs. Then, a new DMS is registered. the PKI administrator approves the DMS registration by authorizing such DMS to issue certificates with `CA1` and `CA4`. This process is known as the *DMS registration process*. Once the DMS is completely registered, it can now start performing the EST enrollment process. 


## Using the APIs

The main 3 Open API documentation can be found on the following urls:

- <https://dev.lamassu.io/api/dmsenroller/v1/docs/>
- <https://dev.lamassu.io/api/ca/v1/docs/>
- <https://dev.lamassu.io/api/devmanager/v1/docs/>

!!! note

    The following endpoints defined in the Lamassu Device Manager Api specification are not correctly defined due to the limitations imposed by the Open API 3.0 schema. The current specification defines an `OIDC` security schema (meaning that a valid JWT token must be provided while requesting the API) while the implemented security schema uses the `mTLS` approach. This issue will be resolved once the specification is migrated to Open API 3.1 compliant. The affected endpoints are:
    ![Screenshot](img/missing-mtls-openapi.png)

Lamassu provides easy to use GO clients for most of its APIs to help speeding up the development of third-party applications. Before using thees clients, it is important to identify the path taken by the request. Unless the application using the GO clients (or any other http client such as `curl`) is deployed within the same docker network, the request will be [handled by the API Gateway component](#through-the-api-gateway). Otherwise check the [internal usage](#internal-usage) section.

### Through the API Gateway
=== "Go"

    ``` go
    package main

    import (
    "net/url"
    lamassuCAClient "github.com/lamassuiot/lamassuiot/pkg/ca/client"
    caDTO "github.com/lamassuiot/lamassuiot/pkg/ca/common/dto"
    "github.com/lamassuiot/lamassuiot/pkg/utils/client"
    )

    function main (){
        lamassuGatewayURL := "dev.lamassu.io"
        apiCAFile := "path/to/apigw.crt"
        
        caClient := lamassuCAClient.NewLamassuCAClient(client.ClientConfiguration{
            URL: &url.URL{
                Scheme: "https",
                Host:   lamassuGatewayURL,
                Path:   "/api/ca/",
            },
            AuthMethod: client.JWT,
            AuthMethodConfig: &client.JWTConfig{
                Username: "enroller",
                Password: "enroller",
                URL: &url.URL{
                    Scheme: "https",
                    Host:   "auth." + lamassuGatewayURL,
                },
                CACertificate: apiCAFile,
            },
            CACertificate: apiCAFile,
        })
        
        ca, err = caClient.CreateCA(context.Background(), caDTO.Pki, caName, caDTO.PrivateKeyMetadata{KeyType: "rsa", KeyBits: 2048}, caDTO.Subject{CN: caName}, 365*time.Hour, 30*time.Hour)
    }
    ```
=== "Curl"

### Internal usage

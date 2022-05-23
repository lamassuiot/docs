# Lamassu APIs

## Using the APIs

The main 3 Open API documentation can be found on the following urls:

- <https://dev.lamassu.io/api/dmsenroller/v1/docs/>
- <https://dev.lamassu.io/api/ca/v1/docs/>
- <https://dev.lamassu.io/api/devmanager/v1/docs/>

!!! note

    The following endpoints defined in the Lamassu Device Manager Api specification are not correctly defined due to the limitations imposed by the Open API 3.0 schema. The current specification defines an `OIDC` security schema (meaning that a valid JWT token must be provided while requesting the API) while the implemented security schema uses the `mTLS` approach. This issue will be resolved once the specification is migrated to Open API 3.1 compliant. The affected endpoints are:
    ![Screenshot](img/missing-mtls-openapi.png)

Lamassu provides easy to use GO clients for most of its APIs to help speeding up the development of applications:

### Through the API Gateway

### Internal usage


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

# Using Go Clients

Lamassu provides easy to use GO clients for most of its APIs to help speeding up the development of aplications:

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

# APIs


## Using the APIs

Lamassu provides easy to use GO clients for most of its APIs to help speeding up
the development of third-party applications. Before using thees clients, it is
important to identify the path taken by the request. Unless the application
using the GO clients (or any other http client such as `curl`) is deployed
within the same docker network, the request will be
[handled by the API Gateway component](#through-the-api-gateway). Otherwise
check the [internal usage](#internal-usage) section.

### Through the API Gateway

=== "Go"

    ````go
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
    ````

=== "Curl"
    Define the DOMAIN, TOKEN and CA_NAME
    ````bash
    export AUTH_ADDR=auth.$DOMAIN
    export TOKEN=$(curl -k --location --request POST "https://$AUTH_ADDR/auth/realms/lamassu/protocol/openid-connect/token" --header 'Content-Type: application/x-www-form-urlencoded' --data-urlencode 'grant_type=password' --data-urlencode 'client_id=frontend' --data-urlencode 'username=enroller' --data-urlencode 'password=enroller' | jq -r .access_token)
    export CA_ADDR=$DOMAIN/api/ca
    export CA_NAME=$(uuidgen)
    ````

    Creating CA
    ````bash
        export CREATE_CA_RESP=$(curl -k -s --location --request POST "https://$CA_ADDR/v1/pki" --header "Authorization: Bearer ${TOKEN}" --header 'Content-Type: application/json' --data-raw "{\"ca_duration\": 262800, \"issuance_duration\": 175200, \"subject\":{ \"common_name\": \"$CA_NAME\",\"country\": \"ES\",\"locality\": \"Arrasate\",\"organization\": \"LKS Next, S. Coop\",\"state\": \"Gipuzkoa\"},\"key_metadata\":{\"bits\": 4096,\"type\": \"RSA\"}}")
    ````


#### Filtering, Sorting and Pagination

Lamassu API supports filtering, sorting and pagination.

The filter can be form by the following parameters, being each of them optional:

- `filter= attribute[operator]=value`
- `sort_by=attribute.[asc|desc]`
- `limit=value` . Limits the maximun number of results of the query
- `offset=value` . In addition to `limit`, implements pagination. It defines the
  index of the first value from the resulting query.

!!! Example
    ````
    /v1/devices?filter=id[contains]=device_id&sort_by=id.asc&limit=100&offset=15

    /v1?filter=id[contains]=dms_id&sort_by=id.desc
    ````

##### Operators

Depending of the data type of the parameters, the supported operators will vary.

- Strings : `equals`, `notequals`, `contains`, `notcontains`
- Dates: `before`, `after`, `is`, `isnot`
- Enums: `is`, `isnot`
- Numbers: `lessthan`, `greaterthan`, `lessorequal`, `gretaerorequal`, `equal`,
  `notequal`

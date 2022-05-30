# Protocols & Lamassu

Lamassu supports a set of standards to perform some of its key functionalities such as enrolling devices as well as validating the status of a given certificate. This section aims to describe those protocols as well as explaining how them with practical examples.

## OCSP

The [Online Certificate Status Protocol](https://datatracker.ietf.org/doc/html/rfc6960) or OCSP for short, is a protocol used to determine the current status of a digital certificate without requiring the use of Certificate Revocation Lists (CRLs).

As defined by the standard, there are two possible methods that can be used to perform the http request:

| Method | Path                                                                              | Headers                                 | Body payload                                        | Used when                                                   |
| ------ | --------------------------------------------------------------------------------- | --------------------------------------- | --------------------------------------------------- | ----------------------------------------------------------- |
| `GET`  | `{url}/{url-encoding of base-64 encoding of the DER encoding of the OCSPRequest}` | :material-close:                        | :material-close:                                    | Recommended when the encoded request is less than 255 bytes |
| `PUT`  | `{url}`                                                                           | Content-Type: `application/ocsp-request` | Binary value of the DER encoding of the OCSPRequest | Can always be used                                          |

### GET Request
=== "OpenSSL"
    
    Define the OCSP server endpoint as well as the 
    ```
    export OCSP_SERVER=dev.lamassu.io:443 
    export CA_CERTIFICATE=issuer_ca.crt 
    export DEVICE_CERTIFICATE=device.crt
    ```
    
    Obtain the Root certificate used by the server
    ```
    openssl s_client -connect $OCSP_SERVER  2>/dev/null </dev/null |  sed -ne '/-BEGIN CERTIFICATE-/,/-END CERTIFICATE-/p' > root-ca.pem
    ```
    
    Create the OCSP Request
    ```
    OCSP_REQUEST=$(openssl ocsp -CAfile $CA_CERTIFICATE -issuer $CA_CERTIFICATE -cert $DEVICE_CERTIFICATE -reqout - | base64 -w 0)
    ```
    
    Check the status of the certificate
    ```
    curl --location --request GET "$OCSP_SERVER/api/ocsp/$OCSP_REQUEST" > ocspresponse.der 
    openssl ocsp -respin ocspresponse.der -VAfile root-ca.pem -resp_text    ```
    ```

=== "Go"
    ```go
    package main

    import (
        "crypto/x509"
        "encoding/base64"
        "encoding/pem"
        "fmt"
        "io/ioutil"
        "net/http"
        "os"

        "github.com/lamassuiot/lamassuiot/pkg/ocsp/server/crypto/ocsp"
    )

    func main() {
        ocspServer := "http://localhost:9098"
        issuerCA := "ca.crt"
        certificateToCheck := "device.crt"

        caPEM, err := ioutil.ReadFile(issuerCA)
        if err != nil {
            fmt.Println("Could not load CA certificate")
            os.Exit(1)
        }
        caPemBlock, _ := pem.Decode(caPEM)
        ca, err := x509.ParseCertificate(caPemBlock.Bytes)
        if err != nil {
            fmt.Println(err)
            os.Exit(1)
        }

        devicePEM, err := ioutil.ReadFile(certificateToCheck)
        if err != nil {
            fmt.Println("Could not load Device certificate")
            os.Exit(1)
        }
        devicePemBlock, _ := pem.Decode(devicePEM)
        device, err := x509.ParseCertificate(devicePemBlock.Bytes)
        if err != nil {
            fmt.Println(err)
            os.Exit(1)
        }

        ocspRequestBytes, err := ocsp.CreateRequest(device, ca, &ocsp.RequestOptions{})
        if err != nil {
            fmt.Println(err)
            os.Exit(1)
        }

        encodedRequest := base64.StdEncoding.EncodeToString(ocspRequestBytes)
        fmt.Println(encodedRequest)

        reqURL := ocspServer + "/" + encodedRequest

        resp, err := http.Get(reqURL)

        if err != nil {
            fmt.Println(err)
            os.Exit(1)
        }

        if resp.StatusCode != http.StatusOK {
            os.Exit(1)
        }

        body, err := ioutil.ReadAll(resp.Body)
        if err != nil {
            os.Exit(1)
        }
        resp.Body.Close()

        ocspResponse, err := ocsp.ParseResponse(body, nil)
        if err != nil {
            fmt.Println("Could not parse OCSP response ", err)
            os.Exit(1)
        }

        fmt.Println(ocspResponse.Status == ocsp.Good)
        fmt.Println(ocspResponse.Status == ocsp.Revoked)
        fmt.Println(ocspResponse.RevokedAt)
    }

    ```
### POST Request


## EST

### CA Certificates
=== "GlobalSign"

    Install GlobalSign Est Client
        ```
        go install github.com/globalsign/est/cmd/estclient@latest
        ```

    Define the DOMAIN as well as the
        ```
        export DOMAIN=dev.lamassu.io 
        ```
    Obtain the Root certificate used by the server
        ```
        openssl s_client -connect $OCSP_SERVER  2>/dev/null </dev/null |  sed -ne '/-BEGIN CERTIFICATE-/,/-END CERTIFICATE-/p' > root-ca.pem
        ```
    Obtaining CAs certificates
        ```
        estclient cacerts -server $DOMAIN/api/devmanager -explicit root-ca.pem -out cacerts.pem
        ```

=== "Go"

    ```go
    package main

    import (
        "context"
        "crypto/x509"
        "encoding/pem"
        "fmt"
        "io/ioutil"
        "os"

        "github.com/lamassuiot/lamassuiot/pkg/est/client"
    )

    func main() {
        estServerAddr := "dev.lamassu.io/api/devmanager"
        servercrt := "server.crt"
        clientcrt := "dms.crt"
        clientkey := "dms.key"

        caCert, err := ioutil.ReadFile(servercrt)
        if err != nil {
            fmt.Println(err)
            os.Exit(1)
        }
        caCertPool := x509.NewCertPool()
        caCertPool.AppendCertsFromPEM(caCert)

        certContent, err := ioutil.ReadFile(clientcrt)
        if err != nil {
            fmt.Println(err)
            os.Exit(1)
        }
        cpb, _ := pem.Decode(certContent)

        crt, err := x509.ParseCertificate(cpb.Bytes)
        if err != nil {
            fmt.Println(err)
            os.Exit(1)
        }

        key, err := ioutil.ReadFile(clientkey)
        if err != nil {
            fmt.Println(err)
            os.Exit(1)
        }

        estClient, err := client.NewLamassuEstClient(estServerAddr, caCertPool, crt, key, nil)
        if err != nil {
            fmt.Println(err)
            os.Exit(1)
        }
        cas, err := estClient.CACerts(context.Background())
        if err != nil {
            fmt.Println(err)
            os.Exit(1)
        }
    }

        ```


<https://datatracker.ietf.org/doc/html/rfc7030>

# Protocols

Lamassu supports a set of standards to perform some of its key functionalities such as enrolling devices as well as validating the status of a given certificate. This section aims to describe those protocols as well as explaining how them with practical examples.

## OCSP

The [Online Certificate Status Protocol](https://datatracker.ietf.org/doc/html/rfc6960) or OCSP for short, is a protocol used to determine the current status of a digital certificate without requiring the use of Certificate Revocation Lists (CRLs).

As defined by the standard, there are two possible methods that can be used to perform the http request:

| Method | Path                                                                              | Headers                                 | Body payload                                        | Used when                                                   |
| ------ | --------------------------------------------------------------------------------- | --------------------------------------- | --------------------------------------------------- | ----------------------------------------------------------- |
| `GET`  | `{url}/{url-encoding of base-64 encoding of the DER encoding of the OCSPRequest}` | :material-close:                        | :material-close:                                    | Recommended when the encoded request is less than 255 bytes |
| `POST`  | `{url}`                                                                           | Content-Type: `application/ocsp-reques` | Binary value of the DER encoding of the OCSPRequest | Can always be used                                          |

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
    openssl ocsp -respin ocspresponse.der -VAfile root-ca.pem -resp_text
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

The core mechanism to obtain valid certificates for your devices is using the enrollment process described by the EST protocol. EST or [Enrollment over Secure Transport](https://datatracker.ietf.org/doc/html/rfc7030) establishes a set of standardized endpoints. The following table sums up all endpoints defined by the EST protocol and wether or not are supported by the current implementation.

| Operation                       | Operation Path                             | Required by RFC7030 | Supported        |
| ------------------------------- | ------------------------------------------ | ------------------- | ---------------- |
| Distribution of CA Certificates | /api/devmanager/.well-known/cacerts        | :material-check:    | :material-check: |
| Enrollment of Clients           | /api/devmanager/.well-known/simpleenroll   | :material-check:    | :material-check: |
| Re-enrollment of Clients        | /api/devmanager/.well-known/simplereenroll | :material-check:    | :material-check: |
| Full CMC                        | /api/devmanager/.well-known/fullcmc        | :material-close:    | :material-close: |
| Server-Side Key Generation      | /api/devmanager/.well-known/serverkeygen   | :material-close:    | :material-alert: |
| CSR Attributes                  | /api/devmanager/.well-known/csrattrs       | :material-close:    | :material-close: |

### Distribution of CA Certificates

### Enrollment of Devices  


### Re-enrollment of Devices 
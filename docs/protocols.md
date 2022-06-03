# Protocols

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
    curl --location --request GET "https://$OCSP_SERVER/api/ocsp/$OCSP_REQUEST" > ocspresponse.der 
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
    openssl ocsp -issuer ca.crt -cert dev.crt -reqout - > ocsp-request-post.der
    ```
    
    Check the status of the certificate
    ```
    curl --location --request POST "https://$DOMAIN/api/ocsp/" --header 'Content-Type: application/ocsp-request' --data-binary '@ocsp-request-post.der' > ocsp-response-post.der -k
    openssl ocsp -respin ocsp-response-post.der -VAfile root-ca.pem -resp_text
    ```

=== "Go"
    ```go
        package main

        import (
            "bytes"
            "crypto/x509"
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

            resp, err := http.Post(ocspServer, "application/ocsp-request", bytes.NewReader(ocspRequestBytes))

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
        openssl s_client -connect $DOMAIN:443  2>/dev/null </dev/null |  sed -ne '/-BEGIN CERTIFICATE-/,/-END CERTIFICATE-/p' > root-ca.pem
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
=== "Curl"

    Define the DOMAIN as well as the
        ```
        export DOMAIN=dev.lamassu.io 
        ```
    Obtain the Root certificate used by the server
        ```
        openssl s_client -connect $DOMAIN:443  2>/dev/null </dev/null |  sed -ne '/-BEGIN CERTIFICATE-/,/-END CERTIFICATE-/p' > root-ca.pem
        ```
    Obtaining CAs certificates
        ```
        curl https://$DOMAIN/api/devmanager/.well-known/est/cacerts -o cacerts.p7 --cacert root-ca.pem
        openssl base64 -d -in cacerts.p7 | openssl pkcs7 -inform DER -outform PEM -print_certs -out cacerts.pem 
        ```
### Enrollment of Devices
=== "GlobalSign"

    Install GlobalSign Est Client
        ```
        go install github.com/globalsign/est/cmd/estclient@latest
        ```

    Define environment variables as well as the

    ```
    export DOMAIN=dev.lamassu.io
    export CA_NAME=Test-CA
    export DEVICE_ID=$(uuidgen)
    export DMS_CERT=dms.crt
    export DMS_KEY=dms.key  
    ```
    !!! note
        The name of the CA has to be that of a CA that has the DMS as Authorized_CAs.

    Obtain the Root certificate used by the server
        ```
        openssl s_client -connect $DOMAIN:443  2>/dev/null </dev/null |  sed -ne '/-BEGIN CERTIFICATE-/,/-END CERTIFICATE-/p' > root-ca.pem
        ```
    Enrolling with an existing private key
        ```
        openssl genrsa 4096 > key.pem
        estclient csr -key key.pem -cn $DEVICE_ID -out csr.pem
        estclient enroll -server $DOMAIN/api/devmanager -explicit root-ca.pem -csr csr.pem -aps $CA_NAME -key $DMS_KEY -certs $DMS_CERT -out cert.pem  
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
        dmscrt := "dms.crt"
        dmskey := "dms.key"
        devicecsr := "device.csr"
        devicecrt:="device.crt"
        ca_name := "Test-CA"
        caCert, err := ioutil.ReadFile(servercrt)
        if err != nil {
            fmt.Println(err)
            os.Exit(1)
        }
        caCertPool := x509.NewCertPool()
        caCertPool.AppendCertsFromPEM(caCert)

        certContent, err := ioutil.ReadFile(dmscrt)
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

        certContent, err = ioutil.ReadFile(devicecsr)
        if err != nil {
            fmt.Println(err)
            os.Exit(1)
        }
        cpb, _ = pem.Decode(certContent)

        csr, err := x509.ParseCertificateRequest(cpb.Bytes)
        if err != nil {
            fmt.Println(err)
            os.Exit(1)
        }

        key, err := ioutil.ReadFile(dmskey)
        if err != nil {
            fmt.Println(err)
            os.Exit(1)
        }

        estClient, err := client.NewLamassuEstClient(estServerAddr, caCertPool, crt, key, nil)
        if err != nil {
            fmt.Println(err)
            os.Exit(1)
        }

        cert, err := estClient.Enroll(context.Background(), ca_name, csr)
        if err != nil {
            fmt.Println(err)
            os.Exit(1)
        }
        b := pem.Block{Type: "CERTIFICATE", Bytes: cert.Raw}
	    certPEM := pem.EncodeToMemory(&b)
	    ioutil.WriteFile(devicecrt, certPEM, 0777)
    }
    ```
=== "Curl"

    Define environment variables as well as the

    ```
    export DOMAIN=dev.lamassu.io
    export CA_NAME=Test-CA
    export DEVICE_ID=$(uuidgen)
    export DMS_CERT=dms.crt
    export DMS_KEY=dms.key  
    ```
    !!! note
        The name of the CA has to be that of a CA that has the DMS as Authorized_CAs.

    Obtain the Root certificate used by the server
        ```
        openssl s_client -connect $DOMAIN:443  2>/dev/null </dev/null |  sed -ne '/-BEGIN CERTIFICATE-/,/-END CERTIFICATE-/p' > root-ca.pem
        ```
    Create device CSR and private Key
        ```
        openssl req -new -newkey rsa:2048 -nodes -keyout device.key -out device.csr -subj "/CN=$DEVICE_ID"

        sed '/CERTIFICATE/d' device.csr > device_enroll.csr   
        ```

    Enrolling with an existing private key
        ```
        curl https://$DOMAIN/api/devmanager/.well-known/est/$CA_NAME/simpleenroll --cert $DMS_CRT --key $DMS_KEY -s -o cert.p7 --cacert root-ca.pem  --data-binary @device_enroll.csr -H "Content-Type: application/pkcs10"

        openssl base64 -d -in cert.p7 | openssl pkcs7 -inform DER -outform PEM -print_certs -out cert.pem   
        ```

### Re-enrollment of Devices 

=== "GlobalSign"
    Install GlobalSign Est Client
        ```
        go install github.com/globalsign/est/cmd/estclient@latest
        ```

    Define environment variables as well as the

    ```
    export DOMAIN=dev.lamassu.io
    export DEVICE_CRT=device.crt
    export DEVICE_KEY=device.key  
    ```

    Obtain the Root certificate used by the server
        ```
        openssl s_client -connect $DOMAIN:443  2>/dev/null </dev/null |  sed -ne '/-BEGIN CERTIFICATE-/,/-END CERTIFICATE-/p' > root-ca.pem
        ```
    Reenrolling
        ```
        estclient reenroll -server $DOMAIN/api/devmanager -explicit root-ca.pem -key $DEVICE_KEY -certs $DEVICE_CRT -out newcert.pem
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
            devicecrt := "device.crt"
            devicekey := "device.key"
            devicecsr := "device.csr"

            caCert, err := ioutil.ReadFile(servercrt)
            if err != nil {
                fmt.Println(err)
                os.Exit(1)
            }
            caCertPool := x509.NewCertPool()
            caCertPool.AppendCertsFromPEM(caCert)

            certContent, err := ioutil.ReadFile(devicecrt)
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

            certContent, err = ioutil.ReadFile(devicecsr)
            if err != nil {
                fmt.Println(err)
                os.Exit(1)
            }
            cpb, _ = pem.Decode(certContent)

            csr, err := x509.ParseCertificateRequest(cpb.Bytes)
            if err != nil {
                fmt.Println(err)
                os.Exit(1)
            }

            key, err := ioutil.ReadFile(devicekey)
            if err != nil {
                fmt.Println(err)
                os.Exit(1)
            }

            estClient, err := client.NewLamassuEstClient(estServerAddr, caCertPool, crt, key, nil)
            if err != nil {
                fmt.Println(err)
                os.Exit(1)
            }

            cert, err := estClient.Reenroll(context.Background(), csr)
            if err != nil {
                fmt.Println(err)
                os.Exit(1)
            }
            b := pem.Block{Type: "CERTIFICATE", Bytes: cert.Raw}
            certPEM := pem.EncodeToMemory(&b)
            ioutil.WriteFile(devicecrt, certPEM, 0777)
        }
    ```
=== "Curl"

    Define environment variables as well as the

    ```
    export DOMAIN=dev.lamassu.io
    export DEVICE_CRT=device.crt
    export DEVICE_KEY=device.key
    exprot DEVICE_CSR=device.csr  
    ```

    Obtain the Root certificate used by the server
        ```
        openssl s_client -connect $DOMAIN:443  2>/dev/null </dev/null |  sed -ne '/-BEGIN CERTIFICATE-/,/-END CERTIFICATE-/p' > root-ca.pem
        ```
    Create device enroll CSR
        ```
        sed '/CERTIFICATE/d' device.csr > device_enroll.csr   
        ```
    Reenrolling
        ```
        curl https://$DOMAIN/api/devmanager/.well-known/est/simplereenroll --cert $DEVICE_CRT --key $DEVICE_KEY -s -o newcert.p7 --cacert root-ca.pem --data-binary @device_enroll.csr -H "Content-Type: application/pkcs10"

        openssl base64 -d -in newcert.p7 | openssl pkcs7 -inform DER -outform PEM -print_certs -out $DEVICE_CRT
        ```

### Server Key Generation of Devices 

=== "GlobalSign"
    Install GlobalSign Est Client
        ```
        go install github.com/globalsign/est/cmd/estclient@latest
        ```

    Define environment variables as well as the

    ```
    export DOMAIN=dev.lamassu.io
    export CA_NAME=Test-CA
    export DEVICE_ID=$(uuidgen)
    export DMS_CERT=dms.crt
    export DMS_KEY=dms.key  
    ```
    !!! note
        The name of the CA has to be that of a CA that has the DMS as Authorized_CAs.

    Obtain the Root certificate used by the server
        ```
        openssl s_client -connect $DOMAIN:443  2>/dev/null </dev/null |  sed -ne '/-BEGIN CERTIFICATE-/,/-END CERTIFICATE-/p' > root-ca.pem
        ```
    Enrolling with a server-generated private key
        ```
        openssl genrsa 4096 > key.pem
        estclient csr -key key.pem -cn $DEVICE_ID -out csr.pem
        estclient serverkeygen -server $DOMAIN/api/devmanager -explicit root-ca.pem -csr csr.pem -aps $CA_NAME -key $DMS_KEY -certs $DMS_CERT -out device.crt -keyout device.key
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
            dmscrt := "dms.crt"
            dmskey := "dms.key"
            devicecrt := "device.crt"
            devicekey := "device.key"
            devicecsr := "device.csr"
            ca_name := "Test-CA"
            caCert, err := ioutil.ReadFile(servercrt)
            if err != nil {
                fmt.Println(err)
                os.Exit(1)
            }
            caCertPool := x509.NewCertPool()
            caCertPool.AppendCertsFromPEM(caCert)

            certContent, err := ioutil.ReadFile(dmscrt)
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

            certContent, err = ioutil.ReadFile(devicecsr)
            if err != nil {
                fmt.Println(err)
                os.Exit(1)
            }
            cpb, _ = pem.Decode(certContent)

            csr, err := x509.ParseCertificateRequest(cpb.Bytes)
            if err != nil {
                fmt.Println(err)
                os.Exit(1)
            }

            key, err := ioutil.ReadFile(dmskey)
            if err != nil {
                fmt.Println(err)
                os.Exit(1)
            }

            estClient, err := client.NewLamassuEstClient(estServerAddr, caCertPool, crt, key, nil)
            if err != nil {
                fmt.Println(err)
                os.Exit(1)
            }

            cert, key, err := estClient.ServerKeyGen(context.Background(), ca_name, csr)
            if err != nil {
                fmt.Println(err)
                os.Exit(1)
            }
            b := pem.Block{Type: "CERTIFICATE", Bytes: cert.Raw}
            certPEM := pem.EncodeToMemory(&b)
            ioutil.WriteFile(devicecrt, certPEM, 0777)

            b = pem.Block{Type: "PRIVATE KEY", Bytes: key}
            keyPEM := pem.EncodeToMemory(&b)
            ioutil.WriteFile(devicekey, keyPEM, 0777)
        }

    ```
=== "Curl"
    Define environment variables as well as the

    ```
    export DOMAIN=dev.lamassu.io
    export CA_NAME=Test-CA
    export DEVICE_ID=$(uuidgen)
    export DMS_CERT=dms.crt
    export DMS_KEY=dms.key  
    ```
    !!! note
        The name of the CA has to be that of a CA that has the DMS as Authorized_CAs.

    Obtain the Root certificate used by the server
        ```
        openssl s_client -connect $DOMAIN:443  2>/dev/null </dev/null |  sed -ne '/-BEGIN CERTIFICATE-/,/-END CERTIFICATE-/p' > root-ca.pem
        ```
    Create device CSR and private Key
        ```
        openssl req -new -newkey rsa:2048 -nodes -keyout device.key -out device.csr -subj "/CN=$DEVICE_ID"

        sed '/CERTIFICATE/d' device.csr > device_enroll.csr   
        ```
    Enrolling with a server-generated private key
        ```
        curl https://$DOMAIN/api/devmanager/.well-known/est/$CA_NAME/serverkeygen --cert $DMS_CERT --key $DMS_KEY -s -o cert.p7 --cacert root-ca.pem  --data-binary @device_enroll.csr -H "Content-Type: application/pkcs10"

        cat cert.p7 | sed -ne '/application\/pkcs7-mime/,/-estServerKeyGenBoundary/p' |  sed '/-/d' > crt.p7

        openssl base64 -d -in crt.p7 | openssl pkcs7 -inform DER -outform PEM -print_certs -out device.pem

        ```
<https://datatracker.ietf.org/doc/html/rfc7030>


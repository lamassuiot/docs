# OCSP Protocol

=== "OpenSSL"
    #Method 1 - GET request
    ```
    OCSP_REQUEST=$(openssl ocsp -CAfile Lamassu-Root-CA3-ECC384.crt -issuer Lamassu-Root-CA3-ECC384.crt -cert device-testrsa.crt -reqout - | base64 -w 0)
    
    OCSP_SERVER=http://dev-lamassu.zpd.ikerlan.es:9098
    curl --location --request GET "$OCSP_SERVER/$OCSP_REQUEST" > ocspresponse.der

    openssl ocsp -respin ocspresponse.der -VAfile ../../lamassu/lamassu.crt -resp_text
    ```

    Method 2 - POST request
    ```
    ```

=== "Go"
    ``` go

    ```
    
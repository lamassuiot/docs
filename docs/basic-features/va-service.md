# VA Service

A Validation Authority (VA) is a critical component in a Public Key Infrastructure (PKI), a system that provides secure communication and data exchange over networks. The VA plays a vital role in verifying the validity of digital certificates issued within the PKI framework. It helps ensure the trustworthiness and integrity of the entire PKI ecosystem by acting as a trusted third-party entity.

This section aims to describe those protocols as well as explaining how to use them

## OCSP

The
[Online Certificate Status Protocol](https://datatracker.ietf.org/doc/html/rfc6960) or OCSP for short, is a protocol used to determine the current status of a digital certificate without requiring the use of Certificate Revocation Lists (CRLs).

As defined by the standard, there are two possible methods that can be used to perform the http request:

| Method | Path                                                                              | Headers                                  | Body payload                                        | Used when                                                   |
| ------ | --------------------------------------------------------------------------------- | ---------------------------------------- | --------------------------------------------------- | ----------------------------------------------------------- |
| `GET`  | `{url}/{url-encoding of base-64 encoding of the DER encoding of the OCSPRequest}` | :material-close:                         | :material-close:                                    | Recommended when the encoded request is less than 255 bytes |
| `PUT`  | `{url}`                                                                           | Content-Type: `application/ocsp-request` | Binary value of the DER encoding of the OCSPRequest | Can always be used                                          |


### GET Request

Define the OCSP server endpoint as well as the certificate to validate and the issuer CA of such certificate

```bash
export OCSP_SERVER=dev.lamassu.io
export CA_CERTIFICATE=issuer_ca.crt 
export CERTIFICATE=cert_to_validate.crt
```

Obtain the Root certificate used by the server that will be later used during the TLS handshake with the OCSP server

```bash
openssl s_client -connect $OCSP_SERVER  2>/dev/null </dev/null |  sed -ne '/-BEGIN CERTIFICATE-/,/-END CERTIFICATE-/p' > root-ca.pem
```

Create the OCSP Request

```bash
OCSP_REQUEST=$(openssl ocsp -CAfile $CA_CERTIFICATE -issuer $CA_CERTIFICATE -cert $CERTIFICATE -reqout - | base64 -w 0)
```

Check the status of the certificate

```bash
curl --location --request GET "https://$OCSP_SERVER/api/ocsp/$OCSP_REQUEST" > ocspresponse.der 
openssl ocsp -respin ocspresponse.der -VAfile $CA_CERTIFICATE -resp_text
```

### POST Request

Define the OCSP server endpoint as well as the certificate to validate and the issuer CA of such certificate

```bash
export OCSP_SERVER=dev.lamassu.io
export CA_CERTIFICATE=issuer_ca.crt 
export CERTIFICATE=cert_to_validate.crt
```

Obtain the Root certificate used by the server

```bash
openssl s_client -connect $OCSP_SERVER  2>/dev/null </dev/null |  sed -ne '/-BEGIN CERTIFICATE-/,/-END CERTIFICATE-/p' > root-ca.pem
```

Create the OCSP Request

```bash
openssl ocsp -issuer $CA_CERTIFICATE -cert $CERTIFICATE -reqout - > ocsp-request-post.der
```

Check the status of the certificate
```bash
curl --location --request POST "https://$DOMAIN/api/ocsp/" --header 'Content-Type: application/ocsp-request' --data-binary '@ocsp-request-post.der' > ocsp-response-post.der
openssl ocsp -respin ocsp-response-post.der -VAfile $CA_CERTIFICATE -resp_text
```

## CRL

A Certificate Revocation List (CRL) is a critical component of a Public Key Infrastructure (PKI) system, used to maintain the security and integrity of digital certificates. It is a regularly updated list of digital certificates that have been revoked or are no longer considered valid before their expiration date. CRLs play a crucial role in ensuring that only trusted and valid certificates are used for secure communication and data exchange.

CRLs are periodic and static lists of revoked certificates, whereas OCSP provides on-demand, real-time certificate status checks. OCSP is generally more scalable, offers faster response times, and is better suited for high-security, time-sensitive scenarios. However, CRLs are still used in situations where OCSP infrastructure may not be available, and they can serve as a fallback mechanism. The choice between CRL and OCSP depends on the specific needs of a PKI and the use case.





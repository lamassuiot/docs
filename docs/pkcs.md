# PKCS 11

Lamassu has a Go implementation of the PKCS 11 standard. It has been tested with SoftHSM.SoftHSM is an implementation of a cryptographic store accessible through a PKCS #11 interface.

This is an implementation of the standard Golang crypto interfaces that
uses [PKCS#11](http://docs.oasis-open.org/pkcs11/pkcs11-base/v2.40/errata01/os/pkcs11-base-v2.40-errata01-os-complete.html) as a backend. The supported features are:

* Generation and retrieval of RSA, DSA and ECDSA keys.
* Importing and retrieval of x509 certificates
* PKCS#1 v1.5 signing.
* PKCS#1 PSS signing.
* PKCS#1 v1.5 decryption
* PKCS#1 OAEP decryption
* ECDSA signing.
* DSA signing.
* Random number generation.
* AES and DES3 encryption and decryption.
* HMAC support.

Signing is done through the
[crypto.Signer](https://golang.org/pkg/crypto/#Signer) interface and
decryption through
[crypto.Decrypter](https://golang.org/pkg/crypto/#Decrypter).

To verify signatures or encrypt messages, retrieve the public key and do it in software.

See [the documentation](https://godoc.org/github.com/ThalesIgnite/crypto11) for details of various limitations,
especially regarding symmetric crypto.

## SoftHSM

 *  Make it use a custom configuration file `export SOFTHSM_CONF=$PWD/softhsm.conf`

 *  Then use `softhsm` to init it

    ~~~
    softhsm --init-token --slot 0 --label test --pin 1234
    ~~~

 *  Then use `libsofthsm2.so` as the pkcs11 module:

    ~~~ go
    p := pkcs11.New("/usr/lib/softhsm/libsofthsm2.so")
    ~~~

### Testing

To set up a slot:
~~~
    $ cat softhsm2.conf
    directories.tokendir = /home/rjk/go/src/github.com/ThalesIgnite/crypto11/tokens
    objectstore.backend = file
    log.level = INFO
    $ mkdir tokens
    $ export SOFTHSM2_CONF=`pwd`/softhsm2.conf
    $ softhsm2-util --init-token --slot 0 --label test
    === SO PIN (4-255 characters) ===
    Please enter SO PIN: ********
    Please reenter SO PIN: ********
    === User PIN (4-255 characters) ===
    Please enter user PIN: ********
    Please reenter user PIN: ********
    The token has been initialized.
~~~

The configuration looks like this:
~~~
    $ cat config
    {
      "Path" : "/usr/lib/softhsm/libsofthsm2.so",
      "TokenLabel": "test",
      "Pin" : "password"
    }
~~~

## Installation

Since v1.0.0, crypto11 requires Go v1.11+. Install the library by running:

```bash
go get github.com/ThalesIgnite/crypto11
```

The crypto11 library needs to be configured with information about your PKCS#11 installation. This is either done programmatically
(see the `Config` struct in [the documentation](https://godoc.org/github.com/ThalesIgnite/crypto11)) or via a configuration
file. The configuration file is a JSON representation of the `Config` struct.

A minimal configuration file looks like this:

```json
{
  "Path" : "/usr/lib/softhsm/libsofthsm2.so",
  "TokenLabel": "token1",
  "Pin" : "password"
}
```

- `Path` points to the library from your PKCS#11 vendor.
- `TokenLabel` is the `CKA_LABEL` of the token you wish to use.
- `Pin` is the password for the `CKU_USER` user.

## PoC setup

### Regenerate PreSharedKey test.psk
```
psk=$(openssl rand -base64 18 | xxd -p)
echo "test:$psk" > test.psk
```
### HSM Server Build
```
docker build -f softhsm-v2.Dockerfile -t softhsmv2 . 
```
### PKC11 Client Build
```
docker build -f pkcs11-client.Dockerfile -t pkcs11-client .
```
### HSM Server Run
```
docker run -it -p 5657:5657 --name hsm softhsmv2
```
### PKC11 Client Run
```
docker run -it --link=hsm:hsm pkcs11-client bash
```
```
./pkcs11-go-client -module=/usr/local/lib/libpkcs11-proxy.so -pin=1234
./crypto11-go-client -module /usr/local/lib/libpkcs11-proxy.so -token-label=lamassuHSM -pin=1234
pkcs11-tool --module=/usr/local/lib/libpkcs11-proxy.so -L
```
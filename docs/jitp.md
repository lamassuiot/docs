# JITP (Just In Time Provisioning)


## Overview

You can have your devices provisioned when they first attempt to connect to AWS IoT with ***just-in-time provisioning (JITP)***. To provision the device, you must enable automatic registration and associate a provisioning template with the CA certificate used to sign the device certificate.

When a device attempts to connect to AWS IoT by using a certificate signed by a registered CA certificate, AWS IoT loads the template from the CA certificate and uses it to register the thing. The JITP workflow first registers a certificate with a status value of PENDING_ACTIVATION. When the device provisioning flow is complete, the status of the certificate is changed to ACTIVE.

## Prerequisites

To perform the tests, we need the following prerequisites:

- Install jq and mosquitto-clients
```bash
apt install jq
apt install mosquitto-clients
```
- Configure AWS CLI: `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY` and `REGION` must be configured. [Configure AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html)

## Flow

1. Create a certificate authority and upload it to AWS.
2. Attach a JITP template to the CA in AWS IoT Core. 
3. Enable auto-registration for that CA in AWS.
4. Issue a certificate with that CA.
5. Load the certificate in the device
6. Connect to the IoT Core Enpoint using that certificate.



The device will automatically register in AWS IoT Core with the corresponding certificate and the certificate would be attached to the policy stated in the JITP template. Now the device can interact with AWS.

> :warning: ***NOTE**** : Device fails to connect to AWS on first attempt. 


## Usage

Steps to reproduce:

 1. Create a CA certificate in AWS.
 ```bash
 bash jitp_demo.sh
 ```
 Fill the following inputs and check that your CA has been correctly created in AWS IoT Core.

 ```bash
    Introduce CA name: 
    Introduce demo device name:
    Introduce AWS Policy Name (Must be unique in AWS):
 ```

 This script covers steps 1 to 4 in JITP flow.

 2. As a result of `jitp_demo.sh` script some test certificates have been created under `test/certs` folder. You can execute `test/go/main.go` or `test/bash/mosquitto.sh` to test connection to AWS IoT Core.
> :warning: **If you are using mosquitto.sh**: you need to change -i flag to be equal to the certificate common name and -t flag (topic) must be "**common_name**/*" for the device to connect to AWS. For example, if CN=demodev:
```bash
mosquitto_pub --cafile ../certs/awsRootCA.pem  \
            --cert ../certs/deviceCertAndCACert.crt \
            --key ../certs/deviceCert.key \
            -h a3hczhtwc7h4es-ats.iot.eu-west-1.amazonaws.com \
            -p 8883 -q 1 \
            -t demodev -i demodev -m "hello" -d 
```
> :warning: **If you are using go main.go**: you need to change device Id and topic. Lines 103 and 118.
```go
opts.SetClientID("demodev").SetTLSConfig(tlsconfig)
...
c.Publish("demodev/hello", 0, false, text)
```
## Detailed JITPD

### Step 1: Create CA in AWS Iot Core
---
AWS IoT Core requires to upload a verification certificate to be uploaded to register a CA certificate. A verification certificate is a certificate signed by that CA, this way we proof the CA we are uploading is ours.

First we have to create a test CA certificate using openssl. For that we create a test OpenSSL config file: 
```bash
mkdir openssl
touch openssl/deviceRootCA_openssl.conf
```
deviceRootCA_openssl.conf:
```bash
tee openssl/deviceRootCA_openssl.conf <<EOF
[ req ]
distinguished_name       = req_distinguished_name
extensions               = v3_ca
req_extensions           = v3_ca

[ v3_ca ]
basicConstraints         = CA:TRUE

[ req_distinguished_name ]
countryName              = Country Name (2 letter code)
countryName_default      = IN
countryName_min          = 2
countryName_max          = 2
organizationName         = Organization Name (eg, company)
organizationName_default = AMZ
EOF
```

Now create a folder to store the certificates that will be issued:
```bash
mkdir -p test/certs
```
Generate device CA private key:
```bash
openssl genrsa -out test/certs/deviceRootCA.key 2048 
````
Create CSR for device root:

```bash
openssl req -new -sha256 -key test/certs/deviceRootCA.key -nodes -out test/certs/deviceRootCA.csr -config openssl/deviceRootCA_openssl.conf -subj "/C=ES/O=testCAName" 
```
Creating CA certificate:
```bash
openssl x509 -req -days 3650 -extfile openssl/deviceRootCA_openssl.conf -extensions v3_ca -in test/certs/deviceRootCA.csr -signkey test/certs/deviceRootCA.key -out test/certs/deviceRootCA.pem 
```

Getting CA registration code from your AWS region:
```bash
export region=<your AWS region>
export reg_code=$(aws iot get-registration-code --region $region | jq -r .registrationCode) 
```
Generation private key for CA verification certificate:
```bash
openssl genrsa -out test/certs/verificationCert.key 2048 
```
Generating CSR for CA verification certificate:
```bash
openssl req -new -key test/certs/verificationCert.key -out test/certs/verificationCert.csr -subj "/C=ES/ST=Gipuzkoa/L=Arrasate/O=testCAName/OU=Lamassu/CN=$reg_code"
```
Generating CA verification certificate:
```bash
openssl x509 -req -in test/certs/verificationCert.csr -CA test/certs/deviceRootCA.pem -CAkey test/certs/deviceRootCA.key -CAcreateserial -out test/certs/verificationCert.crt -days 500 -sha256 
```
Once the CA certificate is created and the verification certificate is signed we can upload the CA to AWS IoT Core:
```bash
export certificate_id=$(aws iot register-ca-certificate --ca-certificate file://test/certs/deviceRootCA.pem  --verification-cert file://test/certs/verificationCert.crt --set-as- | jq -r .certificateId) 
```
### Step 2: Create JITP Role
---
To create service Role for JITP follow the following link: [JITP Role](https://aws.amazon.com/es/blogs/iot/setting-up-just-in-time-provisioning-with-aws-iot-core/)
### Step 3: Attach a JITP template to CA on IoT Core
---
Attach the registration configuration file to the CA uploaded in the previous step.
First create a policy:
```bash
mkdir templates
touch templates/policy.json
```
Export AWS account number
```bash
export aws_account=<your account number>
```
templates/policy.json
```bash
tee templates/policy.json <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "iot:Connect"
      ],
      "Resource": [
        "arn:aws:iot:eu-west-1:$aws_account:client/${iot:Connection.Thing.ThingName}"
      ]
    },
    {
      "Effect": "Allow",
      "Action": [
        "iot:Publish",
        "iot:Receive"
      ],
      "Resource": [
        "arn:aws:iot:eu-west-1:$aws_account:topic/${iot:Connection.Thing.ThingName}/*"
      ]
    },
    {
      "Effect": "Allow",
      "Action": [
        "iot:Subscribe"
      ],
      "Resource": [
        "arn:aws:iot:eu-west-1:$aws_account:topicfilter/${iot:Connection.Thing.ThingName}/*"
      ]
    }
  ]
}
EOF
```

Register policy in AWS:
```bash
aws iot create-policy --policy-name lamassu-test-policy --policy-document file://templates/policy.json
```

Create the JITP template:
templates/jitp_template.json
```bash
tee templates/jitp_template.json <<EOF
{
"templateBody" : "{ \"Parameters\" : { \"AWS::IoT::Certificate::CommonName\": { \"Type\": \"String\" }, \"AWS::IoT::Certificate::SerialNumber\": {  \"Type\": \"String\" }, \"AWS::IoT::Certificate::Id\": { \"Type\": \"String\" } }, \"Resources\": { \"thing\": { \"Type\": \"AWS::IoT::Thing\", \"Properties\": { \"ThingName\": {\"Ref\": \"AWS::IoT::Certificate::CommonName\"  }, \"AttributePayload\": {} }}, \"certificate\": { \"Type\": \"AWS::IoT::Certificate\", \"Properties\": { \"CertificateId\": {\"Ref\": \"AWS::IoT::Certificate::Id\" }, \"Status\": \"ACTIVE\" }}, \"policy\": { \"Type\": \"AWS::IoT::Policy\", \"Properties\": { \"PolicyName\": \"lamassu-test-policy\" } }}}",
"roleArn":"arn:aws:iam::$aws_account:role/JITPRole"
}
EOF
```
> ***NOTE***: If policy name is changed it must be also changed in JITP template templateBody field.

Update the CA certificate created in Step 1.

```bash
aws iot update-ca-certificate --certificate-id $certificate_id --new-auto-registration-status ENABLE --registration-config file://templates/jitp_template.json
```
### Step 4: Issue a device certificate with that CA.
---

Generate device private key:
```bash
openssl genrsa -out test/certs/deviceCert.key 2048 
```

Generating CSR for device:
```bash
openssl req -new -key test/certs/deviceCert.key -out test/certs/deviceCert.csr -subj "/C=ES/ST=Gipuzkoa/L=Arrasate/O=testCAName/OU=Lamassu/CN=testdeviceLamassu"
```

Generating device certificate:
```bash
openssl x509 -req -in test/certs/deviceCert.csr -CA test/certs/deviceRootCA.pem -CAkey test/certs/deviceRootCA.key -CAcreateserial -out test/certs/deviceCert.crt -days 365 -sha256 
```

Create certificate chain for the device:
```bash
cat test/certs/deviceCert.crt test/certs/deviceRootCA.pem > test/certs/deviceCertAndCACert.crt
```

Downloading AWS Root CA certificate, it is needed to check IoT Core endpoint certificate:
```
wget https://www.amazontrust.com/repository/AmazonRootCA1.pem -O test/certs/awsRootCA.pem
```

### Step 5: Load the certificate in the device
---
If a test device is used, you need to the following files into it:
* test/certs/awsRootCA.
* test/certs/deviceCertAndCACert.crt
* test/certs/deviceCert.crt
* test/certs/deviceCert.key
## Step 6: Connect to the IoT Core Enpoint using that certificate.
---
First, get the IoT Core Endpoint:
```bash
export iot_endpoint=$(aws iot describe-endpoint --endpoint-type iot:Data-ATS | jq -r .endpointAddress)
```
Test connection to IoT Core:
 ```bash
mosquitto_pub --cafile test/certs/awsRootCA.pem  \
              --cert test/certs/deviceCertAndCACert.crt \
              --key test/certs/deviceCert.key \
              -h $iot_endpoint \
              -p 8883 -q 1 \
              -t testdeviceLamassu -i testdeviceLamassu -m "hello JITP" -d 
 ```
 > ***NOTE***: Topic should start with device common name \<common name>/* and device ID (-i flag) should be equal to certificate common name.

## References

* ***AWS JITP example***: [JITP demo example](https://aws.amazon.com/es/blogs/iot/setting-up-just-in-time-provisioning-with-aws-iot-core/)
* ***JITP official documentation***: [JITP documentation](https://docs.aws.amazon.com/iot/latest/developerguide/jit-provisioning.html)

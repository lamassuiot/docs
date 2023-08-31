# Crypto Engines

| Engine                  | Security Level | Supported Algorithms |
| ----------------------- | -------------- | -------------------- |
| **Golang**              | SL1            | `RSA`, `ECDSA`       |
| **Hashicorp Vault**     | SL2            | `RSA`, `ECDSA`       |
| **AWS Secrets Manager** | SL2            | `RSA`, `ECDSA`       |
| **AWS KMS**             | SL3            | `RSA`, `ECDSA`       |
| **PKCS11 - HSM**        | SL3            | HSM-specific option  |

## Configure a new engine

### AWS KMS

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "kms:GetPublicKey",
                "kms:ListKeyPolicies",
                "kms:UntagResource",
                "kms:ListRetirableGrants",
                "kms:GetKeyPolicy",
                "kms:ListResourceTags",
                "kms:ListGrants",
                "kms:GetParametersForImport",
                "kms:DescribeCustomKeyStores",
                "kms:ListKeys",
                "kms:TagResource",
                "kms:GetKeyRotationStatus",
                "kms:ListAliases",
                "kms:CreateAlias",
                "kms:DescribeKey",
                "kms:CreateKey",
                "kms:Sign"
            ],
            "Resource": "*"
        }
    ]
}
```
### AWS Secrets Manager

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "VisualEditor0",
            "Effect": "Allow",
            "Action": [
                "secretsmanager:GetSecretValue",
                "secretsmanager:CreateSecret",
                "secretsmanager:ListSecrets"
            ],
            "Resource": "*"
        }
    ]
}
```

### PKCS11 - HSM


## Develop your own engine
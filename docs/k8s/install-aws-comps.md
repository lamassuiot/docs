# AWS Services

## Databases

### DynamoDB

## Crypto Engines

### AWS KMS

Lamassu can use AWS KMS apis to perform all cryptographic operations.

Start by creating the following IAM Policy

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

Assign the policy to an IAM user and obtain the correspondent `accessKeyID` and `secretAccessKey`. Now its time to configure the helm chart to use those credentials:

!!! info "Config takes"
    Don't use the same name for any crypto engine as it will be hard to differentiate later.

    ```yaml
    services:
      ca:
        crypto_engines:
          aws_kms:
            - name: "My AWS KMS Engine"
              metadata: # <--- add your key-value metadata to be displayed later.
                accountID: 123456789 # i.e. AWS Account ID
              access_key_id: <accessKeyID> # <--- replace with accessKeyID
              secret_access_key: <secretAccessKey> # <--- replace with secretAccessKey
              region: <region> # <--- replace with aws region i.e. eu-west-1
              default: false
    ```

### AWS Secrets Manager

Create the following IAM Policy

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
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

Assign the policy to an IAM user and obtain the correspondent `accessKeyID` and `secretAccessKey`. Now its time to configure the helm chart to use those credentials:

!!! info "Config takes"
    Don't use the same name for any crypto engine as it will be hard to differentiate later.

    ```yaml
    services:
      ca:
        crypto_engines:
          aws_secrets_manager:
            - name: "My AWS Secrets Manager Engine"
              metadata: # <--- add your key-value metadata to be displayed later.
                accountID: 123456789 # i.e. AWS Account ID
              access_key_id: <accessKeyID> # <--- replace with accessKeyID
              secret_access_key: <secretAccessKey> # <--- replace with secretAccessKey
              region: <region> # <--- replace with aws region i.e. eu-west-1
              default: false
    ```

## Authentication

### AWS Cognito

Follow the instructions to configure [AWS Cognito with Lamassu](service-configs/aws-cognito/aws-cognito.md)

# Cloud Events

The **CA**, **DMS Manager** and **Device Manager** services publish in Rabbitmq cloud events of the significant operations they perform. These events are consumed by other Lamassu services such as **Alerts** or **Cloud Proxy**.

## CA

| **Event Type**              | **Description**                                                                                                                                                                                                                              | 
|-----------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| ca.create                   | Event sent when the CA is created. The cloud proxy receives the event to create the CA in the cloud.                                                                                                                                         |
| ca.import                   | Event sent when importing a CA                                                                                                                                                                                                               |
| ca.update.status            | Event sent when the CA is updated. The cloud proxy receives the event to update the status of the CA in the cloud. Valid status: **ACTIVE**, **EXPIRED**, **REVOKED**, **NEARING_EXPIRATION** and **CRITICAL_EXPIRATION**                    |
| ca.update.metadata          | Event to update the metadata of a CA                                                                                                                                                                                                         |
| ca.delete                   | Event sent when deleting a CA                                                                                                                                                                                                                |
| ca.sign-certificate         | Event sent when a certificate is signed                                                                                                                                                                                                      |
| certificate.update.status   | Event sent when the status of a certificate is updated. The cloud proxy receives the event and updates the corresponding certificate. Valid status: **ACTIVE**, **EXPIRED**, **REVOKED**, **NEARING_EXPIRATION** and **CRITICAL_EXPIRATION** |
| certificate.update.metadata | Event to update the metadata of a certificate.                                                                                                                                                                                               |

Data structure published by **ca.create**, **ca.import**, **ca.update.status** and **ca.update.metadata** events

- `serial_number`: `(string: "")` - The Serial Number of the created CA certificate
- `issuer_metadata`:
    - `serial_number`: `(string: "")` - The issuer CA certificate serial number
    - `ca_id`: `(string: "")` - The issuer CA ID
- `status`: `(string: "")` - Status of the created CA certificate, the options are `ACTIVE`, `EXPIRED`, `REVOKED`, `NEARING_EXPIRATION` and `CRITICAL_EXPIRATION`.
- `certificate` `(string: "")` - CA certificate in PEM format and base64-encoded
- `key_metadata`:
    - `type`: `(string: "")` - Type of the private key, `RSA` or `ECDSA`.
    - `bits`: `(int: "")` - Private key size
    - `strength`: `(string: "")` - Private key strength `LOW`, `MEDIUM` or `HIGH`.
- `subject`: - The Subject of the CA certificate
    - `common_name`: `(string: "")`
    - `organization`: `(string: "")`
    - `organization_unit`: `(string: "")`
    - `country`: `(string: "")`
    - `state`: `(string: "")`
    - `locality`: `(string: "")`
- `valid_from`: `(string: "")` - Date of issuance of the CA in ISO 8601 format
- `valid_to`: `(string: "")` - CA expiry date in ISO 8601 format
- `revocation_timestamp`: `(string: "")` - CA revocation date in ISO 8601 format
- `engine_id`: `(string: "")` - ID of the cryptographic engine through which the CA has been issued
- `id`: `(string: "")` - ID of the created CA
- `metadata`:
    - `lamassu.io/name`: `(string: "")` - CA name in Lamassu
- `issuance_expiration`: - Information on how long CA can issue certificates
    - `type`: `(string: "")` - There are two types to indicate when the certificate issue date will be, `Time` and `Duration`.
    - `time`: `(string: "")` - If the `type` is `Time`, date up to which the CA can issue certificates in ISO 8601 format. If the `type` is `Duration`, duration up to which the CA can issue certificates expressed in milliseconds from 1 June 1970 UTC.
- `type`: `(string: "")` - CA Type, `MANAGED` (The private key is generated in the Lamassu cryptographic engine), `EXTERNAL` (The CA is created outside Lamassu and only the certificate is imported) or `IMPORTED` (The CA is created outside Lamassu, but, the certificate and the private key are imported).  ``
- `creation_ts`: `(string: "")` - CA creation date in ISO 8601 format

```

{
    "serial_number": "b0-32-b8-77-bd-03-17-5a-61-26-fe-40-a7-2e-12-c0-0b-47-a9-6c",
    "issuer_metadata": {
        "serial_number": "b0-32-b8-77-bd-03-17-5a-61-26-fe-40-a7-2e-12-c0-0b-47-a9-6c",
        "ca_id": "9443a6b7-a3ac-41fd-8bee-5ce6bcb55e08"
    },
    "status": "ACTIVE",
    "certificate": "LS0tLS1CRUdJTiBDRVJUSUZJQ0FURS0tLS0tCk1JSUY0RENDQThpZ0F3SUJBZ0lWQUxBeXVIZTlBeGRhWVNiK1FLY3VFc0FMUjZsc01BMEdDU3FHU0liM0RRRUIKQ3dVQU1Ha3hDekFKQmdOVkJBWVRBa1ZUTVJFd0R3WURWUVFJRXdoSGFYQjFlbXR2WVRFUk1BOEdBMVVFQnhNSQpRWEp5WVhOaGRHVXhFREFPQmdOVkJBb1RCMGxyWlhKc1lXNHhEREFLQmdOVkJBc1RBMXBRUkRFVU1CSUdBMVVFCkF4TUxRbTl2ZEhOMGNtRndRMEV3SGhjTk1qTXdPVEl3TURnek56RTNXaGNOTWpVd01qRXhNVE0xTkRNd1dqQnAKTVFzd0NRWURWUVFHRXdKRlV6RVJNQThHQTFVRUNCTUlSMmx3ZFhwcmIyRXhFVEFQQmdOVkJBY1RDRUZ5Y21GegpZWFJsTVJBd0RnWURWUVFLRXdkSmEyVnliR0Z1TVF3d0NnWURWUVFMRXdOYVVFUXhGREFTQmdOVkJBTVRDMEp2CmIzUnpkSEpoY0VOQk1JSUNJakFOQmdrcWhraUc5dzBCQVFFRkFBT0NBZzhBTUlJQ0NnS0NBZ0VBMUp5SjMrdGMKMytIN0FQNWZTS0dDQWVvNFVlNU0zUEZyNGFENSs0N0VyeXdpdXhtS3hoTEtNdXZmalQvWitKbnJvLytNUHVHLwpqK0hBbEQ3bU03cEU0OHVrb2MwS3Y0cWx3SW5TNnQxYkRIQUhVRWNNVXNmRkV3dmJTRmZ3UzdIWmhwOTdVcW5BCkd6enBRNHRYOW1wTGlvWlZ3bVVsZ3EyNjRsdVdYTmtEZExIMHNIS1pkTGEzb1hvU3ZFbmVDdXlTWjIzdHhuakcKd09kZTFCa2o0MDdMbUtCTE4zVm5iZzY1N2FUOC8vd3h3M0NNazZKTUQyR3ZQTHJ5eEZ4Zm5UUnVTSksvWWl6aQpQMGpuK0lGVWtqK1FHNmlKeXkzWVBRRll0NGp1Y1hUcWQ3VEh6a1hLUlBKOXRhVi9DRXB5SzVLdDZtRnBJVDFXCjlxOUhXZ0JTS3JvZEZHWXVJVDlTWHg3QXRialNScmVqbjNxN3Jrc0UxRFZ5cDFIanFYNDNwU2JGd3RBUkpHb2IKR3ZONkZoVSs2Wk9pazJVeC9wb0tlOXhMb0ZzYUNybUxGWjVRYWlTay8yY3R1dk5KRDRja0hYVFh4S3NLQlBrRQppZEh0OUhJS0JoOGJTdWg5aDRrRm5IRVJPbDcrL0ZvV2RPSjBTWFVxbkk1RHgxU2c4Z0ZYRnNndCtYVGRQaXBRCkVhSXo2L2lpVW1iNm9Ib0NENnQ1MER6Vzg3RGx3aG5jOUl5eURBQ3psVEdmb1UwTXp0OUUzYVRBUlRzKzZUTTEKOW9PRVdlMFkwa2J0ZnBHYUlMMG1IdkhPR0hVTHlqSHpjRUc3dW9TZ00vNWoveG1IR2VMcDBvMndEUnpuaTFEaApTQ3BHTW81cC9BcHB1K0hTK1FxMzh6N0Y2M3Y3UENHanpNa0NBd0VBQWFOL01IMHdEZ1lEVlIwUEFRSC9CQVFECkFnR1dNQjBHQTFVZEpRUVdNQlFHQ0NzR0FRVUZCd01DQmdnckJnRUZCUWNEQVRBUEJnTlZIUk1CQWY4RUJUQUQKQVFIL01CMEdBMVVkRGdRV0JCUUtXbUhkeExoZGd4OXJVYStuSG5OSmNhRTdQREFjQmdnckJnRUZCUWNCQVFRUQpNQTR3REFZSUt3WUJCUVVITUFHR0FEQU5CZ2txaGtpRzl3MEJBUXNGQUFPQ0FnRUFhNmFWTlVNakJ4ZXJ0QjFkCmZwQmhDSXl3Y1I1SjU4dzUraklrckZTZzEzQW8yOTlQanJYQzBMTWxva3R1TFIxRVFKaXl5ZGhtUHl5ejRYZG8KNzdZZXkwdW9XOTBtaVNkSVFLdHJ4TGZKZE1jUmR4VmRjdk01VCtSM0Yra3JLYWpFMmNVOGRmTGo2QytXRW8vTwpiNW1CNVR2dFVGdm51WVdvOWFPUjI0andNbmJicDBlcC9CV1JFMndRQ1AxSWlvZzZUSXBueWJXVHRpOE9DNHVVCm1Qd1NtZmtma2p5ckh3L2tSZ2lOQUt5Nlp3ODZWUHhTQ2xPNUtSRUg4Rkx6UmF5ZmtUTDlIem5INzg0NmV1T2gKcEI0UDJYeWxZT2pWaW0rRGc3SU9scE9EWE5GcHVjTTh6TjFPNmhlN240YU5ZaHpYVG5BbnBVTGN6VGxOcjUzWQpwSnJHTzc0akxrUXBTVmF0ZEtKajNqbFRHMyt2blAyelVpN3JxVmtCaFJWVEMwNHQ1SU5aTTR0MlJ4a2hGREpPCkZqdC9LL0RaYkM2ZTROeUtaNndaUHJZYTdxUFdvb3hsV0dQMURDMUVtZ2FwbjRsT0N2bk9kbmpiNXdoZjVncVIKSHUxbWRDOElqWE1QYzkzSU80cy83enBkaUpZNEw1VkhYcmdTMTZ5SThaY2JtVy9HWE9TenN2MjFyMnJ4NnRKRwoyMUptQzR4Y2dIMUozUEdrSXZEQ1hYTzN1NE1ZRE9hRWlVd3dtOVZtMzdMd0toVUxDWkNOaDJ6bmhBYkREbHJnCi9SVkp4VEZXcG1NencxRjNWMFBRVVl5eGk4K3lVMnJBNlhjNEM2aVByTlozY3hCSFVLay8vTngrK2lLZWw2NkkKRld1TE03bEpLcGpaTWhTUk5qbFFmbytSSlFBPQotLS0tLUVORCBDRVJUSUZJQ0FURS0tLS0tCg==",
    "key_metadata": {
        "type": "RSA",
        "bits": 4096,
        "strength": "HIGH"
    },
    "subject": {
        "common_name": "BootstrapCA",
        "organization": "Ikerlan",
        "organization_unit": "ZPD",
        "country": "ES",
        "state": "Gipuzkoa",
        "locality": "Arrasate"
    },
    "valid_from": "2023-09-20T08:37:17Z",
    "valid_to": "2025-02-11T13:54:30Z",
    "revocation_timestamp": "0001-01-01T00:00:00Z",
    "engine_id": "02b17f9e-44a3-4f8b-8752-e6844d67885e",
    "id": "9443a6b7-a3ac-41fd-8bee-5ce6bcb55e08",
    "metadata": {
        "lamassu.io/name": "BootstrapCA"
    },
    "issuance_expiration": {
        "type": "Time",
        "time": "2024-02-11T13:54:30Z"
    },
    "type": "MANAGED",
    "creation_ts": "2023-09-20T08:37:17.693412Z"
}

```

Data structure published by **ca.sign-certificate**, **certificate.update.status** and **certificate.update.metadata** events

- `serial_number`: `(string: "")` - The Serial Number of the certificate
- `issuer_metadata`:
    - `serial_number`: `(string: "")` - The issuer CA certificate serial number
    - `ca_id`: `(string: "")` - The issuer CA ID
- `status`: `(string: "")` - Status of the certificate, the options are `ACTIVE`, `EXPIRED`, `REVOKED`, `NEARING_EXPIRATION` and `CRITICAL_EXPIRATION`.
- `certificate` `(string: "")` - Certificate in PEM format and base64-encoded
- `key_metadata`:
    - `type`: `(string: "")` - Type of the private key, `RSA` or `ECDSA`.
    - `bits`: `(int: "")` - Private key size
    - `strength`: `(string: "")` - Private key strength `LOW`, `MEDIUM` or `HIGH`.
- `subject`: - The Subject of the certificate
    - `common_name`: `(string: "")`
    - `organization`: `(string: "")`
    - `organization_unit`: `(string: "")`
    - `country`: `(string: "")`
    - `state`: `(string: "")`
    - `locality`: `(string: "")`
- `valid_from`: `(string: "")` - Date of certificate issue in ISO 8601 format
- `valid_to`: `(string: "")` - Certificate expiry date in ISO 8601 format
- `revocation_timestamp`: `(string: "")` - Certificate revocation date in ISO 8601 format

```
{
    "serial_number": "94-bb-49-38-ab-2a-dc-7e-e7-39-97-b5-d3-9f-1d-bb-3f-47-98-59",
    "metadata": {},
    "issuer_metadata": {
        "serial_number": "b0-32-b8-77-bd-03-17-5a-61-26-fe-40-a7-2e-12-c0-0b-47-a9-6c",
        "ca_id": "9443a6b7-a3ac-41fd-8bee-5ce6bcb55e08"
    },
    "status": "ACTIVE",
    "certificate": "LS0tLS1CRUdJTiBDRVJUSUZJQ0FURS0tLS0tCk1JSUVZVENDQWttZ0F3SUJBZ0lWQUpTN1NUaXJLdHgrNXptWHRkT2ZIYnMvUjVoWk1BMEdDU3FHU0liM0RRRUIKQ3dVQU1Ha3hDekFKQmdOVkJBWVRBa1ZUTVJFd0R3WURWUVFJRXdoSGFYQjFlbXR2WVRFUk1BOEdBMVVFQnhNSQpRWEp5WVhOaGRHVXhFREFPQmdOVkJBb1RCMGxyWlhKc1lXNHhEREFLQmdOVkJBc1RBMXBRUkRFVU1CSUdBMVVFCkF4TUxRbTl2ZEhOMGNtRndRMEV3SGhjTk1qTXdPVEl3TURreU5UQTFXaGNOTWpRd01qRXhNVE0xTkRNd1dqQWgKTVFzd0NRWURWUVFHRXdKRlV6RVNNQkFHQTFVRUF4TUpRbTl2ZEhOMGNtRndNSUlCSWpBTkJna3Foa2lHOXcwQgpBUUVGQUFPQ0FROEFNSUlCQ2dLQ0FRRUF6T3dLNFlxSlBNMDZhUWJjYjVaaHlFNnFIOVd0ZWIyL2VHZjdRTlNVClFHUmRZQlVacm9KY0xJRGxyRlA3a05qeUY5aGpaUjZNTWt3ZWlxQytGSXU2RUl2VXA3NHBvTjYrS2sxc3pnM3UKbkRMTEVUQ2diVXh6WGN2ZlFKR3JERFM1UUozcWhCckVzYk5oRkJrQ09PNWZOc0dvdms0Z1VEK0QzNkhyS2d1VApDQXRZRm9oY0ZLZHVCODFSWjkyWFlrbXM2Yko4NFllZVhXRnZyZFhYUnFjOUphL0k2OEhNWFcvRWFUNU5Gek94CkNDVmVKd3VCWUliU09tYng1RjhHaVpkanliMUZCK2JDdU93R3dVTlAzcHZLaHpZSFhiRUxyNGRnTm9XblBrU0wKbE16akxiU293ejZ2cWhOSThpeE0rTGl3dVM5dUt6d1RyZnBOT1ZEUlEzQWplUUlEQVFBQm8wZ3dSakFPQmdOVgpIUThCQWY4RUJBTUNCNEF3RXdZRFZSMGxCQXd3Q2dZSUt3WUJCUVVIQXdJd0h3WURWUjBqQkJnd0ZvQVVDbHBoCjNjUzRYWU1mYTFHdnB4NXpTWEdoT3p3d0RRWUpLb1pJaHZjTkFRRUxCUUFEZ2dJQkFGRkd5TDZIK3VjS0ErekkKbDFMU1doK3BwUjI5eGlxZEZnTFJoa1dzY2t4dERhaFlHd2J6UUhTOUo2TVNSNDFkODFVV2Z1KzluZ1ZBTzhPYgpzV21GVWZ4T2pPc3BkTjIraUlUbzlkYzBLU0ZPNEZjR2ROeUVNaENCRnVKZU5PdE1VMStna0hlZWlUalJiLzlYClB4MGJDRTFNaE14dnFLUW5tM3hmNDNhWUJtemNOZkZHZnhqTWduOVlUSTQ0bExBR3d2WFhhM3kzeGhOS2cyRksKNEtRS2hSd0xmaGVKOVZIMEYyc0FtaHJCZG5uWnY5SlNFQzcwOVRIODl2cHFsM1ZscTA3MEdWcjIreVl3U05MOQpFMG5OTDVxajE0MmtmRVFBazhCRENnYy9lSlpYL1l1QVJ0amtOMEF3clA5MWJSUWhacGtDMm9LL25jeTVMdGUwCm5hTUhiTDA5TG5kSTZzbEtaalprNnpmb0ZZTStzRERnS3hVcithWUVjNWJSUFZmSEtNZUFaSmFIalhOK3diVnEKbWttWnlEUUxSVWtnR2sxREZzdFhSQ1dSUTAwMG1GQmNnSnNkZVBmeU9lYUdqMU1IOUxPSzlXNTBQQzg3bXNNTgp1Umd3VzA2VEJWMXFjVFlvWFVkaDVidklwYkl1ZTJ5L013MmlraFExTDNNWUJlSmoyWk9aeHc3WTlxYTFIRlRiCnJUNEJNSEdkOG5ZR1dLOWFJZUZ0MXBqYW1DeWFIWmJTczhSSDJ5clI4RUF0K21mTldiMXRiV0hGM05EMjNPNm0KV21ydTFuK2JSUFA0RUxpVDlsLzFWRUhuYWZhQjFOdFQyRHJjWTBMK0UreTllNE5YTFhkN0ZGVEFVTXJ4czZrdAphaEU1VDRyU0tvYVJxQjM0Rk9LODdNdFJrT1pNCi0tLS0tRU5EIENFUlRJRklDQVRFLS0tLS0K",
    "key_metadata": {
        "type": "RSA",
        "bits": 2048,
        "strength": "MEDIUM"
    },
    "subject": {
        "common_name": "Bootstrap",
        "organization": "",
        "organization_unit": "",
        "country": "ES",
        "state": "",
        "locality": ""
    },
    "valid_from": "2023-09-20T09:25:05Z",
    "valid_to": "2024-02-11T13:54:30Z",
    "revocation_timestamp": "0001-01-01T00:00:00Z"
}

```

## DMS Manager

| **Event Type**                         | **Description**                                                                                                                                          |
|----------------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------|
| io.lamassuiot.dms.create               | Event sent when the DMS is created and received by the cloud proxy to publish to AWS IoT Core the certificates of the CAs associated to the DMS.         |
| io.lamassuiot.dms.update-status        | Event to report that the status of the DMS has been updated. Valid status: **PENDING_APPROVAL**, **REJECTED**, **APPROVED**, **EXPIRED** and **REVOKED** |
| io.lamassuiot.dms.update               | Event to inform that the DMS has been updated, the cloud proxy receives the event to update the certificates of the CAs.                                 |
| io.lamassuiot.dms.update-authorizedcas | Event to inform that authorized CAs of the DMS have been updated, the cloud proxy receives the event to update the certificates of the CAs               |

Data structure published by DMS Manager events

- `dms`:
    - `name`: ``(string: "")`` - Name of the DMS
    - `status`: ``(string: "")`` - DMS status, valid status are `PENDING_APPROVAL`, `REJECTED`, `APPROVED`, `EXPIRED` and `REVOKED`.
    - `cloud_dms`: `(bool: true)` - In case the variable has the value `true`, neither the data of the `remote_access_identity` structure nor the private key is needed.
    - `aws`:
        - `shadow_type` `(string: "")` - The type of Shadow to be used in AWS when registering the device, the options are `CLASSIC` and `NAMED`.
    - `creation_timestamp`: `(int: "")` - Date of creation of the DMS expressed in milliseconds since 1 June 1970 UTC
    - `identity_profile`: 
        - `general_setting`: 
            - `enrollment_mode`: `(string: "")` - The method to perform device enrolment, in this case only supports `EST`.
        - `enrollment_settings`:
            - `authentication_mode`: `(string: "")` - Authentication method in this case only supports `BOOTSTRAP_MTLS`.
            - `allow_new_auto_enrollment`: `(string: "")` - Flag by means of which the enrolment of a device that is already registered is allowed.
            - `tags`: `["iot"]`
            - `icon`: `(string: "")`
            - `color`: `(string: "")`
            - `authorized_ca`: `(string: "")` - The name of the CA authorised to issue the certificate
            - `bootstrap_cas`: ``["string"]` - The name of the CAs by which to verify that the device is authorised to request a certificate.
            - `chain_validation_level`: `(int: "")`
        - `reenrollment_settings`: `(string: "")`
            - `allow_expired_renewal`: `(string: "")` - Flag to allow reenrollment of devices with expired certificate
            - `preventive_renewal_interval`: `(string: "")`
            - `additional_validation_cas`: `(string: "")` - Additional validation CAs at the time of reenrolment
        - `ca_distribution_settings`: - Structure indicating which CAs are to be sent in the response of the CaCerts endpoint of the EST protocol.
            - `include_authorized_ca`: `(bool: true)`
            - `include_bootstrap_cas`: `(bool: true)`
            - `include_lamassu_downstream_ca`: `(bool: true)`
            - `managed_cas`: []
            - `static_cas`:`[]
    - `remote_access_identity`: 
        - `serial_number`: `default` - Serial number of the certificate
        - `key_metadata`:
            - `type`: `(string: "")` - Type of the private key, `RSA` or `ECDSA`.
            - `bits`: `(int: "")` - Private key size
            - `strength`: `(string: "")` - Private key strength `LOW`, `MEDIUM` or `HIGH`.
        - `subject`: - The Subject of the device certificate
            - `common_name`: `(string: "")`
            - `organization`: `(string: "")`
            - `organization_unit`: `(string: "")`
            - `country`: `(string: "")`
            - `state`: `(string: "")`
            - `locality`: `(string: "")`
        - `authorized_cas`: `(string: "")` - The name of the CA authorised to issue the certificate
        - `external_key_generation`: `(bool: false)`
        - `certificate`: `(string: "")` - DMS certificate in PEM format and base64-encoded
        - `certificate_request`: - DMS CSR in PEM format and base64-encoded
- `private_key` `(string: "")` - DMS Private Key in PEM format and base64 encoded.

```
{
    "name": "ProductionDMS",
    "status": "APPROVED",
    "cloud_dms": true,
    "aws": {
        "shadow_type": "NAMED"
    },
    "creation_timestamp": 1689858815000,
    "identity_profile": {
        "general_setting": {
            "enrollment_mode": "EST"
        },
        "enrollment_settings": {
            "authentication_mode": "BOOTSTRAP_MTLS",
            "allow_new_auto_enrollment": true,
            "tags": [
                "iot"
            ],
            "icon": "CgSmartphoneChip",
            "color": "#25eee2-#333333",
            "authorized_ca": "ProdCA",
            "bootstrap_cas": [
                "BootstrapCA"
            ],
            "chain_validation_level": -1
        },
        "reenrollment_settings": {
            "allow_expired_renewal": false,
            "preventive_renewal_interval": "0s",
            "additional_validation_cas": null
        },
        "ca_distribution_settings": {
            "include_authorized_ca": true,
            "include_bootstrap_cas": false,
            "include_lamassu_downstream_ca": true,
            "managed_cas": [],
            "static_cas": []
        },
        "aws_iotcore_publish": true
    }
}
```
## Device Manager

| **Event Type**                     | **Description**                                                                                                                           |
|------------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------|
| io.lamassuiot.device.create        | Event sent when Device is created                                                                                                         |
| io.lamassuiot.device.update        | Event sent when Device is updated                                                                                                         |
| io.lamassuiot.device.decommision   | Event sent when the Device is Uninstalled                                                                                                 |
| io.lamassuiot.device.rotate        | Event sent when the Device's active certificate is rotated.                                                                               |
| io.lamassuiot.device.revoke        | Event sent when Device's active certificate is revoked                                                                                    |
| io.lamassuiot.device.enroll        | Event sent when Device enrolment is performed                                                                                             |
| io.lamassuiot.device.reenroll      | Event sent when the Device is rewired. The event is received by the Cloud Proxy to update the device's digital twin.                      |
| io.lamassuiot.device.forceReenroll | Event sent when you want to force the Device to be rewired. The event is received by the Cloud Proxy to update the device's digital twin. |


Data structure published by **io.lamassuiot.device.create**, **io.lamassuiot.device.update** and **io.lamassuiot.device.decomission** events

- `id`: ``(string: "")`` - Device ID
- `alias`: ``(string: "")`` 
- `dms_name`: `(string: "")` - Name of the DMS by which the device has been registered
- `status`: `(string: "")` - Device status. Valid options are `PENDING_PROVISIONING`, `FULLY_PROVISIONED`, `REQUIRES_ACTION`, `PROVISIONED_WITH_WARNINGS` and `DECOMMISSIONED`.
- `slots`: - Array with the slots that the device has configured. The device can have N slots and for each slot it has one active certificate.
    - `id`: `default` - Slot ID, by default the device is created with the slot `default`.
    - `active_certificate`: - Certificate active slot
        - `ca_name`: `(string: "")` - Name of the CA that issued the certificate
        - `serial_number`: `(string: "")` - Serial number of the certificate
        - `certificate`: `(string: "")` - Certificate in Base64-encoded PEM format
        - `status`: `(string: "")` - Certificate status. Valid options are `ACTIVE`, `EXPIRED`, `REVOKED`, `NEARING_EXPIRATION` and `CRITICAL_EXPIRATION`.
        - `key_metadata`:
            - `type`: `(string: "")` - Type of the private key, `RSA` or `ECDSA`.
            - `bits`: `(int: "")` - Private key size
            - `strength`: `(string: "")` - Private key strength `LOW`, `MEDIUM` or `HIGH`.
        - `subject`: - The Subject of the device certificate
            - `common_name`: `(string: "")`
            - `organization`: `(string: "")`
            - `organization_unit`: `(string: "")`
            - `country`: `(string: "")`
            - `state`: `(string: "")`
            - `locality`: `(string: "")`
        - `valid_from`: `(int: "")` - Date of issue of the certificate expressed in milliseconds since 1 June 1970 UTC
        - `valid_to`: `(int: "")` - Date of validity of the certificate expressed in milliseconds since 1 June 1970 UTC
    - `archive_certificates`: [] - Array with all the certificates that the device has held
- `allow_new_enrollment`:`(bool: true)`, - Flag by means of which the enrolment of a device that is already registered is allowed.
- `description`: `(string: "")`, - Description of the device
- `tags`: `["iot"]`, 
- `icon_name`: `(string: "")`,
- `icon_color`: `(string: "")`,
- `creation_timestamp`: `(int: "")` - Date of creation of the device expressed in milliseconds since 1 June 1970 UTC

```
{
    "id": "13f4bc74-3314-4a0b-b65c-73a82e14cc5f",
    "alias": "13f4bc74-3314-4a0b-b65c-73a82e14cc5f",
    "dms_name": "EnrollDMS",
    "status": "FULLY_PROVISIONED",
    "slots": [
        {
            "id": "default",
            "active_certificate": {
                "ca_name": "TestAwsCA",
                "serial_number": "ed-34-90-2e-25-9b-f7-17-2d-ea-83-f3-06-46-50-f6-81-c9-92-6c",
                "certificate": "LS0tLS1CRUdJTiBDRVJUSUZJQ0FURS0tLS0tCk1JSUZVVENDQXptZ0F3SUJBZ0lWQU8wMGtDNGxtL2NYTGVxRDh3WkdVUGFCeVpKc01BMEdDU3FHU0liM0RRRUIKQ3dVQU1Fc3hDVEFIQmdOVkJBWVRBREVKTUFjR0ExVUVDQk1BTVFrd0J3WURWUVFIRXdBeENUQUhCZ05WQkFvVApBREVKTUFjR0ExVUVDeE1BTVJJd0VBWURWUVFERXdsVVpYTjBRWGR6UTBFd0hoY05Nak13TnpJd01UTXhNek0xCldoY05Nak14TURJNE1UTXhNek0wV2pBdk1TMHdLd1lEVlFRREV5UXhNMlkwWW1NM05DMHpNekUwTFRSaE1HSXQKWWpZMVl5MDNNMkU0TW1VeE5HTmpOV1l3Z2dJaU1BMEdDU3FHU0liM0RRRUJBUVVBQTRJQ0R3QXdnZ0lLQW9JQwpBUURJaEt2N0NvWEpFV3VyVEs3THgwN0p2MU1NRlk0OHpleTV2OTdRVkxmSXY1MXdzRFVPYmY1YVI0V1MrNjQzCmcxa09SeUdBM2tLQjAxNWhhVW5nL0U1aVNNR29EeDVpQ2lnV1FLRDg3WUROelFWNDVUa0cvMFo1clIxRVY0bFQKNGp3MkVYMkl5ZkQyM1B5VlZzOGJBSnUwNkxUK1FNUUpHYnkxM0dhRjR6eCtwb0JyNnJhTHdYQXErajMyaHhNcApKUEJnM05PWkdRQVVOVnQySmZ1eUFqeE9wWE05UGFHSjdlb2JmODg1VCs4YmZ5VE1LcE5acmRsZzF2WnBSUE40CjJjTWJ4ODk4S3VFenRYNVRDTkxmdXZXNDZjTS8zczF4K1gxOHJvdEJBMTRtbEVQVE9PZVh0TVNqOSs3M01jYlQKdEhYQUtqc3czZXFIclEzcmhadXB0VHQ5K2lTanpKdTgybDFYQ2R0OStubkFaMjhqZ0RsT0RxZU45R0ZNTk5LRAphaVd1WTdwdWtqcFdadXFYdXA2RGNnQ1h5cVppLzdOMEJVaEEzS3pGUUxJTk44dzVhNnE4anZaTEdXcUtKUnNLCkNtaUhwZ1VBd0twYlJhTkhUdnpxTHZ4cUVrRmhHRUJjMWFZZERHNVI1Yk5ac3VjL3UvT0tIbmcxcU1lU1R1bkwKbGlEcXZOK05GbVJiTjlRSzJweURaY25ZVERKMjhOWmhxcENJbG1lVXV1eWxLNGdyRExpTnRTRGMvbUZCU25CUQpRK2NGTjlDN2paVk5lM3NGenpQWVNtVHJJMU8zdHpyaEk1NTNSczhpT09TbHlXS0VDaG9LOFB0cXlpYk42Y1lRCmNMZGRXVXo1TlJUOHoraGgrbi84b0ZpRExOb24zUHQ4L1dTZko0bkc3YVN6QlFJREFRQUJvMGd3UmpBT0JnTlYKSFE4QkFmOEVCQU1DQjRBd0V3WURWUjBsQkF3d0NnWUlLd1lCQlFVSEF3SXdId1lEVlIwakJCZ3dGb0FVZEZLZgpWN1Arajg3K0pBREVJbmI0MmZnRlNnb3dEUVlKS29aSWh2Y05BUUVMQlFBRGdnSUJBRjZOMEV4QXUwZTBFeVdHCmpWVU1XRHRaVVpzaVNvQVNBMnZVQVEza0s3bGZieUowSklrRHJyMXVkakc3Y1pLMTBMd2xnVHU2YW54THlDeFYKMytycG9BMm1tcEUyTVhBZVdvK3gxNUdvZllTeTlyM3NKUEFPNkhMZE9CK0ZldTc0VjVHV2tQSXE5Z2xxd1NBWApXYmlZT3JsWFJsNkZrOXZZR0xZWkcvWGtwRDdWUVRVVzl5WGJrYjE3SU4vNU1yUm91SU9abU5Sa2FFZFhxaXJnClNaUVA5cnQxczFyTStVVDcxZzhQN2YzR05ibXE2RWFGelBRL3VJRFB1YU03Yi9pK1dvdDV6VmhtTnUyK0hyNWgKWmRlYVUxK0dpbnNzTXRrMGtIVk1BQ0dlWTJDRTFCUjlzeDdJdFZ6WkJVYWxWaFVuSm8xOWlGZDFMcHg0Nko0YwpEQk1hMVNwOXlLL1AxNnhIWGU2bWVjNytYdUhEamhFbkZ6RDd3ZHdjUDBPVGJCUUQ1MERYVzRUb3pJWXlvYVpoCnB4RTdabkRUSGcvNXBkU204WWczRnZIbmlkdTVYWFdRQ2tyT1RJWlFxTkttQjNma2hIUVZ1SmlHNEtQNmV0dXYKMTR3SmVmTWVCbk56dlhYY04wMXFJR2p3cC9xcW9pa094eDFKbXVnSkFvNDRNaTdnMkRkQlJZa1g4Mk1kbmZSNApmQVBmZFMrUXZvOUFTTFc5dDRzY251TEs3RVlXZURZZFU4enIzcHRXLzNvZVJtcUU2eUFabEkxSGVaWmE3SEJtCkM4VVJVOGJYSS9nbUJoZm1ld1pJMHBUeE5wZDBrcGlYWDNSYU9iMU1Reno4YllEK09lcVhoMHVYRmFFQVl6NTkKcHVnNFRDSVFFRDNweHdJS1l2QmRmZTl3MGV5NwotLS0tLUVORCBDRVJUSUZJQ0FURS0tLS0tCg==",
                "status": "ACTIVE",
                "key_metadata": {
                    "type": "RSA",
                    "bits": 4096,
                    "strength": "HIGH"
                },
                "subject": {
                    "common_name": "13f4bc74-3314-4a0b-b65c-73a82e14cc5f",
                    "organization": "",
                    "organization_unit": "",
                    "country": "",
                    "state": "",
                    "locality": ""
                },
                "valid_from": 1689858815000,
                "valid_to": 1698498814000
            },
            "archive_certificates": []
        }
    ],
    "allow_new_enrollment": false,
    "description": "-",
    "tags": [
        "iot"
    ],
    "icon_name": "CgSmartphoneChip",
    "icon_color": "#25eee2-#333333",
    "creation_timestamp": 1689858244749
}

```

Data structure published by **io.lamassuiot.device.rotate** and **io.lamassuiot.device.revoke** events

- `id`: `default` - Slot ID, by default the device is created with the slot `default`.
- `active_certificate`: - Certificate active slot
    - `ca_name`: `(string: "")` - Name of the CA that issued the certificate
    - `serial_number`: `(string: "")` - Serial number of the certificate
    - `certificate`: `(string: "")` - Certificate in Base64-encoded PEM format
    - `status`: `(string: "")` - Certificate status. Valid options are `ACTIVE`, `EXPIRED`, `REVOKED`, `NEARING_EXPIRATION` and `CRITICAL_EXPIRATION`.
    - `key_metadata`:
        - `type`: `(string: "")` - Type of the private key, `RSA` or `ECDSA`.
        - `bits`: `(int: "")` - Private key size
        - `strength`: `(string: "")` - Private key strength `LOW`, `MEDIUM` or `HIGH`.
    - `subject`: - The Subject of the device certificate
        - `common_name`: `(string: "")`
        - `organization`: `(string: "")`
        - `organization_unit`: `(string: "")`
        - `country`: `(string: "")`
        - `state`: `(string: "")`
        - `locality`: `(string: "")`
    - `valid_from`: `(int: "")` - Date of issue of the certificate expressed in milliseconds since 1 June 1970 UTC
    - `valid_to`: `(int: "")` - Date of validity of the certificate expressed in milliseconds since 1 June 1970 UTC
- `archive_certificates`: [] - Array with all the certificates that the device has held

```
{
    "id": "default",
    "active_certificate": {
        "ca_name": "TestAwsCA",
        "serial_number": "ed-34-90-2e-25-9b-f7-17-2d-ea-83-f3-06-46-50-f6-81-c9-92-6c",
        "certificate": "LS0tLS1CRUdJTiBDRVJUSUZJQ0FURS0tLS0tCk1JSUZVVENDQXptZ0F3SUJBZ0lWQU8wMGtDNGxtL2NYTGVxRDh3WkdVUGFCeVpKc01BMEdDU3FHU0liM0RRRUIKQ3dVQU1Fc3hDVEFIQmdOVkJBWVRBREVKTUFjR0ExVUVDQk1BTVFrd0J3WURWUVFIRXdBeENUQUhCZ05WQkFvVApBREVKTUFjR0ExVUVDeE1BTVJJd0VBWURWUVFERXdsVVpYTjBRWGR6UTBFd0hoY05Nak13TnpJd01UTXhNek0xCldoY05Nak14TURJNE1UTXhNek0wV2pBdk1TMHdLd1lEVlFRREV5UXhNMlkwWW1NM05DMHpNekUwTFRSaE1HSXQKWWpZMVl5MDNNMkU0TW1VeE5HTmpOV1l3Z2dJaU1BMEdDU3FHU0liM0RRRUJBUVVBQTRJQ0R3QXdnZ0lLQW9JQwpBUURJaEt2N0NvWEpFV3VyVEs3THgwN0p2MU1NRlk0OHpleTV2OTdRVkxmSXY1MXdzRFVPYmY1YVI0V1MrNjQzCmcxa09SeUdBM2tLQjAxNWhhVW5nL0U1aVNNR29EeDVpQ2lnV1FLRDg3WUROelFWNDVUa0cvMFo1clIxRVY0bFQKNGp3MkVYMkl5ZkQyM1B5VlZzOGJBSnUwNkxUK1FNUUpHYnkxM0dhRjR6eCtwb0JyNnJhTHdYQXErajMyaHhNcApKUEJnM05PWkdRQVVOVnQySmZ1eUFqeE9wWE05UGFHSjdlb2JmODg1VCs4YmZ5VE1LcE5acmRsZzF2WnBSUE40CjJjTWJ4ODk4S3VFenRYNVRDTkxmdXZXNDZjTS8zczF4K1gxOHJvdEJBMTRtbEVQVE9PZVh0TVNqOSs3M01jYlQKdEhYQUtqc3czZXFIclEzcmhadXB0VHQ5K2lTanpKdTgybDFYQ2R0OStubkFaMjhqZ0RsT0RxZU45R0ZNTk5LRAphaVd1WTdwdWtqcFdadXFYdXA2RGNnQ1h5cVppLzdOMEJVaEEzS3pGUUxJTk44dzVhNnE4anZaTEdXcUtKUnNLCkNtaUhwZ1VBd0twYlJhTkhUdnpxTHZ4cUVrRmhHRUJjMWFZZERHNVI1Yk5ac3VjL3UvT0tIbmcxcU1lU1R1bkwKbGlEcXZOK05GbVJiTjlRSzJweURaY25ZVERKMjhOWmhxcENJbG1lVXV1eWxLNGdyRExpTnRTRGMvbUZCU25CUQpRK2NGTjlDN2paVk5lM3NGenpQWVNtVHJJMU8zdHpyaEk1NTNSczhpT09TbHlXS0VDaG9LOFB0cXlpYk42Y1lRCmNMZGRXVXo1TlJUOHoraGgrbi84b0ZpRExOb24zUHQ4L1dTZko0bkc3YVN6QlFJREFRQUJvMGd3UmpBT0JnTlYKSFE4QkFmOEVCQU1DQjRBd0V3WURWUjBsQkF3d0NnWUlLd1lCQlFVSEF3SXdId1lEVlIwakJCZ3dGb0FVZEZLZgpWN1Arajg3K0pBREVJbmI0MmZnRlNnb3dEUVlKS29aSWh2Y05BUUVMQlFBRGdnSUJBRjZOMEV4QXUwZTBFeVdHCmpWVU1XRHRaVVpzaVNvQVNBMnZVQVEza0s3bGZieUowSklrRHJyMXVkakc3Y1pLMTBMd2xnVHU2YW54THlDeFYKMytycG9BMm1tcEUyTVhBZVdvK3gxNUdvZllTeTlyM3NKUEFPNkhMZE9CK0ZldTc0VjVHV2tQSXE5Z2xxd1NBWApXYmlZT3JsWFJsNkZrOXZZR0xZWkcvWGtwRDdWUVRVVzl5WGJrYjE3SU4vNU1yUm91SU9abU5Sa2FFZFhxaXJnClNaUVA5cnQxczFyTStVVDcxZzhQN2YzR05ibXE2RWFGelBRL3VJRFB1YU03Yi9pK1dvdDV6VmhtTnUyK0hyNWgKWmRlYVUxK0dpbnNzTXRrMGtIVk1BQ0dlWTJDRTFCUjlzeDdJdFZ6WkJVYWxWaFVuSm8xOWlGZDFMcHg0Nko0YwpEQk1hMVNwOXlLL1AxNnhIWGU2bWVjNytYdUhEamhFbkZ6RDd3ZHdjUDBPVGJCUUQ1MERYVzRUb3pJWXlvYVpoCnB4RTdabkRUSGcvNXBkU204WWczRnZIbmlkdTVYWFdRQ2tyT1RJWlFxTkttQjNma2hIUVZ1SmlHNEtQNmV0dXYKMTR3SmVmTWVCbk56dlhYY04wMXFJR2p3cC9xcW9pa094eDFKbXVnSkFvNDRNaTdnMkRkQlJZa1g4Mk1kbmZSNApmQVBmZFMrUXZvOUFTTFc5dDRzY251TEs3RVlXZURZZFU4enIzcHRXLzNvZVJtcUU2eUFabEkxSGVaWmE3SEJtCkM4VVJVOGJYSS9nbUJoZm1ld1pJMHBUeE5wZDBrcGlYWDNSYU9iMU1Reno4YllEK09lcVhoMHVYRmFFQVl6NTkKcHVnNFRDSVFFRDNweHdJS1l2QmRmZTl3MGV5NwotLS0tLUVORCBDRVJUSUZJQ0FURS0tLS0tCg==",
        "status": "ACTIVE",
        "key_metadata": {
            "type": "RSA",
            "bits": 4096,
            "strength": "HIGH"
         },
        "subject": {
            "common_name": "13f4bc74-3314-4a0b-b65c-73a82e14cc5f",
            "organization": "",
            "organization_unit": "",
            "country": "",
            "state": "",
            "locality": ""
           },
        "valid_from": 1689858815000,
        "valid_to": 1698498814000
    },
    "archive_certificates": []
}
```

Data structure published by **io.lamassuiot.device.enroll** and **io.lamassuiot.device.reenroll** events

- `certificate`: `(string: "")` - Certificate in Base64-encoded PEM format

```
{
    "certificate": "LS0tLS1CRUdJTiBDRVJUSUZJQ0FURS0tLS0tCk1JSUZVVENDQXptZ0F3SUJBZ0lWQU8wMGtDNGxtL2NYTGVxRDh3WkdVUGFCeVpKc01BMEdDU3FHU0liM0RRRUIKQ3dVQU1Fc3hDVEFIQmdOVkJBWVRBREVKTUFjR0ExVUVDQk1BTVFrd0J3WURWUVFIRXdBeENUQUhCZ05WQkFvVApBREVKTUFjR0ExVUVDeE1BTVJJd0VBWURWUVFERXdsVVpYTjBRWGR6UTBFd0hoY05Nak13TnpJd01UTXhNek0xCldoY05Nak14TURJNE1UTXhNek0wV2pBdk1TMHdLd1lEVlFRREV5UXhNMlkwWW1NM05DMHpNekUwTFRSaE1HSXQKWWpZMVl5MDNNMkU0TW1VeE5HTmpOV1l3Z2dJaU1BMEdDU3FHU0liM0RRRUJBUVVBQTRJQ0R3QXdnZ0lLQW9JQwpBUURJaEt2N0NvWEpFV3VyVEs3THgwN0p2MU1NRlk0OHpleTV2OTdRVkxmSXY1MXdzRFVPYmY1YVI0V1MrNjQzCmcxa09SeUdBM2tLQjAxNWhhVW5nL0U1aVNNR29EeDVpQ2lnV1FLRDg3WUROelFWNDVUa0cvMFo1clIxRVY0bFQKNGp3MkVYMkl5ZkQyM1B5VlZzOGJBSnUwNkxUK1FNUUpHYnkxM0dhRjR6eCtwb0JyNnJhTHdYQXErajMyaHhNcApKUEJnM05PWkdRQVVOVnQySmZ1eUFqeE9wWE05UGFHSjdlb2JmODg1VCs4YmZ5VE1LcE5acmRsZzF2WnBSUE40CjJjTWJ4ODk4S3VFenRYNVRDTkxmdXZXNDZjTS8zczF4K1gxOHJvdEJBMTRtbEVQVE9PZVh0TVNqOSs3M01jYlQKdEhYQUtqc3czZXFIclEzcmhadXB0VHQ5K2lTanpKdTgybDFYQ2R0OStubkFaMjhqZ0RsT0RxZU45R0ZNTk5LRAphaVd1WTdwdWtqcFdadXFYdXA2RGNnQ1h5cVppLzdOMEJVaEEzS3pGUUxJTk44dzVhNnE4anZaTEdXcUtKUnNLCkNtaUhwZ1VBd0twYlJhTkhUdnpxTHZ4cUVrRmhHRUJjMWFZZERHNVI1Yk5ac3VjL3UvT0tIbmcxcU1lU1R1bkwKbGlEcXZOK05GbVJiTjlRSzJweURaY25ZVERKMjhOWmhxcENJbG1lVXV1eWxLNGdyRExpTnRTRGMvbUZCU25CUQpRK2NGTjlDN2paVk5lM3NGenpQWVNtVHJJMU8zdHpyaEk1NTNSczhpT09TbHlXS0VDaG9LOFB0cXlpYk42Y1lRCmNMZGRXVXo1TlJUOHoraGgrbi84b0ZpRExOb24zUHQ4L1dTZko0bkc3YVN6QlFJREFRQUJvMGd3UmpBT0JnTlYKSFE4QkFmOEVCQU1DQjRBd0V3WURWUjBsQkF3d0NnWUlLd1lCQlFVSEF3SXdId1lEVlIwakJCZ3dGb0FVZEZLZgpWN1Arajg3K0pBREVJbmI0MmZnRlNnb3dEUVlKS29aSWh2Y05BUUVMQlFBRGdnSUJBRjZOMEV4QXUwZTBFeVdHCmpWVU1XRHRaVVpzaVNvQVNBMnZVQVEza0s3bGZieUowSklrRHJyMXVkakc3Y1pLMTBMd2xnVHU2YW54THlDeFYKMytycG9BMm1tcEUyTVhBZVdvK3gxNUdvZllTeTlyM3NKUEFPNkhMZE9CK0ZldTc0VjVHV2tQSXE5Z2xxd1NBWApXYmlZT3JsWFJsNkZrOXZZR0xZWkcvWGtwRDdWUVRVVzl5WGJrYjE3SU4vNU1yUm91SU9abU5Sa2FFZFhxaXJnClNaUVA5cnQxczFyTStVVDcxZzhQN2YzR05ibXE2RWFGelBRL3VJRFB1YU03Yi9pK1dvdDV6VmhtTnUyK0hyNWgKWmRlYVUxK0dpbnNzTXRrMGtIVk1BQ0dlWTJDRTFCUjlzeDdJdFZ6WkJVYWxWaFVuSm8xOWlGZDFMcHg0Nko0YwpEQk1hMVNwOXlLL1AxNnhIWGU2bWVjNytYdUhEamhFbkZ6RDd3ZHdjUDBPVGJCUUQ1MERYVzRUb3pJWXlvYVpoCnB4RTdabkRUSGcvNXBkU204WWczRnZIbmlkdTVYWFdRQ2tyT1RJWlFxTkttQjNma2hIUVZ1SmlHNEtQNmV0dXYKMTR3SmVmTWVCbk56dlhYY04wMXFJR2p3cC9xcW9pa094eDFKbXVnSkFvNDRNaTdnMkRkQlJZa1g4Mk1kbmZSNApmQVBmZFMrUXZvOUFTTFc5dDRzY251TEs3RVlXZURZZFU4enIzcHRXLzNvZVJtcUU2eUFabEkxSGVaWmE3SEJtCkM4VVJVOGJYSS9nbUJoZm1ld1pJMHBUeE5wZDBrcGlYWDNSYU9iMU1Reno4YllEK09lcVhoMHVYRmFFQVl6NTkKcHVnNFRDSVFFRDNweHdJS1l2QmRmZTl3MGV5NwotLS0tLUVORCBDRVJUSUZJQ0FURS0tLS0tCg=="
}

```
Data structure published by **io.lamassuiot.device.forceReenroll** event

- `device_id`: `(string: "")` - Device ID
- `slot_id`: `(string: "")` - Slot ID for reenrollment
- `require_reenrollment`: `(bool: true)` - Boolean to indicate if rewinding is required
- `crt`: `(string: "")` - Active device certificate in PEM format and base64-encoded

```
{
    "device_id": "13f4bc74-3314-4a0b-b65c-73a82e14cc5f",
    "slot_id": "default",
    "require_reenrollment": true,
    "crt": "LS0tLS1CRUdJTiBDRVJUSUZJQ0FURS0tLS0tCk1JSUZVVENDQXptZ0F3SUJBZ0lWQU8wMGtDNGxtL2NYTGVxRDh3WkdVUGFCeVpKc01BMEdDU3FHU0liM0RRRUIKQ3dVQU1Fc3hDVEFIQmdOVkJBWVRBREVKTUFjR0ExVUVDQk1BTVFrd0J3WURWUVFIRXdBeENUQUhCZ05WQkFvVApBREVKTUFjR0ExVUVDeE1BTVJJd0VBWURWUVFERXdsVVpYTjBRWGR6UTBFd0hoY05Nak13TnpJd01UTXhNek0xCldoY05Nak14TURJNE1UTXhNek0wV2pBdk1TMHdLd1lEVlFRREV5UXhNMlkwWW1NM05DMHpNekUwTFRSaE1HSXQKWWpZMVl5MDNNMkU0TW1VeE5HTmpOV1l3Z2dJaU1BMEdDU3FHU0liM0RRRUJBUVVBQTRJQ0R3QXdnZ0lLQW9JQwpBUURJaEt2N0NvWEpFV3VyVEs3THgwN0p2MU1NRlk0OHpleTV2OTdRVkxmSXY1MXdzRFVPYmY1YVI0V1MrNjQzCmcxa09SeUdBM2tLQjAxNWhhVW5nL0U1aVNNR29EeDVpQ2lnV1FLRDg3WUROelFWNDVUa0cvMFo1clIxRVY0bFQKNGp3MkVYMkl5ZkQyM1B5VlZzOGJBSnUwNkxUK1FNUUpHYnkxM0dhRjR6eCtwb0JyNnJhTHdYQXErajMyaHhNcApKUEJnM05PWkdRQVVOVnQySmZ1eUFqeE9wWE05UGFHSjdlb2JmODg1VCs4YmZ5VE1LcE5acmRsZzF2WnBSUE40CjJjTWJ4ODk4S3VFenRYNVRDTkxmdXZXNDZjTS8zczF4K1gxOHJvdEJBMTRtbEVQVE9PZVh0TVNqOSs3M01jYlQKdEhYQUtqc3czZXFIclEzcmhadXB0VHQ5K2lTanpKdTgybDFYQ2R0OStubkFaMjhqZ0RsT0RxZU45R0ZNTk5LRAphaVd1WTdwdWtqcFdadXFYdXA2RGNnQ1h5cVppLzdOMEJVaEEzS3pGUUxJTk44dzVhNnE4anZaTEdXcUtKUnNLCkNtaUhwZ1VBd0twYlJhTkhUdnpxTHZ4cUVrRmhHRUJjMWFZZERHNVI1Yk5ac3VjL3UvT0tIbmcxcU1lU1R1bkwKbGlEcXZOK05GbVJiTjlRSzJweURaY25ZVERKMjhOWmhxcENJbG1lVXV1eWxLNGdyRExpTnRTRGMvbUZCU25CUQpRK2NGTjlDN2paVk5lM3NGenpQWVNtVHJJMU8zdHpyaEk1NTNSczhpT09TbHlXS0VDaG9LOFB0cXlpYk42Y1lRCmNMZGRXVXo1TlJUOHoraGgrbi84b0ZpRExOb24zUHQ4L1dTZko0bkc3YVN6QlFJREFRQUJvMGd3UmpBT0JnTlYKSFE4QkFmOEVCQU1DQjRBd0V3WURWUjBsQkF3d0NnWUlLd1lCQlFVSEF3SXdId1lEVlIwakJCZ3dGb0FVZEZLZgpWN1Arajg3K0pBREVJbmI0MmZnRlNnb3dEUVlKS29aSWh2Y05BUUVMQlFBRGdnSUJBRjZOMEV4QXUwZTBFeVdHCmpWVU1XRHRaVVpzaVNvQVNBMnZVQVEza0s3bGZieUowSklrRHJyMXVkakc3Y1pLMTBMd2xnVHU2YW54THlDeFYKMytycG9BMm1tcEUyTVhBZVdvK3gxNUdvZllTeTlyM3NKUEFPNkhMZE9CK0ZldTc0VjVHV2tQSXE5Z2xxd1NBWApXYmlZT3JsWFJsNkZrOXZZR0xZWkcvWGtwRDdWUVRVVzl5WGJrYjE3SU4vNU1yUm91SU9abU5Sa2FFZFhxaXJnClNaUVA5cnQxczFyTStVVDcxZzhQN2YzR05ibXE2RWFGelBRL3VJRFB1YU03Yi9pK1dvdDV6VmhtTnUyK0hyNWgKWmRlYVUxK0dpbnNzTXRrMGtIVk1BQ0dlWTJDRTFCUjlzeDdJdFZ6WkJVYWxWaFVuSm8xOWlGZDFMcHg0Nko0YwpEQk1hMVNwOXlLL1AxNnhIWGU2bWVjNytYdUhEamhFbkZ6RDd3ZHdjUDBPVGJCUUQ1MERYVzRUb3pJWXlvYVpoCnB4RTdabkRUSGcvNXBkU204WWczRnZIbmlkdTVYWFdRQ2tyT1RJWlFxTkttQjNma2hIUVZ1SmlHNEtQNmV0dXYKMTR3SmVmTWVCbk56dlhYY04wMXFJR2p3cC9xcW9pa094eDFKbXVnSkFvNDRNaTdnMkRkQlJZa1g4Mk1kbmZSNApmQVBmZFMrUXZvOUFTTFc5dDRzY251TEs3RVlXZURZZFU4enIzcHRXLzNvZVJtcUU2eUFabEkxSGVaWmE3SEJtCkM4VVJVOGJYSS9nbUJoZm1ld1pJMHBUeE5wZDBrcGlYWDNSYU9iMU1Reno4YllEK09lcVhoMHVYRmFFQVl6NTkKcHVnNFRDSVFFRDNweHdJS1l2QmRmZTl3MGV5NwotLS0tLUVORCBDRVJUSUZJQ0FURS0tLS0tCg=="
}

```


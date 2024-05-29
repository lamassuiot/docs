# Data Models

## CA Certificate
```json title="Example"
{
    "serial_number": "71-df-b5-ee-26-46-5f-0c-6b-ad-9f-76-0a-aa-57-35-9c-a8-ed-fe",
    "issuer_metadata": {
        "serial_number": "71-df-b5-ee-26-46-5f-0c-6b-ad-9f-76-0a-aa-57-35-9c-a8-ed-fe",
        "ca_id": "6a00d228-90e9-4999-98bf-e7ebf73dba43"
    },
    "status": "ACTIVE",
    "certificate": "LS0tLS1CRUdJTiBDRVJUSUZJQ0FURS0tLS0tCk1JSUZwekNDQTQrZ0F3SUJBZ0lVY2QrMTdpWkdYd3hyclo5MkNxcFhOWnlvN2Y0d0RRWUpLb1pJaHZjTkFRRUwKQlFBd1RURUpNQWNHQTFVRUJoTUFNUWt3QndZRFZRUUlFd0F4Q1RBSEJnTlZCQWNUQURFSk1BY0dBMVVFQ2hNQQpNUWt3QndZRFZRUUxFd0F4RkRBU0JnTlZCQU1UQzBWc1pYWmhkRzl5YzBOQk1CNFhEVEl6TVRBd016RTFNek14Ck1sb1hEVEkwTURjeU9URTFNek13T0Zvd1RURUpNQWNHQTFVRUJoTUFNUWt3QndZRFZRUUlFd0F4Q1RBSEJnTlYKQkFjVEFERUpNQWNHQTFVRUNoTUFNUWt3QndZRFZRUUxFd0F4RkRBU0JnTlZCQU1UQzBWc1pYWmhkRzl5YzBOQgpNSUlDSWpBTkJna3Foa2lHOXcwQkFRRUZBQU9DQWc4QU1JSUNDZ0tDQWdFQXFIWEtacjB0RDJlaGhCNDZBcXMwCit0RHhjQjR2U2pOVFgramM1aXR0RFVabDgwWUEzTWhMaWVCSUZaaHJ6NFBpdUpxNnc4aWJrUmRhdlhTQ0xKWjUKZS8rc1FMYXl2NXRuVkp2ZDNUNEk4aFZkRnhxUGZBbndmb3lJMW9IaUxZa3htK0xvWithdnZPcWpqRnRmSSsxTQpTZ1N2dkZYMUlyK015QmZCQmdpRnM3MmZ2R0NoOHFCVXpoZXdrNEExTUtydmVoUDMxdFNUbCtjbmh3NGVtMFB5ClM2d3MwNGNsTTNPemxoM0tiL1Y1YUtIeDNxQlhhRGlMQzRYdkgzT3c3SEp3QXBtdWUvdFhVRThWSDZVZ1dhOU4KL3h4NUp3amZZVmtXb0ppemhpZzBVdEZIeXRZNng4dWExZ1lVYkxwUGNiYUhMeENkbUw1YzNHZmFlN0ZObGxDKwp0blAzYWRxUHpHZ1R2ejFyLzhHY0Y3MkFHdkNBaE5aTVFXRU5ucGtYSi9hZ2s4Zk53V3liamw2ckFiZndJVVZVCmNJK0hQbjVYbnR6SEtEYVE2NklxT3ZKUlk3M3huTm5uNUttK3VHS1IxVzRaOW9sNGpKQzVycTE2Y2c0Zm0vQUsKYTRZdlBOcHg4M1NGcVR5Tk04d2FaOWZ4ZkVzMm41WndVOU93ZVg3djNXNWsxQ3NvRDZURFpvVklmQWZBTm9BNAp0THlnaCttaEw3U0lXNHhBVnJwcFZRVGRDQk9OTlpjcEF0SEtkRUxjRG9xV1Z5UnErV0E0OHNyenNmaFpyRnNECmtmcnhqLzRObTVJZGU4MmZOdzJBanpkajQ5UW0wY210QTRDbnZXNnRFbUhZRVRUNVZZZHlPcHBOTW5VRnEyR2cKNWp1a2FSSGh6dHdIaXV5SkFUaXNzVVVDQXdFQUFhTi9NSDB3RGdZRFZSMFBBUUgvQkFRREFnR1dNQjBHQTFVZApKUVFXTUJRR0NDc0dBUVVGQndNQ0JnZ3JCZ0VGQlFjREFUQVBCZ05WSFJNQkFmOEVCVEFEQVFIL01CMEdBMVVkCkRnUVdCQlNPUTllVUwvTmdrTXMvT3AvVjh0RWJWRThwMWpBY0JnZ3JCZ0VGQlFjQkFRUVFNQTR3REFZSUt3WUIKQlFVSE1BR0dBREFOQmdrcWhraUc5dzBCQVFzRkFBT0NBZ0VBZE9sbDA5TmFrdmxld0p4azNYMkJFT2ozU2NvSApEU2F4NlFOUmZNc2tVbkdqYmF5ZnV2SHcrQ1IvWU9WbEdhS0xnVFp6emVrU1lRb3dJQkVMOXV0TkZYQkI5Mkw4Cm5VNzd6THdxclJsK2FDc2NTbnlGZ2xpenc2amkvQnBGemYvekZ5RlpMa0RFT3dvMm1zMStDeXNmN3NiTGFyVUMKR1FGTmw4dUptZmdGQW9OZjNyS2pIQm5iZXRRL2xqV1VqMWlzZmpMeGZsWmZoZjJ6UUY4WEVxc0ZIYm5FM1ROSwpKQlRwZnAwOWxOb29XcFVlOTZ4aWd1d3FzSUFIVnlKUFJtMjVleUIxU05CV3ROMjZaRzlYM0JVY3hXdWs4My9IClVXayttcDFkMkZESnRJdTJWTkVyWjFtV1JDa1QzQ0tkTmc2b3RZYllSUHdCVDVibDhyTHFETVVDV29vSzE0eisKTTNBNElXeVU4WTdDc20vZW5xYyszb1JQREdDelZvdmpVaXI4WUZGMHd6am54Z2VSM2gwVlNtcWNkYlN3Unl5dApMWFNCTEN1UlRHeXRHL0U0cldRMmxDbzRsYWlaOTBFaERUU1VrTURZSTJKNUgzNm54RzBwakw3MGhPUkd5UlMzClNHVTkxRzI1L3dSM2p0YzZEYWowOS9hL0JYY0VpV3M0dnNsd2VOOTBEK0pjVVFMQlFPNm5KOGlsWUFQNU9ESDYKRUhuTWJnUmgyZk9uQU4rM3prTW9pQmxIbnUwT2NkRXBabjdXbjZaMFVPK005WWwrVlRBb3B6YzUyWCtUYVJsYQo1Z3NkRWlOdDJJMXVFeUVMSlZneFRCZDhnNisxWU9hSkhjRUVMVkc2dXhTZEt1N1FIbXQ2OGg2a21GdjFOTlBiCnRxL0MwR0NwKzJ3SUUxWT0KLS0tLS1FTkQgQ0VSVElGSUNBVEUtLS0tLQo=",
    "key_metadata": {
        "type": "RSA",
        "bits": 4096,
        "strength": "HIGH"
    },
    "subject": {
        "common_name": "ElevatorsCA",
        "organization": "",
        "organization_unit": "",
        "country": "",
        "state": "",
        "locality": ""
    },
    "valid_from": "2023-10-03T15:33:12Z",
    "valid_to": "2024-07-29T15:33:08Z",
    "revocation_timestamp": "0001-01-01T00:00:00Z",
    "revocation_reason": "Unspecified",
    "engine_id": "aws-secrets-mngr-1",
    "id": "6a00d228-90e9-4999-98bf-e7ebf73dba43",
    "metadata": {
        "lamassu.io/name": "ElevatorsCA"
    },
    "issuance_expiration": {
        "type": "Duration",
        "duration": "14w2d",
        "time": "2024-01-11T17:32:56+01:00"
    },
    "type": "MANAGED",
    "creation_ts": "2023-10-03T15:33:12.366658Z"
}
```

```go title="Schema"
type CACertificate struct {
	SerialNumber   string `json:"serial_number"`
	IssuerMetadata struct {
		SerialNumber string `json:"serial_number"`
		CaID         string `json:"ca_id"`
	} `json:"issuer_metadata"`
	Status      string `json:"status"`
	Certificate string `json:"certificate"`
	KeyMetadata struct {
		Type     string `json:"type"`
		Bits     int    `json:"bits"`
		Strength string `json:"strength"`
	} `json:"key_metadata"`
	Subject struct {
		CommonName       string `json:"common_name"`
		Organization     string `json:"organization"`
		OrganizationUnit string `json:"organization_unit"`
		Country          string `json:"country"`
		State            string `json:"state"`
		Locality         string `json:"locality"`
	} `json:"subject"`
	ValidFrom           time.Time `json:"valid_from"`
	ValidTo             time.Time `json:"valid_to"`
	RevocationTimestamp time.Time `json:"revocation_timestamp"`
	RevocationReason    string    `json:"revocation_reason"`
	EngineID            string    `json:"engine_id"`
	ID                  string    `json:"id"`
	Metadata            map[string]any `json:"metadata"`
	IssuanceExpiration struct {
		Type     string    `json:"type"`
		Duration string    `json:"duration"`
		Time     time.Time `json:"time"`
	} `json:"issuance_expiration"`
	Type       string    `json:"type"`
	CreationTs time.Time `json:"creation_ts"`
}
```

## Certificate


## DMS Manager


## Device
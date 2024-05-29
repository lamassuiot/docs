# AWS IoT

## Platform Setup

### Registering CA in AWS IoT Core

### Provisioning Templates & Policies

## Device Automation

### Notifying Certificate Renewal

When a Cloud Event is recieved by the AWS connector where a certificate metadata complies with:

- Preventive Check has been triggered:
```json
{
  "metadata":{
    "lamassu.io/ca/expiration-deltas": [
      {
        "name": "Preventive",
        "delta": "31d",
        "triggered": true,
      },
    ]
  }
}
```

- Certificate :
```json
{
  "metadata":{
    "lamassu.io/ra": "cloud.robots-factory",
    "lamassu.io/ra": "user.12345-678-901-23456",
  }
}
```

### Notifying CA Certificate Renewal


## Certificate Status Synchronization
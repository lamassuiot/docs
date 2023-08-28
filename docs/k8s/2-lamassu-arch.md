# 2. Design Your Lamassu Deployment

Lamassu is based on a set of microservices that can be grouped in three categories. `Business Logic microservices`, witch must be always installed, `Lamassu plugins` and `Infrastructure microservices`.

Lamassu is moving to be more cloud-friendly, meaning that some of the `Infrastructure microservices` can be moved to the cloud if needed using cloud provider specific services. We also are committed to OSS, so there will always be an on-premise OSS service in case your PKI scenario doesn't involve any cloud service.

## Business Logic microservices

As stated earlier, this microservices MUST always be present in any Lamassu installation, but can be fine tunned to met your requirements:

- **CA Service**: *TODO: Link to config file*
- **DMS Manager Service**: *TODO: Link to config file*
- **Device Manager**: *TODO: Link to config file*
- **OCSP Service**: *TODO: Link to config file*

## Lamassu plugins

- **AWS Connector Service**: *TODO: Link to config file*
- **Alerts Service**: *TODO: Link to config file*

## Infrastructure microservices

- **Database**: Lamassu plans supporting different databases (also referred as Storage Engine). As of now, thees are the supported storage engines:
    - `Postgres`: (available only for versions < v2.X). 
    - `CouchDB`: (available only for versions > v3.X)
    - `AWS DynamoDB`: (available only for versions > v3.X)

- **Database**: Lamassu plans supporting different databases (also referred as Storage Engine). As of now, thees are the supported storage engines:

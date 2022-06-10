# Lamassu Virtual DMS

To launch Lamassu-Virtual-DMS follow the next steps:

1. Clone the repository and get into the directory: `https://github.com/lamassuiot/lamassu-virtual-dms.git && cd lamassu-virtual-dms`.
2. Change the configuration variables of the `config.json` file.

```
{
    "dms": {
        "device_store": "<DEVICES_STORE>", // Folder where device certificates are stored
        "dms_store": "<DMS_STORE>", // Folder where DMS certificates are stored
        "endpoint":"<DMS_SERVER>", // DMS server endpoint
        "dms_name":"<DEFAULT_DMS>", // DMS Name
        "common_name":"<DEFAULT_DMS>", // Common_name to create the CSR
        "country":"<COUNTRY>", // Country to create the CSR
        "locality":"<LOCALITY>", // Locality to create the CSR
        "organization":"<ORGANIZATION>", // Organization to create the CSR
        "organization_unit":"<ORGANIZATION_UNIT>", // Organization_unit to create the CSR
        "state":"<STATE>" // State to create the CSR


    },
    "devmanager":{
        "devcrt": "<DEV_CERTIFICATE>", // Public certificate to connect to the device-manager
        "addr": "<DEVMANAGER_SERVER>" //Device Manager Server Endpoint
    },
    "auth":{
        "endpoint":"<AUTH_SERVER>", // Authentication Server endpoint
        "username":"<PASSWORD>", // User name to connect to the authentication server
        "password":"<PASSWORD>" // Password to connect to the authentication server

    }
}

```
3. Create directories to store DMS and device certificates

```
    mkdir -p /home/$USER/virtual-dms-data/devices_certificates
    mkdir -p /home/$USER/virtual-dms-data/dms_certificates
```
4. `config.json` file with default values

```
{
    "dms": {
        "device_store": "/home/$USER/virtual-dms-data/devices_certificates",
        "dms_store": "/home/$USER/virtual-dms-data/dms_certificates",
        "endpoint":"dev.lamassu.io/api/dmsenroller",
        "dms_name":"Virtual DMS",
        "common_name":"Virtual DMS",
        "country":"ES",
        "locality":"Mondragon",
        "organization":"LKS",
        "organization_unit":"LKS PKI",
        "state":"Guipuzcoa"


    },
    "devmanager":{
        "devcrt": "<DEV_CERTIFICATE>",
        "addr": "dev.lamassu.io/api/devmanager"
    },
    "auth":{
        "endpoint":"auth.dev.lamassu.io",
        "username":"enroller",
        "password":"enroller"
    }
}
```
5. Run the Lamassu-Default-DMS UI:
    ```
    go run cmd/main.go
    ```
## Lamassu Virtual DMS operating modes
 
The virtual DMS has two modes of operation, on the one hand, there is the mode of creating a DMS and once the DMS is created and approved, the devices are automatically enrolled using the DMS. On the other hand, if a DMS has already been created and approved, devices can be directly enrolled without having to create a DMS. In the second case it is necessary to make sure that the certificate and the DMS key are in the directory where the DMS certificates are stored.

If the Virtual-DMS is not used to create the DMS, in the directory where the certificates are stored, the certificates and keys must be created with the following format:
```
    ├── devices_certificates
    │   └── ...
    └── dms_certificates
        ├── dms-<DMS_ID>.crt     <----- Provide your certificate
        └── dms-<DMS_ID>.key     <----- Provide your private key
```

1. Create the DMS, once the DMS is created, the Auto_Enroll of the devices is done.

![virtualDMSUI](img/CreateDMS.png)


2. Make the Auto_Enroll of the devices indicating the ID of a DMS.

![virtualDMSUI](img/AutoEnroll.png)
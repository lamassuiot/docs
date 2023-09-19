# Cloud Events

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

## DMS Manager

| **Event Type**                         | **Description**                                                                                                                                          |
|----------------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------|
| io.lamassuiot.dms.create               | Event sent when the DMS is created and received by the cloud proxy to publish to AWS IoT Core the certificates of the CAs associated to the DMS.         |
| io.lamassuiot.dms.update-status        | Event to report that the status of the DMS has been updated. Valid status: **PENDING_APPROVAL**, **REJECTED**, **APPROVED**, **EXPIRED** and **REVOKED** |
| io.lamassuiot.dms.update               | Event to inform that the DMS has been updated, the cloud proxy receives the event to update the certificates of the CAs.                                 |
| io.lamassuiot.dms.update-authorizedcas | Event to inform that authorized CAs of the DMS have been updated, the cloud proxy receives the event to update the certificates of the CAs               |

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
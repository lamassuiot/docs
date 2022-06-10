# AWS Services used by Lamassu

![Screenshot](img/architecture-aws.png#only-light)

## The AMQP Queue

To get developers up to speed with new updates releated with Lamassu, a AMQP-based Queue service is deployed to provide real-time events. The core components (`Lamassu CA`, `Lamassu DeviceManager` and `Lamassu DMS Enroller`) publish new event messages if an update opperation is triggered. Update opperations are any tpye of function that end up modifying data in any way. Once a core component registers an update opperation, it then published a special crafted event message to the `lamassu_events` queue.

Each publish event follows the [https://cloudevents.io/](Cloud Event) syntaxis.

The asynchronous messages then synchronize with the especified cloud-provider. 

## AWS Lambda

AWS Lambda is a serverless, event-driven compute service that lets you run code for virtually any type of application or backend service without provisioning or managing servers.

## AWS IoT Core

AWS IoT provides the cloud services that connect IoT devices to other devices and services in the AWS Cloud. AWS IoT provides device software that can help integrate IoT devices into solutions based on AWS IoT. If devices can connect to AWS IoT, AWS IoT can connect them to cloud services provided by AWS.


## AWS Cloud Formation

AWS CloudFormation is a service that helps you model and set up your AWS resources so that you can spend less time managing those resources and more time focusing on your applications that run in AWS. You create a template that describes all the AWS resources that you want, and CloudFormation takes care of provisioning and configuring those resources for you. You don't need to individually create and configure AWS resources and figure out what's dependent on what; CloudFormation handles that. The following scenarios demonstrate how CloudFormation can help.


## References

* AWS Lambda web page: [AWS Lambda](https://aws.amazon.com/lambda/?nc1=h_ls)
* AWS IoT Core web page: [AWS IoT Core](https://aws.amazon.com/es/iot-core/)
* AWS Cloud Formation web page: [AWS Cloud Formation](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/Welcome.html)
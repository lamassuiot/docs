# AWS Services used by Lamassu

![Screenshot](img/architecture-aws.png#only-light)



## AWS Lambda

[AWS Lambda](https://aws.amazon.com/lambda/?nc1=h_ls) is a serverless, event-driven compute service that lets you run code for virtually any type of application or backend service without provisioning or managing servers.

## AWS IoT Core

[AWS IoT Core](https://aws.amazon.com/es/iot-core/) provides the cloud services that connect IoT devices to other devices and services in the AWS Cloud. AWS IoT provides device software that can help integrate IoT devices into solutions based on AWS IoT. If devices can connect to AWS IoT, AWS IoT can connect them to cloud services provided by AWS.

## AWS SQS

To extend Lamassu to AWS cloud, whenever a opperation is triggered, an asynchronous messages are send via Amazon Simple Queue Service.
Amazon SQS offers the possibility of establishing a message queue to store messages while they wait to be processed by different computers that are connected to the Internet. These messages can contain notifications for applications or lists of commands to be executed by applications, either in the cloud or on the Internet, allowing you to create automated workflows.

The messages arrive at AWS cloud via  `lamassu-aws-connector`. The connector uses two queues, one for request `lamassu-command` and another for responses, `lamassu-response`.


## AWS Cloud Formation

[AWS Cloud Formation](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/Welcome.html) is a service that helps to model and  [set up](/docs/extension.md#aws-infraestructure-deployment) AWS resources to spend less time managing resources. You create a template that describes all the AWS resources that you want, and CloudFormation takes care of provisioning and configuring those resources for you. You don't need to individually create and configure AWS resources and figure out what's dependent on what. 


## References

* AWS Lambda web page: [AWS Lambda](https://aws.amazon.com/lambda/?nc1=h_ls)
* AWS IoT Core web page: [AWS IoT Core](https://aws.amazon.com/es/iot-core/)
* AWS Cloud Formation web page: [AWS Cloud Formation](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/Welcome.html)
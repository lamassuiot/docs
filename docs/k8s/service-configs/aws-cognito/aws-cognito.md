# AWS Cognito

This guide will walk you through configuring AWS Cognito to be your OIDC provider for managing your users instead of the OSS alternative provided, Keycloak.

## AWS Console Setup

### Create User Pool
Create a new Cognito user pool in case you don't already have one. As can be seen in the image below, in this case the user pool has been named lamassu-oidc.

![Screenshot](imgs/user-pools.png)

!!! info "Lamassu Helm Chart"

    Make sure to copy the **user pool ID** assigned by AWS as it will be needed while configuring the Lamassu's Helm Chart. Note that the user pool ID is different than the assigned name.

### App Integration setup

Cognito provides a mechanism that assigns a *friendly* URL when a user is redirected to cognito to sign in. Go to `App Integration > Domain > Actions` and select `Create Cognito Domain` and provide a valid name. Note that the name must be unique within the same AWS region.

![Screenshot](imgs/cognito-domain.png)

Optionally, it is possible to customize the sign in page with some custom CSS and a logo image. To do so, go to `App Integration > Hosted UI customization` For instance you can configure Cognito to use the following [Image (click to open)](imgs/hosted-ui-logo.jpeg) as the main logo displayed when a user is redirected to sign in.

To instruct Cognito to display the main logo, use the following css:

```css
.logo-customizable {
  max-width: 100%;
  max-height: 100%;
}

.banner-customizable {
  padding: 10px 0px 10px 0px;
  background-color: #007ACC;
}

.submitButton-customizable {
  font-size: 14px;
  font-weight: bold;
  margin: 20px 0px 10px 0px;
  height: 40px;
  width: 100%;
  color: #fff;
  background-color: #007ACC;
}

.submitButton-customizable:hover {
  color: #fff;
  background-color: gray;
}

```

Finally, and the most important part, is creating a new client application for lamassu within the user pool. Go to `App Integration > App clients and analytics` and create a new Client and configure as follows:

  - App Client
    - App type: Select **Public Client**
    - App client name: Specify a friendly name for the app client. i.e.: `lamassu-ui`
  - Hosted UI settings
    - Allowed callback URLs: This is a key parameter. Bare in mind the **URL** used to access lamassu's UI. If you access the UI at `https://dev.lamassu.io` then configure such url to be allowed to sign in
    - Allowed sign-out URLs: Use the same URL as the allowed callback URL but appending `/loggedout` at the end. i.e.: `https://dev.lamassu.io/loggedout`


!!! info "Lamassu Helm Chart - `services.auth.oidc.clientId`"

    Make sure to copy the App Client ID assigned by AWS as it will be needed while configuring the Lamassu's Helm Chart. Note that the App Client ID is different than the assigned name.

### Authorization Groups

The last critical part for configuring Cognito is to define different user groups to limit what each user is allowed to do with lamassu. As of now, lamassu only has two roles: `admin` and `operator`. In this example, we will group our user pool users in two cognito groups:

  - `pki-admin` group: the users that are assigned to this cognito group will have FULL access to all operations within Lamassu, so make sure to only assign authorized users.
  - `audit` group: in contrast, this second group will have limited access.

Create and assign the users within your cognito user pool under the `Groups` tab

!!! info "Lamassu Helm Chart"

    Note that we will map those groups into actual lamassu roles later on while configuring the helm chart under `services.auth.authorization`

## AWS CLI setup

## Lamassu Helm Chart values config

Configure Lamassu helm chart with the following section. Make sure to replace:

- `COGNIT_AWS_REGION`
- `COGNITO_HOSTED_UI_URL`
- `COGNITO_USER_POOL_ID`
- `COGNITO_CLIENT_ID`

As well as map the appropriate cognito groups under `services.auth.authorization`

```yaml
services:
  keycloack:
    enabled: false
auth:
  oidc:
    frontend:
      authority: https://cognito-idp.<COGNIT_AWS_REGION>.amazonaws.com/<COGNITO_USER_POOL_ID>
      clientId: <COGNITO_CLIENT_ID>
      awsCognito:
        enabled: true
        hostedUiDomain: "<COGNITO_HOSTED_UI_URL>"
  apiGateway:
    jwksUrl: https://cognito-idp.<COGNIT_AWS_REGION>.amazonaws.com/<COGNITO_USER_POOL_ID>/.well-known/jwks.json
  authorization:
    rolesClaim: "cognito:groups"
    roles:
      admin: pki-admin
      operator: audit
```
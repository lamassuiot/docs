# AWS Cognito 

This guide will walk you trhough configuring AWS Cognito to be your OIDC provider for managing your users instead of the OSS alternative provided, Keycloak.

## AWS Console Setup

![Screenshot](imgs/user-pools.png)

![Screenshot](imgs/user-pool.png)

![Screenshot](imgs/cognito-domain.png)

For instance you can configure Cognito to use the following [Image (click to open)](imgs/hosted-ui-logo.jpeg) as the main logo displayed when a user is redirected to sign in.

To instruct cognito to display the main logo, use the following css:

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

![Screenshot](imgs/hosted-ui-css.png)


![Screenshot](imgs/apps-urls.png)

## Lamassu Helm Chart values config


```yaml
services:
  keycloack:
    enabled: false
auth:
  oidc:
    frontend:
      authority: https://cognito-idp.<COGNIT_AWS_REGION>.amazonaws.com/<COGNITO_USER_POOL_ID>
      clientId: lamassu
      awsCognito:
        enabled: true
        hostedUiDomain: "<COGNITO_HOSTED_UI>"
  apiGateway:
    jwksUrl: https://cognito-idp.<COGNIT_AWS_REGION>.amazonaws.com/<COGNITO_USER_POOL_ID>/.well-known/jwks.json
  authorization:
    rolesClaim: "cognito:groups"
    roles:
      admin: pki-admin
      operator: pki-operator
```
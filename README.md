# Login and Profile

## Tech Used

AWS CDK - DynamoDB, HttpAPI, Lambda, Cognito / TypeScript

### How to build

* Have AWS CLI <https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html>
* Have AWS CDK CLI <https://docs.aws.amazon.com/cdk/v2/guide/work-with.html#work-with-prerequisites>
* run `make build` to compile typescript
* run `make diff` to see the cloud changes
* run `make deploy` to send cloud changes
* run `make destroy` to remove cloud changes

### Useful Cognito Commands

See `./cdk-outputs.json`

Create a Cognito User

```bash
aws cognito-idp admin-create-user \
  --user-pool-id YOUR_USER_POOL_ID \
  --username name@example.com \
  --user-attributes Name="locale",Value="pt-BR"
```

Add Password

```bash
aws cognito-idp admin-set-user-password \
  --user-pool-id YOUR_USER_POOL_ID \
  --username name@example.com \
  --password SET_NEW_PASSWORD \
  --permanent
```

Verify Email

```bash
aws cognito-idp admin-update-user-attributes \
  --user-pool-id YOUR_USER_POOL_ID \
  --username name@example.com \
  --user-attributes Name="email_verified",Value="true"
```

Login

```bash
aws cognito-idp initiate-auth \
  --auth-flow USER_PASSWORD_AUTH \
  --auth-parameters \
  USERNAME="name@example.com",PASSWORD="password123" \
  --client-id YOUR_USER_POOL_CLIENT_ID

```

The result will be:

```bash
{
  "ChallengeParameters": {},
  "AuthenticationResult": {
    "AccessToken": "ACCESS_TOKEN",
    "ExpiresIn": 3600,
    "TokenType": "Bearer",
    "RefreshToken": "REFRESH_TOKEN",
    "IdToken": "ID_TOKEN"
  }
}

```

The `IdToken` will be used to test the API.

Using PostMan need to set in `Authorization` tab type Bearer Token and put the `IdToken`.

----

Seed plans

* run `aws dynamodb batch-write-item --request-items file://data/plans.json`

Seed referral

* run `aws dynamodb batch-write-item --request-items file://data/referral.json`
  
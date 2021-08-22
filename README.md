# AWS User Service

## Requirements

* Node.js
* npm which comes with Node.js

## Introduction

The service is based on the [serverless](https://serverless.com/) framework. The service is to be used for creating/ listing users in dynamodb. Implemented in node.js runtime.

The package is targeting the latest runtime of AWS Lambda. ([14.x](https://docs.aws.amazon.com/lambda/latest/dg/lambda-runtimes.html))

## Settings

If you prefer to use a different region or stage, update these:

```serverless.yml
  stage: dev
  region: ap-southeast-2
```

Defaults are `dev` and `ap-southeast-2`.

Change name of user table:

```serverles.yml
USER_TABLE: `user-${stage}`
```

### How to use

Get dependencies with `yarn` or `npm install`. The following examples will assume the usage of `yarn`.

Issue a `GET` request to get list of all users from the dynamo table:

```sh
curl --request GET --url https://{ServiceId}.execute-api.{REGION}.amazonaws.com/dev/users 
e.g. curl --request GET --url https://nw9224uaoi.execute-api.ap-southeast-2.amazonaws.com/dev/users
```

Issue a `POST` request with the information required to create a user to create a user in the dynamo table:

```sh
curl --location --request POST  https://{ServiceId}.execute-api.{REGION}.amazonaws.com/dev/users \
--header 'Content-Type: application/json' \
--data-raw '{JSON_DATA}'
e.g.
curl --location --request POST 'https://nw9224uaoi.execute-api.ap-southeast-2.amazonaws.com/dev/users' \
--header 'Content-Type: application/json' \
--data-raw '{
	"firstName": "test",
	"lastName": "user",
	"userName": "test1",
	"email": "testxx@test.com",
	"credentials": "@123as"
}'

```

### Tests

Running all tests:

```bash
$ yarn test
```

Code coverage :
```bash
$ yarn coverage
```

### Linter
ya
Starting the linter tasks:

```bash
$ yarn lint
```

### Deployment

[Setup your AWS credentials](https://serverless.com/framework/docs/providers/aws/guide/credentials/).

Run the following the fire the deployment:

```bash
$ yarn deploy
```

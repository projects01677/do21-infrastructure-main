## Adding an IAM user to AWS

1. First, provision a new user in [stacks/userConfig.ts](https://github.com/WhistleLabs/do21-infrastructure/blob/main/stacks/userConfig.ts) file and merge to `main` to deploy:

```
    {
      name: "Name Lastname",
      awsAccess: {
        whistleSoftware: {
          iamArn: "arn:aws:iam::419697633145:user/name.lastname", // we always create users in parent Whistle org first, AWS ID is 419697633145
        },
        wisdomPanel: { // provision additional access to child organization by creating a role, wisdomPanel in this example
          roleArn: "arn:aws:iam::<AWS_account_ID>:role/name.lastname",
        },
      },
    },
```

2. Second, manually assing a password.
Find the newly created user in [IAM for Whistle account](https://us-east-1.console.aws.amazon.com/iamv2/home#/users), click on the user, click `Security Credentials`, click `Manage` next to `Console password: Disabled`. Select `Enable`, set some random password and set `User must create a new password at next sign-in`.

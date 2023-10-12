import * as aws from "@pulumi/aws"

export const awsAccountId = () => aws.getCallerIdentity().then(c => c.accountId)

import { Policy, User, UserPolicyAttachment } from "@pulumi/aws/iam"
import { interpolate } from "@pulumi/pulumi"
import { config, environment } from "../config"

const policy = new Policy("logfiles-service", {
  name: interpolate`logfiles-service-${environment}`,
  policy: {
    Version: "2012-10-17",
    Statement: [
      {
        Effect: "Allow",
        Action: [
          "dynamodb:UpdateItem",
          "dynamodb:Scan",
          "dynamodb:Query",
          "dynamodb:PutItem",
          "dynamodb:GetItem",
          "dynamodb:BatchWriteItem",
          "dynamodb:BatchGetItem",
        ],
        Resource: [
          `arn:aws:dynamodb:*:*:table/${config.logfiles.dynamodbTableName}/*`,
          `arn:aws:dynamodb:*:*:table/${config.logfiles.dynamodbTableName}`,
        ],
      },
      {
        Effect: "Allow",
        Action: "s3:*",
        Resource: [
          `arn:aws:s3:::${config.logfiles.bucketName}`,
          `arn:aws:s3:::${config.logfiles.bucketName}/*`,
        ],
      },
    ],
  },
})

const user = new User("logfiles-service", {
  name: interpolate`logfiles-service-${environment}`,
  path: "/service/",
})

const policyAttachment = new UserPolicyAttachment(`logfiles-service`, {
  user: user,
  policyArn: policy.arn,
})

export const logfilesServiceIam = {
  user,
  policyAttachment,
}

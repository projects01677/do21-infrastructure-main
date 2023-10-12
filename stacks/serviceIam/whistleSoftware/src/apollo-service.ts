import { Policy, User, UserPolicyAttachment } from "@pulumi/aws/iam"
import { interpolate } from "@pulumi/pulumi"
import { config, environment } from "../config"

const policy = new Policy("apollo-service", {
  name: interpolate`apollo-service-${environment}`,
  policy: {
    Version: "2012-10-17",
    Statement: [
      {
        Sid: "ListAndDescribe",
        Effect: "Allow",
        Action: [
          "dynamodb:List*",
          "dynamodb:DescribeReservedCapacity*",
          "dynamodb:DescribeLimits",
          "dynamodb:DescribeTimeToLive",
        ],
        Resource: "*",
      },
      {
        Sid: "SpecificTable",
        Effect: "Allow",
        Action: [
          "dynamodb:BatchGet*",
          "dynamodb:DescribeStream",
          "dynamodb:DescribeTable",
          "dynamodb:Get*",
          "dynamodb:Query",
          "dynamodb:Scan",
          "dynamodb:BatchWrite*",
          "dynamodb:CreateTable",
          "dynamodb:DeleteItem",
          "dynamodb:Update*",
          "dynamodb:PutItem",
        ],
        Resource: [
          // todo: make these env-specific
          `arn:aws:dynamodb:*:*:table/apollo_*`,
          `arn:aws:dynamodb:*:*:table/prod_apollo_device_communication_logs`,
          `arn:aws:dynamodb:*:*:table/stg_apollo_device_communication_logs`,
        ],
      },
      {
        Effect: "Allow",
        Action: ["s3:ListBucket", "s3:GetObject", "s3:PutObject", "s3:DeleteObject"],
        Resource: [
          `arn:aws:s3:::${config.apolloServiceUserS3BucketName}/*`,
          `arn:aws:s3:::${config.apolloServiceUserS3BucketName}`,
        ],
      },
    ],
  },
})

const user = new User("apollo-service", {
  name: interpolate`apollo-service-${environment}`,
  path: "/service/",
})

const policyAttachment = new UserPolicyAttachment(`apollo-service`, {
    user: user,
    policyArn: policy.arn,
})

export const apolloServiceIam = {
  user,
  policyAttachment,
}

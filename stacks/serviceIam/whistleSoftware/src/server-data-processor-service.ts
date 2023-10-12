import { Policy, User, UserPolicyAttachment } from "@pulumi/aws/iam"
import { interpolate } from "@pulumi/pulumi"
import { config, environment, whistleProjectSetupStackReference } from "../config"

const policy = new Policy("server-data-processor-dynamodb", {
  name: interpolate`server-data-processor-dynamodb-${environment}`,
  policy: {
    Version: "2012-10-17",
    Statement: [
      {
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
        Effect: "Allow",
        Action: [
          "dynamodb:BatchGet*",
          "dynamodb:DescribeStream",
          "dynamodb:DescribeTable",
          "dynamodb:Get*",
          "dynamodb:Query",
          "dynamodb:Scan",
          "dynamodb:BatchWrite*",
          "dynamodb:DeleteItem",
          "dynamodb:Update*",
          "dynamodb:PutItem",
        ],
        Resource: config.serverDataProcessor.dynamodbTableNames.map((n) => `arn:aws:dynamodb:*:*:table/${n}`),
      },
    ],
  },
})

const user = new User("server-data-processor-service", {
  name: interpolate`server-data-processor-service-${environment}`,
  path: "/service/",
})

const policyAttachments = ["safeS3FullAccessPolicyArn"]
  .map(
    (policyName) =>
      new UserPolicyAttachment(`server-data-processor-service-${policyName}`, {
        user: user,
        policyArn: whistleProjectSetupStackReference.getOutput(policyName),
      })
  )
  .concat([
    new UserPolicyAttachment(`server-data-processor-service-dynamodb`, {
      user: user,
      policyArn: policy.arn,
    }),
  ])

export const serverDataProcessorServiceIam = {
  user,
  policyAttachments,
}

import { Policy, User, UserPolicyAttachment } from "@pulumi/aws/iam"
import { interpolate } from "@pulumi/pulumi"
import { environment, whistleProjectSetupStackReference } from "../config"

const policy = new Policy("server-dynamodb", {
  name: interpolate`server-dynamodb-${environment}`,
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
        Resource: interpolate`arn:aws:dynamodb:*:*:table/server_${environment}_*`,
      },
    ],
  },
})

const user = new User("server-service", {
  name: interpolate`server-service-${environment}`,
  path: '/service/',
})

const policyAttachments = [
  'snsFullAccessPolicyArn',
  'safeS3FullAccessPolicyArn',
].map(
  (policyName) =>
    new UserPolicyAttachment(`server-service-${policyName}`, {
      user: user,
      policyArn: whistleProjectSetupStackReference.getOutput(policyName),
    })
).concat([
  new UserPolicyAttachment(`server-service-server-dynamodb`, {
    user: user,
    policyArn: policy.arn,
  })
])

export const serverServiceIam = {
  user,
  policyAttachments,
}

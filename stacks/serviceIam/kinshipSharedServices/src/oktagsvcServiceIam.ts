import { AccessKey, Policy, User, UserPolicyAttachment } from "@pulumi/aws/iam"
import { interpolate } from "@pulumi/pulumi"
import { environment } from "./environment"

const policy = new Policy("ok-tag-svc", {
  name: interpolate`ok-tag-svc-${environment}`,
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
          "dynamodb:DeleteItem",
        ],
        Resource: [
          `arn:aws:dynamodb:*:*:table/ok-tag-svc-${environment}/*`,
          `arn:aws:dynamodb:*:*:table/ok-tag-svc-${environment}`,
        ],
      },
    ],
  },
})

const user = new User("ok-tag-svc", {
  name: interpolate`ok-tag-svc-${environment}`,
  path: "/service/",
})

const policyAttachment = new UserPolicyAttachment(`ok-tag-svc`, {
  user: user,
  policyArn: policy.arn,
})

const accessKey = new AccessKey("ok-tag-svc", {
  user: user.name,
})

export const oktagsvcServiceIam = {
  user,
  policyAttachment,
  accessKey,
}

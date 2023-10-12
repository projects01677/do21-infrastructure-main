import { AccessKey, Policy, User, UserPolicyAttachment } from "@pulumi/aws/iam"
import { interpolate } from "@pulumi/pulumi"
import { environment } from "./environment"

const policy = new Policy("ok-note-svc", {
  name: interpolate`ok-note-svc-${environment}`,
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
          `arn:aws:dynamodb:*:*:table/ok-note-svc-${environment}/*`,
          `arn:aws:dynamodb:*:*:table/ok-note-svc-${environment}`,
        ],
      },
    ],
  },
})

const user = new User("ok-note-svc", {
  name: interpolate`ok-note-svc-${environment}`,
  path: "/service/",
})

const policyAttachment = new UserPolicyAttachment(`ok-note-svc`, {
  user: user,
  policyArn: policy.arn,
})

const accessKey = new AccessKey("ok-note-svc", {
  user: user.name,
})

export const oknotesvcServiceIam = {
  user,
  policyAttachment,
  accessKey,
}

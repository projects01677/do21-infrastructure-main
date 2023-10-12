import { AccessKey, Policy, User, UserPolicyAttachment } from "@pulumi/aws/iam"
import { interpolate } from "@pulumi/pulumi"
import { environment } from "./environment"

const serviceName = "the-kin-api"

const policy = new Policy(serviceName, {
  name: interpolate`${serviceName}-${environment}`,
  policy: {
    Version: "2012-10-17",
    Statement: [
      {
        Sid: "VisualEditor0",
        Effect: "Allow",
        Action: [
            "sqs:ListQueues",
        ],
        Resource: "*"
      },
      {
        "Action": [
            "sqs:DeleteMessage",
            "sqs:GetQueueUrl",
            "sqs:ListQueues",
            "sqs:ChangeMessageVisibility",
            "sqs:ReceiveMessage",
            "sqs:SendMessage",
            "sqs:GetQueueAttributes",
            "sqs:ListQueueTags",
            "sqs:ListDeadLetterSourceQueues",
            "sqs:SetQueueAttributes"
        ],
        "Effect": "Allow",
        "Resource": [
            `arn:aws:sqs:us-east-1:275408611384:kintopia-dev-iterable-handler`,
            `arn:aws:sqs:us-east-1:275408611384:kintopia-dev-general-queue.fifo`
        ]
    },
    ],
  },
})

const user = new User(serviceName, {
  name: interpolate`${serviceName}-${environment}`,
  path: "/service/",
})

const policyAttachment = new UserPolicyAttachment(serviceName, {
  user: user,
  policyArn: policy.arn,
})

const accessKey = new AccessKey(serviceName, {
    user: user.name,
  })

export const thekinapiServiceIam = {
  user,
  policyAttachment,
  accessKey
}

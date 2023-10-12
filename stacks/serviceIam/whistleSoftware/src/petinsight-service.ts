import { Policy, User, UserPolicyAttachment } from "@pulumi/aws/iam"
import { interpolate } from "@pulumi/pulumi"
import { environment, whistleProjectSetupStackReference } from "../config"

const policy = new Policy("petinsight", {
  name: interpolate`petinsight-${environment}`,
  policy: {
    Version: "2012-10-17",
    Statement: [
      {
        Effect: "Allow",
        Action: [
          "logs:CreateLogGroup",
          "logs:CreateLogStream",
          "logs:PutLogEvents",
          "logs:DescribeLogStreams",
          "logs:GetLogEvents",
        ],
        Resource: ["arn:aws:logs:*:*:*"],
      },
      {
        Effect: "Allow",
        Action: ["ecs:DescribeTasks", "ecs:ListTaskDefinitions", "ecs:DescribeTaskDefinition"],
        Resource: "*",
      },
      {
        Effect: "Allow",
        Action: ["ecs:RunTask"],
        Resource: "arn:aws:ecs:us-east-1:*:task-definition/petinsight_*",
      },
    ],
  },
})

const user = new User("petinsight-service", {
  name: interpolate`petinsight-service-${environment}`,
  path: "/service/",
})

const policyAttachments = ["safeS3FullAccessPolicyArn"]
  .map(
    (policyName) =>
      new UserPolicyAttachment(`petinsight-service-${policyName}`, {
        user: user,
        policyArn: whistleProjectSetupStackReference.getOutput(policyName),
      })
  )
  .concat([
    new UserPolicyAttachment(`petinsight-service`, {
      user: user,
      policyArn: policy.arn,
    }),
  ])

export const petinsightServiceIam = {
  user,
  policyAttachments,
}

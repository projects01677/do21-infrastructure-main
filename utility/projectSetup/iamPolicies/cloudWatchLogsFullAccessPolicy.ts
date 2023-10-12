import { Policy } from "@pulumi/aws/iam"

export const cloudWatchLogsFullAccessPolicy = new Policy("cloudWatchLogsFullAccess", {
  name: "cloudWatchLogsFullAccess",
  policy: {
    Version: "2012-10-17",
    Statement: [
      {
        Effect: "Allow",
        Action: "logs:*",
        Resource: "*",
      },
    ]
  }
})

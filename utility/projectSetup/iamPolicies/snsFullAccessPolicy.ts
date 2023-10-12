import { Policy } from "@pulumi/aws/iam"

export const snsFullAccessPolicy = new Policy("snsFullAccessPolicy", {
  name: "snsFullAccess",
  policy: {
    Version: "2012-10-17",
    Statement: [
      {
        Effect: "Allow",
        Action: "sns:*",
        Resource: "*",
      },
    ]
  }
})

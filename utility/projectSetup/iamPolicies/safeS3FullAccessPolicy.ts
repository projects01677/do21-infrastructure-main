import { Policy } from "@pulumi/aws/iam"

export const safeS3FullAccessPolicy = new Policy("safeS3FullAccessPolicy", {
  name: "safeS3FullAccess",
  policy: {
    Version: "2012-10-17",
    Statement: [
      {
        Effect: "Allow",
        Action: "s3:*",
        Resource: "*",
      },
      {
        Effect: "Deny",
        Action: "s3:DeleteBucket",
        Resource: "arn:aws:s3:::*",
      }
    ]
  }
})

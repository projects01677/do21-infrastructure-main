import { PolicyStatement } from "@pulumi/aws/iam"

export const rdsExportPolicy = (
  bucketNamePrefix: string
): Array<PolicyStatement> => [
  {
    Sid: "ExportPolicy",
    Effect: "Allow",
    Action: [
      "s3:PutObject*",
      "s3:ListBucket",
      "s3:GetObject*",
      "s3:DeleteObject*",
      "s3:GetBucketLocation"
    ],
    Resource: "*",
  },
  {
    Sid: "AllowAllOnPrefix",
    Effect: "Allow",
    Action: ["s3:*"],
    Resource: [
      `arn:aws:s3:::${bucketNamePrefix}`,
      `arn:aws:s3:::${bucketNamePrefix}/*`,
    ],
  },
]

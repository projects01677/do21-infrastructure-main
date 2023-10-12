import { PolicyStatement } from "@pulumi/aws/iam"
import { awsAccountId } from "../../awsAccountId"
import { Alias, Key } from "@pulumi/aws/kms"
import { Projects } from "../../../stacks/userConfig"
import { interpolate } from "@pulumi/pulumi"

export const manageRdsSnapshots = (
  bucketName: string,
  rdsInstanceName: string,
  rdsExportRole: string
): Array<PolicyStatement> => [
  {
    Sid: "AllowOnAllS3Resources",
    Effect: "Allow",
    Action: ["s3:ListAllMyBuckets"],
    Resource: "*",
  },
  {
    Sid: "ListObjectsInBucket",
    Effect: "Allow",
    Action: ["s3:ListBucket"],
    Resource: [`arn:aws:s3:::${bucketName}`],
  },
  {
    Sid: "AllObjectActions",
    Effect: "Allow",
    Action: ["s3:*Object"],
    Resource: [`arn:aws:s3:::${bucketName}/*`],
  },
  {
    Sid: "AllowDeleteSnapshotOnPreifx",
    Effect: "Allow",
    Action: ["rds:AddTagsToResource", "rds:DeleteDBSnapshot"],
    Resource: [`arn:*:rds:*:*:snapshot:${rdsInstanceName}-*`],
    Condition: {
      StringEqualsIgnoreCase: {
        "rds:snapshot-tag/Owner": "${aws:username}",
      },
    },
  },
  {
    Sid: "AllowCreateSnapshotOnPreifx",
    Effect: "Allow",
    Action: ["rds:ListTagsForResource", "rds:CreateDBSnapshot"],
    Resource: [
      `arn:*:rds:*:*:snapshot:${rdsInstanceName}-*`,
      `arn:*:rds:*:*:db:${rdsInstanceName}-*`,
    ],
  },
  {
    Sid: "AllowOnAllSnapshots",
    Effect: "Allow",
    Action: ["rds:DescribeDBSnapshots", "rds:StartExportTask"],
    Resource: "*",
  },
  {
    Sid: "AllowPassRole",
    Effect: "Allow",
    Action: ["iam:GetRole", "iam:PassRole"],
    Resource: interpolate`arn:aws:iam::${awsAccountId()}:role/${rdsExportRole}`,
  },
]

export const kmsKeyForSnapshots = (
  projectName: Projects,
  roleArn: string
) => {
  const kmsKey = new Key(`pulumi-${projectName}-rds-export`, {
    description: `Secrets encryption key for ${projectName} service to export snapshots`,
    customerMasterKeySpec: "SYMMETRIC_DEFAULT",
    policy: awsAccountId().then((id) => JSON.stringify({
      Version: "2012-10-17",
      Statement: [
        {
          Effect: "Allow",
          Principal: {
            AWS: `arn:aws:iam::${id}:root`,
          },
          Action: "kms:*",
          Resource: "*",
        },
        {
          Effect: "Allow",
          Principal: {
            AWS: roleArn,
          },
          Action: [
            "kms:Encrypt",
            "kms:Decrypt",
            "kms:ReEncrypt*",
            "kms:GenerateDataKey*",
            "kms:CreateGrant",
            "kms:DescribeKey",
            "kms:RetireGrant",
          ],
          Resource: "*",
        },
      ],
    })),
  })

  const kmsAlias = new Alias(`pulumi-${projectName}-rds-export`, {
    name: `alias/pulumi-${projectName}-rds-export`,
    targetKeyId: kmsKey.id,
  })
}

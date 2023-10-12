import { Policy } from "@pulumi/aws/iam"

export const safeAdministratorAccessPolicy = new Policy("safeAdministratorAccess", {
  name: "safeAdministratorAccess",
  policy: {
    Version: "2012-10-17",
    Statement: [
      {
        Effect: "Allow",
        Action: "*",
        Resource: "*",
      },
      {
        Effect: "Deny",
        Action: "ec2:ReleaseAddress",
        Resource: "*",
      },
      {
        Effect: "Deny",
        Action: "ec2:*",
        Resource: "*",
        Condition: {
          StringNotEquals: {
            "aws:RequestedRegion": ["us-east-2", "us-east-1"],
          },
        },
      },
      {
        Effect: "Deny",
        Action: "ec2:RunInstances",
        Resource: "*",
        Condition: {
          StringEquals: {
            "ec2:InstanceType": [
              "x1.*",
              "t3.2xlarge",
              "t2.2xlarge",
              "r4.*",
              "r3.*",
              "p2.*",
              "i3.*",
              "g3.*",
              "f1.*",
              "d2.*",
              "c4.8xlarge",
              "c4.4xlarge",
              "c4.2xlarge",
              "c3.*",
            ],
          },
        },
      },
      {
        Effect: "Deny",
        Action: "dynamodb:DeleteTable",
        NotResource: "arn:aws:dynamodb:*:*:table/whistle-terraform-state",
      },
      {
        Effect: "Deny",
        Action: "s3:DeleteBucket",
        Resource: "arn:aws:s3:::*",
      },
      {
        Effect: "Deny",
        Action: ["rds:DeleteDBInstance", "rds:DeleteDBClusterSnapshot", "rds:DeleteDBCluster"],
        Resource: "arn:aws:rds:*",
      },
      {
        Effect: "Deny",
        Action: [
          "redshift:DeleteTags",
          "redshift:DeleteHsmConfiguration",
          "redshift:DeleteHsmClientCertificate",
          "redshift:DeleteEventSubscription",
          "redshift:DeleteClusterSubnetGroup",
          "redshift:DeleteClusterSnapshot",
          "redshift:DeleteClusterSecurityGroup",
          "redshift:DeleteClusterParameterGroup",
          "redshift:DeleteCluster",
        ],
        Resource: "arn:aws:redshift:*",
      },
      {
        Effect: "Deny",
        Action: ["elasticache:DeleteSnapshot", "elasticache:DeleteCacheCluster"],
        Resource: "*",
      },
    ],
  },
})

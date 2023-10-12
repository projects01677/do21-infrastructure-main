import { Policy, PolicyAttachment, User } from "@pulumi/aws/iam"

const policy = new Policy("airbuddiesAirflowPolicy", {
  policy: {
    Version: "2012-10-17",
    Statement: [
      {
        Effect: "Allow",
        Action: "airflow:*",
        Resource: "*",
      },
      {
        Effect: "Allow",
        Action: ["iam:CreateServiceLinkedRole"],
        Resource: [
          "arn:aws:iam::*:role/aws-service-role/airflow.amazonaws.com/AWSServiceRoleForAmazonMWAA",
        ],
      },
      {
        Effect: "Allow",
        Action: [
          "iam:CreateRole",
          "iam:GetRole",
          "iam:PutRolePolicy",
          "iam:GetRolePolicy",
          "iam:DeleteRolePolicy",
          "iam:ListRolePolicies",
          "iam:ListAttachedRolePolicies",
          "iam:ListInstanceProfilesForRole",
          "iam:DeleteRole",
        ],
        Resource: ["arn:aws:iam::*:role/AmazonMWAA-airbuddies-*"],
      },
      {
        Effect: "Allow",
        Action: ["iam:AttachGroupPolicy", "iam:DetachGroupPolicy"],
        Resource: ["arn:aws:iam::*:group/device_analytics"],
      },
      {
        Effect: "Allow",
        Action: [
          "iam:CreatePolicy",
          "iam:CreatePolicyVersion",
          "iam:GetPolicy",
          "iam:GetPolicyVersion",
          "iam:ListPolicyVersions",
          "iam:DeletePolicyVersion",
          "iam:DeletePolicy",
          "iam:ListEntitiesForPolicy",
        ],
        Resource: [
          "arn:aws:iam::*:policy/airflow_airbuddies*",
          "arn:aws:iam::*:policy/airflow-airbuddies*",
        ],
      },
      {
        Effect: "Allow",
        Action: [
          "ec2:CreateSecurityGroup",
          "ec2:DeleteSecurityGroup",
          "ec2:AuthorizeSecurityGroupIngress",
          "ec2:AuthorizeSecurityGroupEgress",
          "ec2:ApplySecurityGroupsToClientVpnTargetNetwork",
          "ec2:CreateTags",
          "ec2:RevokeSecurityGroupEgress",
          "ec2:RevokeSecurityGroupIngress",
        ],
        Resource: "*",
        Condition: {
          "ForAllValues:StringEquals": {
            "aws:TagKeys": ["airbuddies"],
          },
        },
      },
      {
        Effect: "Allow",
        Action: [
          "ec2:DescribeSecurityGroups",
          "ec2:DescribeSubnets",
          "ec2:DescribeVpc*",
        ],
        Resource: "*",
      },
      {
        Effect: "Allow",
        Action: [
          "kms:ListGrants",
          "kms:CreateGrant",
          "kms:RevokeGrant",
          "kms:Decrypt",
          "kms:Encrypt",
          "kms:GenerateDataKey*",
          "kms:ReEncrypt*",
        ],
        Resource: "arn:aws:kms:::key/airflow-airbuddies-*",
      },
      {
        Effect: "Allow",
        Action: [
          "kms:CreateKey",
          "kms:DescribeKey",
          "kms:GetKeyPolicy",
          "kms:GetKeyRotationStatus",
          "kms:ListResourceTags",
          "kms:CreateAlias",
          "kms:ListAliases",
        ],
        Resource: "*",
        Condition: {
          "ForAllValues:StringEquals": {
            "aws:TagKeys": ["airbuddies"],
          },
        },
      },
      {
        Effect: "Allow",
        Action: ["kms:DeleteAlias", "kms:ScheduleKeyDeletion"],
        Resource: "*",
        Condition: {
          "ForAllValues:StringEquals": {
            "aws:TagKeys": ["airbuddies"],
          },
        },
      },
      {
        Effect: "Allow",
        Action: ["iam:PassRole"],
        Resource: "*",
        Condition: {
          StringLike: {
            "iam:PassedToService": "airflow.amazonaws.com",
          },
        },
      },
      {
        Effect: "Allow",
        Action: ["s3:*"],
        Resource: ["arn:aws:s3:::airflow-airbuddies-*"],
      },
      {
        Effect: "Allow",
        Action: "ec2:CreateVpcEndpoint",
        Resource: [
          "arn:aws:ec2:*:*:vpc-endpoint/*",
          "arn:aws:ec2:*:*:vpc/*",
          "arn:aws:ec2:*:*:subnet/*",
          "arn:aws:ec2:*:*:security-group/*",
        ],
      },
      {
        Effect: "Allow",
        Action: ["ec2:CreateNetworkInterface"],
        Resource: [
          "arn:aws:ec2:*:*:subnet/*",
          "arn:aws:ec2:*:*:network-interface/*",
        ],
      },
      {
        Effect: "Allow",
        Action: ["ec2:DescribeNetworkInterfaces"],
        Resource: ["*"],
      },
      {
        Effect: "Allow",
        Action: ["s3:ListBucket"],
        Resource: ["arn:aws:s3:::whistle-pulumi-state"],
      },
      {
        Effect: "Allow",
        Action: ["s3:*Object"],
        Resource: [
          "arn:aws:s3:::whistle-pulumi-state/.pulumi/stacks/airbuddies*",
          "arn:aws:s3:::whistle-pulumi-state/.pulumi/history/airbuddies*",
          "arn:aws:s3:::whistle-pulumi-state/.pulumi/backups/airbuddies*",
        ],
      },
      {
        Action: ["ssm:GetParameter"],
        Effect: "Allow",
        Resource: ["arn:aws:ssm:*:*:parameter/pulumi/*"],
      },
    ],
  },
})

const user = new User("airbuddiesCicdUser", {
  name: "airbuddies-cicd",
  path: '/service/',
})

const policyAttachment = new PolicyAttachment(
  "airbuddiesAirflowPolicyAttachment",
  {
    users: [user],
    policyArn: policy.arn,
  }
)

export const airbuddiesCicdIam = {
  user,
  policyAttachment,
}
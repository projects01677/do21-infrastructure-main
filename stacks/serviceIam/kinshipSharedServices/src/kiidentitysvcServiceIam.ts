import { AccessKey, Policy, User, UserPolicyAttachment } from "@pulumi/aws/iam"
import { interpolate } from "@pulumi/pulumi"
import { environment } from "./environment"

const policy = new Policy("ki-identity-svc", {
  name: interpolate`ki-identity-svc-${environment}`,
  policy: {
    Version: "2012-10-17",
    Statement: [
      {
        Sid: "AllowOnAllS3Resources",
        Effect: "Allow",
        Action: [
            "s3:ListStorageLensConfigurations",
            "s3:ListAccessPointsForObjectLambda",
            "s3:GetAccessPoint",
            "s3:PutAccountPublicAccessBlock",
            "s3:GetAccountPublicAccessBlock",
            "s3:ListAllMyBuckets",
            "s3:ListAccessPoints",
            "s3:ListJobs",
            "s3:PutStorageLensConfiguration",
            "s3:ListMultiRegionAccessPoints",
            "s3:CreateJob"
        ],
        Resource: "*"
      },
      {
        Sid: "AllowAllOnProjectPrefix",
        Effect: "Allow",
        Action: ["s3:*"],
        Resource: [
          `arn:aws:s3:::ki-identity-svc-*`,
          `arn:aws:s3:::ki-identity-svc-*/*`,
        ]
      },
    ],
  },
})

const user = new User("ki-identity-svc", {
  name: interpolate`ki-identity-svc-${environment}`,
  path: "/service/",
})

const policyAttachment = new UserPolicyAttachment(`ki-identity-svc`, {
  user: user,
  policyArn: policy.arn,
})

const accessKey = new AccessKey("ki-identity-svc", {
  user: user.name,
})

export const kiidentitysvcServiceIam = {
  user,
  policyAttachment,
  accessKey,
}

import { AccessKey, Policy, User, UserPolicyAttachment } from "@pulumi/aws/iam"
import { interpolate } from "@pulumi/pulumi"
import { environment } from "./environment"
import { kafkaClusterAdmin } from "../../../../utility/projectSetup/utils/iamPermissions"

const policy = new Policy("ok-user-profile-service", {
  name: interpolate`ok-user-profile-service-${environment}`,
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
          `arn:aws:s3:::kinshipid-*`,
          `arn:aws:s3:::kinshipid-*/*`,
        ]
      },
      ...kafkaClusterAdmin("kinship-kafka", environment)
    ],
  },
})

const user = new User("ok-user-profile-service", {
  name: interpolate`ok-user-profile-service-${environment}`,
  path: "/service/",
})

const policyAttachment = new UserPolicyAttachment(`ok-user-profile-service`, {
  user: user,
  policyArn: policy.arn,
})

const accessKey = new AccessKey("ok-user-profile-service", {
  user: user.name,
})

export const okuserprofilesvcServiceIam = {
  user,
  policyAttachment,
  accessKey,
}

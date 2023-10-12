import { AccessKey, Policy, User, UserPolicyAttachment } from "@pulumi/aws/iam"
import { interpolate } from "@pulumi/pulumi"
import { environment } from "./environment"
import { awsAccountId } from "../../../../utility/awsAccountId"

const serviceName = "aap-rehome-svc"

const policy = new Policy(serviceName, {
  name: interpolate`${serviceName}-${environment}`,
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
          "s3:CreateJob",
        ],
        Resource: "*",
      },
      {
        Sid: "AllowAllOnProjectPrefix",
        Effect: "Allow",
        Action: ["s3:*"],
        Resource: [
          `arn:aws:s3:::${serviceName}-*`,
          `arn:aws:s3:::${serviceName}-*/*`,
        ],
      },
      {
        Sid: "AllowSendEmail",
        Effect: "Allow",
        Action: ["ses:SendEmail", "ses:SendRawEmail"],
        Resource: [
          interpolate`arn:aws:ses:us-east-1:${awsAccountId()}:identity/adoptapet.com`,
          interpolate`arn:aws:ses:us-east-1:${awsAccountId()}:configuration-set/Rehome`,
        ],
      },
    ],
  },
})

const user = new User(serviceName, {
  name: interpolate`${serviceName}-${environment}`,
  path: "/service/",
})

const policyAttachment = new UserPolicyAttachment(serviceName, {
  user: user,
  policyArn: policy.arn,
})

const accessKey = new AccessKey(serviceName, {
  user: user.name,
})

export const aaprehomesvcServiceIam = {
  user,
  policyAttachment,
  accessKey,
}

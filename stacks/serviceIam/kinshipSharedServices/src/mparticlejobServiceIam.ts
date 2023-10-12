import { AccessKey, Policy, User, UserPolicyAttachment } from "@pulumi/aws/iam"
import { interpolate } from "@pulumi/pulumi"
import { awsAccountId } from "../../../../utility/awsAccountId"
import { environment } from "./environment"

const policy = new Policy("mparticlejob-service", {
  name: interpolate`mparticlejob-service-${environment}`,
  policy: {
    Version: "2012-10-17",
    Statement: [
      {
        Effect: "Allow",
        Action: ["kafka-cluster:Connect", "kafka-cluster:DescribeCluster"],
        Resource: [
          interpolate`arn:aws:kafka:*:${awsAccountId()}:cluster/userinfoproducer-${environment}/*`,
        ],
      },
      {
        Effect: "Allow",
        Action: ["kafka-cluster:*Topic*", "kafka-cluster:WriteData*", "kafka-cluster:ReadData*"],
        Resource: [interpolate`arn:aws:kafka:*:${awsAccountId()}:topic/userinfoproducer-${environment}/*`],
      },
      {
        Effect: "Allow",
        Action: ["kafka-cluster:AlterGroup", "kafka-cluster:DescribeGroup"],
        Resource: [interpolate`arn:aws:kafka:*:${awsAccountId()}:group/userinfoproducer-${environment}/*`],
      },
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
          `arn:aws:s3:::mparticlejob-*`,
          `arn:aws:s3:::mparticlejob-*/*`,
        ]
      },
    ],
  },
})

const user = new User("mparticlejob-service", {
  name: interpolate`mparticlejob-service-${environment}`,
  path: "/service/",
})

const policyAttachment = new UserPolicyAttachment(`mparticlejob-service`, {
  user: user,
  policyArn: policy.arn,
})

const accessKey = new AccessKey("mparticlejob-service", {
  user: user.name,
})

export const mparticlejobServiceIam = {
  user,
  policyAttachment,
  accessKey,
}

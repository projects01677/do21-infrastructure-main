import { AccessKey, Policy, User, UserPolicyAttachment } from "@pulumi/aws/iam"
import { interpolate } from "@pulumi/pulumi"
import { awsAccountId } from "../../../../utility/awsAccountId"
import { environment } from "./environment"

const policy = new Policy("userinfoconsumer-service", {
  name: interpolate`userinfoconsumer-service-${environment}`,
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
    ],
  },
})

const user = new User("userinfoconsumer-service", {
  name: interpolate`userinfoconsumer-service-${environment}`,
  path: "/service/",
})

const accessKey = new AccessKey("userinfoconsumer-service", {
  user: user.name,
})

const policyAttachment = new UserPolicyAttachment(`userinfoconsumer-service`, {
  user: user,
  policyArn: policy.arn,
})

export const userinfoconsumerServiceIam = {
  user,
  policyAttachment,
  accessKey,
}

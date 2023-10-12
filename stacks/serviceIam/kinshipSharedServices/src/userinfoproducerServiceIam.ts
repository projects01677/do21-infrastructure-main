import { AccessKey, Policy, User, UserPolicyAttachment } from "@pulumi/aws/iam"
import { interpolate } from "@pulumi/pulumi"
import { awsAccountId } from "../../../../utility/awsAccountId"
import { environment } from "./environment"

const policy = new Policy("userinfoproducer-service", {
  name: interpolate`userinfoproducer-service-${environment}`,
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

const user = new User("userinfoproducer-service", {
  name: interpolate`userinfoproducer-service-${environment}`,
  path: "/service/",
})

const accessKey = new AccessKey("userinfoproducer-service", {
  user: user.name,
})

const policyAttachment = new UserPolicyAttachment(`userinfoproducer-service`, {
  user: user,
  policyArn: policy.arn,
})

export const userinfoproducerServiceIam = {
  user,
  policyAttachment,
  accessKey,
}

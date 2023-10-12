import { AccessKey, Policy, User, UserPolicyAttachment } from "@pulumi/aws/iam"
import { interpolate } from "@pulumi/pulumi"
import { environment } from "./environment"
import { kafkaClusterAdmin } from "../../../../utility/projectSetup/utils/iamPermissions"

const serviceName = "ok-subscription-core-svc"

const policy = new Policy(serviceName, {
  name: interpolate`${serviceName}-${environment}`,
  policy: {
    Version: "2012-10-17",
    Statement: [
      ...kafkaClusterAdmin("kinship-kafka", environment)
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

export const oksubscriptioncoresvcServiceIam = {
  user,
  policyAttachment,
  accessKey,
}

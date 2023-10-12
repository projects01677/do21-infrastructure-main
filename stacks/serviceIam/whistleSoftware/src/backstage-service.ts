import { Policy, User, UserPolicyAttachment } from "@pulumi/aws/iam"
import { interpolate } from "@pulumi/pulumi"
import { ekslistAndDescribe } from "../../../../utility/projectSetup/utils/iamPermissions"
import { environment } from "../config"

const policy = new Policy("backstage-service", {
  name: interpolate`backstage-service-${environment}`,
  policy: {
    Version: "2012-10-17",
    Statement: [ekslistAndDescribe],
  },
})

const user = new User("backstage-service", {
  name: interpolate`backstage-service-${environment}`,
  path: "/service/",
})

const policyAttachment = new UserPolicyAttachment(`backstage-service`, {
  user: user,
  policyArn: policy.arn,
})

export const backstageServiceIam = {
  user,
  policyAttachment,
}

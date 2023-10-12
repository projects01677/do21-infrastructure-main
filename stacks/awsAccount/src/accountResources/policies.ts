import { Policy } from "@pulumi/aws/iam"
import { ekslistAndDescribe } from "../../../../utility/projectSetup/utils/iamPermissions"
import { provider } from "../awsAccount"

export const eksReadOnlyPolicy = new Policy(
  "eks-read-only",
  {
    name: "eks-read-only",
    policy: {
      Version: "2012-10-17",
      Statement: [ekslistAndDescribe],
    },
  },
  { provider: provider }
)

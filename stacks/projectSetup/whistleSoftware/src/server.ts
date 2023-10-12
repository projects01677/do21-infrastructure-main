import { UserPolicyAttachment } from "@pulumi/aws/iam"
import { safeAdministratorAccessPolicy } from "../../../../utility/projectSetup/iamPolicies/safeAdministratorAccessPolicy"
import {
  ekslistAndDescribe,
  readAllPulumiSsmOutputs,
  readWriteEcr,
  readWritePulumiStateAndSsm
} from "../../../../utility/projectSetup/utils/iamPermissions"
import { projectSetup } from "../../../../utility/projectSetup/utils/projectSetup"

const projectName = "server"
export const serverProject = projectSetup({
  projectName,
  cicdUserPermissions: [
    ...readWriteEcr(`whistle/${projectName}`),
    ...readWriteEcr("whistle/newrelic-stats"),
    ...readWritePulumiStateAndSsm("whistle-pulumi-state", projectName),
    readAllPulumiSsmOutputs,
    ekslistAndDescribe,
    {
      Effect: "Allow",
      Action: ["s3:ListBucket"],
      Resource: ["arn:aws:s3:::whistle-terraform-registry-us-east-1"],
    },
    {
      Effect: "Allow",
      Action: ["s3:*Object"],
      Resource: [
        "arn:aws:s3:::whistle-terraform-registry-us-east-1/server_*",
      ],
    },
  ],
})

// todo: Replace this with more restricted permissions when we don't need to run Covalence from the infrastructure repo
const adminPolicyAttachmentForCovalence = new UserPolicyAttachment(`server-cicd-safe-admin-access`, {
  user: serverProject.cicdUser,
  policyArn: safeAdministratorAccessPolicy.arn,
})

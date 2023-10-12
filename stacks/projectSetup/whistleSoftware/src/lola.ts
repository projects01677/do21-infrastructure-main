import { UserPolicyAttachment } from "@pulumi/aws/iam"
import { safeAdministratorAccessPolicy } from "../../../../utility/projectSetup/iamPolicies/safeAdministratorAccessPolicy"
import {
  adminDynamodbTable,
  ekslistAndDescribe,
  readAllPulumiSsmOutputs,
  readWriteEcr,
  readWritePulumiStateAndSsm
} from "../../../../utility/projectSetup/utils/iamPermissions"
import { projectSetup } from "../../../../utility/projectSetup/utils/projectSetup"

const projectName = "lola"

export const lolaProject = projectSetup({
  projectName,
  cicdUserPermissions: [
    ...readWriteEcr("whistle/lola"),
    ...readWritePulumiStateAndSsm("whistle-pulumi-state", projectName),
    ...adminDynamodbTable("apollo_*"),
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
        "arn:aws:s3:::whistle-pulumi-state/.pulumi/stacks/apollo*",
        "arn:aws:s3:::whistle-pulumi-state/.pulumi/history/apollo*",
        "arn:aws:s3:::whistle-pulumi-state/.pulumi/backups/apollo*",
        "arn:aws:s3:::whistle-pulumi-state/.pulumi/stacks/dingo*",
        "arn:aws:s3:::whistle-pulumi-state/.pulumi/history/dingo*",
        "arn:aws:s3:::whistle-pulumi-state/.pulumi/backups/dingo*",
        "arn:aws:s3:::whistle-terraform-registry-us-east-1/lola_*",
      ],
    },
  ],
})

// todo: Replace this with more restricted permissions when we don't need to run Covalence from the infrastructure repo
const adminPolicyAttachmentForCovalence = new UserPolicyAttachment(`lola-cicd-safe-admin-access`, {
  user: lolaProject.cicdUser,
  policyArn: safeAdministratorAccessPolicy.arn,
})

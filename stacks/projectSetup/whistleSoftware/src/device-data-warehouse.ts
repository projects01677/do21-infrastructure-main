import { UserPolicyAttachment } from "@pulumi/aws/iam"
import { safeAdministratorAccessPolicy } from "../../../../utility/projectSetup/iamPolicies/safeAdministratorAccessPolicy"
import {
  readWriteEcr,
  readWriteTerraformState,
  readAllPulumiSsmOutputs,
  adminGlue,
  adminS3Bucket
} from "../../../../utility/projectSetup/utils/iamPermissions"
import { projectSetup } from "../../../../utility/projectSetup/utils/projectSetup"

const projectName = "device-data-warehouse"
export const deviceDataWarehouseProject = projectSetup({
  projectName,
  cicdUserPermissions: [
    ...readWriteEcr(`whistle/${projectName}`),
    ...readWriteTerraformState("whistle-terraform-state-us-east-1", projectName),
    ...adminGlue(projectName),
    ...adminS3Bucket(projectName),
    readAllPulumiSsmOutputs,
  ],
})

// todo: Replace this with more restricted permissions when we don't need to run Covalence from the infrastructure repo
const adminPolicyAttachmentForCovalence = new UserPolicyAttachment(`device-data-warehouse-cicd-safe-admin-access`, {
  user: deviceDataWarehouseProject.cicdUser,
  policyArn: safeAdministratorAccessPolicy.arn,
})

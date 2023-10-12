import { UserPolicyAttachment } from "@pulumi/aws/iam"
import {
  readWriteEcr,
} from "../../../../utility/projectSetup/utils/iamPermissions"
import { projectSetup } from "../../../../utility/projectSetup/utils/projectSetup"

const projectName = "newrelic-stats"
export const newrelicStatsProject = projectSetup({
  projectName,
  cicdUserPermissions: [
    ...readWriteEcr(`whistle/${projectName}`),
    {
      Effect: "Allow",
      Action: ["s3:ListBucket"],
      Resource: ["arn:aws:s3:::whistle-terraform-registry-us-east-1"],
    },
  ],
})

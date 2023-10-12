import {
  adminS3Bucket,
} from "../../../../utility/projectSetup/utils/iamPermissions"
import { projectSetup } from "../../../../utility/projectSetup/utils/projectSetup"
import * as aws from "@pulumi/aws"

const projectName = "api-automation-postman"

const apiAutomationProject = projectSetup({
  projectName,
  cicdUserPermissions: [
    ...adminS3Bucket(projectName),
  ],
})

const apiAutomationBucket = new aws.s3.Bucket(
  `${projectName}-reports`,
  {
    bucket: `${projectName}-reports`,
    acl: "public-read",
    lifecycleRules: [
      {
        enabled: true,
        id: `Default rule for ${projectName} bucket`,
        expiration: {
          days: 90
        },
      },
    ],
    tags: {
      "project": projectName,
    }
  },
)

export const apiAutomationProjectResources = [
  apiAutomationProject,
  apiAutomationBucket
]

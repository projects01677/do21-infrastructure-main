import {
  readAllPulumiSsmOutputs,
  readWritePulumiStateAndSsm
} from "../../../../utility/projectSetup/utils/iamPermissions"
import { projectSetup } from "../../../../utility/projectSetup/utils/projectSetup"

const projectName = "pearl"

export const pearlProject = projectSetup({
  projectName,
  cicdUserPermissions: [
    ...readWritePulumiStateAndSsm("whistle-pulumi-state", projectName),
    readAllPulumiSsmOutputs,
    {
      Effect: "Allow",
      Action: ["s3:*"],
      Resource: [
        "arn:aws:s3:::whistle-telit-gnss",
        "arn:aws:s3:::whistle-telit-gnss/*"
      ],
    },
  ],
})

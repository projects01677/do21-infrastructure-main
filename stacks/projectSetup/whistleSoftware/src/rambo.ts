import {
  readAllPulumiSsmOutputs,
  readWritePulumiStateAndSsm
} from "../../../../utility/projectSetup/utils/iamPermissions"
import { projectSetup } from "../../../../utility/projectSetup/utils/projectSetup"

const projectName = "rambo"

export const ramboProject = projectSetup({
  projectName,
  cicdUserPermissions: [
    ...readWritePulumiStateAndSsm("whistle-pulumi-state", projectName),
    readAllPulumiSsmOutputs,
    {
      Effect: "Allow",
      Action: ["s3:*"],
      Resource: [
        "arn:aws:s3:::whistle-sony-gnss",
        "arn:aws:s3:::whistle-sony-gnss/W05/*"
      ],
    },
  ],
})

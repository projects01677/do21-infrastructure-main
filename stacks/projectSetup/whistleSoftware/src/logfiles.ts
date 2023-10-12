import {
  adminDynamodbTable,
  ekslistAndDescribe,
  readAllPulumiSsmOutputs,
  readWriteEcr,
  readWritePulumiStateAndSsm
} from "../../../../utility/projectSetup/utils/iamPermissions"
import { projectSetup } from "../../../../utility/projectSetup/utils/projectSetup"

const projectName = "logfiles"

export const logfilesProject = projectSetup({
  projectName,
  cicdUserPermissions: [
    ...readWriteEcr("whistle/logfiles"),
    ...readWritePulumiStateAndSsm("whistle-pulumi-state", projectName),
    ...adminDynamodbTable("logfiles-*"),
    readAllPulumiSsmOutputs,
    ekslistAndDescribe,
  ],
})

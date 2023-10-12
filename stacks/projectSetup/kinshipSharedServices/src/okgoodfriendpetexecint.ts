import {
    adminSQS,
    ekslistAndDescribe,
    readAllPulumiSsmOutputs,
    readWriteEcr,
    readWritePulumiStateAndSsm,
} from "../../../../utility/projectSetup/utils/iamPermissions"
import { projectSetup } from "../../../../utility/projectSetup/utils/projectSetup"
import { pulumiStateBucketName } from "./config"

const projectName = "ok-goodfriend-petexec-int"

export const goodfriendpetexecintProject = projectSetup({
    projectName,
    cicdUserPermissions: [
        ...readWritePulumiStateAndSsm(pulumiStateBucketName, projectName),
        ...adminSQS("ok"),
        readAllPulumiSsmOutputs
    ],
})

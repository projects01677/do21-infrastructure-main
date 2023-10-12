import {
    readAllPulumiSsmOutputs,
    readWriteEcr,
    readWritePulumiStateAndSsm
} from "../../../../utility/projectSetup/utils/iamPermissions"
import { projectSetup } from "../../../../utility/projectSetup/utils/projectSetup"
import { pulumiStateBucketName } from "./config"

const projectName = "marsveterinary"

export const marsveterinaryProject = projectSetup({
    projectName,
    cicdUserPermissions: [
        ...readWriteEcr(`marsveterinary/${projectName}`),
        ...readWritePulumiStateAndSsm(pulumiStateBucketName, projectName),
        readAllPulumiSsmOutputs,
    ],
})

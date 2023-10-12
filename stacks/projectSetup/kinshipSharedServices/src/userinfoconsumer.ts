import {
    ekslistAndDescribe,
    readAllPulumiSsmOutputs,
    readWriteEcr,
    readWritePulumiStateAndSsm
} from "../../../../utility/projectSetup/utils/iamPermissions"
import { projectSetup } from "../../../../utility/projectSetup/utils/projectSetup"
import { pulumiStateBucketName } from "./config"

const projectName = "userinfoconsumer"

export const userinfoconsumerProject = projectSetup({
    projectName,
    cicdUserPermissions: [
        ...readWriteEcr(`kinship-shared-services/${projectName}`),
        ...readWritePulumiStateAndSsm(pulumiStateBucketName, projectName),
        readAllPulumiSsmOutputs,
        ekslistAndDescribe,
    ],
})

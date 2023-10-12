import {
    readAllPulumiSsmOutputs,
    readWriteEcr,
    readWritePulumiStateAndSsm
} from "../../../../utility/projectSetup/utils/iamPermissions"
import { projectSetup } from "../../../../utility/projectSetup/utils/projectSetup"
import { pulumiStateBucketName } from "../../thewildest/src/config"

const projectName = "thewildest"

export const thewildestProject = projectSetup({
    projectName,
    cicdUserPermissions: [
        ...readWriteEcr(`thewildest/${projectName}`),
        ...readWritePulumiStateAndSsm(pulumiStateBucketName, projectName),
        readAllPulumiSsmOutputs,
    ],
})

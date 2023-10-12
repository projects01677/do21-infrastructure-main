import {
    ekslistAndDescribe,
    readAllPulumiSsmOutputs,
    readWriteEcr,
    readWritePulumiStateAndSsm,
    adminS3Bucket,
} from "../../../../utility/projectSetup/utils/iamPermissions"
import { projectSetup } from "../../../../utility/projectSetup/utils/projectSetup"
import { pulumiStateBucketName } from "./config"

const projectName = "singlesignon"

export const singlesignonProject = projectSetup({
    projectName,
    cicdUserPermissions: [
        ...readWriteEcr(`kinship-shared-services/${projectName}`),
        ...readWritePulumiStateAndSsm(pulumiStateBucketName, "password-validation"),
        ...readWritePulumiStateAndSsm(pulumiStateBucketName, "okta"),
        ...adminS3Bucket("onekinship-okta-assets"),
        readAllPulumiSsmOutputs,
        ekslistAndDescribe,
    ],
})

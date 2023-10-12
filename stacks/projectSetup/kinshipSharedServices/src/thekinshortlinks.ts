import {
    readAllPulumiSsmOutputs,
    readWriteRoute53Record,
    readWritePulumiStateAndSsm,
  } from "../../../../utility/projectSetup/utils/iamPermissions"
import { projectSetup } from "../../../../utility/projectSetup/utils/projectSetup"
import { theKinLinkHostedZonesId, pulumiStateBucketName } from "./config"


const projectName = "the-kin-short-links"

export const thekinshortlinksProject = projectSetup({
  projectName,
  cicdUserPermissions: [
    ...readWriteRoute53Record(theKinLinkHostedZonesId),
    ...readWritePulumiStateAndSsm(pulumiStateBucketName, projectName),
    readAllPulumiSsmOutputs,
  ],
})
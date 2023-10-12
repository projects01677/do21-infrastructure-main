import {
  readAllPulumiSsmOutputs,
  readWritePulumiStateAndSsm
} from "../../../../utility/projectSetup/utils/iamPermissions"
import { projectSetup } from "../../../../utility/projectSetup/utils/projectSetup"

const projectName = "hank"

export const hankProject = projectSetup({
  projectName,
  cicdUserPermissions: [
    ...readWritePulumiStateAndSsm("whistle-pulumi-state", projectName),
    readAllPulumiSsmOutputs,
    {
      Effect: "Allow",
      Action: ["s3:*"],
      Resource: [
        "arn:aws:s3:::whistle-sony-gnss",
        "arn:aws:s3:::whistle-sony-gnss/GPS_EE_0.7-ee.pkg",
        "arn:aws:s3:::whistle-sony-gnss/archive_gnss/*",
        "arn:aws:s3:::whistle-sony-gnss/W04/*"
      ],
    },
  ],
})

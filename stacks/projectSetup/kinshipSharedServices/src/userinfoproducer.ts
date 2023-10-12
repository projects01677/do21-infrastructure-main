import { interpolate } from "@pulumi/pulumi"
import { awsAccountId } from "../../../../utility/awsAccountId"
import {
  adminMSKafka,
  ekslistAndDescribe,
  readAllPulumiSsmOutputs,
  readWriteEcr,
  readWritePulumiStateAndSsm,
} from "../../../../utility/projectSetup/utils/iamPermissions"
import { projectSetup } from "../../../../utility/projectSetup/utils/projectSetup"
import { pulumiStateBucketName } from "./config"

const projectName = "userinfoproducer"

export const userinfoproducerProject = projectSetup({
  projectName,
  cicdUserPermissions: [
    ...readWriteEcr(`kinship-shared-services/${projectName}`),
    ...readWritePulumiStateAndSsm(pulumiStateBucketName, projectName),
    ...adminMSKafka(`${projectName}-*`),
    readAllPulumiSsmOutputs,
    ekslistAndDescribe,
    {
      Effect: "Allow",
      Action: ["logs:CreateLogGroup", "logs:ListTagsLogGroup", "logs:PutRetentionPolicy"],
      Resource: [interpolate`arn:aws:logs:*:${awsAccountId()}:log-group:${projectName}-*`],
    },
    {
      Effect: "Allow",
      Action: ["logs:DescribeLogGroups"],
      Resource: [interpolate`arn:aws:logs:*:${awsAccountId()}:log-group:*`],
    },
    {
      Effect: "Allow",
      Action: ["ec2:CreateSecurityGroup", "ec2:DescribeSecurityGroups"],
      Resource: [`*`],
    },
  ],
})

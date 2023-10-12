import {
  adminDynamodbTable,
  ekslistAndDescribe,
  readAllPulumiSsmOutputs,
  readWriteEcr,
  readWritePulumiStateAndSsm
} from "../../../../utility/projectSetup/utils/iamPermissions"
import { projectSetup } from "../../../../utility/projectSetup/utils/projectSetup"
import {pagerDutyCriticalServiceIds, pagerDutyInfoServiceIds } from "./config"
import { ssm } from "@pulumi/aws"

const projectName = "server-data-processor"

export const serverDataProcessorProject = projectSetup({
  projectName,
  cicdUserPermissions: [
    ...readWriteEcr("whistle/data-processor"),
    ...readWritePulumiStateAndSsm("whistle-pulumi-state", projectName),
    ...adminDynamodbTable("point_entries-*"),
    ...adminDynamodbTable("whistle-*-petinsight-data"),
    readAllPulumiSsmOutputs,
    ekslistAndDescribe,
    {
      Effect: "Allow",
      Action: ["cloudwatch:*"],
      Resource: `arn:aws:cloudwatch:*:*:alarm:point_entries-*`,
    },
    {
      Effect: "Allow",
      Action: ["application-autoscaling:*"],
      Resource: `*`, // What the heck is the ARN format for this resource?
    },
    {
      Effect: "Allow",
      Action: ["iam:PassRole"],
      Resource: ["arn:aws:iam::*:role/aws-service-role/dynamodb.application-autoscaling.amazonaws.com/AWSServiceRoleForApplicationAutoScaling_DynamoDBTable"]
    }
  ],
})

// PagerDuty AWS SSM outputs for universal accessibility
pagerDutyCriticalServiceIds
  .apply((sid) => sid
    .filter((s) => s.project == projectName).map(
  ({ project, id }) =>
    new ssm.Parameter(`${project}-criticalServiceId`, {
      name: `/pulumi/pagerduty/${project}/criticalServiceId`,
      type: "String",
      value: id,
    })
))

pagerDutyInfoServiceIds
  .apply((sid) => sid
    .filter((s) => s.project == projectName).map(
  ({ project, id }) =>
    new ssm.Parameter(`${project}-infoServiceId`, {
      name: `/pulumi/pagerduty/${project}/infoServiceId`,
      type: "String",
      value: id,
    })
))

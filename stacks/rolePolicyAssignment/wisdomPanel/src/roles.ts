import { Policy, Role } from "@pulumi/aws/iam"
import { rdsExportPolicy } from "../../../../utility/projectSetup/iamPolicies/rdsExportPolicy"
import { rdsSnapshotsBucketName, rdsExportRole } from "./config"

export const rdsSnapshotExportPolicy = new Policy("rds-snapshot-export", {
  name: rdsExportRole,
  policy: {
    Version: "2012-10-17",
    Statement: rdsExportPolicy(rdsSnapshotsBucketName),
  },
})

const rdsSnapshotExportRole = new Role("serviceRoleForRdsSnapshots", {
  name: "ServiceRoleForRdsSnapshots",
  inlinePolicies: [
    {
      name: rdsSnapshotExportPolicy.name,
      policy: rdsSnapshotExportPolicy.policy,
    },
  ],
  assumeRolePolicy: {
    Version: "2012-10-17",
    Statement: [
      {
        Effect: "Allow",
        Principal: {
          Service: "export.rds.amazonaws.com",
        },
        Action: "sts:AssumeRole",
      },
    ],
  },
})

export const projectSpecificRoles = {
  rdsSnapshotExportRole,
}

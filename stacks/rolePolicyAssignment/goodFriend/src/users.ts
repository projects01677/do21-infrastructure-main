import { rolePolicyAssignmment } from "../../../../utility/rolePolicyAssignment"
import { manageRdsSnapshots } from "../../../../utility/projectSetup/utils/manageRdsSnapshots"
import { rdsSnapshotsBucketName, rdsExportRole } from "./config"

const dariuszDyrga = rolePolicyAssignmment({
  policyName: "manage-rds-snapshots-policy-dariusz.dyrga",
  userPermissions: [
    ...manageRdsSnapshots(rdsSnapshotsBucketName, "gf-web", rdsExportRole),
  ],
  role: "dariusz.dyrga",
})

export const userPolicies = {
  dariuszDyrga
}

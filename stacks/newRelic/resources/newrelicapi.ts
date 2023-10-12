import * as newrelic from "@pulumi/newrelic"
import { provider, newRelicUserId, newrelicAccountId, newrelicAccountName } from "../config/provider"

export const newrelicApiKey = new newrelic.ApiAccessKey(
  `pulumi-${newrelicAccountName}-user-${newRelicUserId}`,
  {
    accountId: newrelicAccountId,
    keyType: "USER",
    notes: `${newrelicAccountName} ${newrelicAccountId} pulumi managed`,
    userId: newRelicUserId,
  },
  { provider: provider }
)

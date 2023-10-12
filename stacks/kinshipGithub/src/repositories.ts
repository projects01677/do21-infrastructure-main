import { Repository } from "@pulumi/github"
import { config } from "./config"

export const repositories = config.repositories.map(
  ({ name }) =>
    new Repository(
      name,
      {
        deleteBranchOnMerge: true,
        autoInit: true,
        name,
        visibility: "private",
      },
      { protect: true }  // This protects the repos from being accidentally deleted using Pulumi. If you *really* want to delete the rep, you can do it manually and then remove it from Pulumi code and refresh the Pulumi state.
    )
)

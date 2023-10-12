import { cloudwatch } from "@pulumi/aws";
import { config } from "../../../config/config"

export const eksInfrastructureLogGroup = new cloudwatch.LogGroup(`${config.envName}-LogGroup`, {
  name: `/aws/eks/${config.eksClusterName}/cluster`,
  retentionInDays: 30,
  tags: {
    managed_by: "Pulumi",
  },
})

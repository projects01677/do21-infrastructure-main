import * as aws from "@pulumi/aws"
import { config } from "../../config"
import { provider } from "../awsAccount"

const name = `${config.name.replace(/ /g, "-").toLowerCase()}-pulumi-state`
export const pulumiStateBucket = new aws.s3.Bucket(
  name,
  {
    bucket: name,
    acl: "private",
  },
  { provider: provider, protect: true }
)

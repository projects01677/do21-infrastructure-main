import { Config } from "@pulumi/pulumi"
import { Environments } from "../../../../utility/Environments"


export const environment = new Config().get("environment") as Environments

export const awsAccountId = new Config("aws").requireObject<Array<string>>("allowedAccountIds")[0]!

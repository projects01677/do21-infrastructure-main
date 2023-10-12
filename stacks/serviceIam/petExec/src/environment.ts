import { Config } from "@pulumi/pulumi"
import { Environments } from "../../../../utility/Environments"


export const environment = new Config().get("environment") as Environments

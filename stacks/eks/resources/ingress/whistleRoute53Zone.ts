import { Zone } from "@pulumi/aws/route53"
import { config } from "../../config/config"

export const whistleRoute53Zone = Zone.get("whistleRoute53Zone", config.ingressBaseDomainRoute53ZoneId)

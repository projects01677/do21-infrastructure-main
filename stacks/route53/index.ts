import { Provider } from "@pulumi/aws"
import { Record, Zone } from "@pulumi/aws/route53"

const kinshipSharedServicesProvider = new Provider("kinshipSharedServices", {
  allowedAccountIds: ["575036886166"],
  assumeRole: { roleArn: "arn:aws:iam::575036886166:role/OrganizationAccountAccessRole" },
  region: "us-east-1",
})

const whistleSoftwareProvider = new Provider("whistleSoftware", {
  allowedAccountIds: ["419697633145"],
  region: "us-east-1",
})

const vetInsightProvider = new Provider("vetInsight", {
  allowedAccountIds: ["672673849622"],
  assumeRole: { roleArn: "arn:aws:iam::672673849622:role/OrganizationAccountAccessRole" },
  region: "us-east-1",
})

const oneKinshipCoZone = new Zone(
  "one.kinship.co",
  {
    name: "one.kinship.co",
  },
  { provider: kinshipSharedServicesProvider, protect: true }
)

const loginKinshipEngineeringZone = new Zone(
  "login.kinship.engineering",
  {
    name: "login.kinship.engineering",
  },
  { provider: kinshipSharedServicesProvider, protect: true }
)

const mailVetInsightZone = new Zone(
  "mail.vetinsight.com",
  {
    name: "mail.vetinsight.com",
  },
  { provider: vetInsightProvider, protect: true }
)

const loginKinshipEngineeringRecordInMainAccount = new Record(
  "login.kinship.engineering",
  {
    name: "login.kinship.engineering",
    records: loginKinshipEngineeringZone.nameServers,
    type: "NS",
    zoneId: "Z07062881U7933BO92U0K",
    ttl: 172800,
  },
  { provider: whistleSoftwareProvider }
)

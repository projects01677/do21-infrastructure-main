import { mparticlejobProject } from "./src/mparticlejob"
import { userinfoconsumerProject } from "./src/userinfoconsumer"
import { userinfoproducerProject } from "./src/userinfoproducer"
import { singlesignonProject } from "./src/singlesignon"
import { kongProject } from "./src/kong"
import { sacapimetricsdataProject } from "./src/sacapimetricsdata"
import { aapnpasignupapiProject } from "./src/aapnpasignupapi"
import { aappetlistapiProject } from "./src/aappetlistapi"
import { aapbulkexportapiProject } from "./src/aapbulkexportapi"
import { aapsearchapiProject } from "./src/aapsearchapi"
import { okuserprofilesvcProject } from "./src/okuserprofilesvc"
import { okpetprofilesvcProject } from "./src/okpetprofilesvc"
import { goodfriendpetexecintProject } from "./src/okgoodfriendpetexecint"
import { oksubscriptioncoresvcProject } from "./src/oksubscriptioncoresvc"
import { okhealthsvcProject } from "./src/okhealthsvc"
import { kiidentitysvcProject } from "./src/kiidentitysvc"
import { kidocumentsvcProject } from "./src/kidocumentsvc"
import { oknotesvcProject } from "./src/oknotesvc"
import { oktagsvcProject } from "./src/oktagsvc"
import { apiAutomationProjectResources } from "./src/apiautomationpostman"
import { okoktaeventwebhooksvcProject } from "./src/okoktaeventwebhooksvc"
import { okpaymentsvcProject } from "./src/okpaymentsvc"
import { ssm } from "@pulumi/aws"
import { NEW_RELIC_BROWSER_KEY, NEW_RELIC_LICENSE_KEY, NEW_RELIC_USER_KEY } from "./src/config"
import { kincontentapiProject } from "./src/thekincontentapi"
import { infrastructurepackagesProject } from "./src/infrastructurepackages"
import { thekinvetchatsummaryProject } from "./src/thekinvetchatsummary"
import { oknotificationsvcProject } from "./src/oknotificationsvc"
import { kinshipKafkaProject } from "./src/kinshipkafka"
import { okback4appsvcProject } from "./src/okback4appsvc"
import { thekinwebsiteProject } from "./src/thekinwebsite"
import { thekinshortlinksProject } from "./src/thekinshortlinks"
import { thekinapiProject } from "./src/thekinapi"
import { goodfriendwebsiteProject } from "./src/goodfriendwebsite"
import { goodfriendapiProject } from "./src/goodfriendapi"


userinfoconsumerProject
userinfoproducerProject
mparticlejobProject
singlesignonProject
kongProject
sacapimetricsdataProject
aapnpasignupapiProject
aappetlistapiProject
aapbulkexportapiProject
aapsearchapiProject
okuserprofilesvcProject
okpetprofilesvcProject
goodfriendpetexecintProject
oksubscriptioncoresvcProject
okhealthsvcProject
kiidentitysvcProject
kidocumentsvcProject
oknotesvcProject
oktagsvcProject
okoktaeventwebhooksvcProject
kincontentapiProject
okpaymentsvcProject
thekinvetchatsummaryProject
oknotificationsvcProject
kinshipKafkaProject
okback4appsvcProject
thekinwebsiteProject
thekinshortlinksProject
thekinapiProject
goodfriendwebsiteProject
goodfriendapiProject

apiAutomationProjectResources
infrastructurepackagesProject

// AWS SSM outputs for universal accessibility
;[
  { name: "NEW_RELIC_LICENSE_KEY", value: NEW_RELIC_LICENSE_KEY },
  { name: "NEW_RELIC_BROWSER_KEY", value: NEW_RELIC_BROWSER_KEY },
  { name: "NEW_RELIC_USER_KEY", value: NEW_RELIC_USER_KEY },
].map(
  ({ name, value }) =>
    new ssm.Parameter(name, {
      name: `/pulumi/newrelic/${name}`,
      type: "SecureString",
      value: value,
    })
)

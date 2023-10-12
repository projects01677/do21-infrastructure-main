import { projectConfiguration } from "./config"
import { aapbulkexportsvcConfig } from "./projects/aapbulkexportsvc"
import { aapnpasignupsvcConfig } from "./projects/aapnpasignupsvc"
import { aappetlistapiConfig } from "./projects/aappetlistapi"
import { aapsearchapiConfig } from "./projects/aapsearchapi"
import { kidocumentsvcConfig } from "./projects/kidocumentsvc"
import { kiidentitysvcConfig } from "./projects/kiidentitysvc"
import { kongConfig } from "./projects/kong"
import { mparticlejobConfig } from "./projects/mparticlejob"
import { okhealthsvcConfig } from "./projects/okhealthsvc"
import { oknotesvcConfig } from "./projects/oknotesvc"
import { okpetprofilesvcConfig } from "./projects/okpetprofilesvc"
import { oksubscriptioncoresvcConfig } from "./projects/oksubscriptioncoresvc"
import { oktagsvcConfig } from "./projects/oktagsvc"
import { okuserprofilesvcConfig } from "./projects/okuserprofilesvc"
import { sacapimetricsdataapiConfig } from "./projects/sacapimetricsdataapi"
import { okoktaeventwebhooksvcConfig } from "./projects/okoktaeventwebhooksvc"
import { thekincontentapiConfig } from "./projects/thekincontentapi"
import { thekinvetchatsummaryConfig } from "./projects/thekinvetchatsummary"
import { thekinwebsiteConfig } from "./projects/thekinwebsite"

export const kinshipConfigs = (
  (): Array<projectConfiguration> => (
    [
      aapbulkexportsvcConfig(),
      aapnpasignupsvcConfig(),
      aappetlistapiConfig(),
      aapsearchapiConfig(),
      kidocumentsvcConfig(),
      kiidentitysvcConfig(),
      kongConfig(),
      mparticlejobConfig(),
      okhealthsvcConfig(),
      oknotesvcConfig(),
      okpetprofilesvcConfig(),
      oksubscriptioncoresvcConfig(),
      oktagsvcConfig(),
      okuserprofilesvcConfig(),
      sacapimetricsdataapiConfig(),
      okoktaeventwebhooksvcConfig(),
      thekincontentapiConfig(),
      thekinvetchatsummaryConfig(),
      thekinwebsiteConfig(),
    ]
  )
)

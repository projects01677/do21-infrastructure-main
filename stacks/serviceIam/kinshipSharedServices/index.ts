import { mparticlejobServiceIam } from "./src/mparticlejobServiceIam"
import { userinfoconsumerServiceIam } from "./src/userinfoconsumerServiceIam"
import { userinfoproducerServiceIam } from "./src/userinfoproducerServiceIam"
import { okpetprofilesvcServiceIam } from "./src/okpetprofilesvcServiceIam"
import { okuserprofilesvcServiceIam } from "./src/okuserprofilesvcServiceIam"
import { okgoodfriendpetexecintServiceIam } from "./src/okgoodfriendpetexecintServiceIam"
import { kiidentitysvcServiceIam } from "./src/kiidentitysvcServiceIam"
import { kidocumentsvcServiceIam } from "./src/kidocumentsvcServiceIam"
import { oknotesvcServiceIam } from "./src/oknotesvcServiceIam"
import { oktagsvcServiceIam } from "./src/oktagsvcServiceIam"
import { oknotificationsvcServiceIam } from "./src/oknotificationsvcServiceIam"
import { oksubscriptioncoresvcServiceIam } from "./src/oksubscriptioncoresvcServiceIam"
import { thekinapiServiceIam } from "./src/thekinapiServiceIam"

okgoodfriendpetexecintServiceIam

export const accessKeys = [
  userinfoproducerServiceIam,
  mparticlejobServiceIam,
  userinfoconsumerServiceIam,
  okpetprofilesvcServiceIam,
  okuserprofilesvcServiceIam,
  kiidentitysvcServiceIam,
  kidocumentsvcServiceIam,
  oknotesvcServiceIam,
  oktagsvcServiceIam,
  oknotificationsvcServiceIam,
  oksubscriptioncoresvcServiceIam,
  thekinapiServiceIam
].map((a) => ({
  name: a.user.name,
  accessKey: a.accessKey.id,
  secretKey: a.accessKey.secret,
}))

import { wisdomPanelServiceIam } from "./src/wisdomPanelServiceIam";



export const accessKey =  [wisdomPanelServiceIam].map((a) => ({
        name: a.user.name,
        accessKey: a.accessKey.id,
        secretKey: a.accessKey.secret,
      })
)

import { peBackendIam } from "./src/peBackend"

export const accessKeys = [
    peBackendIam
  ].map((a) => ({
    name: a.user.name,
    accessKey: a.accessKey.id,
    secretKey: a.accessKey.secret,
  }))

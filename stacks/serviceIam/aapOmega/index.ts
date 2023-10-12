import { aaprehomesvcServiceIam } from "./src/aaprehomesvcServiceIam"

aaprehomesvcServiceIam

export const accessKeys = [aaprehomesvcServiceIam].map((a) => ({
  name: a.user.name,
  accessKey: a.accessKey.id,
  secretKey: a.accessKey.secret,
}))

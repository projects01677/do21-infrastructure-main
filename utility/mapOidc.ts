import { Environments } from "./Environments"
import { awsSsmParam } from "./awsSsmGetParam"

export const envOidcMap = ({
  envEksStackMap,
}: {
  envEksStackMap: [Environments, string][]
}) => {
  let envOidcMap: [Environments, Promise<string>][] = []

  for (const [env, stack] of envEksStackMap) {
    let oidcIssuerId = awsSsmParam(`/pulumi/${stack}/oidcIssuerId`)
    envOidcMap.push([env, oidcIssuerId])
  }
  return envOidcMap
}

The Pulumi Projects in this dir set up the core components necessary to create a Pulumi Project within an application repository:

* KMS Key for Pulumi secrets encryption, including user access to this key.
* CICD user with just enough IAM permissions to provision all necessary resources for the repository. This user's Access Keys should later be added to the Git repository secrets so it can be used in Github Actions.

Note: These resources reside in the AWS Account that the application infrastructure resides in.

-----

## [Project/service naming convention](https://whistle.atlassian.net/wiki/spaces/OKENG/pages/2711781441/OneKinship+Repository+Structure+and+Naming+convention#Naming-Convention-%5BProposed%5D)

-----

## Adding NewRelic and PagerDuty resources for a project

Currently the workflow to add NewRelic and PagerDuty resources for a single project, when you already have NewRelic account set up before, has to be done in two steps and looks like this:

**UPDATE: Daniel has fixed the dependencies in Github actions, so we can add everything in single PR**

1. create first PR:
- add slack channels in `slackConfig` stack, to `Projects` [array]( https://github.com/WhistleLabs/do21-infrastructure/blob/main/stacks/slackMonitor/src/config.ts#L6-L13)
```
export const projects: Array<Projects> = [
  "lob-servicename-type",
  ...
```
- make sure the project is present in the `Projects` list in `userConfig.ts` like [this](https://github.com/WhistleLabs/do21-infrastructure/blob/main/stacks/userConfig.ts#L15)
```
export type Projects =
  | "lob-servicename-type"
  | ...
```
- assign project to somebody’s `pagerDuty` config in `userConfig.ts` like [this](https://github.com/WhistleLabs/do21-infrastructure/blob/main/stacks/userConfig.ts#L1110)
```
    {
      name: "DevOps Engineer",
      ...
      pagerDuty: {
        ...
        projects: [
          { name: "lob-servicename-type" },
          ...
        ],
      },
    },
```
- get first PR merged to `main` and deployed

2. create second PR:
- add a project config file to newRelic stack like [this](https://github.com/WhistleLabs/do21-infrastructure/blob/main/stacks/newRelic/config/projects/okhealthsvc.ts), the name should be like `stacks/newRelic/config/projects/lobservicenametype.ts`
- make sure to specify `projectName` value and `<projectnameConfig>` variable name [in config file](https://github.com/WhistleLabs/do21-infrastructure/blob/main/stacks/newRelic/config/projects/okhealthsvc.ts#L5-L7) like this:
```
const projectName = "lob-servicename-type"

export const lobservicenametypeConfig = (): projectConfiguration => ({ ...
```
- import the project config and add it to Configs list of [the corresponding NewRelic account](https://github.com/WhistleLabs/do21-infrastructure/blob/main/stacks/newRelic/config/kinship.ts)
```
import { lobservicenametypeConfig } from "./projects/lobservicenametype"

export const kinshipConfigs = (
  (): Array<projectConfiguration> => (
    [
      lobservicenametypeConfig(),
      ...
    ])
```
- add PagerDuty and NewRelic outputs to projectSetup [config file](https://github.com/WhistleLabs/do21-infrastructure/blob/main/stacks/projectSetup/kinshipSharedServices/src/okhealthsvc.ts#L25-L800), just copy the below code:
```
import { pagerDutyCriticalServiceIds, pagerDutyInfoServiceIds } from "./config"
import { newRelicAlertPoliciesIds, } from "./config"
import { ssm } from "@pulumi/aws"

...

// PagerDuty AWS SSM outputs for universal accessibility
pagerDutyCriticalServiceIds
.apply((sid) => sid
  .filter((s) => s.project == projectName).map(
  ({ project, id }) =>
  new ssm.Parameter(`${project}-criticalServiceId`, {
    name: `/pulumi/pagerduty/${project}/criticalServiceId`,
    type: "String",
    value: id,
  })
))

pagerDutyInfoServiceIds
.apply((sid) => sid
  .filter((s) => s.project == projectName).map(
  ({ project, id }) =>
  new ssm.Parameter(`${project}-infoServiceId`, {
    name: `/pulumi/pagerduty/${project}/infoServiceId`,
    type: "String",
    value: id,
  })
))

// New Relic AWS SSM outputs for universal accessibility
newRelicAlertPoliciesIds
.apply((sid) => sid
  .filter((s) => s.project == projectName).map(
  ({ environment, id, name, project }) =>
  new ssm.Parameter(`${project}-${environment}-${name}-Id`, {
    name: `/pulumi/newrelic/${project}/${environment}/resourceIds/${name}`,
    type: "String",
    value: id,
  })
))

```

**EXAMPLE:** here we're adding `ok-health-svc` project:
- [first PR](https://github.com/WhistleLabs/do21-infrastructure/pull/474)
- [second PR](https://github.com/WhistleLabs/do21-infrastructure/pull/475)

Tested and confirmed:
- [deploying first PR](https://github.com/WhistleLabs/do21-infrastructure/actions/runs/2963333320)
- [deploying second PR](https://github.com/WhistleLabs/do21-infrastructure/actions/runs/2963440114)

Once it's deployed:
- See PagerDuty schedules [here](https://whistle.pagerduty.com/schedules-new)
- See NewRelic policies [here](https://onenr.io/0Zw06Z8v2jv)
- See NewRelic channels [here](https://onenr.io/07jbpMlG0wy) (slack channel names can be seen here too)

-----

## Adding a NewRelic account to Pulumi

The workflow to add a NewRelic account configuration to Pulumi looks like this:

0. Manually create 'child' NewRelic account, this will generate the account ID and Ingest/Browser keys.

1. first PR - add NewRelic stack config
- add NewRelic stack Pulumi config following the [template file](https://github.com/WhistleLabs/do21-infrastructure/blob/main/stacks/newRelic/Pulumi.newrelic-TEMPLATE.yaml), name should be like `stacks/newRelic/Pulumi.newrelic-accountName.yaml`
```
# 1. Init stack for NewRelic account:
# pulumi stack init "newrelic-<ACCOUNTNAME>" --secrets-provider="awskms://alias/pulumi-devops-infra"
# This will generate the two lines:
secretsprovider: awskms://alias/pulumi-devops-infra
encryptedkey: <encrypted main key>

# 2. Select newly created stack
# pulumi stack select newrelic-<ACCOUNTNAME>

# 3. Manually add config:
config:
  # NewRelic account ID, can be obtained in NewRelic: https://onenr.io/08wo1vYxpjx
  infrastructure:newrelicAccountId: "3511214"

  # AWS account name
  infrastructure:newrelicAccountName: VetInsight
  infrastructure:newrelicAccountRegion: US

# 4. Add secrets:
  #NewRelic Ingest License and Ingest Browser keys are created automatically when NewRelic account is created,
  # can be copied from the corresponding account: https://onenr.io/08wo1vYxpjx
  # pulumi config set --secret infrastructure:newrelicOrigBrowserKey <value>
  infrastructure:newrelicOrigBrowserKey:
    secure: <encrypted value>

  # pulumi config set --secret infrastructure:newrelicOrigIngestKey <value>
  infrastructure:newrelicOrigIngestKey:
    secure: <encrypted value>

  # the NewRelic used ID is the same across all accounts, leave it as it is
  infrastructure:newrelicUserId: "1002656043"

  # slackDevOpsWebhook value is the same across all NewRelic stacks, decrypt it from some other stack:
  # pulumi -s newrelic-vetInsight config --show-secrets | grep slackDevOpsWebhook
  # and add to the secrets for the stack you're adding:
  # pulumi config set --secret infrastructure:slackDevOpsWebhook <decrypted webhook value>
  infrastructure:slackDevOpsWebhook:
    secure: <encrypted value>

  # Here we'll need to use the global Account Wide Devops User API key to create a per-NewRelic-Account key
  # - Get the value from `global` stack secrets:
  # pulumi --cwd=../global -s global stack --show-secrets | grep NEW_RELIC_DEVOPS_USER_KEY
  # - set NEW_RELIC_API_KEY environmental variable:
  # export NEW_RELIC_API_KEY=<decrypted aws:ssm/parameter:Parameter NEW_RELIC_DEVOPS_USER_KEY  value>
  # - manually run `pulumi up`, this will create Pulumi-managed NewRelic API `USER`-type key in NewRelic https://onenr.io/08wpL2lpZwO
  # - reveal the key from stack outputs:
  # pulumi stack output --show-secrets | grep newRelicUserKey
  # - add freshly created per-account key to newrelic:apiKey secret
  # pulumi config set --secret newrelic:apiKey <value from NewRelic>
  newrelic:apiKey:
    secure: <encrypted value>
```
- Add newly created Config to the [list](https://github.com/WhistleLabs/do21-infrastructure/blob/main/stacks/newRelic/config/config.ts#L110)
```
export const projectConfigs: Array<projectConfiguration> =
    : newrelicAccountName == "AccountName"
    ? accountNameConfigs()
```
- add config file like `stacks/newRelic/config/accountname.ts`, without adding individual projects belonging to this stack yet - see them commented out here!
```
import { projectConfiguration } from "./config"
//import { lobservicetypeConfig } from "./projects/lobservicetype"

export const accountNameConfigs = (
  (): Array<projectConfiguration> => (
    [
      //lobservicetypeConfig(),
    ]
  )
)
```
- add the stack config to `stacks/newRelic/config/config.ts` [file](https://github.com/WhistleLabs/do21-infrastructure/blob/main/stacks/newRelic/config/config.ts):
```
export const projectConfigs: Array<projectConfiguration> =
    newrelicAccountName == "Account Name"
    ? accountNameConfigs()
    ...
```
- make sure that we import NewRelic keys from SSM Parameter Store in `stacks/projectSetup/<projectName>/index.ts`:
```
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
```
- in the same first PR, add the newly added stack to preview and apply Github Actions to enable [preview](https://github.com/WhistleLabs/do21-infrastructure/blob/main/.github/workflows/infra-preview.yml) and [apply](https://github.com/WhistleLabs/do21-infrastructure/blob/main/.github/workflows/infra-apply.yml)
```
          - stack_name: newrelic-accountName
            stack_path: stacks/newRelic
```

2. second PR is equal to step 1 in [Adding an individual service](https://github.com/WhistleLabs/do21-infrastructure/tree/DO21-583-add-README/stacks/projectSetup#adding-newrelic-and-pagerduty-resources-for-a-project): add corresponding projects belonging to your new NewRelic stack, have to add slack channels in `slackMonitor` stack first, and make sure PagerDuty schedules are assigned to somebody in `userConfig.ts`

3. third PR is equal to step 2 in [Adding an individual service](https://github.com/WhistleLabs/do21-infrastructure/tree/DO21-583-add-README/stacks/projectSetup#adding-newrelic-and-pagerduty-resources-for-a-project): add the rest of resources for projects

**EXAMPLE**: here we’re adding the `PetExec` NewRelic stack, so the way it's done is:
- [first PR](https://github.com/WhistleLabs/do21-infrastructure/pull/477/files) is manually creating a NewRelic stack and adding a Pulumi configs for it, at the same time it makes sense add the newly created stack to preview/apply Github Actions as in [this PR](https://github.com/WhistleLabs/do21-infrastructure/pull/480/files)
- [second PR](https://github.com/WhistleLabs/do21-infrastructure/pull/478/files) is simply adding slack channels (as we already previously have projects assigned to engineers' PagerDuty congigs)
- [third PR](https://github.com/WhistleLabs/do21-infrastructure/pull/479/files) is adding the rest

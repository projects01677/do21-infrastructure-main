# PagerDuty

This pagerduty stack is used to manage and deploy base infrastructure PagerDuty resources. See the [Pulumi PagerDuty provider](https://www.pulumi.com/registry/packages/pagerduty/api-docs/) docs for resource specifics. In the sections to follow the underlying resources will be outlined in detail. See the Examples section for common tasks related to this stack.

**NOTE**: The `pagerduty:token` in the configuration is a read-only token in order to run `pulumi --cwd stacks/pagerduty -s pagerduty up` you must provide a PagerDuty API Token with write privs example:

```bash
export PAGERDUTY_TOKEN="<pagerduty-api-token-with-write-privs>"
pulumi --cwd stacks/pagerduty -s pagerduty up
```

## Users

The base configuration for managing the PagerDuty resources begins in the [usersConfig](../userConfig.ts) by means of a per user pagerDuty config block. This block has each property typed in the [PagerDutyUser](https://github.com/WhistleLabs/do21-infrastructure/blob/main/stacks/pagerDuty/src/config.ts#L90-L99) found in [users](./src/users.ts). An example configuration is provided below with comments for details.

```typescript
pagerDuty: {
  name: "Tony Walls",
  email: "tony@whistle.com",
// An optional parameter that defaults to `user`
// aligns with pagerduty roles
// https://www.pulumi.com/registry/packages/pagerduty/api-docs/user/#role_nodejs
  role: "admin",
//If false will assume user is already created and present
//Will not manage the user but will add them to dependent resources
//Will error out if user has not already been created
  createUser: false,
  jobTitle: "DevOps Manager",
//The projects list is used to define what schedules the user
//Will be added to for that project. If no schedules are provided
//The Default is to be on schedules.
//If no users are a assigned to a project the schedule
//will be destroyed or will not exist.
//
//Overrides default assignment to all schedules and puts on weekdays only
  // projects: [
  //   { name: "kong", schedules: ["weekdays,], }
  // ],
// Typical use case defaults to assignment to all schedules for kong.
  projects: [
    { name: "kong"}
  ],
},
```

### User Dependencies

Users that have the `createUser` property in their config block set to `false` **MUST** exist already in pagerduty with the `email` set in their config block. If the user does not exist an error will occur when attempting to retrieve the Users pagerduty user_id through the provider. When the `createUser` is set to false none of the other properties set in the config block such as `name` or `jobTitle` will be updated for that user and should be populated to match what is already in PagerDuty to ease transition of the user to a managed user should that be desired later.

Users that have the `createUser` set to `true` will be managed and created with all of the property values provided in the config block. Once created users automatically receive an email to set up their accounts.

Removal of a users config block that has `createUser` set to true **will subsequently destroy that user removing the user from PagerDuty**.

All downstream PagerDuty resources [Schedules](#schedules),[Escalation Policies](#escalation-policies) and [Services](#services) depend on [Users](#users)

## Schedules

Each project defined in the [PagerDutyUser](https://github.com/WhistleLabs/do21-infrastructure/blob/main/stacks/pagerDuty/src/config.ts#L90-L99) config block has an array of [PagerDutyScheduleId](https://github.com/WhistleLabs/do21-infrastructure/blob/main/stacks/pagerDuty/src/config.ts#L14-L17) at the time of this writing are the following

```typescript
export type PagerDutyScheduleId =
// Primary and Secondary 24/7 on call schedules
// Both 247 schedules fall under the "Critical" escalation policies
  | "primary247"
  | "secondary247"
// Weekdays on call schedules fall under the "Info" escalation policies
| "weekdays"
```

The schedule layers are defined in the [config](src/config.ts) as [pagerDutySchedules](https://github.com/WhistleLabs/do21-infrastructure/blob/main/stacks/pagerDuty/src/config.ts#L20).

Each schedules PagerDutyScheduleId layer has its resource properties defined and typed. The Schedule name when deployed will be prepended by the Project name and PagerDutyScheduleId. For example the `weekdays` schedule for `kong` when deployed would become `kong weekdays`. Each layer name will be sourced from the name attribute and prepended by the Project name. For example the weekdays layer below would become `kong Weekday Coverage` in the `kong weekdays` Schedule.

```typescript
  weekdays: {
    name: "Weekday Coverage",
```

### Schedule Dependencies

A Schedule depends on [Users](#users) since users are assigned to each schedules layer. As such the existence of a schedule depends on the presence of its PagerDutyScheduleId in at least one users PagerDutyUser. **By default** a config block for a project **without a schedules property defined** will include **all** PagerDutyScheduleId's. **If a project is not present in any users config block the schedule would be destroyed** in addition to all of its dependent [Escalation Policies](#escalation-policies) and [Services](#services).

## Escalation Policies

Escalation policies are defined in config as [pagerDutyEscalationPolicies](https://github.com/WhistleLabs/do21-infrastructure/blob/main/stacks/pagerDuty/src/config.ts#L130). There is a `Critical` and `Info` policy created for each Project that references the corresponding corresponding schedules that fall under the `Critical` and `Info` policies. The schedule types that fall under `Critical` at the time of this writing are `primary247` and `secondary247` with `weekdays` falling under the `Info` policy.

The Schedule IDs for the corresponding projects are filtered out and added to the policy on deployment.

### Escalation Policy Dependencies

Escalation policies depend on [Schedules](#schedules). At least one schedule must exist for a project that falls under the `Critical` or `Info` policy type or the policy will not be created. **Escalation policies will be destroyed should a corresponding schedule later be removed that falls under a policy for a particular project**.

## Services

Services are defined in config as [pagerDutySevices](https://github.com/WhistleLabs/do21-infrastructure/blob/main/stacks/pagerDuty/src/config.ts#L175-L176). There is a `Critical` and `Info` service created for each Project that references the corresponding [Escalation Policy](#escalation-policies). The Escalation Policies for each type of service are filtered out for each project and referenced accordingly during deployment.

Once services are created the Service IDs are collected and stored as outputs with the following properties:

```typescript
export const criticalServiceIds = services.critical
  .map((s) => ({project: s.project, id: s.service.id, name: s.service.name }))
export const infoServiceIds = services.info
  .map((s) => ({project: s.project, id: s.service.id, name: s.service.name }))
```

infoServiceIds

```typescript
[{
  project: "project1"
  id: "<info-service-id>"
  name: "project1 Info"
},
{
  project: "project2"
  id: "<info-service-id>"
  name: "project2 Info"
},]
```

criticalServiceIds

```typescript
[{
  project: "project1"
  id: "<critical-service-id>"
  name: "project1 Critical"
},
{
  project: "project2"
  id: "<critical-service-id>"
  name: "project2 Critical"
},]
```

The info and critical service ids should be stored at the following SSM paths in projects account:
* `/pulumi/pagerduty/${project}/infoServiceId`
* `/pulumi/pagerduty/${project}/criticalServiceId`

Each project that requires downstream access to the service ids should have a stack reference added to the corresponding projects module where projectSetup is run. Then the SSM parameters will be stored in the appropriate projects account for downstream consumers. See [aapOmega petsearch project for reference](https://github.com/WhistleLabs/do21-infrastructure/blob/main/stacks/projectSetup/aapOmega/src/petsearch.ts#L42-L64). An example of the required typescript is also in the [Examples](#adding-pagerduty-stack-ssm-outputs-to-a-projects) section.

### Service Dependencies

Services depend on the underlying [Escalation Policies](#escalation-policies) that fall under the `Critical` and `Info` types. At least one escalation policy must exist for a project under the service category in order for a service to be deployed. **Services will be destroyed should a corresponding escalation policy later be removed that was referenced for a Service.**

## Examples

##### Adding a user to pagerduty for multiple projects.

**Note**: The default `role` is user and is only required if a higher role is needed for the user. The configuration block is typed so required and optional parameters will be visible in IDE.

Add a configuration block to the userConfig

```typescript
pagerDuty: {
  name: "Fred Smith",
  email: "fred.smith@kinship.co",
  role: "admin"
  createUser: true,
  jobTitle: "Developer",
  projects: [
    // defaults to include all scheduleids
    { name: "project1" },
    // include just weekdays scheduleid
    { name: "project2", schedules: ["weekdays",], },
  ],},
```

##### Adding pagerduty stack SSM outputs to a projects

SSM outputs outputs should be stored in the appropriate account for downstream consumers in the projects account

Add the following to the project stack where projectSetup is run for the project:

```typescript
import { pagerDutySecheduleIdOutput } from "../../../monitoringConfig"

const pagerDutyStackReference = new StackReference("pagerduty")
export const pagerDutyCriticalServiceIds = pagerDutyStackReference.getOutput("criticalServiceIds")
  .apply((pd) => pd as Array<pagerDutySecheduleIdOutput>)
export const pagerDutyInfoServiceIds = pagerDutyStackReference.getOutput("infoServiceIds")
  .apply((pd) => pd as Array<pagerDutySecheduleIdOutput>)
const projectName = "this-projects-name"
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
```

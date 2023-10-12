# New Infrastructure

This repository contains infrastructure for new DevOps initiatives (2021 onward). This includes, but is not limited to, new VPCs, Kubernetes clusters, and AWS users for Github Actions CI/CD, for sometimes more than one AWS Account.

## Development prerequisites

* For Github Actions only: AWS IAM user with admin permissions. `arn:aws:iam::419697633145:user/service/cicd` was manually created for this purpose.
* An S3 bucket named `whistle-pulumi-state` (this was manually created in account `419697633145`)
* A KMS key for Pulumi secrets encryption (`awskms://alias/pulumi-devops-infra` was manually created for this in account `419697633145`)
* Docker
* Admin IAM permissions and `system:masters` permissions in the targeted EKS cluster. See [Authenticating to Kubernetes clusters](#authenticating-to-kubernetes-clusters)

## CICD

On a pull request to `main` branch, a `pulumi preview` will be run against all Pulumi stacks in parallel. Jobs intentionally fail if they contain a diff so they are visible to the human. If Github Actions comes out with a "pass with notification" status, we should switch to that instead.

If the diffs look good, merging the PR will cause `pulumi up` to be run against all the stacks.

If a new Pulumi stack is created, the `infra-apply` and `infra-preview` Github Actions workflows need the stack added to their matrix jobs.

## Authenticating to Kubernetes clusters

The following sections describe how to add EKS clusters to your `kubectl` contexts. These steps only need to be performed once per cluster. If you need to change your context in the future you can run:

```
kubectl config get-contexts  # lists all of your contexts
kubectl config use-context <context-name>
```

Note: The `kubectl -n kube-system configmap aws-auth` configmap determines access to the cluster. If this configmap somehow gets into a bad state, the user/role that created the cluster will be able to restore access, as long as the user/role is not explicitly denied access in the configmap [citation needed].

### Clusters in Whistle Software (419697633145), which is the management account for the organization

Note: These clusters were created using the user `arn:aws:iam::419697633145:user/mikechen`.

You may run the commands below to configure access to each Kubernetes cluster:

```
aws eks update-kubeconfig --name production
aws eks update-kubeconfig --name staging
aws eks update-kubeconfig --name dev
```

### Clusters in Kinship Shared Services (575036886166)

Note: These clusters were created using the role `arn:aws:iam::575036886166:role/OrganizationAccountAccessRole`.

You will need to assume a role within this account that is able to list EKS Clusters. Users that are configured to access this cluster will have an IAM Role created for that user. You can set up an AWS Profile for a convenient way to assume the role.

```
export YOUR_AWS_IAM_USERNAME=replace_me
export ROLE_ARN="arn:aws:iam::575036886166:role/$YOUR_AWS_IAM_USERNAME"

# Add AWS profile with the two commands below
echo "[kss]
role_arn = $ROLE_ARN
source_profile = default" >> ~/.aws/credentials

echo '[profile kss]
region = us-east-1
output = json' >> ~/.aws/config
```

Then you may add the `kinship-shared-services` clusters to your `kubectl` contexts:

```
aws --profile kss eks update-kubeconfig --name kinship-shared-services-production
aws --profile kss eks update-kubeconfig --name kinship-shared-services-dev
```

## Architecture & concepts

### Pulumi

This repo contains one or more Pulumi projects. A Pulumi project is a description of some cloud infrastructure and contains a `Pulumi.yaml` file and can instantiate one or more stacks, with each stack being specified by a `Pulumi.<stackname>.yaml` file. These stacks are independently configurable, and it's common to instantiate a stack per environment.

The state of each stack is located in the `whistle-pulumi-state` S3 bucket, and has its secrets encrypted with a KMS key. Anybody with access to this key can decrypt these secrets. You can read more about the implications [here](#using-kms-keys-for-secret-encryption)

Each project will have an `index.ts` entrypoint file, which will be evaluated on `pulumi <preview|up>`. Any instantiated classes will correspond to one or more cloud resources for that stack.

### Implementation patterns

#### Using KMS keys for secret encryption

This allows us to grant a user read/write access to Pulumi state simply by granting the user decrypt permissions to the key for a given Pulumi stack. Restricting access to the bucket is not strictly necessary a secrets are encrypted within the statefile. The pattern we follow is a unique KMS key per github repo. These keys and their access rules are as code within this repository.

#### User config

All projects have their own config files, but these config files will sometimes pull from the global [userConfig](stacks/userConfig.ts). Users are given this global config because additions/removal/modifications of users often affect multiple Pulumi Projects.

##### AWS IAM Users

All associates have an IAM user in the `whistle` management account (419697633145). They may access resources in another AWS account through role assumption, where the name of the role is the same as their IAM username.

CICD IAM users live within the AWS account the application is deployed to.

#### Examples

##### Setup for a new Git Repository / Project

1. Add the project name to the [Projects type](stacks/userConfig.ts) and assign users to that project.
2. Add the app within [projectSetup](stacks/projectSetup). This will create a CICD user.
3. Add the CICD user's AWS Access Keys to the Github repository's Secrets to use with Github Actions.
4. If the app requires a Kubernetes namespace, add that namespace to the [appropriate EKS configs](stacks/eks/config) and include the CICD user as a namespace admin.
5. If the app requires an AWS service user, add it within [serviceIam](stacks/serviceIam)

##### Create a new EKS cluster

0. In the [userConfig](stacks/userConfig.ts) file, configure user permissions to the soon-to-be-created EKS cluster.
1. Create a new [eks stack](./stacks/eks). Follow the pattern for one of the kinship-shared-services stacks
2. Create a new [eksCertManager stack](./stacks/eksCertManager) for the new cluster.

##### Create a new AWS Account

1. In [stacks/awsAccount](stacks/awsAccount), create a new stack.
2. Apply the stack. If the first apply fails, just run it again.
3. (Optional) Grant users access in the [userConfig](stacks/userConfig.ts) file by assigning a `roleArn` for the new account for a given user.

## Making infrastructure changes

```
# This step is optional. It starts a shell session in a container containing all necessary dependencies so you won't have to download them locally.
./dev.sh

# Within the container, run `pulumi` and `kubectl` commands as normal.

## Information is cached between container restarts (this also includes the Pulumi executable), so you won't have to run these commands more than necessary.
aws eks update-kubeconfig --name $(pulumi --cwd stacks/eks stack output eksClusterName)  # grants kubectl access to the cluster
yarn install                                                                             # downloads code dependencies
pulumi login --cloud-url s3://whistle-pulumi-state                                       # this is where infra state is stored
pulumi stack select eks-dev --cwd stacks/eks                                             # selects the Pulumi stack to run against

## Common commands
pulumi preview --cwd stacks/eks   # same as terraform plan
pulumi up --cwd stacks/eks        # same as terraform apply
pulumi refresh --cwd stacks/eks   # syncs Pulumi-recognized state with actual state in the cloud if there's drift
```
#
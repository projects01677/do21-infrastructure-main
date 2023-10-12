import { PolicyStatement } from "@pulumi/aws/iam"
import { interpolate, Output } from "@pulumi/pulumi"
import { awsAccountId } from "../../awsAccountId"

export const readWriteEcr = (repoName: string): Array<PolicyStatement> => [
  {
    Effect: "Allow",
    Action: [
      "ecr:GetAuthorizationToken",
      "ecr:BatchCheckLayerAvailability",
      "ecr:GetDownloadUrlForLayer",
      "ecr:GetRepositoryPolicy",
      "ecr:DescribeRepositories",
      "ecr:ListImages",
      "ecr:DescribeImages",
      "ecr:BatchGetImage",
      "ecr:GetLifecyclePolicy",
      "ecr:GetLifecyclePolicyPreview",
      "ecr:ListTagsForResource",
      "ecr:DescribeImageScanFindings",
    ],
    Resource: ["*"],
  },
  {
    Effect: "Allow",
    Action: [
      "ecr:InitiateLayerUpload",
      "ecr:UploadLayerPart",
      "ecr:CompleteLayerUpload",
      "ecr:PutImage",
      "ecr:PutImageTagMutability",
      "ecr:TagResource",
      "ecr:UntagResource",
    ],
    Resource: [`arn:aws:ecr:*:*:repository/${repoName}*`],
  },
  {
    Effect: "Allow",
    Action: ["ecr:CreateRepository"],
    Resource: [`arn:aws:ecr:*:*:repository/${repoName}*`],
  },
]

export const deleteEcr = (repoName: string): Array<PolicyStatement> => [
  {
    Effect: "Allow",
    Action: ["ecr:DeleteRepository"],
    Resource: [`arn:aws:ecr:*:*:repository/${repoName}*`],
  },
]

export const readWritePulumiStateAndSsm = (
  pulumiBucketName: string | Output<string>,
  projectName: string
): Array<PolicyStatement> => [
  {
    Effect: "Allow",
    Action: ["s3:ListBucket"],
    Resource: [interpolate`arn:aws:s3:::${pulumiBucketName}`],
  },
  {
    Effect: "Allow",
    Action: ["s3:*Object"],
    Resource: [
      interpolate`arn:aws:s3:::${pulumiBucketName}/.pulumi/stacks/${projectName}*`,
      interpolate`arn:aws:s3:::${pulumiBucketName}/.pulumi/history/${projectName}*`,
      interpolate`arn:aws:s3:::${pulumiBucketName}/.pulumi/backups/${projectName}*`,
      interpolate`arn:aws:s3:::${pulumiBucketName}/.pulumi/locks/${projectName}*`,
      interpolate`arn:aws:s3:::${pulumiBucketName}/.pulumi/Pulumi.yaml`,
    ],
  },
  {
    Action: ["ssm:*"],
    Effect: "Allow",
    Resource: [`arn:aws:ssm:*:*:parameter/pulumi/${projectName}-*`],
  },
  {
    Action: ["ssm:DescribeParameters"],
    Effect: "Allow",
    Resource: [`arn:aws:ssm:*:*:*`],
  },
]

export const readWriteTerraformState = (
  terraformBucketName: string | Output<string>,
  projectName: string
): Array<PolicyStatement> => [
  {
    Effect: "Allow",
    Action: ["s3:ListBucket"],
    Resource: [interpolate`arn:aws:s3:::${terraformBucketName}`],
  },
  {
    Effect: "Allow",
    Action: ["s3:*Object"],
    Resource: [
      interpolate`arn:aws:s3:::${terraformBucketName}/.terraform/state/${projectName}*`,
    ],
  }
]

export const readAllPulumiSsmOutputs: PolicyStatement = {
  Action: ["ssm:GetParameter"],
  Effect: "Allow",
  Resource: ["arn:aws:ssm:*:*:parameter/pulumi/*"],
}


export const ekslistAndDescribe: PolicyStatement = {
  Effect: "Allow",
  Action: ["eks:DescribeCluster", "eks:ListClusters"],
  Resource: "*",
}

export const adminDynamodbTable = (tableName: string): Array<PolicyStatement> => [
  {
    Effect: "Allow",
    Action: ["dynamodb:*"],
    Resource: `arn:aws:dynamodb:*:*:table/${tableName}`,
  },
  {
    Effect: "Deny",
    Action: ["dynamodb:DeleteTable"],
    Resource: `arn:aws:dynamodb:*:*:table/${tableName}`,
  },
]

export const readWriteDynamodbTable = (tableName: string | Output<string>): Array<PolicyStatement> => [
  {
    Effect: "Allow",
    Action: ["dynamodb:GetItem", "dynamodb:PutItem", "dynamodb:DeleteItem"],
    Resource: interpolate`arn:aws:dynamodb:*:*:table/${tableName}`,
  }
]

export const readSecretsManager = (secretNames: Array<string>): Array<PolicyStatement> => [
  {
    Effect: "Allow",
    Action: ["kms:DescribeKey", "kms:ListResourceTags", "kms:ListAliases", "kms:Decrypt", "kms:GenerateDataKey"],
    Resource: "*",
  },
  {
    Action: ["secretsmanager:DescribeSecret", "secretsmanager:GetResourcePolicy", "secretsmanager:GetSecretValue"],
    Effect: "Allow",
    Resource: secretNames.map((name) => `arn:aws:secretsmanager:*:*:secret:${name}`),
  },
]
export const writeSecretsManager = (secretName: string): Array<PolicyStatement> => [
  {
    Effect: "Allow",
    Action: [
      "secretsmanager:CreateSecret",
      "secretsmanager:PutSecretValue",
      "secretsmanager:UpdateSecret",
      "secretsmanager:TagResource",
      "secretsmanager:DescribeSecret",
      "secretsmanager:GetResourcePolicy",
      "secretsmanager:GetSecretValue",
      "secretsmanager:DeleteSecret"
    ],
    Resource: `arn:aws:secretsmanager:*:*:secret:${secretName}*`
  }
]


export const adminMSKafka = (clusterName: string): Array<PolicyStatement> => [
  {
    Effect: "Allow",
    Action: ["kafka:*"],
    Resource: [
      interpolate`arn:aws:kafka:*:${awsAccountId()}:cluster/${clusterName}`,
      interpolate`arn:aws:kafka:*:${awsAccountId()}:cluster-operation/${clusterName}/*`,
    ],
  },
  {
    Effect: "Allow",
    Action: ["kafka:*Configuration", "kafka:DescribeConfigurationRevision", "kafka:ListConfigurationRevisions"],
    Resource: [`*`],
  },
  {
    Effect: "Deny",
    Action: ["kafka:DeleteConfiguration"],
    Resource: [`*`],
  },
  {
    Effect: "Allow",
    Action: [				
      "ec2:DescribeSubnets",
      "ec2:DescribeVpcs",
      "ec2:DescribeSecurityGroups",
      "ec2:DescribeRouteTables",
      "ec2:DescribeVpcEndpoints",
      "ec2:DescribeVpcAttribute"
  ],
    Resource: ["*"],
  },
  {
    Effect: "Allow",
    Action: [
      "ec2:CreateVpcEndpoint"
    ],
    Resource: [
      "arn:*:ec2:*:*:vpc/*",
      "arn:*:ec2:*:*:subnet/*",
      "arn:*:ec2:*:*:security-group/*"
    ]
  },
  {
    Effect: "Allow",
    Action: [
      "ec2:CreateVpcEndpoint"
    ],
    Resource: [
      "arn:*:ec2:*:*:vpc-endpoint/*"
    ],
    Condition: {
      "StringEquals": {
        "aws:RequestTag/AWSMSKManaged": "true"
      },
      "StringLike": {
        "aws:RequestTag/ClusterArn": "*"
      }
    }
  },
  {
    Effect: "Allow",
    Action: [
      "ec2:CreateTags"
    ],
    Resource: "arn:*:ec2:*:*:vpc-endpoint/*",
    Condition: {
      "StringEquals": {
        "ec2:CreateAction": "CreateVpcEndpoint"
      }
    }
  },
  {
    Effect: "Allow",
    Action: [
      "ec2:DeleteVpcEndpoints"
    ],
    Resource: "arn:*:ec2:*:*:vpc-endpoint/*",
    Condition: {
      "StringEquals": {
        "ec2:ResourceTag/AWSMSKManaged": "true"
      },
      "StringLike": {
        "ec2:ResourceTag/ClusterArn": "*"
      }
    }
  },
  {
    Effect: "Allow",
    Action: [
      "kms:Create*", 
      "kms:DescribeKey", 
      "kms:Get*", 
      "kms:List*", 
      "kms:TagResource",
      "kms:Encrypt",
      "kms:Decrypt",
      "kms:GenerateDataKey",
      "kms:GenerateDataKeyWithoutPlaintext",
      "kms:DescribeKey",
      "kms:CreateGrant"
    ],
    Resource: [interpolate`arn:aws:kms:*:${awsAccountId()}:key/*`],
  },
  {
    Action: [
      "kms:CreateKey",
      "kms:ListKeys",
      "kms:ListAliases",
      "kms:ListResourceTags"
    ],
    Effect: "Allow",
    Resource: [
      "*"
    ]
  },
  {
    Effect: "Allow",
    Action: "iam:CreateServiceLinkedRole",
    Resource: "arn:aws:iam::*:role/aws-service-role/kafka.amazonaws.com/AWSServiceRoleForKafka*",
    Condition: {
        "StringEquals": {
            "iam:AWSServiceName": "kafka.amazonaws.com"
        }
    }
},
{
    Effect: "Allow",
    Action: "iam:CreateServiceLinkedRole",
    Resource: "arn:aws:iam::*:role/aws-service-role/delivery.logs.amazonaws.com/AWSServiceRoleForLogDelivery*",
    Condition: {
        "StringEquals": {
            "iam:AWSServiceName": "delivery.logs.amazonaws.com"
        }
    }
}
]

export const readWriteEC2SecurityGroup = (applicationName: string): Array<PolicyStatement> => [
  {
    Effect: "Allow",
    Action: [
      "ec2:DescribeSecurityGroups",
      "ec2:DescribeSecurityGroupRules",
      "ec2:DescribeVpcs",
      "ec2:DescribeNetworkInterfaces"
    ],
    Resource: "*",
  },
  {
    Effect: "Allow",
    Action: [
      "ec2:AuthorizeSecurityGroupIngress",
      "ec2:RevokeSecurityGroupIngress",
      "ec2:UpdateSecurityGroupRuleDescriptionsIngress",
      "ec2:AuthorizeSecurityGroupEgress",
      "ec2:RevokeSecurityGroupEgress",
      "ec2:UpdateSecurityGroupRuleDescriptionsEgress",
      "ec2:ModifySecurityGroupRules",
    ],
    Resource: `arn:aws:ec2:*:*:security-group/*`,
    Condition: {
      StringEquals: {
        "ec2:ResourceTag/application": applicationName,
      },
    },
  },
  {
    Effect: "Allow",
    Action: ["ec2:CreateSecurityGroup"],
    Resource: "arn:aws:ec2:*:*:security-group/*",
    Condition: {
      StringEquals: {
        "aws:RequestTag/application": applicationName,
      },
      "ForAllValues:StringEquals": {
        "aws:TagKeys": ["application", "env", "managed_by"],
      },
    },
  },
  {
    Effect: "Allow",
    Action: ["ec2:CreateTags"],
    Resource: "arn:aws:ec2:*:*:security-group/*",
    Condition: {
      StringEquals: {
        "ec2:CreateAction": "CreateSecurityGroup",
      },
    },
  },
  {
    Effect: "Allow",
    Action: "ec2:CreateSecurityGroup",
    Resource: "arn:aws:ec2:*:*:vpc/*",
    Condition: {
        StringEquals: {
            "aws:ResourceTag/Name": [
                "dev",
                "staging",
                "production"
            ],
            "aws:ResourceTag/managed_by": "Pulumi"
        }
    }
}
]

export const adminRds = (instanceName: string): Array<PolicyStatement> => [
  {
    Effect: "Allow",
    Action: [
      "rds:AddTagsToResource",
      "rds:CreateDBInstanceReadReplica",
      "rds:CreateDBSubnetGroup",
      "rds:CreateDbInstance",
      "rds:DescribeDBInstances",
      "rds:DescribeDBSubnetGroups",
      "rds:ModifyDbInstance",
    ],
    Resource: [`arn:*:rds:*:*:db:${instanceName}-*`, `arn:*:rds:*:*:subgrp:${instanceName}-*`],
  },
  {
    Effect: "Allow",
    Action: [
      "rds:*DBParameterGroup",
      "rds:DescribeDBClusterParameterGroups",
      "rds:CreateDBClusterParameterGroup",
      "rds:ModifyDBClusterParameterGroup",
      "rds:DescribeDBClusterParameters",
      "rds:DeleteDBClusterParameterGroup",
      "rds:CreateDBCluster",
      "rds:ModifyDBCluster",
      "rds:DescribeDBClusters",
      "rds:DescribeGlobalClusters",
      "rds:CreateDBInstance",
      "rds:ModifyDBInstance",
      "rds:CreateDBSubnetGroup",
      "rds:AddTagsToResource",
      "rds:DescribeDBSubnetGroups",
      "rds:CreateDBParameterGroup",
      "rds:DescribeDBParameterGroups",
      "rds:DescribeDBParameters",
      "rds:CreateDBClusterParameterGroup",
    ],
    Resource: [
      `arn:*:rds:*:*:pg:${instanceName}-*`,
      `arn:*:rds:*:*:cluster-pg:${instanceName}-*`,
      `arn:*:rds:*:*:cluster:${instanceName}-*`,
      `arn:*:rds:*:*:subgrp:*`,
      `arn:*:rds::*:global-cluster:*`,
      "arn:*:rds:*:*:pg:*",
      "arn:*:rds:*:*:cluster-pg:*"
    ]
  },
  {
    Effect: "Allow",
    Action: ["rds:ListTagsForResource"],
    Resource: `*`,
  },
  {
    Effect: "Allow",
    Action: ["iam:PassRole"],
    Resource: `arn:aws:iam::*:role/rds-monitoring-role`,
  },
  {
    Action: ["ec2:DescribeVpc*", "ec2:DescribeSubnets", "ec2:DescribeAvailabilityZones"],
    Effect: "Allow",
    Resource: "*",
  },
  {
    Action: "iam:CreateServiceLinkedRole",
    Effect: "Allow",
    Resource: "arn:aws:iam::*:role/aws-service-role/rds.amazonaws.com/AWSServiceRoleForRDS",
    Condition: {
      StringLike: {
        "iam:AWSServiceName": "rds.amazonaws.com",
      },
    },
  },
  ...readWriteEC2SecurityGroup(instanceName),
  ...managedPrefixListAdmin(),
]

export const adminS3Bucket = (bucketNamePrefix: string): Array<PolicyStatement> => [
  {
    Sid: "AllowOnAllS3Resources",
    Effect: "Allow",
    Action: [
        "s3:ListStorageLensConfigurations",
        "s3:ListAccessPointsForObjectLambda",
        "s3:GetAccessPoint",
        "s3:PutAccountPublicAccessBlock",
        "s3:GetAccountPublicAccessBlock",
        "s3:ListAllMyBuckets",
        "s3:ListAccessPoints",
        "s3:ListJobs",
        "s3:PutStorageLensConfiguration",
        "s3:ListMultiRegionAccessPoints",
        "s3:CreateJob"
    ],
    Resource: "*"
  },
  {
    Sid: "AllowAllOnProjectPrefix",
    Effect: "Allow",
    Action: ["s3:*"],
    Resource: [
      `arn:aws:s3:::${bucketNamePrefix}-*`,
      `arn:aws:s3:::${bucketNamePrefix}-*/*`,
    ]
  },
]

export const adminSQS = (sqsNamePrefix: string): Array<PolicyStatement> => [
  {
    Sid: "AllowAllActionsOnSpecificPrefix",
    Effect: "Allow",
    Action: ["sqs:*"],
    Resource: [
      interpolate`arn:aws:sqs:*:${awsAccountId()}:${sqsNamePrefix}-*`
    ]
  },
]

export const sendMessageSQS = (destinationQueues: Output<string>[]): Array<PolicyStatement> => [
  {
    Sid: "AllowSendMessageOnSpecificPrefix",
    Effect: "Allow",
    Action: [
      "sqs:SendMessage"
    ],
    Resource: destinationQueues
  },
]

export const adminACM = (awsRegion: string): Array<PolicyStatement> => [
  {
    Effect: "Allow",
    Action: [
      "acm:*"
    ],
    Resource: interpolate`arn:aws:acm:${awsRegion}:${awsAccountId()}:certificate/*`
  },
  {
    Effect: "Allow",
    Action: "iam:CreateServiceLinkedRole",
    Resource: "arn:aws:iam::*:role/aws-service-role/acm.amazonaws.com/AWSServiceRoleForCertificateManager*",
    Condition: {
       "StringEquals":{
          "iam:AWSServiceName":"acm.amazonaws.com"
       }
    }
  },
]

export const updateRoute53Record = (hostedZonesIds: Output<string>[]): Array<PolicyStatement> => [
  {
    Effect: "Allow",
    Action: [
      "route53:GetHostedZone",
      "route53:ChangeResourceRecordSets",
      "route53:ListResourceRecordSets",
      "route53:ListTagsForResource"
    ],
    Resource: hostedZonesIds,
  },
  {
    Effect: "Allow",
    Action: [
      "route53:GetChange"
    ],
    "Resource": "arn:aws:route53:::change/*",
  },
  {
    Effect: "Allow",
    Action: [
      "route53:ListHostedZones"
    ],
    "Resource": "*"
  }
]

export const readWriteRoute53Record = (theKinLinkHostedZonesId:string): Array<PolicyStatement> => [
  {
    Effect: "Allow", 
    Action: [
      "route53:ListTagsForResources",
      "route53:GetChange",
      "route53:GetHostedZone",
      "route53:ChangeResourceRecordSets",
      "route53:ListResourceRecordSets",
      "route53:ListTagsForResource"
    ],
    Resource: [
      interpolate`arn:aws:route53:::hostedzone/${theKinLinkHostedZonesId}`,
    ]
  },
  {
    Effect: "Allow",
    Action: [
      "route53:ListHostedZones"
    ],
    Resource: "*"
  },
  {
    Effect: "Allow",
    Action: [
        "route53:GetChange"
    ],
    Resource: "arn:aws:route53:::change/*"
  },
]

export const readWriteCloudFront: Array<PolicyStatement> = [
  {
    Effect: "Allow",
    Action: [
      "acm:ListCertificates", 
      "cloudfront:CreateDistribution",
      "cloudfront:CreateInvalidation",
      "cloudfront:GetDistribution",
      "cloudfront:GetDistributionConfig",
      "cloudfront:GetInvalidation",
      "cloudfront:DeleteDistribution",
      "cloudfront:ListDistributions",
      "cloudfront:ListInvalidations",
      "cloudfront:UpdateDistribution",
      "cloudfront:GetCloudFrontOriginAccessIdentity",
      "cloudfront:ListCloudFrontOriginAccessIdentities",
      "cloudfront:CreateCloudFrontOriginAccessIdentity",
      "cloudfront:UpdateCloudFrontOriginAccessIdentity",
      "cloudfront:TagResource",
      "cloudfront:ListTagsForResource",
      "elasticloadbalancing:DescribeLoadBalancers",
      "iam:ListServerCertificates",
      "sns:ListSubscriptionsByTopic",
      "sns:ListTopics",
      "waf:GetWebACL",
      "waf:ListWebACLs"
    ],
    Resource: "*"
  }
]

export const adminGlue = (GlueDbPrefix: string):Array<PolicyStatement> => [
  {
    Effect: "Allow",
    Action: [
        "glue:SearchTables",
        "glue:UpdateDatabase",
        "glue:CreateTable",
        "glue:GetDataCatalogEncryptionSettings",
        "glue:DeleteDatabase",
        "glue:GetTables",
        "glue:GetTableVersions",
        "glue:UpdateTable",
        "glue:DeleteTableVersion",
        "glue:DeleteTable",
        "glue:GetDatabases",
        "glue:GetTable",
        "glue:GetDatabase",
        "glue:GetTableVersion",
        "glue:CreateDatabase"
    ],
    Resource: [
        "arn:aws:glue:*::table/*/*",
        "arn:aws:glue:*::catalog",
        interpolate`arn:aws:glue:*::database/${GlueDbPrefix}*`
    ]
  }
]

export const athenaQuery = (): Array<PolicyStatement> => [
  {
    Effect: "Allow",
    Action: [
      "athena:GetTableMetadata",
      "athena:StartQueryExecution",
      "athena:GetQueryResults",
      "athena:GetDatabase",
      "athena:GetDataCatalog",
      "athena:DeleteNamedQuery",
      "athena:GetNamedQuery",
      "athena:StopQueryExecution",
      "athena:CreateDataCatalog",
      "athena:ListNamedQueries",
      "athena:CreateNamedQuery",
      "athena:ListDatabases",
      "athena:DeleteDataCatalog",
      "athena:GetQueryExecution",
      "athena:ListTableMetadata"
    ],
    Resource: [
      "arn:aws:athena:*::workgroup/*",
      "arn:aws:athena:*::datacatalog/*"
    ]
  }
]

export const cloudwatchMonitoring  = (projectName:string): Array<PolicyStatement> => [
  {
    Effect: "Allow",
    Action: [
      "cloudwatch:PutMetricAlarm",
      "cloudwatch:ListTagsForResource",
      "cloudwatch:DescribeAlarms",
      "cloudwatch:PutMetricAlarm",
      "cloudwatch:DeleteAlarms",
    ],
    Resource: `arn:aws:cloudwatch:*:*:alarm:*${projectName}-*`,
  }
]

export const snsMonitoring  = (projectName:string): Array<PolicyStatement> => [
  {
    Effect: "Allow",
    Action: [
      "sns:ListSubscriptionsByTopic",
      "sns:ListTopics",
      "sns:CreateTopic",
      "sns:SetTopicAttributes",
      "sns:GetTopicAttributes",
      "sns:Unsubscribe",
      "sns:GetSubscriptionAttributes",
      "sns:TagResource",
      "sns:Subscribe",
      "sns:DeleteTopic",
      "sns:ListTagsForResource"
    ],
    Resource: `arn:aws:sns:*:*:${projectName}-*`
  }
]

export const readWriteElastiCache = (projectName:string): Array<PolicyStatement> => [
  {
    Effect: "Allow",
    Action: [
      "elasticache:CreateCacheCluster",
      "elasticache:DescribeCacheClusters",
      "elasticache:ModifyCacheCluster",
      "elasticache:CreateCacheParameterGroup",
      "elasticache:DescribeCacheParameterGroups",
      "elasticache:ModifyCacheParameterGroup",
      "elasticache:CreateReplicationGroup",
      "elasticache:DescribeReplicationGroups",
      "elasticache:ModifyReplicationGroup",
      "elasticache:CreateCacheSubnetGroup",
      "elasticache:DescribeCacheSubnetGroups",
      "elasticache:ModifyCacheSubnetGroup",
      "elasticache:DescribeCacheParameters",
      "elasticache:AddTagsToResource",
      "elasticache:ListTagsForResource"
    ],
    Resource: [
      `arn:aws:elasticache:*:*:cluster:${projectName}-*`,
      `arn:aws:elasticache:*:*:parametergroup:${projectName}-*`,
      `arn:aws:elasticache:*:*:replicationgroup:${projectName}-*`,
      `arn:aws:elasticache:*:*:subnetgroup:${projectName}-*`
    ]
  }
]

export const cloudwatchLogging  = (projectName:string): Array<PolicyStatement> => [
  {
    Effect: "Allow",
    Action: [
      "logs:CreateLogDelivery",
      "logs:GetLogDelivery",
      "logs:UpdateLogDelivery",
      "logs:DeleteLogDelivery",
      "logs:ListLogDeliveries",
      "logs:PutResourcePolicy",
      "logs:DescribeResourcePolicies",
      "logs:DescribeLogGroups",
    ],
    Resource: "*",
  },
]

export const kafkaClusterAdmin  = (projectName:string, environment: string): Array<PolicyStatement> => [
  {
    Effect: "Allow",
    Action: [
        "kafka-cluster:*"
    ],
    Resource: [
        `arn:aws:kafka:*:*:*/${projectName}-${environment}/*`
    ]
}
]

export const managedPrefixListAdmin = (): Array<PolicyStatement> => [
  {
    Effect: "Allow",
    Action: [
      "ec2:CreateManagedPrefixList",
      "ec2:DeleteManagedPrefixList",
      "ec2:GetManagedPrefixListAssociations",
      "ec2:GetManagedPrefixListEntries",
      "ec2:ModifyManagedPrefixList",
      "ec2:RestoreManagedPrefixListVersion"
    ],
    Resource: "arn:aws:ec2:*:*:prefix-list/*"
  },
  {
    Action: [
      "ec2:CreateTags"
    ],
    Condition: {
      "StringEquals": {
        "ec2:CreateAction": "CreateManagedPrefixList"
      }
    },
    Effect: "Allow",
    Resource: "arn:aws:ec2:*:*:prefix-list/*"
  },
  {
    Effect: "Allow",
    Action: "ec2:DescribeManagedPrefixLists",
    Resource: "*"
  },
]

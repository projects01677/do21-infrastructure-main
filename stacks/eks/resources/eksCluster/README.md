https://docs.aws.amazon.com/eks/latest/userguide/create-managed-node-group.html

* If you are running a stateful application across multiple Availability Zones that is backed by Amazon EBS volumes and using the Kubernetes Cluster Autoscaler, you should configure multiple node groups, each scoped to a single Availability Zone. In addition, you should enable the --balance-similar-node-groups feature.


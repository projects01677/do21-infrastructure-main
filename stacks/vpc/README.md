# Note on provisioning new accounts and multiple VPCs

When adding more than one VPC to the same account, you may get an error like: 

    error: 1 error occurred:
	* Error creating EIP: AddressLimitExceeded: The maximum number of addresses has been reached.

This is due to the standard allocation of 5 EIPs per account.

In this case, you must first login to the account and create a limit increase request using AWS support. This usually takes less than an hour. The specific service quota we need to increase is "[EC2-VPC Elastic IPs](https://us-east-1.console.aws.amazon.com/servicequotas/home/services/ec2/quotas/L-0263D0A3)" - we use 3 per environment.

Once the quota increase is completed, the deployment can be successfully re-run. 

Alternatively, one could simply request the quota increase after creating the account, but _before_ adding more than 1 VPC.
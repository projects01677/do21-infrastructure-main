# Rules

To create VPC peering between existing account and AAP Legacy Account, follow these rules:

1. Create VPC peering connection for existing (source) account, it will be [requester](../../vpc/index.ts).
2. Create VPC peering connection for AAP Legacy Account, it will be [accepter](index.ts).
3. Enable DNS resolution by setting the `allowRemoteVpcDnsResolution` parameter to `true`.

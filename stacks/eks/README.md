This Pulumi Project contains EKS clusters with core components:

* EKS Cluster
* Managed Node Groups
* AWS cluster autoscaler
* Public and internal ingress controllers
* Metrics server
* New Relic monitoring
* Improved Storage Class
* Maintenance page with cute dog
* Access management with IAM users/roles and Kubernetes RBAC
* Project namespaces

Accessing Kubernetes dashboard

*  Retrieve an authentication token for the service account
kubectl -n kube-system describe secret $(kubectl -n kube-system get secret | grep eks-admin | awk '{print $1}')

* Start kubectl proxy 
kubectl proxy

* To access the dashboard endpoint, open the following link with a web browser:
http://localhost:8001/api/v1/namespaces/kubernetes-dashboard/services/https:kubernetes-dashboard:/proxy/#!/login

* Choose Token, paste the <authentication_token> from 1st step. 

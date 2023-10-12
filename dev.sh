docker build -t infra .
docker run --rm -it \
    -v "$(pwd)":/code:cached \
    -v do21_k8s_pulumi_cache:/root/.pulumi \
    -v do21_k8s_node_modules:/code/node_modules \
    -v "/var/run/docker.sock:/var/run/docker.sock:rw" \
    -v $HOME/.aws:/root/.aws \
    -v $HOME/.kube:/root/.kube \
    infra

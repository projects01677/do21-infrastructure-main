docker build --progress plain -f Dockerfile-whistle -t infra-whistle .
docker run --rm -it \
    -v "$(pwd)":/code:cached \
    -v do21_whistle_k8s_pulumi_cache:/root/.pulumi \
    -v do21_whistle_k8s_node_modules:/code/node_modules \
    -v "/var/run/docker.sock:/var/run/docker.sock:rw" \
    -v $HOME/.aws:/root/.aws \
    -v $HOME/.kube:/root/.kube \
    --env-file $(pwd)/.env.docker.whistle \
    infra-whistle

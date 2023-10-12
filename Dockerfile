FROM node:16-alpine3.13

RUN apk update && apk add curl aws-cli openssl && \
    rm -rf /var/cache/apk/*

ENV PATH=$PATH:/root/.pulumi/bin
ARG PULUMI_VERSION="3.42.0"
RUN apk add libc6-compat tzdata && \
    curl -fsSL https://get.pulumi.com/ | sh -s -- --version $PULUMI_VERSION

ARG KUBECTL_VERSION="v1.21.0"
RUN curl -o /bin/kubectl -L https://storage.googleapis.com/kubernetes-release/release/$KUBECTL_VERSION/bin/linux/amd64/kubectl && \
    chmod +x /bin/kubectl

RUN apk add --update docker openrc && \
    rc-update add docker boot

WORKDIR /code
ENTRYPOINT ["sh"]

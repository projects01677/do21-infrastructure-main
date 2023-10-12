FROM node:15.14.0-alpine3.13

WORKDIR /code
COPY package.json yarn.lock ./
RUN yarn install --prod
COPY . .
ENTRYPOINT ["yarn", "run", "startServer"]
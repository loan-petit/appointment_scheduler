FROM node:alpine

ENV NODE_ENV production

WORKDIR /app

RUN apk update && apk upgrade && \
    apk add --no-cache git openssh

# Install dependencies before pushing the rest of the code in order to use
# cached dependencies when a file other than the package.json is changed in
# the current host directory
COPY ./package.json ./
RUN npm install

COPY . .
RUN npm run build

CMD [ "npm", "start" ]
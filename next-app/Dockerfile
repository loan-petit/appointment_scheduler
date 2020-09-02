# syntax = docker/dockerfile:1.0-experimental
FROM node:alpine

ENV NODE_ENV production

WORKDIR /app

# Install dependencies before pushing the rest of the code in order to use
# cached dependencies when a file other than the package.json is changed in
# the current host directory
COPY ./package.json ./

RUN npm install

COPY . .

# Build web app for production
RUN --mount=type=secret,id=GOOGLE_CLIENT_ID \
    npm run build

# Start server
CMD ["npm", "start"]

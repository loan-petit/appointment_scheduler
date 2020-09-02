# syntax = docker/dockerfile:1.0-experimental
FROM node:alpine

RUN apk update && apk upgrade && apk add --no-cache git

# Create Prisma Dir
RUN mkdir /prisma
WORKDIR /prisma

# Install dependencies before pushing the rest of the code in order to use
# cached dependencies when a file other than the package.json is changed in
# the current host directory
RUN mkdir ./prisma/
COPY ./package.json ./
COPY ./prisma/schema.prisma ./prisma/
RUN npm install

# Copy code resources
COPY . .

# Generate Prisma clients
ARG POSTGRES_HOST
RUN --mount=type=secret,id=POSTGRES_PASSWORD \
    --mount=type=secret,id=JWT_SECRET \
    POSTGRES_URL=postgresql://prisma:$(cat /run/secrets/POSTGRES_PASSWORD)@${POSTGRES_HOST}:5432/appointment_scheduler?schema=public \
    npm run generate

# Build API for production
RUN npm run build

# Start GraphQL API
CMD ["npm", "start"]

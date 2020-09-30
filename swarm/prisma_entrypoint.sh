#!/bin/sh

set -euo pipefail

SECRETS="
  POSTGRES_PASSWORD
"

for secret in $SECRETS; do
  export "$secret"="$(cat /run/secrets/$secret)"
done

# Start Prisma API
cd /prisma
export POSTGRES_URL="postgresql://prisma:$POSTGRES_PASSWORD@$POSTGRES_HOST:5432/appointment_scheduler?schema=public"
npm start

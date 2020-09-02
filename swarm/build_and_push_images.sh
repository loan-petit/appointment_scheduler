#!/bin/bash
set -euo pipefail

SOURCE_DIR=$(dirname "${BASH_SOURCE[0]}")
SOURCE_PATH=$(readlink -e $SOURCE_DIR)

SECRETS_DIR="$SOURCE_PATH/.secrets"

function usage() {
  echo "Usage: $0 SERVICE_TO_BUILD..."
  echo "  --no-cache   Do not use cache when building images"
  exit 1
}

if ! [ -x "$(command -v docker)" ]; then
  echo 'Error: docker is not installed.' >&2
  exit 1
fi

NO_CACHE=""

POSITIONAL=()
while [[ $# -gt 0 ]]; do
  key="$1"

  case $key in
  -h | --help)
    usage
    ;;
  --no-cache)
    NO_CACHE="$1"
    shift
    ;;
  *)                   # unknown option
    POSITIONAL+=("$1") # save it in an array for later
    shift              # past argument
    ;;
  esac
done
set -- "${POSITIONAL[@]}" # restore positional parameters

# Build every services if none was specified
if [ ${#POSITIONAL[@]} -eq 0 ]; then
  POSITIONAL=(
    "next_app"
    "prisma"
    "send_email"
  )
fi

for service in "${POSITIONAL[@]}"; do
  if [ "$service" == "next_app" ]; then
    # Build Docker image for 'next_app' service.
    DOCKER_BUILDKIT=1 docker build $NO_CACHE --tag petitloan/appointment_scheduler:next_app \
      --secret id=GOOGLE_CLIENT_ID,src=$SECRETS_DIR/GOOGLE_CLIENT_ID.txt \
      $SOURCE_DIR/../next-app
  fi

  if [ "$service" == "prisma" ]; then
    # Build Docker image for 'prisma' service.
    DOCKER_BUILDKIT=1 docker build $NO_CACHE --tag petitloan/appointment_scheduler:prisma \
      --build-arg POSTGRES_HOST=www.appointment-scheduler.loanpetit.com \
      --secret id=POSTGRES_PASSWORD,src=$SECRETS_DIR/POSTGRES_PASSWORD.txt \
      --secret id=JWT_SECRET,src=$SECRETS_DIR/JWT_SECRET.txt \
      $SOURCE_DIR/../prisma
  fi

  if [ "$service" == "send_email" ]; then
    # Build Docker image for 'sendmail' service.
    docker build $NO_CACHE --tag petitloan/appointment_scheduler:send_email $SOURCE_DIR/../send_email
  fi
done

# Push builded images to Docker Hub 'petitloan/appointment_scheduler' repository
docker push petitloan/appointment_scheduler

#!/bin/bash
set -e

gcloud auth login

PROJ_ID=$(gcloud config get-value project)

gcloud artifacts repositories create jamboree \
  --repository-format=docker \
  --location=us-east4 \
  --description="Jamboree App Container Repo"

docker compose build --no-cache jamboree-app
docker tag jamboree-app:latest us-east4-docker.pkg.dev/${PROJ_ID}/jamboree/jamboree-app:latest
gcloud auth configure-docker us-east4-docker.pkg.dev
docker push us-east4-docker.pkg.dev/${PROJ_ID}/jamboree/jamboree-app:latest

gcloud run deploy ridgewood-jamboree \
  --region us-east4 \
  --allow-unauthenticated \
  --image us-east4-docker.pkg.dev/${PROJ_ID}/jamboree/jamboree-app:latest \
  --env-vars-file .env
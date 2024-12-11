FROM node:12.18.3-alpine3.11

WORKDIR /vact-nest

COPY package.json .
COPY package-lock.json .

RUN apk update && apk add rsync && npm install --silent && rm -rf /var/lib/apt/lists/*

COPY / .

RUN chmod +x entrypoint.sh

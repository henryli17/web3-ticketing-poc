FROM node:alpine

COPY --from=flyio/litefs:0.3 /usr/local/bin/litefs /usr/local/bin/litefs

ADD backend/etc/litefs.yml /etc/litefs.yml
ADD backend/package.json backend/package.json
ADD backend/package-lock.json backend/package-lock.json
ADD frontend/package.json frontend/package.json
ADD frontend/package-lock.json frontend/package-lock.json

RUN apk add bash fuse sqlite ca-certificates curl g++ make py3-pip

WORKDIR /frontend

RUN npm install --legacy-peer-deps

ADD /frontend .

RUN npm run build

WORKDIR /backend

RUN npm install

ADD /backend .

ENTRYPOINT litefs mount -- npx node src/index.js

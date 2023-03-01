FROM node:alpine

COPY --from=flyio/litefs:0.3 /usr/local/bin/litefs /usr/local/bin/litefs

ADD etc/litefs.yml /etc/litefs.yml

RUN apk add bash fuse sqlite ca-certificates curl g++ make py3-pip

COPY ["package.json", "package-lock.json*", "./"]

RUN npm install

COPY . .

ENTRYPOINT litefs mount -- npx node src/index.js

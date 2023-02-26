# syntax=docker/dockerfile:1

FROM node:16.16.0-alpine

COPY ["package.json", "package-lock.json*", "./"]

RUN npm install

COPY . .

CMD [ "npm", "start" ]

#FROM node:9.1.0-alpine
FROM node:7.8.0-alpine

RUN apk update && apk upgrade && apk add --no-cache git
RUN apk update && apk upgrade && apk add --no-cache git python
RUN apk update && apk upgrade && apk add --no-cache make
RUN apk update && apk upgrade && apk add --no-cache g++

WORKDIR /app

COPY package.json /app/package.json
#COPY package-lock.json /app/package-lock.json

RUN npm install --production
RUN npm rebuild

COPY . /app

EXPOSE 3000

CMD npm start


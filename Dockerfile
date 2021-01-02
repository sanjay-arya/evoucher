FROM node:15.5.0-alpine3.10

WORKDIR /usr/src/app

ADD package*.json ./
COPY build src
COPY ormconfig.json ./

RUN npm install
RUN npm install pm2 -g

CMD ["pm2-runtime","src/index.js"]
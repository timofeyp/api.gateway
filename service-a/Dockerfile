FROM node:latest

EXPOSE 6565

RUN mkdir -p /home/node/service-a/node_modules && chown -R node:node /home/node/service-a

WORKDIR /home/node/service-a

COPY package*.json ./

USER node

RUN npm install

COPY --chown=node:node . .

CMD [ "npm", "start" ]

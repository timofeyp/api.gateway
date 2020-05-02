FROM node:latest

RUN mkdir -p /home/node/service-b/node_modules && chown -R node:node /home/node/service-b

WORKDIR /home/node/service-b

COPY package*.json ./

USER node

RUN npm install

COPY --chown=node:node . .

CMD [ "npm", "start" ]
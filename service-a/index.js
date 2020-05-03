'use strict';

const Hapi = require('@hapi/hapi');
const joi = require('@hapi/joi');
const OS = require('os');
const HapiHemera = require('hapi-hemera');

const init = async () => {
  const server = Hapi.server({
    port: process.env.API_PORT,
    host: OS.hostname(),
  });

  server.route({
    method: 'GET',
    path: '/',
    handler: async (request, h) =>
      request.hemera.act({
        topic: 'auth',
        cmd: 'authorize',
        headers: request.headers,
        payload: request.query,
      }),
    options: {
      validate: {
        query: joi.object({ kladrId: joi.string().min(3).max(40).required() }),
      },
    },
  });

  await server.register({
    plugin: HapiHemera,
    options: {
      hemera: {
        name: 'service-a',
        logLevel: 'debug',
        childLogger: true,
        tag: 'hemera-api-gw',
      },
      nats: {
        url: process.env.NATS_URL,
        user: process.env.NATS_USER,
        pass: process.env.NATS_PW,
      },
    },
  });

  await server.start();
  console.log('Server running on %s', server.info.uri);
};

process.on('unhandledRejection', (err) => {
  console.log(err);
  process.exit(1);
});

init();

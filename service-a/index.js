'use strict';

const Hapi = require('@hapi/hapi');
const HapiHemera = require('hapi-hemera');

const init = async () => {

    const server = Hapi.server({
        port: 6565,
        host: 'localhost'
    });

    server.route({
        method: 'GET',
        path: '/',
        handler: (request, h) => {
            request.hemera.act({
                topic: 'auth',
                cmd: 'authorize',
                headers: request.headers,
                payload: request.payload
            })
        }
    });

    await server.register({
        plugin: HapiHemera,
        options: {
            hemera: {
                name: 'service-a',
                logLevel: 'debug',
                childLogger: true,
                tag: 'hemera-api-gw-1'
            },
            nats: {
                url: 'nats://nats:4222',
                user: 'ruser',
                pass: 'T0pS3cr3t'
            },
        }
    });

    await server.start();
    console.log('Server running on %s', server.info.uri);
};

process.on('unhandledRejection', (err) => {
    console.log(err);
    process.exit(1);
});

init();
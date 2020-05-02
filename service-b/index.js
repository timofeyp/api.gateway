const Nats = require('nats');
const Hemera = require('nats-hemera');
const HemeraJoi = require('hemera-joi');

const nats = Nats.connect({
    url: 'nats://nats:4222',
    user: 'ruser',
    pass: 'T0pS3cr3t'
});

const hemera = new Hemera(nats, {
    logLevel: 'debug',
    childLogger: true,
    tag: 'hemera-auth'
});

hemera.use(HemeraJoi);

hemera.ready(() => {
    hemera.add(
        {
            topic: 'auth',
            cmd: 'authorize',
            headers: hemera.joi.any()
        }, (req, res) => {
            console.log(req);
            console.log(res);
        });
});



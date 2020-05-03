const Nats = require('nats');
const Hemera = require('nats-hemera');
const HemeraJoi = require('hemera-joi');
const dadata = require('dadata')(
  process.env.DADATA_API_KEY,
  process.env.DADATA_SECRET_KEY,
);

const requestDadata = (kladrId) =>
  new Promise((resolve, reject) =>
    dadata('address', [kladrId], (err, response) => {
      if (err) {
        return reject(err);
      }
      const [data] = response;
      return resolve({
        country_iso_code: data.country_iso_code,
        region: data.region,
        region_kladr_id: data.region_kladr_id,
        region_iso_code: data.region_iso_code,
        region_fias_id: data.region_fias_id,
      });
    }),
  );

const nats = Nats.connect({
  url: process.env.NATS_URL,
  user: process.env.NATS_USER,
  pass: process.env.NATS_PW,
});

const hemera = new Hemera(nats, {
  logLevel: 'debug',
  childLogger: true,
  tag: 'hemera-auth',
});

hemera.use(HemeraJoi);

hemera.ready(() => {
  hemera.add(
    {
      topic: 'auth',
      cmd: 'authorize',
      headers: hemera.joi.any(),
      payload: {
        kladrId: hemera.joi.string().required(),
      },
      postJoi$: {
        country_iso_code: hemera.joi.any().required(),
        region: hemera.joi.any().required(),
        region_kladr_id: hemera.joi.any().required(),
        region_iso_code: hemera.joi.any().required(),
        region_fias_id: hemera.joi.any().required(),
      },
    },
    async (req, res) => {
      const { kladrId } = req.payload;
      const data = await requestDadata(kladrId);
      res(null, data);
    },
  );
});

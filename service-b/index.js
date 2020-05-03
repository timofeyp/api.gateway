const Nats = require('nats');
const https = require('https');
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

const makeRequest = (kladrId) =>
  new Promise((resolve, reject) => {
    const postData = JSON.stringify({
      query: kladrId,
    });

    const options = {
      hostname: 'suggestions.dadata.ru',
      method: 'POST',
      path: '/suggestions/api/4_1/rs/findById/address',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Token 7ded06bb51064631958927b26e115effbfaa9a41`,
      },
    };

    const req = https.request(options, (res) => {
      console.log(`statusCode: ${res.statusCode}`);

      res.on('data', (d) => {
        const json = d.toString();
        const response = JSON.parse(json);
        let suggestions;
        if (response.suggestions.length) {
          const [{ data }] = response.suggestions;
          suggestions = data;
        }
        if (suggestions) {
          resolve({
            country_iso_code: suggestions.country_iso_code,
            region: suggestions.region,
            region_kladr_id: suggestions.region_kladr_id,
            region_iso_code: suggestions.region_iso_code,
            region_fias_id: suggestions.region_fias_id,
          });
        } else {
          resolve({
            country_iso_code: null,
            region: null,
            region_kladr_id: null,
            region_iso_code: null,
            region_fias_id: null,
          });
        }
      });
    });
    req.on('error', (error) => {
      reject(error);
    });
    req.write(postData);
    req.end();
  });

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
      try {
        const data = await makeRequest(kladrId);
        res(null, data);
      } catch (e) {
        res(e);
      }
    },
  );
});

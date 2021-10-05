const express = require('express');
const Swagger = require('swagger-client');
const db = require('../db/models');
const bodyparser = require('body-parser');
const bookRouter = require('./bookRouter');
const branchRouter = require('./branchRouter');
const { initContract } = require ('./block.js');

const {
  KALEIDO_AUTH_USERNAME,
  KALEIDO_AUTH_PASSWORD,
  PORT,
  FROM_ADDRESS
} = require('../config');

const app = express();
let swaggerClient; // Initialized in init()

app.use(bodyparser.json());
app.use('/api/books', bookRouter);
app.use('/api/branches', branchRouter);
db.sequelize.authenticate();


app.post('/api/contract', async (req, res) => {
  // Note: we really only want to deploy a new instance of the contract
  //       when we are initializing our on-chain state for the first time.
  //       After that the application should keep track of the contract address.
  try {
    let postRes = await swaggerClient.apis.default.constructor_post({
      body: {
        // Here we set the constructor parameters
        x: req.body.x || 'initial value'
      },
      "kld-from": FROM_ADDRESS,
      "kld-sync": "true"
    });
    res.status(200).send(postRes.body)
    console.log("Deployed instance: " + postRes.body.contractAddress);
  }
  catch(err) {
    res.status(500).send({error: `${err.response && JSON.stringify(err.response.body)}\n${err.stack}`});
  }
});

app.post('/api/contract/:address/value', async (req, res) => {
  try {
    let postRes = await swaggerClient.apis.default.set_post({
      address: req.params.address,
      body: {
        x: req.body.x
      },
      "kld-from": FROM_ADDRESS,
      "kld-sync": "true"
    });
    res.status(200).send(postRes.body)
  }
  catch(err) {
    res.status(500).send({error: `${err.response && JSON.stringify(err.response.body) && err.response.text}\n${err.stack}`});
  }
});

app.get('/api/contract/:address/value', async (req, res) => {
  try {
    let postRes = await swaggerClient.apis.default.get_get({
      address: req.params.address,
      body: {
        x: req.body.x
      },
      "kld-from": FROM_ADDRESS,
      "kld-sync": "true"
    });
    res.status(200).send(postRes.body)
  }
  catch(err) {
    res.status(500).send({error: `${err.response && JSON.stringify(err.response.body) && err.response.text}\n${err.stack}`});
  }
});

async function init() {
  // Store a singleton swagger client for us to use
  const spec = await initContract();
  swaggerClient = await Swagger(spec, {
    requestInterceptor: req => {
      req.headers.authorization = `Basic ${Buffer.from(`${KALEIDO_AUTH_USERNAME}:${KALEIDO_AUTH_PASSWORD}`).toString("base64")}`;
    }
  });

  // Start listening
  app.listen(PORT, () => console.log(`Kaleido DApp backend listening on port ${PORT}!`))
}

init().catch(err => {
  console.error(err.stack);
  process.exit(1);
});


module.exports = {
  app
};

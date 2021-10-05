// block.js - Module for on-chain operations.

const {
  KALEIDO_AUTH_USERNAME,
  KALEIDO_AUTH_PASSWORD,
  KALEIDO_REST_GATEWAY_URL,
  CONTRACT_CLASS_NAME,
  CONTRACT_MAIN_SOURCE_FILE,
  FROM_ADDRESS
} = require('../config');
// const fs = require('fs'); // for saving
const request = require('request-promise-native');
const archiver = require('archiver');
const { URL } = require('url');
const { Contract, Book } = require('../db/models');

let nftContract; // module global for cache

async function initContract() {
  // Kaleido example for compilation of your Smart Contract and generating a REST API
  // --------------------------------------------------------------------------------
  // Sends the contents of your contracts directory up to Kaleido on each startup.
  // Kaleido compiles you code and turns into a REST API (with OpenAPI/Swagger).
  // Instances can then be deployed and queried using this REST API
  // Note: we really only needed when the contract actually changes.

  let mainContract = await Contract.findOne({ where: { name: 'main' } });
  if (!mainContract) {
    const url = new URL(KALEIDO_REST_GATEWAY_URL);
    url.username = KALEIDO_AUTH_USERNAME;
    url.password = KALEIDO_AUTH_PASSWORD;
    url.pathname = "/abis";
    var archive = archiver('zip');
    archive.directory("contracts", "");
    await archive.finalize();
    // const output = fs.createWriteStream('target.zip');
    // archive.pipe(output);

    let res = await request.post({
      url: url.href,
      qs: {
        compiler: "0.6", // Compiler version
        source: CONTRACT_MAIN_SOURCE_FILE, // Name of the file in the directory
        contract: `${CONTRACT_MAIN_SOURCE_FILE}:${CONTRACT_CLASS_NAME}` // Name of the contract in the
      },
      json: true,
      headers: {
        'content-type': 'multipart/form-data',
      },
      formData: {
        file: {
          value: archive,
          options: {
            filename: 'smartcontract.zip',
            contentType: 'application/zip',
            knownLength: archive.pointer()
          }
        }
      }
    });
    console.log(res);
    // Log out the built-in Kaleido UI you can use to exercise the contract from a browser
    url.pathname = res.path;
    url.search = '?ui';
    console.log(`Generated REST API: ${url}`);

    mainContract = await Contract.create({
      name: 'main',
      address: res.path,
      openApiSpec: res.openapi
    });
  }

  // All nodes should share the result of this. For now create it if not stored in table.
  let instance = await Contract.findOne({ where: { name: 'nft' } });
  if (!instance) {
    const { contractAddress, openapi } = await instantiateNft(mainContract.openApiSpec);
    instance = await Contract.create({
      name: 'nft',
      address: contractAddress,
      openApiSpec: openapi
    });
  }
  nftContract = instance;

  return mainContract.openApiSpec;
}

const mintBookNft = async (owner, book) => {
  const contract = await getNftContract();
  const contractUrl = contract.openApiSpec;
  const swaggerUrl = new URL(contractUrl)
  swaggerUrl.search = ''; // Clear the swagger portion
  const url = new URL(swaggerUrl.href + '/mintNft');
  url.username = KALEIDO_AUTH_USERNAME;
  url.password = KALEIDO_AUTH_PASSWORD;

  const body = {
    receiver: owner,
    tokenId: book.tokenId,
    tokenURI: `https://localhost:/books?isbn=${book.isbn}`
  }

  const res = await request.post({
    url: url,
    json: true,
    auth: {
      user: KALEIDO_AUTH_USERNAME,
      pass: KALEIDO_AUTH_PASSWORD
    },
    headers: {
      'x-kaleido-from': owner,
      'x-kaleido-sync': true,
    },
    body: body
  });

  await Book.update(
    { status: 'OnBlock' },
    { where: { id: book.id } }
  );

  return res;
}

const transferBook = async (book, owner, newOwner) => {
  const contract = await getNftContract();
  const contractUrl = contract.openApiSpec;
  const swaggerUrl = new URL(contractUrl)
  swaggerUrl.search = ''; // Clear the swagger portion
  const url = new URL(swaggerUrl.href + '/safeTransferFrom');
  url.username = KALEIDO_AUTH_USERNAME;
  url.password = KALEIDO_AUTH_PASSWORD;

  const body = {
    from: owner,
    to: newOwner,
    tokenId: book.tokenId
  }

  const res = await request.post({
    url: url,
    json: true,
    auth: {
      user: KALEIDO_AUTH_USERNAME,
      pass: KALEIDO_AUTH_PASSWORD
    },
    headers: {
      'x-kaleido-from': owner,
      'x-kaleido-sync': true,
    },
    body: body
  });

  await Book.update(
    { address: newOwner },
    { where: { id: book.id } }
  );

  return await Book.findOne({ where: { id: book.id } });
}

const getNftContract = async () => {
  if (!nftContract) {
    nftContract = await Contract.findOne({ where: { name: 'nft' } });
  }

  return nftContract;
}

const instantiateNft = async (contractUrl) => {
  const url = new URL(contractUrl)
  url.search = null;
  const res = await request.post({
    url: url,
    json: true,
    auth: {
      user: KALEIDO_AUTH_USERNAME,
      pass: KALEIDO_AUTH_PASSWORD
    },
    headers: {
      'x-kaleido-from': FROM_ADDRESS,
      'x-kaleido-sync': true,
    }
  });

  return res;
}

module.exports = {
  initContract,
  mintBookNft,
  transferBook
};

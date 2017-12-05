# Ethauth - web3 authentication bridge API for authentication with MetaMask/Mist

A small service, which exposes some web3 APIs, like signature validation and SAN balance checking for a given address. The service depends on having a parity JSON-RPC node, which it uses for some of the API calls.

## Setup

To setup the service install all node packages:

```bash
$ npm install
```

Also make sure you have access to a parity JSON-RPC node to hook it to.

## Running the service

The service assumes by default that you have a parity JSON-RPC service running on `http://localhost:8584`. If this is not the case you can specify the URL to the parity service using the `PARITY_URL` env variable.

Example:

```bash
$ npm start
```

This will start the service on local port 3000.

If you want to specify a custom parity service:

```bash
$ PARITY_URL=<parity_url> npm start
```

You can then test the service with curl:

```bash
curl http://localhost:3000\?addr\=0xf4b51b14b9ee30dc37ec970b50a486f37686e2a8
```

If all is setup you show get something like `43362552036760000000000000`.

## Running the tests

You can run the tests with:

```bash
$ npm run test
```

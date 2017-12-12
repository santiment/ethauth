const micro = require('micro');
const listen = require('test-listen');
const request = require('request-promise')
const chai = require('chai');
const expect = chai.expect;

const handler = require("../index");

describe('recover', function() {
  const service = micro(handler);

  it("should recover the original address if the signature and the hash matches", async function() {
    const url = await listen(service);
    const response = await request(
      url + "/recover", {
        qs: {
          hash: "0x1da44b586eb0729ff70a73c326926f6ed5a25f5b056e7f47fbc6e58d86871655",
          sign: "0xb91467e570a6466aa9e9876cbcd013baba02900b8979d43fe208a4a4f339f5fd6007e74cd82e037b800186422fc2da167c747ef045e5d18a5f5d4300f8e1a0291c"
        }
      }
    );
    expect(response).to.equal({"recovered": "0x2c7536E3605D9C16a7a3D7b1898e529396a65c23"});
  });

  it("should recover some random address if the signature and the hash does not match", async function() {
    const url = await listen(service);
    const response = await request(
      url + "/recover", {
        qs: {
          hash: "0xsome_random_hash",
          sign: "0xb91467e570a6466aa9e9876cbcd013baba02900b8979d43fe208a4a4f339f5fd6007e74cd82e037b800186422fc2da167c747ef045e5d18a5f5d4300f8e1a0291c"
        }
      }
    );
    expect(response).not.to.equal({"recovered": "0x2c7536E3605D9C16a7a3D7b1898e529396a65c23"});
  });

  after(function() {
    service.close();
  });
});

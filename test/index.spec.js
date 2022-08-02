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
    expect(JSON.parse(response).recovered).to.equal("0xCdb2650352a8612604D97a471efF284852b7e857");
    service.close();
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
    expect(JSON.parse(response).recovered).not.to.equal("0xCdb2650352a8612604D97a471efF284852b7e857");
    service.close();
  });

  it("should verify smart contract signature", async function() {
    if (process.env.PARITY_URL) {
      const url = await listen(service);
      const response = await request(
        url + "/verify", {
          qs: {
            signer: "0xb6190eB2Aa9BCF4fB6981fFF1eB9043f30b14364",
            signature: "0x000000000000000000000000000000000000000000000000000000000003f480000000000000000000000000000000000000000000000000000000000000006000000000000000000000000000000000000000000000000000000000000000e00000000000000000000000000000000000000000000000000000000000000042d61c275a2f3df573f5c16eba3d20cec5e1fcb3190c6e181407d9afa6569b032c197e39b15638fd7a0ec1608aea67643685ecab1a8c3a4d58ec60f484a97f14a91b000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000042333142b540c3940ae45aadf1be440560b7d5e82546ebc340b255d6afb23017170c7917c21e49af04c30d794f346740bb743ddb416b5316752ea66f0ae9f4a6b91c00000000000000000000000000000000000000000000000000000000000000000000000000000000000000ff3f6d14df43c112ab98834ee1f82083e07c26bf02",
            message: "My email is john@doe.com"
          }
        }
      );
      const res = JSON.parse(response);
      expect(res.is_valid).to.equal(true);
      service.close();
    } else {
      this.skip();
    }
  });
});

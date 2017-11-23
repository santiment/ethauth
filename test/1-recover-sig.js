const Web3 = require('web3');
const web3 = new Web3();
const assert = require('assert');

describe('recover-sign', function() {

    const ETH_ADDRESS = "0x8185903e63fc12247af5f5cb76ff322937270674"

    const SIGNED_AUTH_CHALLENGE = {
      "address": "0x8185903e63fc12247af5f5cb76ff322937270674",
      "msg": "0x8185903e63fc12247af5f5cb76ff322937270674,0x1122334",
      "sig": "0xec96a28328c58cdfdc88d84fefcc8bf145c8e3f7ba04f9e4c731b6a6dce589ed7f969c56193fd238b9579726837cbcf365325dbc1cfab3280ff768b0ea6539051b",
      "version": "2"
    }

    function createChallengeMessage(address, nonce) {
       return ETH_ADDRESS +','+nonce;
    }

    before('before', function() {

    });

    it("should recover signature", function() {
        const nonce = SIGNED_AUTH_CHALLENGE.msg.split(',')[1];
        const challengeMsg = createChallengeMessage(ETH_ADDRESS, nonce);
        const hash = web3.eth.accounts.hashMessage(challengeMsg);
        console.log(web3.utils.utf8ToHex(hash));
        let sig = SIGNED_AUTH_CHALLENGE.sig;
        let address_recovered = web3.eth.accounts.recover(hash,sig).toLowerCase();
        assert.equal(ETH_ADDRESS, address_recovered);
    });

});

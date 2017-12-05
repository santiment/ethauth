const { send } = require('micro')
const url = require('url');
const Web3 = require('web3');

const PARITY_NODE = process.env.PARITY_URL || "http://localhost:8545";

const web3 = new Web3(PARITY_NODE);

const abi_balanceOf = [{"constant":true,"inputs":[{"name":"_owner","type":"address"}],"name":"balanceOf","outputs":[{"name":"balance","type":"uint256"}],"payable":false,"type":"function"}];

const SAN_TOKEN = new web3.eth.Contract(abi_balanceOf, '0x7C5A0CE9267ED19B22F8cae653F198e3E8daf098');

function checkSignature(q){
    const sign = q.sign;
    const addr = q.addr; // or your address if testing directly, like: || '0x612cd1Ec104273f7D3580f4D617b49D360a98Eff';
    const hash = q.hash; // or hash of your message if testing, like:  || web3.eth.accounts.hashMessage('Please, login as 0x612cd1ec104273f7d3580f4d617b49d360a98eff');
    const recovered = web3.eth.accounts.recover(hash,sign);
    return {
      addr: addr,
      recovered : recovered,
      result : addr == recovered
    };
}

module.exports = async function (request, response) {
    let req = url.parse(request.url, true);
    let q = req.query;

    switch(req.pathname) {
      case '/san-balance':
        const san_balance = await SAN_TOKEN.methods.balanceOf(q.addr).call();
        send(response, 200, san_balance);
        break;
      case '/auth-check':
        send(response, 200, checkSignature(q));
        break;
      default:
        send(response, 404, 'Not found');
        break;
    }
}

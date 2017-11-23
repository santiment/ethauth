const { send } = require('micro')
const url = require('url');
const Web3 = require('web3');
const web3 = new Web3();

const SIGNIN_MSG = {
    en : "Please, login as %s",
    de : "Bitte einloggen als %s",
    ru : "Войти как %s"
}

function createMessage(q) {
    const addr = q.addr;
    const lang = SIGNIN_MSG[q.lang] ? q.lang : 'en';
    const text = SIGNIN_MSG[lang].replace('%s',addr);
    const hex = web3.utils.utf8ToHex(text);
    return {
      hex : hex,
      text: text,
      hash: web3.utils.sha3(hex),
      addr: addr,
      lang: lang
    }
}

function checkSignature(q){
    const sign = q.sign;
    const addr = q.addr || '0x612cd1Ec104273f7D3580f4D617b49D360a98Eff';
    const hash = q.hash || web3.eth.accounts.hashMessage('Please, login as 0x612cd1ec104273f7d3580f4d617b49d360a98eff');
    const recovered = web3.eth.accounts.recover(hash,sign);
    return {
      addr: addr,
      recovered : recovered,
      result : addr == recovered
    };
}

const LOGIN_TEST_HTML = "<html><head><title>login-test</title></head><body>"
          +   "<input type='button' onclick='location.href=\"/auth-start?addr=\"+web3.eth.accounts[0]' value='login'></input>"
          +   "</script>"
          + "</body></html>";

const CALL_SIGNER_HTML = (msg_hex, addr) =>
      "<html><head><title>login-test</title></head><body>"
          + "<script> "
          +     " web3.personal.sign("
          +     "'"+msg_hex+"',"
          +     "'"+addr+"',"
          +     "function(err, sign) { "
          +         "location.href=err?'/auth-reject?addr='+web3.eth.accounts[0]:'/auth-check?sign='+sign;"
          +     "})"
          + "</script>"
      + "</body></html>";

module.exports = async function (request, response) {
    let req = url.parse(request.url,true);
    let q = req.query;
    if (req.pathname=='/auth-init') {
        send(response, 200, createMessage(q));
    } else if (req.pathname=='/auth-start') {
        const m = createMessage(q);
        send(response, 200, CALL_SIGNER_HTML(m.hex, m.addr));
    } else if (req.pathname=='/auth-check') {
        send(response, 200, checkSignature(q));
    } else if (req.pathname=='/auth-reject') {
        send(response, 200, 'Authentication rejected by user for addr '+q.addr);
    } else if (req.pathname=='/login-test') {
        send(response, 200, LOGIN_TEST_HTML);
    } else {
        send(response, 404, 'Not found');
    }
}

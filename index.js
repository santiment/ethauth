const { send } = require('micro')
const url = require('url');
const Web3 = require('web3');

//const web3 = new Web3("http://localhost:8545");
const web3 = new Web3("https://parity:gYiJHXmom3qtmU6SlVdt+aS1xjMhI7W8P7+BJwjHOXE5@parity.stage.internal.santiment.net");

const SIGNIN_MSG = {
    en : "Please, login as %s",
    de : "Bitte einloggen als %s",
    ru : "Войти как %s"
}

const abi_balanceOf = [{"constant":true,"inputs":[{"name":"_owner","type":"address"}],"name":"balanceOf","outputs":[{"name":"balance","type":"uint256"}],"payable":false,"type":"function"}];

const SAN_TOKEN = new web3.eth.Contract(abi_balanceOf, '0x7C5A0CE9267ED19B22F8cae653F198e3E8daf098');

function createMessage(q) {
    const addr = q.addr;
    const lang = SIGNIN_MSG[q.lang] ? q.lang : 'en';
    const text = SIGNIN_MSG[lang].replace('%s',addr);
    const hex = web3.utils.utf8ToHex(text);
    return {
      text: text,
      hex : hex,
      addr: addr,
      lang: lang
    }
}

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

//ToDo: this is an test/example code to incorporate into caller's code.
// remove it from the service after integration is finished.
// ==== START  ====
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
// ==== END  ====

module.exports = async function (request, response) {
    let req = url.parse(request.url,true);
    let q = req.query;
    if (req.pathname=='/auth-init') {
        send(response, 200, createMessage(q));
    } else if (req.pathname=='/auth-start') {
        const m = createMessage(q);

        // PRODUCTION CODE: use next line to return JSON object
        //send(response, 200, m);

        //EXAMPLE CODE: returns rendered message. remove the next line after integration
        send(response, 200, CALL_SIGNER_HTML(m.hex, m.addr));
    } else if (req.pathname=='/san-balance') {
        const san_balance = await SAN_TOKEN.methods.balanceOf(q.addr).call();
        send(response, 200, san_balance);
    } else if (req.pathname=='/auth-check') {
        send(response, 200, checkSignature(q));
//EXAMPLE CODE: move next calls to webserver.
///=====> EXAMPLE CODE START
    } else if (req.pathname=='/auth-reject') {
        send(response, 200, 'Authentication rejected by user for addr '+q.addr);
    } else if (req.pathname=='/login-test') {
        send(response, 200, LOGIN_TEST_HTML);
///=====> EXAMPLE CODE END
    } else {
        send(response, 404, 'Not found');
    }
}

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

module.exports = async function (request, response) {
    let req = url.parse(request.url,true);
    let q = req.query;
    //console.log(req);
    if (req.pathname=='/createmsg') {
        send(response, 200, createMessage(q));
    } else if (req.pathname=='/checksign') {
        const sign = q.sign;
        const addr = q.addr || '0x612cd1Ec104273f7D3580f4D617b49D360a98Eff';
        const hash = q.addr || web3.eth.accounts.hashMessage('Please, login as 0x612cd1ec104273f7d3580f4d617b49d360a98eff');
        const recovered = web3.eth.accounts.recover(hash,sign);
        send(response, 200, {
          addr: addr,
          recovered : recovered,
          result : addr == recovered
        });
    } else if (req.pathname=='/recover') {
        const result = web3.eth.accounts.recover(
          web3.eth.accounts.hashMessage('Please, login as 0x612cd1ec104273f7d3580f4d617b49d360a98eff'),
          "0xb162943afb4720d2ad238dac19e0702c04da069059bde57c5b26d7a358df70541086e1f77e2e01faf9c2056bd8c02fe0350a6a7cab07609b0d9c3d4c8dba7e881b"
        );
        send(response, 200, {
          result : result,
        });
    } else if (req.pathname=='/login') {
        const m = createMessage(q);
        console.log(m);
        console.log('addr='+m.addr+"&hash="+m.hash+"&sign=");
        send(response, 200,
          "<html><head><title>login4</title></head><body>"
          + "<script> function execLogin(){"
          +     "if (location.search.length==0) "
          +       " location.href='/login?addr='+web3.eth.accounts[0];"
          +     " else web3.personal.sign("
              + "'"+m.hex+"',"
              + "'"+m.addr+"',"
              + "function(err, sign) { "
              + "var addr=web3.eth.accounts[0];"
              + "var hash=web3.sha3('"+m.hex+"');"
              + "   console.log(err);"
              + "   console.log();"
              + "   console.log('sign>',sign);"
              + "   console.log('sha text>',web3.sha3('"+m.text+"'));"
              + "   console.log('sha hex0x>',web3.sha3('"+m.hex+"'));"
              + "   console.log('sha hex>',web3.sha3('"+m.hex.substring(2)+"'));"
              + "   location.href='/checksign?sign='+sign;"
            + "   })"
            + "   }"
          + "</script>"
          + "<input type='button' onclick='execLogin()' value='login5'></input>"
          + "</body></html>");
    }{
        send(response, 404, 'Not found');
    }
}

const { send } = require("micro")
const url = require("url")
const Web3 = require("web3")

const PARITY_NODE =
  process.env.PARITY_URL ||
  "http://parity-optimized.default.svc.cluster.local:8545"

const web3 = new Web3(PARITY_NODE)

const abi_balanceOf = [
  {
    constant: true,
    inputs: [{ name: "_owner", type: "address" }],
    name: "balanceOf",
    outputs: [{ name: "balance", type: "uint256" }],
    payable: false,
    type: "function"
  }
]

const abi_decimals = [
  {
    constant: true,
    inputs: [],
    name: "decimals",
    outputs: [{ name: "", type: "uint8" }],
    payable: false,
    type: "function"
  }
]

const SAN_TOKEN = new web3.eth.Contract(
  abi_balanceOf,
  "0x7C5A0CE9267ED19B22F8cae653F198e3E8daf098"
)

function recoverAddress({ sign, hash }) {
  const recovered = web3.eth.accounts.recover(hash, sign)
  return { recovered: recovered }
}

async function getTokenDecimals({ contract }) {
  const tokenContract = new web3.eth.Contract(abi_decimals, contract)
  return tokenContract.methods.decimals().call()
}

module.exports = async function(request, response) {
  let req = url.parse(request.url, true)
  let q = req.query

  switch (req.pathname) {
    case "/san_balance":
      const san_balance = await SAN_TOKEN.methods.balanceOf(q.addr).call()
      return send(response, 200, san_balance)
    case "/decimals":
      const decimals = await getTokenDecimals(q)
      console.log(decimals)
      return send(response, 200, decimals)
    case "/recover":
      return send(response, 200, recoverAddress(q))
    default:
      return send(response, 404, "Not found")
  }
}

const { send } = require("micro")
const url = require("url")
const Web3 = require("web3")
const ethers = require('ethers')
const { verifyMessage } = require('@ambire/signature-validator')


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

const abi_totalSupply = [
  {
    constant: true,
    inputs: [],
    name: "totalSupply",
    outputs: [{ name: "", type: "uint256" }],
    payable: false,
    stateMutability: "view",
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

async function tokenDecimals({ contract }) {
  const tokenContract = new web3.eth.Contract(abi_decimals, contract)
  return tokenContract.methods.decimals().call()
}

async function totalSupply({ contract }) {
  const tokenContract = new web3.eth.Contract(abi_totalSupply, contract)
  return tokenContract.methods.totalSupply().call()
}

async function verify({signer, message, signature}) {
  const provider = new ethers.providers.JsonRpcProvider(PARITY_NODE)


  const isValidSig = await verifyMessage({
    signer: signer,
    message: message,
    signature: signature,
    // this is needed so that smart contract signatures can be verified
    provider: provider,
  })

  return isValidSig
}

module.exports = async function(request, response) {
  let req = url.parse(request.url, true)
  let q = req.query

  switch (req.pathname) {
    case "/san_balance":
      const san_balance = await SAN_TOKEN.methods.balanceOf(q.addr).call()
      return send(response, 200, san_balance)
    case "/decimals":
      const decimals = await tokenDecimals(q)
      return send(response, 200, decimals)
    case "/total_supply":
      const supply = await totalSupply(q)
      return send(response, 200, supply)
    case "/recover":
      return send(response, 200, recoverAddress(q))
    case "/verify":
      const res = await verify(q)
      return send(response, 200, res.toString())
    default:
      return send(response, 404, "Not found")
  }
}

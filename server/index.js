const express = require("express");
const app = express();
const cors = require("cors");
const port = 3042;
const secp = require("ethereum-cryptography/secp256k1");
const { toHex, utf8ToBytes } = require("ethereum-cryptography/utils");
const { keccak256 } = require("ethereum-cryptography/keccak");
const { toBuffer } = require("ethereum-cryptography/utils");

app.use(cors());
app.use(express.json());

// priv keys for testing purposes. Order matching the addresses below. These are not real keys.
// ff67988c0f1f7e83500432b7334a1b4892a677bcabea753d0708c616691f1ebd
// 105ffdf75ba220d380ada6f6aefbcb6aca28e250c00e18a4487b039c60da6aa5
// b5a43865d7d65f12b744499166c3f436ed0a91907ae243aa8df709584c56da29

const balances = {
  "26bea7d81a1dcf736f64a414f8ae5f205039eaeb": 100,
  fdd4f9ad5b4cda48d22ca60c05247ff8bff5c172: 50,
  "0dce92f98f63824ba10ebb9fbbaf70f58307b6a0": 75,
};

app.get("/balance/:address", (req, res) => {
  const { address } = req.params;
  const balance = balances[address] || 0;
  res.send({ balance });
});

app.post("/send", (req, res) => {
  const { payload, signature } = req.body;

  const json = JSON.stringify(payload);
  const bytearray = utf8ToBytes(json);
  const messageHash = keccak256(bytearray);

  const [sig, recoveryBit] = signature;

  const publicKey = secp.recoverPublicKey(messageHash, sig, recoveryBit);

  if (toHex(publicKey.slice(1).slice(-20)) !== payload.sender) {
    res.status(400).send({ message: "Invalid signature!" });
    return;
  }

  const { sender, recipient, amount } = payload;

  setInitialBalance(sender);
  setInitialBalance(recipient);

  if (balances[sender] < amount) {
    res.status(400).send({ message: "Not enough funds!" });
  } else {
    balances[sender] -= amount;
    balances[recipient] += amount;
    res.send({ balance: balances[sender] });
  }
});

app.listen(port, () => {
  console.log(`Listening on port ${port}!`);
});

function setInitialBalance(address) {
  if (!balances[address]) {
    balances[address] = 0;
  }
}

import server from "./server";
import {toHex } from "ethereum-cryptography/utils";
import * as secp  from "ethereum-cryptography/secp256k1"

function Wallet({ address, setAddress, balance, setBalance, privateKey, setPrivateKey, publicKey, setPublicKey }) {
  async function onChange(evt) {
    const privateKey = evt.target.value;
    const pubKey = secp.getPublicKey(privateKey);

    const newAddress = toHex(pubKey.slice(1).slice(-20));

    setPublicKey(pubKey);
    setAddress(newAddress);
    setPrivateKey(privateKey);

    if (privateKey) {
      const {
        data: { balance },
      } = await server.get(`balance/${newAddress}`);
      setBalance(balance);
    } else {
      setBalance(0);
    }
  }

  return (
    <div className="container wallet">
      <h1>Your Wallet</h1>
      <label>
        Private Key
        <input placeholder="Type your private key" value={privateKey} onChange={onChange}></input>
      </label>

      <h1>
        Address: <span className="address">{address.slice(0, 5)}...{address.slice(address.length - 5, address.length)}</span>
      </h1>
      <div className="balance">Balance: {balance}</div>
    </div>
  );
}

export default Wallet;

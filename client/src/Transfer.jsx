import { useState } from "react";
import server from "./server";
import * as secp  from "ethereum-cryptography/secp256k1"
import { keccak256 } from "ethereum-cryptography/keccak";
import {utf8ToBytes, toHex} from "ethereum-cryptography/utils";

function Transfer({ address, setBalance, privateKey }) {
  const [sendAmount, setSendAmount] = useState("");
  const [recipient, setRecipient] = useState("");

  const setValue = (setter) => (evt) => setter(evt.target.value);

  async function transfer(evt) {
    evt.preventDefault();

    try {

      const payload = {
        sender: address,
        amount: parseInt(sendAmount),
        recipient,
      }

      const json = JSON.stringify(payload);
      const bytearray = utf8ToBytes(json)
      const messageHash = keccak256(bytearray);

      const signature = await secp.sign(messageHash, privateKey, {
        recovered: true,
      });

      const {
        data: { balance },
        status
      } = await server.post(`send`, {
        payload,
        signature: [toHex(signature[0]), signature[1] ] 
      });

      if (status === 200) {
        setBalance(balance);
      }

    } catch (ex) {
      alert(ex.response.data.message);
    }
  }

  return (
    <form className="container transfer" onSubmit={transfer}>
      <h1>Send Transaction</h1>

      <label>
        Send Amount
        <input
          placeholder="1, 2, 3..."
          value={sendAmount}
          onChange={setValue(setSendAmount)}
        ></input>
      </label>

      <label>
        Recipient
        <input
          placeholder="Type an address, for example: 0x2"
          value={recipient}
          onChange={setValue(setRecipient)}
        ></input>
      </label>

      <input type="submit" className="button" value="Transfer" />
    </form>
  );
}

export default Transfer;

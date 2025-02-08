import { FC, useState } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import * as web3 from "@solana/web3.js";
import styles from "../public/Home.module.css";

export const SendSolForm: FC = () => {
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();
  const [txSig, setTxSig] = useState("");
  const link = () => {
    return txSig
      ? `https://explorer.solana.com/tx/${txSig}?cluster=devnet`
      : "";
  };

  const sendSol = async (event) => {
    event.preventDefault();
    if (!publicKey || !connection) {
      alert("Please connect to Solana Wallet");
      return;
    }
    try {
      const form = event.target;
      const amountInput = form.amount;
      const recipientInput = form.recipient;
      const amountToSend = parseFloat(amountInput.value);
      if (isNaN(amountToSend) || amountToSend < 0) {
        alert("Invalid amount");
        return;
      }
      const balance = await connection.getBalance(publicKey);
      const balanceInSOL = balance / web3.LAMPORTS_PER_SOL;
      if (balanceInSOL < amountToSend) {
        alert(
          `You want to send ${amountToSend} but you balance is ${balanceInSOL}`
        );
        return;
      }
      const transaction = new web3.Transaction();
      const recipientPubKey = new web3.PublicKey(recipientInput.value);
      const sendSolInstruction = web3.SystemProgram.transfer({
        fromPubkey: publicKey,
        toPubkey: recipientPubKey,
        lamports: amountToSend * web3.LAMPORTS_PER_SOL,
      });
      transaction.add(sendSolInstruction);
      const signature = await sendTransaction(transaction, connection);
      setTxSig(signature);
      console.log(`💸 Transaction sent :- `, signature);
    } catch (error) {
      console.error("Transaction failed:", error);

      // ✅ Only show alert, prevent the error page
      if (error instanceof Error) {
        alert(`Transaction failed: ${error.message || "Unknown error"}`);
      } else {
        alert("Transaction failed: Unknown error");
      }
    }
  };
  return (
    <div>
      {publicKey ? (
        <form onSubmit={sendSol} className={styles.form}>
          <label htmlFor="amount">Amount (in SOL) to send:</label>
          <input
            id="amount"
            type="text"
            className={styles.formField}
            placeholder="e.g. 0.1"
            required
          />
          <br />
          <label htmlFor="recipient">Amount (in SOL) to send:</label>
          <input
            id="recipient"
            type="text"
            className={styles.formField}
            placeholder="e.g. 5Qd7f9i349f..."
            required
          />
          <button type="submit" className={styles.formButton}>
            Send SOL
          </button>
        </form>
      ) : (
        <span>Connect Your Wallet</span>
      )}
      {txSig ? (
        <div>
          <p>View Your Transaction on :- </p>
          <a href={link()}>Solna Explorer</a>
        </div>
      ) : null}
    </div>
  );
};

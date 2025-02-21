import { FC } from "react";
import styles from "../public/Home.module.css";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import Image from "next/image";

export const AppBar: FC = () => {
  return (
    <div className={styles.AppHeader}>
      <Image src="/solanaLogo.png" height={30} width={200} alt="Solana Logo" />
      <span>Wallet-Adapter</span>
      <WalletMultiButton />
    </div>
  );
};

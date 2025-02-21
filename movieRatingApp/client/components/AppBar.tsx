import { FC } from "react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import Image from "next/image";

export const AppBar: FC = () => {
  return (
    <div className="flex items-center justify-between bg-gray-800 px-6 py-4 shadow-lg">
      <Image src="/solanaLogo.png" height={30} width={200} alt="Solana Logo" />
      <span className="text-xl font-semibold text-white">
        🎬 Movie Rating Application
      </span>
      <WalletMultiButton className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-lg transition" />
    </div>
  );
};

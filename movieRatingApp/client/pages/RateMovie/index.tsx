import { useEffect, useState } from "react";
import { useConnection, useAnchorWallet } from "@solana/wallet-adapter-react";
import * as anchor from "@coral-xyz/anchor";
import idl from "../../idl.json";
import { AnchorMovieReviewProgram } from "../../types/anchor_movie_review_program";
import { getAssociatedTokenAddress, getAccount } from "@solana/spl-token";

export default function MovieReview() {
  const { connection } = useConnection();
  const wallet = useAnchorWallet();
  const [program, setProgram] =
    useState<anchor.Program<AnchorMovieReviewProgram>>();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [rating, setRating] = useState(0);
  const [transactionUrl, setTransactionUrl] = useState("");
  const [reviews, setReviews] = useState([]);
  const [moviePda, setMoviePda] = useState<anchor.web3.PublicKey | null>(null);
  const [mint, setMint] = useState<anchor.web3.PublicKey | null>(null);
  const [tokenAccount, setTokenAccount] =
    useState<anchor.web3.PublicKey | null>(null);

  useEffect(() => {
    if (!wallet) return;

    let provider: anchor.Provider;
    try {
      provider = anchor.getProvider();
    } catch {
      provider = new anchor.AnchorProvider(connection, wallet, {});
      anchor.setProvider(provider);
    }

    const programInstance = new anchor.Program(
      idl as AnchorMovieReviewProgram
    ) as anchor.Program<AnchorMovieReviewProgram>;

    setProgram(programInstance);

    const [pda] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from(title), wallet.publicKey.toBuffer()],
      programInstance.programId
    );
    setMoviePda(pda);

    const [mintAddress] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("mint")],
      programInstance.programId
    );
    setMint(mintAddress);
  }, [connection, wallet, title]);

  useEffect(() => {
    if (!wallet || !mint) return;
    (async () => {
      const associatedTokenAddress = await getAssociatedTokenAddress(
        mint,
        wallet.publicKey
      );
      setTokenAccount(associatedTokenAddress);
    })();
  }, [mint, wallet]);

  const addReview = async () => {
    if (!program || !moviePda) return;
    try {
      const sig = await program.methods
        .addMovieReview(title, description, rating)
        .accounts({})
        .rpc();
      setTransactionUrl(`https://explorer.solana.com/tx/${sig}?cluster=devnet`);
      fetchReviews();
    } catch (error) {
      console.error("Error adding movie review:", error);
    }
  };

  const updateReview = async (reviewTitle) => {
    if (!program) return;
    try {
      const newDescription = prompt("Enter new description:");
      const newRating = Number(prompt("Enter new rating (1-5):"));
      if (!newDescription || isNaN(newRating) || newRating < 1 || newRating > 5)
        return;
      await program.methods
        .updateMovieReview(reviewTitle, newDescription, newRating)
        .rpc();
      fetchReviews();
    } catch (error) {
      console.error("Error updating movie review:", error);
    }
  };

  const deleteReview = async (title: string) => {
    if (!program) return;
    try {
      await program.methods.deleteMovieReview(title).rpc();
      fetchReviews();
    } catch (error) {
      console.error("Error deleting movie review:", error);
    }
  };

  const fetchReviews = async () => {
    if (!program) return;
    try {
      const allMovieReviews = await program.account.movieAccountState.all();
      setReviews(allMovieReviews.map((a) => a.account));
    } catch (error) {
      console.error("Error fetching reviews:", error);
    }
  };

  const fetchOnlyActiveAccountReviews = async () => {
    if (!program || !wallet) return;
    try {
      const allMovieReviews = await program.account.movieAccountState.all();

      // Filter only the reviews submitted by the connected wallet
      const userReviews = allMovieReviews
        .filter(
          (review) =>
            review.account.reviewer.toString() === wallet.publicKey.toString()
        )
        .map((a) => a.account);

      setReviews(userReviews);
    } catch (error) {
      console.error("Error fetching reviews:", error);
    }
  };
  useEffect(() => {
    if (program) {
      fetchOnlyActiveAccountReviews();
    }
  }, [program]);

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold">Solana Movie Reviews</h1>

      <div className="border p-4">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Movie Title"
          className="border p-2 m-2"
        />
        <input
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Description"
          className="border p-2 m-2"
        />
        <input
          type="number"
          value={rating}
          onChange={(e) => setRating(Number(e.target.value))}
          placeholder="Rating (1-5)"
          className="border p-2 m-2"
        />
        <button
          onClick={addReview}
          className="bg-blue-500 text-white px-4 py-2 m-2"
        >
          Submit Review
        </button>
      </div>

      {transactionUrl && (
        <p>
          View Transaction:{" "}
          <a
            href={transactionUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600"
          >
            {transactionUrl}
          </a>
        </p>
      )}

      <h2 className="text-xl font-bold mt-4">All Reviews</h2>
      <ul>
        {reviews.map((review, index) => (
          <li key={index} className="border p-4 my-2">
            <h2 className="text-xl font-bold">{review.title}</h2>
            <p>{review.description}</p>
            <p>Rating: {review.rating}</p>
            <button
              onClick={() => updateReview(review.title)}
              className="bg-green-500 text-white px-4 py-2"
            >
              Update
            </button>
            <button
              onClick={() => deleteReview(review.title)}
              className="bg-red-500 text-white px-4 py-2 m-2"
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

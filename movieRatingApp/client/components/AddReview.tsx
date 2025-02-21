import { useConnection, useAnchorWallet } from "@solana/wallet-adapter-react";
import * as anchor from "@coral-xyz/anchor";
import { FC, useEffect, useState } from "react";
import idl from "../idl.json";
import { AnchorMovieReviewProgram } from "../types/anchor_movie_review_program";
import { useWallet } from "@solana/wallet-adapter-react";

export interface Props {
  setTitle;
  setDescription;
  setRating;
  title;
  rating;
  description;
  setTransactionUrl;
}

export const AddReview: FC<Props> = ({
  setTitle,
  setDescription,
  setRating,
  setTransactionUrl,
  title,
  rating,
  description,
}) => {
  const [program, setProgram] =
    useState<anchor.Program<AnchorMovieReviewProgram>>();
  const { connection } = useConnection();
  const wallet = useAnchorWallet();
  const [title1, setTitle1] = useState("");
  const [description1, setDescription1] = useState("");
  const [rating1, setRating1] = useState(0);
  const [reviews, setReviews] = useState([]);
  const { publicKey } = useWallet();

  //   useEffect(() => {
  //     if (!wallet) return;

  //     const provider = new anchor.AnchorProvider(connection, wallet, {
  //       preflightCommitment: "processed",
  //     });
  //     anchor.setProvider(provider);

  //     const program = new anchor.Program(
  //       idl as AnchorMovieReviewProgram
  //     ) as anchor.Program<AnchorMovieReviewProgram>;
  //     setProgram(program);
  //   }, [connection, wallet]);

  useEffect(() => {
    if (!wallet) return;

    const provider = new anchor.AnchorProvider(connection, wallet, {
      preflightCommitment: "processed",
    });
    anchor.setProvider(provider);

    const program = new anchor.Program(
      idl as AnchorMovieReviewProgram
    ) as anchor.Program<AnchorMovieReviewProgram>;
    setProgram(program);
  }, [connection, wallet]);

  const onClick = async () => {
    try {
      if (!program) return;

      const dig1 = await program.methods.initializeTokenMint().rpc();
      const sig = await program.methods
        .addMovieReview(title1, description1, rating1)
        .accounts({})
        .rpc();
      setTransactionUrl(`https://explorer.solana.com/tx/${sig}?cluster=devnet`);

      const [pda] = await anchor.web3.PublicKey.findProgramAddress(
        [Buffer.from(title1), publicKey.toBuffer()],
        program.programId
      );
      const account = await program.account.movieAccountState.fetch(pda);
      setTitle(account.title);
      setDescription(account.description);
      setRating(account.rating);
    } catch (error) {
      console.log(error);
    }
  };

  const fetchReviews = async () => {
    const allMovieReview = await program.account.movieAccountState.all();
    setReviews(allMovieReview.map((a) => a.account));
  };

  //   useEffect(() => {
  //     if (publicKey) {
  //       fetchReviews();
  //     }
  //   }, [publicKey]);

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold">Solana Movie Reviews</h1>

      {/* Input fields */}
      <input
        value={title1}
        onChange={(e) => setTitle1(e.target.value)}
        placeholder="Movie Title"
        className="border p-2 m-2"
      />
      <input
        value={description1}
        onChange={(e) => setDescription1(e.target.value)}
        placeholder="Description"
        className="border p-2 m-2"
      />
      <input
        type="number"
        value={rating1}
        onChange={(e) => setRating1(Number(e.target.value))}
        placeholder="Rating (1-5)"
        className="border p-2 m-2"
      />
      <button
        onClick={onClick}
        className="bg-blue-500 text-white px-4 py-2 m-2"
      >
        Submit Review
      </button>

      {/* Latest Review Section */}
      {title && description && rating !== undefined ? (
        <div className="border p-4 my-4 bg-green-100 rounded-lg">
          <h2 className="text-xl font-bold">Latest Review</h2>
          <p>
            <strong>Title:</strong> {title}
          </p>
          <p>
            <strong>Description:</strong> {description}
          </p>
          <p>
            <strong>Rating:</strong> {rating}
          </p>
        </div>
      ) : null}

      {/* All Reviews Section */}
      <ul>
        {reviews.map((review, index) => (
          <li key={index} className="border p-4 my-2">
            <h2 className="text-xl font-bold">{review.title}</h2>
            <p>{review.description}</p>
            <p>Rating: {review.rating}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

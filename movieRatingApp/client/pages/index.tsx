import React from "react";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white">
      <h1 className="text-4xl font-extrabold mb-4">🎬 Movie Rating Hub</h1>
      <p className="text-lg text-gray-300 mb-6">
        Rate your favorite movies and see what others think!
      </p>
      <Link href="/RateMovie">
        <button className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white text-lg font-semibold rounded-lg shadow-md transition-all">
          Rate a Movie 🎥
        </button>
      </Link>
    </div>
  );
}

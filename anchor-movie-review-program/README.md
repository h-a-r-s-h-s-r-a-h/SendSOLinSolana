# 🎬 Solana Movie Review Program

A decentralized movie review platform built on Solana blockchain where users can create, update, and manage movie reviews along with comments. The program also includes a token reward system for reviewers.

## 📋 Features

### Movie Reviews
- Create detailed movie reviews with:
  - Title
  - Description
  - Rating (1-5 stars)
  - Automatic reviewer tracking
- Update existing reviews
- Delete reviews
- Token rewards for reviewing movies

### Comments System
- Add comments to any movie review
- Each comment includes:
  - Comment text
  - Timestamp
  - Commenter's public key
  - Unique comment ID
- Update existing comments
- Comments are permanently stored on-chain

### Token Rewards
- Automatic token minting for reviewers
- Integrated with SPL Token program
- Associated Token Account creation
- 10 tokens awarded per review

## 🚀 Getting Started

### Prerequisites
- Solana Tool Suite
- Anchor Framework
- Node.js
- Rust

### Installation

1. Clone the repository:
```bash
git clone https://github.com/h-a-r-s-h-s-r-a-h/cine-token-reviews.git
cd cine-token-reviews
```

2. Install dependencies:
```bash
yarn install
```

3. Build the program:
```bash
anchor build
```

4. Deploy to your desired Solana cluster:
```bash
anchor deploy
```

## 💻 Program Architecture

### Account Structures

1. **MovieAccountState**
   - Stores movie review details
   - Contains reviewer's public key, rating, title, and description
   - PDA derived from title and reviewer's public key

2. **CommentAccountState**
   - Stores comment information
   - Contains commenter's public key, movie title, comment text, timestamp
   - PDA derived from comment ID and movie title

### Main Instructions

1. **add_movie_review**
   - Creates a new movie review
   - Validates rating and content length
   - Mints reward tokens to reviewer

2. **update_movie_review**
   - Modifies existing review content
   - Preserves original reviewer information

3. **delete_movie_review**
   - Removes a review completely
   - Returns rent to the reviewer

4. **add_comment**
   - Adds a new comment to a movie review
   - Stores timestamp automatically

5. **update_comment**
   - Modifies existing comment content
   - Updates timestamp

6. **initialize_token_mint**
   - Sets up the reward token system
   - Creates mint authority

## 🔐 Security Features

- PDA-based account derivation
- Proper authority checks
- Input validation for ratings and content length
- Secure token minting process

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## ⚠️ Important Notes

- Maximum rating is 5 stars
- Title and description lengths are limited
- Token rewards are fixed at 10 tokens per review
- Comments are permanent once added
- Each review can have multiple comments

## 🔗 Program ID

```
2bR1ukzArMpx3KJ5iVs8wjJbfueNj51hSfEJ8Y9Fes6V
``` 
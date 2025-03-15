use anchor_lang::prelude::*;
use anchor_spl::associated_token::AssociatedToken;
use anchor_spl::token::{mint_to, Mint, MintTo, Token, TokenAccount};

pub mod constants;

pub use constants::*;

declare_id!("2bR1ukzArMpx3KJ5iVs8wjJbfueNj51hSfEJ8Y9Fes6V");

#[program]
pub mod anchor_movie_review_program {
    use super::*;

    pub fn add_movie_review(
        ctx: Context<AddMovieReview>,
        title: String,
        description: String,
        rating: u8,
    ) -> Result<()> {
        require!(
            rating >= MIN_RATING && rating <= MAX_RATING,
            MovieReviewError::InvalidRating
        );

        require!(
            title.len() <= MAX_TITLE_LENGTH,
            MovieReviewError::TitleTooLong
        );

        require!(
            description.len() <= MAX_DESCRIPTION_LENGTH,
            MovieReviewError::DescriptionTooLong
        );

        msg!("Movie review account created");
        msg!("Title: {}", title);
        msg!("Description: {}", description);
        msg!("Rating: {}", rating);

        let movie_review = &mut ctx.accounts.movie_review;
        movie_review.reviewer = ctx.accounts.initializer.key();
        movie_review.title = title;
        movie_review.description = description;
        movie_review.rating = rating;

        mint_to(
            CpiContext::new_with_signer(
                ctx.accounts.token_program.to_account_info(),
                MintTo {
                    authority: ctx.accounts.mint.to_account_info(),
                    to: ctx.accounts.token_account.to_account_info(),
                    mint: ctx.accounts.mint.to_account_info(),
                },
                &[&["mint".as_bytes(), &[ctx.bumps.mint]]],
            ),
            10 * 10 ^ 6,
        )?;

        Ok(())
    }

    pub fn update_movie_review(
        ctx: Context<UpdateMovieReview>,
        title: String,
        description: String,
        rating: u8,
    ) -> Result<()> {
        require!(
            rating >= MIN_RATING && rating <= MAX_RATING,
            MovieReviewError::InvalidRating
        );

        require!(
            description.len() <= MAX_DESCRIPTION_LENGTH,
            MovieReviewError::DescriptionTooLong
        );

        msg!("Movie review account space reallocated");
        msg!("Title: {}", title);
        msg!("Description: {}", description);
        msg!("Rating: {}", rating);

        let movie_review = &mut ctx.accounts.movie_review;
        movie_review.description = description;
        movie_review.rating = rating;
        Ok(())
    }

    pub fn delete_movie_review(_ctx: Context<DeleteMovieReview>, title: String) -> Result<()> {
        msg!("Movie review for {} deleted", title);
        Ok(())
    }

    pub fn add_comment(
        ctx: Context<AddComment>,
        movie_title: String,
        comment_text: String,
        comment_id: String,
    ) -> Result<()> {
        let comment = &mut ctx.accounts.comment;

        comment.commenter = ctx.accounts.commenter.key();
        comment.movie_title = movie_title;
        comment.comment_text = comment_text;
        comment.timestamp = Clock::get()?.unix_timestamp;
        comment.comment_id = comment_id;

        msg!("Comment added successfully!");
        Ok(())
    }

    pub fn update_comment(
        ctx: Context<UpdateComment>,
        _movie_title: String,
        _comment_id: String,
        new_comment_text: String,
    ) -> Result<()> {
        let comment = &mut ctx.accounts.comment;
        comment.comment_text = new_comment_text;
        comment.timestamp = Clock::get()?.unix_timestamp;

        msg!("Comment updated successfully!");
        Ok(())
    }

    pub fn initialize_token_mint(_ctx: Context<InitializeMint>) -> Result<()> {
        msg!("Token mint initialized");
        Ok(())
    }
}

#[derive(Accounts)]
#[instruction(title:String, description:String)]
pub struct AddMovieReview<'info> {
    #[account(
        init,
        seeds=[title.as_bytes(),initializer.key().as_ref()],
        bump,
        payer=initializer,
        space=MovieAccountState::INIT_SPACE + title.len() +description.len()
    )]
    pub movie_review: Account<'info, MovieAccountState>,
    #[account(mut)]
    pub initializer: Signer<'info>,
    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
    #[account(
        seeds=["mint".as_bytes()],
        bump,
        mut
    )]
    pub mint: Account<'info, Mint>,
    #[account(
        init_if_needed,
        payer = initializer,
        associated_token::mint = mint,
        associated_token::authority = initializer
    )]
    pub token_account: Account<'info, TokenAccount>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub rent: Sysvar<'info, Rent>,
}

#[derive(Accounts)]
#[instruction(title:String)]
pub struct UpdateMovieReview<'info> {
    #[account(
        mut,
        seeds=[title.as_bytes(),initializer.key().as_ref()],
        bump,
    )]
    pub movie_review: Account<'info, MovieAccountState>,
    #[account(mut)]
    pub initializer: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(title:String)]
pub struct DeleteMovieReview<'info> {
    #[account(
        mut,
        seeds=[title.as_bytes(),initializer.key().as_ref()],
        bump,
        close=initializer
    )]
    pub movie_review: Account<'info, MovieAccountState>,
    #[account(mut)]
    pub initializer: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct InitializeMint<'info> {
    #[account(
        init,
        seeds=["mint".as_bytes()],
        bump,
        payer = user,
        mint::decimals=6,
        mint::authority=mint
    )]
    pub mint: Account<'info, Mint>,
    #[account(mut)]
    pub user: Signer<'info>,
    pub token_program: Program<'info, Token>,
    pub rent: Sysvar<'info, Rent>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(movie_title: String, comment_text: String, comment_id:String)]
pub struct AddComment<'info> {
    #[account(
        init,
        seeds = ["comment".as_bytes(),movie_title.as_bytes(), commenter.key().as_ref(), comment_id.as_bytes()],
        bump,
        payer = commenter,
        space = 8 + 32 + (4 + movie_title.len()) + (4 + comment_text.len()) + (4 + comment_id.len()) + 8
    )]
    pub comment: Account<'info, CommentAccountState>,

    #[account(mut)]
    pub commenter: Signer<'info>, // The user adding the comment

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(movie_title: String,comment_id:String)]
pub struct UpdateComment<'info> {
    #[account(
        mut,
        seeds = ["comment".as_bytes(),movie_title.as_bytes(), commenter.key().as_ref(), comment_id.as_bytes()],
        bump,
        // has_one = commenter // Ensures only the original commenter can update
    )]
    pub comment: Account<'info, CommentAccountState>,

    #[account(mut)]
    pub commenter: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[account]
pub struct MovieAccountState {
    pub reviewer: Pubkey,
    pub rating: u8,
    pub title: String,
    pub description: String,
}

#[account]
pub struct CommentAccountState {
    pub commenter: Pubkey,
    pub movie_title: String,
    pub comment_text: String,
    pub timestamp: i64,
    pub comment_id: String,
}

impl Space for MovieAccountState {
    const INIT_SPACE: usize =
        ANCHOR_DISCRIMINATOR + PUBKEY_SIZE + U8_SIZE + STRING_LENGTH_PREFIX + STRING_LENGTH_PREFIX;
}

#[error_code]
enum MovieReviewError {
    #[msg("Rating must hbe between 1 and 5")]
    InvalidRating,
    #[msg("Movie Title too long")]
    TitleTooLong,
    #[msg("Movie Description too long")]
    DescriptionTooLong,
}

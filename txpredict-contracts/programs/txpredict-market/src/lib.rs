use anchor_lang::prelude::*;
use txoracle::cpi::accounts::ValidateStatV2;
use txoracle::program::Txoracle;
use txoracle::cpi::validate_stat_v2;

declare_id!("TxPred1111111111111111111111111111111111111");

#[program]
pub mod txpredict_market {
    use super::*;

    pub fn create_market(ctx: Context<CreateMarket>, fixture_id: u32, stat_keys: Vec<u32>) -> Result<()> {
        let market = &mut ctx.accounts.market;
        market.fixture_id = fixture_id;
        market.stat_keys = stat_keys;
        market.yes_pool = 0;
        market.no_pool = 0;
        market.resolved = false;
        market.outcome = false;
        market.authority = ctx.accounts.authority.key();
        Ok(())
    }

    pub fn place_bet(ctx: Context<PlaceBet>, is_yes: bool, amount: u64) -> Result<()> {
        let market = &mut ctx.accounts.market;
        require!(!market.resolved, CustomError::MarketAlreadyResolved);

        let cpi_context = CpiContext::new(
            ctx.accounts.system_program.to_account_info(),
            anchor_lang::system_program::Transfer {
                from: ctx.accounts.user.to_account_info(),
                to: ctx.accounts.market.to_account_info(),
            },
        );
        anchor_lang::system_program::transfer(cpi_context, amount)?;

        if is_yes { market.yes_pool += amount; } else { market.no_pool += amount; }
        let bet = &mut ctx.accounts.bet;
        bet.user = ctx.accounts.user.key();
        bet.is_yes = is_yes;
        bet.amount = amount;
        Ok(())
    }

    pub fn resolve_market(ctx: Context<ResolveMarket>, payload: txoracle::state::ScoreValidationV2Payload, strategy: txoracle::state::ValidationStrategy) -> Result<()> {
        let market = &mut ctx.accounts.market;
        require!(!market.resolved, CustomError::MarketAlreadyResolved);

        let cpi_accounts = ValidateStatV2 { daily_scores_merkle_roots: ctx.accounts.daily_scores_merkle_roots.to_account_info() };
        let cpi_program = ctx.accounts.txoracle_program.to_account_info();
        let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);

        let result = validate_stat_v2(cpi_ctx, payload, strategy);
        market.resolved = true;
        market.outcome = result.is_ok();
        Ok(())
    }
}

#[derive(Accounts)]
pub struct CreateMarket<'info> {
    #[account(init, payer = authority, space = 8 + 4 + 4 + 32 + 8 + 8 + 1 + 1 + 32)]
    pub market: Account<'info, Market>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct PlaceBet<'info> {
    #[account(mut)]
    pub market: Account<'info, Market>,
    #[account(init, payer = user, space = 8 + 32 + 1 + 8)]
    pub bet: Account<'info, Bet>,
    #[account(mut)]
    pub user: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct ResolveMarket<'info> {
    #[account(mut)]
    pub market: Account<'info, Market>,
    /// CHECK: Daily scores PDA owned by TxODDS
    pub daily_scores_merkle_roots: AccountInfo<'info>,
    pub txoracle_program: Program<'info, Txoracle>,
}

#[account]
pub struct Market { pub fixture_id: u32, pub stat_keys: Vec<u32>, pub yes_pool: u64, pub no_pool: u64, pub resolved: bool, pub outcome: bool, pub authority: Pubkey }

#[account]
pub struct Bet { pub user: Pubkey, pub is_yes: bool, pub amount: u64 }

#[error_code]
pub enum CustomError { #[msg("Market is already resolved.")] MarketAlreadyResolved }

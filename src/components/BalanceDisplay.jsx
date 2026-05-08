/**
 * BalanceDisplay.jsx — Shows the connected wallet's XLM balance
 *
 * Features:
 * - Animated balance display
 * - Loading skeleton while fetching
 * - Refresh button
 * - Friendbot link for funding testnet accounts
 */

import { useState } from 'react';
import { formatXLM, fundWithFriendbot } from '../utils/stellar';

export default function BalanceDisplay({ publicKey, balance, isLoading, error, onRefresh }) {
  const [isFunding, setIsFunding] = useState(false);
  const [fundMessage, setFundMessage] = useState(null);

  /**
   * Funds the account via Stellar Friendbot (testnet only).
   * Friendbot gives 10,000 XLM to new accounts for testing.
   */
  async function handleFriendbot() {
    setIsFunding(true);
    setFundMessage(null);
    const success = await fundWithFriendbot(publicKey);
    if (success) {
      setFundMessage('✅ Account funded with 10,000 XLM!');
      setTimeout(() => {
        onRefresh();
        setFundMessage(null);
      }, 2000);
    } else {
      setFundMessage('❌ Friendbot failed. Account might already be funded.');
    }
    setIsFunding(false);
  }

  const isAccountNotFound = error?.includes('not found');

  return (
    <div className="glass-card p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-stellar-800/50 flex items-center justify-center">
            <span className="text-stellar-300 text-sm">◈</span>
          </div>
          <h2 className="text-slate-300 font-body font-medium text-sm tracking-wide uppercase">
            XLM Balance
          </h2>
        </div>

        {/* Refresh button */}
        <button
          onClick={onRefresh}
          disabled={isLoading}
          title="Refresh balance"
          className="p-1.5 text-slate-500 hover:text-stellar-300 transition-colors rounded-lg 
                     hover:bg-stellar-900/40 disabled:opacity-40"
        >
          <RefreshIcon spinning={isLoading} />
        </button>
      </div>

      {/* Balance display */}
      {isLoading ? (
        /* Loading skeleton */
        <div className="space-y-2">
          <div className="skeleton h-10 w-48 rounded-lg" />
          <div className="skeleton h-4 w-24 rounded-md" />
        </div>
      ) : error ? (
        /* Error state */
        <div className="space-y-3">
          <p className="text-red-400 text-sm">{error}</p>
          {isAccountNotFound && (
            <div className="space-y-2">
              <p className="text-slate-500 text-xs">
                New testnet accounts need to be funded before use.
              </p>
              <button
                onClick={handleFriendbot}
                disabled={isFunding}
                className="btn-primary text-xs py-2 px-4 flex items-center gap-2"
              >
                {isFunding ? (
                  <>
                    <SpinnerIcon />
                    Funding...
                  </>
                ) : (
                  '🤖 Fund with Friendbot (Free 10,000 XLM)'
                )}
              </button>
              {fundMessage && (
                <p className="text-xs text-slate-300 animate-fade-in">{fundMessage}</p>
              )}
            </div>
          )}
        </div>
      ) : balance !== null ? (
        /* Balance display */
        <div className="animate-fade-in">
          <div className="flex items-baseline gap-2">
            <span className="font-display text-4xl font-bold text-gradient">
              {formatXLM(balance, 4)}
            </span>
            <span className="text-stellar-400 font-display text-lg font-bold">XLM</span>
          </div>
          <div className="mt-1 text-xs text-slate-500 font-mono">
            ≈ {formatXLM(balance, 7)} XLM (full precision)
          </div>

          {/* Reserve info */}
          <div className="mt-3 pt-3 border-t border-stellar-800/30">
            <div className="flex justify-between text-xs text-slate-500">
              <span>Available to send</span>
              <span className="text-slate-300 font-mono">
                {Math.max(0, parseFloat(balance) - 1).toFixed(4)} XLM
              </span>
            </div>
            <div className="flex justify-between text-xs text-slate-500 mt-1">
              <span>Minimum reserve</span>
              <span className="text-slate-400 font-mono">1.0000 XLM</span>
            </div>
          </div>
        </div>
      ) : (
        <p className="text-slate-500 text-sm">Connect wallet to view balance</p>
      )}

      {/* Friendbot link in footer */}
      {balance !== null && !error && (
        <div className="mt-4 pt-3 border-t border-stellar-800/20">
          <button
            onClick={handleFriendbot}
            disabled={isFunding}
            className="text-xs text-stellar-500 hover:text-stellar-300 transition-colors disabled:opacity-50"
          >
            {isFunding ? '⏳ Funding...' : '🤖 Get test XLM from Friendbot'}
          </button>
          {fundMessage && (
            <p className="text-xs text-slate-300 mt-1 animate-fade-in">{fundMessage}</p>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Icons ─────────────────────────────────────────────────────────────────────

function RefreshIcon({ spinning }) {
  return (
    <svg
      className={`w-4 h-4 transition-transform ${spinning ? 'animate-spin' : ''}`}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
      <path d="M21 3v5h-5" />
      <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
      <path d="M8 16H3v5" />
    </svg>
  );
}

function SpinnerIcon() {
  return (
    <svg className="animate-spin w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  );
}

/**
 * RecentActivity.jsx — Shows recent transactions on the connected account
 *
 * Fetches the last 5 payment operations from Stellar Horizon testnet.
 */

import { useState, useEffect } from 'react';
import { EXPLORER_URL, shortenKey } from '../utils/stellar';

export default function RecentActivity({ publicKey }) {
  const [operations, setOperations] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!publicKey) {
      setOperations([]);
      return;
    }

    async function fetchOperations() {
      setIsLoading(true);
      try {
        const response = await fetch(
          `https://horizon-testnet.stellar.org/accounts/${publicKey}/operations?limit=8&order=desc`
        );
        const data = await response.json();
        // Only show payment operations
        const payments = (data._embedded?.records || []).filter(
          op => op.type === 'payment' || op.type === 'create_account'
        );
        setOperations(payments);
      } catch {
        // Silently fail — activity is supplemental
      } finally {
        setIsLoading(false);
      }
    }

    fetchOperations();
  }, [publicKey]);

  if (!publicKey) return null;
  if (!isLoading && operations.length === 0) return null;

  return (
    <div className="glass-card p-6">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-lg bg-stellar-800/50 flex items-center justify-center">
          <span className="text-stellar-300 text-sm">⏱</span>
        </div>
        <h2 className="text-slate-300 font-body font-medium text-sm tracking-wide uppercase">
          Recent Activity
        </h2>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="skeleton h-12 rounded-lg" />
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {operations.map((op) => {
            const isReceived = op.to === publicKey;
            const isSent = op.from === publicKey;
            const isCreateAccount = op.type === 'create_account';

            return (
              <a
                key={op.id}
                href={`${EXPLORER_URL}/${op.transaction_hash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-3 rounded-xl 
                           bg-space-900/60 border border-stellar-800/20
                           hover:border-stellar-700/40 hover:bg-space-900/80
                           transition-all duration-150 group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  {/* Direction indicator */}
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-sm shrink-0 ${
                    isCreateAccount ? 'bg-stellar-900/60 text-stellar-400' :
                    isReceived ? 'bg-emerald-900/40 text-emerald-400' :
                    'bg-red-900/30 text-red-400'
                  }`}>
                    {isCreateAccount ? '✦' : isReceived ? '↓' : '↑'}
                  </div>

                  <div className="min-w-0">
                    <p className="text-xs text-slate-300 truncate">
                      {isCreateAccount
                        ? 'Account Created'
                        : isReceived
                        ? `From ${shortenKey(op.from, 4)}`
                        : `To ${shortenKey(op.to, 4)}`}
                    </p>
                    <p className="text-xs text-slate-600 mt-0.5">
                      {new Date(op.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0 ml-3">
                  {(op.amount || op.starting_balance) && (
                    <p className={`font-mono text-xs font-bold ${
                      isReceived || isCreateAccount ? 'text-emerald-400' : 'text-red-400'
                    }`}>
                      {isReceived || isCreateAccount ? '+' : '-'}
                      {parseFloat(op.amount || op.starting_balance).toFixed(4)} XLM
                    </p>
                  )}
                  <p className="text-xs text-stellar-600 group-hover:text-stellar-400 transition-colors mt-0.5">
                    View ↗
                  </p>
                </div>
              </a>
            );
          })}
        </div>
      )}
    </div>
  );
}

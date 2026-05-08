/**
 * useBalance.js — Custom React hook for fetching and refreshing XLM balance
 *
 * Automatically fetches balance when a wallet connects,
 * and exposes a refresh function to re-fetch after transactions.
 */

import { useState, useEffect, useCallback } from 'react';
import { fetchXLMBalance } from '../utils/stellar';

export function useBalance(publicKey) {
  // Current XLM balance as a string (e.g. "99.9999800")
  const [balance, setBalance] = useState(null);

  // Whether a balance fetch is in progress
  const [isLoading, setIsLoading] = useState(false);

  // Error message if fetch fails
  const [error, setError] = useState(null);

  /**
   * Fetches the current XLM balance from Horizon testnet.
   * Wrapped in useCallback so it can be safely used as a dependency.
   */
  const refresh = useCallback(async () => {
    if (!publicKey) return;

    setIsLoading(true);
    setError(null);

    try {
      const bal = await fetchXLMBalance(publicKey);
      setBalance(bal);
    } catch (err) {
      // Common error: account not yet funded via Friendbot
      if (err.response?.status === 404) {
        setError('Account not found on testnet. Fund it with Friendbot first.');
      } else {
        setError('Failed to fetch balance. Check your connection.');
      }
    } finally {
      setIsLoading(false);
    }
  }, [publicKey]);

  // Auto-fetch when publicKey changes (on connect or disconnect)
  useEffect(() => {
    if (publicKey) {
      refresh();
    } else {
      // Reset when wallet disconnects
      setBalance(null);
      setError(null);
    }
  }, [publicKey, refresh]);

  return {
    balance,      // XLM balance string or null
    isLoading,    // True while fetching
    error,        // Error message or null
    refresh,      // Call this after a successful transaction
  };
}

/**
 * useWallet.js — Custom React hook for Freighter wallet state management
 *
 * Centralizes all wallet-related state so components stay simple.
 * This hook handles:
 * - Connecting / disconnecting the wallet
 * - Tracking the connected public key
 * - Auto-reconnecting on page load if access was already granted
 */

import { useState, useEffect, useCallback } from 'react';
import {
  isFreighterInstalled,
  hasFreighterAccess,
  connectFreighter,
  getFreighterPublicKey,
  getFreighterNetwork,
} from '../utils/freighter';

export function useWallet() {
  // The connected wallet's public key (null when disconnected)
  const [publicKey, setPublicKey] = useState(null);

  // Whether we're in the middle of a connection attempt
  const [isConnecting, setIsConnecting] = useState(false);

  // Error message to display (null when no error)
  const [error, setError] = useState(null);

  // Whether Freighter extension is installed
  const [isInstalled, setIsInstalled] = useState(null); // null = checking

  // Current network Freighter is on
  const [network, setNetwork] = useState(null);

  // Whether we've finished checking for existing connection
  const [isLoading, setIsLoading] = useState(true);

  // ─── Auto-reconnect on page load ──────────────────────────────────────────

  useEffect(() => {
    async function checkExistingConnection() {
      try {
        setIsLoading(true);

        // Check if extension is installed
        const installed = await isFreighterInstalled();
        setIsInstalled(installed);

        if (!installed) {
          setIsLoading(false);
          return;
        }

        // Check if this dApp was previously approved
        const hasAccess = await hasFreighterAccess();
        if (hasAccess) {
          // Silently restore the connection without prompting
          const key = await getFreighterPublicKey();
          if (key) {
            setPublicKey(key);
            loadNetwork();
          }
        }
      } catch (err) {
        console.error('Error checking wallet connection:', err);
      } finally {
        setIsLoading(false);
      }
    }

    checkExistingConnection();
  }, []);

  // ─── Load network info ─────────────────────────────────────────────────────

  const loadNetwork = useCallback(async () => {
    const networkInfo = await getFreighterNetwork();
    if (networkInfo) setNetwork(networkInfo.network);
  }, []);

  // ─── Connect ───────────────────────────────────────────────────────────────

  /**
   * Initiates wallet connection — triggers Freighter popup.
   */
  const connect = useCallback(async () => {
    setError(null);
    setIsConnecting(true);

    try {
      const { publicKey: key, error: connectError } = await connectFreighter();

      if (connectError) {
        setError(connectError);
        return;
      }

      setPublicKey(key);
      await loadNetwork();
    } catch (err) {
      setError(err.message || 'Failed to connect wallet');
    } finally {
      setIsConnecting(false);
    }
  }, [loadNetwork]);

  // ─── Disconnect ────────────────────────────────────────────────────────────

  /**
   * Clears wallet state locally.
   * Note: Freighter doesn't have a programmatic "revoke" API —
   * users can revoke from within the extension settings.
   */
  const disconnect = useCallback(() => {
    setPublicKey(null);
    setNetwork(null);
    setError(null);
  }, []);

  // ─── Clear error ───────────────────────────────────────────────────────────

  const clearError = useCallback(() => setError(null), []);

  // ─── Return ────────────────────────────────────────────────────────────────

  return {
    publicKey,          // Connected public key or null
    isConnected: !!publicKey,
    isConnecting,       // True during connection attempt
    isLoading,          // True while checking for existing connection
    isInstalled,        // True if Freighter extension is installed
    network,            // Network name ("TESTNET", etc.)
    error,              // Error message string or null
    connect,            // Function to trigger wallet popup
    disconnect,         // Function to clear local wallet state
    clearError,         // Function to dismiss error
  };
}

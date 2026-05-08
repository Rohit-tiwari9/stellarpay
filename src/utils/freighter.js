/**
 * freighter.js — Freighter wallet v6 integration helpers
 *
 * Freighter v6 API uses:
 * - getAddress() which returns { address } (not getPublicKey / { publicKey })
 * - signTransaction() returns { signedTxXDR }
 * - isConnected() returns { isConnected: boolean }
 *
 * Install Freighter: https://www.freighter.app/
 */

import {
  isConnected,
  isAllowed,
  requestAccess,
  getAddress,
  signTransaction,
  getNetworkDetails,
} from '@stellar/freighter-api';

// ─── Wallet Detection ─────────────────────────────────────────────────────────

/**
 * Checks if the Freighter extension is installed in the browser.
 * @returns {Promise<boolean>}
 */
export async function isFreighterInstalled() {
  try {
    const result = await isConnected();
    if (typeof result === 'object' && result !== null) {
      return result.isConnected === true;
    }
    return Boolean(result);
  } catch {
    return false;
  }
}

/**
 * Checks if this dApp has already been granted access.
 * @returns {Promise<boolean>}
 */
export async function hasFreighterAccess() {
  try {
    const result = await isAllowed();
    if (typeof result === 'object' && result !== null) {
      return result.isAllowed === true;
    }
    return Boolean(result);
  } catch {
    return false;
  }
}

// ─── Wallet Connection ────────────────────────────────────────────────────────

/**
 * Requests wallet access from Freighter — triggers the popup.
 * @returns {Promise<{ publicKey: string | null, error: string | null }>}
 */
export async function connectFreighter() {
  const installed = await isFreighterInstalled();
  if (!installed) {
    return {
      publicKey: null,
      error: 'Freighter wallet is not installed. Please install it from freighter.app',
    };
  }

  try {
    const accessResult = await requestAccess();
    if (accessResult?.error) {
      const errMsg = String(accessResult.error);
      return {
        publicKey: null,
        error: errMsg.includes('declined') || errMsg.includes('rejected')
          ? 'Connection rejected. Please approve the connection in Freighter.'
          : errMsg,
      };
    }
  } catch (err) {
    const message = err?.message || String(err);
    if (message.includes('declined') || message.includes('rejected')) {
      return { publicKey: null, error: 'Connection rejected by user.' };
    }
    return { publicKey: null, error: message };
  }

  try {
    const { address, error: addrError } = await getAddress();
    if (addrError) return { publicKey: null, error: String(addrError) };
    if (!address) return { publicKey: null, error: 'Could not retrieve wallet address.' };
    return { publicKey: address, error: null };
  } catch (err) {
    return { publicKey: null, error: err?.message || 'Failed to get wallet address.' };
  }
}

/**
 * Gets the currently connected public key without prompting.
 * @returns {Promise<string | null>}
 */
export async function getFreighterPublicKey() {
  try {
    const allowed = await hasFreighterAccess();
    if (!allowed) return null;
    const { address, error } = await getAddress();
    if (error || !address) return null;
    return address;
  } catch {
    return null;
  }
}

// ─── Transaction Signing ──────────────────────────────────────────────────────

/**
 * Signs a transaction using Freighter — opens approval popup.
 * @param {string} transactionXDR - Base64-encoded unsigned transaction XDR
 * @param {string} networkPassphrase - Stellar network passphrase
 * @returns {Promise<{ signedTxXDR: string | null, error: string | null }>}
 */
export async function signWithFreighter(transactionXDR, networkPassphrase) {
  try {
    const result = await signTransaction(transactionXDR, { networkPassphrase });

    if (result?.error) {
      const errMsg = String(result.error);
      if (errMsg.includes('User declined') || errMsg.includes('rejected')) {
        return { signedTxXDR: null, error: 'Transaction rejected by user.' };
      }
      return { signedTxXDR: null, error: errMsg };
    }

    const signedXDR = result?.signedTxXDR ?? result;
    if (!signedXDR || typeof signedXDR !== 'string') {
      return { signedTxXDR: null, error: 'No signed transaction returned from Freighter.' };
    }
    return { signedTxXDR: signedXDR, error: null };
  } catch (err) {
    const message = err?.message || String(err);
    if (message.includes('User declined') || message.includes('rejected') || message.includes('cancel')) {
      return { signedTxXDR: null, error: 'Transaction rejected by user.' };
    }
    return { signedTxXDR: null, error: message };
  }
}

// ─── Network Info ─────────────────────────────────────────────────────────────

/**
 * Gets Freighter's current network.
 * @returns {Promise<{ network: string, networkUrl: string } | null>}
 */
export async function getFreighterNetwork() {
  try {
    const result = await getNetworkDetails();
    if (result?.error) return null;
    return { network: result.network, networkUrl: result.networkUrl };
  } catch {
    return null;
  }
}

/**
 * useTransaction.js — Custom React hook for sending XLM payments
 *
 * Orchestrates the full payment flow:
 * 1. Validate inputs
 * 2. Build the transaction (Stellar SDK)
 * 3. Sign it (Freighter popup)
 * 4. Submit to Horizon testnet
 * 5. Return result / error
 */

import { useState, useCallback } from 'react';
import * as StellarSdk from '@stellar/stellar-sdk';
import {
  buildPaymentTransaction,
  submitTransaction,
  isValidStellarAddress,
  hasSufficientBalance,
  NETWORK_PASSPHRASE,
} from '../utils/stellar';
import { signWithFreighter } from '../utils/freighter';

export function useTransaction(publicKey, balance, onSuccess) {
  // Transaction lifecycle states
  const [status, setStatus] = useState('idle'); // idle | validating | building | signing | submitting | success | error

  // Human-readable status message shown to the user
  const [message, setMessage] = useState('');

  // Transaction hash returned on success
  const [txHash, setTxHash] = useState(null);

  /**
   * Sends an XLM payment.
   *
   * @param {string} recipient - Stellar public key of the recipient
   * @param {string} amount - XLM amount as string (e.g. "10.5")
   * @param {string} [memo] - Optional text memo
   */
  const sendPayment = useCallback(async (recipient, amount, memo = '') => {
    // Reset any previous result
    setTxHash(null);
    setMessage('');

    // ── Step 1: Client-side validation ──────────────────────────────────────
    setStatus('validating');

    if (!recipient || !amount) {
      setStatus('error');
      setMessage('Please fill in all required fields.');
      return;
    }

    if (!isValidStellarAddress(recipient)) {
      setStatus('error');
      setMessage('Invalid recipient address. Stellar addresses start with "G" and are 56 characters long.');
      return;
    }

    if (recipient === publicKey) {
      setStatus('error');
      setMessage('You cannot send XLM to yourself.');
      return;
    }

    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      setStatus('error');
      setMessage('Amount must be a positive number.');
      return;
    }

    if (numericAmount < 0.0000001) {
      setStatus('error');
      setMessage('Minimum transaction amount is 0.0000001 XLM (1 stroop).');
      return;
    }

    if (balance && !hasSufficientBalance(balance, amount)) {
      setStatus('error');
      setMessage(`Insufficient balance. You need at least ${amount} XLM + 1 XLM reserve + fees.`);
      return;
    }

    // ── Step 2: Build the transaction ────────────────────────────────────────
    setStatus('building');
    setMessage('Building transaction...');

    let transaction;
    try {
      transaction = await buildPaymentTransaction(publicKey, recipient, amount, memo);
    } catch (err) {
      // Account might not exist (404) or network issue
      if (err.response?.status === 404) {
        setStatus('error');
        setMessage('Your account was not found on testnet. Please fund it with Friendbot.');
      } else if (err.message?.includes('op_no_destination')) {
        setStatus('error');
        setMessage('Recipient account does not exist on testnet. Ask them to fund it via Friendbot first.');
      } else {
        setStatus('error');
        setMessage(`Failed to build transaction: ${err.message || 'Unknown error'}`);
      }
      return;
    }

    // ── Step 3: Sign with Freighter ──────────────────────────────────────────
    setStatus('signing');
    setMessage('Please approve the transaction in your Freighter wallet...');

    // Convert transaction to XDR format for Freighter
    const txXDR = transaction.toXDR();

    const { signedTxXDR, error: signError } = await signWithFreighter(txXDR, NETWORK_PASSPHRASE);

    if (signError) {
      setStatus('error');
      setMessage(signError);
      return;
    }

    // ── Step 4: Submit to Testnet ────────────────────────────────────────────
    setStatus('submitting');
    setMessage('Submitting to Stellar Testnet...');

    try {
      // Decode the signed XDR back into a Transaction object
      const signedTx = StellarSdk.TransactionBuilder.fromXDR(
        signedTxXDR,
        NETWORK_PASSPHRASE
      );

      const result = await submitTransaction(signedTx);

      // ── Step 5: Success! ─────────────────────────────────────────────────
      setStatus('success');
      setTxHash(result.hash);
      setMessage(`Successfully sent ${amount} XLM!`);

      // Notify parent to refresh balance
      if (onSuccess) onSuccess();

    } catch (err) {
      // Parse Horizon error details for better messages
      const horizonError = parseHorizonError(err);
      setStatus('error');
      setMessage(horizonError);
    }
  }, [publicKey, balance, onSuccess]);

  /**
   * Resets transaction state back to idle.
   * Call this when the user wants to send another payment.
   */
  const reset = useCallback(() => {
    setStatus('idle');
    setMessage('');
    setTxHash(null);
  }, []);

  return {
    status,       // Current status string
    message,      // Human-readable message
    txHash,       // Transaction hash on success
    sendPayment,  // Function to initiate payment
    reset,        // Function to reset state
    isLoading: ['validating', 'building', 'signing', 'submitting'].includes(status),
  };
}

// ─── Error Parser ─────────────────────────────────────────────────────────────

/**
 * Extracts a user-friendly error message from Horizon API errors.
 * Horizon wraps errors in a structured response body.
 */
function parseHorizonError(err) {
  try {
    // Horizon errors have a response with a JSON body
    const extras = err?.response?.data?.extras;
    if (extras?.result_codes) {
      const { transaction: txCode, operations } = extras.result_codes;
      const opCode = operations?.[0];

      // Map common result codes to friendly messages
      const codeMessages = {
        'tx_insufficient_balance': 'Insufficient XLM balance to cover this transaction and fees.',
        'tx_bad_seq': 'Transaction sequence error. Please try again.',
        'tx_too_late': 'Transaction expired. Please try again.',
        'op_underfunded': 'Insufficient XLM balance for this payment.',
        'op_low_reserve': 'This would leave your account below the minimum reserve (1 XLM).',
        'op_no_destination': 'Recipient account does not exist. They need to fund their account first.',
        'op_no_trust': 'Recipient does not trust this asset.',
        'op_line_full': "Recipient's account balance limit reached.",
        'op_bad_auth': 'Authorization error. Please reconnect your wallet.',
      };

      const friendly = codeMessages[opCode] || codeMessages[txCode];
      if (friendly) return friendly;

      return `Transaction failed: ${opCode || txCode || 'Unknown error'}`;
    }
  } catch {
    // Fall through to generic message
  }

  return err?.message || 'Transaction failed. Please try again.';
}

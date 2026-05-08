/**
 * stellar.js — Utility functions for interacting with the Stellar Testnet
 *
 * Uses the Stellar SDK to:
 * - Fetch account balances
 * - Build and submit payment transactions
 *
 * Testnet Horizon URL: https://horizon-testnet.stellar.org
 */

import * as StellarSdk from '@stellar/stellar-sdk';

// ─── Network Configuration ────────────────────────────────────────────────────

/** Horizon server connected to Stellar Testnet */
const server = new StellarSdk.Horizon.Server('https://horizon-testnet.stellar.org');

/** Testnet network passphrase — required to sign transactions correctly */
export const NETWORK_PASSPHRASE = StellarSdk.Networks.TESTNET;

/** Testnet Horizon base URL (useful for explorer links) */
export const HORIZON_URL = 'https://horizon-testnet.stellar.org';

/** Stellar Expert explorer URL for testnet */
export const EXPLORER_URL = 'https://stellar.expert/explorer/testnet/tx';

// ─── Account & Balance ────────────────────────────────────────────────────────

/**
 * Fetches the XLM (native) balance of a Stellar account.
 *
 * @param {string} publicKey - The Stellar public key (starts with 'G')
 * @returns {Promise<string>} The XLM balance as a string, e.g. "99.9999800"
 * @throws Will throw if account not found or network error
 */
export async function fetchXLMBalance(publicKey) {
  // Load account data from Horizon
  const account = await server.loadAccount(publicKey);

  // Balances is an array — find the "native" (XLM) entry
  const xlmBalance = account.balances.find(
    (balance) => balance.asset_type === 'native'
  );

  return xlmBalance ? xlmBalance.balance : '0';
}

/**
 * Checks whether a Stellar account exists on the testnet.
 * New accounts must be funded via Friendbot before they can transact.
 *
 * @param {string} publicKey - Stellar public key
 * @returns {Promise<boolean>} true if the account exists
 */
export async function accountExists(publicKey) {
  try {
    await server.loadAccount(publicKey);
    return true;
  } catch {
    return false;
  }
}

// ─── Transaction Building ─────────────────────────────────────────────────────

/**
 * Builds an unsigned XLM payment transaction.
 *
 * The transaction is built but NOT signed here.
 * Signing happens in the Freighter wallet popup (see sendPayment).
 *
 * @param {string} senderPublicKey - Sender's Stellar public key
 * @param {string} recipientPublicKey - Recipient's Stellar public key
 * @param {string|number} amount - Amount of XLM to send (e.g. "10" or 10)
 * @param {string} [memo] - Optional text memo (max 28 bytes)
 * @returns {Promise<StellarSdk.Transaction>} The unsigned transaction object
 */
export async function buildPaymentTransaction(
  senderPublicKey,
  recipientPublicKey,
  amount,
  memo = ''
) {
  // 1. Load the sender's account to get the sequence number
  //    Sequence numbers prevent replay attacks on transactions
  const account = await server.loadAccount(senderPublicKey);

  // 2. Build the transaction
  let txBuilder = new StellarSdk.TransactionBuilder(account, {
    fee: StellarSdk.BASE_FEE,        // Current minimum fee (100 stroops = 0.00001 XLM)
    networkPassphrase: NETWORK_PASSPHRASE,
  })
    // Add the payment operation
    .addOperation(
      StellarSdk.Operation.payment({
        destination: recipientPublicKey,  // Who receives the XLM
        asset: StellarSdk.Asset.native(),  // XLM is the "native" asset
        amount: String(amount),            // Must be a string
      })
    )
    // Transactions expire — 30 seconds is standard for interactive flows
    .setTimeout(30);

  // 3. Optionally attach a memo (text note on the transaction)
  if (memo && memo.trim()) {
    txBuilder = txBuilder.addMemo(StellarSdk.Memo.text(memo.trim()));
  }

  // 4. Finalize and return the unsigned transaction
  return txBuilder.build();
}

/**
 * Submits a signed transaction to the Stellar Testnet.
 *
 * @param {StellarSdk.Transaction} signedTransaction - Transaction signed by Freighter
 * @returns {Promise<object>} Horizon response with hash, ledger, etc.
 */
export async function submitTransaction(signedTransaction) {
  return await server.submitTransaction(signedTransaction);
}

// ─── Validation Helpers ───────────────────────────────────────────────────────

/**
 * Validates a Stellar public key (must start with 'G' and be 56 chars).
 *
 * @param {string} address - Address to validate
 * @returns {boolean} true if valid
 */
export function isValidStellarAddress(address) {
  try {
    StellarSdk.Keypair.fromPublicKey(address);
    return true;
  } catch {
    return false;
  }
}

/**
 * Checks if there's enough XLM to cover the payment + reserve + fee.
 *
 * Stellar accounts must maintain a minimum balance of 1 XLM (base reserve).
 * Each entry (trustline, offer, etc.) adds 0.5 XLM to the reserve.
 * For a basic account with no extras, minimum is 1 XLM.
 *
 * @param {string} balance - Current XLM balance as string
 * @param {string|number} amount - Amount to send
 * @returns {boolean} true if sufficient
 */
export function hasSufficientBalance(balance, amount) {
  const MIN_RESERVE = 1;      // Minimum 1 XLM must remain in account
  const TX_FEE = 0.00001;     // Base transaction fee (100 stroops)
  const available = parseFloat(balance) - MIN_RESERVE - TX_FEE;
  return available >= parseFloat(amount);
}

/**
 * Shortens a Stellar public key for display.
 * e.g. "GABC...XYZ"
 *
 * @param {string} key - Full Stellar public key
 * @param {number} chars - Characters to show on each side
 * @returns {string} Truncated key
 */
export function shortenKey(key, chars = 6) {
  if (!key) return '';
  return `${key.slice(0, chars)}...${key.slice(-chars)}`;
}

/**
 * Formats XLM balance to a human-readable string.
 *
 * @param {string|number} balance - Raw balance
 * @param {number} decimals - Decimal places (default 4)
 * @returns {string} Formatted balance
 */
export function formatXLM(balance, decimals = 4) {
  return parseFloat(balance).toFixed(decimals);
}

/**
 * Funds a new testnet account using Stellar Friendbot.
 * Friendbot gives 10,000 XLM to any new testnet address — free!
 *
 * @param {string} publicKey - Address to fund
 * @returns {Promise<boolean>} true if funded successfully
 */
export async function fundWithFriendbot(publicKey) {
  try {
    const response = await fetch(
      `https://friendbot.stellar.org?addr=${encodeURIComponent(publicKey)}`
    );
    return response.ok;
  } catch {
    return false;
  }
}

/**
 * SendPayment.jsx — XLM payment form component
 *
 * Handles the UI for:
 * - Recipient address input
 * - Amount input
 * - Optional memo
 * - Transaction status (loading / success / error)
 */

import { useState } from 'react';
import { EXPLORER_URL, isValidStellarAddress } from '../utils/stellar';

export default function SendPayment({ publicKey, balance, onSend, status, message, txHash, onReset }) {
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [memo, setMemo] = useState('');
  const [touched, setTouched] = useState({ recipient: false, amount: false });

  const isLoading = ['validating', 'building', 'signing', 'submitting'].includes(status);
  const isSuccess = status === 'success';
  const isError = status === 'error';

  // Inline validation
  const recipientError = touched.recipient && recipient && !isValidStellarAddress(recipient)
    ? 'Invalid Stellar address'
    : null;

  const amountError = touched.amount && amount && (isNaN(parseFloat(amount)) || parseFloat(amount) <= 0)
    ? 'Enter a valid positive amount'
    : null;

  function handleSubmit(e) {
    e.preventDefault();
    // Mark all fields as touched to show validation
    setTouched({ recipient: true, amount: true });

    if (recipientError || amountError) return;
    onSend(recipient, amount, memo);
  }

  function handleReset() {
    setRecipient('');
    setAmount('');
    setMemo('');
    setTouched({ recipient: false, amount: false });
    onReset();
  }

  // Set max available balance
  function handleSetMax() {
    if (balance) {
      const max = Math.max(0, parseFloat(balance) - 1 - 0.00001).toFixed(7);
      setAmount(max);
      setTouched(t => ({ ...t, amount: true }));
    }
  }

  return (
    <div className="glass-card p-6">
      {/* Header */}
      <div className="flex items-center gap-2 mb-6">
        <div className="w-8 h-8 rounded-lg bg-stellar-800/50 flex items-center justify-center">
          <span className="text-stellar-300 text-sm">↗</span>
        </div>
        <h2 className="text-slate-300 font-body font-medium text-sm tracking-wide uppercase">
          Send XLM
        </h2>
      </div>

      {/* ── Success state ─────────────────────────────────────────────────────── */}
      {isSuccess && (
        <div className="animate-slide-up text-center space-y-4 py-4">
          {/* Success animation */}
          <div className="mx-auto w-16 h-16 rounded-full bg-emerald-900/40 border border-emerald-700/50
                          flex items-center justify-center text-3xl">
            ✓
          </div>
          <div>
            <p className="text-emerald-400 font-semibold text-lg">{message}</p>
            <p className="text-slate-500 text-sm mt-1">Transaction confirmed on Stellar Testnet</p>
          </div>

          {/* Transaction hash */}
          {txHash && (
            <div className="bg-space-900/60 border border-stellar-800/30 rounded-xl p-4 text-left">
              <p className="text-xs text-slate-500 mb-1">Transaction Hash</p>
              <p className="font-mono text-xs text-stellar-300 break-all">{txHash}</p>
              <a
                href={`${EXPLORER_URL}/${txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs text-stellar-400 
                           hover:text-stellar-200 transition-colors mt-2"
              >
                View on Stellar Expert ↗
              </a>
            </div>
          )}

          <button onClick={handleReset} className="btn-primary w-full">
            Send Another Payment
          </button>
        </div>
      )}

      {/* ── Form (idle or error state) ────────────────────────────────────────── */}
      {!isSuccess && (
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Error banner */}
          {isError && message && (
            <div className="flex items-start gap-2 bg-red-900/20 border border-red-700/30 
                            rounded-xl px-4 py-3 animate-slide-up">
              <span className="shrink-0 text-red-400 mt-0.5">⚠</span>
              <div className="flex-1 min-w-0">
                <p className="text-red-300 text-sm font-medium">Transaction Failed</p>
                <p className="text-red-400/80 text-xs mt-0.5">{message}</p>
              </div>
              <button
                type="button"
                onClick={onReset}
                className="shrink-0 text-red-500 hover:text-red-300 text-lg leading-none"
              >
                ✕
              </button>
            </div>
          )}

          {/* Recipient address */}
          <div>
            <label className="block text-xs text-slate-400 mb-1.5 font-medium tracking-wide">
              Recipient Address <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value.trim())}
              onBlur={() => setTouched(t => ({ ...t, recipient: true }))}
              placeholder="G... (Stellar public key)"
              className={`stellar-input ${recipientError ? 'border-red-600/60 focus:border-red-500/70 focus:ring-red-500/20' : ''}`}
              disabled={isLoading}
              autoComplete="off"
              spellCheck={false}
            />
            {recipientError && (
              <p className="text-red-400 text-xs mt-1">{recipientError}</p>
            )}
          </div>

          {/* Amount */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs text-slate-400 font-medium tracking-wide">
                Amount (XLM) <span className="text-red-400">*</span>
              </label>
              {balance && (
                <button
                  type="button"
                  onClick={handleSetMax}
                  disabled={isLoading}
                  className="text-xs text-stellar-400 hover:text-stellar-200 transition-colors"
                >
                  Max: {Math.max(0, parseFloat(balance) - 1).toFixed(4)} XLM
                </button>
              )}
            </div>
            <div className="relative">
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                onBlur={() => setTouched(t => ({ ...t, amount: true }))}
                placeholder="0.0000"
                min="0.0000001"
                step="any"
                className={`stellar-input pr-14 ${amountError ? 'border-red-600/60 focus:border-red-500/70 focus:ring-red-500/20' : ''}`}
                disabled={isLoading}
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-stellar-500 font-mono text-sm font-bold">
                XLM
              </span>
            </div>
            {amountError && (
              <p className="text-red-400 text-xs mt-1">{amountError}</p>
            )}
          </div>

          {/* Memo (optional) */}
          <div>
            <label className="block text-xs text-slate-400 mb-1.5 font-medium tracking-wide">
              Memo
              <span className="text-slate-600 font-normal ml-1">(optional, max 28 chars)</span>
            </label>
            <input
              type="text"
              value={memo}
              onChange={(e) => setMemo(e.target.value.slice(0, 28))}
              placeholder="Payment note..."
              className="stellar-input"
              disabled={isLoading}
              maxLength={28}
            />
            {memo && (
              <p className="text-xs text-slate-600 mt-1 text-right">{memo.length}/28</p>
            )}
          </div>

          {/* Status message (building / signing / submitting) */}
          {isLoading && message && (
            <div className="flex items-center gap-2 bg-stellar-900/30 border border-stellar-700/30 
                            rounded-xl px-4 py-3 animate-fade-in">
              <SpinnerIcon />
              <p className="text-stellar-300 text-sm">{message}</p>
            </div>
          )}

          {/* Submit button */}
          <button
            type="submit"
            disabled={isLoading || !publicKey}
            className="btn-primary w-full flex items-center justify-center gap-2 mt-2"
          >
            {isLoading ? (
              <>
                <SpinnerIcon />
                {getButtonLabel(status)}
              </>
            ) : (
              <>
                <SendIcon />
                Send XLM
              </>
            )}
          </button>

          {/* Not connected notice */}
          {!publicKey && (
            <p className="text-center text-xs text-slate-500">
              Connect your wallet to send XLM
            </p>
          )}

          {/* Transaction fee notice */}
          <p className="text-center text-xs text-slate-600">
            Network fee: ~0.00001 XLM • Testnet only
          </p>
        </form>
      )}
    </div>
  );
}

// ─── Helpers ───────────────────────────────────────────────────────────────────

function getButtonLabel(status) {
  switch (status) {
    case 'validating': return 'Validating...';
    case 'building': return 'Building Transaction...';
    case 'signing': return 'Awaiting Signature...';
    case 'submitting': return 'Submitting...';
    default: return 'Send XLM';
  }
}

// ─── Icons ─────────────────────────────────────────────────────────────────────

function SendIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m22 2-7 20-4-9-9-4Z" />
      <path d="M22 2 11 13" />
    </svg>
  );
}

function SpinnerIcon() {
  return (
    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  );
}

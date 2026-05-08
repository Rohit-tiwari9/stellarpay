/**
 * WalletConnect.jsx — Wallet connection UI component
 *
 * Displays:
 * - "Connect Wallet" button (triggers Freighter popup)
 * - Connected state with public key + disconnect button
 * - Installation prompt if Freighter isn't detected
 */

import { shortenKey } from '../utils/stellar';

export default function WalletConnect({
  publicKey,
  isConnected,
  isConnecting,
  isLoading,
  isInstalled,
  network,
  error,
  onConnect,
  onDisconnect,
  onClearError,
}) {
  // ─── Loading state (checking for existing connection) ─────────────────────
  if (isLoading) {
    return (
      <div className="flex items-center gap-3">
        <div className="skeleton h-9 w-36 rounded-xl" />
      </div>
    );
  }

  // ─── Freighter not installed ───────────────────────────────────────────────
  if (isInstalled === false) {
    return (
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <a
          href="https://www.freighter.app/"
          target="_blank"
          rel="noopener noreferrer"
          className="btn-primary text-sm flex items-center gap-2 no-underline"
        >
          <span>🚀</span>
          Install Freighter Wallet
        </a>
        <span className="text-xs text-slate-500">Required to use StellarPay</span>
      </div>
    );
  }

  // ─── Connected state ───────────────────────────────────────────────────────
  if (isConnected && publicKey) {
    return (
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 animate-fade-in">
        {/* Network badge */}
        {network && (
          <span className={`text-xs font-mono px-2.5 py-1 rounded-full border ${
            network === 'TESTNET'
              ? 'bg-amber-900/30 border-amber-700/40 text-amber-400'
              : 'bg-red-900/30 border-red-700/40 text-red-400'
          }`}>
            {network === 'TESTNET' ? '🧪 Testnet' : `⚠️ ${network}`}
          </span>
        )}

        {/* Connected badge with public key */}
        <div className="badge-connected">
          {/* Animated green dot */}
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
          <span title={publicKey} className="cursor-help">
            {shortenKey(publicKey, 8)}
          </span>
          {/* Copy key button */}
          <button
            onClick={() => navigator.clipboard.writeText(publicKey)}
            title="Copy full address"
            className="ml-1 text-stellar-400 hover:text-stellar-200 transition-colors"
          >
            <CopyIcon />
          </button>
        </div>

        {/* Disconnect button */}
        <button
          onClick={onDisconnect}
          className="btn-danger text-sm py-1.5 px-3"
          title="Disconnect wallet"
        >
          Disconnect
        </button>
      </div>
    );
  }

  // ─── Disconnected state ────────────────────────────────────────────────────
  return (
    <div className="flex flex-col items-start gap-2">
      <button
        onClick={onConnect}
        disabled={isConnecting}
        className="btn-primary flex items-center gap-2 text-sm"
      >
        {isConnecting ? (
          <>
            <SpinnerIcon />
            Connecting...
          </>
        ) : (
          <>
            <WalletIcon />
            Connect Wallet
          </>
        )}
      </button>

      {/* Error message */}
      {error && (
        <div className="flex items-start gap-2 text-xs text-red-400 bg-red-900/20 border border-red-700/30 rounded-lg px-3 py-2 max-w-xs animate-fade-in">
          <span className="shrink-0 mt-0.5">⚠️</span>
          <span>{error}</span>
          <button
            onClick={onClearError}
            className="shrink-0 text-red-500 hover:text-red-300 ml-auto"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Small Icon Components ─────────────────────────────────────────────────────

function WalletIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 12V22H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h16v4" />
      <path d="M22 12a2 2 0 0 0-2-2h-4a2 2 0 0 0 0 4h4a2 2 0 0 0 2-2z" />
    </svg>
  );
}

function SpinnerIcon() {
  return (
    <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  );
}

function CopyIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
      <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
    </svg>
  );
}

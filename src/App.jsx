/**
 * App.jsx — Root component for StellarPay
 *
 * Layout:
 * ┌──────────────────────────────────────────┐
 * │  Header (logo + wallet connect)          │
 * ├──────────────────────────────────────────┤
 * │  Hero section                            │
 * ├──────────────────────────────────────────┤
 * │  Left column          │  Right column    │
 * │  - Balance Display    │  - Send Payment  │
 * │  - Recent Activity    │                  │
 * └──────────────────────────────────────────┘
 */

import { useWallet } from './hooks/useWallet';
import { useBalance } from './hooks/useBalance';
import { useTransaction } from './hooks/useTransaction';

import WalletConnect from './components/WalletConnect';
import BalanceDisplay from './components/BalanceDisplay';
import SendPayment from './components/SendPayment';
import RecentActivity from './components/RecentActivity';
import StarField from './components/StarField';

export default function App() {
  // ─── Wallet state ─────────────────────────────────────────────────────────
  const wallet = useWallet();

  // ─── Balance state ────────────────────────────────────────────────────────
  const { balance, isLoading: balanceLoading, error: balanceError, refresh: refreshBalance } = useBalance(wallet.publicKey);

  // ─── Transaction state ────────────────────────────────────────────────────
  const tx = useTransaction(wallet.publicKey, balance, refreshBalance);

  return (
    <div className="min-h-screen relative overflow-x-hidden">
      {/* Animated star background */}
      <StarField />

      {/* Grid overlay */}
      <div className="fixed inset-0 bg-grid-pattern bg-grid opacity-40 pointer-events-none z-0" />

      {/* Gradient overlay at top */}
      <div className="fixed inset-0 bg-gradient-to-b from-stellar-900/20 via-transparent to-space-950/60 pointer-events-none z-0" />

      {/* Main content */}
      <div className="relative z-10">
        {/* ── Header ─────────────────────────────────────────────────────── */}
        <header className="border-b border-stellar-800/20 bg-space-950/80 backdrop-blur-md sticky top-0 z-50">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-4">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="relative">
                {/* Glow ring */}
                <div className="absolute inset-0 rounded-xl bg-stellar-500/20 blur-sm animate-pulse-slow" />
                <div className="relative w-9 h-9 rounded-xl bg-gradient-to-br from-stellar-600 to-stellar-800
                                border border-stellar-500/30 flex items-center justify-center">
                  <span className="text-white font-display font-bold text-sm">S</span>
                </div>
              </div>
              <div>
                <h1 className="font-display font-bold text-lg text-white tracking-tight leading-none">
                  StellarPay
                </h1>
                <p className="text-xs text-stellar-500 font-mono leading-none mt-0.5">Testnet</p>
              </div>
            </div>

            {/* Wallet connect controls */}
            <WalletConnect
              publicKey={wallet.publicKey}
              isConnected={wallet.isConnected}
              isConnecting={wallet.isConnecting}
              isLoading={wallet.isLoading}
              isInstalled={wallet.isInstalled}
              network={wallet.network}
              error={wallet.error}
              onConnect={wallet.connect}
              onDisconnect={wallet.disconnect}
              onClearError={wallet.clearError}
            />
          </div>
        </header>

        {/* ── Hero ───────────────────────────────────────────────────────── */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 pt-12 pb-8">
          <div className="text-center max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-stellar-900/40 border border-stellar-700/30
                            text-stellar-400 text-xs font-mono px-3 py-1.5 rounded-full mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-stellar-400 animate-pulse" />
              Stellar Testnet • XLM Payments
            </div>
            <h2 className="font-display text-4xl sm:text-5xl font-bold text-white mb-4 leading-tight">
              Send XLM
              <span className="text-gradient"> instantly</span>
            </h2>
            <p className="text-slate-400 text-lg leading-relaxed">
              A beginner-friendly Stellar dApp. Connect your Freighter wallet and
              start sending XLM on the testnet — no real money involved.
            </p>

            {/* Quickstart steps when not connected */}
            {!wallet.isConnected && !wallet.isLoading && (
              <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4 text-sm text-slate-500">
                <Step num={1} label="Install Freighter" />
                <Arrow />
                <Step num={2} label="Connect Wallet" />
                <Arrow />
                <Step num={3} label="Send XLM" />
              </div>
            )}
          </div>
        </section>

        {/* ── Main grid ──────────────────────────────────────────────────── */}
        <main className="max-w-6xl mx-auto px-4 sm:px-6 pb-16">
          {wallet.isConnected ? (
            /* Connected layout: 2 columns */
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left column */}
              <div className="space-y-6">
                <BalanceDisplay
                  publicKey={wallet.publicKey}
                  balance={balance}
                  isLoading={balanceLoading}
                  error={balanceError}
                  onRefresh={refreshBalance}
                />
                <RecentActivity publicKey={wallet.publicKey} />
              </div>

              {/* Right column */}
              <div>
                <SendPayment
                  publicKey={wallet.publicKey}
                  balance={balance}
                  onSend={tx.sendPayment}
                  status={tx.status}
                  message={tx.message}
                  txHash={tx.txHash}
                  onReset={tx.reset}
                />
              </div>
            </div>
          ) : (
            /* Disconnected layout: centered cards */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
              <FeatureCard
                icon="🔒"
                title="Freighter Integration"
                desc="Secure wallet connection via the official Freighter browser extension."
              />
              <FeatureCard
                icon="⚡"
                title="Instant Settlement"
                desc="Stellar transactions confirm in 3–5 seconds with near-zero fees."
              />
              <FeatureCard
                icon="🧪"
                title="Testnet Safe"
                desc="Practice with free test XLM from Friendbot — no real funds at risk."
              />
            </div>
          )}
        </main>

        {/* ── Footer ─────────────────────────────────────────────────────── */}
        <footer className="border-t border-stellar-800/20 bg-space-950/60 backdrop-blur-sm">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 flex flex-col sm:flex-row
                          items-center justify-between gap-3 text-xs text-slate-600">
            <div className="flex items-center gap-2">
              <span className="font-display">StellarPay</span>
              <span>•</span>
              <span>Built for Stellar White Belt Level 1</span>
            </div>
            <div className="flex items-center gap-4">
              <a
                href="https://developers.stellar.org"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-stellar-400 transition-colors"
              >
                Stellar Docs ↗
              </a>
              <a
                href="https://www.freighter.app"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-stellar-400 transition-colors"
              >
                Freighter ↗
              </a>
              <a
                href="https://stellar.expert/explorer/testnet"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-stellar-400 transition-colors"
              >
                Explorer ↗
              </a>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}

// ─── Small helper components ───────────────────────────────────────────────────

function Step({ num, label }) {
  return (
    <div className="flex items-center gap-2">
      <span className="w-6 h-6 rounded-full bg-stellar-800 border border-stellar-600 
                       text-stellar-300 text-xs flex items-center justify-center font-bold">
        {num}
      </span>
      <span>{label}</span>
    </div>
  );
}

function Arrow() {
  return <span className="text-stellar-800 hidden sm:block">→</span>;
}

function FeatureCard({ icon, title, desc }) {
  return (
    <div className="glass-card p-6 hover:border-stellar-700/50 transition-colors duration-300">
      <span className="text-2xl block mb-3">{icon}</span>
      <h3 className="text-white font-semibold mb-1.5">{title}</h3>
      <p className="text-slate-400 text-sm leading-relaxed">{desc}</p>
    </div>
  );
}

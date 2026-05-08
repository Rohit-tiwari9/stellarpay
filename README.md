# 🚀 StellarPay — XLM Testnet Wallet dApp

A beginner-friendly, production-ready dApp for sending XLM on the **Stellar Testnet** built with **React + Vite**, **Tailwind CSS**, and the **Freighter wallet**.

> ✅ Satisfies Stellar White Belt Level 1 requirements

---

## ✨ Features

| Feature | Details |
|---|---|
| 🔗 **Wallet Integration** | Connect / disconnect Freighter wallet with one click |
| 💰 **Balance Display** | Live XLM balance with reserve breakdown |
| ↗️ **Send XLM** | Full payment flow: build → sign → submit |
| 🔒 **Freighter Signing** | Official popup for both connect and transaction approval |
| 🧪 **Friendbot** | Fund new testnet accounts with free 10,000 XLM |
| 📋 **Recent Activity** | View last 8 payment operations |
| 🌐 **Explorer Links** | Every transaction links to Stellar Expert |
| ⚡ **Error Handling** | Wallet not installed, rejected tx, bad address, low balance |
| 🎨 **Dark UI** | Space-themed dark design with Tailwind CSS |
| 📱 **Responsive** | Works on mobile, tablet, and desktop |

---

## 🛠 Tech Stack

- **Frontend**: React 18 + Vite 5
- **Styling**: Tailwind CSS 3
- **Wallet**: `@stellar/freighter-api`
- **Blockchain**: `@stellar/stellar-sdk` (Testnet)
- **Network**: Stellar Testnet (Horizon: `https://horizon-testnet.stellar.org`)

---

## 📁 Project Structure

```
stellarpay/
├── public/
│   └── favicon.svg
├── src/
│   ├── components/
│   │   ├── WalletConnect.jsx   # Connect/disconnect UI
│   │   ├── BalanceDisplay.jsx  # XLM balance + Friendbot
│   │   ├── SendPayment.jsx     # Payment form + status
│   │   ├── RecentActivity.jsx  # Last 8 operations
│   │   └── StarField.jsx       # Animated background
│   ├── hooks/
│   │   ├── useWallet.js        # Wallet state management
│   │   ├── useBalance.js       # Balance fetching
│   │   └── useTransaction.js   # Transaction lifecycle
│   ├── utils/
│   │   ├── stellar.js          # Stellar SDK helpers
│   │   └── freighter.js        # Freighter API helpers
│   ├── App.jsx                 # Root layout
│   ├── main.jsx                # Entry point
│   └── index.css               # Tailwind + custom styles
├── index.html
├── vite.config.js
├── tailwind.config.js
└── package.json
```

---

## 🚀 Installation & Local Setup

### Prerequisites

1. **Node.js** v18+ ([download](https://nodejs.org))
2. **Freighter Wallet** browser extension ([freighter.app](https://www.freighter.app/))
   - After installing, open Freighter and switch to **Testnet** in Settings

### Steps

```bash
# 1. Clone the repo
git clone https://github.com/YOUR_USERNAME/stellarpay.git
cd stellarpay

# 2. Install dependencies
npm install

# 3. Start the dev server
npm run dev

# 4. Open in browser
# → http://localhost:5173
```

### First-Time Setup in Freighter

1. Install the [Freighter browser extension](https://www.freighter.app/)
2. Create or import a wallet
3. Go to **Settings → Network** and switch to **Testnet**
4. Open StellarPay and click **Connect Wallet**
5. Click **Get test XLM from Friendbot** to fund your account

---

## 💸 How to Send XLM

1. **Connect** your Freighter wallet (click "Connect Wallet" in the header)
2. **Fund** your account if it's new (click "Get test XLM from Friendbot")
3. Enter the **recipient's Stellar address** (starts with `G`)
4. Enter an **amount** (you can click "Max" to use your full available balance)
5. Optionally add a **memo** (up to 28 characters)
6. Click **Send XLM** — the Freighter popup will ask you to approve
7. After approval, the transaction is submitted and you'll see the **transaction hash**

---

## 📸 Screenshots

> Add screenshots here after running the app locally.

| Connected Wallet | Send Payment | Success |
|---|---|---|
| _(screenshot)_ | _(screenshot)_ | _(screenshot)_ |

---

## 🌐 Deployment on Vercel

### Option A: Deploy from GitHub (Recommended)

1. Push your project to GitHub
2. Go to [vercel.com](https://vercel.com) and log in
3. Click **"New Project"** → Import your repo
4. Vercel auto-detects Vite — just click **Deploy**
5. Your app will be live at `https://YOUR_PROJECT.vercel.app`

### Option B: Deploy via Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Follow prompts — Vite preset is auto-detected
```

### Build Settings (auto-detected)

| Setting | Value |
|---|---|
| Framework | Vite |
| Build Command | `npm run build` |
| Output Directory | `dist` |
| Install Command | `npm install` |

### Environment Variables

No environment variables are required. The app connects to the **public Stellar Testnet Horizon API** — no API keys needed.

---

## 🔧 Available Scripts

```bash
npm run dev        # Start development server (port 5173)
npm run build      # Build for production → ./dist
npm run preview    # Preview production build locally
npm run lint       # Run ESLint
```

---

## ⚠️ Important Notes

- **Testnet only** — This dApp uses the Stellar Testnet. No real XLM is involved.
- **Freighter required** — The Freighter browser extension must be installed and set to Testnet.
- **Minimum reserve** — Stellar accounts must keep at least 1 XLM as a minimum balance.
- **Friendbot** — New testnet accounts must be funded via [Friendbot](https://friendbot.stellar.org) before transacting.

---

## 📚 Learning Resources

- [Stellar Developer Docs](https://developers.stellar.org)
- [Stellar SDK for JavaScript](https://stellar.github.io/js-stellar-sdk/)
- [Freighter API Docs](https://docs.freighter.app)
- [Stellar Expert Testnet Explorer](https://stellar.expert/explorer/testnet)
- [Stellar Horizon API](https://horizon-testnet.stellar.org)

---

## 📄 License

MIT — Free to use and modify.

---

<p align="center">Built with ❤️ for the Stellar ecosystem</p>

# KinkoX Deployment Guide

## Prerequisites
- Node.js 18+ installed
- Git installed
- MetaMask or any Web3 wallet
- Sepolia testnet ETH (for testing)

## Step 1: Clone and Install

```bash
# Clone the repository
git clone https://github.com/abdulboyprogramming-arch/kinkox.git
cd kinkox

# Install dependencies
npm install
```

Step 2: Environment Configuration

Create a .env.local file:

```env
NEXT_PUBLIC_CONTRACT_ADDRESS=0xc55cA69BdCB93eaEfd31eFDF6A9292d0439A9F0e
NEXT_PUBLIC_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_KEY
NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=YOUR_WALLET_CONNECT_ID
```

Step 3: Run Development Server

```bash
npm run dev
```

Visit http://localhost:3000

Step 4: Build for Production

```bash
npm run build
npm start
```

Step 5: Deployment Options

Option A: Deploy to Vercel (Recommended)

1. Push code to GitHub
2. Go to vercel.com
3. Import your repository
4. Add environment variables
5. Deploy

Option B: Deploy to Netlify

1. Push code to GitHub
2. Go to netlify.com
3. Import from Git
4. Set build command: npm run build
5. Set publish directory: out

Option C: Deploy to Railway

1. Install Railway CLI: npm i -g @railway/cli
2. Login: railway login
3. Initialize: railway init
4. Deploy: railway up

Step 6: Configure Kwala Workflows for Telegram Notifications

Workflow 1: Deposit Notification

Create a workflow in Kwala:

```yaml
name: Deposit Notification
trigger:
  type: contract_event
  contract: 0xc55cA69BdCB93eaEfd31eFDF6A9292d0439A9F0e
  event: Deposit
  chain: sepolia
actions:
  - type: telegram
    bot_token: ${TELEGRAM_BOT_TOKEN}
    chat_id: ${TELEGRAM_CHAT_ID}
    message: |
      🎉 New Deposit Alert!
      
      User: {{event.user}}
      Amount: {{event.amount}} ETH
      Duration: {{event.duration}} days
      
      🔗 View: https://sepolia.etherscan.io/tx/{{tx.hash}}
```

Workflow 2: Withdrawal Notification

```yaml
name: Withdrawal Notification
trigger:
  type: contract_event
  contract: 0xc55cA69BdCB93eaEfd31eFDF6A9292d0439A9F0e
  event: Withdrawal
  chain: sepolia
actions:
  - type: telegram
    bot_token: ${TELEGRAM_BOT_TOKEN}
    chat_id: ${TELEGRAM_CHAT_ID}
    message: |
      💰 Withdrawal Alert!
      
      User: {{event.user}}
      Amount: {{event.amount}} ETH
      
      🔗 View: https://sepolia.etherscan.io/tx/{{tx.hash}}
```

Workflow 3: Daily Summary Report

```yaml
name: Daily Summary Report
trigger:
  type: schedule
  cron: "0 9 * * *"  # 9 AM daily
actions:
  - type: contract_call
    contract: 0xc55cA69BdCB93eaEfd31eFDF6A9292d0439A9F0e
    function: getTotalDeposited
    output: total_deposited
  - type: contract_call
    contract: 0xc55cA69BdCB93eaEfd31eFDF6A9292d0439A9F0e
    function: getTotalUsers
    output: total_users
  - type: telegram
    bot_token: ${TELEGRAM_BOT_TOKEN}
    chat_id: ${TELEGRAM_CHAT_ID}
    message: |
      📊 KinkoX Daily Report
      
      Total Deposited: {{total_deposited}} ETH
      Total Users: {{total_users}}
      Active Positions: {{active_positions}}
      
      📈 24h Volume: {{volume_24h}} ETH
```

Step 7: Testing Checklist

· Wallet connection works
· Deposit function works with correct lock period
· Withdrawal only works after lock period
· Dashboard displays correct stats
· Transaction history shows all activities
· PDF report generates correctly
· Light/Dark mode toggle works
· Responsive on mobile devices
· Telegram notifications received
· Referral link sharing works

Step 8: Troubleshooting

Common Issues:

1. Transaction fails with "KinkoVault__ExistingPosition"
   · User already has an active position
   · Must withdraw first before new deposit
2. Transaction fails with "KinkoVault__InvalidDuration"
   · Lock duration must be between 30 days and 5 years
   · Use the provided lock options
3. Wallet not connecting
   · Ensure you're on Sepolia network
   · Install MetaMask or compatible wallet
   · Check if wallet has Sepolia ETH
4. PDF generation fails
   · Check browser console for errors
   · Ensure jsPDF dependencies are installed
   · Try different browser

Step 9: Performance Optimization

```bash
# Analyze bundle size
npm run build -- --analyze

# Optimize images
npm install sharp
npm run optimize-images

# Enable caching
# Add to next.config.js
```

Step 10: Security Checklist

· Environment variables not exposed
· API keys stored securely
· Input validation on all forms
· Rate limiting implemented
· CORS configured properly
· HTTPS enabled in production
· Contract address hardcoded (not user-editable)

Support

For issues:

· GitHub Issues: https://github.com/abdulboyprogramming-arch/kinkox/issues
· Telegram: @kinkox_support
· Email: support@kinkox.com

Team

· Abdulrahaman - Team Lead/Full Stack
· Feranmi - Web3/Blockchain
· Marvellous - Frontend/Full Stack
· Elo - Frontend

Happy Building 🚀 

```

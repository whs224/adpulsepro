# AdPulsePro 🚀

**Live Demo**: [AdPulsePro Platform](https://adpulse.pro)

Professional advertising analytics platform with AI-powered insights across Google Ads, Meta Ads, TikTok Ads, and LinkedIn Ads.

## ✨ Features

### 🔗 **Multi-Platform Integration**
- **Google Ads** - Complete campaign analytics
- **Meta Ads** - Facebook and Instagram insights  
- **TikTok Ads** - TikTok advertising tracking
- **LinkedIn Ads** - Professional B2B analytics

### 🤖 **AI-Powered Analytics**
- **Smart Insights** - AI-generated optimization recommendations
- **Performance Analysis** - Automated campaign analysis
- **Custom Reports** - AI-generated reports and insights

### 💳 **Subscription Management**
- **Flexible Plans** - Starter ($29), Growth ($79), Scale ($199)
- **Credit System** - Usage-based AI interactions
- **Stripe Integration** - Secure payment processing

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **UI**: Tailwind CSS, shadcn/ui, Radix UI
- **Backend**: Supabase (Database, Auth, Edge Functions)
- **Payments**: Stripe (Subscriptions, Webhooks)
- **AI**: OpenAI GPT-4 (Analytics and Insights)
- **OAuth**: Google, Meta, TikTok, LinkedIn APIs

## 🚀 Quick Start

```bash
# Clone and setup
git clone https://github.com/whs224/adpulsepro.git
cd adpulsepro

# Install dependencies
npm install

# Environment setup
cp .env.example .env.local
# Add your Supabase, Stripe, and OAuth credentials

# Start development
npm run dev
```

## 📁 Project Structure

```
src/
├── components/     # UI components
├── pages/         # Route components  
├── services/      # API and business logic
├── contexts/     # React context providers
└── integrations/ # External service integrations
```

## 🔧 Development

```bash
npm run dev          # Development server
npm run build        # Production build
npm run lint         # Code linting
npm run type-check   # TypeScript checking
```

## 🚀 Deployment

```bash
# Build for production
npm run build

# Deploy to Vercel
vercel --prod

# Or deploy to Netlify
# Upload dist/ folder
```

## 🔐 Security

- **Row Level Security** - Database access control
- **OAuth 2.0** - Secure platform authentication
- **JWT Tokens** - Secure user sessions
- **Environment Variables** - Sensitive data protection

## 📊 Database Schema

- `users` - User accounts and profiles
- `ad_accounts` - Connected advertising accounts
- `campaign_data` - Performance metrics
- `user_credits` - Subscription and credit management
- `credit_usage_log` - AI interaction tracking

## 🎯 Perfect for Interviews

Demonstrates full-stack development, AI integration, payment processing, OAuth flows, and production deployment.

---

**Built by Will Siwinski** | [Try AdPulsePro](https://adpulse.pro)
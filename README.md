# AdPulsePro 🚀

**Professional Advertising Analytics Platform with AI-Powered Insights**

AdPulsePro is a comprehensive advertising analytics platform that connects to major ad platforms (Google Ads, Meta Ads, TikTok Ads, LinkedIn Ads) and provides AI-powered insights, performance tracking, and automated reporting.

## ✨ Features

### 🔗 **Multi-Platform Integration**
- **Google Ads** - Complete campaign analytics and optimization
- **Meta Ads** - Facebook and Instagram advertising insights
- **TikTok Ads** - TikTok advertising performance tracking
- **LinkedIn Ads** - Professional B2B advertising analytics

### 🤖 **AI-Powered Analytics**
- **Smart Insights** - AI-generated recommendations for campaign optimization
- **Performance Analysis** - Automated analysis of ad performance metrics
- **Predictive Analytics** - Forecast campaign performance and ROI
- **Custom Reports** - AI-generated custom reports and insights

### 💳 **Subscription Management**
- **Flexible Plans** - Starter, Growth, and Scale tiers
- **Credit System** - Usage-based AI interaction credits
- **Stripe Integration** - Secure payment processing
- **Team Management** - Multi-user collaboration features

### 📊 **Advanced Dashboard**
- **Real-time Metrics** - Live performance data across all platforms
- **Custom KPIs** - Select and track specific performance indicators
- **Visual Analytics** - Interactive charts and data visualizations
- **Export Capabilities** - PDF reports and data exports

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **UI Framework**: Tailwind CSS, shadcn/ui, Radix UI
- **Backend**: Supabase (Database, Auth, Edge Functions)
- **Payments**: Stripe (Subscriptions, Webhooks)
- **AI**: OpenAI GPT-4 (Analytics and Insights)
- **OAuth**: Google, Meta, TikTok, LinkedIn APIs
- **State Management**: TanStack Query, React Context

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Supabase account
- Stripe account
- OAuth credentials for ad platforms

### Installation

```bash
# Clone the repository
git clone https://github.com/whs224/adpulsepro.git
cd adpulsepro

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your credentials

# Start development server
npm run dev
```

### Environment Variables

Create a `.env.local` file with:

```bash
# Supabase
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Stripe
VITE_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key

# OAuth Client IDs
VITE_GOOGLE_ADS_CLIENT_ID=your_google_client_id
VITE_META_ADS_CLIENT_ID=your_meta_client_id
VITE_TIKTOK_ADS_CLIENT_ID=your_tiktok_client_id
VITE_LINKEDIN_ADS_CLIENT_ID=your_linkedin_client_id
```

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # shadcn/ui components
│   ├── admin/          # Admin panel components
│   └── ...             # Feature-specific components
├── pages/              # Route components
├── hooks/              # Custom React hooks
├── services/           # API and business logic
├── contexts/           # React context providers
├── integrations/       # External service integrations
└── lib/                # Utility functions
```

## 🔧 Development

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
npm run lint:fix     # Fix ESLint issues
npm run type-check   # Run TypeScript type checking
```

### Code Quality

- **ESLint** - Code linting and formatting
- **TypeScript** - Type safety and better DX
- **Prettier** - Code formatting (via ESLint)
- **Husky** - Git hooks for quality checks

## 🚀 Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

### Netlify

```bash
# Build the project
npm run build

# Deploy dist/ folder to Netlify
```

### Manual Deployment

```bash
# Build for production
npm run build

# Serve the dist/ folder with any static server
```

## 🔐 Security

- **Row Level Security** - Database access control
- **OAuth 2.0** - Secure platform authentication
- **JWT Tokens** - Secure user sessions
- **Environment Variables** - Sensitive data protection
- **HTTPS Only** - Encrypted data transmission

## 📊 Database Schema

### Core Tables
- `users` - User accounts and profiles
- `ad_accounts` - Connected advertising accounts
- `campaign_data` - Performance metrics and data
- `user_credits` - Subscription and credit management
- `credit_usage_log` - AI interaction tracking
- `team_members` - Team collaboration features

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: Check the `/docs` folder for detailed guides
- **Issues**: Report bugs and feature requests via GitHub Issues
- **Email**: Contact support at support@adpulsepro.com

## 🎯 Roadmap

### Upcoming Features
- [ ] **Mobile App** - Native iOS and Android applications
- [ ] **API Access** - Public API for third-party integrations
- [ ] **White-label** - Custom branding and domain options
- [ ] **Advanced Analytics** - Machine learning predictions
- [ ] **Automation** - Automated campaign optimization
- [ ] **Team Collaboration** - Enhanced multi-user features

### Performance Improvements
- [ ] **Caching** - Redis-based data caching
- [ ] **CDN** - Global content delivery
- [ ] **Database Optimization** - Query performance improvements
- [ ] **Bundle Optimization** - Smaller JavaScript bundles

---

**Built with ❤️ by Will Siwinski**

*Transforming advertising analytics with AI-powered insights*
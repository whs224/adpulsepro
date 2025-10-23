# AdPulsePro

**Live Demo**: [adpulse.pro](https://adpulse.pro)

Advertising analytics platform with AI-powered insights across Google Ads, Meta Ads, TikTok Ads, and LinkedIn Ads.

## Features

- **Multi-Platform Integration**: Google Ads, Meta Ads, TikTok Ads, LinkedIn Ads
- **AI Analytics**: GPT-4 powered campaign analysis and recommendations
- **Subscription Management**: Stripe integration with credit-based usage
- **OAuth Authentication**: Secure platform connections

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **Backend**: Supabase (Database, Auth, Edge Functions)
- **Payments**: Stripe
- **AI**: OpenAI GPT-4
- **UI**: Tailwind CSS, shadcn/ui

## Setup

```bash
git clone https://github.com/whs224/adpulsepro.git
cd adpulsepro
npm install
npm run dev
```

## Architecture

- React frontend with TypeScript
- Supabase backend with PostgreSQL
- Stripe webhooks for subscription management
- OpenAI API for campaign analysis
- OAuth 2.0 for ad platform connections

---

**Built by Will Siwinski**
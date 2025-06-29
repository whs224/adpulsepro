# AdPulse Pro Setup Instructions

This document provides comprehensive setup instructions for the AdPulse Pro platform, including ad account connections, credit system, and payment processing.

## 🚀 New Features Implemented

### 1. Professional Ad Account Connections
- **Company Logos**: Replaced emojis with professional SVG logos for Google Ads, Meta Ads, TikTok Ads, and LinkedIn Ads
- **All Platforms Enabled**: All four major ad platforms are now available for connection
- **OAuth Integration**: Secure authentication flow for each platform

### 2. Ad Data Dashboard
- **Performance Metrics**: Real-time display of spend, impressions, CTR, and ROAS
- **Platform Overview**: Aggregated metrics across all connected accounts
- **Individual Platform Views**: Detailed breakdown by platform
- **Auto-refresh**: Manual refresh capability for latest data

### 3. Credit System
- **Subscription-based**: Monthly plans with different credit allocations
- **Usage Tracking**: Automatic credit deduction for AI interactions
- **Team Sharing**: Credits shared across team members
- **Billing Cycles**: Monthly reset of credits

### 4. Stripe Payment Integration
- **Subscription Management**: Automated billing for credit plans
- **Webhook Processing**: Real-time subscription event handling
- **Plan Upgrades/Downgrades**: Seamless plan changes

## 🔧 Setup Requirements

### Environment Variables

Add these to your `.env` file:

```bash
# Supabase
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Stripe
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key

# OAuth Client IDs
GOOGLE_ADS_CLIENT_ID=your_google_ads_client_id
META_ADS_CLIENT_ID=your_meta_ads_client_id
TIKTOK_ADS_CLIENT_ID=your_tiktok_ads_client_id
LINKEDIN_ADS_CLIENT_ID=your_linkedin_ads_client_id
```

### Stripe Configuration

1. **Create Products and Prices**:
   ```bash
   # Starter Plan - $29/month
   stripe products create --name "AdPulse Starter" --description "100 AI messages per month"
   stripe prices create --product=prod_xxx --unit-amount=2900 --currency=usd --recurring[interval]=month

   # Growth Plan - $79/month  
   stripe products create --name "AdPulse Growth" --description "500 AI messages per month"
   stripe prices create --product=prod_xxx --unit-amount=7900 --currency=usd --recurring[interval]=month

   # Scale Plan - $199/month
   stripe products create --name "AdPulse Scale" --description "2000 AI messages per month"
   stripe prices create --product=prod_xxx --unit-amount=19900 --currency=usd --recurring[interval]=month
   ```

2. **Update Price IDs**:
   Update the `priceId` values in `supabase/functions/create-subscription/index.ts` with your actual Stripe price IDs.

3. **Configure Webhook**:
   ```bash
   stripe webhooks create --url=https://your-project.supabase.co/functions/v1/stripe-webhook \
     --events=checkout.session.completed,customer.subscription.created,customer.subscription.updated,customer.subscription.deleted,invoice.payment_succeeded,invoice.payment_failed
   ```

### OAuth Platform Setup

#### Google Ads
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google Ads API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URIs: `https://your-domain.com/oauth/callback`

#### Meta Ads (Facebook)
1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Create a new app
3. Add Facebook Login product
4. Configure OAuth settings
5. Add redirect URIs: `https://your-domain.com/oauth/callback`

#### TikTok Ads
1. Go to [TikTok for Business](https://ads.tiktok.com/)
2. Create a developer account
3. Register your application
4. Get client credentials
5. Configure redirect URIs

#### LinkedIn Ads
1. Go to [LinkedIn Developers](https://developer.linkedin.com/)
2. Create a new app
3. Request access to Marketing APIs
4. Configure OAuth 2.0 settings
5. Add redirect URIs

### Database Setup

The database schema is already set up with the following tables:
- `ad_accounts`: Connected ad platform accounts
- `campaign_data`: Ad campaign performance data
- `user_credits`: User subscription and credit information
- `credit_usage_log`: AI interaction usage tracking
- `team_members`: Team collaboration features

## 🚀 Deployment

### 1. Deploy Supabase Edge Functions

```bash
# Deploy all functions
supabase functions deploy create-subscription
supabase functions deploy stripe-webhook
supabase functions deploy analyze-ad-data
supabase functions deploy oauth-exchange
```

### 2. Set Environment Variables in Supabase

```bash
supabase secrets set STRIPE_SECRET_KEY=your_stripe_secret_key
supabase secrets set STRIPE_WEBHOOK_SECRET=your_webhook_secret
supabase secrets set GOOGLE_ADS_CLIENT_ID=your_google_client_id
supabase secrets set META_ADS_CLIENT_ID=your_meta_client_id
supabase secrets set TIKTOK_ADS_CLIENT_ID=your_tiktok_client_id
supabase secrets set LINKEDIN_ADS_CLIENT_ID=your_linkedin_client_id
```

### 3. Build and Deploy Frontend

```bash
npm run build
# Deploy to your hosting platform (Vercel, Netlify, etc.)
```

## 📊 Usage Guide

### Connecting Ad Accounts

1. **Navigate to Dashboard**: Go to the "Accounts" tab
2. **Click Connect**: Select the platform you want to connect
3. **OAuth Flow**: Complete the platform's authentication
4. **Verification**: Account will appear as connected

### Using the AI Chat

1. **Check Credits**: View remaining credits in the top-right
2. **Ask Questions**: Type questions about your ad performance
3. **Get Insights**: Receive AI-powered analysis and recommendations
4. **Track Usage**: Credits are automatically deducted per question

### Managing Subscriptions

1. **View Plans**: Go to Pricing page to see available plans
2. **Upgrade/Downgrade**: Click on any plan to change subscription
3. **Billing**: Automatic monthly billing through Stripe
4. **Usage**: Monitor credit usage in the dashboard

## 🔒 Security Considerations

- **OAuth Tokens**: Stored encrypted in Supabase
- **Data Privacy**: Ad data is never shared or sold
- **API Limits**: Respect platform rate limits
- **Access Control**: Row-level security on all database tables

## 🐛 Troubleshooting

### Common Issues

1. **OAuth Connection Fails**:
   - Check client IDs and redirect URIs
   - Verify platform app settings
   - Check browser console for errors

2. **Credits Not Updating**:
   - Verify Stripe webhook is configured
   - Check webhook endpoint logs
   - Ensure subscription metadata is correct

3. **Ad Data Not Loading**:
   - Verify account connections
   - Check campaign data exists
   - Review API permissions

### Support

For technical support:
- Check Supabase function logs
- Review browser developer tools
- Verify environment variables
- Test OAuth flows individually

## 📈 Next Steps

### Potential Enhancements

1. **Advanced Analytics**: More detailed reporting and visualizations
2. **Team Management**: Enhanced collaboration features
3. **API Access**: Public API for integrations
4. **White-label**: Custom branding options
5. **Mobile App**: Native mobile application

### Monitoring

- Set up alerts for webhook failures
- Monitor credit usage patterns
- Track OAuth success rates
- Monitor API rate limits

---

**Note**: This setup requires proper API access and verification from each ad platform. Some platforms may require business verification for production use. 
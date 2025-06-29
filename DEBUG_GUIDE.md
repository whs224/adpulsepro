# Debug Guide - OAuth & Subscription Issues

## 🚨 **Current Issues:**

### 1. **OAuth Not Working - Missing Environment Variables**

The OAuth exchange function needs these environment variables in Supabase:

```bash
# Google Ads OAuth
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_ADS_DEVELOPER_TOKEN=your_google_ads_developer_token

# LinkedIn OAuth  
LINKEDIN_CLIENT_SECRET=your_linkedin_client_secret
```

### 2. **Subscription Not Working - Missing Stripe Price IDs**

The subscription function needs real Stripe price IDs. Update this file:

**File:** `supabase/functions/create-subscription/index.ts`

```typescript
const pricingPlans = {
  starter: {
    priceId: "price_1ABC123...", // Replace with your actual Stripe price ID
    credits: 100,
    maxTeamMembers: 1,
    price: 29
  },
  growth: {
    priceId: "price_1DEF456...", // Replace with your actual Stripe price ID
    credits: 500,
    maxTeamMembers: 3,
    price: 79
  },
  scale: {
    priceId: "price_1GHI789...", // Replace with your actual Stripe price ID
    credits: 2000,
    maxTeamMembers: 10,
    price: 199
  }
};
```

## 🔧 **Quick Fixes:**

### **Option 1: Use Test Mode (Recommended for Development)**

1. **Disable OAuth temporarily** - Set all platforms to `enabled: false` in `oauthService.ts`
2. **Use mock data** - The dashboard will show sample data
3. **Test subscription flow** - Use Stripe test mode

### **Option 2: Get Real Credentials**

#### **Google Ads:**
1. Go to https://console.cloud.google.com/
2. Create project → Enable Google Ads API
3. Create OAuth 2.0 credentials
4. Get client secret and developer token

#### **LinkedIn:**
1. Go to https://developer.linkedin.com/
2. Create app → Request Marketing API access
3. Get client secret

#### **Stripe:**
1. Go to https://dashboard.stripe.com/
2. Create products and prices
3. Copy price IDs to subscription function

## 🧪 **Testing Steps:**

### **1. Test OAuth Flow:**
```bash
# Check browser console for errors when clicking "Connect"
# Look for: "OAuth initiation failed" or "Token exchange failed"
```

### **2. Test Subscription:**
```bash
# Check browser console when clicking "Start with [Plan]"
# Look for: "Subscription creation failed" or "No checkout URL received"
```

### **3. Test AI Chat:**
```bash
# Check browser console when sending a message
# Look for: "OpenAI API key not configured" or "OpenAI API error"
```

## 🎯 **Immediate Action Items:**

1. **Set OpenAI API key** in Supabase secrets
2. **Create Stripe products** and update price IDs
3. **Get OAuth client secrets** for Google and LinkedIn
4. **Deploy edge functions** with updated environment variables

## 📞 **What You Need to Provide:**

1. **Google Ads Client Secret** (if you want Google Ads working)
2. **LinkedIn Client Secret** (if you want LinkedIn working)  
3. **Stripe Price IDs** (for subscription functionality)

## 🚀 **Quick Start (Test Mode):**

If you want to test the app without OAuth:

1. Set all platforms to `enabled: false` in `oauthService.ts`
2. The dashboard will show "No accounts connected" but the UI will work
3. Test the subscription flow with Stripe test mode
4. Test the AI chat with the OpenAI key

**Which approach would you like to take?** 
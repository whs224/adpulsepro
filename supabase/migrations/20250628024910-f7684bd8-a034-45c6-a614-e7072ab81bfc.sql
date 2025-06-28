
-- Create table for storing ad account connections
CREATE TABLE public.ad_accounts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  platform TEXT NOT NULL CHECK (platform IN ('google_ads', 'meta_ads', 'tiktok_ads', 'linkedin_ads')),
  account_id TEXT NOT NULL,
  account_name TEXT,
  access_token TEXT NOT NULL,
  refresh_token TEXT,
  token_expires_at TIMESTAMP WITH TIME ZONE,
  connected_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_active BOOLEAN NOT NULL DEFAULT true,
  UNIQUE(user_id, platform, account_id)
);

-- Create table for storing campaign data
CREATE TABLE public.campaign_data (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  ad_account_id UUID REFERENCES public.ad_accounts NOT NULL,
  platform TEXT NOT NULL,
  campaign_id TEXT NOT NULL,
  campaign_name TEXT NOT NULL,
  date_range_start DATE NOT NULL,
  date_range_end DATE NOT NULL,
  metrics JSONB NOT NULL, -- Store all metrics as JSON
  fetched_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(ad_account_id, campaign_id, date_range_start, date_range_end)
);

-- Create table for storing OpenAI analysis results
CREATE TABLE public.ai_analysis (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  date_range_start DATE NOT NULL,
  date_range_end DATE NOT NULL,
  raw_data JSONB NOT NULL, -- Aggregated data sent to OpenAI
  ai_insights JSONB NOT NULL, -- OpenAI response with insights
  recommendations TEXT[] NOT NULL, -- Array of recommendation strings
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add Row Level Security
ALTER TABLE public.ad_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaign_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_analysis ENABLE ROW LEVEL SECURITY;

-- RLS Policies for ad_accounts
CREATE POLICY "Users can view their own ad accounts" 
  ON public.ad_accounts 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own ad accounts" 
  ON public.ad_accounts 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own ad accounts" 
  ON public.ad_accounts 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own ad accounts" 
  ON public.ad_accounts 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- RLS Policies for campaign_data
CREATE POLICY "Users can view their own campaign data" 
  ON public.campaign_data 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own campaign data" 
  ON public.campaign_data 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for ai_analysis
CREATE POLICY "Users can view their own AI analysis" 
  ON public.ai_analysis 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own AI analysis" 
  ON public.ai_analysis 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

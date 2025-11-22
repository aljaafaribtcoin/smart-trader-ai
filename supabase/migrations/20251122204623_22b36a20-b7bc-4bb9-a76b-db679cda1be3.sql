-- ========================================
-- Phase 1: Fix RLS Policies + Profiles Table
-- ========================================

-- 1. Fix missing DELETE policy for take_profits
CREATE POLICY "Users can delete take profits for their trades"
ON public.take_profits
FOR DELETE
USING (
  EXISTS (
    SELECT 1
    FROM public.trades
    WHERE trades.id = take_profits.trade_id
      AND trades.user_id = auth.uid()
  )
);

-- 2. Fix missing UPDATE policy for chat_messages
CREATE POLICY "Users can update their own messages"
ON public.chat_messages
FOR UPDATE
USING (user_id = auth.uid());

-- 3. Fix missing DELETE policy for accounts
CREATE POLICY "Users can delete their own account"
ON public.accounts
FOR DELETE
USING (user_id = auth.uid());

-- 4. Fix missing DELETE policy for notifications
CREATE POLICY "Users can delete their own notifications"
ON public.notifications
FOR DELETE
USING (user_id::text = (auth.uid())::text);

-- ========================================
-- 5. Create profiles table
-- ========================================
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  avatar_url TEXT,
  preferred_language TEXT DEFAULT 'ar',
  trading_preferences JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Profiles are viewable by everyone"
ON public.profiles
FOR SELECT
USING (true);

CREATE POLICY "Users can update their own profile"
ON public.profiles
FOR UPDATE
USING (id = auth.uid());

CREATE POLICY "Users can insert their own profile"
ON public.profiles
FOR INSERT
WITH CHECK (id = auth.uid());

-- Trigger for updating updated_at
CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- ========================================
-- 6. Create trigger to auto-create profile on signup
-- ========================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, preferred_language)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'preferred_language', 'ar')
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user();
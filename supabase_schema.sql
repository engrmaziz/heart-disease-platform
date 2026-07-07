-- Create the aegis_predictions table
CREATE TABLE public.aegis_predictions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    patient_data JSONB NOT NULL,
    risk_status VARCHAR(50) NOT NULL,
    confidence FLOAT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.aegis_predictions ENABLE ROW LEVEL SECURITY;

-- Create policies so users can only read and insert their own data
CREATE POLICY "Users can insert their own predictions."
    ON public.aegis_predictions FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own predictions."
    ON public.aegis_predictions FOR SELECT
    USING (auth.uid() = user_id);

-- ============================================================================
-- CLO Analytics System
-- Stores uploaded documents, extracted questions, and AI analysis results
-- ============================================================================

-- Document uploads for CLO analysis
CREATE TABLE clo_analysis_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clo_set_id UUID NOT NULL REFERENCES clo_sets(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- File metadata
  file_name TEXT,                    -- NULL if pasted text
  file_url TEXT,                     -- Supabase Storage URL (NULL if pasted)
  file_size INTEGER,                 -- In bytes
  file_type TEXT,                    -- 'pdf', 'docx', 'text'

  -- Processing status
  status TEXT DEFAULT 'pending' CHECK (status IN (
    'pending',       -- Uploaded, not yet parsed
    'parsing',       -- Currently extracting questions
    'parsed',        -- Questions extracted, not yet analyzed
    'analyzing',     -- AI analysis in progress
    'completed',     -- Analysis complete
    'failed'         -- Error occurred
  )),
  error_message TEXT,                -- Error details if status = 'failed'

  -- Stats
  total_questions INTEGER DEFAULT 0,

  -- Timestamps
  uploaded_at TIMESTAMPTZ DEFAULT NOW(),
  parsed_at TIMESTAMPTZ,
  analyzed_at TIMESTAMPTZ,

  -- Metadata for tracking
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Extracted questions (before/after AI analysis)
CREATE TABLE clo_analysis_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL REFERENCES clo_analysis_documents(id) ON DELETE CASCADE,
  clo_set_id UUID NOT NULL REFERENCES clo_sets(id) ON DELETE CASCADE,

  -- Question content
  question_number INTEGER NOT NULL,  -- 1, 2, 3...
  question_text TEXT NOT NULL,

  -- AI Analysis (populated after analysis)
  bloom_level TEXT CHECK (bloom_level IN (
    'remember', 'understand', 'apply', 'analyze', 'evaluate', 'create'
  )),
  bloom_reasoning TEXT,

  -- Quality assessment
  quality TEXT DEFAULT 'unmapped' CHECK (quality IN (
    'perfect',              -- ≥80% relevance, no issues
    'good',                 -- 60-79% relevance, minor issues
    'needs_improvement',    -- <60% relevance or multiple issues
    'unmapped'              -- No CLO mapping found
  )),

  -- Issues identified
  issues JSONB DEFAULT '[]',         -- ["Issue 1", "Issue 2"]

  -- AI-generated improved version
  improved_question_text TEXT,
  improved_explanation TEXT,
  improved_target_clo_id UUID REFERENCES clos(id),
  improved_target_bloom TEXT,

  -- Metadata
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT unique_question_per_document UNIQUE (document_id, question_number)
);

-- CLO mappings for analyzed questions
CREATE TABLE clo_analysis_mappings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  analysis_question_id UUID NOT NULL REFERENCES clo_analysis_questions(id) ON DELETE CASCADE,
  clo_id UUID NOT NULL REFERENCES clos(id) ON DELETE CASCADE,

  -- AI mapping details
  relevance_score DECIMAL(5, 2) NOT NULL CHECK (relevance_score >= 0 AND relevance_score <= 100),
  reasoning TEXT NOT NULL,
  confidence DECIMAL(3, 2) DEFAULT 0 CHECK (confidence >= 0 AND confidence <= 1),

  created_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT unique_analysis_mapping UNIQUE (analysis_question_id, clo_id)
);

-- Analysis reports (summary data)
CREATE TABLE clo_analysis_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL REFERENCES clo_analysis_documents(id) ON DELETE CASCADE,
  clo_set_id UUID NOT NULL REFERENCES clo_sets(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Analysis method
  analysis_method TEXT DEFAULT 'ai' CHECK (analysis_method IN (
    'ai',          -- AI-powered (Gemini)
    'algorithmic'  -- Local keyword-based
  )),

  -- Summary statistics
  total_questions INTEGER NOT NULL,
  successfully_mapped INTEGER DEFAULT 0,
  unmapped_questions INTEGER DEFAULT 0,
  perfect_questions INTEGER DEFAULT 0,
  good_questions INTEGER DEFAULT 0,
  needs_improvement INTEGER DEFAULT 0,

  -- AI-generated content (NULL if algorithmic)
  overall_summary TEXT,
  recommendations JSONB DEFAULT '[]',  -- ["Recommendation 1", "Recommendation 2"]

  -- Performance metrics
  processing_time_ms INTEGER,
  tokens_used INTEGER,                 -- For tracking AI costs (NULL if algorithmic)

  -- Timestamps
  generated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Only one report per document (overwrites on re-analyze)
  CONSTRAINT unique_report_per_document UNIQUE (document_id)
);

-- ============================================================================
-- INDEXES
-- ============================================================================

CREATE INDEX idx_clo_analysis_documents_clo_set ON clo_analysis_documents(clo_set_id);
CREATE INDEX idx_clo_analysis_documents_user ON clo_analysis_documents(user_id);
CREATE INDEX idx_clo_analysis_documents_status ON clo_analysis_documents(status);
CREATE INDEX idx_clo_analysis_questions_document ON clo_analysis_questions(document_id);
CREATE INDEX idx_clo_analysis_questions_quality ON clo_analysis_questions(quality);
CREATE INDEX idx_clo_analysis_mappings_question ON clo_analysis_mappings(analysis_question_id);
CREATE INDEX idx_clo_analysis_mappings_clo ON clo_analysis_mappings(clo_id);

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_clo_analysis_document_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_clo_analysis_document_timestamp
BEFORE UPDATE ON clo_analysis_documents
FOR EACH ROW EXECUTE FUNCTION update_clo_analysis_document_timestamp();

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE clo_analysis_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE clo_analysis_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE clo_analysis_mappings ENABLE ROW LEVEL SECURITY;
ALTER TABLE clo_analysis_reports ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own documents
CREATE POLICY "Users can view their own analysis documents"
  ON clo_analysis_documents FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own analysis documents"
  ON clo_analysis_documents FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own analysis documents"
  ON clo_analysis_documents FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own analysis documents"
  ON clo_analysis_documents FOR DELETE
  USING (user_id = auth.uid());

-- Policy: Users can only see questions from their documents
CREATE POLICY "Users can view questions from their documents"
  ON clo_analysis_questions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM clo_analysis_documents
      WHERE clo_analysis_documents.id = clo_analysis_questions.document_id
      AND clo_analysis_documents.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert questions to their documents"
  ON clo_analysis_questions FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM clo_analysis_documents
      WHERE clo_analysis_documents.id = clo_analysis_questions.document_id
      AND clo_analysis_documents.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update questions in their documents"
  ON clo_analysis_questions FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM clo_analysis_documents
      WHERE clo_analysis_documents.id = clo_analysis_questions.document_id
      AND clo_analysis_documents.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete questions from their documents"
  ON clo_analysis_questions FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM clo_analysis_documents
      WHERE clo_analysis_documents.id = clo_analysis_questions.document_id
      AND clo_analysis_documents.user_id = auth.uid()
    )
  );

-- Policy: Users can only see mappings from their questions
CREATE POLICY "Users can view mappings from their questions"
  ON clo_analysis_mappings FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM clo_analysis_questions
      JOIN clo_analysis_documents ON clo_analysis_documents.id = clo_analysis_questions.document_id
      WHERE clo_analysis_questions.id = clo_analysis_mappings.analysis_question_id
      AND clo_analysis_documents.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert mappings to their questions"
  ON clo_analysis_mappings FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM clo_analysis_questions
      JOIN clo_analysis_documents ON clo_analysis_documents.id = clo_analysis_questions.document_id
      WHERE clo_analysis_questions.id = clo_analysis_mappings.analysis_question_id
      AND clo_analysis_documents.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update mappings in their questions"
  ON clo_analysis_mappings FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM clo_analysis_questions
      JOIN clo_analysis_documents ON clo_analysis_documents.id = clo_analysis_questions.document_id
      WHERE clo_analysis_questions.id = clo_analysis_mappings.analysis_question_id
      AND clo_analysis_documents.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete mappings from their questions"
  ON clo_analysis_mappings FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM clo_analysis_questions
      JOIN clo_analysis_documents ON clo_analysis_documents.id = clo_analysis_questions.document_id
      WHERE clo_analysis_questions.id = clo_analysis_mappings.analysis_question_id
      AND clo_analysis_documents.user_id = auth.uid()
    )
  );

-- Policy: Users can only see their own reports
CREATE POLICY "Users can view their own analysis reports"
  ON clo_analysis_reports FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own analysis reports"
  ON clo_analysis_reports FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own analysis reports"
  ON clo_analysis_reports FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own analysis reports"
  ON clo_analysis_reports FOR DELETE
  USING (user_id = auth.uid());

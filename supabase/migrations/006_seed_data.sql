-- ============================================================================
-- CRS - Seed Data
-- Initial data for the system
-- ============================================================================

-- ============================================================================
-- SYSTEM SETTINGS
-- ============================================================================

INSERT INTO system_settings (key, value, description) VALUES
('subscription_plans', '{
  "free": {
    "name": "Free",
    "price": 0,
    "courses_limit": 5,
    "sessions_limit": 10,
    "ai_analytics_limit": 10,
    "clo_sets_limit": 2,
    "features": ["Basic analytics", "5 courses", "10 sessions/month", "10 AI insights/month"]
  },
  "premium": {
    "name": "Premium",
    "price": 15,
    "courses_limit": -1,
    "sessions_limit": -1,
    "ai_analytics_limit": 100,
    "clo_sets_limit": -1,
    "features": ["Unlimited courses", "Unlimited sessions", "100 AI insights/month", "Priority support", "Advanced CLO mapping"]
  },
  "custom": {
    "name": "Custom",
    "price": null,
    "courses_limit": -1,
    "sessions_limit": -1,
    "ai_analytics_limit": -1,
    "clo_sets_limit": -1,
    "features": ["Everything in Premium", "SSO/SAML", "Dedicated account manager", "Custom integrations"]
  }
}'::jsonb, 'Subscription plan configurations'),

('bloom_taxonomy', '{
  "levels": [
    {"key": "remember", "name": "Remember", "description": "Recall facts and basic concepts", "verbs": ["define", "list", "recall", "identify", "name", "state"]},
    {"key": "understand", "name": "Understand", "description": "Explain ideas or concepts", "verbs": ["describe", "explain", "summarize", "classify", "discuss"]},
    {"key": "apply", "name": "Apply", "description": "Use information in new situations", "verbs": ["apply", "demonstrate", "implement", "solve", "use"]},
    {"key": "analyze", "name": "Analyze", "description": "Draw connections among ideas", "verbs": ["analyze", "compare", "contrast", "examine", "differentiate"]},
    {"key": "evaluate", "name": "Evaluate", "description": "Justify a decision or course of action", "verbs": ["evaluate", "assess", "critique", "judge", "justify"]},
    {"key": "create", "name": "Create", "description": "Produce new or original work", "verbs": ["create", "design", "develop", "construct", "formulate"]}
  ]
}'::jsonb, 'Bloom''s Taxonomy levels for CLO mapping'),

('ui_colors', '{
  "options": ["indigo", "violet", "blue", "emerald", "amber", "rose"],
  "default": "indigo"
}'::jsonb, 'Available UI color themes for courses and CLO sets'),

('question_types', '{
  "types": [
    {"key": "rating", "name": "Rating Scale", "description": "1-5 or 1-10 star rating", "icon": "Star"},
    {"key": "text", "name": "Open Text", "description": "Free-form text response", "icon": "MessageSquare"},
    {"key": "multiple", "name": "Multiple Choice", "description": "Select one option from list", "icon": "List"},
    {"key": "boolean", "name": "Yes/No", "description": "Simple yes or no question", "icon": "CheckCircle2"},
    {"key": "numeric", "name": "Numeric Scale", "description": "Number within a range", "icon": "Hash"}
  ]
}'::jsonb, 'Available question types for feedback sessions');

-- ============================================================================
-- BASE QUESTION TEMPLATE
-- ============================================================================

INSERT INTO question_templates (id, user_id, name, description, is_base, status)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  NULL,
  'Standard Feedback Template',
  'A comprehensive feedback template suitable for most courses. Includes rating scales, yes/no questions, and open-ended responses.',
  TRUE,
  'active'
);

-- Base template questions
INSERT INTO template_questions (template_id, text, type, required, scale, order_index) VALUES
('00000000-0000-0000-0000-000000000001', 'How would you rate the clarity of explanations in today''s lecture?', 'rating', TRUE, 5, 1),
('00000000-0000-0000-0000-000000000001', 'The pace of the course is appropriate for my learning needs.', 'rating', TRUE, 5, 2),
('00000000-0000-0000-0000-000000000001', 'Do you feel comfortable asking questions during class?', 'boolean', TRUE, NULL, 3),
('00000000-0000-0000-0000-000000000001', 'Which teaching method do you find most effective?', 'multiple', FALSE, NULL, 4),
('00000000-0000-0000-0000-000000000001', 'What suggestions do you have for improving the course?', 'text', FALSE, NULL, 5),
('00000000-0000-0000-0000-000000000001', 'On a scale of 1-10, how likely are you to recommend this course?', 'numeric', TRUE, NULL, 6);

-- Update the multiple choice question with options
UPDATE template_questions
SET options = '["Lecture with slides", "Live coding demonstrations", "Group discussions", "Hands-on exercises"]'::jsonb
WHERE template_id = '00000000-0000-0000-0000-000000000001'
  AND type = 'multiple';

-- Update the numeric question with min/max
UPDATE template_questions
SET min_value = 1, max_value = 10
WHERE template_id = '00000000-0000-0000-0000-000000000001'
  AND type = 'numeric';

-- ============================================================================
-- QUICK FEEDBACK TEMPLATE
-- ============================================================================

INSERT INTO question_templates (id, user_id, name, description, is_base, status)
VALUES (
  '00000000-0000-0000-0000-000000000002',
  NULL,
  'Quick Feedback',
  'A short 3-question template for quick pulse checks during class.',
  TRUE,
  'active'
);

INSERT INTO template_questions (template_id, text, type, required, scale, order_index) VALUES
('00000000-0000-0000-0000-000000000002', 'How well did you understand today''s content?', 'rating', TRUE, 5, 1),
('00000000-0000-0000-0000-000000000002', 'Was the pace appropriate?', 'boolean', TRUE, NULL, 2),
('00000000-0000-0000-0000-000000000002', 'Any quick feedback or questions?', 'text', FALSE, NULL, 3);

-- ============================================================================
-- END OF SEMESTER TEMPLATE
-- ============================================================================

INSERT INTO question_templates (id, user_id, name, description, is_base, status)
VALUES (
  '00000000-0000-0000-0000-000000000003',
  NULL,
  'End of Semester Evaluation',
  'Comprehensive course evaluation for end of semester feedback.',
  TRUE,
  'active'
);

INSERT INTO template_questions (template_id, text, type, required, scale, options, min_value, max_value, order_index) VALUES
('00000000-0000-0000-0000-000000000003', 'Overall, how would you rate this course?', 'rating', TRUE, 5, NULL, NULL, NULL, 1),
('00000000-0000-0000-0000-000000000003', 'The course materials were helpful and relevant.', 'rating', TRUE, 5, NULL, NULL, NULL, 2),
('00000000-0000-0000-0000-000000000003', 'The instructor was effective in explaining concepts.', 'rating', TRUE, 5, NULL, NULL, NULL, 3),
('00000000-0000-0000-0000-000000000003', 'The workload was manageable.', 'rating', TRUE, 5, NULL, NULL, NULL, 4),
('00000000-0000-0000-0000-000000000003', 'Did you feel supported throughout the course?', 'boolean', TRUE, NULL, NULL, NULL, NULL, 5),
('00000000-0000-0000-0000-000000000003', 'Would you recommend this course to other students?', 'boolean', TRUE, NULL, NULL, NULL, NULL, 6),
('00000000-0000-0000-0000-000000000003', 'What aspects of the course worked well?', 'text', FALSE, NULL, NULL, NULL, NULL, 7),
('00000000-0000-0000-0000-000000000003', 'What aspects could be improved?', 'text', FALSE, NULL, NULL, NULL, NULL, 8),
('00000000-0000-0000-0000-000000000003', 'How likely are you to recommend this instructor?', 'numeric', TRUE, NULL, NULL, 1, 10, 9);

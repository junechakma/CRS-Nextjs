-- Seed file for default questions and question templates
-- This will create a default set of questions and a comprehensive template

-- Disable RLS for seed operations
ALTER TABLE public.questions DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.question_templates DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.template_questions DISABLE ROW LEVEL SECURITY;

-- =============================================
-- DEFAULT QUESTIONS
-- =============================================
-- These questions have university_id = NULL, making them available to all universities
-- created_by = NULL means they are system-created

-- Instructor Category Questions
INSERT INTO public.questions (university_id, text, type, category, scale, options, required, priority, is_active, is_default, created_by) VALUES
(NULL, 'The instructor was well-prepared for class', 'rating', 'instructor', 5, NULL, true, 1, true, true, NULL),
(NULL, 'The instructor explained concepts clearly', 'rating', 'instructor', 5, NULL, true, 1, true, true, NULL),
(NULL, 'The instructor was approachable and helpful', 'rating', 'instructor', 5, NULL, true, 2, true, true, NULL),
(NULL, 'The instructor encouraged student participation', 'rating', 'instructor', 5, NULL, true, 2, true, true, NULL),
(NULL, 'The instructor provided timely feedback', 'rating', 'instructor', 5, NULL, true, 3, true, true, NULL);

-- Content Category Questions
INSERT INTO public.questions (university_id, text, type, category, scale, options, required, priority, is_active, is_default, created_by) VALUES
(NULL, 'The course content was relevant and useful', 'rating', 'content', 5, NULL, true, 1, true, true, NULL),
(NULL, 'The course materials were clear and well-organized', 'rating', 'content', 5, NULL, true, 1, true, true, NULL),
(NULL, 'The workload was appropriate for the course', 'rating', 'content', 5, NULL, true, 2, true, true, NULL),
(NULL, 'The course covered topics in sufficient depth', 'rating', 'content', 5, NULL, true, 2, true, true, NULL);

-- Delivery Category Questions
INSERT INTO public.questions (university_id, text, type, category, scale, options, required, priority, is_active, is_default, created_by) VALUES
(NULL, 'Classes started and ended on time', 'rating', 'delivery', 5, NULL, true, 2, true, true, NULL),
(NULL, 'Teaching methods were effective', 'rating', 'delivery', 5, NULL, true, 1, true, true, NULL),
(NULL, 'Examples and demonstrations enhanced understanding', 'rating', 'delivery', 5, NULL, true, 2, true, true, NULL),
(NULL, 'Technology and tools were used effectively', 'rating', 'delivery', 5, NULL, true, 3, true, true, NULL);

-- Assessment Category Questions
INSERT INTO public.questions (university_id, text, type, category, scale, options, required, priority, is_active, is_default, created_by) VALUES
(NULL, 'Assessments were fair and aligned with course content', 'rating', 'assessment', 5, NULL, true, 1, true, true, NULL),
(NULL, 'Grading criteria were clear and transparent', 'rating', 'assessment', 5, NULL, true, 1, true, true, NULL),
(NULL, 'Assessments helped me understand the subject better', 'rating', 'assessment', 5, NULL, true, 2, true, true, NULL);

-- Overall Category Questions
INSERT INTO public.questions (university_id, text, type, category, scale, options, required, priority, is_active, is_default, created_by) VALUES
(NULL, 'Overall, I would recommend this course', 'rating', 'overall', 5, NULL, true, 1, true, true, NULL),
(NULL, 'Overall, I am satisfied with this course', 'rating', 'overall', 5, NULL, true, 1, true, true, NULL);

-- Yes/No Questions
INSERT INTO public.questions (university_id, text, type, category, scale, options, required, priority, is_active, is_default, created_by) VALUES
(NULL, 'Would you recommend this course to other students?', 'yes_no', 'overall', NULL, NULL, true, 1, true, true, NULL),
(NULL, 'Did the course meet your expectations?', 'yes_no', 'overall', NULL, NULL, true, 2, true, true, NULL);

-- Text/Open-ended Questions
INSERT INTO public.questions (university_id, text, type, category, scale, options, required, priority, is_active, is_default, created_by) VALUES
(NULL, 'What did you like most about this course?', 'text', 'overall', NULL, NULL, false, 3, true, true, NULL),
(NULL, 'What improvements would you suggest for this course?', 'text', 'overall', NULL, NULL, false, 3, true, true, NULL),
(NULL, 'Any additional comments or feedback?', 'text', 'overall', NULL, NULL, false, 4, true, true, NULL);

-- Multiple Choice Questions
INSERT INTO public.questions (university_id, text, type, category, scale, options, required, priority, is_active, is_default, created_by) VALUES
(NULL, 'How much time did you spend on this course per week?', 'multiple_choice', 'content', NULL,
'["Less than 2 hours", "2-4 hours", "4-6 hours", "6-8 hours", "More than 8 hours"]'::jsonb,
true, 3, true, true, NULL),
(NULL, 'What was your primary learning objective?', 'multiple_choice', 'content', NULL,
'["Career advancement", "Personal interest", "Degree requirement", "Skill development", "Other"]'::jsonb,
false, 4, true, true, NULL);

-- =============================================
-- DEFAULT QUESTION TEMPLATE
-- =============================================
-- Create a comprehensive default template that includes key questions from each category

DO $$
DECLARE
  template_id uuid;
  question_record RECORD;
  order_counter integer := 1;
BEGIN
  -- Create the default template
  INSERT INTO public.question_templates (university_id, name, description, is_default, is_active, created_by)
  VALUES (
    NULL,
    'Standard Course Feedback Template',
    'A comprehensive template covering all aspects of course feedback including instructor performance, course content, delivery methods, assessments, and overall satisfaction.',
    true,
    true,
    NULL
  )
  RETURNING id INTO template_id;

  -- Add questions to the template in a logical order

  -- Priority 1 questions (most important)
  FOR question_record IN
    SELECT id FROM public.questions
    WHERE is_default = true
      AND priority = 1
      AND is_active = true
    ORDER BY
      CASE category
        WHEN 'instructor' THEN 1
        WHEN 'content' THEN 2
        WHEN 'delivery' THEN 3
        WHEN 'assessment' THEN 4
        WHEN 'overall' THEN 5
        ELSE 6
      END,
      created_at
  LOOP
    INSERT INTO public.template_questions (template_id, question_id, order_index, is_required, custom_priority)
    VALUES (template_id, question_record.id, order_counter, true, 1);
    order_counter := order_counter + 1;
  END LOOP;

  -- Priority 2 questions (important)
  FOR question_record IN
    SELECT id FROM public.questions
    WHERE is_default = true
      AND priority = 2
      AND is_active = true
    ORDER BY
      CASE category
        WHEN 'instructor' THEN 1
        WHEN 'content' THEN 2
        WHEN 'delivery' THEN 3
        WHEN 'assessment' THEN 4
        WHEN 'overall' THEN 5
        ELSE 6
      END,
      created_at
  LOOP
    INSERT INTO public.template_questions (template_id, question_id, order_index, is_required, custom_priority)
    VALUES (template_id, question_record.id, order_counter, true, 2);
    order_counter := order_counter + 1;
  END LOOP;

  -- Priority 3 questions (optional/supplementary)
  FOR question_record IN
    SELECT id FROM public.questions
    WHERE is_default = true
      AND priority = 3
      AND is_active = true
    ORDER BY
      CASE category
        WHEN 'instructor' THEN 1
        WHEN 'content' THEN 2
        WHEN 'delivery' THEN 3
        WHEN 'assessment' THEN 4
        WHEN 'overall' THEN 5
        ELSE 6
      END,
      created_at
  LOOP
    INSERT INTO public.template_questions (template_id, question_id, order_index, is_required, custom_priority)
    VALUES (template_id, question_record.id, order_counter, false, 3);
    order_counter := order_counter + 1;
  END LOOP;

  -- Priority 4 questions (least priority)
  FOR question_record IN
    SELECT id FROM public.questions
    WHERE is_default = true
      AND priority = 4
      AND is_active = true
    ORDER BY
      CASE category
        WHEN 'instructor' THEN 1
        WHEN 'content' THEN 2
        WHEN 'delivery' THEN 3
        WHEN 'assessment' THEN 4
        WHEN 'overall' THEN 5
        ELSE 6
      END,
      created_at
  LOOP
    INSERT INTO public.template_questions (template_id, question_id, order_index, is_required, custom_priority)
    VALUES (template_id, question_record.id, order_counter, false, 4);
    order_counter := order_counter + 1;
  END LOOP;

  RAISE NOTICE 'Default template created with ID: % containing % questions', template_id, order_counter - 1;
END $$;

-- Re-enable RLS after seed operations
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.question_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.template_questions ENABLE ROW LEVEL SECURITY;

-- =============================================
-- VERIFICATION
-- =============================================
-- You can uncomment these to verify the seed data

-- SELECT COUNT(*) as total_default_questions FROM public.questions WHERE is_default = true;
-- SELECT COUNT(*) as total_default_templates FROM public.question_templates WHERE is_default = true;
-- SELECT
--   qt.name as template_name,
--   COUNT(tq.id) as question_count
-- FROM public.question_templates qt
-- LEFT JOIN public.template_questions tq ON qt.id = tq.template_id
-- WHERE qt.is_default = true
-- GROUP BY qt.id, qt.name;

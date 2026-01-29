-- ==========================================
-- DEFAULT SYSTEM CONFIGURATION
-- Data: 001_default_system_config.sql
-- ==========================================

-- Insert default system configuration
INSERT INTO system_config (key, value, description, category) VALUES
    ('global_settings', '{
        "maintenance_mode": false,
        "registration_enabled": true,
        "default_session_duration": 30,
        "max_session_duration": 120,
        "min_session_duration": 5,
        "anonymous_key_length": 8,
        "system_name": "Course Response System",
        "version": "1.0.0"
    }', 'Global system settings', 'system'),
    
    ('password_policy', '{
        "min_length": 8,
        "max_length": 128,
        "require_uppercase": true,
        "require_lowercase": true,
        "require_numbers": true,
        "require_special_chars": false,
        "special_chars": "!@#$%^&*()_+-=[]{}|;:,.<>?",
        "password_expiry_days": 90,
        "history_count": 5
    }', 'Password policy settings', 'security'),
    
    ('question_templates', '{
        "default_templates": [
            {
                "id": "standard_evaluation",
                "name": "Standard Course Evaluation",
                "description": "Standard questions for course evaluation",
                "questions": [
                    {
                        "id": "instructor_knowledge",
                        "text": "Rate the instructor''s knowledge of the subject matter",
                        "type": "rating",
                        "scale": 5,
                        "required": true,
                        "category": "instructor"
                    },
                    {
                        "id": "course_organization",
                        "text": "How well was the course content organized?",
                        "type": "rating",
                        "scale": 5,
                        "required": true,
                        "category": "content"
                    },
                    {
                        "id": "teaching_effectiveness",
                        "text": "Rate the effectiveness of the teaching methods",
                        "type": "rating",
                        "scale": 5,
                        "required": true,
                        "category": "teaching"
                    },
                    {
                        "id": "overall_satisfaction",
                        "text": "Overall, how satisfied are you with this course?",
                        "type": "rating",
                        "scale": 5,
                        "required": true,
                        "category": "overall"
                    },
                    {
                        "id": "comments",
                        "text": "Additional comments or suggestions",
                        "type": "text",
                        "required": false,
                        "category": "feedback"
                    }
                ]
            }
        ]
    }', 'Default question templates', 'templates'),
    
    ('email_settings', '{
        "smtp_enabled": false,
        "from_email": "noreply@crs.edu",
        "from_name": "Course Response System",
        "templates": {
            "welcome": "Welcome to the Course Response System",
            "password_reset": "Password Reset Request",
            "account_approved": "Your account has been approved"
        }
    }', 'Email configuration', 'notifications'),
    
    ('session_settings', '{
        "default_duration": 30,
        "max_duration": 120,
        "min_duration": 5,
        "auto_extend": false,
        "warning_minutes": 5,
        "grace_period_minutes": 2
    }', 'Response session settings', 'sessions'); 
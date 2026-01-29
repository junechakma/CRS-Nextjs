# CRS Schema Separation Strategy

## Overview

This document outlines the recommended approach for separating the large `final_combined_schema.sql` file into a modular, maintainable structure that allows for easy addition of new features and functions.

## Separation Strategy

### 1. **Foundation Layer** (Core Extensions & Utilities)
**File:** `001_core_extensions.sql`
- PostgreSQL extensions (uuid-ossp, pgcrypto)
- Core utility functions (timestamp updates, anonymous key generation)
- Basic setup that everything else depends on

### 2. **Core Tables** (Essential Data Structure)
**File:** `002_core_tables.sql`
- `users` - Central user management
- `system_config` - System-wide configuration
- `audit_log` - Change tracking and logging
- Core indexes and triggers
- Foundation for all other functionality

### 3. **University Management** (Institutional Structure)
**File:** `003_university_management.sql`
- `university_applications` - Registration workflow
- `universities` - Institutional data
- University-specific indexes and constraints
- Supports the hierarchical user system

### 4. **Academic Structure** (Educational Hierarchy)
**File:** `004_academic_structure.sql`
- `faculties` - Academic divisions
- `departments` - Subject areas
- `semesters` - Academic periods
- Academic hierarchy management

### 5. **Course Management** (Educational Content)
**File:** `005_course_management.sql`
- `courses` - Course definitions
- Course-specific indexes and constraints
- Links teachers to academic structure

### 6. **Response System** (Core Functionality)
**File:** `006_response_system.sql`
- `response_sessions` - Evaluation sessions
- `responses` - Student feedback
- `teacher_feedback` - Teacher insights
- Anonymous response handling

## Function Organization

### 1. **User Management Functions**
**File:** `functions/001_user_management_functions.sql`
- Authentication and authorization
- User hierarchy validation
- Password management
- Login/logout functionality

### 2. **University Management Functions**
**File:** `functions/002_university_management_functions.sql`
- University registration workflow
- Application approval/rejection
- University setup and configuration

### 3. **Academic Management Functions**
**File:** `functions/003_academic_management_functions.sql`
- Faculty and department creation
- Teacher management
- Semester management
- Academic structure setup

## Data Organization

### 1. **Default System Configuration**
**File:** `data/001_default_system_config.sql`
- System-wide settings
- Default question templates
- Email configuration
- Session settings

## Benefits of This Separation

### 1. **Modularity**
- Each file has a specific responsibility
- Easy to understand what each migration does
- Clear dependencies between components

### 2. **Maintainability**
- Changes to specific features only affect relevant files
- Easier to debug issues
- Better code organization

### 3. **Flexibility**
- Easy to add new features by creating new migration files
- Can modify specific components without affecting others
- Supports incremental development

### 4. **Deployment Control**
- Can deploy specific features independently
- Rollback specific changes if needed
- Better version control

### 5. **Team Collaboration**
- Different team members can work on different modules
- Reduced merge conflicts
- Clear ownership of different components

## Adding New Features

### 1. **New Tables**
Create a new migration file following the pattern:
```
007_new_feature_tables.sql
```

### 2. **New Functions**
Create a new function file:
```
functions/004_new_feature_functions.sql
```

### 3. **New Data**
Create a new data file:
```
data/002_new_feature_data.sql
```

## Migration Order

The migrations should be applied in this order:

1. `001_core_extensions.sql` - Foundation
2. `002_core_tables.sql` - Core structure
3. `003_university_management.sql` - University layer
4. `004_academic_structure.sql` - Academic layer
5. `005_course_management.sql` - Course layer
6. `006_response_system.sql` - Response layer

## Function Loading Order

Functions should be loaded after all tables exist:

1. `001_user_management_functions.sql`
2. `002_university_management_functions.sql`
3. `003_academic_management_functions.sql`

## Data Loading Order

Data should be loaded after all functions exist:

1. `001_default_system_config.sql`

## Best Practices

### 1. **Naming Conventions**
- Use descriptive file names
- Include version numbers in filenames
- Group related functionality together

### 2. **Dependencies**
- Always consider dependencies between files
- Test migrations in order
- Document any special requirements

### 3. **Rollback Strategy**
- Each migration should be reversible
- Keep backup of original combined schema
- Test rollback procedures

### 4. **Version Control**
- Commit each migration separately
- Use meaningful commit messages
- Tag releases appropriately

## Example: Adding a New Feature

### Scenario: Adding a Notification System

1. **Create new migration:**
   ```sql
   -- 007_notification_system.sql
   CREATE TABLE notifications (
       id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
       user_id UUID REFERENCES users(id),
       type VARCHAR(50) NOT NULL,
       title VARCHAR(255) NOT NULL,
       message TEXT,
       read_at TIMESTAMPTZ,
       created_at TIMESTAMPTZ DEFAULT NOW()
   );
   ```

2. **Create new functions:**
   ```sql
   -- functions/004_notification_functions.sql
   CREATE OR REPLACE FUNCTION create_notification(
       p_user_id UUID,
       p_type VARCHAR(50),
       p_title VARCHAR(255),
       p_message TEXT
   ) RETURNS JSON AS $$
   -- Function implementation
   $$ LANGUAGE plpgsql;
   ```

3. **Create new data:**
   ```sql
   -- data/002_notification_templates.sql
   INSERT INTO system_config (key, value, description) VALUES
   ('notification_templates', '{"welcome": "Welcome message"}', 'Notification templates');
   ```

## Conclusion

This separation strategy provides:
- **Scalability**: Easy to add new features
- **Maintainability**: Clear organization and responsibilities
- **Flexibility**: Independent development of different components
- **Reliability**: Better testing and rollback capabilities

The modular approach ensures that the CRS system can grow and evolve while maintaining code quality and team productivity. 
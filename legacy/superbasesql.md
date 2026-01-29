\-- ==========================================

\-- CRS SYSTEM - SUPABASE/POSTGRESQL SCHEMA

\-- ==========================================

\-- Enable necessary extensions

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

\-- ==========================================

\-- 1. USERS TABLE

\-- ==========================================

CREATE TABLE users (

id UUID PRIMARY KEY DEFAULT uuid\_generate\_v4(),

email VARCHAR(255) UNIQUE NOT NULL,

password\_hash VARCHAR(255) NOT NULL,

role VARCHAR(50) NOT NULL CHECK (role IN ('super\_admin', 'university\_admin', 'faculty\_admin', 'department\_moderator', 'teacher', 'student')),

status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'blocked', 'pending')),

\-- Profile information

name VARCHAR(255) NOT NULL,

initial VARCHAR(10), -- For teachers

phone VARCHAR(20),

\-- Permissions/Scope

university\_id UUID REFERENCES universities(id) ON DELETE CASCADE,

faculty\_id UUID REFERENCES faculties(id) ON DELETE CASCADE,

department\_id UUID REFERENCES departments(id) ON DELETE CASCADE,

\-- Registration tracking

application\_date TIMESTAMPTZ DEFAULT NOW(),

approved\_by UUID REFERENCES users(id),

approval\_date TIMESTAMPTZ,

approval\_status VARCHAR(20) DEFAULT 'pending' CHECK (approval\_status IN ('pending', 'approved', 'rejected')),

\-- Timestamps

created\_at TIMESTAMPTZ DEFAULT NOW(),

updated\_at TIMESTAMPTZ DEFAULT NOW(),

last\_login TIMESTAMPTZ

);

\-- ==========================================

\-- 2. UNIVERSITIES TABLE

\-- ==========================================

CREATE TABLE universities (

id UUID PRIMARY KEY DEFAULT uuid\_generate\_v4(),

name VARCHAR(255) NOT NULL,

code VARCHAR(10) UNIQUE NOT NULL,

\-- Location

address TEXT,

city VARCHAR(100),

state VARCHAR(100),

country VARCHAR(100),

postal\_code VARCHAR(20),

\-- Contact

email VARCHAR(255),

phone VARCHAR(20),

website VARCHAR(255),

\-- Settings (stored as JSONB for flexibility)

settings JSONB DEFAULT '{

"maintenance\_mode": false,

"registration\_open": true,

"default\_session\_duration": 30,

"max\_questions\_per\_session": 20

}',

\-- Stats (updated via triggers/functions)

stats JSONB DEFAULT '{

"total\_faculties": 0,

"total\_departments": 0,

"total\_teachers": 0,

"total\_students": 0,

"total\_courses": 0,

"total\_responses": 0

}',

created\_at TIMESTAMPTZ DEFAULT NOW(),

updated\_at TIMESTAMPTZ DEFAULT NOW(),

created\_by UUID REFERENCES users(id)

);

\-- ==========================================

\-- 3. FACULTIES TABLE

\-- ==========================================

CREATE TABLE faculties (

id UUID PRIMARY KEY DEFAULT uuid\_generate\_v4(),

university\_id UUID NOT NULL REFERENCES universities(id) ON DELETE CASCADE,

name VARCHAR(255) NOT NULL,

code VARCHAR(10) NOT NULL,

description TEXT,

admin\_id UUID REFERENCES users(id),

\-- Settings

settings JSONB DEFAULT '{

"question\_templates": \[\],

"default\_semester\_settings": {

"active\_semesters": \["Spring", "Summer", "Autumn"\],

"current\_semester": "Spring",

"academic\_year": "2024"

}

}',

\-- Stats

stats JSONB DEFAULT '{

"total\_departments": 0,

"total\_teachers": 0,

"total\_courses": 0,

"total\_responses": 0

}',

created\_at TIMESTAMPTZ DEFAULT NOW(),

updated\_at TIMESTAMPTZ DEFAULT NOW(),

created\_by UUID REFERENCES users(id),

UNIQUE(university\_id, code)

);

\-- ==========================================

\-- 4. DEPARTMENTS TABLE

\-- ==========================================

CREATE TABLE departments (

id UUID PRIMARY KEY DEFAULT uuid\_generate\_v4(),

university\_id UUID NOT NULL REFERENCES universities(id) ON DELETE CASCADE,

faculty\_id UUID NOT NULL REFERENCES faculties(id) ON DELETE CASCADE,

name VARCHAR(255) NOT NULL,

code VARCHAR(10) NOT NULL,

description TEXT,

moderator\_id UUID REFERENCES users(id),

\-- Settings

settings JSONB DEFAULT '{

"semesters": \["Spring", "Summer", "Autumn", "Year"\],

"current\_semester": "Spring",

"question\_config": {

"max\_questions": 15,

"default\_questions": \[\],

"allow\_remarks": true,

"remarks\_required": false

}

}',

\-- Stats

stats JSONB DEFAULT '{

"total\_teachers": 0,

"total\_courses": 0,

"total\_sessions": 0,

"total\_responses": 0

}',

created\_at TIMESTAMPTZ DEFAULT NOW(),

updated\_at TIMESTAMPTZ DEFAULT NOW(),

created\_by UUID REFERENCES users(id),

UNIQUE(faculty\_id, code)

);

\-- ==========================================

\-- 5. COURSES TABLE

\-- ==========================================

CREATE TABLE courses (

id UUID PRIMARY KEY DEFAULT uuid\_generate\_v4(),

university\_id UUID NOT NULL REFERENCES universities(id) ON DELETE CASCADE,

faculty\_id UUID NOT NULL REFERENCES faculties(id) ON DELETE CASCADE,

department\_id UUID NOT NULL REFERENCES departments(id) ON DELETE CASCADE,

teacher\_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

course\_code VARCHAR(20) NOT NULL,

course\_title VARCHAR(255) NOT NULL,

semester VARCHAR(20) NOT NULL,

academic\_year VARCHAR(10) NOT NULL,

\-- Sections stored as JSONB array

sections JSONB DEFAULT '\[\]',

status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'completed')),

created\_at TIMESTAMPTZ DEFAULT NOW(),

updated\_at TIMESTAMPTZ DEFAULT NOW(),

UNIQUE(department\_id, course\_code, semester, academic\_year)

);

\-- ==========================================

\-- 6. RESPONSE\_SESSIONS TABLE

\-- ==========================================

CREATE TABLE response\_sessions (

id UUID PRIMARY KEY DEFAULT uuid\_generate\_v4(),

university\_id UUID NOT NULL REFERENCES universities(id) ON DELETE CASCADE,

faculty\_id UUID NOT NULL REFERENCES faculties(id) ON DELETE CASCADE,

department\_id UUID NOT NULL REFERENCES departments(id) ON DELETE CASCADE,

course\_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,

teacher\_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

section\_id VARCHAR(10) NOT NULL,

room\_number VARCHAR(50),

session\_date DATE NOT NULL,

start\_time TIMESTAMPTZ NOT NULL,

end\_time TIMESTAMPTZ NOT NULL,

duration\_minutes INTEGER NOT NULL DEFAULT 30,

anonymous\_key VARCHAR(20) UNIQUE NOT NULL,

status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'completed', 'expired')),

\-- Questions stored as JSONB

questions JSONB NOT NULL DEFAULT '\[\]',

\-- Stats

stats JSONB DEFAULT '{

"total\_responses": 0,

"target\_responses": 0,

"completion\_rate": 0

}',

created\_at TIMESTAMPTZ DEFAULT NOW(),

updated\_at TIMESTAMPTZ DEFAULT NOW()

);

\-- ==========================================

\-- 7. RESPONSES TABLE

\-- ==========================================

CREATE TABLE responses (

id UUID PRIMARY KEY DEFAULT uuid\_generate\_v4(),

session\_id UUID NOT NULL REFERENCES response\_sessions(id) ON DELETE CASCADE,

university\_id UUID NOT NULL REFERENCES universities(id) ON DELETE CASCADE,

faculty\_id UUID NOT NULL REFERENCES faculties(id) ON DELETE CASCADE,

department\_id UUID NOT NULL REFERENCES departments(id) ON DELETE CASCADE,

course\_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,

teacher\_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

section\_id VARCHAR(10) NOT NULL,

student\_anonymous\_id VARCHAR(50) NOT NULL, -- Anonymous identifier

\-- Responses stored as JSONB

responses JSONB NOT NULL DEFAULT '{}',

\-- Metadata

metadata JSONB DEFAULT '{

"ip\_address": null,

"user\_agent": null,

"completion\_time\_seconds": 0

}',

status VARCHAR(20) DEFAULT 'submitted' CHECK (status IN ('draft', 'submitted', 'validated')),

submission\_time TIMESTAMPTZ DEFAULT NOW(),

\-- Ensure one response per anonymous student per session

UNIQUE(session\_id, student\_anonymous\_id)

);

\-- ==========================================

\-- 8. SYSTEM\_CONFIG TABLE

\-- ==========================================

CREATE TABLE system\_config (

key VARCHAR(100) PRIMARY KEY,

value JSONB NOT NULL,

description TEXT,

updated\_at TIMESTAMPTZ DEFAULT NOW(),

updated\_by UUID REFERENCES users(id)

);

\-- Insert default system config

INSERT INTO system\_config (key, value, description) VALUES

('global\_settings', '{

"maintenance\_mode": false,

"registration\_enabled": true,

"default\_session\_duration": 30,

"max\_session\_duration": 120,

"min\_session\_duration": 5,

"anonymous\_key\_length": 8,

"password\_policy": {

"min\_length": 8,

"require\_uppercase": true,

"require\_lowercase": true,

"require\_numbers": true,

"require\_special\_chars": true

}

}', 'Global system settings'),

('question\_templates', '{

"default\_templates": \[

{

"id": "standard\_evaluation",

"name": "Standard Course Evaluation",

"description": "Standard questions for course evaluation",

"questions": \[

{

"id": "knowledge",

"text": "Rate the instructor''s knowledge of the subject",

"type": "rating",

"scale": 5,

"required": true,

"category": "instructor"

},

{

"id": "organization",

"text": "How well was the course content organized?",

"type": "rating",

"scale": 5,

"required": true,

"category": "content"

}

\]

}

\]

}', 'Default question templates');

\-- ==========================================

\-- INDEXES FOR PERFORMANCE

\-- ==========================================

\-- Users indexes

CREATE INDEX idx\_users\_email ON users(email);

CREATE INDEX idx\_users\_role ON users(role);

CREATE INDEX idx\_users\_university\_id ON users(university\_id);

CREATE INDEX idx\_users\_faculty\_id ON users(faculty\_id);

CREATE INDEX idx\_users\_department\_id ON users(department\_id);

\-- Universities indexes

CREATE INDEX idx\_universities\_code ON universities(code);

\-- Faculties indexes

CREATE INDEX idx\_faculties\_university\_id ON faculties(university\_id);

CREATE INDEX idx\_faculties\_code ON faculties(code);

\-- Departments indexes

CREATE INDEX idx\_departments\_faculty\_id ON departments(faculty\_id);

CREATE INDEX idx\_departments\_university\_id ON departments(university\_id);

\-- Courses indexes

CREATE INDEX idx\_courses\_teacher\_id ON courses(teacher\_id);

CREATE INDEX idx\_courses\_department\_id ON courses(department\_id);

CREATE INDEX idx\_courses\_semester\_year ON courses(semester, academic\_year);

\-- Response sessions indexes

CREATE INDEX idx\_response\_sessions\_teacher\_id ON response\_sessions(teacher\_id);

CREATE INDEX idx\_response\_sessions\_course\_id ON response\_sessions(course\_id);

CREATE INDEX idx\_response\_sessions\_anonymous\_key ON response\_sessions(anonymous\_key);

CREATE INDEX idx\_response\_sessions\_status ON response\_sessions(status);

CREATE INDEX idx\_response\_sessions\_date ON response\_sessions(session\_date);

\-- Responses indexes

CREATE INDEX idx\_responses\_session\_id ON responses(session\_id);

CREATE INDEX idx\_responses\_teacher\_id ON responses(teacher\_id);

CREATE INDEX idx\_responses\_submission\_time ON responses(submission\_time);

\-- ==========================================

\-- ROW LEVEL SECURITY (RLS) POLICIES

\-- ==========================================

\-- Enable RLS on all tables

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

ALTER TABLE universities ENABLE ROW LEVEL SECURITY;

ALTER TABLE faculties ENABLE ROW LEVEL SECURITY;

ALTER TABLE departments ENABLE ROW LEVEL SECURITY;

ALTER TABLE courses ENABLE ROW LEVEL SECURITY;

ALTER TABLE response\_sessions ENABLE ROW LEVEL SECURITY;

ALTER TABLE responses ENABLE ROW LEVEL SECURITY;

ALTER TABLE system\_config ENABLE ROW LEVEL SECURITY;

\-- Users policies

CREATE POLICY "Super admins can access all users" ON users

FOR ALL USING (

EXISTS (

SELECT 1 FROM users u

WHERE u.id = auth.uid() AND u.role = 'super\_admin'

)

);

CREATE POLICY "Users can access their own record" ON users

FOR ALL USING (auth.uid() = id);

CREATE POLICY "University admins can access users in their university" ON users

FOR SELECT USING (

EXISTS (

SELECT 1 FROM users u

WHERE u.id = auth.uid()

AND u.role = 'university\_admin'

AND u.university\_id = users.university\_id

)

);

\-- Universities policies

CREATE POLICY "Super admins can access all universities" ON universities

FOR ALL USING (

EXISTS (

SELECT 1 FROM users u

WHERE u.id = auth.uid() AND u.role = 'super\_admin'

)

);

CREATE POLICY "University admins can access their university" ON universities

FOR ALL USING (

EXISTS (

SELECT 1 FROM users u

WHERE u.id = auth.uid()

AND u.role = 'university\_admin'

AND u.university\_id = universities.id

)

);

\-- Faculties policies

CREATE POLICY "Faculty hierarchy access" ON faculties

FOR ALL USING (

EXISTS (

SELECT 1 FROM users u

WHERE u.id = auth.uid()

AND (

u.role = 'super\_admin' OR

(u.role = 'university\_admin' AND u.university\_id = faculties.university\_id) OR

(u.role = 'faculty\_admin' AND u.faculty\_id = faculties.id)

)

)

);

\-- Departments policies

CREATE POLICY "Department hierarchy access" ON departments

FOR ALL USING (

EXISTS (

SELECT 1 FROM users u

WHERE u.id = auth.uid()

AND (

u.role = 'super\_admin' OR

(u.role = 'university\_admin' AND u.university\_id = departments.university\_id) OR

(u.role = 'faculty\_admin' AND u.faculty\_id = departments.faculty\_id) OR

(u.role = 'department\_moderator' AND u.department\_id = departments.id)

)

)

);

\-- Courses policies

CREATE POLICY "Course access control" ON courses

FOR ALL USING (

EXISTS (

SELECT 1 FROM users u

WHERE u.id = auth.uid()

AND (

u.role = 'super\_admin' OR

(u.role = 'department\_moderator' AND u.department\_id = courses.department\_id) OR

(u.role = 'teacher' AND u.id = courses.teacher\_id)

)

)

);

\-- Response sessions policies

CREATE POLICY "Session access control" ON response\_sessions

FOR ALL USING (

EXISTS (

SELECT 1 FROM users u

WHERE u.id = auth.uid()

AND (

u.role = 'super\_admin' OR

(u.role = 'department\_moderator' AND u.department\_id = response\_sessions.department\_id) OR

(u.role = 'teacher' AND u.id = response\_sessions.teacher\_id) OR

u.role = 'student' -- Students can read to join sessions

)

)

);

\-- Responses policies

CREATE POLICY "Response access control" ON responses

FOR SELECT USING (

EXISTS (

SELECT 1 FROM users u

WHERE u.id = auth.uid()

AND (

u.role = 'super\_admin' OR

(u.role = 'department\_moderator' AND u.department\_id = responses.department\_id) OR

(u.role = 'teacher' AND u.id = responses.teacher\_id)

)

)

);

CREATE POLICY "Students can create responses" ON responses

FOR INSERT WITH CHECK (

EXISTS (

SELECT 1 FROM users u

WHERE u.id = auth.uid() AND u.role = 'student'

)

);

\-- System config policies

CREATE POLICY "Config access control" ON system\_config

FOR ALL USING (

EXISTS (

SELECT 1 FROM users u

WHERE u.id = auth.uid()

AND u.role = 'super\_admin'

)

);

CREATE POLICY "All users can read config" ON system\_config

FOR SELECT USING (auth.uid() IS NOT NULL);

\-- ==========================================

\-- FUNCTIONS AND TRIGGERS

\-- ==========================================

\-- Function to update timestamps

CREATE OR REPLACE FUNCTION update\_updated\_at\_column()

RETURNS TRIGGER AS $$

BEGIN

NEW.updated\_at = NOW();

RETURN NEW;

END;

$$ language 'plpgsql';

\-- Apply update timestamp trigger to all tables

CREATE TRIGGER update\_users\_updated\_at BEFORE UPDATE ON users

FOR EACH ROW EXECUTE FUNCTION update\_updated\_at\_column();

CREATE TRIGGER update\_universities\_updated\_at BEFORE UPDATE ON universities

FOR EACH ROW EXECUTE FUNCTION update\_updated\_at\_column();

CREATE TRIGGER update\_faculties\_updated\_at BEFORE UPDATE ON faculties

FOR EACH ROW EXECUTE FUNCTION update\_updated\_at\_column();

CREATE TRIGGER update\_departments\_updated\_at BEFORE UPDATE ON departments

FOR EACH ROW EXECUTE FUNCTION update\_updated\_at\_column();

CREATE TRIGGER update\_courses\_updated\_at BEFORE UPDATE ON courses

FOR EACH ROW EXECUTE FUNCTION update\_updated\_at\_column();

CREATE TRIGGER update\_response\_sessions\_updated\_at BEFORE UPDATE ON response\_sessions

FOR EACH ROW EXECUTE FUNCTION update\_updated\_at\_column();

\-- Function to update stats (example for departments)

CREATE OR REPLACE FUNCTION update\_department\_stats()

RETURNS TRIGGER AS $$

BEGIN

\-- Update department stats when a course is added/removed

IF TG\_OP = 'INSERT' THEN

UPDATE departments

SET stats = jsonb\_set(

stats,

'{total\_courses}',

((stats->>'total\_courses')::int + 1)::text::jsonb

)

WHERE id = NEW.department\_id;

RETURN NEW;

ELSIF TG\_OP = 'DELETE' THEN

UPDATE departments

SET stats = jsonb\_set(

stats,

'{total\_courses}',

((stats->>'total\_courses')::int - 1)::text::jsonb

)

WHERE id = OLD.department\_id;

RETURN OLD;

END IF;

RETURN NULL;

END;

$$ language 'plpgsql';

CREATE TRIGGER course\_stats\_trigger

AFTER INSERT OR DELETE ON courses

FOR EACH ROW EXECUTE FUNCTION update\_department\_stats();

\-- ==========================================

\-- SAMPLE QUERIES

\-- ==========================================

\-- Get all departments in a faculty with teacher count

SELECT

d.\*,

COUNT(c.id) as total\_courses,

COUNT(DISTINCT c.teacher\_id) as total\_teachers

FROM departments d

LEFT JOIN courses c ON d.id = c.department\_id

WHERE d.faculty\_id = 'some-faculty-uuid'

GROUP BY d.id;

\-- Get active sessions for a teacher

SELECT

rs.\*,

c.course\_code,

c.course\_title

FROM response\_sessions rs

JOIN courses c ON rs.course\_id = c.id

WHERE rs.teacher\_id = 'some-teacher-uuid'

AND rs.status = 'active';

\-- Get response analytics for a session

SELECT

r.responses->>'q1' as rating\_answer,

COUNT(\*) as response\_count

FROM responses r

WHERE r.session\_id = 'some-session-uuid'

GROUP BY r.responses->>'q1';
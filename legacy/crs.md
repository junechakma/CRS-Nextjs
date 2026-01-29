CRS Feedback System - Role Hierarchy & Permissions (Updated with Faculty Level)
===============================================================================

Role Structure Overview
-----------------------

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   Super Admin (System Level)      └── University Admin (Institution Level)          └── Faculty Admin (Faculty Level)              └── Department Moderator (Department Level)                  └── Teacher (Course Level)                      └── Student (Response Level)   `

University Admin Registration Process
-------------------------------------

### Self-Registration Form

University Admins can apply for system access through a self-registration process:

**Required Information**

*   Institution Name: Full name of the university/institution
    
*   Email: Official institutional email address
    
*   Password: Secure password for account access
    

**Registration Workflow**

1.  Application Submission: University Admin submits registration form
    
2.  Pending Approval: Application status set to "Pending" awaiting Super Admin review
    
3.  Super Admin Review: Super Admin verifies institution legitimacy and approves/rejects application
    
4.  Account Activation: Upon approval, University Admin account is activated with full institutional permissions
    
5.  Email Notification: Confirmation email sent to University Admin with login credentials
    

**Approval Criteria**

*   Valid institutional email domain
    
*   Legitimate educational institution
    
*   Complete and accurate application information
    
*   Super Admin discretionary approval
    

1\. Super Admin (System Administrator)
--------------------------------------

**Scope:** Entire system across all universities**Access Level:** Full system control

### Permissions

**User Management**

*   Review and approve University Admin registration applications
    
*   Manage pending University Admin applications (approve/reject)
    
*   Create/Update/Delete University Admins
    
*   Block/Unblock University Admins
    
*   View all system users across universities
    

**Institution Management**

*   Create/Update/Delete University Institutions
    
*   Manage university details (name, location, contact, email)
    
*   Search across all universities
    

**System Control**

*   Enable/Disable maintenance mode
    
*   System-wide configuration settings
    
*   Global analytics and reporting
    

**Data Access**

*   View all university responses by courses
    
*   System-wide backup and restore
    

2\. University Admin (Institution Administrator)
------------------------------------------------

**Scope:** Single University Institution**Access Level:** Full control within the assigned university

### Permissions

**Faculty Management**

*   Create/Update/Delete faculties within university
    
*   Assign Faculty Admins to faculties
    
*   View all faculties within university
    

**User Management**

*   Create/Update Faculty Admins
    
*   Block/Unblock Faculty Admins
    
*   View all users within university (Faculty Admins, Department Moderators, Teachers, Students)
    

**University Data**

*   View all faculty and department responses within university
    
*   University-wide analytics and reporting (total faculties, total departments, total teachers, total sessions, total courses, total responses)
    
*   University data backup and export
    

**Configuration**

*   Set university-wide policies
    
*   Manage university-specific settings
    

3\. Faculty Admin (Faculty Administrator)
-----------------------------------------

**Scope:** Single Faculty within a University**Access Level:** Full control within assigned faculty only

### Permissions

**Department Management**

*   Create/Update/Delete departments within faculty
    
*   Assign Department Moderators to departments
    
*   View all departments within faculty
    

**User Management**

*   Create/Update Department Moderators within faculty
    
*   Block/Unblock Department Moderators within faculty
    
*   View all users within faculty (Department Moderators, Teachers, Students)
    

**Faculty Data**

*   View all department responses within faculty
    
*   Faculty-wide analytics and reporting (total departments, total teachers, total sessions, total courses, total responses)
    
*   Faculty data backup and export
    

**Configuration**

*   Set faculty-wide policies
    
*   Manage faculty-specific settings
    
*   Configure faculty-level question templates
    

### Restrictions

*   Cannot access other faculties
    
*   Cannot manage University Admins or other Faculty Admins
    
*   Cannot access university-wide settings
    

4\. Department Moderator
------------------------

**Scope:** Single Department within a Faculty**Access Level:** Full control within assigned department only

### Permissions

**Teacher Management**

*   Create/Update Teacher profiles (email, initial, name) with CSV import option
    
*   Upload teacher credentials and initial passwords
    
*   Block/Unblock teachers within department
    
*   Search teachers by name/initial within department
    

**Course & Response Management**

*   Set response questions for department courses
    
*   Configure semester settings (Summer, Autumn, Spring, Year)
    
*   Configure question parameters (number, remarks, priority)
    
*   View all teacher responses within department
    
*   Department-specific analytics (total teachers, total sessions, total courses, total responses)
    

**Data Management**

*   Backup department data
    
*   Export department reports
    
*   Manage department-specific configurations
    

### Restrictions

*   Cannot access other departments (even within same faculty)
    
*   Cannot manage Faculty Admins, University Admins, or other Department Moderators
    
*   Cannot access faculty-wide or system-wide settings
    

5\. Teacher (Course Instructor)
-------------------------------

**Scope:** Own courses and classes only**Access Level:** Limited to personal teaching activities

### Permissions

**Course Management**

*   Create/Update own course profiles (Select Semester, Course Code, Course Title, Sections)
    
*   Change personal credentials/password
    

**Class Activities**

*   Generate anonymous response keys for classes (Select course, select section, and provide room number)
    
*   Set response session duration (active minutes)
    

**Response & Feedback**

*   View response summaries for own classes
    
*   Provide improvement feedback (by class date)
    

### Restrictions

*   Cannot access other teachers' data
    
*   Cannot modify department or faculty settings
    
*   Cannot manage other users
    

6\. Student (Response Participant)
----------------------------------

**Scope:** Response sessions only**Access Level:** Minimal - response submission only

### Permissions

**Response Activities**

*   Enter anonymous keys to join response sessions
    
*   Submit course/teacher evaluations
    

**Session Management**

*   Access active response sessions
    

### Restrictions

*   No administrative access
    
*   Cannot view other students' responses
    
*   Cannot access teacher, department, faculty, or course management features
    
*   Time-limited session access
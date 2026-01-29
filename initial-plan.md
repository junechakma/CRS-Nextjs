x# System Architecture & Requirements

## 1. User Roles & Permissions

### Super Admin (System Owner)
- **Access Level:** Complete system oversight
- **Core Responsibilities:**
  - Monitor all teacher accounts and activity metrics
  - Configure system-wide settings and parameters
  - Manage common question bank
  - Track usage analytics and generate reports
  - Maintain system health and performance

### Teacher (Primary User)
- **Onboarding:** Instant account activation upon registration
- **Profile Information:**
  - Full name
  - Institution/Organization name (free text)
- **Key Capabilities:**
  - Create and organize courses by semester
  - Design custom feedback questions or select from common question bank
  - Generate time-limited feedback sessions with unique codes/QR
  - Access AI-powered analytics dashboard
  - Review sentiment analysis and learning outcome mappings

### Student (Anonymous Participant)
- **Access Method:** Session-specific codes (no account required)
- **Interaction:** Submit feedback anonymously
- **Duration:** Access limited to active session window

---

## 2. Core System Features

### Simplified Teacher Onboarding
- Self-service registration with immediate access
- No approval workflow or pending states
- Flexible institution identification (user-defined text field)

### Streamlined Organization Model
- Replace rigid University/Faculty/Department hierarchy
- Single "Institution Name" field for maximum flexibility
- Teacher-driven categorization and course structure

### Flexible Question Management
- **Custom Questions:** Teachers create course-specific feedback questions
- **Common Question Bank:** Pre-built questions maintained by Super Admin
- **Hybrid Approach:** Mix custom and common questions in single session
- **Question Types:** Support multiple formats (rating scales, text, multiple choice)

### Session Management
- Create feedback sessions for specific courses
- Set session duration and access window
- Generate unique access codes and QR codes
- Link questions (custom or common) to each session

### AI-Enhanced Analytics
- **Sentiment Analysis:** Automatic processing and summarization of student responses
- **Learning Outcome Mapping:** AI-driven alignment of questions to CLOs/PLOs via Gemini
- **Cognitive Level Assessment:** Bloom's Taxonomy classification of assessment items
- **Actionable Insights:** Pattern recognition and improvement recommendations
- **Response Aggregation:** Visualize trends across sessions and semesters

### Secure Anonymous Feedback System
- Session-based access via unique codes or QR
- Time-bound response windows
- Complete student anonymity
- Tamper-resistant submission tracking

---

## 3. Design Principles

- **Minimal Friction:** Reduce barriers to entry and usage
- **User Autonomy:** Empower teachers with direct control
- **Flexibility:** Support both standardized and customized feedback approaches
- **Privacy-First:** Protect student anonymity rigorously
- **Intelligence Layer:** Leverage AI for meaningful insights, not busywork
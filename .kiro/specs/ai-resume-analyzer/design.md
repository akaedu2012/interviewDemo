# Technical Design Document

## Overview

This document specifies the technical design for an AI-powered resume analysis platform. The system is a full-stack web application that accepts PDF resume uploads, uses AI to extract structured information, and intelligently matches candidates against job descriptions with scoring and visualization.

### System Purpose

The platform addresses the pain point of rapidly screening and analyzing large volumes of resumes in the recruitment process by automating information extraction and providing intelligent candidate-job matching with a rich interactive interface.

### Key Capabilities

- PDF resume upload and parsing
- AI-powered structured information extraction (basic info, education, work experience, skills)
- Intelligent candidate-job matching with multi-dimensional scoring
- Real-time extraction progress streaming via Server-Sent Events
- Interactive candidate management with filtering, sorting, and status tracking
- Data persistence in SQLite database
- Responsive web interface with modern UI/UX

## Architecture

### System Architecture

The system follows a **full-stack monolithic architecture** using Next.js, which provides both frontend and backend capabilities in a unified framework.

```
┌─────────────────────────────────────────────────────────────┐
│                        Next.js Application                   │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │           Frontend Layer (React/TypeScript)         │    │
│  │                                                      │    │
│  │  ├── Pages (App Router)                            │    │
│  │  ├── Components (Presentational + Container)       │    │
│  │  ├── State Management                              │    │
│  │  └── API Client (fetch/axios)                       │    │
│  └────────────────────────────────────────────────────┘    │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │         Backend Layer (API Routes/Actions)          │    │
│  │                                                      │    │
│  │  ├── API Route Handlers (/api/*)                   │    │
│  │  ├── Server Actions                                 │    │
│  │  ├── Business Logic Services                        │    │
│  │  │   ├── Resume Upload Service                     │    │
│  │  │   ├── PDF Parser Service                        │    │
│  │  │   ├── AI Extractor Service                      │    │
│  │  │   ├── Job Matcher Service                       │    │
│  │  │   └── Candidate Manager Service                 │    │
│  │  └── Database Access Layer                          │    │
│  └────────────────────────────────────────────────────┘    │
│                                                              │
└─────────────────────────────────────────────────────────────┘
                              │
                              ├─────────────┐
                              │             │
                    ┌─────────▼────┐   ┌───▼──────────┐
                    │   SQLite DB   │   │  AI Service  │
                    │               │   │   (OpenAI/   │
                    │  - Candidates │   │   Anthropic) │
                    │  - Jobs       │   └──────────────┘
                    │  - Scores     │
                    └───────────────┘
```

### Technology Stack

**Frontend:**
- **Next.js 14+** with App Router - Full-stack React framework
- **TypeScript** - Type safety and better developer experience
- **React 18+** - UI component library
- **Tailwind CSS** - Utility-first CSS framework for styling
- **shadcn/ui** - Modern, accessible UI component library built on Radix UI
- **Recharts** - Composable charting library for score visualization
- **React Dropzone** - Drag-and-drop file upload
- **Zustand** or **React Context** - Lightweight state management

**Backend:**
- **Next.js API Routes** - RESTful API endpoints
- **Node.js Runtime** - JavaScript runtime environment
- **pdf-parse** - PDF text extraction library
- **OpenAI API** or **Anthropic Claude API** - AI-powered information extraction
- **Zod** - Runtime type validation for API inputs
- **better-sqlite3** - Synchronous SQLite3 bindings for Node.js

**Database:**
- **SQLite** - Lightweight, file-based relational database
- **Drizzle ORM** or **Prisma** - Type-safe database ORM

**Development Tools:**
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **TypeScript** - Static type checking

### Deployment Architecture


**Option 1: Vercel (Recommended for Next.js)**
- Next.js app deployed to Vercel
- SQLite database file stored in persistent volume or migrated to Vercel Postgres
- PDF files stored in Vercel Blob Storage or S3

**Option 2: Self-hosted (VPS/Docker)**
- Next.js app in Docker container
- SQLite database file on local filesystem
- PDF files stored on local filesystem or S3-compatible storage

## Components and Interfaces

### Frontend Components

#### Page Components (App Router)

1. **`/app/page.tsx`** - Home/Dashboard page
   - Displays candidate list (table/card view toggle)
   - Provides filtering, sorting, and search controls
   - Shows upload button to trigger upload modal

2. **`/app/upload/page.tsx`** - Upload page
   - Drag-and-drop upload zone
   - Multiple file upload support
   - Real-time upload progress for each file
   - SSE connection to stream AI extraction progress

3. **`/app/candidates/[id]/page.tsx`** - Candidate detail page
   - Full candidate information display
   - PDF preview component
   - Match score visualization (radar chart, bar chart)
   - Status selector dropdown
   - AI commentary display

4. **`/app/job-config/page.tsx`** - Job description configuration page
   - Job description text editor
   - Required skills tag input
   - Preferred skills tag input
   - Save button to persist configuration

#### Reusable Components

**Upload Components:**
- `FileDropzone` - Drag-and-drop file upload zone with click-to-browse
- `FileUploadProgress` - Individual file upload progress indicator
- `FileUploadList` - List of files being uploaded with status

**Candidate Components:**
- `CandidateTable` - Table view of candidates with sorting
- `CandidateCard` - Card view of individual candidate summary
- `CandidateList` - Container managing table/card view toggle
- `CandidateFilters` - Filter controls (skill tags, search)
- `CandidateSorter` - Sort controls (score, date)

**Detail Components:**
- `BasicInfoSection` - Display candidate basic information
- `EducationSection` - Display education background entries
- `ExperienceSection` - Display work experience entries
- `SkillsSection` - Display skill tags
- `ScoreVisualization` - Chart component for match scores (radar/bar chart)
- `StatusSelector` - Dropdown for changing candidate status
- `PDFViewer` - Component to display PDF preview
- `AICommentary` - Formatted display of AI analysis text

**Common Components:**
- `Button` - Reusable button with variants (primary, secondary, danger)
- `Card` - Container component with shadow and padding
- `Modal` - Overlay dialog component
- `LoadingSpinner` - Loading indicator
- `ErrorBoundary` - React error boundary for graceful error handling
- `Toast/Notification` - User feedback notifications
- `Badge` - Status and tag badges
- `Input` - Form input with validation states
- `Select` - Dropdown selector
- `TagInput` - Multi-value tag input component

### Backend Services

#### 1. Resume Upload Service

**Responsibilities:**
- Validate uploaded files (PDF format, size limits)
- Store uploaded files to filesystem or cloud storage
- Generate unique file identifiers
- Return file metadata

**Key Methods:**
```typescript
interface ResumeUploadService {
  uploadResume(file: File): Promise<UploadResult>;
  validateFile(file: File): ValidationResult;
  storeFile(file: File, fileId: string): Promise<string>; // returns file path
}

interface UploadResult {
  fileId: string;
  fileName: string;
  filePath: string;
  fileSize: number;
  uploadedAt: Date;
}

interface ValidationResult {
  isValid: boolean;
  errors: string[];
}
```

#### 2. PDF Parser Service

**Responsibilities:**
- Extract text content from PDF files
- Handle multi-page documents
- Clean and normalize extracted text
- Handle parsing errors gracefully

**Key Methods:**
```typescript
interface PDFParserService {
  parseResume(filePath: string): Promise<ParseResult>;
  cleanText(rawText: string): string;
}

interface ParseResult {
  success: boolean;
  text?: string;
  error?: string;
  pageCount?: number;
}
```


#### 3. AI Extractor Service

**Responsibilities:**
- Use AI model (OpenAI GPT-4 or Anthropic Claude) to extract structured information
- Parse resume text into structured JSON
- Support streaming extraction progress via SSE
- Normalize extracted data (e.g., skill tags standardization)

**Key Methods:**
```typescript
interface AIExtractorService {
  extractBasicInfo(resumeText: string): Promise<BasicInfo>;
  extractEducation(resumeText: string): Promise<Education[]>;
  extractExperience(resumeText: string): Promise<Experience[]>;
  extractSkills(resumeText: string): Promise<Skills>;
  extractAll(resumeText: string): AsyncGenerator<ExtractionProgress>;
}

interface BasicInfo {
  name: string | null;
  phone: string | null;
  email: string | null;
  city: string | null;
}

interface Education {
  school: string;
  major: string;
  degree: string;
  graduationTime: string;
}

interface Experience {
  company: string;
  title: string;
  startDate: string;
  endDate: string;
  responsibilities: string;
}

interface Skills {
  technical: string[];
  tools: string[];
  languages: string[];
}

interface ExtractionProgress {
  stage: 'basic' | 'education' | 'experience' | 'skills' | 'complete';
  data: Partial<ExtractedData>;
}
```

**AI Prompt Strategy:**

Use structured prompts with JSON schema output to ensure consistent extraction:

```
Extract the following information from this resume text and return ONLY valid JSON:
{
  "basicInfo": {"name": string | null, "phone": string | null, ...},
  "education": [...],
  "experience": [...],
  "skills": {...}
}

Resume text:
[RESUME_TEXT]
```

#### 4. Job Matcher Service

**Responsibilities:**
- Calculate match scores between candidate and job description
- Generate AI commentary on candidate fit
- Compute sub-scores for skills, experience, and education
- Aggregate sub-scores into overall score

**Key Methods:**
```typescript
interface JobMatcherService {
  calculateMatch(candidate: Candidate, job: JobDescription): Promise<MatchResult>;
  calculateSkillScore(candidateSkills: Skills, requiredSkills: string[], preferredSkills: string[]): number;
  calculateExperienceScore(experience: Experience[], jobDescription: string): Promise<number>;
  calculateEducationScore(education: Education[], jobDescription: string): Promise<number>;
}

interface MatchResult {
  overallScore: number; // 0-100
  skillScore: number; // 0-100
  experienceScore: number; // 0-100
  educationScore: number; // 0-100
  commentary: string;
}
```

**Scoring Logic:**

- **Skill Score (0-100):**
  - Required skills matched: 60% weight
  - Preferred skills matched: 30% weight
  - Additional relevant skills: 10% weight
  
- **Experience Score (0-100):**
  - Use AI to analyze experience relevance to job description
  - Consider years of experience, relevant technologies, and responsibilities
  
- **Education Score (0-100):**
  - Use AI to analyze education fit
  - Consider degree level, major relevance, institution quality


- **Overall Score (0-100):**
  - Weighted average: `(skillScore * 0.4) + (experienceScore * 0.4) + (educationScore * 0.2)`

#### 5. Candidate Manager Service

**Responsibilities:**
- CRUD operations for candidates
- CRUD operations for job descriptions
- Query candidates with filtering, sorting, and pagination
- Update candidate status
- Manage database transactions

**Key Methods:**
```typescript
interface CandidateManagerService {
  createCandidate(data: CreateCandidateInput): Promise<Candidate>;
  getCandidateById(id: string): Promise<Candidate | null>;
  listCandidates(options: ListOptions): Promise<PaginatedResult<Candidate>>;
  updateCandidateStatus(id: string, status: CandidateStatus): Promise<void>;
  
  createOrUpdateJob(data: JobDescription): Promise<JobDescription>;
  getActiveJob(): Promise<JobDescription | null>;
  
  saveMatchScore(candidateId: string, matchResult: MatchResult): Promise<void>;
}

interface ListOptions {
  page: number;
  pageSize: number;
  sortBy?: 'score' | 'uploadTime';
  sortOrder?: 'asc' | 'desc';
  skillFilters?: string[];
  searchKeyword?: string;
}

interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
```

## Data Models

### Database Schema (SQLite)

#### Table: `candidates`

```sql
CREATE TABLE candidates (
  id TEXT PRIMARY KEY,
  name TEXT,
  phone TEXT,
  email TEXT,
  city TEXT,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT '待筛选',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CHECK (status IN ('待筛选', '初筛通过', '面试中', '已录用', '已淘汰'))
);

CREATE INDEX idx_candidates_status ON candidates(status);
CREATE INDEX idx_candidates_created_at ON candidates(created_at DESC);
```


#### Table: `education`

```sql
CREATE TABLE education (
  id TEXT PRIMARY KEY,
  candidate_id TEXT NOT NULL,
  school TEXT NOT NULL,
  major TEXT NOT NULL,
  degree TEXT NOT NULL,
  graduation_time TEXT NOT NULL,
  FOREIGN KEY (candidate_id) REFERENCES candidates(id) ON DELETE CASCADE
);

CREATE INDEX idx_education_candidate_id ON education(candidate_id);
```

#### Table: `experience`

```sql
CREATE TABLE experience (
  id TEXT PRIMARY KEY,
  candidate_id TEXT NOT NULL,
  company TEXT NOT NULL,
  title TEXT NOT NULL,
  start_date TEXT NOT NULL,
  end_date TEXT NOT NULL,
  responsibilities TEXT NOT NULL,
  FOREIGN KEY (candidate_id) REFERENCES candidates(id) ON DELETE CASCADE
);

CREATE INDEX idx_experience_candidate_id ON experience(candidate_id);
```

#### Table: `skills`

```sql
CREATE TABLE skills (
  id TEXT PRIMARY KEY,
  candidate_id TEXT NOT NULL,
  skill_type TEXT NOT NULL,
  skill_name TEXT NOT NULL,
  FOREIGN KEY (candidate_id) REFERENCES candidates(id) ON DELETE CASCADE,
  CHECK (skill_type IN ('technical', 'tool', 'language'))
);

CREATE INDEX idx_skills_candidate_id ON skills(candidate_id);
CREATE INDEX idx_skills_name ON skills(skill_name);
```

#### Table: `job_descriptions`

```sql
CREATE TABLE job_descriptions (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  required_skills TEXT NOT NULL, -- JSON array stored as text
  preferred_skills TEXT NOT NULL, -- JSON array stored as text
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_job_active ON job_descriptions(is_active);
```

#### Table: `match_scores`

```sql
CREATE TABLE match_scores (
  id TEXT PRIMARY KEY,
  candidate_id TEXT NOT NULL,
  job_id TEXT NOT NULL,
  overall_score REAL NOT NULL,
  skill_score REAL NOT NULL,
  experience_score REAL NOT NULL,
  education_score REAL NOT NULL,
  commentary TEXT NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (candidate_id) REFERENCES candidates(id) ON DELETE CASCADE,
  FOREIGN KEY (job_id) REFERENCES job_descriptions(id) ON DELETE CASCADE
);

CREATE INDEX idx_match_scores_candidate_id ON match_scores(candidate_id);
CREATE INDEX idx_match_scores_overall_score ON match_scores(overall_score DESC);
```

### TypeScript Type Definitions

```typescript
// Domain models
type CandidateStatus = '待筛选' | '初筛选通过' | '面试中' | '已录用' | '已淘汰';

interface Candidate {
  id: string;
  name: string | null;
  phone: string | null;
  email: string | null;
  city: string | null;
  fileName: string;
  filePath: string;
  fileSize: number;
  status: CandidateStatus;
  createdAt: Date;
  updatedAt: Date;
  education: Education[];
  experience: Experience[];
  skills: SkillEntry[];
  matchScore?: MatchScore;
}

interface Education {
  id: string;
  candidateId: string;
  school: string;
  major: string;
  degree: string;
  graduationTime: string;
}

interface Experience {
  id: string;
  candidateId: string;
  company: string;
  title: string;
  startDate: string;
  endDate: string;
  responsibilities: string;
}

type SkillType = 'technical' | 'tool' | 'language';

interface SkillEntry {
  id: string;
  candidateId: string;
  skillType: SkillType;
  skillName: string;
}

interface JobDescription {
  id: string;
  title: string;
  description: string;
  requiredSkills: string[];
  preferredSkills: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface MatchScore {
  id: string;
  candidateId: string;
  jobId: string;
  overallScore: number;
  skillScore: number;
  experienceScore: number;
  educationScore: number;
  commentary: string;
  createdAt: Date;
}
```


## API Contracts

### RESTful API Endpoints

#### 1. Upload Resume

**Endpoint:** `POST /api/resumes/upload`

**Request:**
- Content-Type: `multipart/form-data`
- Body: `files: File[]` (up to 5 files)

**Response (Success - 200):**
```json
{
  "success": true,
  "uploads": [
    {
      "fileId": "uuid-1",
      "fileName": "john_doe_resume.pdf",
      "status": "uploaded"
    }
  ]
}
```

**Response (Error - 400):**
```json
{
  "success": false,
  "error": "Invalid file format. Only PDF files are accepted.",
  "code": "INVALID_FILE_FORMAT"
}
```

#### 2. Stream AI Extraction

**Endpoint:** `GET /api/resumes/:fileId/extract`

**Response:** Server-Sent Events stream

**SSE Event Format:**
```
event: progress
data: {"stage": "basic", "data": {"name": "John Doe", "email": "john@example.com"}}

event: progress
data: {"stage": "education", "data": {"education": [...]}}


event: progress
data: {"stage": "experience", "data": {"experience": [...]}}

event: progress
data: {"stage": "skills", "data": {"skills": {...}}}

event: complete
data: {"candidateId": "uuid-123", "message": "Extraction completed"}

event: error
data: {"error": "AI extraction failed", "code": "EXTRACTION_ERROR"}
```

#### 3. Trigger Match Calculation

**Endpoint:** `POST /api/candidates/:candidateId/match`

**Request:**
```json
{
  "jobId": "uuid-job-1"
}
```

**Response (Success - 200):**
```json
{
  "success": true,
  "matchScore": {
    "overallScore": 85.5,
    "skillScore": 90.0,
    "experienceScore": 82.0,
    "educationScore": 84.0,
    "commentary": "Strong candidate with excellent technical skills..."
  }
}
```

**Response (Error - 404):**
```json
{
  "success": false,
  "error": "Candidate not found",
  "code": "CANDIDATE_NOT_FOUND"
}
```


#### 4. List Candidates

**Endpoint:** `GET /api/candidates`

**Query Parameters:**
- `page` (number, default: 1)
- `pageSize` (number, default: 20)
- `sortBy` ('score' | 'uploadTime', optional)
- `sortOrder` ('asc' | 'desc', default: 'desc')
- `skills` (comma-separated string, optional)
- `search` (string, optional)

**Response (Success - 200):**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "uuid-1",
        "name": "John Doe",
        "status": "待筛选",
        "overallScore": 85.5,
        "createdAt": "2024-01-15T10:30:00Z"
      }
    ],
    "total": 150,
    "page": 1,
    "pageSize": 20,
    "totalPages": 8
  }
}
```

#### 5. Get Candidate Details

**Endpoint:** `GET /api/candidates/:id`

**Response (Success - 200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid-1",
    "name": "John Doe",
    "phone": "+1234567890",
    "email": "john@example.com",
    "city": "San Francisco",
    "fileName": "john_doe_resume.pdf",
    "filePath": "/uploads/uuid-1.pdf",
    "status": "待筛选",
    "education": [...],
    "experience": [...],
    "skills": [...],
    "matchScore": {...},
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

**Response (Error - 404):**
```json
{
  "success": false,
  "error": "Candidate not found",
  "code": "CANDIDATE_NOT_FOUND"
}
```

#### 6. Update Candidate Status

**Endpoint:** `PATCH /api/candidates/:id/status`

**Request:**
```json
{
  "status": "初筛通过"
}
```

**Response (Success - 200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid-1",
    "status": "初筛通过",
    "updatedAt": "2024-01-15T11:00:00Z"
  }
}
```


**Response (Error - 400):**
```json
{
  "success": false,
  "error": "Invalid status value",
  "code": "INVALID_STATUS"
}
```

#### 7. Create or Update Job Description

**Endpoint:** `POST /api/jobs`

**Request:**
```json
{
  "title": "Senior Full-Stack Developer",
  "description": "We are looking for an experienced full-stack developer...",
  "requiredSkills": ["JavaScript", "React", "Node.js", "SQL"],
  "preferredSkills": ["TypeScript", "Next.js", "AWS"]
}
```

**Response (Success - 200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid-job-1",
    "title": "Senior Full-Stack Developer",
    "isActive": true,
    "createdAt": "2024-01-15T09:00:00Z"
  }
}
```

**Response (Error - 400):**
```json
{
  "success": false,
  "error": "Job description cannot be empty",
  "code": "INVALID_INPUT"
}
```

#### 8. Get Active Job Description

**Endpoint:** `GET /api/jobs/active`


**Response (Success - 200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid-job-1",
    "title": "Senior Full-Stack Developer",
    "description": "...",
    "requiredSkills": [...],
    "preferredSkills": [...]
  }
}
```

**Response (No active job - 404):**
```json
{
  "success": false,
  "error": "No active job description found",
  "code": "NO_ACTIVE_JOB"
}
```

### API Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `INVALID_FILE_FORMAT` | 400 | Uploaded file is not a PDF |
| `FILE_TOO_LARGE` | 400 | File exceeds size limit |
| `INVALID_INPUT` | 400 | Request body validation failed |
| `INVALID_STATUS` | 400 | Invalid candidate status value |
| `CANDIDATE_NOT_FOUND` | 404 | Candidate ID does not exist |
| `JOB_NOT_FOUND` | 404 | Job description not found |
| `NO_ACTIVE_JOB` | 404 | No active job description configured |
| `PDF_PARSE_ERROR` | 500 | Failed to parse PDF file |
| `EXTRACTION_ERROR` | 500 | AI extraction failed |
| `MATCH_CALCULATION_ERROR` | 500 | Failed to calculate match score |
| `DATABASE_ERROR` | 500 | Database operation failed |


## Error Handling

### Frontend Error Handling

**Global Error Boundary:**
- Wrap the entire application with React Error Boundary
- Display fallback UI with error message and reload button
- Log errors to console for debugging

**API Error Handling:**
- Intercept all API responses in a centralized API client
- Map error codes to user-friendly messages
- Display errors using toast notifications
- Retry mechanism for transient errors (network issues)

**Validation Errors:**
- Client-side validation before API calls (using Zod schemas)
- Display inline validation errors in forms
- Prevent form submission if validation fails

**Loading States:**
- Show loading spinners during API calls
- Disable interactive elements during operations
- Skeleton screens for page-level loading

### Backend Error Handling

**Input Validation:**
- Use Zod schemas to validate all API inputs
- Return 400 status with detailed validation errors
- Sanitize file uploads to prevent malicious files

**Service Layer Errors:**
- Catch and log all exceptions in service methods
- Return structured error objects with codes
- Use try-catch blocks for external API calls (OpenAI, file system)


**Database Errors:**
- Wrap database operations in transactions
- Rollback on errors to maintain data consistency
- Return 500 status for database failures
- Log database errors for debugging

**AI Service Errors:**
- Handle rate limiting and quota errors from AI providers
- Implement retry logic with exponential backoff
- Provide fallback behavior if AI extraction fails
- Log AI API errors with request/response context

**File System Errors:**
- Handle file read/write failures gracefully
- Validate file paths to prevent directory traversal attacks
- Clean up temporary files on errors

## Testing Strategy

### Unit Testing

**Frontend Unit Tests:**
- Test utility functions and helpers
- Test component logic with React Testing Library
- Test state management logic (Zustand stores or context)
- Test form validation logic
- Mock API calls with MSW (Mock Service Worker)

**Backend Unit Tests:**
- Test service layer methods in isolation
- Mock database calls with in-memory SQLite or test doubles
- Mock AI API calls with predefined responses
- Test PDF parsing with sample PDF files
- Test scoring algorithms with known inputs/outputs


### Integration Testing

**API Integration Tests:**
- Test full API endpoints with real database (test DB)
- Test file upload flow end-to-end
- Test SSE streaming with EventSource
- Test error scenarios and edge cases

**Database Integration Tests:**
- Test database schema and migrations
- Test complex queries with joins
- Test transaction rollback scenarios
- Test referential integrity constraints

### End-to-End Testing

**E2E Test Scenarios:**
- Complete resume upload and extraction flow
- Candidate list filtering and sorting
- Candidate detail page navigation
- Status update workflow
- Job description configuration
- Match score calculation and visualization

**Tools:**
- Playwright or Cypress for E2E tests
- Test against local development environment
- Run E2E tests in CI/CD pipeline

### Manual Testing

**User Acceptance Testing:**
- Test UI responsiveness on different screen sizes
- Verify color contrast and accessibility
- Test with real PDF resumes of various formats
- Verify AI extraction accuracy with diverse resumes
- Test error scenarios (network failures, invalid files)


**Performance Testing:**
- Test with multiple concurrent uploads
- Test with large PDF files (10MB+)
- Test database query performance with 1000+ candidates
- Monitor AI API response times

### Why Property-Based Testing Is Not Applicable

This feature is **not suitable for property-based testing** because:

1. **Heavy External Service Integration:** The core functionality relies on external services (AI APIs for extraction and matching, file system for PDF storage) which are not pure functions and have high costs for repeated execution.

2. **UI-Centric Functionality:** Significant portions of the feature involve UI rendering, user interactions, and visual feedback which are better tested with snapshot tests and E2E tests rather than property-based tests.

3. **Side-Effect Heavy Operations:** Most operations involve side effects (database writes, file uploads, API calls) rather than pure transformations that property-based testing excels at.

4. **CRUD and Integration Focus:** The backend is primarily CRUD operations and integration logic (orchestrating PDF parsing → AI extraction → database storage) rather than complex algorithms with universal properties.

**Appropriate Testing Approach:**
- **Unit tests** for business logic (scoring calculations, skill normalization, text cleaning)
- **Integration tests** with mocks for service boundaries (AI API, database, file system)
- **E2E tests** for full user workflows (upload → extract → match → view)
- **Snapshot tests** for UI components
- **Example-based tests** for specific scenarios and edge cases

## Implementation Approach

### Phase 1: Foundation (Week 1)

**Goals:** Set up project structure, database, and basic API scaffolding

**Tasks:**
1. Initialize Next.js 14 project with TypeScript and App Router
2. Set up Tailwind CSS and shadcn/ui component library
3. Configure ESLint, Prettier, and TypeScript strict mode
4. Set up SQLite database with schema (using Drizzle ORM or Prisma)
5. Create database migration scripts
6. Implement database access layer with basic CRUD operations
7. Set up API route structure (`/api/resumes`, `/api/candidates`, `/api/jobs`)
8. Implement file upload endpoint with validation

**Deliverables:**
- Project boilerplate with configured tooling
- Database schema created and tested
- Basic API endpoints responding with mock data

### Phase 2: PDF Processing & AI Extraction (Week 2)

**Goals:** Implement PDF parsing and AI-powered extraction

**Tasks:**
1. Integrate `pdf-parse` library for PDF text extraction
2. Implement PDF Parser Service with error handling
3. Set up OpenAI or Anthropic API client
4. Design and test AI prompts for structured extraction
5. Implement AI Extractor Service with streaming support
6. Create SSE endpoint for extraction progress (`/api/resumes/:id/extract`)
7. Implement skill normalization logic
8. Test extraction with various resume formats
9. Implement Candidate Manager Service methods for storing extracted data
10. Create comprehensive error handling for AI and parsing failures

**Deliverables:**
- Working PDF parsing pipeline
- AI extraction service with SSE streaming
- Extracted data persisted to database

### Phase 3: Job Matching & Scoring (Week 3)

**Goals:** Implement intelligent candidate-job matching

**Tasks:**
1. Implement Job Description CRUD operations
2. Design scoring algorithms for skills, experience, and education
3. Implement skill matching logic with required/preferred weighting
4. Implement AI-powered experience and education scoring
5. Calculate overall match score with weighted aggregation
6. Generate AI commentary for match results
7. Create match score calculation endpoint
8. Store match scores in database
9. Test scoring with various candidate-job combinations
10. Optimize scoring performance

**Deliverables:**
- Job description configuration working
- Match scoring algorithm implemented and tested
- API endpoints for match calculation operational


### Phase 4: Frontend - Upload & Extraction (Week 4)

**Goals:** Build file upload and extraction progress UI

**Tasks:**
1. Create upload page with drag-and-drop zone (using react-dropzone)
2. Implement multi-file upload with progress indicators
3. Display upload status for each file
4. Connect to SSE endpoint for extraction progress
5. Display real-time extraction progress with visual indicators
6. Implement error handling and retry for failed uploads
7. Create loading states and animations
8. Add toast notifications for user feedback
9. Test upload flow with multiple files
10. Implement responsive layout for upload page

**Deliverables:**
- Working file upload interface
- Real-time extraction progress display
- Error handling and user feedback

### Phase 5: Frontend - Candidate Management (Week 5)

**Goals:** Build candidate list and detail pages

**Tasks:**
1. Create candidate list page with table view
2. Implement card view for candidates
3. Add view toggle (table/card)
4. Implement filtering by skills
5. Implement sorting by score and date
6. Add keyword search functionality
7. Implement pagination controls
8. Create candidate detail page
9. Display all extracted information in detail page
10. Implement PDF viewer component
11. Add status selector with update functionality
12. Test filtering, sorting, and search performance
13. Optimize rendering for large candidate lists

**Deliverables:**
- Fully functional candidate list with filtering/sorting
- Detailed candidate view with all information
- Status management working

### Phase 6: Frontend - Scoring & Visualization (Week 6)

**Goals:** Build score visualization and job configuration

**Tasks:**
1. Integrate Recharts library
2. Create radar chart for sub-scores
3. Create bar chart alternative visualization
4. Implement circular progress indicators
5. Display AI commentary with formatting
6. Use color coding for score ranges
7. Create job configuration page
8. Implement job description form with validation
9. Add required/preferred skills tag input
10. Connect match calculation to UI
11. Test score visualization with various score values
12. Ensure charts are responsive

**Deliverables:**
- Score visualization with multiple chart types
- Job configuration interface
- Complete match calculation flow

### Phase 7: Polish & Testing (Week 7)

**Goals:** Refine UI/UX, add error handling, comprehensive testing

**Tasks:**
1. Implement global error boundary
2. Add comprehensive error messages
3. Improve loading states across all pages
4. Ensure WCAG AA color contrast compliance
5. Add hover/focus states to all interactive elements
6. Write unit tests for frontend components
7. Write unit tests for backend services
8. Write integration tests for API endpoints
9. Write E2E tests for critical user flows
10. Perform manual testing with various resumes
11. Optimize performance (code splitting, lazy loading)
12. Add accessibility improvements (ARIA labels, keyboard navigation)
13. Fix bugs and edge cases

**Deliverables:**
- Polished UI with excellent UX
- Comprehensive test coverage
- Production-ready application

### Phase 8: Deployment & Documentation (Week 8)

**Goals:** Deploy application and create documentation

**Tasks:**
1. Prepare production build configuration
2. Set up environment variables for deployment
3. Configure database for production (persistent storage)
4. Deploy to Vercel or self-hosted environment
5. Set up file storage (Vercel Blob or S3)
6. Configure AI API keys securely
7. Test deployed application thoroughly
8. Write user documentation (how to use the system)
9. Write developer documentation (setup, architecture)
10. Create API documentation
11. Set up monitoring and error tracking (optional)
12. Plan for future enhancements

**Deliverables:**
- Live production application
- Complete documentation
- Deployment runbook

## Security Considerations

### Authentication & Authorization

**Current Scope:** No authentication implemented (single-user system)

**Future Enhancement:** Add authentication if multi-user support is needed
- Use NextAuth.js for authentication
- Implement role-based access control (recruiter, admin)
- Protect API routes with middleware

### File Upload Security

- Validate file types (only PDF allowed)
- Enforce file size limits (e.g., 10MB max)
- Sanitize file names to prevent path traversal
- Store files with generated UUIDs, not original names
- Scan uploaded files for malware (optional)

### API Security

- Validate all inputs with Zod schemas
- Sanitize user inputs to prevent injection attacks
- Rate limit API endpoints to prevent abuse
- Use HTTPS in production
- Protect sensitive endpoints with authentication (future)

### Data Privacy

- Store AI API keys in environment variables, never in code
- Don't log sensitive information (emails, phone numbers)
- Implement data retention policies (optional)
- Allow users to delete their data (GDPR compliance)

### Database Security

- Use parameterized queries to prevent SQL injection (ORM handles this)
- Implement database backups
- Restrict database file permissions
- Encrypt sensitive fields (optional)

## Performance Optimization

### Frontend Performance

- Implement code splitting for large pages
- Lazy load components not needed on initial render
- Optimize images and assets
- Use React.memo for expensive components
- Implement virtual scrolling for large lists (react-window)
- Cache API responses with SWR or React Query
- Minimize bundle size with tree shaking

### Backend Performance

- Add database indexes on frequently queried columns
- Implement caching for job descriptions (single active job)
- Use connection pooling for database (if applicable)
- Stream large responses (SSE for extraction)
- Optimize AI prompts to reduce token usage
- Batch database inserts for multiple records
- Add response compression

### Database Performance

- Create indexes on foreign keys and search columns
- Use EXPLAIN QUERY PLAN to optimize slow queries
- Limit query result sizes with pagination
- Archive old candidates to reduce table size

## Scalability Considerations

### Current Design Limitations

- **SQLite**: Limited concurrent write performance, not suitable for high-traffic multi-user scenarios
- **File Storage**: Local filesystem storage not scalable beyond single server
- **No Caching Layer**: Every request hits the database
- **Monolithic Architecture**: All components in single Next.js app

### Future Scalability Improvements

**Database:**
- Migrate to PostgreSQL or MySQL for better concurrency
- Implement read replicas for read-heavy workloads
- Add Redis cache layer for frequently accessed data

**File Storage:**
- Move to cloud storage (S3, Google Cloud Storage, Azure Blob)
- Use CDN for serving PDF files
- Implement signed URLs for secure file access

**Architecture:**
- Separate frontend and backend if needed
- Use message queues (Redis, RabbitMQ) for async processing
- Implement background jobs for AI extraction and matching
- Add load balancer for horizontal scaling

**AI Processing:**
- Implement queue system for extraction jobs
- Add retry logic with exponential backoff
- Cache extraction results to avoid reprocessing
- Consider batch processing for multiple resumes


## Monitoring & Observability

### Logging

**Application Logs:**
- Log all API requests with timestamps, endpoints, and status codes
- Log errors with stack traces and context
- Log AI API calls with request/response metadata
- Use structured logging (JSON format)
- Set appropriate log levels (ERROR, WARN, INFO, DEBUG)

**Log Storage:**
- Development: Console output
- Production: File-based logs or cloud logging service (CloudWatch, Datadog)

### Metrics

**Key Metrics to Track:**
- API response times
- AI extraction success/failure rate
- PDF parsing success/failure rate
- Upload volume and size
- Database query performance
- Match calculation duration
- User actions (uploads, status changes)

### Error Tracking

**Error Monitoring:**
- Capture unhandled exceptions
- Track API error rates by endpoint
- Alert on critical errors
- Use error tracking service (Sentry, Rollbar) in production

## Future Enhancements

### Phase 2 Features (Post-MVP)

1. **Batch Operations:**
   - Bulk status updates
   - Export candidates to CSV
   - Batch re-matching against new job descriptions


2. **Advanced Filtering:**
   - Filter by education level
   - Filter by years of experience
   - Filter by score ranges
   - Combine multiple filters

3. **Candidate Comparison:**
   - Side-by-side comparison of 2-3 candidates
   - Highlight differences in skills and experience
   - Compare match scores visually

4. **Email Integration:**
   - Send automated emails to candidates
   - Email templates for different stages
   - Track email opens and responses

5. **Interview Scheduling:**
   - Calendar integration
   - Schedule interviews directly from platform
   - Send calendar invites

6. **Collaborative Features:**
   - Multi-user support with authentication
   - Commenting on candidates
   - Assign candidates to team members
   - Activity history tracking

7. **Advanced Analytics:**
   - Dashboard with hiring metrics
   - Time-to-hire tracking
   - Source of hire analytics
   - Candidate pipeline visualization

8. **Resume Parsing Improvements:**
   - Support for DOCX format
   - OCR for scanned PDFs
   - Parse resumes in multiple languages
   - Better handling of non-standard formats


9. **AI Improvements:**
   - More accurate extraction with fine-tuned models
   - Sentiment analysis of resume language
   - Prediction of candidate success probability
   - Automated interview question generation

10. **Mobile Responsiveness:**
    - Optimize for tablet and mobile screens
    - Native mobile app (React Native)

## Technical Debt & Known Issues

### Areas for Future Improvement

1. **Testing Coverage:**
   - Initial implementation may have limited test coverage
   - Prioritize tests for critical paths first
   - Gradually increase coverage over time

2. **Error Recovery:**
   - SSE connection drops not fully handled
   - Need better retry mechanisms for AI calls
   - Partial extraction data should be recoverable

3. **Performance:**
   - Large PDF files may timeout
   - Need background job processing for heavy operations
   - List pagination needs optimization for 1000+ candidates

4. **Accessibility:**
   - Initial implementation focuses on desktop
   - Need comprehensive screen reader testing
   - Keyboard navigation needs refinement

5. **Internationalization:**
   - Current implementation is mixed English/Chinese
   - Need proper i18n setup for multiple languages
   - Date/time formatting needs localization


## Assumptions & Dependencies

### Assumptions

1. **Single Job Description:** System supports one active job description at a time
2. **PDF Format:** All resumes are in PDF format (no DOCX support initially)
3. **English/Chinese Content:** AI extraction optimized for English and Chinese resumes
4. **Desktop First:** Primary usage on desktop browsers (1280px+ width)
5. **Low Concurrent Users:** SQLite sufficient for expected usage patterns
6. **Small File Sizes:** Resume PDFs are typically under 10MB
7. **Reliable AI APIs:** OpenAI/Anthropic APIs are available and responsive

### External Dependencies

**Required:**
- Node.js 18+ runtime
- OpenAI API key or Anthropic API key
- Modern browser (Chrome, Firefox, Safari, Edge)

**Optional:**
- Cloud storage service (for production file storage)
- Error tracking service (Sentry)
- Monitoring service (Datadog, New Relic)

### Browser Support

**Supported Browsers:**
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

**Required Features:**
- ES2020 JavaScript support
- CSS Grid and Flexbox
- Fetch API
- EventSource (Server-Sent Events)


## Glossary of Technical Terms

- **SSE (Server-Sent Events):** A server push technology enabling servers to push real-time updates to clients over HTTP
- **ORM (Object-Relational Mapping):** A technique for converting data between incompatible type systems (database ↔ objects)
- **Drizzle/Prisma:** TypeScript-first ORMs for Node.js
- **shadcn/ui:** Collection of reusable React components built on Radix UI and Tailwind CSS
- **Zod:** TypeScript-first schema validation library
- **React Query/SWR:** Data fetching and caching libraries for React
- **Code Splitting:** Technique to split JavaScript bundles into smaller chunks loaded on demand
- **Tree Shaking:** Process of removing unused code from final bundle

## Conclusion

This design document provides a comprehensive technical blueprint for building the AI-powered resume analysis platform. The architecture balances simplicity (monolithic Next.js app with SQLite) with functionality (AI extraction, scoring, visualization) to deliver a production-ready MVP in 8 weeks.

Key design decisions include:
- **Next.js full-stack** for rapid development and deployment
- **SQLite** for simplicity and portability (with PostgreSQL migration path)
- **OpenAI/Anthropic APIs** for reliable AI extraction and matching
- **Component-based architecture** for maintainability and reusability
- **SSE streaming** for real-time extraction progress
- **Comprehensive error handling** for robust user experience

The phased implementation approach ensures steady progress with testable deliverables at each stage, while the scalability and future enhancement sections provide a roadmap for growth beyond the MVP.

# Requirements Document

## Introduction

本文档定义了AI赋能的智能简历分析平台的功能需求。该系统是一个全栈应用，用于解决招聘流程中快速筛选和分析大量简历的痛点。系统能够上传和解析PDF格式简历，利用AI模型提取关键信息并进行智能评分，同时提供交互丰富的前端界面来管理和可视化分析候选人数据。

## Glossary

- **Resume_Upload_System**: 简历上传系统，负责接收和存储用户上传的PDF简历文件
- **PDF_Parser**: PDF解析器，负责从PDF文件中提取文本内容
- **AI_Extractor**: AI信息提取器，使用AI模型从简历文本中提取结构化信息
- **Job_Matcher**: 岗位匹配器，负责将候选人简历与岗位需求进行匹配和评分
- **Candidate_Manager**: 候选人管理器，负责候选人信息的存储、查询和状态管理
- **Frontend_UI**: 前端用户界面，提供用户交互和数据可视化功能
- **SSE_Stream**: Server-Sent Events流式传输，用于实时推送AI提取进度
- **Job_Description**: 岗位描述，包含职位要求、必备技能和加分技能的配置
- **Candidate_Status**: 候选人状态，包括待筛选、初筛通过、面试中、已录用、已淘汰
- **SQLite_Database**: SQLite数据库，用于持久化存储候选人和岗位信息

## Requirements

### Requirement 1: 简历文件上传

**User Story:** 作为招聘人员，我想要上传PDF格式的简历文件，以便系统能够解析和分析候选人信息

#### Acceptance Criteria

1. THE Resume_Upload_System SHALL support drag-and-drop file upload
2. THE Resume_Upload_System SHALL support click-to-browse file upload
3. WHEN a non-PDF file is selected, THE Resume_Upload_System SHALL reject the file and display an error message
4. THE Resume_Upload_System SHALL support uploading at least 5 PDF files simultaneously
5. WHEN files are being uploaded, THE Resume_Upload_System SHALL display upload progress percentage for each file
6. WHEN files are being uploaded, THE Resume_Upload_System SHALL display upload status (uploading, success, failed) for each file
7. WHEN an upload fails, THE Resume_Upload_System SHALL display a descriptive error message and allow retry

### Requirement 2: PDF内容解析

**User Story:** 作为系统，我需要从上传的PDF文件中提取文本内容，以便后续进行AI分析

#### Acceptance Criteria

1. WHEN a PDF file is uploaded, THE PDF_Parser SHALL extract all text content from all pages
2. THE PDF_Parser SHALL handle multi-page PDF documents correctly
3. WHEN PDF parsing fails, THE PDF_Parser SHALL return an error code and descriptive error message
4. THE PDF_Parser SHALL clean extracted text by removing excessive whitespace and special characters
5. WHEN text extraction completes, THE PDF_Parser SHALL return structured text content with preserved logical formatting

### Requirement 3: AI结构化信息提取 - 基本信息

**User Story:** 作为招聘人员，我想要系统自动提取候选人的基本信息，以便快速了解候选人概况

#### Acceptance Criteria

1. WHEN resume text is provided, THE AI_Extractor SHALL extract the candidate name
2. WHEN resume text is provided, THE AI_Extractor SHALL extract the candidate phone number
3. WHEN resume text is provided, THE AI_Extractor SHALL extract the candidate email address
4. WHEN resume text is provided, THE AI_Extractor SHALL extract the candidate city location
5. WHEN a required field cannot be extracted, THE AI_Extractor SHALL return null for that field
6. THE AI_Extractor SHALL stream extraction results via SSE_Stream in real-time
7. FOR ALL extraction results, THE AI_Extractor SHALL return data in valid JSON format

### Requirement 4: AI结构化信息提取 - 教育背景

**User Story:** 作为招聘人员，我想要系统自动提取候选人的教育背景，以便评估候选人的学历水平

#### Acceptance Criteria

1. WHEN resume text is provided, THE AI_Extractor SHALL extract all education entries as an array
2. FOR EACH education entry, THE AI_Extractor SHALL extract school name
3. FOR EACH education entry, THE AI_Extractor SHALL extract major field of study
4. FOR EACH education entry, THE AI_Extractor SHALL extract degree level
5. FOR EACH education entry, THE AI_Extractor SHALL extract graduation time
6. THE AI_Extractor SHALL stream education extraction results via SSE_Stream progressively

### Requirement 5: AI结构化信息提取 - 工作经历

**User Story:** 作为招聘人员,我想要系统自动提取候选人的工作经历，以便评估候选人的相关经验

#### Acceptance Criteria

1. WHEN resume text is provided, THE AI_Extractor SHALL extract all work experience entries as an array
2. FOR EACH work experience entry, THE AI_Extractor SHALL extract company name
3. FOR EACH work experience entry, THE AI_Extractor SHALL extract job title
4. FOR EACH work experience entry, THE AI_Extractor SHALL extract start date and end date
5. FOR EACH work experience entry, THE AI_Extractor SHALL extract a summary of job responsibilities
6. THE AI_Extractor SHALL stream work experience extraction results via SSE_Stream progressively

### Requirement 6: AI结构化信息提取 - 技能标签

**User Story:** 作为招聘人员，我想要系统自动提取候选人的技能标签，以便快速匹配岗位需求

#### Acceptance Criteria

1. WHEN resume text is provided, THE AI_Extractor SHALL extract technical skills as an array of tags
2. WHEN resume text is provided, THE AI_Extractor SHALL extract tools and frameworks as an array of tags
3. WHEN resume text is provided, THE AI_Extractor SHALL extract programming languages as an array of tags
4. THE AI_Extractor SHALL normalize skill tags to standardized format (e.g., "javascript" and "JavaScript" become "JavaScript")
5. THE AI_Extractor SHALL stream skill extraction results via SSE_Stream progressively

### Requirement 7: 岗位需求配置

**User Story:** 作为招聘人员，我想要配置岗位需求信息，以便系统能够进行智能匹配

#### Acceptance Criteria

1. THE Frontend_UI SHALL provide a job description editor interface
2. THE Frontend_UI SHALL allow input of job description text
3. THE Frontend_UI SHALL allow input of required skills as tags
4. THE Frontend_UI SHALL allow input of preferred skills as tags
5. WHEN job description is submitted, THE Candidate_Manager SHALL store the Job_Description in SQLite_Database
6. THE Frontend_UI SHALL validate that job description text is not empty before submission
7. THE Frontend_UI SHALL validate that at least one required skill is specified before submission

### Requirement 8: 简历与岗位智能匹配评分

**User Story:** 作为招聘人员，我想要系统对候选人简历与岗位需求进行匹配评分，以便快速筛选合适的候选人

#### Acceptance Criteria

1. WHEN a candidate resume and Job_Description are provided, THE Job_Matcher SHALL calculate an overall match score between 0 and 100
2. WHEN a candidate resume and Job_Description are provided, THE Job_Matcher SHALL calculate a skill match sub-score between 0 and 100
3. WHEN a candidate resume and Job_Description are provided, THE Job_Matcher SHALL calculate an experience relevance sub-score between 0 and 100
4. WHEN a candidate resume and Job_Description are provided, THE Job_Matcher SHALL calculate an education fit sub-score between 0 and 100
5. WHEN a candidate resume and Job_Description are provided, THE Job_Matcher SHALL generate AI commentary describing candidate strengths and weaknesses
6. WHEN matching calculation fails, THE Job_Matcher SHALL return an error code and descriptive error message

### Requirement 9: 评分结果可视化

**User Story:** 作为招聘人员，我想要以图表形式查看候选人评分，以便更直观地理解匹配结果

#### Acceptance Criteria

1. WHEN match scores are available, THE Frontend_UI SHALL display the overall match score with a visual indicator
2. WHEN match scores are available, THE Frontend_UI SHALL display sub-scores using at least one chart type (radar chart, bar chart, or circular progress)
3. THE Frontend_UI SHALL display AI commentary text in a readable format
4. THE Frontend_UI SHALL use distinct colors to represent different score ranges (e.g., red for low, yellow for medium, green for high)

### Requirement 10: 候选人列表管理

**User Story:** 作为招聘人员，我想要查看和管理所有候选人，以便跟踪招聘进度

#### Acceptance Criteria

1. THE Frontend_UI SHALL provide a table view for displaying candidates
2. THE Frontend_UI SHALL provide a card view for displaying candidates
3. THE Frontend_UI SHALL allow users to switch between table view and card view
4. THE Frontend_UI SHALL display candidate name, overall score, upload time, and status in list views
5. WHEN a candidate is clicked, THE Frontend_UI SHALL navigate to the candidate detail page
6. THE Frontend_UI SHALL implement pagination with at least 20 candidates per page

### Requirement 11: 候选人筛选和排序

**User Story:** 作为招聘人员，我想要筛选和排序候选人列表，以便快速找到符合条件的候选人

#### Acceptance Criteria

1. THE Frontend_UI SHALL allow sorting candidates by overall match score in ascending or descending order
2. THE Frontend_UI SHALL allow sorting candidates by upload time in ascending or descending order
3. THE Frontend_UI SHALL allow filtering candidates by skill tags
4. THE Frontend_UI SHALL provide a keyword search input that searches across candidate name, skills, and school
5. WHEN search or filter is applied, THE Frontend_UI SHALL update the candidate list within 500 milliseconds
6. THE Frontend_UI SHALL display the count of filtered results

### Requirement 12: 候选人详情展示

**User Story:** 作为招聘人员，我想要查看候选人的完整信息，以便做出招聘决策

#### Acceptance Criteria

1. THE Frontend_UI SHALL display all extracted basic information on the detail page
2. THE Frontend_UI SHALL display all extracted education background on the detail page
3. THE Frontend_UI SHALL display all extracted work experience on the detail page
4. THE Frontend_UI SHALL display all extracted skill tags on the detail page
5. THE Frontend_UI SHALL display all match scores and AI commentary on the detail page
6. THE Frontend_UI SHALL provide a PDF preview component displaying the original resume
7. THE Frontend_UI SHALL display the current Candidate_Status on the detail page

### Requirement 13: 候选人状态管理

**User Story:** 作为招聘人员，我想要更新候选人的招聘状态，以便跟踪候选人在招聘流程中的进度

#### Acceptance Criteria

1. THE Candidate_Manager SHALL support five candidate states: 待筛选, 初筛通过, 面试中, 已录用, 已淘汰
2. WHEN a candidate is first created, THE Candidate_Manager SHALL set Candidate_Status to 待筛选
3. THE Frontend_UI SHALL provide a status selector on the candidate detail page
4. WHEN status is changed, THE Frontend_UI SHALL provide visual feedback (e.g., animation or notification)
5. WHEN status is changed, THE Candidate_Manager SHALL update the Candidate_Status in SQLite_Database
6. WHEN status update fails, THE Frontend_UI SHALL display an error message and revert to previous status

### Requirement 14: 数据持久化

**User Story:** 作为系统，我需要持久化存储所有候选人和岗位信息，以便数据不会丢失

#### Acceptance Criteria

1. THE Candidate_Manager SHALL store all candidate information in SQLite_Database
2. THE Candidate_Manager SHALL store all Job_Description information in SQLite_Database
3. THE Candidate_Manager SHALL store all match scores in SQLite_Database
4. THE Candidate_Manager SHALL store the original PDF file path or binary data in SQLite_Database
5. WHEN database write operation fails, THE Candidate_Manager SHALL return an error code and rollback the transaction
6. THE SQLite_Database SHALL maintain referential integrity between candidates and their match scores

### Requirement 15: RESTful API接口

**User Story:** 作为前端开发者，我需要标准的RESTful API，以便与后端进行数据交互

#### Acceptance Criteria

1. THE Resume_Upload_System SHALL provide a POST endpoint for uploading resume files
2. THE AI_Extractor SHALL provide a GET endpoint for retrieving extraction results with SSE_Stream support
3. THE Job_Matcher SHALL provide a POST endpoint for triggering match calculation
4. THE Candidate_Manager SHALL provide a GET endpoint for retrieving candidate list with pagination parameters
5. THE Candidate_Manager SHALL provide a GET endpoint for retrieving individual candidate details by ID
6. THE Candidate_Manager SHALL provide a PATCH endpoint for updating Candidate_Status
7. THE Candidate_Manager SHALL provide a POST endpoint for creating or updating Job_Description
8. WHEN an API request is invalid, THE system SHALL return HTTP 400 status code with error details in JSON format
9. WHEN a requested resource is not found, THE system SHALL return HTTP 404 status code with error details in JSON format
10. WHEN an internal error occurs, THE system SHALL return HTTP 500 status code with error details in JSON format

### Requirement 16: 前端组件架构

**User Story:** 作为前端开发者，我需要良好的组件架构，以便提高代码复用性和可维护性

#### Acceptance Criteria

1. THE Frontend_UI SHALL be built using Next.js with TypeScript
2. THE Frontend_UI SHALL follow component-based architecture with single responsibility principle
3. THE Frontend_UI SHALL separate presentational components from container components
4. THE Frontend_UI SHALL create reusable components for common UI patterns (buttons, cards, modals, forms)
5. THE Frontend_UI SHALL use consistent naming conventions for components and files

### Requirement 17: 响应式布局

**User Story:** 作为用户，我希望系统在不同屏幕尺寸下都能正常使用，以便在各种设备上工作

#### Acceptance Criteria

1. THE Frontend_UI SHALL implement responsive layout for desktop screens with minimum width of 1280 pixels
2. WHEN viewport width is at least 1280 pixels, THE Frontend_UI SHALL display full-featured layout
3. THE Frontend_UI SHALL ensure all interactive elements are accessible and clickable at supported resolutions
4. THE Frontend_UI SHALL ensure text remains readable at supported resolutions

### Requirement 18: 全局错误处理

**User Story:** 作为用户，当系统发生错误时，我希望看到友好的错误提示，以便了解问题所在

#### Acceptance Criteria

1. WHEN an API request fails, THE Frontend_UI SHALL display a user-friendly error message
2. WHEN an unexpected error occurs, THE Frontend_UI SHALL display a generic error message
3. THE Frontend_UI SHALL log detailed error information to browser console for debugging
4. THE Frontend_UI SHALL provide a global error boundary to catch React component errors
5. WHEN an error boundary catches an error, THE Frontend_UI SHALL display a fallback UI instead of crashing

### Requirement 19: 加载状态管理

**User Story:** 作为用户，当系统正在处理数据时，我希望看到加载指示器，以便知道系统正在工作

#### Acceptance Criteria

1. WHEN an API request is in progress, THE Frontend_UI SHALL display a loading indicator
2. WHEN data is being fetched for a page, THE Frontend_UI SHALL display a loading state for that page
3. WHEN file upload is in progress, THE Frontend_UI SHALL disable the upload button to prevent duplicate uploads
4. THE Frontend_UI SHALL remove loading indicators within 300 milliseconds after operations complete

### Requirement 20: 视觉设计和交互体验

**User Story:** 作为用户，我希望系统具有良好的视觉设计和流畅的交互体验，以便高效愉快地使用系统

#### Acceptance Criteria

1. THE Frontend_UI SHALL use a modern UI component library or design system (not plain HTML)
2. THE Frontend_UI SHALL maintain consistent spacing, typography, and color scheme throughout the application
3. THE Frontend_UI SHALL provide visual feedback for all interactive elements (hover, active, focus states)
4. WHEN user performs an action, THE Frontend_UI SHALL provide immediate visual feedback within 100 milliseconds
5. THE Frontend_UI SHALL ensure sufficient color contrast for text readability (WCAG AA standard)

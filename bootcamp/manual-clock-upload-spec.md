# Manual Clock Event Upload Specification

## Overview

This feature enables Operations personnel to upload manual clock events via
Excel files using a drag-and-drop interface. The system will parse, validate,
and store these records in a master-detail structure, providing a comprehensive
audit trail for manual time entries.

## Learning Objectives

- Implement file upload with drag-and-drop UI
- Parse and validate Excel files (xlsx)
- Create master-detail database relationships
- Handle bulk data operations
- Implement data validation and error handling
- Use AG-Grid for hierarchical data display
- Apply sliding dialog patterns consistently

## Database Schema

### New Tables

```prisma
model ManualClockEventHeader {
  id              String   @id @default(uuid())
  company_id      String

  // Upload metadata
  filename        String
  upload_date     DateTime @default(now())
  file_size       Int

  // Personnel tracking
  prepared_by     String
  verified_by     String?
  approved_by     String?
  submitted_by    String

  // Period information
  pay_period_id   String
  pay_period      PayPeriod @relation(fields: [pay_period_id], references: [id])
  date_sent       DateTime?

  // Processing status
  status          ManualUploadStatus @default(DRAFT)
  processed_date  DateTime?
  processed_by    String?

  // Validation results
  total_records   Int      @default(0)
  valid_records   Int      @default(0)
  error_records   Int      @default(0)
  warnings        String?  // JSON array of warnings

  // Relations
  details         ManualClockEventDetail[]

  created_at      DateTime @default(now())
  updated_at      DateTime @updatedAt

  @@index([company_id, pay_period_id])
  @@index([status])
  @@index([upload_date])
  @@schema("timekeeper")
}

model ManualClockEventDetail {
  id              String   @id @default(uuid())
  header_id       String
  header          ManualClockEventHeader @relation(fields: [header_id], references: [id], onDelete: Cascade)

  // Excel row reference
  row_number      Int

  // Employee information
  employee_no     String
  last_name       String
  first_name      String
  middle_name     String?

  // Clock event details
  location        String
  shift           String
  event_date      DateTime
  event_time      String   // Original time string from Excel
  event_timestamp DateTime // Parsed full timestamp
  event_mode      ClockMode // IN or OUT

  // Validation status
  is_valid        Boolean  @default(true)
  validation_errors String? // JSON array of errors

  // Processing status
  is_processed    Boolean  @default(false)
  clock_event_id  String?  // Reference to created ClockEvent

  created_at      DateTime @default(now())

  @@index([header_id])
  @@index([employee_no])
  @@index([is_valid])
  @@index([is_processed])
  @@schema("timekeeper")
}

enum ManualUploadStatus {
  DRAFT       // Initial upload, not yet verified
  VERIFIED    // Verified by supervisor
  APPROVED    // Approved for processing
  PROCESSING  // Currently being processed
  COMPLETED   // Successfully processed
  FAILED      // Processing failed
  CANCELLED   // Upload cancelled

  @@schema("timekeeper")
}

enum ClockMode {
  IN
  OUT

  @@schema("timekeeper")
}

// Update existing ClockEvent model
model ClockEvent_ {
  // ... existing fields ...

  // New field for manual upload reference
  manual_detail_id String?
  manual_detail    ManualClockEventDetail? @relation(fields: [manual_detail_id], references: [id])

  // ... rest of model ...
}
```

## Excel File Format

### Required Structure

The Excel file must contain two worksheets with specific names:

#### Worksheet 1: "Header"

| Field       | Required | Description                                  |
| ----------- | -------- | -------------------------------------------- |
| Prepared By | Yes      | Name of person who prepared the file         |
| Verified By | No       | Name of supervisor who verified              |
| Approved By | No       | Name of manager who approved                 |
| Pay Period  | Yes      | Pay period code (e.g., "January 1-15, 2025") |
| Date Sent   | No       | Date when file was sent                      |
| Location    | Yes      | Default location for all entries             |
| Notes       | No       | Additional comments                          |

#### Worksheet 2: "Details"

| Column | Header Text | Required | Format             | Description                |
| ------ | ----------- | -------- | ------------------ | -------------------------- |
| A      | Employee No | Yes      | Text               | Employee number            |
| B      | Last Name   | Yes      | Text               | Employee last name         |
| C      | First Name  | Yes      | Text               | Employee first name        |
| D      | Middle Name | No       | Text               | Employee middle name       |
| E      | Location    | Yes      | Text               | Work location              |
| F      | Shift       | Yes      | Text               | Shift code (DAY/NIGHT/MID) |
| G      | Date        | Yes      | Date (MM/DD/YYYY)  | Event date                 |
| H      | Time        | Yes      | Time (HH:MM AM/PM) | Event time                 |
| I      | Type        | Yes      | Text (IN/OUT)      | Clock event type           |

## User Interface

### Route Structure

```
/manual-clock-upload
  └── /manual-clock-upload/:headerId  (view/edit specific upload)
      └── /manual-clock-upload/:headerId/process  (processing screen)
```

### Main Upload Screen (`/manual-clock-upload`)

#### Layout

```
┌─────────────────────────────────────────────────────────┐
│ Manual Clock Event Upload                               │
│                                                         │
│ ┌─────────────────────────────────────────────────────┐ │
│ │                                                     │ │
│ │          [Upload Icon]                              │ │
│ │                                                     │ │
│ │     Drag and drop Excel file here                   │ │
│ │         or click to browse                          │ │
│ │                                                     │ │
│ │     Supported format: .xlsx, .xls                   │ │
│ │     Maximum size: 10MB                              │ │
│ │                                                     │ │
│ └─────────────────────────────────────────────────────┘ │
│                                                         │
│ Recent Uploads                                          │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ AG-Grid: Manual Clock Event Headers                 │ │
│ │ [Date] [Filename] [Period] [Status] [Records] [▼]   │ │
│ └─────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

#### Features

1. **Drag & Drop Zone**
   - Visual feedback on drag over
   - File type validation (xlsx, xls only)
   - File size validation (max 10MB)
   - Progress indicator during upload

2. **AG-Grid Display**
   - Master grid showing ManualClockEventHeader records
   - Sortable columns: Upload Date, Filename, Pay Period, Status, Total Records
   - Filterable by status, pay period
   - Row actions: View, Edit, Delete, Process
   - Expandable rows to show ManualClockEventDetail records

### File Processing Flow

#### Step 1: File Upload & Initial Validation

```javascript
// API endpoint: POST /api/manual-clock-upload/validate
{
  file: File,
  submitted_by: string
}

// Response
{
  success: boolean,
  header: {
    filename: string,
    pay_period: string,
    prepared_by: string,
    // ... other header fields
  },
  details: {
    total_rows: number,
    valid_rows: number,
    errors: Array<{
      row: number,
      field: string,
      message: string
    }>
  },
  warnings: string[]
}
```

#### Step 2: Validation Dialog (Sliding)

Shows validation results with options to:

- Continue with valid records only
- Fix and re-upload
- Cancel upload

#### Step 3: Save to Database

```javascript
// API endpoint: POST /api/manual-clock-upload/save
{
  header: HeaderData,
  details: DetailData[],
  skipInvalid: boolean
}
```

### Detail View Screen (`/manual-clock-upload/:headerId`)

#### Layout

```
┌──────────────────────────────────────────────────────────┐
│ Manual Clock Upload: [Filename]                          │
│                                                          │
│ Header Information                                       │
│ ┌──────────────────────────────────────────────────────┐ │
│ │ Pay Period: January 1-15, 2025                       │ │
│ │ Status: VERIFIED                                     │ │
│ │ Prepared By: John Doe    Verified By: Jane Smith     │ │
│ │ Upload Date: 01/20/2025  Records: 150 valid/5 error  │ │
│ └──────────────────────────────────────────────────────┘ │
│                                                          │
│ [Process] [Export] [Delete]                              │
│                                                          │
│ Detail Records                                           │
│ ┌─────────────────────────────────────────────────────┐  │
│ │ AG-Grid: Manual Clock Event Details                 │  │
│ │ [Row][Emp#][Name][Location][Date][Time][Type][Valid]│  │
│ └─────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────┘
```

#### Features

1. **Header Section**
   - Read-only display of upload metadata
   - Status badge with color coding
   - Action buttons based on status

2. **Detail Grid**
   - All ManualClockEventDetail records
   - Color coding for valid/invalid rows
   - Inline editing for corrections
   - Bulk selection for operations
   - Export to Excel functionality

### Processing Screen (Sliding Dialog)

#### When "Process" is clicked:

1. Validate all records again
2. Show summary of actions to be taken
3. Allow user to confirm or cancel
4. Process records in batches
5. Show progress with ability to cancel
6. Display results summary

## API Endpoints

### 1. Upload & Validate

```typescript
// POST /api/manual-clock-upload/validate
interface ValidateRequest {
	file: File
	submitted_by: string
}

interface ValidateResponse {
	success: boolean
	header: ManualClockEventHeader
	details: ValidationSummary
	tempId: string // Temporary ID for subsequent save
}
```

### 2. Save Upload

```typescript
// POST /api/manual-clock-upload/save
interface SaveRequest {
	tempId: string
	header: Partial<ManualClockEventHeader>
	skipInvalid: boolean
}

interface SaveResponse {
	success: boolean
	headerId: string
	recordsSaved: number
}
```

### 3. List Uploads

```typescript
// GET /api/manual-clock-upload
interface ListRequest {
	page: number
	pageSize: number
	status?: ManualUploadStatus
	payPeriodId?: string
	dateFrom?: string
	dateTo?: string
}

interface ListResponse {
	headers: ManualClockEventHeader[]
	total: number
	page: number
	pageSize: number
}
```

### 4. Get Upload Details

```typescript
// GET /api/manual-clock-upload/:headerId
interface GetDetailsResponse {
	header: ManualClockEventHeader
	details: ManualClockEventDetail[]
}
```

### 5. Process Upload

```typescript
// POST /api/manual-clock-upload/:headerId/process
interface ProcessRequest {
	processInvalid: boolean
	createTimeLogs: boolean
}

interface ProcessResponse {
	success: boolean
	processed: number
	failed: number
	errors: ProcessError[]
}
```

## Implementation Tasks

### Phase 1: Database Setup (Week 1, Day 1-2)

1. Create Prisma schema for new models
2. Run migrations
3. Add seed data for testing
4. Create TypeScript types

### Phase 2: File Upload UI (Week 1, Day 3-5)

1. Create upload route and component
2. Implement drag-and-drop zone
3. Add file validation
4. Create upload progress indicator

### Phase 3: Excel Processing (Week 2, Day 1-3)

1. Install and configure xlsx library
2. Create Excel parser service
3. Implement validation logic
4. Handle different date/time formats

### Phase 4: AG-Grid Integration (Week 2, Day 4-5)

1. Setup master-detail grid
2. Configure sorting and filtering
3. Add row actions
4. Implement inline editing

### Phase 5: Processing Logic (Week 3, Day 1-3)

1. Create processing service
2. Implement batch processing
3. Add transaction support
4. Create ClockEvent records

### Phase 6: UI Polish & Error Handling (Week 3, Day 4-5)

1. Add sliding dialogs for all actions
2. Implement comprehensive error handling
3. Add success notifications
4. Create help documentation

## Validation Rules

### Employee Validation

- Employee number must exist in Employee table
- Name should match (warning if different)
- Employee must be active

### Date/Time Validation

- Date must be within pay period range
- Time must be valid 24-hour or 12-hour format
- No duplicate entries for same employee/date/time/type
- IN must precede OUT for same day

### Location/Shift Validation

- Location must exist in Location table
- Shift must exist in Shift table
- Combination must be valid for employee

## Error Handling

### Upload Errors

- File too large
- Invalid file format
- Missing required worksheets
- Missing required columns

### Validation Errors

- Invalid employee number
- Invalid date/time format
- Duplicate entries
- Business rule violations

### Processing Errors

- Database connection issues
- Transaction failures
- Concurrent modification

## Security Considerations

1. **File Upload Security**
   - Virus scanning
   - File type verification
   - Size limits
   - Temporary file cleanup

2. **Data Validation**
   - SQL injection prevention
   - XSS protection
   - Input sanitization

3. **Access Control**
   - Role-based permissions
   - Audit logging
   - Data encryption

## Success Metrics

1. **Technical Metrics**
   - Upload success rate > 95%
   - Processing time < 30 seconds for 1000 records
   - Validation accuracy > 99%

2. **User Experience Metrics**
   - Error messages are clear and actionable
   - UI responds within 200ms
   - Batch processing shows progress

3. **Business Metrics**
   - Reduction in manual data entry time by 80%
   - Reduction in data entry errors by 90%
   - Complete audit trail for all uploads

## Testing Requirements

### Unit Tests

- Excel parsing functions
- Validation rules
- Date/time conversion
- Database operations

### Integration Tests

- File upload flow
- Validation pipeline
- Processing workflow
- Error scenarios

### E2E Tests

- Complete upload journey
- Error recovery
- Concurrent uploads
- Large file handling

## Documentation Requirements

1. **User Guide**
   - Excel template with examples
   - Step-by-step upload process
   - Troubleshooting guide

2. **Technical Documentation**
   - API documentation
   - Database schema
   - Processing flow diagrams

3. **Training Materials**
   - Video tutorial
   - Sample Excel files
   - Common scenarios

## Dependencies

### NPM Packages

```json
{
	"xlsx": "^0.18.5",
	"react-dropzone": "^14.2.3"
}
```

### External Services

- File storage (S3 or local)
- Email notifications (optional)
- Audit logging service

## Acceptance Criteria

1. **Upload Functionality**
   - [ ] User can drag and drop Excel files
   - [ ] System validates file format and size
   - [ ] System parses Excel correctly
   - [ ] Validation errors are clearly displayed

2. **Data Management**
   - [ ] All valid records are saved to database
   - [ ] Invalid records can be corrected
   - [ ] Upload history is maintained
   - [ ] Audit trail is complete

3. **Processing**
   - [ ] Records can be processed in batch
   - [ ] Clock events are created correctly
   - [ ] Processing status is tracked
   - [ ] Errors are handled gracefully

4. **User Interface**
   - [ ] All dialogs use sliding pattern
   - [ ] AG-Grid displays data correctly
   - [ ] Actions are contextual
   - [ ] Feedback is immediate

5. **Performance**
   - [ ] Upload completes within 10 seconds
   - [ ] Grid handles 10,000 records smoothly
   - [ ] Processing is optimized for batch operations

## Notes for Instructors

### Key Learning Points

1. File handling in web applications
2. Excel parsing and validation
3. Batch processing patterns
4. Master-detail relationships
5. Transaction management
6. Progress indication
7. Error recovery strategies

### Common Pitfalls

1. Not handling Excel date formats correctly
2. Memory issues with large files
3. Not implementing proper cleanup
4. Missing validation edge cases
5. Poor error messages

### Extension Ideas

1. Add email notifications
2. Implement approval workflow
3. Add comparison with existing records
4. Create reconciliation reports
5. Add bulk edit capabilities
6. Implement undo/redo
7. Add data visualization

### Assessment Criteria

1. Code organization and structure
2. Error handling completeness
3. User experience quality
4. Performance optimization
5. Test coverage
6. Documentation quality

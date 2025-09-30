# Employee Directory Module - Requirement Specification

## Project Overview

Build a read-only Employee Directory module that displays employee information
in a master-detail grid layout using AG-Grid Enterprise. This module will
demonstrate hierarchical data presentation, filtering capabilities, and
efficient data fetching patterns similar to the existing timesheet module but
with reduced complexity (2 levels instead of 4).

## Learning Objectives

1. Understand AG-Grid Enterprise implementation for hierarchical data
2. Practice working with Prisma and PostgreSQL multi-schema architecture
3. Implement efficient data fetching with lazy loading
4. Apply filtering and search functionality
5. Follow Epic Stack patterns and conventions

## Functional Requirements

### 1. Employee List View (Master Grid)

- Display all employees in a paginated AG-Grid table
- Show key employee information in columns
- Support sorting on all columns
- Implement quick filter (search box) for instant filtering
- Support column-specific filters
- Single-row selection to highlight active employee
- Expandable rows to show employee assignments (detail grid)

### 2. Employee Assignments View (Detail Grid)

- Display when employee row is expanded
- Show all assignments for the selected employee
- Include assignment dates, positions, departments
- Support sorting within the detail grid
- Auto-collapse other expanded employees (single expansion policy)

### 3. Filtering Capabilities

- **Quick Filter**: Global search across all employee fields
- **Department Filter**: Dropdown to filter by department
- **Position Filter**: Dropdown to filter by position
- **Status Filter**: Active/Inactive employees
- **Date Range Filter**: Filter assignments by effective date

### 4. Performance Requirements

- Initial load should display first 50 employees
- Implement virtual scrolling for large datasets
- Lazy load assignment details only when row is expanded
- Debounce search inputs (300ms delay)
- Cache expanded row data for session

## Technical Requirements

### 1. Database Tables (from schema.prisma)

The following tables from the existing schema will be used:

- `hr.Employee` - Main employee information
- `hr.EmployeeAssignment` - Employee job assignments
- `catalog.Position` - Position reference data
- `catalog.Department` - Department reference data
- `catalog.Office` - Office/location reference data

### 2. API Endpoints

Create the following React Router API routes:

- `GET /api/employees` - Fetch paginated employee list with filters
- `GET /api/employees/$employeeId/assignments` - Fetch assignments for specific
  employee

### 3. Route Structure

```
app/routes/
├── employees.tsx                 # Main layout with header
├── employees._index.tsx          # Employee directory grid page
└── api.employees.tsx             # API endpoint for employees
└── api.employees.$employeeId.assignments.tsx  # API for assignments
```

### 4. AG-Grid Configuration

- Use `ag-theme-quartz` for consistency with timesheets
- Support both light and dark themes
- Enterprise features: Master/Detail, Column Filters, Quick Filter
- Row height: 40px for master, 35px for detail
- Enable column resizing and reordering

## Database Schema (Simplified for Bootcamp)

```prisma
// schema.prisma - Simplified subset for Employee Directory bootcamp task

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// HR Schema - Employee Management
model Employee {
  id            String    @id @default(cuid())
  employeeCode  String    @unique @map("employee_code")
  firstName     String    @map("first_name")
  lastName      String    @map("last_name")
  middleName    String?   @map("middle_name")
  email         String?   @unique
  mobileNumber  String?   @map("mobile_number")
  dateHired     DateTime  @map("date_hired")
  dateRegular   DateTime? @map("date_regular")
  birthDate     DateTime  @map("birth_date")
  gender        String    // M, F
  civilStatus   String    @map("civil_status") // Single, Married, Widowed, Separated
  isActive      Boolean   @default(true) @map("is_active")

  // Relations
  assignments   EmployeeAssignment[]

  @@map("employees")
  @@schema("hr")
}

model EmployeeAssignment {
  id              String    @id @default(cuid())
  employeeId      String    @map("employee_id")
  positionId      String    @map("position_id")
  departmentId    String    @map("department_id")
  officeId        String?   @map("office_id")
  employmentType  String    @map("employment_type") // Regular, Contractual, Probationary
  effectiveDate   DateTime  @map("effective_date")
  endDate         DateTime? @map("end_date")
  isPrimary       Boolean   @default(true) @map("is_primary")
  remarks         String?

  // Relations
  employee        Employee    @relation(fields: [employeeId], references: [id])
  position        Position    @relation(fields: [positionId], references: [id])
  department      Department  @relation(fields: [departmentId], references: [id])
  office          Office?     @relation(fields: [officeId], references: [id])

  @@map("employee_assignments")
  @@schema("hr")
}

// Catalog Schema - Reference Data
model Position {
  id              String    @id @default(cuid())
  code            String    @unique
  title           String
  level           Int?      // Job level/grade
  isActive        Boolean   @default(true) @map("is_active")

  // Relations
  assignments     EmployeeAssignment[]

  @@map("positions")
  @@schema("catalog")
}

model Department {
  id              String    @id @default(cuid())
  code            String    @unique
  name            String
  parentId        String?   @map("parent_id")
  isActive        Boolean   @default(true) @map("is_active")

  // Relations
  assignments     EmployeeAssignment[]

  @@map("departments")
  @@schema("catalog")
}

model Office {
  id              String    @id @default(cuid())
  code            String    @unique
  name            String
  address         String?
  city            String?
  isActive        Boolean   @default(true) @map("is_active")

  // Relations
  assignments     EmployeeAssignment[]

  @@map("offices")
  @@schema("catalog")
}
```

## UI Mockups (Text-Based)

### Main Employee Directory Page Layout

```
┌─────────────────────────────────────────────────────────────────────┐
│  Employee Directory                                      [Dark Mode] │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  Filters:                                                           │
│  ┌─────────────────┐ ┌──────────────┐ ┌──────────────┐ ┌────────┐ │
│  │🔍 Quick search...│ │Dept: All    ▼│ │Pos: All     ▼│ │Active ▼│ │
│  └─────────────────┘ └──────────────┘ └──────────────┘ └────────┘ │
│                                                                      │
│  Showing 1-50 of 245 employees                                      │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │ ▼ │ Emp Code │ Full Name        │ Department  │ Position    │   │
│  ├───┼──────────┼──────────────────┼─────────────┼─────────────┤   │
│  │ ▶ │ EMP001   │ Juan Dela Cruz   │ IT          │ Developer   │   │
│  │ ▶ │ EMP002   │ Maria Santos     │ HR          │ Manager     │   │
│  │ ▼ │ EMP003   │ Pedro Reyes      │ Finance     │ Analyst     │   │
│  │   └──────────────────────────────────────────────────────────│   │
│  │     Assignment History (3 records)                           │   │
│  │     ┌────────────┬──────────────┬────────────┬────────────┐ │   │
│  │     │ Effective  │ Department   │ Position   │ Type       │ │   │
│  │     ├────────────┼──────────────┼────────────┼────────────┤ │   │
│  │     │ 2024-01-15 │ Finance      │ Analyst    │ Regular    │ │   │
│  │     │ 2023-06-01 │ Finance      │ Jr Analyst │ Probatnry  │ │   │
│  │     │ 2023-01-15 │ Accounting   │ Trainee    │ Contractual│ │   │
│  │     └────────────┴──────────────┴────────────┴────────────┘ │   │
│  │ ▶ │ EMP004   │ Ana Gonzales     │ Sales       │ Executive   │   │
│  │ ▶ │ EMP005   │ Roberto Cruz     │ IT          │ Lead Dev    │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                      │
│  [First] [Previous] Page 1 of 5 [Next] [Last]                      │
└─────────────────────────────────────────────────────────────────────┘
```

### AG-Grid Column Definitions

#### Master Grid (Employees)

```typescript
const employeeColumns = [
	{
		field: 'employeeCode',
		headerName: 'Employee Code',
		width: 120,
		sortable: true,
		filter: true,
	},
	{
		field: 'fullName',
		headerName: 'Full Name',
		width: 200,
		sortable: true,
		filter: true,
	},
	{
		field: 'email',
		headerName: 'Email',
		width: 200,
		sortable: true,
		filter: true,
	},
	{
		field: 'department',
		headerName: 'Department',
		width: 150,
		sortable: true,
		filter: true,
	},
	{
		field: 'position',
		headerName: 'Position',
		width: 150,
		sortable: true,
		filter: true,
	},
	{
		field: 'dateHired',
		headerName: 'Date Hired',
		width: 120,
		sortable: true,
		filter: 'agDateColumnFilter',
	},
	{
		field: 'employmentType',
		headerName: 'Type',
		width: 120,
		sortable: true,
		filter: true,
	},
	{
		field: 'status',
		headerName: 'Status',
		width: 100,
		sortable: true,
		filter: true,
		cellRenderer: (params) =>
			params.value === 'Active'
				? '<span class="text-green-600">●</span> Active'
				: '<span class="text-red-600">●</span> Inactive',
	},
]
```

#### Detail Grid (Assignments)

```typescript
const assignmentColumns = [
	{
		field: 'effectiveDate',
		headerName: 'Effective Date',
		width: 120,
		sortable: true,
	},
	{ field: 'endDate', headerName: 'End Date', width: 120, sortable: true },
	{ field: 'department', headerName: 'Department', width: 150, sortable: true },
	{ field: 'position', headerName: 'Position', width: 150, sortable: true },
	{ field: 'office', headerName: 'Office', width: 150, sortable: true },
	{
		field: 'employmentType',
		headerName: 'Employment Type',
		width: 130,
		sortable: true,
	},
	{
		field: 'isPrimary',
		headerName: 'Primary',
		width: 80,
		sortable: true,
		cellRenderer: (params) => (params.value ? '✓' : ''),
	},
	{ field: 'remarks', headerName: 'Remarks', flex: 1, sortable: false },
]
```

## Component Structure

```typescript
// app/routes/employees._index.tsx - Main Component Structure

export default function EmployeeDirectory() {
  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <h1 className="text-2xl font-semibold">Employee Directory</h1>
        <div className="text-sm text-muted-foreground">
          Showing {filteredCount} of {totalCount} employees
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-4 p-4 border-b bg-muted/50">
        <Input
          placeholder="Quick search..."
          className="max-w-xs"
          onChange={handleQuickFilter}
        />
        <Select onValueChange={handleDepartmentFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Department" />
          </SelectTrigger>
          <SelectContent>{/* Department options */}</SelectContent>
        </Select>
        <Select onValueChange={handlePositionFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Position" />
          </SelectTrigger>
          <SelectContent>{/* Position options */}</SelectContent>
        </Select>
        <Select onValueChange={handleStatusFilter}>
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* AG-Grid */}
      <div className="flex-1 ag-theme-quartz">
        <AgGridReact
          rowData={employees}
          columnDefs={employeeColumns}
          masterDetail={true}
          detailCellRendererParams={detailCellRendererParams}
          onGridReady={onGridReady}
          // ... other AG-Grid props
        />
      </div>
    </div>
  )
}
```

## Data Flow

```
1. Page Load
   ↓
2. Loader fetches initial employees (50 records)
   ↓
3. AG-Grid renders master grid
   ↓
4. User expands employee row
   ↓
5. Fetch assignments for that employee (lazy load)
   ↓
6. Render detail grid with assignments
   ↓
7. User applies filters
   ↓
8. Re-fetch filtered data
   ↓
9. Update grid with new data
```

## Acceptance Criteria

### Must Have (MVP)

1. ✅ Display employee list in AG-Grid master grid
2. ✅ Expand employee to see assignments in detail grid
3. ✅ Quick filter searches across all visible columns
4. ✅ Department and Position dropdown filters work
5. ✅ Status filter (Active/Inactive) works
6. ✅ Single expansion policy (only one employee expanded at a time)
7. ✅ Sorting works on all columns
8. ✅ Proper loading states while fetching data
9. ✅ Error handling for failed API calls
10. ✅ Responsive layout that works on desktop screens

### Nice to Have (If Time Permits)

1. ⭐ Export to CSV functionality
2. ⭐ Column visibility toggle
3. ⭐ Save filter preferences to session
4. ⭐ Keyboard navigation support
5. ⭐ Row highlighting on hover

## Implementation Steps

### Step 1: Database Setup (Day 1)

1. Review the existing schema.prisma file
2. Understand the relationships between Employee, EmployeeAssignment, Position,
   Department
3. Create seed data for testing (minimum 50 employees with assignments)

### Step 2: API Routes (Day 1-2)

1. Create `api.employees.tsx` route
   - Implement pagination
   - Add filter query parameters
   - Include current assignment in response
2. Create `api.employees.$employeeId.assignments.tsx` route
   - Fetch all assignments for an employee
   - Include related position, department, office data

### Step 3: Main UI Component (Day 2-3)

1. Create `employees.tsx` layout route
2. Create `employees._index.tsx` main page
3. Set up AG-Grid with master configuration
4. Implement detail cell renderer for assignments
5. Add filtering controls

### Step 4: Testing (Day 3-4)

1. Write unit tests for API routes
2. Create Playwright E2E tests:
   - Test employee list loads
   - Test expanding shows assignments
   - Test all filters work correctly
   - Test sorting functionality
   - Test error scenarios

### Step 5: Polish & Optimization (Day 4)

1. Add proper TypeScript types
2. Implement error boundaries
3. Add loading skeletons
4. Optimize queries with proper indexes
5. Add accessibility attributes

## Code Patterns to Follow

### Use Existing Epic Stack Patterns:

1. **Loader Pattern**: Use React Router loaders for data fetching
2. **Error Handling**: Use error boundaries and proper error responses
3. **Type Safety**: Define types for all data structures
4. **Prisma Queries**: Use proper includes and selects for efficiency
5. **Component Structure**: Follow the existing component patterns
6. **Styling**: Use Tailwind classes consistently
7. **Icons**: Use the existing icon sprite system

### Example Loader Pattern:

```typescript
export async function loader({ request }: Route.LoaderArgs) {
	const url = new URL(request.url)
	const searchParams = url.searchParams

	const filters = {
		search: searchParams.get('search'),
		department: searchParams.get('department'),
		position: searchParams.get('position'),
		status: searchParams.get('status'),
	}

	const employees = await prisma.employee.findMany({
		where: {
			AND: [
				filters.search
					? {
							OR: [
								{
									firstName: { contains: filters.search, mode: 'insensitive' },
								},
								{ lastName: { contains: filters.search, mode: 'insensitive' } },
								{
									employeeCode: {
										contains: filters.search,
										mode: 'insensitive',
									},
								},
							],
						}
					: {},
				// ... other filters
			],
		},
		include: {
			assignments: {
				where: { isPrimary: true },
				include: {
					position: true,
					department: true,
				},
			},
		},
		take: 50,
	})

	return json({ employees })
}
```

## Resources & References

1. **Existing Code to Study**:
   - `/app/routes/timesheets.tsx` - AG-Grid master-detail implementation
   - `/app/routes/projects+/` - Simple CRUD patterns
   - `/app/utils/db.server.ts` - Database utilities
   - `/app/components/ui/` - Reusable UI components

2. **Documentation**:
   - [AG-Grid Master-Detail Docs](https://www.ag-grid.com/react-data-grid/master-detail/)
   - [Prisma Query Docs](https://www.prisma.io/docs/concepts/components/prisma-client/querying-the-database)
   - [React Router v7 Docs](https://reactrouter.com/)

3. **Testing Resources**:
   - Existing test files in `/tests/e2e/`
   - Playwright documentation for E2E testing
   - Vitest documentation for unit testing

## Deliverables

1. ✅ Working Employee Directory page at `/employees` route
2. ✅ API endpoints returning proper JSON data
3. ✅ Fully functional filtering and sorting
4. ✅ Master-detail grid with lazy loading
5. ✅ At least 5 Playwright E2E tests
6. ✅ Clean, typed, documented code
7. ✅ No console errors or warnings
8. ✅ Follows Epic Stack patterns and conventions

## Evaluation Criteria

### Code Quality (40%)

- Proper TypeScript usage
- Following Epic Stack patterns
- Clean, readable code
- Proper error handling

### Functionality (35%)

- All features work as specified
- Good performance with large datasets
- Smooth user experience
- Proper loading states

### Testing (15%)

- Comprehensive test coverage
- Both E2E and unit tests
- Tests are maintainable

### UI/UX (10%)

- Clean, professional interface
- Responsive and accessible
- Consistent with existing design

## Notes for Instructors

- Emphasize the importance of studying existing code before implementing
- Encourage questions about architectural decisions
- Review code incrementally, don't wait until the end
- Discuss performance implications of different query strategies
- Highlight security considerations (even for read-only operations)
- Use this as an opportunity to discuss real-world enterprise patterns

## Common Pitfalls to Avoid

1. **N+1 Query Problem**: Always use proper includes in Prisma queries
2. **Missing Error Handling**: Every API call should handle failures
3. **Hardcoded Values**: Use constants and environment variables
4. **Ignoring TypeScript Errors**: Fix all type issues, don't use `any`
5. **Not Following Patterns**: Study and follow existing code patterns
6. **Forgetting Loading States**: Users should always know what's happening
7. **No Pagination**: Don't try to load all employees at once
8. **Missing Keys in React**: Ensure all list items have unique keys

## Success Tips

1. Start simple - get basic grid working first
2. Add features incrementally
3. Test as you go, don't wait until the end
4. Ask questions when stuck
5. Use the browser DevTools to debug
6. Check the Network tab for API calls
7. Review the existing timesheet code for patterns
8. Keep the UI simple and functional
9. Focus on core requirements first
10. Document any assumptions you make

---

_This specification is designed to be completed in 4-5 days by a developer who
has completed the Playwright testing module and studied the timesheet
implementation._

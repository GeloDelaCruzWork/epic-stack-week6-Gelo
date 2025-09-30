import { useState, useRef, useMemo, useCallback, useEffect } from 'react'
import { EmployeeAssignAddDialog } from '../components/employee-assign-add-dialog'
import { EmployeeAddDialog } from '../components/employee-add-dialog'
import { EmployeeEditDialog } from '../components/employee-edit-dialog'
import { AssignmentToolbar } from '../components/assignment-toolbar'
import { EmployeeAssignmentsEditDialog } from '../components/employee-assignments-edit-dialog'
import { AgGridReact } from 'ag-grid-react'
import { ModuleRegistry, AllCommunityModule } from 'ag-grid-community'
import {
	MasterDetailModule,
	MenuModule,
	ColumnsToolPanelModule,
	SetFilterModule,
} from 'ag-grid-enterprise'
import 'ag-grid-community/styles/ag-theme-quartz.css'
import { Input } from '#app/components/ui/input.tsx'
import { useTheme } from '#app/routes/resources+/theme-switch.tsx'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '#app/components/ui/select.tsx'
import type {
	ColDef,
	GridOptions,
	GridApi,
	GridReadyEvent,
	ICellRendererParams,
	GetDetailRowDataParams,
} from 'ag-grid-community'
import {
	useLoaderData,
	useSearchParams,
	useNavigation,
	data,
} from 'react-router'
import { GeneralErrorBoundary } from '#app/components/error-boundary.tsx'
import { Button } from '#app/components/ui/button.tsx'
import type { Employee, EmployeeAssignment } from '@prisma/client'
import { prisma } from '#app/utils/db.server.ts'

// Type definitions for our data shapes after processing

type FormattedAssignment = Omit<
	EmployeeAssignment,
	| 'department'
	| 'position'
	| 'office'
	| 'assignment_type'
	| 'isPrimary'
	| 'remarks'
> & {
	department: string
	position: string
	office: string | undefined
	employmentType: string
	isPrimary?: boolean
	remarks?: string
}

type FormattedEmployee = Employee & {
	fullName: string
	status: 'Active' | 'Inactive'
	assignments: FormattedAssignment[]
}

interface EmployeeLoaderData {
	employees: FormattedEmployee[]
	totalCount: number
	page: number
	pageSize: number
	search?: string
	department?: string
	position?: string
	status?: string
}

// Register AG Grid modules
ModuleRegistry.registerModules([
	AllCommunityModule,
	MasterDetailModule,
	MenuModule,
	ColumnsToolPanelModule,
	SetFilterModule,
])

export async function loader({
	request,
}: {
	request: Request
}): Promise<Response> {
	const url = new URL(request.url)
	const searchParams = url.searchParams

	const page = parseInt(searchParams.get('page') || '1', 10)
	const pageSize = parseInt(searchParams.get('pageSize') || '10', 10)
	const search = searchParams.get('search') || undefined
	const department = searchParams.get('department') || undefined
	const position = searchParams.get('position') || undefined
	const status = searchParams.get('status') || undefined

	const where: any = {
		AND: [],
	}

	if (search) {
		where.AND.push({
			OR: [
				{ first_name: { contains: search, mode: 'insensitive' } },
				{ last_name: { contains: search, mode: 'insensitive' } },
				{ email: { contains: search, mode: 'insensitive' } },
				{ employee_no: { contains: search, mode: 'insensitive' } },
			],
		})
	}

	if (status) {
		where.AND.push({
			employment_status: status === 'Active' ? 'ACTIVE' : 'INACTIVE',
		})
	}

	if (department) {
		where.AND.push({
			assignments: {
				some: {
					department: {
						name: department,
					},
				},
			},
		})
	}

	if (position) {
		where.AND.push({
			assignments: {
				some: {
					position: {
						name: position,
					},
				},
			},
		})
	}

	const totalCount = await prisma.employee.count({ where })

	const employeesData = await prisma.employee.findMany({
		where,
		skip: (page - 1) * pageSize,
		take: pageSize,
		include: {
			assignments: {
				include: {
					department: true,
					position: true,
					location: true,
				},
				orderBy: {
					effective_from: 'desc',
				},
			},
		},
		orderBy: {
			last_name: 'asc',
		},
	})

	const employees: FormattedEmployee[] = employeesData.map((emp) => ({
		...emp,
		fullName: `${emp.first_name} ${emp.last_name}`,
		status: emp.employment_status === 'ACTIVE' ? 'Active' : 'Inactive',
		assignments: emp.assignments.map((asg) => ({
			...asg,
			department: asg.department?.name || 'N/A',
			position: asg.position?.name || 'N/A',
			office: asg.location?.name || 'N/A',
			employmentType: asg.assignment_type || 'N/A',
		})),
	}))

	const loaderData: EmployeeLoaderData = {
		employees,
		totalCount,
		page,
		pageSize,
		search,
		department,
		position,
		status,
	}

	return loaderData
}

const StatusCellRenderer = (params: ICellRendererParams) => {
	const html =
		params.value === 'Active'
			? '<span class="text-green-600">●</span> Active'
			: '<span class="text-red-600">●</span> Inactive'
	return <span dangerouslySetInnerHTML={{ __html: html }} />
}

const EmployeeGridSkeleton = ({
	theme,
	pageSize,
}: {
	theme: string | null
	pageSize: number
}) => (
	<div
		className={`ag-theme-quartz${theme === 'dark' ? '-dark' : ''} mx-auto h-full w-[90%]`}
	>
		<div className="space-y-2">
			<div className="h-12 animate-pulse rounded-md bg-gray-300/50 dark:bg-gray-600/50" />
			{Array.from({ length: pageSize }).map((_, i) => (
				<div
					key={i}
					className="h-10 animate-pulse rounded-md bg-gray-200/50 dark:bg-gray-700/50"
				/>
			))}
		</div>
	</div>
)

export default function EmployeeDirectory() {
	const theme = useTheme()
	const [searchParams, setSearchParams] = useSearchParams()
	const {
		employees,
		totalCount,
		page,
		pageSize,
		search,
		department,
		position,
		status,
	} = useLoaderData() as EmployeeLoaderData
	const navigation = useNavigation()
	const [searchTerm, setSearchTerm] = useState<string>(search || '')
	const [addDialogOpen, setAddDialogOpen] = useState<boolean>(false)
	const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(
		null,
	)
	const [editDialogOpen, setEditDialogOpen] = useState<boolean>(false)
	const [selectedEmployee, setSelectedEmployee] = useState<any>(null)
	const [assignDialogOpen, setAssignDialogOpen] = useState<boolean>(false)
	const [selectedAssignment, setSelectedAssignment] = useState<any | null>(null)
	const [editAssignmentDialogOpen, setEditAssignmentDialogOpen] =
		useState(false)

	const handleFilterChange = useCallback(
		(filterName: string, value: string) => {
			setSearchParams((prev) => {
				const newSearchParams = new URLSearchParams(prev)
				if (value === 'all' || !value) {
					newSearchParams.delete(filterName)
				} else {
					newSearchParams.set(filterName, value)
				}
				newSearchParams.set('page', '1')
				return newSearchParams
			})
		},
		[setSearchParams],
	)

	useEffect(() => {
		// To prevent resetting the page when navigating, we only trigger the
		// search effect if the input value differs from the URL search param.
		if (searchTerm === (search || '')) return

		const handler = setTimeout(() => {
			handleFilterChange('search', searchTerm)
		}, 300) // 300ms debounce delay

		return () => {
			clearTimeout(handler)
		}
	}, [searchTerm, search, handleFilterChange])

	const [isNewEmployeeModalOpen, setIsNewEmployeeModalOpen] = useState(false)

	function closeNewEmployeeModal() {
		setIsNewEmployeeModalOpen(false)
	}

	function openNewEmployeeModal() {
		setIsNewEmployeeModalOpen(true)
	}

	const totalPages = Math.ceil(totalCount / pageSize)

	const handlePageChange = useCallback(
		(newPage: number) => {
			setSearchParams((prev) => {
				const newSearchParams = new URLSearchParams(prev)
				newSearchParams.set('page', String(newPage))
				return newSearchParams
			})
		},
		[setSearchParams],
	)

	const handlePageSizeChange = useCallback(
		(newPageSize: string) => {
			setSearchParams((prev) => {
				const newSearchParams = new URLSearchParams(prev)
				newSearchParams.set('pageSize', newPageSize)
				newSearchParams.set('page', '1') // reset to first page
				return newSearchParams
			})
		},
		[setSearchParams],
	)

	const gridRef = useRef<AgGridReact | null>(null)
	const gridApiRef = useRef<GridApi | null>(null)

	const onGridReady = useCallback((params: GridReadyEvent) => {
		gridApiRef.current = params.api
	}, [])

	const defaultColDef = useMemo(
		() => ({ filter: true, sortable: true, resizable: true }),
		[],
	)

	const [employeeColumns] = useState<ColDef<FormattedEmployee>[]>([
		{
			field: 'employee_no',
			headerName: 'Employee Code',
			width: 200,
			sortable: true,
			filter: true,
			cellRenderer: 'agGroupCellRenderer',
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
			width: 250,
			sortable: true,
			filter: true,
		},
		{
			headerName: 'Department',
			width: 150,
			sortable: true,
			filter: 'agSetColumnFilter',
			valueGetter: (params) => params.data?.assignments[0]?.department,
		},
		{
			headerName: 'Position',
			width: 150,
			sortable: true,
			filter: 'agSetColumnFilter',
			valueGetter: (params) => params.data?.assignments[0]?.position,
		},
		{
			field: 'hire_date',
			headerName: 'Date Hired',
			width: 150,
			sortable: true,
			filter: 'agDateColumnFilter',
		},
		{
			headerName: 'Type',
			field: 'employee_type',
			width: 120,
			sortable: true,
			filter: 'agSetColumnFilter',
			valueGetter: (params) => params.data?.employee_type,
		},
		{
			field: 'status',
			headerName: 'Status',
			width: 120,
			sortable: true,
			filter: 'agSetColumnFilter',
			cellRenderer: StatusCellRenderer,
		},
	])

	const [assignmentColumns] = useState<ColDef<FormattedAssignment>[]>([
		{
			field: 'effective_from',
			headerName: 'Effective Date',
			width: 150,
			sortable: true,
		},
		{
			field: 'effective_to',
			headerName: 'End Date',
			width: 150,
			sortable: true,
		},
		{
			field: 'department',
			headerName: 'Department',
			width: 150,
			sortable: true,
		},
		{ field: 'position', headerName: 'Position', width: 200, sortable: true },
		{ field: 'office', headerName: 'Office', width: 150, sortable: true },
		{
			field: 'employmentType',
			headerName: 'Employment Type',
			width: 200,
			sortable: true,
		},
		{
			field: 'isPrimary',
			headerName: 'Primary',
			width: 100,
			sortable: true,
			cellRenderer: (p: ICellRendererParams) => (p.value ? '✓' : ''),
		},
		{ field: 'remarks', headerName: 'Remarks', flex: 1, sortable: false },
	])

	const detailCellRendererParams = useMemo(
		() => ({
			detailGridOptions: {
				columnDefs: assignmentColumns,
			},
			getDetailRowData: (params: GetDetailRowDataParams<FormattedEmployee>) => {
				fetch(`/api/employees/${params.data.id}/assignments`)
					.then((res) => {
						if (!res.ok) {
							console.error('Failed to fetch assignments')
							params.successCallback([])
							return null
						}
						return res.json()
					})
					.then((data) => {
						const result = data as { assignments: FormattedAssignment[] }
						if (result && result.assignments) {
							params.successCallback(result.assignments)
						} else {
							params.successCallback([])
						}
					})
					.catch((error) => {
						console.error('Failed to fetch assignments:', error)
						params.successCallback([])
					})
			},
		}),
		[assignmentColumns],
	)

	const gridOptions: GridOptions = {
		masterDetail: true,
		detailCellRendererParams,
		getContextMenuItems: (params) => {
			const items: import('ag-grid-community').MenuItemDef[] = [
				{
					name: 'Copy',
					action: () => params.api.copySelectedRowsToClipboard(),
				},
				{ name: 'Export', action: () => params.api.exportDataAsCsv() },
			]
			if (!params.node || !params.node.data) {
				return items
			}
			if (params.node.data.id) {
				items.push({
					name: 'Delete Employee',
					action: () => handleDeleteEmployee(params.node.data.id),
				})
			}
			if (params.node.data.assignments) {
				params.node.data.assignments.forEach((asg: FormattedAssignment) => {
					if (asg.id) {
						items.push({
							name: `Delete Assignment (${asg.department || asg.position || asg.office || asg.id})`,
							action: () => handleDeleteAssignment(asg.id),
						})
					}
				})
			}
			return items
		},
	}
	// Delete functions
	const handleDeleteEmployee = async (employeeId: string) => {
		if (!window.confirm('Are you sure you want to delete this employee?'))
			return
		await fetch(`/api/employees/${employeeId}/delete`, { method: 'DELETE' })
		setSearchParams((prev) => {
			const newSearchParams = new URLSearchParams(prev)
			newSearchParams.set('reload', String(Date.now()))
			return newSearchParams
		})
	}

	const handleDeleteAssignment = async (assignmentId: string) => {
		if (!window.confirm('Are you sure you want to delete this assignment?'))
			return
		await fetch(`/api/employees/assignments/${assignmentId}/delete`, {
			method: 'DELETE',
		})
		setSearchParams((prev) => {
			const newSearchParams = new URLSearchParams(prev)
			newSearchParams.set('reload', String(Date.now()))
			return newSearchParams
		})
	}

	const departments = useMemo(() => {
		const set = new Set<string>()
		employees.forEach((emp) => {
			const v = emp.assignments?.[0]?.department
			if (v) set.add(v)
		})
		return Array.from(set).sort()
	}, [employees])

	const positions = useMemo(() => {
		const set = new Set<string>()
		employees.forEach((emp) => {
			const v = emp.assignments?.[0]?.position
			if (v) set.add(v)
		})
		return Array.from(set).sort()
	}, [employees])

	// Double click handler for AG Grid
	const handleRowDoubleClicked = useCallback((params: any) => {
		setSelectedEmployeeId(params.data?.id || null)
		setSelectedEmployee(params.data)
		setEditDialogOpen(true)
	}, [])

	// Handler for assignment row selection in AG Grid detail
	const handleAssignmentRowSelected = (assignment: any) => {
		setSelectedAssignment(assignment)
	}

	// Handler for edit button
	const handleEditAssignment = () => {
		setEditAssignmentDialogOpen(true)
	}

	return (
		<div className="flex h-full flex-col">
			<div class="flex justify-end p-4">
				<div class="flex gap-2">
					<Button onClick={() => setAddDialogOpen(true)}>Add Employee</Button>
					{selectedEmployeeId && (
						<Button onClick={() => setAssignDialogOpen(true)}>
							Add Assignment
						</Button>
					)}
					{selectedAssignment && (
						<Button onClick={handleEditAssignment} variant="secondary">
							Edit Assignment
						</Button>
					)}
				</div>
			</div>

			<div className="flex items-center justify-between p-4">
				<EmployeeAddDialog
					open={addDialogOpen}
					onClose={() => setAddDialogOpen(false)}
					onEmployeeAdded={(employee) => {
						setAddDialogOpen(false)
						setSearchParams((prev) => {
							const newSearchParams = new URLSearchParams(prev)
							newSearchParams.set('reload', String(Date.now()))
							return newSearchParams
						})
					}}
				/>
				{selectedEmployee && (
					<EmployeeEditDialog
						open={editDialogOpen}
						onClose={() => setEditDialogOpen(false)}
						employee={selectedEmployee}
						onEmployeeEdited={(employee: any) => {
							setEditDialogOpen(false)
							setSearchParams((prev) => {
								const newSearchParams = new URLSearchParams(prev)
								newSearchParams.set('reload', String(Date.now()))
								return newSearchParams
							})
						}}
					/>
				)}
				{selectedEmployeeId && (
					<EmployeeAssignAddDialog
						open={assignDialogOpen}
						onClose={() => setAssignDialogOpen(false)}
						onAssignmentAdded={() => {
							setAssignDialogOpen(false)
							setSearchParams((prev) => {
								const newSearchParams = new URLSearchParams(prev)
								newSearchParams.set('reload', String(Date.now()))
								return newSearchParams
							})
						}}
						employeeId={selectedEmployeeId}
					/>
				)}
			</div>

			{/* Filters as a form */}
			<div className="mx-auto w-[90%] p-4">
				<div className="flex items-end justify-between gap-4">
					<div className="flex flex-col">
						<label htmlFor="search" className="mb-1 text-sm font-medium">
							Search
						</label>
						<Input
							id="search"
							name="search"
							placeholder="Quick search..."
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
							className="max-w-xs"
						/>
					</div>

					<div className="flex items-end gap-4">
						<div className="flex flex-col">
							<label htmlFor="department" className="mb-1 text-sm font-medium">
								Department
							</label>
							<Select
								name="department"
								value={department || 'all'}
								onValueChange={(value) =>
									handleFilterChange('department', value)
								}
							>
								<SelectTrigger className="w-40" id="department">
									<SelectValue />
								</SelectTrigger>
								<SelectContent className="max-h-60 overflow-y-auto">
									<SelectItem value="all">All Departments</SelectItem>
									{departments.map((dep) => (
										<SelectItem key={dep} value={dep}>
											{dep}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>

						<div className="flex flex-col">
							<label htmlFor="position" className="mb-1 text-sm font-medium">
								Position
							</label>
							<Select
								name="position"
								value={position || 'all'}
								onValueChange={(value) => handleFilterChange('position', value)}
							>
								<SelectTrigger className="w-40" id="position">
									<SelectValue />
								</SelectTrigger>
								<SelectContent className="max-h-60 overflow-y-auto">
									<SelectItem value="all">All Positions</SelectItem>
									{positions.map((pos) => (
										<SelectItem key={pos} value={pos}>
											{pos}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>

						<div className="flex flex-col">
							<label htmlFor="status" className="mb-1 text-sm font-medium">
								Status
							</label>
							<Select
								name="status"
								value={status || 'all'}
								onValueChange={(value) => handleFilterChange('status', value)}
							>
								<SelectTrigger className="w-32" id="status">
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="all">All</SelectItem>
									<SelectItem value="Active">Active</SelectItem>
									<SelectItem value="Inactive">Inactive</SelectItem>
								</SelectContent>
							</Select>
						</div>

						<div className="flex gap-2">
							<Button
								type="button"
								variant="outline"
								onClick={() => {
									setSearchTerm('')
									setSearchParams({ page: '1', pageSize: String(pageSize) })
								}}
							>
								Reset
							</Button>
						</div>
					</div>
				</div>
			</div>

			{navigation.state === 'loading' ? (
				<EmployeeGridSkeleton theme={theme} pageSize={pageSize} />
			) : (
				<div
					className={`ag-theme-quartz${theme === 'dark' ? '-dark' : ''} mx-auto h-full w-[90%]`}
					role="region"
					aria-label="Employee Data Grid"
				>
					<AgGridReact
key={theme}
						ref={gridRef}
						onGridReady={onGridReady}
						rowData={employees}
						columnDefs={employeeColumns}
						gridOptions={gridOptions}
						domLayout="autoHeight"
						suppressFieldDotNotation
						defaultColDef={defaultColDef}
						onRowClicked={(params) =>
							setSelectedEmployeeId(params.data?.id || null)
						}
						onRowDoubleClicked={handleRowDoubleClicked}
						detailCellRendererParams={{
							...detailCellRendererParams,
							detailGridOptions: {
								...detailCellRendererParams.detailGridOptions,
								onRowClicked: (params: any) =>
									handleAssignmentRowSelected(params.data),
							},
						}}
					/>
				</div>
			)}

			<div className="flex items-center justify-between p-4">
				<div className="flex items-center gap-2">
					<label htmlFor="rows-per-page" className="text-sm font-medium">
						Rows per page:
					</label>
					<Select
						onValueChange={handlePageSizeChange}
						defaultValue={String(pageSize)}
					>
						<SelectTrigger className="w-[70px]" id="rows-per-page">
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="10">10</SelectItem>
							<SelectItem value="20">20</SelectItem>
							<SelectItem value="50">50</SelectItem>
						</SelectContent>
					</Select>
				</div>

				<div
					className="flex items-center gap-4"
					aria-label="Pagination controls"
				>
					<span
						role="status"
						aria-live="polite"
						className="text-sm font-medium"
					>
						Showing {Math.min(totalCount, (page - 1) * pageSize + 1)} to{' '}
						{Math.min(page * pageSize, totalCount)} of {totalCount} entries
					</span>
					<button
						onClick={() => handlePageChange(1)}
						disabled={page === 1}
						className="rounded-md border bg-white px-3 py-1 text-sm font-medium text-black shadow-sm hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
						aria-label="Go to first page"
					>
						First
					</button>
					<button
						onClick={() => handlePageChange(page - 1)}
						disabled={page === 1}
						className="rounded-md border bg-white px-3 py-1 text-sm font-medium text-black shadow-sm hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
						aria-label="Go to previous page"
					>
						Previous
					</button>
					<span
						role="status"
						aria-live="polite"
						className="text-sm font-medium"
					>
						Page {page} of {totalPages}
						{navigation.state === 'loading' && (
							<span className="ml-2 text-gray-500">(Loading...)</span>
						)}
					</span>
					<button
						onClick={() => handlePageChange(page + 1)}
						disabled={page === totalPages}
						className="disabled:cursor-.not-allowed rounded-md border bg-white px-3 py-1 text-sm font-medium text-black shadow-sm hover:bg-gray-50 disabled:opacity-50"
						aria-label="Go to next page"
					>
						Next
					</button>
					<button
						onClick={() => handlePageChange(totalPages)}
						disabled={page === totalPages}
						className="rounded-md border bg-white px-3 py-1 text-sm font-medium text-black shadow-sm hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
						aria-label="Go to last page"
					>
						Last
					</button>
				</div>
			</div>

			{selectedAssignment && (
				<EmployeeAssignmentsEditDialog
					open={editAssignmentDialogOpen}
					onClose={() => setEditAssignmentDialogOpen(false)}
					assignment={selectedAssignment}
					onAssignmentEdited={() => {
						setEditAssignmentDialogOpen(false)
						setSelectedAssignment(null)
						setSearchParams((prev) => {
							const newSearchParams = new URLSearchParams(prev)
							newSearchParams.set('reload', String(Date.now()))
							return newSearchParams
						})
					}}
				/>
			)}
		</div>
	)
}

export const ErrorBoundary = GeneralErrorBoundary
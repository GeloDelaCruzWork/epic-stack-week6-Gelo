import { useLoaderData } from 'react-router'
import { requireUserId } from '#app/utils/auth.server.ts'
import { prisma } from '#app/utils/db.server.ts'
import { AgGridReact } from 'ag-grid-react'
import { ModuleRegistry, AllCommunityModule } from 'ag-grid-community'
import { AllEnterpriseModule } from 'ag-grid-enterprise'
import 'ag-grid-community/styles/ag-theme-quartz.css'
import {
	ColDef,
	IRowNode,
	GridApi,
	RowDoubleClickedEvent,
	RowGroupOpenedEvent,
} from 'ag-grid-community'
import { useMemo, useCallback, useState, useRef } from 'react'
import { type Route } from './+types/timesheets.ts'
import { Icon } from '#app/components/ui/icon.tsx'
import {
	TimesheetEditDialog,
	type TimesheetData,
} from '#app/components/timesheet-edit-dialog.tsx'
import {
	DTREditDialog,
	type DTRData,
} from '#app/components/dtr-edit-dialog.tsx'
import {
	TimelogEditDialog,
	type TimelogData,
} from '#app/components/timelog-edit-dialog.tsx'
import {
	ClockEventEditDialog,
	type ClockEventData,
} from '#app/components/clockevent-edit-dialog.tsx'
import {
	TimesheetCreateDialog,
	type TimesheetCreateData,
} from '#app/components/timesheet-create-dialog.tsx'
import {
	DTRAddDialog,
	type DTRCreateData,
} from '#app/components/dtr-add-dialog.tsx'
import {
	TimelogAddDialog,
	type TimelogCreateData,
} from '#app/components/timelog-add-dialog.tsx'
import {
	ClockEventAddDialog,
	type ClockEventCreateData,
} from '#app/components/clockevent-add-dialog.tsx'
import { DeleteConfirmationDialog } from '#app/components/delete-confirmation-dialog.tsx'
import type {
	Timesheet_,
	DTR_,
	Timelog_,
	ClockEvent_,
} from '#app/types/timesheet.ts'
import { useTheme } from '#app/routes/resources+/theme-switch.tsx'
import { Button } from '#app/components/ui/button.tsx'
import { DateEditor } from '#app/components/ag-grid-date-editor.tsx'
import { toast } from 'sonner'

// Register AG-Grid modules
ModuleRegistry.registerModules([AllCommunityModule, AllEnterpriseModule])

export async function loader({ request }: Route.LoaderArgs) {
	await requireUserId(request)

	const timesheets = await prisma.timesheet_.findMany({
		orderBy: [{ payPeriod: 'asc' }, { employeeName: 'asc' }],
		// Don't include DTRs in initial load - fetch them on demand
	})

	return { timesheets }
}

export default function TimesheetsPage() {
	const { timesheets } = useLoaderData<typeof loader>()
	const theme = useTheme()

	const [rowData, setRowData] = useState(timesheets)
	const [editDialogOpen, setEditDialogOpen] = useState(false)
	const [selectedTimesheet, setSelectedTimesheet] = useState<Timesheet_ | null>(
		null,
	)
	const [dtrEditDialogOpen, setDtrEditDialogOpen] = useState(false)
	const [selectedDTR, setSelectedDTR] = useState<DTR_ | null>(null)
	const [timelogEditDialogOpen, setTimelogEditDialogOpen] = useState(false)
	const [selectedTimelog, setSelectedTimelog] = useState<Timelog_ | null>(null)
	const [clockEventEditDialogOpen, setClockEventEditDialogOpen] =
		useState(false)
	const [selectedClockEvent, setSelectedClockEvent] =
		useState<ClockEvent_ | null>(null)
	const [createDialogOpen, setCreateDialogOpen] = useState(false)
	const [dtrAddDialogOpen, setDtrAddDialogOpen] = useState(false)
	const [timelogAddDialogOpen, setTimelogAddDialogOpen] = useState(false)
	const [clockEventAddDialogOpen, setClockEventAddDialogOpen] = useState(false)
	const gridRef = useRef<AgGridReact>(null)
	const [expandedNodeId, setExpandedNodeId] = useState<string | null>(null)
	const [selectedRowData, setSelectedRowData] = useState<any>(null)
	const [selectedRowLevel, setSelectedRowLevel] = useState<
		'timesheet' | 'dtr' | 'timelog' | 'clockevent' | null
	>(null)
	const [selectedRowExpanded, setSelectedRowExpanded] = useState<boolean>(false)
	const [selectedRowHasChildren, setSelectedRowHasChildren] =
		useState<boolean>(false)
	const [deleteConfirmOpen, setDeleteConfirmOpen] = useState<boolean>(false)
	const [deleteItemType, setDeleteItemType] = useState<string>('')
	const [deleteItemDescription, setDeleteItemDescription] = useState<string>('')

	// Determine AG-Grid theme class based on current theme
	// Default to light theme if theme is not set
	const gridThemeClass =
		theme === 'dark' ? 'ag-theme-quartz-dark' : 'ag-theme-quartz'

	// Handle opening edit dialog for any row type
	const handleOpenEditDialog = useCallback((rowData: any, rowLevel: string) => {
		if (!rowData || !rowLevel) return

		if (rowLevel === 'timesheet') {
			setSelectedTimesheet(rowData as Timesheet_)
			setEditDialogOpen(true)
		} else if (rowLevel === 'dtr') {
			setSelectedDTR(rowData as DTR_)
			setDtrEditDialogOpen(true)
		} else if (rowLevel === 'timelog') {
			setSelectedTimelog(rowData as Timelog_)
			setTimelogEditDialogOpen(true)
		} else if (rowLevel === 'clockevent') {
			setSelectedClockEvent(rowData as ClockEvent_)
			setClockEventEditDialogOpen(true)
		}
	}, [])

	// Main grid column definitions
	const columnDefs = useMemo<ColDef[]>(
		() => [
			{
				headerName: '',
				field: 'expand',
				cellRenderer: 'agGroupCellRenderer',
				width: 50,
				pinned: 'left',
				cellRendererParams: {
					innerRenderer: () => null,
					suppressCount: true,
				},
			},
			{
				field: 'employeeName',
				headerName: 'Employee Name',
				filter: 'agTextColumnFilter',
				floatingFilter: true,
				flex: 1.5,
				minWidth: 200,
			},
			{
				field: 'payPeriod',
				headerName: 'Pay Period',
				filter: 'agTextColumnFilter',
				floatingFilter: true,
				flex: 1.2,
				minWidth: 150,
			},
			{
				field: 'detachment',
				headerName: 'Detachment',
				filter: 'agTextColumnFilter',
				floatingFilter: true,
				flex: 1,
				minWidth: 120,
			},
			{
				field: 'shift',
				headerName: 'Shift',
				filter: 'agTextColumnFilter',
				floatingFilter: true,
				flex: 0.8,
				minWidth: 100,
			},
			{
				field: 'regularHours',
				headerName: 'Regular Hours',
				filter: 'agNumberColumnFilter',
				floatingFilter: true,
				flex: 0.8,
				minWidth: 120,
				valueFormatter: (params) => `${params.value?.toFixed(1) || 0} hrs`,
				cellClass: 'text-right font-semibold',
				cellStyle: { backgroundColor: 'rgba(34, 197, 94, 0.1)' },
			},
			{
				field: 'overtimeHours',
				headerName: 'OT Hours',
				filter: 'agNumberColumnFilter',
				floatingFilter: true,
				flex: 0.8,
				minWidth: 100,
				valueFormatter: (params) => `${params.value?.toFixed(1) || 0} hrs`,
				cellClass: 'text-right font-semibold',
				cellStyle: { backgroundColor: 'rgba(251, 146, 60, 0.1)' },
			},
			{
				field: 'nightDifferential',
				headerName: 'Night Diff',
				filter: 'agNumberColumnFilter',
				floatingFilter: true,
				flex: 0.8,
				minWidth: 100,
				valueFormatter: (params) => `${params.value?.toFixed(1) || 0} hrs`,
				cellClass: 'text-right font-semibold',
				cellStyle: { backgroundColor: 'rgba(147, 51, 234, 0.1)' },
			},
		],
		[],
	)

	// Detail grid column definitions for DTRs
	const detailColumnDefs = useMemo<ColDef[]>(
		() => [
			{
				field: 'date',
				headerName: 'DTR Date',
				flex: 1,
				minWidth: 150,
				valueFormatter: (params) => {
					if (!params.value) return ''
					const date = new Date(params.value)
					return date.toLocaleDateString('en-US', {
						weekday: 'short',
						month: 'short',
						day: 'numeric',
						year: 'numeric',
					})
				},
				cellClass: 'font-medium',
			},
			{
				field: 'regularHours',
				headerName: 'Regular Hours',
				flex: 0.8,
				minWidth: 120,
				valueFormatter: (params) => `${params.value || 0} hrs`,
				cellClass: 'text-right',
				cellStyle: { backgroundColor: 'rgba(34, 197, 94, 0.05)' },
			},
			{
				field: 'overtimeHours',
				headerName: 'Overtime Hours',
				flex: 0.8,
				minWidth: 120,
				valueFormatter: (params) => `${params.value || 0} hrs`,
				cellClass: 'text-right',
				cellStyle: (params) =>
					params.value > 0
						? { backgroundColor: 'rgba(251, 146, 60, 0.05)' }
						: undefined,
			},
			{
				field: 'nightDifferential',
				headerName: 'Night Differential',
				flex: 0.8,
				minWidth: 130,
				valueFormatter: (params) => `${params.value?.toFixed(1) || 0} hrs`,
				cellClass: 'text-right',
				cellStyle: (params) =>
					params.value > 0
						? { backgroundColor: 'rgba(147, 51, 234, 0.05)' }
						: undefined,
			},
		],
		[],
	)

	const defaultColDef = useMemo<ColDef>(
		() => ({
			sortable: true,
			resizable: true,
			menuTabs: ['filterMenuTab', 'generalMenuTab', 'columnsMenuTab'],
		}),
		[],
	)

	// Clock Event column definitions (4th level)
	const clockEventColumnDefs = useMemo<ColDef[]>(
		() => [
			{
				field: 'clockTime',
				headerName: 'Clock Punch Time',
				flex: 1,
				minWidth: 250,
				valueFormatter: (params) => {
					if (!params.value) return ''
					try {
						const date = new Date(params.value)
						return date.toLocaleString('en-US', {
							weekday: 'long',
							month: 'long',
							day: 'numeric',
							year: 'numeric',
							hour: '2-digit',
							minute: '2-digit',
							second: '2-digit',
							hour12: true,
						})
					} catch (e) {
						console.error('Error formatting date:', e)
						return params.value
					}
				},
				cellClass: 'font-bold',
			},
		],
		[],
	)

	// Timelog detail configuration with nested clock event drill-down
	const timelogDetailCellRendererParams = useMemo(
		() => ({
			detailGridOptions: {
				columnDefs: clockEventColumnDefs,
				defaultColDef: {
					sortable: true,
					resizable: true,
				},
				rowSelection: 'single',
				suppressRowClickSelection: false,
				headerHeight: 30,
				rowHeight: 35,
				domLayout: 'normal', // Explicitly set to normal
				suppressHorizontalScroll: true,
				animateRows: false, // Disable animations to avoid rendering issues
				suppressLoadingOverlay: true, // Avoid loading overlay issues
				getRowId: (params: any) => params.data?.id || Math.random().toString(), // Help AG-Grid identify rows
				suppressRowHoverHighlight: false, // Enable hover to verify rows exist
				onGridReady: (params: any) => {
					// Force a resize to ensure proper rendering
					setTimeout(() => {
						params.api?.sizeColumnsToFit()
					}, 100)
				},
				onFirstDataRendered: (params: any) => {
					params.api?.sizeColumnsToFit()
				},
				onRowDoubleClicked: (event: RowDoubleClickedEvent) => {
					// Handle ClockEvent row double-click
					if (event.data) {
						handleOpenEditDialog(event.data, 'clockevent')
					}
				},
				onRowClicked: (event: any) => {
					// Handle ClockEvent row click for selection tracking
					if (event.data) {
						console.log('ClockEvent row clicked:', event.data)
						setSelectedRowData(event.data)
						setSelectedRowLevel('clockevent')
						setSelectedClockEvent(event.data as ClockEvent)
						setSelectedRowExpanded(false) // ClockEvents can't be expanded
						// ClockEvents have no children
						console.log(
							'Setting selectedRowHasChildren (ClockEvent nested): false',
						)
						setSelectedRowHasChildren(false)
					}
				},
			},
			getDetailRowData: async (params: any) => {
				if (!params.successCallback) return

				try {
					const response = await fetch(
						`/api/timelogs/${params.data.id}/clockevents`,
					)
					if (!response.ok) {
						throw new Error('Failed to fetch clock events')
					}

					const data = (await response.json()) as { clockEvents?: ClockEvent[] }
					params.successCallback(data.clockEvents || [])
				} catch (error) {
					console.error('Error fetching clock events:', error)
					params.successCallback([])
				}
			},
		}),
		[
			clockEventColumnDefs,
			handleOpenEditDialog,
			setSelectedRowData,
			setSelectedRowLevel,
			setSelectedClockEvent,
			setSelectedRowExpanded,
			setSelectedRowHasChildren,
		],
	)

	// Timelog column definitions (3rd level) - now with drill-down capability
	const timelogColumnDefs = useMemo<ColDef[]>(
		() => [
			{
				headerName: '',
				field: 'expand',
				cellRenderer: 'agGroupCellRenderer',
				width: 35,
				pinned: 'left',
				cellRendererParams: {
					innerRenderer: () => null,
					suppressCount: true,
				},
			},
			{
				field: 'mode',
				headerName: 'Timelog Mode',
				flex: 0.5,
				minWidth: 80,
				cellRenderer: (params: any) => {
					const isIn = params.value === 'in'
					return (
						<span
							className={`font-semibold ${isIn ? 'text-green-500' : 'text-red-500'}`}
						>
							{isIn ? 'TIME IN' : 'TIME OUT'}
						</span>
					)
				},
			},
			{
				field: 'timestamp',
				headerName: 'Date & Time',
				flex: 1.5,
				minWidth: 200,
				valueFormatter: (params) => {
					if (!params.value) return ''
					const date = new Date(params.value)
					return date.toLocaleString('en-US', {
						weekday: 'short',
						month: 'short',
						day: 'numeric',
						year: 'numeric',
						hour: '2-digit',
						minute: '2-digit',
						second: '2-digit',
						hour12: true,
					})
				},
				cellClass: 'font-medium',
			},
		],
		[],
	)

	// DTR detail configuration with nested timelog drill-down
	const dtrDetailCellRendererParams = useMemo(
		() => ({
			detailGridOptions: {
				columnDefs: timelogColumnDefs,
				defaultColDef: {
					sortable: true,
					resizable: true,
				},
				rowSelection: 'single',
				suppressRowClickSelection: false,
				headerHeight: 30,
				rowHeight: 35,
				// Enable master-detail for Timelog grid too (4th level)
				masterDetail: true,
				detailCellRenderer: 'agDetailCellRenderer',
				detailCellRendererParams: timelogDetailCellRendererParams,
				detailRowHeight: 150, // Increased height for clock event grid: header (30px) + row (35px) + padding
				detailRowAutoHeight: false, // Explicitly set to false
				isRowMaster: (dataItem: any) => true, // All timelogs have clock events
				onRowDoubleClicked: (event: RowDoubleClickedEvent) => {
					// Handle Timelog row double-click
					if (!event.node.detail && event.data) {
						handleOpenEditDialog(event.data, 'timelog')
					}
				},
				onRowClicked: async (event: any) => {
					// Handle Timelog row click for selection tracking
					if (event.data) {
						console.log('Timelog row clicked:', event.data)
						setSelectedRowData(event.data)
						setSelectedRowLevel('timelog')
						setSelectedTimelog(event.data as Timelog)
						setSelectedRowExpanded(event.node?.expanded || false)
						// Clear deeper selection
						setSelectedClockEvent(null)

						// Check if Timelog has ClockEvents
						let hasChildren = false
						try {
							const response = await fetch(
								`/api/timelogs/${event.data.id}/clockevents`,
							)
							if (response.ok) {
								const data = await response.json()
								console.log('Timelog clockevents check (nested):', {
									timelogId: event.data.id,
									clockEvents: data.clockEvents,
									length: data.clockEvents?.length,
									hasChildren: data.clockEvents && data.clockEvents.length > 0,
								})
								hasChildren = data.clockEvents && data.clockEvents.length > 0
							}
						} catch (error) {
							console.error('Error checking for clock events:', error)
						}

						console.log(
							'Setting selectedRowHasChildren (Timelog nested):',
							hasChildren,
						)
						setSelectedRowHasChildren(hasChildren)
					}
				},
				onRowGroupOpened: async (event: any) => {
					// Handle Timelog expansion - ensure only one timelog is expanded at a time
					const rowData = event.node.data
					if (!rowData) return

					if (!event.node.expanded) {
						// Timelog is being collapsed but keep it selected
						return
					}

					// Timelog is being expanded - showing clock event
					const api = event.api
					if (!api) return

					const currentNodeId = event.node.id

					// Collapse all other expanded timelogs in this grid
					api.forEachNode((node: any) => {
						if (node.id !== currentNodeId && node.expanded) {
							node.setExpanded(false)
						}
					})

					// Select the expanded Timelog and update state
					event.node.setSelected(true)
					setSelectedRowData(rowData)
					setSelectedRowExpanded(true)
					setSelectedRowLevel('timelog')
					setSelectedTimelog(rowData as Timelog)

					// Check if Timelog has ClockEvents
					let hasChildren = false
					try {
						const response = await fetch(
							`/api/timelogs/${rowData.id}/clockevents`,
						)
						if (response.ok) {
							const data = await response.json()
							hasChildren = data.clockEvents && data.clockEvents.length > 0
						}
					} catch (error) {
						console.error('Error checking for clock events:', error)
					}
					setSelectedRowHasChildren(hasChildren)

					// Clear deeper selections
					setSelectedClockEvent(null)
				},
			},
			getDetailRowData: async (params: any) => {
				try {
					const response = await fetch(`/api/dtrs/${params.data.id}/timelogs`)
					if (!response.ok) {
						throw new Error('Failed to fetch timelogs')
					}

					const data = (await response.json()) as { timelogs?: Timelog[] }
					params.successCallback(data.timelogs || [])
				} catch (error) {
					console.error('Error fetching timelogs:', error)
					params.successCallback([])
				}
			},
		}),
		[
			timelogColumnDefs,
			timelogDetailCellRendererParams,
			handleOpenEditDialog,
			setSelectedRowData,
			setSelectedRowLevel,
			setSelectedTimelog,
			setSelectedClockEvent,
			setSelectedRowExpanded,
			setSelectedRowHasChildren,
		],
	)

	// Update detail column definitions to include drill-down capability
	const detailColumnDefsWithDrillDown = useMemo<ColDef[]>(
		() => [
			{
				headerName: '',
				field: 'expand',
				cellRenderer: 'agGroupCellRenderer',
				width: 40,
				pinned: 'left',
				cellRendererParams: {
					innerRenderer: () => null,
					suppressCount: true,
				},
			},
			...detailColumnDefs,
		],
		[detailColumnDefs],
	)

	// Detail grid configuration with dynamic data loading
	const detailCellRendererParams = useMemo(
		() => ({
			detailGridOptions: {
				columnDefs: detailColumnDefsWithDrillDown,
				defaultColDef: {
					sortable: true,
					resizable: true,
				},
				rowSelection: 'single',
				suppressRowClickSelection: false,
				headerHeight: 35,
				rowHeight: 35,
				// Enable master-detail for DTR grid too
				masterDetail: true,
				detailCellRenderer: 'agDetailCellRenderer',
				detailCellRendererParams: dtrDetailCellRendererParams,
				detailRowHeight: 250, // Height for multiple timelogs (Time IN/OUT): label (25px) + header (35px) + rows (70px) + padding
				isRowMaster: (dataItem: any) => true, // All DTRs can have timelogs
				onRowDoubleClicked: (event: RowDoubleClickedEvent) => {
					// Handle DTR row double-click
					if (!event.node.detail && event.data) {
						handleOpenEditDialog(event.data, 'dtr')
					}
				},
				onRowClicked: async (event: any) => {
					// Handle DTR row click for selection tracking
					if (event.data) {
						console.log('DTR row clicked:', event.data)
						setSelectedRowData(event.data)
						setSelectedRowLevel('dtr')
						setSelectedDTR(event.data as DTR)
						setSelectedRowExpanded(event.node?.expanded || false)
						// Clear deeper selections
						setSelectedTimelog(null)
						setSelectedClockEvent(null)

						// Check if DTR has Timelogs
						let hasChildren = false
						try {
							const response = await fetch(
								`/api/dtrs/${event.data.id}/timelogs`,
							)
							if (response.ok) {
								const data = await response.json()
								console.log('DTR timelogs check (nested):', {
									dtrId: event.data.id,
									timelogs: data.timelogs,
									length: data.timelogs?.length,
									hasChildren: data.timelogs && data.timelogs.length > 0,
								})
								hasChildren = data.timelogs && data.timelogs.length > 0
							}
						} catch (error) {
							console.error('Error checking for timelogs:', error)
						}

						console.log(
							'Setting selectedRowHasChildren (DTR nested):',
							hasChildren,
						)
						setSelectedRowHasChildren(hasChildren)
					}
				},
				onRowGroupOpened: async (event: any) => {
					// Handle DTR expansion - ensure only one DTR is expanded at a time
					const rowData = event.node.data
					if (!rowData) return

					if (!event.node.expanded) {
						// DTR is being collapsed but keep it selected
						return
					}

					// DTR is being expanded
					const api = event.api
					if (!api) return

					const currentNodeId = event.node.id

					// Collapse all other expanded DTRs in this grid
					api.forEachNode((node: any) => {
						if (node.id !== currentNodeId && node.expanded) {
							node.setExpanded(false)
						}
					})

					// Select the expanded DTR and update state
					event.node.setSelected(true)
					setSelectedRowData(rowData)
					setSelectedRowExpanded(true)
					setSelectedRowLevel('dtr')
					setSelectedDTR(rowData as DTR)

					// Check if DTR has Timelogs
					let hasChildren = false
					try {
						const response = await fetch(`/api/dtrs/${rowData.id}/timelogs`)
						if (response.ok) {
							const data = await response.json()
							hasChildren = data.timelogs && data.timelogs.length > 0
						}
					} catch (error) {
						console.error('Error checking for timelogs:', error)
					}
					setSelectedRowHasChildren(hasChildren)

					// Clear deeper selections
					setSelectedTimelog(null)
					setSelectedClockEvent(null)
				},
			},
			getDetailRowData: async (params: any) => {
				try {
					// Dynamically fetch DTRs when row is expanded
					const response = await fetch(`/api/timesheets/${params.data.id}/dtrs`)
					if (!response.ok) {
						throw new Error('Failed to fetch DTRs')
					}

					const data = (await response.json()) as { dtrs?: DTR[] }
					params.successCallback(data.dtrs || [])
				} catch (error) {
					console.error('Error fetching DTRs:', error)
					params.successCallback([])
				}
			},
		}),
		[
			detailColumnDefsWithDrillDown,
			dtrDetailCellRendererParams,
			handleOpenEditDialog,
			setSelectedRowData,
			setSelectedRowLevel,
			setSelectedDTR,
			setSelectedTimelog,
			setSelectedClockEvent,
			setSelectedRowExpanded,
			setSelectedRowHasChildren,
		],
	)

	// Calculate detail row height based on number of DTRs
	const getRowHeight = useCallback((params: any) => {
		if (params.node.detail) {
			const dtrsCount = params.data.dtrs?.length || 0
			// Header height (35) + row height (35) * number of rows + padding (20)
			return 35 + 35 * dtrsCount + 20
		}
		return undefined // Use default height for master rows
	}, [])

	// Handle row double-click for editing
	const onRowDoubleClicked = useCallback(
		(event: RowDoubleClickedEvent) => {
			// Open edit dialog based on the data type
			if (event.data) {
				let level = null
				if ('employeeName' in event.data) {
					level = 'timesheet'
				} else if ('date' in event.data) {
					level = 'dtr'
				} else if ('mode' in event.data) {
					level = 'timelog'
				} else if ('clockTime' in event.data) {
					level = 'clockevent'
				}

				handleOpenEditDialog(event.data, level)
			}
		},
		[handleOpenEditDialog],
	)

	// Handle saving timesheet edits
	const handleSaveTimesheet = useCallback(
		async (updatedData: TimesheetData) => {
			try {
				const response = await fetch(`/api/timesheets/${updatedData.id}`, {
					method: 'PUT',
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify(updatedData),
				})

				if (!response.ok) {
					throw new Error('Failed to update timesheet')
				}

				const result = (await response.json()) as { timesheet: Timesheet }

				// Update the grid data
				const updatedRowData = rowData.map((row) =>
					row.id === updatedData.id ? { ...row, ...result.timesheet } : row,
				)
				setRowData(updatedRowData)

				// Refresh the specific row in the grid
				if (gridRef.current?.api) {
					const rowNode = gridRef.current.api.getRowNode(updatedData.id)
					if (rowNode) {
						;(rowNode as any).setData(result.timesheet)
					}
				}
			} catch (error) {
				console.error('Failed to save timesheet:', error)
				throw error
			}
		},
		[rowData],
	)

	// Handle saving DTR edits with in-place updates
	const handleSaveDTR = useCallback(
		async (updatedData: DTRData) => {
			try {
				const response = await fetch(`/api/dtrs/${updatedData.id}`, {
					method: 'PUT',
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify(updatedData),
				})

				if (!response.ok) {
					throw new Error('Failed to update DTR')
				}

				const result = (await response.json()) as {
					dtr: DTR
					timesheet: Timesheet
				}

				// In-place updates without refresh
				if (gridRef.current?.api) {
					const api = gridRef.current.api

					api.forEachNode((timesheetNode: any) => {
						// Find and update the timesheet node
						if (
							timesheetNode.data &&
							result.timesheet &&
							timesheetNode.data.id === result.timesheet.id
						) {
							// Update timesheet totals
							timesheetNode.setData({
								...timesheetNode.data,
								regularHours: result.timesheet.regularHours,
								overtimeHours: result.timesheet.overtimeHours,
								nightDifferential: result.timesheet.nightDifferential,
							})

							// If this timesheet is expanded, update the specific DTR
							if ((timesheetNode as any).detailNode) {
								const detailApi = (timesheetNode as any).detailNode
									.detailGridInfo.api
								if (detailApi) {
									detailApi.forEachNode((dtrNode: any) => {
										// Find and update the specific DTR
										if (
											dtrNode.data &&
											result.dtr &&
											dtrNode.data.id === result.dtr.id
										) {
											dtrNode.setData({
												...dtrNode.data,
												regularHours: result.dtr.regularHours,
												overtimeHours: result.dtr.overtimeHours,
												nightDifferential: result.dtr.nightDifferential,
											})
										}
									})
								}
							}
						}
					})

					// Also update the main rowData state
					const updatedRowData = rowData.map((row) =>
						row.id === result.timesheet.id
							? { ...row, ...result.timesheet }
							: row,
					)
					setRowData(updatedRowData)
				}
			} catch (error) {
				console.error('Failed to save DTR:', error)
				throw error
			}
		},
		[rowData],
	)

	// Handle saving Timelog edits with in-place updates
	const handleSaveTimelog = useCallback(
		async (updatedData: TimelogData) => {
			try {
				const response = await fetch(`/api/timelogs/${updatedData.id}`, {
					method: 'PUT',
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify(updatedData),
				})

				if (!response.ok) {
					throw new Error('Failed to update timelog')
				}

				const result = (await response.json()) as {
					timelog: Timelog
					dtr: DTR
					timesheet: Timesheet
				}

				// In-place updates without refresh
				if (gridRef.current?.api) {
					const api = gridRef.current.api

					// Update the timelog row in the nested grid
					api.forEachNode((timesheetNode: any) => {
						// Find the timesheet node
						if (
							timesheetNode.data &&
							result.timesheet &&
							timesheetNode.data.id === result.timesheet.id
						) {
							// Update timesheet totals
							timesheetNode.setData({
								...timesheetNode.data,
								regularHours: result.timesheet.regularHours,
								overtimeHours: result.timesheet.overtimeHours,
								nightDifferential: result.timesheet.nightDifferential,
							})

							// If this timesheet is expanded, update its DTRs
							if ((timesheetNode as any).detailNode) {
								const detailApi = (timesheetNode as any).detailNode
									.detailGridInfo.api
								if (detailApi) {
									detailApi.forEachNode((dtrNode: any) => {
										// Find and update the specific DTR
										if (
											dtrNode.data &&
											result.dtr &&
											dtrNode.data.id === result.dtr.id
										) {
											dtrNode.setData({
												...dtrNode.data,
												regularHours: result.dtr.regularHours,
												overtimeHours: result.dtr.overtimeHours,
												nightDifferential: result.dtr.nightDifferential,
											})

											// If this DTR is expanded, update its timelogs
											if ((dtrNode as any).detailNode) {
												const timelogApi = (dtrNode as any).detailNode
													.detailGridInfo.api
												if (timelogApi) {
													timelogApi.forEachNode((timelogNode: any) => {
														// Update the specific timelog
														if (
															timelogNode.data &&
															timelogNode.data.id === result.timelog.id
														) {
															timelogNode.setData({
																...timelogNode.data,
																mode: result.timelog.mode,
																timestamp: result.timelog.timestamp,
															})
														}
													})
												}
											}
										}
									})
								}
							}
						}
					})

					// Also update the main rowData state
					const updatedRowData = rowData.map((row) =>
						row.id === result.timesheet.id
							? { ...row, ...result.timesheet }
							: row,
					)
					setRowData(updatedRowData)
				}
			} catch (error) {
				console.error('Failed to save timelog:', error)
				throw error
			}
		},
		[rowData],
	)

	// Handle saving ClockEvent edits with in-place updates
	const handleSaveClockEvent = useCallback(
		async (updatedData: ClockEventData) => {
			try {
				const response = await fetch(`/api/clockevents/${updatedData.id}`, {
					method: 'PUT',
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify(updatedData),
				})

				if (!response.ok) {
					throw new Error('Failed to update clock event')
				}

				const result = (await response.json()) as {
					clockEvent: ClockEvent
					timelog: Timelog
					dtr: DTR
					timesheet: Timesheet
				}

				// In-place updates without refresh - traverse all grid levels
				if (gridRef.current?.api) {
					const api = gridRef.current.api

					api.forEachNode((timesheetNode: any) => {
						// Find and update the timesheet node
						if (
							timesheetNode.data &&
							result.timesheet &&
							timesheetNode.data.id === result.timesheet.id
						) {
							// Update timesheet totals
							timesheetNode.setData({
								...timesheetNode.data,
								regularHours: result.timesheet.regularHours,
								overtimeHours: result.timesheet.overtimeHours,
								nightDifferential: result.timesheet.nightDifferential,
							})

							// If timesheet is expanded, traverse DTRs
							if ((timesheetNode as any).detailNode) {
								const dtrApi = (timesheetNode as any).detailNode.detailGridInfo
									.api
								if (dtrApi) {
									dtrApi.forEachNode((dtrNode: any) => {
										// Find and update the specific DTR
										if (
											dtrNode.data &&
											result.dtr &&
											dtrNode.data.id === result.dtr.id
										) {
											dtrNode.setData({
												...dtrNode.data,
												regularHours: result.dtr.regularHours,
												overtimeHours: result.dtr.overtimeHours,
												nightDifferential: result.dtr.nightDifferential,
											})

											// If DTR is expanded, traverse timelogs
											if ((dtrNode as any).detailNode) {
												const timelogApi = (dtrNode as any).detailNode
													.detailGridInfo.api
												if (timelogApi) {
													timelogApi.forEachNode((timelogNode: any) => {
														// Update the specific timelog
														if (
															timelogNode.data &&
															result.timelog &&
															timelogNode.data.id === result.timelog.id
														) {
															timelogNode.setData({
																...timelogNode.data,
																timestamp: result.timelog.timestamp,
															})

															// If timelog is expanded, update clock events
															if ((timelogNode as any).detailNode) {
																const clockEventApi = (timelogNode as any)
																	.detailNode.detailGridInfo.api
																if (clockEventApi) {
																	clockEventApi.forEachNode(
																		(clockEventNode: any) => {
																			// Update the specific clock event
																			if (
																				clockEventNode.data &&
																				clockEventNode.data.id ===
																					result.clockEvent.id
																			) {
																				clockEventNode.setData({
																					...clockEventNode.data,
																					clockTime:
																						result.clockEvent.clockTime,
																				})
																			}
																		},
																	)
																}
															}
														}
													})
												}
											}
										}
									})
								}
							}
						}
					})

					// Also update the main rowData state
					const updatedRowData = rowData.map((row) =>
						row.id === result.timesheet?.id
							? { ...row, ...result.timesheet }
							: row,
					)
					setRowData(updatedRowData)
				}
			} catch (error) {
				console.error('Failed to save clock event:', error)
				throw error
			}
		},
		[rowData],
	)

	// Handle master row expanded event - ensure only one timesheet is expanded at a time
	const onRowGroupOpened = useCallback(
		async (event: RowGroupOpenedEvent) => {
			// Skip if this is a detail row event
			if (event.node.detail) return

			const rowData = event.node.data
			if (!rowData) return

			if (!event.node.expanded) {
				// Row is being collapsed
				if (expandedNodeId === event.node.id) {
					setExpandedNodeId(null)
				}
				// Keep the row selected even when collapsed
				return
			}

			// Row is being expanded
			const api = gridRef.current?.api
			if (!api) return

			const currentNodeId = event.node.id

			// Immediately collapse ALL other expanded timesheets
			api.forEachNode((node) => {
				// Only collapse master rows (timesheets), not detail rows
				if (node.id !== currentNodeId && node.expanded && !node.detail) {
					node.setExpanded(false)
				}
			})

			// Update the expanded node ID
			setExpandedNodeId(currentNodeId ?? null)

			// Select the expanded row and update state
			event.node.setSelected(true)
			setSelectedRowData(rowData)
			setSelectedRowExpanded(true)
			setSelectedRowLevel('timesheet')
			setSelectedTimesheet(rowData as Timesheet)

			// Check if timesheet has DTRs to determine if it has children
			let hasChildren = false
			try {
				const response = await fetch(`/api/timesheets/${rowData.id}/dtrs`)
				if (response.ok) {
					const data = await response.json()
					hasChildren = data.dtrs && data.dtrs.length > 0
				}
			} catch (error) {
				console.error('Error checking for DTRs:', error)
			}
			setSelectedRowHasChildren(hasChildren)

			// Clear deeper selections
			setSelectedDTR(null)
			setSelectedTimelog(null)
			setSelectedClockEvent(null)
		},
		[expandedNodeId],
	)

	// Handle creating new timesheet
	const handleCreateTimesheet = useCallback(
		async (data: TimesheetCreateData) => {
			try {
				const response = await fetch('/api/timesheets/create', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify(data),
				})

				if (!response.ok) throw new Error('Failed to create timesheet')

				const result = (await response.json()) as { timesheet: Timesheet }
				setRowData([...rowData, result.timesheet])
			} catch (error) {
				console.error('Failed to create timesheet:', error)
				throw error
			}
		},
		[rowData],
	)

	// Handle creating new DTR
	const handleCreateDTR = useCallback(
		async (data: DTRCreateData) => {
			try {
				console.log('Creating DTR with data:', data)

				const response = await fetch('/api/dtrs/create', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify(data),
				})

				if (!response.ok) {
					const errorData = await response.text()
					console.error('DTR creation failed:', response.status, errorData)
					throw new Error(
						`Failed to create DTR: ${response.status} ${errorData}`,
					)
				}

				const result = (await response.json()) as {
					dtr: DTR
					timesheet: Timesheet
				}

				// Update the timesheet and add DTR to its detail grid if expanded
				if (gridRef.current?.api && result.dtr && result.timesheet) {
					gridRef.current.api.forEachNode((node) => {
						if (node.data?.id === result.timesheet.id) {
							// Update timesheet data
							node.setData(result.timesheet)

							// If expanded, add DTR to detail grid
							if (node.expanded && node.detailNode) {
								const detailGridApi = node.detailNode.detailGridInfo?.api
								if (detailGridApi) {
									const currentData = []
									detailGridApi.forEachNode((detailNode: any) => {
										currentData.push(detailNode.data)
									})
									detailGridApi.setGridOption('rowData', [
										...currentData,
										result.dtr,
									])

									// Select the new DTR
									setTimeout(() => {
										const newNode = detailGridApi.getRowNode(result.dtr.id)
										if (newNode) {
											newNode.setSelected(true)
											detailGridApi.ensureNodeVisible(newNode)
										}
									}, 100)
								}
							}
						}
					})

					// Update main rowData
					const updatedRowData = rowData.map((row) =>
						row.id === result.timesheet.id ? result.timesheet : row,
					)
					setRowData(updatedRowData)
				}

				toast.success('DTR created successfully')
			} catch (error) {
				console.error('Failed to create DTR:', error)
				toast.error('Failed to create DTR', {
					description:
						error instanceof Error
							? error.message
							: 'An unexpected error occurred',
				})
				throw error
			}
		},
		[rowData],
	)

	// Handle creating new Timelog
	const handleCreateTimelog = useCallback(
		async (data: TimelogCreateData) => {
			try {
				console.log('Creating Timelog with data:', data)

				const response = await fetch('/api/timelogs/create', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify(data),
				})

				if (!response.ok) {
					const errorData = await response.text()
					console.error('Timelog creation failed:', response.status, errorData)
					throw new Error(
						`Failed to create Timelog: ${response.status} ${errorData}`,
					)
				}

				const result = (await response.json()) as {
					timelog: Timelog
					dtr: DTR
					timesheet: Timesheet
				}

				// Update grids with optimistic updates
				if (gridRef.current?.api && result.timelog) {
					gridRef.current.api.forEachNode((timesheetNode) => {
						if (timesheetNode.data?.id === result.timesheet?.id) {
							// Update timesheet data
							if (result.timesheet) {
								timesheetNode.setData(result.timesheet)
							}

							// If timesheet is expanded, check DTRs
							if (timesheetNode.expanded && timesheetNode.detailNode) {
								const dtrGridApi = timesheetNode.detailNode.detailGridInfo?.api
								if (dtrGridApi) {
									dtrGridApi.forEachNode((dtrNode: any) => {
										if (dtrNode.data?.id === data.dtrId) {
											// Update DTR data if provided
											if (result.dtr) {
												dtrNode.setData(result.dtr)
											}

											// If DTR is expanded, add timelog to detail grid
											if (dtrNode.expanded && dtrNode.detailNode) {
												const timelogGridApi =
													dtrNode.detailNode.detailGridInfo?.api
												if (timelogGridApi) {
													const currentData = []
													timelogGridApi.forEachNode((timelogNode: any) => {
														currentData.push(timelogNode.data)
													})
													timelogGridApi.setGridOption('rowData', [
														...currentData,
														result.timelog,
													])

													// Select the new timelog
													setTimeout(() => {
														const newNode = timelogGridApi.getRowNode(
															result.timelog.id,
														)
														if (newNode) {
															newNode.setSelected(true)
															timelogGridApi.ensureNodeVisible(newNode)
														}
													}, 100)
												}
											}
										}
									})
								}
							}
						}
					})

					// Update main rowData if timesheet was updated
					if (result.timesheet) {
						const updatedRowData = rowData.map((row) =>
							row.id === result.timesheet.id ? result.timesheet : row,
						)
						setRowData(updatedRowData)
					}
				}

				toast.success('Timelog created successfully')
			} catch (error) {
				console.error('Failed to create Timelog:', error)
				toast.error('Failed to create Timelog', {
					description:
						error instanceof Error
							? error.message
							: 'An unexpected error occurred',
				})
				throw error
			}
		},
		[rowData],
	)

	// Handle creating new ClockEvent
	const handleCreateClockEvent = useCallback(
		async (data: ClockEventCreateData) => {
			try {
				const response = await fetch('/api/clockevents/create', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify(data),
				})

				if (!response.ok) throw new Error('Failed to create Clock Event')

				const result = (await response.json()) as {
					clockEvent: ClockEvent
					timelog: Timelog
					dtr: DTR
					timesheet: Timesheet
				}

				// Update grids with optimistic updates - navigate through all levels
				if (gridRef.current?.api && result.clockEvent) {
					gridRef.current.api.forEachNode((timesheetNode) => {
						if (timesheetNode.data?.id === result.timesheet?.id) {
							// Update timesheet data
							if (result.timesheet) {
								timesheetNode.setData(result.timesheet)
							}

							// Navigate through nested grids
							if (timesheetNode.expanded && timesheetNode.detailNode) {
								const dtrGridApi = timesheetNode.detailNode.detailGridInfo?.api
								if (dtrGridApi) {
									dtrGridApi.forEachNode((dtrNode: any) => {
										if (dtrNode.data?.id === result.dtr?.id) {
											// Update DTR data
											if (result.dtr) {
												dtrNode.setData(result.dtr)
											}

											// Check timelogs
											if (dtrNode.expanded && dtrNode.detailNode) {
												const timelogGridApi =
													dtrNode.detailNode.detailGridInfo?.api
												if (timelogGridApi) {
													timelogGridApi.forEachNode((timelogNode: any) => {
														if (timelogNode.data?.id === data.timelogId) {
															// Update timelog data
															if (result.timelog) {
																timelogNode.setData(result.timelog)
															}

															// If timelog is not expanded, expand it first
															if (!timelogNode.expanded) {
																timelogNode.setExpanded(true)
																// Wait for expansion to complete
																setTimeout(() => {
																	if (timelogNode.detailNode) {
																		const clockEventGridApi =
																			timelogNode.detailNode.detailGridInfo?.api
																		if (clockEventGridApi) {
																			// Set the clock event data
																			clockEventGridApi.setGridOption(
																				'rowData',
																				[result.clockEvent],
																			)

																			// Select the new clock event
																			setTimeout(() => {
																				const newNode =
																					clockEventGridApi.getRowNode(
																						result.clockEvent.id,
																					)
																				if (newNode) {
																					newNode.setSelected(true)
																					clockEventGridApi.ensureNodeVisible(
																						newNode,
																					)
																				}
																			}, 100)
																		}
																	}
																}, 200)
															} else if (timelogNode.detailNode) {
																// Timelog is already expanded, add clock event to existing grid
																const clockEventGridApi =
																	timelogNode.detailNode.detailGridInfo?.api
																if (clockEventGridApi) {
																	const currentData = []
																	clockEventGridApi.forEachNode(
																		(clockNode: any) => {
																			currentData.push(clockNode.data)
																		},
																	)
																	clockEventGridApi.setGridOption('rowData', [
																		...currentData,
																		result.clockEvent,
																	])

																	// Select the new clock event
																	setTimeout(() => {
																		const newNode =
																			clockEventGridApi.getRowNode(
																				result.clockEvent.id,
																			)
																		if (newNode) {
																			newNode.setSelected(true)
																			clockEventGridApi.ensureNodeVisible(
																				newNode,
																			)
																		}
																	}, 100)
																}
															}
														}
													})
												}
											}
										}
									})
								}
							}
						}
					})

					// Update main rowData if timesheet was updated
					if (result.timesheet) {
						const updatedRowData = rowData.map((row) =>
							row.id === result.timesheet.id ? result.timesheet : row,
						)
						setRowData(updatedRowData)
					}
				}

				// Update selection to the newly created clock event
				setSelectedClockEvent(result.clockEvent)
				setSelectedRowLevel('clockevent')
				setSelectedRowData(result.clockEvent)
				setSelectedRowHasChildren(false) // Clock events have no children

				toast.success('Clock Event created successfully')
			} catch (error) {
				console.error('Failed to create Clock Event:', error)
				toast.error('Failed to create Clock Event', {
					description:
						error instanceof Error
							? error.message
							: 'An unexpected error occurred',
				})
				throw error
			}
		},
		[rowData],
	)

	// Get contextual label for the add button
	const getAddButtonLabel = useCallback(() => {
		if (!selectedRowLevel) return 'ADD'

		switch (selectedRowLevel) {
			case 'timesheet':
				if (selectedRowExpanded) {
					return '+ ADD DTR'
				} else {
					return '+ ADD TIMESHEET'
				}
			case 'dtr':
				if (selectedRowExpanded) {
					return '+ ADD TIMELOG'
				} else {
					return '+ ADD DTR'
				}
			case 'timelog':
				if (selectedRowExpanded) {
					return '+ ADD CLOCK EVENT'
				} else {
					return '+ ADD TIMELOG'
				}
			case 'clockevent':
				return 'ADD' // Clock events can't have children
			default:
				return 'ADD'
		}
	}, [selectedRowLevel, selectedRowExpanded])

	// Handle contextual create - open the appropriate dialog based on context
	const handleContextualCreate = useCallback(() => {
		if (!selectedRowLevel) return

		switch (selectedRowLevel) {
			case 'timesheet':
				if (selectedRowExpanded && selectedRowData) {
					// Timesheet is expanded - open DTR add dialog for this timesheet
					setDtrAddDialogOpen(true)
				} else {
					// Timesheet is not expanded - open timesheet create dialog
					setCreateDialogOpen(true)
				}
				break
			case 'dtr':
				if (selectedRowExpanded && selectedRowData) {
					// DTR is expanded - open timelog add dialog for this DTR
					setTimelogAddDialogOpen(true)
				} else if (selectedRowData?.timesheetId) {
					// DTR is not expanded - open DTR add dialog for the parent timesheet
					setDtrAddDialogOpen(true)
				}
				break
			case 'timelog':
				if (selectedRowExpanded && selectedRowData) {
					// Timelog is expanded - open clock event add dialog for this timelog
					setClockEventAddDialogOpen(true)
				} else if (selectedRowData?.dtrId) {
					// Timelog is not expanded - open timelog add dialog for the parent DTR
					setTimelogAddDialogOpen(true)
				}
				break
			default:
				return
		}
	}, [selectedRowLevel, selectedRowExpanded, selectedRowData])

	// Show delete confirmation dialog
	const showDeleteConfirmation = useCallback(() => {
		if (!selectedRowLevel || !selectedRowData) return

		// Double-check - button should be disabled if has children
		if (selectedRowHasChildren) {
			toast.error('Cannot delete', {
				description: 'This record has child records and cannot be deleted',
			})
			return
		}

		// Set up the delete confirmation dialog
		let itemType = ''
		let itemDescription = ''

		switch (selectedRowLevel) {
			case 'timesheet':
				itemType = 'Timesheet'
				itemDescription = `Employee: ${selectedRowData.employeeName}, Period: ${selectedRowData.payPeriod}`
				break
			case 'dtr':
				itemType = 'DTR'
				itemDescription = `Date: ${new Date(selectedRowData.date).toLocaleDateString()}`
				break
			case 'timelog':
				itemType = 'Timelog'
				itemDescription = `Mode: ${selectedRowData.mode?.toUpperCase()}, Time: ${new Date(selectedRowData.timestamp).toLocaleString()}`
				break
			case 'clockevent':
				itemType = 'ClockEvent'
				itemDescription = `Time: ${new Date(selectedRowData.clockTime).toLocaleString()}`
				break
		}

		setDeleteItemType(itemType)
		setDeleteItemDescription(itemDescription)
		setDeleteConfirmOpen(true)
	}, [selectedRowLevel, selectedRowData, selectedRowHasChildren])

	// Handle the actual deletion after confirmation
	const handleConfirmDelete = useCallback(async () => {
		if (!selectedRowLevel || !selectedRowData) return

		try {
			// Proceed with deletion
			let endpoint = ''
			switch (selectedRowLevel) {
				case 'timesheet':
					endpoint = `/api/timesheets/${selectedRowData.id}`
					break
				case 'dtr':
					endpoint = `/api/dtrs/${selectedRowData.id}`
					break
				case 'timelog':
					endpoint = `/api/timelogs/${selectedRowData.id}`
					break
				case 'clockevent':
					endpoint = `/api/clockevents/${selectedRowData.id}`
					break
				default:
					return
			}

			const response = await fetch(endpoint, {
				method: 'DELETE',
			})

			if (!response.ok) {
				const errorText = await response.text()
				throw new Error(errorText || 'Failed to delete record')
			}

			const result = await response.json()

			// Update the UI based on what was deleted
			if (selectedRowLevel === 'timesheet') {
				// Remove from main grid
				setRowData(rowData.filter((r) => r.id !== selectedRowData.id))
			} else if (result.timesheet) {
				// Update timesheet totals
				const updatedRowData = rowData.map((row) =>
					row.id === result.timesheet.id ? result.timesheet : row,
				)
				setRowData(updatedRowData)
			}

			toast.success('Record deleted successfully', {
				description: `${deleteItemType} has been deleted`,
			})
			setSelectedRowData(null)
			setSelectedRowLevel(null)
			setSelectedRowHasChildren(false)
			setSelectedTimesheet(null)
			setSelectedDTR(null)
			setSelectedTimelog(null)
			setSelectedClockEvent(null)
		} catch (error) {
			console.error('Failed to delete record:', error)
			toast.error('Failed to delete record', {
				description:
					error instanceof Error
						? error.message
						: 'An unexpected error occurred',
			})
		}
	}, [selectedRowLevel, selectedRowData, rowData])

	// Handle cancel delete
	const handleCancelDelete = useCallback(() => {
		setDeleteConfirmOpen(false)
		setDeleteItemType('')
		setDeleteItemDescription('')
	}, [])

	// Handle row selection to track context and check for children
	const onRowClicked = useCallback(async (event: any) => {
		if (event.data) {
			console.log('Row clicked:', event.data)
			setSelectedRowData(event.data)

			// Check if this row is expanded
			setSelectedRowExpanded(event.node?.expanded || false)

			// Check for children and update state
			let hasChildren = false

			// Determine the level and update appropriate selection
			// Clear deeper levels when selecting a higher level
			if ('employeeName' in event.data) {
				console.log('Selected level: timesheet')
				setSelectedRowLevel('timesheet')
				setSelectedTimesheet(event.data as Timesheet)
				// Clear deeper selections
				setSelectedDTR(null)
				setSelectedTimelog(null)
				setSelectedClockEvent(null)

				// Check if timesheet has DTRs
				try {
					const response = await fetch(`/api/timesheets/${event.data.id}/dtrs`)
					if (response.ok) {
						const data = await response.json()
						hasChildren = data.dtrs && data.dtrs.length > 0
					}
				} catch (error) {
					console.error('Error checking for DTRs:', error)
				}
			} else if ('date' in event.data) {
				console.log('Selected level: dtr')
				setSelectedRowLevel('dtr')
				setSelectedDTR(event.data as DTR)
				// Clear deeper selections
				setSelectedTimelog(null)
				setSelectedClockEvent(null)

				// Check if DTR has Timelogs
				try {
					const response = await fetch(`/api/dtrs/${event.data.id}/timelogs`)
					if (response.ok) {
						const data = await response.json()
						console.log('DTR timelogs check:', {
							dtrId: event.data.id,
							timelogs: data.timelogs,
							length: data.timelogs?.length,
							hasChildren: data.timelogs && data.timelogs.length > 0,
						})
						hasChildren = data.timelogs && data.timelogs.length > 0
					}
				} catch (error) {
					console.error('Error checking for timelogs:', error)
				}
			} else if ('mode' in event.data) {
				console.log('Selected level: timelog')
				setSelectedRowLevel('timelog')
				setSelectedTimelog(event.data as Timelog)
				// Clear deeper selection
				setSelectedClockEvent(null)

				// Check if Timelog has ClockEvents
				try {
					const response = await fetch(
						`/api/timelogs/${event.data.id}/clockevents`,
					)
					if (response.ok) {
						const data = await response.json()
						hasChildren = data.clockEvents && data.clockEvents.length > 0
					}
				} catch (error) {
					console.error('Error checking for clock events:', error)
				}
			} else if ('clockTime' in event.data) {
				console.log('Selected level: clockevent')
				setSelectedRowLevel('clockevent')
				setSelectedClockEvent(event.data as ClockEvent)
				// ClockEvents have no children
				hasChildren = false
			} else {
				console.log('Selected level: unknown')
				setSelectedRowLevel(null)
			}

			// Update the has children state
			console.log(
				'Setting selectedRowHasChildren:',
				hasChildren,
				'for level:',
				selectedRowLevel,
			)
			setSelectedRowHasChildren(hasChildren)
		}
	}, [])

	return (
		<div className="container mx-auto px-4 py-8">
			<div className="mb-6">
				<div className="flex items-center justify-between">
					<div>
						<h1 className="text-foreground text-3xl font-bold">
							Timesheet Management
						</h1>
						<p className="text-muted-foreground mt-2">
							View employee timesheets with daily time records. Click to select,
							double-click to edit.
						</p>
						{selectedRowLevel && (
							<p className="mt-1 text-sm text-blue-600 dark:text-blue-400">
								Selected:{' '}
								{selectedRowLevel === 'timesheet'
									? 'Timesheet'
									: selectedRowLevel === 'dtr'
										? 'DTR'
										: selectedRowLevel === 'timelog'
											? 'Timelog'
											: 'ClockEvent'}
								{selectedRowData && ' - ID: ' + selectedRowData.id}
							</p>
						)}
					</div>
					<div className="flex gap-2">
						<Button
							onClick={() => setCreateDialogOpen(true)}
							className="flex items-center gap-2"
						>
							<Icon name="plus" className="h-4 w-4" />
							Create Timesheet
						</Button>
						<Button
							onClick={handleContextualCreate}
							variant="secondary"
							className="flex items-center gap-2"
							disabled={!selectedRowLevel || selectedRowLevel === 'clockevent'}
							title={
								!selectedRowLevel
									? 'Select a row first'
									: selectedRowLevel === 'clockevent'
										? 'Cannot add child to ClockEvent'
										: selectedRowExpanded
											? `Add child to ${selectedRowLevel}`
											: `Add sibling ${selectedRowLevel}`
							}
						>
							{getAddButtonLabel()}
						</Button>
						<Button
							onClick={showDeleteConfirmation}
							variant="destructive"
							className="flex items-center gap-2"
							disabled={!selectedRowData || selectedRowHasChildren}
							title={
								!selectedRowData
									? 'Select a row first'
									: selectedRowHasChildren
										? 'Cannot delete: record has child records'
										: ''
							}
						>
							<Icon name="trash" className="h-4 w-4" />
							DELETE
						</Button>
					</div>
				</div>
			</div>

			<div className="border-border bg-card rounded-lg border shadow-sm">
				<div
					className={`${gridThemeClass} h-[700px] w-full`}
					style={
						theme === 'dark'
							? ({
									'--ag-background-color': '#1f2937',
									'--ag-foreground-color': '#f3f4f6',
									'--ag-header-background-color': '#111827',
									'--ag-header-foreground-color': '#f3f4f6',
									'--ag-odd-row-background-color': 'rgba(255, 255, 255, 0.02)',
									'--ag-row-hover-color': 'rgba(255, 255, 255, 0.05)',
									'--ag-border-color': '#374151',
								} as React.CSSProperties)
							: {}
					}
				>
					<AgGridReact
						ref={gridRef}
						rowData={rowData}
						columnDefs={columnDefs}
						defaultColDef={defaultColDef}
						masterDetail={true}
						detailCellRenderer={'agDetailCellRenderer'}
						detailCellRendererParams={detailCellRendererParams}
						detailRowHeight={400}
						embedFullWidthRows={true}
						isRowMaster={(dataItem) => true} // All timesheets can have DTRs
						animateRows={true}
						rowSelection="single"
						suppressRowClickSelection={false}
						pagination={true}
						paginationPageSize={10}
						paginationPageSizeSelector={[10, 20, 50, 100]}
						enableRangeSelection={true}
						getRowId={(params) => params.data.id}
						onRowDoubleClicked={onRowDoubleClicked}
						onRowGroupOpened={onRowGroupOpened}
						onRowClicked={onRowClicked}
						sideBar={{
							toolPanels: ['columns', 'filters'],
							defaultToolPanel: '',
						}}
					/>
				</div>
			</div>

			<TimesheetEditDialog
				open={editDialogOpen}
				onOpenChange={setEditDialogOpen}
				timesheet={
					selectedTimesheet
						? {
								id: selectedTimesheet.id,
								employeeName: selectedTimesheet.employeeName,
								payPeriod: selectedTimesheet.payPeriod,
								detachment: selectedTimesheet.detachment,
								shift: selectedTimesheet.shift,
								regularHours: selectedTimesheet.regularHours,
								overtimeHours: selectedTimesheet.overtimeHours,
								nightDifferential: selectedTimesheet.nightDifferential,
							}
						: null
				}
				onSave={handleSaveTimesheet}
			/>

			<DTREditDialog
				open={dtrEditDialogOpen}
				onOpenChange={setDtrEditDialogOpen}
				dtr={
					selectedDTR
						? {
								id: selectedDTR.id,
								date:
									selectedDTR.date instanceof Date
										? selectedDTR.date.toISOString()
										: selectedDTR.date,
								regularHours: selectedDTR.regularHours,
								overtimeHours: selectedDTR.overtimeHours,
								nightDifferential: selectedDTR.nightDifferential,
							}
						: null
				}
				onSave={handleSaveDTR}
			/>

			<TimelogEditDialog
				open={timelogEditDialogOpen}
				onOpenChange={setTimelogEditDialogOpen}
				timelog={
					selectedTimelog
						? {
								id: selectedTimelog.id,
								mode: selectedTimelog.mode,
								timestamp:
									selectedTimelog.timestamp instanceof Date
										? selectedTimelog.timestamp.toISOString()
										: selectedTimelog.timestamp,
							}
						: null
				}
				onSave={handleSaveTimelog}
			/>

			<ClockEventEditDialog
				open={clockEventEditDialogOpen}
				onOpenChange={setClockEventEditDialogOpen}
				clockEvent={
					selectedClockEvent
						? {
								id: selectedClockEvent.id,
								clockTime:
									selectedClockEvent.clockTime instanceof Date
										? selectedClockEvent.clockTime.toISOString()
										: selectedClockEvent.clockTime,
							}
						: null
				}
				onSave={handleSaveClockEvent}
			/>

			<TimesheetCreateDialog
				open={createDialogOpen}
				onOpenChange={setCreateDialogOpen}
				onSave={handleCreateTimesheet}
			/>

			<DTRAddDialog
				open={dtrAddDialogOpen}
				onOpenChange={setDtrAddDialogOpen}
				timesheetId={
					selectedRowLevel === 'timesheet' && selectedRowData?.id
						? selectedRowData.id
						: selectedRowLevel === 'dtr' && selectedRowData?.timesheetId
							? selectedRowData.timesheetId
							: ''
				}
				onSave={(data) => {
					console.log('DTRAddDialog onSave called with:', data)
					return handleCreateDTR(data)
				}}
			/>

			<TimelogAddDialog
				open={timelogAddDialogOpen}
				onOpenChange={setTimelogAddDialogOpen}
				dtrId={
					selectedRowLevel === 'dtr' && selectedRowData?.id
						? selectedRowData.id
						: selectedRowLevel === 'timelog' && selectedRowData?.dtrId
							? selectedRowData.dtrId
							: ''
				}
				onSave={(data) => {
					console.log('TimelogAddDialog onSave called with:', data)
					return handleCreateTimelog(data)
				}}
			/>

			<ClockEventAddDialog
				open={clockEventAddDialogOpen}
				onOpenChange={setClockEventAddDialogOpen}
				timelogId={
					selectedRowLevel === 'timelog' && selectedRowData?.id
						? selectedRowData.id
						: ''
				}
				onSave={handleCreateClockEvent}
			/>

			<DeleteConfirmationDialog
				open={deleteConfirmOpen}
				onOpenChange={setDeleteConfirmOpen}
				itemType={deleteItemType}
				itemDescription={deleteItemDescription}
				onConfirm={handleConfirmDelete}
				onCancel={handleCancelDelete}
			/>
		</div>
	)
}

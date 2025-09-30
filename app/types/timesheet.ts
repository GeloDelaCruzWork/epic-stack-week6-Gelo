/**
 * TypeScript Type Definitions for Timesheet Management System
 */

import type { GridApi, RowNode, RowDoubleClickedEvent } from 'ag-grid-community'

// Database Models
export interface Timesheet_ {
	id: string
	employeeName: string
	payPeriod: string
	detachment: string
	shift: 'Day Shift' | 'Night Shift' | 'Mid Shift'
	regularHours: number
	overtimeHours: number
	nightDifferential: number
	createdAt: Date
	updatedAt: Date
	dtrs?: DTR_[]
}

export interface DTR_ {
	id: string
	date: Date
	regularHours: number
	overtimeHours: number
	nightDifferential: number
	createdAt: Date
	updatedAt: Date
	timesheetId: string
	timesheet?: Timesheet_
	timelogs?: Timelog_[]
}

export interface Timelog_ {
	id: string
	mode: 'in' | 'out'
	timestamp: Date
	createdAt: Date
	updatedAt: Date
	dtrId: string
	dtr?: DTR_
	clockEvents?: ClockEvent_[]
}

export interface ClockEvent_ {
	id: string
	clockTime: Date
	createdAt: Date
	updatedAt: Date
	timelogId: string
	timelog?: Timelog_
}

// API Response Types
export interface TimesheetLoaderData {
	timesheets: Timesheet_[]
}

export interface DTRApiResponse {
	dtrs: DTR_[]
}

export interface TimelogApiResponse {
	timelogs: Timelog_[]
}

export interface ClockEventApiResponse {
	clockEvents: ClockEvent_[]
}

export interface UpdateTimesheetResponse {
	timesheet: Timesheet_
}

export interface UpdateDTRResponse {
	dtr: DTR_
	timesheet: Timesheet_
}

export interface UpdateTimelogResponse {
	timelog: Timelog_
	dtr: DTR_
	timesheet: Timesheet_
}

export interface UpdateClockEventResponse {
	clockEvent: ClockEvent_
	timelog: Timelog_
	dtr: DTR_
	timesheet: Timesheet_
}

// Dialog Component Props
export interface TimesheetEditDialogProps {
	open: boolean
	onOpenChange: (open: boolean) => void
	timesheet: Timesheet_ | null
	onSave: (data: Timesheet_) => Promise<void>
}

export interface DTREditDialogProps {
	open: boolean
	onOpenChange: (open: boolean) => void
	dtr: DTRData | null
	onSave: (data: DTRData) => Promise<void>
}

export interface TimelogEditDialogProps {
	open: boolean
	onOpenChange: (open: boolean) => void
	timelog: TimelogData | null
	onSave: (data: TimelogData) => Promise<void>
}

export interface ClockEventEditDialogProps {
	open: boolean
	onOpenChange: (open: boolean) => void
	clockEvent: ClockEventData | null
	onSave: (data: ClockEventData) => Promise<void>
}

// Form Data Types
export interface DTRData {
	id: string
	date: string
	regularHours: number
	overtimeHours: number
	nightDifferential: number
}

export interface TimelogData {
	id: string
	mode: 'in' | 'out'
	timestamp: string
}

export interface ClockEventData {
	id: string
	clockTime: string
}

// Grid Event Types
export interface TimesheetRowDoubleClickedEvent extends RowDoubleClickedEvent {
	data: Timesheet_
	node: RowNode
}

export interface DTRRowDoubleClickedEvent extends RowDoubleClickedEvent {
	data: DTR_
	node: RowNode
}

export interface TimelogRowDoubleClickedEvent extends RowDoubleClickedEvent {
	data: Timelog_
	node: RowNode
}

export interface ClockEventRowDoubleClickedEvent extends RowDoubleClickedEvent {
	data: ClockEvent_
	node: RowNode
}

// Grid Configuration Types
export interface DetailCellRendererParams {
	detailGridOptions: {
		columnDefs: any[]
		defaultColDef: any
		headerHeight: number
		rowHeight: number
		domLayout?: string
		masterDetail?: boolean
		detailCellRenderer?: string
		detailCellRendererParams?: any
		detailRowHeight?: number
		isRowMaster?: (dataItem: any) => boolean
		onRowDoubleClicked?: (event: RowDoubleClickedEvent) => void
		onRowGroupOpened?: (event: any) => void
	}
	getDetailRowData: (params: any) => Promise<void>
}

// Calculation Types
export interface HoursCalculation {
	regularHours: number
	overtimeHours: number
	nightDifferential: number
}

export interface ValidationResult {
	isValid: boolean
	errors: ValidationError[]
}

export interface ValidationError {
	field: string
	message: string
	severity: 'error' | 'warning'
}

// State Management Types
export interface TimesheetPageState {
	rowData: Timesheet_[]
	editDialogOpen: boolean
	selectedTimesheet: Timesheet_ | null
	dtrEditDialogOpen: boolean
	selectedDTR: DTR_ | null
	timelogEditDialogOpen: boolean
	selectedTimelog: Timelog_ | null
	clockEventEditDialogOpen: boolean
	selectedClockEvent: ClockEvent_ | null
	expandedNodeId: string | null
}

// Utility Types
export type ShiftType = 'Day Shift' | 'Night Shift' | 'Mid Shift'

export interface DateRange {
	start: Date
	end: Date
}

export interface PayPeriod {
	period: string
	startDate: Date
	endDate: Date
	workingDays: number
}

// Error Types
export class TimesheetError extends Error {
	constructor(
		message: string,
		public code: string,
		public details?: any,
	) {
		super(message)
		this.name = 'TimesheetError'
	}
}

export class ValidationError extends Error {
	constructor(
		message: string,
		public field: string,
		public value: any,
	) {
		super(message)
		this.name = 'ValidationError'
	}
}

// Enum Types
export enum TimesheetStatus {
	DRAFT = 'DRAFT',
	SUBMITTED = 'SUBMITTED',
	APPROVED = 'APPROVED',
	REJECTED = 'REJECTED',
	PAID = 'PAID',
}

export enum ApprovalAction {
	APPROVE = 'APPROVE',
	REJECT = 'REJECT',
	REQUEST_REVISION = 'REQUEST_REVISION',
}

// Export all types
export type { GridApi, RowNode }

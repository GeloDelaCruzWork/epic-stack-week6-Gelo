// Slide dialog for editing an employee
import * as React from 'react'
import {
	SlideDialog,
	SlideDialogContent,
	SlideDialogHeader,
	SlideDialogFooter,
	SlideDialogTitle,
	SlideDialogOverlay,
	SlideDialogClose,
} from './ui/slide-dialog'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from './ui/select'

interface EmployeeEditDialogProps {
	open: boolean
	onClose: () => void
	employee: any
	onEmployeeEdited: (employee: any) => void
}

export const EmployeeEditDialog: React.FC<EmployeeEditDialogProps> = ({
	open,
	onClose,
	employee,
	onEmployeeEdited,
}) => {
	const getPrimaryAssignment = (employee: any) => {
		if (!employee?.assignments) return {}
		const primary = employee.assignments.find((a: any) => a.isPrimary)
		return primary || {}
	}

	const [form, setForm] = React.useState(() => {
		const primary = getPrimaryAssignment(employee)
		return {
			id: employee?.id || '',
			employee_no: employee?.employee_no || '',
			first_name: employee?.first_name || '',
			middle_name: employee?.middle_name || '',
			last_name: employee?.last_name || '',
			email: employee?.email || '',
			department_id: primary.department_id || '',
			position_id: primary.position_id || '',
			hire_date: employee?.hire_date
				? new Date(employee.hire_date).toISOString().slice(0, 10)
				: '',
			employee_type: employee?.employee_type || '',
			employment_status: employee?.employment_status || '',
			company_id: employee?.company_id || 'default',
		}
	})
	const [loading, setLoading] = React.useState(false)
	const [departmentOptions, setDepartmentOptions] = React.useState<
		{ value: string; label: string }[]
	>([])
	const [positionOptions, setPositionOptions] = React.useState<
		{ value: string; label: string }[]
	>([])
	const [employeeTypeOptions, setEmployeeTypeOptions] = React.useState<
		string[]
	>([])

	React.useEffect(() => {
		const primary = getPrimaryAssignment(employee)
		setForm({
			id: employee?.id || '',
			employee_no: employee?.employee_no || '',
			first_name: employee?.first_name || '',
			middle_name: employee?.middle_name || '',
			last_name: employee?.last_name || '',
			email: employee?.email || '',
			department_id: primary.department_id || '',
			position_id: primary.position_id || '',
			hire_date: employee?.hire_date
				? new Date(employee.hire_date).toISOString().slice(0, 10)
				: '',
			employee_type: employee?.employee_type || '',
			employment_status: employee?.employment_status || '',
			company_id: employee?.company_id || 'default',
		})
	}, [employee])

	React.useEffect(() => {
		fetch('/api/employees/departments')
			.then((res) => res.json())
			.then((data) =>
				setDepartmentOptions(
					(data as Array<{ id: string; name: string }>).map((d) => ({
						value: d.id,
						label: d.name,
					})),
				),
			)
		fetch('/api/employees/positions')
			.then((res) => res.json())
			.then((data) =>
				setPositionOptions(
					(data as Array<{ id: string; name: string }>).map((p) => ({
						value: p.id,
						label: p.name,
					})),
				),
			)
		fetch('/api/employees/employee-types')
			.then((res) => res.json())
			.then((data) => setEmployeeTypeOptions(data as string[]))
	}, [])

	const handleChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
	) => {
		setForm({ ...form, [e.target.name]: e.target.value })
	}

	const handleSelectChange = (name: string, value: string) => {
		setForm({ ...form, [name]: value })
	}

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		setLoading(true)
		// Validate required fields
		const required = [
			'id',
			'employee_no',
			'first_name',
			'last_name',
			'email',
			'department_id',
			'position_id',
			'hire_date',
			'employee_type',
			'employment_status',
			'company_id',
		]
		for (const key of required) {
			if (!form[key]) {
				alert('All fields are required')
				setLoading(false)
				return
			}
		}
		try {
			const payload = {
				...form,
				department_id: form.department_id,
				position_id: form.position_id,
			}
			const res = await fetch('/api/employees/edit', {
				method: 'POST',
				body: JSON.stringify(payload),
				headers: { 'Content-Type': 'application/json' },
			})
			const result = await res.json()
			if (result.success) {
				onEmployeeEdited(result.employee)
				onClose()
			} else {
				alert(result.error || 'Failed to update employee')
			}
		} finally {
			setLoading(false)
		}
	}

	return (
		<SlideDialog
			open={open}
			onOpenChange={(open) => (!open ? onClose() : undefined)}
		>
			<SlideDialogContent width="max-w-2xl">
				<SlideDialogHeader>
					<SlideDialogTitle>Edit Employee</SlideDialogTitle>
				</SlideDialogHeader>
				<form onSubmit={handleSubmit} className="space-y-4 p-4">
					<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
						<div className="space-y-2">
							<Label htmlFor="employee_no">Employee Code</Label>
							<Input
								id="employee_no"
								name="employee_no"
								value={form.employee_no}
								onChange={handleChange}
								placeholder="Employee Code"
								required
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="hire_date">Hire Date</Label>
							<Input
								id="hire_date"
								name="hire_date"
								type="date"
								value={form.hire_date}
								onChange={handleChange}
								required
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="first_name">First Name</Label>
							<Input
								id="first_name"
								name="first_name"
								value={form.first_name}
								onChange={handleChange}
								placeholder="First Name"
								required
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="last_name">Last Name</Label>
							<Input
								id="last_name"
								name="last_name"
								value={form.last_name}
								onChange={handleChange}
								placeholder="Last Name"
								required
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="middle_name">Middle Name</Label>
							<Input
								id="middle_name"
								name="middle_name"
								value={form.middle_name}
								onChange={handleChange}
								placeholder="Middle Name"
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="email">Email</Label>
							<Input
								id="email"
								name="email"
								type="email"
								value={form.email}
								onChange={handleChange}
								placeholder="Email"
								required
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="department_id">Department</Label>
							<Select
								name="department_id"
								value={form.department_id}
								onValueChange={(value) =>
									handleSelectChange('department_id', value)
								}
								required
							>
								<SelectTrigger>
									<SelectValue placeholder="Select Department" />
								</SelectTrigger>
								<SelectContent>
									{departmentOptions.map((opt) => (
										<SelectItem key={opt.value} value={opt.value}>
											{opt.label}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
						<div className="space-y-2">
							<Label htmlFor="position_id">Position</Label>
							<Select
								name="position_id"
								value={form.position_id}
								onValueChange={(value) =>
									handleSelectChange('position_id', value)
								}
								required
							>
								<SelectTrigger>
									<SelectValue placeholder="Select Position" />
								</SelectTrigger>
								<SelectContent>
									{positionOptions.map((opt) => (
										<SelectItem key={opt.value} value={opt.value}>
											{opt.label}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
						<div className="space-y-2">
							<Label htmlFor="employee_type">Employee Type</Label>
							<Select
								name="employee_type"
								value={form.employee_type}
								onValueChange={(value) =>
									handleSelectChange('employee_type', value)
								}
								required
							>
								<SelectTrigger>
									<SelectValue placeholder="Select Type" />
								</SelectTrigger>
								<SelectContent>
									{employeeTypeOptions.map((type) => (
										<SelectItem key={type} value={type}>
											{type}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
						<div className="space-y-2">
							<Label htmlFor="employment_status">Employment Status</Label>
							<Select
								name="employment_status"
								value={form.employment_status}
								onValueChange={(value) =>
									handleSelectChange('employment_status', value)
								}
								required
							>
								<SelectTrigger>
									<SelectValue placeholder="Select Status" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="ACTIVE">Active</SelectItem>
									<SelectItem value="INACTIVE">Inactive</SelectItem>
								</SelectContent>
							</Select>
						</div>
					</div>
					<SlideDialogFooter className="gap-2">
						<Button type="submit" disabled={loading}>
							{loading ? 'Saving...' : 'Save Changes'}
						</Button>
						<SlideDialogClose asChild>
							<Button type="button" variant="outline" onClick={onClose}>
								Cancel
							</Button>
						</SlideDialogClose>
					</SlideDialogFooter>
				</form>
			</SlideDialogContent>
		</SlideDialog>
	)
}

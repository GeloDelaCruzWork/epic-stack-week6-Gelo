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
import { Checkbox } from './ui/checkbox'

interface EmployeeAssignAddDialogProps {
	open: boolean
	onClose: () => void
	onAssignmentAdded: (assignment: any) => void
	employeeId: string
}

export const EmployeeAssignAddDialog: React.FC<
	EmployeeAssignAddDialogProps
> = ({ open, onClose, onAssignmentAdded, employeeId }) => {
	const [form, setForm] = React.useState({
		effective_from: '',
		effective_to: '',
		department_id: '',
		position_id: '',
		location_id: '',
		assignment_type: 'DEPARTMENT',
		employee_type: '',
		isPrimary: false,
		remarks: '',
	})
	const [loading, setLoading] = React.useState(false)
	const [departmentOptions, setDepartmentOptions] = React.useState<
		{ value: string; label: string }[]
	>([])
	const [positionOptions, setPositionOptions] = React.useState<
		{ value: string; label: string }[]
	>([])
	const [locationOptions, setLocationOptions] = React.useState<
		{ value: string; label: string }[]
	>([])
	const [employeeTypeOptions, setEmployeeTypeOptions] = React.useState<
		string[]
	>([])

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
		fetch('/api/employees/locations')
			.then((res) => res.json())
			.then((data) =>
				setLocationOptions(
					(data as Array<{ id: string; name: string }>).map((l) => ({
						value: l.id,
						label: l.name,
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
		const { name, value, type } = e.target
		if (type === 'checkbox') {
			setForm({ ...form, [name]: (e.target as HTMLInputElement).checked })
		} else {
			setForm({ ...form, [name]: value })
		}
	}

	const handleSelectChange = (name: string, value: string) => {
		setForm({ ...form, [name]: value })
	}

	const handleCheckboxChange = (name: string, checked: boolean) => {
		setForm({ ...form, [name]: checked })
	}

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		setLoading(true)
		try {
			const res = await fetch('/api/employees/assignments/create', {
				method: 'POST',
				body: JSON.stringify({ ...form, employee_id: employeeId }),
				headers: { 'Content-Type': 'application/json' },
			})
			const result = await res.json()
			if ((result as any).success) {
				onAssignmentAdded((result as any).assignment)
				onClose()
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
					<SlideDialogTitle>Add Assignment</SlideDialogTitle>
				</SlideDialogHeader>
				<form onSubmit={handleSubmit} className="space-y-4 p-4">
					<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
						<div className="space-y-2">
							<Label htmlFor="effective_from">Effective From</Label>
							<Input
								id="effective_from"
								name="effective_from"
								type="date"
								value={form.effective_from}
								onChange={handleChange}
								required
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="effective_to">Effective To</Label>
							<Input
								id="effective_to"
								name="effective_to"
								type="date"
								value={form.effective_to}
								onChange={handleChange}
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
							<Label htmlFor="location_id">Location</Label>
							<Select
								name="location_id"
								value={form.location_id}
								onValueChange={(value) =>
									handleSelectChange('location_id', value)
								}
							>
								<SelectTrigger>
									<SelectValue placeholder="Select Location" />
								</SelectTrigger>
								<SelectContent>
									{locationOptions.map((opt) => (
										<SelectItem key={opt.value} value={opt.value}>
											{opt.label}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
						<div className="space-y-2">
							<Label htmlFor="assignment_type">Assignment Type</Label>
							<Select
								name="assignment_type"
								value={form.assignment_type}
								onValueChange={(value) =>
									handleSelectChange('assignment_type', value)
								}
								required
							>
								<SelectTrigger>
									<SelectValue placeholder="Select Assignment Type" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="DEPARTMENT">Department</SelectItem>
									<SelectItem value="LOCATION">Location</SelectItem>
									<SelectItem value="PROJECT">Project</SelectItem>
									<SelectItem value="CLIENT">Client</SelectItem>
								</SelectContent>
							</Select>
						</div>
						<div className="space-y-2 md:col-span-2">
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
									<SelectValue placeholder="Select Employee Type" />
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
						<div className="space-y-2 md:col-span-2">
							<Label htmlFor="remarks">Remarks</Label>
							<Input
								id="remarks"
								name="remarks"
								value={form.remarks}
								onChange={handleChange}
								placeholder="Remarks"
							/>
						</div>
						<div className="flex items-center space-x-2 md:col-span-2">
							<Checkbox
								id="isPrimary"
								name="isPrimary"
								checked={form.isPrimary}
								onCheckedChange={(checked) =>
									handleCheckboxChange('isPrimary', !!checked)
								}
							/>
							<Label
								htmlFor="isPrimary"
								className="text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
							>
								Set as Primary Assignment
							</Label>
						</div>
					</div>
					<SlideDialogFooter className="gap-2">
						<Button type="submit" disabled={loading}>
							{loading ? 'Adding...' : 'Add Assignment'}
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

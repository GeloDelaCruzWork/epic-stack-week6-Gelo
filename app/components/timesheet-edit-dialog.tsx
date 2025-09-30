import { useState, useEffect } from 'react'
import {
	SlideDialog,
	SlideDialogContent,
	SlideDialogHeader,
	SlideDialogTitle,
	SlideDialogFooter,
	SlideDialogClose,
} from '#app/components/ui/slide-dialog.tsx'
import { Button } from '#app/components/ui/button.tsx'
import { Input } from '#app/components/ui/input.tsx'
import { Label } from '#app/components/ui/label.tsx'
import { Icon } from '#app/components/ui/icon.tsx'

export interface TimesheetData {
	id: string
	employeeName: string
	payPeriod: string
	detachment: string
	shift: string
	regularHours: number
	overtimeHours: number
	nightDifferential: number
}

interface TimesheetEditDialogProps {
	open: boolean
	onOpenChange: (open: boolean) => void
	timesheet: TimesheetData | null
	onSave: (data: TimesheetData) => Promise<void>
}

export function TimesheetEditDialog({
	open,
	onOpenChange,
	timesheet,
	onSave,
}: TimesheetEditDialogProps) {
	const [formData, setFormData] = useState<TimesheetData | null>(null)
	const [isSaving, setIsSaving] = useState(false)

	useEffect(() => {
		if (timesheet) {
			setFormData({ ...timesheet })
		}
	}, [timesheet])

	const handleSubmit = async (e?: React.FormEvent) => {
		e?.preventDefault()
		if (!formData) return

		setIsSaving(true)
		try {
			await onSave(formData)
			onOpenChange(false)
		} catch (error) {
			console.error('Failed to save timesheet:', error)
		} finally {
			setIsSaving(false)
		}
	}

	const handleInputChange = (
		field: keyof TimesheetData,
		value: string | number,
	) => {
		if (!formData) return
		setFormData({
			...formData,
			[field]:
				field === 'regularHours' ||
				field === 'overtimeHours' ||
				field === 'nightDifferential'
					? parseFloat(value as string) || 0
					: value,
		})
	}

	if (!formData) return null

	return (
		<SlideDialog open={open} onOpenChange={onOpenChange}>
			<SlideDialogContent className="p-0" width="max-w-2xl">
				<SlideDialogHeader className="border-b border-gray-200 dark:border-gray-800">
					<div className="flex items-center gap-3">
						<SlideDialogClose asChild>
							<Button variant="ghost" size="icon" className="h-8 w-8">
								<Icon name="arrow-right" className="h-4 w-4" />
								<span className="sr-only">Close</span>
							</Button>
						</SlideDialogClose>
						<SlideDialogTitle>Edit Timesheet Record</SlideDialogTitle>
					</div>
				</SlideDialogHeader>

				<form onSubmit={handleSubmit} className="space-y-4 p-6">
					<div className="grid grid-cols-2 gap-4">
						<div className="space-y-2">
							<Label htmlFor="employeeName">Employee Name</Label>
							<Input
								id="employeeName"
								value={formData.employeeName}
								onChange={(e) =>
									handleInputChange('employeeName', e.target.value)
								}
								placeholder="Last Name, First Name"
								required
							/>
						</div>

						<div className="space-y-2">
							<Label htmlFor="payPeriod">Pay Period</Label>
							<Input
								id="payPeriod"
								value={formData.payPeriod}
								onChange={(e) => handleInputChange('payPeriod', e.target.value)}
								placeholder="e.g., January 1 to 15"
								required
							/>
						</div>

						<div className="space-y-2">
							<Label htmlFor="detachment">Detachment</Label>
							<Input
								id="detachment"
								value={formData.detachment}
								onChange={(e) =>
									handleInputChange('detachment', e.target.value)
								}
								placeholder="e.g., Diliman"
								required
							/>
						</div>

						<div className="space-y-2">
							<Label htmlFor="shift">Shift</Label>
							<select
								id="shift"
								value={formData.shift}
								onChange={(e) => handleInputChange('shift', e.target.value)}
								className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
								required
							>
								<option value="Day Shift">Day Shift</option>
								<option value="Night Shift">Night Shift</option>
								<option value="Mid Shift">Mid Shift</option>
							</select>
						</div>
					</div>

					<div className="grid grid-cols-3 gap-4">
						<div className="space-y-2">
							<Label htmlFor="regularHours">Regular Hours</Label>
							<Input
								id="regularHours"
								type="number"
								step="0.1"
								min="0"
								value={formData.regularHours}
								onChange={(e) =>
									handleInputChange('regularHours', e.target.value)
								}
								required
							/>
						</div>

						<div className="space-y-2">
							<Label htmlFor="overtimeHours">Overtime Hours</Label>
							<Input
								id="overtimeHours"
								type="number"
								step="0.1"
								min="0"
								value={formData.overtimeHours}
								onChange={(e) =>
									handleInputChange('overtimeHours', e.target.value)
								}
								required
							/>
						</div>

						<div className="space-y-2">
							<Label htmlFor="nightDifferential">Night Differential</Label>
							<Input
								id="nightDifferential"
								type="number"
								step="0.1"
								min="0"
								value={formData.nightDifferential}
								onChange={(e) =>
									handleInputChange('nightDifferential', e.target.value)
								}
								required
							/>
						</div>
					</div>
				</form>
				<SlideDialogFooter className="border-t border-gray-200 dark:border-gray-800">
					<Button
						type="button"
						variant="outline"
						onClick={() => onOpenChange(false)}
						disabled={isSaving}
					>
						Cancel
					</Button>
					<Button onClick={handleSubmit} disabled={isSaving}>
						{isSaving ? (
							<>
								<Icon name="update" className="mr-2 h-4 w-4 animate-spin" />
								Saving...
							</>
						) : (
							'Save Changes'
						)}
					</Button>
				</SlideDialogFooter>
			</SlideDialogContent>
		</SlideDialog>
	)
}

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

export interface DTRCreateData {
	timesheetId: string
	date: string
	regularHours: number
	overtimeHours: number
	nightDifferential: number
}

interface DTRAddDialogProps {
	open: boolean
	onOpenChange: (open: boolean) => void
	timesheetId: string
	onSave: (data: DTRCreateData) => Promise<void>
}

export function DTRAddDialog({
	open,
	onOpenChange,
	timesheetId,
	onSave,
}: DTRAddDialogProps) {
	const [formData, setFormData] = useState<DTRCreateData>({
		timesheetId,
		date: new Date().toISOString().split('T')[0],
		regularHours: 8,
		overtimeHours: 0,
		nightDifferential: 0,
	})
	const [isSaving, setIsSaving] = useState(false)

	// Update formData when timesheetId changes
	useEffect(() => {
		if (timesheetId) {
			setFormData((prev) => ({
				...prev,
				timesheetId: timesheetId,
			}))
			console.log('DTRAddDialog: Updated timesheetId to:', timesheetId)
		}
	}, [timesheetId])

	const handleSubmit = async (e?: React.FormEvent) => {
		e?.preventDefault()

		setIsSaving(true)
		try {
			await onSave(formData)
			onOpenChange(false)
			// Reset form for next use
			setFormData({
				timesheetId,
				date: new Date().toISOString().split('T')[0],
				regularHours: 8,
				overtimeHours: 0,
				nightDifferential: 0,
			})
		} catch (error) {
			console.error('Failed to create DTR:', error)
		} finally {
			setIsSaving(false)
		}
	}

	const handleInputChange = (
		field: keyof DTRCreateData,
		value: string | number,
	) => {
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

	return (
		<SlideDialog open={open} onOpenChange={onOpenChange}>
			<SlideDialogContent className="p-0" width="max-w-lg">
				<SlideDialogHeader className="border-b border-gray-200 dark:border-gray-800">
					<div className="flex items-center gap-3">
						<SlideDialogClose asChild>
							<Button variant="ghost" size="icon" className="h-8 w-8">
								<Icon name="arrow-right" className="h-4 w-4" />
								<span className="sr-only">Close</span>
							</Button>
						</SlideDialogClose>
						<SlideDialogTitle>Add Daily Time Record</SlideDialogTitle>
					</div>
				</SlideDialogHeader>
				<form onSubmit={handleSubmit} className="space-y-4 p-6">
					<div className="space-y-2">
						<Label htmlFor="date">Date</Label>
						<Input
							id="date"
							type="date"
							value={formData.date}
							onChange={(e) => handleInputChange('date', e.target.value)}
							required
						/>
					</div>
					<div className="space-y-2">
						<Label htmlFor="regularHours">Regular Hours</Label>
						<Input
							id="regularHours"
							type="number"
							step="0.5"
							min="0"
							max="24"
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
							step="0.5"
							min="0"
							max="24"
							value={formData.overtimeHours}
							onChange={(e) =>
								handleInputChange('overtimeHours', e.target.value)
							}
							required
						/>
					</div>
					<div className="space-y-2">
						<Label htmlFor="nightDifferential">Night Differential Hours</Label>
						<Input
							id="nightDifferential"
							type="number"
							step="0.5"
							min="0"
							max="24"
							value={formData.nightDifferential}
							onChange={(e) =>
								handleInputChange('nightDifferential', e.target.value)
							}
							required
						/>
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
								Creating...
							</>
						) : (
							'Create DTR'
						)}
					</Button>
				</SlideDialogFooter>
			</SlideDialogContent>
		</SlideDialog>
	)
}

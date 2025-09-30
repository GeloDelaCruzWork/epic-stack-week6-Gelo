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

export interface DTRData {
	id: string
	date: string
	regularHours: number
	overtimeHours: number
	nightDifferential: number
}

interface DTREditDialogProps {
	open: boolean
	onOpenChange: (open: boolean) => void
	dtr: DTRData | null
	onSave: (data: DTRData) => Promise<void>
}

export function DTREditDialog({
	open,
	onOpenChange,
	dtr,
	onSave,
}: DTREditDialogProps) {
	const [formData, setFormData] = useState<DTRData | null>(null)
	const [isSaving, setIsSaving] = useState(false)

	useEffect(() => {
		if (dtr) {
			setFormData({ ...dtr })
		}
	}, [dtr])

	const handleSubmit = async (e?: React.FormEvent) => {
		e?.preventDefault()
		if (!formData) return

		setIsSaving(true)
		try {
			await onSave(formData)
			onOpenChange(false)
		} catch (error) {
			console.error('Failed to save DTR:', error)
		} finally {
			setIsSaving(false)
		}
	}

	const handleInputChange = (field: keyof DTRData, value: string | number) => {
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

	const formatDate = (dateString: string) => {
		if (!dateString) return ''
		const date = new Date(dateString)
		return date.toLocaleDateString('en-US', {
			weekday: 'long',
			month: 'long',
			day: 'numeric',
			year: 'numeric',
		})
	}

	if (!formData) return null

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
						<SlideDialogTitle>Edit Daily Time Record</SlideDialogTitle>
					</div>
				</SlideDialogHeader>

				<form onSubmit={handleSubmit} className="space-y-4 p-6">
					<div className="grid grid-cols-1 gap-4">
						<div className="space-y-2">
							<Label htmlFor="date">Date</Label>
							<Input
								id="date"
								type="date"
								value={
									formData.date
										? new Date(formData.date).toISOString().split('T')[0]
										: ''
								}
								onChange={(e) => handleInputChange('date', e.target.value)}
								required
								className="w-full"
							/>
							<p className="text-muted-foreground text-xs">
								The date for this time record
							</p>
						</div>

						<div className="space-y-2">
							<Label htmlFor="regularHours">Regular Hours</Label>
							<Input
								id="regularHours"
								type="number"
								step="0.1"
								min="0"
								max="24"
								value={formData.regularHours}
								onChange={(e) =>
									handleInputChange('regularHours', e.target.value)
								}
								required
							/>
							<p className="text-muted-foreground text-xs">
								Standard working hours for this day
							</p>
						</div>

						<div className="space-y-2">
							<Label htmlFor="overtimeHours">Overtime Hours</Label>
							<Input
								id="overtimeHours"
								type="number"
								step="0.1"
								min="0"
								max="24"
								value={formData.overtimeHours}
								onChange={(e) =>
									handleInputChange('overtimeHours', e.target.value)
								}
								required
							/>
							<p className="text-muted-foreground text-xs">
								Hours worked beyond regular schedule
							</p>
						</div>

						<div className="space-y-2">
							<Label htmlFor="nightDifferential">
								Night Differential Hours
							</Label>
							<Input
								id="nightDifferential"
								type="number"
								step="0.1"
								min="0"
								max="24"
								value={formData.nightDifferential}
								onChange={(e) =>
									handleInputChange('nightDifferential', e.target.value)
								}
								required
							/>
							<p className="text-muted-foreground text-xs">
								Hours worked during night shift (10 PM - 6 AM)
							</p>
						</div>
					</div>

					<div className="bg-muted/50 space-y-1 rounded-lg p-3">
						<div className="flex justify-between text-sm">
							<span className="text-muted-foreground">Total Hours:</span>
							<span className="font-semibold">
								{(formData.regularHours + formData.overtimeHours).toFixed(1)}{' '}
								hrs
							</span>
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

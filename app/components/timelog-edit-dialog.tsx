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

export interface TimelogData {
	id: string
	mode: 'in' | 'out'
	timestamp: string
}

interface TimelogEditDialogProps {
	open: boolean
	onOpenChange: (open: boolean) => void
	timelog: TimelogData | null
	onSave: (data: TimelogData) => Promise<void>
}

export function TimelogEditDialog({
	open,
	onOpenChange,
	timelog,
	onSave,
}: TimelogEditDialogProps) {
	const [formData, setFormData] = useState<TimelogData | null>(null)
	const [isSaving, setIsSaving] = useState(false)
	const [date, setDate] = useState('')
	const [time, setTime] = useState('')

	useEffect(() => {
		if (timelog) {
			setFormData({ ...timelog })
			// Parse the timestamp into date and time
			const timestamp = new Date(timelog.timestamp)
			// Format date as YYYY-MM-DD for input[type="date"]
			const year = timestamp.getFullYear()
			const month = String(timestamp.getMonth() + 1).padStart(2, '0')
			const day = String(timestamp.getDate()).padStart(2, '0')
			setDate(`${year}-${month}-${day}`)

			// Format time as HH:MM for input[type="time"]
			const hours = String(timestamp.getHours()).padStart(2, '0')
			const minutes = String(timestamp.getMinutes()).padStart(2, '0')
			setTime(`${hours}:${minutes}`)
		}
	}, [timelog])

	const handleSubmit = async (e?: React.FormEvent) => {
		e?.preventDefault()
		if (!formData) return

		setIsSaving(true)
		try {
			// Combine date and time into a single timestamp
			const timestamp = new Date(`${date}T${time}:00`).toISOString()
			const updatedData = {
				...formData,
				timestamp,
			}
			await onSave(updatedData)
			onOpenChange(false)
		} catch (error) {
			console.error('Failed to save timelog:', error)
		} finally {
			setIsSaving(false)
		}
	}

	const handleModeChange = (mode: 'in' | 'out') => {
		if (!formData) return
		setFormData({
			...formData,
			mode,
		})
	}

	const formatDisplayDateTime = () => {
		if (!formData?.timestamp) return ''
		const timestamp = new Date(formData.timestamp)
		return timestamp.toLocaleString('en-US', {
			weekday: 'long',
			month: 'long',
			day: 'numeric',
			year: 'numeric',
			hour: '2-digit',
			minute: '2-digit',
			second: '2-digit',
			hour12: true,
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
						<div>
							<SlideDialogTitle>Edit Time Log Entry</SlideDialogTitle>
							<p className="text-muted-foreground mt-1 text-sm">
								Current: {formatDisplayDateTime()}
							</p>
						</div>
					</div>
				</SlideDialogHeader>

				<form onSubmit={handleSubmit} className="space-y-4 p-6">
					<div className="space-y-4">
						<div className="space-y-2">
							<Label>Log Type</Label>
							<div className="grid grid-cols-2 gap-2">
								<Button
									type="button"
									variant={formData.mode === 'in' ? 'default' : 'outline'}
									onClick={() => handleModeChange('in')}
									className={
										formData.mode === 'in'
											? 'bg-green-600 hover:bg-green-700'
											: ''
									}
								>
									<Icon name="arrow-right" className="mr-2 h-4 w-4" />
									TIME IN
								</Button>
								<Button
									type="button"
									variant={formData.mode === 'out' ? 'default' : 'outline'}
									onClick={() => handleModeChange('out')}
									className={
										formData.mode === 'out' ? 'bg-red-600 hover:bg-red-700' : ''
									}
								>
									<Icon name="arrow-left" className="mr-2 h-4 w-4" />
									TIME OUT
								</Button>
							</div>
						</div>

						<div className="space-y-2">
							<Label htmlFor="date">Date</Label>
							<Input
								id="date"
								type="date"
								value={date}
								onChange={(e) => setDate(e.target.value)}
								required
							/>
						</div>

						<div className="space-y-2">
							<Label htmlFor="time">Time</Label>
							<Input
								id="time"
								type="time"
								step="1"
								value={time}
								onChange={(e) => setTime(e.target.value)}
								required
							/>
							<p className="text-muted-foreground text-xs">
								24-hour format (HH:MM)
							</p>
						</div>
					</div>

					<div className="bg-muted/50 rounded-lg p-3">
						<div className="flex items-center gap-2 text-sm">
							<Icon
								name={formData.mode === 'in' ? 'arrow-right' : 'arrow-left'}
								className={`h-4 w-4 ${formData.mode === 'in' ? 'text-green-500' : 'text-red-500'}`}
							/>
							<span className="text-muted-foreground">
								This is a{' '}
								<span className="font-semibold">
									{formData.mode === 'in' ? 'TIME IN' : 'TIME OUT'}
								</span>{' '}
								entry
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

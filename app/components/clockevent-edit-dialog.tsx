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
import { toast } from 'sonner'

export interface ClockEventData {
	id: string
	clockTime: string
}

interface ClockEventEditDialogProps {
	open: boolean
	onOpenChange: (open: boolean) => void
	clockEvent: ClockEventData | null
	onSave: (data: ClockEventData) => Promise<void>
}

export function ClockEventEditDialog({
	open,
	onOpenChange,
	clockEvent,
	onSave,
}: ClockEventEditDialogProps) {
	const [formData, setFormData] = useState<ClockEventData | null>(null)
	const [isSaving, setIsSaving] = useState(false)
	const [date, setDate] = useState('')
	const [time, setTime] = useState('')
	const [seconds, setSeconds] = useState('')

	useEffect(() => {
		if (clockEvent) {
			setFormData({ ...clockEvent })
			// Parse the clockTime into date, time, and seconds
			const timestamp = new Date(clockEvent.clockTime)

			// Format date as YYYY-MM-DD for input[type="date"]
			const year = timestamp.getFullYear()
			const month = String(timestamp.getMonth() + 1).padStart(2, '0')
			const day = String(timestamp.getDate()).padStart(2, '0')
			setDate(`${year}-${month}-${day}`)

			// Format time as HH:MM for input[type="time"]
			const hours = String(timestamp.getHours()).padStart(2, '0')
			const minutes = String(timestamp.getMinutes()).padStart(2, '0')
			setTime(`${hours}:${minutes}`)

			// Get seconds
			const secs = String(timestamp.getSeconds()).padStart(2, '0')
			setSeconds(secs)
		}
	}, [clockEvent])

	const handleSubmit = async (e?: React.FormEvent) => {
		e?.preventDefault()
		if (!formData || !date || !time) return

		setIsSaving(true)
		try {
			// Ensure seconds is properly formatted (default to "00" if empty)
			const formattedSeconds = (seconds || '00').padStart(2, '0')

			// Check if time already includes seconds (HH:MM:SS format)
			let timeString = time
			if (time.split(':').length === 3) {
				// Time already has seconds, replace them
				const [hours, minutes] = time.split(':')
				timeString = `${hours}:${minutes}`
			}

			// Combine date, time, and seconds into a single timestamp
			const dateTimeString = `${date}T${timeString}:${formattedSeconds}`
			console.log('Creating timestamp from:', dateTimeString)

			const parsedDate = new Date(dateTimeString)
			if (isNaN(parsedDate.getTime())) {
				throw new Error(`Invalid date/time: ${dateTimeString}`)
			}

			const clockTime = parsedDate.toISOString()
			const updatedData = {
				...formData,
				clockTime,
			}

			console.log('Saving clock event with data:', updatedData)
			await onSave(updatedData)
			onOpenChange(false)
		} catch (error) {
			console.error('Failed to save clock event:', error)
			toast.error('Failed to save clock event', {
				description:
					error instanceof Error ? error.message : 'An unknown error occurred',
			})
		} finally {
			setIsSaving(false)
		}
	}

	const formatDisplayDateTime = () => {
		if (!formData?.clockTime) return ''
		const timestamp = new Date(formData.clockTime)
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

	const formatPunchTime = () => {
		if (!date || !time || !seconds) return 'Invalid time'
		try {
			const timestamp = new Date(`${date}T${time}:${seconds}`)
			return timestamp.toLocaleString('en-US', {
				weekday: 'short',
				month: 'short',
				day: 'numeric',
				year: 'numeric',
				hour: '2-digit',
				minute: '2-digit',
				second: '2-digit',
				hour12: true,
			})
		} catch {
			return 'Invalid time'
		}
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
							<SlideDialogTitle>Edit Clock Punch Time</SlideDialogTitle>
							<p className="text-muted-foreground mt-1 text-sm">
								Current: {formatDisplayDateTime()}
							</p>
						</div>
					</div>
				</SlideDialogHeader>

				<form onSubmit={handleSubmit} className="space-y-4 p-6">
					<div className="space-y-4">
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

						<div className="grid grid-cols-2 gap-4">
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

							<div className="space-y-2">
								<Label htmlFor="seconds">Seconds</Label>
								<Input
									id="seconds"
									type="number"
									min="0"
									max="59"
									value={seconds}
									onChange={(e) => {
										const val = parseInt(e.target.value) || 0
										if (val >= 0 && val <= 59) {
											setSeconds(String(val).padStart(2, '0'))
										}
									}}
									required
								/>
								<p className="text-muted-foreground text-xs">0-59 seconds</p>
							</div>
						</div>
					</div>

					<div className="bg-muted/50 space-y-2 rounded-lg p-4">
						<div className="flex items-center gap-2">
							<Icon name="clock" className="text-primary h-5 w-5" />
							<span className="font-semibold">Clock Punch Time Preview</span>
						</div>
						<p className="text-muted-foreground pl-7 font-mono text-sm">
							{formatPunchTime()}
						</p>
					</div>

					<div className="rounded-lg border border-amber-200 bg-amber-50 p-3 dark:border-amber-800 dark:bg-amber-950/20">
						<div className="flex gap-2">
							<Icon
								name="question-mark-circled"
								className="mt-0.5 h-4 w-4 text-amber-600 dark:text-amber-500"
							/>
							<div className="text-sm text-amber-800 dark:text-amber-200">
								<p className="font-semibold">Important</p>
								<p className="mt-1 text-xs">
									Modifying clock punch times affects attendance records. Ensure
									changes are accurate and authorized.
								</p>
							</div>
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

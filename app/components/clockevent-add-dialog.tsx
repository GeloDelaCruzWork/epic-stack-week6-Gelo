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

export interface ClockEventCreateData {
	timelogId: string
	clockTime: string
}

interface ClockEventAddDialogProps {
	open: boolean
	onOpenChange: (open: boolean) => void
	timelogId: string
	onSave: (data: ClockEventCreateData) => Promise<void>
}

export function ClockEventAddDialog({
	open,
	onOpenChange,
	timelogId,
	onSave,
}: ClockEventAddDialogProps) {
	const now = new Date()
	const [date, setDate] = useState(now.toISOString().split('T')[0])
	const [time, setTime] = useState(now.toTimeString().slice(0, 5))
	const [seconds, setSeconds] = useState(
		now.getSeconds().toString().padStart(2, '0'),
	)
	const [isSaving, setIsSaving] = useState(false)

	// Update timelogId when it changes
	useEffect(() => {
		if (timelogId) {
			console.log('ClockEventAddDialog: timelogId set to:', timelogId)
		}
	}, [timelogId])

	const handleSubmit = async (e?: React.FormEvent) => {
		e?.preventDefault()

		setIsSaving(true)
		try {
			// Combine date, time, and seconds into ISO timestamp
			const clockTime = new Date(`${date}T${time}:${seconds}`).toISOString()
			await onSave({
				timelogId,
				clockTime,
			})
			onOpenChange(false)
			// Reset form for next use
			const newNow = new Date()
			setDate(newNow.toISOString().split('T')[0])
			setTime(newNow.toTimeString().slice(0, 5))
			setSeconds(newNow.getSeconds().toString().padStart(2, '0'))
		} catch (error) {
			console.error('Failed to create Clock Event:', error)
		} finally {
			setIsSaving(false)
		}
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
						<SlideDialogTitle>Add Clock Event</SlideDialogTitle>
					</div>
				</SlideDialogHeader>
				<form onSubmit={handleSubmit} className="space-y-4 p-6">
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
								value={time}
								onChange={(e) => setTime(e.target.value)}
								required
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="seconds">Seconds</Label>
							<Input
								id="seconds"
								type="number"
								min="0"
								max="59"
								value={seconds}
								onChange={(e) => setSeconds(e.target.value.padStart(2, '0'))}
								required
							/>
						</div>
					</div>
					<div className="text-muted-foreground text-sm">
						Clock Time: {date} {time}:{seconds}
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
							'Create Clock Event'
						)}
					</Button>
				</SlideDialogFooter>
			</SlideDialogContent>
		</SlideDialog>
	)
}

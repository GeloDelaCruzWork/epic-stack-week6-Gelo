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

export interface TimelogCreateData {
	dtrId: string
	mode: 'in' | 'out'
	timestamp: string
}

interface TimelogAddDialogProps {
	open: boolean
	onOpenChange: (open: boolean) => void
	dtrId: string
	onSave: (data: TimelogCreateData) => Promise<void>
}

export function TimelogAddDialog({
	open,
	onOpenChange,
	dtrId,
	onSave,
}: TimelogAddDialogProps) {
	const now = new Date()
	const [formData, setFormData] = useState<TimelogCreateData>({
		dtrId,
		mode: 'in',
		timestamp: now.toISOString(),
	})
	const [date, setDate] = useState(now.toISOString().split('T')[0])
	const [time, setTime] = useState(now.toTimeString().slice(0, 5))
	const [isSaving, setIsSaving] = useState(false)

	// Update formData when dtrId changes
	useEffect(() => {
		if (dtrId) {
			setFormData((prev) => ({
				...prev,
				dtrId: dtrId,
			}))
			console.log('TimeLogAddDialog: Updated dtrId to:', dtrId)
		}
	}, [dtrId])

	const handleSubmit = async (e?: React.FormEvent) => {
		e?.preventDefault()

		setIsSaving(true)
		try {
			// Combine date and time into ISO timestamp
			const timestamp = new Date(`${date}T${time}:00`).toISOString()
			await onSave({
				...formData,
				timestamp,
			})
			onOpenChange(false)
			// Reset form for next use
			const newNow = new Date()
			setFormData({
				dtrId,
				mode: 'in',
				timestamp: newNow.toISOString(),
			})
			setDate(newNow.toISOString().split('T')[0])
			setTime(newNow.toTimeString().slice(0, 5))
		} catch (error) {
			console.error('Failed to create TimeLog:', error)
		} finally {
			setIsSaving(false)
		}
	}

	const handleModeChange = (value: string) => {
		setFormData({
			...formData,
			mode: value as 'in' | 'out',
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
						<SlideDialogTitle>Add Time Log</SlideDialogTitle>
					</div>
				</SlideDialogHeader>
				<form onSubmit={handleSubmit} className="space-y-4 p-6">
					<div className="space-y-2">
						<Label>Mode</Label>
						<div className="flex gap-4">
							<label className="flex cursor-pointer items-center gap-2">
								<input
									type="radio"
									name="mode"
									value="in"
									checked={formData.mode === 'in'}
									onChange={(e) => handleModeChange(e.target.value)}
									className="h-4 w-4"
								/>
								<span>Time In</span>
							</label>
							<label className="flex cursor-pointer items-center gap-2">
								<input
									type="radio"
									name="mode"
									value="out"
									checked={formData.mode === 'out'}
									onChange={(e) => handleModeChange(e.target.value)}
									className="h-4 w-4"
								/>
								<span>Time Out</span>
							</label>
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
							value={time}
							onChange={(e) => setTime(e.target.value)}
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
							'Create TimeLog'
						)}
					</Button>
				</SlideDialogFooter>
			</SlideDialogContent>
		</SlideDialog>
	)
}

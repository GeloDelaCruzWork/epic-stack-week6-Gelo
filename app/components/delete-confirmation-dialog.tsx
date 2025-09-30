import {
	SlideDialog,
	SlideDialogContent,
	SlideDialogHeader,
	SlideDialogTitle,
	SlideDialogDescription,
	SlideDialogFooter,
	SlideDialogClose,
} from '#app/components/ui/slide-dialog.tsx'
import { Button } from '#app/components/ui/button.tsx'
import { Icon } from '#app/components/ui/icon.tsx'

interface DeleteConfirmationDialogProps {
	open: boolean
	onOpenChange: (open: boolean) => void
	itemType: string
	itemDescription?: string
	onConfirm: () => void
	onCancel: () => void
}

export function DeleteConfirmationDialog({
	open,
	onOpenChange,
	itemType,
	itemDescription,
	onConfirm,
	onCancel,
}: DeleteConfirmationDialogProps) {
	const handleConfirm = () => {
		onConfirm()
		onOpenChange(false)
	}

	const handleCancel = () => {
		onCancel()
		onOpenChange(false)
	}

	return (
		<SlideDialog open={open} onOpenChange={onOpenChange}>
			<SlideDialogContent className="p-0" width="max-w-md">
				<SlideDialogHeader className="border-b border-gray-200 dark:border-gray-800">
					<div className="flex items-center gap-3">
						<SlideDialogClose asChild>
							<Button variant="ghost" size="icon" className="h-8 w-8">
								<Icon name="arrow-right" className="h-4 w-4" />
								<span className="sr-only">Close</span>
							</Button>
						</SlideDialogClose>
						<div className="flex items-center gap-2">
							<Icon name="trash" className="text-destructive h-5 w-5" />
							<SlideDialogTitle>Delete {itemType}</SlideDialogTitle>
						</div>
					</div>
				</SlideDialogHeader>

				<div className="space-y-4 p-6">
					<SlideDialogDescription className="text-muted-foreground text-sm">
						Are you sure you want to delete this {itemType.toLowerCase()}?
						{itemDescription && (
							<span className="text-foreground mt-2 block font-medium">
								{itemDescription}
							</span>
						)}
						<span className="text-destructive mt-3 block text-sm">
							This action cannot be undone.
						</span>
					</SlideDialogDescription>
				</div>

				<SlideDialogFooter className="border-t border-gray-200 dark:border-gray-800">
					<Button variant="outline" onClick={handleCancel}>
						Cancel
					</Button>
					<Button
						variant="destructive"
						onClick={handleConfirm}
						className="gap-2"
					>
						<Icon name="trash" className="h-4 w-4" />
						Delete
					</Button>
				</SlideDialogFooter>
			</SlideDialogContent>
		</SlideDialog>
	)
}

import * as React from 'react'
import { Button } from './ui/button'
import { EmployeeAssignmentsEditDialog } from './employee-assignments-edit-dialog'

interface AssignmentToolbarProps {
	selectedAssignment: any | null
	onEdit: () => void
}

export const AssignmentToolbar: React.FC<AssignmentToolbarProps> = ({
	selectedAssignment,
	onEdit,
}) => {
	return (
		<div className="mb-2 flex items-center gap-2">
			{selectedAssignment && (
				<Button onClick={onEdit} className="bg-primary text-primary-foreground">
					Edit Assignment
				</Button>
			)}
		</div>
	)
}

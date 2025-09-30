import * as React from 'react'
import * as DialogPrimitive from '@radix-ui/react-dialog'
import { cn } from '#app/utils/misc.tsx'

const SlideDialog = DialogPrimitive.Root
const SlideDialogTrigger = DialogPrimitive.Trigger
const SlideDialogPortal = DialogPrimitive.Portal
const SlideDialogClose = DialogPrimitive.Close

const SlideDialogOverlay = React.forwardRef<
	React.ElementRef<typeof DialogPrimitive.Overlay>,
	React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
	<DialogPrimitive.Overlay
		ref={ref}
		className={cn(
			'fixed inset-0 z-50 bg-black/10',
			'data-[state=open]:animate-in data-[state=closed]:animate-out',
			'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
			className,
		)}
		{...props}
	/>
))
SlideDialogOverlay.displayName = DialogPrimitive.Overlay.displayName

const SlideDialogContent = React.forwardRef<
	React.ElementRef<typeof DialogPrimitive.Content>,
	React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> & {
		width?: string
	}
>(({ className, children, width = 'max-w-2xl', ...props }, ref) => (
	<SlideDialogPortal>
		<SlideDialogOverlay />
		<DialogPrimitive.Content
			ref={ref}
			className={cn(
				// Positioning - fixed to right edge, full height minus header and footer
				'fixed top-[72px] right-0 bottom-[60px] z-50',
				// Width
				'w-full',
				width,
				// Background and styling
				'bg-background shadow-xl',
				// Overflow handling
				'overflow-y-auto',
				// Animation classes
				'duration-300 ease-in-out',
				'data-[state=open]:animate-in data-[state=closed]:animate-out',
				'data-[state=open]:slide-in-from-right data-[state=closed]:slide-out-to-right',
				className,
			)}
			{...props}
		>
			{children}
		</DialogPrimitive.Content>
	</SlideDialogPortal>
))
SlideDialogContent.displayName = DialogPrimitive.Content.displayName

const SlideDialogHeader = ({
	className,
	...props
}: React.HTMLAttributes<HTMLDivElement>) => (
	<div
		className={cn(
			'flex flex-col space-y-1.5 p-6 pb-4 text-center sm:text-left',
			className,
		)}
		{...props}
	/>
)
SlideDialogHeader.displayName = 'SlideDialogHeader'

const SlideDialogFooter = ({
	className,
	...props
}: React.HTMLAttributes<HTMLDivElement>) => (
	<div
		className={cn(
			'flex flex-col-reverse p-6 pt-4 sm:flex-row sm:justify-end sm:space-x-2',
			className,
		)}
		{...props}
	/>
)
SlideDialogFooter.displayName = 'SlideDialogFooter'

const SlideDialogTitle = React.forwardRef<
	React.ElementRef<typeof DialogPrimitive.Title>,
	React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
	<DialogPrimitive.Title
		ref={ref}
		className={cn(
			'text-lg leading-none font-semibold tracking-tight',
			className,
		)}
		{...props}
	/>
))
SlideDialogTitle.displayName = DialogPrimitive.Title.displayName

const SlideDialogDescription = React.forwardRef<
	React.ElementRef<typeof DialogPrimitive.Description>,
	React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
	<DialogPrimitive.Description
		ref={ref}
		className={cn('text-muted-foreground text-sm', className)}
		{...props}
	/>
))
SlideDialogDescription.displayName = DialogPrimitive.Description.displayName

export {
	SlideDialog,
	SlideDialogPortal,
	SlideDialogOverlay,
	SlideDialogTrigger,
	SlideDialogClose,
	SlideDialogContent,
	SlideDialogHeader,
	SlideDialogFooter,
	SlideDialogTitle,
	SlideDialogDescription,
}

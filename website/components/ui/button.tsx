import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-epsilon-gold disabled:pointer-events-none disabled:opacity-50 rounded-sm border',
  {
    variants: {
      variant: {
        primary:
          'bg-epsilon-gold text-black border-epsilon-gold hover:bg-[#d4b26d] hover:border-[#d4b26d]',
        outline:
          'bg-transparent text-gray-200 border-border hover:border-epsilon-gold hover:text-epsilon-gold',
        subtle:
          'bg-[#161616] text-gray-200 border-border hover:border-[#444444] hover:bg-[#1b1b1b]',
        ghost: 'border-transparent hover:bg-[#181818]',
        destructive:
          'bg-danger-soft/70 text-white border-danger-soft hover:bg-danger-soft hover:border-danger-soft',
        success:
          'bg-success-soft/80 text-white border-success-soft hover:bg-success-soft hover:border-success-soft',
      },
      size: {
        sm: 'h-8 px-3',
        md: 'h-9 px-4',
        lg: 'h-10 px-5 text-sm',
        icon: 'h-8 w-8',
      },
    },
    defaultVariants: {
      variant: 'subtle',
      size: 'md',
    },
  },
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  ),
)

Button.displayName = 'Button'


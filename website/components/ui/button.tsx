import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap text-xs font-medium transition-all duration-epsilon ease-epsilon focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-epsilon-gold disabled:pointer-events-none disabled:opacity-50 rounded-sm border shadow-inset-button',
  {
    variants: {
      variant: {
        primary:
          'bg-gradient-to-b from-epsilon-gold to-epsilon-goldMuted text-black border-epsilon-gold font-semibold hover:from-[#D4B26D] hover:to-epsilon-gold hover:epsilon-gold-glow-hover',
        outline:
          'bg-transparent text-gray-200 border-[#282828] hover:border-epsilon-gold hover:text-epsilon-gold hover:bg-epsilon-gold/10',
        subtle:
          'bg-[#101010] text-gray-200 border-[#383838] hover:border-[#404040] hover:bg-[#141414]',
        ghost: 'border-transparent hover:bg-[#121212]',
        destructive:
          'bg-danger-soft/60 text-white border-danger-soft/70 hover:bg-danger-soft/70 hover:border-danger-soft',
        success:
          'bg-success-soft/60 text-white border-success-soft/70 hover:bg-success-soft/70 hover:border-success-soft',
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


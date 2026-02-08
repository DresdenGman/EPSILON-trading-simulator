import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap text-xs font-medium transition-all duration-280 ease-out-slow focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-epsilon-gold disabled:pointer-events-none disabled:opacity-50 rounded-sm border epsilon-inset-shadow',
  {
    variants: {
      variant: {
        primary:
          'bg-gradient-to-b from-epsilon-gold to-epsilon-goldMuted text-black font-semibold border-epsilon-gold hover:from-epsilon-goldHover hover:to-epsilon-gold hover:border-epsilon-goldHover epsilon-inset-shadow-gold',
        outline:
          'bg-transparent text-gray-200 border-[#282828] hover:border-epsilon-gold hover:text-epsilon-gold hover:bg-epsilon-gold/10',
        subtle:
          'bg-[#1A1A1A] text-gray-200 border-[#404040] hover:border-[#505050] hover:bg-[#202020]',
        ghost: 'border-transparent hover:bg-[#1A1A1A] hover:border-[#2A2A2A]',
        destructive:
          'bg-gradient-to-b from-danger-soft/70 to-danger-soft/60 text-white border-danger-soft hover:from-danger-softHover hover:to-danger-soft hover:border-danger-softHover',
        success:
          'bg-gradient-to-b from-success-soft/80 to-success-soft/70 text-white border-success-soft hover:from-success-softHover hover:to-success-soft hover:border-success-softHover',
      },
      size: {
        sm: 'h-8 px-3 text-[11px]',
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


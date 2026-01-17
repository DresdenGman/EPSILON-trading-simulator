import * as React from 'react'
import { cn } from '@/lib/utils'

export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'rounded-sm border border-[#282828] bg-[#101010] text-foreground epsilon-inset-shadow transition-all duration-280 ease-out-slow hover:border-epsilon-gold/50 hover:bg-[#121212]',
        className,
      )}
      {...props}
    />
  )
}

export function CardHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('px-3.5 pt-2.5 pb-1', className)} {...props} />
}

export function CardTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={cn(
        'text-xs font-medium tracking-[0.1em] text-gray-200',
        className,
      )}
      {...props}
    />
  )
}

export function CardContent({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('px-3.5 pb-3 pt-1 text-xs text-gray-350 leading-relaxed', className)} {...props} />
}


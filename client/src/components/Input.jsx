import { forwardRef } from 'react'
import { cn } from '@/lib/utils'

const Input = forwardRef(({ className, error, ...props }, ref) => {
    return (
        <div className="space-y-1">
            <input
                ref={ref}
                className={cn(
                    'input',
                    error && 'border-red-500 focus:border-red-500',
                    className
                )}
                {...props}
            />
            {error && (
                <p className="text-sm text-red-500">{error}</p>
            )}
        </div>
    )
})

Input.displayName = 'Input'

export default Input
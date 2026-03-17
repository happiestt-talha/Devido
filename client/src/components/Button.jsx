import { cn } from '@/lib/utils'
import { Loader2 } from 'lucide-react'

export default function Button({
    children,
    variant = 'primary',
    isLoading = false,
    disabled = false,
    className,
    ...props
}) {
    const variants = {
        primary: 'btn-primary',
        secondary: 'btn-secondary',
        outline: 'btn-outline',
        ghost: 'hover:bg-gray-100 dark:hover:bg-dark-700 px-4 py-2 rounded-full transition-colors',
        danger: 'bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-full transition-colors',
    }

    return (
        <button
            className={cn(
                variants[variant],
                'flex items-center justify-center gap-2',
                (isLoading || disabled) && 'opacity-50 cursor-not-allowed',
                className
            )}
            disabled={isLoading || disabled}
            {...props}
        >
            {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
            {children}
        </button>
    )
}
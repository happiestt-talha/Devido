import { cn } from '@/lib/utils'

export function Skeleton({ className, ...props }) {
    return (
        <div
            className={cn('skeleton', className)}
            {...props}
        />
    )
}

export function VideoCardSkeleton({ variant = 'default' }) {
    if (variant === 'small') {
        return (
            <div className="flex gap-2">
                <Skeleton className="w-40 h-24 rounded-lg" />
                <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-3 w-2/3" />
                    <Skeleton className="h-3 w-1/2" />
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-3">
            <Skeleton className="aspect-video rounded-xl" />
            <div className="flex gap-3">
                <Skeleton className="w-9 h-9 rounded-full flex-shrink-0" />
                <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-3 w-2/3" />
                    <Skeleton className="h-3 w-1/2" />
                </div>
            </div>
        </div>
    )
}

export function CommentSkeleton() {
    return (
        <div className="flex gap-3">
            <Skeleton className="w-10 h-10 rounded-full flex-shrink-0" />
            <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-4/5" />
            </div>
        </div>
    )
}
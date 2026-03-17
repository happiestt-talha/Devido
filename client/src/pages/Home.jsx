import { useQuery } from '@tanstack/react-query'
import { videoAPI } from '@/services/api'
import VideoCard from '@/components/VideoCard'
import { VideoCardSkeleton } from '@/components/Skeleton'
import { useAuthStore } from '@/store/authStore'
import { AlertCircle } from 'lucide-react'

export default function Home({ type = 'random' }) {
    const { user } = useAuthStore()

    const { data, isLoading, error } = useQuery({
        queryKey: ['videos', type],
        queryFn: async () => {
            let response
            switch (type) {
                case 'trending':
                    response = await videoAPI.getTrending()
                    break
                case 'subscriptions':
                    response = await videoAPI.getSubscriptions()
                    break
                default:
                    response = await videoAPI.getRandom()
            }
            return response.data.data
        },
        enabled: type !== 'subscriptions' || !!user,
    })

    // Show login message for subscriptions when not logged in
    if (type === 'subscriptions' && !user) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4 text-gray-700 dark:text-gray-200">
                <AlertCircle className="w-16 h-16 text-gray-400 mb-4" />
                <h2 className="text-2xl font-bold mb-2">Sign in to see subscriptions</h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                    Subscribe to channels to see their latest videos here
                </p>
                <a href="/signin" className="btn-primary">
                    Sign In
                </a>
            </div>
        )
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4 text-gray-700 dark:text-gray-200">
                <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
                <h2 className="text-2xl font-bold mb-2">Something went wrong</h2>
                <p className="text-gray-600 dark:text-gray-400">
                    {error.response?.data?.message || 'Failed to load videos'}
                </p>
            </div>
        )
    }

    if (isLoading) {
        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {Array.from({ length: 12 }).map((_, i) => (
                    <VideoCardSkeleton key={i} />
                ))}
            </div>
        )
    }

    if (!data || data.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
                <h2 className="text-2xl font-bold mb-2 text-gray-700 dark:text-gray-200">No videos found</h2>
                <p className="text-gray-600 dark:text-gray-400">
                    {type === 'subscriptions'
                        ? 'Subscribe to channels to see their videos here'
                        : 'Check back later for new content'}
                </p>
            </div>
        )
    }

    return (
        <div>
            <h1 className="text-2xl font-bold mb-6 text-gray-700 dark:text-gray-200">
                {type === 'trending' && 'Trending Videos'}
                {type === 'subscriptions' && 'Subscriptions'}
                {type === 'random' && 'Recommended'}
            </h1>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {data.map((video) => (
                    <VideoCard key={video._id} video={video} />
                ))}
            </div>
        </div>
    )
}
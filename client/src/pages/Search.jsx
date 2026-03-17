import { useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { videoAPI } from '@/services/api'
import VideoCard from '@/components/VideoCard'
import { VideoCardSkeleton } from '@/components/Skeleton'
import { Search as SearchIcon, AlertCircle } from 'lucide-react'

export default function Search() {
    const [searchParams] = useSearchParams()
    const query = searchParams.get('q')

    const { data: videos, isLoading, error } = useQuery({
        queryKey: ['search', query],
        queryFn: () => videoAPI.search(query).then(res => res.data.data),
        enabled: !!query,
    })

    if (!query) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
                <SearchIcon className="w-16 h-16 text-gray-400 mb-4" />
                <h2 className="text-2xl font-bold mb-2">Search for videos</h2>
                <p className="text-gray-600 dark:text-gray-400">
                    Use the search bar above to find videos
                </p>
            </div>
        )
    }

    if (isLoading) {
        return (
            <div>
                <h1 className="text-2xl font-bold mb-6">Search results for "{query}"</h1>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {Array.from({ length: 8 }).map((_, i) => (
                        <VideoCardSkeleton key={i} />
                    ))}
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
                <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
                <h2 className="text-2xl font-bold mb-2">Something went wrong</h2>
                <p className="text-gray-600 dark:text-gray-400">
                    Failed to search videos
                </p>
            </div>
        )
    }

    return (
        <div className='text-gray-700 dark:text-gray-200'>
            <h1 className="text-2xl font-bold mb-2 text-gray-700 dark:text-gray-200">Search results for "{query}"</h1>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
                {videos?.length || 0} videos found
            </p>

            {videos && videos.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {videos.map((video) => (
                        <VideoCard key={video._id} video={video} />
                    ))}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center min-h-[40vh] text-center px-4">
                    <SearchIcon className="w-16 h-16 text-gray-400 mb-4" />
                    <h2 className="text-xl font-bold mb-2">No videos found</h2>
                    <p className="text-gray-600 dark:text-gray-400">
                        Try searching with different keywords
                    </p>
                </div>
            )}
        </div>
    )
}
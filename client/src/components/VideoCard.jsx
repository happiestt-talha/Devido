import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { userAPI } from '@/services/api'
import { formatViews, formatDate, truncate } from '@/lib/utils'
import { Play } from 'lucide-react'

export default function VideoCard({ video, variant = 'default' }) {
    // Fetch channel info
    const { data: channel } = useQuery({
        queryKey: ['user', video.userId],
        queryFn: () => userAPI.getUser(video.userId).then(res => res.data.data),
        enabled: !!video.userId,
    })

    if (variant === 'small') {
        return (
            <Link to={`/video/${video._id}`} className="flex gap-2 group">
                <div className="relative w-40 h-24 flex-shrink-0 rounded-lg overflow-hidden bg-gray-200 dark:bg-dark-700">
                    <img
                        src={video.imgUrl || 'https://via.placeholder.com/320x180?text=No+Thumbnail'}
                        alt={video.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                        <Play className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                </div>

                <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-sm line-clamp-2 group-hover:text-primary transition-colors">
                        {video.title}
                    </h3>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                        {channel?.name || 'Unknown'}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-500">
                        {formatViews(video.views)} views • {formatDate(video.createdAt)}
                    </p>
                </div>
            </Link>
        )
    }

    return (
        <div className="group text-black dark:text-white">
            <div className="space-y-3">
                {/* Thumbnail */}
                <Link to={`/video/${video._id}`}>
                    <div className="relative aspect-video rounded-xl overflow-hidden bg-gray-200 dark:bg-dark-700">
                        <img
                            src={video.imgUrl || 'https://via.placeholder.com/640x360?text=No+Thumbnail'}
                            alt={video.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                            <Play className="w-12 h-12 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>

                        {/* Duration badge (if you have duration data) */}
                        {video.duration && (
                            <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded">
                                {Math.floor(video.duration / 60)}:{(video.duration % 60).toString().padStart(2, '0')}
                            </div>
                        )}
                    </div>
                </Link>

                {/* Details */}
                <div className="flex gap-3">
                    {/* Channel avatar */}
                    <Link to={`/channel/${channel?._id}`}>
                        <img
                            src={channel?.img || 'https://api.dicebear.com/7.x/avataaars/svg?seed=default'}
                            alt={channel?.name}
                            className="w-9 h-9 rounded-full object-cover flex-shrink-0"
                        />
                    </Link>

                    {/* Video info */}
                    <Link to={`/video/${video._id}`}>
                        <div className="flex-1 min-w-0">
                            <h3 className="font-medium line-clamp-2 group-hover:text-primary transition-colors">
                                {video.title}
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                {channel?.name || 'Unknown Channel'}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                                {formatViews(video.views)} views • {formatDate(video.createdAt)}
                            </p>
                        </div>
                    </Link>
                </div>
            </div>
        </div>
    )
}
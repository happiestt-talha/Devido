import { useQuery } from '@tanstack/react-query'
import { videoAPI } from '@/services/api'
import { useAuthStore } from '@/store/authStore'
import { useState } from 'react'
import {
    BarChart3,
    Eye,
    ThumbsUp,
    MessageSquare,
    TrendingUp,
    Calendar
} from 'lucide-react'
import { formatViews, formatDate } from '@/lib/utils'

export default function Analytics() {
    const { user } = useAuthStore()
    const [timeRange, setTimeRange] = useState('7d') // 7d, 30d, 90d, all

    const { data: userVideos, isLoading } = useQuery({
        queryKey: ['user-videos', user?._id],
        queryFn: () => videoAPI.getUserVideos(user._id).then(res => res.data.data),
        enabled: !!user?._id,
    })

    if (!user) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <p>Please sign in to view analytics</p>
            </div>
        )
    }

    const stats = userVideos ? {
        totalViews: userVideos.reduce((sum, v) => sum + (v.views || 0), 0),
        totalLikes: userVideos.reduce((sum, v) => sum + (v.likes?.length || 0), 0),
        totalVideos: userVideos.length,
        avgViews: Math.round(userVideos.reduce((sum, v) => sum + (v.views || 0), 0) / userVideos.length) || 0,
    } : null

    return (
        <div className="space-y-6 text-black dark:text-white">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Creator Analytics</h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">
                        Track your channel's performance
                    </p>
                </div>

                {/* Time range selector */}
                <select
                    value={timeRange}
                    onChange={(e) => setTimeRange(e.target.value)}
                    className="input w-auto"
                >
                    <option value="7d">Last 7 days</option>
                    <option value="30d">Last 30 days</option>
                    <option value="90d">Last 90 days</option>
                    <option value="all">All time</option>
                </select>
            </div>

            {/* Stats Cards */}
            {stats && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard
                        icon={<Eye className="w-6 h-6" />}
                        label="Total Views"
                        value={formatViews(stats.totalViews)}
                        color="text-blue-500"
                    />
                    <StatCard
                        icon={<ThumbsUp className="w-6 h-6" />}
                        label="Total Likes"
                        value={stats.totalLikes}
                        color="text-green-500"
                    />
                    <StatCard
                        icon={<BarChart3 className="w-6 h-6" />}
                        label="Videos"
                        value={stats.totalVideos}
                        color="text-purple-500"
                    />
                    <StatCard
                        icon={<TrendingUp className="w-6 h-6" />}
                        label="Avg Views"
                        value={formatViews(stats.avgViews)}
                        color="text-orange-500"
                    />
                </div>
            )}

            {/* Top Videos */}
            <div className="card p-6">
                <h2 className="text-xl font-bold mb-4">Top Performing Videos</h2>
                <div className="space-y-4">
                    {userVideos
                        ?.sort((a, b) => (b.views || 0) - (a.views || 0))
                        .slice(0, 5)
                        .map((video, index) => (
                            <div
                                key={video._id}
                                className="flex items-center gap-4 p-4 rounded-lg hover:bg-gray-50 dark:hover:bg-dark-700 transition-colors"
                            >
                                <span className="text-2xl font-bold text-gray-400 w-8">
                                    #{index + 1}
                                </span>
                                <img
                                    src={video.imgUrl || 'https://via.placeholder.com/120x68'}
                                    alt={video.title}
                                    className="w-32 h-18 rounded-lg object-cover"
                                />
                                <div className="flex-1">
                                    <h3 className="font-medium line-clamp-1">{video.title}</h3>
                                    <div className="flex items-center gap-4 mt-1 text-sm text-gray-600 dark:text-gray-400">
                                        <span className="flex items-center gap-1">
                                            <Eye className="w-4 h-4" />
                                            {formatViews(video.views)}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <ThumbsUp className="w-4 h-4" />
                                            {video.likes?.length || 0}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Calendar className="w-4 h-4" />
                                            {formatDate(video.createdAt)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                </div>
            </div>
        </div>
    )
}

function StatCard({ icon, label, value, color }) {
    return (
        <div className="card p-6">
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{label}</p>
                    <p className="text-3xl font-bold">{value}</p>
                </div>
                <div className={`${color} bg-opacity-10 p-3 rounded-lg`}>
                    {icon}
                </div>
            </div>
        </div>
    )
}
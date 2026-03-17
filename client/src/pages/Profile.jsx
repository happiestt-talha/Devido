import { useQuery } from '@tanstack/react-query'
import { videoAPI, userAPI } from '@/services/api'
import { useAuthStore } from '@/store/authStore'
import VideoCard from '@/components/VideoCard'
import { VideoCardSkeleton } from '@/components/Skeleton'
import { Video, Users, Settings, Twitter, Instagram, Globe } from 'lucide-react'
import { useNavigate, useParams } from 'react-router-dom'
import Button from '@/components/Button'

export default function Profile() {
    const { id } = useParams()
    const { user: currentUser } = useAuthStore()
    const navigate = useNavigate()

    // If no ID in URL, use current user
    const userId = id || currentUser?._id

    // Fetch profile user
    const { data: profileUser } = useQuery({
        queryKey: ['user', userId],
        queryFn: () => userAPI.getUser(userId).then(res => res.data.data),
        enabled: !!userId,
    })

    // Fetch user videos
    const { data: videos, isLoading } = useQuery({
        queryKey: ['user-videos', userId],
        queryFn: () => videoAPI.getUserVideos(userId).then(res => res.data.data),
        enabled: !!userId,
    })

    const isOwnProfile = currentUser?._id === userId
    const user = profileUser || currentUser

    if (!user) {
        navigate('/signin')
        return null
    }

    const themeColor = user.channelTheme?.primaryColor || '#FF0000'

    return (
        <div className="space-y-6 text-black dark:text-white">
            {/* Banner */}
            {user.channelBanner && (
                <div className="relative h-48 md:h-64 rounded-xl overflow-hidden -mx-4 md:mx-0">
                    <img
                        src={user.channelBanner}
                        alt="Channel banner"
                        className="w-full h-full object-cover"
                        style={{ objectPosition: user.channelTheme?.bannerPosition || 'center' }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                </div>
            )}

            {/* Profile Header */}
            <div className="card p-6">
                <div className="flex items-start gap-6 flex-wrap">
                    {/* Avatar */}
                    <img
                        src={user.img || 'https://api.dicebear.com/7.x/avataaars/svg?seed=default'}
                        alt={user.name}
                        className="w-32 h-32 rounded-full object-cover flex-shrink-0 border-4"
                        style={{ borderColor: themeColor }}
                    />

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                        <h1 className="text-3xl font-bold mb-2">{user.name}</h1>
                        {user.channelDescription && (
                            <p className="text-gray-600 dark:text-gray-400 mb-4 whitespace-pre-wrap">
                                {user.channelDescription}
                            </p>
                        )}

                        {/* Stats */}
                        <div className="flex gap-6 flex-wrap mb-4">
                            <div className="flex items-center gap-2">
                                <Video className="w-5 h-5 text-gray-500" />
                                <span className="font-medium">{videos?.length || 0}</span>
                                <span className="text-gray-600 dark:text-gray-400">videos</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Users className="w-5 h-5 text-gray-500" />
                                <span className="font-medium">{user.subscribers || 0}</span>
                                <span className="text-gray-600 dark:text-gray-400">subscribers</span>
                            </div>
                        </div>

                        {/* Social Links */}
                        {(user.socialLinks?.twitter || user.socialLinks?.instagram || user.socialLinks?.website) && (
                            <div className="flex gap-3 mb-4">
                                {user.socialLinks.twitter && (
                                    <a
                                        href={user.socialLinks.twitter}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="p-2 hover:bg-gray-100 dark:hover:bg-dark-700 rounded-lg transition-colors"
                                        style={{ color: themeColor }}
                                    >
                                        <Twitter className="w-5 h-5 text-blue-500 dark:text-blue-500" />
                                    </a>
                                )}
                                {user.socialLinks.instagram && (
                                    <a
                                        href={user.socialLinks.instagram}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="p-2 hover:bg-gray-100 dark:hover:bg-dark-700 rounded-lg transition-colors"
                                        style={{ color: themeColor }}
                                    >
                                        <Instagram className="w-5 h-5 text-pink-500 dark:text-pink-500" />
                                    </a>
                                )}
                                {user.socialLinks.website && (
                                    <a
                                        href={user.socialLinks.website}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="p-2 hover:bg-gray-100 dark:hover:bg-dark-700 rounded-lg transition-colors"
                                        style={{ color: themeColor }}
                                    >
                                        <Globe className="w-5 h-5 text-green-500 dark:text-green-500" />
                                    </a>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Actions */}
                    {isOwnProfile && (
                        <div className="flex gap-2">
                            <Button onClick={() => navigate('/upload')} variant="primary">
                                Upload Video
                            </Button>
                            <Button
                                onClick={() => navigate('/customize-channel')}
                                variant="outline"
                            >
                                <Settings className="w-4 h-4" />
                                Customize
                            </Button>
                            <Button
                                onClick={() => navigate('/edit-profile')}
                                variant="outline"
                            >
                                <Settings className="w-4 h-4" />
                                Edit Profile
                            </Button>
                        </div>
                    )}
                </div>
            </div>

            {/* Videos Section */}
            <div>
                <h2 className="text-2xl font-bold mb-6">{isOwnProfile ? 'Your Videos' : 'Videos'}</h2>

                {isLoading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <VideoCardSkeleton key={i} />
                        ))}
                    </div>
                ) : videos && videos.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {videos.map((video) => (
                            <VideoCard key={video._id} video={video} />
                        ))}
                    </div>
                ) : (
                    <div className="card p-12 text-center">
                        <Video className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-xl font-bold mb-2">No videos yet</h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-6">
                            {isOwnProfile
                                ? 'Upload your first video to get started'
                                : 'This channel has no videos yet'}
                        </p>
                        {isOwnProfile && (
                            <button onClick={() => navigate('/upload')} className="btn-primary mx-auto">
                                Upload Video
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}
import { useParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { videoAPI, userAPI } from '@/services/api'
import { useAuthStore } from '@/store/authStore'
import { useVideoStore } from '@/store/videoStore'
import { formatViews, formatDate } from '@/lib/utils'
import { ThumbsUp, ThumbsDown, Share2 } from 'lucide-react'
import { toast } from 'sonner'
import { useEffect, useState } from 'react'
import VideoPlayer from '@/components/VideoPlayer'
import VideoCard from '@/components/VideoCard'
import Comments from '@/components/Comments'
import Button from '@/components/Button'
import { Skeleton } from '@/components/Skeleton'
import VideoChapters from '@/components/VideoChapters'
import VideoTranscript from '../components/VideoTranscript'
import { Users } from 'lucide-react'
import CreateWatchParty from '../components/CreateWatchParty'



export default function Video() {
    const { id } = useParams()
    const { user } = useAuthStore()
    const { currentVideo, setCurrentVideo, toggleLike, toggleDislike } = useVideoStore()
    const [videoElement, setVideoElement] = useState(null)
    const [showCreateParty, setShowCreateParty] = useState(false)
    const queryClient = useQueryClient()

    // Fetch video
    const { data: videoData, isLoading: videoLoading } = useQuery({
        queryKey: ['video', id],
        queryFn: async () => {
            const response = await videoAPI.getVideo(id)
            return response.data.data || response.data
        },
        enabled: !!id,
    })

    const video = currentVideo || videoData

    // Fetch channel
    const { data: channel } = useQuery({
        queryKey: ['user', video?.userId],
        queryFn: () => userAPI.getUser(video.userId).then(res => res.data.data),
        enabled: !!video?.userId,
    })

    // Fetch related videos
    const { data: relatedVideos } = useQuery({
        queryKey: ['related', video?.tags],
        queryFn: () => videoAPI.getByTags(video.tags.join(',')).then(res => res.data.data),
        enabled: !!video?.tags?.length,
    })

    // Add view
    useEffect(() => {
        if (id) {
            videoAPI.addView(id)
        }
    }, [id])

    // Set current video in store
    useEffect(() => {
        if (videoData) {
            setCurrentVideo(videoData)
        }
    }, [videoData, setCurrentVideo])

    // Like mutation
    const likeMutation = useMutation({
        mutationFn: () => userAPI.likeVideo(id),
        onMutate: () => {
            if (user) toggleLike(user._id)
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['video', id])
        },
        onError: () => {
            toast.error('Failed to like video')
            queryClient.invalidateQueries(['video', id])
        },
    })

    // Add view mutation
    const addViewMutation = useMutation({
        mutationFn: () => videoAPI.addView(id),
    })

    useEffect(() => {
        if (video && videoElement) {
            let viewCounted = false

            const handleTimeUpdate = () => {
                // Count view after 30 seconds of watch time
                if (!viewCounted && videoElement.currentTime > 30) {
                    addViewMutation.mutate()
                    viewCounted = true
                }
            }

            videoElement.addEventListener('timeupdate', handleTimeUpdate)

            return () => {
                videoElement.removeEventListener('timeupdate', handleTimeUpdate)
            }
        }
    }, [video, videoElement])
    // Dislike mutation
    const dislikeMutation = useMutation({
        mutationFn: () => userAPI.dislikeVideo(id),
        onMutate: () => {
            if (user) toggleDislike(user._id)
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['video', id])
        },
        onError: () => {
            toast.error('Failed to dislike video')
            queryClient.invalidateQueries(['video', id])
        },
    })

    // Subscribe mutation
    const subscribeMutation = useMutation({
        mutationFn: () => {
            const isSubscribed = user?.subscribedUsers?.includes(channel._id)
            return isSubscribed
                ? userAPI.unsubscribe(channel._id)
                : userAPI.subscribe(channel._id)
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['user', user._id])
            queryClient.invalidateQueries(['auth', 'me'])
            toast.success('Subscription updated')
        },
        onError: () => {
            toast.error('Failed to update subscription')
        },
    })

    const handleLike = () => {
        if (!user) {
            toast.error('Please sign in to like videos')
            return
        }
        likeMutation.mutate()
    }

    const handleDislike = () => {
        if (!user) {
            toast.error('Please sign in to dislike videos')
            return
        }
        dislikeMutation.mutate()
    }

    const handleSubscribe = () => {
        if (!user) {
            toast.error('Please sign in to subscribe')
            return
        }
        subscribeMutation.mutate()
    }

    const handleShare = () => {
        navigator.clipboard.writeText(window.location.href)
        toast.success('Link copied to clipboard')
    }

    if (videoLoading) {
        return (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-4">
                    <Skeleton className="aspect-video rounded-xl" />
                    <Skeleton className="h-8 w-3/4" />
                    <Skeleton className="h-20 w-full" />
                </div>
                <div className="space-y-4">
                    {Array.from({ length: 5 }).map((_, i) => (
                        <Skeleton key={i} className="h-24 w-full" />
                    ))}
                </div>
            </div>
        )
    }

    if (!video) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <p className="text-xl text-gray-500">Video not found</p>
            </div>
        )
    }

    const isLiked = video.likes?.includes(user?._id)
    const isDisliked = video.dislikes?.includes(user?._id)
    const isSubscribed = user?.subscribedUsers?.includes(channel?._id)
    const isOwnVideo = user?._id === channel?._id

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-gray-700 dark:text-gray-200">
            {/* Main content */}
            <div className="lg:col-span-2 space-y-4">
                {/* Video player */}
                <VideoPlayer url={video.videoUrl} title={video.title} onVideoReady={setVideoElement} />
                {video.desc && (
                    <VideoChapters
                        description={video.desc}
                        onSeek={(time) => {
                            if (videoElement) {
                                videoElement.currentTime = time
                            }
                        }}
                    />
                )}

                {/* Video info */}
                <div>
                    <h1 className="text-2xl font-bold mb-2">{video.title}</h1>

                    <div className="flex items-center justify-between flex-wrap gap-4">
                        <p className="text-gray-600 dark:text-gray-400">
                            {formatViews(video.views)} views • {formatDate(video.createdAt)}
                        </p>

                        {/* Action buttons */}
                        <div className="flex items-center gap-2">
                            <Button
                                variant="secondary"
                                onClick={handleLike}
                                className={isLiked ? 'text-primary' : ''}
                            >
                                <ThumbsUp className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
                                {video.likes?.length || 0}
                            </Button>

                            <Button
                                variant="secondary"
                                onClick={handleDislike}
                                className={isDisliked ? 'text-primary' : ''}
                            >
                                <ThumbsDown className={`w-5 h-5 ${isDisliked ? 'fill-current' : ''}`} />
                                {video.dislikes?.length || 0}
                            </Button>

                            <Button variant="secondary" onClick={() => setShowCreateParty(true)}>
                                <Users className="w-5 h-5" />
                                Watch Party
                            </Button>

                            <Button variant="secondary" onClick={handleShare}>
                                <Share2 className="w-5 h-5" />
                                Share
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Channel info */}
                <div className="card p-4">
                    <div className="flex items-center justify-between gap-4 flex-wrap">
                        <div className="flex items-center gap-4">
                            <img
                                src={channel?.img || 'https://api.dicebear.com/7.x/avataaars/svg?seed=default'}
                                alt={channel?.name}
                                className="w-12 h-12 rounded-full object-cover"
                            />
                            <div>
                                <h3 className="font-semibold">{channel?.name}</h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    {channel?.subscribers || 0} subscribers
                                </p>
                            </div>
                        </div>

                        {/* Subscribe button - only show if not own video */}
                        {!isOwnVideo && (
                            <Button
                                variant={isSubscribed ? 'secondary' : 'primary'}
                                onClick={handleSubscribe}
                                isLoading={subscribeMutation.isPending}
                            >
                                {isSubscribed ? 'Subscribed' : 'Subscribe'}
                            </Button>
                        )}
                    </div>

                    {video.desc && (
                        <p className="mt-4 text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                            {video.desc}
                        </p>
                    )}
                </div>

                {/* Comments */}
                <Comments videoId={id} />

                {/* Transcript */}
                <VideoTranscript
                    videoId={id}
                    isOwner={user?._id === video?.userId}
                    onSeek={(time) => {
                        if (videoElement) {
                            videoElement.currentTime = time
                        }
                    }}
                />

            </div>

            {/* Related videos */}
            <div className="space-y-4">
                <h2 className="text-xl font-bold">Related Videos</h2>
                {relatedVideos?.filter(v => v._id !== id).slice(0, 10).map((video) => (
                    <VideoCard key={video._id} video={video} variant="small" />
                ))}
            </div>

            {showCreateParty && (
                <CreateWatchParty
                    videoId={id}
                    onClose={() => setShowCreateParty(false)}
                />
            )}
        </div>
    )
}
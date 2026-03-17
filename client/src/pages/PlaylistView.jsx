import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { playlistAPI, videoAPI } from '@/services/api'
import VideoCard from '@/components/VideoCard'
import { toast } from 'sonner'
import { Play, Shuffle, Trash2, Edit2, Lock, Unlock } from 'lucide-react'
import Button from '@/components/Button'
import { useAuthStore } from '@/store/authStore'

export default function PlaylistView() {
    const { id } = useParams()
    const navigate = useNavigate()
    const queryClient = useQueryClient()
    const { user } = useAuthStore()

    const { data: playlist, isLoading } = useQuery({
        queryKey: ['playlist', id],
        queryFn: () => playlistAPI.getPlaylist(id).then(res => res.data.data),
        enabled: !!id,
    })

    // Fetch all videos in playlist
    const { data: videos } = useQuery({
        queryKey: ['playlist-videos', playlist?.videos],
        queryFn: async () => {
            if (!playlist?.videos?.length) return []
            const videoPromises = playlist.videos.map(videoId =>
                videoAPI.getVideo(videoId).then(res => res.data.data || res.data).catch(() => null)
            )
            const results = await Promise.all(videoPromises)
            return results.filter(Boolean)
        },
        enabled: !!playlist?.videos?.length,
    })

    const removeVideoMutation = useMutation({
        mutationFn: (videoId) => playlistAPI.removeVideo(id, videoId),
        onSuccess: () => {
            queryClient.invalidateQueries(['playlist', id])
            queryClient.invalidateQueries(['playlist-videos'])
            toast.success('Video removed from playlist')
        },
    })

    const handleRemoveVideo = (videoId) => {
        if (window.confirm('Remove this video from playlist?')) {
            removeVideoMutation.mutate(videoId)
        }
    }

    const handlePlayAll = () => {
        if (videos && videos.length > 0) {
            navigate(`/video/${videos[0]._id}`)
        }
    }

    if (isLoading) {
        return <div className="text-center py-12">Loading...</div>
    }

    if (!playlist) {
        return <div className="text-center py-12">Playlist not found</div>
    }

    const isOwner = user?._id === playlist.userId

    return (
        <div className="space-y-6 text-black dark:text-white">
            {/* Header */}
            <div className="card p-6">
                <div className="flex items-start gap-6">
                    <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                            <h1 className="text-3xl font-bold">{playlist.name}</h1>
                            {playlist.isPublic ? (
                                <Unlock className="w-6 h-6 text-green-500" />
                            ) : (
                                <Lock className="w-6 h-6 text-gray-500" />
                            )}
                        </div>

                        {playlist.description && (
                            <p className="text-gray-600 dark:text-gray-400 mb-4">
                                {playlist.description}
                            </p>
                        )}

                        <p className="text-sm text-gray-500">
                            {playlist.videos.length} videos
                        </p>

                        <div className="flex gap-3 mt-4">
                            <Button onClick={handlePlayAll} disabled={!videos?.length}>
                                <Play className="w-5 h-5" />
                                Play All
                            </Button>
                            {isOwner && (
                                <Button variant="outline">
                                    <Edit2 className="w-4 h-4" />
                                    Edit
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Videos */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {videos?.map((video) => (
                    <div key={video._id} className="relative">
                        <VideoCard video={video} />
                        {isOwner && (
                            <button
                                onClick={() => handleRemoveVideo(video._id)}
                                className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors z-10"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                ))}
            </div>

            {videos?.length === 0 && (
                <div className="card p-12 text-center">
                    <p className="text-gray-500">No videos in this playlist yet</p>
                </div>
            )}
        </div>
    )
}